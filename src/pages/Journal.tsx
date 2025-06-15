
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Trash2, Edit, BookOpen } from 'lucide-react';
import SharedLayout from '@/components/layout/SharedLayout';
import { format, parseISO } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import JournalForm from '@/components/JournalForm';
import { usePlayer } from '@/context/PlayerContext';
import type { JournalEntry } from '@/context/PlayerContext';

const Journal = () => {
  const { journalEntries, addJournalEntry, deleteJournalEntry } = usePlayer();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  const handleDelete = (id: string) => {
    deleteJournalEntry(id);
  };
  
  const handleSave = (entryData: Omit<JournalEntry, 'id' | 'createdAt'>) => {
    addJournalEntry(entryData, editingEntry ? editingEntry.id : null);
    setEditingEntry(null);
  };
  
  const openEditForm = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  }

  const openNewForm = () => {
    setEditingEntry(null);
    setIsFormOpen(true);
  }

  return (
    <SharedLayout>
      <div className="flex justify-between items-center mb-4">
        <Button asChild variant="outline">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewForm}>
              <BookOpen className="mr-2 h-4 w-4" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingEntry ? 'Edit Entry' : 'New Journal Entry'}</DialogTitle>
              <DialogDescription>Record your thoughts and reflections.</DialogDescription>
            </DialogHeader>
            <JournalForm
              onSave={handleSave}
              initialData={editingEntry}
              onClose={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      <header className="mb-8">
        <div>
          <h1 className="text-4xl font-bold">Journal of the Shadow Hunter</h1>
          <p className="text-muted-foreground">A grimoire for your thoughts, victories, and reflections.</p>
        </div>
      </header>

      <div className="space-y-4">
        {journalEntries.length === 0 ? (
          <Card className="text-center p-8 bg-card/80 border-primary/20">
            <p className="text-muted-foreground">Your journal is empty. Write your first entry!</p>
          </Card>
        ) : (
          journalEntries.map(entry => (
            <Card key={entry.id} className="bg-card/80 border-primary/20">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span className="flex items-center gap-2">{entry.mood} {entry.title}</span>
                  <span className="text-sm font-normal text-muted-foreground">{format(parseISO(entry.createdAt), 'PPP')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{entry.content}</p>
                {entry.tags.length > 0 && entry.tags[0] !== '' && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {entry.tags.map(tag => (
                      <span key={tag} className="text-xs font-semibold text-muted-foreground border rounded-full px-2 py-0.5">{tag}</span>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditForm(entry)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this journal entry.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(entry.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </SharedLayout>
  );
};

export default Journal;
