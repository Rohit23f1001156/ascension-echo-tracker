
import { Coins } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";

const FloatingCoins = () => {
  const { stats } = usePlayer();

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background/90 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 shadow-lg">
      <div className="flex items-center gap-2">
        <Coins className="w-5 h-5 text-yellow-500" />
        <span className="font-semibold text-primary">{stats.coins}</span>
      </div>
    </div>
  );
};

export default FloatingCoins;
