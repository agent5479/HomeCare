<<<<<<< HEAD
# 🏠 HomeCare - Professional Care Management System

A comprehensive, production-ready web-based care management system for disabled and elderly care services. Features real-time data synchronization, multi-tenant architecture, role-based access control, and comprehensive reporting capabilities.
=======
# 🏥 HomeCare Management System

A comprehensive, production-ready web-based home care management system for elderly, disabled, and special needs care coordination. Built with modern web technologies and Firebase, this system provides professional care management tools including client tracking, care action logging, scheduling, team coordination, and interactive location mapping with real-time data synchronization.
>>>>>>> b5053293d01ba10c025b4a2821ec94760e3b0555

![Version](https://img.shields.io/badge/version-0.8-blue.svg)
![Status](https://img.shields.io/badge/status-production--ready-green.svg)
![Security](https://img.shields.io/badge/security-enhanced-orange.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🏗️ System Architecture

<<<<<<< HEAD
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

## 🚀 Current Version: v0.8

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
=======
### Core Functionality
- **🔐 Multi-Tenant Authentication** - Secure user authentication and tenant management
- **👥 Client Management** - Add, edit, and manage care recipients with detailed medical information
- **🗺️ Interactive Maps** - Google Maps integration with real-time client location visualization
- **📝 Comprehensive Care Action Logging** - Record all care activities with automatic timestamps
- **✅ Quick Task Logging** - Checkbox-based system for logging multiple tasks at once
- **📅 Task Scheduling** - Schedule future tasks with automated reminders and tracking
- **📊 Advanced Reporting** - Generate detailed reports with charts, analytics, and data visualization
- **👨‍⚕️ Team Management** - Manage caregivers, supervisors, and administrative staff
- **🏥 Care Level Management** - Standard, Intensive, Specialized, and Palliative care levels

### Care Task Categories
- **Personal Care** - Hygiene, bathing, dressing, grooming, toileting, mobility
- **Medical Care** - Medication administration, vital signs, wound care, injections, physical therapy
- **Daily Living** - Meal preparation, feeding, housekeeping, laundry, shopping, transportation
- **Emotional Support** - Companionship, social activities, mental health checks, crisis intervention
- **Safety & Monitoring** - Safety assessments, fall risk evaluation, emergency response
- **Specialized Care** - Dementia care, Alzheimer's support, disability support, palliative care
>>>>>>> b5053293d01ba10c025b4a2821ec94760e3b0555

## 🏷️ Client Status Classification System

<<<<<<< HEAD
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
=======
### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)
- Git
>>>>>>> b5053293d01ba10c025b4a2821ec94760e3b0555

### Seasonal Classifications
- **Summer Site** - Active during summer months
- **Winter Site** - Active during winter months
- **All Year Round** - Year-round active sites

<<<<<<< HEAD
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
=======
1. **Clone the repository**
   ```bash
   git clone https://github.com/agent5479/HomeCare.git
   cd HomeCare
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run setup script**
   ```bash
   python setup.py
   ```

5. **Start the application**
   ```bash
   # On Windows:
   run.bat
   # On macOS/Linux:
   ./run.sh
   # Or directly:
   python app.py
   ```

6. **Access the application**
   - Open your browser and go to: `http://localhost:5000`

### Login Credentials

**Jess (Admin Account):**
- Username: `Jess`
- Password: `JessCard2025!`
- Access: Full administrative access

**GBTech (Developer Account):**
- Username: `GBTech`
- Password: `1q2w3e!Q@W#E`
- Access: Developer-level access

## 🏗️ System Architecture

### Backend (Flask)
- **app.py** - Main Flask application with route blueprints
- **models.py** - SQLAlchemy database models
- **forms.py** - WTForms for form handling
- **config.py** - Application configuration
- **routes/** - Modular route blueprints
  - `main.py` - Dashboard and analytics
  - `auth.py` - Authentication
  - `clients.py` - Client management
  - `actions.py` - Care action logging
  - `tasks.py` - Task scheduling
  - `employees.py` - Team management

### Frontend
- **templates/** - Jinja2 HTML templates
- **static/css/** - Custom CSS styling
- **static/js/** - JavaScript modules
- **Bootstrap 5** - UI framework
- **Bootstrap Icons** - Icon library

### Database
- **SQLite** - Local development database
- **SQLAlchemy ORM** - Database abstraction
- **Flask-Migrate** - Database migrations

## 📁 Project Structure

```
HomeCare/
├── app.py                 # Main Flask application
├── models.py              # Database models
├── forms.py               # WTForms
├── config.py              # Configuration
├── setup.py               # Setup script
├── requirements.txt       # Python dependencies
├── run.bat               # Windows run script
├── run.sh                # Unix run script
├── routes/               # Route blueprints
│   ├── __init__.py
│   ├── main.py
│   ├── auth.py
│   ├── clients.py
│   ├── actions.py
│   ├── tasks.py
│   └── employees.py
├── templates/            # HTML templates
│   ├── base.html
│   ├── dashboard.html
│   └── auth/
│       └── login.html
├── static/               # Static assets
│   ├── css/
│   │   └── homecare-brand.css
│   └── js/
│       ├── homecare-core.js
│       ├── homecare-clients.js
│       └── homecare-actions.js
├── docs/                 # Documentation
│   ├── homecare-management.html
│   ├── HOMECARE_MANAGEMENT_GUIDE.md
│   ├── HOMECARE_QUICK_START.md
│   └── LOGIN_CREDENTIALS.md
├── legacy/               # Legacy files for reference
└── README.md
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the project root:

```env
# Flask Configuration
SECRET_KEY=your-secret-key-here
FLASK_APP=app.py
FLASK_ENV=development

# Database
DATABASE_URL=sqlite:///homecare.db

# Google Maps API (optional)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Debug Mode
DEBUG=True
```

### Google Maps Integration
1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Add the API key to your `.env` file
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API

## 📊 Features Overview

### Client Management
- **Personal Information** - Name, age, contact details, emergency contacts
- **Medical Information** - Conditions, allergies, medications, special instructions
- **Care Level Assignment** - Standard, Intensive, Specialized, Palliative
- **Location Tracking** - GPS coordinates for home visits
- **Status Management** - Active, Inactive, Discharged

### Care Action Logging
- **50+ Predefined Tasks** - Across 6 care categories
- **Priority Levels** - Normal, High, Urgent
- **Time Tracking** - Date and time of care actions
- **Notes and Documentation** - Detailed care notes
- **Quick Logging** - Rapid task completion

### Task Scheduling
- **Future Planning** - Schedule tasks days/weeks ahead
- **Assignment Management** - Assign tasks to specific caregivers
- **Priority Management** - Urgent, high, normal priority levels
- **Status Tracking** - Pending, completed, cancelled
- **Overdue Detection** - Automatic overdue task identification

### Team Management
- **User Roles** - Admin, Developer, Supervisor, Caregiver
- **Employee Profiles** - Skills, certifications, contact information
- **Permission Management** - Role-based access control
- **Activity Tracking** - Monitor team performance

### Analytics & Reporting
- **Dashboard Statistics** - Real-time metrics
- **Care Metrics** - Action counts, task completion rates
- **Client Analytics** - Care level distribution, status tracking
- **Team Performance** - Individual and team statistics

## 🛠️ Development

### Running in Development Mode
```bash
python app.py
```

### Database Migrations
```bash
# Initialize migrations
flask db init

# Create migration
flask db migrate -m "Description of changes"

# Apply migration
flask db upgrade
```

### Testing
```bash
# Run tests
python -m pytest

# Run with coverage
python -m pytest --cov=app
```

## 📚 Documentation

- **[HomeCare Management Guide](docs/HOMECARE_MANAGEMENT_GUIDE.md)** - Complete system documentation
- **[Quick Start Guide](docs/HOMECARE_QUICK_START.md)** - Getting started quickly
- **[Login Credentials](docs/LOGIN_CREDENTIALS.md)** - User account information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `docs/` folder
- Review the legacy files in the `legacy/` folder for reference

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced reporting features
- [ ] Integration with medical devices
- [ ] Automated scheduling algorithms
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

---

**HomeCare Management System** - Professional Care Coordination Platform
>>>>>>> b5053293d01ba10c025b4a2821ec94760e3b0555
