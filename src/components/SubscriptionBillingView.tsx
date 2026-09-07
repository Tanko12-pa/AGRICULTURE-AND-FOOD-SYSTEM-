import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  User,
  KeyRound,
  LogOut,
  LogIn,
  UserPlus,
  RefreshCw,
  Sparkles,
  Calendar,
  Lock,
  ChevronRight,
  Zap,
  Check,
  FileText,
  AlertCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { AuthUser } from '../types';
import {
  signUpUser,
  signInUser,
  signOutUser,
  changePassword,
  resetPassword,
  fetchBillingConfig,
  capturePayPalSubscription,
  cancelSubscription,
  simulateTrialAction,
  calculateTrialRemaining,
  fetchCurrentUser,
  BillingConfig,
} from '../services/authService';
import { PayPalSubscriptionButton } from './PayPalSubscriptionButton';
import { AdminSubscriptionAnalyticsView } from './AdminSubscriptionAnalyticsView';

interface SubscriptionBillingViewProps {
  currentUser: AuthUser | null;
  onUserChange: (user: AuthUser | null) => void;
  onNavigateTab: (tab: any) => void;
}

export const SubscriptionBillingView: React.FC<SubscriptionBillingViewProps> = ({
  currentUser,
  onUserChange,
  onNavigateTab,
}) => {
  // Billing Config & Plans
  const [billingConfig, setBillingConfig] = useState<BillingConfig | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  // Auth sub-tabs: 'signin' | 'signup' | 'reset-password'
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'reset-password'>('signin');

  // Sign up fields
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

  // Sign in fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Password change fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Reset password fields
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');

  // Status & loading indicators
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Active view section tab: 'plans' | 'account' | 'history' | 'admin'
  const [activeSection, setActiveSection] = useState<'plans' | 'account' | 'history' | 'admin'>('plans');

  // Load billing config on mount
  useEffect(() => {
    fetchBillingConfig().then((cfg) => setBillingConfig(cfg));
  }, []);

  const trialInfo = calculateTrialRemaining(currentUser);

  // Clear message after 6 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Quick 1-click Demo Login for effortless testing
  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    const res = await signInUser('demo@agrivision.ai', 'Password123!');
    setIsLoading(false);
    if (res.success && res.user) {
      onUserChange(res.user);
      setStatusMessage({ type: 'success', text: `Signed in as ${res.user.fullName}. You can now complete your subscription.` });
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Failed to sign in demo account.' });
    }
  };

  // Pre-fill demo credentials in sign-in form
  const handleFillDemo = () => {
    setSignInEmail('demo@agrivision.ai');
    setSignInPassword('Password123!');
  };

  // Plan Selection with smooth scroll to PayPal checkout
  const handleSelectPlanAndProceed = (plan: 'monthly' | 'yearly') => {
    setSelectedPlan(plan);
    setTimeout(() => {
      const container = document.getElementById('subscription-container');
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
  };

  // Add click listeners to custom plan selection cards/buttons (.plan-option)
  useEffect(() => {
    const handleOptionClick = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const planVal = target.dataset.plan as 'monthly' | 'yearly' | undefined;
      if (planVal === 'monthly' || planVal === 'yearly') {
        // Remove active style from all, add to clicked
        document.querySelectorAll('.plan-option').forEach(b => b.classList.remove('active'));
        target.classList.add('active');
        setSelectedPlan(planVal);
      }
    };

    const buttons = document.querySelectorAll('.plan-option');
    buttons.forEach(button => {
      button.addEventListener('click', handleOptionClick);
    });

    return () => {
      buttons.forEach(button => {
        button.removeEventListener('click', handleOptionClick);
      });
    };
  }, []);

  // Synchronize DOM classes and radio states whenever selectedPlan updates
  useEffect(() => {
    document.querySelectorAll('.plan-option').forEach(b => {
      const el = b as HTMLElement;
      if (el.dataset.plan === selectedPlan) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
    const radio = document.querySelector(`input[name="plan"][value="${selectedPlan}"]`) as HTMLInputElement | null;
    if (radio) {
      radio.checked = true;
    }
  }, [selectedPlan]);

  // 1. SIGN UP HANDLER
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpPassword !== signUpConfirmPassword) {
      setStatusMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (signUpPassword.length < 6) {
      setStatusMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    const res = await signUpUser(signUpName, signUpEmail, signUpPassword);
    setIsLoading(false);

    if (res.success && res.user) {
      onUserChange(res.user);
      setStatusMessage({
        type: 'success',
        text: 'Account registered successfully! Your 7-day free trial has been activated with full system access.',
      });
      setSignUpPassword('');
      setSignUpConfirmPassword('');
      setActiveSection('plans');
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Sign up failed.' });
    }
  };

  // 2. SIGN IN HANDLER
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);
    const res = await signInUser(signInEmail, signInPassword);
    setIsLoading(false);

    if (res.success && res.user) {
      onUserChange(res.user);
      setStatusMessage({ type: 'success', text: `Welcome back, ${res.user.fullName}!` });
      setSignInPassword('');
      setActiveSection('plans');
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Invalid credentials.' });
    }
  };

  // 3. SIGN OUT HANDLER
  const handleSignOut = async () => {
    setIsLoading(true);
    await signOutUser();
    onUserChange(null);
    setIsLoading(false);
    setStatusMessage({ type: 'info', text: 'You have been securely signed out.' });
    setAuthMode('signin');
  };

  // 4. CHANGE PASSWORD HANDLER
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setStatusMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setStatusMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    setIsLoading(true);
    const res = await changePassword(currentPassword, newPassword);
    setIsLoading(false);

    if (res.success) {
      setStatusMessage({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Failed to update password.' });
    }
  };

  // 5. RESET PASSWORD HANDLER
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await resetPassword(resetEmail, resetNewPassword);
    setIsLoading(false);

    if (res.success) {
      setStatusMessage({ type: 'success', text: 'Password reset successfully. You can now sign in.' });
      setResetEmail('');
      setResetNewPassword('');
      setAuthMode('signin');
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Failed to reset password.' });
    }
  };

  // 6. PAYPAL PAYMENT CAPTURE HANDLER
  const handlePayPalSuccess = async (paymentDetails: any) => {
    const planToCapture: 'monthly' | 'yearly' = paymentDetails?.plan || selectedPlan;
    setIsLoading(true);
    const res = await capturePayPalSubscription(
      planToCapture,
      paymentDetails?.id,
      paymentDetails,
      currentUser?.email
    );
    setIsLoading(false);

    if (res.success && res.user) {
      onUserChange(res.user);
      setStatusMessage({
        type: 'success',
        text: `PayPal Payment Confirmed! Your ${planToCapture === 'yearly' ? 'Yearly ($199.99/yr)' : 'Monthly ($19.99/mo)'} subscription is active with uninterrupted application access.`,
      });
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Failed to activate subscription with payment.' });
    }
  };

  // 7. CANCEL SUBSCRIPTION HANDLER
  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you wish to cancel your subscription? Your access will remain active until the end of your billing cycle.')) {
      return;
    }
    setIsLoading(true);
    const res = await cancelSubscription();
    setIsLoading(false);

    if (res.success && res.user) {
      onUserChange(res.user);
      setStatusMessage({ type: 'info', text: 'Subscription has been cancelled.' });
    }
  };

  // 8. SIMULATE TRIAL STATUS (For testing and reviewer verification)
  const handleSimulate = async (action: 'expire' | 'reset-7-days' | 'set-hours-left' | 'activate-paid', plan?: 'monthly' | 'yearly') => {
    setIsLoading(true);
    const res = await simulateTrialAction(action, { plan });
    setIsLoading(false);
    if (res.success && res.user) {
      onUserChange(res.user);
      setStatusMessage({
        type: 'info',
        text: `Simulator update: Status is now ${res.user.subscriptionStatus} (${res.user.subscriptionPlan}).`,
      });
    }
  };

  const monthlyPrice = billingConfig?.plans.monthly.price || 19.99;
  const yearlyPrice = billingConfig?.plans.yearly.price || 199.99;

  return (
    <div id="subscription-billing-view" className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Alert Notifications */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium flex items-center justify-between shadow-sm transition-all border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : statusMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-gray-400 hover:text-gray-600 font-mono text-xs px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Billing Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200/80 shadow-sm p-6">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1B4332] via-[#2D5A27] to-[#D4A373]" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#1B4332] text-white text-[11px] font-bold tracking-wide">
                AGRI-VISION CLOUD
              </span>
              {currentUser ? (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                    currentUser.subscriptionStatus === 'active'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : currentUser.subscriptionStatus === 'trialing' && !trialInfo.isExpired
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {currentUser.subscriptionStatus === 'active'
                    ? `Active (${currentUser.subscriptionPlan.toUpperCase()})`
                    : currentUser.subscriptionStatus === 'trialing' && !trialInfo.isExpired
                    ? '7-Day Free Trial Active'
                    : 'Subscription Expired'}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-300">
                  Guest / Not Signed In
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight font-display">
              Subscription & Billing <span className="text-[#1B4332]">Portal</span>
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm">
              Manage your 7-day free trial, PayPal subscriptions, payment methods, and account security.
            </p>
          </div>

          {/* Quick User State Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-[#F8FAF9] p-2 rounded-xl border border-gray-200/80">
                <div className="w-8 h-8 rounded-lg bg-[#1B4332] text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left pr-2">
                  <div className="text-xs font-bold text-gray-900 truncate max-w-[140px]">{currentUser.fullName}</div>
                  <div className="text-[10px] text-gray-500 font-mono truncate max-w-[140px]">{currentUser.email}</div>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sign Out of Account"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthMode('signin');
                    setActiveSection('account');
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1B4332] text-white hover:bg-black transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setActiveSection('account');
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 text-[#1B4332] border border-[#1B4332]/30 hover:bg-amber-100 transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up (7-Day Trial)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section Navigation Pills */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-100 flex-wrap">
          <button
            onClick={() => setActiveSection('plans')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSection === 'plans'
                ? 'bg-[#1B4332] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Subscription Plans & PayPal</span>
          </button>

          <button
            onClick={() => setActiveSection('account')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSection === 'account'
                ? 'bg-[#1B4332] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Account & Security {currentUser ? '(Settings)' : '(Sign In/Up)'}</span>
          </button>

          <button
            onClick={() => setActiveSection('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSection === 'history'
                ? 'bg-[#1B4332] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Billing History & Invoices</span>
          </button>

          <button
            id="tab-admin-subscriptions"
            onClick={() => setActiveSection('admin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              activeSection === 'admin'
                ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm ring-1 ring-emerald-500'
                : 'bg-emerald-50/70 text-emerald-900 border-emerald-200 hover:bg-emerald-100/80'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Admin Analytics & Firestore</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-white text-emerald-800 border border-emerald-300">
              ADMIN ONLY
            </span>
          </button>
        </div>
      </div>

      {/* 4. 7-DAY FREE TRIAL STATUS CARD (Prominently displayed) */}
      {currentUser && (
        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  currentUser.subscriptionStatus === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : !trialInfo.isExpired
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500 font-mono">
                  {currentUser.subscriptionStatus === 'active' ? 'Active Paid Plan' : '7-Day Free Trial Status'}
                </div>
                <h3 className="text-base font-extrabold text-gray-900">
                  {currentUser.subscriptionStatus === 'active' ? (
                    <span className="text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Uncapped Access — {currentUser.subscriptionPlan === 'yearly' ? 'Yearly' : 'Monthly'} Subscription
                    </span>
                  ) : !trialInfo.isExpired ? (
                    <span className="text-blue-700 flex items-center gap-1.5">
                      {trialInfo.days} Days, {trialInfo.hours} Hours Remaining
                    </span>
                  ) : (
                    <span className="text-rose-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      Free Trial Expired — Action Required
                    </span>
                  )}
                </h3>
              </div>
            </div>

            {/* Trial Details Badges */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <div className="p-2 rounded-lg bg-[#F8FAF9] border border-gray-200 text-gray-700">
                <span className="text-gray-400 block text-[10px]">Start Date</span>
                <span className="font-bold">{new Date(currentUser.trialStartDate).toLocaleDateString()}</span>
              </div>
              <div className="p-2 rounded-lg bg-[#F8FAF9] border border-gray-200 text-gray-700">
                <span className="text-gray-400 block text-[10px]">Trial Expiration</span>
                <span className="font-bold">{new Date(currentUser.trialEndDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Trial Progress Bar */}
          {currentUser.subscriptionStatus !== 'active' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-gray-500">
                <span>Trial Utilization ({trialInfo.percentUsed}%)</span>
                <span>
                  {trialInfo.isExpired ? (
                    <strong className="text-rose-600">Expired</strong>
                  ) : (
                    <strong className="text-blue-600">{7 - trialInfo.days} of 7 Days Elapsed</strong>
                  )}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    trialInfo.isExpired
                      ? 'bg-rose-500'
                      : trialInfo.percentUsed > 80
                      ? 'bg-amber-500'
                      : 'bg-blue-600'
                  }`}
                  style={{ width: `${trialInfo.percentUsed}%` }}
                />
              </div>
            </div>
          )}

          {/* Test & Reviewer Simulator Bar */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2 text-[11px]">
            <span className="text-gray-400 flex items-center gap-1 font-mono">
              <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
              <span>Tester Quick-Simulate:</span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => handleSimulate('expire')}
                className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-medium cursor-pointer"
                title="Simulate 7-Day Trial Expiration to test paywall lock"
              >
                Simulate Trial Expiry
              </button>
              <button
                onClick={() => handleSimulate('set-hours-left')}
                className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 font-medium cursor-pointer"
                title="Simulate 12 hours left before expiration"
              >
                Set 12h Left
              </button>
              <button
                onClick={() => handleSimulate('reset-7-days')}
                className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 font-medium cursor-pointer"
                title="Reset back to 7 full free trial days"
              >
                Reset 7-Day Trial
              </button>
              <button
                onClick={() => handleSimulate('activate-paid', 'monthly')}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-medium cursor-pointer"
                title="Instantly simulate activating paid monthly subscription ($19.99/mo)"
              >
                Simulate Monthly ($19.99)
              </button>
              <button
                onClick={() => handleSimulate('activate-paid', 'yearly')}
                className="px-2.5 py-1 rounded-lg bg-[#1B4332] text-white hover:bg-black font-medium cursor-pointer"
                title="Instantly simulate activating paid yearly subscription ($199.99/yr)"
              >
                Simulate Yearly ($199.99)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: SUBSCRIPTION PLANS & PAYPAL CHECKOUT */}
      {activeSection === 'plans' && (
        <div className="space-y-6">
          {/* Plan Selector Header & Billing Frequency Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-gray-200/80 shadow-sm">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 font-display">
                Choose Your Subscription Plan
              </h2>
              <p className="text-xs text-gray-500">
                Unlock full computer vision inference, autonomous drone inspections, and export grading.
              </p>
            </div>

            {/* Monthly vs Yearly Toggle */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 border border-gray-200/60 self-start sm:self-auto">
              <button
                type="button"
                data-plan="monthly"
                onClick={() => setSelectedPlan('monthly')}
                className={`plan-option ${selectedPlan === 'monthly' ? 'active bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'} px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                data-plan="yearly"
                onClick={() => setSelectedPlan('yearly')}
                className={`plan-option ${selectedPlan === 'yearly' ? 'active bg-[#1B4332] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'} px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer`}
              >
                <span>Yearly Billing</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-400 text-gray-900 text-[10px] font-black">
                  Save 16%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MONTHLY PLAN CARD */}
            <div
              data-plan="monthly"
              onClick={() => handleSelectPlanAndProceed('monthly')}
              className={`plan-option ${
                selectedPlan === 'monthly'
                  ? 'active border-[#1B4332] ring-2 ring-[#1B4332]/20'
                  : 'border-gray-200/80 hover:border-gray-300'
              } p-6 rounded-2xl bg-white border transition-all shadow-sm relative flex flex-col justify-between cursor-pointer`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 font-mono">
                    Flexible Option
                  </span>
                  {selectedPlan === 'monthly' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#1B4332]/10 text-[#1B4332] text-xs font-bold">
                      Selected Plan
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 font-display">Monthly Subscription</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-gray-900 tracking-tight">${monthlyPrice}</span>
                    <span className="text-xs text-gray-500 font-mono">/ month</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Ideal for seasonal field scouting and flexible monthly operations. Cancel anytime.
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-2.5 text-xs text-gray-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>7-Day Free Trial included on signup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Real-Time NDVI & Canopy Health Vision</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>YOLOv8 Edge Pest & Disease Bounding Boxes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>USDA Produce Quality Inspection & Sizing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Standard Central Server Cloud Sync</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  data-plan="monthly"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPlanAndProceed('monthly');
                  }}
                  className={`plan-option ${
                    selectedPlan === 'monthly'
                      ? 'active bg-[#1B4332] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer`}
                >
                  {selectedPlan === 'monthly' ? 'Proceed with Monthly Plan ($19.99)' : 'Select Monthly Plan'}
                </button>
              </div>
            </div>

            {/* YEARLY PLAN CARD */}
            <div
              data-plan="yearly"
              onClick={() => handleSelectPlanAndProceed('yearly')}
              className={`plan-option ${
                selectedPlan === 'yearly'
                  ? 'active border-[#1B4332] ring-2 ring-[#1B4332]/20 bg-gradient-to-b from-white to-[#F8FAF9]'
                  : 'border-gray-200/80 hover:border-gray-300'
              } p-6 rounded-2xl bg-white border transition-all shadow-sm relative flex flex-col justify-between cursor-pointer`}
            >
              {/* Value Badge */}
              <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-[#1B4332] text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                Most Popular • Save $39.89
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 font-mono">
                    Best Value • 16% Discount
                  </span>
                  {selectedPlan === 'yearly' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#1B4332]/10 text-[#1B4332] text-xs font-bold">
                      Selected Plan
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 font-display">Yearly Subscription</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-gray-900 tracking-tight">${yearlyPrice}</span>
                    <span className="text-xs text-gray-500 font-mono">/ year (approx. $16.66/mo)</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Complete year-round enterprise access with priority pipeline performance and PDF export audits.
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-2.5 text-xs text-gray-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Everything in Monthly Plan</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-gray-900">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Annual discount: Save $39.89 / 16%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Priority GPU Vision Acceleration for Large Fields</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Autonomous Drone Video Stream OCR Diagnostics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Instant Structured PDF Agronomic Audit Reports</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  data-plan="yearly"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPlanAndProceed('yearly');
                  }}
                  className={`plan-option ${
                    selectedPlan === 'yearly'
                      ? 'active bg-[#1B4332] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer`}
                >
                  {selectedPlan === 'yearly' ? 'Proceed with Yearly Plan ($199.99)' : 'Select Yearly Plan'}
                </button>
              </div>
            </div>
          </div>

          {/* PAYPAL SECURE CHECKOUT SECTION */}
          <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#003087]/10 text-[#003087] flex items-center justify-center font-black">
                  P
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 font-display">
                    Complete Subscription via PayPal
                  </h3>
                  <p className="text-xs text-gray-500">
                    Selected:{' '}
                    <strong className="text-gray-900">
                      {selectedPlan === 'yearly' ? 'Yearly Plan ($199.99/yr)' : 'Monthly Plan ($19.99/mo)'}
                    </strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>SSL Secured</span>
              </div>
            </div>

            {/* PayPal Gateway Configuration Status Banner */}
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold">PayPal Gateway:</span>
                  <span className="text-blue-700 bg-white/80 px-2 py-0.5 rounded border border-blue-200">
                    {billingConfig?.isSandbox ? 'Sandbox Environment' : 'Live Gateway'}
                  </span>
                </div>
                <div className="font-mono text-[10px] text-blue-600 truncate max-w-xs">
                  {billingConfig?.paypalApiUrl || 'https://api-m.sandbox.paypal.com'}
                </div>
              </div>
              <p className="text-[11px] text-blue-800 leading-normal">
                Subscribers can effortlessly continue using the application once their 7-day free trial expires. Choose either <strong>Monthly Subscription ($19.99/mo)</strong> or <strong>Yearly Subscription ($199.99/yr)</strong> below for instant activation.
              </p>
            </div>

            {/* Check if user is logged in */}
            {currentUser ? (
              <div id="subscription-container" className="space-y-5">
                {/* Plan Selection Radio Controls */}
                <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-200/80 space-y-3">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider font-mono">
                    Choose Your Plan
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      data-plan="monthly"
                      className={`plan-option ${
                        selectedPlan === 'monthly'
                          ? 'active bg-white border-[#1B4332] ring-2 ring-[#1B4332]/20 shadow-sm'
                          : 'bg-white/60 border-gray-200 hover:bg-white'
                      } flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        value="monthly"
                        checked={selectedPlan === 'monthly'}
                        onChange={() => setSelectedPlan('monthly')}
                        className="w-4 h-4 text-[#1B4332] accent-[#1B4332] focus:ring-[#1B4332] cursor-pointer"
                      />
                      <div className="flex-1 text-xs">
                        <div className="font-bold text-gray-900">Monthly Plan</div>
                        <div className="text-gray-500 font-mono">${monthlyPrice.toFixed(2)}/mo</div>
                      </div>
                    </label>

                    <label
                      data-plan="yearly"
                      className={`plan-option ${
                        selectedPlan === 'yearly'
                          ? 'active bg-white border-[#1B4332] ring-2 ring-[#1B4332]/20 shadow-sm'
                          : 'bg-white/60 border-gray-200 hover:bg-white'
                      } flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        value="yearly"
                        checked={selectedPlan === 'yearly'}
                        onChange={() => setSelectedPlan('yearly')}
                        className="w-4 h-4 text-[#1B4332] accent-[#1B4332] focus:ring-[#1B4332] cursor-pointer"
                      />
                      <div className="flex-1 text-xs">
                        <div className="font-bold text-gray-900 flex items-center justify-between">
                          <span>Yearly Plan</span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">Save 16%</span>
                        </div>
                        <div className="text-gray-500 font-mono">${yearlyPrice.toFixed(2)}/yr</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-gray-200/80 text-xs flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-gray-500 block text-[11px]">Subscribing Account:</span>
                    <span className="font-bold text-gray-900">{currentUser.fullName} ({currentUser.email})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 block text-[11px]">Due Today:</span>
                    <span className="font-mono font-black text-sm text-[#1B4332]">
                      ${selectedPlan === 'yearly' ? yearlyPrice.toFixed(2) : monthlyPrice.toFixed(2)} USD
                    </span>
                  </div>
                </div>

                {/* Interactive PayPal Button */}
                <div className="max-w-md mx-auto" style={{ marginTop: '20px' }}>
                  <PayPalSubscriptionButton
                    plan={selectedPlan}
                    amount={selectedPlan === 'yearly' ? yearlyPrice : monthlyPrice}
                    clientId={billingConfig?.paypalClientId || 'BAAIOmq3Kx_2Lo8oiG7L8JlzOuuAKT2E1V2cJaJka7wJ5afyYJRYJRhXzbX-KnAPEU19Hn4jdHf79ksIqo'}
                    planId={selectedPlan === 'yearly' ? (billingConfig?.paypalPlanIdYearly || 'P-7BJ4281497082825YNKOQJBI') : (billingConfig?.paypalPlanIdMonthly || 'P-3NN56131X8898472BNKOQFNQ')}
                    paypalApiUrl={billingConfig?.paypalApiUrl}
                    userEmail={currentUser.email}
                    onSuccess={handlePayPalSuccess}
                    onError={(err) => setStatusMessage({ type: 'error', text: 'PayPal checkout failed: ' + (err?.message || 'Transaction aborted') })}
                  />
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-amber-50 border border-amber-200/80 text-center space-y-3">
                <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">Sign In or Create an Account First</h4>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Your PayPal subscription must be linked to your authenticated Agri-Vision account so your 7-day trial and paid access remain synchronized.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={handleQuickDemoLogin}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-black transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    Quick Continue as Demo Agronomist (1-Click)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setActiveSection('account');
                    }}
                    className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-800 text-xs font-bold hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setActiveSection('account');
                    }}
                    className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    Create Account (Sign Up)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: ACCOUNT & AUTHENTICATION (Sign Up, Sign In, Sign Out, Password Change/Reset) */}
      {activeSection === 'account' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {currentUser ? (
            /* SIGNED IN USER SETTINGS CARD */
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-white flex items-center justify-center font-bold text-base">
                      {currentUser.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-gray-900 font-display">Account Profile</h3>
                      <p className="text-xs text-gray-500 font-mono">ID: {currentUser.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-200/60">
                    <span className="text-gray-400 block text-[10px] font-mono">FULL NAME</span>
                    <span className="font-bold text-gray-900 text-sm">{currentUser.fullName}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-200/60">
                    <span className="text-gray-400 block text-[10px] font-mono">EMAIL ADDRESS</span>
                    <span className="font-bold text-gray-900 text-sm">{currentUser.email}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-200/60">
                    <span className="text-gray-400 block text-[10px] font-mono">SUBSCRIPTION STATUS</span>
                    <span className="font-bold text-emerald-700 text-sm uppercase">{currentUser.subscriptionStatus}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8FAF9] border border-gray-200/60">
                    <span className="text-gray-400 block text-[10px] font-mono">ACTIVE PLAN</span>
                    <span className="font-bold text-blue-700 text-sm uppercase">{currentUser.subscriptionPlan}</span>
                  </div>
                </div>

                {currentUser.subscriptionStatus === 'active' && (
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-gray-500">Want to cancel recurring renewal?</span>
                    <button
                      onClick={handleCancelSubscription}
                      className="text-rose-600 hover:underline font-bold text-xs"
                    >
                      Cancel Subscription
                    </button>
                  </div>
                )}
              </div>

              {/* 2. CHANGE PASSWORD CARD */}
              <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                  <KeyRound className="w-4 h-4 text-[#1B4332]" />
                  <h3 className="text-sm font-bold text-gray-900 font-display">Change Password</h3>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] outline-none text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="Min 6 characters"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] outline-none text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        placeholder="Repeat new password"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="py-2.5 px-4 rounded-xl bg-[#1B4332] hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* NOT LOGGED IN: SIGN IN / SIGN UP / RESET TABS */
            <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-5">
              {/* Auth Mode Toggle Buttons */}
              <div className="flex items-center p-1 rounded-xl bg-gray-100 border border-gray-200/60">
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    authMode === 'signin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    authMode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up (7-Day Trial)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('reset-password')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    authMode === 'reset-password' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Reset
                </button>
              </div>

              {/* 1. SIGN UP FORM */}
              {authMode === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-4 text-xs">
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-[11px] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Every new subscriber automatically receives a <strong>7-Day Free Trial</strong> with full system access upon registration.</span>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      required
                      placeholder="e.g. Dr. Maria Rodriguez"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      required
                      placeholder="name@farmorlab.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">Password</label>
                      <input
                        type="password"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        required
                        placeholder="Min 6 characters"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">Confirm Password</label>
                      <input
                        type="password"
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                        required
                        placeholder="Repeat password"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-[#1B4332] hover:bg-black text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account & Start 7-Day Free Trial</span>
                  </button>
                </form>
              )}

              {/* 2. SIGN IN FORM */}
              {authMode === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-4 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-medium text-gray-700">Email Address</label>
                      <button
                        type="button"
                        onClick={handleFillDemo}
                        className="text-[11px] text-[#1B4332] hover:underline font-semibold"
                      >
                        Auto-Fill Demo Account
                      </button>
                    </div>
                    <input
                      type="email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      required
                      placeholder="demo@agrivision.ai"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-medium text-gray-700">Password</label>
                      <button
                        type="button"
                        onClick={() => setAuthMode('reset-password')}
                        className="text-[11px] text-gray-400 hover:text-gray-700"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      type="password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-[#1B4332] hover:bg-black text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Your Account</span>
                  </button>
                </form>
              )}

              {/* 3. RESET PASSWORD FORM */}
              {authMode === 'reset-password' && (
                <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
                  <div className="text-gray-600 text-xs">
                    Enter your account email address and choose a new password.
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      placeholder="account@farm.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      required
                      placeholder="Min 6 characters"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#1B4332] hover:bg-black text-white text-xs font-bold transition-all shadow-sm"
                    >
                      Reset Password
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('signin')}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: BILLING HISTORY & INVOICES */}
      {activeSection === 'history' && (
        <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 font-display">
                Payment Receipts & Billing History
              </h3>
              <p className="text-xs text-gray-500">
                All completed PayPal transactions and subscription activations.
              </p>
            </div>
            <span className="text-xs font-mono text-gray-400">
              {currentUser?.paymentHistory?.length || 0} Transactions Recorded
            </span>
          </div>

          {currentUser?.paymentHistory && currentUser.paymentHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-mono text-[10px] uppercase">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Plan</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Transaction ID</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {currentUser.paymentHistory.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#F8FAF9]">
                      <td className="py-2.5 px-3 text-gray-600 font-sans">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-gray-900 uppercase">
                        {tx.plan}
                      </td>
                      <td className="py-2.5 px-3 text-[#1B4332] font-bold">
                        ${tx.amount.toFixed(2)} USD
                      </td>
                      <td className="py-2.5 px-3 text-blue-700">
                        PayPal
                      </td>
                      <td className="py-2.5 px-3 text-gray-500 text-[11px]">
                        {tx.transactionId}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center space-y-2">
              <FileText className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-xs text-gray-500">No payment transactions found yet.</p>
              <p className="text-[11px] text-gray-400">
                When you complete a PayPal Monthly ($19.99) or Yearly ($199.99) subscription, transaction invoices will appear here automatically.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: SECURE ADMIN ANALYTICS & FIRESTORE AGGREGATION VIEW */}
      {activeSection === 'admin' && (
        <AdminSubscriptionAnalyticsView
          currentUser={currentUser}
          onRefreshUser={async () => {
            const freshUser = await fetchCurrentUser();
            if (freshUser) {
              onUserChange(freshUser);
            }
          }}
        />
      )}
    </div>
  );
};
