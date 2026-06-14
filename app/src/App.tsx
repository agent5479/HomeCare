import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/ProtectedLayout';

const LandingPage = lazy(() => import('@/features/landing/LandingPage'));
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const ClientsPage = lazy(() => import('@/features/clients/ClientsPage'));
const ClientFormPage = lazy(() => import('@/features/clients/ClientFormPage'));
const ActionsPage = lazy(() => import('@/features/actions/ActionsPage'));
const LogActionPage = lazy(() => import('@/features/actions/LogActionPage'));
const SchedulePage = lazy(() => import('@/features/schedule/SchedulePage'));
const TasksPage = lazy(() => import('@/features/tasks/TasksPage'));
const CompliancePage = lazy(() => import('@/features/compliance/CompliancePage'));
const IntegrityPage = lazy(() => import('@/features/integrity/IntegrityPage'));
const TeamPage = lazy(() => import('@/features/team/TeamPage'));
const ReportsPage = lazy(() => import('@/features/reports/ReportsPage'));

function PageLoader() {
  return (
    <div className="d-flex justify-content-center align-items-center p-5">
      <div className="spinner-border text-primary" role="status" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/HomeCare">
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/clients/new" element={<ClientFormPage />} />
              <Route path="/clients/:id" element={<ClientFormPage />} />
              <Route path="/actions" element={<ActionsPage />} />
              <Route path="/actions/log" element={<LogActionPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/compliance" element={<CompliancePage />} />
              <Route path="/integrity" element={<IntegrityPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
