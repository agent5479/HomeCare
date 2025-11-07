# BeeMarshall Firebase Database Paths Documentation

## Overview
This document lists all Firebase Realtime Database paths used in the BeeMarshall application. The application uses a multi-tenant architecture with namespace-based isolation.

**Version:** v0.96  
**Last Updated:** 2024

---

## Root Level Paths

### Global Data (Not Tenant-Specific)
These paths are accessible across all tenants and contain application-wide configuration:

| Path | Description | Access |
|------|-------------|--------|
| `tasks/` | Task templates and definitions | Global |
| `deletedTasks/` | Archive of deleted tasks | Global |
| `seasonalRequirements/` | Seasonal beekeeping requirements | Global |
| `master/` | Master admin configuration | Admin only |
| `master/initialized` | Master system initialization flag | Admin |
| `master/admin` | Master admin user object | Admin |

---

## Tenant-Specific Paths

All tenant data follows the pattern: `tenants/{tenantId}/`

### Current Tenants
- `lars` - Primary user account
- `gbtech` - GBTech business account
- `demo` - Demo account

---

## Tenant Data Paths

### `tenants/{tenantId}/clusters/`
**Data Type:** Hive clusters (locations)

**Path Pattern:** `tenants/{tenantId}/clusters/{clusterId}`

**Example:** `tenants/lars/clusters/cluster_123`

**Usage:**
- Created/updated in `docs/js/sites.js`
- Deleted in `docs/js/sites.js`
- Loaded in `docs/js/core.js`
- Displayed in dashboard and cluster management

**Key Fields:**
- `id` - Unique cluster ID
- `name` - Cluster name
- `latitude`, `longitude` - GPS coordinates
- `hiveCount` - Total number of hives
- `hiveStrength` - Object with strong/medium/weak/nuc/dead counts
- `hiveStacks` - Object with doubles/topSplits/singles/nucs/empty counts
- `clusterType` - Type of cluster
- `landownerName`, `landownerPhone`, `landownerEmail`, `landownerAddress`
- `siteType`, `accessType`
- `contactBeforeVisit` - Boolean
- `isQuarantine` - Boolean
- `harvestTimeline` - String
- `sugarRequirements` - String
- `notes` - String
- `createdAt` - Timestamp
- `lastModifiedBy` - User ID
- `lastModifiedAt` - Timestamp

---

### `tenants/{tenantId}/actions/`
**Data Type:** Completed actions/tasks

**Path Pattern:** `tenants/{tenantId}/actions/{actionId}`

**Example:** `tenants/lars/actions/action_456`

**Usage:**
- Created in `docs/js/actions.js`
- Deleted in `docs/js/actions.js` (admin only)
- Flagged/unflagged in `docs/js/actions.js`
- Loaded in `docs/js/core.js`
- Displayed in dashboard and actions list

**Key Fields:**
- `id` - Unique action ID
- `date` - Date of action (ISO string)
- `clusterId` - Reference to cluster
- `taskId` - Reference to task template
- `taskName` - Task name
- `taskCategory` - Task category
- `individualHiveId` - Optional reference to specific hive
- `notes` - Action notes
- `flag` - Flag status (urgent/warning/info/empty)
- `loggedBy` - User ID
- `createdAt` - Timestamp
- `fromScheduledTask` - Boolean
- `originalScheduledTaskId` - Reference if created from schedule

---

### `tenants/{tenantId}/scheduledTasks/`
**Data Type:** Scheduled/future tasks

**Path Pattern:** `tenants/{tenantId}/scheduledTasks/{taskId}`

**Example:** `tenants/lars/scheduledTasks/task_789`

**Usage:**
- Created in `docs/js/scheduling.js`
- Completed in `docs/js/scheduling.js` (converts to action)
- Deleted in `docs/js/scheduling.js` (admin only)
- Updated in `docs/js/scheduling.js`
- Loaded in `docs/js/core.js`
- Displayed in scheduled tasks view and timeline

**Key Fields:**
- `id` - Unique task ID
- `taskId` - Reference to task template
- `clusterId` - Reference to cluster
- `individualHiveId` - Optional reference to specific hive
- `dueDate` - ISO date string
- `scheduledTime` - Time string (HH:mm)
- `priority` - Priority level (urgent/high/normal/low)
- `completed` - Boolean
- `notes` - Task notes
- `overdue` - Boolean
- `overdueDate` - ISO timestamp
- `createdBy` - User ID
- `createdAt` - Timestamp
- `completedBy` - User ID (if completed)
- `completedAt` - Timestamp (if completed)
- `lastModifiedBy` - User ID
- `lastModifiedAt` - Timestamp

---

### `tenants/{tenantId}/individualHives/`
**Data Type:** Individual hive records

**Path Pattern:** `tenants/{tenantId}/individualHives/{hiveId}`

**Example:** `tenants/lars/individualHives/hive_321`

**Usage:**
- Created/updated in cluster detail view
- Loaded in `docs/js/core.js`
- Displayed in cluster detail modals

