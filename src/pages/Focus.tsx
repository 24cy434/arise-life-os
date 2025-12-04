import { useState, useEffect, useRef } from "react";
import { Target, Play, Pause, RotateCcw, Brain, Zap, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFocus, useTasks, useStats } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const modes = [
  { id: "deep", name: "Deep Work", duration: 50, icon: Brain, color: "text-primary" },
  { id: "pomodoro", name: "Pomodoro", duration: 25, icon: Target, color: "text-arise-energy" },
  { id: "sprint", name: "Sprint", duration: 15, icon: Zap, color: "text-arise-warning" },
  { id: "calm", name: "Calm", duration: 45, icon: Moon, color: "text-accent" },
];

const Focus = () => {
  const { todaySessions, startSession, completeSession } = useFocus();
  const { pendingTasks } = useTasks();
  const stats = useStats();
  const { toast } = useToast();
  const [selectedMode, setSelectedMode] = useState("pomodoro");
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [sessionStarted, setSessionStarted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentMode = modes.find((m) => m.id === selectedMode)!;

  useEffect(() => {
    if (isRunning && timeLeft > 0) { intervalRef.current = setInterval(() => setTimeLeft((prev) => prev - 1), 1000); }
    else if (timeLeft === 0 && isRunning) { handleComplete(); }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft]);

  const selectMode = (modeId: string) => {
    if (isRunning) return;
    const mode = modes.find((m) => m.id === modeId)!;
    setSelectedMode(modeId);
    setTotalTime(mode.duration * 60);
    setTimeLeft(mode.duration * 60);
  };

  const handleStart = () => {
    if (!sessionStarted) { startSession({ mode: selectedMode, duration: totalTime, completedDuration: 0, completed: false }); setSessionStarted(true); }
    setIsRunning(true);
    toast({ title: `${currentMode.name} started!` });
  };

  const handlePause = () => setIsRunning(false);
  const handleReset = () => { setIsRunning(false); setTimeLeft(totalTime); setSessionStarted(false); };

  const handleComplete = () => {
    setIsRunning(false);
    const mins = Math.floor((totalTime - timeLeft) / 60);
    toast({ title: `Session complete! +${mins * 5} XP`, description: `${mins} minutes focused` });
    setTimeLeft(totalTime);
    setSessionStarted(false);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><Target className="w-6 h-6 text-arise-energy" />Focus</h1><p className="text-muted-foreground text-sm">{todaySessions.length} sessions • {stats.todayFocusMinutes}m today</p></div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {modes.map((mode) => (
          <Card key={mode.id} className={cn("glass cursor-pointer hover:bg-secondary/50", selectedMode === mode.id && "ring-2 ring-primary", isRunning && "opacity-50 pointer-events-none")} onClick={() => selectMode(mode.id)}>
            <CardContent className="pt-3 pb-3 text-center"><mode.icon className={cn("w-5 h-5 mx-auto mb-1", mode.color)} /><p className="text-xs font-medium">{mode.name}</p><p className="text-xs text-muted-foreground">{mode.duration}m</p></CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass">
        <CardContent className="py-8">
          <div className="text-center"><div className={cn("text-7xl font-bold font-mono", isRunning && "animate-pulse-slow")}>{formatTime(timeLeft)}</div><p className="text-muted-foreground mt-2">{currentMode.name}</p></div>
          <div className="mt-6 px-4"><Progress value={progress} className="h-2" /><p className="text-center text-xs text-muted-foreground mt-2">{Math.round(progress)}% complete</p></div>
          <div className="flex justify-center gap-4 mt-6">
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={handleReset} disabled={!sessionStarted}><RotateCcw className="w-5 h-5" /></Button>
            {!isRunning ? <Button size="icon" className="h-16 w-16 rounded-full glow" onClick={handleStart}><Play className="w-6 h-6 ml-1" /></Button> : <Button size="icon" className="h-16 w-16 rounded-full bg-destructive hover:bg-destructive/90" onClick={handlePause}><Pause className="w-6 h-6" /></Button>}
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={handleComplete} disabled={!sessionStarted || timeLeft === totalTime}><Target className="w-5 h-5" /></Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="glass"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Today</p><p className="text-2xl font-bold">{stats.todayFocusMinutes}m</p></CardContent></Card>
        <Card className="glass"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Sessions</p><p className="text-2xl font-bold">{todaySessions.length}</p></CardContent></Card>
      </div>
    </div>
  );
};

export default Focus;
