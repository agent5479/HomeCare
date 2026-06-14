import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useTenantData } from '@/contexts/TenantDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { mutate, tenantPath } from '@/services/mutations';
import { DEFAULT_TASKS } from '@/data/constants';
import type { CareAction } from '@/types';

export default function LogActionPage() {
  const { data, setData } = useTenantData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [siteId, setSiteId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [flag, setFlag] = useState('none');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'common'>('all');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const tasks = data.tasks.length > 0 ? data.tasks : DEFAULT_TASKS;
  const filteredTasks = filter === 'common' ? tasks.filter((t) => t.common) : tasks;

  const byCategory = filteredTasks.reduce<Record<string, typeof tasks>>((acc, task) => {
    const cat = task.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(task);
    return acc;
  }, {});

  const toggleTask = (id: string) => {
    setSelectedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteId) { setError('Please select a client'); return; }
    if (selectedTasks.size === 0) { setError('Please select at least one task'); return; }
    if (!user?.tenantId) return;

    setSaving(true);
    setError('');

    const newActions: CareAction[] = [];

    for (const taskId of selectedTasks) {
      const task = tasks.find((t) => String(t.id) === taskId);
      if (!task) continue;

      const action: CareAction = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        siteId,
        taskId: task.id,
        taskName: task.name,
        taskCategory: task.category,
        date,
        notes,
        flag: flag === 'none' ? undefined : flag,
        loggedBy: user.username,
        createdAt: new Date().toISOString(),
      };

      const path = tenantPath(user.tenantId, 'actions', action.id);
      await mutate(path, action, 'action_log', 'set');
      newActions.push(action);
    }

    setData((prev) => ({ ...prev, actions: [...prev.actions, ...newActions] }));
    setSaving(false);
    navigate('/actions');
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="bi bi-clipboard-plus me-2" />Log Care Action</h2>
        <Button variant="secondary" onClick={() => navigate('/actions')}>Cancel</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Card className="mb-3">
          <Card.Body>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Client *</Form.Label>
                  <Form.Select value={siteId} onChange={(e) => setSiteId(e.target.value)} required>
                    <option value="">Select client...</option>
                    {data.sites.filter((s) => !s.archived).map((s) => (
                      <option key={String(s.id)} value={String(s.id)}>{s.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Flag</Form.Label>
                  <Form.Select value={flag} onChange={(e) => setFlag(e.target.value)}>
                    <option value="none">None</option>
                    <option value="urgent">Urgent</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Notes</Form.Label>
                  <Form.Control as="textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="mb-3">
          <Card.Header className="d-flex justify-content-between">
            <span>Tasks *</span>
            <div>
              <Button size="sm" variant={filter === 'all' ? 'primary' : 'outline-primary'} className="me-1" onClick={() => setFilter('all')}>All</Button>
              <Button size="sm" variant={filter === 'common' ? 'primary' : 'outline-primary'} onClick={() => setFilter('common')}>Common</Button>
            </div>
          </Card.Header>
          <Card.Body>
            <Row>
              {Object.entries(byCategory).sort(([a], [b]) => a.localeCompare(b)).map(([category, catTasks]) => (
                <Col md={6} key={category} className="mb-3">
                  <h6><i className="bi bi-tag-fill me-1" />{category}</h6>
                  {catTasks.map((task) => (
                    <Form.Check
                      key={String(task.id)}
                      type="checkbox"
                      id={`task-${task.id}`}
                      label={<>{task.name}{task.common && <span className="text-success ms-1">★</span>}</>}
                      checked={selectedTasks.has(String(task.id))}
                      onChange={() => toggleTask(String(task.id))}
                    />
                  ))}
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>

        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Logging...' : `Log ${selectedTasks.size} Task${selectedTasks.size !== 1 ? 's' : ''}`}
        </Button>
      </Form>
    </div>
  );
}
