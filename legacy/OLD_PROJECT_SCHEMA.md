# BeeMarshall - Complete Project Schema & Documentation

## 🏗️ **Project Overview**
**BeeMarshall** is a comprehensive beekeeping management system designed for professional apiary operations. The system provides multi-user support, real-time data synchronization, and advanced scheduling capabilities for beekeeping operations.

### **Core Philosophy**
- **Professionally Organized Logistics**: Professional-grade organization for apiarists
- **Multi-User Architecture**: Secure data isolation per organization
- **Real-Time Synchronization**: Firebase-powered cloud data management
- **Field-Ready Interface**: Mobile-optimized for field operations

---

## 📁 **File Structure & Architecture**

### **Frontend Structure**
```
docs/
├── beemarshall-full.html          # Main application interface
├── js/
│   ├── core.js                   # Core functionality & Firebase integration
│   ├── navigation.js             # View management & routing
│   ├── dashboard.js              # Dashboard widgets & statistics
│   ├── sites.js                  # Site management & map functionality
│   ├── scheduling.js             # Task scheduling & calendar features
│   ├── actions.js                # Action logging & history
│   ├── employees.js              # User management & permissions
│   └── tasks.js                  # Task definitions & templates
├── css/
│   └── beemarshall-enhanced.css  # Custom styling & themes
└── PROJECT_SCHEMA.md             # This documentation file
```

### **Data Architecture**
- **Firebase Realtime Database**: Cloud synchronization
- **Local Storage**: Offline capability & caching
- **Modular JavaScript**: Component-based architecture
- **Bootstrap 5**: Responsive UI framework

---

## 🎨 **Design System & UI Architecture**

### **Color Palette**
```css
:root {
    --primary-bg: #f8f9fa;           /* Light background */
    --secondary-accent: #e9ecef;     /* Card backgrounds */
    --primary-accent: #1fc8de;       /* Brand blue */
    --text-primary: #212529;         /* Dark text */
    --text-secondary: #6c757d;       /* Muted text */
    --success: #28a745;              /* Green for hives */
    --warning: #ffc107;              /* Yellow for alerts */
    --danger: #dc3545;                /* Red for urgent */
    --info: #17a2b8;                 /* Blue for actions */
}
```

### **Typography System**
- **Primary Font**: System fonts (sans-serif)
- **Headings**: Bold, hierarchical sizing
- **Body Text**: Readable, accessible contrast
- **Code**: Monospace for technical content

### **Component Architecture**
- **Cards**: Primary content containers with shadows
- **Buttons**: Consistent styling with hover effects
- **Forms**: Bootstrap-based with custom validation
- **Modals**: Professional overlay dialogs
- **Navigation**: Sticky header with responsive design

---

## 🗄️ **Database Schema & Data Models**

### **Core Entities**

#### **Organizations**
```javascript
{
  id: "org_123",
  name: "Organization Name",
  adminUsers: ["user1", "user2"],
  createdAt: "2024-01-01T00:00:00Z",
  settings: {
    timezone: "Pacific/Auckland",
    currency: "NZD"
  }
}
```

#### **Users**
```javascript
{
  id: "user_123",
  username: "username",
  email: "user@example.com",
  organizationId: "org_123",
  role: "admin|employee|contractor",
  status: "active|inactive|on_trial",
  permissions: ["read", "write", "admin"],
  lastLogin: "2024-01-01T00:00:00Z",
  createdAt: "2024-01-01T00:00:00Z"
}
```

#### **Hive Clusters**
```javascript
{
  id: "cluster_123",
  name: "Cluster Name",
  description: "Description text",
  latitude: -40.6764,
  longitude: 172.6856,
  hiveCount: 5,
  clusterType: "production|nuc|breeding|research",
  harvestTimeline: "Late January - Early February",
  sugarRequirements: "20kg for winter",
  landownerName: "Landowner Name",
  landownerPhone: "+64 21 123 4567",
  landownerEmail: "landowner@example.com",
  landownerAddress: "123 Farm Road, Collingwood",
  siteType: "summer|winter|year-round",
  accessType: "all-weather|dry-only",
  contactBeforeVisit: true,
  isQuarantine: false,
  notes: "Additional notes",
  createdAt: "2024-01-01T00:00:00Z",
  lastModified: "2024-01-01T00:00:00Z",
  lastModifiedBy: "username"
}
```

