import { User, Moon, Sun, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "@/components/ThemeProvider";
import { useStats, useApp } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { theme, setTheme } = useTheme();
  const stats = useStats();
  const { state } = useApp();
  const { toast } = useToast();

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'arise-data.json'; a.click();
    toast({ title: "Data exported!" });
  };

  const handleClear = () => { if (confirm("Delete all data?")) { localStorage.removeItem('arise-data'); window.location.reload(); } };

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold flex items-center gap-2"><User className="w-6 h-6 text-primary" />Profile</h1>

      <Card className="glass"><CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">{state.userName.charAt(0)}</div>
          <div><h2 className="text-xl font-bold">{state.userName}</h2><div className="flex gap-2 mt-1"><span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">Lvl {stats.level}</span><span className="px-2 py-0.5 rounded-full bg-arise-energy/20 text-arise-energy text-xs">{stats.xp} XP</span></div></div>
        </div>
        <div className="mt-4"><div className="flex justify-between text-sm mb-1"><span>Progress</span><span>{stats.xp % 100}/100</span></div><Progress value={stats.xp % 100} className="h-2" /></div>
      </CardContent></Card>

      <Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-base">Stats</CardTitle></CardHeader><CardContent><div className="grid grid-cols-2 gap-4"><div><p className="text-2xl font-bold">{stats.totalTasks}</p><p className="text-xs text-muted-foreground">Tasks</p></div><div><p className="text-2xl font-bold">{stats.completedTasks}</p><p className="text-xs text-muted-foreground">Completed</p></div><div><p className="text-2xl font-bold">{Math.floor(stats.totalFocusMinutes / 60)}h</p><p className="text-xs text-muted-foreground">Focus</p></div><div><p className="text-2xl font-bold">{stats.totalJournalEntries}</p><p className="text-xs text-muted-foreground">Journal</p></div></div></CardContent></Card>

      <Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-base">Theme</CardTitle></CardHeader><CardContent><div className="flex gap-2"><Button variant={theme === "light" ? "default" : "outline"} size="sm" onClick={() => setTheme("light")}><Sun className="w-4 h-4 mr-1" />Light</Button><Button variant={theme === "dark" ? "default" : "outline"} size="sm" onClick={() => setTheme("dark")}><Moon className="w-4 h-4 mr-1" />Dark</Button></div></CardContent></Card>

      <Card className="glass"><CardHeader className="pb-2"><CardTitle className="text-base">Data</CardTitle></CardHeader><CardContent className="space-y-3">
        <div className="flex items-center justify-between"><span className="text-sm">Export</span><Button variant="outline" size="sm" onClick={handleExport}><Download className="w-4 h-4 mr-2" />Export</Button></div>
        <div className="flex items-center justify-between"><span className="text-sm text-destructive">Clear All</span><Button variant="destructive" size="sm" onClick={handleClear}><Trash2 className="w-4 h-4 mr-2" />Clear</Button></div>
      </CardContent></Card>
    </div>
  );
};

export default Profile;
