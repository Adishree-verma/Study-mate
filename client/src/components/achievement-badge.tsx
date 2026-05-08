import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Lock, Star, Flame, Target, Award } from "lucide-react";
import type { Achievement } from "@shared/schema";

interface AchievementBadgeProps {
  achievement: Achievement;
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  flame: Flame,
  target: Target,
  award: Award,
};

const earnedGradients = [
  "from-yellow-400 to-amber-500",
  "from-orange-400 to-red-500",
  "from-purple-400 to-indigo-500",
  "from-blue-400 to-cyan-500",
  "from-green-400 to-emerald-500",
  "from-pink-400 to-rose-500",
];

function getGradient(id: string) {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return earnedGradients[hash % earnedGradients.length];
}

export function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const Icon = iconMap[achievement.icon as keyof typeof iconMap] || Trophy;
  const isEarned = achievement.earned;
  const gradient = getGradient(achievement.id);

  return (
    <Card
      className={`transition-all ${isEarned ? "hover-elevate" : "opacity-60"}`}
      data-testid={`card-achievement-${achievement.id}`}
    >
      <CardContent className="flex flex-col items-center gap-3 p-5">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
            isEarned
              ? `bg-gradient-to-br ${gradient} shadow-lg`
              : "bg-muted"
          }`}
        >
          {isEarned ? (
            <Icon className="h-8 w-8 text-white drop-shadow" />
          ) : (
            <Lock className="h-7 w-7 text-muted-foreground" />
          )}
        </div>

        <div className="space-y-1 text-center">
          <h3 className="font-semibold text-sm leading-tight" data-testid={`text-achievement-name-${achievement.id}`}>
            {achievement.name}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed" data-testid={`text-achievement-description-${achievement.id}`}>
            {achievement.description}
          </p>
        </div>

        <Badge
          variant={isEarned ? "default" : "outline"}
          className={isEarned ? `bg-gradient-to-r ${gradient} border-0 text-white` : ""}
          data-testid={`badge-achievement-points-${achievement.id}`}
        >
          {achievement.pointsRequired} pts
        </Badge>

        {isEarned && achievement.earnedAt && (
          <p className="text-xs text-muted-foreground" data-testid={`text-earned-date-${achievement.id}`}>
            Earned {new Date(achievement.earnedAt).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
