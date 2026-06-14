import { Container, Row, Col, Card } from 'react-bootstrap';
import { NavButton } from '@/components/NavButton';
import { APP_VERSION } from '@/services/config';

const features = [
  { icon: 'bi-geo-alt-fill', title: 'Client Location Management', desc: 'Track multiple client sites with GPS coordinates and interactive maps.' },
  { icon: 'bi-clipboard-check', title: 'Care Action Tracking', desc: 'Comprehensive care action logging with audit trails for all activities.' },
  { icon: 'bi-shield-check', title: 'NZ Compliance Tracking', desc: 'Built-in compliance management for New Zealand care providers.' },
  { icon: 'bi-people-fill', title: 'Team Coordination', desc: 'Multi-user support with role-based permissions and activity tracking.' },
  { icon: 'bi-calendar-check', title: 'Task Scheduling', desc: 'Advanced scheduling with priority management and overdue detection.' },
  { icon: 'bi-cloud-check', title: 'Real-time Sync', desc: 'Firebase-powered sync with offline support and automatic recovery.' },
];

export default function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <Container>
          <span className="navbar-brand fw-bold text-primary">
            <i className="bi bi-house-heart-fill me-2" />CareMarshall
          </span>
          <div className="ms-auto">
            <NavButton to="/login" variant="primary">Launch App</NavButton>
          </div>
        </Container>
      </nav>

      <section className="hero-section text-center py-5">
        <Container>
          <h1 className="hero-title display-4 fw-bold">
            <i className="bi bi-house-heart-fill" /> CareMarshall v{APP_VERSION}
          </h1>
          <p className="hero-subtitle fs-4 text-muted">Professional Care Management System for New Zealand</p>
          <p className="hero-description mx-auto" style={{ maxWidth: 700 }}>
            Production-ready digital solution for professional home care providers. Multi-tenant architecture,
            team coordination, real-time synchronization, NZ compliance tracking, and comprehensive analytics.
          </p>
          <NavButton to="/login" variant="primary" size="lg" className="mt-3">
            <i className="bi bi-rocket-takeoff me-2" />Launch Application
          </NavButton>
        </Container>
      </section>

      <section className="py-5">
        <Container>
          <h2 className="text-center mb-2">Comprehensive Care Management</h2>
          <p className="text-center text-muted mb-5">Everything you need to coordinate professional home care services</p>
          <Row className="g-4">
            {features.map((f) => (
              <Col key={f.title} md={6} lg={4}>
                <Card className="feature-card h-100 shadow-sm">
                  <Card.Body>
                    <i className={`bi ${f.icon} feature-icon text-primary fs-1`} />
                    <h4>{f.title}</h4>
                    <p className="text-muted">{f.desc}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="py-5 bg-light">
        <Container className="text-center">
          <h2>Ready to Transform Your Care Operations?</h2>
          <p className="text-muted mb-4">Access the complete CareMarshall system designed for New Zealand care providers</p>
          <NavButton to="/login" variant="primary" size="lg">Get Started</NavButton>
        </Container>
      </section>

      <footer className="py-4 text-center text-muted border-top">
        <Container>CareMarshall v{APP_VERSION} — Professional Care Coordination Platform</Container>
      </footer>
    </div>
  );
}
