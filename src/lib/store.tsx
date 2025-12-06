import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Task, JournalEntry, FocusSession, CalendarEvent, MoodLog, UserStats, Achievement, Habit, AIMessage, UserProfile, Category } from './types';

interface AppState {
  tasks: Task[];
  journalEntries: JournalEntry[];
  focusSessions: FocusSession[];
  calendarEvents: CalendarEvent[];
  moodLogs: MoodLog[];
  habits: Habit[];
  userStats: UserStats;
  achievements: Achievement[];
  userName: string;
  categories: Category[];
  aiMessages: AIMessage[];
  userProfile: UserProfile;
}

type Action =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'ADD_JOURNAL_ENTRY'; payload: JournalEntry }
  | { type: 'UPDATE_JOURNAL_ENTRY'; payload: JournalEntry }
  | { type: 'DELETE_JOURNAL_ENTRY'; payload: string }
  | { type: 'ADD_FOCUS_SESSION'; payload: FocusSession }
  | { type: 'UPDATE_FOCUS_SESSION'; payload: FocusSession }
  | { type: 'ADD_CALENDAR_EVENT'; payload: CalendarEvent }
  | { type: 'UPDATE_CALENDAR_EVENT'; payload: CalendarEvent }
  | { type: 'DELETE_CALENDAR_EVENT'; payload: string }
  | { type: 'LOG_MOOD'; payload: MoodLog }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'COMPLETE_HABIT'; payload: { id: string; date: string } }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_AI_MESSAGE'; payload: AIMessage }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'UPDATE_STATS'; payload: Partial<UserStats> }
  | { type: 'ADD_XP'; payload: number }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: Achievement }
  | { type: 'SET_USER_NAME'; payload: string }
  | { type: 'LOAD_STATE'; payload: AppState };

const defaultCategories: Category[] = [
  { id: '1', name: 'Work', color: 'bg-primary' },
  { id: '2', name: 'Personal', color: 'bg-accent' },
  { id: '3', name: 'Health', color: 'bg-arise-success' },
  { id: '4', name: 'Learning', color: 'bg-arise-warning' },
];

const initialState: AppState = {
  tasks: [],
  journalEntries: [],
  focusSessions: [],
  calendarEvents: [],
  moodLogs: [],
  habits: [],
  userStats: { totalTasks: 0, completedTasks: 0, totalFocusMinutes: 0, totalJournalEntries: 0, currentTaskStreak: 0, currentFocusStreak: 0, currentJournalStreak: 0, level: 1, xp: 0 },
  achievements: [],
  userName: 'Achiever',
  categories: defaultCategories,
  aiMessages: [],
  userProfile: { name: '', goals: [], priorities: [], onboardingComplete: false },
};

