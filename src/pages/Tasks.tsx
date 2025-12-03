import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  CheckSquare,
  Clock,
  Flag,
  MoreHorizontal,
  Calendar,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import TaskItem from "@/components/tasks/TaskItem";
import TaskEditor from "@/components/tasks/TaskEditor";
import BrainDump from "@/components/tasks/BrainDump";

const mockTasks = [
  {
    id: 1,
    title: "Complete project documentation",
    completed: false,
    priority: "high",
    dueDate: "2024-01-16",
    category: "Work",
    subtasks: [
      { id: 11, title: "Write introduction", completed: true },
      { id: 12, title: "Add code examples", completed: false },
    ],
  },
  {
    id: 2,
    title: "Review team feedback",
    completed: false,
    priority: "medium",
    dueDate: "2024-01-17",
    category: "Work",
    subtasks: [],
  },
  {
    id: 3,
    title: "Morning meditation",
    completed: true,
    priority: "low",
    dueDate: "2024-01-15",
    category: "Wellness",
    subtasks: [],
  },
  {
    id: 4,
    title: "Prepare weekly report",
    completed: false,
    priority: "high",
    dueDate: "2024-01-15",
    category: "Work",
    subtasks: [],
  },
  {
    id: 5,
    title: "Read 30 pages",
    completed: false,
    priority: "low",
    dueDate: "2024-01-15",
    category: "Personal",
    subtasks: [],
  },
];

const Tasks = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState(mockTasks);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const completionRate = Math.round((completedCount / totalCount) * 100);

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CheckSquare className="w-8 h-8 text-primary" />
            Tasks
          </h1>
          <p className="text-muted-foreground mt-1">
            Organize, prioritize, and conquer your day
          </p>
        </div>
        <Button onClick={() => setIsEditing(true)} className="glow">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Progress Overview */}
      <Card className="glass">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Today's Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedCount} of {totalCount} tasks
            </span>
          </div>
          <Progress value={completionRate} className="h-2" />
          <div className="flex gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span>2 High Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-arise-warning" />
              <span>1 Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-arise-success" />
              <span>2 Low</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Calendar className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {isEditing ? (
            <TaskEditor onClose={() => setIsEditing(false)} />
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="glass">
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3 mt-4">
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={() => toggleTask(task.id)}
                  />
                ))}
              </TabsContent>

              <TabsContent value="today" className="space-y-3 mt-4">
                {tasks
                  .filter((t) => t.dueDate === "2024-01-15")
                  .map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={() => toggleTask(task.id)}
                    />
                  ))}
              </TabsContent>

              <TabsContent value="upcoming" className="space-y-3 mt-4">
                {tasks
                  .filter((t) => !t.completed && t.dueDate !== "2024-01-15")
                  .map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={() => toggleTask(task.id)}
                    />
                  ))}
              </TabsContent>

              <TabsContent value="completed" className="space-y-3 mt-4">
                {tasks
                  .filter((t) => t.completed)
                  .map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={() => toggleTask(task.id)}
                    />
                  ))}
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Suggestions */}
          <Card className="glass border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-primary/10 text-sm">
                <p className="font-medium">Focus on high-priority first</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Complete "Project documentation" before the meeting
                </p>
              </div>
              <div className="p-3 rounded-lg bg-arise-warning/10 text-sm">
                <p className="font-medium">Task at risk</p>
                <p className="text-xs text-muted-foreground mt-1">
                  "Weekly report" is due today but not started
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Brain Dump */}
          <BrainDump />

          {/* Categories */}
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {["Work", "Personal", "Wellness", "Learning"].map((category) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                >
                  <span className="text-sm">{category}</span>
                  <span className="text-xs text-muted-foreground">
                    {tasks.filter((t) => t.category === category).length}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
