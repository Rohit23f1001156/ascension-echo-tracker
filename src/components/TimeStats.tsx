
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { differenceInDays, endOfMonth, endOfYear, startOfDay, format, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const TimeStats = () => {
  const [deadlines, setDeadlines] = useState<Date[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  useEffect(() => {
    const storedDeadlines = localStorage.getItem('userDeadlines');
    if (storedDeadlines) {
      try {
        const parsedDates = JSON.parse(storedDeadlines).map((d: string) => new Date(d));
        if (Array.isArray(parsedDates)) {
          setDeadlines(parsedDates.filter(d => !isNaN(d.getTime())));
        }
      } catch (e) {
        console.error("Failed to parse deadlines from localStorage", e);
        localStorage.removeItem('userDeadlines');
      }
    }
  }, []);

  const saveDeadlines = (newDeadlines: Date[]) => {
    setDeadlines(newDeadlines);
    localStorage.setItem('userDeadlines', JSON.stringify(newDeadlines.map(d => d.toISOString())));
  };

  const handleAddDeadline = (date: Date | undefined) => {
    if (date && !deadlines.some(d => isSameDay(d, date))) {
      const newDeadlines = [...deadlines, date].sort((a, b) => a.getTime() - b.getTime());
      saveDeadlines(newDeadlines);
    }
    setPopoverOpen(false);
  };

  const handleRemoveDeadline = (dateToRemove: Date) => {
    const newDeadlines = deadlines.filter(d => !isSameDay(d, dateToRemove));
    saveDeadlines(newDeadlines);
  };
  
  const today = startOfDay(new Date());
  const daysLeftInYear = differenceInDays(endOfYear(today), today);
  const daysLeftInMonth = differenceInDays(endOfMonth(today), today);

  return (
    <Card className="bg-card/80 border-primary/20">
      <CardHeader>
        <CardTitle>Temporal Countdown</CardTitle>
        <CardDescription>A measure of the time that remains.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Days remaining in year</span>
          <span className="font-bold text-lg text-primary">{daysLeftInYear}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Days remaining in month</span>
          <span className="font-bold text-lg text-primary">{daysLeftInMonth}</span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Personal deadlines</span>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant={"outline"} size="sm">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Add deadline
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  onSelect={handleAddDeadline}
                  disabled={(date) => date < today || deadlines.some(d => isSameDay(d, date))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          {deadlines.length > 0 ? (
            <div className="space-y-2">
              {deadlines.map((deadline) => {
                const daysLeft = differenceInDays(deadline, today);
                return (
                  <div key={deadline.toISOString()} className="flex justify-between items-center bg-primary/10 p-2 rounded-md">
                    <span className="font-semibold">{format(deadline, "PPP")}</span>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold text-lg ${daysLeft < 0 ? 'text-destructive' : 'text-primary'}`}>
                        {daysLeft >= 0 ? `${daysLeft} days` : 'Overdue'}
                      </span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveDeadline(deadline)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">No personal deadlines set.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeStats;
