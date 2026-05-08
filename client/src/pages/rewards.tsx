import { useQuery } from "@tanstack/react-query";
import { AchievementBadge } from "@/components/achievement-badge";
import { DoodleIllustration } from "@/components/doodle-illustration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, TrendingUp, Zap, Lock } from "lucide-react";
import type { Achievement, UserStats } from "@shared/schema";

export default function RewardsPage() {
  const { data: achievements = [] } = useQuery<Achievement[]>({ queryKey: ["/api/achievements"] });
  const { data: stats } = useQuery<UserStats>({ queryKey: ["/api/stats"] });

  const earnedAchievements = achievements.filter(a => a.earned);
  const lockedAchievements = achievements.filter(a => !a.earned);

  const currentLevel = stats ? Math.floor(stats.totalPoints / 1000) + 1 : 1;
  const pointsInLevel = stats ? stats.totalPoints % 1000 : 0;
  const pointsToNextLevel = 1000 - pointsInLevel;
  const levelProgress = pointsInLevel / 10;
  const achievementPercent = achievements.length > 0 ? Math.round((earnedAchievements.length / achievements.length) * 100) : 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500 p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-8 h-20 w-20 rounded-full bg-white" />
          <div className="absolute -bottom-4 right-20 h-28 w-28 rounded-full bg-white" />
          <div className="absolute top-8 right-36 h-14 w-14 rounded-full bg-white" />
        </div>
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-5 w-5 text-yellow-200" />
              <span className="text-sm font-medium text-yellow-100">Gamification</span>
            </div>
            <h1 className="text-3xl font-bold mb-1">Rewards & Achievements</h1>
            <p className="text-yellow-100 text-sm">
              {earnedAchievements.length} of {achievements.length} achievements unlocked · Level {currentLevel}
            </p>
          </div>
          <div className="hidden sm:block shrink-0">
            <DoodleIllustration type="trophy" className="w-32 h-26 opacity-80" primaryColor="#ffffff" secondaryColor="#fde68a" />
          </div>
        </div>
      </div>

      {/* Level + Achievement Progress */}
      {stats && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800/40 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="h-4 w-4 text-yellow-500" />
                Current Level
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-5xl font-black text-yellow-600 dark:text-yellow-400" data-testid="text-current-level">{currentLevel}</div>
                  <p className="text-sm text-muted-foreground mt-1">{stats.totalPoints.toLocaleString()} total points</p>
                </div>
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg">
                  <Trophy className="h-10 w-10 text-white drop-shadow" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Level {currentLevel + 1} in {pointsToNextLevel} pts</span>
                  <span className="font-semibold">{Math.round(levelProgress)}%</span>
                </div>
                <Progress value={levelProgress} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-yellow-400 [&>div]:to-amber-500" data-testid="progress-level" />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl bg-white/60 dark:bg-white/5 p-2.5 text-center">
                  <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{stats.currentStreak}</div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </div>
                <div className="rounded-xl bg-white/60 dark:bg-white/5 p-2.5 text-center">
                  <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{stats.completedSessions}</div>
                  <div className="text-xs text-muted-foreground">Sessions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 border-green-200 dark:border-green-800/40">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Achievement Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-5xl font-black text-green-600 dark:text-green-400" data-testid="text-achievements-earned">
                    {earnedAchievements.length}
                    <span className="text-2xl font-bold text-muted-foreground">/{achievements.length}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">achievements unlocked</p>
                </div>
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg">
                  <Zap className="h-10 w-10 text-white drop-shadow" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{lockedAchievements.length} remaining</span>
                  <span className="font-semibold">{achievementPercent}% complete</span>
                </div>
                <Progress value={achievementPercent} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-green-400 [&>div]:to-emerald-500" data-testid="progress-achievements" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Earned Achievements */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold">Earned</h2>
          <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 border-0 text-white">{earnedAchievements.length}</Badge>
        </div>
        {earnedAchievements.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {earnedAchievements.map(a => <AchievementBadge key={a.id} achievement={a} />)}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-4 py-14 text-center">
              <DoodleIllustration type="rocket" className="w-36 h-28" primaryColor="#f59e0b" secondaryColor="#fcd34d" />
              <div>
                <p className="font-semibold text-lg">No achievements earned yet</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  Keep studying and completing sessions to unlock your first achievement. You've got this!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-muted-foreground flex items-center gap-2">
              <Lock className="h-4 w-4" />Locked
            </h2>
            <Badge variant="outline">{lockedAchievements.length}</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {lockedAchievements.map(a => <AchievementBadge key={a.id} achievement={a} />)}
          </div>
        </div>
      )}

      {lockedAchievements.length === 0 && earnedAchievements.length > 0 && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10 border-green-200 dark:border-green-800/30">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <DoodleIllustration type="stars" className="w-36 h-28" primaryColor="#10b981" secondaryColor="#6ee7b7" />
            <div>
              <p className="font-bold text-green-700 dark:text-green-400 text-lg">All achievements unlocked!</p>
              <p className="text-sm text-muted-foreground mt-1">You've mastered everything. Incredible work!</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
