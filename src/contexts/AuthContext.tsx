import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { api, currentBackend } from '@/services/api';
import type { ApiUser, ApiSession } from '@/services/api/types';

interface AuthContextType {
  user: ApiUser | null;
  session: ApiSession | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [session, setSession] = useState<ApiSession | null>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  const updateSession = useCallback((newSession: ApiSession | null) => {
    setSession(newSession);
    setUser(newSession?.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Set up auth state listener
    const unsubscribe = api.auth.onAuthStateChange((event, currentSession) => {
      console.log('Auth event:', event);
      updateSession(currentSession);
    });

    // Initial session check
    api.auth.getSession().then((existingSession) => {
      updateSession(existingSession);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [updateSession]);

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      const result = await api.auth.signUp(email, password, fullName, phone);
      return { error: result.error || null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await api.auth.signIn(email, password);
      return { error: result.error || null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await api.auth.signOut();
      updateSession(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
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
