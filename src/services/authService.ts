import { AuthUser } from '../types';
import { syncUserToFirestore, saveSubscriptionToFirestore } from '../firebase';

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
  paypalProductId?: string;
  paypalPlanIdMonthly?: string;
  paypalPlanIdYearly?: string;
  isSandbox?: boolean;
  isConfigured?: boolean;
  currency: string;
  plans: {
    monthly: BillingPlanInfo & { paypalPlanId?: string };
    yearly: BillingPlanInfo & { paypalPlanId?: string };
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
      syncUserToFirestore(data.user).catch((e) => console.warn('Firestore sync error:', e));
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
      syncUserToFirestore(data.user).catch((e) => console.warn('Firestore sync error:', e));
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
        paypalApiUrl: data.paypalApiUrl || 'https://api-m.sandbox.paypal.com',
        paypalProductId: data.paypalProductId || '',
        paypalPlanIdMonthly: data.paypalPlanIdMonthly || '',
        paypalPlanIdYearly: data.paypalPlanIdYearly || '',
        isSandbox: Boolean(data.isSandbox),
        isConfigured: Boolean(data.isConfigured),
        currency: data.currency || 'USD',
        plans: data.plans,
      };
    }
  } catch (err) {
    console.warn('Failed to fetch billing config, using defaults', err);
  }

  // Fallback defaults
  return {
    paypalClientId: 'sb',
    paypalApiUrl: 'https://api-m.sandbox.paypal.com',
    paypalProductId: '',
    paypalPlanIdMonthly: '',
    paypalPlanIdYearly: '',
    isSandbox: true,
    isConfigured: false,
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

export async function createPayPalOrder(
  plan: 'monthly' | 'yearly'
): Promise<{ success: boolean; orderId?: string; price?: number; planName?: string; planId?: string; error?: string }> {
  try {
    const res = await fetch('/api/billing/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create PayPal order' };
  }
}

export async function createPayPalSubscription(
  planType: 'monthly' | 'yearly'
): Promise<{ subscriptionID?: string; planId?: string; status?: string; error?: string }> {
  try {
    const res = await fetch('/api/create-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planType }),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { error: err.message || 'Failed to initiate PayPal subscription' };
  }
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

    if (data.user) {
      setStoredUser(data.user);
      syncUserToFirestore(data.user).catch((e) => console.warn('Firestore sync error:', e));
      if (orderId || paymentDetails?.id) {
        saveSubscriptionToFirestore(data.user.id, {
          subscriptionID: orderId || paymentDetails?.id || 'PP-SUB',
          plan,
          status: 'active',
          orderId,
        }).catch((e) => console.warn('Firestore save sub error:', e));
      }
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
      syncUserToFirestore(data.user).catch((e) => console.warn('Firestore sync error:', e));
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

export function hasActiveSubscriptionAccess(user: AuthUser | null): boolean {
  if (!user) return false;

  if (user.subscriptionStatus === 'active') {
    const periodEnd = new Date(user.currentPeriodEnd).getTime();
    return Date.now() < periodEnd;
  }

  if (user.subscriptionStatus === 'trialing') {
    const trialEnd = new Date(user.trialEndDate).getTime();
    return Date.now() < trialEnd;
  }

  return false;
}
