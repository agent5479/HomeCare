import { firebaseWrite, isDbConnected } from './firebase';
import { applyOptimisticCacheUpdate } from './offlineCache';
import { syncManager } from './syncManager';

export async function mutate(
  path: string,
  data: unknown,
  type: string,
  method: 'set' | 'update' | 'remove' = 'set',
  onOptimistic?: () => void
): Promise<void> {
  await applyOptimisticCacheUpdate(path, data, method);
  onOptimistic?.();

  const isOnline = navigator.onLine && isDbConnected();

  if (isOnline) {
    syncManager.updateSyncStatus('syncing', 'Saving...');
    try {
      await firebaseWrite(path, data, method);
      syncManager.updateSyncStatus('synced');
    } catch {
      syncManager.enqueue({ type, path, data, method });
      syncManager.updateSyncStatus('offline', 'Saved locally, will sync later');
    }
  } else {
    syncManager.enqueue({ type, path, data, method });
    syncManager.updateSyncStatus('offline', 'Saved locally, will sync later');
  }
}

export function tenantPath(tenantId: string, collection: string, id?: string | number): string {
  return id != null
    ? `tenants/${tenantId}/${collection}/${id}`
    : `tenants/${tenantId}/${collection}`;
}
