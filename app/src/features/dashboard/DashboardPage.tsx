import { useMemo } from 'react';
import { Row, Col, Card, Badge } from 'react-bootstrap';
import { NavButton } from '@/components/NavButton';
import { useTenantData } from '@/contexts/TenantDataContext';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { data, isStale } = useTenantData();
  const { user } = useAuth();

  const stats = useMemo(() => {
    const activeSites = data.sites.filter((s) => !s.archived);
    const overdueTasks = data.scheduledTasks.filter(
      (t) => t.status !== 'completed' && t.scheduledDate && new Date(t.scheduledDate) < new Date()
    );
    const flaggedActions = data.actions.filter((a) => a.flag && a.flag !== 'none' && !a.deleted);
    const careTypes: Record<string, number> = {};
    activeSites.forEach((s) => {
      const type = (s.siteType as string) || 'other';
      careTypes[type] = (careTypes[type] || 0) + 1;
    });
    return { activeSites: activeSites.length, overdueTasks: overdueTasks.length, flaggedActions: flaggedActions.length, careTypes };
  }, [data]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2><i className="bi bi-house me-2" />Dashboard Overview</h2>
          <p className="text-muted mb-0">Welcome back, {user?.username}</p>
        </div>
        {isStale && <Badge bg="warning" text="dark">Cached data</Badge>}
      </div>

      <Row className="g-3 mb-4">
        <Col md={3} sm={6}>
          <Card className="stat-card h-100">
            <Card.Body>
              <div className="stat-icon text-primary"><i className="bi bi-geo-alt-fill" /></div>
              <h3>{stats.activeSites}</h3>
              <p className="text-muted mb-0">Active Clients</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="stat-card h-100">
            <Card.Body>
              <div className="stat-icon text-success"><i className="bi bi-clipboard-check" /></div>
              <h3>{data.actions.filter((a) => !a.deleted).length}</h3>
              <p className="text-muted mb-0">Actions Logged</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="stat-card h-100">
            <Card.Body>
              <div className="stat-icon text-warning"><i className="bi bi-calendar-x" /></div>
              <h3>{stats.overdueTasks}</h3>
              <p className="text-muted mb-0">Overdue Tasks</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="stat-card h-100">
            <Card.Body>
              <div className="stat-icon text-danger"><i className="bi bi-flag-fill" /></div>
              <h3>{stats.flaggedActions}</h3>
              <p className="text-muted mb-0">Flagged Items</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col md={8}>
          <Card>
            <Card.Header><i className="bi bi-lightning me-2" />Quick Actions</Card.Header>
            <Card.Body className="d-flex flex-wrap gap-2">
              <NavButton to="/clients/new" variant="primary">
                <i className="bi bi-plus me-1" />Add Client
              </NavButton>
              <NavButton to="/actions/log" variant="outline-primary">
                <i className="bi bi-clipboard-plus me-1" />Log Action
              </NavButton>
              <NavButton to="/schedule" variant="outline-primary">
                <i className="bi bi-calendar-plus me-1" />Schedule Task
              </NavButton>
              <NavButton to="/clients" variant="outline-secondary">
                <i className="bi bi-geo-alt me-1" />View Clients
              </NavButton>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header><i className="bi bi-pie-chart me-2" />Care Types</Card.Header>
            <Card.Body>
              {Object.keys(stats.careTypes).length === 0 ? (
                <p className="text-muted mb-0">No clients yet</p>
              ) : (
                Object.entries(stats.careTypes).map(([type, count]) => (
                  <div key={type} className="d-flex justify-content-between mb-1">
                    <span className="text-capitalize">{type.replace(/_/g, ' ')}</span>
                    <Badge bg="primary">{count}</Badge>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header><i className="bi bi-clock-history me-2" />Recent Actions</Card.Header>
        <Card.Body>
          {data.actions.filter((a) => !a.deleted).slice(-5).reverse().map((action) => {
            const site = data.sites.find((s) => String(s.id) === String(action.siteId));
            return (
              <div key={action.id} className="d-flex justify-content-between border-bottom py-2">
                <span>{action.taskName || 'Action'} — {site?.name || 'Unknown client'}</span>
                <small className="text-muted">{action.date}</small>
              </div>
            );
          })}
          {data.actions.length === 0 && <p className="text-muted mb-0">No actions logged yet</p>}
        </Card.Body>
      </Card>
    </div>
  );
}
