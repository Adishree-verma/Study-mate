import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateStudySchedule, answerStudentQuestion } from "./openai";
import {
  insertSubjectSchema,
  insertTopicSchema,
  insertStudySessionSchema,
  insertExamSchema,
  insertScheduleEntrySchema,
} from "@shared/schema";
import { z } from "zod";

// Validation schemas - Transform client payloads (ISO strings) to storage types (Date objects)
// Helper to transform ISO string dates to Date objects, handling null/undefined
const transformDate = (val: any) => {
  if (val === null || val === undefined) return val;
  if (typeof val === 'string') return new Date(val);
  if (val instanceof Date) return val;
  return val;
};

// Preprocess wrapper to transform date strings in insert schemas
const withDateTransform = (schema: z.ZodTypeAny) => {
  return z.preprocess((data: any) => {
    if (typeof data !== 'object' || data === null) return data;
    
    const transformed = { ...data };
    
    // Transform common date fields
    if ('startTime' in transformed) transformed.startTime = transformDate(transformed.startTime);
    if ('endTime' in transformed) transformed.endTime = transformDate(transformed.endTime);
    if ('examDate' in transformed) transformed.examDate = transformDate(transformed.examDate);
    if ('lastStudied' in transformed) transformed.lastStudied = transformDate(transformed.lastStudied);
    if ('nextRevision' in transformed) transformed.nextRevision = transformDate(transformed.nextRevision);
    if ('earnedAt' in transformed) transformed.earnedAt = transformDate(transformed.earnedAt);
    if ('lastStudyDate' in transformed) transformed.lastStudyDate = transformDate(transformed.lastStudyDate);
    
    // Coerce numeric fields
    if ('targetHoursPerWeek' in transformed && typeof transformed.targetHoursPerWeek === 'string') {
      transformed.targetHoursPerWeek = Number(transformed.targetHoursPerWeek);
    }
    if ('duration' in transformed && typeof transformed.duration === 'string') {
      transformed.duration = Number(transformed.duration);
    }
    if ('pointsEarned' in transformed && typeof transformed.pointsEarned === 'string') {
      transformed.pointsEarned = Number(transformed.pointsEarned);
    }
    if ('dayOfWeek' in transformed && typeof transformed.dayOfWeek === 'string') {
      transformed.dayOfWeek = Number(transformed.dayOfWeek);
    }
    if ('pointsRequired' in transformed && typeof transformed.pointsRequired === 'string') {
      transformed.pointsRequired = Number(transformed.pointsRequired);
    }
    
    return transformed;
  }, schema);
};

// Use shared insert schemas with date/number transformation
const createSubjectSchema = withDateTransform(insertSubjectSchema);
const createTopicSchema = withDateTransform(insertTopicSchema);
const createStudySessionSchema = withDateTransform(insertStudySessionSchema);
const createExamSchema = withDateTransform(insertExamSchema);
const createScheduleEntrySchema = withDateTransform(insertScheduleEntrySchema);

// Update schema for topics (partial with date transforms)
const updateTopicSchema = z.preprocess((data: any) => {
  if (typeof data !== 'object' || data === null) return data;
  const transformed = { ...data };
  if ('lastStudied' in transformed) transformed.lastStudied = transformDate(transformed.lastStudied);
  if ('nextRevision' in transformed) transformed.nextRevision = transformDate(transformed.nextRevision);
  return transformed;
}, z.object({
  name: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  completed: z.boolean().optional(),
  lastStudied: z.date().nullable().optional(),
  nextRevision: z.date().nullable().optional(),
}));

