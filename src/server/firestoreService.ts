import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export async function getFirestoreCollection<T = any>(collectionName: string): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    if (snap.empty) return [];
    return snap.docs.map((d) => ({ ...d.data(), id: d.id })) as T[];
  } catch (error) {
    console.error(`Error fetching collection ${collectionName}:`, error);
    return [];
  }
}

export async function getFirestoreDocument<T = any>(collectionName: string, docId: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, docId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { ...snap.data(), id: snap.id } as T;
  } catch (error) {
    console.error(`Error fetching doc ${collectionName}/${docId}:`, error);
    return null;
  }
}

export async function setFirestoreDocument(
  collectionName: string,
  docId: string,
  data: Record<string, any>
): Promise<any> {
  try {
    const cleanData: Record<string, any> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) cleanData[k] = v;
    }
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, cleanData, { merge: true });
    return { ...cleanData, id: docId };
  } catch (error) {
    console.error(`Error saving doc ${collectionName}/${docId}:`, error);
    throw error;
  }
}

export async function deleteFirestoreDocument(collectionName: string, docId: string): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting doc ${collectionName}/${docId}:`, error);
    return false;
  }
}
