import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  onValue,
  set,
  update,
  remove,
  onDisconnect,
  type Database,
  type DatabaseReference,
  type Unsubscribe,
} from 'firebase/database';
import { getFirebaseConfig, isFirebaseConfigured } from './config';

let app: FirebaseApp | null = null;
let database: Database | null = null;
let firebaseConnected = false;

export function initFirebase(): Database | null {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase not configured');
    return null;
  }
  if (database) return database;

  app = initializeApp(getFirebaseConfig());
  database = getDatabase(app);

  const connectedRef = ref(database, '.info/connected');
  onValue(connectedRef, (snapshot) => {
    firebaseConnected = snapshot.val() === true;
  });

  return database;
}

export function getDb(): Database | null {
  return database ?? initFirebase();
}

export function isDbConnected(): boolean {
  return firebaseConnected;
}

export function tenantRef(tenantId: string, collection: string): DatabaseReference | null {
  const db = getDb();
  if (!db) return null;
  return ref(db, `tenants/${tenantId}/${collection}`);
}

export function pathRef(path: string): DatabaseReference | null {
  const db = getDb();
  if (!db) return null;
  return ref(db, path);
}

export async function firebaseWrite(
  path: string,
  data: unknown,
  method: 'set' | 'update' | 'remove' = 'set'
): Promise<void> {
  const dbRef = pathRef(path);
  if (!dbRef) throw new Error('Database not available');

  if (method === 'remove') {
    await remove(dbRef);
  } else if (method === 'update') {
    await update(dbRef, data as Record<string, unknown>);
  } else {
    await set(dbRef, data);
  }
}

export function subscribeCollection<T>(
  tenantId: string,
  collection: string,
  callback: (items: T[]) => void
): Unsubscribe | null {
  const dbRef = tenantRef(tenantId, collection);
  if (!dbRef) return null;

  return onValue(dbRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    if (Array.isArray(data)) {
      callback(data as T[]);
    } else {
      callback(Object.values(data) as T[]);
    }
  });
}

export function subscribeRecord<T>(
  tenantId: string,
  collection: string,
  callback: (record: T | Record<string, T>) => void
): Unsubscribe | null {
  const dbRef = tenantRef(tenantId, collection);
  if (!dbRef) return null;

  return onValue(dbRef, (snapshot) => {
    callback((snapshot.val() || (collection === 'deletedTasks' ? {} : [])) as T | Record<string, T>);
  });
}

export { onDisconnect };
