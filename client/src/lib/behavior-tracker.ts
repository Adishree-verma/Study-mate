/**
 * Global behavior tracker — attaches passive event listeners to document.
 * Detects frustration and stress signals from how the user interacts.
 * Call getBehaviorMetrics() from anywhere to get latest computed data.
 */

const WIN_5MIN = 5 * 60 * 1000;
const WIN_10MIN = 10 * 60 * 1000;
const WIN_1MIN = 60 * 1000;

interface ClickEvent  { time: number; x: number; y: number; }
interface ScrollEvent { time: number; delta: number; }
interface KeyEvent    { time: number; key: string; }
interface NavEntry    { time: number; path: string; }
interface VisEvent    { time: number; hidden: boolean; }

// ── Circular / rolling stores ────────────────────────────────────────────────
const clicks:  ClickEvent[]  = [];
const scrolls: ScrollEvent[] = [];
const keys:    KeyEvent[]    = [];
const navs:    NavEntry[]    = [];
const vis:     VisEvent[]    = [];

let lastActivityTime = Date.now();
let idleBurstFired   = false;       // reset when idle resets
let idleBurstCount   = 0;          // how many times we've detected idle→burst today

// ── Helpers ──────────────────────────────────────────────────────────────────
function now() { return Date.now(); }

function prune<T extends { time: number }>(arr: T[], maxAge: number): void {
  const cutoff = now() - maxAge;
  while (arr.length && arr[0].time < cutoff) arr.shift();
}

function recordActivity() {
  const t = now();
  const idle = t - lastActivityTime;

  // Idle → burst detection: if idle > 2 min and we now see activity
  if (idle > 2 * 60 * 1000 && !idleBurstFired) {
    idleBurstFired = true;
    idleBurstCount = Math.min(idleBurstCount + 1, 5);
  }
  if (idle < 10_000) {
    idleBurstFired = false; // reset once actively using again
  }

  lastActivityTime = t;
}

// ── Event listeners ──────────────────────────────────────────────────────────
document.addEventListener("click", (e) => {
  recordActivity();
  clicks.push({ time: now(), x: e.clientX, y: e.clientY });
  prune(clicks, WIN_10MIN);
}, { passive: true });

document.addEventListener("scroll", (e) => {
  recordActivity();
  const delta = (e.target as Element)?.scrollTop ?? 0;
  scrolls.push({ time: now(), delta });
  prune(scrolls, WIN_5MIN);
}, { passive: true, capture: true });

document.addEventListener("wheel", (e) => {
  recordActivity();
  scrolls.push({ time: now(), delta: e.deltaY });
  prune(scrolls, WIN_5MIN);
}, { passive: true });

document.addEventListener("keydown", (e) => {
  recordActivity();
  keys.push({ time: now(), key: e.key });
  prune(keys, WIN_5MIN);
}, { passive: true });

document.addEventListener("visibilitychange", () => {
  vis.push({ time: now(), hidden: document.hidden });
  prune(vis, WIN_10MIN);
});

// Called by the router when the path changes
export function recordNavigation(path: string) {
  recordActivity();
  navs.push({ time: now(), path });
  prune(navs, WIN_10MIN);
}

// ── Metrics computation ──────────────────────────────────────────────────────
export interface BehaviorMetrics {
  // Click signals
  clicksPerMin: number;        // avg clicks/min in last 5 min
  rageClickCount: number;      // # of rage-click clusters (3+ clicks, same spot, <800ms)
  // Scroll signals
  scrollBursts: number;        // # of 10s windows with >15 scroll events
  scrollEventsPerMin: number;  // scroll rate
  // Navigation signals
  backForthCount: number;      // A→B→A patterns in last 10 min
  samePageRevisits: number;    // max times same page visited in 5 min window
  // Typing signals
  rapidBackspaces: number;     // clusters of 5+ backspaces in 3s
  // Attention signals
  idleBurstCount: number;      // times user went idle then returned suddenly
  tabSwitchCount: number;      // tab visibility changes (switching away & back)
  // Raw
  idleSeconds: number;         // seconds since last activity
}

