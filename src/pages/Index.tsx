
import { Link } from "react-router-dom";
import {
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Book,
  Calendar,
  Network,
  Settings,
  Swords,
  BarChart3,
  Shield,
  ChevronsUp,
  Heart,
  Crosshair,
  Brain,
  Star,
  DollarSign,
  RotateCcw,
  ArrowUp,
  PenSquare,
} from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import SharedLayout from "@/components/layout/SharedLayout";
import SystemCard from "@/components/SystemCard";
import HoverTiltWrapper from "@/components/HoverTiltWrapper";
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
import WeeklySummary from "@/components/WeeklySummary";
import HabitWar from "@/components/HabitWar";

const quickActions = [
  { title: "Daily Quests", icon: Swords, url: "/daily-quests" },
  { title: "Skill Tree", icon: Network, url: "/skill-tree" },
  { title: "Stats", icon: BarChart3, url: "/stats" },
  { title: "Journal", icon: Book, url: "/journal" },
  // { title: "Custom Tasks", icon: PenSquare, url: "/custom-tasks" },
  { title: "Calendar", icon: Calendar, url: "/calendar" },
  { title: "Boss Fights", icon: Shield, url: "/boss-fights" },
  { title: "Settings", icon: Settings, url: "/settings" },
];

const Index = () => {
  const { stats: systemStats, levelUpAnimation } = usePlayer();

  const handleRestart = () => {
    localStorage.clear();
    window.location.reload();
  };

  const StatItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: number | string }) => (
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-primary" />
      <span className="font-semibold">{label}</span>
      <span className="font-semibold ml-auto flex items-center gap-1.5">
        {value}
      </span>
    </div>
  );

  return (
    <SharedLayout>
      <div className="text-center">
        <header className="mb-8">
          <h1 className="text-5xl font-bold text-primary animate-pulse font-serif">
            Shadow Ascendant
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome, {systemStats.name || 'Shadow Hunter'}. Your journey begins.
          </p>
        </header>

        {/* System Stats */}
        <section className="mb-8">
          <HoverTiltWrapper className="system-card max-w-2xl mx-auto">
            <div className="status-card-inner">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center tracking-widest uppercase font-serif">Status</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Level */}
                  <div className="text-center flex-shrink-0">
                    <p className={`text-7xl font-bold text-primary transition-all duration-500 ${levelUpAnimation ? 'animate-pulse-strong' : ''}`}>{systemStats.level}</p>
                    <p className="text-muted-foreground tracking-widest">LEVEL</p>
                  </div>

                  {/* Right side info */}
                  <div className="flex-1 w-full space-y-4">
                    {/* Job & Title */}
                    <div className="grid grid-cols-2 gap-4 text-center sm:text-left">
                      <div>
                        <p className="text-sm text-muted-foreground">CLASS</p>
                        <p className="font-semibold">{systemStats.class}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">TITLE</p>
                        <p className="font-semibold">{systemStats.title}</p>
                      </div>
                    </div>

                    {/* XP Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">XP</span>
                        <span className="font-mono text-xs">{systemStats.xp} / {systemStats.xpNextLevel}</span>
                      </div>
                      <Progress value={(systemStats.xp / systemStats.xpNextLevel) * 100} className="h-2" />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="my-6 border-t border-primary/20"></div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <StatItem icon={ChevronsUp} label="Strength" value={systemStats.strength} />
                  <StatItem icon={Heart} label="Stamina" value={systemStats.stamina} />
                  <StatItem icon={Crosshair} label="Concentration" value={systemStats.concentration} />
                  <StatItem icon={Brain} label="Intelligence" value={systemStats.intelligence} />
                  <StatItem icon={DollarSign} label="Wealth" value={systemStats.wealth} />
                  <StatItem icon={Star} label="Skills" value={systemStats.skills} />
                </div>
              </CardContent>
            </div>
          </HoverTiltWrapper>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <SystemCard
                key={action.title}
                title={action.title}
                icon={action.icon}
                url={action.url}
              />
            ))}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <SystemCard title="Restart" icon={RotateCcw} />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your progress and you will have to start over.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRestart}>Yes, Restart</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>

        {/* Habit War */}
        <HabitWar />
        
        {/* Weekly Summary */}
        <section className="mt-8">
          <WeeklySummary />
        </section>
      </div>
    </SharedLayout>
  );
};

export default Index;
