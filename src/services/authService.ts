import { AuthUser } from '../types';

const TOKEN_KEY = 'agri_vision_auth_token';
const USER_KEY = 'agri_vision_auth_user';

export interface BillingPlanInfo {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  description: string;
  discountNotice?: string;
  features: string[];
}

export interface BillingConfig {
  paypalClientId: string;
  paypalApiUrl?: string;
  isConfigured?: boolean;
  isSandbox?: boolean;
  currency: string;
  plans: {
    monthly: BillingPlanInfo & { paypalPlanId?: string };
    yearly: BillingPlanInfo & { paypalPlanId?: string };
  };
  meta?: {
    productId?: string | null;
    webhookConfigured?: boolean;
    environment?: 'sandbox' | 'production';
  };
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (err) {
    console.error('Failed to update auth token', err);
  }
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser | null): void {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch (err) {
    console.error('Failed to update auth user', err);
  }
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// -------------------------------------------------------------
// Core Auth API Calls
// -------------------------------------------------------------

export async function signUpUser(
  fullName: string,
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; token?: string; error?: string; message?: string }> {
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to sign up.' };
    }

    if (data.token) {
      setStoredToken(data.token);
    }
    if (data.user) {
      setStoredUser(data.user);
    }

    return {
      success: true,
      user: data.user,
      token: data.token,
      message: data.message,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error during sign up.' };
  }
}

export async function signInUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; token?: string; error?: string; message?: string }> {
  try {
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Invalid credentials.' };
    }

    if (data.token) {
      setStoredToken(data.token);
    }
    if (data.user) {
      setStoredUser(data.user);
    }

    return {
      success: true,
      user: data.user,
      token: data.token,
      message: data.message,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error during sign in.' };
  }
}

export async function signOutUser(): Promise<{ success: boolean }> {
  try {
    await fetch('/api/auth/signout', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    console.warn('Sign out request failed', err);
  } finally {
    setStoredToken(null);
    setStoredUser(null);
  }
  return { success: true };
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const token = getStoredToken();
  if (!token) {
    return null;
  }

  try {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      setStoredToken(null);
      setStoredUser(null);
      return null;
    }

    const data = await res.json();
    if (data.success && data.user) {
      setStoredUser(data.user);
      return data.user;
    } else {
      setStoredToken(null);
      setStoredUser(null);
      return null;
    }
  } catch (err) {
    console.warn('Could not refresh user session, returning cached:', err);
    return getStoredUser();
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to update password.' };
    }

    return { success: true, message: data.message };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error updating password.' };
  }
}

export async function resetPassword(
  email: string,
  newPassword: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to reset password.' };
    }

    return { success: true, message: data.message };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error resetting password.' };
  }
}

// -------------------------------------------------------------
// Billing & PayPal Subscription Calls
// -------------------------------------------------------------

export async function fetchBillingConfig(): Promise<BillingConfig> {
  try {
    const res = await fetch('/api/billing/config');
    const data = await res.json();
    if (data.success) {
      return {
        paypalClientId: data.paypalClientId || 'sb',
        paypalApiUrl: data.paypalApiUrl || 'https://api-m.paypal.com',
        isConfigured: Boolean(data.isConfigured),
        isSandbox: Boolean(data.isSandbox),
        currency: data.currency || 'USD',
        plans: data.plans,
        meta: data.meta,
      };
    }
  } catch (err) {
    console.warn('Failed to fetch billing config, using defaults', err);
  }

  // Fallback defaults
  return {
    paypalClientId: 'sb',
    paypalApiUrl: 'https://api-m.paypal.com',
    isConfigured: false,
    isSandbox: true,
    currency: 'USD',
    plans: {
      monthly: {
        id: 'plan_monthly',
        name: 'Monthly Plan',
        price: 19.99,
        interval: 'month',
        description: 'Flexible monthly billing with complete computer vision capabilities.',
        features: [
          'Full-Spectrum Crop Monitoring & NDVI Analysis',
          'YOLOv8 Edge Pest & Disease Detection',
          'Export Produce Quality Inspection & USDA Grading',
          'Real-Time Autonomous Drone Stream Telemetry',
          'Observational Agronomy Field Notes & Central Sync',
          'Standard Cloud AI Inference',
        ],
      },
      yearly: {
        id: 'plan_yearly',
        name: 'Yearly Plan',
        price: 199.99,
        interval: 'year',
        discountNotice: 'Save $39.89 / 16% annually',
        description: 'Comprehensive annual subscription for production farm operations.',
        features: [
          'All Monthly Plan Features Included',
          'Priority GPU Vision Pipeline Acceleration',
          'Automated Batch PDF Audit Report Generation',
          'Historical Multi-Field Temporal Health Analytics',
          'A2A Autonomous Inspection Judge & Telemetry Diagnostics',
          'Dedicated Agronomic Support & Priority Sync',
        ],
      },
    },
  };
}

