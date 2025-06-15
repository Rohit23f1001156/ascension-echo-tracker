
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Interfaces
export interface Quest {
  id: string;
  title: string;
  xp: number;
  type: 'good' | 'bad';
}

export interface SystemStats {
  title: string;
  class: string;
  level: number;
  xp: number;
  xpNextLevel: number;
  strength: number;
  stamina: number;
  concentration: number;
  intelligence: number;
  skills: number;
}

interface PlayerContextType {
  stats: SystemStats;
  quests: Quest[];
  completedQuests: Set<string>;
  addQuest: (questData: Omit<Quest, 'id'>) => void;
  toggleQuest: (questId: string) => void;
}

// Initial Data
const initialQuestsData: Quest[] = [
  { id: "water", title: "Drink 8 glasses of water", xp: 40, type: 'good' },
  { id: "yoga", title: "Yoga", xp: 100, type: 'good' },
  { id: "morning-routine", title: "Morning Routine (Brush + ice wash + face care)", xp: 100, type: 'good' },
  { id: "face-yoga", title: "Jawline & Face Yoga", xp: 20, type: 'good' },
  { id: "brush-twice", title: "Brush teeth twice", xp: 10, type: 'good' },
  { id: "read", title: "Read / Social Content", xp: 40, type: 'good' },
  { id: "journal", title: "Journaling", xp: 20, type: 'good' },
  { id: "workout-pre-breakfast", title: "Sung Jin-Woo mini-workout (pre-breakfast)", xp: 25, type: 'good' },
  { id: "workout-pre-lunch", title: "Sung Jin-Woo mini-workout (pre-lunch)", xp: 25, type: 'good' },
  { id: "workout-pre-dinner", title: "Sung Jin-Woo mini-workout (pre-dinner)", xp: 25, type: 'good' },
];

const initialStats: SystemStats = {
  title: "Beginner",
  class: "NA",
  level: 0,
  xp: 0,
  xpNextLevel: 1000,
  strength: 2,
  stamina: 5,
  concentration: 1,
  intelligence: 1,
  skills: 1,
};

// Create Context
const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Provider Component
export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [stats, setStats] = useState<SystemStats>(() => {
    const savedStats = localStorage.getItem('playerStats');
    return savedStats ? JSON.parse(savedStats) : initialStats;
  });
  const [quests, setQuests] = useState<Quest[]>(() => {
    const savedQuests = localStorage.getItem('playerQuests');
    return savedQuests ? JSON.parse(savedQuests) : initialQuestsData;
  });
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(() => {
    const savedCompleted = localStorage.getItem('completedQuests');
    return savedCompleted ? new Set(JSON.parse(savedCompleted)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem('playerStats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('playerQuests', JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem('completedQuests', JSON.stringify(Array.from(completedQuests)));
  }, [completedQuests]);

  const addQuest = (questData: Omit<Quest, 'id'>) => {
    const newQuest: Quest = {
      id: new Date().toISOString(),
      ...questData,
    };
    setQuests(prev => [...prev, newQuest]);
  };

  const toggleQuest = (questId: string) => {
    const newCompletedSet = new Set(completedQuests);
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    let xpChange = 0;
    if (newCompletedSet.has(questId)) {
      newCompletedSet.delete(questId);
      xpChange = quest.type === 'good' ? -quest.xp : quest.xp;
    } else {
      newCompletedSet.add(questId);
      xpChange = quest.type === 'good' ? quest.xp : -quest.xp;
    }
    setCompletedQuests(newCompletedSet);

    setStats(prevStats => {
      let newXp = prevStats.xp + xpChange;
      let newLevel = prevStats.level;
      let newXpNextLevel = prevStats.xpNextLevel;
      let newStrength = prevStats.strength;
      let newStamina = prevStats.stamina;
      let newConcentration = prevStats.concentration;
      let newIntelligence = prevStats.intelligence;
      let newSkills = prevStats.skills;

      while (newXp >= newXpNextLevel) {
        newLevel++;
        newXp -= newXpNextLevel;
        newXpNextLevel = Math.floor(newXpNextLevel * 1.5);
        newStrength += 1;
        newStamina += 1;
        newConcentration += 1;
        newIntelligence += 1;
        newSkills += 1;
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
        strength: newStrength,
        stamina: newStamina,
        concentration: newConcentration,
        intelligence: newIntelligence,
        skills: newSkills,
      };
    });
  };

  const value = { stats, quests, completedQuests, addQuest, toggleQuest };

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
