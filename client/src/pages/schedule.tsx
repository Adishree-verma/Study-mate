import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DoodleIllustration } from "@/components/doodle-illustration";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Calendar, Clock, Loader2, Wand2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Subject, ScheduleEntry } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const scheduleFormSchema = z.object({
  examDate: z.string().min(1, "Exam date is required"),
  dailyStudyHours: z.coerce.number().min(1).max(16),
  additionalInfo: z.string().optional(),
});

export default function SchedulePage() {
  const { toast } = useToast();
  const [generatedSchedule, setGeneratedSchedule] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: subjects = [] } = useQuery<Subject[]>({ queryKey: ["/api/subjects"] });
  const { data: scheduleEntries = [] } = useQuery<ScheduleEntry[]>({ queryKey: ["/api/schedule"] });

  const form = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: { examDate: "", dailyStudyHours: 6, additionalInfo: "" },
  });

  const generateScheduleMutation = useMutation({
    mutationFn: async (data: z.infer<typeof scheduleFormSchema>) => {
      setIsGenerating(true);
      return apiRequest("POST", "/api/schedule/generate", {
        subjects: subjects.map(s => ({ name: s.name, targetHours: s.targetHoursPerWeek })),
        examDate: data.examDate,
        dailyStudyHours: data.dailyStudyHours,
        additionalInfo: data.additionalInfo,
      });
    },
    onSuccess: (data: any) => {
      setGeneratedSchedule(data.schedule);
      setIsGenerating(false);
      queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
      toast({ title: "Schedule Generated!", description: "Your personalized study schedule is ready." });
    },
    onError: () => {
      setIsGenerating(false);
      toast({ title: "Error", description: "Failed to generate schedule. Please try again.", variant: "destructive" });
    },
  });

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const scheduleByDay = daysOfWeek.map((day, index) => ({
    day,
    entries: scheduleEntries.filter(e => e.dayOfWeek === index),
  })).filter(d => d.entries.length > 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700 p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-8 h-20 w-20 rounded-full bg-white" />
          <div className="absolute -bottom-4 right-20 h-28 w-28 rounded-full bg-white" />
          <div className="absolute top-8 right-40 h-14 w-14 rounded-full bg-white" />
        </div>
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wand2 className="h-5 w-5 text-purple-200" />
              <span className="text-sm font-medium text-purple-100">Powered by AI</span>
            </div>
            <h1 className="text-3xl font-bold mb-1">AI Study Scheduler</h1>
            <p className="text-purple-100 text-sm">
              Generate a personalized schedule based on your subjects and exam date
            </p>
          </div>
          <div className="hidden sm:block shrink-0">
            <DoodleIllustration type="brain" className="w-32 h-26 opacity-80" primaryColor="#ffffff" secondaryColor="#ddd6fe" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Generator Form */}
        <Card className="border-purple-200 dark:border-purple-800/40">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-purple-500" />
              Generate Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subjects.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <DoodleIllustration type="books" className="w-32 h-24" primaryColor="#8b5cf6" secondaryColor="#c4b5fd" />
                <div>
                  <p className="font-semibold">No subjects found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Head to the Subjects page to add your syllabus first, then come back to generate your AI schedule!
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  {subjects.map(s => (
                    <div key={s.id} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: `${s.color}20`, color: s.color }}>
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                      {s.name}
                    </div>
                  ))}
                </div>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(d => generateScheduleMutation.mutate(d))} className="space-y-4">
                    <FormField control={form.control} name="examDate" render={({ field }) => (
                      <FormItem><FormLabel>Main Exam Date</FormLabel>
                        <FormControl><Input type="date" {...field} data-testid="input-exam-date" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="dailyStudyHours" render={({ field }) => (
                      <FormItem><FormLabel>Daily Study Hours Available</FormLabel>
                        <FormControl><Input type="number" min="1" max="16" {...field} data-testid="input-daily-hours" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="additionalInfo" render={({ field }) => (
                      <FormItem><FormLabel>Additional Preferences (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="E.g., I prefer studying Math in the morning, Physics after lunch..." {...field} data-testid="textarea-additional-info" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white" disabled={isGenerating} data-testid="button-generate-schedule">
                      {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <><Sparkles className="mr-2 h-4 w-4" />Generate AI Schedule</>}
                    </Button>
                  </form>
                </Form>
              </>
            )}
          </CardContent>
        </Card>

        {/* Generated Schedule or placeholder */}
        {generatedSchedule ? (
          <Card className="border-purple-200 dark:border-purple-800/40 bg-purple-50/50 dark:bg-purple-950/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Wand2 className="h-4 w-4 text-purple-500" />
                AI-Generated Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl bg-white dark:bg-card border border-purple-100 dark:border-purple-900/40 p-4 max-h-80 overflow-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono text-foreground leading-relaxed" data-testid="text-generated-schedule">
                  {generatedSchedule}
                </pre>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-purple-200 dark:border-purple-800/40">
            <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center h-full">
              <DoodleIllustration type="calendar" className="w-36 h-28" primaryColor="#8b5cf6" secondaryColor="#c4b5fd" />
              <div>
                <p className="font-semibold">Your schedule will appear here</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  Fill in the form and click "Generate AI Schedule" to create your personalized weekly study plan.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Weekly Calendar View */}
      {scheduleByDay.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-blue-500" />
              Weekly Schedule
              <Badge variant="secondary">{scheduleEntries.length} sessions</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {scheduleByDay.map(({ day, entries }) => (
                <div key={day} className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{day}</h3>
                  {entries.map(entry => {
                    const subject = subjects.find(s => s.id === entry.subjectId);
                    return (
                      <div
                        key={entry.id}
                        className="rounded-xl border p-3 hover-elevate transition-all"
                        style={{ borderColor: subject ? `${subject.color}40` : undefined, backgroundColor: subject ? `${subject.color}08` : undefined }}
                        data-testid={`schedule-entry-${entry.id}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: subject?.color || "#94a3b8" }} />
                          <p className="font-medium text-sm truncate">{subject?.name || "Unknown"}</p>
                        </div>
                        {entry.topicSuggestion && <p className="text-xs text-muted-foreground mb-1.5 truncate">{entry.topicSuggestion}</p>}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{entry.startTime} – {entry.endTime}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
