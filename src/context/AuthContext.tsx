'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: 'user' | 'admin' | 'vendor';
  brandId?: number;
  avatar?: string;
  defaultAddress?: {
    id: number;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  requestSignupOTP: (name: string, email: string, pass: string) => Promise<void>;
  verifySignupOTP: (email: string, otp: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('namma_orru_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        localStorage.removeItem('namma_orru_token');
      }
    } catch (err: any) {
      // Use console.warn instead of console.error to avoid intercept by Next.js Global Error Overlay
      console.warn('Auth verification failed. Server might be unreachable or token invalid:', err.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setUser(data.user);
      localStorage.setItem('namma_orru_token', data.token);
    } catch (err: any) {
      setIsLoading(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const requestSignupOTP = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/signup/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize dispatch.');
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifySignupOTP = async (email: string, otp: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/signup/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification checksum mismatch.');
      
      // Provision logic
      setUser(data.user);
      localStorage.setItem('namma_orru_token', data.token);
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
     // Legacy support, will not support OTP steps. Use direct call for non-OTP legacy environments.
     setIsLoading(true);
     try {
       const res = await fetch(`${API_URL}/api/auth/signup`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ name, email, password: pass })
       });
 
       const data = await res.json();
       if (!res.ok) throw new Error(data.error || 'Signup failed');
 
       setUser(data.user);
       localStorage.setItem('namma_orru_token', data.token);
     } finally {
       setIsLoading(false);
     }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('namma_orru_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, requestSignupOTP, verifySignupOTP, signup, logout, isLoading }}>
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
