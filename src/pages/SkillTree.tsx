
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SharedLayout from "@/components/layout/SharedLayout";
import { skillTreeData } from "@/data/skillTreeData";
import SkillNodeCard from "@/components/SkillNodeCard";

const SkillTree = () => {
  // Unlocked skills state is now managed in PlayerContext, so we don't need it here.

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
                    <SkillNodeCard key={node.id} node={node} />
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
