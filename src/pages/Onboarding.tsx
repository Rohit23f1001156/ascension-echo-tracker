
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usePlayer } from '@/context/PlayerContext';
import { useNavigate } from 'react-router-dom';
import SharedLayout from '@/components/layout/SharedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, Shield, Swords, Brain, Heart, Crosshair, ChevronsUp, DollarSign, Clock } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const onboardingSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  avatar: z.string(),
  lifeAreas: z.array(z.string()).min(1, "Select at least one area."),
  timeBudget: z.record(z.string(), z.number()).default({}),
  strength: z.number().min(1).max(10),
  stamina: z.number().min(1).max(10),
  concentration: z.number().min(1).max(10),
  intelligence: z.number().min(1).max(10),
  wealth: z.number().min(1).max(10),
  difficultyPreference: z.enum(['Easy', 'Medium', 'Hard']),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

const lifeAreasOptions = [
    "Fitness & Health",
    "Learning & Skills",
    "Career & Finance",
    "Mindfulness & Mental Health",
    "Social Life",
    "Hobbies & Creativity"
];
const avatarOptions = [
    { value: 'user', label: 'Hunter', icon: <User className="w-6 h-6" /> },
    { value: 'shield', label: 'Tanker', icon: <Shield className="w-6 h-6" /> },
    { value: 'swords', label: 'Assassin', icon: <Swords className="w-6 h-6" /> },
];

