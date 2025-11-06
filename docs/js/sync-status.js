// HomeCare - Sync Status Management Module
// Handles real-time sync status display and offline change queuing

class SyncStatusManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.syncStatus = 'synced'; // synced, syncing, offline, error
        this.pendingChanges = [];
        this.syncInProgress = false;
        this.lastSyncTime = null;
        this.retryAttempts = 0;
        this.maxRetries = 3;
        
        // Initialize
        this.loadPendingChanges();
        this.setupEventListeners();
        this.updateDisplay();
        
        console.log('🔄 Sync Status Manager initialized');
    }
    
    setupEventListeners() {
        // Online/offline status
        window.addEventListener('online', () => {
            console.log('🌐 Connection restored');
            this.isOnline = true;
            this.updateSyncStatus('syncing');
            this.processPendingChanges();
        });
        
        window.addEventListener('offline', () => {
            console.log('📴 Connection lost');
            this.isOnline = false;
            this.updateSyncStatus('offline');
        });
        
        // Firebase connection status (if available)
        if (window.database) {
            this.monitorFirebaseConnection();
        }
    }
    
    monitorFirebaseConnection() {
        // Monitor Firebase connection status
        const connectedRef = window.database.ref('.info/connected');
        connectedRef.on('value', (snapshot) => {
            const isConnected = snapshot.val();
            if (isConnected && this.isOnline) {
                this.updateSyncStatus('synced');
            } else if (!isConnected && this.isOnline) {
                this.updateSyncStatus('error');
            }
        });
    }
    
    updateSyncStatus(status, details = '') {
        this.syncStatus = status;
        this.updateDisplay(details);
        
        // Update last sync time for synced status
        if (status === 'synced') {
            this.lastSyncTime = new Date();
            this.retryAttempts = 0;
        }
    }
    
    updateDisplay(details = '') {
        const overlay = document.getElementById('syncStatusOverlay');
        const icon = document.getElementById('syncStatusIcon');
        const text = document.getElementById('syncStatusText');
        const detailsEl = document.getElementById('syncStatusDetails');
        const countEl = document.getElementById('syncStatusCount');
        
        if (!overlay) return;
        
        // Remove all status classes
        overlay.className = 'sync-status-overlay';
        
        // Add appropriate status class
        overlay.classList.add(`sync-status-${this.syncStatus}`);
        
        // Update icon and text based on status
        switch (this.syncStatus) {
            case 'synced':
                icon.className = 'bi bi-cloud-check';
                text.textContent = 'Synced';
                detailsEl.textContent = this.lastSyncTime ? 
                    `Last sync: ${this.lastSyncTime.toLocaleTimeString()}` : '';
                break;
                
            case 'syncing':
                icon.className = 'bi bi-cloud-arrow-up';
                text.textContent = 'Syncing...';
                detailsEl.textContent = details || 'Saving changes...';
                break;
                
            case 'offline':
                icon.className = 'bi bi-cloud-slash';
                text.textContent = 'Offline';
                detailsEl.textContent = `${this.pendingChanges.length} changes pending`;
                break;
                
            case 'error':
                icon.className = 'bi bi-cloud-exclamation';
                text.textContent = 'Sync Error';
                detailsEl.textContent = details || 'Retrying...';
                break;
        }
        
        // Show pending changes count
        if (this.pendingChanges.length > 0) {
            countEl.textContent = this.pendingChanges.length;
            countEl.classList.remove('hidden');
        } else {
            countEl.classList.add('hidden');
        }
    }
    
    // Add a change to the pending queue
    addPendingChange(change) {
        const changeWithId = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            ...change
        };
        
        this.pendingChanges.push(changeWithId);
        this.savePendingChanges();
        this.updateDisplay();
        
        console.log('📝 Added pending change:', changeWithId);
        
        // Try to sync immediately if online
        if (this.isOnline && !this.syncInProgress) {
            this.processPendingChanges();
        }
    }
    
    // Process all pending changes
    async processPendingChanges() {
        if (this.syncInProgress || this.pendingChanges.length === 0 || !this.isOnline) {
            return;
        }
        
        this.syncInProgress = true;
        this.updateSyncStatus('syncing', `Syncing ${this.pendingChanges.length} changes...`);
        
        const changesToProcess = [...this.pendingChanges];
        const successfulChanges = [];
        const failedChanges = [];
        
        for (const change of changesToProcess) {
            try {
                await this.syncChange(change);
                successfulChanges.push(change);
                console.log('✅ Synced change:', change);
            } catch (error) {
                console.error('❌ Failed to sync change:', change, error);
                failedChanges.push(change);
            }
        }
        
        // Remove successful changes from pending
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
    
    // Sync a single change to Firebase
    async syncChange(change) {
        if (!window.database) {
            throw new Error('Database not available');
        }
        
        const { type, path, data, method = 'set' } = change;
        
        return new Promise((resolve, reject) => {
            const ref = window.database.ref(path);
            
            const operation = method === 'update' ? 
                ref.update(data) : 
                ref.set(data);
                
            operation.then(() => {
                resolve();
            }).catch((error) => {
                reject(error);
            });
        });
    }
    
    // Save pending changes to localStorage
    savePendingChanges() {
        try {
            localStorage.setItem('homeCarePendingChanges', JSON.stringify(this.pendingChanges));
        } catch (error) {
            console.error('Failed to save pending changes:', error);
        }
    }
    
    // Load pending changes from localStorage
    loadPendingChanges() {
        try {
            const stored = localStorage.getItem('homeCarePendingChanges') || localStorage.getItem('beeMarshallPendingChanges'); // Backward compatibility
            if (stored) {
                this.pendingChanges = JSON.parse(stored);
                console.log(`📦 Loaded ${this.pendingChanges.length} pending changes from storage`);
            }
        } catch (error) {
            console.error('Failed to load pending changes:', error);
            this.pendingChanges = [];
        }
    }
    
    // Clear all pending changes (for testing or manual reset)
    clearPendingChanges() {
        this.pendingChanges = [];
        this.savePendingChanges();
        this.updateDisplay();
        console.log('🗑️ Cleared all pending changes');
    }
    
    // Get sync status info
    getStatus() {
        return {
            status: this.syncStatus,
            isOnline: this.isOnline,
            pendingCount: this.pendingChanges.length,
            lastSync: this.lastSyncTime,
            retryAttempts: this.retryAttempts
        };
    }
}

// Global sync status manager instance
let syncStatusManager = null;

// Initialize sync status manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    syncStatusManager = new SyncStatusManager();
    
    // Expose to global scope for debugging
    window.syncStatusManager = syncStatusManager;
});

// Helper functions for easy integration
function addPendingChange(change) {
    if (syncStatusManager) {
        syncStatusManager.addPendingChange(change);
    }
}

function getSyncStatus() {
    return syncStatusManager ? syncStatusManager.getStatus() : null;
}

function clearPendingChanges() {
    if (syncStatusManager) {
        syncStatusManager.clearPendingChanges();
    }
}

// Expose helper functions globally
window.addPendingChange = addPendingChange;
window.getSyncStatus = getSyncStatus;
window.clearPendingChanges = clearPendingChanges;
