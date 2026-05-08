import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { DoodleIllustration } from "@/components/doodle-illustration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Subject, Topic } from "@shared/schema";
import { Clock, Target, SlidersHorizontal } from "lucide-react";

const pomodoroTips = [
  "Work in focused 25-minute bursts for peak concentration.",
  "Take your breaks seriously — they recharge your brain.",
  "After 4 Pomodoros, take a longer 15-20 min break.",
  "Silence your phone during work sessions.",
  "Write down what you'll study before starting the timer.",
];

export default function TimerPage() {
  const { toast } = useToast();
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");

  const { data: subjects = [] } = useQuery<Subject[]>({ queryKey: ["/api/subjects"] });
  const { data: topics = [] } = useQuery<Topic[]>({ queryKey: ["/api/topics"] });

  const filteredTopics = selectedSubject ? topics.filter(t => t.subjectId === selectedSubject) : topics;
  const selectedSubjectData = subjects.find(s => s.id === selectedSubject);

  const todayTip = pomodoroTips[new Date().getDay() % pomodoroTips.length];

  const handleSessionComplete = async (duration: number, mode: "work" | "break") => {
    if (mode === "work") {
      try {
        const pointsEarned = Math.floor(duration / 5);
        await apiRequest("POST", "/api/sessions", {
          subjectId: selectedSubject || null,
          topicId: selectedTopic || null,
          duration,
          completed: true,
          pointsEarned,
          startTime: new Date(Date.now() - duration * 60 * 1000).toISOString(),
          endTime: new Date().toISOString(),
        });
        if (selectedTopic) {
          await apiRequest("PATCH", `/api/topics/${selectedTopic}`, { lastStudied: new Date().toISOString() });
        }
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/sessions/recent"] });
        queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
        toast({ title: "Session Complete!", description: `Great work! You earned ${pointsEarned} points.`, duration: 5000 });
      } catch (error) {
        console.error("Failed to save session:", error);
      }
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-8 h-20 w-20 rounded-full bg-white" />
          <div className="absolute -bottom-4 right-20 h-28 w-28 rounded-full bg-white" />
        </div>
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-5 w-5 text-orange-200" />
              <span className="text-sm font-medium text-orange-100">Pomodoro Technique</span>
            </div>
            <h1 className="text-3xl font-bold mb-1">Focus Timer</h1>
            <p className="text-orange-100 text-sm">
              {workDuration} min work · {breakDuration} min break
              {selectedSubjectData ? ` · ${selectedSubjectData.name}` : ""}
            </p>
            {/* Daily tip */}
            <div className="mt-3 rounded-xl bg-white/15 px-3 py-2 text-xs text-orange-50 max-w-md">
              Tip: {todayTip}
            </div>
          </div>
          <div className="hidden md:block shrink-0">
            <DoodleIllustration type="timer" className="w-32 h-26 opacity-80" primaryColor="#ffffff" secondaryColor="#fed7aa" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PomodoroTimer
            workDuration={workDuration}
            breakDuration={breakDuration}
            onSessionComplete={handleSessionComplete}
          />
        </div>

        <div className="space-y-4">
          {/* Timer Settings */}
          <Card className="border-orange-200 dark:border-orange-800/40 bg-orange-50/50 dark:bg-orange-950/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <SlidersHorizontal className="h-4 w-4 text-orange-500" />
                Timer Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Work Duration</Label>
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{workDuration} min</span>
                </div>
                <Slider
                  value={[workDuration]}
                  onValueChange={v => setWorkDuration(v[0])}
                  min={15} max={60} step={5}
                  data-testid="slider-work-duration"
                />
                <div className="flex justify-between text-xs text-muted-foreground"><span>15m</span><span>60m</span></div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Break Duration</Label>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{breakDuration} min</span>
                </div>
                <Slider
                  value={[breakDuration]}
                  onValueChange={v => setBreakDuration(v[0])}
                  min={5} max={30} step={5}
                  data-testid="slider-break-duration"
                />
                <div className="flex justify-between text-xs text-muted-foreground"><span>5m</span><span>30m</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Focus Subject */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-blue-500" />
                Study Focus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subjects.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <DoodleIllustration type="books" className="w-24 h-20" primaryColor="#3b82f6" secondaryColor="#93c5fd" />
                  <p className="text-xs text-muted-foreground">Add subjects first to link sessions to your syllabus.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm">Subject</Label>
                    <Select value={selectedSubject} onValueChange={v => { setSelectedSubject(v); setSelectedTopic(""); }}>
                      <SelectTrigger data-testid="select-subject"><SelectValue placeholder="Choose a subject" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No subject</SelectItem>
                        {subjects.map(s => (
                          <SelectItem key={s.id} value={s.id}>
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />{s.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Topic (Optional)</Label>
                    <Select value={selectedTopic} onValueChange={setSelectedTopic} disabled={!selectedSubject}>
                      <SelectTrigger data-testid="select-topic"><SelectValue placeholder="Choose a topic" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No specific topic</SelectItem>
                        {filteredTopics.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedSubjectData && (
                    <div className="rounded-xl p-3 text-center" style={{ backgroundColor: `${selectedSubjectData.color}15` }}>
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedSubjectData.color }} />
                        <span className="text-sm font-semibold" style={{ color: selectedSubjectData.color }}>{selectedSubjectData.name}</span>
                      </div>
                      {selectedTopic && <p className="text-xs text-muted-foreground mt-1">{filteredTopics.find(t => t.id === selectedTopic)?.name}</p>}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