**Key Fields:**
- `id` - Unique hive ID
- `clusterId` - Reference to cluster
- `hiveName` - Hive identifier
- `hiveNumber` - Hive number
- `status` - Hive status
- `queenStatus` - Queen status
- `broodPattern` - Brood pattern description
- `foodStores` - Food stores status
- `population` - Population estimate
- `notes` - Hive notes
- `createdAt` - Timestamp
- `lastModifiedAt` - Timestamp

---

### `tenants/{tenantId}/employees/`
**Data Type:** Team employee records

**Path Pattern:** `tenants/{tenantId}/employees/{employeeId}`

**Example:** `tenants/lars/employees/emp_654`

**Usage:**
- Created in `docs/js/employees.js` (admin only)
- Deleted in `docs/js/employees.js` (admin only)
- Loaded in `docs/js/core.js`
- Displayed in employee management view

**Key Fields:**
- `id` - Unique employee ID
- `username` - Employee username
- `email` - Employee email
- `role` - Employee role (employee/admin)
- `createdAt` - Timestamp

---

### `tenants/{tenantId}/tasks/`
**Data Type:** Task templates (per-tenant overrides)

**Path Pattern:** `tenants/{tenantId}/tasks/{taskId}`

**Example:** `tenants/lars/tasks/custom_task_987`

**Usage:**
- Created/updated in `docs/js/tasks.js` (admin only)
- Deleted in `docs/js/tasks.js` (admin only)
- Can override global task templates

**Key Fields:**
- `id` - Unique task ID
- `name` - Task name
- `category` - Task category
- `common` - Boolean (is common task)
- `createdAt` - Timestamp

---

## Data Flow Examples

### Creating a New Cluster
```
User Input → sites.js → database.ref('tenants/lars/sites/123').set(siteData)
                              ↓
                         Firebase Realtime DB
                              ↓
                    core.js listener updates local state
                              ↓
                    dashboard updates automatically
```

### Completing a Scheduled Task
```
User Action → scheduling.js → database.ref('tenants/lars/scheduledTasks/456').update({completed: true})
                                  ↓
                            Create action in actions collection
                                  ↓
                            database.ref('tenants/lars/actions/789').set(actionData)
                                  ↓
                            Remove from scheduledTasks
                                  ↓
                    dashboard updates to show completed action
```

### Employee Attempting to Delete Cluster
```
User Action → permissions.js check → canDeleteCluster() → false
                                    ↓
                            showPermissionDeniedAlert()
                                    ↓
                    Action blocked (employee cannot delete)
```

---

## Security Considerations

### Tenant Isolation
- All tenant data is isolated at the database path level
- Users can only access data within their assigned tenant
- Cross-tenant access is prevented by path structure

### Role-Based Access
- Employees cannot delete clusters, actions, or tasks
- Admins have full CRUD access
- Permission checks enforced in `docs/js/permissions.js`

### Data Validation
- Client-side validation in form inputs
- Server-side rules recommended for production
- Timestamps and user tracking on all mutations

---

## Migration Paths

### Legacy Data Migration
Old Firebase paths (pre-tenant structure):
- `clusters/` → `tenants/lars/clusters/`
- `actions/` → `tenants/lars/actions/`
- `scheduledTasks/` → `tenants/lars/scheduledTasks/`
- `employees/` → `tenants/lars/employees/`
- `individualHives/` → `tenants/lars/individualHives/`

Migration script: `docs/migrate-data.html`

---

## Firebase Configuration

### Database URLs
- **Production:** `https://beemarshall-a311e-default-rtdb.firebaseio.com/`
- **Legacy:** `https://larsbees-378aa-default-rtdb.firebaseio.com/`

### Firebase Rules (Recommended)
```json
{
  "rules": {
    "tenants": {
      "$tenantId": {
        ".read": "auth !== null && (auth.uid === 'admin' || root.child('tenants').child($tenantId).child('employees').hasChild(auth.uid))",
        ".write": "auth !== null && (auth.uid === 'admin' || root.child('tenants').child($tenantId).child('employees').hasChild(auth.uid))"
      }
    },
    "tasks": {
      ".read": "auth !== null",
      ".write": "auth !== null && auth.uid === 'admin'"
    }
  }
}
```

---

## References

### JavaScript Files
- `docs/js/core.js` - Data loading and Firebase listeners
- `docs/js/sites.js` - Site management
- `docs/js/actions.js` - Action management
- `docs/js/scheduling.js` - Task scheduling
- `docs/js/employees.js` - Employee management
- `docs/js/permissions.js` - Access control
- `docs/js/tasks.js` - Task template management

### HTML Files
- `docs/beemarshall-full.html` - Main application
- `docs/reports.html` - Reports and analytics

---

## Change Log

### v0.96 (Current)
- Added tenant-based data isolation
- Implemented role-based access control
- Added permission system for team collaboration
- Added weather widget integration
- Enhanced data migration tools

### Previous Versions
- Initial Firebase integration
- Legacy data structure migration
- Multi-tenant architecture implementation

---

**End of Documentation**
