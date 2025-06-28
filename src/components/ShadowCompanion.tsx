
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Zap, Target, Shield, Heart } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';

interface CompanionCard {
  id: string;
  title: string;
  message: string;
  type: 'motivation' | 'tip' | 'challenge';
  icon: React.ReactNode;
  dismissed: boolean;
}

const companionCards: CompanionCard[] = [
  {
    id: 'welcome',
    title: 'Welcome, Shadow Hunter!',
    message: 'Your journey begins now. Every small step forward is a victory against the darkness.',
    type: 'motivation',
    icon: <Zap className="w-5 h-5" />,
    dismissed: false
  },
  {
    id: 'streak-tip',
    title: 'Build Your Streak',
    message: 'Consistency is your greatest weapon. Even completing one small task daily will compound into great power.',
    type: 'tip',
    icon: <Target className="w-5 h-5" />,
    dismissed: false
  },
  {
    id: 'level-up',
    title: 'Power Grows',
    message: 'Each level gained makes you stronger. Allocate your stat points wisely to shape your destiny.',
    type: 'tip',
    icon: <Shield className="w-5 h-5" />,
    dismissed: false
  },
  {
    id: 'daily-challenge',
    title: 'Today\'s Challenge',
    message: 'The shadows test your resolve daily. Face them with courage and emerge victorious.',
    type: 'challenge',
    icon: <Heart className="w-5 h-5" />,
    dismissed: false
  }
];

const ShadowCompanion = () => {
  const [cards, setCards] = useState<CompanionCard[]>(companionCards);
  const [currentCard, setCurrentCard] = useState<CompanionCard | null>(null);
  const { stats } = usePlayer();

  useEffect(() => {
    // Show a random undismissed card every 30 seconds
    const interval = setInterval(() => {
      const availableCards = cards.filter(card => !card.dismissed);
      if (availableCards.length > 0 && !currentCard) {
        const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
        setCurrentCard(randomCard);
        
        // Auto-dismiss after 8 seconds if not manually closed
        setTimeout(() => {
          setCurrentCard(null);
        }, 8000);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [cards, currentCard]);

  const dismissCard = (cardId: string) => {
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, dismissed: true } : card
    ));
    setCurrentCard(null);
  };

  const closeCurrentCard = () => {
    setCurrentCard(null);
  };

  if (!currentCard) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <Card className="w-80 bg-gradient-to-br from-primary/10 to-purple/10 border-primary/30 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {currentCard.icon}
            {currentCard.title}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={closeCurrentCard}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            {currentCard.message}
          </p>
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Level {stats.level} • {stats.xp} XP
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => dismissCard(currentCard.id)}
            >
              Got it!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShadowCompanion;
