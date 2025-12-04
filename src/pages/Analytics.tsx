import { BarChart3, CheckCircle2, Clock, Flame, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStats, useTasks, useJournal, useFocus, useMood } from "@/lib/store";
import { cn } from "@/lib/utils";

const Analytics = () => {
  const stats = useStats();
  const { tasks, completedTasks } = useTasks();
  const { entries } = useJournal();
  const { sessions } = useFocus();
  const { weekMoods } = useMood();

  const avgMood = weekMoods.length > 0 ? (weekMoods.reduce((a, m) => a + m.mood, 0) / weekMoods.length).toFixed(1) : "N/A";

  const last7Days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().split('T')[0]; });
  const weeklyTasks = last7Days.map(date => tasks.filter(t => t.completedAt?.startsWith(date)).length);
  const weeklyFocus = last7Days.map(date => sessions.filter(s => s.startedAt.startsWith(date)).reduce((a, s) => a + Math.floor(s.completedDuration / 60), 0));
  const maxTasks = Math.max(...weeklyTasks, 1);
  const maxFocus = Math.max(...weeklyFocus, 1);

  return (
    <div className="space-y-4 animate-fade-in">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="w-6 h-6 text-arise-success" />Analytics</h1></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{ label: "Tasks Done", value: completedTasks.length, icon: CheckCircle2, color: "text-arise-success" }, { label: "Focus Time", value: `${Math.floor(stats.totalFocusMinutes / 60)}h`, icon: Clock, color: "text-primary" }, { label: "Journal", value: entries.length, icon: BookOpen, color: "text-accent" }, { label: "Avg Mood", value: avgMood, icon: Flame, color: "text-arise-energy" }].map((stat) => (
          <Card key={stat.label} className="glass"><CardContent className="pt-4"><stat.icon className={cn("w-5 h-5", stat.color)} /><p className="text-2xl font-bold mt-2">{stat.value}</p><p className="text-xs text-muted-foreground">{stat.label}</p></CardContent></Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-base">Tasks (7 days)</CardTitle></CardHeader><CardContent><div className="flex items-end gap-2 h-24">{weeklyTasks.map((count, i) => (<div key={i} className="flex-1 flex flex-col items-center gap-1"><div className="w-full bg-primary rounded-t" style={{ height: `${(count / maxTasks) * 100}%`, minHeight: count > 0 ? '4px' : '0' }} /><span className="text-xs text-muted-foreground">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(last7Days[i]).getDay()]}</span></div>))}</div></CardContent></Card>
        <Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-base">Focus (7 days)</CardTitle></CardHeader><CardContent><div className="flex items-end gap-2 h-24">{weeklyFocus.map((mins, i) => (<div key={i} className="flex-1 flex flex-col items-center gap-1"><div className="w-full bg-accent rounded-t" style={{ height: `${(mins / maxFocus) * 100}%`, minHeight: mins > 0 ? '4px' : '0' }} /><span className="text-xs text-muted-foreground">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(last7Days[i]).getDay()]}</span></div>))}</div></CardContent></Card>
      </div>

      <Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-base">All-Time</CardTitle></CardHeader><CardContent><div className="grid grid-cols-3 gap-4 text-center"><div><p className="text-2xl font-bold">{stats.totalTasks}</p><p className="text-xs text-muted-foreground">Tasks</p></div><div><p className="text-2xl font-bold">{Math.floor(stats.totalFocusMinutes / 60)}h</p><p className="text-xs text-muted-foreground">Focus</p></div><div><p className="text-2xl font-bold">{stats.totalJournalEntries}</p><p className="text-xs text-muted-foreground">Entries</p></div></div></CardContent></Card>
    </div>
  );
};

export default Analytics;
