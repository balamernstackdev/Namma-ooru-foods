import React from 'react';
import { Eye, Pencil, Ban, Power, ShieldAlert, Check, Trash2, ShieldCheck, Play } from 'lucide-react';

interface ActionGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function ActionGroup({ children, className = '' }: ActionGroupProps) {
  return (
    <div className={`flex items-center justify-end gap-3 ${className}`}>
      {children}
    </div>
  );
}

// Premium Tooltip Button Component
interface PremiumActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ElementType;
  tooltip: string;
  variant: 'view' | 'edit' | 'suspend' | 'delete' | 'approve' | 'action' | 'restore';
}

export function PremiumActionButton({ icon: Icon, tooltip, variant, className = '', ...props }: PremiumActionButtonProps) {
  const variantStyles = {
    view: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:shadow-indigo-500/25 border-indigo-100',
    edit: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white hover:shadow-emerald-500/25 border-emerald-100',
    suspend: 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:shadow-red-500/25 border-red-100',
    delete: 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white hover:shadow-rose-500/25 border-rose-100',
    approve: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white hover:shadow-emerald-500/25 border-emerald-100',
    action: 'bg-slate-50 text-slate-700 hover:bg-slate-800 hover:text-white hover:shadow-slate-500/25 border-slate-200',
    restore: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white hover:shadow-emerald-500/25 border-emerald-100',
  };

  return (
    <div className="group/btn relative flex items-center justify-center">
      <button
        type="button"
        className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-200 border shadow-sm hover:scale-105 active:scale-95 ${variantStyles[variant]} ${className}`}
        {...props}
      >
        <Icon size={16} strokeWidth={2.5} />
      </button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
        <div className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-xl">
          {tooltip}
        </div>
        <div className="w-2 h-2 bg-slate-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
      </div>
    </div>
  );
}


// Pre-configured Premium Buttons
export const ViewButton = (props: Omit<PremiumActionButtonProps, 'icon' | 'tooltip' | 'variant'> & { tooltip?: string }) => (
  <PremiumActionButton icon={Eye} tooltip={props.tooltip || "View Details"} variant="view" {...props} />
);

export const EditButton = (props: Omit<PremiumActionButtonProps, 'icon' | 'tooltip' | 'variant'> & { tooltip?: string }) => (
  <PremiumActionButton icon={Pencil} tooltip={props.tooltip || "Edit Record"} variant="edit" {...props} />
);

export const SuspendButton = ({ isSuspended, tooltip, ...props }: Omit<PremiumActionButtonProps, 'icon' | 'tooltip' | 'variant'> & { tooltip?: string, isSuspended?: boolean }) => (
  <PremiumActionButton 
    icon={isSuspended ? Power : Ban} 
    tooltip={tooltip || (isSuspended ? "Restore Entity" : "Suspend Entity")} 
    variant={isSuspended ? "restore" : "suspend"} 
    {...props} 
  />
);

export const DeleteButton = (props: Omit<PremiumActionButtonProps, 'icon' | 'tooltip' | 'variant'> & { tooltip?: string }) => (
  <PremiumActionButton icon={Trash2} tooltip={props.tooltip || "Delete Record"} variant="delete" {...props} />
);

export const ApproveButton = (props: Omit<PremiumActionButtonProps, 'icon' | 'tooltip' | 'variant'> & { tooltip?: string }) => (
  <PremiumActionButton icon={ShieldCheck} tooltip={props.tooltip || "Approve"} variant="approve" {...props} />
);

export const ActionPanelButton = (props: Omit<PremiumActionButtonProps, 'icon' | 'tooltip' | 'variant'> & { tooltip?: string }) => (
  <PremiumActionButton icon={ShieldAlert} tooltip={props.tooltip || "Action Panel"} variant="action" {...props} />
);

export const EvaluateButton = (props: Omit<PremiumActionButtonProps, 'icon' | 'tooltip' | 'variant'> & { tooltip?: string }) => (
  <PremiumActionButton icon={Check} tooltip={props.tooltip || "Evaluate"} variant="approve" {...props} />
);

export const UnlinkButton = (props: Omit<PremiumActionButtonProps, 'icon' | 'tooltip' | 'variant'> & { tooltip?: string }) => (
  <PremiumActionButton icon={Trash2} tooltip={props.tooltip || "Unlink"} variant="delete" {...props} />
);
