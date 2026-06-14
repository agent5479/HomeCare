import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { TenantCollection, TenantData } from '@/types';

interface CareMarshallDB extends DBSchema {
  tenantData: {
    key: string;
    value: {
      data: unknown;
      updatedAt: string;
    };
  };
}

const DB_NAME = 'caremarshall-cache';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<CareMarshallDB>> | null = null;

function getDb(): Promise<IDBPDatabase<CareMarshallDB>> {
  if (!dbPromise) {
    dbPromise = openDB<CareMarshallDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('tenantData')) {
          db.createObjectStore('tenantData');
        }
      },
    });
  }
  return dbPromise;
}

function cacheKey(tenantId: string, collection: TenantCollection): string {
  return `tenant/${tenantId}/${collection}`;
}

export async function saveToCache(
  tenantId: string,
  collection: TenantCollection,
  data: unknown
): Promise<void> {
  const db = await getDb();
  await db.put('tenantData', { data, updatedAt: new Date().toISOString() }, cacheKey(tenantId, collection));
}

export async function loadFromCache<T>(
  tenantId: string,
  collection: TenantCollection
): Promise<T | null> {
  const db = await getDb();
  const entry = await db.get('tenantData', cacheKey(tenantId, collection));
  return entry ? (entry.data as T) : null;
}

export async function loadAllTenantData(tenantId: string): Promise<Partial<TenantData>> {
  const collections: TenantCollection[] = [
    'sites',
    'actions',
    'scheduledTasks',
    'individualHives',
    'tasks',
    'employees',
    'visits',
    'taskGroups',
    'deletedTasks',
  ];

  const result: Partial<TenantData> = {};

  await Promise.all(
    collections.map(async (col) => {
      const data = await loadFromCache(tenantId, col);
      if (data !== null) {
        (result as Record<string, unknown>)[col] = data;
      }
    })
  );

  return result;
}

export async function clearTenantCache(tenantId: string): Promise<void> {
  const db = await getDb();
  const keys = await db.getAllKeys('tenantData');
  const tenantPrefix = `tenant/${tenantId}/`;
  await Promise.all(
    keys.filter((k) => k.startsWith(tenantPrefix)).map((k) => db.delete('tenantData', k))
  );
}

export async function getCacheAge(tenantId: string): Promise<string | null> {
  const db = await getDb();
  const entry = await db.get('tenantData', cacheKey(tenantId, 'sites'));
  return entry?.updatedAt ?? null;
}

export function parseCollectionFromPath(path: string): { tenantId: string; collection: TenantCollection } | null {
  const match = path.match(/^tenants\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  const collection = match[2] as TenantCollection;
  const valid: TenantCollection[] = [
    'sites', 'actions', 'scheduledTasks', 'individualHives',
    'tasks', 'employees', 'visits', 'taskGroups', 'deletedTasks',
  ];
  if (!valid.includes(collection)) return null;
  return { tenantId: match[1], collection };
}

export async function applyOptimisticCacheUpdate(
  path: string,
  data: unknown,
  method: 'set' | 'update' | 'remove'
): Promise<void> {
  const parsed = parseCollectionFromPath(path);
  if (!parsed) return;

  const { tenantId, collection } = parsed;
  const existing = await loadFromCache<unknown[] | Record<string, unknown>>(tenantId, collection);

  if (collection === 'deletedTasks') {
    if (method === 'remove') return;
    const record = (existing as Record<string, unknown>) || {};
    if (method === 'update' && typeof data === 'object' && data) {
      await saveToCache(tenantId, collection, { ...record, ...(data as Record<string, unknown>) });
    } else {
      await saveToCache(tenantId, collection, data);
    }
    return;
  }

  let items = Array.isArray(existing) ? [...existing] : [];

  if (method === 'remove') {
    const idMatch = path.match(/\/([^/]+)$/);
    if (idMatch) {
      const id = idMatch[1];
      items = items.filter((item) => String((item as { id?: string | number }).id) !== id);
    }
  } else if (method === 'update' && typeof data === 'object' && data) {
    const idMatch = path.match(/\/([^/]+)$/);
    if (idMatch) {
      const id = idMatch[1];
      items = items.map((item) =>
        String((item as { id?: string | number }).id) === id
          ? { ...(item as object), ...(data as object) }
          : item
      );
    }
  } else {
    const record = data as { id?: string | number };
    if (record?.id != null) {
      const idx = items.findIndex((i) => String((i as { id?: string | number }).id) === String(record.id));
      if (idx >= 0) {
        items[idx] = record;
      } else {
        items.push(record);
      }
    } else {
      items.push(data);
    }
  }

  await saveToCache(tenantId, collection, items);
}
