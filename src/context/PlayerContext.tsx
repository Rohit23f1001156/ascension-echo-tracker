import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/sonner';
import { skillTreeData as initialSkillTreeData, SkillPath, SkillNode } from '@/data/skillTreeData';

// Interfaces
export interface Quest {
  id: string;
  title: string;
  xp: number;
  type: 'good' | 'bad';
  category: 'strength' | 'stamina' | 'concentration' | 'intelligence' | 'wealth' | 'general';
}

export interface Buff {
  id: string;
  description: string;
  expiry: number; // timestamp
  stat: 'strength' | 'stamina' | 'concentration' | 'intelligence' | 'wealth';
  multiplier: number;
}

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
  streak: number;
  lastActivityDate: string | null;
  buffs: Buff[];
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
  completedQuests: Set<string>;
  addQuest: (questData: Omit<Quest, 'id' | 'category'> & { category?: Quest['category'] }) => void;
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
}

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

// Initial Data
const initialQuestsData: Quest[] = [
  { id: "water", title: "Drink 8 glasses of water", xp: 40, type: 'good', category: 'stamina' },
  { id: "yoga", title: "Yoga", xp: 100, type: 'good', category: 'stamina' },
  { id: "morning-routine", title: "Morning Routine (Brush + ice wash + face care)", xp: 100, type: 'good', category: 'stamina' },
  { id: "face-yoga", title: "Jawline & Face Yoga", xp: 20, type: 'good', category: 'stamina' },
  { id: "brush-twice", title: "Brush teeth twice", xp: 10, type: 'good', category: 'stamina' },
  { id: "read", title: "Read / Social Content", xp: 40, type: 'good', category: 'intelligence' },
  { id: "journal", title: "Journaling", xp: 20, type: 'good', category: 'concentration' },
  { id: "workout-pre-breakfast", title: "Sung Jin-Woo mini-workout (pre-breakfast)", xp: 25, type: 'good', category: 'strength' },
  { id: "workout-pre-lunch", title: "Sung Jin-Woo mini-workout (pre-lunch)", xp: 25, type: 'good', category: 'strength' },
  { id: "workout-pre-dinner", title: "Sung Jin-Woo mini-workout (pre-dinner)", xp: 25, type: 'good', category: 'strength' },
];

