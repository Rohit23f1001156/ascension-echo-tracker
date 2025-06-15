
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronsUp, Heart, Crosshair, Brain, DollarSign, PlusCircle } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import SharedLayout from "@/components/layout/SharedLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Stats = () => {
  const { stats, allocateStatPoint } = usePlayer();

  const statCategories = [
    { name: 'Strength', key: 'strength', icon: ChevronsUp, description: "Increases physical XP and workout efficacy." },
    { name: 'Stamina', key: 'stamina', icon: Heart, description: "Boosts XP from completing habits and routines." },
    { name: 'Concentration', key: 'concentration', icon: Crosshair, description: "Multiplies XP gained from studying and focus tasks." },
    { name: 'Intelligence', key: 'intelligence', icon: Brain, description: "Enhances XP from web dev and technical learning." },
    { name: 'Wealth', key: 'wealth', icon: DollarSign, description: "Improves returns and XP from financial activities." },
  ] as const;

  return (
    <SharedLayout>
      <div className="w-full max-w-5xl mx-auto">
        <Button asChild variant="outline" className="mb-8">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-5xl font-bold mb-8 text-center font-serif">Player Stats</h1>

        {stats.statPointsToAllocate > 0 && (
          <Card className="mb-8 bg-primary/10 border-primary animate-pulse-strong">
            <CardHeader>
              <CardTitle className="text-2xl text-primary flex items-center gap-2">
                <PlusCircle />
                You have Stat Points to allocate!
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">
                You have {stats.statPointsToAllocate} point(s). Spend them below to boost your abilities.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCategories.map((cat) => (
            <Card key={cat.key} className="bg-card/70 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <cat.icon className="w-6 h-6 text-primary" />
                  <span>{cat.name}</span>
                  <span className="ml-auto text-3xl font-bold">{stats[cat.key]}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <p className="text-muted-foreground mb-4 flex-grow">{cat.description}</p>
                {stats.statPointsToAllocate > 0 && (
                  <Button onClick={() => allocateStatPoint(cat.key)} className="w-full mt-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Allocate Point
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SharedLayout>
  );
};

export default Stats;
