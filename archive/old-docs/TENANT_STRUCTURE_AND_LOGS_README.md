# BeeMarshall - Tenant Structure & Complex Log Systems Documentation

**Version:** v1.3  
**Last Updated:** December 2024  
**System:** Multi-tenant beekeeping management platform

---

## 🏗️ **System Architecture Overview**

BeeMarshall implements a sophisticated multi-tenant architecture with complete data isolation, role-based access control, and comprehensive logging systems for professional beekeeping operations.

### **Core Principles**
- **Tenant Isolation**: Complete data separation between organizations
- **Role-Based Security**: Granular permissions for different user types
- **Audit Trails**: Comprehensive logging of all system activities
- **Real-time Sync**: Live data updates across all connected devices
- **Offline Support**: Local storage with sync when reconnected

---

## 🏢 **Multi-Tenant Data Architecture**

### **Firebase Database Structure**
```
Firebase Realtime Database:
├── master/
│   ├── initialized (boolean)
│   └── admin (master admin configuration)
├── tenants/
│   ├── lars/
│   │   ├── sites/ (formerly clusters)
│   │   ├── actions/
│   │   ├── scheduledTasks/
│   │   ├── employees/
│   │   ├── individualHives/
│   │   ├── honeyTypes/
│   │   └── users/ (user profiles)
│   ├── gbtech/
│   │   ├── sites/
│   │   ├── actions/
│   │   ├── scheduledTasks/
│   │   ├── employees/
│   │   ├── individualHives/
│   │   ├── honeyTypes/
│   │   └── users/
│   └── demo/
│       └── [same structure]
├── tasks/ (global - shared across all tenants)
├── deletedTasks/ (global - shared across all tenants)
└── seasonalRequirements/ (global - shared across all tenants)
```

### **Tenant Isolation Strategy**
- **Path-based isolation**: Each tenant's data is stored under `tenants/{tenantId}/`
- **Authentication-based access**: Users can only access their assigned tenant's data
- **Cross-tenant prevention**: No direct access between tenant data stores
- **Global data sharing**: Task templates and seasonal requirements shared across tenants

---

## 📊 **Core Data Structures**

### **1. Sites (Apiary Locations)**
**Path:** `tenants/{tenantId}/sites/{siteId}`

```javascript
{
  id: "site_1234567890",
  name: "Main Apiary Site",
  description: "Primary beekeeping location",
  latitude: -41.2924,
  longitude: 174.7787,
  hiveCount: 15,
  
  // Hive strength breakdown
  hiveStrength: {
    strong: 8,
    medium: 4,
    weak: 2,
    nuc: 1,
    dead: 0
  },
  
  // Hive stack configuration
  hiveStacks: {
    doubles: 6,
    topSplits: 2,
    singles: 4,
    nucs: 2,
    empty: 1
  },
  
  // Site classification
  functionalClassification: "production", // production, breeding, research, quarantine
  seasonalClassification: "all-year", // summer, winter, all-year
  
  // Landowner information
  landownerName: "John Smith",
  landownerPhone: "+64 21 123 4567",
  landownerEmail: "john@example.com",
  landownerAddress: "123 Farm Road, Wellington",
  
  // Access and permissions
  accessType: "permanent", // permanent, seasonal, temporary
  contactBeforeVisit: true,
  isQuarantine: false,
  
  // Operational details
  harvestTimeline: "January-March",
  sugarRequirements: "2kg per hive",
  notes: "South-facing slope, good drainage",
  
  // Metadata
  createdAt: "2024-01-15T10:30:00.000Z",
  lastModified: "2024-12-19T14:22:00.000Z",
  lastModifiedBy: "Lars",
  archived: false,
  archivedDate: null,
  archivedBy: null
}
```

### **2. Actions (Activity Logs)**
**Path:** `tenants/{tenantId}/actions/{actionId}`

