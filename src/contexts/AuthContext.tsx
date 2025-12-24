import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (data: any) => Promise<{ error: Error | null }>;
  signIn: (data: any) => Promise<{ error: Error | null }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // Ideally, we should have a /me endpoint to get user details. 
          // For now, we'll decode the token or just assume logged in if token exists.
          // Since we don't have a /me endpoint yet, let's just set a dummy user or parse from token if possible.
          // Better approach: Let's assume the user is logged in, but we might not have user details until we fetch them.
          // Or we can store user details in localStorage on login.
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } catch (error) {
          console.error('Auth check failed', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const signUp = async (data: any) => {
    try {
      await api.post('register/', data);
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data || error.message };
    }
  };

  const signIn = async (data: any) => {
    try {
      const response = await api.post('login/', data);
      const { access, refresh } = response.data;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);

      // Since we don't have a /me endpoint, we can't get the user object easily unless the login response returns it.
      // The simplejwt default view only returns tokens.
      // We should probably customize the login view or add a /me endpoint.
      // For now, let's just store the username if we sent it, or decode the token.
      // Actually, let's just set a basic user object.
      const userObj = { id: 0, username: data.username, email: '' }; // Placeholder
      setUser(userObj);
      localStorage.setItem('user', JSON.stringify(userObj));

      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data || error.message };
    }
  };

  const signOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
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
