import React, { useEffect, useState } from 'react';
import Header from './Header';
import { usePlayer } from '@/context/PlayerContext';
import DailyReflectionModal, { ReflectionData } from '@/components/DailyReflectionModal';
import { isToday, format, parseISO } from 'date-fns';

const SharedLayout = ({ children }: { children: React.ReactNode }) => {
  const { addJournalEntry, journalEntries } = usePlayer();
  const [isReflectionModalOpen, setReflectionModalOpen] = useState(false);

  useEffect(() => {
    const showNotification = (title: string, options: NotificationOptions) => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, options);
      }
    };

    const notificationInterval = setInterval(() => {
      const now = new Date();
      const notificationSettings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
      
      // 1. Morning Motivation
      if (notificationSettings.morning) {
        const lastMorningNotification = localStorage.getItem('lastMorningNotification');
        // At 9:00 AM
        if (now.getHours() === 9 && now.getMinutes() === 0) {
          if (!lastMorningNotification || !isToday(parseISO(lastMorningNotification))) {
            showNotification("☀️ Good Morning, Shadow Hunter!", {
              body: "Time to conquer your quests for today. Let's make progress!",
              icon: '/favicon.ico',
            });
            localStorage.setItem('lastMorningNotification', now.toISOString());
          }
        }
      }

      // 2. End-of-Day Journal Reminder
      if (notificationSettings.journal) {
        const lastReflectionDate = localStorage.getItem('lastReflectionDate');
        // At 8 PM (20:00)
        if (now.getHours() === 20 && now.getMinutes() === 0) {
          if (!lastReflectionDate || !isToday(parseISO(lastReflectionDate))) {
            setReflectionModalOpen(true);
            showNotification("🌙 Evening Reflection", {
              body: "Time to reflect on your journey today. Open your journal.",
              icon: '/favicon.ico',
            });
          }
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(notificationInterval);
  }, []); // Run only on mount

  const handleSaveReflection = (data: ReflectionData) => {
    const reflectionContent = `### 🏆 Wins
${data.wins || "None recorded."}

### 💡 Learnings
${data.learnings || "None recorded."}

### 🎯 Goals for Tomorrow
${data.goals || "None recorded."}

### 🙏 Gratitude
${data.gratitude || "None recorded."}
`;

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayEntry = journalEntries.find(entry => format(parseISO(entry.createdAt), 'yyyy-MM-dd') === todayStr);

    if (todayEntry) {
      const updatedEntry = {
        title: todayEntry.title,
        mood: todayEntry.mood,
        tags: todayEntry.tags,
        content: `${todayEntry.content}\n\n---\n\n**Evening Reflection**\n\n${reflectionContent}`,
      };
      addJournalEntry(updatedEntry, todayEntry.id);
    } else {
      const newEntry = {
        title: `Journal - ${format(new Date(), 'PPP')}`,
        content: `**Evening Reflection**\n\n${reflectionContent}`,
        mood: '😐',
        tags: ['reflection'],
      };
      addJournalEntry(newEntry, null);
    }

    localStorage.setItem('lastReflectionDate', new Date().toISOString());
    setReflectionModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <div className="fixed inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="fixed left-0 top-0 -z-10 h-full w-full bg-[radial-gradient(circle_800px_at_100%_200px,#d5c5ff,transparent)]"></div>
      </div>
      <Header />
      <main className="container mx-auto px-4 py-8">
        {children}
        <DailyReflectionModal
          isOpen={isReflectionModalOpen}
          onClose={() => setReflectionModalOpen(false)}
          onSave={handleSaveReflection}
        />
      </main>
    </div>
  );
};

export default SharedLayout;
