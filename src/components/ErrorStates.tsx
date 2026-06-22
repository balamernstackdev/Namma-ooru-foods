import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { WifiOff, AlertTriangle, Clock, ServerCrash, SearchX, ArrowLeft } from 'lucide-react';

interface ErrorStateProps {
  type: 'not-found' | 'connection-lost' | 'session-expired' | 'server-error' | 'unauthorized';
  title?: string;
  description?: string;
  onRetry?: () => void;
  actionText?: string;
  actionLink?: string;
}

const config = {
  'not-found': {
    icon: SearchX,
    color: 'emerald',
    title: 'Page Not Found',
    description: 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
    actionText: 'Return to Home',
    actionLink: '/'
  },
  'connection-lost': {
    icon: WifiOff,
    color: 'amber',
    title: 'Connection Lost',
    description: 'We are having trouble connecting to our servers. Please check your internet connection and try again.',
    actionText: 'Retry Connection',
  },
  'session-expired': {
    icon: Clock,
    color: 'blue',
    title: 'Session Expired',
    description: 'Your session has expired due to inactivity. Please log in again to continue.',
    actionText: 'Login Again',
    actionLink: '/account'
  },
  'server-error': {
    icon: ServerCrash,
    color: 'red',
    title: 'Server Error',
    description: 'Oops! Something went wrong on our end. We are working to fix it. Please try again later.',
    actionText: 'Go Back',
    actionLink: '/'
  },
  'unauthorized': {
    icon: AlertTriangle,
    color: 'orange',
    title: 'Access Denied',
    description: 'You do not have permission to view this page. Please ensure you are logged in with the correct account.',
    actionText: 'Go to Login',
    actionLink: '/account'
  }
};

const getColorClasses = (color: string) => {
  switch (color) {
    case 'emerald': return 'text-emerald-600 bg-emerald-50 border-emerald-100 from-emerald-600 to-green-600 shadow-emerald-600/20';
    case 'amber': return 'text-amber-600 bg-amber-50 border-amber-100 from-amber-500 to-orange-500 shadow-amber-500/20';
    case 'blue': return 'text-blue-600 bg-blue-50 border-blue-100 from-blue-600 to-indigo-600 shadow-blue-600/20';
    case 'red': return 'text-red-600 bg-red-50 border-red-100 from-red-600 to-rose-600 shadow-red-600/20';
    case 'orange': return 'text-orange-600 bg-orange-50 border-orange-100 from-orange-500 to-red-500 shadow-orange-500/20';
    default: return 'text-slate-600 bg-slate-50 border-slate-100 from-slate-600 to-slate-700 shadow-slate-600/20';
  }
};

export const ErrorState = ({ type, title, description, onRetry, actionText, actionLink }: ErrorStateProps) => {
  const currentConfig = config[type];
  const Icon = currentConfig.icon;
  const colors = getColorClasses(currentConfig.color);
  
  const displayTitle = title || currentConfig.title;
  const displayDesc = description || currentConfig.description;
  const displayActionText = actionText || currentConfig.actionText;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 bg-[#f8f8f5]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2rem] p-10 text-center shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden"
      >
        <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${colors.split(' ')[4]} ${colors.split(' ')[5]}`} />
        
        <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center border ${colors.split(' ').slice(0, 3).join(' ')} relative`}>
           <div className={`absolute inset-0 rounded-full border-2 border-white opacity-50 animate-[ping_3s_ease-in-out_infinite]`} />
           <Icon className="h-10 w-10" />
        </div>

        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">{displayTitle}</h2>
        <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">{displayDesc}</p>

        <div className="flex flex-col gap-3">
          {onRetry ? (
            <button 
              onClick={onRetry}
              className={`w-full py-4 px-6 rounded-2xl text-white font-bold text-[15px] bg-gradient-to-r ${colors.split(' ')[4]} ${colors.split(' ')[5]} shadow-lg ${colors.split(' ')[6]} hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2`}
            >
              <Icon className="h-4 w-4" /> {displayActionText}
            </button>
          ) : actionLink ? (
            <Link 
              href={actionLink}
              className={`w-full py-4 px-6 rounded-2xl text-white font-bold text-[15px] bg-gradient-to-r ${colors.split(' ')[4]} ${colors.split(' ')[5]} shadow-lg ${colors.split(' ')[6]} hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2`}
            >
              {type === 'not-found' ? <ArrowLeft className="h-4 w-4" /> : null}
              {displayActionText}
            </Link>
          ) : null}
          
          {(onRetry || type !== 'not-found') && (
            <Link 
              href="/"
              className="w-full py-4 px-6 rounded-2xl text-slate-700 font-bold text-[15px] bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all"
            >
              Return to Homepage
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ErrorState;
