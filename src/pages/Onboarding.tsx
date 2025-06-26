
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePlayer } from "@/context/PlayerContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";

const classes = [
  { id: 'shadow-hunter', name: 'Shadow Hunter', description: 'Master of stealth and precision' },
  { id: 'code-warrior', name: 'Code Warrior', description: 'Digital architect and problem solver' },
  { id: 'mind-sage', name: 'Mind Sage', description: 'Seeker of wisdom and knowledge' },
  { id: 'iron-guardian', name: 'Iron Guardian', description: 'Defender of discipline and strength' }
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updatePlayerProfile } = usePlayer();
  const { session } = useAuth();
  const navigate = useNavigate();

  const handleNext = () => {
    if (step === 1 && name.trim()) {
      setStep(2);
    } else if (step === 2 && selectedClass) {
      setStep(3);
    }
  };

  const handleComplete = async () => {
    if (!name.trim() || !selectedClass || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Update player profile
      updatePlayerProfile({ name: name.trim(), class: selectedClass });
      
      // Check if profile exists, if not create it
      if (session?.user?.id) {
        const { data: existingProfile, error: fetchError } = await supabase
          .from('data')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (fetchError && fetchError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { error: insertError } = await supabase
            .from('data')
            .insert({
              id: session.user.id,
              stats: { 
                name: name.trim(), 
                class: selectedClass,
                level: 0,
                xp: 0,
                xpNextLevel: 1000,
                strength: 1,
                stamina: 1,
                concentration: 1,
                intelligence: 1,
                wealth: 1,
                skills: 1,
                streak: 0,
                availablePoints: 0,
                statPointsToAllocate: 0,
                coins: 0,
                title: 'Novice'
              },
              settings: {},
              onboarding_complete: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('Error creating profile:', insertError);
            toast.error('Failed to create profile');
            setIsSubmitting(false);
            return;
          }
        } else if (!fetchError) {
          // Profile exists, just mark onboarding as complete
          const { error: updateError } = await supabase
            .from('data')
            .update({ 
              onboarding_complete: true,
              stats: { 
                name: name.trim(), 
                class: selectedClass,
                level: 0,
                xp: 0,
                xpNextLevel: 1000,
                strength: 1,
                stamina: 1,
                concentration: 1,
                intelligence: 1,
                wealth: 1,
                skills: 1,
                streak: 0,
                availablePoints: 0,
                statPointsToAllocate: 0,
                coins: 0,
                title: 'Novice'
              },
              updated_at: new Date().toISOString()
            })
            .eq('id', session.user.id);

          if (updateError) {
            console.error('Error updating profile:', updateError);
            toast.error('Failed to update profile');
            setIsSubmitting(false);
            return;
          }
        }
      }
      
      toast.success('Welcome to Shadow Ascendant!');
      navigate('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary font-serif">Shadow Ascendant</CardTitle>
          <CardDescription>Begin your journey to greatness</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">What shall we call you?</h2>
                <p className="text-sm text-muted-foreground">Choose a name that will strike fear into the hearts of your enemies.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                />
              </div>
              <Button onClick={handleNext} disabled={!name.trim()} className="w-full">
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Choose Your Path</h2>
                <p className="text-sm text-muted-foreground">Select a class that resonates with your soul.</p>
              </div>
              <div className="space-y-2">
                <Label>Your Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.name}>
                        <div>
                          <div className="font-medium">{cls.name}</div>
                          <div className="text-sm text-muted-foreground">{cls.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleNext} disabled={!selectedClass} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Ready to Begin?</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Your journey as <span className="font-semibold text-primary">{name}</span>, 
                  the <span className="font-semibold text-primary">{selectedClass}</span>, is about to begin.
                </p>
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                  <h3 className="font-semibold mb-2">What awaits you:</h3>
                  <ul className="text-sm space-y-1 text-left">
                    <li>• Daily quests to build discipline</li>
                    <li>• Skill trees to master new abilities</li>
                    <li>• XP and levels to track your growth</li>
                    <li>• Shadow trials to test your limits</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleComplete} disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Starting...' : 'Begin Journey'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
