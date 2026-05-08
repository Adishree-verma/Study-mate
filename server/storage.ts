import {
  type Subject,
  type InsertSubject,
  type Topic,
  type InsertTopic,
  type StudySession,
  type InsertStudySession,
  type Exam,
  type InsertExam,
  type Achievement,
  type InsertAchievement,
  type UserStats,
  type InsertUserStats,
  type ScheduleEntry,
  type InsertScheduleEntry,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Subjects
  getSubjects(): Promise<Subject[]>;
  getSubject(id: string): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  deleteSubject(id: string): Promise<void>;

  // Topics
  getTopics(): Promise<Topic[]>;
  getTopic(id: string): Promise<Topic | undefined>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  updateTopic(id: string, topic: Partial<Topic>): Promise<Topic | undefined>;
  deleteTopic(id: string): Promise<void>;

  // Study Sessions
  getStudySessions(): Promise<StudySession[]>;
  getRecentSessions(limit?: number): Promise<StudySession[]>;
  createStudySession(session: InsertStudySession): Promise<StudySession>;

  // Exams
  getExams(): Promise<Exam[]>;
  createExam(exam: InsertExam): Promise<Exam>;
  deleteExam(id: string): Promise<void>;

  // Achievements
  getAchievements(): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  updateAchievement(id: string, achievement: Partial<Achievement>): Promise<Achievement | undefined>;

  // User Stats
  getUserStats(): Promise<UserStats>;
  updateUserStats(stats: Partial<UserStats>): Promise<UserStats>;

  // Schedule Entries
  getScheduleEntries(): Promise<ScheduleEntry[]>;
  createScheduleEntry(entry: InsertScheduleEntry): Promise<ScheduleEntry>;
  clearScheduleEntries(): Promise<void>;
}

export class MemStorage implements IStorage {
  private subjects: Map<string, Subject>;
  private topics: Map<string, Topic>;
  private sessions: Map<string, StudySession>;
  private exams: Map<string, Exam>;
  private achievements: Map<string, Achievement>;
  private userStats: UserStats;
  private scheduleEntries: Map<string, ScheduleEntry>;

  constructor() {
    this.subjects = new Map();
    this.topics = new Map();
    this.sessions = new Map();
    this.exams = new Map();
    this.achievements = new Map();
    this.scheduleEntries = new Map();

    // Initialize user stats
    this.userStats = {
      id: randomUUID(),
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalStudyMinutes: 0,
      completedSessions: 0,
      lastStudyDate: null,
    };

    // Initialize default achievements
    this.initializeAchievements();
  }

