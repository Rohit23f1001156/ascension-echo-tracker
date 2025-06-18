
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePlayer } from "@/context/PlayerContext";
import { Plus } from "lucide-react";
import { skillTreeData } from "@/data/skillTreeData";

export const AddQuestDialog = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tasks: [""],
    xp: 100,
    pathId: "",
    difficulty: "Medium" as "Easy" | "Medium" | "Hard"
  });

  const { addCustomSkillNode } = usePlayer();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.pathId || formData.tasks.filter(t => t.trim()).length === 0) {
      return;
    }

    const newNode = {
      name: formData.name,
      description: formData.description,
      tasks: formData.tasks.filter(task => task.trim() !== ""),
      xp: formData.xp,
      pathId: formData.pathId,
      isCustom: true
    };

    addCustomSkillNode(newNode);
    
    setFormData({
      name: "",
      description: "",
      tasks: [""],
      xp: 100,
      pathId: "",
      difficulty: "Medium"
    });
    setOpen(false);
  };

  const addTask = () => {
    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, ""]
    }));
  };

  const updateTask = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => i === index ? value : task)
    }));
  };

  const removeTask = (index: number) => {
    if (formData.tasks.length > 1) {
      setFormData(prev => ({
        ...prev,
        tasks: prev.tasks.filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Custom Skill
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Custom Skill</DialogTitle>
          <DialogDescription>
            Add a custom skill to your skill tree.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="skill-path">Skill Path</Label>
            <Select value={formData.pathId} onValueChange={(value) => setFormData(prev => ({ ...prev, pathId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill path" />
              </SelectTrigger>
              <SelectContent>
                {skillTreeData.map((path) => (
                  <SelectItem key={path.id} value={path.id}>
                    {path.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="skill-name">Skill Name</Label>
            <Input
              id="skill-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter skill name"
            />
          </div>

          <div>
            <Label htmlFor="skill-description">Description</Label>
            <Textarea
              id="skill-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe this skill"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="skill-xp">XP Reward</Label>
            <Input
              id="skill-xp"
              type="number"
              min="50"
              max="1000"
              step="50"
              value={formData.xp}
              onChange={(e) => setFormData(prev => ({ ...prev, xp: parseInt(e.target.value) || 100 }))}
            />
          </div>

          <div>
            <Label>Tasks to Complete</Label>
            {formData.tasks.map((task, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  value={task}
                  onChange={(e) => updateTask(index, e.target.value)}
                  placeholder={`Task ${index + 1}`}
                />
                {formData.tasks.length > 1 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => removeTask(index)}>
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addTask} className="mt-2">
              Add Task
            </Button>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Skill</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
