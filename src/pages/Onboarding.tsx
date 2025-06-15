
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
import { User, Shield, Swords, Brain, Heart, Crosshair, ChevronsUp, DollarSign } from 'lucide-react';

const onboardingSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  avatar: z.string(),
  lifeAreas: z.array(z.string()).min(1, "Select at least one area."),
  strength: z.number().min(1).max(10),
  stamina: z.number().min(1).max(10),
  concentration: z.number().min(1).max(10),
  intelligence: z.number().min(1).max(10),
  wealth: z.number().min(1).max(10),
  difficultyPreference: z.enum(['Easy', 'Medium', 'Hard']),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

const lifeAreasOptions = ["Health", "Study/DSA & Core CS", "Wealth/Crypto Trading"];
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
  const { updatePlayerProfile } = usePlayer();
  const navigate = useNavigate();

  const { control, handleSubmit, trigger, getValues } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
      avatar: 'user',
      lifeAreas: [],
      strength: 5,
      stamina: 5,
      concentration: 5,
      intelligence: 5,
      wealth: 5,
      difficultyPreference: 'Medium',
    },
  });

  const nextStep = async () => {
    let fieldsToValidate: (keyof OnboardingValues)[] = [];
    if (step === 1) fieldsToValidate = ['name', 'avatar'];
    if (step === 2) fieldsToValidate = ['lifeAreas'];
    if (step === 3) fieldsToValidate = ['strength', 'stamina', 'concentration', 'intelligence', 'wealth'];
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(s => s + 1);
  };
  const prevStep = () => setStep(s => s - 1);

  const onSubmit = (data: OnboardingValues) => {
    const { name, avatar, difficultyPreference, lifeAreas, ...stats } = data;
    updatePlayerProfile(
        { name, avatar, ...stats }, 
        { difficultyPreference, lifeAreas, timeBudget: {} } // Time budget not implemented in form yet
    );
    navigate('/');
  };

  return (
    <SharedLayout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-2xl bg-card/80 border-primary/20">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="text-3xl text-primary">Arise, Shadow!</CardTitle>
              <CardDescription>Let's set up your profile to begin the journey.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="font-bold text-xl">Step 1: Your Identity</h3>
                  <div>
                    <Label htmlFor="name">What is your name, hunter?</Label>
                    <Controller name="name" control={control} render={({ field, fieldState }) => (
                      <>
                        <Input id="name" {...field} placeholder="e.g., Sung Jin-Woo" />
                        {fieldState.error && <p className="text-destructive text-sm mt-1">{fieldState.error.message}</p>}
                      </>
                    )} />
                  </div>
                  <div>
                    <Label>Choose your Avatar</Label>
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
                  <h3 className="font-bold text-xl">Step 2: Areas to Conquer</h3>
                  <div>
                    <Label>Which life areas do you want to level up?</Label>
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
                    <h3 className="font-bold text-xl">Step 3: Assess Your Power</h3>
                    <p className="text-muted-foreground text-sm">Rate your current level in each stat from 1 to 10.</p>
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

              {step === 4 && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="font-bold text-xl">Step 4: Mission Difficulty</h3>
                  <div>
                    <Label>Choose your preferred task difficulty.</Label>
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
              {step > 1 && <Button type="button" variant="outline" onClick={prevStep}>Back</Button>}
              <div/>
              {step < 4 && <Button type="button" onClick={nextStep}>Next</Button>}
              {step === 4 && <Button type="submit">Begin Your Ascent</Button>}
            </CardFooter>
          </form>
        </Card>
      </div>
    </SharedLayout>
  );
};

export default Onboarding;

