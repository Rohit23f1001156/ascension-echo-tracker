
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

interface LevelUpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  levelUpInfo: { newLevel: number; perk: Buff | null } | null;
}

const LevelUpDialog = ({ isOpen, onClose, levelUpInfo }: LevelUpDialogProps) => {
  if (!levelUpInfo) return null;

  const handleSkipForNow = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-background/95 to-primary/5 backdrop-blur-md border-2 border-primary/50 text-foreground shadow-2xl">
        <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent animate-pulse"></div>
        <DialogHeader className="relative z-10">
          <DialogTitle className="text-4xl text-center text-primary font-serif animate-bounce mb-2">
            ⚡ LEVEL UP! ⚡
          </DialogTitle>
          <DialogDescription className="text-center text-2xl pt-2 font-bold text-primary">
            You are now Level {levelUpInfo.newLevel}! 🎉
          </DialogDescription>
        </DialogHeader>
        <div className="my-6 text-center space-y-4 text-lg relative z-10">
          <div className="bg-primary/10 p-4 rounded-lg border border-primary/30">
            <p className="font-bold text-primary text-xl mb-2">🌟 Rewards Gained:</p>
            <div className="space-y-2">
              <p className="text-green-400 font-semibold">+1 Stat Point to allocate!</p>
              <p className="text-blue-400 font-semibold">+Enhanced Abilities</p>
              <p className="text-purple-400 font-semibold">+New Opportunities Unlocked</p>
            </div>
          </div>
          {levelUpInfo.perk && (
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-4 rounded-lg border border-purple-400/30">
              <p className="font-bold text-purple-400 text-lg mb-2">✨ Special Perk Unlocked:</p>
              <p className="text-muted-foreground italic">{levelUpInfo.perk.description}</p>
            </div>
          )}
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-3 rounded-lg border border-yellow-400/30">
            <p className="text-yellow-400 font-semibold">You have unspent stat points!</p>
            <p className="text-sm text-muted-foreground">Want to assign them now or later?</p>
          </div>
        </div>
        <DialogFooter className="sm:justify-center gap-3 relative z-10">
          <Button asChild className="px-8 py-3 text-lg font-bold bg-primary hover:bg-primary/80 shadow-lg transform hover:scale-105 transition-all">
            <Link to="/stats" onClick={onClose}>🎯 Assign Now</Link>
          </Button>
          <Button variant="outline" onClick={handleSkipForNow} className="px-8 py-3 text-lg border-primary/50 hover:bg-primary/10">
            Skip for Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LevelUpDialog;
