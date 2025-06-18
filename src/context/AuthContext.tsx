
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncProfile = async (session: Session | null) => {
      if (session?.user) {
        try {
          console.log('Syncing profile for user:', session.user.id);
          
          // FIXED: Check if profile exists in 'data' table with .single()
          const { data: profile, error } = await supabase
            .from('data')  // FIXED: Using 'data' instead of 'profiles'
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            if (error.code === 'PGRST116') {
              console.log('No profile found - user needs to complete onboarding');
              clearPlayerData();
              toast.info('Welcome! Please complete your profile setup.');
            } else {
              console.error('Error fetching profile:', error);
              toast.error('Error loading your profile. Check your database setup.');
            }
          } else if (profile && profile.onboarding_complete === true) {
            console.log('Loading existing profile from Supabase:', profile);
            
            // FIXED: Load all saved data from Supabase properly
            if (profile.stats) {
              localStorage.setItem('playerStats', JSON.stringify(profile.stats));
              console.log('Loaded stats from Supabase:', profile.stats);
            }
            if (profile.settings) {
              localStorage.setItem('playerProfile', JSON.stringify(profile.settings));
              console.log('Loaded settings from Supabase:', profile.settings);
            }
            
            localStorage.setItem('onboardingComplete', 'true');
            toast.success('Welcome back! Your progress has been loaded.');
          } else {
            console.log('Profile found but onboarding not complete - redirecting to onboarding');
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