```javascript
{
  id: "action_1234567890",
  siteId: "site_1234567890",
  siteName: "Main Apiary Site",
  
  // Task information
  taskName: "Hive Inspection",
  taskId: "task_1",
  taskCategory: "Inspection",
  
  // Action details
  action: "Completed hive inspection",
  description: "Checked all 15 hives, found 2 weak colonies",
  date: "2024-12-19T14:22:00.000Z",
  
  // User information
  performedBy: "Lars",
  userId: "lars",
  
  // Flags and priority
  flag: "", // empty, "urgent", "follow-up", "maintenance"
  priority: "normal", // low, normal, high, urgent
  
  // Weather conditions
  weather: {
    temperature: 22,
    conditions: "sunny",
    windSpeed: 5
  },
  
  // Hive state changes
  hiveStateChanges: {
    strong: 0,    // net change
    medium: -1,   // net change
    weak: 1,      // net change
    nuc: 0,       // net change
    dead: 0       // net change
  },
  
  // Metadata
  createdAt: "2024-12-19T14:22:00.000Z",
  lastModified: "2024-12-19T14:22:00.000Z",
  lastModifiedBy: "Lars"
}
```

### **3. Scheduled Tasks**
**Path:** `tenants/{tenantId}/scheduledTasks/{taskId}`

```javascript
{
  id: "scheduled_1234567890",
  siteId: "site_1234567890",
  siteName: "Main Apiary Site",
  
  // Task details
  taskName: "Honey Harvest",
  taskId: "task_2",
  taskCategory: "Harvest",
  description: "Collect honey from productive hives",
  
  // Scheduling
  dueDate: "2024-12-25T09:00:00.000Z",
  scheduledBy: "Lars",
  scheduledDate: "2024-12-19T14:22:00.000Z",
  
  // Status
  completed: false,
  completedDate: null,
  completedBy: null,
  cancelled: false,
  cancelledDate: null,
  cancelledBy: null,
  
  // Priority and flags
  priority: "high",
  flag: "", // empty, "urgent", "weather-dependent"
  
  // Notes
  notes: "Check weather forecast before proceeding",
  
  // Metadata
  createdAt: "2024-12-19T14:22:00.000Z",
  lastModified: "2024-12-19T14:22:00.000Z",
  lastModifiedBy: "Lars"
}
```

### **4. Employees (Team Members)**
**Path:** `tenants/{tenantId}/employees/{employeeId}`

```javascript
{
  id: "emp_1234567890",
  username: "ayson",
  name: "Ayson Smith",
  email: "ayson@example.com",
  phone: "+64 21 987 6543",
  
  // Role and permissions
  role: "employee",
  permissions: ["view", "create", "update"], // cannot delete
  
  // Status
  isActive: true,
  activationCode: "ABC123XYZ",
  activatedDate: "2024-12-19T10:00:00.000Z",
  activatedBy: "Lars",
  
  // Security
  passwordHash: "hashed_password_here",
  temporaryPassword: "xYq4Vt9P",
  temporaryPasswordExpiry: "2024-12-21T10:00:00.000Z",
  deviceRemembered: true,
  deviceRememberedDate: "2024-12-19T10:00:00.000Z",
  
  // Tenant assignment
  tenantId: "lars",
  createdBy: "Lars",
  
  // Metadata
  createdAt: "2024-12-19T10:00:00.000Z",
  lastLogin: "2024-12-19T14:22:00.000Z",
  lastModified: "2024-12-19T10:00:00.000Z",
  lastModifiedBy: "Lars"
}
```

### **5. Individual Hives**
**Path:** `tenants/{tenantId}/individualHives/{hiveId}`

```javascript
{
  id: "hive_1234567890",
  siteId: "site_1234567890",
  siteName: "Main Apiary Site",
  
  // Hive identification
  hiveNumber: "H001",
  queenId: "Q2024-001",
  queenMarking: "white", // white, yellow, red, green, blue
  
  // Hive state
  strength: "strong", // strong, medium, weak, nuc, dead
  stackType: "double", // double, topSplit, single, nuc, empty
  
  // Health status
  healthStatus: "healthy", // healthy, diseased, weak, dead
  diseases: [], // array of disease names
  treatments: [], // array of treatment records
  
  // Production
  honeyProduction: 25.5, // kg
  lastHarvest: "2024-11-15T00:00:00.000Z",
  expectedProduction: 30.0, // kg
  
  // Notes
  notes: "Very productive colony, good temperament",
  
  // Metadata
  createdAt: "2024-01-15T10:30:00.000Z",
  lastModified: "2024-12-19T14:22:00.000Z",
  lastModifiedBy: "Lars"
}
```

---

## 🔐 **Authentication & Security Architecture**

### **User Roles & Permissions**

