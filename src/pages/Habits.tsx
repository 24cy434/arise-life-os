import { useState } from "react";
import { Repeat, Plus, Check, Flame, Trophy, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useHabits, useCategories } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const habitColors = ["bg-primary", "bg-accent", "bg-arise-success", "bg-arise-warning", "bg-arise-energy", "bg-arise-info"];

const Habits = () => {
  const { habits, addHabit, deleteHabit, completeHabit, isCompletedToday } = useHabits();
  const { categories } = useCategories();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [newHabit, setNewHabit] = useState({ title: "", description: "", frequency: "daily" as const, category: "Personal", color: "bg-primary" });

  const today = new Date().toISOString().split('T')[0];
  const completedToday = habits.filter(h => isCompletedToday(h.id)).length;
  const completionRate = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const handleAdd = () => {
    if (!newHabit.title.trim()) { toast({ title: "Title required", variant: "destructive" }); return; }
    addHabit(newHabit);
    toast({ title: "Habit created!", description: "Start building your streak!" });
    setNewHabit({ title: "", description: "", frequency: "daily", category: "Personal", color: "bg-primary" });
    setIsAdding(false);
  };

  const handleComplete = (id: string) => {
    if (isCompletedToday(id)) return;
    completeHabit(id);
    toast({ title: "Habit completed! +5 XP", description: "Keep the streak going!" });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Repeat className="w-6 h-6 text-accent" />Habits</h1>
          <p className="text-muted-foreground text-sm">{completedToday}/{habits.length} today</p>
        </div>
        <Button onClick={() => setIsAdding(true)} size="sm"><Plus className="w-4 h-4 mr-2" />New Habit</Button>
      </div>

      <Card className="glass">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Today's Progress</span>
            <span className="text-sm font-medium">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </CardContent>
      </Card>

      {isAdding && (
        <Card className="glass animate-scale-in">
          <CardContent className="pt-4 space-y-3">
            <Input placeholder="Habit title (e.g., Drink 8 glasses of water)" value={newHabit.title} onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })} />
            <Input placeholder="Description (optional)" value={newHabit.description} onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Select value={newHabit.frequency} onValueChange={(v: any) => setNewHabit({ ...newHabit, frequency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newHabit.category} onValueChange={(v) => setNewHabit({ ...newHabit, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              {habitColors.map(color => (
                <button key={color} onClick={() => setNewHabit({ ...newHabit, color })} className={cn("w-8 h-8 rounded-full", color, newHabit.color === color && "ring-2 ring-offset-2 ring-primary ring-offset-background")} />
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleAdd}>Create</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {habits.length === 0 ? (
          <Card className="glass">
            <CardContent className="pt-8 pb-8 text-center">
              <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No habits yet. Create one to start building better routines!</p>
              <Button className="mt-4" onClick={() => setIsAdding(true)}>Create First Habit</Button>
            </CardContent>
          </Card>
        ) : (
          habits.map((habit) => {
            const completedToday = isCompletedToday(habit.id);
            return (
              <Card key={habit.id} className={cn("glass group transition-all", completedToday && "opacity-70")}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <button onClick={() => handleComplete(habit.id)} className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all", completedToday ? "bg-arise-success text-primary-foreground" : `${habit.color} opacity-30 hover:opacity-100`)}>
                      <Check className={cn("w-5 h-5", completedToday ? "text-primary-foreground" : "text-primary-foreground")} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={cn("font-medium", completedToday && "line-through text-muted-foreground")}>{habit.title}</h3>
                        {habit.streak > 0 && (
                          <span className="flex items-center gap-1 text-xs text-arise-energy">
                            <Flame className="w-3 h-3" />{habit.streak}
                          </span>
                        )}
                      </div>
                      {habit.description && <p className="text-xs text-muted-foreground mt-0.5">{habit.description}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">{habit.category}</span>
                        <span className="text-xs text-muted-foreground">{habit.frequency}</span>
                        {habit.bestStreak > 0 && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Trophy className="w-3 h-3" />Best: {habit.bestStreak}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 mt-2">
                        {last7Days.map((date, i) => (
                          <div key={date} className={cn("w-6 h-6 rounded text-xs flex items-center justify-center", habit.completedDates.includes(date) ? habit.color + " text-primary-foreground" : "bg-secondary/50")}>{new Date(date).getDate()}</div>
                        ))}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-8 w-8" onClick={() => deleteHabit(habit.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Habits;
