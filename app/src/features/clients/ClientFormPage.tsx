import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useTenantData } from '@/contexts/TenantDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { mutate, tenantPath } from '@/services/mutations';
import { SITE_TYPES } from '@/data/constants';
import { MapPicker } from '@/components/MapPicker';
import type { Site } from '@/types';

const emptySite = (): Partial<Site> => ({
  name: '',
  address: '',
  siteType: 'home_care',
  careLevel: 'Standard',
  status: 'active',
  latitude: -40.85,
  longitude: 172.8,
  contactName: '',
  contactPhone: '',
  medicalConditions: '',
  allergies: '',
  medications: '',
  notes: '',
});

export default function ClientFormPage() {
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  const navigate = useNavigate();
  const { data, setData } = useTenantData();
  const { user } = useAuth();
  const [form, setForm] = useState<Partial<Site>>(emptySite());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isNew && id) {
      const site = data.sites.find((s) => String(s.id) === id);
      if (site) setForm({ ...site });
    }
  }, [id, isNew, data.sites]);

  const update = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      setError('Client name is required');
      return;
    }
    if (!user?.tenantId) return;

    setSaving(true);
    setError('');
    const siteId = isNew ? `site_${Date.now()}` : String(id);
    const siteData: Site = {
      ...form,
      id: siteId,
      name: form.name!.trim(),
      updatedAt: new Date().toISOString(),
    } as Site;

    const path = tenantPath(user.tenantId, 'sites', siteId);

    await mutate(path, siteData, 'site_save', 'set', () => {
      setData((prev) => {
        const exists = prev.sites.findIndex((s) => String(s.id) === siteId);
        const sites = [...prev.sites];
        if (exists >= 0) sites[exists] = siteData;
        else sites.push(siteData);
        return { ...prev, sites };
      });
    });

    setSaving(false);
    navigate('/clients');
  };

  const handleArchive = async () => {
    if (!user?.tenantId || isNew) return;
    const siteData = { ...form, archived: true, updatedAt: new Date().toISOString() };
    await mutate(tenantPath(user.tenantId, 'sites', id), siteData, 'site_update', 'set');
    navigate('/clients');
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-geo-alt me-2" />
          {isNew ? 'Add Client' : 'Edit Client'}
        </h2>
        <Button variant="secondary" onClick={() => navigate('/clients')}>
          <i className="bi bi-arrow-left me-1" />Back
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row className="g-3">
          <Col lg={8}>
            <Card className="mb-3">
              <Card.Header>Basic Information</Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Client Name *</Form.Label>
                      <Form.Control value={form.name || ''} onChange={(e) => update('name', e.target.value)} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Care Type</Form.Label>
                      <Form.Select value={form.siteType || 'home_care'} onChange={(e) => update('siteType', e.target.value)}>
                        {Object.entries(SITE_TYPES).map(([key, val]) => (
                          <option key={key} value={key}>{val.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Address</Form.Label>
                      <Form.Control value={form.address || ''} onChange={(e) => update('address', e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Care Level</Form.Label>
                      <Form.Select value={form.careLevel || 'Standard'} onChange={(e) => update('careLevel', e.target.value)}>
                        <option>Standard</option>
                        <option>Intensive</option>
                        <option>Specialized</option>
                        <option>Palliative</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Status</Form.Label>
                      <Form.Select value={form.status || 'active'} onChange={(e) => update('status', e.target.value)}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="discharged">Discharged</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Header>Contact & Medical</Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Contact Name</Form.Label>
                      <Form.Control value={form.contactName || ''} onChange={(e) => update('contactName', e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Contact Phone</Form.Label>
                      <Form.Control value={form.contactPhone || ''} onChange={(e) => update('contactPhone', e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Medical Conditions</Form.Label>
                      <Form.Control as="textarea" rows={2} value={form.medicalConditions || ''} onChange={(e) => update('medicalConditions', e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Allergies</Form.Label>
                      <Form.Control value={form.allergies || ''} onChange={(e) => update('allergies', e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Medications</Form.Label>
                      <Form.Control value={form.medications || ''} onChange={(e) => update('medications', e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Notes</Form.Label>
                      <Form.Control as="textarea" rows={3} value={form.notes || ''} onChange={(e) => update('notes', e.target.value)} />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="mb-3">
              <Card.Header>Location</Card.Header>
              <Card.Body>
                <MapPicker
                  lat={form.latitude ?? -40.85}
                  lng={form.longitude ?? 172.8}
                  onChange={(lat, lng) => {
                    update('latitude', lat);
                    update('longitude', lng);
                  }}
                />
              </Card.Body>
            </Card>

            <div className="d-grid gap-2">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Saving...' : isNew ? 'Create Client' : 'Save Changes'}
              </Button>
              {!isNew && !form.archived && (
                <Button variant="outline-warning" onClick={handleArchive}>Archive Client</Button>
              )}
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
