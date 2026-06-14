import { useState } from 'react';
import { Card, Button, Table, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { useTenantData } from '@/contexts/TenantDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { mutate, tenantPath } from '@/services/mutations';
import { secureHash } from '@/services/config';
import { getRoleDisplayName } from '@/services/permissions';
import type { Employee } from '@/types';

export default function TeamPage() {
  const { data, setData } = useTenantData();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', role: 'employee' as Employee['role'], phone: '', email: '' });
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenantId || !form.username || !form.password) return;

    const employee: Employee = {
      id: `emp_${Date.now()}`,
      username: form.username,
      passwordHash: secureHash(form.password),
      role: form.role || 'employee',
      tenantId: user.tenantId,
      active: true,
      phone: form.phone,
      email: form.email,
      createdAt: new Date().toISOString(),
    };

    await mutate(tenantPath(user.tenantId, 'employees', employee.id), employee, 'employee_create', 'set', () => {
      setData((prev) => ({ ...prev, employees: [...prev.employees, employee] }));
    });

    setTempPassword(form.password);
    setShowModal(false);
    setForm({ username: '', password: '', role: 'employee', phone: '', email: '' });
  };

  const toggleActive = async (emp: Employee) => {
    if (!user?.tenantId) return;
    const updated = { ...emp, active: !emp.active };
    await mutate(tenantPath(user.tenantId, 'employees', emp.id), updated, 'employee_update', 'set', () => {
      setData((prev) => ({
        ...prev,
        employees: prev.employees.map((e) => (e.id === emp.id ? updated : e)),
      }));
    });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="bi bi-people me-2" />Team Management</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-person-plus me-1" />Add Employee
        </Button>
      </div>

      {tempPassword && (
        <Alert variant="success" dismissible onClose={() => setTempPassword(null)}>
          Employee created. Temporary password: <strong>{tempPassword}</strong>
        </Alert>
      )}

      <Card>
        <Table responsive hover className="mb-0">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th>Phone</th>
              <th>Email</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.employees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.username}</td>
                <td><Badge bg="primary">{getRoleDisplayName(emp.role as never)}</Badge></td>
                <td><Badge bg={emp.active !== false ? 'success' : 'secondary'}>{emp.active !== false ? 'Active' : 'Inactive'}</Badge></td>
                <td>{emp.phone || '—'}</td>
                <td>{emp.email || '—'}</td>
                <td>
                  <Button size="sm" variant="outline-secondary" onClick={() => toggleActive(emp)}>
                    {emp.active !== false ? 'Deactivate' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {data.employees.length === 0 && <Card.Body className="text-center text-muted">No team members</Card.Body>}
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>Add Employee</Modal.Title></Modal.Header>
        <Form onSubmit={handleAdd}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Employee['role'] })}>
                <option value="employee">Employee</option>
                <option value="admin">Administrator</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Employee</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
