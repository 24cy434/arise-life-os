import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCalendar, useTasks } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Calendar = () => {
  const { events, addEvent, getEventsForDate } = useCalendar();
  const { tasks } = useTasks();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAdding, setIsAdding] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", type: "meeting" as const, time: "09:00", duration: "1h" });

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const today = new Date().toISOString().split('T')[0];

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) { toast({ title: "Title required", variant: "destructive" }); return; }
    addEvent({ ...newEvent, date: selectedDate, color: newEvent.type === 'focus' ? 'bg-primary' : newEvent.type === 'meeting' ? 'bg-arise-warning' : 'bg-accent' });
    toast({ title: "Event added!" });
    setNewEvent({ title: "", type: "meeting", time: "09:00", duration: "1h" });
    setIsAdding(false);
  };

  const selectedEvents = getEventsForDate(selectedDate);
  const selectedTasks = tasks.filter(t => t.dueDate === selectedDate);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><CalendarIcon className="w-6 h-6 text-arise-info" />Calendar</h1>
        <Button size="sm" onClick={() => setIsAdding(true)}><Plus className="w-4 h-4 mr-2" />Add</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="glass">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}><ChevronLeft className="w-4 h-4" /></Button>
              <span className="font-medium">{currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
              <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasItems = events.some(e => e.date === dateStr) || tasks.some(t => t.dueDate === dateStr);
                return (
                  <button key={day} onClick={() => setSelectedDate(dateStr)} className={cn("aspect-square rounded-md text-sm flex flex-col items-center justify-center relative", dateStr === selectedDate && "bg-primary text-primary-foreground", dateStr === today && dateStr !== selectedDate && "ring-1 ring-primary", dateStr !== selectedDate && "hover:bg-secondary/50")}>
                    {day}{hasItems && <div className="w-1 h-1 rounded-full bg-arise-energy absolute bottom-1" />}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="glass">
            <CardHeader className="pb-2"><CardTitle className="text-base">{new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {selectedEvents.length === 0 && selectedTasks.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No events</p> : (
                <>{selectedEvents.map((e) => (<div key={e.id} className={cn("p-2 rounded-lg text-sm text-primary-foreground", e.color)}><p className="font-medium">{e.title}</p><p className="text-xs opacity-80">{e.time} • {e.duration}</p></div>))}
                {selectedTasks.map((t) => (<div key={t.id} className="p-2 rounded-lg bg-secondary/50 text-sm"><p className={cn(t.completed && "line-through text-muted-foreground")}>{t.title}</p></div>))}</>
              )}
            </CardContent>
          </Card>

          {isAdding && (
            <Card className="glass animate-scale-in">
              <CardContent className="pt-4 space-y-3">
                <Input placeholder="Event title" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
                <div className="grid grid-cols-3 gap-2">
                  <Select value={newEvent.type} onValueChange={(v: any) => setNewEvent({ ...newEvent, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="meeting">Meeting</SelectItem><SelectItem value="focus">Focus</SelectItem><SelectItem value="routine">Routine</SelectItem></SelectContent></Select>
                  <Input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} />
                  <Select value={newEvent.duration} onValueChange={(v) => setNewEvent({ ...newEvent, duration: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="30m">30m</SelectItem><SelectItem value="1h">1h</SelectItem><SelectItem value="2h">2h</SelectItem></SelectContent></Select>
                </div>
                <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setIsAdding(false)}>Cancel</Button><Button className="flex-1" onClick={handleAddEvent}>Add</Button></div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
