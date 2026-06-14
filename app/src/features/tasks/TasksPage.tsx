import { Card, Table, Badge } from 'react-bootstrap';
import { useTenantData } from '@/contexts/TenantDataContext';
import { DEFAULT_TASKS } from '@/data/constants';

export default function TasksPage() {
  const { data } = useTenantData();
  const tasks = data.tasks.length > 0 ? data.tasks : DEFAULT_TASKS;

  const byCategory = tasks.reduce<Record<string, typeof tasks>>((acc, task) => {
    const cat = task.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(task);
    return acc;
  }, {});

  return (
    <div>
      <h2 className="mb-4"><i className="bi bi-list-task me-2" />Task Library</h2>
      <p className="text-muted">{tasks.length} tasks across {Object.keys(byCategory).length} categories</p>

      {Object.entries(byCategory).sort(([a], [b]) => a.localeCompare(b)).map(([category, catTasks]) => (
        <Card key={category} className="mb-3">
          <Card.Header><i className="bi bi-tag me-2" />{category} ({catTasks.length})</Card.Header>
          <Table responsive size="sm" className="mb-0">
            <thead>
              <tr><th>Task</th><th>Description</th><th>Common</th></tr>
            </thead>
            <tbody>
              {catTasks.map((task) => (
                <tr key={String(task.id)}>
                  <td>{task.name}</td>
                  <td className="text-muted">{task.description}</td>
                  <td>{task.common ? <Badge bg="success">★</Badge> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ))}
    </div>
  );
}
