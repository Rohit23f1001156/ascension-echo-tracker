
import React, { useState, useEffect } from "react";
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
  PenSquare,
  LogOut,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import WeeklySummary from "@/components/WeeklySummary";
import ShadowTrials from "@/components/ShadowTrials";
import ShadowCompanion from "@/components/ShadowCompanion";
import { supabase } from "@/lib/supabase";
import AiCompanion from "@/components/AiCompanion";
import AnalyticsChart from "@/components/AnalyticsChart";
import LevelUpDialog from "@/components/LevelUpDialog";
import FloatingCoins from "@/components/FloatingCoins";
import { useNavigate } from "react-router-dom";

const quickActions = [
  { title: "Daily Quests", icon: Swords, url: "/daily-quests", description: "Complete your daily challenges and build consistent habits" },
  { title: "Skill Tree", icon: Network, url: "/skill-tree", description: "Unlock new abilities and master different skills" },
  { title: "Stats", icon: BarChart3, url: "/stats", description: "View your character stats and allocate skill points" },
  { title: "Journal", icon: Book, url: "/journal", description: "Write daily reflections and track your thoughts" },
  { title: "Calendar", icon: Calendar, url: "/calendar", description: "View your progress and activity over time" },
  { title: "Boss Fights", icon: Shield, url: "/boss-fights", description: "Take on challenging long-term goals" },
  { title: "Settings", icon: Settings, url: "/settings", description: "Customize your experience and preferences" },
];

const motivationalQuotes = [
  "The shadows fear your persistence.",
  "Every step forward, no matter how small, is a victory.",
  "Embrace the struggle, for it is the crucible of heroes.",
  "Your potential is a blade; sharpen it with every challenge.",
  "The darkest night is just before the dawn of your greatness."
];

const Index = () => {
  const { stats: systemStats, levelUpAnimation, levelUpData, clearLevelUpData, resetAllData } = usePlayer();
  const [quote, setQuote] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, []);

  const handleRestart = async () => {
    await resetAllData();
    navigate('/onboarding');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
    <TooltipProvider>
      <SharedLayout>
        <div className="text-center">
          <header className="mb-8">
            <h1 className="text-5xl font-bold text-primary animate-pulse font-serif">
              Shadow Ascendant
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome, {systemStats.name || 'Shadow Hunter'}. Your journey begins.
            </p>
            {quote && <p className="text-primary/80 italic mt-2 text-sm">"{quote}"</p>}
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
                          <span className="font-mono text-xs">{systemStats.xp} / {systemStats.xp + systemStats.xpNextLevel}</span>
                        </div>
                        <Progress value={(systemStats.xpNextLevel > 0 ? ((systemStats.xp % (systemStats.xp + systemStats.xpNextLevel)) / (systemStats.xp + systemStats.xpNextLevel)) * 100 : 0)} className="h-2" />
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
                <Tooltip key={action.title}>
                  <TooltipTrigger asChild>
                    <div>
                      <SystemCard
                        title={action.title}
                        icon={action.icon}
                        url={action.url}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{action.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <SystemCard title="Restart" icon={RotateCcw} />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reset All Progress?</AlertDialogTitle>
                          <AlertDialugDescription>
                            This will permanently delete ALL your progress including stats, quests, journal entries, skill tree progress, and calendar history. You will need to complete onboarding again. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleRestart} className="bg-destructive hover:bg-destructive/90">
                            Yes, Reset Everything
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset all progress and start fresh (does not log you out)</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <SystemCard title="Logout" icon={LogOut} />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                          <AlertDialogDescription>
                            You will be returned to the login page. Your progress is automatically saved to the cloud.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleLogout}>Yes, Logout</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sign out of your account</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </section>

          {/* Shadow Trials */}
          <ShadowTrials />
          
          {/* AI Companion */}
          <section className="mb-8 max-w-2xl mx-auto">
              <AiCompanion />
          </section>
          
          {/* Weekly Summary */}
          <section id="weekly-summary" className="mt-8">
            <WeeklySummary />
          </section>

          {/* Analytics Chart */}
          <section className="mb-8 max-w-4xl mx-auto">
            <AnalyticsChart />
          </section>

          {/* Level Up Dialog */}
          <LevelUpDialog
            isOpen={!!levelUpData}
            onClose={clearLevelUpData}
            levelUpInfo={levelUpData}
          />
        </div>
        
        {/* Floating Coins */}
        <FloatingCoins />
        
        {/* Shadow Companion */}
        <ShadowCompanion />
      </SharedLayout>
    </TooltipProvider>
  );
};

export default Index;
