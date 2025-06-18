import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/sonner';
import ReactConfetti from 'react-confetti';
import { Flame } from 'lucide-react';

// Skill Tree Types
export interface SkillNode {
  id: string;
  name: string;
  description: string;
  xp: number;
  tasks: string[];
  dependencies: string[];
  isCustom?: boolean;
}

export interface SkillPath {
  id: string;
  name: string;
  description: string;
  nodes: SkillNode[];
}

// Date utility functions
const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};

// Interfaces
export interface Quest {
  id: string;
  title: string;
  xp: number;
  type: 'good' | 'bad';
  category: 'strength' | 'stamina' | 'concentration' | 'intelligence' | 'wealth' | 'general';
  isRecurring?: 'daily' | 'weekly' | 'custom';
  lastCompleted?: string | null;
  streak?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  duration?: number; // in hours
  startDate?: string;
  endDate?: string;
}

export interface Buff {
  id: string;
  description: string;
  expiry: number; // timestamp
  stat: 'strength' | 'stamina' | 'concentration' | 'intelligence' | 'wealth';
  multiplier: number;
}

export interface Habit {
  id: string;
  title: string;
  type: 'good' | 'bad';
  streak: number;
  lastCompleted: string | null;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export type JournalEntry = {
  id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  createdAt: string;
};

export interface SystemStats {
  name: string;
  avatar: string;
  title: string;
  class: string;
  level: number;
  xp: number;
  xpNextLevel: number;
  strength: number;
  stamina: number;
  concentration: number;
  intelligence: number;
  wealth: number;
  skills: number;
  statPointsToAllocate: number;
  coins: number;
  streak: number;
  lastActivityDate: string | null;
  buffs: Buff[];
  journalStreak: number;
  lastJournalEntryDate: string | null;
}

export interface UserProfile {
  lifeAreas: string[];
  timeBudget: Record<string, number>;
  difficultyPreference: 'Easy' | 'Medium' | 'Hard';
}

interface PlayerContextType {
  stats: SystemStats;
  profile: UserProfile;
  quests: Quest[];
  habits: Habit[];
  completedQuests: Set<string>;
  addHabit: (habitData: Omit<Habit, 'id' | 'streak' | 'lastCompleted'>) => void;
  deleteHabit: (habitId: string) => void;
  toggleHabit: (habitId: string) => void;
  addQuest: (questData: Omit<Quest, 'id' | 'category' | 'lastCompleted' | 'streak'> & { category?: Quest['category'] }) => void;
  updateQuest: (questId: string, data: Partial<Quest>) => void;
  deleteQuest: (questId: string) => void;
  toggleQuest: (questId: string) => void;
  updatePlayerProfile: (stats: Partial<SystemStats>, profile: Partial<UserProfile>) => void;
  levelUpData: { newLevel: number, perk: Buff | null } | null;
  clearLevelUpData: () => void;
  levelUpAnimation: boolean;
  questLog: { questId: string; title: string; xp: number; date: number }[];
  allocateStatPoint: (stat: 'strength' | 'stamina' | 'concentration' | 'intelligence' | 'wealth') => void;
  masteredSkills: Set<string>;
  activeSkillQuests: Map<string, Set<string>>;
  startSkillQuest: (skillId: string) => void;
  cancelSkillQuest: (skillId: string) => void;
  toggleSkillTask: (skillId: string, task: string) => void;
  skillTree: SkillPath[];
  addSkillNode: (data: Omit<SkillNode, 'id' | 'description' | 'dependencies' | 'isCustom'> & { pathId: string }) => void;
  updateSkillNode: (pathId: string, skillId: string, data: Partial<Pick<SkillNode, 'name' | 'description' | 'xp' | 'tasks'>>) => void;
  deleteSkillNode: (pathId: string, skillId: string) => void;
  justMasteredSkillId: string | null;
  setConfettiConfig: React.Dispatch<React.SetStateAction<{ recycle: boolean; numberOfPieces: number } | null>>;
  journalEntries: JournalEntry[];
  addJournalEntry: (entryData: Omit<JournalEntry, 'id' | 'createdAt'>, editingEntryId: string | null) => void;
  deleteJournalEntry: (entryId: string) => void;
}

// Initial Skill Tree Data
const initialSkillTreeData: SkillPath[] = [
  {
    id: 'fitness',
    name: 'Physical Mastery',
    description: 'Build strength and endurance',
    nodes: [
      {
        id: 'basic-fitness',
        name: 'Basic Fitness',
        description: 'Start your fitness journey',
        xp: 100,
        tasks: ['Do 10 push-ups', 'Walk for 30 minutes', 'Drink 8 glasses of water'],
        dependencies: [],
      },
      {
        id: 'strength-training',
        name: 'Strength Training',
        description: 'Build muscle and power',
        xp: 250,
        tasks: ['Complete a strength workout', 'Lift weights for 45 minutes', 'Do 50 push-ups'],
        dependencies: ['basic-fitness'],
      },
    ],
  },
  {
    id: 'mental',
    name: 'Mental Fortitude',
    description: 'Develop focus and intelligence',
    nodes: [
      {
        id: 'meditation',
        name: 'Meditation',
        description: 'Find inner peace',
        xp: 150,
        tasks: ['Meditate for 10 minutes', 'Practice deep breathing', 'Journal your thoughts'],
        dependencies: [],
      },
    ],
  },
];

// Add Full Screen Level Up Animation component
const FullScreenLevelUpAnimation = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 pointer-events-none">
    <div className="text-6xl font-bold text-primary animate-pulse">
      LEVEL UP!
    </div>
  </div>
);

