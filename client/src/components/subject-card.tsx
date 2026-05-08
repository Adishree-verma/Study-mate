import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Trash2, BookOpen } from "lucide-react";
import type { Subject, Topic } from "@shared/schema";

interface SubjectCardProps {
  subject: Subject;
  topics: Topic[];
  studyMinutes?: number;
  onEdit?: (subject: Subject) => void;
  onDelete?: (id: string) => void;
}

export function SubjectCard({ subject, topics, studyMinutes = 0, onEdit, onDelete }: SubjectCardProps) {
  const completedTopics = topics.filter(t => t.completed).length;
  const totalTopics = topics.length;
  const progress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
  const studyHours = (studyMinutes / 60).toFixed(1);
  const targetProgress = Math.min((studyMinutes / (subject.targetHoursPerWeek * 60)) * 100, 100);

  return (
    <Card className="hover-elevate transition-all overflow-hidden" data-testid={`card-subject-${subject.id}`}>
      {/* Colored top strip */}
      <div className="h-2 w-full" style={{ backgroundColor: subject.color }} />

      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${subject.color}20` }}
          >
            <BookOpen className="h-5 w-5" style={{ color: subject.color }} />
          </div>
          <div>
            <h3 className="font-semibold text-base leading-tight" data-testid={`text-subject-name-${subject.id}`}>
              {subject.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalTopics} topic{totalTopics !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(subject.id)}
            className="shrink-0 text-muted-foreground"
            data-testid={`button-delete-subject-${subject.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        {/* Topic completion */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Topics done</span>
            <span className="font-semibold" data-testid={`text-progress-${subject.id}`}>
              {completedTopics}/{totalTopics}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: subject.color }}
              data-testid={`progress-subject-${subject.id}`}
            />
          </div>
        </div>

        {/* Weekly target */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span data-testid={`text-study-minutes-${subject.id}`}>{studyHours}h this week</span>
            </span>
            <Badge
              variant="outline"
              className="text-xs py-0"
              data-testid={`badge-target-hours-${subject.id}`}
            >
              Goal: {subject.targetHoursPerWeek}h
            </Badge>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 opacity-60"
              style={{ width: `${targetProgress}%`, backgroundColor: subject.color }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
