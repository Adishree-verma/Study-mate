import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar, BookOpen } from "lucide-react";
import type { Exam, Subject } from "@shared/schema";
import { differenceInDays } from "date-fns";

interface ExamCountdownProps {
  exams: Exam[];
  subjects: Subject[];
}

export function ExamCountdown({ exams, subjects }: ExamCountdownProps) {
  const upcomingExams = exams
    .filter(exam => new Date(exam.examDate) > new Date())
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
    .slice(0, 5);

  const getSubject = (subjectId: string) => subjects.find(s => s.id === subjectId);

  const getDaysUntil = (date: Date) => differenceInDays(new Date(date), new Date());

  if (upcomingExams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-blue-500" />
            Upcoming Exams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No upcoming exams scheduled</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-blue-500" />
          Upcoming Exams
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {upcomingExams.map((exam) => {
          const daysUntil = getDaysUntil(new Date(exam.examDate));
          const subject = getSubject(exam.subjectId);

          const urgencyConfig =
            daysUntil <= 3
              ? { bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/40", text: "text-red-700 dark:text-red-300", badge: "bg-red-500 text-white" }
              : daysUntil <= 7
              ? { bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40", text: "text-amber-700 dark:text-amber-300", badge: "bg-amber-500 text-white" }
              : { bg: "bg-card border-border", text: "text-foreground", badge: "" };

          return (
            <div
              key={exam.id}
              className={`flex items-center gap-3 rounded-xl border p-3 hover-elevate transition-all ${urgencyConfig.bg}`}
              data-testid={`exam-item-${exam.id}`}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: subject ? `${subject.color}20` : "#e5e7eb" }}
              >
                <BookOpen className="h-4 w-4" style={{ color: subject?.color || "#6b7280" }} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" data-testid={`text-exam-name-${exam.id}`}>
                  {exam.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {subject?.name || "Unknown"}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <Badge
                  className={urgencyConfig.badge || ""}
                  variant={urgencyConfig.badge ? "default" : "outline"}
                  data-testid={`badge-days-until-${exam.id}`}
                >
                  {daysUntil === 0 ? "Today!" : daysUntil === 1 ? "Tomorrow" : `${daysUntil}d`}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {new Date(exam.examDate).toLocaleDateString()}
                </p>
              </div>

              {daysUntil <= 3 && (
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
