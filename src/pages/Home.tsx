import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Target, BookOpen, TrendingUp, Flame, Clock, CheckCircle2, Brain, Repeat, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTasks, useStats, useMood, useHabits, useFocus, useJournal, useCalendar } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const moodEmojis = ["", "😔", "😐", "🙂", "😊", "🤩"];

const Home = () => {
  const { todayTasks, pendingTasks, toggleTask, tasks } = useTasks();
  const stats = useStats();
  const { todayMood, logMood, weekMoods } = useMood();
  const { habits, completeHabit, isCompletedToday } = useHabits();
  const { todaySessions } = useFocus();
  const { entries } = useJournal();
  const { getEventsForDate } = useCalendar();
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState(todayMood?.mood || 3);

  const today = new Date().toISOString().split('T')[0];
  const todayEvents = getEventsForDate(today);
  const todayHabitsTotal = habits.filter(h => h.frequency === 'daily').length;
  const todayHabitsCompleted = habits.filter(h => h.frequency === 'daily' && isCompletedToday(h.id)).length;

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  })();

  const handleMoodLog = (mood: number) => {
    setSelectedMood(mood);
    logMood(mood);
    toast({ title: `Mood logged: ${moodEmojis[mood]}` });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{greeting}, <span className="gradient-text">{stats.level > 1 ? `Level ${stats.level}` : 'Achiever'}</span></h1>
          <p className="text-muted-foreground text-sm">{pendingTasks.length} tasks pending • {stats.todayFocusMinutes}m focused today</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Plus, label: "Task", href: "/tasks", color: "bg-primary/10 text-primary" },
          { icon: BookOpen, label: "Journal", href: "/journal", color: "bg-accent/10 text-accent" },
          { icon: Target, label: "Focus", href: "/focus", color: "bg-arise-energy/10 text-arise-energy" },
          { icon: Repeat, label: "Habits", href: "/habits", color: "bg-arise-success/10 text-arise-success" },
        ].map((item) => (
          <Link key={item.label} to={item.href} className={cn("glass rounded-lg p-3 flex flex-col items-center gap-1 hover:scale-105 transition-transform", item.color)}>
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Productivity Score */}
      <Card className="glass overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5" />
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Today's Productivity</span>
            <span className="text-2xl font-bold gradient-text">{stats.productivity}%</span>
          </div>
          <Progress value={stats.productivity} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Tasks: {stats.todayTasksCompleted}</span>
            <span>Focus: {stats.todayFocusMinutes}m</span>
            <span>Habits: {todayHabitsCompleted}/{todayHabitsTotal}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Today's Tasks */}
        <Card className="glass">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-arise-success" />Today's Tasks</CardTitle>
            <Link to="/tasks"><Button variant="ghost" size="sm">View all <ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No tasks for today</p>
            ) : (
              todayTasks.slice(0, 4).map((task) => (
                <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                  <button onClick={() => { toggleTask(task.id); toast({ title: task.completed ? "Task uncompleted" : "Task completed! +10 XP" }); }} className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0", task.completed ? "bg-arise-success border-arise-success" : "border-muted-foreground")}>
                    {task.completed && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                  </button>
                  <span className={cn("text-sm flex-1", task.completed && "line-through text-muted-foreground")}>{task.title}</span>
                  <span className={cn("text-xs px-1.5 py-0.5 rounded", task.priority === 'high' ? "bg-destructive/20 text-destructive" : task.priority === 'medium' ? "bg-arise-warning/20 text-arise-warning" : "bg-arise-success/20 text-arise-success")}>{task.priority[0].toUpperCase()}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Mood Tracker */}
        <Card className="glass">
          <CardHeader className="pb-2"><CardTitle className="text-base">How are you feeling?</CardTitle></CardHeader>
          <CardContent>
            <div className="flex justify-between mb-4">
              {[1, 2, 3, 4, 5].map((m) => (
                <button key={m} onClick={() => handleMoodLog(m)} className={cn("p-2 rounded-lg text-2xl transition-all hover:scale-110", (todayMood?.mood === m || selectedMood === m) && "bg-primary/20 ring-2 ring-primary")}>
                  {moodEmojis[m]}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-1 h-12">
              {weekMoods.slice(0, 7).reverse().map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-primary/60 rounded-t" style={{ height: `${m.mood * 20}%` }} />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Habits */}
        <Card className="glass">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Repeat className="w-4 h-4 text-accent" />Habits</CardTitle>
            <Link to="/habits"><Button variant="ghost" size="sm"><ArrowRight className="w-4 h-4" /></Button></Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {habits.filter(h => h.frequency === 'daily').slice(0, 3).map((habit) => {
              const done = isCompletedToday(habit.id);
              return (
                <div key={habit.id} className="flex items-center gap-2">
                  <button onClick={() => { if (!done) { completeHabit(habit.id); toast({ title: "Habit completed! +5 XP" }); } }} className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0", done ? "bg-arise-success" : habit.color + " opacity-40")}>
                    <CheckCircle2 className={cn("w-4 h-4", done ? "text-primary-foreground" : "text-primary-foreground")} />
                  </button>
                  <span className={cn("text-sm flex-1", done && "line-through text-muted-foreground")}>{habit.title}</span>
                  {habit.streak > 0 && <span className="text-xs text-arise-energy flex items-center"><Flame className="w-3 h-3" />{habit.streak}</span>}
                </div>
              );
            })}
            {habits.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">No habits yet</p>}
          </CardContent>
        </Card>

        {/* Streaks */}
        <Card className="glass">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Flame className="w-4 h-4 text-arise-energy" />Streaks</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-sm">Tasks</span><span className="font-bold text-arise-energy">{stats.currentTaskStreak} days</span></div>
            <div className="flex items-center justify-between"><span className="text-sm">Focus</span><span className="font-bold text-primary">{stats.currentFocusStreak} days</span></div>
            <div className="flex items-center justify-between"><span className="text-sm">Journal</span><span className="font-bold text-accent">{stats.currentJournalStreak} days</span></div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="glass">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4 text-arise-success" />Stats</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-sm">Level</span><span className="font-bold">{stats.level}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm">XP</span><span className="font-bold">{stats.xp}</span></div>
            <div><Progress value={stats.xp % 100} className="h-1.5" /><p className="text-xs text-muted-foreground mt-1">{100 - (stats.xp % 100)} XP to next level</p></div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="glass border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Brain className="w-4 h-4 text-primary" />AI Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="p-3 rounded-lg bg-primary/10 text-sm">
            <p>💡 {stats.productivity < 50 ? "Start with a quick focus session to build momentum!" : stats.productivity < 80 ? "Great progress! Complete one more task to hit 80% productivity." : "Excellent work today! Consider journaling to reflect on your achievements."}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50 text-sm">
            <p>📊 {pendingTasks.length > 5 ? `You have ${pendingTasks.length} pending tasks. Try tackling high-priority ones first.` : todayHabitsCompleted < todayHabitsTotal ? "Don't forget to complete your daily habits!" : "You're on track! Keep the momentum going."}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
