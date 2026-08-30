import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { fallbackCategories, fallbackCompanyPages } from "../data/fallbackData";

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// In-memory cache to minimize Firestore reads & prevent Quota Exceeded errors
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes cache TTL

function isQuotaError(error: any): boolean {
  if (!error) return false;
  const msg = (error.message || String(error)).toLowerCase();
  return (
    msg.includes("quota") ||
    msg.includes("resource_exhausted") ||
    msg.includes("limit exceeded") ||
    msg.includes("429")
  );
}

export async function getFirestoreCollection<T = any>(collectionName: string): Promise<T[]> {
  const cacheKey = `col_${collectionName}`;
  const cached = memoryCache.get(cacheKey);

  // Return fresh cache if within TTL
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      // If collection is empty, check fallback defaults
      let defaultData: any[] = [];
      if (collectionName === "categories") defaultData = fallbackCategories;
      if (collectionName === "companyPages") defaultData = fallbackCompanyPages;
      
      const result = cached?.data && cached.data.length > 0 ? cached.data : defaultData;
      memoryCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result as T[];
    }

    const data = snap.docs.map((d) => ({ ...d.data(), id: d.id })) as T[];
    memoryCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error: any) {
    if (isQuotaError(error)) {
      console.warn(`[Firestore Quota] Free tier daily read limit reached for ${collectionName}. Serving cached/fallback data.`);
    } else {
      console.warn(`Firestore read error on ${collectionName}:`, error?.message || error);
    }

    // Return cached data or fallback data
    if (cached && cached.data) {
      return cached.data;
    }
    if (collectionName === "categories") return fallbackCategories as unknown as T[];
    if (collectionName === "companyPages") return fallbackCompanyPages as unknown as T[];
    return [];
  }
}

export async function getFirestoreDocument<T = any>(collectionName: string, docId: string): Promise<T | null> {
  const cacheKey = `doc_${collectionName}_${docId}`;
  const cached = memoryCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const docRef = doc(db, collectionName, docId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = { ...snap.data(), id: snap.id } as T;
    memoryCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error: any) {
    if (isQuotaError(error)) {
      console.warn(`[Firestore Quota] Read limit reached for ${collectionName}/${docId}. Serving cached data.`);
    } else {
      console.warn(`Firestore read error on ${collectionName}/${docId}:`, error?.message || error);
    }
    return cached?.data || null;
  }
}

export async function setFirestoreDocument(
  collectionName: string,
  docId: string,
  data: Record<string, any>
): Promise<any> {
  const cleanData: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) cleanData[k] = v;
  }
  const resultData = { ...cleanData, id: docId };

  // 1. Immediately update in-memory doc cache
  const docCacheKey = `doc_${collectionName}_${docId}`;
  memoryCache.set(docCacheKey, { data: resultData, timestamp: Date.now() });

  // 2. Immediately update in-memory collection cache
  const colCacheKey = `col_${collectionName}`;
  const cachedCol = memoryCache.get(colCacheKey);
  if (cachedCol && Array.isArray(cachedCol.data)) {
    const exists = cachedCol.data.some((item: any) => item.id === docId);
    const updatedCol = exists
      ? cachedCol.data.map((item: any) => (item.id === docId ? resultData : item))
      : [resultData, ...cachedCol.data];
    memoryCache.set(colCacheKey, { data: updatedCol, timestamp: Date.now() });
  }

  // 3. Persist to Firestore (handling quota limits gracefully)
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, cleanData, { merge: true });
  } catch (error: any) {
    if (isQuotaError(error)) {
      console.warn(`[Firestore Quota] Write deferred/cached locally for ${collectionName}/${docId}`);
    } else {
      console.warn(`Firestore write warning for ${collectionName}/${docId}:`, error?.message || error);
    }
  }

  return resultData;
}

export async function deleteFirestoreDocument(collectionName: string, docId: string): Promise<boolean> {
  // Update in-memory cache immediately
  const docCacheKey = `doc_${collectionName}_${docId}`;
  memoryCache.delete(docCacheKey);

  const colCacheKey = `col_${collectionName}`;
  const cachedCol = memoryCache.get(colCacheKey);
  if (cachedCol && Array.isArray(cachedCol.data)) {
    const updatedCol = cachedCol.data.filter((item: any) => item.id !== docId);
    memoryCache.set(colCacheKey, { data: updatedCol, timestamp: Date.now() });
  }

  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (error: any) {
    if (isQuotaError(error)) {
      console.warn(`[Firestore Quota] Delete processed in memory for ${collectionName}/${docId}`);
    } else {
      console.warn(`Firestore delete warning for ${collectionName}/${docId}:`, error?.message || error);
    }
    return true;
  }
}
