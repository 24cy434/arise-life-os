import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAI, useTasks, useHabits, useJournal, useFocus, useStats } from "@/lib/store";
import { cn } from "@/lib/utils";

const habitToTaskMap: Record<string, { title: string; priority: 'high' | 'medium' | 'low'; estimatedMinutes: number }[]> = {
  'reading': [
    { title: 'Read 10 pages of current book', priority: 'medium', estimatedMinutes: 20 },
    { title: 'Read 1 article related to goals', priority: 'low', estimatedMinutes: 10 },
    { title: 'Summarize what you read today', priority: 'low', estimatedMinutes: 15 },
  ],
  'exercise': [
    { title: 'Complete 100 push-ups throughout the day', priority: 'high', estimatedMinutes: 30 },
    { title: '30 minutes of cardio', priority: 'high', estimatedMinutes: 30 },
    { title: 'Do 15 minutes of stretching', priority: 'medium', estimatedMinutes: 15 },
  ],
  'workout': [
    { title: 'Complete 100 push-ups throughout the day', priority: 'high', estimatedMinutes: 30 },
    { title: 'Do full body strength workout', priority: 'high', estimatedMinutes: 45 },
    { title: '50 squats challenge', priority: 'medium', estimatedMinutes: 15 },
  ],
  'meditation': [
    { title: '10 minutes morning meditation', priority: 'medium', estimatedMinutes: 10 },
    { title: 'Practice deep breathing for 5 minutes', priority: 'low', estimatedMinutes: 5 },
    { title: 'Evening mindfulness session', priority: 'medium', estimatedMinutes: 15 },
  ],
  'journal': [
    { title: 'Write 3 things you are grateful for', priority: 'medium', estimatedMinutes: 10 },
    { title: 'Reflect on today achievements', priority: 'medium', estimatedMinutes: 15 },
    { title: 'Plan tomorrow top 3 priorities', priority: 'high', estimatedMinutes: 10 },
  ],
  'learning': [
    { title: 'Complete 1 lesson on current course', priority: 'high', estimatedMinutes: 30 },
    { title: 'Practice new skill for 20 minutes', priority: 'medium', estimatedMinutes: 20 },
    { title: 'Review notes from yesterday', priority: 'low', estimatedMinutes: 10 },
  ],
  'coding': [
    { title: 'Solve 1 coding challenge', priority: 'high', estimatedMinutes: 30 },
    { title: 'Build a small feature or component', priority: 'high', estimatedMinutes: 45 },
    { title: 'Review and refactor old code', priority: 'medium', estimatedMinutes: 20 },
  ],
  'water': [
    { title: 'Drink 8 glasses of water', priority: 'medium', estimatedMinutes: 5 },
    { title: 'Set hourly water reminders', priority: 'low', estimatedMinutes: 5 },
  ],
  'sleep': [
    { title: 'Go to bed by 10 PM', priority: 'high', estimatedMinutes: 10 },
    { title: 'No screens 30 min before bed', priority: 'medium', estimatedMinutes: 30 },
    { title: 'Prepare sleep environment', priority: 'low', estimatedMinutes: 10 },
  ],
};

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { messages, addMessage, profile, updateProfile } = useAI();
  const { tasks, pendingTasks, addTask } = useTasks();
  const { habits, addHabit } = useHabits();
  const { entries } = useJournal();
  const { sessions } = useFocus();
  const stats = useStats();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const generateTasksFromHabits = () => {
    const today = new Date().toISOString().split('T')[0];
    const suggestedTasks: string[] = [];
    
    habits.forEach(habit => {
      const habitLower = habit.title.toLowerCase();
      for (const [keyword, taskTemplates] of Object.entries(habitToTaskMap)) {
        if (habitLower.includes(keyword)) {
          const randomTask = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
          const existingTask = tasks.find(t => t.title.toLowerCase() === randomTask.title.toLowerCase() && t.dueDate === today);
          if (!existingTask) {
            addTask({ 
              title: randomTask.title, 
              completed: false, 
              priority: randomTask.priority, 
              category: habit.category, 
              dueDate: today, 
              subtasks: [],
              estimatedMinutes: randomTask.estimatedMinutes,
            });
            suggestedTasks.push(randomTask.title);
          }
          break;
        }
      }
    });
    
    return suggestedTasks;
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    const userData = {
      totalTasks: tasks.length,
      pendingTasks: pendingTasks.length,
      completedTasks: stats.completedTasks,
      totalHabits: habits.length,
      journalEntries: entries.length,
      focusSessions: sessions.length,
      totalFocusMinutes: stats.totalFocusMinutes,
      level: stats.level,
      xp: stats.xp,
      productivity: stats.productivity,
    };

    // Auto-assign tasks based on habits
    if (lowerMsg.includes("assign task") || lowerMsg.includes("create task") && lowerMsg.includes("habit") || lowerMsg.includes("suggest task") && lowerMsg.includes("habit") || lowerMsg.includes("auto assign")) {
      const createdTasks = generateTasksFromHabits();
      if (createdTasks.length > 0) {
        return `Based on your habits, I've created ${createdTasks.length} tasks for today:\n\n${createdTasks.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\nThese tasks align with your habit goals. Good luck! 💪`;
      }
      return "I analyzed your habits but all relevant tasks for today are already created. Keep up the great work! Would you like me to suggest new habits?";
    }

    // Goal/Priority related
    if (lowerMsg.includes("goal") || lowerMsg.includes("priority") || lowerMsg.includes("priorities")) {
      if (lowerMsg.includes("set") || lowerMsg.includes("add") || lowerMsg.includes("my goal") || lowerMsg.includes("my priorities")) {
        const goalMatch = userMessage.match(/goal[s]?\s*(?:is|are|:)?\s*(.+)/i) || userMessage.match(/priorit(?:y|ies)\s*(?:is|are|:)?\s*(.+)/i);
        if (goalMatch) {
          const goals = goalMatch[1].split(/,|and/).map(g => g.trim()).filter(g => g);
          updateProfile({ goals: [...(profile.goals || []), ...goals] });
          return `I've noted your goals: ${goals.join(", ")}. Based on these, I can suggest habits and tasks. Say "assign tasks from habits" and I'll create relevant daily tasks!`;
        }
        return "Tell me your goals! For example: 'My goals are to exercise daily, read more, and improve productivity.'";
      }
      if (profile.goals?.length) {
        return `Your current goals: ${profile.goals.join(", ")}.\n\nProductivity: ${userData.productivity}%\nLevel: ${userData.level}\n\nSay "assign tasks from habits" to get personalized tasks!`;
      }
      return "No goals set yet. Tell me what you want to achieve and I'll help you get there!";
    }

    // Habit suggestions
    if (lowerMsg.includes("habit") || lowerMsg.includes("suggest") || lowerMsg.includes("routine")) {
      const suggestions = [
        { title: "Morning meditation", desc: "Start with 5 minutes of mindfulness" },
        { title: "Drink 8 glasses of water", desc: "Stay hydrated throughout the day" },
        { title: "Read for 20 minutes", desc: "Expand your knowledge daily" },
        { title: "Exercise for 30 minutes", desc: "Keep your body active" },
        { title: "Journal before bed", desc: "Reflect on your day" },
        { title: "No phone first hour", desc: "Start mornings mindfully" },
        { title: "Learn something new", desc: "Grow your skills daily" },
      ];
      const randomSuggestions = suggestions.sort(() => Math.random() - 0.5).slice(0, 3);
      return `Here are habit suggestions based on your profile:\n\n${randomSuggestions.map((s, i) => `${i + 1}. **${s.title}** - ${s.desc}`).join("\n")}\n\nSay "add habit [name]" to add one, or "assign tasks from habits" to get daily tasks!`;
    }

    // Add habit
    if (lowerMsg.includes("add habit")) {
      const habitName = userMessage.replace(/add habit\s*/i, "").trim();
      if (habitName) {
        addHabit({ title: habitName, frequency: "daily", category: "Personal", color: "bg-primary" });
        return `Added "${habitName}" to your habits! Now say "assign tasks from habits" and I'll create relevant tasks for you based on this and your other habits.`;
      }
      return "Please specify the habit name. Example: 'add habit Morning stretching'";
    }

    // Add task
    if (lowerMsg.includes("add task") || (lowerMsg.includes("create task") && !lowerMsg.includes("habit"))) {
      const taskName = userMessage.replace(/(?:add|create)\s*task\s*/i, "").trim();
      if (taskName) {
        addTask({ title: taskName, completed: false, priority: "medium", category: "Work", dueDate: new Date().toISOString().split('T')[0], subtasks: [] });
        return `Task "${taskName}" added! Set for today with medium priority.`;
      }
      return "What task would you like to add? Example: 'add task Complete project report'";
    }

    // Analysis
    if (lowerMsg.includes("analyze") || lowerMsg.includes("analysis") || lowerMsg.includes("how am i doing") || lowerMsg.includes("performance") || lowerMsg.includes("stats")) {
      return `📊 **Your ARISE Analysis**\n\n**Productivity:** ${userData.productivity}%\n**Level:** ${userData.level} (${userData.xp} XP)\n**Tasks:** ${userData.completedTasks} completed, ${userData.pendingTasks} pending\n**Focus:** ${Math.floor(userData.totalFocusMinutes / 60)}h ${userData.totalFocusMinutes % 60}m total\n**Habits:** ${userData.totalHabits} active\n**Journal:** ${userData.journalEntries} entries\n\n${userData.productivity >= 70 ? "Excellent work! 🔥" : userData.productivity >= 40 ? "Good progress! Add a focus session to boost your score." : "Let's get started! Complete some tasks or try a focus session."}`;
    }

    // Help
    if (lowerMsg.includes("help") || lowerMsg.includes("what can you do")) {
      return `I'm your ARISE AI assistant! Here's what I can do:\n\n📌 **Goals:** "Set my goals to..."\n✅ **Tasks:** "Add task [name]" or "Assign tasks from habits"\n🔄 **Habits:** "Add habit [name]" or "Suggest habits"\n📊 **Analysis:** "Analyze my performance"\n🎯 **Auto-assign:** "Assign tasks from habits" - I'll create tasks based on your habits!\n\nTry: "Assign tasks from habits"`;
    }

    // Motivation
    if (lowerMsg.includes("motivat") || lowerMsg.includes("inspire") || lowerMsg.includes("encourage")) {
      const quotes = [
        "Small daily improvements lead to staggering long-term results.",
        "The secret of getting ahead is getting started.",
        "You don't have to be great to start, but you have to start to be great.",
        "Success is the sum of small efforts repeated day in and day out.",
        "Every expert was once a beginner.",
      ];
      return `💪 ${quotes[Math.floor(Math.random() * quotes.length)]}\n\nLevel ${userData.level} with ${userData.xp} XP - Every action counts!`;
    }

    // Default
    return `I can help you with goals, tasks, habits, and productivity!\n\n🎯 Try: "Assign tasks from habits" - I'll analyze your habits and create daily tasks automatically!\n\nOr ask me anything about your productivity journey.`;
  };

  const handleSend = () => {
    if (!input.trim()) return;
    addMessage("user", input);
    setInput("");
    setIsTyping(true);
    
    setTimeout(() => {
      const response = generateAIResponse(input);
      addMessage("assistant", response);
      setIsTyping(false);
    }, 600 + Math.random() * 500);
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg glow z-50" size="icon">
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[360px] h-[480px] glass shadow-xl z-50 flex flex-col animate-scale-in">
      <CardHeader className="pb-2 border-b border-border flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          ARISE AI
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <Sparkles className="w-10 h-10 mx-auto text-primary mb-3" />
                <p className="text-sm font-medium">Hi! I'm your ARISE AI assistant.</p>
                <p className="text-xs text-muted-foreground mt-1">Tell me your goals, or say "assign tasks from habits" to get started!</p>
                <div className="mt-4 space-y-2">
                  {["Assign tasks from habits", "Analyze my performance", "Suggest habits for me"].map(q => (
                    <Button key={q} variant="outline" size="sm" className="w-full text-xs" onClick={() => { setInput(q); handleSend(); }}>
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-2", msg.role === "user" && "flex-row-reverse")}>
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", msg.role === "user" ? "bg-secondary" : "gradient-primary")}>
                  {msg.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-primary-foreground" />}
                </div>
                <div className={cn("rounded-lg p-3 max-w-[80%] text-sm", msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary")}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-3 border-t border-border">
          <div className="flex gap-2">
            <Input placeholder="Ask me anything..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} className="flex-1" />
            <Button size="icon" onClick={handleSend} disabled={!input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIChat;
