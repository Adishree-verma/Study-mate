import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TopicItem } from "@/components/topic-item";
import { DoodleIllustration } from "@/components/doodle-illustration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Topic, Subject } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ListTodo, SlidersHorizontal, AlertTriangle, Minus, ChevronDown } from "lucide-react";

export default function BacklogPage() {
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

  const { data: topics = [] } = useQuery<Topic[]>({ queryKey: ["/api/topics"] });
  const { data: subjects = [] } = useQuery<Subject[]>({ queryKey: ["/api/subjects"] });

  const toggleTopicMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      apiRequest("PATCH", `/api/topics/${id}`, { completed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/topics"] }),
  });

  const deleteTopicMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/topics/${id}`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/topics"] }),
  });

  const pendingTopics = topics
    .filter(t => !t.completed)
    .filter(t => priorityFilter === "all" || t.priority === priorityFilter)
    .filter(t => subjectFilter === "all" || t.subjectId === subjectFilter)
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority as keyof typeof order] - order[b.priority as keyof typeof order];
    });

  const getSubjectColor = (subjectId: string) => subjects.find(s => s.id === subjectId)?.color;

  const priorityCounts = {
    high: topics.filter(t => !t.completed && t.priority === "high").length,
    medium: topics.filter(t => !t.completed && t.priority === "medium").length,
    low: topics.filter(t => !t.completed && t.priority === "low").length,
  };

  const priorityCards = [
    { label: "High Priority", count: priorityCounts.high, icon: AlertTriangle, bg: "from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/20 border-red-200 dark:border-red-800/40", iconBg: "bg-red-100 dark:bg-red-900/40", iconColor: "text-red-600 dark:text-red-400", testId: "high-priority-count" },
    { label: "Medium Priority", count: priorityCounts.medium, icon: Minus, bg: "from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800/40", iconBg: "bg-amber-100 dark:bg-amber-900/40", iconColor: "text-amber-600 dark:text-amber-400", testId: "medium-priority-count" },
    { label: "Low Priority", count: priorityCounts.low, icon: ChevronDown, bg: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 border-green-200 dark:border-green-800/40", iconBg: "bg-green-100 dark:bg-green-900/40", iconColor: "text-green-600 dark:text-green-400", testId: "low-priority-count" },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-8 h-20 w-20 rounded-full bg-white" />
          <div className="absolute -bottom-4 right-20 h-28 w-28 rounded-full bg-white" />
        </div>
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ListTodo className="h-5 w-5 text-red-200" />
              <span className="text-sm font-medium text-red-100">Task Management</span>
            </div>
            <h1 className="text-3xl font-bold mb-1">Backlog</h1>
            <p className="text-red-100 text-sm">
              {pendingTopics.length} pending topics · {priorityCounts.high} high priority
            </p>
          </div>
          <div className="hidden sm:block shrink-0">
            <DoodleIllustration type="checklist" className="w-32 h-26 opacity-80" primaryColor="#ffffff" secondaryColor="#fecaca" />
          </div>
        </div>
      </div>

      {/* Priority Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {priorityCards.map(card => (
          <Card key={card.label} className={`border bg-gradient-to-br ${card.bg}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${card.iconBg}`}>
                <card.icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid={`text-${card.testId}`}>{card.count}</div>
              <p className="text-xs text-muted-foreground mt-0.5">topics pending</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Topic List with Filters */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-base">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            Topics
            {pendingTopics.length > 0 && <Badge variant="secondary">{pendingTopics.length}</Badge>}
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-36" data-testid="select-priority-filter"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high"><span className="text-red-600 font-medium">High</span></SelectItem>
                <SelectItem value="medium"><span className="text-amber-600 font-medium">Medium</span></SelectItem>
                <SelectItem value="low"><span className="text-green-600 font-medium">Low</span></SelectItem>
              </SelectContent>
            </Select>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-44" data-testid="select-subject-filter"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />{s.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {pendingTopics.length > 0 ? (
            pendingTopics.map(topic => (
              <TopicItem
                key={topic.id}
                topic={topic}
                subjectColor={getSubjectColor(topic.subjectId)}
                onToggleComplete={(id, completed) => toggleTopicMutation.mutate({ id, completed })}
                onDelete={id => deleteTopicMutation.mutate(id)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <DoodleIllustration
                type={topics.filter(t => !t.completed).length === 0 ? "rocket" : "checklist"}
                className="w-36 h-28"
                primaryColor="#10b981"
                secondaryColor="#6ee7b7"
              />
              <div>
                <p className="font-semibold text-lg">
                  {topics.filter(t => !t.completed).length === 0 ? "All caught up!" : "No matches found"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {priorityFilter === "all" && subjectFilter === "all"
                    ? "No pending topics — you're crushing it! Add more topics from Subjects."
                    : "No topics match your filters. Try adjusting them."}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
