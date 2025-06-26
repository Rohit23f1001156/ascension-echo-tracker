
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/sonner';
import { initialSkillTreeData } from '@/data/skillTreeData';

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
}

export interface Quest {
  id: string;
  title: string;
  xp: number;
  type: 'good' | 'bad';
  isRecurring?: boolean;
  streak?: number;
  difficulty?: string;
}

export interface QuestLogEntry {
  id: string;
  title: string;
  xp: number;
  date: string;
  type: 'good' | 'bad';
}

export interface JournalEntry {
  id: string;
  date: string;
  reflection?: string;
  gratitude?: string[];
  mood?: number;
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  xpRequired: number;
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
  quests: Quest[];
  completedQuests: Set<string>;
  questLog: QuestLogEntry[];
  journalEntries: JournalEntry[];
  skillTree: SkillPath[];
  calendarData: CalendarData;
  shadowTrials: ShadowTrial[];
  toggleQuest: (questId: string) => void;
  addQuest: (quest: Omit<Quest, 'id'>) => void;
  deleteQuest: (questId: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  addSkillNode: (nodeData: { pathId: string; name: string; tasks: string[]; xp: number }) => void;
  completeSkillNode: (pathId: string, nodeId: string) => void;
  levelUpAnimation: boolean;
  levelUpData: { newLevel: number; perk: Buff | null } | null;
  clearLevelUpData: () => void;
  setConfettiConfig: ((config: any) => void) | null;
  saveAllDataToSupabase: () => Promise<void>;
  loadAllDataFromSupabase: () => Promise<void>;
  resetAllData: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Utility functions
const calculateXpForLevel = (level: number): number => {
  if (level === 0) return 0;
  return 800 + (level - 1) * 800;
};

const calculateLevelFromXp = (xp: number): number => {
  if (xp < 800) return 0;
  return Math.floor((xp - 800) / 800) + 1;
};

const calculateXpToNextLevel = (currentXp: number): number => {
  const currentLevel = calculateLevelFromXp(currentXp);
  const nextLevelXp = calculateXpForLevel(currentLevel + 1);
  return nextLevelXp - currentXp;
};

const defaultStats: Stats = {
  name: '',
  class: 'Shadow Hunter',
  title: 'Novice',
  level: 0,
  xp: 0,
  xpNextLevel: 800,
  strength: 1,
  stamina: 1,
  concentration: 1,
  intelligence: 1,
  wealth: 1,
  skills: 1,
  streak: 0,
  availablePoints: 0,
};

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
    title: 'Consistency',
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
  const [quests, setQuests] = useState<Quest[]>([]);
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());
  const [questLog, setQuestLog] = useState<QuestLogEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [skillTree, setSkillTree] = useState<SkillPath[]>(initialSkillTreeData);
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [shadowTrials, setShadowTrials] = useState<ShadowTrial[]>(defaultShadowTrials);
  
  // UI state
  const [levelUpAnimation, setLevelUpAnimation] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ newLevel: number; perk: Buff | null } | null>(null);
  const [setConfettiConfig] = useState<((config: any) => void) | null>(null);
  
  // Auto-save timer
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

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
            shadowTrials: allData.shadowTrials
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
  }, [session, stats, quests, completedQuests, questLog, journalEntries, skillTree, calendarData, shadowTrials]);

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
          
          if (settings.quests) setQuests(settings.quests);
          if (settings.completedQuests) setCompletedQuests(new Set(settings.completedQuests));
          if (settings.questLog) setQuestLog(settings.questLog);
          if (settings.journalEntries) setJournalEntries(settings.journalEntries);
          if (settings.skillTree) setSkillTree(settings.skillTree);
          if (settings.calendarData) setCalendarData(settings.calendarData);
          if (settings.shadowTrials) setShadowTrials(settings.shadowTrials);
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
      // Reset Supabase data
      const { error } = await supabase
        .from('data')
        .update({
          stats: defaultStats,
          settings: {
            quests: [],
            completedQuests: [],
            questLog: [],
            journalEntries: [],
            skillTree: initialSkillTreeData,
            calendarData: {},
            shadowTrials: defaultShadowTrials
          },
          onboarding_complete: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (error) {
        console.error('Error resetting data in Supabase:', error);
        toast.error('Failed to reset progress in cloud');
        return;
      }

      // Reset local state
      setStats(defaultStats);
      setQuests([]);
      setCompletedQuests(new Set());
      setQuestLog([]);
      setJournalEntries([]);
      setSkillTree(initialSkillTreeData);
      setCalendarData({});
      setShadowTrials(defaultShadowTrials);

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

  // Update stats with level calculation
  const updateStats = useCallback((newStats: Partial<Stats>) => {
    setStats(prevStats => {
      const updatedStats = { ...prevStats, ...newStats };
      
      // Recalculate level and XP to next level
      if ('xp' in newStats) {
        const newLevel = calculateLevelFromXp(updatedStats.xp);
        const wasLevelUp = newLevel > prevStats.level;
        
        updatedStats.level = newLevel;
        updatedStats.xpNextLevel = calculateXpToNextLevel(updatedStats.xp);
        
        // Handle level up
        if (wasLevelUp) {
          updatedStats.availablePoints += (newLevel - prevStats.level);
          setLevelUpAnimation(true);
          setLevelUpData({ newLevel, perk: null });
          
          setTimeout(() => setLevelUpAnimation(false), 3000);
          
          toast.success(`Level Up! You are now level ${newLevel}!`, {
            description: `You gained ${newLevel - prevStats.level} stat point(s) to allocate!`,
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
    const xpChange = isCompleting ? quest.xp : -quest.xp;
    
    // Prevent negative XP
    const newXp = Math.max(0, stats.xp + (quest.type === 'good' ? xpChange : -xpChange));
    
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
        type: quest.type
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

  // Add journal entry
  const addJournalEntry = useCallback((entryData: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = {
      ...entryData,
      id: `journal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    setJournalEntries(prev => [...prev, newEntry]);
    setTimeout(() => saveAllDataToSupabase(), 1000);
  }, [saveAllDataToSupabase]);

  // Add skill node
  const addSkillNode = useCallback((nodeData: { pathId: string; name: string; tasks: string[]; xp: number }) => {
    const newNode: SkillNode = {
      id: `skill-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: nodeData.name,
      description: `Custom skill: ${nodeData.name}`,
      xpRequired: nodeData.xp,
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

  // Complete skill node
  const completeSkillNode = useCallback((pathId: string, nodeId: string) => {
    setSkillTree(prev => prev.map(path => 
      path.id === pathId 
        ? {
            ...path,
            nodes: path.nodes.map(node => 
              node.id === nodeId 
                ? { ...node, isCompleted: true, isMastered: true }
                : node
            )
          }
        : path
    ));
    
    setTimeout(() => saveAllDataToSupabase(), 1000);
  }, [saveAllDataToSupabase]);

  // Clear level up data
  const clearLevelUpData = useCallback(() => {
    setLevelUpData(null);
  }, []);

  const value: PlayerContextType = {
    stats,
    updateStats,
    quests,
    completedQuests,
    questLog,
    journalEntries,
    skillTree,
    calendarData,
    shadowTrials,
    toggleQuest,
    addQuest,
    deleteQuest,
    addJournalEntry,
    addSkillNode,
    completeSkillNode,
    levelUpAnimation,
    levelUpData,
    clearLevelUpData,
    setConfettiConfig,
    saveAllDataToSupabase,
    loadAllDataFromSupabase,
    resetAllData
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
