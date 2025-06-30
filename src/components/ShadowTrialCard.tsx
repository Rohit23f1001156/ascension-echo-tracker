
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Undo2, Sword, Star } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { ShadowTrial } from '@/context/PlayerContext';

interface ShadowTrialCardProps {
  trial: ShadowTrial;
}

const ShadowTrialCard: React.FC<ShadowTrialCardProps> = ({ trial }) => {
  const { completeShadowTrial, undoShadowTrial } = usePlayer();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'beginner':
        return <Star className="w-4 h-4" />;
      case 'habits':
        return <CheckCircle className="w-4 h-4" />;
      case 'skills':
        return <Sword className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'beginner':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'habits':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'skills':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className={`transition-all duration-300 ${
      trial.isCompleted 
        ? 'bg-green-500/10 border-green-500/30' 
        : 'bg-card/70 hover:bg-card/90'
    }`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getCategoryIcon(trial.category)}
            {trial.title}
          </CardTitle>
          <Badge className={getCategoryColor(trial.category)}>
            {trial.category}
          </Badge>
        </div>
        <CardDescription>{trial.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-primary font-semibold">
              {trial.xpReward} XP
            </span>
            <span className="text-yellow-500 font-semibold">
              +{Math.floor(trial.xpReward / 10)} coins
            </span>
          </div>
          
          {trial.isCompleted ? (
            <Button
              onClick={() => undoShadowTrial(trial.id)}
              variant="outline"
              size="sm"
              className="text-yellow-600 hover:text-yellow-700"
            >
              <Undo2 className="w-4 h-4 mr-2" />
              Undo
            </Button>
          ) : (
            <Button
              onClick={() => completeShadowTrial(trial.id)}
              className="bg-primary hover:bg-primary/90"
              size="sm"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete
            </Button>
          )}
        </div>
        
        {trial.isCompleted && (
          <div className="mt-2 text-center">
            <Badge variant="outline" className="text-green-400 border-green-500/30">
              ✓ Completed
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShadowTrialCard;