export function getBehaviorMetrics(): BehaviorMetrics {
  const t = now();
  prune(clicks, WIN_10MIN);
  prune(scrolls, WIN_5MIN);
  prune(keys, WIN_5MIN);
  prune(navs, WIN_10MIN);
  prune(vis, WIN_10MIN);

  // ── Click rate ────────────────────────────────────────────────────────────
  const recentClicks = clicks.filter(c => c.time > t - WIN_5MIN);
  const clicksPerMin = recentClicks.length / 5;

  // ── Rage clicks ───────────────────────────────────────────────────────────
  // Cluster: 3+ clicks within 800ms where each consecutive click is within 60px
  let rageClickCount = 0;
  for (let i = 0; i < clicks.length - 2; i++) {
    const a = clicks[i], b = clicks[i + 1], c = clicks[i + 2];
    const timeSpan = c.time - a.time;
    if (timeSpan > 800) continue;
    const distAB = Math.hypot(b.x - a.x, b.y - a.y);
    const distBC = Math.hypot(c.x - b.x, c.y - b.y);
    if (distAB < 60 && distBC < 60) {
      rageClickCount++;
      i += 2; // skip past this cluster
    }
  }

  // ── Scroll bursts ─────────────────────────────────────────────────────────
  // Count 10s windows with > 15 scroll events
  let scrollBursts = 0;
  const BURST_WINDOW = 10_000;
  const BURST_THRESHOLD = 15;
  let burstStart = 0;
  let burstCount = 0;
  for (const s of scrolls) {
    if (s.time - burstStart > BURST_WINDOW) {
      burstStart = s.time;
      burstCount = 1;
    } else {
      burstCount++;
      if (burstCount === BURST_THRESHOLD) scrollBursts++;
    }
  }
  const scrollEventsPerMin = scrolls.filter(s => s.time > t - WIN_1MIN).length;

  // ── Back-and-forth navigation ─────────────────────────────────────────────
  // Pattern: path[i] === path[i+2] (A→B→A)
  let backForthCount = 0;
  for (let i = 0; i + 2 < navs.length; i++) {
    if (navs[i].path === navs[i + 2].path && navs[i].path !== navs[i + 1].path) {
      backForthCount++;
    }
  }

  // ── Same-page revisits ────────────────────────────────────────────────────
  // Max times same page appears in last 5 min
  const recent5Nav = navs.filter(n => n.time > t - WIN_5MIN);
  const visitCounts: Record<string, number> = {};
  for (const n of recent5Nav) {
    visitCounts[n.path] = (visitCounts[n.path] || 0) + 1;
  }
  const samePageRevisits = Math.max(0, ...Object.values(visitCounts)) - 1; // subtract first visit

  // ── Rapid backspaces ──────────────────────────────────────────────────────
  // Cluster: 5+ backspaces within 3 seconds
  const backspaces = keys.filter(k => k.key === "Backspace");
  let rapidBackspaces = 0;
  for (let i = 0; i + 4 < backspaces.length; i++) {
    if (backspaces[i + 4].time - backspaces[i].time < 3000) {
      rapidBackspaces++;
      i += 4;
    }
  }

  // ── Tab switches ──────────────────────────────────────────────────────────
  // Count hide→show pairs in last 10 min
  let tabSwitchCount = 0;
  for (let i = 0; i + 1 < vis.length; i++) {
    if (vis[i].hidden && !vis[i + 1].hidden) tabSwitchCount++;
  }

  return {
    clicksPerMin,
    rageClickCount,
    scrollBursts,
    scrollEventsPerMin,
    backForthCount,
    samePageRevisits,
    rapidBackspaces,
    idleBurstCount,
    tabSwitchCount,
    idleSeconds: (t - lastActivityTime) / 1000,
  };
}
