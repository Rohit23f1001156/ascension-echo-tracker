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
} from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import SharedLayout from "@/components/layout/SharedLayout";
import SystemCard from "@/components/SystemCard";
import HoverTiltWrapper from "@/components/HoverTiltWrapper";

const quickActions = [
  { title: "Daily Quests", icon: Swords, url: "/daily-quests" },
  { title: "Skill Tree", icon: Network, url: "/skill-tree" },
  { title: "Stats", icon: BarChart3, url: "/stats" },
  { title: "Journal", icon: Book, url: "/journal" },
  { title: "Calendar", icon: Calendar, url: "/calendar" },
  { title: "Boss Fights", icon: Shield, url: "/boss-fights" },
  { title: "Settings", icon: Settings, url: "/settings" },
];

const Index = () => {
  const { stats: systemStats } = usePlayer();

  return (
    <SharedLayout>
      <div className="text-center">
        <header className="mb-8">
          <h1 className="text-5xl font-bold text-primary animate-pulse">
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
                <CardTitle className="text-2xl font-bold text-center tracking-widest uppercase">Status</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Level */}
                  <div className="text-center flex-shrink-0">
                    <p className="text-7xl font-bold text-primary">{systemStats.level}</p>
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
                  <div className="flex items-center gap-3">
                    <ChevronsUp className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Strength</span>
                    <span className="font-semibold ml-auto">{systemStats.strength}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Stamina</span>
                    <span className="font-semibold ml-auto">{systemStats.stamina}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Crosshair className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Concentration</span>
                    <span className="font-semibold ml-auto">{systemStats.concentration}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Intelligence</span>
                    <span className="font-semibold ml-auto">{systemStats.intelligence}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Wealth</span>
                    <span className="font-semibold ml-auto">{systemStats.wealth}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Skills</span>
                    <span className="font-semibold ml-auto">{systemStats.skills}</span>
                  </div>
                </div>
              </CardContent>
            </div>
          </HoverTiltWrapper>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <SystemCard
                key={action.title}
                title={action.title}
                icon={action.icon}
                url={action.url}
              />
            ))}
          </div>
        </section>
      </div>
    </SharedLayout>
  );
};

export default Index;
