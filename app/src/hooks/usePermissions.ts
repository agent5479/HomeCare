import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, isAdminRole } from '@/services/permissions';

export function usePermissions() {
  const { user, isAdmin } = useAuth();
  const role = user?.role;

  return {
    role,
    isAdmin: isAdmin || isAdminRole(role),
    can: (permission: string) => hasPermission(role, permission),
    canDeleteSite: () => hasPermission(role, 'SITE_DELETE'),
    canDeleteAction: () => hasPermission(role, 'ACTION_DELETE'),
    canManageEmployees: () => hasPermission(role, 'EMPLOYEE_VIEW'),
    canManageTasks: () => hasPermission(role, 'TASK_TEMPLATE_MANAGE'),
  };
}
