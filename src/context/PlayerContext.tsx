import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/sonner';

interface PlayerStats {
  name: string;
  class: string;
  title: string;
  level: number;
  xp: number;
  xpNextLevel: number;
  strength: number;
  stamina: number;
  concentration: number;
  intelligence: number;
  wealth: number;
  skills: number;
  streak: number;
  availablePoints: number;
  statPointsToAllocate: number;
  coins: number;
  lastActivityDate: string | null;
  buffs: Buff[];
  journalStreak: number;
  lastJournalEntryDate: string | null;
}

interface Buff {
  id: string;
  name: string;
  description: string;
  effect: string;
  duration: number;
  startDate: string;
}

export interface Habit {
  id: string;
  title: string;
  xp: number;
  streak: number;
  type: 'good' | 'bad';
  isCompleted: boolean;
  lastCompleted?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  coins: number;
  type: 'daily' | 'weekly' | 'custom';
  completed: boolean;
  completedAt?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  timeEstimate?: number;
  assignedDate?: string;
  dailyQuestDate?: string;
  isDailyQuest?: boolean;
}

export interface ShadowTrial {
  id: string;
  title: string;
  description: string;
  xp: number;
  coins: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  completed: boolean;
  completedAt?: string;
  unlockRequirement?: string;
  isUnlocked: boolean;
}

export interface JournalEntry {
  id: string;
  content: string;
  date: string;
  mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  tags?: string[];
  reflections?: string[];
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  isUnlocked: boolean;
  xpRequired: number;
  prerequisites: string[];
  category: string;
  color: string;
  isCompleted: boolean;
  completedAt?: string;
  reward?: {
    xp: number;
    coins: number;
    buff?: Buff;
  };
}

export interface CalendarEntry {
  date: string;
  activities: string[];
  mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  notes?: string;
  xpGained?: number;
  questsCompleted?: number;
  habitsCompleted?: number;
}

interface PlayerContextType {
  stats: PlayerStats;
  habits: Habit[];
  quests: Quest[];
  completedQuests: Quest[];
  questLog: Quest[];
  journalEntries: JournalEntry[];
  skillTree: SkillNode[];
  calendarData: Record<string, CalendarEntry>;
  shadowTrials: ShadowTrial[];
  masteredSkills: SkillNode[];
  activeSkillQuests: Quest[];
  isLoading: boolean;
  
