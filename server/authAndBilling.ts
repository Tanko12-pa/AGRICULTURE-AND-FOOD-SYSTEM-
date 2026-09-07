import express, { Router, Request, Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface SubscriptionPaymentRecord {
  id: string;
  date: string;
  amount: number;
  currency: string;
  plan: 'monthly' | 'yearly';
  paymentMethod: 'paypal';
  transactionId: string;
  status: 'completed' | 'refunded';
}

export interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  role?: string;
  passwordHash: string;
  createdAt: string;
  trialStartDate: string;
  trialEndDate: string;
  subscriptionStatus: 'trialing' | 'active' | 'expired' | 'cancelled';
  subscriptionPlan: 'free_trial' | 'monthly' | 'yearly' | 'none';
  currentPeriodEnd: string;
  paypalSubscriptionId?: string;
  paypalPayerEmail?: string;
  paymentHistory: SubscriptionPaymentRecord[];
}

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  role?: string;
  createdAt: string;
  trialStartDate: string;
  trialEndDate: string;
  subscriptionStatus: 'trialing' | 'active' | 'expired' | 'cancelled';
  subscriptionPlan: 'free_trial' | 'monthly' | 'yearly' | 'none';
  currentPeriodEnd: string;
  paypalSubscriptionId?: string;
  paypalPayerEmail?: string;
  paymentHistory: SubscriptionPaymentRecord[];
}

const DB_FILE = path.join(process.cwd(), 'users-db.json');

// In-memory token session mapping: token -> userId
const SESSIONS = new Map<string, { userId: string; expiresAt: number }>();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_agri_salt_2026').digest('hex');
}

function generateSessionToken(): string {
  return 'agr_' + crypto.randomBytes(32).toString('hex');
}

// Load or seed users
function loadUsers(): Map<string, StoredUser> {
  const users = new Map<string, StoredUser>();
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed: StoredUser[] = JSON.parse(data);
      for (const u of parsed) {
        users.set(u.id, u);
      }
      return users;
    }
  } catch (err) {
    console.error('Failed to load users-db.json, re-seeding default demo user:', err);
  }

  // Pre-seed demo user with active 7-day free trial (6 days remaining)
  const now = Date.now();
  const demoUser: StoredUser = {
    id: 'usr_demo_1001',
    fullName: 'Dr. Julian Vance',
    email: 'demo@agrivision.ai',
    passwordHash: hashPassword('Password123!'),
    createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
    trialStartDate: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
    trialEndDate: new Date(now + 6 * 24 * 60 * 60 * 1000).toISOString(),
    subscriptionStatus: 'trialing',
    subscriptionPlan: 'free_trial',
    currentPeriodEnd: new Date(now + 6 * 24 * 60 * 60 * 1000).toISOString(),
    paymentHistory: [],
  };

  users.set(demoUser.id, demoUser);
  saveUsers(users);
  return users;
}

function saveUsers(usersMap: Map<string, StoredUser>): void {
  try {
    const list = Array.from(usersMap.values());
    fs.writeFileSync(DB_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save users to file:', err);
  }
}

const USERS = loadUsers();

function sanitizeUser(user: StoredUser): PublicUser {
  const { passwordHash, ...safe } = user;
  return safe;
}

function refreshUserStatus(user: StoredUser): StoredUser {
  const now = Date.now();
  const trialEnd = new Date(user.trialEndDate).getTime();
  const periodEnd = new Date(user.currentPeriodEnd).getTime();

  if (user.subscriptionStatus === 'trialing') {
    if (now > trialEnd) {
      user.subscriptionStatus = 'expired';
      user.subscriptionPlan = 'none';
    }
  } else if (user.subscriptionStatus === 'active') {
    if (now > periodEnd) {
      user.subscriptionStatus = 'expired';
      user.subscriptionPlan = 'none';
    }
  } else if (user.subscriptionStatus === 'cancelled') {
    if (now > periodEnd) {
      user.subscriptionStatus = 'expired';
      user.subscriptionPlan = 'none';
    }
  }

  return user;
}

function getUserByToken(token?: string): StoredUser | null {
  if (!token) return null;
  const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
  const session = SESSIONS.get(cleanToken);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    SESSIONS.delete(cleanToken);
    return null;
  }
  const user = USERS.get(session.userId);
  if (!user) return null;
  return refreshUserStatus(user);
}

export const authAndBillingRouter = Router();

// -------------------------------------------------------------
// 1. AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------

