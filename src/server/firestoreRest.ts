import firebaseConfig from "../../firebase-applet-config.json";

const PROJECT_ID = firebaseConfig.projectId;
const DATABASE_ID = firebaseConfig.firestoreDatabaseId || "(default)";
const API_KEY = firebaseConfig.apiKey;

const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;

// Helper: Convert Firestore REST JSON format to Plain JS Object
function fromFirestore(fields: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(fields)) {
    if (!val || typeof val !== "object") continue;
    if ("stringValue" in val) result[key] = val.stringValue;
    else if ("integerValue" in val) result[key] = parseInt(val.integerValue, 10);
    else if ("doubleValue" in val) result[key] = parseFloat(val.doubleValue);
    else if ("booleanValue" in val) result[key] = val.booleanValue;
    else if ("timestampValue" in val) result[key] = val.timestampValue;
    else if ("nullValue" in val) result[key] = null;
    else if ("arrayValue" in val) {
      result[key] = (val.arrayValue.values || []).map((v: any) => {
        if ("stringValue" in v) return v.stringValue;
        if ("integerValue" in v) return parseInt(v.integerValue, 10);
        if ("doubleValue" in v) return parseFloat(v.doubleValue);
        if ("booleanValue" in v) return v.booleanValue;
        if ("mapValue" in v) return fromFirestore(v.mapValue.fields || {});
        return null;
      });
    } else if ("mapValue" in val) {
      result[key] = fromFirestore(val.mapValue.fields || {});
    }
  }
  return result;
}

// Helper: Convert Plain JS Object to Firestore REST JSON format
function toFirestore(obj: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined) continue;
    if (val === null) {
      fields[key] = { nullValue: null };
    } else if (typeof val === "string") {
      fields[key] = { stringValue: val };
    } else if (typeof val === "number") {
      if (Number.isInteger(val)) fields[key] = { integerValue: val.toString() };
      else fields[key] = { doubleValue: val };
    } else if (typeof val === "boolean") {
      fields[key] = { booleanValue: val };
    } else if (Array.isArray(val)) {
      fields[key] = {
        arrayValue: {
          values: val.map((item) => {
            if (typeof item === "string") return { stringValue: item };
            if (typeof item === "number") return Number.isInteger(item) ? { integerValue: item.toString() } : { doubleValue: item };
            if (typeof item === "boolean") return { booleanValue: item };
            if (typeof item === "object" && item !== null) return { mapValue: { fields: toFirestore(item) } };
            return { stringValue: String(item) };
          }),
        },
      };
    } else if (typeof val === "object") {
      fields[key] = { mapValue: { fields: toFirestore(val) } };
    }
  }
  return fields;
}

// In-memory cache to prevent excessive roundtrips while ensuring low latency
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const cache: Record<string, CacheEntry<any>> = {};
const CACHE_TTL_MS = 3000; // 3 seconds cache

export async function getFirestoreCollection<T = any>(collectionName: string): Promise<T[]> {
  const cacheKey = `col_${collectionName}`;
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const url = `${BASE_URL}/${collectionName}?key=${API_KEY}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      if (res.status === 404) return [];
      console.warn(`Firestore REST collection ${collectionName} returned ${res.status}`);
      return cached ? cached.data : [];
    }
    const data = await res.json();
    if (!data.documents || !Array.isArray(data.documents)) {
      return [];
    }
    const docs = data.documents.map((doc: any) => {
      const id = doc.name ? doc.name.split("/").pop() : "";
      const parsed = doc.fields ? fromFirestore(doc.fields) : {};
      return { ...parsed, id: parsed.id || id };
    });

    cache[cacheKey] = { data: docs, timestamp: Date.now() };
    return docs;
  } catch (error) {
    console.warn(`Error fetching Firestore collection ${collectionName}:`, error);
    return cached ? cached.data : [];
  }
}

export async function getFirestoreDocument<T = any>(collectionName: string, docId: string): Promise<T | null> {
  const cacheKey = `doc_${collectionName}_${docId}`;
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const url = `${BASE_URL}/${collectionName}/${docId}?key=${API_KEY}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      if (res.status === 404) return null;
      return cached ? cached.data : null;
    }
    const doc = await res.json();
    const parsed = doc.fields ? fromFirestore(doc.fields) : {};
    const result = { ...parsed, id: docId } as T;
    cache[cacheKey] = { data: result, timestamp: Date.now() };
    return result;
  } catch (error) {
    console.warn(`Error fetching Firestore doc ${collectionName}/${docId}:`, error);
    return cached ? cached.data : null;
  }
}

export async function setFirestoreDocument(collectionName: string, docId: string, data: Record<string, any>): Promise<any> {
  try {
    const fields = toFirestore(data);
    const url = `${BASE_URL}/${collectionName}/${docId}?key=${API_KEY}`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
    });
    delete cache[`col_${collectionName}`];
    delete cache[`doc_${collectionName}_${docId}`];
    if (res.ok) {
      const updated = await res.json();
      return fromFirestore(updated.fields || {});
    }
  } catch (error) {
    console.error(`Error saving Firestore doc ${collectionName}/${docId}:`, error);
  }
  return data;
}

export async function deleteFirestoreDocument(collectionName: string, docId: string): Promise<boolean> {
  try {
    const url = `${BASE_URL}/${collectionName}/${docId}?key=${API_KEY}`;
    const res = await fetch(url, {
      method: "DELETE",
    });
    delete cache[`col_${collectionName}`];
    delete cache[`doc_${collectionName}_${docId}`];
    return res.ok;
  } catch (error) {
    console.error(`Error deleting Firestore doc ${collectionName}/${docId}:`, error);
    return false;
  }
}