  updateStats: (newStats: Partial<PlayerStats>) => void;
  addHabit: (habit: Omit<Habit, 'id'>) => void;
  toggleHabit: (habitId: string) => void;
  deleteHabit: (habitId: string) => void;
  addQuest: (quest: Omit<Quest, 'id'>) => void;
  completeQuest: (questId: string) => void;
  deleteQuest: (questId: string) => void;
  updateQuest: (questId: string, updates: Partial<Quest>) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  updateJournalEntry: (entryId: string, updates: Partial<JournalEntry>) => void;
  deleteJournalEntry: (entryId: string) => void;
  updateSkillTree: (nodes: SkillNode[]) => void;
  updateCalendarEntry: (date: string, entry: CalendarEntry) => void;
  addShadowTrial: (trial: Omit<ShadowTrial, 'id'>) => void;
  completeShadowTrial: (trialId: string) => void;
  updatePlayerProfile: (profile: { name: string; class: string }) => void;
  saveToSupabase: () => Promise<void>;
  loadFromSupabase: () => Promise<void>;
  restartProgress: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const defaultStats: PlayerStats = {
  name: '',
  class: 'Shadow Hunter',
  title: 'Novice',
  level: 0,
  xp: 0,
  xpNextLevel: 1000,
  strength: 1,
  stamina: 1,
  concentration: 1,
  intelligence: 1,
  wealth: 1,
  skills: 1,
  streak: 0,
  availablePoints: 0,
  statPointsToAllocate: 0,
  coins: 0,
  lastActivityDate: null,
  buffs: [],
  journalStreak: 0,
  lastJournalEntryDate: null,
};

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useAuth();
  const [stats, setStats] = useState<PlayerStats>(defaultStats);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
  const [questLog, setQuestLog] = useState<Quest[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [skillTree, setSkillTree] = useState<SkillNode[]>([]);
  const [calendarData, setCalendarData] = useState<Record<string, CalendarEntry>>({});
  const [shadowTrials, setShadowTrials] = useState<ShadowTrial[]>([]);
  const [masteredSkills, setMasteredSkills] = useState<SkillNode[]>([]);
  const [activeSkillQuests, setActiveSkillQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getXPByDifficulty = (difficulty?: string): number => {
    switch (difficulty) {
      case "Easy": return 25;
      case "Medium": return 45;
      case "Hard": return 60;
      default: return 25;
    }
  };

  const getCoinsByDifficulty = (difficulty?: string): number => {
    switch (difficulty) {
      case "Easy": return 1;
      case "Medium": return 2;
      case "Hard": return 3;
      default: return 1;
    }
  };

  const saveToSupabase = async () => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('data')
        .update({
          stats,
          settings: {
            habits,
            quests,
            completedQuests,
            questLog,
            journalEntries,
            skillTree,
            calendarData,
            shadowTrials,
            masteredSkills,
            activeSkillQuests,
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (error) {
        console.error('Error saving to Supabase:', error);
        toast.error('Failed to save progress');
      }
    } catch (err) {
      console.error('Error in saveToSupabase:', err);
    }
  };

  const loadFromSupabase = async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('data')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error loading from Supabase:', error);
        return;
      }

      if (data) {
        if (data.stats) {
          setStats(data.stats);
        }
        if (data.settings) {
          setHabits(data.settings.habits || []);
          setQuests(data.settings.quests || []);
          setCompletedQuests(data.settings.completedQuests || []);
          setQuestLog(data.settings.questLog || []);
          setJournalEntries(data.settings.journalEntries || []);
          setSkillTree(data.settings.skillTree || []);
          setCalendarData(data.settings.calendarData || {});
          setShadowTrials(data.settings.shadowTrials || []);
          setMasteredSkills(data.settings.masteredSkills || []);
          setActiveSkillQuests(data.settings.activeSkillQuests || []);
        }
      }
    } catch (err) {
      console.error('Error in loadFromSupabase:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const restartProgress = async () => {
    if (!session?.user?.id) return;

    try {
      const defaultSettings = {
        habits: [],
        quests: [],
        completedQuests: [],
        questLog: [],
        journalEntries: [],
        skillTree: [],
        calendarData: {},
        shadowTrials: [],
        masteredSkills: [],
        activeSkillQuests: []
      };

      const { error } = await supabase
        .from('data')
        .update({
          stats: defaultStats,
          settings: defaultSettings,
          onboarding_complete: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (error) {
        console.error('Error restarting progress:', error);
        toast.error('Failed to restart progress');
        return;
      }

      // Reset local state
      setStats(defaultStats);
      setHabits([]);
      setQuests([]);
      setCompletedQuests([]);
      setQuestLog([]);
      setJournalEntries([]);
      setSkillTree([]);
      setCalendarData({});
      setShadowTrials([]);
      setMasteredSkills([]);
      setActiveSkillQuests([]);

      // Clear localStorage
      localStorage.clear();

      toast.success('Progress restarted successfully!');
    } catch (err) {
      console.error('Error in restartProgress:', err);
      toast.error('Failed to restart progress');
    }
  };

  const updateStats = (newStats: Partial<PlayerStats>) => {
    setStats(prev => {
      const updated = { ...prev, ...newStats };
      
      // Check for level up
      while (updated.xp >= updated.xpNextLevel) {
        updated.level += 1;
        updated.xp -= updated.xpNextLevel;
        updated.xpNextLevel = Math.floor(updated.xpNextLevel * 1.2);
        updated.availablePoints += 1;
        updated.statPointsToAllocate += 1;
        
        toast.success(`Level Up! You are now level ${updated.level}!`);
      }
      
      return updated;
    });
  };

  const addHabit = (habit: Omit<Habit, 'id'>) => {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString(),
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const toggleHabit = (habitId: string) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const wasCompleted = habit.isCompleted;
        const now = new Date().toISOString();
        
        if (!wasCompleted) {
          // Completing habit
          const xpReward = getXPByDifficulty(habit.difficulty);
          const coinsReward = getCoinsByDifficulty(habit.difficulty);
          
          updateStats({
            xp: stats.xp + xpReward,
            coins: stats.coins + coinsReward,
            streak: stats.streak + 1,
          });
          
          toast.success(`+${xpReward} XP, +${coinsReward} coins!`);
          
          return {
            ...habit,
            isCompleted: true,
            lastCompleted: now,
            streak: habit.streak + 1
          };
        } else {
          // Undoing habit
          const xpReward = getXPByDifficulty(habit.difficulty);
          const coinsReward = getCoinsByDifficulty(habit.difficulty);
          
          updateStats({
            xp: Math.max(0, stats.xp - xpReward),
            coins: Math.max(0, stats.coins - coinsReward),
            streak: Math.max(0, stats.streak - 1),
          });
          
          return {
            ...habit,
            isCompleted: false,
            lastCompleted: undefined,
            streak: Math.max(0, habit.streak - 1)
          };
        }
      }
      return habit;
    }));
  };

