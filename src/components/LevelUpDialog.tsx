
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Buff } from "@/context/PlayerContext";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

interface LevelUpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  levelUpInfo: { newLevel: number; perk: Buff | null } | null;
}

const LevelUpDialog = ({ isOpen, onClose, levelUpInfo }: LevelUpDialogProps) => {
  const [showFullScreen, setShowFullScreen] = useState(false);

  useEffect(() => {
    if (isOpen && levelUpInfo) {
      // Show full screen effect first
      setShowFullScreen(true);
      const timer = setTimeout(() => {
        setShowFullScreen(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, levelUpInfo]);

  if (!levelUpInfo) return null;

  const handleSkipForNow = () => {
    onClose();
  };

  // Full screen level up animation
  if (showFullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center space-y-8 animate-scale-in">
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <div className="w-32 h-32 mx-auto rounded-full bg-primary/50"></div>
            </div>
            <div className="relative z-10">
              <div className="text-8xl font-bold text-primary animate-pulse-strong font-serif">
                LEVEL UP!
              </div>
              <div className="text-4xl font-bold text-white mt-4">
                LEVEL {levelUpInfo.newLevel}
              </div>
            </div>
          </div>
          
          <div className="space-y-4 text-white">
            <div className="text-2xl font-semibold">🎉 CONGRATULATIONS! 🎉</div>
            <div className="text-lg">You've grown stronger!</div>
            
            {levelUpInfo.perk && (
              <div className="bg-primary/20 border border-primary/50 rounded-lg p-6 max-w-md mx-auto">
                <div className="text-xl font-bold text-primary mb-2">✨ NEW PERK UNLOCKED!</div>
                <div className="text-lg font-semibold">{levelUpInfo.perk.name}</div>
                <div className="text-sm text-muted-foreground mt-2">{levelUpInfo.perk.description}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-background/95 to-primary/10 backdrop-blur-sm border-2 border-primary/50 text-foreground shadow-2xl shadow-primary/20">
        <DialogHeader>
          <DialogTitle className="text-4xl text-center text-primary font-serif animate-pulse-strong">
            🆙 LEVEL UP!
          </DialogTitle>
          <DialogDescription className="text-center text-2xl pt-2 font-bold">
            You are now Level {levelUpInfo.newLevel} 🎉
          </DialogDescription>
        </DialogHeader>
        <div className="my-6 text-center space-y-4 text-base">
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <p className="font-semibold text-primary text-lg">Gained:</p>
            <p className="text-muted-foreground text-lg">✨ +1 Stat Point to allocate!</p>
          </div>
          
          {levelUpInfo.perk && (
            <div className="bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/50 rounded-lg p-4">
              <p className="font-semibold text-primary text-lg mb-2">🎊 Perk Unlocked!</p>
              <p className="font-bold text-lg">{levelUpInfo.perk.name}</p>
              <p className="text-muted-foreground text-sm mt-2">{levelUpInfo.perk.description}</p>
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-center gap-3">
          <Button asChild className="px-8 py-3 text-lg font-semibold bg-primary hover:bg-primary/90">
            <Link to="/stats" onClick={onClose}>⚡ Allocate Now</Link>
          </Button>
          <Button variant="outline" onClick={handleSkipForNow} className="px-8 py-3 text-lg border-primary/50 hover:bg-primary/10">
            Skip for Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LevelUpDialog;
