import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Activity, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useStressAlgorithm } from "@/hooks/use-stress-algorithm";
import { Skeleton } from "@/components/ui/skeleton";

const STRESS_LEVELS = [
  {
    level: 1,
    label: "Very Calm",
    tip: "You're in the zone! Perfect time for deep focused study.",
    color: "#10b981",
    ringColor: "#059669",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-300 dark:border-emerald-700",
    textColor: "text-emerald-700 dark:text-emerald-300",
    face: (active: boolean) => (
      <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
        <circle cx="20" cy="20" r="18" fill={active ? "#10b981" : "currentColor"} fillOpacity={active ? 1 : 0.07} stroke={active ? "#059669" : "currentColor"} strokeOpacity={active ? 1 : 0.18} strokeWidth="1.5" />
        <circle cx="14" cy="17" r="2" fill={active ? "white" : "currentColor"} fillOpacity={active ? 1 : 0.35} />
        <circle cx="26" cy="17" r="2" fill={active ? "white" : "currentColor"} fillOpacity={active ? 1 : 0.35} />
        <path d="M13 25c2 3 12 3 14 0" stroke={active ? "white" : "currentColor"} strokeOpacity={active ? 1 : 0.35} strokeWidth="2" strokeLinecap="round" />
        <circle cx="11" cy="24" r="3" fill={active ? "#34d399" : "currentColor"} fillOpacity={active ? 0.5 : 0.06} />
        <circle cx="29" cy="24" r="3" fill={active ? "#34d399" : "currentColor"} fillOpacity={active ? 0.5 : 0.06} />
      </svg>
    ),
  },
  {
    level: 2,
    label: "Doing Good",
    tip: "Great headspace! Keep up momentum with your study plan.",
    color: "#84cc16",
    ringColor: "#65a30d",
    bg: "bg-lime-50 dark:bg-lime-950/30",
    border: "border-lime-300 dark:border-lime-700",
    textColor: "text-lime-700 dark:text-lime-300",
    face: (active: boolean) => (
      <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
        <circle cx="20" cy="20" r="18" fill={active ? "#84cc16" : "currentColor"} fillOpacity={active ? 1 : 0.07} stroke={active ? "#65a30d" : "currentColor"} strokeOpacity={active ? 1 : 0.18} strokeWidth="1.5" />
        <circle cx="14" cy="17" r="2" fill={active ? "white" : "currentColor"} fillOpacity={active ? 1 : 0.35} />
        <circle cx="26" cy="17" r="2" fill={active ? "white" : "currentColor"} fillOpacity={active ? 1 : 0.35} />
        <path d="M14 25c1.5 2 10.5 2 12 0" stroke={active ? "white" : "currentColor"} strokeOpacity={active ? 1 : 0.35} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    level: 3,
    label: "Neutral",
    tip: "Take a 5-min break, then tackle one topic at a time.",
    color: "#f59e0b",
    ringColor: "#d97706",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-300 dark:border-amber-700",
    textColor: "text-amber-700 dark:text-amber-300",
    face: (active: boolean) => (
      <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
        <circle cx="20" cy="20" r="18" fill={active ? "#f59e0b" : "currentColor"} fillOpacity={active ? 1 : 0.07} stroke={active ? "#d97706" : "currentColor"} strokeOpacity={active ? 1 : 0.18} strokeWidth="1.5" />
        <circle cx="14" cy="17" r="2" fill={active ? "white" : "currentColor"} fillOpacity={active ? 1 : 0.35} />
        <circle cx="26" cy="17" r="2" fill={active ? "white" : "currentColor"} fillOpacity={active ? 1 : 0.35} />
        <path d="M14 25h12" stroke={active ? "white" : "currentColor"} strokeOpacity={active ? 1 : 0.35} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    level: 4,
    label: "Stressed",
    tip: "Breathe deeply. Try a 10-min Pomodoro with your easiest topic.",
    color: "#f97316",
    ringColor: "#ea580c",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-300 dark:border-orange-700",
    textColor: "text-orange-700 dark:text-orange-300",
    face: (active: boolean) => (
      <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
        <circle cx="20" cy="20" r="18" fill={active ? "#f97316" : "currentColor"} fillOpacity={active ? 1 : 0.07} stroke={active ? "#ea580c" : "currentColor"} strokeOpacity={active ? 1 : 0.18} strokeWidth="1.5" />
        <path d="M12 14c1-1.5 3-1.5 4 0" stroke={active ? "white" : "currentColor"} strokeOpacity={active ? 0.8 : 0.25} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M24 14c1-1.5 3-1.5 4 0" stroke={active ? "white" : "currentColor"} strokeOpacity={active ? 0.8 : 0.25} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="14" cy="18" r="2" fill={active ? "white" : "currentColor"} fillOpacity={active ? 1 : 0.35} />
        <circle cx="26" cy="18" r="2" fill={active ? "white" : "currentColor"} fillOpacity={active ? 1 : 0.35} />
        <path d="M14 27c1.5-2 10.5-2 12 0" stroke={active ? "white" : "currentColor"} strokeOpacity={active ? 1 : 0.35} strokeWidth="2" strokeLinecap="round" />
        <path d="M31 12c0 1.5-1 2.5-1 2.5s-1-1-1-2.5a1 1 0 012 0z" fill={active ? "#bae6fd" : "currentColor"} fillOpacity={active ? 0.9 : 0.15} />
      </svg>
    ),
  },
  {
    level: 5,
    label: "Overwhelmed",
    tip: "Step away for 15 min. Walk, drink water, then return fresh.",
    color: "#ef4444",
    ringColor: "#dc2626",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-300 dark:border-red-700",
    textColor: "text-red-700 dark:text-red-300",
    face: (active: boolean) => (
      <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
        <circle cx="20" cy="20" r="18" fill={active ? "#ef4444" : "currentColor"} fillOpacity={active ? 1 : 0.07} stroke={active ? "#dc2626" : "currentColor"} strokeOpacity={active ? 1 : 0.18} strokeWidth="1.5" />
        <path d="M11 13l5 2" stroke={active ? "white" : "currentColor"} strokeOpacity={active ? 0.9 : 0.25} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M29 13l-5 2" stroke={active ? "white" : "currentColor"} strokeOpacity={active ? 0.9 : 0.25} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="14" cy="19" r="2.5" fill={active ? "white" : "currentColor"} fillOpacity={active ? 1 : 0.35} />
        <circle cx="26" cy="19" r="2.5" fill={active ? "white" : "currentColor"} fillOpacity={active ? 1 : 0.35} />
        <circle cx="14" cy="19" r="1" fill={active ? "#ef4444" : "currentColor"} fillOpacity={active ? 1 : 0.15} />
        <circle cx="26" cy="19" r="1" fill={active ? "#ef4444" : "currentColor"} fillOpacity={active ? 1 : 0.15} />
        <path d="M13 29c2-3.5 12-3.5 14 0" stroke={active ? "white" : "currentColor"} strokeOpacity={active ? 1 : 0.35} strokeWidth="2" strokeLinecap="round" />
        <path d="M33 11c0 2-1.2 3-1.2 3s-1.2-1-1.2-3a1.2 1.2 0 012.4 0z" fill={active ? "#bae6fd" : "currentColor"} fillOpacity={active ? 0.9 : 0.12} />
        <path d="M9 26c0 1.5-.8 2.2-.8 2.2s-.8-.7-.8-2.2a.8.8 0 011.6 0z" fill={active ? "#bae6fd" : "currentColor"} fillOpacity={active ? 0.7 : 0.08} />
      </svg>
    ),
  },
];

export function StressTracker() {
  const { level, score, reasons, isReady } = useStressAlgorithm();
  const [showReasons, setShowReasons] = useState(false);

  const active = STRESS_LEVELS[level - 1];

  if (!isReady) {
    return (
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between gap-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-10 rounded-full flex-1" />)}
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2 space-y-0 flex-wrap">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400 to-pink-600">
            <Heart className="h-4 w-4 text-white" />
          </div>
          Stress Monitor
        </CardTitle>

        {/* AI badge + score */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5">
            <Activity className="h-3 w-3 text-indigo-500" />
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">AUTO-DETECTED</span>
          </div>
          <span
            className="text-xs font-black tabular-nums"
            style={{ color: active.color }}
          >
            {score}/100
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Face row — detected level lights up, others fade */}
        <div className="flex items-end justify-between gap-2">
          {STRESS_LEVELS.map((s) => {
            const isActive = s.level === level;
            const isPast = s.level < level;
            return (
              <div
                key={s.level}
                className="flex flex-col items-center gap-1 flex-1"
                data-testid={`stress-face-${s.level}`}
              >
                <div
                  className="w-10 h-10 rounded-full transition-all duration-500"
                  style={
                    isActive
                      ? {
                          outline: `2.5px solid ${s.ringColor}`,
                          outlineOffset: "2px",
                          filter: `drop-shadow(0 0 6px ${s.color}80)`,
                          transform: "scale(1.15)",
                        }
                      : { opacity: isPast ? 0.3 : 0.22 }
                  }
                >
                  {s.face(isActive)}
                </div>
                <span
                  className={`text-[9px] font-semibold text-center leading-tight transition-all duration-300 ${isActive ? "" : "text-muted-foreground"}`}
                  style={isActive ? { color: s.color } : {}}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar showing score */}
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${score}%`,
              background: `linear-gradient(90deg, #10b981, ${active.color})`,
            }}
          />
        </div>

        {/* Main tip */}
        <div
          className={`rounded-lg px-3 py-2.5 text-xs leading-relaxed border ${active.bg} ${active.textColor} ${active.border}`}
          data-testid="stress-tip"
        >
          <span className="font-semibold">{active.label}:</span> {active.tip}
        </div>

        {/* Reasons toggle */}
        {reasons.length > 0 && (
          <button
            onClick={() => setShowReasons(v => !v)}
            className="flex w-full items-center justify-between text-[11px] text-muted-foreground hover-elevate rounded-md px-1 py-0.5 transition-all"
            data-testid="button-toggle-reasons"
          >
            <span className="font-medium">Why this level? ({reasons.length} signal{reasons.length > 1 ? "s" : ""})</span>
            {showReasons ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}

        {showReasons && reasons.length > 0 && (
          <ul className="space-y-1 pl-1">
            {reasons.map((r, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-[11px] text-muted-foreground"
                data-testid={`stress-reason-${i}`}
              >
                <span
                  className="mt-1 h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: active.color }}
                />
                {r}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