const statOptions = [
    { name: "strength", label: "Strength", icon: <ChevronsUp className="w-5 h-5 text-primary" />},
    { name: "stamina", label: "Stamina", icon: <Heart className="w-5 h-5 text-primary" />},
    { name: "concentration", label: "Concentration", icon: <Crosshair className="w-5 h-5 text-primary" />},
    { name: "intelligence", label: "Intelligence", icon: <Brain className="w-5 h-5 text-primary" />},
    { name: "wealth", label: "Wealth", icon: <DollarSign className="w-5 h-5 text-primary" />},
] as const;

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updatePlayerProfile } = usePlayer();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { control, handleSubmit, trigger, getValues, watch } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
      avatar: 'user',
      lifeAreas: [],
      timeBudget: {},
      strength: 5,
      stamina: 5,
      concentration: 5,
      intelligence: 5,
      wealth: 5,
      difficultyPreference: 'Medium',
    },
  });

  const selectedLifeAreas = watch('lifeAreas');

  const nextStep = async () => {
    let fieldsToValidate: (keyof OnboardingValues)[] = [];
    if (step === 1) fieldsToValidate = ['name', 'avatar'];
    if (step === 2) fieldsToValidate = ['lifeAreas'];
    if (step === 4) fieldsToValidate = ['strength', 'stamina', 'concentration', 'intelligence', 'wealth'];
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(s => s + 1);
  };
  const prevStep = () => setStep(s => s - 1);

  const onSubmit = async (data: OnboardingValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const { name, avatar, difficultyPreference, lifeAreas, timeBudget, ...formStats } = data;

      const statsToSave = {
        name,
        avatar,
        ...formStats,
        level: 1,
        xp: 0,
        xpNextLevel: 1000, // First level needs 1000 XP
        class: "Novice",
        title: "Newcomer",
        skills: 0,
        coins: 20,
        statPointsToAllocate: 0,
        streak: 0,
        lastActivityDate: null,
        buffs: [],
        journalStreak: 0,
        lastJournalEntryDate: null,
      };
      const settingsToSave = { difficultyPreference, lifeAreas, timeBudget: timeBudget || {} };

      // Update local state via context first
      updatePlayerProfile(statsToSave, settingsToSave);

      if (!user) {
        toast.error("Authentication error. Please log in again.");
        return;
      }

      console.log('Saving complete profile to Supabase for user:', user.id);
      
      const profileData = {
        id: user.id,
        updated_at: new Date().toISOString(),
        stats: statsToSave,
        settings: settingsToSave,
        quests: [], // Initialize empty arrays
        habits: [],
        journal_entries: [],
        skill_tree: null,
        mastered_skills: [],
        onboarding_complete: true,
      };

      const { error } = await supabase.from('profiles').upsert(profileData);

      if (error) {
        console.error("Supabase profile save error:", error);
        toast.error("Failed to save your profile to the cloud. Please check your database setup.");
        // Don't return - let them continue with local storage
      } else {
        console.log('Profile saved successfully to Supabase');
        toast.success('Profile saved to the cloud!');
      }

      localStorage.setItem("onboardingComplete", "true");
      toast.success(`Welcome, ${name}!`, {
          description: "You've been granted a welcome bonus of 20 shiny coins to start your journey. Spend them wisely!",
      });
      navigate('/');
    } catch (err) {
      console.error('Error during onboarding:', err);
      toast.error('An error occurred during setup. Data saved locally.');
      // Still allow them to continue
      localStorage.setItem("onboardingComplete", "true");
      navigate('/');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SharedLayout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-2xl bg-card/80 border-primary/20">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="text-3xl text-primary font-serif">Arise, Shadow!</CardTitle>
              <CardDescription>Let's set up your profile to begin the journey.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="font-bold text-xl font-serif">Step 1: Your Identity</h3>
                  <div>
                    <Label htmlFor="name" className="font-serif">What is your name, hunter?</Label>
                    <Controller name="name" control={control} render={({ field, fieldState }) => (
                      <>
                        <Input id="name" {...field} placeholder="e.g., Sung Jin-Woo" />
                        {fieldState.error && <p className="text-destructive text-sm mt-1">{fieldState.error.message}</p>}
                      </>
                    )} />
                  </div>
                  <div>
                    <Label className="font-serif">Choose your Avatar</Label>
                     <Controller name="avatar" control={control} render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select Avatar" /></SelectTrigger>
                        <SelectContent>
                          {avatarOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div className="flex items-center gap-2">{opt.icon} {opt.label}</div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                     )} />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="font-bold text-xl font-serif">Step 2: Areas to Conquer</h3>
                  <div>
                    <Label className="font-serif">Which life areas do you want to level up?</Label>
                    <Controller name="lifeAreas" control={control} render={({ field, fieldState }) => (
                        <div className="space-y-2 mt-2">
                        {lifeAreasOptions.map(area => (
                            <div key={area} className="flex items-center gap-2">
                            <Checkbox
                                id={area}
                                checked={field.value.includes(area)}
                                onCheckedChange={(checked) => {
                                return checked
                                    ? field.onChange([...field.value, area])
                                    : field.onChange(field.value.filter(a => a !== area));
                                }}
                            />
                            <Label htmlFor={area}>{area}</Label>
                            </div>
                        ))}
                        {fieldState.error && <p className="text-destructive text-sm mt-1">{fieldState.error.message}</p>}
                        </div>
                    )} />
                  </div>
                </div>
              )}

              {step === 3 && (
                 <div className="space-y-6 animate-fade-in">
                    <h3 className="font-bold text-xl font-serif">Step 3: Allocate Your Time</h3>
                    <p className="text-muted-foreground font-serif">How many hours per day can you dedicate to each area?</p>
                    {selectedLifeAreas.map(area => (
                        <div key={area} className="space-y-2">
                            <Label htmlFor={`time-${area}`} className="flex items-center gap-2"><Clock className="w-5 h-5 text-primary" /> {area}</Label>
                            <Controller
                                name={`timeBudget.${area}` as any}
                                control={control}
                                defaultValue={1}
                                render={({ field }) => (
                                    <div className="flex items-center gap-4">
                                        <Slider
                                            id={`time-${area}`}
                                            min={0} max={8} step={0.5}
                                            defaultValue={[field.value || 1]}
                                            onValueChange={(value) => field.onChange(value[0])}
                                        />
                                        <span className="font-bold text-primary w-24 text-center">{field.value !== undefined ? `${field.value} hr(s)` : `1 hr(s)`}</span>
                                    </div>
                                )}
                            />
                        </div>
                    ))}
                 </div>
              )}

              {step === 4 && (
                 <div className="space-y-6 animate-fade-in">
                    <h3 className="font-bold text-xl font-serif">Step 4: Assess Your Power</h3>
                    <p className="text-muted-foreground font-serif">Rate your current level in each stat from 1 to 10.</p>
                    {statOptions.map(stat => (
                        <div key={stat.name} className="space-y-2">
                            <Label className="flex items-center gap-2">{stat.icon} {stat.label}</Label>
                            <Controller name={stat.name} control={control} render={({ field }) => (
                                <div className="flex items-center gap-4">
                                <Slider
                                    min={1} max={10} step={1}
                                    defaultValue={[field.value]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                />
                                <span className="font-bold text-primary w-6 text-center">{getValues(stat.name)}</span>
                                </div>
                            )} />
                        </div>
                    ))}
                 </div>
              )}

              {step === 5 && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="font-bold text-xl font-serif">Step 5: Mission Difficulty</h3>
                  <div>
                    <Label className="font-serif">Choose your preferred task difficulty.</Label>
                     <Controller name="difficultyPreference" control={control} render={({ field }) => (
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="mt-2 grid grid-cols-3 gap-4">
                           {['Easy', 'Medium', 'Hard'].map(diff => (
                            <Label key={diff} htmlFor={diff} className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                               <RadioGroupItem value={diff} id={diff} className="sr-only" />
                               {diff}
                            </Label>
                           ))}
                        </RadioGroup>
                     )} />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {step > 1 && <Button type="button" variant="outline" onClick={prevStep} disabled={isSubmitting}>Back</Button>}
              <div/>
              {step < 5 && <Button type="button" onClick={nextStep} disabled={isSubmitting}>Next</Button>}
              {step === 5 && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Setting up...' : 'Begin Your Ascent'}
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </SharedLayout>
  );
};

export default Onboarding;
