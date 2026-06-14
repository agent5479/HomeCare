import { useSyncStatus } from '@/hooks/useSyncStatus';

const statusIcons: Record<string, string> = {
  synced: 'bi-cloud-check',
  syncing: 'bi-cloud-arrow-up',
  offline: 'bi-cloud-slash',
  error: 'bi-cloud-exclamation',
};

const statusLabels: Record<string, string> = {
  synced: 'Synced',
  syncing: 'Syncing...',
  offline: 'Offline',
  error: 'Sync Error',
};

export function SyncStatusOverlay() {
  const { status, details, pendingCount } = useSyncStatus();

  return (
    <div className={`sync-status-overlay sync-status-${status}`}>
      <i className={`bi ${statusIcons[status] || 'bi-cloud'} sync-status-icon`} />
      <div className="sync-status-content">
        <span className="sync-status-text">{statusLabels[status]}</span>
        {details && <span className="sync-status-details">{details}</span>}
      </div>
      {pendingCount > 0 && (
        <span className="sync-status-count badge bg-warning text-dark">{pendingCount}</span>
      )}
    </div>
  );
}
