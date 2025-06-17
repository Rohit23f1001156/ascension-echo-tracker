
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/sonner';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
});

const clearPlayerData = () => {
  localStorage.removeItem('shadow-ascendant-stats');
  localStorage.removeItem('shadow-ascendant-settings');
  localStorage.removeItem('onboardingComplete');
  localStorage.removeItem('shadow-ascendant-quests');
  localStorage.removeItem('shadow-ascendant-journal');
  localStorage.removeItem('shadow-ascendant-habits');
  localStorage.removeItem('playerStats');
  localStorage.removeItem('playerProfile');
  localStorage.removeItem('playerQuests');
  localStorage.removeItem('playerHabits');
  localStorage.removeItem('completedQuests');
  localStorage.removeItem('questLog');
  localStorage.removeItem('journalEntries');
  localStorage.removeItem('activeSkillQuests');
  localStorage.removeItem('masteredSkills');
  localStorage.removeItem('skillTree');
};

const createDefaultProfile = async (userId: string) => {
  try {
    console.log('Creating default profile for user:', userId);
    
    const defaultProfile = {
      id: userId,
      stats: { 
        strength: 1, 
        stamina: 1, 
        intelligence: 1, 
        concentration: 1, 
        wealth: 1 
      },
      settings: {},
      onboarding_complete: false,
      updated_at: new Date().toISOString(),
      quests: [],
      habits: [],
      journal_entries: [],
      skill_tree: null,
      mastered_skills: []
    };

    const { error } = await supabase
      .from('profiles')
      .insert([defaultProfile]);

    if (error) {
      console.error('Error creating default profile:', error);
      return false;
    }

    console.log('Default profile created successfully');
    return true;
  } catch (err) {
    console.error('Error in createDefaultProfile:', err);
    return false;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncProfile = async (session: Session | null) => {
      if (session?.user) {
        try {
          console.log('Syncing profile for user:', session.user.id);
          
          // First, check if profile exists
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            if (error.code === 'PGRST116') {
              console.log('No profile found, creating default profile');
              // Create default profile and clear local data
              const created = await createDefaultProfile(session.user.id);
              if (created) {
                clearPlayerData();
                toast.info('Welcome! Please complete your profile setup.');
              } else {
                toast.error('Error creating your profile. Using local storage for now.');
              }
            } else {
              console.error('Error fetching profile:', error);
              toast.error('Error loading your profile. Check your database setup.');
            }
          } else if (profile && profile.onboarding_complete) {
            console.log('Syncing profile from Supabase:', profile);
            
            // Load all saved data from Supabase
            if (profile.stats) {
              localStorage.setItem('playerStats', JSON.stringify(profile.stats));
              console.log('Loaded stats from Supabase:', profile.stats);
            }
            if (profile.settings) {
              localStorage.setItem('playerProfile', JSON.stringify(profile.settings));
              console.log('Loaded settings from Supabase:', profile.settings);
            }
            
            // Load additional game data if available
            if (profile.quests) {
              localStorage.setItem('playerQuests', JSON.stringify(profile.quests));
            }
            if (profile.habits) {
              localStorage.setItem('playerHabits', JSON.stringify(profile.habits));
            }
            if (profile.journal_entries) {
              localStorage.setItem('journalEntries', JSON.stringify(profile.journal_entries));
            }
            if (profile.skill_tree) {
              localStorage.setItem('skillTree', JSON.stringify(profile.skill_tree));
            }
            if (profile.mastered_skills) {
              localStorage.setItem('masteredSkills', JSON.stringify(profile.mastered_skills));
            }
            
            localStorage.setItem('onboardingComplete', 'true');
            toast.success('Welcome back! Your progress has been loaded.');
          } else {
            console.log('Profile found but onboarding not complete, clearing local data');
            clearPlayerData();
          }
        } catch (err) {
          console.error('Error syncing profile:', err);
          toast.error('Failed to sync your profile. Using local storage for now.');
        }
      } else {
        console.log('No session, clearing player data');
        clearPlayerData();
      }
    };
    
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          toast.error('Authentication error: ' + error.message);
        }
        await syncProfile(session);
        setSession(session);
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('Error in getSession:', err);
        toast.error('Failed to load session.');
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        clearPlayerData();
        toast.info('Logged out successfully.');
      }
      
      await syncProfile(session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN') {
        toast.success('Logged in successfully!');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    loading,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
