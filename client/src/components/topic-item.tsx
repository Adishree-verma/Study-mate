import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Clock, Trash2 } from "lucide-react";
import type { Topic } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface TopicItemProps {
  topic: Topic;
  subjectColor?: string;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onDelete?: (id: string) => void;
}

const priorityConfig = {
  high: { label: "High", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-0" },
  medium: { label: "Medium", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-0" },
  low: { label: "Low", className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-0" },
} as const;

export function TopicItem({ topic, subjectColor, onToggleComplete, onDelete }: TopicItemProps) {
  const priority = priorityConfig[topic.priority as keyof typeof priorityConfig] || priorityConfig.medium;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-3 hover-elevate transition-all ${topic.completed ? "opacity-60 bg-muted/30" : "bg-card"}`}
      data-testid={`card-topic-${topic.id}`}
    >
      <button
        className="shrink-0 flex items-center justify-center"
        onClick={() => onToggleComplete?.(topic.id, !topic.completed)}
        data-testid={`button-toggle-topic-${topic.id}`}
      >
        {topic.completed ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {subjectColor && (
        <div
          className="h-8 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: subjectColor }}
        />
      )}

      <div className="flex-1 min-w-0 space-y-0.5">
        <p
          className={`font-medium text-sm ${topic.completed ? "text-muted-foreground line-through" : ""}`}
          data-testid={`text-topic-name-${topic.id}`}
        >
          {topic.name}
        </p>
        {topic.lastStudied && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span data-testid={`text-last-studied-${topic.id}`}>
              {formatDistanceToNow(new Date(topic.lastStudied), { addSuffix: true })}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Badge className={`text-xs ${priority.className}`} data-testid={`badge-priority-${topic.id}`}>
          {priority.label}
        </Badge>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={() => onDelete(topic.id)}
            data-testid={`button-delete-topic-${topic.id}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
