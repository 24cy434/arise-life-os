import { useState } from "react";
import { Plus, Search, CheckSquare, Trash2, Edit2, X, Save, Settings, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTasks, useCategories } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Task } from "@/lib/types";

const Tasks = () => {
  const { tasks, addTask, updateTask, toggleTask, deleteTask, pendingTasks, completedTasks } = useTasks();
  const { categories, addCategory, deleteCategory } = useCategories();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'all' | 'category'>('all');
  const [newTask, setNewTask] = useState({ 
    title: "", 
    description: "", 
    priority: "medium" as const, 
    category: "Work", 
    dueDate: new Date().toISOString().split('T')[0], 
    estimatedMinutes: 30 
  });
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const categoryColors = ["bg-primary", "bg-accent", "bg-arise-success", "bg-arise-warning", "bg-arise-energy", "bg-destructive"];
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const handleAddTask = () => {
    if (!newTask.title.trim()) { 
      toast({ title: "Title required", variant: "destructive" }); 
      return; 
    }
    addTask({ ...newTask, completed: false, subtasks: [] });
    toast({ title: "Task added! +10 XP" });
    setNewTask({ 
      title: "", 
      description: "", 
      priority: "medium", 
      category: "Work", 
      dueDate: new Date().toISOString().split('T')[0], 
      estimatedMinutes: 30 
    });
    setIsAdding(false);
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;
    updateTask(editingTask);
    toast({ title: "Task updated!" });
    setEditingTask(null);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const randomColor = categoryColors[Math.floor(Math.random() * categoryColors.length)];
    addCategory(newCategoryName, randomColor);
    toast({ title: "Category added!" });
    setNewCategoryName("");
  };

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Group tasks by category
  const tasksByCategory = categories.reduce((acc, cat) => {
    acc[cat.name] = filteredTasks.filter(t => t.category === cat.name);
    return acc;
  }, {} as Record<string, Task[]>);

  const TaskItem = ({ task }: { task: Task }) => (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg bg-secondary/30 group transition-all hover:bg-secondary/50",
      task.completed && "opacity-50"
    )}>
      <Checkbox 
        checked={task.completed} 
        onCheckedChange={() => {
          toggleTask(task.id);
          toast({ title: task.completed ? "Task uncompleted" : "Task completed! +10 XP" });
        }} 
      />
      <div className="flex-1 min-w-0">
        <p className={cn("font-medium text-sm", task.completed && "line-through")}>{task.title}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full",
            task.priority === 'high' ? "bg-destructive/20 text-destructive" : 
            task.priority === 'medium' ? "bg-arise-warning/20 text-arise-warning" : 
            "bg-arise-success/20 text-arise-success"
          )}>
            {task.priority}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">{task.category}</span>
          <span className="text-xs text-muted-foreground">{new Date(task.dueDate).toLocaleDateString()}</span>
          {task.estimatedMinutes && <span className="text-xs text-muted-foreground">{task.estimatedMinutes}m</span>}
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="opacity-0 group-hover:opacity-100 h-8 w-8" 
        onClick={() => setEditingTask(task)}
      >
        <Edit2 className="w-4 h-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="opacity-0 group-hover:opacity-100 h-8 w-8" 
        onClick={() => {
          deleteTask(task.id);
          toast({ title: "Task deleted" });
        }}
      >
        <Trash2 className="w-4 h-4 text-destructive" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-primary" />Tasks
          </h1>
          <p className="text-muted-foreground text-sm">{pendingTasks.length} pending • {completedTasks.length} completed</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'category' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode(viewMode === 'all' ? 'category' : 'all')}
          >
            <FolderOpen className="w-4 h-4 mr-1" />
            {viewMode === 'category' ? 'By Category' : 'All Tasks'}
          </Button>
          <Dialog open={showCategoryManager} onOpenChange={setShowCategoryManager}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Settings className="w-4 h-4" /></Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Manage Categories</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="New category name" 
                    value={newCategoryName} 
                    onChange={(e) => setNewCategoryName(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <Button onClick={handleAddCategory}>Add</Button>
                </div>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-4 h-4 rounded-full", cat.color)} />
                        <span>{cat.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({tasks.filter(t => t.category === cat.name).length} tasks)
                        </span>
                      </div>
                      {!['1', '2', '3', '4'].includes(cat.id) && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => deleteCategory(cat.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={() => setIsAdding(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />Add Task
          </Button>
        </div>
      </div>

      {/* Progress Card */}
      <Card className="glass">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Overall Progress</span>
            <span className="text-sm font-medium">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </CardContent>
      </Card>

      {/* Add Task Form */}
      {isAdding && (
        <Card className="glass animate-scale-in">
          <CardContent className="pt-4 space-y-3">
            <Input 
              placeholder="Task title" 
              value={newTask.title} 
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} 
              autoFocus
            />
            <Textarea 
              placeholder="Description (optional)" 
              value={newTask.description} 
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} 
              className="min-h-[60px]" 
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Select value={newTask.priority} onValueChange={(v: any) => setNewTask({ ...newTask, priority: v })}>
                <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🔴 High</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="low">🟢 Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newTask.category} onValueChange={(v) => setNewTask({ ...newTask, category: v })}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.name}>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", c.color)} />
                        {c.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input 
                type="date" 
                value={newTask.dueDate} 
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} 
              />
              <Input 
                type="number" 
                placeholder="Est. mins" 
                value={newTask.estimatedMinutes} 
                onChange={(e) => setNewTask({ ...newTask, estimatedMinutes: parseInt(e.target.value) || 30 })} 
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleAddTask}>Add Task</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Task Form */}
      {editingTask && (
        <Card className="glass animate-scale-in border-primary">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Edit Task</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setEditingTask(null)}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input 
              value={editingTask.title} 
              onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })} 
            />
            <Textarea 
              value={editingTask.description || ""} 
              onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })} 
              className="min-h-[60px]" 
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Select value={editingTask.priority} onValueChange={(v: any) => setEditingTask({ ...editingTask, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🔴 High</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="low">🟢 Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={editingTask.category} onValueChange={(v) => setEditingTask({ ...editingTask, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input 
                type="date" 
                value={editingTask.dueDate} 
                onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })} 
              />
              <Input 
                type="number" 
                value={editingTask.estimatedMinutes || 30} 
                onChange={(e) => setEditingTask({ ...editingTask, estimatedMinutes: parseInt(e.target.value) || 30 })} 
              />
            </div>
            <Button className="w-full" onClick={handleUpdateTask}>
              <Save className="w-4 h-4 mr-2" />Save Changes
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search tasks..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          className="pl-10" 
        />
      </div>

      {/* Category View */}
      {viewMode === 'category' ? (
        <Accordion type="multiple" defaultValue={categories.map(c => c.name)} className="space-y-2">
          {categories.map((category) => {
            const categoryTasks = tasksByCategory[category.name] || [];
            const pendingCount = categoryTasks.filter(t => !t.completed).length;
            return (
              <AccordionItem key={category.id} value={category.name} className="border-0">
                <Card className="glass">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-4 h-4 rounded-full", category.color)} />
                      <span className="font-medium">{category.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {pendingCount} pending • {categoryTasks.length} total
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    {categoryTasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No tasks in this category</p>
                    ) : (
                      <div className="space-y-2">
                        {categoryTasks.map((task) => <TaskItem key={task.id} task={task} />)}
                      </div>
                    )}
                  </AccordionContent>
                </Card>
              </AccordionItem>
            );
          })}
        </Accordion>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="glass">
            <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
            <TabsTrigger value="done">Done ({completedTasks.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-2 mt-4">
            {filteredTasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No tasks yet. Add your first task!</p>
            ) : (
              filteredTasks.map((task) => <TaskItem key={task.id} task={task} />)
            )}
          </TabsContent>
          <TabsContent value="pending" className="space-y-2 mt-4">
            {pendingTasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">All done! 🎉</p>
            ) : (
              pendingTasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).map((task) => (
                <TaskItem key={task.id} task={task} />
              ))
            )}
          </TabsContent>
          <TabsContent value="done" className="space-y-2 mt-4">
            {completedTasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No completed tasks yet</p>
            ) : (
              completedTasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).map((task) => (
                <TaskItem key={task.id} task={task} />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Tasks;
