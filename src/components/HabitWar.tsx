
import { usePlayer } from "@/context/PlayerContext";
import HabitCard from "./HabitCard";
import AddHabitDialog from "./AddHabitDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const HabitWar = () => {
    const { habits } = usePlayer();
    
    return (
        <section className="mb-8">
            <Card className="system-card">
                <div className="system-card-inner">
                    <CardHeader className="relative">
                        <CardTitle className="text-2xl font-bold tracking-widest uppercase font-serif">Habit War</CardTitle>
                        <CardDescription>Conquer your habits. Build your streaks.</CardDescription>
                        <AddHabitDialog />
                    </CardHeader>
                    <CardContent>
                        {habits.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                <p>No habits yet.</p>
                                <p>Add one to start the battle!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {habits.map(habit => <HabitCard key={habit.id} habit={habit} />)}
                            </div>
                        )}
                    </CardContent>
                </div>
            </Card>
        </section>
    )
}

export default HabitWar;
