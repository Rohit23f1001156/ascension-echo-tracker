
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import SharedLayout from '@/components/layout/SharedLayout';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { usePlayer } from '@/context/PlayerContext';
import { isSameDay, parseISO } from 'date-fns';
import DayDetailModal from '@/components/DayDetailModal';
import type { Quest, JournalEntry } from '@/context/PlayerContext';

const CalendarPage = () => {
  const { quests, questLog, journalEntries } = usePlayer();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const completedOnDay = (date: Date): number => {
    return questLog.filter(log => isSameDay(new Date(log.date), date)).length;
  };

  const dayModifiers = useMemo(() => {
    const modifiers: Record<string, Date[]> = {};
    questLog.forEach(log => {
      const date = new Date(log.date);
      // Create a modifier for any day with at least one completion
      const key = 'completed';
      if (!modifiers[key]) {
        modifiers[key] = [];
      }
       if(!modifiers[key].some(d => isSameDay(d, date))) {
         modifiers[key].push(date);
       }
    });
    return modifiers;
  }, [questLog]);

  const modifierStyles = {
    completed: { 
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
      border: '1px solid rgba(34, 197, 94, 0.4)',
     },
  };

  const handleDayClick = (day: Date, modifiers: { completed?: boolean }) => {
    // We only want to open the modal for days that have activity
    if (modifiers.completed) {
      setSelectedDate(day);
    }
  };

  const selectedDayData = useMemo(() => {
    if (!selectedDate) {
      return { completedQuests: [], journalEntry: null };
    }

    const completedQuestLogsOnDay = questLog.filter(log => isSameDay(new Date(log.date), selectedDate));
    
    const completedQuestIdsOnDay = new Set(
      completedQuestLogsOnDay.map(log => log.questId)
    );
    
    // We need to associate the original XP from the quest definition, not the final calculated XP from the log
    const completedQuestsOnDay: Quest[] = quests.filter(q => completedQuestIdsOnDay.has(q.id));

    const journalEntryOnDay: JournalEntry | null = journalEntries.find(entry => 
      isSameDay(parseISO(entry.createdAt), selectedDate)
    ) || null;

    return { completedQuests: completedQuestsOnDay, journalEntry: journalEntryOnDay };
  }, [selectedDate, questLog, quests, journalEntries]);


  return (
    <SharedLayout>
      <div className="flex justify-between items-center mb-4">
        <Button asChild variant="outline">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <header className="mb-8">
        <div>
          <h1 className="text-4xl font-bold">Shadow Gate Log</h1>
          <p className="text-muted-foreground">Tracking your battles, victories, and time.</p>
        </div>
      </header>

      <Card className="bg-card/80 border-primary/20">
        <CardHeader>
          <CardTitle>Progress Calendar</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <DayPicker
            mode="single"
            onDayClick={handleDayClick}
            modifiers={dayModifiers}
            modifierStyles={modifierStyles}
            className="text-base sm:text-lg"
            classNames={{
              day: 'h-10 w-10 sm:h-12 sm:w-12 text-base rounded-full',
              head_cell: 'w-10 sm:w-12',
            }}
          />
        </CardContent>
      </Card>
      
      <DayDetailModal 
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        date={selectedDate}
        quests={selectedDayData.completedQuests}
        journalEntry={selectedDayData.journalEntry}
      />
    </SharedLayout>
  );
};

export default CalendarPage;
