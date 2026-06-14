import { useState, useMemo } from 'react';
import { Row, Col, Card, Form, Badge, InputGroup } from 'react-bootstrap';
import { NavButton } from '@/components/NavButton';
import { useTenantData } from '@/contexts/TenantDataContext';
import { SITE_TYPES } from '@/data/constants';
import type { Site } from '@/types';

export default function ClientsPage() {
  const { data } = useTenantData();
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const filteredSites = useMemo(() => {
    return data.sites
      .filter((s) => (showArchived ? s.archived : !s.archived))
      .filter((s) => !search || s.name?.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [data.sites, search, showArchived]);

  const grouped = useMemo(() => {
    const groups: Record<string, Site[]> = {};
    filteredSites.forEach((site) => {
      const letter = (site.name?.[0] || '#').toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(site);
    });
    return groups;
  }, [filteredSites]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2><i className="bi bi-geo-alt me-2" />Clients</h2>
        <div className="d-flex gap-2">
          <NavButton to="/clients/new" variant="primary">
            <i className="bi bi-plus me-1" />Add Client
          </NavButton>
        </div>
      </div>

      <Row className="mb-3 g-2">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text><i className="bi bi-search" /></InputGroup.Text>
            <Form.Control
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6} className="d-flex align-items-center">
          <Form.Check
            type="switch"
            label="Show archived"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
          />
        </Col>
      </Row>

      <p className="text-muted">{filteredSites.length} client{filteredSites.length !== 1 ? 's' : ''}</p>

      {Object.keys(grouped).sort().map((letter) => (
        <div key={letter} className="mb-4">
          <h5 className="letter-header">{letter}</h5>
          <Row className="g-3">
            {grouped[letter].map((site) => {
              const typeInfo = SITE_TYPES[site.siteType as string] || SITE_TYPES.other;
              return (
                <Col key={String(site.id)} md={6} lg={4}>
                  <Card className={`client-card h-100 ${site.archived ? 'opacity-75' : ''}`}>
                    <Card.Body>
                      <div className="d-flex justify-content-between">
                        <Card.Title className="h6">
                          <i className={`bi ${typeInfo.icon} me-1`} style={{ color: typeInfo.color }} />
                          {site.name}
                        </Card.Title>
                        {site.archived && <Badge bg="secondary">Archived</Badge>}
                      </div>
                      <Card.Text className="small text-muted">
                        {site.address || 'No address'}
                      </Card.Text>
                      <div className="d-flex gap-1 flex-wrap mb-2">
                        <Badge bg="light" text="dark">{typeInfo.name}</Badge>
                        {site.careLevel && <Badge bg="info">{site.careLevel}</Badge>}
                      </div>
                      <NavButton to={`/clients/${site.id}`} variant="outline-primary" size="sm">
                        View / Edit
                      </NavButton>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      ))}

      {filteredSites.length === 0 && (
        <Card className="text-center p-5">
          <p className="text-muted">No clients found</p>
          <NavButton to="/clients/new" variant="primary">Add your first client</NavButton>
        </Card>
      )}
    </div>
  );
}
