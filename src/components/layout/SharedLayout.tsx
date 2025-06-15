
import React, { useEffect, useState } from 'react';
import Header from './Header';
import { usePlayer } from '@/context/PlayerContext';
import DailyReflectionModal, { ReflectionData } from '@/components/DailyReflectionModal';
import { isToday, format, parseISO } from 'date-fns';

const SharedLayout = ({ children }: { children: React.ReactNode }) => {
  const { addJournalEntry, journalEntries } = usePlayer();
  const [isReflectionModalOpen, setReflectionModalOpen] = useState(false);

  useEffect(() => {
    const checkReflectionTime = () => {
      try {
        const notificationSettings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
        if (notificationSettings.journal === false) { // Explicitly check for false
          return;
        }

        const lastReflectionDate = localStorage.getItem('lastReflectionDate');
        if (lastReflectionDate && isToday(parseISO(lastReflectionDate))) {
          return;
        }

        const now = new Date();
        if (now.getHours() >= 20) {
          setReflectionModalOpen(true);
        }
      } catch (error) {
        console.error("Failed to check for reflection time:", error);
      }
    };
    
    // Check after a short delay to ensure context is loaded
    const timer = setTimeout(checkReflectionTime, 3000);

    return () => clearTimeout(timer);
  }, []); // Run only on initial mount

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
