import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface JournalFormProps {
  entry?: {
    id: string;
    title: string;
    content: string;
    mood: string;
    tags: string[];
  };
  onSave: (entry: { title: string; content: string; mood: string; tags: string[]; date: string }) => void;
  onCancel: () => void;
}

const JournalForm: React.FC<JournalFormProps> = ({ entry, onSave, onCancel }) => {
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [mood, setMood] = useState(entry?.mood || '');
  const [tags, setTags] = useState<string[]>(entry?.tags || []);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      content,
      mood,
      tags,
      date: new Date().toISOString().split('T')[0] // Add the missing date field
    });
  };

  return (
    <Card className="w-full">
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
            />
          </div>
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts here..."
              className="min-h-[100px]"
            />
          </div>
          <div>
            <Label htmlFor="mood">Mood</Label>
            <Input
              type="text"
              id="mood"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="Enter your mood"
            />
          </div>
          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Button key={tag} variant="secondary" size="sm" onClick={() => handleRemoveTag(tag)}>
                  {tag}
                </Button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Add new tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
              />
              <Button type="button" size="sm" onClick={handleAddTag}>
                Add Tag
              </Button>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default JournalForm;
