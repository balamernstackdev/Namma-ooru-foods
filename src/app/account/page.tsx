'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  User,
  ArrowRight,
  ShieldCheck,
  Leaf,
  Heart,
  Package,
  MapPin,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  LayoutDashboard,
  Timer,
  Phone,
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Sparkles,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/context/ToastContext';
import { API_URL } from '@/lib/api';

export default function AccountPage() {
  const [error, setError] = useState<string | null>(null);
  const { user, login, requestAuthOTP, verifyAuthOTP, logout, isLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  // Dynamic branding background
  const [heroImage, setHeroImage] = useState('/ai_images/honey_jar_premium_1779435764877.png');

  // Flows: 'login' | 'signup' | 'forgot-password'
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>('login');

  // Login method: 'password' | 'otp'
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');

  // Input states
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // OTP Verification view states
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState<'auth' | 'register' | 'reset' | null>(null);
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Forgot password sub-steps: 1 (Enter Info), 2 (OTP Verification), 3 (Enter New Password)
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotEmail, setForgotEmail] = useState('');

  // Refs for auto-focus OTP inputs
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Dynamic Background configuration
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const fetchHeroImage = async () => {
      try {
        const response = await fetch(`${API_URL}/api/settings/login_hero_image`, {
          signal: controller.signal,
        });
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (data && data.value) {
              setHeroImage(data.value);
            }
          }
        }
      } catch (err: any) {
        // Silently ignore abort (timeout) or network errors — fallback image is already set
        if (err?.name !== 'AbortError') {
          console.warn('Hero image setting unavailable, using default.');
        }
      } finally {
        clearTimeout(timeout);
      }
    };
    fetchHeroImage();
    return () => controller.abort();
  }, []);

  // OTP countdown timer effect
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const role = user.role?.toLowerCase();
      if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'vendor' || role === 'seller') {
        router.push('/seller');
      } else if (role === 'hub') {
        router.push('/hub/dashboard');
      } else {
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get('redirect');
        if (redirectTo) {
          router.push(redirectTo);
        } else if (window.innerWidth < 768) {
          // Mobile custom layout stays here
        } else {
          router.push('/');
        }
      }
    }
  }, [user, router]);

  // Handle manual OTP change in the 6 inputs list
  const handleOtpChange = (value: string, index: number) => {
    if (value && isNaN(Number(value))) return;

    const newOtp = [...otpArray];
    newOtp[index] = value.substring(value.length - 1);
    setOtpArray(newOtp);

    // Focus next input box
    if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otpArray];
      if (otpArray[index] === '' && index > 0) {
        // Focus previous input box
        otpRefs[index - 1].current?.focus();
        newOtp[index - 1] = '';
      } else {
        newOtp[index] = '';
      }
      setOtpArray(newOtp);
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otpArray];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtpArray(newOtp);

    const targetIdx = Math.min(pastedData.length, 5);
    otpRefs[targetIdx].current?.focus();
  };

  // Get joined string OTP
  const getFullOtp = () => otpArray.join('');

  // OTP triggers
  const triggerResend = async () => {
    if (resendTimer > 0) return;
    setError(null);
    try {
      if (otpPurpose === 'auth') {
        await requestAuthOTP(phone);
        addToast('Success', 'Authentication OTP resent successfully.');
      } else if (otpPurpose === 'register') {
        const signupPayload = { name, email, phone, password };
        const res = await fetch(`${API_URL}/api/auth/signup/request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(signupPayload)
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to dispatch registration OTP');
        }
        addToast('Success', 'Registration verification token resent.');
      } else if (otpPurpose === 'reset') {
        const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: forgotEmail })
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to dispatch reset code.');
        }
        addToast('Success', 'Password override OTP code resent.');
      }
      setResendTimer(60);
    } catch (err: any) {
      setError(err.message);
      addToast('Error', err.message);
    }
  };

  // 1. Submit LOGIN details
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (loginMethod === 'otp') {
      if (phone.length < 10) {
        setError('Please enter a valid 10-digit mobile number.');
        return;
      }
      try {
        await requestAuthOTP(phone);
        setOtpPurpose('auth');
        setOtpArray(['', '', '', '', '', '']);
        setResendTimer(30);
        setIsVerifyingOtp(true);
        addToast('Security Check', 'Secure SMS authorization token sent.');
      } catch (err: any) {
        setError(err.message || 'OTP dispatch failed.');
        addToast('Error', err.message || 'OTP dispatch failed.');
      }
    } else {
      // Password based login
      if (!phone) {
        setError('Please enter your mobile number or email address.');
        return;
      }
      if (!password) {
        setError('Please enter your account password.');
        return;
      }
      try {
        await login(phone, password);
        addToast('Welcome Back!', 'Login Successfullly');
      } catch (err: any) {
        setError(err.message || 'Invalid credentials.');
        addToast('Authentication Failed', err.message || 'Check your password.');
      }
    }
  };

  // 2. Submit SIGNUP details
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !phone || !password) {
      setError('Please fill in all the required onboarding details.');
      return;
    }
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your passwords.');
      return;
    }
    if (!agreeTerms) {
      setError('Please accept our marketplace terms and conditions to proceed.');
      return;
    }

    try {
      const signupPayload = { name, email, phone, password, role: 'USER' };
      const res = await fetch(`${API_URL}/api/auth/signup/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupPayload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request registration.');

      setOtpPurpose('register');
      setOtpArray(['', '', '', '', '', '']);
      setResendTimer(60);
      setIsVerifyingOtp(true);
      addToast('Onboarding OTP Sent', 'Please verify your phone number using the OTP sent.');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      addToast('Error', err.message || 'Registration failed.');
    }
  };

  // Unified Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup') {
      handleSignupSubmit(e);
    } else {
      handleLoginSubmit(e);
    }
  };

  // 3. Submit FORGOT PASSWORD (Step 1)
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!forgotEmail) {
      setError('Please specify your registered Mobile Number.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification request dropped.');

      setOtpPurpose('reset');
      setOtpArray(['', '', '', '', '', '']);
      setResendTimer(60);
      setIsVerifyingOtp(true);
      addToast('Verification OTP Shared', 'Password recovery OTP has been sent successfully to your mobile.');
    } catch (err: any) {
      setError(err.message || 'Password reset request failed.');
      addToast('Error', err.message || 'Password reset request failed.');
    }
  };

  // OTP CHECKSUM VERIFICATION (Flow centralizer)
  const handleOtpVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const fullOtp = getFullOtp();
    if (fullOtp.length < 6) return;

    try {
      if (otpPurpose === 'auth') {
        await verifyAuthOTP(phone, fullOtp);
        triggerSuccessEffect();
      } else if (otpPurpose === 'register') {
        const res = await fetch(`${API_URL}/api/auth/signup/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, phone, otp: fullOtp })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Identity confirmation mismatched.');

        // Instantly authenticate user session
        localStorage.setItem('namma_orru_token', data.token);
        // Refresh context
        window.location.reload();
        triggerSuccessEffect();
      } else if (otpPurpose === 'reset') {
        const res = await fetch(`${API_URL}/api/auth/verify-reset-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: forgotEmail, otp: fullOtp })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'OTP mismatch.');

        setIsVerifyingOtp(false);
        setForgotStep(3); // Direct forward to new password layout
        addToast('Verification Passed', 'Please specify your new secure password.');
      }
    } catch (err: any) {
      setError('Invalid OTP');
    }
  };

  // OTP 3: Execute Reset override
  const handleExecutePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please check your new password.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp: getFullOtp(), newPassword: password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update credentials.');

      addToast('Credentials Override Success', 'Password updated successfully. Please login.');
      setMode('login');
      setForgotStep(1);
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Credentials override failed.');
      addToast('Error', err.message || 'Credentials override failed.');
    }
  };

  const triggerSuccessEffect = () => {
    setShowSuccessAnimation(true);
    setTimeout(() => {
      setShowSuccessAnimation(false);
      setIsVerifyingOtp(false);
    }, 2200);
  };

  // -----------------------------------------------------
  // AUTHENTICATED MOBILE CONTROL PANEL
  // -----------------------------------------------------
  if (user) {
    const menuItems = [
      { label: 'My Profile', href: '/account/profile', icon: User, desc: 'Personal details & settings' },
      ...((user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'vendor' || user?.role?.toLowerCase() === 'hub') ? [
        {
          label: 'Control Board Portal',
          href: user.role.toLowerCase() === 'vendor' ? '/vendor' : user.role.toLowerCase() === 'hub' ? '/hub/dashboard' : '/admin',
          icon: LayoutDashboard,
          desc: 'Enterprise Operations panel'
        }
      ] : []),
      { label: 'Wishlist', href: '/account/wishlist', icon: Heart, desc: 'Saved products' },
      { label: 'My Orders', href: '/account/orders', icon: Package, desc: 'Order history & status' },
      { label: 'Payments', href: '/account/payments', icon: CreditCard, desc: 'Transaction history' },
      { label: 'Settings', href: '/account/settings', icon: Settings, desc: 'Privacy & preferences' },
    ];

    return (
      <div className="md:hidden flex flex-col gap-5 p-6 min-h-screen bg-stone-50/50">
        <span className="text-[10px] font-black uppercase tracking-[0.35em] text-stone-400 pl-4 border-l-4 border-emerald-500 mb-1 mt-4">
          Marketplace Hub
        </span>

        <nav className="flex flex-col gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between py-4.5 px-6 rounded-[2rem] bg-white border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] active:scale-[0.98] transition-all duration-300"
            >
              <div className="flex items-center gap-5">
                <div className="h-12 w-12 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  <item.icon size={22} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-black text-stone-900 tracking-tight leading-snug">{item.label}</span>
                  <span className="text-[11px] text-stone-400 font-medium mt-0.5">{item.desc}</span>
                </div>
              </div>
              <div className="h-8 w-8 rounded-full bg-stone-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                <ChevronRight className="h-4 w-4 text-stone-400 group-hover:text-emerald-600" strokeWidth={3} />
              </div>
            </Link>
          ))}

          <button
            onClick={logout}
            className="flex items-center gap-5 py-4 px-6 rounded-[2rem] bg-red-50/50 hover:bg-red-50 active:scale-[0.98] transition-all duration-300 mt-6 border border-red-100/70"
          >
            <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-red-500 shadow-sm border border-red-100/40">
              <LogOut size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-black text-red-600 uppercase tracking-[0.2em]">Sign Out</span>
          </button>
        </nav>
      </div>
    );
  }

  // -----------------------------------------------------
  // MAIN GUEST ENTRY POINT (SPLIT SCREEN EXPERIENCE)
  // -----------------------------------------------------
  return (
    <div className="min-h-0 lg:min-h-[calc(100vh-96px)] w-full bg-[#fdfbf7] flex flex-col lg:flex-row relative overflow-hidden transition-colors duration-500">

      {/* Autofill override: force white background regardless of OS color-scheme */}
      <style dangerouslySetInnerHTML={{
        __html: `
        /* Force white autofill on all inputs in the login/auth card */
        .auth-input:-webkit-autofill,
        .auth-input:-webkit-autofill:hover,
        .auth-input:-webkit-autofill:focus,
        .auth-input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
          -webkit-text-fill-color: #1c1917 !important;
          caret-color: #1c1917 !important;
          transition: background-color 9999s ease-in-out 0s !important;
        }
      `}} />

      {/* 1. LEFT BACKGROUND IMAGE PANE */}
      <div className="hidden lg:flex lg:w-[58%] bg-[#fdfbf7] flex-col justify-end p-20 overflow-hidden relative border-r border-stone-100/80">
        {/* Cinematic Organic visual overlay background */}
        <img
          src={heroImage}
          className="absolute inset-0 h-full w-full object-cover opacity-20 scale-105 transition-all duration-1000"
          alt="Premium Namma Ooru Foods Organic Spices & Grains"
        />
        {/* Sophisticated gradient mapping */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#fdfbf7] via-[#fdfbf7]/40 to-transparent opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-transparent via-transparent to-[#fdfbf7]/90" />



        {/* Brand Text Content (Desktop only) */}
        <div className="hidden lg:block relative z-20 max-w-xl animate-fade-in-up animation-delay-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[2px] w-12 bg-emerald-500 rounded-full" />
            <span className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.35em]">Namma Ooru Foods</span>
          </div>
          <h1 className="text-5xl xl:text-[68px] font-black text-stone-900 tracking-tighter leading-[1.02] mb-8 uppercase">
            Authentic.<br />
            Farm Fresh.<br />
            Delivered.
          </h1>
          <p className="text-stone-600 font-bold text-lg leading-relaxed max-w-md mb-12">
            Enjoy premium, chemical-free organic groceries and traditional products sourced directly from local agrarian families.
          </p>

          {/* Dynamic Stat cards */}
          <div className="flex gap-5 w-full">
            <div className="bg-white/85 border border-stone-200/50 rounded-[2rem] p-6 flex-1 shadow-[0_8px_30px_rgb(0,0,0,0.015)] transition-all hover:bg-white hover:border-emerald-500/30 group">
              <h4 className="text-3xl font-black text-stone-900 mb-1 tracking-tight group-hover:scale-105 group-hover:text-emerald-600 transition-all duration-300">50k+</h4>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Happy Families</p>
            </div>
            <div className="bg-white/85 border border-stone-200/50 rounded-[2rem] p-6 flex-1 shadow-[0_8px_30px_rgb(0,0,0,0.015)] transition-all hover:bg-white hover:border-emerald-500/30 group">
              <h4 className="text-3xl font-black text-stone-900 mb-1 tracking-tight group-hover:scale-105 group-hover:text-emerald-600 transition-all duration-300">200+</h4>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Local Farmers</p>
            </div>
            <div className="bg-white/85 border border-stone-200/50 rounded-[2rem] p-6 flex-1 shadow-[0_8px_30px_rgb(0,0,0,0.015)] transition-all hover:bg-white hover:border-emerald-500/30 group">
              <h4 className="text-3xl font-black text-stone-900 mb-1 tracking-tight group-hover:scale-105 group-hover:text-emerald-600 transition-all duration-300">500+</h4>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Organic items</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RIGHT / CENTER AUTHENTICATION GLASS PANE */}
      {/* On desktop: occupies 42%. On mobile: overlays transparently on background! */}
      <div className="w-full lg:w-[42%] flex items-center justify-center py-4 px-4 sm:p-12 bg-[#fdfbf7] lg:bg-gradient-to-tr lg:from-[#fdfbf7] lg:to-white border-l border-stone-100 relative overflow-y-auto z-10">
        <div className="absolute top-10 left-10 w-80 h-80 bg-emerald-100/30 rounded-full blur-[120px] pointer-events-none lg:block hidden" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-100/30 rounded-full blur-[120px] pointer-events-none lg:block hidden" />

        {/* Breathtaking smart authentication card */}
        <div className="w-full max-w-[520px] px-6 py-10 sm:p-12 bg-white rounded-[36px] border border-stone-200/60 shadow-[0_20px_80px_rgba(0,0,0,0.06)] flex flex-col relative overflow-hidden transition-all duration-500">

          {/* OTP success cinematic animation overlay */}
          <AnimatePresence>
            {showSuccessAnimation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/95 rounded-[36px] z-50 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="relative mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                    className="absolute -inset-4 border border-dashed border-[#0F9D58]/35 rounded-full"
                  />
                  <div className="h-24 w-24 rounded-full bg-emerald-50 flex items-center justify-center text-[#0F9D58] shadow-xl shadow-emerald-500/10">
                    <CheckCircle2 size={48} className="animate-scale-up" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-stone-900 tracking-tight uppercase">Verification Success</h3>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-2">Securing marketplace session...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* OTP Verification flow wrapper */}
          <AnimatePresence mode="wait">
            {isVerifyingOtp ? (
              <motion.div
                key="otp-verification"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                {/* Back Link */}
                <button
                  onClick={() => setIsVerifyingOtp(false)}
                  className="flex items-center gap-2 text-xs font-black text-stone-450 hover:text-stone-900 uppercase tracking-widest self-start transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back
                </button>

                <div className="text-center">
                  <h2 className="text-[32px] font-black text-stone-900 tracking-tighter leading-none mb-3 uppercase">Verify Mobile</h2>
                  <p className="text-xs font-bold text-stone-450 leading-relaxed uppercase tracking-wider">
                    We've dispatched a secure verification OTP to <span className="text-[#0F9D58]">+91 {phone || forgotEmail}</span>
                  </p>
                </div>

                {error && (
                  <div className="w-full p-4.5 bg-red-50/70 border border-red-100 rounded-2xl flex items-start gap-3.5 animate-shake">
                    <LockKeyhole className="text-red-500 h-4 w-4 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-red-600 leading-relaxed">{error}</p>
                  </div>
                )}

                <form onSubmit={handleOtpVerifySubmit} className="flex flex-col gap-8">
                  <div className="flex flex-col items-center gap-6">
                    {/* Multi Box OTP Input component */}
                    <div className="flex justify-between gap-2.5 w-full mx-auto" onPaste={handleOtpPaste}>
                      {otpArray.map((digit, i) => (
                        <input
                          key={i}
                          ref={otpRefs[i]}
                          type="text"
                          maxLength={1}
                          pattern="\d*"
                          className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black rounded-xl border-2 bg-stone-50 text-stone-900 outline-none focus:scale-105 focus:ring-4 focus:ring-emerald-500/10 focus:border-[#0F9D58] transition-all ${digit ? 'border-emerald-300 bg-emerald-50/20 shadow-sm' : 'border-stone-200'}`}
                          value={digit}
                          onChange={(e) => handleOtpChange(e.target.value, i)}
                          onKeyDown={(e) => handleOtpKeyDown(e, i)}
                          required
                          autoFocus={i === 0}
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between w-full px-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-stone-400 uppercase tracking-widest">
                        <Timer size={14} />
                        {resendTimer > 0 ? `00:${resendTimer.toString().padStart(2, '0')}` : 'Code Expired'}
                      </div>
                      {resendTimer === 0 ? (
                        <button
                          type="button"
                          onClick={triggerResend}
                          className="text-xs font-black text-[#0F9D58] hover:text-[#0B7D46] underline underline-offset-4 transition-colors uppercase tracking-widest"
                        >
                          Resend Code
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-stone-300 uppercase tracking-widest">Resend Code</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      type="submit"
                      disabled={isLoading || getFullOtp().length < 6}
                      className="w-full h-[60px] bg-[#0F9D58] hover:bg-[#0B7D46] disabled:bg-stone-200 disabled:text-stone-400 rounded-2xl text-white font-semibold text-[13px] tracking-[0.15em] uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          VERIFYING CODE...
                        </span>
                      ) : (
                        'Verify & Continue'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : mode === 'login' || mode === 'signup' ? (
              // ========================================================
              // LOGIN & EXPANDABLE SIGNUP FLOW (NO TABS!)
              // ========================================================
              <motion.div
                key="smart-auth-flow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-6"
              >
                {/* Visual Header */}
                <div className="text-center">
                  <h2 className="text-[32px] font-black text-stone-900 tracking-tighter leading-none mb-3">
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-widest leading-relaxed">
                    {mode === 'login' ? 'Enter your mobile number or email to securely sign in or create an account.' : 'Join our premium organic food revolution today.'}
                  </p>
                </div>

                {error && (
                  <div className="w-full p-4.5 bg-red-50/70 border border-red-100 rounded-2xl flex items-start gap-3 animate-shake">
                    <LockKeyhole className="text-red-500 h-4 w-4 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-red-600 leading-relaxed">{error}</p>
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="flex flex-col gap-2">

                  {/* SIGNUP ADDITIONAL FIELDS CONTAINER (SLIDE DOWN FROM TOP) */}
                  <AnimatePresence initial={false}>
                    {mode === 'signup' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginBottom: 16 }}
                        exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden flex flex-col gap-4"
                      >
                        {/* 1. Full Name */}
                        <div className="relative h-[64px] rounded-2xl bg-white border border-[#E8ECE5] shadow-[0_4px_20px_rgba(0,0,0,0.02)] focus-within:border-[#0F9D58] focus-within:shadow-[0_0_0_4px_rgba(15,157,88,0.1)] transition-all duration-300 flex items-center px-5">
                          <div className="relative flex-grow h-full">
                            <input
                              type="text"
                              value={name}
                              onChange={e => setName(e.target.value)}
                              className="auth-input peer w-full h-full pt-6 bg-transparent outline-none font-bold text-sm text-stone-900 placeholder-transparent"
                              placeholder="Full Name"
                              required={mode === 'signup'}
                            />
                            <label className="absolute left-0 top-2 text-[9px] font-black text-stone-400 uppercase tracking-[0.15em] transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-5.5 peer-placeholder-shown:font-semibold peer-focus:top-2 peer-focus:text-[9px] peer-focus:text-[#0F9D58] pointer-events-none">
                              Full Name
                            </label>
                          </div>
                        </div>

                        {/* 2. Email Address */}
                        <div className="relative h-[64px] rounded-2xl bg-white border border-[#E8ECE5] shadow-[0_4px_20px_rgba(0,0,0,0.02)] focus-within:border-[#0F9D58] focus-within:shadow-[0_0_0_4px_rgba(15,157,88,0.1)] transition-all duration-300 flex items-center px-5">
                          <div className="relative flex-grow h-full">
                            <input
                              type="email"
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              className="auth-input peer w-full h-full pt-6 bg-transparent outline-none font-bold text-sm text-stone-900 placeholder-transparent"
                              placeholder="Email Address"
                              required={mode === 'signup'}
                            />
                            <label className="absolute left-0 top-2 text-[9px] font-black text-stone-400 uppercase tracking-[0.15em] transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-5.5 peer-placeholder-shown:font-semibold peer-focus:top-2 peer-focus:text-[9px] peer-focus:text-[#0F9D58] pointer-events-none">
                              Email Address
                            </label>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* SHARED FIELDS (ALWAYS VISIBLE, MORPHING HEIGHT & ALIGNMENT) */}
                  <div className="flex flex-col gap-2">                    {/* 3. PREMIUM MOBILE INPUT */}
                    <div className="relative h-[64px] rounded-2xl bg-white border border-[#E8ECE5] shadow-[0_4px_20px_rgba(0,0,0,0.02)] focus-within:border-[#0F9D58] focus-within:shadow-[0_0_0_4px_rgba(15,157,88,0.1)] transition-all duration-300 flex items-center px-5">
                      <div className="relative flex-grow h-full">
                        <input
                          type={mode === 'login' && loginMethod === 'password' ? 'text' : 'tel'}
                          value={phone}
                          onChange={e => {
                            if (mode === 'login' && loginMethod === 'password') {
                              setPhone(e.target.value);
                            } else {
                              setPhone(e.target.value.replace(/\D/g, ''));
                            }
                          }}
                          placeholder={mode === 'login' && loginMethod === 'password' ? 'Mobile or Email' : 'Mobile Number'}
                          className="auth-input peer w-full h-full pt-6 bg-transparent outline-none font-bold text-sm text-stone-900 placeholder-transparent"
                          required
                        />
                        <label className="absolute left-0 top-2 text-[9px] font-black text-stone-400 uppercase tracking-[0.15em] transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-5 peer-placeholder-shown:font-semibold peer-focus:top-2 peer-focus:text-[9px] peer-focus:text-[#0F9D58] pointer-events-none">
                          {mode === 'login' && loginMethod === 'password' ? 'Mobile or Email' : 'Mobile Number'}
                        </label>
                      </div>
                    </div>

                    {/* 4. PREMIUM PASSWORD INPUT */}
                    {!(mode === 'login' && loginMethod === 'otp') && (
                      <div className="relative h-[64px] rounded-2xl bg-white border border-[#E8ECE5] shadow-[0_4px_20px_rgba(0,0,0,0.02)] focus-within:border-[#0F9D58] focus-within:shadow-[0_0_0_4px_rgba(15,157,88,0.1)] transition-all duration-300 flex items-center px-5">
                        <div className="relative flex-grow h-full">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="auth-input peer w-full h-full pt-6 bg-transparent outline-none font-bold text-sm text-stone-900 placeholder-transparent"
                            required
                          />
                          <label className="absolute left-0 top-2 text-[9px] font-black text-stone-400 uppercase tracking-[0.15em] transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-5 peer-placeholder-shown:font-semibold peer-focus:top-2 peer-focus:text-[9px] peer-focus:text-[#0F9D58] pointer-events-none">
                            Password
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-stone-400 hover:text-stone-605 transition-colors shrink-0 ml-2"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* SIGNUP / OPTIONAL CONTROLS (SLIDE DOWN FROM BOTTOM) */}
                  <AnimatePresence initial={false}>
                    {mode === 'signup' ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden flex flex-col gap-4"
                      >
                        {/* 5. Confirm Password */}
                        <div className="relative h-[64px] rounded-2xl bg-white border border-[#E8ECE5] shadow-[0_4px_20px_rgba(0,0,0,0.02)] focus-within:border-[#0F9D58] focus-within:shadow-[0_0_0_4px_rgba(15,157,88,0.1)] transition-all duration-300 flex items-center px-5">
                          <div className="relative flex-grow h-full">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={e => setConfirmPassword(e.target.value)}
                              className="auth-input peer w-full h-full pt-6 bg-transparent outline-none font-bold text-sm text-stone-900 placeholder-transparent"
                              placeholder="Confirm Password"
                              required={mode === 'signup'}
                            />
                            <label className="absolute left-0 top-2 text-[9px] font-black text-stone-450 uppercase tracking-[0.15em] transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-5 peer-placeholder-shown:font-semibold peer-focus:top-2 peer-focus:text-[9px] peer-focus:text-[#0F9D58] pointer-events-none">
                              Confirm Password
                            </label>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="text-stone-400 hover:text-stone-605 transition-colors shrink-0 ml-2"
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>

                        {/* Terms checkbox */}
                        <div className="flex items-center gap-2.5 px-1 mt-2">
                          <input
                            id="agree-terms"
                            type="checkbox"
                            className="h-4.5 w-4.5 rounded border-stone-300 text-[#0F9D58] focus:ring-emerald-500/15 cursor-pointer shrink-0"
                            checked={agreeTerms}
                            onChange={e => setAgreeTerms(e.target.checked)}
                          />
                          <label htmlFor="agree-terms" className="text-[10px] font-bold text-stone-500 leading-none cursor-pointer select-none">
                            I agree to Namma Ooru Foods's <Link href="/terms" className="font-black text-[#0F9D58] underline underline-offset-2">terms & conditions</Link> and <Link href="/privacy" className="font-black text-[#0F9D58] underline underline-offset-2">privacy notice</Link>.
                          </label>
                        </div>
                      </motion.div>
                    ) : (
                      // LOGIN-ONLY CONTROLS (forgot password & inline switch)
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between px-1 mt-0.5"
                      >
                        {/* OTP Switch Link */}
                        <button
                          type="button"
                          onClick={() => {
                            setLoginMethod(loginMethod === 'password' ? 'otp' : 'password');
                            setError(null);
                          }}
                          className="text-[11px] font-black text-[#0F9D58] hover:text-[#0B7D46] uppercase tracking-widest transition-colors"
                        >
                          {loginMethod === 'password' ? 'Login with OTP' : 'Login with Password'}
                        </button>

                        {/* Forgot password */}
                        {loginMethod === 'password' && (
                          <button
                            type="button"
                            onClick={() => { setMode('forgot-password'); setError(null); }}
                            className="text-[11px] font-black text-stone-400 hover:text-stone-600 uppercase tracking-widest transition-colors"
                          >
                            Forgot Password?
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* RENDER DYNAMIC CORE CTA BUTTON */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-[60px] bg-[#0F9D58] hover:bg-[#0B7D46] disabled:bg-stone-200 disabled:text-stone-400 rounded-2xl text-white font-semibold text-[13px] tracking-[0.15em] uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer mt-1"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        PROCESSING REQUEST...
                      </span>
                    ) : mode === 'signup' ? (
                      'Register & Verify OTP'
                    ) : loginMethod === 'otp' ? (
                      'Login With OTP'
                    ) : (
                      'Login'
                    )}
                  </button>
                </form>

                {/* Switch flow layout */}
                <div className="text-center mt-4">
                  <p className="text-sm font-semibold text-stone-500">
                    {mode === 'login' ? (
                      <>
                        New here?{' '}
                        <button
                          type="button"
                          onClick={() => { setMode('signup'); setError(null); }}
                          className="font-black text-[#0F9D58] hover:text-[#0B7D46] transition-colors hover:underline"
                        >
                          Create Account
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => { setMode('login'); setError(null); }}
                          className="font-black text-[#0F9D58] hover:text-[#0B7D46] transition-colors hover:underline"
                        >
                          Login
                        </button>
                      </>
                    )}
                  </p>
                </div>
              </motion.div>
            ) : (
              // ========================================================
              // FORGOT PASSWORD FLOW
              // ========================================================
              <motion.div
                key="forgot-password-flow"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-6"
              >
                <button
                  onClick={() => { setMode('login'); setForgotStep(1); setError(null); }}
                  className="flex items-center gap-2 text-xs font-black text-stone-400 hover:text-stone-900 uppercase tracking-widest self-start transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back to Login
                </button>

                <div className="text-center">
                  <h2 className="text-[32px] font-black text-stone-900 tracking-tighter leading-none mb-3 uppercase">Recover Account</h2>
                  <p className="text-sm font-bold text-stone-400">
                    {forgotStep === 1
                      ? 'Specify your registered mobile number below to receive an OTP.'
                      : 'Create your new strong password below.'}
                  </p>
                </div>

                {error && (
                  <div className="w-full p-4.5 bg-red-50/70 border border-red-100 rounded-2xl flex items-start gap-3 animate-shake">
                    <LockKeyhole className="text-red-500 h-4 w-4 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-red-600 leading-relaxed">{error}</p>
                  </div>
                )}

                {forgotStep === 1 ? (
                  <form onSubmit={handleForgotSubmit} className="flex flex-col gap-5">
                    <div className="relative h-[64px] rounded-2xl bg-white border border-[#E8ECE5] shadow-[0_4px_20px_rgba(0,0,0,0.02)] focus-within:border-[#0F9D58] focus-within:shadow-[0_0_0_4px_rgba(15,157,88,0.1)] transition-all duration-300 flex items-center px-5">
                      <div className="relative flex-grow h-full">
                        <input
                          type="tel"
                          placeholder="Mobile Number"
                          className="auth-input peer w-full h-full pt-6 bg-transparent outline-none font-bold text-sm text-stone-900 placeholder-transparent"
                          value={forgotEmail}
                          onChange={e => setForgotEmail(e.target.value.replace(/\D/g, ''))}
                          required
                        />
                        <label className="absolute left-0 top-2 text-[9px] font-black text-stone-450 uppercase tracking-[0.15em] transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-5 peer-placeholder-shown:font-semibold peer-focus:top-2 peer-focus:text-[9px] peer-focus:text-[#0F9D58] pointer-events-none">
                          Mobile Number
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-[60px] bg-[#0F9D58] hover:bg-[#0B7D46] disabled:bg-stone-200 disabled:text-stone-400 rounded-2xl text-white font-semibold text-[13px] tracking-[0.15em] uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer mt-2"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          DISPATCHING OTP...
                        </span>
                      ) : (
                        'Request Verification OTP'
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleExecutePasswordReset} className="flex flex-col gap-5">

                    {/* New Password */}
                    <div className="relative h-[64px] rounded-2xl bg-white border border-[#E8ECE5] shadow-[0_4px_20px_rgba(0,0,0,0.02)] focus-within:border-[#0F9D58] focus-within:shadow-[0_0_0_4px_rgba(15,157,88,0.1)] transition-all duration-300 flex items-center px-5">
                      <div className="relative flex-grow h-full">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="auth-input peer w-full h-full pt-6 bg-transparent outline-none font-bold text-sm text-stone-900 placeholder-transparent"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                        />
                        <label className="absolute left-0 top-2 text-[9px] font-black text-stone-455 uppercase tracking-[0.15em] transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-5 peer-placeholder-shown:font-semibold peer-focus:top-2 peer-focus:text-[9px] peer-focus:text-[#0F9D58] pointer-events-none">
                          New Password
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-stone-400 hover:text-stone-605 transition-colors shrink-0 ml-2"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Confirm New Password */}
                    <div className="relative h-[64px] rounded-2xl bg-white border border-[#E8ECE5] shadow-[0_4px_20px_rgba(0,0,0,0.02)] focus-within:border-[#0F9D58] focus-within:shadow-[0_0_0_4px_rgba(15,157,88,0.1)] transition-all duration-300 flex items-center px-5">
                      <div className="relative flex-grow h-full">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="auth-input peer w-full h-full pt-6 bg-transparent outline-none font-bold text-sm text-stone-900 placeholder-transparent"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          required
                        />
                        <label className="absolute left-0 top-2 text-[9px] font-black text-stone-455 uppercase tracking-[0.15em] transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-5 peer-placeholder-shown:font-semibold peer-focus:top-2 peer-focus:text-[9px] peer-focus:text-[#0F9D58] pointer-events-none">
                          Confirm New Password
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-stone-400 hover:text-stone-605 transition-colors shrink-0 ml-2"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-[60px] bg-[#0F9D58] hover:bg-[#0B7D46] disabled:bg-stone-200 disabled:text-stone-400 rounded-2xl text-white font-semibold text-[13px] tracking-[0.15em] uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer mt-2"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          CHANGING PASSWORD...
                        </span>
                      ) : (
                        'Change Password'
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* Visual global transitions injected style rules */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        .animation-delay-500 {
          animation-delay: 500ms;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }

        @keyframes scaleUp {
          from {
            transform: scale(0.85);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-up {
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}
