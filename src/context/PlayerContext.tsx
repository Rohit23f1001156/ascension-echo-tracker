import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/sonner';
import { skillTreeData } from '@/data/skillTreeData';

// Types
export interface Stats {
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
  lastActivityDate?: string | null;
  buffs?: Buff[];
  journalStreak?: number;
  lastJournalEntryDate?: string | null;
}

export interface Quest {
  id: string;
  title: string;
  xp: number;
  type: 'good' | 'bad';
  isRecurring?: boolean;
  recurrence?: 'none' | 'daily' | 'weekly' | 'custom';
  streak?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  startDate?: string;
  endDate?: string;
}

export interface Habit {
  id: string;
  title: string;
  xp: number;
  type: 'good' | 'bad';
  streak: number;
  isCompleted: boolean;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  lastCompleted?: string;
}

export interface QuestLogEntry {
  id: string;
  title: string;
  xp: number;
  date: string;
  type: 'good' | 'bad';
  questId: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  tags: string[];
  mood: string;
  createdAt: string;
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  xpRequired: number;
  xp: number;
  tasks: string[];
  dependencies: string[];
  isUnlocked: boolean;
  isCompleted: boolean;
  isMastered: boolean;
  isCustom?: boolean;
}

export interface SkillPath {
  id: string;
  name: string;
  description: string;
  nodes: SkillNode[];
}

export interface Buff {
  id: string;
  name: string;
  description: string;
  effect: string;
  duration?: number;
}

export interface ShadowTrial {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  isCompleted: boolean;
  category: string;
}

export interface CalendarData {
  [date: string]: {
    completed: number;
    total: number;
    xp: number;
    quests: string[];
  };
}

