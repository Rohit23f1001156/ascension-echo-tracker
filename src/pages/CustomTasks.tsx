
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usePlayer } from '@/context/PlayerContext';
import SharedLayout from '@/components/layout/SharedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/ui/sonner';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const customTaskSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  duration: z.coerce.number().min(0.5, { message: "Duration must be at least 0.5 hours (30 minutes)." }),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
});

type CustomTaskValues = z.infer<typeof customTaskSchema>;

const difficultyMultipliers = {
    Easy: 1,
    Medium: 1.5,
    Hard: 2,
};

const CustomTasks = () => {
    const { addQuest } = usePlayer();
    const navigate = useNavigate();

    const { control, handleSubmit, formState: { errors } } = useForm<CustomTaskValues>({
        resolver: zodResolver(customTaskSchema),
        defaultValues: {
            title: '',
            duration: 1,
            difficulty: 'Medium',
        },
    });

    const onSubmit = (data: CustomTaskValues) => {
        const durationInMinutes = data.duration * 60;
        const multiplier = difficultyMultipliers[data.difficulty];
        // Formula: 10 XP per 30 min × difficulty multiplier
        const calculatedXp = Math.round((durationInMinutes / 30) * 10 * multiplier);

        addQuest({
            title: `[Project] ${data.title}`,
            xp: calculatedXp,
            type: 'good',
        });

        toast.success(`Custom task "${data.title}" added!`, {
            description: `You can earn ${calculatedXp} XP upon completion. It's now available in your Daily Quests.`,
        });
        
        navigate('/daily-quests');
    };

    return (
        <SharedLayout>
            <div className="max-w-lg mx-auto py-8">
                 <div className="mb-4">
                    <Button asChild variant="outline">
                        <Link to="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>
                <Card className="w-full bg-card/80 border-primary/20">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <CardHeader>
                            <CardTitle className="text-3xl text-primary font-serif">Add Custom Task</CardTitle>
                            <CardDescription>Define a project or study task to earn XP.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Task Title</Label>
                                <Controller name="title" control={control} render={({ field }) => <Input id="title" {...field} placeholder="e.g., Learn React Hooks" />} />
                                {errors.title && <p className="text-destructive text-sm mt-1">{errors.title.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration (in hours)</Label>
                                <Controller name="duration" control={control} render={({ field }) => <Input id="duration" type="number" step="0.5" {...field} />} />
                                {errors.duration && <p className="text-destructive text-sm mt-1">{errors.duration.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Difficulty</Label>
                                <Controller name="difficulty" control={control} render={({ field }) => (
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-3 gap-4">
                                        {['Easy', 'Medium', 'Hard'].map(diff => (
                                            <Label key={diff} htmlFor={diff} className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                <RadioGroupItem value={diff} id={diff} className="sr-only" />
                                                {diff}
                                            </Label>
                                        ))}
                                    </RadioGroup>
                                )} />
                                {errors.difficulty && <p className="text-destructive text-sm mt-1">{errors.difficulty.message}</p>}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full">Create Task & Add to Quests</Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </SharedLayout>
    );
};

export default CustomTasks;
