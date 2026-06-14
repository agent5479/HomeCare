import { useState } from 'react';
import { Card, Button, Table, Badge, Modal, Form, Row, Col } from 'react-bootstrap';
import { useTenantData } from '@/contexts/TenantDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { mutate, tenantPath } from '@/services/mutations';
import { DEFAULT_TASKS } from '@/data/constants';
import type { ScheduledTask } from '@/types';

export default function SchedulePage() {
  const { data, setData } = useTenantData();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ siteId: '', taskId: '', scheduledDate: '', priority: 'normal', notes: '' });

  const tasks = data.tasks.length > 0 ? data.tasks : DEFAULT_TASKS;

  const sorted = [...data.scheduledTasks].sort(
    (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );

  const isOverdue = (task: ScheduledTask) =>
    task.status !== 'completed' && new Date(task.scheduledDate) < new Date();

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenantId || !form.siteId || !form.taskId || !form.scheduledDate) return;

    const task = tasks.find((t) => String(t.id) === form.taskId);
    const scheduled: ScheduledTask = {
      id: `sched_${Date.now()}`,
      siteId: form.siteId,
      taskId: form.taskId,
      taskName: task?.name,
      scheduledDate: form.scheduledDate,
      priority: form.priority,
      status: 'pending',
      notes: form.notes,
      assignedTo: user.username,
    };

    await mutate(tenantPath(user.tenantId, 'scheduledTasks', scheduled.id), scheduled, 'task_schedule', 'set', () => {
      setData((prev) => ({ ...prev, scheduledTasks: [...prev.scheduledTasks, scheduled] }));
    });

    setShowModal(false);
    setForm({ siteId: '', taskId: '', scheduledDate: '', priority: 'normal', notes: '' });
  };

  const completeTask = async (task: ScheduledTask) => {
    if (!user?.tenantId) return;
    const updated = { ...task, status: 'completed', completedAt: new Date().toISOString() };
    await mutate(tenantPath(user.tenantId, 'scheduledTasks', task.id), updated, 'task_complete', 'set', () => {
      setData((prev) => ({
        ...prev,
        scheduledTasks: prev.scheduledTasks.map((t) => (t.id === task.id ? updated : t)),
      }));
    });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="bi bi-calendar3 me-2" />Scheduled Tasks</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-calendar-plus me-1" />Schedule Task
        </Button>
      </div>

      <Card>
        <Table responsive hover className="mb-0">
          <thead>
            <tr>
              <th>Date</th>
              <th>Client</th>
              <th>Task</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((task) => {
              const site = data.sites.find((s) => String(s.id) === String(task.siteId));
              const overdue = isOverdue(task);
              return (
                <tr key={task.id} className={overdue ? 'table-warning' : ''}>
                  <td>{task.scheduledDate}{overdue && <Badge bg="danger" className="ms-1">Overdue</Badge>}</td>
                  <td>{site?.name || '—'}</td>
                  <td>{task.taskName}</td>
                  <td><Badge bg={task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : 'secondary'}>{task.priority}</Badge></td>
                  <td><Badge bg={task.status === 'completed' ? 'success' : 'primary'}>{task.status}</Badge></td>
                  <td>{task.assignedTo || '—'}</td>
                  <td>
                    {task.status !== 'completed' && (
                      <Button size="sm" variant="outline-success" onClick={() => completeTask(task)}>Complete</Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        {sorted.length === 0 && <Card.Body className="text-center text-muted">No scheduled tasks</Card.Body>}
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>Schedule Task</Modal.Title></Modal.Header>
        <Form onSubmit={handleSchedule}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Client</Form.Label>
                  <Form.Select value={form.siteId} onChange={(e) => setForm({ ...form, siteId: e.target.value })} required>
                    <option value="">Select...</option>
                    {data.sites.filter((s) => !s.archived).map((s) => (
                      <option key={String(s.id)} value={String(s.id)}>{s.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Task</Form.Label>
                  <Form.Select value={form.taskId} onChange={(e) => setForm({ ...form, taskId: e.target.value })} required>
                    <option value="">Select...</option>
                    {tasks.map((t) => (
                      <option key={String(t.id)} value={String(t.id)}>{t.name} ({t.category})</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <Form.Control type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Priority</Form.Label>
                  <Form.Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Notes</Form.Label>
                  <Form.Control as="textarea" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Schedule</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
