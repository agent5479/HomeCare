import { useState, useMemo } from 'react';
import { Card, Table, Badge, Form, Row, Col } from 'react-bootstrap';
import { NavButton } from '@/components/NavButton';
import { useTenantData } from '@/contexts/TenantDataContext';

export default function ActionsPage() {
  const { data } = useTenantData();
  const [siteFilter, setSiteFilter] = useState('');
  const [flagFilter, setFlagFilter] = useState('');

  const actions = useMemo(() => {
    return data.actions
      .filter((a) => !a.deleted)
      .filter((a) => !siteFilter || String(a.siteId) === siteFilter)
      .filter((a) => !flagFilter || a.flag === flagFilter)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data.actions, siteFilter, flagFilter]);

  const flagVariant = (flag?: string) => {
    if (flag === 'urgent') return 'danger';
    if (flag === 'warning') return 'warning';
    if (flag === 'info') return 'info';
    return 'secondary';
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="bi bi-clipboard-check me-2" />Care Actions</h2>
        <NavButton to="/actions/log" variant="primary">
          <i className="bi bi-plus me-1" />Log Action
        </NavButton>
      </div>

      <Card className="mb-3">
        <Card.Body>
          <Row className="g-2">
            <Col md={4}>
              <Form.Select value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)}>
                <option value="">All clients</option>
                {data.sites.filter((s) => !s.archived).map((s) => (
                  <option key={String(s.id)} value={String(s.id)}>{s.name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Select value={flagFilter} onChange={(e) => setFlagFilter(e.target.value)}>
                <option value="">All flags</option>
                <option value="urgent">Urgent</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Table responsive hover className="mb-0">
          <thead>
            <tr>
              <th>Date</th>
              <th>Client</th>
              <th>Task</th>
              <th>Category</th>
              <th>Flag</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {actions.map((action) => {
              const site = data.sites.find((s) => String(s.id) === String(action.siteId));
              return (
                <tr key={action.id}>
                  <td>{action.date}</td>
                  <td>{site?.name || '—'}</td>
                  <td>{action.taskName}</td>
                  <td><Badge bg="light" text="dark">{action.taskCategory}</Badge></td>
                  <td>
                    {action.flag && action.flag !== 'none' ? (
                      <Badge bg={flagVariant(action.flag)}>{action.flag}</Badge>
                    ) : '—'}
                  </td>
                  <td className="text-truncate" style={{ maxWidth: 200 }}>{action.notes || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        {actions.length === 0 && (
          <Card.Body className="text-center text-muted">No actions found</Card.Body>
        )}
      </Card>
    </div>
  );
}
