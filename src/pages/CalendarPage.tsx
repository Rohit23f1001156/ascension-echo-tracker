
import React, { useState, useMemo } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle } from "lucide-react";
import { usePlayer } from '@/context/PlayerContext';
import { format, isSameDay } from 'date-fns';
import SharedLayout from '@/components/layout/SharedLayout';

const CalendarPage = () => {
  const { quests, completedQuests: completedQuestIds } = usePlayer();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const completedQuestsByDate = useMemo(() => {
    const map = new Map<string, any[]>();
    const completedQuests = quests.filter(q => completedQuestIds.has(q.id));

    completedQuests.forEach(quest => {
      // For now, we assume quests are completed 'today'.
      // A more robust system would timestamp completions.
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      if (!map.has(dateStr)) {
        map.set(dateStr, []);
      }
      map.get(dateStr)?.push(quest);
    });
    return map;
  }, [completedQuestIds, quests]);

  const selectedDayQuests = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return completedQuestsByDate.get(dateStr) || [];
  }, [selectedDate, completedQuestsByDate]);
  
  const daysWithCompletedQuests = Array.from(completedQuestsByDate.keys()).map(dateStr => new Date(dateStr));

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
          <p className="text-muted-foreground">Track your battles, victories, and time.</p>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="bg-card/80 border-primary/20">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="p-0"
              classNames={{
                month: "w-full space-y-4",
                table: "w-full border-collapse space-y-1",
                head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-9 w-full text-center text-sm p-0 relative",
                day: "h-14 w-full p-0 font-normal aria-selected:opacity-100",
              }}
              modifiers={{
                completed: daysWithCompletedQuests,
              }}
              modifiersStyles={{
                completed: { 
                  color: '#a78bfa',
                  backgroundColor: 'rgba(138, 43, 226, 0.1)',
                  fontWeight: 'bold'
                },
              }}
            />
          </Card>
        </div>
        <div>
          <Card className="bg-card/80 border-primary/20">
            <CardHeader>
              <CardTitle>
                {selectedDate ? format(selectedDate, 'PPP') : 'Select a day'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDayQuests.length > 0 ? (
                <ul className="space-y-2">
                  {selectedDayQuests.map(quest => (
                    <li key={quest.id} className="text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>{quest.title}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No quests completed on this day.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SharedLayout>
  );
};

export default CalendarPage;
