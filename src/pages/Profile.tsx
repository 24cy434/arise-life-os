import { useState } from "react";
import { User, Moon, Sun, Trash2, Download, Upload, Shield, Bell, Target, Brain, Trophy, Zap, Star, Edit2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { useTheme } from "@/components/ThemeProvider";
import { useStats, useApp, useAI, useAchievements, useTasks, useFocus, useJournal, useHabits } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { theme, setTheme } = useTheme();
  const stats = useStats();
  const { state } = useApp();
  const { profile, updateProfile } = useAI();
  const { achievements } = useAchievements();
  const { tasks, completedTasks } = useTasks();
  const { sessions } = useFocus();
  const { entries } = useJournal();
  const { habits } = useHabits();
  const { toast } = useToast();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(state.userName);
  const [notifications, setNotifications] = useState({ tasks: true, focus: true, habits: true, insights: true });
  const [focusSettings, setFocusSettings] = useState({ defaultDuration: 25, breakDuration: 5, autoBreak: true });

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'arise-data.json'; a.click();
    toast({ title: "Data exported!" });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          localStorage.setItem('arise-data', JSON.stringify(data));
          toast({ title: "Data imported! Refreshing..." });
          setTimeout(() => window.location.reload(), 1000);
        } catch { toast({ title: "Invalid file", variant: "destructive" }); }
      };
      reader.readAsText(file);
    }
  };

  const handleClear = () => {
    if (confirm("Delete ALL data? This cannot be undone.")) {
      localStorage.removeItem('arise-data');
      window.location.reload();
    }
  };

  const saveName = () => {
    updateProfile({ name: editName });
    setIsEditingName(false);
    toast({ title: "Name updated!" });
  };

  // Calculate achievements
  const potentialAchievements = [
    { id: "first_task", title: "First Steps", description: "Complete your first task", icon: "🎯", unlocked: completedTasks.length >= 1 },
    { id: "task_master", title: "Task Master", description: "Complete 50 tasks", icon: "✅", unlocked: completedTasks.length >= 50 },
    { id: "focus_warrior", title: "Focus Warrior", description: "10 hours of focus time", icon: "🧘", unlocked: stats.totalFocusMinutes >= 600 },
    { id: "journal_writer", title: "Journal Writer", description: "Write 10 journal entries", icon: "📝", unlocked: entries.length >= 10 },
    { id: "habit_builder", title: "Habit Builder", description: "Create 5 habits", icon: "🔄", unlocked: habits.length >= 5 },
    { id: "streak_week", title: "Week Warrior", description: "7-day streak", icon: "🔥", unlocked: stats.currentTaskStreak >= 7 },
    { id: "level_10", title: "Rising Star", description: "Reach level 10", icon: "⭐", unlocked: stats.level >= 10 },
    { id: "productivity_pro", title: "Productivity Pro", description: "100 tasks completed", icon: "🏆", unlocked: completedTasks.length >= 100 },
  ];

  const unlockedCount = potentialAchievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-4 animate-fade-in max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold flex items-center gap-2"><User className="w-6 h-6 text-primary" />Profile</h1>

      {/* Profile Card */}
      <Card className="glass">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">{state.userName.charAt(0).toUpperCase()}</div>
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex gap-2">
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="max-w-[200px]" />
                  <Button size="sm" onClick={saveName}><Save className="w-4 h-4" /></Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{state.userName}</h2>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditingName(true)}><Edit2 className="w-4 h-4" /></Button>
                </div>
              )}
              <div className="flex gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">Level {stats.level}</span>
                <span className="px-2 py-0.5 rounded-full bg-arise-energy/20 text-arise-energy text-xs font-medium">{stats.xp} XP</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1"><span>Level Progress</span><span className="text-muted-foreground">{stats.xp % 100}/100 XP</span></div>
            <Progress value={stats.xp % 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="glass">
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="glass"><CardContent className="pt-4 text-center"><p className="text-3xl font-bold">{stats.totalTasks}</p><p className="text-xs text-muted-foreground">Total Tasks</p></CardContent></Card>
            <Card className="glass"><CardContent className="pt-4 text-center"><p className="text-3xl font-bold">{stats.completedTasks}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
            <Card className="glass"><CardContent className="pt-4 text-center"><p className="text-3xl font-bold">{Math.floor(stats.totalFocusMinutes / 60)}h</p><p className="text-xs text-muted-foreground">Focus Time</p></CardContent></Card>
            <Card className="glass"><CardContent className="pt-4 text-center"><p className="text-3xl font-bold">{stats.totalJournalEntries}</p><p className="text-xs text-muted-foreground">Journal Entries</p></CardContent></Card>
          </div>

          <Card className="glass">
            <CardHeader className="pb-2"><CardTitle className="text-base">Streaks</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Zap className="w-5 h-5 text-arise-energy" /><span>Task Streak</span></div><span className="font-bold text-arise-energy">{stats.currentTaskStreak} days</span></div>
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Target className="w-5 h-5 text-primary" /><span>Focus Streak</span></div><span className="font-bold text-primary">{stats.currentFocusStreak} days</span></div>
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Star className="w-5 h-5 text-accent" /><span>Journal Streak</span></div><span className="font-bold text-accent">{stats.currentJournalStreak} days</span></div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2"><CardTitle className="text-base">Activity Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div><div className="flex justify-between text-sm mb-1"><span>Focus Sessions</span><span>{sessions.length}</span></div><Progress value={Math.min(100, sessions.length * 2)} className="h-2" /></div>
                <div><div className="flex justify-between text-sm mb-1"><span>Habits Created</span><span>{habits.length}</span></div><Progress value={Math.min(100, habits.length * 10)} className="h-2" /></div>
                <div><div className="flex justify-between text-sm mb-1"><span>Tasks Created</span><span>{tasks.length}</span></div><Progress value={Math.min(100, tasks.length)} className="h-2" /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="mt-4">
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2"><Trophy className="w-5 h-5 text-arise-warning" />Achievements</span>
                <span className="text-sm text-muted-foreground">{unlockedCount}/{potentialAchievements.length}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {potentialAchievements.map((achievement) => (
                  <div key={achievement.id} className={`p-3 rounded-lg text-center transition-all ${achievement.unlocked ? 'bg-arise-energy/10 border border-arise-energy/20' : 'bg-secondary/50 opacity-50'}`}>
                    <div className="text-3xl mb-1">{achievement.icon}</div>
                    <p className="font-medium text-sm">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card className="glass">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Sun className="w-5 h-5" />Appearance</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div><p className="font-medium">Theme</p><p className="text-sm text-muted-foreground">Choose your color scheme</p></div>
                <div className="flex gap-2">
                  <Button variant={theme === 'light' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('light')}><Sun className="w-4 h-4 mr-1" />Light</Button>
                  <Button variant={theme === 'dark' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('dark')}><Moon className="w-4 h-4 mr-1" />Dark</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Bell className="w-5 h-5" />Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {Object.entries({ tasks: "Task reminders", focus: "Focus session alerts", habits: "Habit reminders", insights: "AI insights" }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <Switch checked={notifications[key as keyof typeof notifications]} onCheckedChange={(checked) => setNotifications({ ...notifications, [key]: checked })} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Target className="w-5 h-5" />Focus Defaults</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2"><span>Default Duration</span><span>{focusSettings.defaultDuration} min</span></div>
                <Slider value={[focusSettings.defaultDuration]} onValueChange={([v]) => setFocusSettings({ ...focusSettings, defaultDuration: v })} max={60} min={5} step={5} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2"><span>Break Duration</span><span>{focusSettings.breakDuration} min</span></div>
                <Slider value={[focusSettings.breakDuration]} onValueChange={([v]) => setFocusSettings({ ...focusSettings, breakDuration: v })} max={30} min={1} step={1} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto-start breaks</span>
                <Switch checked={focusSettings.autoBreak} onCheckedChange={(checked) => setFocusSettings({ ...focusSettings, autoBreak: checked })} />
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Brain className="w-5 h-5" />AI Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><span className="text-sm">AI Suggestions</span><Switch defaultChecked /></div>
              <div className="flex items-center justify-between"><span className="text-sm">Smart Scheduling</span><Switch defaultChecked /></div>
              <div className="flex items-center justify-between"><span className="text-sm">Mood Analysis</span><Switch defaultChecked /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4 mt-4">
          <Card className="glass">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Shield className="w-5 h-5" />Data Management</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div><p className="font-medium">Export Data</p><p className="text-sm text-muted-foreground">Download all your data as JSON</p></div>
                <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-4 h-4 mr-2" />Export</Button>
              </div>
              <div className="flex items-center justify-between">
                <div><p className="font-medium">Import Data</p><p className="text-sm text-muted-foreground">Restore from a backup file</p></div>
                <label>
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                  <Button variant="outline" size="sm" asChild><span><Upload className="w-4 h-4 mr-2" />Import</span></Button>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-destructive/20">
            <CardHeader className="pb-2"><CardTitle className="text-base text-destructive">Danger Zone</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div><p className="font-medium">Clear All Data</p><p className="text-sm text-muted-foreground">Permanently delete everything</p></div>
                <Button variant="destructive" size="sm" onClick={handleClear}><Trash2 className="w-4 h-4 mr-2" />Clear All</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
