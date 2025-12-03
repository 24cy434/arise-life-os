import { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Target,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const mockEvents = [
  {
    id: 1,
    title: "Morning Review",
    time: "09:00",
    duration: "30m",
    type: "routine",
    color: "bg-accent",
  },
  {
    id: 2,
    title: "Deep Work: Project Alpha",
    time: "10:00",
    duration: "2h",
    type: "focus",
    color: "bg-primary",
  },
  {
    id: 3,
    title: "Team Standup",
    time: "12:00",
    duration: "30m",
    type: "meeting",
    color: "bg-arise-warning",
  },
  {
    id: 4,
    title: "Lunch Break",
    time: "12:30",
    duration: "1h",
    type: "break",
    color: "bg-arise-success",
  },
  {
    id: 5,
    title: "Focus Session: Documentation",
    time: "14:00",
    duration: "1.5h",
    type: "focus",
    color: "bg-primary",
  },
  {
    id: 6,
    title: "Evening Review & Planning",
    time: "17:00",
    duration: "30m",
    type: "routine",
    color: "bg-accent",
  },
];

const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("day");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-8 h-8 text-arise-info" />
            Calendar
          </h1>
          <p className="text-muted-foreground mt-1">
            Plan your time, optimize your energy
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-secondary rounded-lg p-1">
            {(["day", "week", "month"] as const).map((v) => (
              <Button
                key={v}
                variant={view === v ? "default" : "ghost"}
                size="sm"
                onClick={() => setView(v)}
                className="capitalize"
              >
                {v}
              </Button>
            ))}
          </div>
          <Button className="glow">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Main Calendar View */}
        <div className="md:col-span-3 space-y-6">
          {/* Date Navigation */}
          <Card className="glass">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h2 className="text-xl font-semibold">
                  {date?.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h2>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Day View */}
              {view === "day" && (
                <div className="relative">
                  {/* Time Grid */}
                  <div className="space-y-0">
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="flex border-t border-border h-20"
                      >
                        <div className="w-16 pr-2 text-right text-sm text-muted-foreground -mt-2">
                          {hour > 12 ? hour - 12 : hour}:00{" "}
                          {hour >= 12 ? "PM" : "AM"}
                        </div>
                        <div className="flex-1 relative">
                          {/* Events */}
                          {mockEvents
                            .filter(
                              (event) =>
                                parseInt(event.time.split(":")[0]) === hour
                            )
                            .map((event) => (
                              <div
                                key={event.id}
                                className={cn(
                                  "absolute left-1 right-4 rounded-lg p-2 text-sm",
                                  event.color,
                                  "text-primary-foreground"
                                )}
                                style={{ top: "4px" }}
                              >
                                <p className="font-medium truncate">
                                  {event.title}
                                </p>
                                <p className="text-xs opacity-80">
                                  {event.time} • {event.duration}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Week/Month View Placeholder */}
              {view !== "day" && (
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  {view === "week" ? "Week" : "Month"} view coming soon
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Mini Calendar */}
          <Card className="glass">
            <CardContent className="pt-4">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md"
              />
            </CardContent>
          </Card>

          {/* Energy Forecast */}
          <Card className="glass border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Energy Forecast</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-arise-success" />
                <span className="text-sm">Peak: 10 AM - 12 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-arise-warning" />
                <span className="text-sm">Moderate: 2 PM - 4 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <span className="text-sm">Low: After 5 PM</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Based on your historical patterns
              </p>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Today's Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockEvents.slice(0, 4).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className={cn("w-1 h-8 rounded-full", event.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
