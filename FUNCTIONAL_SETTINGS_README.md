# HomeCare - Functional Settings & Fallback Guide

## 🚨 Critical System Settings

### GitHub Secrets Configuration
**Repository**: `https://github.com/agent5479/HomeCare/settings/secrets/actions`

#### Required Secrets:
```
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
GBTECH_PASSWORD=your_gbtech_password
GBTECH_USERNAME=your_gbtech_username
LARS_PASSWORD=your_lars_password
LARS_USERNAME=your_lars_username
```

### Firebase Security Rules
**Location**: Firebase Console → Realtime Database → Rules

```json
{
  "rules": {
    "tenants": {
      "$tenantId": {
        ".read": true,
        ".write": true
      }
    },
    ".read": false,
    ".write": false
  }
}
```

### GitHub Pages Settings
**Repository**: `https://github.com/agent5479/HomeCare/settings/pages`

- **Source**: GitHub Actions
- **Branch**: gh-pages (auto-generated)

### GitHub Actions Permissions
**Repository**: `https://github.com/agent5479/HomeCare/settings/actions`

- **Workflow permissions**: Read and write permissions
- **Allow GitHub Actions to create and approve pull requests**: ✅

## 🔧 System Architecture

### Data Structure
```
tenants/
├── lars/
│   ├── sites/ (array of site objects)
│   ├── actions/ (array of action objects)
│   ├── scheduledTasks/ (array of scheduled task objects)
│   ├── individualHives/ (array of hive objects)
│   ├── tasks/ (array of task templates)
│   └── deletedTasks/ (object of deleted task records)
├── gbtech/
│   └── [same structure as lars]
└── demo/
    └── [same structure as lars]
```

### Key Files
- **Main App**: `docs/beemarshall-full.html`
- **Reports**: `docs/reports.html`
- **Core Logic**: `docs/js/core.js`
- **Dashboard**: `docs/js/dashboard.js`
- **Sites Management**: `docs/js/sites.js`
- **Task Management**: `docs/js/tasks.js`
- **Configuration**: `docs/js/config.js`
- **Environment**: `docs/js/env-config.js` (auto-generated)

## 🚀 Deployment Process

### Automatic Deployment
1. Push changes to `main` branch
2. GitHub Actions automatically:
   - Injects secrets into `env-config.js`
   - Deploys to GitHub Pages
   - Updates live site at `https://agent5479.github.io/HomeCare/`

### Manual Fallback
If automatic deployment fails:

1. **Check GitHub Actions**: `https://github.com/agent5479/HomeCare/actions`
2. **Verify Secrets**: Ensure all required secrets are set
3. **Check Permissions**: Verify GitHub Pages and Actions permissions
4. **Manual Deploy**: Run workflow manually from Actions tab

## 🔐 Security Features

### Password Security
- **Admin Passwords**: Stored in GitHub Secrets, hashed with bcrypt
- **Employee Passwords**: Temporary passwords with expiration
- **Password Strength**: 12+ characters, mixed case, numbers, special chars
- **Rate Limiting**: 5 attempts, 15-minute lockout

### Data Protection
- **Tenant Isolation**: Each tenant has separate data namespace
- **No Hardcoded Credentials**: All sensitive data in secrets
- **Secure Hashing**: bcrypt for password storage
- **Environment Variables**: All configuration externalized

## 🐛 Common Issues & Solutions

### Login Issues
1. **"Invalid credentials"**: Check GitHub Secrets are set correctly
2. **"Database not available"**: Verify Firebase rules and API keys
3. **"Configuration validation failed"**: Check all required secrets are present

### Data Loading Issues
1. **"[Unknown Task]" in actions**: Task lookup system needs repair
2. **Dashboard not loading**: Check data synchronization between old/new systems
3. **Missing data**: Verify Firebase rules allow read/write access

### Deployment Issues
1. **404 on env-config.js**: GitHub Actions workflow failed
2. **Secrets not injected**: Check workflow permissions and secret names
3. **Site not updating**: Clear browser cache, check GitHub Pages status

## 📞 Emergency Contacts

### System Administrator
- **GitHub**: agent5479
- **Repository**: https://github.com/agent5479/HomeCare
- **Live Site**: https://agent5479.github.io/HomeCare/

### Critical Files Backup
- All configuration in GitHub repository
- Firebase rules in this README
- Secrets configuration documented above

## 🔄 Recovery Procedures

### Complete System Reset
1. Verify all GitHub Secrets are set
2. Update Firebase rules to permissive settings
3. Trigger GitHub Actions workflow manually
4. Clear browser cache and test login
5. Verify data loading and dashboard functionality

### Data Recovery
1. Check Firebase Console for data integrity
2. Verify tenant structure is correct
3. Check for data migration issues
4. Restore from Firebase backup if needed

---

**Last Updated**: January 2025
**Version**: 0.7
**Status**: Fully Operational
