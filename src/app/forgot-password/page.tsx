'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, ShieldCheck, KeyRound, Timer, ArrowLeft, ShieldAlert } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify, 3: New Pass
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const [resendTimer, setResendTimer] = useState(0);

  React.useEffect(() => {
    let interval: any;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const fetchAPI = async (endpoint: string, body: object) => {
     const res = await fetch(`${API_URL}/api/auth${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
     });
     const data = await res.json();
     if (!res.ok) throw new Error(data.error || 'Failed to process sequence.');
     return data;
  };

  const handleRequest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await fetchAPI('/forgot-password', { email });
      toast.success('Restore configuration dispatched successfully!');
      setResendTimer(30);
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || 'Identity not recognized.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (resendTimer > 0 || loading) return;
    handleRequest();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchAPI('/verify-reset-otp', { email, otp });
      toast.success('Authentication valid. Authorization granted.');
      setStep(3);
    } catch (err: any) {
      toast.error(err.message || 'Validation sequence failure.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('Vector mismatch! Key pair must match.');
    }
    setLoading(true);
    try {
      await fetchAPI('/reset-password', { email, otp, newPassword });
      toast.success('Security credentials overwitten successfully!');
      setTimeout(() => router.push('/account'), 2000);
    } catch (err: any) {
      toast.error(err.message || 'Failed to finalize update.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-96px)] bg-slate-50 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Decorative Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-100/50 rounded-full blur-3xl -z-10 translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-md">
        <Link href="/account" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-[var(--admin-sidebar)] transition-all mb-8 group">
           <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform"/> Return to Hub
        </Link>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden">
          
          {step === 1 && (
             <div className="animate-in zoom-in-95 duration-300">
                <div className="mb-8 flex flex-col items-center text-center">
                   <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 shadow-inner">
                      <KeyRound size={24} strokeWidth={2.5} />
                   </div>
                   <h1 className="text-3xl font-black text-[var(--admin-sidebar)] tracking-tighter leading-none">Restoration</h1>
                   <p className="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-widest">Target Identity Required</p>
                </div>
                <form onSubmit={handleRequest} className="space-y-6">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--admin-sidebar)] ml-2">Auth Identity</label>
                      <input 
                        type="email"
                        required
                        placeholder="identity@nammaoru.com"
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                        className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold placeholder:text-slate-300 text-[var(--admin-sidebar)] focus:border-amber-400 focus:bg-white transition-all shadow-sm outline-none"
                      />
                   </div>
                   <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full h-14 bg-[var(--admin-sidebar)] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 shadow-premium hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70"
                   >
                      {loading ? 'INITIATING...' : 'GENERATE CIPHER'} <ArrowRight size={16} />
                   </button>
                </form>
             </div>
          )}

          {step === 2 && (
             <div className="animate-in zoom-in-95 duration-300">
                <div className="mb-8 flex flex-col items-center text-center">
                   <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 shadow-inner">
                      <ShieldCheck size={24} strokeWidth={2.5} />
                   </div>
                   <h1 className="text-3xl font-black text-[var(--admin-sidebar)] tracking-tighter leading-none">Verification</h1>
                   <p className="text-[11px] font-bold text-slate-400 mt-3">Inserted unique sequence cached for <span className="text-emerald-600 font-black">{email}</span></p>
                </div>
                <form onSubmit={handleVerify} className="space-y-6">
                   <input 
                      type="text"
                      required
                      maxLength={6}
                      placeholder="••••••"
                      value={otp}
                      onChange={(e)=>setOtp(e.target.value.replace(/\D/g,''))}
                      className="w-full h-20 text-center bg-slate-50 border-2 border-emerald-100 rounded-2xl text-4xl font-black tracking-[0.4em] text-[var(--admin-sidebar)] placeholder-slate-200 focus:border-emerald-500 focus:bg-white transition-all shadow-inner outline-none"
                   />
                   <div className="flex flex-col items-center justify-center gap-3">
                     <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <Timer size={12} /> {resendTimer > 0 ? `Wait ${resendTimer}s` : 'Idle Ready'}
                     </div>
                     {resendTimer === 0 && (
                        <button 
                          type="button"
                          onClick={handleResend}
                          className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-all border-b-2 border-emerald-600/20 hover:border-emerald-600"
                        >
                          Request Re-dispatch
                        </button>
                     )}
                   </div>
                   <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full h-14 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-2 shadow-xl hover:bg-emerald-700 transition-all disabled:opacity-70 active:scale-95"
                   >
                      {loading ? 'VERIFYING...' : 'AUTHORIZE AGENT'}
                   </button>
                </form>
             </div>
          )}

          {step === 3 && (
             <div className="animate-in zoom-in-95 duration-300">
                <div className="mb-8 flex flex-col items-center text-center">
                   <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-slate-200">
                      <Lock size={24} />
                   </div>
                   <h1 className="text-3xl font-black text-[var(--admin-sidebar)] tracking-tighter leading-none">Override</h1>
                   <p className="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-widest">Establish Critical Configuration</p>
                </div>
                <form onSubmit={handleReset} className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--admin-sidebar)] ml-2">New Protocol</label>
                      <input 
                        type="password"
                        required
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e)=>setNewPassword(e.target.value)}
                        className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-[var(--admin-sidebar)] placeholder-slate-300 tracking-[0.3em] focus:border-slate-900 focus:bg-white transition-all outline-none shadow-sm"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--admin-sidebar)] ml-2">Confirm Vector</label>
                      <input 
                        type="password"
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e)=>setConfirmPassword(e.target.value)}
                        className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm font-bold text-[var(--admin-sidebar)] placeholder-slate-300 tracking-[0.3em] focus:border-slate-900 focus:bg-white transition-all outline-none shadow-sm"
                      />
                   </div>
                   <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full h-14 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-2 shadow-xl hover:bg-black transition-all disabled:opacity-70 active:scale-95 mt-4"
                   >
                      {loading ? 'COMMITTING...' : 'FINALIZE OVERRIDE'}
                   </button>
                </form>
             </div>
          )}

        </div>
      </div>
    </div>
  );
}
