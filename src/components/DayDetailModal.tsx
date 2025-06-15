
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import type { Quest, JournalEntry } from '@/context/PlayerContext';
import { BookText, CheckCircle2 } from 'lucide-react';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  quests: Quest[];
  journalEntry: JournalEntry | null;
}

const DayDetailModal = ({ isOpen, onClose, date, quests, journalEntry }: DayDetailModalProps) => {
  if (!isOpen || !date) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card/90 backdrop-blur-sm border-primary/20">
        <DialogHeader>
          <DialogTitle>Details for {format(date, 'PPP')}</DialogTitle>
          <DialogDescription>A look back at your accomplishments for this day.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 py-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Completed Quests</h3>
              {quests.length > 0 ? (
                <ul className="space-y-2">
                  {quests.map(quest => (
                    <li key={quest.id} className="flex items-center justify-between p-2 rounded-md bg-background/50">
                      <span>{quest.title}</span>
                      <Badge variant="secondary">+{quest.xp} XP</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">No quests were completed on this day.</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><BookText className="h-5 w-5 text-blue-500" /> Journal Entry</h3>
              {journalEntry ? (
                <div className="space-y-4 p-3 rounded-md bg-background/50 border border-border">
                  <h4 className="font-bold text-md">{journalEntry.mood} {journalEntry.title}</h4>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{journalEntry.content}</p>
                  {journalEntry.tags.length > 0 && journalEntry.tags[0] !== '' && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                      {journalEntry.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No journal entry was written on this day.</p>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DayDetailModal;
