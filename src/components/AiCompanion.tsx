
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, BarChart2, Zap } from "lucide-react";
import { toast } from 'sonner';

const staticResponses = {
  focus: "To improve focus, try the Pomodoro Technique: work for 25 minutes, then take a 5-minute break. Eliminate distractions and set a clear goal for each session.",
  xp_trend: "Review your progress on the Calendar page to see your activity. Consistent daily effort, even small, builds momentum. Identify which quests grant the most XP and prioritize them.",
  motivation: "The path of a Shadow Hunter is not always easy. Remember why you started. Every quest completed, no matter how small, forges you into a stronger version of yourself. The shadows fear your persistence."
};

const AiCompanion = () => {
  const handleCompanionPrompt = (type: keyof typeof staticResponses) => {
    toast.info("A whisper from your Shadow Companion...", {
      description: staticResponses[type],
      duration: 10000,
      position: 'top-center',
    });
  };

  return (
    <Card className="bg-card/80 border-primary/20">
        <CardHeader>
          <CardTitle>AI Shadow Companion</CardTitle>
          <CardDescription>
            Seek counsel from your companion. Select a prompt to receive insight.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start gap-2" onClick={() => handleCompanionPrompt('focus')}>
            <Brain className="h-4 w-4" /> How can I improve focus?
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2" onClick={() => handleCompanionPrompt('xp_trend')}>
            <BarChart2 className="h-4 w-4" /> How do I analyze my progress?
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2" onClick={() => handleCompanionPrompt('motivation')}>
            <Zap className="h-4 w-4" /> Motivate me!
          </Button>
        </CardContent>
    </Card>
  );
};

export default AiCompanion;
