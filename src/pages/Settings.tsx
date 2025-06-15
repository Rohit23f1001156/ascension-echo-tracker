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
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    // Ensure Notification API is available
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    const storedSettings = localStorage.getItem('notificationSettings');
    if (storedSettings) {
      setNotificationSettings(JSON.parse(storedSettings));
    }
  }, []);

  const handleRequestPermission = () => {
    if (!('Notification' in window)) {
        toast.error("This browser does not support desktop notification");
        return;
    }

    Notification.requestPermission().then((permission) => {
      setNotificationPermission(permission);
      if (permission === 'granted') {
        toast.success("Notifications enabled!");
      } else {
        toast.error("Notifications not enabled. You can change this in your browser settings.");
      }
    });
  };

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
              Manage your reminders and browser notification permissions. Note: True push notifications require further setup.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-md bg-muted/50 border">
                <div>
                    <Label>Browser Notifications</Label>
                    <p className="text-sm text-muted-foreground capitalize">
                        Current status: <span className="font-semibold">{notificationPermission}</span>
                    </p>
                </div>
                {notificationPermission !== 'granted' && (
                    <Button onClick={handleRequestPermission}>Enable</Button>
                )}
            </div>

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
