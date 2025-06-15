
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import SharedLayout from '@/components/layout/SharedLayout';
import { type ActiveModifiers } from 'react-day-picker';
import { usePlayer } from '@/context/PlayerContext';
import { isSameDay, parseISO } from 'date-fns';
import DayDetailModal from '@/components/DayDetailModal';
import type { Quest, JournalEntry } from '@/context/PlayerContext';
import { Calendar } from '@/components/ui/calendar';
import TimeStats from '@/components/TimeStats';

const CalendarPage = () => {
  const { quests, questLog, journalEntries } = usePlayer();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const dayModifiers = useMemo(() => {
    const modifiers: Record<string, Date[]> = {};
    questLog.forEach(log => {
      const date = new Date(log.date);
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
      backgroundColor: 'hsl(var(--primary) / 0.2)',
      borderColor: 'hsl(var(--primary) / 0.4)',
      boxShadow: '0 0 10px hsl(var(--primary) / 0.3)',
      borderRadius: '9999px',
    },
  };

  const handleDayClick = (day: Date, modifiers: ActiveModifiers) => {
    // We only want to open the modal for days that have activity or for today
    if (modifiers.completed || modifiers.today) {
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

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card className="bg-card/80 border-primary/20">
          <CardHeader>
            <CardTitle>Progress Calendar</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              onDayClick={handleDayClick}
              modifiers={dayModifiers}
              modifierStyles={modifierStyles}
              className="p-0"
              classNames={{
                day_today:
                  'bg-accent/50 text-accent-foreground border-2 border-primary/50 animate-pulse-border rounded-full',
              }}
            />
          </CardContent>
        </Card>
        <div className="space-y-8">
          <TimeStats />
        </div>
      </div>
      
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