function calculateLevel(xp: number): number { return Math.floor(xp / 100) + 1; }

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TASK': return { ...state, tasks: [...state.tasks, action.payload], userStats: { ...state.userStats, totalTasks: state.userStats.totalTasks + 1 } };
    case 'UPDATE_TASK': return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TASK': return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'TOGGLE_TASK': {
      const task = state.tasks.find(t => t.id === action.payload);
      if (!task) return state;
      const newCompleted = !task.completed;
      const newXp = newCompleted ? state.userStats.xp + 10 : state.userStats.xp - 10;
      return { ...state, tasks: state.tasks.map(t => t.id === action.payload ? { ...t, completed: newCompleted, completedAt: newCompleted ? new Date().toISOString() : undefined } : t), userStats: { ...state.userStats, completedTasks: newCompleted ? state.userStats.completedTasks + 1 : state.userStats.completedTasks - 1, xp: Math.max(0, newXp), level: calculateLevel(Math.max(0, newXp)) } };
    }
    case 'ADD_JOURNAL_ENTRY': return { ...state, journalEntries: [action.payload, ...state.journalEntries], userStats: { ...state.userStats, totalJournalEntries: state.userStats.totalJournalEntries + 1, xp: state.userStats.xp + 15, level: calculateLevel(state.userStats.xp + 15) } };
    case 'UPDATE_JOURNAL_ENTRY': return { ...state, journalEntries: state.journalEntries.map(e => e.id === action.payload.id ? action.payload : e) };
    case 'DELETE_JOURNAL_ENTRY': return { ...state, journalEntries: state.journalEntries.filter(e => e.id !== action.payload) };
    case 'ADD_FOCUS_SESSION': return { ...state, focusSessions: [action.payload, ...state.focusSessions] };
    case 'UPDATE_FOCUS_SESSION': {
      const session = action.payload;
      const xpGain = session.completed ? Math.floor(session.completedDuration / 60) * 5 : 0;
      return { ...state, focusSessions: state.focusSessions.map(s => s.id === session.id ? session : s), userStats: { ...state.userStats, totalFocusMinutes: state.userStats.totalFocusMinutes + Math.floor(session.completedDuration / 60), xp: state.userStats.xp + xpGain, level: calculateLevel(state.userStats.xp + xpGain) } };
    }
    case 'ADD_CALENDAR_EVENT': return { ...state, calendarEvents: [...state.calendarEvents, action.payload] };
    case 'UPDATE_CALENDAR_EVENT': return { ...state, calendarEvents: state.calendarEvents.map(e => e.id === action.payload.id ? action.payload : e) };
    case 'DELETE_CALENDAR_EVENT': return { ...state, calendarEvents: state.calendarEvents.filter(e => e.id !== action.payload) };
    case 'LOG_MOOD': return { ...state, moodLogs: [action.payload, ...state.moodLogs] };
    case 'ADD_HABIT': return { ...state, habits: [...state.habits, action.payload] };
    case 'UPDATE_HABIT': return { ...state, habits: state.habits.map(h => h.id === action.payload.id ? action.payload : h) };
    case 'DELETE_HABIT': return { ...state, habits: state.habits.filter(h => h.id !== action.payload) };
    case 'COMPLETE_HABIT': {
      const habit = state.habits.find(h => h.id === action.payload.id);
      if (!habit) return state;
      const alreadyDone = habit.completedDates.includes(action.payload.date);
      if (alreadyDone) return state;
      const newStreak = habit.streak + 1;
      const newXp = state.userStats.xp + 5;
      return { ...state, habits: state.habits.map(h => h.id === action.payload.id ? { ...h, completedDates: [...h.completedDates, action.payload.date], streak: newStreak, bestStreak: Math.max(h.bestStreak, newStreak) } : h), userStats: { ...state.userStats, xp: newXp, level: calculateLevel(newXp) } };
    }
    case 'ADD_CATEGORY': return { ...state, categories: [...state.categories, action.payload] };
    case 'DELETE_CATEGORY': return { ...state, categories: state.categories.filter(c => c.id !== action.payload) };
    case 'ADD_AI_MESSAGE': return { ...state, aiMessages: [...state.aiMessages, action.payload] };
    case 'UPDATE_PROFILE': return { ...state, userProfile: { ...state.userProfile, ...action.payload }, userName: action.payload.name || state.userName };
    case 'UPDATE_STATS': return { ...state, userStats: { ...state.userStats, ...action.payload } };
    case 'ADD_XP': { const newXp = state.userStats.xp + action.payload; return { ...state, userStats: { ...state.userStats, xp: newXp, level: calculateLevel(newXp) } }; }
    case 'UNLOCK_ACHIEVEMENT': return { ...state, achievements: [...state.achievements, action.payload] };
    case 'SET_USER_NAME': return { ...state, userName: action.payload };
    case 'LOAD_STATE': return action.payload;
    default: return state;
  }
}

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const saved = localStorage.getItem('arise-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_STATE', payload: { ...initialState, ...parsed, categories: parsed.categories?.length ? parsed.categories : defaultCategories } });
      } catch (e) { console.error('Failed to load saved data'); }
    }
  }, []);

  useEffect(() => { localStorage.setItem('arise-data', JSON.stringify(state)); }, [state]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

export function useTasks() {
  const { state, dispatch } = useApp();
  return {
    tasks: state.tasks,
    addTask: (task: Omit<Task, 'id' | 'createdAt'>) => dispatch({ type: 'ADD_TASK', payload: { ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString() } }),
    updateTask: (task: Task) => dispatch({ type: 'UPDATE_TASK', payload: task }),
    deleteTask: (id: string) => dispatch({ type: 'DELETE_TASK', payload: id }),
    toggleTask: (id: string) => dispatch({ type: 'TOGGLE_TASK', payload: id }),
    todayTasks: state.tasks.filter(t => t.dueDate === new Date().toISOString().split('T')[0]),
    pendingTasks: state.tasks.filter(t => !t.completed),
    completedTasks: state.tasks.filter(t => t.completed),
  };
}

export function useJournal() {
  const { state, dispatch } = useApp();
  return {
    entries: state.journalEntries,
    addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => dispatch({ type: 'ADD_JOURNAL_ENTRY', payload: { ...entry, id: crypto.randomUUID(), createdAt: new Date().toISOString() } }),
    updateEntry: (entry: JournalEntry) => dispatch({ type: 'UPDATE_JOURNAL_ENTRY', payload: { ...entry, updatedAt: new Date().toISOString() } }),
    deleteEntry: (id: string) => dispatch({ type: 'DELETE_JOURNAL_ENTRY', payload: id }),
  };
}

export function useFocus() {
  const { state, dispatch } = useApp();
  return {
    sessions: state.focusSessions,
    todaySessions: state.focusSessions.filter(s => s.startedAt.startsWith(new Date().toISOString().split('T')[0])),
    startSession: (session: Omit<FocusSession, 'id' | 'startedAt'>) => dispatch({ type: 'ADD_FOCUS_SESSION', payload: { ...session, id: crypto.randomUUID(), startedAt: new Date().toISOString() } }),
    updateSession: (session: FocusSession) => dispatch({ type: 'UPDATE_FOCUS_SESSION', payload: session }),
    completeSession: (session: FocusSession) => dispatch({ type: 'UPDATE_FOCUS_SESSION', payload: { ...session, completed: true, completedAt: new Date().toISOString() } }),
  };
}

export function useCalendar() {
  const { state, dispatch } = useApp();
  return {
    events: state.calendarEvents,
    addEvent: (event: Omit<CalendarEvent, 'id'>) => dispatch({ type: 'ADD_CALENDAR_EVENT', payload: { ...event, id: crypto.randomUUID() } }),
    updateEvent: (event: CalendarEvent) => dispatch({ type: 'UPDATE_CALENDAR_EVENT', payload: event }),
    deleteEvent: (id: string) => dispatch({ type: 'DELETE_CALENDAR_EVENT', payload: id }),
    getEventsForDate: (date: string) => state.calendarEvents.filter(e => e.date === date),
  };
}

export function useMood() {
  const { state, dispatch } = useApp();
  const todayMood = state.moodLogs.find(m => m.date === new Date().toISOString().split('T')[0]);
  return {
    moodLogs: state.moodLogs,
    todayMood,
    logMood: (mood: number, energy?: number, note?: string, factors?: string[]) => dispatch({ type: 'LOG_MOOD', payload: { id: crypto.randomUUID(), mood, energy, note, factors, date: new Date().toISOString().split('T')[0] } }),
    weekMoods: state.moodLogs.slice(0, 7),
  };
}

export function useHabits() {
  const { state, dispatch } = useApp();
  const today = new Date().toISOString().split('T')[0];
  return {
    habits: state.habits,
    addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'bestStreak' | 'completedDates'>) => dispatch({ type: 'ADD_HABIT', payload: { ...habit, id: crypto.randomUUID(), createdAt: new Date().toISOString(), streak: 0, bestStreak: 0, completedDates: [] } }),
    updateHabit: (habit: Habit) => dispatch({ type: 'UPDATE_HABIT', payload: habit }),
    deleteHabit: (id: string) => dispatch({ type: 'DELETE_HABIT', payload: id }),
    completeHabit: (id: string) => dispatch({ type: 'COMPLETE_HABIT', payload: { id, date: today } }),
    isCompletedToday: (id: string) => state.habits.find(h => h.id === id)?.completedDates.includes(today) || false,
  };
}