#### **Scheduled Tasks**
```javascript
{
  id: "task_123",
  clusterId: "cluster_123",
  individualHiveId: "hive_123", // Optional
  taskId: "inspection|harvest|treatment",
  dueDate: "2024-01-15",
  scheduledTime: "09:00", // Optional
  priority: "normal|high|urgent",
  notes: "Task notes",
  completed: false,
  completedBy: "username",
  completedAt: "2024-01-15T09:00:00Z",
  overdue: false,
  overdueDate: null,
  rescheduled: false,
  rescheduledDate: null,
  rescheduledBy: "username",
  createdAt: "2024-01-01T00:00:00Z",
  lastModified: "2024-01-01T00:00:00Z",
  lastModifiedBy: "username"
}
```

#### **Actions (Log Entries)**
```javascript
{
  id: "action_123",
  clusterId: "cluster_123",
  individualHiveId: "hive_123", // Optional
  taskName: "Hive Inspection",
  taskId: "inspection",
  date: "2024-01-15",
  loggedBy: "username",
  notes: "Action notes",
  flag: "normal|warning|urgent|info",
  weather: "sunny|cloudy|rainy",
  temperature: 25,
  conditions: "Good|Fair|Poor"
}
```

#### **Individual Hives**
```javascript
{
  id: "hive_123",
  clusterId: "cluster_123",
  hiveName: "Hive A",
  hiveNumber: 1,
  setup: "single|double|nuc|dead|top_split",
  strength: "strong|medium|weak|nuc",
  gear: "Standard|Premium|Basic",
  needs: "New frames|Queen|Feeding",
  notes: "Hive-specific notes",
  createdAt: "2024-01-01T00:00:00Z"
}
```

---

## 🔧 **Core Functionality Modules**

### **1. Authentication & User Management**
- **Multi-tenant Architecture**: Data isolation per organization
- **Role-Based Access Control**: Admin, employee, contractor roles
- **User Status Management**: Active, inactive, on-trial statuses
- **Permission System**: Granular access control

### **2. Cluster Management**
- **GPS Integration**: Precise location tracking
- **Map Visualization**: Interactive cluster mapping
- **Cluster Types**: Production, NUC, breeding, research
- **Landowner Management**: Contact information and access requirements
- **Site Classification**: Summer/winter sites, access types

### **3. Task Scheduling System**
- **Comprehensive Task Library**: 50+ predefined beekeeping tasks
- **Priority Management**: Normal, high, urgent priorities
- **Overdue Detection**: Automatic urgent flagging
- **Calendar Integration**: ICS export and import
- **Suggested Scheduling**: Seasonal task recommendations

### **4. Action Logging**
- **Field Reporting**: Quick action logging
- **Disease Reporting**: AFB, Varroa, Chalkbrood, Sacbrood, DWV
- **Weather Tracking**: Temperature and condition logging
- **Flag System**: Normal, warning, urgent, info flags
- **History Tracking**: Complete action audit trail

### **5. Dashboard & Analytics**
- **Real-time Statistics**: Clusters, hives, actions, flagged items
- **Interactive Cards**: Clickable navigation elements
- **Calendar Widget**: Upcoming tasks preview
- **Quick Stats**: This week, completed, pending, overdue counts
- **Reports Integration**: Analytics and reporting capabilities

### **6. Map Integration**
- **Interactive Mapping**: OpenStreetMap with Leaflet.js
- **Cluster Visualization**: Color-coded cluster types
- **Task Display**: Pending tasks in cluster popups
- **Location Management**: GPS coordinate validation
- **Navigation**: Direct links to cluster management

