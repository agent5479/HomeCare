import type { UserRole } from '@/types';

const PERMISSIONS: Record<string, UserRole[]> = {
  SITE_VIEW: ['master_admin', 'admin', 'demo_admin', 'employee'],
  SITE_CREATE: ['master_admin', 'admin', 'demo_admin', 'employee'],
  SITE_UPDATE: ['master_admin', 'admin', 'demo_admin', 'employee'],
  SITE_DELETE: ['master_admin', 'admin'],
  ACTION_VIEW: ['master_admin', 'admin', 'demo_admin', 'employee'],
  ACTION_CREATE: ['master_admin', 'admin', 'demo_admin', 'employee'],
  ACTION_UPDATE: ['master_admin', 'admin', 'demo_admin', 'employee'],
  ACTION_DELETE: ['master_admin', 'admin'],
  TASK_VIEW: ['master_admin', 'admin', 'demo_admin', 'employee'],
  TASK_SCHEDULE: ['master_admin', 'admin', 'demo_admin', 'employee'],
  TASK_COMPLETE: ['master_admin', 'admin', 'demo_admin', 'employee'],
  TASK_DELETE: ['master_admin', 'admin'],
  CLIENT_VIEW: ['master_admin', 'admin', 'demo_admin', 'employee'],
  CLIENT_CREATE: ['master_admin', 'admin', 'demo_admin', 'employee'],
  CLIENT_UPDATE: ['master_admin', 'admin', 'demo_admin', 'employee'],
  CLIENT_DELETE: ['master_admin', 'admin'],
  EMPLOYEE_VIEW: ['master_admin', 'admin'],
  EMPLOYEE_CREATE: ['master_admin', 'admin'],
  EMPLOYEE_DELETE: ['master_admin', 'admin'],
  REPORT_VIEW: ['master_admin', 'admin', 'demo_admin', 'employee'],
  EXPORT_DATA: ['master_admin', 'admin', 'demo_admin', 'employee'],
  TASK_TEMPLATE_MANAGE: ['master_admin', 'admin'],
};

export function hasPermission(role: UserRole | undefined, permission: string): boolean {
  if (!role) return false;
  const allowed = PERMISSIONS[permission];
  return allowed ? allowed.includes(role) : false;
}

export function isAdminRole(role: UserRole | undefined): boolean {
  return role === 'master_admin' || role === 'admin';
}

export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    master_admin: 'Master Administrator',
    admin: 'Administrator',
    demo_admin: 'Demo Account',
    employee: 'Employee',
  };
  return names[role] || role;
}
