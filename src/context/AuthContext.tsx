
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

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
          const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          
          if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Error fetching profile:', error);
          } else if (profile?.onboarding_complete) {
            console.log('Syncing profile from Supabase:', profile);
            localStorage.setItem('playerStats', JSON.stringify(profile.stats));
            localStorage.setItem('playerProfile', JSON.stringify(profile.settings));
            localStorage.setItem('onboardingComplete', 'true');
          } else {
            console.log('No profile found or onboarding not complete');
            clearPlayerData();
          }
        } catch (err) {
          console.error('Error syncing profile:', err);
        }
      } else {
        clearPlayerData();
      }
    };
    
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await syncProfile(session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await syncProfile(session);
      setSession(session);
      setUser(session?.user ?? null);
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