| Role | Site Access | Action Access | Task Access | Employee Access | Delete Rights |
|------|-------------|---------------|-------------|-----------------|---------------|
| **Master Admin** | Full CRUD | Full CRUD | Full CRUD | Full CRUD | All |
| **Admin** | Full CRUD | Full CRUD | Full CRUD | Full CRUD | All |
| **Demo Admin** | Read Only | Read Only | Read Only | Read Only | None |
| **Employee** | View/Create/Update | View/Create/Update | View/Create/Update | None | None |

### **Permission System**
```javascript
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
    
    // Employee Management
    EMPLOYEE_VIEW: ['master_admin', 'admin'],
    EMPLOYEE_CREATE: ['master_admin', 'admin'],
    EMPLOYEE_DELETE: ['master_admin', 'admin']
};
```

### **Security Features**
- **Password Hashing**: bcrypt with Web Crypto API fallback
- **Temporary Passwords**: Time-limited access for employees
- **Device Remembering**: Persistent login for trusted devices
- **Rate Limiting**: Prevents brute force attacks
- **Audit Logging**: All actions tracked with user attribution
- **Data Encryption**: All data encrypted in transit and at rest

---

## 📝 **Comprehensive Logging System**

### **1. Action Logging**
Every user action is logged with complete context:

```javascript
// Example: Hive strength update
{
  action: "Updated hive strength",
  siteId: "site_1234567890",
  siteName: "Main Apiary Site",
  taskName: "Hive State Update",
  taskId: "hive_state_update",
  taskCategory: "Management",
  performedBy: "Lars",
  date: "2024-12-19T14:22:00.000Z",
  changes: {
    strong: 2,    // +2 strong hives
    medium: -1,   // -1 medium hive
    weak: -1      // -1 weak hive
  },
  previousState: { strong: 6, medium: 5, weak: 3 },
  newState: { strong: 8, medium: 4, weak: 2 }
}
```

### **2. System Event Logging**
System events are tracked for debugging and monitoring:

```javascript
// Example: Data sync event
{
  event: "data_sync",
  timestamp: "2024-12-19T14:22:00.000Z",
  tenantId: "lars",
  userId: "lars",
  action: "sites_updated",
  recordCount: 15,
  success: true,
  duration: 245 // milliseconds
}
```

### **3. Error Logging**
All errors are logged with context:

```javascript
// Example: Database error
{
  error: "permission_denied",
  timestamp: "2024-12-19T14:22:00.000Z",
  tenantId: "lars",
  userId: "lars",
  action: "load_employees",
  path: "tenants/lars/employees",
  message: "Access denied to employee data",
  stackTrace: "..."
}
```

### **4. Compliance Logging**
Regulatory compliance activities are tracked:

```javascript
// Example: Compliance task completion
{
  complianceTask: "Annual Disease Return",
  year: 2024,
  completedBy: "Lars",
  completedDate: "2024-12-19T14:22:00.000Z",
  tenantId: "lars",
  status: "completed",
  notes: "Submitted to NZBB"
}
```

---

## 🔄 **Data Synchronization & Offline Support**

### **Real-time Synchronization**
- **Firebase Listeners**: Live updates across all connected devices
- **Conflict Resolution**: Last-write-wins with timestamp comparison
- **Sync Status**: Visual indicators for sync state
- **Offline Queue**: Local storage of changes when offline

### **Offline Support**
```javascript
// Offline change queue
{
  id: "offline_change_1234567890",
  action: "create_site",
  data: { /* site data */ },
  timestamp: "2024-12-19T14:22:00.000Z",
  userId: "lars",
  tenantId: "lars",
  synced: false
}
```

### **Sync Status Management**
- **Syncing**: Real-time updates in progress
- **Offline**: No connection, changes queued locally
- **Error**: Sync failed, retry pending
- **Success**: All changes synchronized

---

## 🏗️ **Tenant Management System**

### **Tenant Creation Process**
1. **Admin Account Setup**: Master admin creates tenant
2. **Data Isolation**: Tenant-specific Firebase paths created
3. **Employee Management**: Admin adds team members
4. **Permission Assignment**: Role-based access configured
5. **Data Migration**: Legacy data moved to tenant structure

