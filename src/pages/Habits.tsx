import { useState } from "react";
import { Repeat, Plus, Flame, Trophy, Trash2, Sparkles, Brain, Calendar, CheckCircle2, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHabits, useCategories, useTasks, useCalendar } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const habitColors = ["bg-primary", "bg-accent", "bg-arise-success", "bg-arise-warning", "bg-arise-energy", "bg-arise-info"];

interface AIAction {
  number: number;
  task: string;
  frequency: string;
  estimatedMinutes: number;
}

interface HabitAnalysis {
  habit: string;
  actions: AIAction[];
  cue: string;
  implementation_intention: string;
  duration_days: number;
  schedule_frequency: string;
}

const Habits = () => {
  const { habits, addHabit, deleteHabit } = useHabits();
  const { categories, addCategory } = useCategories();
  const { addTask } = useTasks();
  const { addEvent } = useCalendar();
  const { toast } = useToast();
  
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<HabitAnalysis | null>(null);
  const [selectedActions, setSelectedActions] = useState<number[]>([]);
  const [newCategory, setNewCategory] = useState("");

  const today = new Date().toISOString().split('T')[0];

  const handleStartHabit = async () => {
    if (!newHabitTitle.trim()) {
      toast({ title: "Please enter a habit name", variant: "destructive" });
      return;
    }

    setShowAIDialog(true);
    setAiLoading(true);
    setAiAnalysis(null);
    setSelectedActions([]);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `I want to build the habit: "${newHabitTitle}". Please analyze this and provide specific daily micro-actions I can take to build this habit over 60 days. Consider behavioral science principles.`
          }],
          type: 'habit_analysis'
        })
      });

      const data = await response.json();
      
      if (data.parsed && data.parsed.type === 'habit_analysis') {
        setAiAnalysis(data.parsed);
      } else {
        // Fallback if AI doesn't return proper JSON
        setAiAnalysis({
          habit: newHabitTitle,
          actions: [
            { number: 1, task: `Start with 2 minutes of ${newHabitTitle}`, frequency: 'daily', estimatedMinutes: 2 },
            { number: 2, task: `Increase to 5 minutes of ${newHabitTitle}`, frequency: 'daily', estimatedMinutes: 5 },
            { number: 3, task: `Practice ${newHabitTitle} for 10 minutes`, frequency: 'daily', estimatedMinutes: 10 },
            { number: 4, task: `Build consistency with 15 minutes`, frequency: 'daily', estimatedMinutes: 15 },
            { number: 5, task: `Full ${newHabitTitle} session - 20 minutes`, frequency: 'daily', estimatedMinutes: 20 },
          ],
          cue: 'After your morning routine',
          implementation_intention: `When I finish my morning routine, I will practice ${newHabitTitle}`,
          duration_days: 60,
          schedule_frequency: 'once'
        });
      }
    } catch (error) {
      console.error("AI analysis error:", error);
      toast({ title: "AI analysis failed, using default plan", variant: "destructive" });
      setAiAnalysis({
        habit: newHabitTitle,
        actions: [
          { number: 1, task: `Start with 2 minutes of ${newHabitTitle}`, frequency: 'daily', estimatedMinutes: 2 },
          { number: 2, task: `Increase to 5 minutes of ${newHabitTitle}`, frequency: 'daily', estimatedMinutes: 5 },
          { number: 3, task: `Practice ${newHabitTitle} for 10 minutes`, frequency: 'daily', estimatedMinutes: 10 },
        ],
        cue: 'After your morning routine',
        implementation_intention: `When I finish my morning routine, I will practice ${newHabitTitle}`,
        duration_days: 60,
        schedule_frequency: 'once'
      });
    }
    
    setAiLoading(false);
  };

  const toggleAction = (num: number) => {
    setSelectedActions(prev => 
      prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]
    );
  };

  const scheduleHabitTasks = () => {
    if (!aiAnalysis || selectedActions.length === 0) {
      toast({ title: "Please select at least one action", variant: "destructive" });
      return;
    }

    // Create the habit
    addHabit({
      title: newHabitTitle,
      description: aiAnalysis.implementation_intention,
      frequency: 'daily',
      category: 'Personal',
      color: habitColors[Math.floor(Math.random() * habitColors.length)]
    });

    // Schedule tasks for the next 60 days
    const selectedActionsList = aiAnalysis.actions.filter(a => selectedActions.includes(a.number));
    const today = new Date();
    
    // Distribute actions across the 60-day period
    const daysPerAction = Math.floor(aiAnalysis.duration_days / selectedActionsList.length);
    
    selectedActionsList.forEach((action, index) => {
      const startDay = index * daysPerAction;
      const endDay = (index + 1) * daysPerAction;
      
      // Create tasks for each day in this action's period
      for (let day = startDay; day < endDay && day < aiAnalysis.duration_days; day++) {
        const taskDate = new Date(today);
        taskDate.setDate(taskDate.getDate() + day);
        const dateStr = taskDate.toISOString().split('T')[0];
        
        // Add task
        addTask({
          title: action.task,
          description: `Habit: ${newHabitTitle} - ${aiAnalysis.cue}`,
          completed: false,
          priority: day < 7 ? 'high' : 'medium',
          dueDate: dateStr,
          category: 'Personal',
          subtasks: [],
          estimatedMinutes: action.estimatedMinutes
        });

        // Add calendar event (for first week and weekly thereafter)
        if (day < 7 || day % 7 === 0) {
          addEvent({
            title: action.task,
            type: 'habit',
            date: dateStr,
            time: '08:00',
            duration: `${action.estimatedMinutes}m`,
            color: 'bg-arise-success'
          });
        }
      }
    });

    toast({ 
      title: "Habit plan created! 🎉",
      description: `${selectedActions.length} actions scheduled over ${aiAnalysis.duration_days} days`
    });
    
    setShowAIDialog(false);
    setNewHabitTitle("");
    setAiAnalysis(null);
    setSelectedActions([]);
    setIsAdding(false);
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    addCategory(newCategory, habitColors[Math.floor(Math.random() * habitColors.length)]);
    setNewCategory("");
    toast({ title: "Category added!" });
  };

  // Calculate completion stats
  const habitStats = habits.map(h => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    });
    const completedCount = h.completedDates.filter(d => last30Days.includes(d)).length;
    return { ...h, completionRate: Math.round((completedCount / 30) * 100) };
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Repeat className="w-6 h-6 text-accent" />Habits</h1>
          <p className="text-muted-foreground text-sm">AI-powered habit building with behavioral science</p>
        </div>
        <Button onClick={() => setIsAdding(true)} size="sm"><Plus className="w-4 h-4 mr-2" />New Habit</Button>
      </div>

      {/* Add Category */}
      <Card className="glass">
        <CardContent className="pt-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Add new category..." 
              value={newCategory} 
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <Button onClick={handleAddCategory} size="sm">Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {categories.map(c => (
              <span key={c.id} className={cn("px-2 py-1 rounded-full text-xs", c.color, "text-primary-foreground")}>{c.name}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Habit Input */}
      {isAdding && (
        <Card className="glass animate-scale-in border-primary/20">
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <span className="font-medium">What habit do you want to build?</span>
            </div>
            <Input 
              placeholder="e.g., Read every day, Exercise, Meditate, Learn coding..." 
              value={newHabitTitle} 
              onChange={(e) => setNewHabitTitle(e.target.value)}
              className="text-lg"
            />
            <p className="text-sm text-muted-foreground">
              AI will analyze your habit and create a personalized 60-day plan with daily micro-actions based on behavioral science.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button className="flex-1 gradient-primary" onClick={handleStartHabit}>
                <Sparkles className="w-4 h-4 mr-2" />Analyze with AI
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Analysis Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              AI Habit Analysis
            </DialogTitle>
            <DialogDescription>
              Select the actions you want to commit to. AI will schedule them over {aiAnalysis?.duration_days || 60} days.
            </DialogDescription>
          </DialogHeader>
          
          {aiLoading ? (
            <div className="py-8 text-center">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mx-auto animate-pulse">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <p className="mt-4 text-muted-foreground">Analyzing your habit...</p>
            </div>
          ) : aiAnalysis && (
            <ScrollArea className="max-h-[50vh]">
              <div className="space-y-4 pr-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <p className="text-sm font-medium">💡 {aiAnalysis.implementation_intention}</p>
                  <p className="text-xs text-muted-foreground mt-1">Cue: {aiAnalysis.cue}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Select your actions:</p>
                  {aiAnalysis.actions.map((action) => (
                    <button
                      key={action.number}
                      onClick={() => toggleAction(action.number)}
                      className={cn(
                        "w-full p-3 rounded-lg text-left transition-all border-2",
                        selectedActions.includes(action.number) 
                          ? "border-primary bg-primary/10" 
                          : "border-border bg-secondary/30 hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm font-bold",
                          selectedActions.includes(action.number) ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>
                          {action.number}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{action.task}</p>
                          <p className="text-xs text-muted-foreground">{action.estimatedMinutes} min • {action.frequency}</p>
                        </div>
                        {selectedActions.includes(action.number) && (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Tasks will be scheduled over {aiAnalysis.duration_days} days</span>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}

          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowAIDialog(false)}>Cancel</Button>
            <Button 
              className="flex-1" 
              onClick={scheduleHabitTasks}
              disabled={selectedActions.length === 0 || aiLoading}
            >
              Schedule {selectedActions.length} Actions <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Existing Habits */}
      <div className="space-y-3">
        {habits.length === 0 ? (
          <Card className="glass">
            <CardContent className="pt-8 pb-8 text-center">
              <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Build Lasting Habits with AI</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Based on behavioral science research, habits take ~66 days to form. 
                Our AI creates personalized micro-actions to build automaticity.
              </p>
              <Button onClick={() => setIsAdding(true)}>
                <Sparkles className="w-4 h-4 mr-2" />Start Your First Habit
              </Button>
            </CardContent>
          </Card>
        ) : (
          habitStats.map((habit) => (
            <Card key={habit.id} className="glass group">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", habit.color)}>
                    <Repeat className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{habit.title}</h3>
                      {habit.streak > 0 && (
                        <span className="flex items-center gap-1 text-xs text-arise-energy">
                          <Flame className="w-3 h-3" />{habit.streak} day streak
                        </span>
                      )}
                    </div>
                    {habit.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{habit.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">{habit.category}</span>
                      <span className="text-xs text-muted-foreground">{habit.frequency}</span>
                      {habit.bestStreak > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Trophy className="w-3 h-3" />Best: {habit.bestStreak}
                        </span>
                      )}
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>30-day completion</span>
                        <span>{habit.completionRate}%</span>
                      </div>
                      <Progress value={habit.completionRate} className="h-1.5" />
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="opacity-0 group-hover:opacity-100 h-8 w-8" 
                    onClick={() => deleteHabit(habit.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Info Card */}
      <Card className="glass border-primary/20">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">How it works</h4>
              <p className="text-xs text-muted-foreground mt-1">
                1. Enter your desired habit → 2. AI analyzes and creates micro-actions → 
                3. Select which actions fit your lifestyle → 4. Tasks are auto-scheduled → 
                5. Complete daily tasks to build automaticity → 6. Habit becomes automatic after ~66 days
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Habits;
