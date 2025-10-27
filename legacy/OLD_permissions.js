// BeeMarshall - Permissions and Team Collaboration Module
// Defines role-based access control for team members

/**
 * USER ROLES
 * - master_admin: Full access, can delete sites, manage employees
 * - admin: Full access, can delete sites, manage employees
 * - demo_admin: Demo account with full read access
 * - employee: Can view, create, update; cannot delete sites
 */

// Permission definitions
const PERMISSIONS = {
    // Site Management
    SITE_VIEW: ['master_admin', 'admin', 'demo_admin', 'employee'],
    SITE_CREATE: ['master_admin', 'admin', 'demo_admin', 'employee'],
    SITE_UPDATE: ['master_admin', 'admin', 'demo_admin', 'employee'],
    SITE_DELETE: ['master_admin', 'admin'], // Employees cannot delete
    
    // Action Management
    ACTION_VIEW: ['master_admin', 'admin', 'demo_admin', 'employee'],
    ACTION_CREATE: ['master_admin', 'admin', 'demo_admin', 'employee'],
    ACTION_UPDATE: ['master_admin', 'admin', 'demo_admin', 'employee'],
    ACTION_DELETE: ['master_admin', 'admin'], // Employees cannot delete
    
    // Scheduled Tasks
    TASK_VIEW: ['master_admin', 'admin', 'demo_admin', 'employee'],
    TASK_SCHEDULE: ['master_admin', 'admin', 'demo_admin', 'employee'],
    TASK_COMPLETE: ['master_admin', 'admin', 'demo_admin', 'employee'],
    TASK_DELETE: ['master_admin', 'admin'],
    TASK_TRANSFER_TO_SCHEDULE: ['master_admin', 'admin', 'demo_admin', 'employee'],
    
    // Individual Hives
    HIVE_VIEW: ['master_admin', 'admin', 'demo_admin', 'employee'],
    HIVE_CREATE: ['master_admin', 'admin', 'demo_admin', 'employee'],
    HIVE_UPDATE: ['master_admin', 'admin', 'demo_admin', 'employee'],
    HIVE_DELETE: ['master_admin', 'admin'],
    
    // Hive Schematics
    SCHEMATIC_UPDATE: ['master_admin', 'admin', 'demo_admin', 'employee'],
    
    // Employee Management
    EMPLOYEE_VIEW: ['master_admin', 'admin'],
    EMPLOYEE_CREATE: ['master_admin', 'admin'],
    EMPLOYEE_DELETE: ['master_admin', 'admin'],
    
    // Reports and Analytics
    REPORT_VIEW: ['master_admin', 'admin', 'demo_admin', 'employee'],
    
    // Data Export
    EXPORT_DATA: ['master_admin', 'admin', 'demo_admin', 'employee'],
    
    // Task Management
    TASK_TEMPLATE_MANAGE: ['master_admin', 'admin'],
};

/**
 * Check if current user has a specific permission
 */
function hasPermission(permission) {
    if (!currentUser || !currentUser.role) {
        Logger.log('⚠️ No user or role found, denying permission');
        return false;
    }
    
    const role = currentUser.role;
    const allowedRoles = PERMISSIONS[permission];
    
    if (!allowedRoles) {
        Logger.error('❌ Unknown permission:', permission);
        return false;
    }
    
    const hasAccess = allowedRoles.includes(role);
    
    if (!hasAccess) {
        Logger.log(`🔒 Permission denied: ${permission} for role: ${role}`);
    }
    
    return hasAccess;
}

/**
 * Check if user can delete sites
 */
function canDeleteSite() {
    return hasPermission('SITE_DELETE');
}

/**
 * Check if user can delete actions
 */
function canDeleteAction() {
    return hasPermission('ACTION_DELETE');
}

/**
 * Check if user can delete scheduled tasks
 */
function canDeleteTask() {
    return hasPermission('TASK_DELETE');
}

/**
 * Check if user can delete individual hives
 */
function canDeleteHive() {
    return hasPermission('HIVE_DELETE');
}

/**
 * Check if user can manage employees
 */
function canManageEmployees() {
    return hasPermission('EMPLOYEE_VIEW');
}

/**
 * Check if user can transfer flagged actions to schedule
 */
function canTransferToSchedule() {
    return hasPermission('TASK_TRANSFER_TO_SCHEDULE');
}

/**
 * Check if user can update hive schematics
 */
function canUpdateSchematics() {
    return hasPermission('SCHEMATIC_UPDATE');
}

/**
 * Show permission denied alert
 */
function showPermissionDeniedAlert(action = 'perform this action') {
    beeMarshallAlert(
        `🔒 Access Denied\n\nYou do not have permission to ${action}.\n\nContact your administrator for access.`,
        'warning'
    );
}

/**
 * Get user role display name
 */
function getUserRoleDisplayName(role) {
    const roleNames = {
        'master_admin': 'Master Administrator',
        'admin': 'Administrator',
        'demo_admin': 'Demo Account',
        'employee': 'Employee'
    };
    
    return roleNames[role] || role;
}

/**
 * Get user role badge color
 */
function getUserRoleBadgeColor(role) {
    const colors = {
        'master_admin': 'danger',
        'admin': 'primary',
        'demo_admin': 'info',
        'employee': 'secondary'
    };
    
    return colors[role] || 'secondary';
}

/**
 * Check if user is admin (including master_admin)
 */
function isAdminUser() {
    if (!currentUser || !currentUser.role) {
        return false;
    }
    
    return currentUser.role === 'master_admin' || currentUser.role === 'admin';
}

/**
 * Check if user is employee only
 */
function isEmployeeOnly() {
    if (!currentUser || !currentUser.role) {
        return false;
    }
    
    return currentUser.role === 'employee';
}

// Expose permission functions globally
window.hasPermission = hasPermission;
window.canDeleteSite = canDeleteSite;
window.canDeleteAction = canDeleteAction;
window.canDeleteTask = canDeleteTask;
window.canDeleteHive = canDeleteHive;
window.canManageEmployees = canManageEmployees;
window.canTransferToSchedule = canTransferToSchedule;
window.canUpdateSchematics = canUpdateSchematics;
window.showPermissionDeniedAlert = showPermissionDeniedAlert;
window.getUserRoleDisplayName = getUserRoleDisplayName;
window.getUserRoleBadgeColor = getUserRoleBadgeColor;
window.isAdminUser = isAdminUser;
window.isEmployeeOnly = isEmployeeOnly;

// Log permissions module loaded
Logger.log('✅ Permissions module loaded');