// A new reusable sorting function
const sortSkillNodes = (nodes: SkillNode[]): SkillNode[] => {
  const nodesCopy = [...nodes]; // Create a copy to avoid in-place modification
  nodesCopy.sort((a, b) => {
    // 1. Primary sort by XP (ascending)
    if (a.xp !== b.xp) {
      return a.xp - b.xp;
    }

    // 2. Secondary sort for tie-breaking
    const aIsOriginal = !a.isCustom;
    const bIsOriginal = !b.isCustom;

    // An original node always comes before a custom node
    if (aIsOriginal && !bIsOriginal) return -1;
    if (!aIsOriginal && bIsOriginal) return 1;

    // If both are custom, sort by creation date (from ID)
    if (!aIsOriginal && !bIsOriginal) {
       try {
          // ID is 'custom-ISO_STRING'
          const dateA = new Date(a.id.substring(7));
          const dateB = new Date(b.id.substring(7));
          if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
              return dateA.getTime() - dateB.getTime(); // older first
          }
       } catch (e) { /* ignore, fallback to id compare */ }
    }
    
    // For two original nodes or two custom nodes where date parsing fails,
    // maintain a consistent order using ID.
    return a.id.localeCompare(b.id);
  });
  return nodesCopy;
};

// Helper function to calculate XP needed for a specific level
const calculateXpForLevel = (level: number): number => {
  return 1000 + (level * 500);
};

// Helper function to determine current level from total XP
const calculateLevelFromXP = (totalXp: number): { level: number, xpForNextLevel: number } => {
  let level = 1;
  
  while (totalXp >= calculateXpForLevel(level)) {
    level++;
  }
  
  return {
    level,
    xpForNextLevel: calculateXpForLevel(level)
  };
};

// Initial Data
const initialQuestsData: Quest[] = [
  { id: "water", title: "Drink 8 glasses of water", xp: 40, type: 'good', category: 'stamina', difficulty: 'Easy' },
  { id: "yoga", title: "Yoga", xp: 90, type: 'good', category: 'stamina', difficulty: 'Medium' },
  { id: "morning-routine", title: "Morning Routine (Brush + ice wash + face care)", xp: 90, type: 'good', category: 'stamina', difficulty: 'Medium' },
  { id: "face-yoga", title: "Jawline & Face Yoga", xp: 20, type: 'good', category: 'stamina', difficulty: 'Easy' },
  { id: "brush-twice", title: "Brush teeth twice", xp: 10, type: 'good', category: 'stamina', difficulty: 'Easy' },
  { id: "read", title: "Read / Social Content", xp: 40, type: 'good', category: 'intelligence', difficulty: 'Easy' },
  { id: "journal", title: "Journaling", xp: 20, type: 'good', category: 'concentration', difficulty: 'Easy' },
  { id: "workout-pre-breakfast", title: "Sung Jin-Woo mini-workout (pre-breakfast)", xp: 25, type: 'good', category: 'strength', difficulty: 'Medium' },
  { id: "workout-pre-lunch", title: "Sung Jin-Woo mini-workout (pre-lunch)", xp: 25, type: 'good', category: 'strength', difficulty: 'Medium' },
  { id: "workout-pre-dinner", title: "Sung Jin-Woo mini-workout (pre-dinner)", xp: 25, type: 'good', category: 'strength', difficulty: 'Medium' },
];

const initialHabitsData: Habit[] = [
    { id: 'habit-workout', title: 'Daily Workout', type: 'good', difficulty: 'Medium', streak: 0, lastCompleted: null },
    { id: 'habit-no-junk-food', title: 'Avoid Junk Food', type: 'bad', difficulty: 'Easy', streak: 0, lastCompleted: null },
];

const initialStats: SystemStats = {
  name: "",
  avatar: "user",
  title: "Beginner",
  class: "NA",
  level: 1,
  xp: 0,
  xpNextLevel: 1000, // Updated initial value
  strength: 0,
  stamina: 0,
  concentration: 0,
  intelligence: 0,
  wealth: 0,
  skills: 0, // Start at 0, will be calculated from mastered skills
  statPointsToAllocate: 0,
  coins: 0,
  streak: 0,
  lastActivityDate: null,
  buffs: [],
  journalStreak: 0,
  lastJournalEntryDate: null,
};

const initialProfile: UserProfile = {
  lifeAreas: [],
  timeBudget: {},
  difficultyPreference: 'Medium',
};

