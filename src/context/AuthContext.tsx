
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/sonner';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  logout: async () => {},
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

// Default data structures
const defaultStats = {
  name: '',
  class: 'Shadow Hunter',
  title: 'Novice',
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
  lastActivityDate: null,
  buffs: [],
  journalStreak: 0,
  lastJournalEntryDate: null,
};

const defaultSettings = {
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
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout failed:", error);
        toast.error("Failed to logout");
      } else {
        clearPlayerData();
        setSession(null);
        setUser(null);
        toast.success("Logged out successfully");
        window.location.href = '/login';
      }
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Failed to logout");
    }
  };

  const createDefaultUserData = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('data')
        .insert({
          id: userId,
          stats: defaultStats,
          settings: defaultSettings,
          onboarding_complete: false,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating default user data:', error);
        return false;
      }
      
      console.log('Created default user data for:', userId);
      return true;
    } catch (err) {
      console.error('Error in createDefaultUserData:', err);
      return false;
    }
  };

  const syncProfile = async (session: Session | null) => {
    if (session?.user) {
      try {
        console.log('Syncing profile for user:', session.user.id);
        
        const { data: profile, error } = await supabase
          .from('data')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') {
            console.log('No profile found - creating default data and redirecting to onboarding');
            const created = await createDefaultUserData(session.user.id);
            if (created) {
              clearPlayerData();
              toast.info('Welcome! Please complete your profile setup.');
            }
          } else {
            console.error('Error fetching profile:', error);
            toast.error('Error loading your profile. Check your database setup.');
          }
        } else if (profile && profile.onboarding_complete === true) {
          console.log('Loading existing profile from Supabase:', profile);
          
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
          console.log('Profile found but onboarding not complete - user needs onboarding');
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
  
  useEffect(() => {
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
        setSession(null);
        setUser(null);
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
    logout,
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
