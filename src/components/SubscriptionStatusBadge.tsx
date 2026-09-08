import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { AuthUser } from '../types';
import {
  getSubscriptionDisplayState,
  calculateTrialRemaining,
  SubscriptionDisplayBadgeState,
} from '../services/authService';

interface SubscriptionStatusBadgeProps {
  user?: AuthUser | null;
  statusOverride?: SubscriptionDisplayBadgeState;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

export const SubscriptionStatusBadge: React.FC<SubscriptionStatusBadgeProps> = ({
  user,
  statusOverride,
  size = 'md',
  showDetails = true,
  className = '',
}) => {
  const displayState: SubscriptionDisplayBadgeState =
    statusOverride || getSubscriptionDisplayState(user);
  const trialInfo = calculateTrialRemaining(user);

  // Derive human-readable details
  let planLabel = 'Free 7-Day Trial';
  if (user?.subscriptionPlan === 'yearly' || user?.plan_id === 'P-7BJ4281497082825YNKOQJBI') {
    planLabel = 'Yearly Pro ($199.99/yr)';
  } else if (user?.subscriptionPlan === 'monthly' || user?.plan_id === 'P-3NN56131X8898472BNKOQFNQ') {
    planLabel = 'Monthly Pro ($19.99/mo)';
  }

  // Size variations
  const sizeClasses = {
    sm: 'text-[11px] py-1 px-2.5 gap-1.5',
    md: 'text-xs py-1.5 px-3.5 gap-2',
    lg: 'text-sm py-2 px-4 gap-2.5',
  }[size];

  if (displayState === 'Active') {
    return (
      <div
        id="subscription-status-badge-active"
        className={`inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-50/90 text-emerald-900 shadow-xs font-sans transition-all ${sizeClasses} ${className}`}
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
        </span>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span className="font-extrabold tracking-wide uppercase font-mono text-[11px]">
          Active
        </span>
        {showDetails && (
          <span className="text-emerald-700/80 font-medium pl-1 border-l border-emerald-300 text-[11px] hidden sm:inline">
            {planLabel} • Uncapped Access
          </span>
        )}
      </div>
    );
  }

  if (displayState === 'Trialing') {
    return (
      <div
        id="subscription-status-badge-trialing"
        className={`inline-flex items-center rounded-full border border-amber-400/40 bg-amber-50/90 text-amber-950 shadow-xs font-sans transition-all ${sizeClasses} ${className}`}
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
        </span>
        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span className="font-extrabold tracking-wide uppercase font-mono text-[11px]">
          Trialing
        </span>
        {showDetails && (
          <span className="text-amber-800 font-medium pl-1 border-l border-amber-300 text-[11px] hidden sm:inline">
            {trialInfo.days > 0
              ? `${trialInfo.days}d ${trialInfo.hours}h remaining`
              : `${trialInfo.hours}h left`}
          </span>
        )}
      </div>
    );
  }

  // Expired / Cancelled / Suspended
  return (
    <div
      id="subscription-status-badge-expired"
      className={`inline-flex items-center rounded-full border border-rose-400/40 bg-rose-50/90 text-rose-950 shadow-xs font-sans transition-all ${sizeClasses} ${className}`}
    >
      <span className="inline-block h-2 w-2 rounded-full bg-rose-600 shrink-0" />
      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
      <span className="font-extrabold tracking-wide uppercase font-mono text-[11px]">
        Expired
      </span>
      {showDetails && (
        <span className="text-rose-800 font-medium pl-1 border-l border-rose-300 text-[11px] hidden sm:inline">
          Action Required • Vision Resticted
        </span>
      )}
    </div>
  );
};
