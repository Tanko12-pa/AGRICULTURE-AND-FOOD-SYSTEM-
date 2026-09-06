import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { AuthUser, CachedFieldObservation, SoilSensorImportData } from './types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Firebase Authentication instance
export const auth = getAuth(app);

// Cloud Firestore instance with target databaseId
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

/**
 * Synchronize or save user profile to Cloud Firestore
 */
export async function syncUserToFirestore(user: AuthUser): Promise<boolean> {
  try {
    if (!user || !user.id) return false;
    const userRef = doc(db, 'users', user.id);
    await setDoc(
      userRef,
      {
        id: user.id,
        fullName: user.fullName || '',
        email: user.email || '',
        subscriptionStatus: user.subscriptionStatus || 'trialing',
        subscriptionPlan: user.subscriptionPlan || 'free_trial',
        currentPeriodEnd: user.currentPeriodEnd || '',
        paypalSubscriptionId: user.paypalSubscriptionId || '',
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn('Firestore user sync notice:', error);
    return false;
  }
}

/**
 * Retrieve user profile from Cloud Firestore
 */
export async function getUserFromFirestore(userId: string): Promise<Partial<AuthUser> | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as Partial<AuthUser>;
    }
    return null;
  } catch (error) {
    console.warn('Firestore getUser error:', error);
    return null;
  }
}

/**
 * Save field observation to Cloud Firestore
 */
export async function saveObservationToFirestore(
  userId: string,
  observation: CachedFieldObservation
): Promise<string | null> {
  try {
    const colRef = collection(db, 'fieldObservations');
    const docRef = await addDoc(colRef, {
      ...observation,
      userId,
      syncedToFirebaseAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.warn('Firestore observation save notice:', error);
    return null;
  }
}

/**
 * Retrieve recent field observations from Cloud Firestore
 */
export async function getObservationsFromFirestore(
  userId?: string
): Promise<CachedFieldObservation[]> {
  try {
    const colRef = collection(db, 'fieldObservations');
    let q = query(colRef, orderBy('timestamp', 'desc'), limit(50));
    if (userId) {
      q = query(colRef, where('userId', '==', userId), orderBy('timestamp', 'desc'), limit(50));
    }
    const snapshot = await getDocs(q);
    const results: CachedFieldObservation[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      results.push({
        id: docSnap.id,
        timestamp: data.timestamp || new Date().toISOString(),
        location: data.location || '',
        plotSector: data.plotSector || '',
        technicianId: data.technicianId || '',
        cropType: data.cropType || '',
        observedCondition: data.observedCondition || '',
        severity: data.severity || 'low',
        foliarDamagePercent: data.foliarDamagePercent || 0,
        weedCountPerM2: data.weedCountPerM2 || 0,
        pestsIdentified: data.pestsIdentified || [],
        soilMoistureVwc: data.soilMoistureVwc || 0,
        syncStatus: 'synced',
        offlineCaptured: false,
        notes: data.notes || '',
      });
    });
    return results;
  } catch (error) {
    console.warn('Firestore getObservations notice:', error);
    return [];
  }
}

/**
 * Save soil sensor telemetry to Cloud Firestore
 */
export async function saveSoilReadingToFirestore(
  userId: string,
  reading: SoilSensorImportData
): Promise<string | null> {
  try {
    const colRef = collection(db, 'soilReadings');
    const docRef = await addDoc(colRef, {
      ...reading,
      userId,
      syncedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.warn('Firestore soil reading save notice:', error);
    return null;
  }
}

/**
 * Save subscription record to Cloud Firestore
 */
export async function saveSubscriptionToFirestore(
  userId: string,
  subscriptionData: {
    subscriptionID: string;
    plan: string;
    status: string;
    orderId?: string;
  }
): Promise<string | null> {
  try {
    const colRef = collection(db, 'subscriptions');
    const docRef = await addDoc(colRef, {
      userId,
      ...subscriptionData,
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.warn('Firestore subscription save notice:', error);
    return null;
  }
}

export default app;
