
import { usePlayer } from "@/context/PlayerContext";
import HabitCard from "./HabitCard";
import AddHabitDialog from "./AddHabitDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const ShadowTrials = () => {
    const { habits } = usePlayer();

    const goodHabits = habits.filter(h => h.type === 'good');
    const badHabits = habits.filter(h => h.type === 'bad');
    
    return (
        <section id="shadow-trials" className="mb-8">
            <Card className="system-card relative">
                 <div className="absolute top-6 right-6 z-10">
                    <AddHabitDialog />
                </div>
                <div className="system-card-inner">
                    <CardHeader>
                        <div>
                            <CardTitle className="text-2xl font-bold tracking-widest uppercase font-serif">Shadow Trials</CardTitle>
                            <CardDescription>Conquer your habits. Build your streaks.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {habits.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                <p>No habits yet.</p>
                                <p>Add one to start the battle!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-xl font-bold mb-4 text-green-400">Good Habits</h3>
                                    {goodHabits.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {goodHabits.map(habit => <HabitCard key={habit.id} habit={habit} />)}
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted-foreground py-4 border border-dashed rounded-lg">
                                            <p>No good habits yet.</p>
                                        </div>
                                    )}
                                </div>
                                <div className="border-t lg:border-t-0 lg:border-l border-dashed border-primary/20 pt-8 lg:pt-0 lg:pl-8">
                                    <h3 className="text-xl font-bold mb-4 text-red-400">Bad Habits</h3>
                                    {badHabits.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {badHabits.map(habit => <HabitCard key={habit.id} habit={habit} />)}
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted-foreground py-4 border border-dashed rounded-lg">
                                            <p>No bad habits yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </div>
            </Card>
        </section>
    )
}

export default ShadowTrials;