export function useCategories() {
  const { state, dispatch } = useApp();
  return {
    categories: state.categories,
    addCategory: (name: string, color: string) => dispatch({ type: 'ADD_CATEGORY', payload: { id: crypto.randomUUID(), name, color } }),
    deleteCategory: (id: string) => dispatch({ type: 'DELETE_CATEGORY', payload: id }),
  };
}

export function useAI() {
  const { state, dispatch } = useApp();
  return {
    messages: state.aiMessages,
    addMessage: (role: 'user' | 'assistant', content: string) => dispatch({ type: 'ADD_AI_MESSAGE', payload: { id: crypto.randomUUID(), role, content, timestamp: new Date().toISOString() } }),
    profile: state.userProfile,
    updateProfile: (profile: Partial<UserProfile>) => dispatch({ type: 'UPDATE_PROFILE', payload: profile }),
  };
}

export function useStats() {
  const { state } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = state.tasks.filter(t => t.completedAt?.startsWith(today));
  const todayFocus = state.focusSessions.filter(s => s.startedAt.startsWith(today));
  const todayFocusMinutes = todayFocus.reduce((acc, s) => acc + Math.floor(s.completedDuration / 60), 0);
  const todayHabits = state.habits.filter(h => h.completedDates.includes(today));
  return { ...state.userStats, todayTasksCompleted: todayTasks.length, todayFocusMinutes, todayHabitsCompleted: todayHabits.length, productivity: Math.min(100, Math.round((todayTasks.length * 10 + todayFocusMinutes + todayHabits.length * 5) / 3)) };
}

export function useAchievements() {
  const { state, dispatch } = useApp();
  return { achievements: state.achievements, unlock: (achievement: Omit<Achievement, 'unlockedAt'>) => dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { ...achievement, unlockedAt: new Date().toISOString() } }) };
}
