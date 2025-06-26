
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompanionCard {
  id: string;
  title: string;
  message: string;
  type: 'motivation' | 'tip' | 'challenge';
}

const companionCards: CompanionCard[] = [
  {
    id: 'motivation-1',
    title: 'Shadow Whispers',
    message: "Every master was once a disaster. Your failures are stepping stones to greatness.",
    type: 'motivation'
  },
  {
    id: 'tip-1',
    title: 'Ancient Wisdom',
    message: "Focus on consistency over intensity. Small daily actions compound into extraordinary results.",
    type: 'tip'
  },
  {
    id: 'challenge-1',
    title: 'Shadow Challenge',
    message: "Can you complete all your daily quests for 3 days straight? The shadows are watching...",
    type: 'challenge'
  },
  {
    id: 'motivation-2',
    title: 'Inner Strength',
    message: "You possess within you the power to overcome any obstacle. Trust in your journey.",
    type: 'motivation'
  },
  {
    id: 'tip-2',
    title: 'Skill Mastery',
    message: "Don't just complete tasks - understand why you're doing them. Purpose fuels persistence.",
    type: 'tip'
  }
];

const ShadowCompanion = () => {
  const [currentCard, setCurrentCard] = useState<CompanionCard | null>(null);
  const [dismissedCards, setDismissedCards] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show a random card every 2 minutes if none is visible
    const interval = setInterval(() => {
      if (!currentCard) {
        const availableCards = companionCards.filter(card => !dismissedCards.has(card.id));
        if (availableCards.length > 0) {
          const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
          setCurrentCard(randomCard);
          setIsVisible(true);
          
          // Auto-dismiss after 10 seconds if not manually closed
          setTimeout(() => {
            if (currentCard?.id === randomCard.id) {
              handleDismiss();
            }
          }, 10000);
        }
      }
    }, 120000); // 2 minutes

    // Show initial card after 30 seconds
    const initialTimeout = setTimeout(() => {
      if (!currentCard && dismissedCards.size === 0) {
        const randomCard = companionCards[Math.floor(Math.random() * companionCards.length)];
        setCurrentCard(randomCard);
        setIsVisible(true);
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [currentCard, dismissedCards]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (currentCard) {
        setDismissedCards(prev => new Set([...prev, currentCard.id]));
        setCurrentCard(null);
      }
    }, 300);
  };

  const getCardColor = (type: string) => {
    switch (type) {
      case 'motivation':
        return 'border-green-500/50 bg-green-500/10';
      case 'tip':
        return 'border-blue-500/50 bg-blue-500/10';
      case 'challenge':
        return 'border-purple-500/50 bg-purple-500/10';
      default:
        return 'border-primary/50 bg-primary/10';
    }
  };

  if (!currentCard) return null;

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 transition-all duration-300 transform",
      isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
    )}>
      <Card className={cn(
        "w-80 shadow-2xl backdrop-blur-sm transition-all duration-300",
        getCardColor(currentCard.type)
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">{currentCard.title}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {currentCard.message}
          </p>
          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm" onClick={handleDismiss}>
              Got it
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShadowCompanion;