interface PlayerContextType {
  stats: Stats;
  updateStats: (newStats: Partial<Stats>) => void;
  updatePlayerProfile: (profileData: { name: string; class: string }) => void;
  allocateStatPoint: (statName: string) => void;
  quests: Quest[];
  completedQuests: Set<string>;
  questLog: QuestLogEntry[];
  journalEntries: JournalEntry[];
  skillTree: SkillPath[];
  calendarData: CalendarData;
  shadowTrials: ShadowTrial[];
  habits: Habit[];
  masteredSkills: Set<string>;
  activeSkillQuests: Map<string, Set<string>>;
  justMasteredSkillId: string | null;
  toggleQuest: (questId: string) => void;
  addQuest: (quest: Omit<Quest, 'id'>) => void;
  updateQuest: (questId: string, updates: Partial<Quest>) => void;
  deleteQuest: (questId: string) => void;
  addHabit: (habit: Omit<Habit, 'id'>) => void;
  toggleHabit: (habitId: string) => void;
  updateHabit: (habitId: string, updates: Partial<Habit>) => void;
  deleteHabit: (habitId: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void;
  updateJournalEntry: (id: string, entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void;
  deleteJournalEntry: (id: string) => void;
  addSkillNode: (nodeData: { pathId: string; name: string; tasks: string[]; xp: number }) => void;
  updateSkillNode: (pathId: string, nodeId: string, updates: Partial<SkillNode>) => void;
  deleteSkillNode: (pathId: string, nodeId: string) => void;
  startSkillQuest: (nodeId: string) => void;
  cancelSkillQuest: (nodeId: string) => void;
  toggleSkillTask: (nodeId: string, task: string) => void;
  levelUpAnimation: boolean;
  levelUpData: { newLevel: number; perk: Buff | null } | null;
  clearLevelUpData: () => void;
  setConfettiConfig: ((config: any) => void) | null;
  saveAllDataToSupabase: () => Promise<void>;
  loadAllDataFromSupabase: () => Promise<void>;
  resetAllData: () => Promise<void>;
  completeShadowTrial: (trialId: string) => void;
  undoShadowTrial: (trialId: string) => void;
  getCalendarData: () => CalendarData;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Utility functions
const getXpRequired = (level: number): number => {
  return 1000 + (level * 800);
};

const calculateLevelFromXp = (xp: number): number => {
  let level = 0;
  let totalXpNeeded = 0;
  
  while (totalXpNeeded <= xp) {
    totalXpNeeded += getXpRequired(level);
    if (totalXpNeeded <= xp) level++;
  }
  
  return level;
};

const calculateXpToNextLevel = (currentXp: number, currentLevel: number): number => {
  const nextLevelXp = getXpRequired(currentLevel);
  let levelStartXp = 0;
  
  for (let i = 0; i < currentLevel; i++) {
    levelStartXp += getXpRequired(i);
  }
  
  return Math.max(0, (levelStartXp + nextLevelXp) - currentXp);
};

const defaultStats: Stats = {
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

const defaultQuests: Quest[] = [
  { id: 'q1', title: 'Morning Exercise (30 min)', xp: 50, type: 'good', isRecurring: true, recurrence: 'daily', streak: 0, difficulty: 'Medium' },
  { id: 'q2', title: 'Read for 30 minutes', xp: 40, type: 'good', isRecurring: true, recurrence: 'daily', streak: 0, difficulty: 'Easy' },
  { id: 'q3', title: 'Drink 8 glasses of water', xp: 30, type: 'good', isRecurring: true, recurrence: 'daily', streak: 0, difficulty: 'Easy' },
  { id: 'q4', title: 'Write in journal', xp: 35, type: 'good', isRecurring: true, recurrence: 'daily', streak: 0, difficulty: 'Easy' },
  { id: 'q5', title: 'Learn something new (1 hour)', xp: 60, type: 'good', isRecurring: true, recurrence: 'daily', streak: 0, difficulty: 'Medium' },
  { id: 'b1', title: 'Procrastinated for >2 hours', xp: 20, type: 'bad', isRecurring: false, difficulty: 'Medium' },
  { id: 'b2', title: 'Ate junk food', xp: 15, type: 'bad', isRecurring: false, difficulty: 'Easy' },
  { id: 'b3', title: 'Skipped planned workout', xp: 25, type: 'bad', isRecurring: false, difficulty: 'Medium' },
];

const defaultShadowTrials: ShadowTrial[] = [
  {
    id: 'trial-1',
    title: 'First Steps',
    description: 'Complete your first daily quest',
    xpReward: 100,
    isCompleted: false,
    category: 'beginner'
  },
  {
    id: 'trial-2',
    title: 'Consistency Master',
    description: 'Maintain a 3-day streak',
    xpReward: 200,
    isCompleted: false,
    category: 'habits'
  },
  {
    id: 'trial-3',
    title: 'Knowledge Seeker',
    description: 'Complete your first skill tree node',
    xpReward: 300,
    isCompleted: false,
    category: 'skills'
  }
];

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  
  // Core state
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [quests, setQuests] = useState<Quest[]>(defaultQuests);
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());
  const [questLog, setQuestLog] = useState<QuestLogEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [skillTree, setSkillTree] = useState<SkillPath[]>([]);
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [shadowTrials, setShadowTrials] = useState<ShadowTrial[]>(defaultShadowTrials);
  const [habits, setHabits] = useState<Habit[]>([]);
  
  // Skill tracking state
  const [masteredSkills, setMasteredSkills] = useState<Set<string>>(new Set());
  const [activeSkillQuests, setActiveSkillQuests] = useState<Map<string, Set<string>>>(new Map());
  const [justMasteredSkillId, setJustMasteredSkillId] = useState<string | null>(null);
  
  // UI state
  const [levelUpAnimation, setLevelUpAnimation] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ newLevel: number; perk: Buff | null } | null>(null);
  const [setConfettiConfig] = useState<((config: any) => void) | null>(null);
  
  // Auto-save timer
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Initialize skill tree from data
  useEffect(() => {
    const initializedSkillTree = skillTreeData.map(path => ({
      ...path,
      nodes: path.nodes.map(node => ({
        ...node,
        dependencies: node.dependencies || [],
        isUnlocked: node.dependencies?.length === 0 || false,
        isCompleted: false,
        isMastered: false
      }))
    }));
    setSkillTree(initializedSkillTree);
  }, []);

  // Save all data to Supabase
  const saveAllDataToSupabase = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const allData = {
        stats,
        quests,
        completedQuests: Array.from(completedQuests),
        questLog,
        journalEntries,
        skillTree,
        calendarData,
        shadowTrials,
        habits,
        masteredSkills: Array.from(masteredSkills),
        activeSkillQuests: Array.from(activeSkillQuests.entries()).map(([key, value]) => [key, Array.from(value)]),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('data')
        .update({
          stats: allData.stats,
          settings: {
            quests: allData.quests,
            completedQuests: allData.completedQuests,
            questLog: allData.questLog,
            journalEntries: allData.journalEntries,
            skillTree: allData.skillTree,
            calendarData: allData.calendarData,
            shadowTrials: allData.shadowTrials,
            habits: allData.habits,
            masteredSkills: allData.masteredSkills,
            activeSkillQuests: allData.activeSkillQuests
          },
          updated_at: allData.updated_at
        })
        .eq('id', session.user.id);

      if (error) {
        console.error('Error saving to Supabase:', error);
        toast.error('Failed to save progress to cloud');
      } else {
        console.log('Successfully saved all data to Supabase');
      }
    } catch (err) {
      console.error('Error in saveAllDataToSupabase:', err);
      toast.error('Failed to save progress');
    }
  }, [session, stats, quests, completedQuests, questLog, journalEntries, skillTree, calendarData, shadowTrials, habits, masteredSkills, activeSkillQuests]);

  // Load all data from Supabase
  const loadAllDataFromSupabase = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const { data: profile, error } = await supabase
        .from('data')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error loading from Supabase:', error);
        return;
      }

      if (profile) {
        // Load stats
        if (profile.stats) {
          setStats(prevStats => ({ ...prevStats, ...profile.stats }));
        }

        // Load all other data from settings
        if (profile.settings) {
          const settings = profile.settings;
          
          if (settings.quests) setQuests([...defaultQuests, ...settings.quests.filter((q: Quest) => !defaultQuests.find(dq => dq.id === q.id))]);
          if (settings.completedQuests) setCompletedQuests(new Set(settings.completedQuests));
          if (settings.questLog) setQuestLog(settings.questLog);
          if (settings.journalEntries) setJournalEntries(settings.journalEntries);
          if (settings.skillTree) setSkillTree(settings.skillTree);
          if (settings.calendarData) setCalendarData(settings.calendarData);
          if (settings.shadowTrials) setShadowTrials(settings.shadowTrials);
          if (settings.habits) setHabits(settings.habits);
          if (settings.masteredSkills) setMasteredSkills(new Set(settings.masteredSkills));
          if (settings.activeSkillQuests) {
            const newActiveSkillQuests = new Map();
            settings.activeSkillQuests.forEach(([key, value]: [string, string[]]) => {
              newActiveSkillQuests.set(key, new Set(value));
            });
            setActiveSkillQuests(newActiveSkillQuests);
          }
        }

        console.log('Successfully loaded all data from Supabase');
        toast.success('Progress loaded from cloud');
      }
    } catch (err) {
      console.error('Error in loadAllDataFromSupabase:', err);
      toast.error('Failed to load progress');
    }
  }, [session]);

  // Reset all data
  const resetAllData = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const defaultStats = {
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

      const defaultSettings = {
        quests: [],
        completedQuests: [],
        questLog: [],
        journalEntries: [],
        skillTree: [],
        calendarData: {},
        shadowTrials: [],
        habits: [],
        masteredSkills: [],
        activeSkillQuests: []
      };

      // Update Supabase with defaults instead of deleting
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
        console.error('Error resetting data in Supabase:', error);
        toast.error('Failed to reset progress in cloud');
        return;
      }

      // Clear local storage and session storage
      localStorage.clear();
      sessionStorage.clear();

      // Reset local state
      setStats(defaultStats);
      setQuests([]);
      setCompletedQuests(new Set());
      setQuestLog([]);
      setJournalEntries([]);
      setSkillTree(skillTreeData.map(path => ({
        ...path,
        nodes: path.nodes.map(node => ({
          ...node,
          dependencies: node.dependencies || [],
          isUnlocked: node.dependencies?.length === 0 || false,
          isCompleted: false,
          isMastered: false
        }))
      })));
      setCalendarData({});
      setShadowTrials(defaultShadowTrials);
      setHabits([]);
      setMasteredSkills(new Set());
      setActiveSkillQuests(new Map());

      toast.success('All progress has been reset');
      console.log('Successfully reset all data');
    } catch (err) {
      console.error('Error in resetAllData:', err);
      toast.error('Failed to reset progress');
    }
  }, [session]);

  // Auto-save setup
  useEffect(() => {
    if (session?.user?.id) {
      // Clear existing timer
      if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
      }

      // Set up auto-save every 30 seconds
      const timer = setInterval(() => {
        saveAllDataToSupabase();
      }, 30000);

      setAutoSaveTimer(timer);

      return () => {
        if (timer) clearInterval(timer);
      };
    }
  }, [session, saveAllDataToSupabase]);

  // Load data on mount
  useEffect(() => {
    if (session?.user?.id) {
      loadAllDataFromSupabase();
    }
  }, [session, loadAllDataFromSupabase]);

  // Update player profile
  const updatePlayerProfile = useCallback((profileData: { name: string; class: string }) => {
    setStats(prev => ({
      ...prev,
      name: profileData.name,
      class: profileData.class
    }));
    setTimeout(() => saveAllDataToSupabase(), 1000);
  }, [saveAllDataToSupabase]);

  // Allocate stat point
  const allocateStatPoint = useCallback((statName: string) => {
    setStats(prev => {
      if (prev.statPointsToAllocate <= 0) return prev;
      
      const newStats = {
        ...prev,
        statPointsToAllocate: prev.statPointsToAllocate - 1,
        [statName]: (prev[statName as keyof Stats] as number) + 1
      };
      
      return newStats;
    });
    setTimeout(() => saveAllDataToSupabase(), 1000);
  }, [saveAllDataToSupabase]);

  // Update stats with corrected level calculation
  const updateStats = useCallback((newStats: Partial<Stats>) => {
    setStats(prevStats => {
      const updatedStats = { ...prevStats, ...newStats };
      
      // Recalculate level and XP to next level using correct formula
      if ('xp' in newStats) {
        const newLevel = calculateLevelFromXp(updatedStats.xp);
        const wasLevelUp = newLevel > prevStats.level;
        
        updatedStats.level = newLevel;
        updatedStats.xpNextLevel = calculateXpToNextLevel(updatedStats.xp, newLevel);
        
        // Handle level up
        if (wasLevelUp) {
          const pointsGained = newLevel - prevStats.level;
          updatedStats.availablePoints += pointsGained;
          updatedStats.statPointsToAllocate += pointsGained;
          setLevelUpAnimation(true);
          setLevelUpData({ newLevel, perk: null });
          
          setTimeout(() => setLevelUpAnimation(false), 3000);
          
          toast.success(`Level Up! You are now level ${newLevel}!`, {
            description: `You gained ${pointsGained} stat point(s) to allocate!`,
          });
        }
      }
      
      return updatedStats;
    });
    
    // Auto-save after stats update
    setTimeout(() => saveAllDataToSupabase(), 1000);
  }, [saveAllDataToSupabase]);

  // Toggle quest completion
  const toggleQuest = useCallback((questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    const isCompleting = !completedQuests.has(questId);
    const xpChange = quest.type === 'good' ? quest.xp : -quest.xp;
    
    // Prevent negative XP
    const newXp = Math.max(0, stats.xp + (isCompleting ? xpChange : -xpChange));
    
    setCompletedQuests(prev => {
      const newSet = new Set(prev);
      if (isCompleting) {
        newSet.add(questId);
      } else {
        newSet.delete(questId);
      }
      return newSet;
    });

    // Update quest log
    if (isCompleting) {
      const logEntry: QuestLogEntry = {
        id: `${questId}-${Date.now()}`,
        title: quest.title,
        xp: quest.type === 'good' ? quest.xp : -quest.xp,
        date: new Date().toISOString(),
        type: quest.type,
        questId: questId
      };
      
      setQuestLog(prev => [...prev, logEntry]);
      
      // Update calendar data
      const today = new Date().toISOString().split('T')[0];
      setCalendarData(prev => ({
        ...prev,
        [today]: {
          completed: (prev[today]?.completed || 0) + 1,
          total: (prev[today]?.total || 0) + 1,
          xp: (prev[today]?.xp || 0) + (quest.type === 'good' ? quest.xp : 0),
          quests: [...(prev[today]?.quests || []), quest.title]
        }
      }));
    }

    // Update stats
    updateStats({ xp: newXp });
    
    // Save immediately for quest completion
    setTimeout(() => saveAllDataToSupabase(), 500);
  }, [quests, completedQuests, stats.xp, updateStats, saveAllDataToSupabase]);

  // Add quest
  const addQuest = useCallback((questData: Omit<Quest, 'id'>) => {
    const newQuest: Quest = {
      ...questData,
      id: `quest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    setQuests(prev => [...prev, newQuest]);
    setTimeout(() => saveAllDataToSupabase(), 1000);
  }, [saveAllDataToSupabase]);

  // Update quest
  const updateQuest = useCallback((questId: string, updates: Partial<Quest>) => {
    setQuests(prev => prev.map(q => q.id === questId ? { ...q, ...updates } : q));
    setTimeout(() => saveAllDataToSupabase(), 1000);
  }, [saveAllDataToSupabase]);

  // Delete quest
  const deleteQuest = useCallback((questId: string) => {
    setQuests(prev => prev.filter(q => q.id !== questId));
    setCompletedQuests(prev => {
      const newSet = new Set(prev);
      newSet.delete(questId);
      return newSet;
    });
    setTimeout(() => saveAllDataToSupabase(), 1000);
  }, [saveAllDataToSupabase]);

  // Add habit
  const addHabit = useCallback((habitData: Omit<Habit, 'id'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      streak: 0
    };
    
    setHabits(prev => [...prev, newHabit]);
    setTimeout(() => saveAllDataToSupabase(), 1000);
  }, [saveAllDataToSupabase]);

  // Enhanced difficulty-based rewards for habits
  const getXPByDifficulty = (difficulty?: string): number => {
    switch (difficulty) {
      case "Easy": return 15;
      case "Medium": return 25;
      case "Hard": return 35;
      default: return 15;
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

  // Enhanced habit toggle with proper difficulty-based rewards
  const toggleHabit = useCallback((habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const isCompleting = !habit.isCompleted;
    
    // Use difficulty-based rewards
    const xpReward = getXPByDifficulty(habit.difficulty);
    const coinsReward = getCoinsByDifficulty(habit.difficulty);
    
    const xpChange = habit.type === 'good' ? xpReward : -xpReward;
    const coinsChange = habit.type === 'good' ? coinsReward : -coinsReward;
    
    const newXp = Math.max(0, stats.xp + (isCompleting ? xpChange : -xpChange));

    setHabits(prev => prev.map(h => 
      h.id === habitId ? { 
        ...h, 
        isCompleted: !h.isCompleted,
        lastCompleted: !h.isCompleted ? new Date().toISOString() : h.lastCompleted,
        streak: !h.isCompleted ? h.streak + 1 : Math.max(0, h.streak - 1)
      } : h
    ));

    updateStats({ 
      xp: newXp,
      coins: Math.max(0, stats.coins + (isCompleting ? coinsChange : -coinsChange)),
      streak: isCompleting ? stats.streak + 1 : Math.max(0, stats.streak - 1)
    });

    if (isCompleting) {
      toast.success(`${habit.type === 'good' ? 'Habit completed' : 'Temptation resisted'}! +${xpReward} XP, +${coinsReward} coins`);
    } else {
      toast.info(`Habit undone. -${xpReward} XP, -${coinsReward} coins`);
    }

    setTimeout(() => saveAllDataToSupabase(), 1000);
  }, [habits, stats.xp, stats.coins, stats.streak, updateStats, saveAllDataToSupabase]);

  // Update habit
  const updateHabit = useCallback((habitId: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => h.id === habitId ? { ...h, ...updates } : h));
    setTimeout(() => saveAllDataToSupabase(), 1000);
  }, [saveAllDataToSupabase]);

  // Delete habit
  const deleteHabit = useCallback((habitId: string) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
    setTimeout(() => saveAllDataToSupabase(), 1000);
  }, [saveAllDataToSupabase]);

  // Add journal entry
  const addJournalEntry = useCallback((entryData: Omit<JournalEntry, 'id' | 'createdAt'>) => {
    const newEntry: JournalEntry = {
      ...entryData,
      id: `journal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    setJournalEntries(prev => [...prev, newEntry]);
    setTimeout(() => saveAllDataToSupabase(), 1000);
  }, [saveAllDataToSupabase]);

  // Update journal entry
  const updateJournalEntry = useCallback((id: string, entryData: Omit<JournalEntry, 'id' | 'createdAt'>) => {
    setJournalEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, ...entryData } : entry
    ));
    setTimeout(() => saveAllDataToSupabase(), 1000);
  }, [saveAllDataToSupabase]);

  // Delete journal entry
  const deleteJournalEntry = useCallback((id: string) => {
    setJournalEntries(prev => prev.filter(entry => entry.id !== id));
    setTimeout(() => saveAllDataToSupabase(), 1000);
  }, [saveAllDataToSupabase]);

  // Add skill node
  const addSkillNode = useCallback((nodeData: { pathId: string; name: string; tasks: string[]; xp: number }) => {
    const newNode: SkillNode = {
      id: `skill-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: nodeData.name,
      description: `Custom skill: ${nodeData.name}`,
      xpRequired: nodeData.xp,
      xp: nodeData.xp,
      tasks: nodeData.tasks,
      dependencies: [],
      isUnlocked: true,
      isCompleted: false,
      isMastered: false,
      isCustom: true
    };

    setSkillTree(prev => prev.map(path => 
      path.id === nodeData.pathId 
        ? { ...path, nodes: [...path.nodes, newNode] }
        : path
    ));
    
    setTimeout(() => saveAllDataToSupabase(), 1000);
  }, [saveAllDataToSupabase]);

  // Update skill node
  const updateSkillNode = useCallback((pathId: string, nodeId: string, updates: Partial<SkillNode>) => {
    setSkillTree(prev => prev.map(path => 
      path.id === pathId 
        ? {
            ...path,
            nodes: path.nodes.map(node => 
              node.id === nodeId ? { ...node, ...updates } : node
            )
          }
        : path
    ));
    setTimeout(() => saveAllDataToSupabase(), 1000);
  }, [saveAllDataToSupabase]);

  // Delete skill node
  const deleteSkillNode = useCallback((pathId: string, nodeId: string) => {
    setSkillTree(prev => prev.map(path => 
      path.id === pathId 
        ? { ...path, nodes: path.nodes.filter(node => node.id !== nodeId) }
        : path
    ));
    setTimeout(() => saveAllDataToSupabase(), 1000);
  }, [saveAllDataToSupabase]);

  // Start skill quest
  const startSkillQuest = useCallback((nodeId: string) => {
    setActiveSkillQuests(prev => {
      const newMap = new Map(prev);
      if (!newMap.has(nodeId)) {
        newMap.set(nodeId, new Set());
      }
      return newMap;
    });
    setTimeout(() => saveAllDataToSupabase(), 1000);
  }, [saveAllDataToSupabase]);

  // Cancel skill quest
  const cancelSkillQuest = useCallback((nodeId: string) => {
    setActiveSkillQuests(prev => {
      const newMap = new Map(prev);
      newMap.delete(nodeId);
      return newMap;
    });
    setTimeout(() => saveAllDataToSupabase(), 1000);
  }, [saveAllDataToSupabase]);

  // Toggle skill task with completion checking
  const toggleSkillTask = useCallback((nodeId: string, task: string) => {
    setActiveSkillQuests(prev => {
      const newMap = new Map(prev);
      const tasks = newMap.get(nodeId) || new Set();
      
      if (tasks.has(task)) {
        tasks.delete(task);
      } else {
        tasks.add(task);
      }
      
      newMap.set(nodeId, tasks);
      
      // Check if all tasks are completed
      const node = skillTree.flatMap(path => path.nodes).find(n => n.id === nodeId);
      if (node && tasks.size === node.tasks.length) {
        // Mark node as completed and award XP
        setMasteredSkills(prevMastered => {
          const newMastered = new Set(prevMastered);
          newMastered.add(nodeId);
          
          // Award XP and update stats
          setStats(prevStats => {
            const newXp = prevStats.xp + node.xp;
            const newLevel = calculateLevelFromXp(newXp);
            const wasLevelUp = newLevel > prevStats.level;
            
            const updatedStats = {
              ...prevStats,
              xp: newXp,
              level: newLevel,
              xpNextLevel: calculateXpToNextLevel(newXp, newLevel)
            };

            if (wasLevelUp) {
              const pointsGained = newLevel - prevStats.level;
              updatedStats.availablePoints += pointsGained;
              updatedStats.statPointsToAllocate += pointsGained;
              setLevelUpAnimation(true);
              setLevelUpData({ newLevel, perk: null });
              
              setTimeout(() => setLevelUpAnimation(false), 3000);
              
              toast.success(`Level Up! You are now level ${newLevel}!`, {
                description: `You gained ${pointsGained} stat point(s) to allocate!`,
              });
            }

            return updatedStats;
          });
          
          // Set the just mastered skill for animation
          setJustMasteredSkillId(nodeId);
          setTimeout(() => setJustMasteredSkillId(null), 3000);
          
          toast.success(`Skill mastered! +${node.xp} XP`);
          
          return newMastered;
        });
        
        // Remove from active quests
        newMap.delete(nodeId);
      }
      
      return newMap;
    });
    
    setTimeout(() => saveAllDataToSupabase(), 1000);
  }, [skillTree, saveAllDataToSupabase]);

  // Clear level up data
  const clearLevelUpData = useCallback(() => {
    setLevelUpData(null);
  }, []);

  // Complete Shadow Trial
  const completeShadowTrial = useCallback((trialId: string) => {
    const trial = shadowTrials.find(t => t.id === trialId);
    if (!trial || trial.isCompleted) return;

    // Update trial status
    setShadowTrials(prev => prev.map(t => 
      t.id === trialId ? { ...t, isCompleted: true } : t
    ));

    // Award XP and coins
    const coinsEarned = Math.floor(trial.xpReward / 10);
    
    setStats(prevStats => {
      const newXp = prevStats.xp + trial.xpReward;
      const newLevel = calculateLevelFromXp(newXp);
      const wasLevelUp = newLevel > prevStats.level;
      
      const updatedStats = {
        ...prevStats,
        xp: newXp,
        coins: prevStats.coins + coinsEarned,
        level: newLevel,
        xpNextLevel: calculateXpToNextLevel(newXp, newLevel),
        streak: prevStats.streak + 1
      };

      if (wasLevelUp) {
        const pointsGained = newLevel - prevStats.level;
        updatedStats.availablePoints += pointsGained;
        updatedStats.statPointsToAllocate += pointsGained;
        setLevelUpAnimation(true);
        setLevelUpData({ newLevel, perk: null });
        
        setTimeout(() => setLevelUpAnimation(false), 3000);
        
        toast.success(`Level Up! You are now level ${newLevel}!`, {
          description: `You gained ${pointsGained} stat point(s) to allocate!`,
        });
      }

      return updatedStats;
    });

    toast.success(`Shadow Trial completed! +${trial.xpReward} XP, +${coinsEarned} coins`);
    setTimeout(() => saveAllDataToSupabase(), 1000);
  }, [shadowTrials, saveAllDataToSupabase]);

  // Undo Shadow Trial
  const undoShadowTrial = useCallback((trialId: string) => {
    const trial = shadowTrials.find(t => t.id === trialId);
    if (!trial || !trial.isCompleted) return;

    // Update trial status
    setShadowTrials(prev => prev.map(t => 
      t.id === trialId ? { ...t, isCompleted: false } : t
    ));

    // Remove XP and coins
    const coinsLost = Math.floor(trial.xpReward / 10);
    
    setStats(prevStats => {
      const newXp = Math.max(0, prevStats.xp - trial.xpReward);
      const newLevel = calculateLevelFromXp(newXp);
      
      return {
        ...prevStats,
        xp: newXp,
        coins: Math.max(0, prevStats.coins - coinsLost),
        level: newLevel,
        xpNextLevel: calculateXpToNextLevel(newXp, newLevel),
        streak: Math.max(0, prevStats.streak - 1)
      };
    });

    toast.info(`Shadow Trial undone. -${trial.xpReward} XP, -${coinsLost} coins`);
    setTimeout(() => saveAllDataToSupabase(), 1000);
  }, [shadowTrials, saveAllDataToSupabase]);

  // Enhanced calendar data generation - fix return type
  const getCalendarData = useCallback((): CalendarData => {
    const data: CalendarData = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split('T')[0];
      
      data[dayKey] = {
        xp: calendarData[dayKey]?.xp || 0,
        total: calendarData[dayKey]?.total || 0,
        quests: calendarData[dayKey]?.quests || [],
        completed: calendarData[dayKey]?.completed || 0
      };
    }
    return data;
  }, [calendarData]);

  const value: PlayerContextType = {
    stats,
    updateStats,
    updatePlayerProfile,
    allocateStatPoint,
    quests,
    completedQuests,
    questLog,
    journalEntries,
    skillTree,
    calendarData,
    shadowTrials,
    habits,
    masteredSkills,
    activeSkillQuests,
    justMasteredSkillId,
    toggleQuest,
    addQuest,
    updateQuest,
    deleteQuest,
    addHabit,
    toggleHabit,
    updateHabit,
    deleteHabit,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    addSkillNode,
    updateSkillNode,
    deleteSkillNode,
    startSkillQuest,
    cancelSkillQuest,
    toggleSkillTask,
    levelUpAnimation,
    levelUpData,
    clearLevelUpData,
    setConfettiConfig,
    saveAllDataToSupabase,
    loadAllDataFromSupabase,
    resetAllData,
    completeShadowTrial,
    undoShadowTrial,
    getCalendarData
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
