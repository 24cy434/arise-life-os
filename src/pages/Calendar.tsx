import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2, Clock, Repeat, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCalendar, useTasks, useHabits } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Calendar = () => {
  const { events, addEvent, updateEvent, deleteEvent, getEventsForDate } = useCalendar();
  const { tasks } = useTasks();
  const { habits, isCompletedToday } = useHabits();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAdding, setIsAdding] = useState(false);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [newEvent, setNewEvent] = useState({ title: "", type: "meeting" as const, time: "09:00", duration: "1h", recurring: "" as "" | "daily" | "weekly" | "monthly" });

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const today = new Date().toISOString().split('T')[0];

  const getColorForType = (type: string) => {
    switch (type) {
      case 'focus': return 'bg-primary';
      case 'meeting': return 'bg-arise-warning';
      case 'routine': return 'bg-accent';
      case 'break': return 'bg-arise-success';
      case 'habit': return 'bg-arise-energy';
      default: return 'bg-secondary';
    }
  };

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) { toast({ title: "Title required", variant: "destructive" }); return; }
    addEvent({ 
      ...newEvent, 
      date: selectedDate, 
      color: getColorForType(newEvent.type),
      recurring: newEvent.recurring || undefined,
    });
    toast({ title: "Event added!" });
    setNewEvent({ title: "", type: "meeting", time: "09:00", duration: "1h", recurring: "" });
    setIsAdding(false);
  };

  const toggleEventComplete = (event: typeof events[0]) => {
    updateEvent({ ...event, completed: !event.completed });
  };

  const selectedEvents = getEventsForDate(selectedDate);
  const selectedTasks = tasks.filter(t => t.dueDate === selectedDate);
  const selectedDayHabits = habits.filter(h => h.frequency === 'daily' || (h.frequency === 'weekly' && h.targetDays?.includes(new Date(selectedDate).getDay())));

  // Week view helpers
  const getWeekDates = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  };

  const weekDates = getWeekDates();
  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><CalendarIcon className="w-6 h-6 text-arise-info" />Calendar</h1>
        <div className="flex gap-2">
          <div className="flex bg-secondary rounded-lg p-1">
            <Button variant={view === 'month' ? 'default' : 'ghost'} size="sm" onClick={() => setView('month')}>Month</Button>
            <Button variant={view === 'week' ? 'default' : 'ghost'} size="sm" onClick={() => setView('week')}>Week</Button>
          </div>
          <Button size="sm" onClick={() => setIsAdding(true)}><Plus className="w-4 h-4 mr-2" />Add</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Calendar View */}
        <div className="md:col-span-2">
          <Card className="glass">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}><ChevronLeft className="w-4 h-4" /></Button>
                <span className="font-medium">{currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              {view === 'month' ? (
                <>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const dayEvents = events.filter(e => e.date === dateStr);
                      const dayTasks = tasks.filter(t => t.dueDate === dateStr);
                      const hasItems = dayEvents.length > 0 || dayTasks.length > 0;
                      return (
                        <button key={day} onClick={() => setSelectedDate(dateStr)} className={cn("aspect-square rounded-md text-sm flex flex-col items-center justify-center relative p-1", dateStr === selectedDate && "bg-primary text-primary-foreground", dateStr === today && dateStr !== selectedDate && "ring-1 ring-primary", dateStr !== selectedDate && "hover:bg-secondary/50")}>
                          <span>{day}</span>
                          {hasItems && (
                            <div className="flex gap-0.5 mt-0.5">
                              {dayEvents.slice(0, 3).map((e, idx) => <div key={idx} className={cn("w-1.5 h-1.5 rounded-full", e.color)} />)}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-8 gap-1 min-w-[600px]">
                    <div />
                    {weekDates.map((date) => (
                      <div key={date} className={cn("text-center p-2 rounded-lg", date === today && "bg-primary/10", date === selectedDate && "ring-1 ring-primary")}>
                        <p className="text-xs text-muted-foreground">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(date).getDay()]}</p>
                        <p className="font-medium">{new Date(date).getDate()}</p>
                      </div>
                    ))}
                    {hours.map((hour) => (
                      <>
                        <div key={`h-${hour}`} className="text-xs text-muted-foreground text-right pr-2 py-2">{hour}:00</div>
                        {weekDates.map((date) => {
                          const hourEvents = events.filter(e => e.date === date && parseInt(e.time.split(':')[0]) === hour);
                          return (
                            <div key={`${date}-${hour}`} className="border-t border-border min-h-[40px] relative" onClick={() => { setSelectedDate(date); setNewEvent({ ...newEvent, time: `${String(hour).padStart(2, '0')}:00` }); }}>
                              {hourEvents.map((e) => (
                                <div key={e.id} className={cn("absolute inset-x-0 rounded text-xs p-1 text-primary-foreground truncate", e.color)} style={{ top: 0 }}>{e.title}</div>
                              ))}
                            </div>
                          );
                        })}
                      </>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected Date Events */}
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {selectedEvents.length === 0 && selectedTasks.length === 0 && selectedDayHabits.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No events for this day</p>
              ) : (
                <>
                  {selectedEvents.map((e) => (
                    <div key={e.id} className={cn("p-2 rounded-lg text-sm group flex items-start justify-between", e.completed ? "opacity-50" : "", e.color, "text-primary-foreground")}>
                      <div className="flex items-start gap-2">
                        <button onClick={() => toggleEventComplete(e)} className="mt-0.5">
                          {e.completed ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </button>
                        <div>
                          <p className={cn("font-medium", e.completed && "line-through")}>{e.title}</p>
                          <p className="text-xs opacity-80">{e.time} • {e.duration} {e.recurring && <Repeat className="w-3 h-3 inline" />}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => deleteEvent(e.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  ))}
                  {selectedTasks.map((t) => (
                    <div key={t.id} className="p-2 rounded-lg bg-secondary/50 text-sm">
                      <p className={cn(t.completed && "line-through text-muted-foreground")}>{t.title}</p>
                      <p className="text-xs text-muted-foreground">Task • {t.priority} priority</p>
                    </div>
                  ))}
                  {selectedDayHabits.map((h) => (
                    <div key={h.id} className={cn("p-2 rounded-lg text-sm", isCompletedToday(h.id) ? "bg-arise-success/20" : "bg-secondary/50")}>
                      <p className={cn(isCompletedToday(h.id) && "line-through")}>{h.title}</p>
                      <p className="text-xs text-muted-foreground">Habit • {h.frequency}</p>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>

          {/* Add Event Form */}
          {isAdding && (
            <Card className="glass animate-scale-in">
              <CardHeader className="pb-2"><CardTitle className="text-base">New Event</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Event title" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <Select value={newEvent.type} onValueChange={(v: any) => setNewEvent({ ...newEvent, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="focus">Focus</SelectItem>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="break">Break</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={newEvent.duration} onValueChange={(v) => setNewEvent({ ...newEvent, duration: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15m">15m</SelectItem>
                      <SelectItem value="30m">30m</SelectItem>
                      <SelectItem value="1h">1h</SelectItem>
                      <SelectItem value="2h">2h</SelectItem>
                      <SelectItem value="3h">3h</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={newEvent.recurring} onValueChange={(v: any) => setNewEvent({ ...newEvent, recurring: v })}>
                    <SelectTrigger><SelectValue placeholder="Repeat" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No repeat</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setIsAdding(false)}>Cancel</Button>
                  <Button className="flex-1" onClick={handleAddEvent}>Add</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card className="glass">
            <CardHeader className="pb-2"><CardTitle className="text-base">This Week</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2 rounded-lg bg-secondary/50">
                  <p className="text-xl font-bold">{events.filter(e => weekDates.includes(e.date)).length}</p>
                  <p className="text-xs text-muted-foreground">Events</p>
                </div>
                <div className="p-2 rounded-lg bg-secondary/50">
                  <p className="text-xl font-bold">{tasks.filter(t => weekDates.includes(t.dueDate)).length}</p>
                  <p className="text-xs text-muted-foreground">Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