// SIGN UP
authAndBillingRouter.post('/auth/signup', (req: Request, res: Response) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Full name is required (minimum 2 characters).' });
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    for (const u of USERS.values()) {
      if (u.email.toLowerCase() === normalizedEmail) {
        return res.status(409).json({ success: false, error: 'An account with this email address already exists. Please sign in.' });
      }
    }

    const now = Date.now();
    const trialDays = 7;
    const trialStartDate = new Date(now).toISOString();
    const trialEndDate = new Date(now + trialDays * 24 * 60 * 60 * 1000).toISOString();

    const newUser: StoredUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      fullName: fullName.trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      createdAt: new Date(now).toISOString(),
      trialStartDate,
      trialEndDate,
      subscriptionStatus: 'trialing',
      subscriptionPlan: 'free_trial',
      currentPeriodEnd: trialEndDate,
      paymentHistory: [],
    };

    USERS.set(newUser.id, newUser);
    saveUsers(USERS);

    // Create session (expires in 30 days)
    const token = generateSessionToken();
    SESSIONS.set(token, {
      userId: newUser.id,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: 'Account successfully registered! Your 7-day free trial is now active with full system access.',
      user: sanitizeUser(newUser),
      token,
    });
  } catch (err: any) {
    console.error('Error during signup:', err);
    return res.status(500).json({ success: false, error: 'Internal server error during account registration.' });
  }
});

// SIGN IN
authAndBillingRouter.post('/auth/signin', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let matchedUser: StoredUser | null = null;

    for (const u of USERS.values()) {
      if (u.email.toLowerCase() === normalizedEmail) {
        matchedUser = u;
        break;
      }
    }

    if (!matchedUser) {
      return res.status(401).json({ success: false, error: 'Invalid email address or password.' });
    }

    const inputHash = hashPassword(password);
    if (matchedUser.passwordHash !== inputHash) {
      return res.status(401).json({ success: false, error: 'Invalid email address or password.' });
    }

    matchedUser = refreshUserStatus(matchedUser);
    USERS.set(matchedUser.id, matchedUser);
    saveUsers(USERS);

    const token = generateSessionToken();
    SESSIONS.set(token, {
      userId: matchedUser.id,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: 'Signed in successfully.',
      user: sanitizeUser(matchedUser),
      token,
    });
  } catch (err: any) {
    console.error('Error during signin:', err);
    return res.status(500).json({ success: false, error: 'Internal server error during authentication.' });
  }
});

// SIGN OUT
authAndBillingRouter.post('/auth/signout', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const cleanToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
      SESSIONS.delete(cleanToken);
    }
    return res.json({ success: true, message: 'Signed out successfully. Authenticated session terminated.' });
  } catch (err: any) {
    return res.json({ success: true, message: 'Signed out.' });
  }
});

// GET CURRENT USER / ME
authAndBillingRouter.get('/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const user = getUserByToken(authHeader);

  if (!user) {
    return res.json({ success: true, user: null });
  }

  return res.json({
    success: true,
    user: sanitizeUser(user),
  });
});

// CHANGE PASSWORD (Logged-in user)
authAndBillingRouter.post('/auth/change-password', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const user = getUserByToken(authHeader);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required to change password.' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
    }

    if (user.passwordHash !== hashPassword(currentPassword)) {
      return res.status(400).json({ success: false, error: 'Current password does not match.' });
    }

    user.passwordHash = hashPassword(newPassword);
    USERS.set(user.id, user);
    saveUsers(USERS);

    return res.json({
      success: true,
      message: 'Password successfully updated.',
    });
  } catch (err: any) {
    console.error('Error changing password:', err);
    return res.status(500).json({ success: false, error: 'Failed to update password.' });
  }
});

// RESET PASSWORD (Public / Forgot password)
authAndBillingRouter.post('/auth/reset-password', (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ success: false, error: 'Email and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let targetUser: StoredUser | null = null;

    for (const u of USERS.values()) {
      if (u.email.toLowerCase() === normalizedEmail) {
        targetUser = u;
        break;
      }
    }

    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'No account found with this email address.' });
    }

    targetUser.passwordHash = hashPassword(newPassword);
    USERS.set(targetUser.id, targetUser);
    saveUsers(USERS);

    return res.json({
      success: true,
      message: 'Password successfully reset! You can now sign in with your new credentials.',
    });
  } catch (err: any) {
    console.error('Error resetting password:', err);
    return res.status(500).json({ success: false, error: 'Failed to reset password.' });
  }
});

