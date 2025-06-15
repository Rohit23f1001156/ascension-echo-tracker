
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { usePlayer } from '@/context/PlayerContext';
import { SkillNode } from '@/data/skillTreeData';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface EditSkillNodeDialogProps {
  node: SkillNode;
  pathId: string;
  children: React.ReactNode;
}

const editQuestFormSchema = z.object({
  name: z.string().min(3, "Quest name must be at least 3 characters."),
  description: z.string().min(1, "Description cannot be empty."),
  xp: z.coerce.number().min(0, "XP cannot be negative."),
  tasks: z.array(z.object({ value: z.string().min(1, "Task cannot be empty.") })).min(1, "At least one task is required."),
});

type EditQuestFormValues = z.infer<typeof editQuestFormSchema>;

export function EditSkillNodeDialog({ node, pathId, children }: EditSkillNodeDialogProps) {
  const { updateSkillNode } = usePlayer();
  const [open, setOpen] = useState(false);

  const form = useForm<EditQuestFormValues>({
    resolver: zodResolver(editQuestFormSchema),
    defaultValues: {
      name: node.name,
      description: node.description,
      xp: node.xp,
      tasks: node.tasks.map(task => ({ value: task })),
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tasks',
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: node.name,
        description: node.description,
        xp: node.xp,
        tasks: node.tasks.map(task => ({ value: task })),
      });
    }
  }, [open, node, form]);

  const onSubmit = (data: EditQuestFormValues) => {
    updateSkillNode(pathId, node.id, {
      ...data,
      tasks: data.tasks.map(t => t.value),
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Quest</DialogTitle>
          <DialogDescription>
            Make changes to your quest here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-96 pr-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quest Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <FormLabel>Tasks to Master</FormLabel>
                  <div className="space-y-2 mt-2">
                    {fields.map((field, index) => (
                      <FormField
                        control={form.control}
                        key={field.id}
                        name={`tasks.${index}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Input placeholder={`Task ${index + 1}`} {...field} />
                                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                  <Trash2 />
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: "" })}>
                    <PlusCircle className="mr-2" />
                    Add Task
                  </Button>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
