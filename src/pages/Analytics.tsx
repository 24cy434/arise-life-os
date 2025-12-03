import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Brain,
  Flame,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductivityChart from "@/components/analytics/ProductivityChart";
import MoodAnalytics from "@/components/analytics/MoodAnalytics";
import HabitHeatmap from "@/components/analytics/HabitHeatmap";
import { cn } from "@/lib/utils";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");

  const stats = [
    {
      label: "Productivity Score",
      value: "78%",
      change: 12,
      icon: TrendingUp,
      color: "text-arise-success",
    },
    {
      label: "Tasks Completed",
      value: "42",
      change: 8,
      icon: CheckCircle2,
      color: "text-primary",
    },
    {
      label: "Focus Hours",
      value: "18.5h",
      change: -5,
      icon: Clock,
      color: "text-accent",
    },
    {
      label: "Current Streak",
      value: "7 days",
      change: 2,
      icon: Flame,
      color: "text-arise-energy",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-arise-success" />
            Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Insights to optimize your performance
          </p>
        </div>
        <div className="flex bg-secondary rounded-lg p-1">
          {(["week", "month", "year"] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="capitalize"
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="glass">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 mt-2 text-xs",
                  stat.change >= 0 ? "text-arise-success" : "text-destructive"
                )}
              >
                {stat.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>
                  {stat.change >= 0 ? "+" : ""}
                  {stat.change}% from last {timeRange}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="productivity" className="w-full">
        <TabsList className="glass">
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="mood">Mood & Energy</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="productivity" className="mt-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <ProductivityChart />
            </div>
            <div className="space-y-6">
              {/* Goal Progress */}
              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Goal Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Weekly Tasks</span>
                      <span>42/50</span>
                    </div>
                    <Progress value={84} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Focus Hours</span>
                      <span>18.5/25h</span>
                    </div>
                    <Progress value={74} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Journal Entries</span>
                      <span>5/7</span>
                    </div>
                    <Progress value={71} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Best Performance */}
              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Peak Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Best Day</span>
                    <span className="font-medium">Tuesday</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Best Time</span>
                    <span className="font-medium">10 AM - 12 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg. Session</span>
                    <span className="font-medium">45 min</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="mood" className="mt-6">
          <MoodAnalytics />
        </TabsContent>

        <TabsContent value="habits" className="mt-6">
          <HabitHeatmap />
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  AI Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-arise-success/10 border border-arise-success/20">
                  <h4 className="font-medium text-arise-success mb-1">Strength</h4>
                  <p className="text-sm text-muted-foreground">
                    Your task completion rate improved by 15% when you start with
                    a morning review routine.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-arise-warning/10 border border-arise-warning/20">
                  <h4 className="font-medium text-arise-warning mb-1">
                    Area for Improvement
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Focus sessions after 3 PM have 40% lower quality scores.
                    Consider scheduling breaks.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <h4 className="font-medium text-primary mb-1">Recommendation</h4>
                  <p className="text-sm text-muted-foreground">
                    Based on your patterns, adding a 15-minute journaling session
                    before deep work could boost focus by 25%.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle>Correlations Detected</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-arise-success/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4 text-arise-success" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Sleep → Productivity</p>
                    <p className="text-xs text-muted-foreground">
                      7+ hours of sleep correlates with 30% higher productivity
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Journal → Mood</p>
                    <p className="text-xs text-muted-foreground">
                      Days with journal entries show 20% better mood scores
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Brain className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Focus → Tasks</p>
                    <p className="text-xs text-muted-foreground">
                      Pomodoro sessions lead to 45% more task completions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
