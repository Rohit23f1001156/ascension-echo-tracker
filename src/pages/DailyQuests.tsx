
import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Flame, Repeat, Edit, Trash2, TrendingDown } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { toast } from "@/components/ui/sonner";
import { EditQuestDialog } from "@/components/EditQuestDialog";
import { AddDailyQuestDialog } from "@/components/AddDailyQuestDialog";
import SharedLayout from "@/components/layout/SharedLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DailyQuests = () => {
  const { quests, habits, completedQuests, toggleQuest, stats, setConfettiConfig, deleteQuest } = usePlayer();
  const [allGoodQuestsWereDone, setAllGoodQuestsWereDone] = useState(false);
  
  // Combine quests and habits for display
  const allQuests = [...quests, ...habits];
  
  const totalXpPossible = useMemo(() => 
    allQuests.filter(q => q.type === 'good').reduce((sum, q) => sum + q.xp, 0), 
    [allQuests]
  );
  
  const currentXpEarned = useMemo(() => {
    return allQuests
      .filter(q => completedQuests.has(q.id) && q.type === 'good')
      .reduce((sum, q) => sum + q.xp, 0);
  }, [completedQuests, allQuests]);
  
  const currentDamageTaken = useMemo(() => {
    return allQuests
      .filter(q => completedQuests.has(q.id) && q.type === 'bad')
      .reduce((sum, q) => sum + q.xp, 0);
  }, [completedQuests, allQuests]);

  const goodQuests = useMemo(() => allQuests.filter(q => q.type === 'good'), [allQuests]);
  const allGoodQuestsCompleted = useMemo(() => {
    if (goodQuests.length === 0) return false;
    return goodQuests.every(q => completedQuests.has(q.id));
  }, [goodQuests, completedQuests]);

  useEffect(() => {
    if (allGoodQuestsCompleted && goodQuests.length > 0 && !allGoodQuestsWereDone) {
      toast.success("All Daily Quests Complete!", {
        description: "Incredible work! You've conquered the day.",
      });
      if (setConfettiConfig) {
        setConfettiConfig({ recycle: false, numberOfPieces: 500 });
        setTimeout(() => setConfettiConfig(null), 6000);
      }
      setAllGoodQuestsWereDone(true);
    } else if (!allGoodQuestsCompleted) {
      setAllGoodQuestsWereDone(false);
    }
  }, [allGoodQuestsCompleted, allGoodQuestsWereDone, setConfettiConfig, goodQuests.length]);

  const xpProgress = totalXpPossible > 0 ? (currentXpEarned / totalXpPossible) * 100 : 0;

  return (
    <SharedLayout>
      <div className="flex justify-between items-center mb-4">
        <Button asChild variant="outline">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <AddDailyQuestDialog />
      </div>
      <header className="mb-8">
        <div>
          <h1 className="text-4xl font-bold">Daily Quests</h1>
          <p className="text-muted-foreground">Complete these tasks to gain XP and level up.</p>
        </div>
      </header>

      <Card className="mb-8 bg-card/80 border-primary/20">
        <CardHeader>
          <CardTitle>Daily Progress</CardTitle>
          <CardDescription>
            You've gained {currentXpEarned} XP today from good habits.
            {currentDamageTaken > 0 && (
              <span className="text-destructive ml-2">
                Lost {currentDamageTaken} XP from bad habits.
              </span>
            )}
            {" "}Total possible: {totalXpPossible} XP.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={xpProgress} className="h-4" />
          <div className="flex items-center justify-between text-muted-foreground mt-2">
            <div className="flex items-center">
              <Flame className="w-4 h-4 mr-2 text-orange-500" />
              <span>{stats.streak || 0} Day Streak</span>
            </div>
            {currentDamageTaken > 0 && (
              <div className="flex items-center text-destructive">
                <TrendingDown className="w-4 h-4 mr-2" />
                <span>-{currentDamageTaken} XP damage</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {allQuests.map((quest) => (
          <Card key={quest.id} className={`bg-card/80 border-primary/20 transition-all ${
            completedQuests.has(quest.id) 
              ? quest.type === 'good' 
                ? 'border-green-500/50 bg-green-500/10' 
                : 'border-destructive/50 bg-destructive/10'
              : 'hover:border-primary/40'
          }`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <Checkbox
                  id={quest.id}
                  checked={completedQuests.has(quest.id)}
                  onCheckedChange={() => toggleQuest(quest.id)}
                />
                <label htmlFor={quest.id} className="font-medium cursor-pointer flex-1">
                  {quest.title}
                </label>
              </div>
              <div className="flex items-center gap-2">
                {quest.isRecurring && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Repeat className="w-3.5 h-3.5" />
                    {(quest.streak || 0) > 0 && (
                      <div className="flex items-center gap-1 text-orange-400 font-semibold">
                         <Flame className="w-4 h-4" />
                         <span>{quest.streak}</span>
                      </div>
                    )}
                  </div>
                )}
                {quest.difficulty && (
                  <div className="text-xs font-semibold text-muted-foreground border rounded-full px-2 py-0.5">
                    {quest.difficulty}
                  </div>
                )}
                <div className={`font-bold ${quest.type === 'good' ? 'text-green-500' : 'text-destructive'}`}>
                  {quest.type === 'good' ? '+' : '-'}{quest.xp} XP
                </div>
                <EditQuestDialog quest={quest}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="w-4 h-4" />
                  </Button>
                </EditQuestDialog>
                {!quest.isRecurring && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the quest "{quest.title}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteQuest(quest.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SharedLayout>
  );
};

export default DailyQuests;
