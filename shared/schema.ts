import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Subjects table - Core subjects the student is studying
export const subjects = pgTable("subjects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  color: text("color").notNull(), // Hex color for visual distinction
  targetHoursPerWeek: integer("target_hours_per_week").notNull().default(10),
});

export const insertSubjectSchema = createInsertSchema(subjects).omit({ id: true });
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjects.$inferSelect;

// Topics table - Individual topics within subjects
export const topics = pgTable("topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: varchar("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  priority: text("priority").notNull().default("medium"), // high, medium, low
  completed: boolean("completed").notNull().default(false),
  lastStudied: timestamp("last_studied"),
  nextRevision: timestamp("next_revision"),
});

export const insertTopicSchema = createInsertSchema(topics).omit({ id: true });
export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type Topic = typeof topics.$inferSelect;

// Study sessions - Track Pomodoro sessions
export const studySessions = pgTable("study_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: varchar("subject_id").references(() => subjects.id, { onDelete: "set null" }),
  topicId: varchar("topic_id").references(() => topics.id, { onDelete: "set null" }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration").notNull(), // in minutes
  completed: boolean("completed").notNull().default(false),
  pointsEarned: integer("points_earned").notNull().default(0),
});

export const insertStudySessionSchema = createInsertSchema(studySessions).omit({ id: true });
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
export type StudySession = typeof studySessions.$inferSelect;

// Exams/Tests - Track important dates
export const exams = pgTable("exams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: varchar("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  examDate: timestamp("exam_date").notNull(),
  notified: boolean("notified").notNull().default(false),
});

export const insertExamSchema = createInsertSchema(exams).omit({ id: true });
export type InsertExam = z.infer<typeof insertExamSchema>;
export type Exam = typeof exams.$inferSelect;

// Rewards/Achievements
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // Icon identifier
  pointsRequired: integer("points_required").notNull(),
  earned: boolean("earned").notNull().default(false),
  earnedAt: timestamp("earned_at"),
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true });
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

// User stats - Overall progress tracking
export const userStats = pgTable("user_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  totalPoints: integer("total_points").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  totalStudyMinutes: integer("total_study_minutes").notNull().default(0),
  completedSessions: integer("completed_sessions").notNull().default(0),
  lastStudyDate: timestamp("last_study_date"),
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({ id: true });
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type UserStats = typeof userStats.$inferSelect;

// AI Schedule entries
export const scheduleEntries = pgTable("schedule_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: varchar("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  topicSuggestion: text("topic_suggestion"),
});

export const insertScheduleEntrySchema = createInsertSchema(scheduleEntries).omit({ id: true });
export type InsertScheduleEntry = z.infer<typeof insertScheduleEntrySchema>;
export type ScheduleEntry = typeof scheduleEntries.$inferSelect;
