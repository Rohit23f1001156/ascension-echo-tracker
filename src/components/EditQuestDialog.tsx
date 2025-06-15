
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
import { usePlayer, Quest } from '@/context/PlayerContext';

const questFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  xp: z.coerce.number().int().positive({ message: "XP must be a positive number." }),
  isBadHabit: z.boolean().default(false),
  isRecurring: z.enum(["none", "daily", "weekly"]).default("none"),
});

type EditQuestFormValues = z.infer<typeof questFormSchema>;

interface EditQuestDialogProps {
  quest: Quest;
  children: React.ReactNode;
}

export function EditQuestDialog({ quest, children }: EditQuestDialogProps) {
  const { updateQuest } = usePlayer();
  const [open, setOpen] = useState(false);

  const form = useForm<EditQuestFormValues>({
    resolver: zodResolver(questFormSchema),
    defaultValues: {
      title: quest.title,
      xp: quest.xp,
      isBadHabit: quest.type === 'bad',
      isRecurring: quest.isRecurring || 'none',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: quest.title,
        xp: quest.xp,
        isBadHabit: quest.type === 'bad',
        isRecurring: quest.isRecurring || 'none',
      });
    }
  }, [open, quest, form]);

  const onSubmit = (data: EditQuestFormValues) => {
    updateQuest(quest.id, {
      title: data.title,
      xp: data.xp,
      type: data.isBadHabit ? 'bad' : 'good',
      isRecurring: data.isRecurring === 'none' ? undefined : data.isRecurring,
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
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Set a quest to repeat daily or weekly to build habits.
                  </FormDescription>
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
