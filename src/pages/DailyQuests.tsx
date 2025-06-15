
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Flame } from "lucide-react";

interface Quest {
  id: string;
  title: string;
  xp: number;
}

const initialQuests: Quest[] = [
  { id: "water", title: "Drink 8 glasses of water", xp: 40 },
  { id: "yoga", title: "Yoga", xp: 100 },
  { id: "morning-routine", title: "Morning Routine (Brush + ice wash + face care)", xp: 100 },
  { id: "face-yoga", title: "Jawline & Face Yoga", xp: 20 },
  { id: "brush-twice", title: "Brush teeth twice", xp: 10 },
  { id: "read", title: "Read / Social Content", xp: 40 },
  { id: "journal", title: "Journaling", xp: 20 },
  { id: "workout-pre-breakfast", title: "Sung Jin-Woo mini-workout (pre-breakfast)", xp: 25 },
  { id: "workout-pre-lunch", title: "Sung Jin-Woo mini-workout (pre-lunch)", xp: 25 },
  { id: "workout-pre-dinner", title: "Sung Jin-Woo mini-workout (pre-dinner)", xp: 25 },
];

const DailyQuests = () => {
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());

  const toggleQuest = (questId: string) => {
    setCompletedQuests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questId)) {
        newSet.delete(questId);
      } else {
        newSet.add(questId);
      }
      return newSet;
    });
  };

  const totalXpPossible = useMemo(() => initialQuests.reduce((sum, q) => sum + q.xp, 0), []);
  const currentXp = useMemo(() => {
    return initialQuests
      .filter(q => completedQuests.has(q.id))
      .reduce((sum, q) => sum + q.xp, 0);
  }, [completedQuests]);

  const xpProgress = totalXpPossible > 0 ? (currentXp / totalXpPossible) * 100 : 0;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8">
      <Button asChild variant="outline" className="mb-4">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
      <header className="mb-8">
        <h1 className="text-4xl font-bold">Daily Quests</h1>
        <p className="text-muted-foreground">Complete these tasks to gain XP and level up.</p>
      </header>

      <Card className="mb-8 bg-card/80 border-primary/20">
        <CardHeader>
          <CardTitle>Daily Progress</CardTitle>
          <CardDescription>
            You've earned {currentXp} / {totalXpPossible} XP today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={xpProgress} className="h-4" />
          <div className="flex items-center text-muted-foreground mt-2">
            <Flame className="w-4 h-4 mr-2 text-orange-500" />
            <span>0 Day Streak</span>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {initialQuests.map((quest) => (
          <Card key={quest.id} className={`bg-card/80 border-primary/20 transition-all ${completedQuests.has(quest.id) ? 'border-primary bg-primary/10' : ''}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Checkbox
                  id={quest.id}
                  checked={completedQuests.has(quest.id)}
                  onCheckedChange={() => toggleQuest(quest.id)}
                />
                <label htmlFor={quest.id} className="font-medium cursor-pointer flex-1">
                  {quest.title}
                </label>
              </div>
              <div className="text-primary font-bold">+{quest.xp} XP</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DailyQuests;
