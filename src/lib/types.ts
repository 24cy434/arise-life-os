export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  category: string;
  subtasks: Subtask[];
  createdAt: string;
  completedAt?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: number;
  tags: string[];
  createdAt: string;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed';
}

export interface FocusSession {
  id: string;
  mode: string;
  duration: number;
  completedDuration: number;
  taskId?: string;
  quality?: number;
  startedAt: string;
  completedAt?: string;
  completed: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'routine' | 'focus' | 'meeting' | 'break' | 'task';
  date: string;
  time: string;
  duration: string;
  taskId?: string;
  color: string;
}

export interface MoodLog {
  id: string;
  mood: number;
  energy?: number;
  date: string;
  note?: string;
}

export interface UserStats {
  totalTasks: number;
  completedTasks: number;
  totalFocusMinutes: number;
  totalJournalEntries: number;
  currentTaskStreak: number;
  currentFocusStreak: number;
  currentJournalStreak: number;
  level: number;
  xp: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt?: string;
  icon: string;
}
