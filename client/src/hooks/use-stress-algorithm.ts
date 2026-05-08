import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Topic, Exam, StudySession } from "@shared/schema";
import { getBehaviorMetrics, recordNavigation } from "@/lib/behavior-tracker";

interface EfficiencyData {
  todayMinutes: number;
  todaySessions: number;
  breakdown: { streak: { value: string } };
}

export interface StressResult {
  level: number;       // 1–5
  score: number;       // 0–100
  reasons: string[];   // human-readable signals
  isReady: boolean;
}

const PAGE_WINDOW_MS = 10 * 60 * 1000;

export function useStressAlgorithm(): StressResult {
  const [location] = useLocation();
  const navLog    = useRef<number[]>([]);
  const dwellLog  = useRef<number[]>([]);
  const lastNav   = useRef<number>(Date.now());
  const [tick, setTick] = useState(0);

  // Feed each route change into the global behavior tracker
  useEffect(() => {
    recordNavigation(location);
  }, [location]);

  // Track page dwell
  useEffect(() => {
    const t = Date.now();
    const dwell = t - lastNav.current;
    if (dwell > 2000) {
      dwellLog.current.push(dwell);
      if (dwellLog.current.length > 15) dwellLog.current.shift();
    }
    navLog.current.push(t);
    lastNav.current = t;
    const cutoff = t - PAGE_WINDOW_MS;
    navLog.current = navLog.current.filter(ts => ts > cutoff);
  }, [location]);

  // Re-score every 20 seconds
  useEffect(() => {
    const id = setInterval(() => setTick(n => n + 1), 20_000);
    return () => clearInterval(id);
  }, []);

  // ── Backend data ────────────────────────────────────────────────────────────
  const { data: effData } = useQuery<EfficiencyData>({
    queryKey: ["/api/efficiency-score"],
    staleTime: 60_000,
  });
  const { data: topics = [] } = useQuery<Topic[]>({
    queryKey: ["/api/topics"],
    staleTime: 60_000,
  });
  const { data: exams = [] } = useQuery<Exam[]>({
    queryKey: ["/api/exams"],
    staleTime: 60_000,
  });
  const { data: recentSessions = [] } = useQuery<StudySession[]>({
    queryKey: ["/api/sessions/recent"],
    staleTime: 60_000,
  });

  // ── Live behavior metrics ───────────────────────────────────────────────────
  const bm = getBehaviorMetrics();

  // ── Score computation ───────────────────────────────────────────────────────
  const reasons: string[] = [];
  let score = 0;
  const now = Date.now();
  const hourNow = new Date().getHours();

  // 1. Rage clicks (0–18 pts) ─ clearest frustration signal
  const rageScore = Math.min(18, bm.rageClickCount * 6);
  if (bm.rageClickCount >= 3) {
    reasons.push(`Clicking the same spot repeatedly — ${bm.rageClickCount} rage-click clusters detected`);
  } else if (bm.rageClickCount >= 1) {
    reasons.push(`${bm.rageClickCount} rage-click cluster${bm.rageClickCount > 1 ? "s" : ""} detected`);
  }
  score += rageScore;

  // 2. High click rate (0–10 pts) ─ agitated tapping
  const clickScore = bm.clicksPerMin > 25 ? 10 : bm.clicksPerMin > 15 ? 6 : bm.clicksPerMin > 8 ? 3 : 0;
  if (bm.clicksPerMin > 25) {
    reasons.push(`Very high click rate (${Math.round(bm.clicksPerMin)} clicks/min)`);
  } else if (bm.clicksPerMin > 15) {
    reasons.push(`Elevated click rate (${Math.round(bm.clicksPerMin)} clicks/min)`);
  }
  score += clickScore;

  // 3. Scroll bursts (0–8 pts) ─ frantic scrolling
  const scrollScore = Math.min(8, bm.scrollBursts * 4);
  if (bm.scrollBursts >= 2) {
    reasons.push(`Frantic scrolling detected (${bm.scrollBursts} rapid scroll bursts)`);
  } else if (bm.scrollBursts === 1) {
    reasons.push("One rapid scroll burst detected");
  }
  score += scrollScore;

  // 4. Back-and-forth navigation (0–12 pts)
  const backForthScore = Math.min(12, bm.backForthCount * 4);
  if (bm.backForthCount >= 3) {
    reasons.push(`Going back and forth between pages (${bm.backForthCount} times)`);
  } else if (bm.backForthCount >= 1) {
    reasons.push("Switching back and forth between sections");
  }
  score += backForthScore;

  // 5. Same-page revisits (0–8 pts)
  const revisitScore = bm.samePageRevisits >= 4 ? 8 : bm.samePageRevisits >= 2 ? 4 : 0;
  if (bm.samePageRevisits >= 4) {
    reasons.push(`Revisiting the same page ${bm.samePageRevisits} times in 5 minutes`);
  } else if (bm.samePageRevisits >= 2) {
    reasons.push("Repeatedly returning to the same section");
  }
  score += revisitScore;

  // 6. Rapid backspaces (0–8 pts) ─ frustration typing / deleting
  const backspaceScore = Math.min(8, bm.rapidBackspaces * 4);
  if (bm.rapidBackspaces >= 2) {
    reasons.push("Lots of rapid deleting while typing — possibly frustrated");
  } else if (bm.rapidBackspaces >= 1) {
    reasons.push("Rapid deleting in text fields detected");
  }
  score += backspaceScore;

  // 7. Idle → burst (0–8 pts) ─ avoidance then sudden re-engagement
  const idleBurstScore = Math.min(8, bm.idleBurstCount * 4);
  if (bm.idleBurstCount >= 2) {
    reasons.push("Going idle then coming back suddenly — distracted pattern");
  } else if (bm.idleBurstCount >= 1) {
    reasons.push("Stepped away and came back suddenly");
  }
  score += idleBurstScore;

  // 8. Tab switching (0–6 pts) ─ unfocused, checking other things
  const tabScore = bm.tabSwitchCount >= 4 ? 6 : bm.tabSwitchCount >= 2 ? 3 : 0;
  if (bm.tabSwitchCount >= 4) {
    reasons.push(`Switching tabs frequently (${bm.tabSwitchCount} times) — distracted`);
  } else if (bm.tabSwitchCount >= 2) {
    reasons.push(`Switched away from app ${bm.tabSwitchCount} times`);
  }
  score += tabScore;

  // 9. Page navigation speed (0–10 pts) ─ restless browsing
  const recentPageSwitches = navLog.current.filter(t => t > now - 5 * 60 * 1000).length;
  const navSpeedScore = recentPageSwitches >= 8 ? 10 : recentPageSwitches >= 5 ? 6 : recentPageSwitches >= 3 ? 3 : 0;
  if (recentPageSwitches >= 8) {
    reasons.push(`Rapidly switching sections (${recentPageSwitches} times in 5 min)`);
  } else if (recentPageSwitches >= 5) {
    reasons.push("Switching sections more than usual");
  }
  score += navSpeedScore;

  // 10. Short dwell time (0–8 pts) ─ can't settle
  let dwellScore = 0;
  if (dwellLog.current.length >= 2) {
    const avgDwell = dwellLog.current.reduce((a, b) => a + b, 0) / dwellLog.current.length;
    if (avgDwell < 12_000) {
      dwellScore = 8;
      reasons.push("Spending very little time on each section");
    } else if (avgDwell < 25_000) {
      dwellScore = 4;
      reasons.push("Moving through sections quickly");
    }
  }
  score += dwellScore;

  // ── Backend signals ─────────────────────────────────────────────────────────

  // 11. Backlog pressure (0–12 pts)
  const highPriority = topics.filter(t => !t.completed && t.priority === "high").length;
  const backlogScore = Math.min(12, highPriority * 2);
  if (highPriority >= 5) reasons.push(`${highPriority} high-priority topics pending`);
  else if (highPriority >= 2) reasons.push(`${highPriority} high-priority topics in backlog`);
  score += backlogScore;

  // 12. Study streak (0–8 pts)
  const streakStr = effData?.breakdown?.streak?.value ?? "0 days";
  const currentStreak = parseInt(streakStr) || 0;
  const streakScore = currentStreak === 0 ? 8 : currentStreak < 3 ? 4 : 0;
  if (currentStreak === 0) reasons.push("No active study streak");
  else if (currentStreak < 3) reasons.push(`Short ${currentStreak}-day streak`);
  score += streakScore;

  // 13. Low study time (0–10 pts)
  const todayMinutes = effData?.todayMinutes ?? 0;
  let timeScore = 0;
  if (hourNow >= 14 && todayMinutes === 0) {
    timeScore = 10;
    reasons.push("No study time logged despite being active");
  } else if (hourNow >= 12 && todayMinutes < 30) {
    timeScore = 5;
    reasons.push(`Only ${todayMinutes} min studied today`);
  }
  score += timeScore;

  // 14. Exam proximity (0–10 pts)
  let examScore = 0;
  if (exams.length > 0) {
    const upcoming = exams
      .map(e => ({ ...e, daysLeft: Math.ceil((new Date(e.examDate).getTime() - now) / 86_400_000) }))
      .filter(e => e.daysLeft > 0)
      .sort((a, b) => a.daysLeft - b.daysLeft);
    if (upcoming.length > 0) {
      const { daysLeft, name } = upcoming[0];
      if (daysLeft <= 7) { examScore = 10; reasons.push(`${name} is in just ${daysLeft} day${daysLeft > 1 ? "s" : ""}!`); }
      else if (daysLeft <= 14) { examScore = 6; reasons.push(`${name} in ${daysLeft} days`); }
      else if (daysLeft <= 30) { examScore = 3; reasons.push(`${name} coming up in ${daysLeft} days`); }
    }
  }
  score += examScore;

  // 15. Session abandon rate (0–8 pts)
  if (recentSessions.length > 0) {
    const abandoned = recentSessions.filter(s => !s.completed).length;
    const rate = abandoned / recentSessions.length;
    if (rate >= 0.6) { score += 8; reasons.push(`${Math.round(rate * 100)}% of recent sessions abandoned early`); }
    else if (rate >= 0.4) { score += 4; reasons.push("Several recent sessions cut short"); }
  }

  // ── Final ───────────────────────────────────────────────────────────────────
  score = Math.min(100, Math.round(score));

  let level: number;
  if (score <= 15) level = 1;
  else if (score <= 32) level = 2;
  else if (score <= 52) level = 3;
  else if (score <= 70) level = 4;
  else level = 5;

  const isReady = effData !== undefined;

  return { level, score, reasons, isReady };
}