export async function capturePayPalSubscription(
  plan: 'monthly' | 'yearly',
  orderId?: string,
  paymentDetails?: any,
  userEmail?: string
): Promise<{ success: boolean; user?: AuthUser; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/billing/capture-subscription', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        plan,
        orderId,
        paymentDetails,
        email: userEmail,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Payment capture failed.' };
    }

    if (data.token) {
      localStorage.setItem('agri_auth_token', data.token);
    }

    if (data.user) {
      setStoredUser(data.user);
    }

    return {
      success: true,
      user: data.user,
      message: data.message,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error during payment verification.' };
  }
}

export async function activatePayPalSubscriptionDirect(
  subscriptionId: string,
  planId: string,
  userEmail?: string,
  userName?: string
): Promise<{ success: boolean; user?: AuthUser; message?: string; error?: string }> {
  try {
    const token = localStorage.getItem('agri_auth_token');
    const res = await fetch('/api/subscriptions/activate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        subscriptionID: subscriptionId,
        planId,
        email: userEmail,
        name: userName,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Subscription activation failed.' };
    }

    if (data.token) {
      localStorage.setItem('agri_auth_token', data.token);
    }

    if (data.user) {
      setStoredUser(data.user);
    }

    return {
      success: true,
      user: data.user,
      message: 'Subscription successfully activated!',
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error during subscription activation.' };
  }
}

export async function cancelSubscription(): Promise<{ success: boolean; user?: AuthUser; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/billing/cancel-subscription', {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to cancel subscription.' };
    }

    if (data.user) {
      setStoredUser(data.user);
    }

    return {
      success: true,
      user: data.user,
      message: data.message,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error during cancellation.' };
  }
}

export async function simulateTrialAction(
  action: 'expire' | 'reset-7-days' | 'set-hours-left' | 'activate-paid',
  options?: { hoursLeft?: number; plan?: 'monthly' | 'yearly' }
): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
  try {
    const res = await fetch('/api/billing/simulate-trial', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        action,
        hoursLeft: options?.hoursLeft,
        plan: options?.plan,
      }),
    });

    const data = await res.json();
    if (data.success && data.user) {
      setStoredUser(data.user);
      return { success: true, user: data.user, message: data.message };
    }
    return { success: false, message: 'Simulation failed.' };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// -------------------------------------------------------------
// Helper Calculations
// -------------------------------------------------------------

export function calculateTrialRemaining(user: AuthUser | null): {
  days: number;
  hours: number;
  minutes: number;
  totalMs: number;
  isExpired: boolean;
  percentUsed: number;
} {
  if (!user) {
    return { days: 0, hours: 0, minutes: 0, totalMs: 0, isExpired: true, percentUsed: 100 };
  }

  // If paid active subscription, not expired
  if (user.subscriptionStatus === 'active') {
    return { days: 30, hours: 0, minutes: 0, totalMs: 30 * 86400000, isExpired: false, percentUsed: 0 };
  }

  const now = Date.now();
  const start = new Date(user.trialStartDate).getTime();
  const end = new Date(user.trialEndDate).getTime();
  const totalDuration = Math.max(end - start, 7 * 24 * 60 * 60 * 1000);
  const remainingMs = Math.max(0, end - now);

  const isExpired = remainingMs <= 0 || user.subscriptionStatus === 'expired';
  const percentUsed = Math.min(100, Math.max(0, Math.round(((totalDuration - remainingMs) / totalDuration) * 100)));

  const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));

  return {
    days,
    hours,
    minutes,
    totalMs: remainingMs,
    isExpired,
    percentUsed,
  };
}

