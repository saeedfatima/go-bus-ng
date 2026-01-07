import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Global lock to prevent concurrent token refreshes across components
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);
  const lastEventRef = useRef<string>('');

  // Debounced session update to prevent rapid state changes
  const updateSession = useCallback((newSession: Session | null, event?: string) => {
    // Prevent duplicate updates for same event
    if (event && lastEventRef.current === `${event}-${newSession?.access_token?.slice(-10)}`) {
      return;
    }
    if (event) {
      lastEventRef.current = `${event}-${newSession?.access_token?.slice(-10) || 'null'}`;
    }
    
    setSession(newSession);
    setUser(newSession?.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Prevent multiple initializations (StrictMode protection)
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth event:', event);
        
        // Handle token refresh with global lock to prevent concurrent refreshes
        if (event === 'TOKEN_REFRESHED') {
          if (isRefreshing) {
            // Another refresh is in progress, wait for it
            if (refreshPromise) await refreshPromise;
            return;
          }
          isRefreshing = true;
          refreshPromise = new Promise<void>((resolve) => {
            updateSession(currentSession, event);
            // Small delay to prevent rapid consecutive refreshes
            setTimeout(() => {
              isRefreshing = false;
              refreshPromise = null;
              resolve();
            }, 1000);
          });
          return;
        }
        
        // Handle sign out - clear everything
        if (event === 'SIGNED_OUT') {
          updateSession(null, event);
          return;
        }
        
        // For other events, update normally
        updateSession(currentSession, event);
      }
    );

    // THEN check for existing session (only once)
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      updateSession(existingSession, 'INITIAL');
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [updateSession]);

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          phone: phone,
        }
      }
    });
    
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
