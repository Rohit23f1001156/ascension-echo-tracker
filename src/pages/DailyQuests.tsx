import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Flame, Repeat, Edit, Trash2 } from "lucide-react";
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
  const { quests, completedQuests, toggleQuest, stats, setConfettiConfig, deleteQuest } = usePlayer();
  const [allGoodQuestsWereDone, setAllGoodQuestsWereDone] = useState(false);
  
  const totalXpPossible = useMemo(() => quests.filter(q => q.type === 'good').reduce((sum, q) => sum + q.xp, 0), [quests]);
  const currentXpEarned = useMemo(() => {
    return quests
      .filter(q => completedQuests.has(q.id))
      .reduce((sum, q) => {
        if (q.type === 'good') {
          return sum + q.xp;
        }
        // For this page's display, we only show positive XP earned.
        // The total XP calculation is handled in the context.
        return sum;
      }, 0);
  }, [completedQuests, quests]);
  
  const currentNetXp = useMemo(() => {
    return quests
      .filter(q => completedQuests.has(q.id))
      .reduce((sum, q) => {
        return sum + (q.type === 'good' ? q.xp : -q.xp);
      }, 0);
  }, [completedQuests, quests]);

  const goodQuests = useMemo(() => quests.filter(q => q.type === 'good'), [quests]);
  const allGoodQuestsCompleted = useMemo(() => {
    if (goodQuests.length === 0) return false;
    return goodQuests.every(q => completedQuests.has(q.id));
  }, [goodQuests, completedQuests]);

  useEffect(() => {
    if (allGoodQuestsCompleted && !allGoodQuestsWereDone) {
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
  }, [allGoodQuestsCompleted, allGoodQuestsWereDone, setConfettiConfig]);

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
            You've gained a net of {currentNetXp} XP today. Total possible from good habits: {totalXpPossible} XP.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={xpProgress} className="h-4" />
          <div className="flex items-center text-muted-foreground mt-2">
            <Flame className="w-4 h-4 mr-2 text-orange-500" />
            <span>{stats.streak || 0} Day Streak</span>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {quests.map((quest) => (
          <Card key={quest.id} className={`bg-card/80 border-primary/20 transition-all ${completedQuests.has(quest.id) ? 'border-primary bg-primary/10' : ''}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <Checkbox
                  id={quest.id}
                  checked={completedQuests.has(quest.id)}
                  onCheckedChange={() => toggleQuest(quest.id)}
                  disabled={quest.isRecurring && completedQuests.has(quest.id)}
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
                {quest.difficulty && <div className="text-xs font-semibold text-muted-foreground border rounded-full px-2 py-0.5">{quest.difficulty}</div>}
                <div className={`font-bold ${quest.type === 'good' ? 'text-primary' : 'text-destructive'}`}>
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
