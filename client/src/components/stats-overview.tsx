import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Flame, Clock, Target } from "lucide-react";
import type { UserStats } from "@shared/schema";

interface StatsOverviewProps {
  stats: UserStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const statCards = [
    {
      title: "Total Points",
      value: stats.totalPoints.toLocaleString(),
      icon: Trophy,
      iconColor: "text-yellow-600 dark:text-yellow-400",
      iconBg: "bg-yellow-100 dark:bg-yellow-500/20",
      gradient: "from-yellow-50 to-amber-50 dark:from-yellow-500/10 dark:to-amber-500/5",
      border: "border-yellow-200 dark:border-yellow-500/20",
      testId: "total-points",
    },
    {
      title: "Current Streak",
      value: `${stats.currentStreak} days`,
      icon: Flame,
      iconColor: "text-orange-600 dark:text-orange-400",
      iconBg: "bg-orange-100 dark:bg-orange-500/20",
      gradient: "from-orange-50 to-red-50 dark:from-orange-500/10 dark:to-red-500/5",
      border: "border-orange-200 dark:border-orange-500/20",
      testId: "current-streak",
    },
    {
      title: "Study Time",
      value: `${Math.floor(stats.totalStudyMinutes / 60)}h ${stats.totalStudyMinutes % 60}m`,
      icon: Clock,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-500/20",
      gradient: "from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/5",
      border: "border-blue-200 dark:border-blue-500/20",
      testId: "study-time",
    },
    {
      title: "Sessions Completed",
      value: stats.completedSessions.toLocaleString(),
      icon: Target,
      iconColor: "text-green-600 dark:text-green-400",
      iconBg: "bg-green-100 dark:bg-green-500/20",
      gradient: "from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/5",
      border: "border-green-200 dark:border-green-500/20",
      testId: "completed-sessions",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card
          key={stat.title}
          className={`bg-gradient-to-br ${stat.gradient} border ${stat.border}`}
          data-testid={`card-stat-${stat.testId}`}
        >
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.iconBg}`}>
              <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid={`text-stat-${stat.testId}`}>
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
