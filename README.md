# 🏥 HomeCare Management System

A comprehensive, production-ready web-based home care management system for elderly, disabled, and special needs care coordination. Built with modern web technologies and Firebase, this system provides professional care management tools including client tracking, care action logging, scheduling, team coordination, and interactive location mapping with real-time data synchronization.

![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/flask-3.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 📋 Features

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

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)
- Git

### Installation

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
