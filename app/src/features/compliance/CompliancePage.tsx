import { useState } from 'react';
import { Card, Alert, Badge, Form } from 'react-bootstrap';
import { COMPLIANCE_DEADLINES } from '@/data/constants';

export default function CompliancePage() {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('complianceChecked');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('complianceChecked', JSON.stringify(next));
      return next;
    });
  };

  const completed = Object.values(checked).filter(Boolean).length;

  return (
    <div>
      <h2 className="mb-4"><i className="bi bi-shield-check me-2" />NZ Regulatory Compliance</h2>

      <Alert variant="info">
        <strong>NZ Regulatory Compliance</strong> — Track statutory obligations as a registered care provider.
        Automated reminders help you stay compliant with regulatory requirements.
      </Alert>

      <div className="d-flex gap-2 mb-4">
        <Badge bg="primary">{COMPLIANCE_DEADLINES.length} obligations</Badge>
        <Badge bg="success">{completed} confirmed</Badge>
        <Badge bg="warning" text="dark">{COMPLIANCE_DEADLINES.length - completed} pending</Badge>
      </div>

      <Alert variant="warning" className="mb-4">
        <i className="bi bi-exclamation-triangle me-2" />
        Serious incidents must be reported within <strong>24 hours</strong>.
      </Alert>

      {COMPLIANCE_DEADLINES.map((item) => (
        <Card key={item.key} className={`mb-3 ${checked[item.key] ? 'border-success' : ''}`}>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h5>{item.label}</h5>
                <Badge bg="secondary" className="me-2">{item.date}</Badge>
                <p className="text-muted mb-0 mt-2">{item.description}</p>
              </div>
              <Form.Check
                type="checkbox"
                checked={!!checked[item.key]}
                onChange={() => toggle(item.key)}
                label="Confirmed"
              />
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}
