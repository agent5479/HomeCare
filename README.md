# 🏠 HomeCare - Professional Care Management System

A comprehensive, production-ready web-based care management system for disabled and elderly care services. Features real-time data synchronization, multi-tenant architecture, role-based access control, and comprehensive reporting capabilities.

![Version](https://img.shields.io/badge/version-0.7-blue.svg)
![Status](https://img.shields.io/badge/status-production--ready-green.svg)
![Security](https://img.shields.io/badge/security-enhanced-orange.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🏗️ System Architecture

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5
- **Backend**: Python Flask (minimal), Firebase Realtime Database
- **Authentication**: Firebase Auth with multi-tenant support
- **Maps**: Google Maps JavaScript API
- **Weather**: OpenWeatherMap API
- **Security**: GitHub Secrets, bcrypt password hashing, role-based access control

### Core Architecture Principles
- **Offline-First**: Changes persist locally and sync when connection is restored
- **Multi-Tenant**: Complete data isolation between organizations
- **Role-Based Access**: Admin and Employee roles with appropriate permissions
- **Real-Time Sync**: Firebase-powered live data synchronization
- **Mobile-Responsive**: Optimized for all device sizes
- **Security-First**: No hardcoded credentials, secure password management

## 🚀 Current Version: v0.7

### System Capabilities
- **🔐 Enterprise Authentication** - Multi-tenant Firebase authentication with secure password management
- **👥 Team Management** - Admin-controlled employee accounts with temporary password system
- **📍 Advanced Client Location Management** - GPS coordinates, client status tracking, care coordination
- **🗺️ Interactive Mapping** - Real-time client location visualization with weather integration
- **👤 Individual Client Tracking** - Detailed client management with care status monitoring
- **📝 Comprehensive Care Action Logging** - Task-based activity logging with automatic categorization
- **📅 Intelligent Scheduling** - Care visit scheduling with overdue detection and rescheduling
- **📊 Advanced Analytics** - Performance metrics, care monitoring, operations analysis
- **🔍 Data Integrity Checking** - Built-in validation and consistency checking
- **📱 Mobile-Optimized** - Responsive design with touch-friendly interfaces
- **🌐 Real-Time Sync** - Live data synchronization with offline change queuing
- **📦 Data Export** - CSV export for all data types with tenant isolation
- **🛡️ Security Hardened** - No hardcoded credentials, secure tenant isolation

## 🏷️ Client Status Classification System

### Client Status Levels
- **Independent** - Clients who can manage daily activities independently
- **Assisted** - Clients requiring some assistance with daily activities
- **Dependent** - Clients requiring significant assistance and support
- **Rehabilitation** - Clients in active rehabilitation programs
- **Hospice** - Clients receiving end-of-life care
- **Research** - Experimental and study sites
- **Education** - Training and demonstration sites
- **Quarantine** - Isolated health management
- **Backup** - Emergency/overflow sites
- **Custom** - User-defined classifications

### Seasonal Classifications
- **Summer Site** - Active during summer months
- **Winter Site** - Active during winter months
- **All Year Round** - Year-round active sites

## 👥 User Roles & Permissions

### Administrator (Admin)
- Full system access
- Employee management (add, activate, deactivate)
- Site editing and management
- Task management and scheduling
- Data export and reporting
- System configuration

### Employee
- Limited site editing (summary cards only)
- Action logging and task completion
- View-only access to most system features
- Cannot access admin functions
- Cannot edit site details directly

## 🔧 System Configuration

### Environment Variables (GitHub Secrets)
The system uses GitHub Secrets for secure configuration:

**Required Secrets:**
- `****_USERNAME` - Admin username
- `****_PASSWORD` - Admin password (hashed)
- `FIREBASE_API_KEY` - Firebase API key
- `FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `FIREBASE_APP_ID` - Firebase app ID


### Firebase Security Rules
```javascript
{
  "rules": {
    "tenants": {
      "$tenantId": {
        ".read": true,
        ".write": true
      }
    },
    "tasks": {
      ".read": true,
      ".write": true
    },
    "deletedTasks": {
      ".read": true,
      ".write": true
    },
    "seasonalRequirements": {
      ".read": true,
      ".write": true
    },
    ".read": false,
    ".write": false
  }
}
```

## 📱 User Interface

### Main Application (`beemarshall-full.html`)
- **Dashboard** - Overview with key metrics and quick actions
- **Sites** - Apiary site management with interactive map
- **Actions** - Task logging and activity tracking
- **Schedule** - Task scheduling and calendar view
- **Tasks** - Task management (admin only)
- **Reports** - Analytics and reporting (external page)
- **Compliance** - NZ regulatory compliance tracking
- **Data Integrity** - Data validation and consistency checking
- **Team** - Employee management (admin only)

### Reports Dashboard (`reports.html`)
- **Performance Analytics** - Hive strength and productivity metrics
- **Health Monitoring** - Disease tracking and mortality analysis
- **Operations Analysis** - Task completion and efficiency metrics
- **Harvest Tracking** - Honey production and timeline analysis
- **Data Export** - CSV export functionality


## 🔒 Security Features

### Authentication & Authorization
- **Firebase Authentication** - Secure user authentication
- **Multi-Tenant Isolation** - Complete data separation between organizations
- **Role-Based Access Control** - Granular permissions for different user types
- **Password Security** - bcrypt hashing with strength validation
- **Session Management** - Secure session handling with device remembering

### Data Protection
- **No Hardcoded Credentials** - All sensitive data in GitHub Secrets
- **Tenant Isolation** - Firebase rules prevent cross-tenant data access
- **Input Validation** - Comprehensive data validation and sanitization
- **CSRF Protection** - Cross-site request forgery prevention
- **XSS Prevention** - Cross-site scripting protection

### Operational Security
- **Temporary Passwords** - Time-limited employee passwords
- **Device Remembering** - Secure device authentication
- **Audit Logging** - Comprehensive action logging
- **Data Integrity** - Built-in validation and consistency checking

## 📊 Data Management

### Firebase Database Structure
```
tenants/
├── {tenantId}/
│   ├── sites/
│   │   └── {siteId}/
│   ├── actions/
│   │   └── {actionId}/
│   ├── scheduledTasks/
│   │   └── {taskId}/
│   ├── individualHives/
│   │   └── {hiveId}/
│   ├── tasks/
│   │   └── {taskId}/
│   ├── employees/
│   │   └── {employeeId}/
│   └── users/
│       └── {userId}/
```

### Data Synchronization
- **Real-Time Updates** - Live data synchronization across devices
- **Offline Support** - Changes queued locally when offline
- **Conflict Resolution** - Automatic conflict resolution on reconnection
- **Data Validation** - Comprehensive validation before sync


### Documentation
- **User Guide** - `docs/USER_GUIDE.md`
- **Technical Documentation** - `docs/TENANT_STRUCTURE_AND_LOGS_README.md`
- **Reports Documentation** - `docs/REPORTS_README.md`
- **Setup Guide** - `docs/SETUP_GUIDE_LARS.md`


---

**BeeMarshall v1.78 - Production Ready Apiary Management System**

*Built with modern web technologies for professional beekeeping operations* 🐝