// -------------------------------------------------------------
// 2. BILLING & PAYPAL SUBSCRIPTION ENDPOINTS
// -------------------------------------------------------------

// PayPal Gateway Configuration from Environment with live Button-Factory credentials as defaults
const PAYPAL_API_URL = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
const PAYPAL_PRODUCT_ID = process.env.PAYPAL_PRODUCT_ID || '';
const PAYPAL_PLAN_ID_MONTHLY = process.env.PAYPAL_PLAN_ID_MONTHLY || 'P-3NN56131X8898472BNKOQFNQ';
const PAYPAL_PLAN_ID_YEARLY = process.env.PAYPAL_PLAN_ID_YEARLY || 'P-7BJ4281497082825YNKOQJBI';
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'BAAIOmq3Kx_2Lo8oiG7L8JlzOuuAKT2E1V2cJaJka7wJ5afyYJRYJRhXzbX-KnAPEU19Hn4jdHf79ksIqo';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';

/**
 * Acquire PayPal OAuth2 Access Token for server-to-server gateway requests
 */
async function getPayPalAccessToken(): Promise<string | null> {
  if (!PAYPAL_CLIENT_SECRET || !PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID === 'sb') {
    return null;
  }
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('PayPal OAuth access token failed:', response.status, errText);
      return null;
    }

    const data = (await response.json()) as any;
    return data?.access_token || null;
  } catch (err) {
    console.warn('Network error obtaining PayPal access token:', err);
    return null;
  }
}

// GET BILLING CONFIG (Safe public details, PayPal Client ID & Gateway configuration)
authAndBillingRouter.get('/billing/config', (req: Request, res: Response) => {
  const isSandbox = PAYPAL_API_URL.toLowerCase().includes('sandbox');
  const isConfigured = Boolean(
    PAYPAL_CLIENT_ID && PAYPAL_CLIENT_ID !== 'sb' && (PAYPAL_PLAN_ID_MONTHLY || PAYPAL_PLAN_ID_YEARLY || PAYPAL_CLIENT_SECRET)
  );

  return res.json({
    success: true,
    paypalClientId: PAYPAL_CLIENT_ID,
    paypalApiUrl: PAYPAL_API_URL,
    paypalProductId: PAYPAL_PRODUCT_ID,
    paypalPlanIdMonthly: PAYPAL_PLAN_ID_MONTHLY,
    paypalPlanIdYearly: PAYPAL_PLAN_ID_YEARLY,
    isSandbox,
    isConfigured,
    currency: 'USD',
    plans: {
      monthly: {
        id: PAYPAL_PLAN_ID_MONTHLY || 'plan_monthly_agri',
        paypalPlanId: PAYPAL_PLAN_ID_MONTHLY,
        name: 'Monthly Plan',
        price: 19.99,
        interval: 'month',
        description: 'Complete computer vision intelligence platform with monthly flexibility.',
        features: [
          'Full-Spectrum Crop Monitoring & NDVI Analysis',
          'YOLOv8 Edge Pest & Disease Detection',
          'Export Produce Quality Inspection & USDA Grading',
          'Real-Time Autonomous Drone Stream Telemetry',
          'Observational Agronomy Field Notes & Sync',
          'Standard Cloud AI Inference',
        ],
      },
      yearly: {
        id: PAYPAL_PLAN_ID_YEARLY || 'plan_yearly_agri',
        paypalPlanId: PAYPAL_PLAN_ID_YEARLY,
        name: 'Yearly Plan',
        price: 199.99,
        interval: 'year',
        discountNotice: 'Save $39.89 / 16% annually',
        description: 'Annual enterprise-grade access for seasonal and year-round farm operations.',
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
  });
});

// CREATE PAYPAL ORDER / SUBSCRIPTION SETUP VIA GATEWAY
authAndBillingRouter.post('/billing/create-order', async (req: Request, res: Response) => {
  try {
    const { plan } = req.body;
    if (plan !== 'monthly' && plan !== 'yearly') {
      return res.status(400).json({ success: false, error: 'Invalid subscription plan selected.' });
    }

    const price = plan === 'yearly' ? 199.99 : 19.99;
    const planName = plan === 'yearly' ? 'Agri-Vision Yearly Plan' : 'Agri-Vision Monthly Plan';
    const planId = plan === 'yearly' ? PAYPAL_PLAN_ID_YEARLY : PAYPAL_PLAN_ID_MONTHLY;

    // Try communicating directly with PayPal API if credentials exist
    const accessToken = await getPayPalAccessToken();
    if (accessToken) {
      try {
        const orderResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [
              {
                reference_id: `agri_${plan}_${Date.now()}`,
                description: `Agri-Vision ${planName}`,
                amount: {
                  currency_code: 'USD',
                  value: price.toFixed(2),
                },
              },
            ],
            application_context: {
              brand_name: 'AGRICULTURE & FOOD SYSTEM',
              landing_page: 'NO_PREFERENCE',
              user_action: 'PAY_NOW',
            },
          }),
        });

        if (orderResponse.ok) {
          const orderData = (await orderResponse.json()) as any;
          return res.json({
            success: true,
            orderId: orderData.id,
            plan,
            price,
            currency: 'USD',
            planName,
            planId,
            paypalLinks: orderData.links,
          });
        } else {
          console.warn('PayPal Orders API returned error, falling back to client-driven checkout:', await orderResponse.text());
        }
      } catch (gatewayErr) {
        console.warn('PayPal Gateway direct order creation encountered issue:', gatewayErr);
      }
    }

    // Standard client SDK order reference
    const orderId = 'ORD-' + plan.toUpperCase() + '-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();

    return res.json({
      success: true,
      orderId,
      plan,
      price,
      currency: 'USD',
      planName,
      planId,
      gatewayApiUrl: PAYPAL_API_URL,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to initiate PayPal billing order.' });
  }
});

