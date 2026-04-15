import { createContext, useContext, useState, ReactNode } from 'react';
import { authApi } from '../utils/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'volunteer' | 'user';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('crisisconnect_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email: string, password: string) => {
    try {
      const { user: loggedInUser } = await authApi.login(email, password);
      setUser(loggedInUser);
      localStorage.setItem('crisisconnect_user', JSON.stringify(loggedInUser));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string, role: string) => {
    try {
      const { user: newUser } = await authApi.signup(email, password, name, role);
      setUser(newUser);
      localStorage.setItem('crisisconnect_user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('crisisconnect_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}