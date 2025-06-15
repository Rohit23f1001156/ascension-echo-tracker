
import { Habit, usePlayer } from "@/context/PlayerContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Flame, Shield, Trash2, XCircle } from "lucide-react";
import { isToday } from "date-fns";
import { cn } from "@/lib/utils";

const HabitCard = ({ habit }: { habit: Habit }) => {
    const { toggleHabit, deleteHabit } = usePlayer();
    const isCompletedToday = habit.lastCompleted ? isToday(new Date(habit.lastCompleted)) : false;

    const actionText = habit.type === 'good' ? 'Complete' : 'Resisted';
    const undoText = 'Undo';

    const difficultyColors = {
        Easy: "bg-green-500",
        Medium: "bg-yellow-500",
        Hard: "bg-red-500",
    };

    return (
        <Card className={cn("flex flex-col justify-between", isCompletedToday && habit.type === 'good' ? 'bg-green-900/40 border-green-500' : '', isCompletedToday && habit.type === 'bad' ? 'bg-blue-900/40 border-blue-500' : '')}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{habit.title}</CardTitle>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteHabit(habit.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                </div>
                <CardDescription className="flex gap-2 items-center">
                    {habit.type === 'good' ? 
                        <Shield className="h-4 w-4 text-green-400" /> : 
                        <XCircle className="h-4 w-4 text-red-400" />
                    }
                    <span>{habit.type === 'good' ? 'Good Habit' : 'Bad Habit'}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center gap-2 text-primary font-semibold">
                    <Flame className="h-5 w-5" />
                    <span className="text-xl">{habit.streak}</span>
                    <span className="text-sm text-muted-foreground">Day Streak</span>
                </div>
                <div>
                     <Badge className={cn(difficultyColors[habit.difficulty], "text-white")}>{habit.difficulty}</Badge>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={() => toggleHabit(habit.id)} className="w-full">
                    {isCompletedToday ? undoText : actionText}
                </Button>
            </CardFooter>
        </Card>
    )
}

export default HabitCard;