  private initializeAchievements() {
    const defaultAchievements = [
      { name: "First Steps", description: "Complete your first study session", icon: "trophy", pointsRequired: 0 },
      { name: "Getting Started", description: "Earn 100 points", icon: "star", pointsRequired: 100 },
      { name: "Dedicated Learner", description: "Earn 500 points", icon: "award", pointsRequired: 500 },
      { name: "Study Master", description: "Earn 1000 points", icon: "trophy", pointsRequired: 1000 },
      { name: "3-Day Streak", description: "Study for 3 consecutive days", icon: "flame", pointsRequired: 50 },
      { name: "Week Warrior", description: "Study for 7 consecutive days", icon: "flame", pointsRequired: 150 },
      { name: "Marathon Runner", description: "Complete 50 study sessions", icon: "target", pointsRequired: 250 },
      { name: "Century Club", description: "Complete 100 study sessions", icon: "target", pointsRequired: 500 },
    ];

    defaultAchievements.forEach((ach) => {
      const id = randomUUID();
      this.achievements.set(id, {
        id,
        ...ach,
        earned: false,
        earnedAt: null,
      });
    });
  }

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }

  async getSubject(id: string): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const id = randomUUID();
    const subject: Subject = { ...insertSubject, id };
    this.subjects.set(id, subject);
    return subject;
  }

  async deleteSubject(id: string): Promise<void> {
    this.subjects.delete(id);
    // Also delete related topics
    const topicsToDelete = Array.from(this.topics.values())
      .filter((topic) => topic.subjectId === id)
      .map((topic) => topic.id);
    topicsToDelete.forEach((topicId) => this.topics.delete(topicId));
  }

  // Topics
  async getTopics(): Promise<Topic[]> {
    return Array.from(this.topics.values());
  }

  async getTopic(id: string): Promise<Topic | undefined> {
    return this.topics.get(id);
  }

  async createTopic(insertTopic: InsertTopic): Promise<Topic> {
    const id = randomUUID();
    const topic: Topic = {
      ...insertTopic,
      id,
      lastStudied: null,
      nextRevision: null,
    };
    this.topics.set(id, topic);
    return topic;
  }

  async updateTopic(id: string, updates: Partial<Topic>): Promise<Topic | undefined> {
    const topic = this.topics.get(id);
    if (!topic) return undefined;

    const updatedTopic = { ...topic, ...updates };
    this.topics.set(id, updatedTopic);
    return updatedTopic;
  }

  async deleteTopic(id: string): Promise<void> {
    this.topics.delete(id);
  }

  // Study Sessions
  async getStudySessions(): Promise<StudySession[]> {
    return Array.from(this.sessions.values());
  }

  async getRecentSessions(limit: number = 50): Promise<StudySession[]> {
    const sessions = Array.from(this.sessions.values());
    return sessions
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, limit);
  }

  async createStudySession(insertSession: InsertStudySession): Promise<StudySession> {
    const id = randomUUID();
    const session: StudySession = { ...insertSession, id };
    this.sessions.set(id, session);

    // Update user stats
    if (session.completed) {
      this.userStats.totalPoints += session.pointsEarned;
      this.userStats.totalStudyMinutes += session.duration;
      this.userStats.completedSessions += 1;

      // Update streak
      const now = new Date();
      const lastStudy = this.userStats.lastStudyDate ? new Date(this.userStats.lastStudyDate) : null;
      
      if (lastStudy) {
        const daysDiff = Math.floor((now.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          this.userStats.currentStreak += 1;
        } else if (daysDiff > 1) {
          this.userStats.currentStreak = 1;
        }
      } else {
        this.userStats.currentStreak = 1;
      }

      if (this.userStats.currentStreak > this.userStats.longestStreak) {
        this.userStats.longestStreak = this.userStats.currentStreak;
      }

      this.userStats.lastStudyDate = now;

      // Check and unlock achievements
      this.checkAchievements();
    }

    return session;
  }

  private checkAchievements() {
    Array.from(this.achievements.values()).forEach((achievement) => {
      if (!achievement.earned) {
        let shouldEarn = false;

        if (achievement.name === "First Steps" && this.userStats.completedSessions >= 1) {
          shouldEarn = true;
        } else if (achievement.pointsRequired > 0 && this.userStats.totalPoints >= achievement.pointsRequired) {
          shouldEarn = true;
        } else if (achievement.name === "3-Day Streak" && this.userStats.currentStreak >= 3) {
          shouldEarn = true;
        } else if (achievement.name === "Week Warrior" && this.userStats.currentStreak >= 7) {
          shouldEarn = true;
        } else if (achievement.name === "Marathon Runner" && this.userStats.completedSessions >= 50) {
          shouldEarn = true;
        } else if (achievement.name === "Century Club" && this.userStats.completedSessions >= 100) {
          shouldEarn = true;
        }

        if (shouldEarn) {
          this.achievements.set(achievement.id, {
            ...achievement,
            earned: true,
            earnedAt: new Date(),
          });
        }
      }
    });
  }

  // Exams
  async getExams(): Promise<Exam[]> {
    return Array.from(this.exams.values());
  }

  async createExam(insertExam: InsertExam): Promise<Exam> {
    const id = randomUUID();
    const exam: Exam = { ...insertExam, id, notified: false };
    this.exams.set(id, exam);
    return exam;
  }

  async deleteExam(id: string): Promise<void> {
    this.exams.delete(id);
  }

  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = randomUUID();
    const achievement: Achievement = {
      ...insertAchievement,
      id,
      earned: false,
      earnedAt: null,
    };
    this.achievements.set(id, achievement);
    return achievement;
  }

  async updateAchievement(id: string, updates: Partial<Achievement>): Promise<Achievement | undefined> {
    const achievement = this.achievements.get(id);
    if (!achievement) return undefined;

    const updated = { ...achievement, ...updates };
    this.achievements.set(id, updated);
    return updated;
  }

  // User Stats
  async getUserStats(): Promise<UserStats> {
    return this.userStats;
  }

  async updateUserStats(updates: Partial<UserStats>): Promise<UserStats> {
    this.userStats = { ...this.userStats, ...updates };
    return this.userStats;
  }

  // Schedule Entries
  async getScheduleEntries(): Promise<ScheduleEntry[]> {
    return Array.from(this.scheduleEntries.values());
  }

  async createScheduleEntry(insertEntry: InsertScheduleEntry): Promise<ScheduleEntry> {
    const id = randomUUID();
    const entry: ScheduleEntry = { ...insertEntry, id };
    this.scheduleEntries.set(id, entry);
    return entry;
  }

  async clearScheduleEntries(): Promise<void> {
    this.scheduleEntries.clear();
  }
}

export const storage = new MemStorage();
