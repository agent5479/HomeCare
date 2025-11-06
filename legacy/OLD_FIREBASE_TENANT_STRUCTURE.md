# Firebase Tenant Structure - BeeMarshall v0.92

## 🏢 Multi-Tenant Data Architecture

### **Firebase Database Structure**
```
Firebase Database:
├── master/
│   ├── initialized (boolean)
│   └── admin (master admin data)
├── tenants/
│   ├── lars/
│   │   ├── clusters/
│   │   ├── actions/
│   │   ├── scheduledTasks/
│   │   ├── employees/
│   │   └── individualHives/
│   └── gbtech/
│       ├── clusters/
│       ├── actions/
│       ├── scheduledTasks/
│       ├── employees/
│       └── individualHives/
├── tasks/ (global - shared across all tenants)
├── deletedTasks/ (global - shared across all tenants)
└── seasonalRequirements/ (global - shared across all tenants)
```

## 🔐 Authentication & Data Isolation

### **Admin Accounts**
- **Lars**: `lars` tenant - Master admin
- **GBTech**: `gbtech` tenant - Admin

### **Data Paths by Tenant**
| Data Type | Lars Path | GBTech Path |
|-----------|-----------|-------------|
| Clusters | `tenants/lars/clusters` | `tenants/gbtech/clusters` |
| Actions | `tenants/lars/actions` | `tenants/gbtech/actions` |
| Scheduled Tasks | `tenants/lars/scheduledTasks` | `tenants/gbtech/scheduledTasks` |
| Employees | `tenants/lars/employees` | `tenants/gbtech/employees` |
| Individual Hives | `tenants/lars/individualHives` | `tenants/gbtech/individualHives` |

## 📁 Updated Files & Firebase References

### **1. core.js**
- ✅ `loadDataFromFirebase()` - All data loading uses tenant paths
- ✅ `loadEmployees()` - Employee loading uses tenant paths
- ✅ `validateLogin()` - Employee authentication uses tenant paths
- ✅ `setupMasterUser()` - Master user setup (global)
- ✅ `validateLogin()` - Admin authentication (global)

### **2. sites.js**
- ✅ `saveSite()` - Site saving uses tenant paths
- ✅ `deleteCluster()` - Cluster deletion uses tenant paths

### **3. actions.js**
- ✅ `logActions()` - Action logging uses tenant paths
- ✅ `deleteAction()` - Action deletion uses tenant paths
- ✅ `unflagAction()` - Action unflagging uses tenant paths

### **4. scheduling.js**
- ✅ `scheduleTask()` - Task scheduling uses tenant paths
- ✅ `editScheduledTask()` - Task editing uses tenant paths
- ✅ `cancelScheduledTask()` - Task cancellation uses tenant paths
- ✅ `completeScheduledTask()` - Task completion uses tenant paths
- ✅ `scheduleForNextVisit()` - Next visit scheduling uses tenant paths

### **5. employees.js**
- ✅ `addEmployee()` - Employee creation uses tenant paths
- ✅ `removeEmployee()` - Employee deletion uses tenant paths

### **6. tasks.js**
- ✅ **Global Tasks** - Task templates remain global (shared across tenants)
- ✅ **Deleted Tasks** - Deleted task archive remains global

### **7. dashboard.js**
- ✅ **Sync Queue** - Generic sync system works with tenant paths

## 🔧 Implementation Details

### **Tenant Path Logic**
```javascript
// Pattern used throughout the application
const tenantPath = currentTenantId ? `tenants/${currentTenantId}/dataType` : 'dataType';
database.ref(`${tenantPath}/${id}`).set(data);
```

### **Data Isolation Examples**
```javascript
// Clusters
const tenantPath = currentTenantId ? `tenants/${currentTenantId}/clusters` : 'clusters';
database.ref(`${tenantPath}/${cluster.id}`).set(cluster);

// Actions
const tenantPath = currentTenantId ? `tenants/${currentTenantId}/actions` : 'actions';
database.ref(`${tenantPath}/${action.id}`).set(action);

// Scheduled Tasks
const tasksPath = currentTenantId ? `tenants/${currentTenantId}/scheduledTasks` : 'scheduledTasks';
database.ref(`${tasksPath}/${task.id}`).set(task);
```

## 🧪 Testing Scenarios

### **1. Complete Data Isolation**
- **Lars Account**: Creates clusters, actions, tasks
- **GBTech Account**: Sees only GBTech's data
- **No Cross-Contamination**: Zero data sharing

### **2. Shared Global Data**
- **Tasks**: Both tenants see same task templates
- **Seasonal Requirements**: Both tenants see same seasonal data
- **Deleted Tasks**: Both tenants see same deleted task archive

### **3. Employee Management**
- **Lars**: Can create employees for Lars' tenant
- **GBTech**: Can create employees for GBTech's tenant
- **Isolation**: Employees only see their tenant's data

## 🚀 Benefits

### **1. Complete Data Separation**
- Each admin account has isolated data
- No risk of data mixing between tenants
- Independent operations and management

### **2. Scalable Architecture**
- Easy to add new tenant accounts
- Consistent data structure across tenants
- Maintainable codebase

### **3. Security**
- Tenant-specific data access
- No cross-tenant data leakage
- Secure authentication per tenant

## 📊 Console Logging

### **Expected Console Output**
```
🏢 Loading data for tenant: gbtech
📊 Clusters loaded for gbtech: 0
🏢 Tenant ID: gbtech
✅ All BeeMarshall modules loaded successfully
```

### **Debug Information**
- Tenant ID displayed in console
- Data loading confirmation per tenant
- Firebase path logging for debugging

## ✅ Verification Checklist

- [x] All cluster operations use tenant paths
- [x] All action operations use tenant paths  
- [x] All scheduled task operations use tenant paths
- [x] All employee operations use tenant paths
- [x] Global tasks remain shared
- [x] Authentication uses tenant-specific employee lookup
- [x] Data loading uses tenant paths
- [x] Console logging shows tenant information
- [x] Complete data isolation between tenants
