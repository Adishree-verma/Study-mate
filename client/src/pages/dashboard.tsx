import { useQuery } from "@tanstack/react-query";
import { StatsOverview } from "@/components/stats-overview";
import { ExamCountdown } from "@/components/exam-countdown";
import { BacklogList } from "@/components/backlog-list";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { DailyQuote } from "@/components/daily-quote";
import { DoodleIllustration } from "@/components/doodle-illustration";
import { EfficiencyScore } from "@/components/efficiency-score";
import { StressTracker } from "@/components/stress-tracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useExamNotifications, useRevisionReminders } from "@/hooks/use-notification";
import type { UserStats, Subject, Exam, Topic, StudySession } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Sparkles, TrendingUp, Clock, BookOpen, Calendar, Trophy, ArrowRight, Wand2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const CHART_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];

const quickLinks = [
  { label: "Start Timer", desc: "Begin a Pomodoro session", icon: Clock, href: "/timer", color: "#f97316", bg: "from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20", border: "border-orange-200 dark:border-orange-800/40", doodle: "timer" as const },
  { label: "Add Subjects", desc: "Organize your syllabus", icon: BookOpen, href: "/subjects", color: "#10b981", bg: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20", border: "border-green-200 dark:border-green-800/40", doodle: "books" as const },
  { label: "View Backlog", desc: "Manage pending topics", icon: Calendar, href: "/backlog", color: "#ef4444", bg: "from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/20", border: "border-red-200 dark:border-red-800/40", doodle: "checklist" as const },
  { label: "AI Schedule", desc: "Let AI plan your week", icon: Wand2, href: "/schedule", color: "#8b5cf6", bg: "from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/20", border: "border-purple-200 dark:border-purple-800/40", doodle: "brain" as const },
  { label: "Rewards", desc: "Unlock achievements", icon: Trophy, href: "/rewards", color: "#f59e0b", bg: "from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/20", border: "border-yellow-200 dark:border-yellow-800/40", doodle: "trophy" as const },
];

export default function Dashboard() {
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({ queryKey: ["/api/stats"] });
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery<Subject[]>({ queryKey: ["/api/subjects"] });
  const { data: exams = [], isLoading: examsLoading } = useQuery<Exam[]>({ queryKey: ["/api/exams"] });
  const { data: topics = [], isLoading: topicsLoading } = useQuery<Topic[]>({ queryKey: ["/api/topics"] });
  const { data: recentSessions = [] } = useQuery<StudySession[]>({ queryKey: ["/api/sessions/recent"] });

  useExamNotifications(exams);
  useRevisionReminders(topics);

  const handleSessionComplete = async (duration: number, mode: "work" | "break") => {
    if (mode === "work") {
      try {
        const pointsEarned = Math.floor(duration / 5);
        await apiRequest("POST", "/api/sessions", {
          duration,
          completed: true,
          pointsEarned,
          startTime: new Date(Date.now() - duration * 60 * 1000).toISOString(),
          endTime: new Date().toISOString(),
        });
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/sessions/recent"] });
        toast({ title: "Session Complete!", description: `Great work! You earned ${pointsEarned} points.`, duration: 5000 });
      } catch (error) {
        console.error("Failed to save session:", error);
      }
    }
  };

  const studyDataBySubject = subjects.map((subject, i) => {
    const subjectSessions = recentSessions.filter(s => s.subjectId === subject.id);
    const totalMinutes = subjectSessions.reduce((sum, s) => sum + s.duration, 0);
    return {
      name: subject.name.length > 10 ? subject.name.slice(0, 10) + "…" : subject.name,
      hours: Number((totalMinutes / 60).toFixed(1)),
      color: subject.color || CHART_COLORS[i % CHART_COLORS.length],
    };
  }).filter(d => d.hours > 0);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const isNewUser = subjects.length === 0;

  if (statsLoading || subjectsLoading || examsLoading || topicsLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-blue-600 to-indigo-700 p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-8 h-24 w-24 rounded-full bg-white" />
          <div className="absolute -bottom-4 right-24 h-32 w-32 rounded-full bg-white" />
          <div className="absolute top-8 right-40 h-16 w-16 rounded-full bg-white" />
        </div>
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <span className="text-sm font-medium text-blue-100">{greeting}!</span>
            </div>
            <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
            <p className="text-blue-100 text-sm">
              {stats
                ? `${stats.completedSessions} sessions done · ${stats.currentStreak} day streak · ${stats.totalPoints} points`
                : "Welcome back! Here's your study overview."}
            </p>
          </div>
          <div className="hidden md:block shrink-0">
            <DoodleIllustration
              type="student"
              className="w-36 h-28 opacity-80"
              primaryColor="#ffffff"
              secondaryColor="#bfdbfe"
            />
          </div>
        </div>
      </div>

      {/* Daily Quote */}
      <DailyQuote />

      {stats && <StatsOverview stats={stats} />}

      {/* Efficiency Score */}
      <EfficiencyScore />

      {/* Stress Tracker */}
      <StressTracker />

      {/* Getting Started Guide for new users */}
      {isNewUser && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold">Get Started</h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {quickLinks.map((link, i) => (
              <Link key={link.href} href={link.href}>
                <div
                  className={`group cursor-pointer rounded-2xl border bg-gradient-to-br ${link.bg} ${link.border} p-4 hover-elevate transition-all`}
                  data-testid={`quick-link-${i}`}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <DoodleIllustration
                      type={link.doodle}
                      className="w-20 h-16"
                      primaryColor={link.color}
                      secondaryColor={`${link.color}80`}
                    />
                    <div>
                      <p className="font-semibold text-sm leading-tight" style={{ color: link.color }}>{link.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{link.desc}</p>
                    </div>
                    <div
                      className="flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: link.color }}
                    >
                      Go <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <PomodoroTimer onSessionComplete={handleSessionComplete} />

          {studyDataBySubject.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Study Hours by Subject
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={studyDataBySubject} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(val) => [`${val}h`, "Hours"]}
                    />
                    <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                      {studyDataBySubject.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <ExamCountdown exams={exams} subjects={subjects} />
          <BacklogList topics={topics} subjects={subjects} />
        </div>
      </div>
    </div>
  );
}