export function checkAccess(user: any): boolean {
  if (!user) return false;
  const now = new Date();

  // Normalize subscription_status and trial_ends_at to support both exact snippet naming and existing schema
  const status = (user.subscription_status || user.subscriptionStatus || '').toUpperCase();
  const rawTrialEnd = user.trial_ends_at || user.trialEndDate;
  const trialEndsAt = rawTrialEnd instanceof Date ? rawTrialEnd : (rawTrialEnd ? new Date(rawTrialEnd) : null);

  // Grant access if trial is still active OR if subscription status is active
  if (status === 'ACTIVE') return true;
  if (status === 'TRIALING' && trialEndsAt && trialEndsAt > now) return true;

  // Block access and redirect to Payment Gateway
  return false;
}

export function hasActiveSubscriptionAccess(user: AuthUser | null | undefined): boolean {
  return checkAccess(user);
}

export const DEFAULT_PAYPAL_CLIENT_ID = 'BAAIOmq3Kx_2Lo8oiG7L8JlzOuuAKT2E1V2cJaJka7wJ5afyYJRYJRhXzbX-KnAPEU19Hn4jdHf79ksIqo';
export const PAYPAL_MONTHLY_PLAN_ID = 'P-3NN56131X8898472BNKOQFNQ';
export const PAYPAL_YEARLY_PLAN_ID = 'P-7BJ4281497082825YNKOQJBI';

export async function activatePayPalSubscription(
  subscriptionID: string,
  planId: string,
  email?: string
): Promise<{
  success: boolean;
  message: string;
  user?: AuthUser;
  subscriptionID?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/subscriptions/activate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ subscriptionID, planId, email }),
    });
    const data = await res.json();
    if (res.ok && data.success && data.user) {
      setStoredUser(data.user);
    }
    return data;
  } catch (err: any) {
    return { success: false, message: 'Network error activating subscription', error: err?.message };
  }
}

// 1. Simulates PayPal billing webhooks (e.g. cancellation, suspension, activation)
export async function simulatePayPalWebhook(
  eventType: 'BILLING.SUBSCRIPTION.CANCELLED' | 'BILLING.SUBSCRIPTION.SUSPENDED' | 'BILLING.SUBSCRIPTION.ACTIVATED' | string,
  subscriptionId?: string,
  email?: string,
  note?: string
): Promise<{
  success: boolean;
  event_type: string;
  action: string;
  user?: AuthUser;
  auditLog?: any;
  error?: string;
}> {
  try {
    const res = await fetch('/api/webhooks/paypal/simulate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        event_type: eventType,
        subscription_id: subscriptionId,
        email,
        note,
      }),
    });
    const data = await res.json();
    if (res.ok && data.success && data.user) {
      setStoredUser(data.user);
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      event_type: eventType,
      action: 'Failed to communicate with webhook simulation endpoint',
      error: err?.message || 'Network error',
    };
  }
}

// 2. Inspects PayPal Webhook listener health and recent logs
export async function getPayPalWebhookStatus(): Promise<{
  status: string;
  service: string;
  webhookId: string;
  supportedEvents: string[];
  totalEventsLogged: number;
  recentLogs: any[];
} | null> {
  try {
    const res = await fetch('/api/webhooks/paypal', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export type SubscriptionDisplayBadgeState = 'Active' | 'Trialing' | 'Expired';

export function getSubscriptionDisplayState(user: AuthUser | null | undefined): SubscriptionDisplayBadgeState {
  if (!user) return 'Expired';
  const statusUpper = (user.subscription_status || user.subscriptionStatus || '').toUpperCase();
  if (statusUpper === 'ACTIVE') return 'Active';
  if (statusUpper === 'SUSPENDED') return 'Expired';
  if (statusUpper === 'CANCELLED') {
    // Check if period end is still valid in future
    if (user.currentPeriodEnd) {
      const curEnd = new Date(user.currentPeriodEnd).getTime();
      if (curEnd > Date.now()) {
        return 'Active';
      }
    }
    return 'Expired';
  }
  if (statusUpper === 'EXPIRED') return 'Expired';

  // Check trial expiration
  const trial = calculateTrialRemaining(user);
  if (trial.isExpired) return 'Expired';
  return 'Trialing';
}

