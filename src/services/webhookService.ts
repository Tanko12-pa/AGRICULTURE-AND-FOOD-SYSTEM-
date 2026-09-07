import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import firebaseConfig from '../../firebase-applet-config.json';

export interface WebhookVerificationResult {
  verified: boolean;
  status: 'VERIFIED' | 'FAILED' | 'SKIPPED_NO_SECRET';
  message: string;
  algorithm?: string;
}

export interface WebhookEventProcessResult {
  handled: boolean;
  action: string;
  email?: string;
  userId?: string;
  firestoreUpdated?: boolean;
  error?: string;
}

const PAYPAL_BASE = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
const PAYPAL_PLAN_ID_YEARLY = process.env.PAYPAL_PLAN_ID_YEARLY || 'P-7BJ4281497082825YNKOQJBI';
const PAYPAL_PLAN_ID_MONTHLY = process.env.PAYPAL_PLAN_ID_MONTHLY || 'P-3NN56131X8898472BNKOQFNQ';

/**
 * Signature verification for PayPal webhooks using Node.js crypto library and PAYPAL_CLIENT_SECRET.
 * Validates HMAC-SHA256 signatures, canonical payloads, and authentication tokens.
 */
export async function verifyPayPalWebhookSignature(req: {
  headers: Record<string, any>;
  body: any;
  rawBody?: string;
}): Promise<WebhookVerificationResult> {
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
  const webhookId = process.env.PAYPAL_WEBHOOK_ID || 'WH-AGRI-SYSTEM-2026';

  // If PAYPAL_CLIENT_SECRET is missing, notify development mode
  if (!clientSecret) {
    return {
      verified: true,
      status: 'SKIPPED_NO_SECRET',
      message: 'PAYPAL_CLIENT_SECRET is not configured in environment. Webhook processed in development sandbox mode.',
    };
  }

  const transmissionSig = (
    req.headers['paypal-transmission-sig'] ||
    req.headers['x-paypal-signature'] ||
    req.headers['paypal-signature']
  ) as string | undefined;

  const authAlgo = req.headers['paypal-auth-algo'] as string | undefined;
  const certUrl = req.headers['paypal-cert-url'] as string | undefined;
  const transmissionId = req.headers['paypal-transmission-id'] as string | undefined;
  const transmissionTime = req.headers['paypal-transmission-time'] as string | undefined;
  const secretHeader = (
    req.headers['x-paypal-secret-token'] ||
    req.headers['authorization']
  ) as string | undefined;

  // 1. Direct Secret Token Verification
  if (secretHeader && (secretHeader === clientSecret || secretHeader === `Bearer ${clientSecret}`)) {
    return {
      verified: true,
      status: 'VERIFIED',
      algorithm: 'SECRET_TOKEN',
      message: 'Authenticated via PAYPAL_CLIENT_SECRET bearer token header.',
    };
  }

  // 2. Direct HMAC-SHA256 signature verification with PAYPAL_CLIENT_SECRET
  if (transmissionSig) {
    const rawBody = req.rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
    const expectedHex = crypto.createHmac('sha256', clientSecret).update(rawBody).digest('hex');
    const expectedBase64 = crypto.createHmac('sha256', clientSecret).update(rawBody).digest('base64');

    if (
      transmissionSig === expectedHex ||
      transmissionSig === `sha256=${expectedHex}` ||
      transmissionSig === expectedBase64
    ) {
      return {
        verified: true,
        status: 'VERIFIED',
        algorithm: 'HMAC-SHA256',
        message: 'Signature verified successfully via HMAC-SHA256 using PAYPAL_CLIENT_SECRET.',
      };
    }

    // Canonical PayPal transmission payload: transmission_id|transmission_time|webhook_id|payload
    if (transmissionId && transmissionTime) {
      const canonicalPayload = `${transmissionId}|${transmissionTime}|${webhookId}|${rawBody}`;
      const canonicalHex = crypto.createHmac('sha256', clientSecret).update(canonicalPayload).digest('hex');
      const canonicalBase64 = crypto.createHmac('sha256', clientSecret).update(canonicalPayload).digest('base64');

      if (transmissionSig === canonicalHex || transmissionSig === canonicalBase64) {
        return {
          verified: true,
          status: 'VERIFIED',
          algorithm: 'HMAC-SHA256-CANONICAL',
          message: 'Signature verified via canonical HMAC-SHA256 with PAYPAL_CLIENT_SECRET.',
        };
      }
    }
  }

  // 3. Fallback to PayPal REST API verification using credentials if transmission headers are present
  if (authAlgo && certUrl && transmissionId && transmissionSig && transmissionTime) {
    try {
      const clientId = process.env.PAYPAL_CLIENT_ID;
      if (clientId && clientSecret) {
        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const tokenRes = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
          method: 'POST',
          body: 'grant_type=client_credentials',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        if (tokenRes.ok) {
          const tokenData = (await tokenRes.json()) as any;
          const accessToken = tokenData?.access_token;

          if (accessToken) {
            const verifyRes = await fetch(`${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                auth_algo: authAlgo,
                cert_url: certUrl,
                transmission_id: transmissionId,
                transmission_sig: transmissionSig,
                transmission_time: transmissionTime,
                webhook_id: webhookId,
                webhook_event: req.body,
              }),
            });

            if (verifyRes.ok) {
              const verifyData = (await verifyRes.json()) as any;
              if (verifyData?.verification_status === 'SUCCESS') {
                return {
                  verified: true,
                  status: 'VERIFIED',
                  algorithm: authAlgo,
                  message: 'Verified by PayPal REST verification endpoint using PAYPAL_CLIENT_SECRET.',
                };
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('[PayPal Webhook] REST API verification attempt exception:', err);
    }
  }

  // Reject unauthorized / tampered requests
  return {
    verified: false,
    status: 'FAILED',
    message: 'Signature verification failed. Incoming request does not match authentic PAYPAL_CLIENT_SECRET signature.',
  };
}

/**
 * Update user document and subscription record in Cloud Firestore via REST API
 */
export async function updateUserSubscriptionInFirestore(params: {
  userId?: string;
  email: string;
  status: 'active' | 'cancelled' | 'trialing' | 'expired';
  plan: 'monthly' | 'yearly' | 'none';
  subscriptionId?: string;
  currentPeriodEnd?: string;
}): Promise<boolean> {
  const { projectId, firestoreDatabaseId, apiKey } = firebaseConfig;

  if (!projectId || !firestoreDatabaseId) {
    console.warn('[Firestore] Missing project or database configuration');
    return false;
  }

  try {
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents`;
    const docId = params.userId || ('usr_' + params.email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase());

    // Patch or create document in 'users' collection
    const userDocUrl = `${baseUrl}/users/${docId}?updateMask.fieldPaths=subscriptionStatus&updateMask.fieldPaths=subscriptionPlan&updateMask.fieldPaths=currentPeriodEnd&updateMask.fieldPaths=paypalSubscriptionId&updateMask.fieldPaths=email&updateMask.fieldPaths=updatedAt&key=${apiKey}`;

    const patchBody = {
      fields: {
        subscriptionStatus: { stringValue: params.status },
        subscriptionPlan: { stringValue: params.plan },
        currentPeriodEnd: { stringValue: params.currentPeriodEnd || new Date().toISOString() },
        paypalSubscriptionId: { stringValue: params.subscriptionId || '' },
        email: { stringValue: params.email },
        updatedAt: { stringValue: new Date().toISOString() },
      },
    };

    const res = await fetch(userDocUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patchBody),
    });

    if (!res.ok) {
      console.warn('[Firestore REST] Failed to patch users collection:', res.status, await res.text());
    } else {
      console.log(`[Firestore REST] Successfully updated user document ${docId} to ${params.status}`);
    }

    // Also update document in 'subscriptions' collection
    const subDocId = params.subscriptionId || ('sub_' + docId);
    const subDocUrl = `${baseUrl}/subscriptions/${subDocId}?updateMask.fieldPaths=status&updateMask.fieldPaths=plan&updateMask.fieldPaths=userId&updateMask.fieldPaths=userEmail&updateMask.fieldPaths=subscriptionID&updateMask.fieldPaths=currentPeriodEnd&updateMask.fieldPaths=updatedAt&key=${apiKey}`;

    const subPatchBody = {
      fields: {
        status: { stringValue: params.status },
        plan: { stringValue: params.plan },
        userId: { stringValue: docId },
        userEmail: { stringValue: params.email },
        subscriptionID: { stringValue: params.subscriptionId || subDocId },
        currentPeriodEnd: { stringValue: params.currentPeriodEnd || new Date().toISOString() },
        updatedAt: { stringValue: new Date().toISOString() },
      },
    };

    await fetch(subDocUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subPatchBody),
    });

    return true;
  } catch (error) {
    console.error('[Firestore REST] Error updating subscription in Firestore:', error);
    return false;
  }
}

/**
 * Update local users-db.json file for server sessions
 */
function updateLocalUsersDb(params: {
  email: string;
  status: 'active' | 'cancelled';
  plan: 'monthly' | 'yearly';
  subscriptionId?: string;
  currentPeriodEnd: string;
}): void {
  try {
    const dbFile = path.join(process.cwd(), 'users-db.json');
    if (!fs.existsSync(dbFile)) return;

    const data = fs.readFileSync(dbFile, 'utf-8');
    const users: any[] = JSON.parse(data);

    let found = false;
    for (const u of users) {
      if (
        u.email?.toLowerCase() === params.email.toLowerCase() ||
        (params.subscriptionId && u.paypalSubscriptionId === params.subscriptionId)
      ) {
        u.subscriptionStatus = params.status;
        u.subscriptionPlan = params.plan;
        u.currentPeriodEnd = params.currentPeriodEnd;
        if (params.subscriptionId) u.paypalSubscriptionId = params.subscriptionId;
        found = true;
        break;
      }
    }

    if (found) {
      fs.writeFileSync(dbFile, JSON.stringify(users, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('[Local Users DB] Notice updating users-db.json:', err);
  }
}

/**
 * Securely process PayPal subscription events and update Firestore user documents
 */
export async function processPayPalWebhookEvent(event: any): Promise<WebhookEventProcessResult> {
  if (!event || !event.event_type) {
    return { handled: false, action: 'none', error: 'Missing event payload or event_type' };
  }

  const eventType = event.event_type;
  const resource = event.resource || {};
  const email =
    resource?.subscriber?.email_address ||
    resource?.payer?.email_address ||
    resource?.custom_id ||
    'akindewum@gmail.com'; // Default target account fallback

  const subscriptionId = resource?.id || resource?.billing_agreement_id || '';
  const planId = resource?.plan_id || '';
  const isYearly = planId === PAYPAL_PLAN_ID_YEARLY || planId.includes('YEAR');
  const planType: 'monthly' | 'yearly' = isYearly ? 'yearly' : 'monthly';
  const durationDays = isYearly ? 365 : 30;

  try {
    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        const currentPeriodEnd = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

        // 1. Update Cloud Firestore
        const firestoreSuccess = await updateUserSubscriptionInFirestore({
          email,
          status: 'active',
          plan: planType,
          subscriptionId,
          currentPeriodEnd,
        });

        // 2. Update local server database
        updateLocalUsersDb({
          email,
          status: 'active',
          plan: planType,
          subscriptionId,
          currentPeriodEnd,
        });

        console.log(`[PayPal Webhook] Activated subscription for ${email} until ${currentPeriodEnd}`);
        return {
          handled: true,
          action: 'activated',
          email,
          firestoreUpdated: firestoreSuccess,
        };
      }

      case 'PAYMENT.SALE.COMPLETED': {
        const currentPeriodEnd = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

        const firestoreSuccess = await updateUserSubscriptionInFirestore({
          email,
          status: 'active',
          plan: planType,
          subscriptionId,
          currentPeriodEnd,
        });

        updateLocalUsersDb({
          email,
          status: 'active',
          plan: planType,
          subscriptionId,
          currentPeriodEnd,
        });

        console.log(`[PayPal Webhook] Recurring payment sale completed for ${email}`);
        return {
          handled: true,
          action: 'payment_sale_completed',
          email,
          firestoreUpdated: firestoreSuccess,
        };
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        const firestoreSuccess = await updateUserSubscriptionInFirestore({
          email,
          status: 'cancelled',
          plan: 'none',
          subscriptionId,
        });

        updateLocalUsersDb({
          email,
          status: 'cancelled',
          plan: planType,
          subscriptionId,
          currentPeriodEnd: new Date().toISOString(),
        });

        console.log(`[PayPal Webhook] Cancelled subscription for ${email}`);
        return {
          handled: true,
          action: 'cancelled',
          email,
          firestoreUpdated: firestoreSuccess,
        };
      }

      default:
        console.log(`[PayPal Webhook] Received unhandled event: ${eventType}`);
        return { handled: true, action: `unhandled_${eventType}`, email };
    }
  } catch (error: any) {
    console.error('[PayPal Webhook] Error processing event:', error);
    return { handled: false, action: 'error', error: error.message };
  }
}
