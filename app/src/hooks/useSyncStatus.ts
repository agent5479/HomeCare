import { useEffect, useState } from 'react';
import type { SyncStatus } from '@/types';
import { syncManager } from '@/services/syncManager';

export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>('synced');
  const [details, setDetails] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    return syncManager.subscribe((s, d, count) => {
      setStatus(s);
      setDetails(d);
      setPendingCount(count);
    });
  }, []);

  return { status, details, pendingCount, lastSync: syncManager.getStatus().lastSync, isOnline: syncManager.getStatus().isOnline, staleData: syncManager.getStatus().staleData };
}
