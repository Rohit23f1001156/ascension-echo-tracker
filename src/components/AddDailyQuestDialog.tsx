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
import { PlusCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";

const questFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  xp: z.coerce.number().int().positive({ message: "XP must be a positive number." }),
  isBadHabit: z.boolean().default(false),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).default("Easy"),
  isRecurring: z.boolean().default(false),
});

type AddQuestFormValues = z.infer<typeof questFormSchema>;

export function AddDailyQuestDialog() {
  const { addQuest } = usePlayer();
  const [isOpen, setIsOpen] = React.useState(false);

  const form = useForm<AddQuestFormValues>({
    resolver: zodResolver(questFormSchema),
    defaultValues: {
      title: "",
      xp: 10,
      isBadHabit: false,
      difficulty: "Easy",
      isRecurring: false,
    },
  });

  function onSubmit(data: AddQuestFormValues) {
    addQuest({
      title: data.title,
      xp: data.xp,
      type: data.isBadHabit ? 'bad' : 'good',
      difficulty: data.difficulty,
      isRecurring: data.isRecurring,
    });
    toast.success("New Quest Added!", { description: `You've added "${data.title}" to your daily quests.` });
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Daily Quest
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Daily Quest</DialogTitle>
          <DialogDescription>
            Add a new task or habit to your daily routine.
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
             <FormField
              control={form.control}
              name="xp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>XP Reward</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="10" {...field} />
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
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Is this a recurring quest?</FormLabel>
                    <FormDescription>
                      Recurring quests will reset every day.
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
