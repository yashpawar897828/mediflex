
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('mediflex_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Mock login function - in a real app, this would connect to a backend
  const login = async (email: string, password: string) => {
    // Simple validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    if (password !== 'password123') {
      throw new Error('Invalid credentials');
    }

    // Mock successful login
    const user = {
      id: '1',
      email,
      name: email.split('@')[0],
    };

    // Store user in localStorage
    localStorage.setItem('mediflex_user', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('mediflex_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
