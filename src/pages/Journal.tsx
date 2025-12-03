import { useState } from "react";
import {
  Plus,
  Search,
  Calendar,
  Tag,
  BookOpen,
  Sparkles,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JournalEditor from "@/components/journal/JournalEditor";
import JournalEntryCard from "@/components/journal/JournalEntryCard";
import MoodTrend from "@/components/journal/MoodTrend";
import JournalPrompts from "@/components/journal/JournalPrompts";

const mockEntries = [
  {
    id: 1,
    date: "2024-01-15",
    title: "A productive Monday",
    content:
      "Started the week with a clear mind. Completed all morning tasks and had a great focus session...",
    mood: 4,
    tags: ["productivity", "work", "positive"],
    sentiment: "positive",
  },
  {
    id: 2,
    date: "2024-01-14",
    title: "Sunday reflections",
    content:
      "Took time to review the past week. Some areas need improvement, especially time management...",
    mood: 3,
    tags: ["reflection", "weekend", "planning"],
    sentiment: "neutral",
  },
  {
    id: 3,
    date: "2024-01-13",
    title: "Challenging day",
    content:
      "Faced some unexpected obstacles today. Learning to adapt and stay resilient...",
    mood: 2,
    tags: ["challenges", "growth", "learning"],
    sentiment: "mixed",
  },
];

const Journal = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-accent" />
            Journal
          </h1>
          <p className="text-muted-foreground mt-1">
            Reflect, process, and grow through writing
          </p>
        </div>
        <Button onClick={() => setIsEditing(true)} className="glow">
          <Plus className="w-4 h-4 mr-2" />
          New Entry
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Calendar className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Tag className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {isEditing ? (
            <JournalEditor onClose={() => setIsEditing(false)} />
          ) : (
            <Tabs defaultValue="entries" className="w-full">
              <TabsList className="glass">
                <TabsTrigger value="entries">All Entries</TabsTrigger>
                <TabsTrigger value="prompts">Prompts</TabsTrigger>
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
              </TabsList>
              <TabsContent value="entries" className="space-y-4 mt-4">
                {mockEntries.map((entry) => (
                  <JournalEntryCard key={entry.id} entry={entry} />
                ))}
              </TabsContent>
              <TabsContent value="prompts" className="mt-4">
                <JournalPrompts />
              </TabsContent>
              <TabsContent value="insights" className="mt-4">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Journal Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Based on your recent entries, you show a pattern of increased
                      positivity when you complete morning routines. Consider making
                      them a consistent habit.
                    </p>
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-sm font-medium">Key Theme Detected</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        "Growth mindset" appears frequently in your positive entries
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <MoodTrend />

          {/* Quick Stats */}
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Journal Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Entries</span>
                <span className="font-bold">127</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">This Week</span>
                <span className="font-bold">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Streak</span>
                <span className="font-bold text-arise-energy">12 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg. Mood</span>
                <span className="font-bold text-arise-success">3.8/5</span>
              </div>
            </CardContent>
          </Card>

          {/* Popular Tags */}
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Popular Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["productivity", "work", "reflection", "growth", "goals", "habits"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs rounded-full bg-secondary hover:bg-secondary/80 cursor-pointer transition-colors"
                    >
                      #{tag}
                    </span>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Journal;
