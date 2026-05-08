import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type TimerMode = "work" | "break";

interface PomodoroTimerProps {
  workDuration?: number;
  breakDuration?: number;
  onSessionComplete?: (duration: number, mode: TimerMode) => void;
}

export function PomodoroTimer({
  workDuration = 25,
  breakDuration = 5,
  onSessionComplete,
}: PomodoroTimerProps) {
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalTime = mode === "work" ? workDuration * 60 : breakDuration * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const isWork = mode === "work";
  const ringColor = isWork ? "#f97316" : "#10b981";
  const ringTrackColor = isWork ? "rgba(249,115,22,0.15)" : "rgba(16,185,129,0.15)";
  const glowColor = isWork ? "rgba(249,115,22,0.25)" : "rgba(16,185,129,0.25)";

  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  useEffect(() => {
    setTimeLeft(mode === "work" ? workDuration * 60 : breakDuration * 60);
  }, [workDuration, breakDuration]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    try {
      const beep = new AudioContext();
      const oscillator = beep.createOscillator();
      const gainNode = beep.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(beep.destination);
      oscillator.frequency.value = isWork ? 880 : 660;
      gainNode.gain.value = 0.3;
      oscillator.start();
      oscillator.stop(beep.currentTime + 0.3);
    } catch (e) {}

    if (mode === "work") {
      setCompletedSessions((prev) => prev + 1);
      onSessionComplete?.(workDuration, "work");
      setMode("break");
      setTimeLeft(breakDuration * 60);
    } else {
      onSessionComplete?.(breakDuration, "break");
      setMode("work");
      setTimeLeft(workDuration * 60);
    }
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === "work" ? workDuration * 60 : breakDuration * 60);
  };

  const switchMode = () => {
    setIsRunning(false);
    const newMode = mode === "work" ? "break" : "work";
    setMode(newMode);
    setTimeLeft(newMode === "work" ? workDuration * 60 : breakDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const cardBg = isWork
    ? "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 border-orange-200 dark:border-orange-800/40"
    : "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800/40";

  return (
    <Card className={`w-full ${cardBg} transition-colors duration-500`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          {isWork ? (
            <Brain className="h-5 w-5 text-orange-500" />
          ) : (
            <Coffee className="h-5 w-5 text-emerald-500" />
          )}
          {isWork ? "Focus Session" : "Break Time"}
        </CardTitle>
        <Badge
          variant="secondary"
          className={isWork ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"}
          data-testid="badge-sessions-completed"
        >
          {completedSessions} sessions today
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-6">
          {/* Circular Progress */}
          <div className="relative flex h-64 w-64 items-center justify-center">
            {isRunning && (
              <div
                className="absolute inset-0 rounded-full animate-pulse"
                style={{ boxShadow: `0 0 40px 10px ${glowColor}` }}
              />
            )}
            <svg className="absolute h-full w-full -rotate-90">
              <circle
                cx="128"
                cy="128"
                r={radius}
                stroke={ringTrackColor}
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="128"
                cy="128"
                r={radius}
                stroke={ringColor}
                strokeWidth="10"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.5s ease" }}
              />
            </svg>
            <div className="flex flex-col items-center gap-2 z-10">
              <div
                className="text-6xl font-bold tabular-nums"
                style={{ color: ringColor }}
                data-testid="text-timer-display"
              >
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                {isWork ? "Stay focused" : "Relax & recharge"}
              </div>
              <div className="text-xs text-muted-foreground">
                {Math.round(progress)}% complete
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={toggleTimer}
              data-testid="button-timer-toggle"
              className={`min-w-32 ${isWork ? "bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700" : "bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700"} text-white`}
            >
              {isRunning ? (
                <>
                  <Pause className="mr-2 h-5 w-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Start
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={resetTimer}
              data-testid="button-timer-reset"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Reset
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={switchMode}
              data-testid="button-timer-switch"
            >
              {isWork ? (
                <>
                  <Coffee className="mr-2 h-5 w-5" />
                  Take Break
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-5 w-5" />
                  Focus Mode
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