// AI schedule generation validation
const generateScheduleSchema = z.object({
  subjects: z.array(z.object({
    name: z.string(),
    targetHours: z.coerce.number(),
  })),
  examDate: z.string(),
  dailyStudyHours: z.coerce.number().min(1).max(16),
  additionalInfo: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Subjects
  app.get("/api/subjects", async (req, res) => {
    const subjects = await storage.getSubjects();
    res.json(subjects);
  });

  app.post("/api/subjects", async (req, res) => {
    try {
      const data = createSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(data);
      res.json(subject);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/subjects/:id", async (req, res) => {
    await storage.deleteSubject(req.params.id);
    res.json({ success: true });
  });

  // Topics
  app.get("/api/topics", async (req, res) => {
    const topics = await storage.getTopics();
    res.json(topics);
  });

  app.post("/api/topics", async (req, res) => {
    try {
      const data = createTopicSchema.parse(req.body);
      const topic = await storage.createTopic(data);
      res.json(topic);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/topics/:id", async (req, res) => {
    try {
      const data = updateTopicSchema.parse(req.body);
      const topic = await storage.updateTopic(req.params.id, data);
      if (!topic) {
        res.status(404).json({ error: "Topic not found" });
        return;
      }
      res.json(topic);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/topics/:id", async (req, res) => {
    await storage.deleteTopic(req.params.id);
    res.json({ success: true });
  });

  // Study Sessions
  app.get("/api/sessions", async (req, res) => {
    const sessions = await storage.getStudySessions();
    res.json(sessions);
  });

  app.get("/api/sessions/recent", async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const sessions = await storage.getRecentSessions(limit);
    res.json(sessions);
  });

  app.post("/api/sessions", async (req, res) => {
    try {
      const data = createStudySessionSchema.parse(req.body);
      const session = await storage.createStudySession(data);
      res.json(session);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Exams
  app.get("/api/exams", async (req, res) => {
    const exams = await storage.getExams();
    res.json(exams);
  });

  app.post("/api/exams", async (req, res) => {
    try {
      const data = createExamSchema.parse(req.body);
      const exam = await storage.createExam(data);
      res.json(exam);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/exams/:id", async (req, res) => {
    await storage.deleteExam(req.params.id);
    res.json({ success: true });
  });

  // Achievements
  app.get("/api/achievements", async (req, res) => {
    const achievements = await storage.getAchievements();
    res.json(achievements);
  });

  // User Stats
  app.get("/api/stats", async (req, res) => {
    const stats = await storage.getUserStats();
    res.json(stats);
  });

  // Schedule
  app.get("/api/schedule", async (req, res) => {
    const entries = await storage.getScheduleEntries();
    res.json(entries);
  });

  app.post("/api/schedule/generate", async (req, res) => {
    try {
      const validatedData = generateScheduleSchema.parse(req.body);
      const { subjects, examDate, dailyStudyHours, additionalInfo } = validatedData;

      // Generate schedule using OpenAI
      const schedule = await generateStudySchedule({
        subjects,
        examDate,
        dailyStudyHours,
        additionalInfo,
      });

      // Parse and store schedule entries (simplified version)
      // In a real implementation, you'd parse the AI response more intelligently
      await storage.clearScheduleEntries();

      // For now, just return the schedule text
      res.json({ schedule });
    } catch (error: any) {
      console.error("Schedule generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate schedule" });
    }
  });

  app.post("/api/schedule", async (req, res) => {
    try {
      const data = createScheduleEntrySchema.parse(req.body);
      const entry = await storage.createScheduleEntry(data);
      res.json(entry);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Efficiency Score endpoint
  app.get("/api/efficiency-score", async (req, res) => {
    try {
      const [allSessions, allTopics, allSubjects, stats] = await Promise.all([
        storage.getStudySessions(),
        storage.getTopics(),
        storage.getSubjects(),
        storage.getUserStats(),
      ]);

      // Filter today's sessions
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todaySessions = allSessions.filter(s => new Date(s.startTime) >= todayStart);
      const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);

      // Subjects studied today
      const subjectIdsTodaySet = new Set(todaySessions.map(s => s.subjectId).filter(Boolean));
      const subjectsCoveredToday = allSubjects.filter(s => subjectIdsTodaySet.has(s.id)).map(s => s.name);

      // 1. Session count score (25 pts max) — target: 4 sessions
      const sessionTarget = 4;
      const sessionScore = Math.min(25, Math.round((todaySessions.length / sessionTarget) * 25));

      // 2. Study time score (25 pts max) — target: 120 min
      const minuteTarget = 120;
      const timeScore = Math.min(25, Math.round((todayMinutes / minuteTarget) * 25));

      // 3. Subject variety score (20 pts max)
      const subjectVarietyTarget = Math.min(allSubjects.length, 3);
      const varietyScore = subjectVarietyTarget > 0
        ? Math.min(20, Math.round((subjectIdsTodaySet.size / subjectVarietyTarget) * 20))
        : (todaySessions.length > 0 ? 10 : 0);

      // 4. Topic progress score (15 pts max)
      const completedTopics = allTopics.filter(t => t.completed).length;
      const totalTopics = allTopics.length;
      const topicScore = totalTopics > 0
        ? Math.min(15, Math.round((completedTopics / totalTopics) * 15))
        : (todaySessions.length > 0 ? 8 : 0);

      // 5. Streak score (15 pts max) — 7+ days = full
      const streakScore = Math.min(15, Math.round((stats.currentStreak / 7) * 15));

      const totalScore = sessionScore + timeScore + varietyScore + topicScore + streakScore;

      // Determine strengths
      const strengths: string[] = [];
      if (sessionScore >= 19) strengths.push("Excellent number of sessions today");
      else if (sessionScore >= 12) strengths.push("Consistent study sessions maintained");
      if (timeScore >= 20) strengths.push("Strong daily study hours");
      else if (timeScore >= 13) strengths.push("Good time invested in studying");
      if (streakScore >= 10) strengths.push(`Impressive ${stats.currentStreak}-day study streak`);
      else if (streakScore >= 6) strengths.push(`Solid ${stats.currentStreak}-day streak going`);
      if (varietyScore >= 15) strengths.push("Great subject variety covered today");
      if (topicScore >= 12) strengths.push("High topic completion rate");
      if (subjectsCoveredToday.length > 0 && subjectsCoveredToday.length >= 2) {
        strengths.push(`Studied ${subjectsCoveredToday.slice(0, 3).join(", ")} today`);
      }

      // Determine needs improvement
      const improvements: string[] = [];
      const highPriorityPending = allTopics.filter(t => !t.completed && t.priority === "high").length;

      if (sessionScore < 12) {
        improvements.push(todaySessions.length === 0
          ? "No study sessions completed today"
          : `Only ${todaySessions.length} session${todaySessions.length > 1 ? "s" : ""} done — aim for ${sessionTarget}`);
      }
      if (timeScore < 12) {
        improvements.push(todayMinutes === 0
          ? "No study time logged today"
          : `Only ${todayMinutes} min studied — target is ${minuteTarget} min`);
      }
      if (varietyScore < 10 && allSubjects.length > 1) {
        improvements.push("Spread study time across more subjects");
      }
      if (topicScore < 8 && totalTopics > 0) {
        improvements.push("Low topic completion rate — finish more topics");
      }
      if (streakScore < 5) {
        improvements.push(stats.currentStreak === 0
          ? "Build a daily study habit — start your streak!"
          : "Strengthen your streak with consistent daily sessions");
      }
      if (highPriorityPending > 2) {
        improvements.push(`${highPriorityPending} high-priority topics still in backlog`);
      }

      // If everything is perfect, add encouragement
      if (improvements.length === 0) {
        improvements.push("Keep up this amazing performance!");
      }
      if (strengths.length === 0 && todaySessions.length === 0) {
        strengths.push("Start a session to build your score");
      }

      res.json({
        score: totalScore,
        breakdown: {
          sessions: { score: sessionScore, max: 25, label: "Daily Sessions", value: `${todaySessions.length} sessions` },
          studyTime: { score: timeScore, max: 25, label: "Study Hours", value: `${todayMinutes} min` },
          variety: { score: varietyScore, max: 20, label: "Subject Variety", value: `${subjectIdsTodaySet.size}/${allSubjects.length} subjects` },
          topicProgress: { score: topicScore, max: 15, label: "Topic Progress", value: `${completedTopics}/${totalTopics} topics` },
          streak: { score: streakScore, max: 15, label: "Streak", value: `${stats.currentStreak} days` },
        },
        strengths,
        improvements,
        todayMinutes,
        todaySessions: todaySessions.length,
        subjectsCovered: subjectsCoveredToday,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI Assistant endpoint with web search
  app.post("/api/assistant", async (req, res) => {
    try {
      const { question, history = [] } = z.object({
        question: z.string().min(1).max(2000),
        history: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })).optional().default([]),
      }).parse(req.body);

      const result = await answerStudentQuestion(question, history);
      res.json(result);
    } catch (error: any) {
      console.error("AI assistant error:", error);
      res.status(500).json({ error: error.message || "Failed to get AI response" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