// Create Context
const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Provider Component
export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [stats, setStats] = useState<SystemStats>(() => {
    const savedStats = localStorage.getItem('playerStats');
    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats);
        // Merge with initialStats to ensure all keys are present
        const mergedStats = { ...initialStats, ...parsedStats };
        
        // Recalculate level and xpNextLevel based on current XP using new formula
        const { level, xpForNextLevel } = calculateLevelFromXP(mergedStats.xp);
        mergedStats.level = level;
        mergedStats.xpNextLevel = xpForNextLevel;
        
        return mergedStats;
      } catch (e) {
        console.error("Failed to parse playerStats from localStorage", e);
        return initialStats;
      }
    }
    return initialStats;
  });
  const [profile, setProfile] = useState<UserProfile>(() => {
    const savedProfile = localStorage.getItem('playerProfile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        // Merge with initialProfile for robustness against data structure changes
        return { ...initialProfile, ...parsedProfile };
      } catch (e) {
        console.error("Failed to parse playerProfile from localStorage", e);
        return initialProfile;
      }
    }
    return initialProfile;
  });
  const [quests, setQuests] = useState<Quest[]>(() => {
    const savedQuests = localStorage.getItem('playerQuests');
    return savedQuests ? JSON.parse(savedQuests) : initialQuestsData;
  });
  const [habits, setHabits] = useState<Habit[]>(() => {
    const savedHabits = localStorage.getItem('playerHabits');
    return savedHabits ? JSON.parse(savedHabits) : initialHabitsData;
  });
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(() => {
    const savedCompleted = localStorage.getItem('completedQuests');
    return savedCompleted ? new Set(JSON.parse(savedCompleted)) : new Set();
  });
  const [questLog, setQuestLog] = useState<{ questId: string; title: string; xp: number; date: number }[]>(() => {
    const savedLog = localStorage.getItem('questLog');
    return savedLog ? JSON.parse(savedLog) : [];
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const storedEntries = localStorage.getItem('journalEntries');
    if (storedEntries) {
      try {
        return JSON.parse(storedEntries);
      } catch (e) {
        console.error("Failed to parse journalEntries from localStorage", e);
        return [];
      }
    }
    return [];
  });

  const [levelUpData, setLevelUpData] = useState<{ newLevel: number, perk: Buff | null } | null>(null);
  const [levelUpAnimation, setLevelUpAnimation] = useState(false);
  const [masteredSkills, setMasteredSkills] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('masteredSkills');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [activeSkillQuests, setActiveSkillQuests] = useState<Map<string, Set<string>>>(() => {
    const saved = localStorage.getItem('activeSkillQuests');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                // This converts arrays back into Sets, and handles malformed data from older versions.
                return new Map(parsed.map(([key, value]) => [key, new Set(Array.isArray(value) ? value : [])]));
            }
        } catch (e) {
            console.error("Failed to parse activeSkillQuests from localStorage", e);
        }
    }
    return new Map();
  });
  const [confettiConfig, setConfettiConfig] = useState<{ recycle: boolean, numberOfPieces: number } | null>(null);
  const [justMasteredSkillId, setJustMasteredSkillId] = useState<string | null>(null);

  const [skillTree, setSkillTree] = useState<SkillPath[]>(() => {
    const saved = localStorage.getItem('skillTree');
    let dataToProcess: SkillPath[];
    if (saved) {
      try {
        dataToProcess = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse skillTree from localStorage", e);
        dataToProcess = initialSkillTreeData;
      }
    } else {
      dataToProcess = initialSkillTreeData;
    }
    
    // Sort nodes within each path upon initialization
    return dataToProcess.map(path => ({
      ...path,
      nodes: sortSkillNodes(path.nodes),
    }));
  });

  // Effect to reset recurring quests and habits
  useEffect(() => {
    let questsNeedUpdate = false;
    let habitsNeedUpdate = false;
    let completedQuestsNeedUpdate = false;

    const updatedQuests = [...quests];
    const updatedHabits = [...habits];
    const updatedCompletedQuests = new Set(completedQuests);

    quests.forEach((quest, index) => {
      if (quest.isRecurring && quest.lastCompleted) {
        const lastCompletedDate = new Date(quest.lastCompleted);

        // Daily quests
        if (quest.isRecurring === 'daily' && !isToday(lastCompletedDate)) {
          // If it was completed and the day has passed, un-complete it for the new day
          if (completedQuests.has(quest.id)) {
            updatedCompletedQuests.delete(quest.id);
            completedQuestsNeedUpdate = true;
          }
          // If the last completion was not yesterday, reset the streak and notify
          if (!isYesterday(lastCompletedDate)) {
             if (quest.streak && quest.streak > 0) {
              toast.warning(`Streak Lost for "${quest.title}"`, {
                description: "You missed a day, but you can start a new streak today!",
              });
            }
            updatedQuests[index] = { ...quest, streak: 0 };
            questsNeedUpdate = true;
          }
        }
        
        // TODO: Weekly/Custom quest logic would go here
      }
    });

    habits.forEach((habit, index) => {
        if (habit.lastCompleted) {
            const lastCompletedDate = new Date(habit.lastCompleted);
            if (!isToday(lastCompletedDate) && !isYesterday(lastCompletedDate)) {
                if (habit.streak > 0) {
                    toast.warning(`Streak Lost for "${habit.title}"`, {
                        description: "You missed a day, but you can start a new streak today!",
                    });
                    updatedHabits[index] = { ...habit, streak: 0 };
                    habitsNeedUpdate = true;
                }
            }
        }
    });

    if (questsNeedUpdate) {
      setQuests(updatedQuests);
    }
    if (habitsNeedUpdate) {
      setHabits(updatedHabits);
    }
    if (completedQuestsNeedUpdate) {
      setCompletedQuests(updatedCompletedQuests);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on app startup

  const { user } = useAuth();

  // Load player data from local storage
  useEffect(() => {
    if (user) {
      const loadPlayerData = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            console.log('No user found, skipping Supabase load');
            return;
          }

          console.log('Loading player data from Supabase for user:', user.id);
          
          const { data, error } = await supabase
            .from('data')  // FIXED: Changed from 'profiles' to 'data'
            .select('*')
            .eq('id', user.id)
            .single(); // FIXED: Added .single() to prevent 406 errors

          if (error) {
            console.error("Supabase load error:", error);
            toast.error("Failed to load from cloud: " + error.message);
          } else {
            if (data) {
              const { stats, settings } = data;
              if (stats) setStats(prev => ({ ...prev, ...stats }));
              if (settings) setProfile(prev => ({ ...prev, ...settings }));
            } else {
              console.log('No data found in Supabase for user:', user.id);
            }
          }
        } catch (err) {
          console.error('Error loading player data:', err);
          toast.error('Failed to load progress. Check your connection.');
        }
      };

      loadPlayerData();
    }
  }, [user]);

  // Save player data to local storage and Supabase
  const savePlayerData = async () => {
    try {
      const statsToSave = JSON.stringify(stats);
      const profileToSave = JSON.stringify(profile);
      
      localStorage.setItem('playerStats', statsToSave);
      localStorage.setItem('playerProfile', profileToSave);
      
      // Save to Supabase if user is logged in
      if (user) {
        console.log('Saving to Supabase for user:', user.id);
        
        const profileData = {
          stats,
          settings: profile, // FIXED: Use 'profile' instead of undefined 'settings'
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('data')  // FIXED: Using 'data' instead of 'profiles'
          .update(profileData)
          .eq('id', user.id);

        if (error) {
          console.error('Supabase save error:', error);
          toast.error('Failed to save to cloud: ' + error.message);
        } else {
          console.log('Successfully saved to Supabase');
        }
      }
    } catch (error) {
      console.error('Error saving player data:', error);
      toast.error('Failed to save progress');
    }
  };

  // Auto-save to Supabase every 30 seconds if there's data
  useEffect(() => {
    if (stats.name) { // Only save if user has completed onboarding
      const interval = setInterval(savePlayerData, 30000); // Save every 30 seconds
      return () => clearInterval(interval);
    }
  }, [stats, profile, quests, habits, journalEntries, skillTree, masteredSkills]);

  useEffect(() => {
    localStorage.setItem('playerStats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('playerProfile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('playerQuests', JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem('playerHabits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('completedQuests', JSON.stringify(Array.from(completedQuests)));
  }, [completedQuests]);

  useEffect(() => {
    localStorage.setItem('questLog', JSON.stringify(questLog));
  }, [questLog]);

  useEffect(() => {
    localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    // Correctly serialize the Map of Sets to a JSON-compatible format.
    const serializable = JSON.stringify(
      Array.from(activeSkillQuests.entries()).map(([key, value]) => [key, Array.from(value)])
    );
    localStorage.setItem('activeSkillQuests', serializable);
  }, [activeSkillQuests]);

  useEffect(() => {
    localStorage.setItem('masteredSkills', JSON.stringify(Array.from(masteredSkills)));
  }, [masteredSkills]);

  useEffect(() => {
    localStorage.setItem('skillTree', JSON.stringify(skillTree));
  }, [skillTree]);

  // Update skills stat whenever masteredSkills changes
  useEffect(() => {
    setStats(prevStats => ({
      ...prevStats,
      skills: masteredSkills.size
    }));
  }, [masteredSkills]);

  const addQuest = (questData: Omit<Quest, 'id' | 'category' | 'lastCompleted' | 'streak'> & { category?: Quest['category'] }) => {
    const { isRecurring, ...restOfQuestData } = questData;
    const newQuest: Quest = {
      id: new Date().toISOString(),
      ...restOfQuestData,
      category: questData.category || 'general',
      type: questData.type || 'good',
      difficulty: questData.difficulty || 'Easy',
    };
    if (isRecurring) {
      newQuest.isRecurring = isRecurring;
      newQuest.streak = 0;
      newQuest.lastCompleted = null;
    }
    setQuests(prev => [...prev, newQuest]);
  };

  const updateQuest = (questId: string, data: Partial<Quest>) => {
    setQuests(prevQuests => 
        prevQuests.map(q => {
            if (q.id === questId) {
                const updatedQuest = { ...q, ...data };
                
                const recurrenceWasChanged = data.isRecurring !== undefined && q.isRecurring !== data.isRecurring;
                const recurrenceWasRemoved = q.isRecurring && data.isRecurring === undefined;

                if (recurrenceWasRemoved) {
                  delete updatedQuest.isRecurring;
                  delete updatedQuest.streak;
                  delete updatedQuest.lastCompleted;
                } else if (recurrenceWasChanged) {
                  updatedQuest.streak = 0;
                  updatedQuest.lastCompleted = null;
                }
                
                return updatedQuest;
            }
            return q;
        })
    );
    toast.success("Quest updated successfully!");
  };

  const deleteQuest = (questId: string) => {
    setQuests(prevQuests => prevQuests.filter(q => q.id !== questId));
    setCompletedQuests(prev => {
        const newSet = new Set(prev);
        newSet.delete(questId);
        return newSet;
    });
    toast.success("Quest deleted.");
  };

  const addHabit = (habitData: Omit<Habit, 'id' | 'streak' | 'lastCompleted'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: `habit-${new Date().toISOString()}`,
      streak: 0,
      lastCompleted: null,
    };
    setHabits(prev => [...prev, newHabit]);
    toast.success(`New Habit Added: ${newHabit.title}`);
  };

  const deleteHabit = (habitId: string) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
    toast.success("Habit removed.");
  };

  const deleteJournalEntry = (entryId: string) => {
    setJournalEntries(prev => prev.filter(entry => entry.id !== entryId));
    toast.info("Journal entry deleted.");
  };

  const addJournalEntry = (entryData: Omit<JournalEntry, 'id' | 'createdAt'>, editingEntryId: string | null) => {
    let isNewEntry = false;
    if (editingEntryId) {
      setJournalEntries(prev => prev.map(e => e.id === editingEntryId ? { ...e, ...entryData, id: e.id, createdAt: e.createdAt } : e));
      toast.success("Journal entry updated!");
    } else {
      isNewEntry = true;
      const newEntry: JournalEntry = {
        ...entryData,
        id: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      setJournalEntries(prev => [newEntry, ...prev]);
      toast.success("New journal entry saved!");
    }

    if (isNewEntry) {
      setStats(prevStats => {
        const now = new Date();
        let newJournalStreak = prevStats.journalStreak || 0;
        const lastDate = prevStats.lastJournalEntryDate ? new Date(prevStats.lastJournalEntryDate) : null;

        if (lastDate) {
          if (isYesterday(lastDate)) {
            newJournalStreak++;
          } else if (!isToday(lastDate)) {
            newJournalStreak = 1;
          }
        } else {
          newJournalStreak = 1;
        }

        let xpGained = 25; // Base XP
        let streakBonus = 0;

        if (newJournalStreak > 1) {
          if (newJournalStreak % 7 === 0) {
            streakBonus = 50;
            toast.success(`7-Day Journaling Streak! +${streakBonus} XP Bonus!`);
            setConfettiConfig({ recycle: false, numberOfPieces: 200 });
            setTimeout(() => setConfettiConfig(null), 4000);
          } else {
            toast.info(
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-400" />
                <span>{`Journaling streak: ${newJournalStreak} days!`}</span>
              </div>
            );
          }
        }
        
        xpGained += streakBonus;
        toast.info(`+${xpGained} XP for writing in your journal!`);

        let newXp = prevStats.xp + xpGained;
        let { level: newLevel, xpForNextLevel: newXpNextLevel } = calculateLevelFromXP(newXp);
        let newStatPointsToAllocate = prevStats.statPointsToAllocate;
        let awardedPerk: Buff | null = null;
        let newBuffs = prevStats.buffs.filter(b => b.expiry > Date.now());

        // Check if we leveled up
        if (newLevel > prevStats.level) {
          const levelsGained = newLevel - prevStats.level;
          newStatPointsToAllocate += levelsGained;
          setLevelUpData({ newLevel, perk: awardedPerk });
          setLevelUpAnimation(true);
          setTimeout(() => setLevelUpAnimation(false), 3000);
        }

        const titles = ["Beginner", "Amateur", "Semi Pro", "Professional", "World Class", "Legendary"];
        const titleIndex = Math.min(Math.floor((newLevel - 1) / 10), titles.length - 1);
        const newTitle = titles[titleIndex];

        return {
          ...prevStats,
          level: newLevel,
          xp: newXp,
          xpNextLevel: newXpNextLevel,
          title: newTitle,
          statPointsToAllocate: newStatPointsToAllocate,
          journalStreak: newJournalStreak,
          lastJournalEntryDate: now.toISOString(),
          buffs: newBuffs,
        };
      });
    }
  };

  const updatePlayerProfile = (newStats: Partial<SystemStats>, newProfile: Partial<UserProfile>) => {
    setStats(prev => {
      const isFirstTime = !prev.name && newStats.name;
      const updatedStats = {
        ...prev, 
        ...newStats,
        coins: isFirstTime ? (prev.coins || 0) + 20 : (prev.coins || 0),
      };
      return updatedStats;
    });
    setProfile(prev => ({ ...prev, ...newProfile }));
    localStorage.setItem('onboardingComplete', 'true');
    
    // Save to Supabase immediately after onboarding
    setTimeout(savePlayerData, 1000);
  };

  const clearLevelUpData = () => setLevelUpData(null);

  const allocateStatPoint = (stat: 'strength' | 'stamina' | 'concentration' | 'intelligence' | 'wealth') => {
    setStats(prevStats => {
      if (prevStats.statPointsToAllocate > 0) {
        toast.success(`Allocated 1 point to ${stat.charAt(0).toUpperCase() + stat.slice(1)}!`);
        return {
          ...prevStats,
          [stat]: prevStats[stat] + 1,
          statPointsToAllocate: prevStats.statPointsToAllocate - 1,
        };
      }
      return prevStats;
    });
  };

  const masterSkill = (skillId: string, skillXp: number) => {
    const skillNode = skillTree.flatMap(p => p.nodes).find(n => n.id === skillId);
    if (!skillNode) return;

    setMasteredSkills(prev => new Set(prev).add(skillId));
    setActiveSkillQuests(prev => {
        const newActiveQuests = new Map(prev);
        newActiveQuests.delete(skillId);
        return newActiveQuests;
    });
    
    toast.success(`Skill Mastered: ${skillNode.name}!`, {
      description: `You earned ${skillXp} XP!`,
    });
    setConfettiConfig({ recycle: false, numberOfPieces: 400 });
    setTimeout(() => setConfettiConfig(null), 5000);

    setJustMasteredSkillId(skillId);
    setTimeout(() => setJustMasteredSkillId(null), 1200);

    setStats(prevStats => {
       let newXp = prevStats.xp + skillXp;
       let { level: newLevel, xpForNextLevel: newXpNextLevel } = calculateLevelFromXP(newXp);
       let newStatPointsToAllocate = prevStats.statPointsToAllocate;
       let awardedPerk: Buff | null = null;
       
       const now = Date.now();
       let newBuffs = prevStats.buffs.filter(b => b.expiry > now);

       // Check if we leveled up
       if (newLevel > prevStats.level) {
         const levelsGained = newLevel - prevStats.level;
         newStatPointsToAllocate += levelsGained;

         const possiblePerks: Omit<Buff, 'id' | 'expiry'>[] = [
           { stat: 'concentration', description: "+10% Concentration XP for 24h", multiplier: 1.10 },
           { stat: 'intelligence', description: "+10% Intelligence XP for 24h", multiplier: 1.10 },
           { stat: 'strength', description: "+10% Strength XP for 24h", multiplier: 1.10 },
         ];
         const randomPerk = possiblePerks[Math.floor(Math.random() * possiblePerks.length)];
         awardedPerk = {
           ...randomPerk,
           id: new Date().toISOString(),
           expiry: Date.now() + 24 * 60 * 60 * 1000,
         };
         newBuffs.push(awardedPerk);
         setLevelUpData({ newLevel, perk: awardedPerk });
         setLevelUpAnimation(true);
         setTimeout(() => setLevelUpAnimation(false), 3000);
       }
       
       const titles = ["Beginner", "Amateur", "Semi Pro", "Professional", "World Class", "Legendary"];
       const titleIndex = Math.min(Math.floor((newLevel - 1) / 10), titles.length - 1);
       const newTitle = titles[titleIndex];

       return {
         ...prevStats,
         level: newLevel,
         xp: newXp,
         xpNextLevel: newXpNextLevel,
         title: newTitle,
         statPointsToAllocate: newStatPointsToAllocate,
         buffs: newBuffs,
         skills: masteredSkills.size + 1, // +1 for the skill we just mastered
       };
    });

    // Save to Supabase after skill mastery
    setTimeout(savePlayerData, 2000);
  };

  const startSkillQuest = (skillId: string) => {
    setActiveSkillQuests(prev => {
      const newActiveQuests = new Map(prev);
      if (!newActiveQuests.has(skillId)) {
        newActiveQuests.set(skillId, new Set());
        toast.info("Quest started! Let's get to work.");
      }
      return newActiveQuests;
    });
  };

  const cancelSkillQuest = (skillId: string) => {
    setActiveSkillQuests(prev => {
      const newActiveQuests = new Map(prev);
      if (newActiveQuests.has(skillId)) {
        newActiveQuests.delete(skillId);
        toast.warning("Quest cancelled.");
      }
      return newActiveQuests;
    });
  };

  const toggleSkillTask = (skillId: string, task: string) => {
    setActiveSkillQuests(prev => {
        const newActiveQuests = new Map(prev);
        const completedTasks = new Set(newActiveQuests.get(skillId));
        
        const skillNode = skillTree.flatMap(p => p.nodes).find(n => n.id === skillId);
        if (!skillNode) return prev;

        if(completedTasks.has(task)) {
            completedTasks.delete(task);
        } else {
            if (completedTasks.size < skillNode.tasks.length - 1) {
              toast.success(`Task complete: ${task}`);
              setConfettiConfig({ recycle: false, numberOfPieces: 150 });
              setTimeout(() => setConfettiConfig(null), 3000);
            }
            completedTasks.add(task);
        }

        newActiveQuests.set(skillId, completedTasks);

        if (skillNode && completedTasks.size === skillNode.tasks.length) {
            masterSkill(skillId, skillNode.xp);
        }
        
        return newActiveQuests;
    });
  };

  const addSkillNode = (data: Omit<SkillNode, 'id' | 'description' | 'dependencies' | 'isCustom'> & { pathId: string }) => {
    setSkillTree(prevTree => {
      const newTree = JSON.parse(JSON.stringify(prevTree)); // Deep copy
      const pathIndex = newTree.findIndex((p: SkillPath) => p.id === data.pathId);

      if (pathIndex > -1) {
        const newSkill: SkillNode = {
          ...data,
          id: `custom-${new Date().toISOString()}`,
          description: `A custom quest to master ${data.name}.`,
          isCustom: true,
          dependencies: [], // Custom nodes don't have dependencies by default
        };

        const newNodes = [...newTree[pathIndex].nodes, newSkill];
        
        newTree[pathIndex] = {
          ...newTree[pathIndex],
          nodes: sortSkillNodes(newNodes),
        };

        toast.success("New quest added successfully!");
      } else {
        toast.error("Could not find the selected skill path.");
      }
      return newTree;
    });
  };

  const updateSkillNode = (pathId: string, skillId: string, data: Partial<Pick<SkillNode, 'name' | 'description' | 'xp' | 'tasks'>>) => {
    setSkillTree(prevTree => {
      const newTree = JSON.parse(JSON.stringify(prevTree));
      const pathIndex = newTree.findIndex((p: SkillPath) => p.id === pathId);

      if (pathIndex > -1) {
        const nodeIndex = newTree[pathIndex].nodes.findIndex((n: SkillNode) => n.id === skillId);
        if (nodeIndex > -1) {
          newTree[pathIndex].nodes[nodeIndex] = {
            ...newTree[pathIndex].nodes[nodeIndex],
            ...data
          };
          newTree[pathIndex].nodes = sortSkillNodes(newTree[pathIndex].nodes);
          toast.success("Quest updated successfully!");
        }
      } else {
        toast.error("Could not find skill path.");
      }
      return newTree;
    });
  };

  const deleteSkillNode = (pathId: string, skillId: string) => {
    setSkillTree(prevTree => {
      const newTree = JSON.parse(JSON.stringify(prevTree));
      const pathIndex = newTree.findIndex((p: SkillPath) => p.id === pathId);
      if (pathIndex > -1) {
        const originalNodes = newTree[pathIndex].nodes;
        newTree[pathIndex].nodes = sortSkillNodes(originalNodes.filter((n: SkillNode) => n.id !== skillId));
        toast.success("Quest deleted successfully!");
      } else {
        toast.error("Could not find skill path.");
      }
      return newTree;
    });

    setMasteredSkills(prev => {
      const newSet = new Set(prev);
      newSet.delete(skillId);
      return newSet;
    });
    setActiveSkillQuests(prev => {
      const newMap = new Map(prev);
      newMap.delete(skillId);
      return newMap;
    });
  };

  const toggleQuest = (questId: string) => {
    const newCompletedSet = new Set(completedQuests);
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    const isCompleting = !completedQuests.has(quest.id);
    let questForXpCalc = { ...quest };

    // Handle recurring quest logic BEFORE stat updates
    if (isCompleting && quest.isRecurring) {
      const now = new Date();
      let newStreak = quest.streak || 0;
      const lastCompletedDate = quest.lastCompleted ? new Date(quest.lastCompleted) : null;

      if (lastCompletedDate) {
        if (quest.isRecurring === 'daily') {
          if (isYesterday(lastCompletedDate)) {
            newStreak++;
          } else if (!isToday(lastCompletedDate)) {
            newStreak = 1; // It was missed, so reset streak
          }
        }
        // Weekly logic would go here
      } else {
        newStreak = 1; // First time completing
      }

      if (newStreak > (quest.streak || 0) && newStreak > 1) {
        toast.info(
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-400" />
            <span>{`"${quest.title}" streak: ${newStreak} days!`}</span>
          </div>
        );
      }

      const updatedQuest = { ...quest, lastCompleted: now.toISOString(), streak: newStreak };
      questForXpCalc = updatedQuest;
      setQuests(prevQuests => prevQuests.map(q => q.id === questId ? updatedQuest : q));
    }

    setStats(prevStats => {
      const difficultyMultipliers = { Easy: 1, Medium: 1.25, Hard: 1.5 };
      const difficultyMultiplier = difficultyMultipliers[questForXpCalc.difficulty || 'Easy'] || 1;

      // Apply multipliers for completing a quest
      let finalXp = questForXpCalc.xp;
      if (isCompleting && questForXpCalc.type === 'good') {
        finalXp *= difficultyMultiplier;
        
        // Apply duration bonus: 5% extra XP per hour
        if (questForXpCalc.duration && questForXpCalc.duration > 0) {
          const durationBonus = questForXpCalc.duration * 0.05;
          finalXp *= (1 + durationBonus);
        }
        
        // Apply stat bonus
        const statMultiplier = 0.05; // 5% bonus per stat point
        const statBonus = (statValue: number) => statValue * statMultiplier;
        
        const categoryToStatMap = {
          strength: 'strength',
          stamina: 'stamina',
          concentration: 'concentration',
          intelligence: 'intelligence',
          wealth: 'wealth'
        };
        const statToBoost = categoryToStatMap[quest.category];

        if (statToBoost) {
          finalXp *= (1 + statBonus(prevStats[statToBoost]));
        }

        // Apply streak bonus for recurring quests based on milestones
        if (questForXpCalc.isRecurring && (questForXpCalc.streak || 0) > 0) {
          const streak = questForXpCalc.streak || 0;
          let streakBonus = 0;
          let milestoneMessage = "";
      
          if (streak >= 30) {
            streakBonus = 0.30;
            milestoneMessage = "30-Day Streak! Incredible consistency!";
            setConfettiConfig({ recycle: false, numberOfPieces: 500 });
            setTimeout(() => setConfettiConfig(null), 6000);
          } else if (streak >= 7) {
            streakBonus = 0.10;
            milestoneMessage = "7-Day Streak! Keep it up!";
            setConfettiConfig({ recycle: false, numberOfPieces: 200 });
            setTimeout(() => setConfettiConfig(null), 4000);
          } else if (streak >= 3) {
            streakBonus = 0.05;
            milestoneMessage = "3-Day Streak! You're on a roll!";
          }
      
          if (streakBonus > 0) {
            finalXp *= (1 + streakBonus);
            toast.success(`+${Math.round(streakBonus * 100)}% Bonus XP!`, {
              description: milestoneMessage,
            });
          }
        }

        // Apply buffs
        const now = Date.now();
        const activeBuffs = prevStats.buffs.filter(b => b.expiry > now);
        const relevantBuff = activeBuffs.find(b => b.stat === quest.category);
        if (relevantBuff) {
          finalXp *= relevantBuff.multiplier;
          toast.info(`Perk Activated: ${relevantBuff.description}`);
        }
        finalXp = Math.round(finalXp);
      }

      const coinsEarned = isCompleting && questForXpCalc.type === 'good' ? Math.round(questForXpCalc.xp * difficultyMultiplier * 0.1) : 0;
      let coinsChange = 0;
      let xpChange = 0;

      if (newCompletedSet.has(questId)) {
        newCompletedSet.delete(questId);
        xpChange = quest.type === 'good' ? -quest.xp : quest.xp; // Revert base XP on undo
        const previousCoins = Math.round(quest.xp * difficultyMultiplier * 0.1);
        coinsChange = -previousCoins;

        setQuestLog(prevLog => {
          const newLog = [...prevLog];
          const lastIndex = newLog.map(item => item.questId).lastIndexOf(questId);
          if (lastIndex > -1) {
            newLog.splice(lastIndex, 1);
            return newLog;
          }
          return prevLog;
        });
      } else {
        newCompletedSet.add(questId);
        xpChange = quest.type === 'good' ? finalXp : -finalXp;
        coinsChange = coinsEarned;
        setQuestLog(prevLog => [...prevLog, { questId: quest.id, title: quest.title, xp: finalXp, date: Date.now() }]);
      }
      setCompletedQuests(newCompletedSet);
      
      let newXp = prevStats.xp + xpChange;
      let { level: newLevel, xpForNextLevel: newXpNextLevel } = calculateLevelFromXP(newXp);
      let newStatPointsToAllocate = prevStats.statPointsToAllocate;
      let awardedPerk: Buff | null = null;
      
      // Check if we leveled up
      if (newLevel > prevStats.level) {
        const levelsGained = newLevel - prevStats.level;
        newStatPointsToAllocate += levelsGained;

        const possiblePerks: Omit<Buff, 'id' | 'expiry'>[] = [
          { stat: 'concentration', description: "+10% Concentration XP for 24h", multiplier: 1.10 },
          { stat: 'intelligence', description: "+10% Intelligence XP for 24h", multiplier: 1.10 },
          { stat: 'strength', description: "+10% Strength XP for 24h", multiplier: 1.10 },
        ];
        const randomPerk = possiblePerks[Math.floor(Math.random() * possiblePerks.length)];
        awardedPerk = {
          ...randomPerk,
          id: new Date().toISOString(),
          expiry: Date.now() + 24 * 60 * 60 * 1000,
        };
        newBuffs.push(awardedPerk);
        setLevelUpData({ newLevel, perk: awardedPerk });
        setLevelUpAnimation(true);
        setTimeout(() => setLevelUpAnimation(false), 3000);
      }
      
      const titles = ["Beginner", "Amateur", "Semi Pro", "Professional", "World Class", "Legendary"];
      const titleIndex = Math.min(Math.floor((newLevel - 1) / 10), titles.length - 1);
      const newTitle = titles[titleIndex];

      return {
        ...prevStats,
        level: newLevel,
        xp: Math.max(0, newXp),
        xpNextLevel: newXpNextLevel,
        title: newTitle,
        statPointsToAllocate: newStatPointsToAllocate,
        coins: Math.max(0, prevStats.coins + coinsChange),
      };
    });

    // Save to Supabase after significant changes
    setTimeout(savePlayerData, 2000);
  };

  const toggleHabit = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const isCompletedToday = habit.lastCompleted ? isToday(new Date(habit.lastCompleted)) : false;
    const now = new Date();
    let xpChange = 0;
    let coinsChange = 0;
    const difficultyMultipliers = { Easy: 10, Medium: 15, Hard: 20 };
    const coinRewards = { Easy: 2, Medium: 5, Hard: 10 };
    const baseXP = difficultyMultipliers[habit.difficulty];
    const baseCoins = coinRewards[habit.difficulty];

    if (isCompletedToday) {
        // --- UNDO ---
        const lastStreak = habit.streak > 0 ? habit.streak -1 : 0;
        const updatedHabit = { ...habit, streak: lastStreak, lastCompleted: null };
        setHabits(prev => prev.map(h => h.id === habitId ? updatedHabit : h));
        xpChange = -baseXP;
        coinsChange = -baseCoins;
        toast.info(`Undid progress for "${habit.title}".`);
    } else {
        // --- COMPLETE ---
        let newStreak = 1;
        if (habit.lastCompleted && isYesterday(new Date(habit.lastCompleted))) {
            newStreak = habit.streak + 1;
        }

        xpChange = baseXP;
        coinsChange = baseCoins;
        let streakBonus = 0;
        let streakCoinBonus = 0;

        if (newStreak > 0 && newStreak % 7 === 0) {
            streakBonus = 50; // 7-day streak bonus
            streakCoinBonus = 25;
            xpChange += streakBonus;
            coinsChange += streakCoinBonus;
            toast.success(`7-Day Streak Bonus! +${streakBonus} XP & +${streakCoinBonus} Coins!`);
        }

        const updatedHabit = { ...habit, streak: newStreak, lastCompleted: now.toISOString() };
        setHabits(prev => prev.map(h => h.id === habitId ? updatedHabit : h));
        toast.success(`Completed: "${habit.title}"! +${xpChange} XP & +${coinsChange} Coins`);
    }

    setStats(prevStats => {
        let newXp = prevStats.xp + xpChange;
        let { level: newLevel, xpForNextLevel: newXpNextLevel } = calculateLevelFromXP(newXp);
        const newCoins = prevStats.coins + coinsChange;
        let newStatPointsToAllocate = prevStats.statPointsToAllocate;
        
        // Check if we leveled up
        if (newLevel > prevStats.level) {
          const levelsGained = newLevel - prevStats.level;
          newStatPointsToAllocate += levelsGained;
          setLevelUpAnimation(true);
          setTimeout(() => setLevelUpAnimation(false), 3000);
        }

        return {
            ...prevStats,
            xp: Math.max(0, newXp),
            level: newLevel,
            xpNextLevel: newXpNextLevel,
            statPointsToAllocate: newStatPointsToAllocate,
            coins: Math.max(0, newCoins),
        };
    });
  };

  const value = { stats, profile, quests, habits, completedQuests, addQuest, updateQuest, deleteQuest, toggleQuest, addHabit, deleteHabit, toggleHabit, updatePlayerProfile, levelUpData, clearLevelUpData, levelUpAnimation, questLog, allocateStatPoint, masteredSkills, activeSkillQuests, startSkillQuest, cancelSkillQuest, toggleSkillTask, skillTree, addSkillNode, updateSkillNode, deleteSkillNode, justMasteredSkillId, setConfettiConfig, journalEntries, addJournalEntry, deleteJournalEntry };

  return (
    <PlayerContext.Provider value={value}>
      {confettiConfig && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={confettiConfig.recycle}
          numberOfPieces={confettiConfig.numberOfPieces}
          className="!fixed"
        />
      )}
      {levelUpAnimation && <FullScreenLevelUpAnimation />}
      {children}
    </PlayerContext.Provider>
  );
};

// Custom Hook
export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