---

## 🎯 **Key Features & Capabilities**

### **Scheduling Features**
- **Task Templates**: Predefined beekeeping tasks
- **Recurring Tasks**: Seasonal scheduling patterns
- **Priority Escalation**: Automatic overdue handling
- **Calendar Export**: ICS file generation
- **Team Coordination**: Multi-user task management

### **Field Operations**
- **Mobile Optimization**: Responsive design for field use
- **Offline Capability**: Local storage with sync
- **Quick Actions**: Rapid task completion
- **GPS Integration**: Location-based features
- **Weather Tracking**: Environmental condition logging

### **Data Management**
- **Real-time Sync**: Firebase cloud synchronization
- **Data Export**: CSV export capabilities
- **Backup & Recovery**: Cloud data persistence
- **Version Control**: Change tracking and history
- **Multi-device Support**: Cross-platform compatibility

### **Reporting & Analytics**
- **Dashboard Metrics**: Key performance indicators
- **Task Analytics**: Completion rates and trends
- **Health Monitoring**: Disease and mortality tracking
- **Operational Reports**: Efficiency and resource usage
- **Custom Reports**: Flexible reporting system

---

## 🔄 **Data Flow & Synchronization**

### **Real-time Data Flow**
1. **User Action** → Local Storage → Firebase
2. **Firebase** → All Connected Clients
3. **Data Validation** → UI Update
4. **Conflict Resolution** → Last-write-wins

### **Offline Capability**
1. **Local Storage** → Queue Actions
2. **Connection Restored** → Sync Queue
3. **Conflict Detection** → User Resolution
4. **Data Consistency** → UI Refresh

---

## 🎨 **UI/UX Design Patterns**

### **Navigation Structure**
```
Dashboard
├── Clusters (Map View)
├── Actions (Logging)
├── Schedule (Tasks)
├── Reports (Analytics)
└── Team (User Management)
```

### **Component Hierarchy**
- **Views**: Main content areas
- **Modals**: Overlay dialogs
- **Cards**: Content containers
- **Forms**: Data input interfaces
- **Buttons**: Action triggers
- **Widgets**: Dashboard components

### **Responsive Design**
- **Mobile First**: Optimized for field use
- **Tablet Support**: Enhanced interface
- **Desktop**: Full-featured experience
- **Touch Friendly**: Large tap targets

---

## 🚀 **Deployment & Configuration**

### **Firebase Setup**
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789"
};
```

### **Environment Variables**
- **Firebase Config**: Database connection
- **API Keys**: External service integration
- **Feature Flags**: Optional functionality
- **Debug Mode**: Development settings

### **Browser Requirements**
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **JavaScript ES6+**: Modern language features
- **Local Storage**: Offline capability
- **Geolocation**: GPS features
- **Clipboard API**: Calendar export

---

## 🔧 **Development Guidelines**

### **Code Organization**
- **Modular Architecture**: Separate concerns
- **Consistent Naming**: Clear, descriptive names
- **Error Handling**: Graceful failure management
- **Performance**: Optimized for mobile devices
- **Accessibility**: WCAG compliance

### **Data Validation**
- **Client-side**: Immediate feedback
- **Server-side**: Firebase rules
- **Type Checking**: JavaScript validation
- **Range Validation**: GPS coordinates, dates
- **Required Fields**: Form validation

### **Testing Strategy**
- **Unit Tests**: Individual functions
- **Integration Tests**: Component interaction
- **User Testing**: Field validation
- **Performance Tests**: Load testing
- **Cross-browser**: Compatibility

---

## 📚 **API Reference**

### **Core Functions**
```javascript
// Navigation
showDashboard()
showClusters()
showActions()
showScheduledTasks()
showReports()

// Data Management
loadData()
saveData()
syncData()
validateData()

// Task Management
scheduleTask()
completeTask()
editTask()
deleteTask()

