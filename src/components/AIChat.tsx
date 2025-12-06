import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAI, useTasks, useHabits, useJournal, useFocus, useStats } from "@/lib/store";
import { cn } from "@/lib/utils";

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

  const generateAIResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    
    // Analyze user data
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

    // Goal/Priority related
    if (lowerMsg.includes("goal") || lowerMsg.includes("priority") || lowerMsg.includes("priorities")) {
      if (lowerMsg.includes("set") || lowerMsg.includes("add") || lowerMsg.includes("my goal") || lowerMsg.includes("my priorities")) {
        const goalMatch = userMessage.match(/goal[s]?\s*(?:is|are|:)?\s*(.+)/i) || userMessage.match(/priorit(?:y|ies)\s*(?:is|are|:)?\s*(.+)/i);
        if (goalMatch) {
          const goals = goalMatch[1].split(/,|and/).map(g => g.trim()).filter(g => g);
          updateProfile({ goals: [...(profile.goals || []), ...goals] });
          return `I've noted your goals: ${goals.join(", ")}. I'll help you track progress and suggest tasks aligned with these priorities. Would you like me to suggest some habits or tasks to help achieve them?`;
        }
        return "I'd love to help you set goals! Please tell me what you want to achieve. For example: 'My goals are to exercise daily, learn a new skill, and improve productivity.'";
      }
      if (profile.goals?.length) {
        return `Your current goals are: ${profile.goals.join(", ")}. Based on your data, you're making progress! You've completed ${userData.completedTasks} tasks and have a ${userData.productivity}% productivity score today. Want me to suggest specific actions?`;
      }
      return "You haven't set any goals yet. What would you like to achieve? Tell me your priorities and I'll help create a plan!";
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
      ];
      const randomSuggestions = suggestions.sort(() => Math.random() - 0.5).slice(0, 3);
      return `Based on your profile and goals, here are some habit suggestions:\n\n${randomSuggestions.map((s, i) => `${i + 1}. **${s.title}** - ${s.desc}`).join("\n")}\n\nWould you like me to add any of these to your habits? Just say "add habit [name]"`;
    }

    // Add habit
    if (lowerMsg.includes("add habit")) {
      const habitName = userMessage.replace(/add habit\s*/i, "").trim();
      if (habitName) {
        addHabit({ title: habitName, frequency: "daily", category: "Personal", color: "bg-primary" });
        return `Done! I've added "${habitName}" to your habits. Remember, consistency is key - even small daily actions lead to big changes!`;
      }
      return "Please specify the habit name. For example: 'add habit Morning stretching'";
    }

    // Add task
    if (lowerMsg.includes("add task") || lowerMsg.includes("create task")) {
      const taskName = userMessage.replace(/(?:add|create)\s*task\s*/i, "").trim();
      if (taskName) {
        addTask({ title: taskName, completed: false, priority: "medium", category: "Work", dueDate: new Date().toISOString().split('T')[0], subtasks: [] });
        return `Task "${taskName}" has been added! I've set it for today with medium priority. You can edit the details on the Tasks page.`;
      }
      return "Please specify what task you'd like to add. For example: 'add task Complete project report'";
    }

    // Analysis
    if (lowerMsg.includes("analyze") || lowerMsg.includes("analysis") || lowerMsg.includes("how am i doing") || lowerMsg.includes("performance")) {
      return `📊 **Your ARISE Analysis**\n\n**Productivity:** ${userData.productivity}%\n**Level:** ${userData.level} (${userData.xp} XP)\n**Tasks:** ${userData.completedTasks} completed, ${userData.pendingTasks} pending\n**Focus:** ${Math.floor(userData.totalFocusMinutes / 60)}h ${userData.totalFocusMinutes % 60}m total\n**Habits:** ${userData.totalHabits} active\n**Journal:** ${userData.journalEntries} entries\n\n${userData.productivity >= 70 ? "You're doing great! Keep up the momentum! 🔥" : userData.productivity >= 40 ? "Good progress! Try adding a focus session to boost your score." : "Let's get started! Complete some tasks or start a focus session to build momentum."}`;
    }

    // Help
    if (lowerMsg.includes("help") || lowerMsg.includes("what can you do")) {
      return `I'm your ARISE AI assistant! Here's what I can help with:\n\n📌 **Goals & Priorities:** "Set my goals to..." or "What are my priorities?"\n✅ **Tasks:** "Add task [name]" or "What should I work on?"\n🔄 **Habits:** "Suggest habits" or "Add habit [name]"\n📊 **Analysis:** "Analyze my performance" or "How am I doing?"\n💡 **Advice:** Ask me anything about productivity, focus, or personal growth!\n\nTry asking me something!`;
    }

    // Motivation
    if (lowerMsg.includes("motivat") || lowerMsg.includes("inspire") || lowerMsg.includes("encourage")) {
      const quotes = [
        "Small daily improvements lead to staggering long-term results.",
        "The secret of getting ahead is getting started.",
        "You don't have to be great to start, but you have to start to be great.",
        "Success is the sum of small efforts repeated day in and day out.",
      ];
      return `💪 ${quotes[Math.floor(Math.random() * quotes.length)]}\n\nYou're at Level ${userData.level} with ${userData.xp} XP. Every action counts!`;
    }

    // Default
    return `I understand you're asking about "${userMessage}". I can help you with goals, tasks, habits, and productivity analysis. Try asking:\n- "What are my priorities?"\n- "Suggest habits for me"\n- "Analyze my performance"\n- "Add task [name]"`;
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
    }, 800 + Math.random() * 700);
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg glow z-50" size="icon">
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[380px] h-[500px] glass shadow-xl z-50 flex flex-col animate-scale-in">
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
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 mx-auto text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Hi! I'm your ARISE AI assistant.</p>
                <p className="text-xs text-muted-foreground mt-1">Tell me your goals, ask for habit suggestions, or let me analyze your progress!</p>
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
        <div className="p-4 border-t border-border">
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
