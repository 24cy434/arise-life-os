import { useState, useEffect, useRef } from "react";
import { Target, Play, Pause, RotateCcw, Brain, Zap, Moon, Coffee, Volume2, VolumeX, ListTodo, Clock, Flame, Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFocus, useTasks, useStats } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const modes = [
  { id: "deep", name: "Deep Work", duration: 50, icon: Brain, color: "text-primary", description: "Maximum focus for complex tasks" },
  { id: "pomodoro", name: "Pomodoro", duration: 25, icon: Target, color: "text-arise-energy", description: "Classic 25-min focus blocks" },
  { id: "sprint", name: "Sprint", duration: 15, icon: Zap, color: "text-arise-warning", description: "Quick burst of productivity" },
  { id: "calm", name: "Calm", duration: 45, icon: Moon, color: "text-accent", description: "Gentle, sustained attention" },
  { id: "coffee", name: "Break", duration: 5, icon: Coffee, color: "text-arise-success", description: "Short refreshing break" },
];

const Focus = () => {
  const { sessions, todaySessions, startSession, completeSession } = useFocus();
  const { pendingTasks, tasks } = useTasks();
  const stats = useStats();
  const { toast } = useToast();
  const [selectedMode, setSelectedMode] = useState("pomodoro");
  const [selectedTaskId, setSelectedTaskId] = useState<string>("none");
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [interruptions, setInterruptions] = useState(0);
  const [ambientSound, setAmbientSound] = useState<string | null>(null);
  const [volume, setVolume] = useState([50]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentMode = modes.find((m) => m.id === selectedMode)!;
  const selectedTask = selectedTaskId !== "none" ? tasks.find(t => t.id === selectedTaskId) : null;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleComplete();
    }
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
    if (!currentSessionId) {
      const sessionId = crypto.randomUUID();
      startSession({ 
        mode: selectedMode, 
        duration: totalTime, 
        completedDuration: 0, 
        completed: false,
        taskId: selectedTaskId !== "none" ? selectedTaskId : undefined,
        taskTitle: selectedTask?.title,
        interruptions: 0,
      });
      setCurrentSessionId(sessionId);
    }
    setIsRunning(true);
    toast({ title: `${currentMode.name} started!`, description: selectedTask ? `Working on: ${selectedTask.title}` : undefined });
  };

  const handlePause = () => {
    setIsRunning(false);
    setInterruptions(prev => prev + 1);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(totalTime);
    setCurrentSessionId(null);
    setInterruptions(0);
  };

  const handleComplete = () => {
    setIsRunning(false);
    const completedDuration = totalTime - timeLeft;
    const mins = Math.floor(completedDuration / 60);
    const xpGained = mins * 5;
    
    if (currentSessionId) {
      const session = sessions.find(s => s.id === currentSessionId);
      if (session) {
        completeSession({ ...session, completedDuration, interruptions });
      }
    }
    
    toast({ title: `Session complete! +${xpGained} XP`, description: `${mins} minutes of focused work` });
    setTimeLeft(totalTime);
    setCurrentSessionId(null);
    setInterruptions(0);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const totalFocusToday = todaySessions.reduce((acc, s) => acc + Math.floor(s.completedDuration / 60), 0);
  const avgSessionLength = todaySessions.length > 0 ? Math.round(totalFocusToday / todaySessions.length) : 0;
  const completedSessions = todaySessions.filter(s => s.completed).length;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Target className="w-6 h-6 text-arise-energy" />Focus</h1>
          <p className="text-muted-foreground text-sm">{todaySessions.length} sessions • {totalFocusToday}m today</p>
        </div>
      </div>

      <Tabs defaultValue="timer" className="w-full">
        <TabsList className="glass">
          <TabsTrigger value="timer">Timer</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="timer" className="space-y-4 mt-4">
          {/* Mode Selection */}
          <div className="grid grid-cols-5 gap-2">
            {modes.map((mode) => (
              <Card key={mode.id} className={cn("glass cursor-pointer hover:bg-secondary/50 transition-all", selectedMode === mode.id && "ring-2 ring-primary", isRunning && "opacity-50 pointer-events-none")} onClick={() => selectMode(mode.id)}>
                <CardContent className="pt-3 pb-3 text-center">
                  <mode.icon className={cn("w-5 h-5 mx-auto mb-1", mode.color)} />
                  <p className="text-xs font-medium">{mode.name}</p>
                  <p className="text-xs text-muted-foreground">{mode.duration}m</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Task Selection */}
          <Card className="glass">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <ListTodo className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Focus on task (optional)</span>
              </div>
              <Select value={selectedTaskId} onValueChange={setSelectedTaskId} disabled={isRunning}>
                <SelectTrigger><SelectValue placeholder="Select a task to focus on" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific task</SelectItem>
                  {pendingTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      <span className="flex items-center gap-2">
                        <span className={cn("w-2 h-2 rounded-full", task.priority === 'high' ? "bg-destructive" : task.priority === 'medium' ? "bg-arise-warning" : "bg-arise-success")} />
                        {task.title}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Timer */}
          <Card className="glass">
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">{currentMode.description}</p>
                <div className={cn("text-7xl font-bold font-mono", isRunning && "animate-pulse-slow")}>{formatTime(timeLeft)}</div>
                {selectedTask && <p className="text-sm text-primary mt-2">Working on: {selectedTask.title}</p>}
              </div>
              <div className="mt-6 px-4">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>{interruptions > 0 && `${interruptions} interruption${interruptions > 1 ? 's' : ''}`}</span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
              </div>
              <div className="flex justify-center gap-4 mt-6">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={handleReset} disabled={!currentSessionId && timeLeft === totalTime}><RotateCcw className="w-5 h-5" /></Button>
                {!isRunning ? (
                  <Button size="icon" className="h-16 w-16 rounded-full glow" onClick={handleStart}><Play className="w-6 h-6 ml-1" /></Button>
                ) : (
                  <Button size="icon" className="h-16 w-16 rounded-full bg-destructive hover:bg-destructive/90" onClick={handlePause}><Pause className="w-6 h-6" /></Button>
                )}
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={handleComplete} disabled={!currentSessionId || timeLeft === totalTime}><CheckCircle className="w-5 h-5" /></Button>
              </div>
            </CardContent>
          </Card>

          {/* Ambient Sounds */}
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Ambient Sounds</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setAmbientSound(null)}>
                  {ambientSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                {["rain", "forest", "cafe", "waves"].map((sound) => (
                  <Button key={sound} variant={ambientSound === sound ? "default" : "outline"} size="sm" className="flex-1 capitalize" onClick={() => setAmbientSound(ambientSound === sound ? null : sound)}>
                    {sound}
                  </Button>
                ))}
              </div>
              {ambientSound && (
                <div className="flex items-center gap-3">
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                  <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="flex-1" />
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="glass"><CardContent className="pt-4"><Clock className="w-5 h-5 text-primary mb-2" /><p className="text-2xl font-bold">{totalFocusToday}m</p><p className="text-xs text-muted-foreground">Today</p></CardContent></Card>
            <Card className="glass"><CardContent className="pt-4"><Target className="w-5 h-5 text-accent mb-2" /><p className="text-2xl font-bold">{completedSessions}</p><p className="text-xs text-muted-foreground">Sessions</p></CardContent></Card>
            <Card className="glass"><CardContent className="pt-4"><Flame className="w-5 h-5 text-arise-energy mb-2" /><p className="text-2xl font-bold">{stats.currentFocusStreak}</p><p className="text-xs text-muted-foreground">Day Streak</p></CardContent></Card>
            <Card className="glass"><CardContent className="pt-4"><Star className="w-5 h-5 text-arise-warning mb-2" /><p className="text-2xl font-bold">{avgSessionLength}m</p><p className="text-xs text-muted-foreground">Avg Session</p></CardContent></Card>
          </div>

          <Card className="glass">
            <CardHeader className="pb-2"><CardTitle className="text-base">Focus by Mode</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {modes.slice(0, 4).map((mode) => {
                  const modeSessions = sessions.filter(s => s.mode === mode.id);
                  const modeMinutes = modeSessions.reduce((acc, s) => acc + Math.floor(s.completedDuration / 60), 0);
                  const percentage = stats.totalFocusMinutes > 0 ? Math.round((modeMinutes / stats.totalFocusMinutes) * 100) : 0;
                  return (
                    <div key={mode.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center gap-2"><mode.icon className={cn("w-4 h-4", mode.color)} />{mode.name}</span>
                        <span className="text-muted-foreground">{modeMinutes}m ({percentage}%)</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2"><CardTitle className="text-base">All-Time Stats</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><p className="text-2xl font-bold">{Math.floor(stats.totalFocusMinutes / 60)}h</p><p className="text-xs text-muted-foreground">Total Focus</p></div>
                <div><p className="text-2xl font-bold">{sessions.length}</p><p className="text-xs text-muted-foreground">Sessions</p></div>
                <div><p className="text-2xl font-bold">{sessions.length > 0 ? Math.round(stats.totalFocusMinutes / sessions.length) : 0}m</p><p className="text-xs text-muted-foreground">Avg Length</p></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-3 mt-4">
          {sessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No focus sessions yet. Start one!</p>
          ) : (
            sessions.slice(0, 20).map((session) => {
              const mode = modes.find(m => m.id === session.mode) || modes[0];
              const mins = Math.floor(session.completedDuration / 60);
              return (
                <Card key={session.id} className="glass">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", session.completed ? "bg-arise-success/20" : "bg-secondary")}>
                          <mode.icon className={cn("w-5 h-5", mode.color)} />
                        </div>
                        <div>
                          <p className="font-medium">{mode.name}</p>
                          {session.taskTitle && <p className="text-xs text-muted-foreground">{session.taskTitle}</p>}
                          <p className="text-xs text-muted-foreground">{new Date(session.startedAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{mins}m</p>
                        <p className="text-xs text-muted-foreground">{session.completed ? "Completed" : "Incomplete"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Focus;
