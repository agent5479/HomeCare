# Archive Folder - HomeCare v0.7

This folder contains files that are no longer actively used in production but are preserved for historical reference.

## Contents

### `/python-backend/`
**Archived:** November 7, 2025  
**Reason:** HomeCare transitioned to a static GitHub Pages deployment. Python Flask backend no longer needed.

**Files:**
- `app.py`, `config.py`, `forms.py`, `models.py`, `setup.py` - Flask application files
- `routes/` - Python route handlers
- `templates/` - Jinja2 HTML templates

### `/old-docs/`
**Archived:** November 7, 2025  
**Reason:** Completed documentation, outdated guides, and verification files no longer needed for active development.

**Files:**
- Rebranding completion summaries
- Firebase setup and verification guides
- Security audit reports
- Employee activation guides
- Deployment checklists (superseded)
- Legacy login credentials documentation

### `/legacy-files/`
**Archived:** November 7, 2025  
**Reason:** Superseded HTML, JavaScript, and CSS files from earlier versions.

**Files:**
- `legacy/OLD_*` - Complete legacy codebase from pre-v0.7
- `homecare-management.html` - Old management interface
- `app-homecare-firebase.js` - Old Firebase connector
- `homecare-brand.css` - Old branding stylesheet
- `homecare-actions.js`, `homecare-clients.js` - Duplicate/old JavaScript modules

### `/test-files/`
**Archived:** November 7, 2025  
**Reason:** Test and configuration files not used in production.

**Files:**
- `test-firebase-connection.js` - Connection test script
- `firebase-database-rules.json` - Database rules (managed in Firebase Console)

---

## Active Production Files

**Main Application:**
- `docs/index.html` - Landing page
- `docs/caremarshall-full.html` - Main application
- `docs/reports.html` - Reporting interface

**Active JavaScript Modules:**
- `core.js`, `config.js`, `permissions.js`
- `sites.js`, `actions.js`, `tasks.js`, `scheduling.js`
- `compliance.js`, `employees.js`, `dashboard.js`
- `navigation.js`, `utils.js`, `calendar-feed.js`, `weather.js`
- `comprehensive-tasks-v07.js` - Task library

**Active Stylesheets:**
- `docs/css/brand.css` - CareMarshall branding

**Active Documentation:**
- `README.md` - Main project documentation
- `FUNCTIONAL_SETTINGS_README.md` - Feature documentation
- `docs/REPORTS_README.md` - Reporting guide

---

## Restoration

If you need to restore any archived files:

```bash
git mv archive/[folder]/[filename] [original-location]/
```

Or view the file history:

```bash
git log --follow -- archive/[folder]/[filename]
```

---

**Note:** All archived files remain in Git history and can be accessed at any time.

