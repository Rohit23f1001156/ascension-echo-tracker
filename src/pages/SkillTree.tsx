
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, Unlock, CheckCircle } from "lucide-react";
import SharedLayout from "@/components/layout/SharedLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { skillTreeData } from "@/data/skillTreeData";

const SkillNodeCard = ({ node, unlockedSkills }) => {
  const isMastered = unlockedSkills.has(node.id);
  
  // A node is locked if it has dependencies and not all of them are mastered.
  // The very first nodes have no dependencies and are considered unlocked.
  const isLocked = node.dependencies?.length > 0 && !node.dependencies.every(dep => unlockedSkills.has(dep));

  const handleStartQuest = () => {
    // This will be implemented later to add tasks to the daily quests.
    console.log(`Starting quest for: ${node.name}`);
  };

  return (
    <Card className={`transition-all duration-300 flex flex-col h-full ${isLocked ? 'bg-card/30 border-dashed opacity-60' : 'bg-card/70'} ${isMastered ? 'border-primary/50' : ''}`}>
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
          <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
            {node.tasks.map((task, i) => (
              <li key={i}>{task}</li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end items-center mt-4">
          <p className="font-semibold text-primary text-right">{node.xp} XP</p>
        </div>
        {!isLocked && (
          <Button onClick={handleStartQuest} disabled={isMastered} className="w-full mt-4">
            {isMastered ? "Mastered" : "Start Quest"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};


const SkillTree = () => {
  // For demonstration, we'll mock the unlocked skills.
  // In the future, this state will be managed within the PlayerContext.
  const [unlockedSkills, setUnlockedSkills] = React.useState(new Set(['c1', 'l1', 'f1', 'h1', 'h4']));

  return (
    <SharedLayout>
      <div className="w-full max-w-7xl mx-auto">
        <Button asChild variant="outline" className="mb-8">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold font-serif">Skill Tree</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Unlock your potential by mastering skills across different life paths. Each completed skill unlocks new challenges.
          </p>
        </div>

        <div className="space-y-12">
          {skillTreeData.map((path) => (
            <div key={path.id}>
              <h2 className="text-3xl font-bold mb-2 font-serif text-primary">{path.name}</h2>
              <p className="text-muted-foreground mb-6">{path.description}</p>
              <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {path.nodes.map((node) => (
                    <SkillNodeCard key={node.id} node={node} unlockedSkills={unlockedSkills} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SharedLayout>
  );
};

export default SkillTree;
