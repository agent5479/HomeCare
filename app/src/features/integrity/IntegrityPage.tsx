import { useMemo } from 'react';
import { Card, Alert, Badge, ListGroup } from 'react-bootstrap';
import { useTenantData } from '@/contexts/TenantDataContext';

export default function IntegrityPage() {
  const { data } = useTenantData();

  const checks = useMemo(() => {
    const issues: { level: 'error' | 'warning' | 'info'; message: string }[] = [];

    data.sites.forEach((site) => {
      if (!site.name) issues.push({ level: 'error', message: `Site ${site.id} missing name` });
      if (!site.address) issues.push({ level: 'warning', message: `${site.name || site.id}: no address` });
      if (site.latitude == null || site.longitude == null) {
        issues.push({ level: 'warning', message: `${site.name}: no GPS coordinates` });
      }
    });

    data.actions.forEach((action) => {
      if (!data.sites.find((s) => String(s.id) === String(action.siteId))) {
        issues.push({ level: 'error', message: `Action ${action.id} references missing client ${action.siteId}` });
      }
      if (!action.taskName) issues.push({ level: 'warning', message: `Action ${action.id} missing task name` });
    });

    data.scheduledTasks.forEach((task) => {
      if (!data.sites.find((s) => String(s.id) === String(task.siteId))) {
        issues.push({ level: 'error', message: `Scheduled task ${task.id} references missing client` });
      }
    });

    const duplicateNames = new Map<string, number>();
    data.sites.forEach((s) => {
      const name = (s.name || '').toLowerCase();
      duplicateNames.set(name, (duplicateNames.get(name) || 0) + 1);
    });
    duplicateNames.forEach((count, name) => {
      if (count > 1 && name) issues.push({ level: 'warning', message: `Duplicate client name: "${name}" (${count} times)` });
    });

    if (issues.length === 0) {
      issues.push({ level: 'info', message: 'All data integrity checks passed' });
    }

    return issues;
  }, [data]);

  const errors = checks.filter((c) => c.level === 'error').length;
  const warnings = checks.filter((c) => c.level === 'warning').length;

  return (
    <div>
      <h2 className="mb-4"><i className="bi bi-database-check me-2" />Data Integrity Check</h2>

      <div className="d-flex gap-2 mb-4">
        <Badge bg="danger">{errors} errors</Badge>
        <Badge bg="warning" text="dark">{warnings} warnings</Badge>
        <Badge bg="info">{checks.length} total checks</Badge>
      </div>

      <Card className="mb-3">
        <Card.Header>Summary</Card.Header>
        <Card.Body>
          <p>Clients: {data.sites.length} · Actions: {data.actions.length} · Scheduled: {data.scheduledTasks.length}</p>
          <p>Employees: {data.employees.length} · Individual clients: {data.individualHives.length}</p>
        </Card.Body>
      </Card>

      <ListGroup>
        {checks.map((check, i) => (
          <ListGroup.Item key={i} variant={check.level === 'error' ? 'danger' : check.level === 'warning' ? 'warning' : undefined}>
            <Alert variant={check.level === 'info' ? 'success' : check.level} className="mb-0 py-2">
              {check.message}
            </Alert>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}
