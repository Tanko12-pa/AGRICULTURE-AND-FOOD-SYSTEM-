import React from 'react';
import {
  Check,
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowRight,
  Zap,
  Calendar,
  CreditCard,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Award,
} from 'lucide-react';
import { AuthUser } from '../types';
import { PayPalSubscriptionButton } from './PayPalSubscriptionButton';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';
import {
  PAYPAL_MONTHLY_PLAN_ID,
  PAYPAL_YEARLY_PLAN_ID,
} from '../services/authService';

interface UnifiedSubscriptionCheckoutProps {
  selectedCycle: 'monthly' | 'yearly';
  onCycleChange: (cycle: 'monthly' | 'yearly') => void;
  currentUser: AuthUser | null;
  guestEmail: string;
  guestName: string;
  onGuestEmailChange: (email: string) => void;
  onGuestNameChange: (name: string) => void;
  onDirectActivate: (plan: 'monthly' | 'yearly') => void;
  onPayPalSuccess: (details: any) => void;
  isLoading: boolean;
  paypalClientId: string;
  onNavigateToAuth: (mode: 'signin' | 'signup') => void;
}

export const UnifiedSubscriptionCheckout: React.FC<UnifiedSubscriptionCheckoutProps> = ({
  selectedCycle,
  onCycleChange,
  currentUser,
  guestEmail,
  guestName,
  onGuestEmailChange,
  onGuestNameChange,
  onDirectActivate,
  onPayPalSuccess,
  isLoading,
  paypalClientId,
  onNavigateToAuth,
}) => {
  const isYearly = selectedCycle === 'yearly';
  const price = isYearly ? 199.99 : 19.99;
  const planId = isYearly ? PAYPAL_YEARLY_PLAN_ID : PAYPAL_MONTHLY_PLAN_ID;
  const cycleLabel = isYearly ? 'Yearly' : 'Monthly';
  const effectiveMonthly = isYearly ? (199.99 / 12).toFixed(2) : '19.99';

  // Dynamic next renewal date calculation without page reload
  const renewalDate = new Date();
  if (isYearly) {
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  } else {
    renewalDate.setDate(renewalDate.getDate() + 30);
  }
  const formattedRenewal = renewalDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const effectiveEmail = currentUser?.email || guestEmail.trim() || 'demo@agrivision.ai';

  return (
    <div
      id="unified-subscription-checkout"
      className="p-6 md:p-8 rounded-3xl bg-white border border-gray-200/90 shadow-lg space-y-6 relative overflow-hidden"
    >
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1B4332] via-emerald-500 to-[#1B4332]" />

      {/* Header & Status Transparency Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#1B4332]/10 text-[#1B4332]">
              <CreditCard className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 font-display">
                Unified Subscription Checkout
              </h3>
              <p className="text-xs text-gray-500">
                Seamlessly activate or renew your Agri-Vision Pro subscription.
              </p>
            </div>
          </div>
        </div>

        {/* Current status transparency indicator */}
        <div className="flex flex-col items-start sm:items-end gap-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
            Account Status
          </span>
          <SubscriptionStatusBadge user={currentUser} size="sm" showDetails={true} />
        </div>
      </div>

      {/* DYNAMIC BILLING CYCLE SWITCHER (Zero Page Reload) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-700 font-mono uppercase tracking-wider">
            Step 1: Choose Billing Cycle
          </label>
          <span className="text-[11px] text-emerald-700 font-medium">
            Dynamic switch — Instant pricing update
          </span>
        </div>

        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#F4F6F5] border border-gray-200/80 gap-1.5">
          {/* Monthly Button */}
          <button
            type="button"
            id="cycle-switch-monthly"
            onClick={() => onCycleChange('monthly')}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
              !isYearly
                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black">$19.99</span>
              <span className="text-[11px] font-normal text-gray-500">/ mo</span>
            </div>
            <span className="text-[11px] font-medium text-gray-600">Monthly Billing</span>
          </button>

          {/* Yearly Button (With Savings Badge) */}
          <button
            type="button"
            id="cycle-switch-yearly"
            onClick={() => onCycleChange('yearly')}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer relative ${
              isYearly
                ? 'bg-[#1B4332] text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black">$199.99</span>
              <span className={`text-[11px] font-normal ${isYearly ? 'text-emerald-200' : 'text-gray-500'}`}>
                / yr
              </span>
              <span className="px-1.5 py-0.2 rounded bg-amber-400 text-gray-950 text-[10px] font-black tracking-tight">
                Save 16%
              </span>
            </div>
            <span className={`text-[11px] font-medium ${isYearly ? 'text-emerald-100' : 'text-gray-600'}`}>
              Yearly (~${effectiveMonthly}/mo)
            </span>
          </button>
        </div>
      </div>

      {/* SELECTED PLAN SUMMARY CARD & BREAKDOWN */}
      <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-[#F8FAF9] to-emerald-50/40 border border-emerald-200/70 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-200/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-[#1B4332] uppercase tracking-wider font-mono">
                {cycleLabel} Pro Membership
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#1B4332] text-white text-[10px] font-bold">
                {isYearly ? 'Best Value (Annual)' : 'Month-to-Month'}
              </span>
            </div>
            <div className="text-[11px] text-gray-500 font-mono mt-0.5">
              PayPal Plan ID: <span className="font-bold text-gray-700">{planId}</span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-[11px] text-gray-500">Total Due Today:</div>
            <div className="text-2xl font-black text-[#1B4332] font-mono">
              ${price.toFixed(2)}{' '}
              <span className="text-xs font-normal text-gray-500">USD</span>
            </div>
            {isYearly && (
              <div className="text-[11px] text-emerald-700 font-bold">
                You save $39.89 compared to monthly!
              </div>
            )}
          </div>
        </div>

        {/* Feature inclusions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Uncapped Gemini 3.8 Flash Vision Diagnostics</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>YOLOv8 Edge Pest & Disease Bounding Boxes</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Autonomous Drone Flight & Farm Geo-Mapping</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Next Renewal Date: <strong className="text-gray-900">{formattedRenewal}</strong></span>
          </div>
        </div>
      </div>

      {/* SUBSCRIBER DETAILS (Authenticated vs Guest) */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-700 font-mono uppercase tracking-wider block">
          Step 2: Subscribing Account Information
        </label>

        {currentUser ? (
          <div className="p-3.5 rounded-xl bg-white border border-gray-200 text-xs flex items-center justify-between flex-wrap gap-2 shadow-xs">
            <div>
              <span className="text-gray-400 block text-[10px]">Active User:</span>
              <span className="font-bold text-gray-900">
                {currentUser.fullName} ({currentUser.email})
              </span>
            </div>
            <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium">
              Receipts & Subscription linked to this account
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#F8FAF9] border border-gray-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant Checkout Account (Auto-Provisioned)</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  onGuestEmailChange('demo@agrivision.ai');
                  onGuestNameChange('Dr. Julian Vance');
                }}
                className="text-[11px] font-mono text-[#1B4332] font-bold hover:underline cursor-pointer"
              >
                Prefill Demo Credentials
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  Email Address (for login & invoice delivery)
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => onGuestEmailChange(e.target.value)}
                  placeholder="e.g. grower@agrifarm.com"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-xs text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#1B4332] focus:border-[#1B4332] outline-hidden shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  Full Name (optional)
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => onGuestNameChange(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-xs text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#1B4332] focus:border-[#1B4332] outline-hidden shadow-2xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-gray-500 border-t border-gray-100">
              <span>Already registered?</span>
              <button
                type="button"
                onClick={() => onNavigateToAuth('signin')}
                className="text-[#1B4332] font-bold hover:underline cursor-pointer"
              >
                Sign In to existing account
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STEP 3: PAYPAL SUBSCRIPTION & INSTANT ACTIVATION */}
      <div className="space-y-4 pt-2">
        <label className="text-xs font-bold text-gray-700 font-mono uppercase tracking-wider block">
          Step 3: Complete Payment via PayPal or 1-Click Activate
        </label>

        {/* Dynamic PayPal Button */}
        <div className="max-w-md mx-auto">
          <PayPalSubscriptionButton
            key={`paypal-btn-${selectedCycle}`}
            plan={selectedCycle}
            amount={price}
            clientId={paypalClientId || 'sb'}
            userEmail={effectiveEmail}
            onSelectPlanChange={(newPlan) => onCycleChange(newPlan)}
            onSuccess={onPayPalSuccess}
            onError={(err) => console.warn('PayPal checkout note:', err)}
          />
        </div>

        {/* Direct 1-Click Instant Activation Alternative */}
        <div className="max-w-md mx-auto pt-3 border-t border-gray-100 space-y-2 text-center">
          <button
            type="button"
            id="direct-activate-unified-btn"
            onClick={() => onDirectActivate(selectedCycle)}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-[#1B4332] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
            ) : (
              <Zap className="w-4 h-4 text-amber-300" />
            )}
            <span>
              1-Click Instant Activate ({cycleLabel} — ${price.toFixed(2)})
            </span>
          </button>
          <p className="text-[10px] text-gray-400 font-mono">
            Guaranteed immediate access • Bypasses popup blockers and cookie restrictions
          </p>
        </div>
      </div>

      {/* Trust & Guarantee Badges Footer */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-6 text-[11px] text-gray-500 flex-wrap">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>256-Bit SSL Encrypted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <RefreshCw className="w-4 h-4 text-blue-600" />
          <span>Cancel Anytime via PayPal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-600" />
          <span>30-Day Satisfaction Guarantee</span>
        </div>
      </div>
    </div>
  );
};
