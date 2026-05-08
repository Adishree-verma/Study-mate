import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SubjectCard } from "@/components/subject-card";
import { TopicItem } from "@/components/topic-item";
import { DoodleIllustration } from "@/components/doodle-illustration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, BookOpen, Layers } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSubjectSchema, insertTopicSchema, type Subject, type Topic, type StudySession } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";

const subjectColors = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
];

export default function SubjectsPage() {
  const { toast } = useToast();
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);

  const { data: subjects = [] } = useQuery<Subject[]>({ queryKey: ["/api/subjects"] });
  const { data: topics = [] } = useQuery<Topic[]>({ queryKey: ["/api/topics"] });
  const { data: sessions = [] } = useQuery<StudySession[]>({ queryKey: ["/api/sessions/recent"] });

  const subjectForm = useForm<z.infer<typeof insertSubjectSchema>>({
    resolver: zodResolver(insertSubjectSchema.extend({ targetHoursPerWeek: z.coerce.number().min(1).max(168) })),
    defaultValues: { name: "", color: subjectColors[0], targetHoursPerWeek: 10 },
  });

  const topicForm = useForm<z.infer<typeof insertTopicSchema>>({
    resolver: zodResolver(insertTopicSchema.extend({ priority: z.enum(["high", "medium", "low"]) })),
    defaultValues: { subjectId: "", name: "", priority: "medium", completed: false },
  });

  const createSubjectMutation = useMutation({
    mutationFn: (data: z.infer<typeof insertSubjectSchema>) => apiRequest("POST", "/api/subjects", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/subjects"] }); setSubjectDialogOpen(false); subjectForm.reset(); toast({ title: "Subject created!" }); },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/subjects/${id}`, {}),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/subjects"] }); queryClient.invalidateQueries({ queryKey: ["/api/topics"] }); toast({ title: "Subject deleted." }); },
  });

  const createTopicMutation = useMutation({
    mutationFn: (data: z.infer<typeof insertTopicSchema>) => apiRequest("POST", "/api/topics", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/topics"] }); setTopicDialogOpen(false); topicForm.reset(); toast({ title: "Topic created!" }); },
  });

  const deleteTopicMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/topics/${id}`, {}),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/topics"] }); toast({ title: "Topic deleted." }); },
  });

  const toggleTopicMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) => apiRequest("PATCH", `/api/topics/${id}`, { completed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/topics"] }),
  });

  const getSubjectStudyMinutes = (subjectId: string) =>
    sessions.filter(s => s.subjectId === subjectId).reduce((sum, s) => sum + s.duration, 0);
  const getSubjectTopics = (subjectId: string) => topics.filter(t => t.subjectId === subjectId);
  const completedCount = topics.filter(t => t.completed).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-8 h-20 w-20 rounded-full bg-white" />
          <div className="absolute -bottom-4 right-20 h-28 w-28 rounded-full bg-white" />
        </div>
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-5 w-5 text-green-200" />
              <span className="text-sm font-medium text-green-100">Study Syllabus</span>
            </div>
            <h1 className="text-3xl font-bold mb-1">Subjects & Topics</h1>
            <p className="text-green-100 text-sm">
              {subjects.length} subjects · {completedCount}/{topics.length} topics complete
            </p>
            <div className="flex gap-2 mt-4">
              <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20" data-testid="button-add-topic">
                    <Plus className="mr-1.5 h-4 w-4" />Topic
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add New Topic</DialogTitle></DialogHeader>
                  <Form {...topicForm}>
                    <form onSubmit={topicForm.handleSubmit(d => createTopicMutation.mutate(d))} className="space-y-4">
                      <FormField control={topicForm.control} name="subjectId" render={({ field }) => (
                        <FormItem><FormLabel>Subject</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger data-testid="select-topic-subject"><SelectValue placeholder="Select subject" /></SelectTrigger></FormControl>
                            <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                          </Select><FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={topicForm.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Topic Name</FormLabel>
                          <FormControl><Input placeholder="E.g., Organic Chemistry" {...field} data-testid="input-topic-name" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={topicForm.control} name="priority" render={({ field }) => (
                        <FormItem><FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger data-testid="select-topic-priority"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="high"><span className="text-red-600 font-medium">High</span></SelectItem>
                              <SelectItem value="medium"><span className="text-amber-600 font-medium">Medium</span></SelectItem>
                              <SelectItem value="low"><span className="text-green-600 font-medium">Low</span></SelectItem>
                            </SelectContent>
                          </Select><FormMessage />
                        </FormItem>
                      )} />
                      <Button type="submit" className="w-full" disabled={createTopicMutation.isPending} data-testid="button-submit-topic">
                        {createTopicMutation.isPending ? "Creating..." : "Create Topic"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              <Dialog open={subjectDialogOpen} onOpenChange={setSubjectDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-white text-green-700 hover:bg-white/90" data-testid="button-add-subject">
                    <Plus className="mr-1.5 h-4 w-4" />Subject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add New Subject</DialogTitle></DialogHeader>
                  <Form {...subjectForm}>
                    <form onSubmit={subjectForm.handleSubmit(d => createSubjectMutation.mutate(d))} className="space-y-4">
                      <FormField control={subjectForm.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Subject Name</FormLabel>
                          <FormControl><Input placeholder="E.g., Mathematics" {...field} data-testid="input-subject-name" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={subjectForm.control} name="color" render={({ field }) => (
                        <FormItem><FormLabel>Subject Color</FormLabel>
                          <div className="grid grid-cols-5 gap-2">
                            {subjectColors.map(color => (
                              <button key={color} type="button"
                                className={`h-10 rounded-lg transition-all ${field.value === color ? "ring-2 ring-offset-2 ring-foreground scale-110" : "opacity-80 hover:opacity-100"}`}
                                style={{ backgroundColor: color }}
                                onClick={() => field.onChange(color)}
                                data-testid={`button-color-${color}`}
                              />
                            ))}
                          </div><FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={subjectForm.control} name="targetHoursPerWeek" render={({ field }) => (
                        <FormItem><FormLabel>Target Hours per Week</FormLabel>
                          <FormControl><Input type="number" min="1" max="168" {...field} data-testid="input-target-hours" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <Button type="submit" className="w-full" disabled={createSubjectMutation.isPending} data-testid="button-submit-subject">
                        {createSubjectMutation.isPending ? "Creating..." : "Create Subject"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="hidden sm:block shrink-0">
            <DoodleIllustration type="books" className="w-36 h-28 opacity-80" primaryColor="#ffffff" secondaryColor="#bbf7d0" />
          </div>
        </div>
      </div>

      {/* Subject Cards Grid */}
      {subjects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map(subject => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              topics={getSubjectTopics(subject.id)}
              studyMinutes={getSubjectStudyMinutes(subject.id)}
              onDelete={id => deleteSubjectMutation.mutate(id)}
            />
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <DoodleIllustration type="books" className="w-40 h-32" primaryColor="#10b981" secondaryColor="#6ee7b7" />
            <div>
              <p className="font-semibold text-lg">No subjects yet</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Create your first subject to start organizing your Kota syllabus. Add Physics, Chemistry, Math and more!
              </p>
            </div>
            <Button onClick={() => setSubjectDialogOpen(true)} className="mt-1 bg-green-600 hover:bg-green-700 text-white">
              <Plus className="mr-2 h-4 w-4" />Add Your First Subject
            </Button>
          </CardContent>
        </Card>
      )}

      {/* All Topics */}
      {subjects.length > 0 && topics.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4 text-muted-foreground" />All Topics
            </CardTitle>
            <Badge variant="secondary">{topics.length} total</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {topics.map(topic => {
              const subject = subjects.find(s => s.id === topic.subjectId);
              return (
                <TopicItem
                  key={topic.id}
                  topic={topic}
                  subjectColor={subject?.color}
                  onToggleComplete={(id, completed) => toggleTopicMutation.mutate({ id, completed })}
                  onDelete={id => deleteTopicMutation.mutate(id)}
                />
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