  const deleteHabit = (habitId: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== habitId));
  };

  const addQuest = (quest: Omit<Quest, 'id'>) => {
    const newQuest: Quest = {
      ...quest,
      id: Date.now().toString(),
    };
    setQuests(prev => [...prev, newQuest]);
  };

  const completeQuest = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    const completedQuest = {
      ...quest,
      completed: true,
      completedAt: new Date().toISOString(),
    };

    setQuests(prev => prev.filter(q => q.id !== questId));
    setCompletedQuests(prev => [...prev, completedQuest]);
    setQuestLog(prev => [...prev, completedQuest]);

    updateStats({
      xp: stats.xp + quest.xp,
      coins: stats.coins + quest.coins,
    });

    toast.success(`Quest completed! +${quest.xp} XP, +${quest.coins} coins`);
  };

  const deleteQuest = (questId: string) => {
    setQuests(prev => prev.filter(quest => quest.id !== questId));
  };

  const updateQuest = (questId: string, updates: Partial<Quest>) => {
    setQuests(prev => prev.map(quest => 
      quest.id === questId ? { ...quest, ...updates } : quest
    ));
  };

  const addJournalEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    setJournalEntries(prev => [...prev, newEntry]);
  };

  const updateJournalEntry = (entryId: string, updates: Partial<JournalEntry>) => {
    setJournalEntries(prev => prev.map(entry => 
      entry.id === entryId ? { ...entry, ...updates } : entry
    ));
  };

  const deleteJournalEntry = (entryId: string) => {
    setJournalEntries(prev => prev.filter(entry => entry.id !== entryId));
  };

  const updateSkillTree = (nodes: SkillNode[]) => {
    setSkillTree(nodes);
  };

  const updateCalendarEntry = (date: string, entry: CalendarEntry) => {
    setCalendarData(prev => ({
      ...prev,
      [date]: entry
    }));
  };

  const addShadowTrial = (trial: Omit<ShadowTrial, 'id'>) => {
    const newTrial: ShadowTrial = {
      ...trial,
      id: Date.now().toString(),
    };
    setShadowTrials(prev => [...prev, newTrial]);
  };

  const completeShadowTrial = (trialId: string) => {
    setShadowTrials(prev => prev.map(trial => 
      trial.id === trialId 
        ? { ...trial, completed: true, completedAt: new Date().toISOString() }
        : trial
    ));
  };

  const updatePlayerProfile = (profile: { name: string; class: string }) => {
    setStats(prev => ({
      ...prev,
      name: profile.name,
      class: profile.class
    }));
  };

  useEffect(() => {
    if (session?.user?.id) {
      loadFromSupabase();
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.id) {
      saveToSupabase();
    }
  }, [stats, habits, quests, completedQuests, questLog, journalEntries, skillTree, calendarData, shadowTrials, masteredSkills, activeSkillQuests]);

  const value: PlayerContextType = {
    stats,
    habits,
    quests,
    completedQuests,
    questLog,
    journalEntries,
    skillTree,
    calendarData,
    shadowTrials,
    masteredSkills,
    activeSkillQuests,
    isLoading,
    updateStats,
    addHabit,
    toggleHabit,
    deleteHabit,
    addQuest,
    completeQuest,
    deleteQuest,
    updateQuest,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    updateSkillTree,
    updateCalendarEntry,
    addShadowTrial,
    completeShadowTrial,
    updatePlayerProfile,
    saveToSupabase,
    loadFromSupabase,
    restartProgress,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
