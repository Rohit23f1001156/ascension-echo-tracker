
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePlayer } from '@/context/PlayerContext';
import { Plus } from 'lucide-react';

interface HabitFormValues {
  title: string;
  xp: number;
  type: 'good' | 'bad';
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const AddHabitDialog = () => {
  const { addHabit } = usePlayer();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<HabitFormValues>({
    title: '',
    xp: 25,
    type: 'good',
    difficulty: 'Easy'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    addHabit({
      ...formData,
      streak: 0,
      isCompleted: false
    });

    setFormData({
      title: '',
      xp: 25,
      type: 'good',
      difficulty: 'Easy'
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Habit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Habit</DialogTitle>
          <DialogDescription>Create a new habit to track in your Shadow Trials.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter habit title"
              required
            />
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value: 'good' | 'bad') => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="good">Good Habit</SelectItem>
                <SelectItem value="bad">Bad Habit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select value={formData.difficulty} onValueChange={(value: 'Easy' | 'Medium' | 'Hard') => setFormData(prev => ({ ...prev, difficulty: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy (25 XP)</SelectItem>
                <SelectItem value="Medium">Medium (50 XP)</SelectItem>
                <SelectItem value="Hard">Hard (100 XP)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">Add Habit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddHabitDialog;
