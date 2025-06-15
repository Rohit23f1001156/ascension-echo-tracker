
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
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
} from "lucide-react";

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
  const systemStats = {
    title: "Beginner",
    class: "NA",
    level: 0,
    xp: 0,
    xpNextLevel: 1000,
    strength: 2,
    stamina: 5,
    concentration: 1,
    intelligence: 1,
    skills: 1,
  };

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="min-h-screen bg-black/70 backdrop-blur-sm">
        <main className="container mx-auto px-4 py-8 text-center">
          <header className="mb-8">
            <h1 className="text-5xl font-bold text-primary animate-pulse">
              Shadow Ascendant
            </h1>
            <p className="text-muted-foreground mt-2">
              Arise, Shadow Hunter. Your journey begins.
            </p>
          </header>

          {/* System Stats */}
          <section className="mb-8">
            <Card className="bg-card/80 border-primary/20 max-w-2xl mx-auto">
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
                    <Star className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Skills</span>
                    <span className="font-semibold ml-auto">{systemStats.skills}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Quick Actions */}
          <section>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <Link to={action.url} key={action.title} className="no-underline">
                  <Card
                    className="bg-card/80 border-primary/20 hover:border-primary hover:bg-card transition-all cursor-pointer h-full"
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                      <action.icon className="w-8 h-8 text-primary" />
                      <p className="font-semibold text-center">{action.title}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Index;
