import { Card, CardContent } from "@/components/ui/card";
import { DoodleIllustration } from "@/components/doodle-illustration";

const quotes = [
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Study hard what interests you the most in the most undisciplined, irreverent and original manner possible.", author: "Richard Feynman" },
  { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Anonymous" },
  { text: "Great things never come from comfort zones.", author: "Anonymous" },
  { text: "Dream it. Wish it. Do it.", author: "Anonymous" },
  { text: "Success doesn't just find you. You have to go out and get it.", author: "Anonymous" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Anonymous" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Anonymous" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Anonymous" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "Little things make big days.", author: "Anonymous" },
  { text: "It's going to be hard, but hard does not mean impossible.", author: "Anonymous" },
  { text: "Don't wait for opportunity. Create it.", author: "Anonymous" },
  { text: "Sometimes we're tested not to show our weaknesses, but to discover our strengths.", author: "Anonymous" },
  { text: "The key to success is to focus on goals, not obstacles.", author: "Anonymous" },
  { text: "Dream bigger. Do bigger.", author: "Anonymous" },
  { text: "You are capable of more than you know.", author: "E.O. Wilson" },
  { text: "Strive for progress, not perfection.", author: "Anonymous" },
  { text: "The difference between ordinary and extraordinary is that little extra.", author: "Jimmy Johnson" },
  { text: "Work hard in silence, let your success be your noise.", author: "Frank Ocean" },
  { text: "Concentration is the root of all the higher abilities in man.", author: "Bruce Lee" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "A little progress each day adds up to big results.", author: "Satya Nani" },
  { text: "Consistency is more important than perfection.", author: "Anonymous" },
  { text: "Either you run the day, or the day runs you.", author: "Jim Rohn" },
  { text: "You've got to get up every morning with determination if you're going to go to bed with satisfaction.", author: "George Lorimer" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
  { text: "With the right mindset, you can do anything.", author: "Anonymous" },
  { text: "Every expert was once a beginner. Every pro was once an amateur.", author: "Anonymous" },
  { text: "Diamonds are made under pressure. So are great students.", author: "Anonymous" },
  { text: "One day or day one — you decide.", author: "Anonymous" },
];

const categoryColors = [
  { bg: "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20", border: "border-blue-200 dark:border-blue-800/40", accent: "#3b82f6", secondary: "#a5b4fc" },
  { bg: "from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/20", border: "border-purple-200 dark:border-purple-800/40", accent: "#8b5cf6", secondary: "#c4b5fd" },
  { bg: "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20", border: "border-emerald-200 dark:border-emerald-800/40", accent: "#10b981", secondary: "#6ee7b7" },
  { bg: "from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20", border: "border-amber-200 dark:border-amber-800/40", accent: "#f59e0b", secondary: "#fcd34d" },
  { bg: "from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/20", border: "border-rose-200 dark:border-rose-800/40", accent: "#f43f5e", secondary: "#fda4af" },
];

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

export function DailyQuote() {
  const dayIndex = getDayOfYear();
  const quote = quotes[dayIndex % quotes.length];
  const colorScheme = categoryColors[dayIndex % categoryColors.length];

  return (
    <Card className={`border bg-gradient-to-br ${colorScheme.bg} ${colorScheme.border} overflow-hidden`}>
      <CardContent className="p-0">
        <div className="flex items-center gap-0">
          {/* Doodle section */}
          <div className="hidden sm:flex shrink-0 items-center justify-center p-4 pl-6">
            <DoodleIllustration
              type="stars"
              className="w-28 h-24"
              primaryColor={colorScheme.accent}
              secondaryColor={colorScheme.secondary}
            />
          </div>

          {/* Quote content */}
          <div className="flex-1 p-5 sm:pl-2">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="h-1 w-6 rounded-full"
                style={{ backgroundColor: colorScheme.accent }}
              />
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: colorScheme.accent }}
              >
                Quote of the Day
              </span>
            </div>
            <blockquote className="text-base font-medium leading-relaxed text-foreground mb-2">
              "{quote.text}"
            </blockquote>
            <p className="text-sm text-muted-foreground font-medium">
              — {quote.author}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
