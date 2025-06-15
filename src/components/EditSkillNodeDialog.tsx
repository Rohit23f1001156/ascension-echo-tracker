
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePlayer } from '@/context/PlayerContext';
import { SkillNode } from '@/data/skillTreeData';

interface EditSkillNodeDialogProps {
  node: SkillNode;
  pathId: string;
  children: React.ReactNode;
}

export function EditSkillNodeDialog({ node, pathId, children }: EditSkillNodeDialogProps) {
  const { updateSkillNode } = usePlayer();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(node.name);
  const [description, setDescription] = useState(node.description);
  const [xp, setXp] = useState(node.xp);
  const [tasks, setTasks] = useState(node.tasks.join('\n'));

  const handleSubmit = () => {
    const tasksArray = tasks.split('\n').filter(t => t.trim() !== '');
    updateSkillNode(pathId, node.id, {
      name,
      description,
      xp: Number(xp),
      tasks: tasksArray,
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
            Make changes to your quest here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="xp" className="text-right">
              XP
            </Label>
            <Input id="xp" type="number" value={xp} onChange={(e) => setXp(Number(e.target.value))} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tasks" className="text-right">
              Tasks
            </Label>
            <Textarea
              id="tasks"
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              className="col-span-3"
              placeholder="One task per line"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
