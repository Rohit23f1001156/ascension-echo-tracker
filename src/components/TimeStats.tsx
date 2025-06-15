
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { differenceInDays, endOfMonth, endOfYear, startOfDay, format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const TimeStats = () => {
  const [deadline, setDeadline] = useState<Date | undefined>();
  
  useEffect(() => {
    const storedDeadline = localStorage.getItem('userDeadline');
    if (storedDeadline) {
      const parsedDate = new Date(storedDeadline);
      if (!isNaN(parsedDate.getTime())) {
        setDeadline(parsedDate);
      }
    }
  }, []);

  const handleDeadlineSelect = (date: Date | undefined) => {
    setDeadline(date);
    if (date) {
      localStorage.setItem('userDeadline', date.toISOString());
    } else {
      localStorage.removeItem('userDeadline');
    }
  };
  
  const today = startOfDay(new Date());
  const daysLeftInYear = differenceInDays(endOfYear(today), today);
  const daysLeftInMonth = differenceInDays(endOfMonth(today), today);

  const daysLeftToDeadline = deadline ? differenceInDays(deadline, today) : null;

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
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Personal deadline</span>
          <div className="flex items-center gap-2">
            {deadline && daysLeftToDeadline !== null && daysLeftToDeadline >= 0 ? (
               <span className="font-bold text-lg text-primary">{daysLeftToDeadline}</span>
            ) : (
              <span className="text-muted-foreground text-xs">Not set</span>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[150px] justify-start text-left font-normal",
                    !deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP") : <span>Set deadline</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={handleDeadlineSelect}
                  disabled={(date) => date < today}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeStats;