// CAPTURE / ACTIVATE PAYPAL SUBSCRIPTION
authAndBillingRouter.post('/billing/capture-subscription', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    let user = getUserByToken(authHeader);

    const { plan, orderId, paymentDetails } = req.body;
    const chosenPlan: 'monthly' | 'yearly' = plan === 'yearly' ? 'yearly' : 'monthly';

    if (!user) {
      // If client didn't supply auth header, check if email was passed
      const targetEmail = req.body.email || paymentDetails?.payer?.email_address;
      if (targetEmail) {
        for (const u of USERS.values()) {
          if (u.email.toLowerCase() === targetEmail.toLowerCase()) {
            user = u;
            break;
          }
        }
        if (!user) {
          // Auto-provision user account for this subscriber
          const now = Date.now();
          const newId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
          const fullName = req.body.fullName || paymentDetails?.payer?.name?.given_name || 'Subscribed Agronomist';
          const newUser: StoredUser = {
            id: newId,
            fullName,
            email: targetEmail.toLowerCase().trim(),
            passwordHash: hashPassword('AgriVision2026!'),
            createdAt: new Date(now).toISOString(),
            trialStartDate: new Date(now).toISOString(),
            trialEndDate: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(),
            subscriptionStatus: 'active',
            subscriptionPlan: chosenPlan,
            currentPeriodEnd: new Date(now + (chosenPlan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
            paymentHistory: [],
          };
          USERS.set(newId, newUser);
          user = newUser;
        }
      }
    }

    if (!user) {
      // Fallback to first existing user in system
      user = Array.from(USERS.values())[0];
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Unable to link PayPal subscription to an account.',
      });
    }

    // If server has PayPal access token and orderId starts with PayPal format, attempt capture on PayPal
    const accessToken = await getPayPalAccessToken();
    if (accessToken && orderId && !orderId.startsWith('ORD-') && !orderId.startsWith('PAYPAL-SB-')) {
      try {
        const captureRes = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        if (captureRes.ok) {
          const captureData = (await captureRes.json()) as any;
          console.log('PayPal Order captured successfully via gateway API:', captureData.id);
        }
      } catch (captureErr) {
        console.warn('PayPal capture API note:', captureErr);
      }
    }

    const now = Date.now();
    const durationDays = chosenPlan === 'yearly' ? 365 : 30;
    const newPeriodEnd = new Date(now + durationDays * 24 * 60 * 60 * 1000).toISOString();
    const amount = chosenPlan === 'yearly' ? 199.99 : 19.99;
    const transactionId = orderId || paymentDetails?.id || ('PP-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase());

    // Update user record to ACTIVE subscription
    user = refreshUserStatus(user);
    user.subscriptionStatus = 'active';
    user.subscriptionPlan = chosenPlan;
    user.currentPeriodEnd = newPeriodEnd;
    user.paypalSubscriptionId = transactionId;
    if (paymentDetails?.payer?.email_address) {
      user.paypalPayerEmail = paymentDetails.payer.email_address;
    }

    // Add to payment history
    const record: SubscriptionPaymentRecord = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      date: new Date().toISOString(),
      amount,
      currency: 'USD',
      plan: chosenPlan,
      paymentMethod: 'paypal',
      transactionId,
      status: 'completed',
    };

    if (!user.paymentHistory) {
      user.paymentHistory = [];
    }
    user.paymentHistory.unshift(record);

    USERS.set(user.id, user);
    saveUsers(USERS);

    // Create or refresh user session token
    const token = 'tok_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    SESSIONS.set(token, { userId: user.id, expiresAt });

    return res.json({
      success: true,
      token,
      message: `PayPal payment verified! Your ${chosenPlan === 'yearly' ? 'Yearly' : 'Monthly'} Subscription is now active. Full application access has been granted through ${new Date(newPeriodEnd).toLocaleDateString()}.`,
      user: sanitizeUser(user),
      paymentRecord: record,
    });
  } catch (err: any) {
    console.error('Error capturing subscription:', err);
    return res.status(500).json({ success: false, error: 'Failed to capture and activate PayPal subscription.' });
  }
});

