
import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Brain, BarChart2, Zap } from "lucide-react";
import SharedLayout from '@/components/layout/SharedLayout';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const staticResponses = {
  focus: "To improve focus, try the Pomodoro Technique: work for 25 minutes, then take a 5-minute break. Eliminate distractions and set a clear goal for each session.",
  xp_trend: "Review your progress on the Calendar page to see your activity. Consistent daily effort, even small, builds momentum. Identify which quests grant the most XP and prioritize them.",
  motivation: "The path of a Shadow Hunter is not always easy. Remember why you started. Every quest completed, no matter how small, forges you into a stronger version of yourself. The shadows fear your persistence."
};

const Settings = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    morning: true,
    streak: true,
    journal: true,
  });

  useEffect(() => {
    const storedSettings = localStorage.getItem('notificationSettings');
    if (storedSettings) {
      setNotificationSettings(JSON.parse(storedSettings));
    }
  }, []);

  const handleSettingChange = (key: keyof typeof notificationSettings, value: boolean) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    toast.success("Settings saved!");
  };
  
  const handleCompanionPrompt = (type: keyof typeof staticResponses) => {
    toast.info("A whisper from your Shadow Companion...", {
      description: staticResponses[type],
      duration: 10000,
      position: 'top-center',
    });
  };

  return (
    <SharedLayout>
       <div className="flex justify-between items-center mb-4">
        <Button asChild variant="outline">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <header className="mb-8">
        <div>
          <h1 className="text-4xl font-bold">System Configuration</h1>
          <p className="text-muted-foreground">Customize your Shadow Ascendant experience.</p>
        </div>
      </header>
      
      <div className="grid gap-8 max-w-2xl mx-auto">
        <Card className="bg-card/80 border-primary/20">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Manage your reminders. Note: True push notifications require further setup and are not yet implemented.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="morning-notifications" className="cursor-pointer">Morning Motivation</Label>
              <Switch
                id="morning-notifications"
                checked={notificationSettings.morning}
                onCheckedChange={(checked) => handleSettingChange('morning', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="streak-notifications" className="cursor-pointer">Streak Reminders</Label>
              <Switch
                id="streak-notifications"
                checked={notificationSettings.streak}
                onCheckedChange={(checked) => handleSettingChange('streak', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="journal-notifications" className="cursor-pointer">End-of-Day Journal Reminder</Label>
              <Switch
                id="journal-notifications"
                checked={notificationSettings.journal}
                onCheckedChange={(checked) => handleSettingChange('journal', checked)}
              />
            </div>
          </CardContent>
        </Card>
        
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
      </div>
    </SharedLayout>
  );
};

export default Settings;
