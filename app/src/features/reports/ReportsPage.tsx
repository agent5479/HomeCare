import { useMemo } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { useTenantData } from '@/contexts/TenantDataContext';

const COLORS = ['#1976D2', '#42A5F5', '#40E0D0', '#6f42c1', '#28a745', '#ffc107'];

export default function ReportsPage() {
  const { data } = useTenantData();

  const careLevelData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.sites.filter((s) => !s.archived).forEach((s) => {
      const level = (s.careLevel as string) || 'Unknown';
      counts[level] = (counts[level] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data.sites]);

  const actionsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    data.actions.filter((a) => !a.deleted).forEach((a) => {
      const cat = a.taskCategory || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [data.actions]);

  const actionsOverTime = useMemo(() => {
    const counts: Record<string, number> = {};
    data.actions.filter((a) => !a.deleted).forEach((a) => {
      const month = a.date?.slice(0, 7) || 'Unknown';
      counts[month] = (counts[month] || 0) + 1;
    });
    return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)).map(([month, count]) => ({ month, count }));
  }, [data.actions]);

  const taskCompletion = useMemo(() => {
    const completed = data.scheduledTasks.filter((t) => t.status === 'completed').length;
    const pending = data.scheduledTasks.filter((t) => t.status !== 'completed').length;
    return [
      { name: 'Completed', value: completed },
      { name: 'Pending', value: pending },
    ];
  }, [data.scheduledTasks]);

  return (
    <div>
      <h2 className="mb-4"><i className="bi bi-graph-up me-2" />Care Analytics & Reports</h2>

      <Row className="g-3 mb-4">
        <Col md={3}><Card className="stat-card"><Card.Body><h3>{data.sites.filter((s) => !s.archived).length}</h3><p className="text-muted mb-0">Active Clients</p></Card.Body></Card></Col>
        <Col md={3}><Card className="stat-card"><Card.Body><h3>{data.actions.filter((a) => !a.deleted).length}</h3><p className="text-muted mb-0">Total Actions</p></Card.Body></Card></Col>
        <Col md={3}><Card className="stat-card"><Card.Body><h3>{data.scheduledTasks.length}</h3><p className="text-muted mb-0">Scheduled Tasks</p></Card.Body></Card></Col>
        <Col md={3}><Card className="stat-card"><Card.Body><h3>{data.employees.filter((e) => e.active !== false).length}</h3><p className="text-muted mb-0">Active Staff</p></Card.Body></Card></Col>
      </Row>

      <Row className="g-3">
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header>Care Level Distribution</Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={careLevelData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {careLevelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header>Task Completion Status</Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={taskCompletion} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    <Cell fill="#28a745" />
                    <Cell fill="#ffc107" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={12}>
          <Card>
            <Card.Header>Actions by Category</Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={actionsByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-30} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1976D2" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={12}>
          <Card>
            <Card.Header>Actions Over Time</Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={actionsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#42A5F5" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
