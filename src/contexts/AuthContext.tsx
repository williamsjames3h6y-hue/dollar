import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../lib/api';

interface User {
  id: number;
  email: string;
  role: string;
  full_name?: string;
  vip_tier?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.getUser();
      setUser(response.user);
    } catch (err) {
      console.error('Error loading user:', err);
      localStorage.removeItem('auth_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await api.signUp(email, password, fullName);
      setUser(response.user);
    } catch (err) {
      console.error('Signup error:', err);
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.signIn(email, password);
      setUser(response.user);
    } catch (err) {
      console.error('Signin error:', err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await api.signOut();
      setUser(null);
    } catch (err) {
      console.error('Signout error:', err);
      throw err;
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
