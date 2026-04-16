'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session safely
    try {
      const savedUser = localStorage.getItem('namma_orru_user');
      if (savedUser && savedUser !== 'undefined') {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed === 'object') {
          setUser(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to restore auth session:', error);
      localStorage.removeItem('namma_orru_user');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    // Mock API call
    setTimeout(() => {
      const mockUser = { id: '1', name: 'John Doe', email, avatar: '/ai_images/organic_grains_1776231059575.png' };
      setUser(mockUser);
      localStorage.setItem('namma_orru_user', JSON.stringify(mockUser));
      setIsLoading(false);
    }, 1500);
  };

  const signup = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    // Mock API call
    setTimeout(() => {
      const mockUser = { id: '2', name, email };
      setUser(mockUser);
      localStorage.setItem('namma_orru_user', JSON.stringify(mockUser));
      setIsLoading(false);
    }, 1500);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('namma_orru_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
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
