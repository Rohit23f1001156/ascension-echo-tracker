
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Unlock, CheckCircle, XCircle } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { SkillNode } from "@/data/skillTreeData";
import { cn } from "@/lib/utils";

interface SkillNodeCardProps {
  node: SkillNode;
  pathNodes: SkillNode[];
}

const SkillNodeCard = ({ node, pathNodes }: SkillNodeCardProps) => {
  const { 
    masteredSkills, 
    activeSkillQuests, 
    startSkillQuest, 
    cancelSkillQuest, 
    toggleSkillTask 
  } = usePlayer();

  const isMastered = masteredSkills.has(node.id);
  
  // New Unlock Logic: Only the first un-mastered skill in the path (sorted by XP) is unlocked.
  const firstUnmasteredNode = pathNodes.find(n => !masteredSkills.has(n.id));
  const isLocked = !isMastered && (firstUnmasteredNode ? node.id !== firstUnmasteredNode.id : false);

  const isActive = activeSkillQuests.has(node.id);

  const completedTasks = activeSkillQuests.get(node.id) || new Set();
  const progress = isActive ? (completedTasks.size / node.tasks.length) * 100 : 0;

  const handleStartQuest = () => {
    startSkillQuest(node.id);
  };

  const handleCancelQuest = () => {
    cancelSkillQuest(node.id);
  };

  return (
    <Card className={cn(
      "transition-all duration-300 flex flex-col h-full bg-card/70",
      isLocked && "bg-card/30 border-dashed opacity-60",
      isMastered && "border-green-500/50",
      isActive && "border-primary/80 shadow-lg shadow-primary/20 animate-pulse-border",
      // Add a fade-in animation for the currently available quest
      !isLocked && !isMastered && "animate-fade-in"
    )}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="truncate pr-2">{node.name}</span>
          {isLocked 
            ? <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" /> 
            : isMastered
              ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              : <Unlock className="w-5 h-5 text-primary flex-shrink-0" />
          }
        </CardTitle>
        <CardDescription>{node.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <div className="space-y-2 flex-grow">
          <p className="font-semibold text-sm">Tasks to Master:</p>
          {isActive ? (
            <ul className="text-sm space-y-2">
              {node.tasks.map((task, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Checkbox 
                    id={`${node.id}-${i}`} 
                    checked={completedTasks.has(task)}
                    onCheckedChange={() => toggleSkillTask(node.id, task)}
                  />
                  <label htmlFor={`${node.id}-${i}`} className={cn("cursor-pointer", completedTasks.has(task) && "line-through text-muted-foreground")}>
                    {task}
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
              {node.tasks.map((task, i) => (
                <li key={i}>{task}</li>
              ))}
            </ul>
          )}
        </div>

        {isActive && (
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-right mt-1 text-muted-foreground">{Math.round(progress)}% Complete</p>
          </div>
        )}

        <div className="flex justify-end items-center mt-4">
          <p className="font-semibold text-primary text-right">{node.xp} XP</p>
        </div>
        
        {!isLocked && !isMastered && (
          isActive ? (
             <Button onClick={handleCancelQuest} variant="destructive" className="w-full mt-4">
                <XCircle />
                Cancel Quest
             </Button>
          ) : (
            <Button onClick={handleStartQuest} className="w-full mt-4">
              Start Quest
            </Button>
          )
        )}
        {isMastered && (
           <Button disabled className="w-full mt-4">
            Mastered
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillNodeCard;
