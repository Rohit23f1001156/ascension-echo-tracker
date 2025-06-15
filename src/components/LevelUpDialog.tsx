
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background/80 backdrop-blur-sm border-primary/50 text-foreground">
        <DialogHeader>
          <DialogTitle className="text-3xl text-center text-primary font-serif animate-pulse-strong">
            🆙 LEVEL UP!
          </DialogTitle>
          <DialogDescription className="text-center text-xl pt-2">
            You are now Level {levelUpInfo.newLevel} 🎉
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 text-center space-y-2 text-base">
          <p className="font-semibold text-primary">Gained:</p>
          <p className="text-muted-foreground">+1 Stat Point to allocate!</p>
          {levelUpInfo.perk && (
            <>
              <p className="font-semibold text-primary mt-4">Perk Unlocked:</p>
              <p className="text-muted-foreground">✨ {levelUpInfo.perk.description}</p>
            </>
          )}
        </div>
        <DialogFooter className="sm:justify-center">
          <Button asChild onClick={onClose} className="px-8">
            <Link to="/stats">Allocate Point</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LevelUpDialog;
