import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';
import { DialogFooter } from "@/components/ui/dialog";
import type { JournalEntry } from '@/context/PlayerContext';

const MOODS = ["😊", "😐", "😔", "😠", "🤩"];

interface JournalFormProps {
  onSave: (data: Omit<JournalEntry, 'id' | 'createdAt'>) => void;
  initialData: JournalEntry | null;
  onClose: () => void;
}

const JournalForm = ({ onSave, initialData, onClose }: JournalFormProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('😐');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setMood(initialData.mood);
      setTags(initialData.tags.join(', '));
    } else {
      setTitle('');
      setContent('');
      setMood('😐');
      setTags('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      return;
    }
    onSave({
      title,
      content,
      mood,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} required rows={5} placeholder="What's on your mind, hunter?" />
      </div>
      <div>
        <Label>Mood</Label>
        <div className="flex gap-2 mt-2">
          {MOODS.map(m => (
            <Button
              key={m}
              type="button"
              variant={mood === m ? "default" : "outline"}
              size="icon"
              onClick={() => setMood(m)}
              className="text-xl"
            >
              {m}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. #win, #study" />
      </div>
      <DialogFooter>
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          Save Entry
        </Button>
      </DialogFooter>
    </form>
  )
}

export default JournalForm;
