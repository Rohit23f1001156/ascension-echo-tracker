
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

          {/* Hero Banner */}
          <section className="mb-8">
            <Card className="bg-card/80 border-primary/20">
              <CardHeader>
                <CardTitle className="text-3xl font-bold">Level 1</CardTitle>
                <CardDescription>Sung Jin-Woo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold">XP</span>
                  <Progress value={25} className="h-4" />
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
