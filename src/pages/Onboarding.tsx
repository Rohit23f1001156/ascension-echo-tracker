
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { usePlayer } from '@/context/PlayerContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

const characterClasses = [
  { name: 'Shadow Hunter', description: 'Master of stealth and precision' },
  { name: 'Mind Warrior', description: 'Champion of mental fortitude' },
  { name: 'Life Architect', description: 'Builder of sustainable habits' },
  { name: 'Goal Crusher', description: 'Unstoppable force of achievement' }
];

const Onboarding = () => {
  const { session } = useAuth();
  const { updatePlayerProfile } = usePlayer();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    class: 'Shadow Hunter',
    strength: 3,
    stamina: 3,
    concentration: 3,
    intelligence: 3,
    wealth: 3
  });

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!session?.user?.id) return;

      try {
        const { data: profile, error } = await supabase
          .from('data')
          .select('onboarding_complete')
          .eq('id', session.user.id)
          .single();

        if (!error && profile?.onboarding_complete) {
          navigate('/');
        }
      } catch (err) {
        console.log('No existing profile found, continuing with onboarding');
      }
    };

    checkOnboardingStatus();
  }, [session, navigate]);

  const handleStatChange = (stat: string, value: number) => {
    const currentStatValue = formData[stat as keyof typeof formData] as number;
    const totalPoints = Object.values(formData).slice(2).reduce((sum: number, val: unknown) => {
      return sum + (typeof val === 'number' ? val : 0);
    }, 0);
    const availablePoints = 20;
    
    if (totalPoints - currentStatValue + value <= availablePoints && value >= 1 && value <= 10) {
      setFormData(prev => ({ ...prev, [stat]: value }));
    }
  };

  const handleComplete = async () => {
    if (!session?.user?.id || !formData.name.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('data')
        .select('id')
        .eq('id', session.user.id)
        .single();

      if (existingProfile) {
        // Profile exists, just redirect
        navigate('/');
        return;
      }

      const profileData = {
        id: session.user.id,
        stats: {
          name: formData.name,
          class: formData.class,
          level: 0,
          xp: 0,
          xpNextLevel: 1000,
          strength: formData.strength,
          stamina: formData.stamina,
          concentration: formData.concentration,
          intelligence: formData.intelligence,
          wealth: formData.wealth,
          skills: 1,
          streak: 0,
          availablePoints: 0,
          statPointsToAllocate: 0,
          coins: 0,
          lastActivityDate: null,
          buffs: [],
          journalStreak: 0,
          lastJournalEntryDate: null,
          title: 'Novice'
        },
        settings: {
          quests: [],
          completedQuests: [],
          questLog: [],
          journalEntries: [],
          skillTree: [],
          calendarData: {},
          shadowTrials: [],
          habits: [],
          masteredSkills: [],
          activeSkillQuests: []
        },
        onboarding_complete: true,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('data')
        .insert(profileData);

      if (error) {
        console.error('Error creating profile:', error);
        toast.error('Failed to complete onboarding');
        return;
      }

      // Update player context
      updatePlayerProfile({
        name: formData.name,
        class: formData.class
      });

      toast.success('Welcome to Shadow Ascendant!');
      navigate('/');
    } catch (err) {
      console.error('Error in handleComplete:', err);
      toast.error('Failed to complete onboarding');
    }
  };

  const totalPoints = Object.values(formData).slice(2).reduce((sum: number, val: unknown) => {
    return sum + (typeof val === 'number' ? val : 0);
  }, 0);
  const remainingPoints = 20 - totalPoints;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold font-serif text-primary">Shadow Ascendant</CardTitle>
          <CardDescription>Begin your journey to greatness</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">What shall we call you, hunter?</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your name"
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Choose your path:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {characterClasses.map((cls) => (
                    <div
                      key={cls.name}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.class === cls.name
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, class: cls.name }))}
                    >
                      <h3 className="font-semibold">{cls.name}</h3>
                      <p className="text-sm text-muted-foreground">{cls.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button onClick={() => setStep(2)} className="w-full" disabled={!formData.name.trim()}>
                Continue to Abilities
              </Button>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Distribute Your Abilities</h3>
                <p className="text-sm text-muted-foreground">
                  You have {remainingPoints} points remaining to allocate
                </p>
              </div>
              
              <div className="space-y-4">
                {[
                  { key: 'strength', label: 'Strength', description: 'Physical power and endurance' },
                  { key: 'stamina', label: 'Stamina', description: 'Energy and persistence' },
                  { key: 'concentration', label: 'Concentration', description: 'Focus and attention' },
                  { key: 'intelligence', label: 'Intelligence', description: 'Learning and problem-solving' },
                  { key: 'wealth', label: 'Wealth', description: 'Financial management' }
                ].map((stat) => (
                  <div key={stat.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{stat.label}</h4>
                      <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatChange(stat.key, (formData[stat.key as keyof typeof formData] as number) - 1)}
                        disabled={(formData[stat.key as keyof typeof formData] as number) <= 1}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center font-semibold">
                        {formData[stat.key as keyof typeof formData]}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatChange(stat.key, (formData[stat.key as keyof typeof formData] as number) + 1)}
                        disabled={remainingPoints <= 0 || (formData[stat.key as keyof typeof formData] as number) >= 10}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleComplete} className="flex-1" disabled={remainingPoints !== 0}>
                  Begin Journey
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
