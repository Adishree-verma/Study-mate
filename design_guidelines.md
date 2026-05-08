# Design Guidelines: Kota Student Study Management App

## Design Approach

**Selected System**: Material Design 3 (Material You)
**Rationale**: Information-dense productivity application requiring clear visual feedback, structured data display, and frequent user interactions. Material Design excels at organizing complex information while maintaining clarity.

**Key Principles**:
- Function over decoration - zero distracting elements
- Clear visual hierarchy for quick scanning
- Immediate feedback for all interactions
- Data-first presentation with minimal chrome

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16** for consistent rhythm
- Tight spacing (2-4): Within components, form fields
- Medium spacing (6-8): Between related elements, card padding
- Large spacing (12-16): Section separation, page margins

**Grid Structure**:
- Dashboard: 12-column responsive grid
- Main content area: 8 columns, sidebar: 4 columns
- Mobile: Single column stack with persistent bottom nav

---

## Typography

**Font Family**: Inter (via Google Fonts) - optimized for screen readability
- Headlines: 600 weight, 24-32px
- Subheadings: 500 weight, 18-20px
- Body text: 400 weight, 14-16px
- UI labels: 500 weight, 12-14px, uppercase with letter-spacing

**Hierarchy**:
- Timer display: 700 weight, 48-64px (most prominent)
- Subject headings: 600 weight, 20px
- Data labels: 500 weight, 14px
- Timestamps/metadata: 400 weight, 12px, reduced opacity

---

## Core Components

### Dashboard Layout
- **Left Sidebar** (280px): Navigation, subject list, quick stats
- **Main Panel**: Active timer/current task + data widgets
- **Right Panel** (320px, collapsible): Upcoming deadlines, backlog queue

### Pomodoro Timer Component
- Circular progress indicator (200px diameter)
- Large time display at center
- Play/pause/skip controls below
- Session counter and streak indicator
- Work/break mode toggle

### Smart Popups System
- **Time Left Alerts**: Toast-style, top-right corner, 4-second auto-dismiss
- **Backlog Reminders**: Modal center-screen, requires acknowledgment
- **Revision Prompts**: Slide-in from right, quick action buttons

### Reward System Display
- Points counter in header (always visible)
- Achievement badges grid
- Progress bars for daily/weekly goals
- Level indicator with XP progression

### Subject & Topic Cards
- Compact card layout (grid-cols-2 lg:grid-cols-3)
- Progress bars for completion percentage
- Last studied timestamp
- Priority indicators (high/medium/low chips)

### AI Schedule Generator
- Input form: Subjects, exam dates, daily study hours
- Generated schedule displayed as timeline/calendar view
- Drag-to-adjust interface for manual tweaks
- Save/export options

---

## Component Specifications

**Buttons**:
- Primary: Filled, high emphasis for main actions
- Secondary: Outlined for alternative actions  
- Icon buttons: 40x40px touch targets

**Cards**:
- Elevated surface with subtle shadow
- 12px border radius
- 16px padding for content

**Forms**:
- Outlined text fields with floating labels
- Consistent 56px height for inputs
- Helper text below fields
- Clear validation states

**Data Visualization**:
- Linear progress bars for completion tracking
- Circular progress for timer and goals
- Simple bar charts for study hours comparison
- Minimal gridlines, clear labels

---

## Navigation

**Desktop**: Persistent left sidebar with icon + label format
**Mobile**: Bottom navigation bar (5 items max) with icons
**Menu Items**: Dashboard, Timer, Schedule, Subjects, Rewards

---

## Interaction Patterns

**Animations**: Minimal and purposeful only
- Timer countdown: Smooth numerical transitions
- Card state changes: 200ms ease transitions
- Modal appearance: 300ms slide/fade
- NO decorative animations

**Notifications**:
- System-level for critical alerts (exam in 1 hour)
- In-app toasts for confirmations
- Badge counts on navigation items

---

## Accessibility

- Minimum touch targets: 44x44px
- Focus indicators on all interactive elements
- ARIA labels for icon-only buttons
- Keyboard navigation throughout
- High contrast ratios (WCAG AAA where possible)

---

## Images

**No hero images required** - this is a productivity web app, not a marketing site.

**Icon Usage**: Material Icons via CDN for all UI icons (timer, schedule, trophy, etc.)

**Illustrations**: Use placeholder comments for achievement badges: `<!-- ACHIEVEMENT ICON: "7-Day Streak" trophy -->`