const initialStats: SystemStats = {
  name: "",
  avatar: "user",
  title: "Beginner",
  class: "NA",
  level: 0,
  xp: 0,
  xpNextLevel: 1000,
  strength: 0,
  stamina: 0,
  concentration: 0,
  intelligence: 0,
  wealth: 0,
  skills: 1,
  statPointsToAllocate: 0,
  streak: 0,
  lastActivityDate: null,
  buffs: [],
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
        // Merge with initialStats to ensure all keys are present, especially `buffs`
        return { ...initialStats, ...parsedStats };
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
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(() => {
    const savedCompleted = localStorage.getItem('completedQuests');
    return savedCompleted ? new Set(JSON.parse(savedCompleted)) : new Set();
  });
  const [questLog, setQuestLog] = useState<{ questId: string; title: string; xp: number; date: number }[]>(() => {
    const savedLog = localStorage.getItem('questLog');
    return savedLog ? JSON.parse(savedLog) : [];
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
    localStorage.setItem('completedQuests', JSON.stringify(Array.from(completedQuests)));
  }, [completedQuests]);

  useEffect(() => {
    localStorage.setItem('questLog', JSON.stringify(questLog));
  }, [questLog]);

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

  const addQuest = (questData: Omit<Quest, 'id' | 'category'> & { category?: Quest['category'] }) => {
    const newQuest: Quest = {
      id: new Date().toISOString(),
      ...questData,
      category: questData.category || 'general',
    };
    setQuests(prev => [...prev, newQuest]);
  };

  const updatePlayerProfile = (newStats: Partial<SystemStats>, newProfile: Partial<UserProfile>) => {
    setStats(prev => ({ ...prev, ...newStats }));
    setProfile(prev => ({ ...prev, ...newProfile }));
    localStorage.setItem('onboardingComplete', 'true');
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
    setMasteredSkills(prev => new Set(prev).add(skillId));
    setActiveSkillQuests(prev => {
        const newActiveQuests = new Map(prev);
        newActiveQuests.delete(skillId);
        return newActiveQuests;
    });
    
    toast.success(`Skill Mastered! You earned ${skillXp} XP!`);

    setStats(prevStats => {
       let newXp = prevStats.xp + skillXp;
       let newLevel = prevStats.level;
       let newXpNextLevel = prevStats.xpNextLevel;
       let newStatPointsToAllocate = prevStats.statPointsToAllocate;
       let leveledUp = false;
       let awardedPerk: Buff | null = null;
       
       const now = Date.now();
       let newBuffs = prevStats.buffs.filter(b => b.expiry > now);

       while (newXp >= newXpNextLevel) {
         leveledUp = true;
         newLevel++;
         newXp -= newXpNextLevel;
         newXpNextLevel = 1000 + newLevel * 500;
         newStatPointsToAllocate += 1;
       }

       if (leveledUp) {
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
       const titleIndex = Math.min(Math.floor(newLevel / 10), titles.length - 1);
       const newTitle = titles[titleIndex];

       return {
         ...prevStats,
         level: newLevel,
         xp: Math.max(0, newXp),
         xpNextLevel: newXpNextLevel,
         title: newTitle,
         statPointsToAllocate: newStatPointsToAllocate,
         buffs: newBuffs,
       };
    });
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

        if(completedTasks.has(task)) {
            completedTasks.delete(task);
        } else {
            completedTasks.add(task);
        }

        newActiveQuests.set(skillId, completedTasks);

        const skillNode = skillTree.flatMap(p => p.nodes).find(n => n.id === skillId);
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

    setStats(prevStats => {
      // Apply multipliers for completing a quest
      let finalXp = quest.xp;
      if (!newCompletedSet.has(questId) && quest.type === 'good') {
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

      let xpChange = 0;
      if (newCompletedSet.has(questId)) {
        newCompletedSet.delete(questId);
        xpChange = quest.type === 'good' ? -quest.xp : quest.xp; // Revert base XP on undo
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
        setQuestLog(prevLog => [...prevLog, { questId: quest.id, title: quest.title, xp: finalXp, date: Date.now() }]);
      }
      setCompletedQuests(newCompletedSet);
      
      let newXp = prevStats.xp + xpChange;
      let newLevel = prevStats.level;
      let newXpNextLevel = prevStats.xpNextLevel;
      let newStatPointsToAllocate = prevStats.statPointsToAllocate;
      let leveledUp = false;
      let awardedPerk: Buff | null = null;
      
      const now = Date.now();
      let newBuffs = prevStats.buffs.filter(b => b.expiry > now);

      while (newXp >= newXpNextLevel) {
        leveledUp = true;
        newLevel++;
        newXp -= newXpNextLevel;
        newXpNextLevel = 1000 + newLevel * 500; // New XP formula
        newStatPointsToAllocate += 1;
      }

      if (leveledUp) {
        const possiblePerks: Omit<Buff, 'id' | 'expiry'>[] = [
          { stat: 'concentration', description: "+10% Concentration XP for 24h", multiplier: 1.10 },
          { stat: 'intelligence', description: "+10% Intelligence XP for 24h", multiplier: 1.10 },
          { stat: 'strength', description: "+10% Strength XP for 24h", multiplier: 1.10 },
        ];
        const randomPerk = possiblePerks[Math.floor(Math.random() * possiblePerks.length)];
        awardedPerk = {
          ...randomPerk,
          id: new Date().toISOString(),
          expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        };
        newBuffs.push(awardedPerk);
        setLevelUpData({ newLevel, perk: awardedPerk });
        setLevelUpAnimation(true);
        setTimeout(() => setLevelUpAnimation(false), 3000);
      }

      // Streak logic
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      let newStreak = prevStats.streak || 0;
      let newLastActivityDate = prevStats.lastActivityDate;
      
      if (xpChange > 0) { // Only count streak for positive actions
          if (newLastActivityDate !== today) { // And only once per day
              if (newLastActivityDate === yesterday) {
                  newStreak++;
              } else {
                  newStreak = 1; // Reset streak if a day was missed
              }
              newLastActivityDate = today;
          }
      }

      const titles = ["Beginner", "Amateur", "Semi Pro", "Professional", "World Class", "Legendary"];
      const titleIndex = Math.min(Math.floor(newLevel / 10), titles.length - 1);
      const newTitle = titles[titleIndex];

      return {
        ...prevStats,
        level: newLevel,
        xp: Math.max(0, newXp),
        xpNextLevel: newXpNextLevel,
        title: newTitle,
        strength: prevStats.strength,
        stamina: prevStats.stamina,
        concentration: prevStats.concentration,
        intelligence: prevStats.intelligence,
        wealth: prevStats.wealth,
        skills: prevStats.skills,
        statPointsToAllocate: newStatPointsToAllocate,
        streak: newStreak,
        lastActivityDate: newLastActivityDate,
        buffs: newBuffs,
      };
    });
  };

  const value = { stats, profile, quests, completedQuests, addQuest, toggleQuest, updatePlayerProfile, levelUpData, clearLevelUpData, levelUpAnimation, questLog, allocateStatPoint, masteredSkills, activeSkillQuests, startSkillQuest, cancelSkillQuest, toggleSkillTask, skillTree, addSkillNode, updateSkillNode, deleteSkillNode };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

// Custom Hook
export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