// Cluster Management
addCluster()
editCluster()
deleteCluster()
viewClusterDetails()

// Action Logging
logAction()
editAction()
deleteAction()
flagAction()
```

### **Firebase Integration**
```javascript
// Database References
database.ref('organizations')
database.ref('users')
database.ref('clusters')
database.ref('scheduledTasks')
database.ref('actions')

// Real-time Listeners
database.ref('clusters').on('value', updateClusters)
database.ref('scheduledTasks').on('value', updateTasks)
database.ref('actions').on('value', updateActions)
```

---

## 🎯 **Future Enhancement Roadmap**

### **Phase 1: Core Features** ✅
- [x] User authentication
- [x] Cluster management
- [x] Task scheduling
- [x] Action logging
- [x] Dashboard analytics

### **Phase 2: Advanced Features** 🔄
- [ ] Advanced reporting
- [ ] Mobile app development
- [ ] API integrations
- [ ] Automated notifications
- [ ] Machine learning insights

### **Phase 3: Enterprise Features** 📋
- [ ] Multi-organization support
- [ ] Advanced permissions
- [ ] Custom workflows
- [ ] Third-party integrations
- [ ] White-label solutions

---

## 🛠️ **Technical Specifications**

### **Frontend Technologies**
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with custom properties
- **JavaScript ES6+**: Modern language features
- **Bootstrap 5**: Responsive framework
- **Leaflet.js**: Interactive mapping
- **Chart.js**: Data visualization

### **Backend Services**
- **Firebase Realtime Database**: Cloud data storage
- **Firebase Authentication**: User management
- **Firebase Hosting**: Static site hosting
- **Firebase Security Rules**: Data protection

### **Development Tools**
- **Git**: Version control
- **GitHub Pages**: Static hosting
- **Firebase CLI**: Deployment tools
- **Browser DevTools**: Debugging
- **Lighthouse**: Performance auditing

---

## 📖 **Usage Instructions**

### **For Developers**
1. **Clone Repository**: `git clone [repository-url]`
2. **Configure Firebase**: Set up Firebase project
3. **Update Config**: Add Firebase configuration
4. **Deploy**: Use Firebase CLI or GitHub Pages
5. **Test**: Verify all functionality

### **For Users**
1. **Access Application**: Open in web browser
2. **Create Account**: Register with organization
3. **Add Clusters**: Set up hive locations
4. **Schedule Tasks**: Plan beekeeping activities
5. **Log Actions**: Record field activities
6. **Monitor Progress**: Use dashboard analytics

---

## 🔒 **Security & Privacy**

### **Data Protection**
- **Firebase Security Rules**: Database access control
- **User Authentication**: Secure login system
- **Data Encryption**: HTTPS transmission
- **Privacy Controls**: User data management
- **Audit Logging**: Activity tracking

### **Access Control**
- **Role-based Permissions**: Granular access control
- **Organization Isolation**: Data separation
- **Admin Controls**: User management
- **Session Management**: Secure authentication
- **Data Backup**: Cloud persistence

---

## 📞 **Support & Maintenance**

### **Documentation**
- **User Guides**: Step-by-step instructions
- **API Documentation**: Developer reference
- **Troubleshooting**: Common issues and solutions
- **FAQ**: Frequently asked questions
- **Video Tutorials**: Visual learning resources

### **Maintenance**
- **Regular Updates**: Feature enhancements
- **Bug Fixes**: Issue resolution
- **Security Patches**: Vulnerability updates
- **Performance Optimization**: Speed improvements
- **User Feedback**: Continuous improvement

---

## 🎉 **Project Status**

**Current Version**: 2.0.0  
**Last Updated**: January 2024  
**Status**: Production Ready  
**Maintainer**: Development Team  
**License**: Proprietary  

---

*This schema document provides a comprehensive overview of the BeeMarshall project structure, functionality, and design patterns for future development and maintenance.*
