import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, ListTodo } from "lucide-react";
import type { Topic, Subject } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface BacklogListProps {
  topics: Topic[];
  subjects: Subject[];
}

const priorityConfig = {
  high: { label: "High", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-0" },
  medium: { label: "Medium", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-0" },
  low: { label: "Low", className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-0" },
} as const;

export function BacklogList({ topics, subjects }: BacklogListProps) {
  const pendingTopics = topics
    .filter(topic => !topic.completed)
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority as keyof typeof order] - order[b.priority as keyof typeof order];
    })
    .slice(0, 6);

  const getSubjectName = (subjectId: string) => subjects.find(s => s.id === subjectId)?.name || "Unknown";
  const getSubjectColor = (subjectId: string) => subjects.find(s => s.id === subjectId)?.color || "#94a3b8";

  if (pendingTopics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ListTodo className="h-4 w-4 text-muted-foreground" />
            Backlog
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <div className="h-12 w-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-semibold">All caught up!</p>
              <p className="text-xs text-muted-foreground mt-0.5">No pending topics in backlog</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Backlog
        </CardTitle>
        <Badge variant="secondary">{pendingTopics.length} pending</Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        {pendingTopics.map((topic) => {
          const priority = priorityConfig[topic.priority as keyof typeof priorityConfig] || priorityConfig.medium;
          return (
            <div
              key={topic.id}
              className="flex items-center gap-3 rounded-xl border p-3 hover-elevate transition-all"
              data-testid={`backlog-item-${topic.id}`}
            >
              <div
                className="h-8 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: getSubjectColor(topic.subjectId) }}
              />
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="font-medium text-sm truncate" data-testid={`text-backlog-topic-${topic.id}`}>
                  {topic.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getSubjectName(topic.subjectId)}
                  {topic.lastStudied && (
                    <> · {formatDistanceToNow(new Date(topic.lastStudied), { addSuffix: true })}</>
                  )}
                </p>
              </div>
              <Badge className={`text-xs shrink-0 ${priority.className}`} data-testid={`badge-backlog-priority-${topic.id}`}>
                {priority.label}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
