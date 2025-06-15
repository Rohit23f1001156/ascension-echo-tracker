
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Save } from 'lucide-react';

const GRATITUDE_PROMPTS = [
  "What made you smile today?",
  "Who supported you today?",
  "What’s something small you’re thankful for?",
  "What beautiful thing did you see today?",
];

export interface ReflectionData {
  wins: string;
  learnings: string;
  goals: string;
  gratitude: string;
}

interface DailyReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ReflectionData) => void;
}

const DailyReflectionModal = ({ isOpen, onClose, onSave }: DailyReflectionModalProps) => {
  const [wins, setWins] = useState('');
  const [learnings, setLearnings] = useState('');
  const [goals, setGoals] = useState('');
  const [gratitude, setGratitude] = useState('');
  
  const gratitudePrompt = useMemo(() => {
    return GRATITUDE_PROMPTS[Math.floor(Math.random() * GRATITUDE_PROMPTS.length)];
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ wins, learnings, goals, gratitude });
    // Clear fields after saving
    setWins('');
    setLearnings('');
    setGoals('');
    setGratitude('');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card/90 backdrop-blur-sm border-primary/20">
        <DialogHeader>
          <DialogTitle>End of Day Reflection</DialogTitle>
          <DialogDescription>
            The quiet hour is a time for thought and reflection.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label htmlFor="wins" className="text-muted-foreground">🏆 What were your wins today?</Label>
            <Textarea id="wins" value={wins} onChange={(e) => setWins(e.target.value)} rows={3} placeholder="A victory, no matter how small, is still a victory." className="bg-background/50" />
          </div>
          <div>
            <Label htmlFor="learnings" className="text-muted-foreground">💡 What did you learn or observe?</Label>
            <Textarea id="learnings" value={learnings} onChange={(e) => setLearnings(e.target.value)} rows={3} placeholder="Knowledge is a weapon. Arm yourself." className="bg-background/50" />
          </div>
          <div>
            <Label htmlFor="goals" className="text-muted-foreground">🎯 What are your goals for tomorrow?</Label>
            <Textarea id="goals" value={goals} onChange={(e) => setGoals(e.target.value)} rows={3} placeholder="The hunt for tomorrow begins now." className="bg-background/50" />
          </div>
          <div>
            <Label htmlFor="gratitude" className="text-muted-foreground">{gratitudePrompt}</Label>
            <Textarea id="gratitude" value={gratitude} onChange={(e) => setGratitude(e.target.value)} rows={2} className="bg-background/50" />
          </div>
          <DialogFooter>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save Reflection
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DailyReflectionModal;
