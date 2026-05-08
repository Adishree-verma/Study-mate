StudyFlow - Smart Study Management App
Overview
StudyFlow is a comprehensive study management application designed specifically for competitive exam preparation (JEE/NEET for Kota students). The application combines Pomodoro timer functionality, AI-powered study scheduling, subject management, topic tracking, and gamified rewards to help students optimize their study sessions and maintain motivation.

Core Features:

Pomodoro timer with customizable work/break durations
AI-generated study schedules using OpenAI GPT-5
Subject and topic management with priority tracking
Study session logging and analytics
Gamification system with points, achievements, and streaks
Exam countdown and smart notifications
Revision reminders based on spaced repetition
User Preferences
Preferred communication style: Simple, everyday language.

System Architecture
Frontend Architecture
Framework: React 18 with TypeScript

Routing: Wouter (lightweight client-side routing)
State Management: TanStack Query v5 for server state
Form Handling: React Hook Form with Zod validation
UI Components: Radix UI primitives with shadcn/ui component system
Design System:

Material Design 3 (Material You) principles
Tailwind CSS for styling with custom design tokens
Inter font family for typography
Custom color system supporting light/dark themes
Responsive grid layout (12-column for desktop, single-column for mobile)
Key UI Patterns:

Sidebar navigation with collapsible menu
Card-based layouts for data display
Modal dialogs for create/edit operations
Toast notifications for user feedback
Progressive disclosure for complex features
Backend Architecture
Runtime: Node.js with Express.js

API Pattern: RESTful endpoints under /api/* prefix
Request/Response: JSON-based communication
Validation: Zod schemas shared between client and server
Development: Vite dev server with HMR for fast iteration
Data Flow:

Client makes API requests through centralized apiRequest helper
Express routes validate input using Zod schemas
Storage layer abstracts database operations
Responses are cached by TanStack Query on client
Session Management:

Pomodoro sessions tracked with start/end times
Points calculated based on session duration (1 point per 5 minutes)
Study time aggregated for statistics and analytics
Data Storage
ORM: Drizzle ORM v0.39

Database: PostgreSQL (configured via DATABASE_URL environment variable)
Connection: Neon Database serverless driver for edge compatibility
Migrations: Schema-driven migrations in ./migrations directory
Database Schema:

subjects - Core subjects being studied

Fields: id, name, color (hex), targetHoursPerWeek
Used for categorizing study sessions and topics
topics - Individual topics within subjects

Fields: id, subjectId (FK), name, priority, completed, lastStudied, nextRevision
Supports spaced repetition with revision scheduling
studySessions - Pomodoro session records

Fields: id, subjectId (FK), topicId (FK), startTime, endTime, duration, completed, pointsEarned
Tracks all study activity for analytics
exams - Important exam dates

Fields: id, subjectId (FK), name, examDate, syllabus
Used for countdown displays and notifications
achievements - Gamification rewards

Fields: id, name, description, icon, pointsRequired, earned, earnedAt
Unlocked when user reaches point thresholds
userStats - Aggregated user metrics

Fields: totalPoints, currentStreak, longestStreak, totalStudyMinutes, completedSessions, lastStudyDate
Single-row table for overall progress tracking
scheduleEntries - AI-generated weekly schedule

Fields: id, dayOfWeek, startTime, endTime, subjectId (FK), activity
Stores output from OpenAI schedule generation
Data Transformation:

Date fields sent as ISO strings from client, transformed to Date objects in server
Numeric fields coerced from strings to prevent validation errors
Cascade deletes configured for referential integrity
External Dependencies
OpenAI Integration:

Model: GPT-5 (latest as of August 2025)
Purpose: Generate personalized weekly study schedules
Input: Subject list with target hours, exam date, daily study hours, preferences
Output: Structured markdown schedule with time blocks and subjects
API Key: Required via OPENAI_API_KEY environment variable
Third-Party UI Libraries:

Radix UI: Accessible, unstyled component primitives
Recharts: Data visualization for study analytics
date-fns: Date manipulation and formatting
embla-carousel-react: Carousel/slideshow functionality
cmdk: Command palette component
Development Tools:

Vite: Build tool and dev server
Replit Plugins: Cartographer (dependency mapping), dev banner, runtime error overlay
esbuild: Production server bundling
TypeScript: Type safety across full stack
Styling Dependencies:

Tailwind CSS: Utility-first CSS framework
tailwindcss-animate: Animation utilities
class-variance-authority: Component variant system
clsx/tailwind-merge: Class name merging utilities
Authentication & Session:

connect-pg-simple: PostgreSQL session store for Express
express-session implied for user sessions (configured in routes)
Notifications:

Browser notification APIs for exam reminders (24h and 1h before)
Custom hooks for revision reminders based on spaced repetition intervals
Toast notifications for in-app feedback
