import { useState } from "react";
import { User, Moon, Sun, Trash2, Download, Upload, Shield, Bell, Target, Brain, Trophy, Zap, Star, Edit2, Save, Crown, Award, Medal, Gem, Rocket, Heart, Coffee, BookOpen, Dumbbell, Music } from "lucide-react";
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

// Progressive achievements with tiers
const achievementTiers = [
  // Task achievements
  { id: "task_starter", title: "First Steps", description: "Complete 1 task", icon: "🎯", target: 1, category: "tasks", tier: 1 },
  { id: "task_10", title: "Getting Started", description: "Complete 10 tasks", icon: "✅", target: 10, category: "tasks", tier: 1 },
  { id: "task_50", title: "Task Warrior", description: "Complete 50 tasks", icon: "⚔️", target: 50, category: "tasks", tier: 2 },
  { id: "task_100", title: "Task Master", description: "Complete 100 tasks", icon: "🏆", target: 100, category: "tasks", tier: 2 },
  { id: "task_250", title: "Task Legend", description: "Complete 250 tasks", icon: "👑", target: 250, category: "tasks", tier: 3 },
  { id: "task_500", title: "Task Titan", description: "Complete 500 tasks", icon: "⭐", target: 500, category: "tasks", tier: 3 },
  { id: "task_1000", title: "Task Deity", description: "Complete 1000 tasks", icon: "💎", target: 1000, category: "tasks", tier: 4 },
  
  // Focus achievements
  { id: "focus_1h", title: "Focus Initiate", description: "1 hour focused", icon: "🧘", target: 60, category: "focus", tier: 1 },
  { id: "focus_5h", title: "Deep Thinker", description: "5 hours focused", icon: "🎯", target: 300, category: "focus", tier: 1 },
  { id: "focus_10h", title: "Focus Warrior", description: "10 hours focused", icon: "⚡", target: 600, category: "focus", tier: 2 },
  { id: "focus_25h", title: "Mind Master", description: "25 hours focused", icon: "🧠", target: 1500, category: "focus", tier: 2 },
  { id: "focus_50h", title: "Focus Legend", description: "50 hours focused", icon: "🔥", target: 3000, category: "focus", tier: 3 },
  { id: "focus_100h", title: "Zen Master", description: "100 hours focused", icon: "✨", target: 6000, category: "focus", tier: 4 },
  
  // Journal achievements
  { id: "journal_1", title: "First Entry", description: "Write 1 journal", icon: "📝", target: 1, category: "journal", tier: 1 },
  { id: "journal_10", title: "Reflector", description: "Write 10 journals", icon: "📔", target: 10, category: "journal", tier: 1 },
  { id: "journal_30", title: "Month of Reflection", description: "Write 30 journals", icon: "📚", target: 30, category: "journal", tier: 2 },
  { id: "journal_100", title: "Journal Master", description: "Write 100 journals", icon: "✍️", target: 100, category: "journal", tier: 3 },
  
  // Habit achievements
  { id: "habit_1", title: "Habit Starter", description: "Create 1 habit", icon: "🔄", target: 1, category: "habits", tier: 1 },
  { id: "habit_5", title: "Habit Builder", description: "Create 5 habits", icon: "🌱", target: 5, category: "habits", tier: 2 },
  { id: "habit_10", title: "Habit Master", description: "Create 10 habits", icon: "🌳", target: 10, category: "habits", tier: 3 },
  
  // Streak achievements
  { id: "streak_3", title: "On Fire", description: "3-day streak", icon: "🔥", target: 3, category: "streak", tier: 1 },
  { id: "streak_7", title: "Week Warrior", description: "7-day streak", icon: "💪", target: 7, category: "streak", tier: 2 },
  { id: "streak_14", title: "Fortnight Fighter", description: "14-day streak", icon: "⚔️", target: 14, category: "streak", tier: 2 },
  { id: "streak_30", title: "Monthly Champion", description: "30-day streak", icon: "🏅", target: 30, category: "streak", tier: 3 },
  { id: "streak_60", title: "Habit Master", description: "60-day streak", icon: "🎖️", target: 60, category: "streak", tier: 3 },
  { id: "streak_100", title: "Century Legend", description: "100-day streak", icon: "💯", target: 100, category: "streak", tier: 4 },
  
  // Level achievements
  { id: "level_5", title: "Rising Star", description: "Reach level 5", icon: "⭐", target: 5, category: "level", tier: 1 },
  { id: "level_10", title: "Dedicated", description: "Reach level 10", icon: "🌟", target: 10, category: "level", tier: 2 },
  { id: "level_25", title: "Committed", description: "Reach level 25", icon: "💫", target: 25, category: "level", tier: 3 },
  { id: "level_50", title: "Elite", description: "Reach level 50", icon: "👑", target: 50, category: "level", tier: 4 },
  { id: "level_100", title: "Legendary", description: "Reach level 100", icon: "💎", target: 100, category: "level", tier: 4 },
];

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

  // Calculate achievement progress
  const getAchievementStatus = (achievement: typeof achievementTiers[0]) => {
    let current = 0;
    switch (achievement.category) {
      case 'tasks': current = completedTasks.length; break;
      case 'focus': current = stats.totalFocusMinutes; break;
      case 'journal': current = entries.length; break;
      case 'habits': current = habits.length; break;
      case 'streak': current = Math.max(stats.currentTaskStreak, stats.currentFocusStreak, stats.currentJournalStreak); break;
      case 'level': current = stats.level; break;
    }
    return { current, unlocked: current >= achievement.target, progress: Math.min(100, (current / achievement.target) * 100) };
  };

  const unlockedAchievements = achievementTiers.filter(a => getAchievementStatus(a).unlocked);
  const lockedAchievements = achievementTiers.filter(a => !getAchievementStatus(a).unlocked);

  const tierColors: Record<number, string> = {
    1: "border-arise-success/50 bg-arise-success/10",
    2: "border-arise-warning/50 bg-arise-warning/10",
    3: "border-primary/50 bg-primary/10",
    4: "border-arise-energy/50 bg-arise-energy/10",
  };

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
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="max-w-[200px]" onKeyDown={(e) => e.key === 'Enter' && saveName()} />
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
                <span className="px-2 py-0.5 rounded-full bg-arise-success/20 text-arise-success text-xs font-medium">{unlockedAchievements.length}/{achievementTiers.length} Achievements</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1"><span>Level Progress</span><span className="text-muted-foreground">{stats.xp % 100}/100 XP</span></div>
            <Progress value={stats.xp % 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="glass">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="mt-4 space-y-4">
          {/* Unlocked Section */}
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2"><Trophy className="w-5 h-5 text-arise-warning" />Unlocked ({unlockedAchievements.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {unlockedAchievements.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Complete tasks, focus sessions, and habits to unlock achievements!</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {unlockedAchievements.map((achievement) => (
                    <div key={achievement.id} className={`p-3 rounded-lg text-center border-2 ${tierColors[achievement.tier]}`}>
                      <div className="text-3xl mb-1">{achievement.icon}</div>
                      <p className="font-medium text-sm">{achievement.title}</p>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      <span className="text-xs text-arise-energy">Tier {achievement.tier}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Locked/In Progress Section */}
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Target className="w-5 h-5 text-muted-foreground" />In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lockedAchievements.slice(0, 8).map((achievement) => {
                  const status = getAchievementStatus(achievement);
                  return (
                    <div key={achievement.id} className="p-3 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl opacity-50">{achievement.icon}</div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{achievement.title}</p>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                          <div className="mt-1">
                            <Progress value={status.progress} className="h-1" />
                            <p className="text-xs text-muted-foreground mt-0.5">{status.current}/{achievement.target}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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