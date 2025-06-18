import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { skillTreeData } from '@/data/skillTreeData';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/sonner';

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  tasks: string[];
  xp: number;
  dependencies?: string[];
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  isCustom?: boolean;
}

export interface SkillPath {
  id:string;
  name: string;
  description: string;
  nodes: SkillNode[];
}

export interface Quest {
  id: string;
  title: string;
  xp: number;
  type: 'good' | 'bad';
  isRecurring?: boolean;
  streak?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export interface Stats {
  level: number;
  xp: number;
  xpNextLevel: number;
  strength: number;
  stamina: number;
  intelligence: number;
  wealth: number;
  concentration: number;
  skills: number;
  name: string;
  class: string;
  title: string;
  streak: number;
  availableStatPoints: number;
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
  content: string;
  mood?: number;
  tags?: string[];
}

export interface Buff {
  id: string;
  name: string;
  description: string;
  effect: string;
  duration?: number;
  type: 'permanent' | 'temporary';
}

interface PlayerContextType {
  stats: Stats;
  updateStats: (newStats: Partial<Stats>) => void;
  quests: Quest[];
  addQuest: (quest: Omit<Quest, 'id'>) => void;
  editQuest: (id: string, quest: Partial<Quest>) => void;
  deleteQuest: (id: string) => void;
  completedQuests: Set<string>;
  toggleQuest: (id: string) => void;
  questLog: QuestLogEntry[];
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  editJournalEntry: (id: string, content: string, mood?: number, tags?: string[]) => void;
  deleteJournalEntry: (id: string) => void;
  skillTree: any[];
  masteredSkills: Set<string>;
  activeSkillQuests: Map<string, Set<string>>;
  startSkillQuest: (nodeId: string) => void;
  cancelSkillQuest: (nodeId: string) => void;
  toggleSkillTask: (nodeId: string, task: string) => void;
  deleteSkillNode: (pathId: string, nodeId: string) => void;
  addCustomSkillNode: (node: any) => void;
  editSkillNode: (pathId: string, nodeId: string, updates: any) => void;
  setConfettiConfig: React.Dispatch<React.SetStateAction<any>> | null;
  levelUpAnimation: boolean;
  levelUpData: { newLevel: number; perk: Buff | null } | null;
  clearLevelUpData: () => void;
  justMasteredSkillId: string | null;
  buffs: Buff[];
  habits: Quest[];
  addHabit: (habit: Omit<Quest, 'id'>) => void;
  editHabit: (id: string, habit: Partial<Quest>) => void;
  deleteHabit: (id: string) => void;
  saveToCloud: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const initialStats: Stats = {
  level: 1,
  xp: 0,
  xpNextLevel: 100,
  strength: 5,
  stamina: 5,
  intelligence: 5,
  wealth: 5,
  concentration: 5,
  skills: 5,
  name: '',
  class: '',
  title: 'Novice',
  streak: 0,
  availableStatPoints: 0,
};

const calculateLevel = (xp: number) => Math.floor(Math.sqrt(xp / 50)) + 1;
const calculateXpForNextLevel = (level: number) => (level * level - 2 * level + 1) * 50;

const LEVEL_PERKS: { [key: number]: Buff } = {
  5: { id: 'perk-5', name: 'Quick Learner', description: 'Gain 10% more XP from all sources', effect: 'xp_boost_10', type: 'permanent' },
  10: { id: 'perk-10', name: 'Focused Mind', description: 'Gain +2 Concentration permanently', effect: 'concentration_2', type: 'permanent' },
  15: { id: 'perk-15', name: 'Strong Body', description: 'Gain +2 Strength and +2 Stamina permanently', effect: 'strength_stamina_2', type: 'permanent' },
  20: { id: 'perk-20', name: 'Brilliant Mind', description: 'Gain +3 Intelligence permanently', effect: 'intelligence_3', type: 'permanent' },
  25: { id: 'perk-25', name: 'Wealthy Strategist', description: 'Gain +3 Wealth permanently', effect: 'wealth_3', type: 'permanent' },
  30: { id: 'perk-30', name: 'Master of All', description: 'Gain +1 to all stats permanently', effect: 'all_stats_1', type: 'permanent' },
};

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  const [stats, setStats] = useState<Stats>(initialStats);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());
  const [questLog, setQuestLog] = useState<QuestLogEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [skillTree, setSkillTree] = useState(skillTreeData);
  const [masteredSkills, setMasteredSkills] = useState<Set<string>>(new Set());
  const [activeSkillQuests, setActiveSkillQuests] = useState<Map<string, Set<string>>>(new Map());
  const [setConfettiConfig, setSetConfettiConfig] = useState<React.Dispatch<React.SetStateAction<any>> | null>(null);
  const [levelUpAnimation, setLevelUpAnimation] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ newLevel: number; perk: Buff | null } | null>(null);
  const [justMasteredSkillId, setJustMasteredSkillId] = useState<string | null>(null);
  const [buffs, setBuffs] = useState<Buff[]>([]);
  const [habits, setHabits] = useState<Quest[]>([]);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<number>(0);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!session?.user) return;

    const autoSave = setInterval(() => {
      saveToCloud();
    }, 30000);

    return () => clearInterval(autoSave);
  }, [session]);

  // Debounced save function
  const debouncedSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveToCloud();
    }, 2000);
  };

  const saveToCloud = async () => {
    if (!session?.user) return;
    
    const now = Date.now();
    if (now - lastSaveRef.current < 1000) return; // Prevent spam saves
    lastSaveRef.current = now;

    try {
      const dataToSave = {
        stats,
        quests,
        completedQuests: Array.from(completedQuests),
        questLog,
        journalEntries,
        skillTree,
        masteredSkills: Array.from(masteredSkills),
        activeSkillQuests: Array.from(activeSkillQuests.entries()).map(([key, value]) => [key, Array.from(value)]),
        buffs,
        habits,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('data')
        .update({
          stats: dataToSave.stats,
          settings: {
            quests: dataToSave.quests,
            completedQuests: dataToSave.completedQuests,
            questLog: dataToSave.questLog,
            journalEntries: dataToSave.journalEntries,
            skillTree: dataToSave.skillTree,
            masteredSkills: dataToSave.masteredSkills,
            activeSkillQuests: dataToSave.activeSkillQuests,
            buffs: dataToSave.buffs,
            habits: dataToSave.habits
          },
          updated_at: dataToSave.updated_at
        })
        .eq('id', session.user.id);

      if (error) {
        console.error('Error saving to cloud:', error);
        toast.error('Failed to save to cloud: ' + error.message);
      }
    } catch (err) {
      console.error('Error in saveToCloud:', err);
      toast.error('Failed to save to cloud');
    }
  };

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedStats = localStorage.getItem('playerStats');
        if (savedStats) {
          const parsedStats = JSON.parse(savedStats);
          setStats(prev => ({ ...prev, ...parsedStats }));
        }

        const savedQuests = localStorage.getItem('playerQuests');
        if (savedQuests) {
          setQuests(JSON.parse(savedQuests));
        }

        const savedCompletedQuests = localStorage.getItem('completedQuests');
        if (savedCompletedQuests) {
          setCompletedQuests(new Set(JSON.parse(savedCompletedQuests)));
        }

        const savedQuestLog = localStorage.getItem('questLog');
        if (savedQuestLog) {
          setQuestLog(JSON.parse(savedQuestLog));
        }

        const savedJournalEntries = localStorage.getItem('journalEntries');
        if (savedJournalEntries) {
          setJournalEntries(JSON.parse(savedJournalEntries));
        }

        const savedSkillTree = localStorage.getItem('skillTree');
        if (savedSkillTree) {
          setSkillTree(JSON.parse(savedSkillTree));
        }

        const savedMasteredSkills = localStorage.getItem('masteredSkills');
        if (savedMasteredSkills) {
          setMasteredSkills(new Set(JSON.parse(savedMasteredSkills)));
        }

        const savedActiveSkillQuests = localStorage.getItem('activeSkillQuests');
        if (savedActiveSkillQuests) {
          const parsed = JSON.parse(savedActiveSkillQuests);
          const map = new Map(parsed.map(([key, value]: [string, string[]]) => [key, new Set(value)]));
          setActiveSkillQuests(map);
        }

        const savedBuffs = localStorage.getItem('playerBuffs');
        if (savedBuffs) {
          setBuffs(JSON.parse(savedBuffs));
        }

        const savedHabits = localStorage.getItem('playerHabits');
        if (savedHabits) {
          setHabits(JSON.parse(savedHabits));
        }
      } catch (error) {
        console.error('Error loading player data:', error);
      }
    };

    loadData();
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('playerStats', JSON.stringify(stats));
    debouncedSave();
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('playerQuests', JSON.stringify(quests));
    debouncedSave();
  }, [quests]);

  useEffect(() => {
    localStorage.setItem('completedQuests', JSON.stringify(Array.from(completedQuests)));
    debouncedSave();
  }, [completedQuests]);

  useEffect(() => {
    localStorage.setItem('questLog', JSON.stringify(questLog));
    debouncedSave();
  }, [questLog]);

  useEffect(() => {
    localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
    debouncedSave();
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem('skillTree', JSON.stringify(skillTree));
    debouncedSave();
  }, [skillTree]);

  useEffect(() => {
    localStorage.setItem('masteredSkills', JSON.stringify(Array.from(masteredSkills)));
    debouncedSave();
  }, [masteredSkills]);

  useEffect(() => {
    const serializable = Array.from(activeSkillQuests.entries()).map(([key, value]) => [key, Array.from(value)]);
    localStorage.setItem('activeSkillQuests', JSON.stringify(serializable));
    debouncedSave();
  }, [activeSkillQuests]);

  useEffect(() => {
    localStorage.setItem('playerBuffs', JSON.stringify(buffs));
    debouncedSave();
  }, [buffs]);

  useEffect(() => {
    localStorage.setItem('playerHabits', JSON.stringify(habits));
    debouncedSave();
  }, [habits]);

  const updateStats = (newStats: Partial<Stats>) => {
    setStats(prevStats => {
      const updatedStats = { ...prevStats, ...newStats };
      
      // Check for level up
      const newLevel = calculateLevel(updatedStats.xp);
      if (newLevel > prevStats.level) {
        updatedStats.level = newLevel;
        updatedStats.xpNextLevel = calculateXpForNextLevel(newLevel);
        updatedStats.availableStatPoints += (newLevel - prevStats.level);
        
        // Check for perk
        const perk = LEVEL_PERKS[newLevel];
        if (perk) {
          // Apply perk effects
          setBuffs(prev => [...prev, perk]);
          
          // Apply stat bonuses immediately
          if (perk.effect === 'concentration_2') {
            updatedStats.concentration += 2;
          } else if (perk.effect === 'strength_stamina_2') {
            updatedStats.strength += 2;
            updatedStats.stamina += 2;
          } else if (perk.effect === 'intelligence_3') {
            updatedStats.intelligence += 3;
          } else if (perk.effect === 'wealth_3') {
            updatedStats.wealth += 3;
          } else if (perk.effect === 'all_stats_1') {
            updatedStats.strength += 1;
            updatedStats.stamina += 1;
            updatedStats.intelligence += 1;
            updatedStats.wealth += 1;
            updatedStats.concentration += 1;
            updatedStats.skills += 1;
          }
        }
        
        // Trigger level up animation
        setLevelUpAnimation(true);
        setLevelUpData({ newLevel, perk });
        
        setTimeout(() => setLevelUpAnimation(false), 3000);
        
        toast.success(`Level Up! You are now level ${newLevel}!`, {
          description: perk ? `You gained a new perk: ${perk.name}` : "You gained +1 stat point!",
        });
      }
      
      return updatedStats;
    });
  };

  const toggleQuest = (id: string) => {
    const quest = quests.find(q => q.id === id) || habits.find(h => h.id === id);
    if (!quest) return;

    const wasCompleted = completedQuests.has(id);
    const newCompletedQuests = new Set(completedQuests);
    
    if (wasCompleted) {
      newCompletedQuests.delete(id);
      // Remove XP for uncompleting
      updateStats({ 
        xp: Math.max(0, stats.xp - (quest.type === 'good' ? quest.xp : -quest.xp))
      });
      
      // Remove from quest log
      setQuestLog(prev => prev.filter(entry => 
        !(entry.title === quest.title && entry.date === new Date().toDateString())
      ));
      
      toast.info(`Uncompleted: ${quest.title}`, {
        description: `${quest.type === 'good' ? 'Lost' : 'Regained'} ${quest.xp} XP`,
      });
    } else {
      newCompletedQuests.add(id);
      // Add XP for completing
      const xpChange = quest.type === 'good' ? quest.xp : -quest.xp;
      updateStats({ 
        xp: Math.max(0, stats.xp + xpChange)
      });
      
      // Add to quest log
      const logEntry: QuestLogEntry = {
        id: `${id}-${Date.now()}`,
        title: quest.title,
        xp: xpChange,
        date: new Date().toDateString(),
        type: quest.type
      };
      setQuestLog(prev => [logEntry, ...prev]);
      
      // Handle recurring quests
      if (quest.isRecurring) {
        const updatedQuests = quests.map(q => 
          q.id === id ? { ...q, streak: (q.streak || 0) + 1 } : q
        );
        setQuests(updatedQuests);
        
        const updatedHabits = habits.map(h => 
          h.id === id ? { ...h, streak: (h.streak || 0) + 1 } : h
        );
        setHabits(updatedHabits);
      }
      
      toast.success(`Completed: ${quest.title}`, {
        description: `${quest.type === 'good' ? 'Gained' : 'Lost'} ${quest.xp} XP`,
      });
    }
    
    setCompletedQuests(newCompletedQuests);
  };

  const addQuest = (quest: Omit<Quest, 'id'>) => {
    const newQuest = { ...quest, id: `quest-${Date.now()}` };
    setQuests(prev => [...prev, newQuest]);
    toast.success(`Added quest: ${quest.title}`);
  };

  const editQuest = (id: string, questUpdates: Partial<Quest>) => {
    setQuests(prev => prev.map(q => q.id === id ? { ...q, ...questUpdates } : q));
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...questUpdates } : h));
    toast.success('Quest updated successfully');
  };

  const deleteQuest = (id: string) => {
    setQuests(prev => prev.filter(q => q.id !== id));
    setHabits(prev => prev.filter(h => h.id !== id));
    setCompletedQuests(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    toast.success('Quest deleted');
  };

  const addHabit = (habit: Omit<Quest, 'id'>) => {
    const newHabit = { ...habit, id: `habit-${Date.now()}`, isRecurring: true };
    setHabits(prev => [...prev, newHabit]);
    toast.success(`Added habit: ${habit.title}`);
  };

  const editHabit = (id: string, habitUpdates: Partial<Quest>) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...habitUpdates } : h));
    toast.success('Habit updated successfully');
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    setCompletedQuests(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    toast.success('Habit deleted');
  };

  // Journal methods
  const addJournalEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry = { ...entry, id: `journal-${Date.now()}` };
    setJournalEntries(prev => [newEntry, ...prev]);
    toast.success('Journal entry added');
  };

  const editJournalEntry = (id: string, content: string, mood?: number, tags?: string[]) => {
    setJournalEntries(prev => 
      prev.map(entry => 
        entry.id === id ? { ...entry, content, mood, tags } : entry
      )
    );
    toast.success('Journal entry updated');
  };

  const deleteJournalEntry = (id: string) => {
    setJournalEntries(prev => prev.filter(entry => entry.id !== id));
    toast.success('Journal entry deleted');
  };

  // Skill Tree methods
  const startSkillQuest = (nodeId: string) => {
    setActiveSkillQuests(prev => {
      const newMap = new Map(prev);
      newMap.set(nodeId, new Set());
      return newMap;
    });
    toast.success('Skill quest started!');
  };

  const cancelSkillQuest = (nodeId: string) => {
    setActiveSkillQuests(prev => {
      const newMap = new Map(prev);
      newMap.delete(nodeId);
      return newMap;
    });
    toast.info('Skill quest cancelled');
  };

  const toggleSkillTask = (nodeId: string, task: string) => {
    setActiveSkillQuests(prev => {
      const newMap = new Map(prev);
      const tasks = newMap.get(nodeId) || new Set();
      
      if (tasks.has(task)) {
        tasks.delete(task);
      } else {
        tasks.add(task);
      }
      
      newMap.set(nodeId, tasks);
      
      // Check if skill is mastered
      const node = skillTree.flatMap(path => path.nodes).find(n => n.id === nodeId);
      if (node && tasks.size === node.tasks.length) {
        // Skill mastered!
        setMasteredSkills(prevMastered => new Set([...prevMastered, nodeId]));
        setJustMasteredSkillId(nodeId);
        setTimeout(() => setJustMasteredSkillId(null), 3000);
        
        updateStats({ 
          xp: stats.xp + node.xp,
          skills: stats.skills + 1
        });
        
        toast.success(`Skill Mastered: ${node.name}!`, {
          description: `Gained ${node.xp} XP and +1 Skill point!`,
        });
        
        newMap.delete(nodeId);
      }
      
      return newMap;
    });
  };

  const addCustomSkillNode = (node: any) => {
    const newNode = {
      ...node,
      id: `custom-${Date.now()}`,
      isCustom: true
    };
    
    setSkillTree(prev => 
      prev.map(path => 
        path.id === node.pathId 
          ? { ...path, nodes: [...path.nodes, newNode] }
          : path
      )
    );
    
    toast.success(`Added custom skill: ${node.name}`);
  };

  const editSkillNode = (pathId: string, nodeId: string, updates: any) => {
    setSkillTree(prev => 
      prev.map(path => 
        path.id === pathId 
          ? {
              ...path,
              nodes: path.nodes.map(node => 
                node.id === nodeId ? { ...node, ...updates } : node
              )
            }
          : path
      )
    );
    toast.success('Skill updated successfully');
  };

  const deleteSkillNode = (pathId: string, nodeId: string) => {
    setSkillTree(prev => 
      prev.map(path => 
        path.id === pathId 
          ? { ...path, nodes: path.nodes.filter(node => node.id !== nodeId) }
          : path
      )
    );
    
    // Clean up related data
    setMasteredSkills(prev => {
      const newSet = new Set(prev);
      newSet.delete(nodeId);
      return newSet;
    });
    
    setActiveSkillQuests(prev => {
      const newMap = new Map(prev);
      newMap.delete(nodeId);
      return newMap;
    });
    
    toast.success('Skill deleted');
  };

  const clearLevelUpData = () => {
    setLevelUpData(null);
  };

  const value: PlayerContextType = {
    stats,
    updateStats,
    quests,
    addQuest,
    editQuest,
    deleteQuest,
    completedQuests,
    toggleQuest,
    questLog,
    journalEntries,
    addJournalEntry,
    editJournalEntry,
    deleteJournalEntry,
    skillTree,
    masteredSkills,
    activeSkillQuests,
    startSkillQuest,
    cancelSkillQuest,
    toggleSkillTask,
    deleteSkillNode,
    addCustomSkillNode,
    editSkillNode,
    setConfettiConfig,
    levelUpAnimation,
    levelUpData,
    clearLevelUpData,
    justMasteredSkillId,
    buffs,
    habits,
    addHabit,
    editHabit,
    deleteHabit,
    saveToCloud,
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
