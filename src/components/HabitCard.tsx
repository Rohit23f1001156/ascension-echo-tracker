
import { Habit, usePlayer } from "@/context/PlayerContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Flame, Shield, Trash2, XCircle, CheckCircle, Undo2 } from "lucide-react";
import { isToday } from "date-fns";
import { cn } from "@/lib/utils";

const HabitCard = ({ habit }: { habit: Habit }) => {
    const { toggleHabit, deleteHabit } = usePlayer();
    const isCompletedToday = habit.lastCompleted ? isToday(new Date(habit.lastCompleted)) : false;

    const difficultyColors = {
        Easy: "bg-green-500/20 text-green-400 border-green-500/30",
        Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        Hard: "bg-red-500/20 text-red-400 border-red-500/30",
    };

    // Calculate XP and coins based on difficulty
    const getXPByDifficulty = (difficulty?: string): number => {
        switch (difficulty) {
            case "Easy": return 15;
            case "Medium": return 25;
            case "Hard": return 35;
            default: return 15;
        }
    };

    const getCoinsByDifficulty = (difficulty?: string): number => {
        switch (difficulty) {
            case "Easy": return 1;
            case "Medium": return 2;
            case "Hard": return 3;
            default: return 1;
        }
    };

    const xpReward = getXPByDifficulty(habit.difficulty);
    const coinsReward = getCoinsByDifficulty(habit.difficulty);

    return (
        <Card className={cn(
            "transition-all duration-300",
            habit.isCompleted 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-card/70 hover:bg-card/90'
        )}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        {habit.type === 'good' ? 
                            <Shield className="w-4 h-4" /> : 
                            <XCircle className="w-4 h-4" />
                        }
                        {habit.title}
                    </CardTitle>
                    <Badge className={difficultyColors[habit.difficulty || 'Easy']}>
                        {habit.difficulty || 'Easy'}
                    </Badge>
                </div>
                <CardDescription>
                    {habit.type === 'good' ? 'Good Habit' : 'Bad Habit'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-primary font-semibold">
                            {xpReward} XP
                        </span>
                        <span className="text-yellow-500 font-semibold">
                            +{coinsReward} coins
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-500">
                        <Flame className="h-4 w-4" />
                        <span className="font-semibold">{habit.streak}</span>
                    </div>
                </div>
                
                {habit.isCompleted && (
                    <div className="mt-2 text-center">
                        <Badge variant="outline" className="text-green-400 border-green-500/30">
                            ✓ {habit.type === 'good' ? 'Completed' : 'Resisted'}
                        </Badge>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex gap-2">
                {habit.isCompleted ? (
                    <Button
                        onClick={() => toggleHabit(habit.id)}
                        variant="outline"
                        size="sm"
                        className="text-yellow-600 hover:text-yellow-700 flex-1"
                    >
                        <Undo2 className="w-4 h-4 mr-2" />
                        Undo
                    </Button>
                ) : (
                    <Button
                        onClick={() => toggleHabit(habit.id)}
                        className="bg-primary hover:bg-primary/90 flex-1"
                        size="sm"
                    >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {habit.type === 'good' ? 'Complete' : 'Resisted'}
                    </Button>
                )}
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteHabit(habit.id)}
                    className="text-muted-foreground hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    )
}

export default HabitCard;