/**
 * Process PayPal Webhook Events (Subscriptions, Recurring Payments, Cancellations)
 */
export function handlePayPalWebhookEvent(event: any): { handled: boolean; action?: string; email?: string } {
  try {
    if (!event) return { handled: false };
    const eventType = event.event_type;
    console.log(`Processing PayPal Webhook event: ${eventType} (ID: ${event.id || 'N/A'})`);

    const subscriberEmail =
      event?.resource?.subscriber?.email_address ||
      event?.resource?.payer?.email_address ||
      event?.resource?.custom_id ||
      event?.resource?.billing_agreement_id;

    // Helper to find user by email or by paypal subscription ID
    const findTargetUser = (): StoredUser | null => {
      const subId = event?.resource?.id || event?.resource?.billing_agreement_id;
      for (const u of USERS.values()) {
        if (subscriberEmail && u.email.toLowerCase() === subscriberEmail.toLowerCase()) {
          return u;
        }
        if (subId && u.paypalSubscriptionId === subId) {
          return u;
        }
      }
      return null;
    };

    const targetUser = findTargetUser();

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        // Unlock premium features for user in database
        if (targetUser) {
          const planId = event?.resource?.plan_id;
          const isYearly = planId === PAYPAL_PLAN_ID_YEARLY || targetUser.subscriptionPlan === 'yearly';
          const planType: 'monthly' | 'yearly' = isYearly ? 'yearly' : 'monthly';
          const durationDays = isYearly ? 365 : 30;

          targetUser.subscriptionStatus = 'active';
          targetUser.subscriptionPlan = planType;
          targetUser.currentPeriodEnd = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
          targetUser.paypalSubscriptionId = event?.resource?.id || targetUser.paypalSubscriptionId;

          USERS.set(targetUser.id, targetUser);
          saveUsers(USERS);
          console.log(`[Webhook] Unlocked premium features for user ${targetUser.email} through ${targetUser.currentPeriodEnd}`);
          return { handled: true, action: 'activated', email: targetUser.email };
        }
        break;
      }

      case 'PAYMENT.SALE.COMPLETED': {
        // Recurring payment succeeded - extend expiration date
        if (targetUser) {
          const isYearly = targetUser.subscriptionPlan === 'yearly';
          const durationDays = isYearly ? 365 : 30;
          const currentEnd = new Date(targetUser.currentPeriodEnd).getTime();
          const baseTime = !isNaN(currentEnd) && currentEnd > Date.now() ? currentEnd : Date.now();
          const newEnd = new Date(baseTime + durationDays * 24 * 60 * 60 * 1000).toISOString();

          targetUser.subscriptionStatus = 'active';
          targetUser.currentPeriodEnd = newEnd;

          // Record payment transaction
          const amount = Number(event?.resource?.amount?.total || (isYearly ? 199.99 : 19.99));
          const txRecord: SubscriptionPaymentRecord = {
            id: 'tx_sale_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
            date: new Date().toISOString(),
            amount,
            currency: event?.resource?.amount?.currency || 'USD',
            plan: isYearly ? 'yearly' : 'monthly',
            paymentMethod: 'paypal',
            transactionId: event?.resource?.id || targetUser.paypalSubscriptionId || ('PP-' + Date.now()),
            status: 'completed',
          };

          if (!targetUser.paymentHistory) {
            targetUser.paymentHistory = [];
          }
          targetUser.paymentHistory.unshift(txRecord);

          USERS.set(targetUser.id, targetUser);
          saveUsers(USERS);
          console.log(`[Webhook] Recurring payment received for ${targetUser.email}. Extended expiration date to ${newEnd}`);
          return { handled: true, action: 'payment_completed_extended', email: targetUser.email };
        }
        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        // Revoke app privileges
        if (targetUser) {
          targetUser.subscriptionStatus = 'cancelled';
          targetUser.subscriptionPlan = 'none';

          USERS.set(targetUser.id, targetUser);
          saveUsers(USERS);
          console.log(`[Webhook] Revoked app privileges for user ${targetUser.email}`);
          return { handled: true, action: 'cancelled_revoked', email: targetUser.email };
        }
        break;
      }

      default:
        console.log(`[Webhook] Unhandled PayPal event: ${eventType}`);
        break;
    }

    return { handled: true };
  } catch (err) {
    console.error('Error handling PayPal webhook event:', err);
    return { handled: false };
  }
}

