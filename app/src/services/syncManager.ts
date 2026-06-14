import type { PendingChange, SyncStatus } from '@/types';
import { firebaseWrite, isDbConnected } from './firebase';

const STORAGE_KEY = 'homeCarePendingChanges';
const LEGACY_KEY = 'beeMarshallPendingChanges';

type StatusListener = (status: SyncStatus, details: string, pendingCount: number) => void;

class SyncManager {
  isOnline = navigator.onLine;
  syncStatus: SyncStatus = 'synced';
  pendingChanges: PendingChange[] = [];
  syncInProgress = false;
  lastSyncTime: Date | null = null;
  retryAttempts = 0;
  maxRetries = 3;
  private listeners = new Set<StatusListener>();
  private staleData = false;

  constructor() {
    this.loadPendingChanges();
    this.setupEventListeners();
  }

  subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    listener(this.syncStatus, this.getDetails(), this.pendingChanges.length);
    return () => this.listeners.delete(listener);
  }

  setStaleData(stale: boolean) {
    this.staleData = stale;
    this.notify();
  }

  private notify() {
    const details = this.getDetails();
    this.listeners.forEach((l) => l(this.syncStatus, details, this.pendingChanges.length));
  }

  private getDetails(): string {
    if (this.syncStatus === 'synced' && this.staleData) {
      return 'Showing cached data';
    }
    if (this.syncStatus === 'synced' && this.lastSyncTime) {
      return `Last sync: ${this.lastSyncTime.toLocaleTimeString()}`;
    }
    if (this.syncStatus === 'offline') {
      return `${this.pendingChanges.length} changes pending`;
    }
    return '';
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateSyncStatus('syncing');
      this.processPendingChanges();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateSyncStatus('offline');
    });
  }

  onFirebaseConnectionChange(connected: boolean) {
    if (connected && this.isOnline) {
      this.updateSyncStatus('synced');
      if (this.pendingChanges.length > 0) {
        this.processPendingChanges();
      }
    } else if (!connected && this.isOnline) {
      this.updateSyncStatus('error', 'Connection unstable');
    }
  }

  updateSyncStatus(status: SyncStatus, details?: string) {
    this.syncStatus = status;
    if (status === 'synced') {
      this.lastSyncTime = new Date();
      this.retryAttempts = 0;
    }
    this.notify();
    if (details) {
      this.listeners.forEach((l) => l(status, details, this.pendingChanges.length));
    }
  }

  enqueue(change: Omit<PendingChange, 'id' | 'timestamp'>) {
    const changeWithId: PendingChange = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      ...change,
    };
    this.pendingChanges.push(changeWithId);
    this.savePendingChanges();
    this.notify();

    if (this.isOnline && !this.syncInProgress && isDbConnected()) {
      this.processPendingChanges();
    }
  }

  async processPendingChanges() {
    if (this.syncInProgress || this.pendingChanges.length === 0 || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    this.updateSyncStatus('syncing', `Syncing ${this.pendingChanges.length} changes...`);

    const changesToProcess = [...this.pendingChanges];
    const failedChanges: PendingChange[] = [];

    for (const change of changesToProcess) {
      try {
        await this.syncChange(change);
      } catch {
        failedChanges.push(change);
      }
    }

    this.pendingChanges = failedChanges;
    this.savePendingChanges();
    this.syncInProgress = false;

    if (failedChanges.length === 0) {
      this.updateSyncStatus('synced');
    } else {
      this.retryAttempts++;
      if (this.retryAttempts < this.maxRetries) {
        this.updateSyncStatus('error', `Retrying in 5s... (${this.retryAttempts}/${this.maxRetries})`);
        setTimeout(() => this.processPendingChanges(), 5000);
      } else {
        this.updateSyncStatus('offline', 'Some changes failed to sync');
      }
    }
  }

  async syncChange(change: PendingChange) {
    const { path, data, method = 'set' } = change;
    await firebaseWrite(path, data, method as 'set' | 'update' | 'remove');
  }

  savePendingChanges() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.pendingChanges));
    } catch (e) {
      console.error('Failed to save pending changes', e);
    }
  }

  loadPendingChanges() {
    try {
      const stored =
        localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
      if (stored) {
        this.pendingChanges = JSON.parse(stored);
      }
    } catch {
      this.pendingChanges = [];
    }
  }

  clearPendingChanges() {
    this.pendingChanges = [];
    this.savePendingChanges();
    this.notify();
  }

  getStatus() {
    return {
      status: this.syncStatus,
      isOnline: this.isOnline,
      pendingCount: this.pendingChanges.length,
      lastSync: this.lastSyncTime,
      retryAttempts: this.retryAttempts,
      staleData: this.staleData,
    };
  }
}

export const syncManager = new SyncManager();
