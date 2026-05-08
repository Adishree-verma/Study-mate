import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export function useExamNotifications(exams: any[]) {
  const { toast } = useToast();
  const notifiedRef = useRef(new Set<string>());

  useEffect(() => {
    const checkExams = () => {
      const now = new Date();
      
      exams.forEach((exam) => {
        const examDate = new Date(exam.examDate);
        const hoursUntil = (examDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        // Notify 24 hours before
        if (hoursUntil <= 24 && hoursUntil > 23 && !notifiedRef.current.has(`${exam.id}-24h`)) {
          toast({
            title: "Exam Tomorrow!",
            description: `${exam.name} is in 24 hours. Time to review!`,
            duration: 5000,
          });
          notifiedRef.current.add(`${exam.id}-24h`);
        }
        
        // Notify 1 hour before
        if (hoursUntil <= 1 && hoursUntil > 0 && !notifiedRef.current.has(`${exam.id}-1h`)) {
          toast({
            title: "Exam Starting Soon!",
            description: `${exam.name} starts in 1 hour!`,
            variant: "destructive",
            duration: 10000,
          });
          notifiedRef.current.add(`${exam.id}-1h`);
        }
      });
    };

    // Check every 5 minutes
    const interval = setInterval(checkExams, 5 * 60 * 1000);
    checkExams(); // Check immediately

    return () => clearInterval(interval);
  }, [exams, toast]);
}

export function useRevisionReminders(topics: any[]) {
  const { toast } = useToast();
  const notifiedRef = useRef(new Set<string>());

  useEffect(() => {
    const checkRevisions = () => {
      const now = new Date();
      
      topics.forEach((topic) => {
        if (topic.nextRevision && !notifiedRef.current.has(`${topic.id}-revision`)) {
          const revisionDate = new Date(topic.nextRevision);
          if (revisionDate <= now) {
            toast({
              title: "Time to Revise!",
              description: `You should review: ${topic.name}`,
              duration: 7000,
            });
            notifiedRef.current.add(`${topic.id}-revision`);
            
            // Clear from notified after 1 hour so it can notify again
            setTimeout(() => {
              notifiedRef.current.delete(`${topic.id}-revision`);
            }, 60 * 60 * 1000);
          }
        }
      });
    };

    // Check every 10 minutes
    const interval = setInterval(checkRevisions, 10 * 60 * 1000);
    checkRevisions(); // Check immediately

    return () => clearInterval(interval);
  }, [topics, toast]);
}
