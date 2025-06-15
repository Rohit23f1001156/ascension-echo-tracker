import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Flame, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { usePlayer, Quest } from "@/context/PlayerContext";

const questFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  xp: z.coerce.number().int().positive({ message: "XP must be a positive number." }),
  isBadHabit: z.boolean().default(false),
});


const DailyQuests = () => {
  const { quests, completedQuests, addQuest, toggleQuest } = usePlayer();
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof questFormSchema>>({
    resolver: zodResolver(questFormSchema),
    defaultValues: {
      title: "",
      xp: 10,
      isBadHabit: false,
    },
  });

  function onAddQuest(values: z.infer<typeof questFormSchema>) {
    addQuest({
      title: values.title,
      xp: values.xp,
      type: values.isBadHabit ? 'bad' : 'good',
    });
    form.reset();
    setAddDialogOpen(false);
  }

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

  const xpProgress = totalXpPossible > 0 ? (currentXpEarned / totalXpPossible) * 100 : 0;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8">
      <Button asChild variant="outline" className="mb-4">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold">Daily Quests</h1>
          <p className="text-muted-foreground">Complete these tasks to gain XP and level up.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Quest
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Quest</DialogTitle>
              <DialogDescription>
                Define a new task. Is it a good habit to build or a bad one to break?
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onAddQuest)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quest Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Meditate for 10 minutes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="xp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>XP Value</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isBadHabit"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                       <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>This is a bad habit</FormLabel>
                        <FormDescription>
                          Check this if completing this quest means you performed a bad habit you want to avoid.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Add Quest</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
            <span>0 Day Streak</span>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {quests.map((quest) => (
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
              <div className={`font-bold ${quest.type === 'good' ? 'text-primary' : 'text-destructive'}`}>
                {quest.type === 'good' ? '+' : '-'}{quest.xp} XP
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DailyQuests;
