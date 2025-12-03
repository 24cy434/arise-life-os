import { useState } from "react";
import {
  Plus,
  Target,
  BookOpen,
  TrendingUp,
  Flame,
  Zap,
  Brain,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import QuickActionCard from "@/components/home/QuickActionCard";
import ProductivityScore from "@/components/home/ProductivityScore";
import TodaySchedule from "@/components/home/TodaySchedule";
import MoodSnapshot from "@/components/home/MoodSnapshot";
import RecentAchievements from "@/components/home/RecentAchievements";
import AIInsights from "@/components/home/AIInsights";

const Home = () => {
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {greeting}, <span className="gradient-text">Achiever</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Let's make today count. You have 5 tasks pending.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Clock className="w-4 h-4 mr-2" />
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickActionCard
          icon={Plus}
          label="Add Task"
          href="/tasks"
          color="primary"
        />
        <QuickActionCard
          icon={BookOpen}
          label="Journal"
          href="/journal"
          color="accent"
        />
        <QuickActionCard
          icon={Target}
          label="Focus"
          href="/focus"
          color="energy"
        />
        <QuickActionCard
          icon={TrendingUp}
          label="Analytics"
          href="/analytics"
          color="success"
        />
      </div>

      {/* Main Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Productivity Score */}
          <ProductivityScore score={78} change={12} />

          {/* Today's Schedule */}
          <TodaySchedule />

          {/* AI Insights */}
          <AIInsights />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Mood Snapshot */}
          <MoodSnapshot />

          {/* Streaks */}
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Flame className="w-5 h-5 text-arise-energy" />
                Active Streaks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-arise-success" />
                  <span className="text-sm">Daily Tasks</span>
                </div>
                <span className="font-bold text-arise-energy">7 days</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <span className="text-sm">Focus Sessions</span>
                </div>
                <span className="font-bold text-arise-energy">5 days</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-accent" />
                  <span className="text-sm">Journaling</span>
                </div>
                <span className="font-bold text-arise-energy">12 days</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <RecentAchievements />
        </div>
      </div>
    </div>
  );
};

export default Home;
