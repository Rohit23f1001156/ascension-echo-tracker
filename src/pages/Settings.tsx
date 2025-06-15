
import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from "lucide-react";
import SharedLayout from '@/components/layout/SharedLayout';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

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
      </div>
    </SharedLayout>
  );
};

export default Settings;
