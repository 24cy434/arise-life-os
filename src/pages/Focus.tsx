import { useState, useEffect, useRef } from "react";
import {
  Target,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Settings,
  Brain,
  Zap,
  Coffee,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import FocusModeSelector from "@/components/focus/FocusModeSelector";
import FocusStats from "@/components/focus/FocusStats";
import AmbientSounds from "@/components/focus/AmbientSounds";
import { cn } from "@/lib/utils";

const Focus = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [selectedMode, setSelectedMode] = useState("deep");
  const [sessionsCompleted, setSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const modes = [
    {
      id: "deep",
      name: "Deep Work",
      duration: 50,
      icon: Brain,
      color: "text-primary",
      description: "Maximum focus for complex tasks",
    },
    {
      id: "pomodoro",
      name: "Pomodoro",
      duration: 25,
      icon: Target,
      color: "text-arise-energy",
      description: "Classic 25-min focus blocks",
    },
    {
      id: "sprint",
      name: "Sprint",
      duration: 15,
      icon: Zap,
      color: "text-arise-warning",
      description: "Quick burst of productivity",
    },
    {
      id: "calm",
      name: "Calm Focus",
      duration: 45,
      icon: Moon,
      color: "text-accent",
      description: "Gentle, sustained attention",
    },
  ];

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      setSessions((prev) => prev + 1);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(totalTime);
  };

  const selectMode = (modeId: string) => {
    const mode = modes.find((m) => m.id === modeId);
    if (mode) {
      setSelectedMode(modeId);
      setTotalTime(mode.duration * 60);
      setTimeLeft(mode.duration * 60);
      setIsRunning(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const currentMode = modes.find((m) => m.id === selectedMode);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="w-8 h-8 text-arise-energy" />
            Focus Mode
          </h1>
          <p className="text-muted-foreground mt-1">
            Deep work sessions for maximum productivity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Sessions today: <span className="font-bold">{sessionsCompleted}</span>
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Timer */}
        <div className="md:col-span-2 space-y-6">
          {/* Timer Card */}
          <Card className="glass overflow-hidden">
            <div
              className={cn(
                "absolute inset-0 opacity-5",
                selectedMode === "deep" && "gradient-primary",
                selectedMode === "pomodoro" && "bg-arise-energy",
                selectedMode === "sprint" && "bg-arise-warning",
                selectedMode === "calm" && "gradient-accent"
              )}
            />
            <CardContent className="pt-8 pb-8">
              {/* Mode indicator */}
              <div className="text-center mb-6">
                <span
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-sm font-medium",
                    currentMode?.color
                  )}
                >
                  {currentMode && <currentMode.icon className="w-4 h-4" />}
                  {currentMode?.name}
                </span>
              </div>

              {/* Timer Display */}
              <div className="text-center">
                <div
                  className={cn(
                    "text-8xl md:text-9xl font-bold font-mono tracking-tight",
                    isRunning && "animate-pulse-slow"
                  )}
                >
                  {formatTime(timeLeft)}
                </div>
                <p className="text-muted-foreground mt-2">
                  {currentMode?.description}
                </p>
              </div>

              {/* Progress */}
              <div className="mt-8 px-8">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Started</span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 rounded-full"
                  onClick={resetTimer}
                >
                  <RotateCcw className="w-6 h-6" />
                </Button>
                <Button
                  size="icon"
                  className={cn(
                    "h-20 w-20 rounded-full transition-all",
                    isRunning ? "bg-destructive hover:bg-destructive/90" : "glow"
                  )}
                  onClick={toggleTimer}
                >
                  {isRunning ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8 ml-1" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 rounded-full"
                >
                  <Settings className="w-6 h-6" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mode Selector */}
          <FocusModeSelector
            modes={modes}
            selectedMode={selectedMode}
            onSelectMode={selectMode}
          />

          {/* Ambient Sounds */}
          <AmbientSounds />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Focus Stats */}
          <FocusStats sessionsCompleted={sessionsCompleted} />

          {/* Current Task */}
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Current Task</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-secondary/50 border-l-4 border-primary">
                <p className="font-medium">Complete project documentation</p>
                <p className="text-xs text-muted-foreground mt-1">
                  High priority • Due today
                </p>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3">
                Change Task
              </Button>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="glass border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Focus Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 rounded-lg bg-primary/10">
                <p>Your best focus time is 10 AM - 12 PM</p>
              </div>
              <div className="p-3 rounded-lg bg-accent/10">
                <p>Take a 5-min break after this session</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Focus;
