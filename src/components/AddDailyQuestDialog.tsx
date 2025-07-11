import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlayer } from "@/context/PlayerContext";
import { PlusCircle, Calendar as CalendarIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from "@/components/ui/sonner";
import { Label } from "@/components/ui/label";

const questFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  xp: z.coerce.number().int().min(1, { message: "XP must be at least 1." }),
  duration: z.coerce.number().int().min(1, "Duration must be at least 1 minute.").max(180, "Max duration is 180 min. For longer tasks, please create a separate quest.").optional(),
  isBadHabit: z.boolean().default(false),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).default("Easy"),
  recurrence: z.enum(["None", "Daily", "Weekly", "Custom"]).default("None"),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  manualXp: z.boolean().default(false),
}).refine(
  (data) => {
    if (data.recurrence === "Custom") {
      return !!data.startDate && !!data.endDate;
    }
    return true;
  },
  {
    message: "Start and end dates are required for custom recurrence.",
    path: ["startDate"],
  }
).refine(
    (data) => {
        if (!data.manualXp) {
            return data.duration !== undefined && data.duration > 0;
        }
        return true;
    },
    {
        message: "Duration is required for automatic XP calculation.",
        path: ["duration"],
    }
);

type AddQuestFormValues = z.infer<typeof questFormSchema>;

export function AddDailyQuestDialog() {
  const { addQuest } = usePlayer();
  const [isOpen, setIsOpen] = React.useState(false);

  const form = useForm<AddQuestFormValues>({
    resolver: zodResolver(questFormSchema),
    defaultValues: {
      title: "",
      xp: 1, // Will be calculated
      isBadHabit: false,
      difficulty: "Easy",
      recurrence: "None",
      duration: 10,
      manualXp: false,
    },
  });

  const recurrence = form.watch("recurrence");
  const duration = form.watch("duration");
  const difficulty = form.watch("difficulty");
  const manualXp = form.watch("manualXp");

  const calculateXp = React.useCallback(() => {
    if (!duration || !difficulty || duration <= 0) return 1;

    const multipliers = { Easy: 1.5, Medium: 2.0, Hard: 3.0 };
    const baseXP = duration / 2;
    const multiplier = multipliers[difficulty];
    const finalXP = Math.floor(baseXP * multiplier);

    return Math.max(1, finalXP); // Removed the 100 XP cap
  }, [duration, difficulty]);

  React.useEffect(() => {
    if (!manualXp) {
        const calculated = calculateXp();
        form.setValue("xp", calculated, { shouldValidate: true });
    }
  }, [duration, difficulty, manualXp, form, calculateXp]);

  function onSubmit(data: AddQuestFormValues) {
    const { recurrence, startDate, endDate, isBadHabit, manualXp, ...restOfData } = data;

    const questPayload: any = {
      ...restOfData,
      type: isBadHabit ? 'bad' : 'good',
    };

    if (recurrence !== 'None') {
      questPayload.isRecurring = recurrence.toLowerCase() as 'daily' | 'weekly' | 'custom';
    }
    
    if (recurrence === 'Custom' && startDate && endDate) {
      questPayload.startDate = startDate.toISOString();
      questPayload.endDate = endDate.toISOString();
    }
    
    addQuest(questPayload);
    toast.success("New Quest Added!", { description: `You've added "${data.title}" to your quests.` });
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Quest
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Add New Quest</DialogTitle>
          <DialogDescription>
            Add a new task or habit. XP is calculated based on duration and difficulty.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Read for 15 minutes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 30" {...field} value={field.value ?? ''} />
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
                    <FormLabel>Difficulty</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a difficulty" />
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
              name="manualXp"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Manually set XP?</FormLabel>
                    <FormDescription>
                      Override automatic XP calculation.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {manualXp ? (
              <FormField
                control={form.control}
                name="xp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom XP</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="10" {...field} />
                    </FormControl>
                    <FormDescription>Set a custom XP value.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="space-y-2">
                <Label>Estimated XP</Label>
                <div className="flex items-center gap-2 text-lg font-semibold text-primary p-3 border rounded-md bg-muted/50">
                    <span>🧠</span>
                    <span>{calculateXp()} XP</span>
                </div>
                <FormDescription>Calculated based on duration and difficulty.</FormDescription>
              </div>
            )}
            <FormField
              control={form.control}
              name="recurrence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recurrence</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recurrence" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="None">Non-recurring</SelectItem>
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             {recurrence === 'Custom' && (
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Is this a bad habit?</FormLabel>
                    <FormDescription>
                      Completing a bad habit will deduct XP.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Create Quest</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
