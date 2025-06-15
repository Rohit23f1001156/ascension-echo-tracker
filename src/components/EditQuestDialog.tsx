
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Lock, Unlock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { usePlayer, Quest } from '@/context/PlayerContext';

const questFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  xp: z.coerce.number().int().positive({ message: "XP must be a positive number." }).max(90, { message: "XP cannot exceed 90." }),
  isBadHabit: z.boolean().default(false),
  isRecurring: z.enum(["none", "daily", "weekly", "custom"]).default("none"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).default("Easy"),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
}).refine(data => {
  if (data.isRecurring === 'custom') {
    return !!data.startDate && !!data.endDate;
  }
  return true;
}, {
  message: "Start and end dates are required for custom recurrence.",
  path: ["startDate"],
});

type EditQuestFormValues = z.infer<typeof questFormSchema>;

interface EditQuestDialogProps {
  quest: Quest;
  children: React.ReactNode;
}

export function EditQuestDialog({ quest, children }: EditQuestDialogProps) {
  const { updateQuest } = usePlayer();
  const [open, setOpen] = useState(false);
  const [isXpEditingEnabled, setIsXpEditingEnabled] = useState(false);
  const [isDifficultyEditingEnabled, setIsDifficultyEditingEnabled] = useState(false);

  const form = useForm<EditQuestFormValues>({
    resolver: zodResolver(questFormSchema),
    defaultValues: {
      title: quest.title,
      xp: quest.xp,
      isBadHabit: quest.type === 'bad',
      isRecurring: quest.isRecurring || 'none',
      difficulty: quest.difficulty || 'Easy',
      startDate: quest.startDate ? new Date(quest.startDate) : undefined,
      endDate: quest.endDate ? new Date(quest.endDate) : undefined,
    },
  });
  
  const watchedRecurrence = form.watch("isRecurring");

  useEffect(() => {
    if (open) {
      form.reset({
        title: quest.title,
        xp: quest.xp,
        isBadHabit: quest.type === 'bad',
        isRecurring: quest.isRecurring || 'none',
        difficulty: quest.difficulty || 'Easy',
        startDate: quest.startDate ? new Date(quest.startDate) : undefined,
        endDate: quest.endDate ? new Date(quest.endDate) : undefined,
      });
      setIsXpEditingEnabled(false);
      setIsDifficultyEditingEnabled(false);
    }
  }, [open, quest, form]);

  const onSubmit = (data: EditQuestFormValues) => {
    updateQuest(quest.id, {
      title: data.title,
      xp: data.xp,
      type: data.isBadHabit ? 'bad' : 'good',
      isRecurring: data.isRecurring === 'none' ? undefined : data.isRecurring,
      difficulty: data.difficulty,
      startDate: data.startDate?.toISOString(),
      endDate: data.endDate?.toISOString(),
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Quest</DialogTitle>
          <DialogDescription>
            Make changes to your quest. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="xp"
                render={({ field }) => (
                  <FormItem>
                     <div className="flex items-center justify-between">
                      <FormLabel>XP Value</FormLabel>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6" type="button">
                            {isXpEditingEnabled ? <Unlock className="w-4 h-4 text-primary" /> : <Lock className="w-4 h-4" />}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Changing XP manually can unbalance the game. Cheating won't make your progress feel rewarding. Do you still want to proceed?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => setIsXpEditingEnabled(true)}>Yes, I understand</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 20" {...field} disabled={!isXpEditingEnabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Difficulty</FormLabel>
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6" type="button">
                           {isDifficultyEditingEnabled ? <Unlock className="w-4 h-4 text-primary" /> : <Lock className="w-4 h-4" />}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Changing the difficulty after creating a quest can affect its intended challenge and reward. Are you sure you want to modify it?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => setIsDifficultyEditingEnabled(true)}>Yes, change it</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isDifficultyEditingEnabled}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recurrence</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select how often this quest repeats" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Not Recurring</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Set a quest to repeat daily or weekly to build habits.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {watchedRecurrence === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                     <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
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
               <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
