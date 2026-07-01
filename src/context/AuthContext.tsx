'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: 'user' | 'admin' | 'vendor' | 'hub' | 'customer';
  brandId?: number;
  subVendorId?: number;
  headVendorId?: number;
  hubId?: string | null;
  vendorId?: string | null;
  avatar?: string;
  defaultAddress?: {
    id: number;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  hubPermissions?: Record<string, any>;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  requestAuthOTP: (phone: string) => Promise<void>;
  verifyAuthOTP: (phone: string, otp: string) => Promise<void>;
  requestOnboardingOTP: (phone: string) => Promise<void>;
  verifyOnboardingOTP: (phone: string, otp: string) => Promise<{ action: string; token?: string; user?: User }>;
  completeOnboardingProfile: (phone: string, name: string, email: string, pass: string) => Promise<void>;
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

  const requestAuthOTP = async (phone: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize dispatch.');
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAuthOTP = async (phone: string, otp: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
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

  const requestOnboardingOTP = async (phone: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/onboarding/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch OTP.');
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOnboardingOTP = async (phone: string, otp: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/onboarding/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification mismatch.');

      if (data.action === 'login') {
        setUser(data.user);
        localStorage.setItem('namma_orru_token', data.token);
      }
      return data;
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboardingProfile = async (phone: string, name: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/onboarding/complete-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name, email, password: pass })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create account.');

      setUser(data.user);
      localStorage.setItem('namma_orru_token', data.token);
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('namma_orru_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, requestAuthOTP, verifyAuthOTP, requestOnboardingOTP, verifyOnboardingOTP, completeOnboardingProfile, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    if (typeof window === 'undefined') {
      return {
        user: null,
        login: async () => {},
        requestAuthOTP: async () => {},
        verifyAuthOTP: async () => {},
        requestOnboardingOTP: async () => {},
        verifyOnboardingOTP: async () => ({ action: 'register' }),
        completeOnboardingProfile: async () => {},
        logout: () => {},
        isLoading: false
      };
    }
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