### **Tenant Data Paths**
```javascript
// Dynamic tenant path generation
const getTenantPath = (dataType, tenantId) => {
  return tenantId ? `tenants/${tenantId}/${dataType}` : dataType;
};

// Examples
const sitesPath = getTenantPath('sites', 'lars'); // "tenants/lars/sites"
const actionsPath = getTenantPath('actions', 'gbtech'); // "tenants/gbtech/actions"
const globalTasksPath = getTenantPath('tasks', null); // "tasks"
```

### **Cross-Tenant Data Sharing**
- **Task Templates**: Shared across all tenants
- **Seasonal Requirements**: Global beekeeping guidelines
- **Deleted Tasks Archive**: Global task management
- **System Configuration**: Master admin settings

---

## 📊 **Data Relationships & Dependencies**

### **Primary Relationships**
```
Sites (1) ←→ (Many) Actions
Sites (1) ←→ (Many) Scheduled Tasks
Sites (1) ←→ (Many) Individual Hives
Tenants (1) ←→ (Many) Employees
Tenants (1) ←→ (Many) Sites
Actions (Many) ←→ (1) Tasks (Templates)
```

### **Data Integrity Rules**
1. **Site Deletion**: Cascades to related actions and tasks
2. **Employee Deactivation**: Prevents login but preserves data
3. **Task Completion**: Creates action record and removes from schedule
4. **Hive State Changes**: Logged as actions with site context

### **Referential Integrity**
- **Site References**: All actions and tasks must reference valid sites
- **User References**: All actions must reference valid users
- **Task References**: All scheduled tasks must reference valid task templates
- **Tenant References**: All data must belong to valid tenant

---

## 🔧 **Technical Implementation Details**

### **Firebase Security Rules**
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

### **Data Validation**
- **Client-side**: Form validation and type checking
- **Server-side**: Firebase rules for data integrity
- **Business Logic**: Custom validation for beekeeping workflows

### **Performance Optimization**
- **Lazy Loading**: Data loaded on demand
- **Pagination**: Large datasets paginated
- **Caching**: Local storage for frequently accessed data
- **Debouncing**: UI updates optimized for performance

---

## 🚀 **Deployment & Maintenance**

### **Environment Configuration**
- **Development**: Local Firebase project
- **Staging**: Test tenant with sample data
- **Production**: Live tenant with real data

### **Backup & Recovery**
- **Firebase Backup**: Automated daily backups
- **Data Export**: CSV export for all data types
- **Migration Tools**: Legacy data migration scripts

### **Monitoring & Analytics**
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Response time monitoring
- **Usage Analytics**: User activity tracking
- **Compliance Reporting**: Regulatory requirement tracking

---

## 📚 **API Reference**

### **Core Functions**
- `loadDataFromFirebase()`: Load all tenant data
- `saveSite(siteData)`: Create/update site
- `logAction(actionData)`: Log user action
- `scheduleTask(taskData)`: Schedule new task
- `addEmployee(employeeData)`: Add team member

### **Permission Functions**
- `hasPermission(permission)`: Check user permission
- `canManageEmployees()`: Check employee management rights
- `canDeleteSite()`: Check site deletion rights

### **Sync Functions**
- `syncStatusManager`: Real-time sync management
- `queueOfflineChange()`: Queue change for later sync
- `processOfflineQueue()`: Process queued changes

---

## 🔍 **Troubleshooting Guide**

### **Common Issues**
1. **Permission Denied**: Check user role and tenant assignment
2. **Data Not Loading**: Verify Firebase connection and tenant ID
3. **Sync Failures**: Check network connection and retry
4. **Login Issues**: Verify credentials and activation status

### **Debug Information**
- **Console Logging**: Comprehensive debug output
- **Error Tracking**: Detailed error messages
- **Sync Status**: Real-time sync indicators
- **Performance Metrics**: Response time monitoring

---

## 📈 **Future Enhancements**

### **Planned Features**
- **Advanced Analytics**: Machine learning insights
- **Mobile App**: Native iOS/Android applications
- **API Integration**: Third-party service connections
- **Advanced Reporting**: Custom report builder

### **Scalability Improvements**
- **Microservices**: Service-oriented architecture
- **Caching Layer**: Redis for improved performance
- **Load Balancing**: Multi-instance deployment
- **Database Optimization**: Query optimization and indexing

---

**End of Documentation**

*This document provides comprehensive coverage of BeeMarshall's complex log structures and tenant relationships. For technical support or questions, refer to the development team or system administrator.*