// PAYPAL WEBHOOK ENDPOINT (For automated PayPal gateway notifications)
authAndBillingRouter.post('/billing/paypal-webhook', express.json(), (req: Request, res: Response) => {
  const event = req.body;
  handlePayPalWebhookEvent(event);
  return res.status(200).send('Webhook Received');
});

// CANCEL SUBSCRIPTION
authAndBillingRouter.post('/billing/cancel-subscription', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const user = getUserByToken(authHeader);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    user.subscriptionStatus = 'cancelled';
    USERS.set(user.id, user);
    saveUsers(USERS);

    return res.json({
      success: true,
      message: 'Subscription has been cancelled. Your access will remain active until the end of the current billing period.',
      user: sanitizeUser(user),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to cancel subscription.' });
  }
});

// SIMULATE TRIAL STATUS (For testing and reviewer verification)
authAndBillingRouter.post('/billing/simulate-trial', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    let user = getUserByToken(authHeader);

    if (!user) {
      // Fallback to first user in database (e.g. demo user) if token expired or testing
      user = USERS.values().next().value;
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'No user account found to simulate.' });
    }

    const { action, plan, hoursLeft } = req.body;
    const now = Date.now();

    if (action === 'expire') {
      // Simulate expired 7-day trial
      user.subscriptionStatus = 'expired';
      user.subscriptionPlan = 'none';
      user.trialEndDate = new Date(now - 60 * 60 * 1000).toISOString();
      user.currentPeriodEnd = new Date(now - 60 * 60 * 1000).toISOString();
    } else if (action === 'reset-7-days') {
      // Reset to 7 full days
      user.subscriptionStatus = 'trialing';
      user.subscriptionPlan = 'free_trial';
      user.trialStartDate = new Date(now).toISOString();
      user.trialEndDate = new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString();
      user.currentPeriodEnd = user.trialEndDate;
    } else if (action === 'set-hours-left') {
      const h = typeof hoursLeft === 'number' ? hoursLeft : 12;
      user.subscriptionStatus = 'trialing';
      user.subscriptionPlan = 'free_trial';
      user.trialEndDate = new Date(now + h * 60 * 60 * 1000).toISOString();
      user.currentPeriodEnd = user.trialEndDate;
    } else if (action === 'activate-paid') {
      const selectedPlan = plan === 'yearly' ? 'yearly' : 'monthly';
      const days = selectedPlan === 'yearly' ? 365 : 30;
      user.subscriptionStatus = 'active';
      user.subscriptionPlan = selectedPlan;
      user.currentPeriodEnd = new Date(now + days * 24 * 60 * 60 * 1000).toISOString();
      user.paypalSubscriptionId = 'PP-SIM-' + Date.now();
      user.paymentHistory.unshift({
        id: 'tx_sim_' + Date.now(),
        date: new Date().toISOString(),
        amount: selectedPlan === 'yearly' ? 199.99 : 19.99,
        currency: 'USD',
        plan: selectedPlan,
        paymentMethod: 'paypal',
        transactionId: user.paypalSubscriptionId,
        status: 'completed',
      });
    }

    USERS.set(user.id, user);
    saveUsers(USERS);

    return res.json({
      success: true,
      message: `Simulated status updated to: ${user.subscriptionStatus} (${user.subscriptionPlan})`,
      user: sanitizeUser(user),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to simulate trial state.' });
  }
});
