import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, AlertTriangle, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";

interface BreakdownItem {
  score: number;
  max: number;
  label: string;
  value: string;
}

interface EfficiencyData {
  score: number;
  breakdown: {
    sessions: BreakdownItem;
    studyTime: BreakdownItem;
    variety: BreakdownItem;
    topicProgress: BreakdownItem;
    streak: BreakdownItem;
  };
  strengths: string[];
  improvements: string[];
  todayMinutes: number;
  todaySessions: number;
  subjectsCovered: string[];
}

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const gap = circumference - progress;

  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const bgColor = score >= 75 ? "#d1fae5" : score >= 50 ? "#fef3c7" : "#fee2e2";
  const label = score >= 75 ? "Excellent" : score >= 50 ? "Good" : score >= 25 ? "Needs Work" : "Just Started";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: 128, height: 128 }}>
        <svg width="128" height="128" viewBox="0 0 128 128">
          {/* Background track */}
          <circle
            cx="64" cy="64" r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          {/* Score arc */}
          <circle
            cx="64" cy="64" r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${progress} ${gap}`}
            strokeDashoffset={circumference / 4}
            style={{ transition: "stroke-dasharray 0.8s ease-in-out" }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black" style={{ color }}>{score}</span>
          <span className="text-xs font-semibold text-muted-foreground">/100</span>
        </div>
      </div>
      <span
        className="text-xs font-bold px-2.5 py-0.5 rounded-full"
        style={{ backgroundColor: bgColor, color }}
      >
        {label}
      </span>
    </div>
  );
}

function BreakdownBar({ item, color }: { item: BreakdownItem; color: string }) {
  const pct = Math.round((item.score / item.max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">{item.label}</span>
        <span className="font-bold" style={{ color }}>{item.score}/{item.max}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{item.value}</p>
    </div>
  );
}

export function EfficiencyScore() {
  const { data, isLoading } = useQuery<EfficiencyData>({
    queryKey: ["/api/efficiency-score"],
    refetchInterval: 60000, // refresh every minute
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["/api/efficiency-score"] });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-6">
            <Skeleton className="h-32 w-32 rounded-full shrink-0" />
            <div className="flex-1 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { score, breakdown, strengths, improvements } = data;
  const barColor = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

  const breakdownItems = [
    { key: "sessions", ...breakdown.sessions },
    { key: "studyTime", ...breakdown.studyTime },
    { key: "variety", ...breakdown.variety },
    { key: "topicProgress", ...breakdown.topicProgress },
    { key: "streak", ...breakdown.streak },
  ];

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  return (
    <Card className="overflow-hidden border-0 shadow-sm bg-gradient-to-br from-card to-muted/20">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2 space-y-0 flex-wrap">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          Efficiency Score
          <span className="text-xs font-normal text-muted-foreground">{today}</span>
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={refresh}
          className="h-7 w-7"
          data-testid="button-refresh-score"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Score + Breakdown */}
        <div className="flex gap-5 flex-wrap sm:flex-nowrap">
          {/* Ring gauge */}
          <div className="flex shrink-0 items-center justify-center w-full sm:w-auto">
            <ScoreRing score={score} />
          </div>

          {/* Breakdown bars */}
          <div className="flex-1 space-y-2.5 min-w-0">
            {breakdownItems.map(item => (
              <BreakdownBar key={item.key} item={item} color={barColor} />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Strengths + Improvements */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Strengths */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />Strengths
            </h4>
            <ul className="space-y-1.5">
              {strengths.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1.5 text-emerald-800 dark:text-emerald-300"
                  data-testid={`strength-${i}`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-500" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Needs Improvement */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />Needs Improvement
            </h4>
            <ul className="space-y-1.5">
              {improvements.map((imp, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs rounded-lg bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1.5 text-amber-800 dark:text-amber-300"
                  data-testid={`improvement-${i}`}
                >
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
