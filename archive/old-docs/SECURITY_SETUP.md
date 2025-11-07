# 🔐 BeeMarshall Security Setup Guide

## Overview
This guide explains how to securely configure BeeMarshall to protect admin credentials and sensitive configuration data from being exposed in the codebase.

## 🚨 Security Issue Resolved
**Problem**: Admin credentials were hardcoded in the JavaScript files, making them visible to anyone with access to the repository.

**Solution**: Implemented environment variable-based configuration with GitHub Secrets for production deployment.

## 🛠️ Implementation Details

### 1. Secure Configuration System
- **File**: `docs/js/config.js`
- **Purpose**: Loads configuration from environment variables
- **Features**: 
  - Validates required environment variables
  - Provides fallback values for non-sensitive data
  - Warns about missing credentials

### 2. Environment Variable Injection
- **File**: `.github/workflows/deploy.yml`
- **Purpose**: Injects secrets at build time
- **Process**: 
  - GitHub Actions reads secrets from repository settings
  - Injects them into `docs/js/env-config.js` during deployment
  - File is not committed to repository

### 3. Local Development
- **File**: `docs/js/env-config.js` (in .gitignore)
- **Purpose**: Provides credentials for local development
- **Security**: File is ignored by git to prevent accidental commits

## 🔧 Setup Instructions

### For Repository Administrators

#### 1. Set GitHub Secrets
Go to your repository → Settings → Secrets and variables → Actions

Add the following secrets:

**Admin Credentials:**
- `GBTECH_USERNAME` - GBTech admin username
- `GBTECH_PASSWORD` - GBTech admin password
- `LARS_USERNAME` - Lars admin username  
- `LARS_PASSWORD` - Lars admin password

**Firebase Configuration:**
- `FIREBASE_API_KEY` - Firebase API key
- `FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `FIREBASE_APP_ID` - Firebase app ID

**API Keys:**
- `GOOGLE_MAPS_API_KEY` - Google Maps API key
- `OPENWEATHER_API_KEY` - OpenWeatherMap API key

#### 2. Enable GitHub Pages
1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions"
3. The workflow will automatically deploy when secrets are configured

### For Developers

#### 1. Local Development Setup
1. Copy `docs/js/env-config.js` to your local repository
2. Update the credentials in the file for local testing
3. The file is already in `.gitignore` so it won't be committed

#### 2. Testing Production Build
1. Push changes to main branch
2. GitHub Actions will automatically build and deploy
3. Check the Actions tab to ensure deployment succeeds

## 🔍 Security Features

### 1. Credential Protection
- ✅ No hardcoded credentials in source code
- ✅ Secrets injected at build time only
- ✅ Environment variables not committed to repository
- ✅ Local development file ignored by git

### 2. Access Control
- ✅ Admin accounts loaded from secure configuration
- ✅ Tenant information cannot be changed by users
- ✅ Password change requires current password verification

### 3. Validation
- ✅ Configuration validation on startup
- ✅ Warning messages for missing credentials
- ✅ Graceful fallback for missing configuration

## 🚨 Security Best Practices

### 1. Credential Management
- **Never** commit real credentials to the repository
- **Always** use GitHub Secrets for production
- **Regularly** rotate admin passwords
- **Monitor** access logs for suspicious activity

### 2. Repository Security
- Enable branch protection rules
- Require pull request reviews
- Use strong passwords for admin accounts
- Enable two-factor authentication

### 3. Deployment Security
- Verify GitHub Actions workflow before enabling
- Monitor deployment logs for errors
- Test production deployment thoroughly
- Keep secrets updated and secure

## 🔄 Migration Process

### From Hardcoded to Secure Configuration

1. **Backup Current Credentials**
   - Note down current admin usernames and passwords
   - Document current Firebase configuration

2. **Set GitHub Secrets**
   - Add all required secrets to repository settings
   - Verify secrets are properly configured

3. **Deploy Secure Version**
   - Push changes to main branch
   - Verify deployment succeeds
   - Test admin login functionality

4. **Verify Security**
   - Check that credentials are not visible in source code
   - Confirm admin accounts work correctly
   - Test password change functionality

## 🐛 Troubleshooting

### Common Issues

#### 1. Admin Accounts Not Loading
- **Cause**: Environment variables not set
- **Solution**: Check GitHub Secrets configuration
- **Debug**: Check browser console for warnings

#### 2. Deployment Fails
- **Cause**: Missing or invalid secrets
- **Solution**: Verify all required secrets are set
- **Debug**: Check GitHub Actions logs

#### 3. Local Development Issues
- **Cause**: Missing env-config.js file
- **Solution**: Copy and configure local environment file
- **Debug**: Check file exists and has correct format

### Debug Commands
```javascript
// Check if configuration loaded
console.log('Admin accounts:', window.SecureConfig?.getAdminAccounts());

// Check environment variables
console.log('Environment variables:', {
    gbtech: !!window.ENV_GBTECH_USERNAME,
    lars: !!window.ENV_LARS_USERNAME,
    firebase: !!window.ENV_FIREBASE_API_KEY
});
```

## 📋 Security Checklist

- [ ] GitHub Secrets configured
- [ ] Environment variables file in .gitignore
- [ ] No hardcoded credentials in source code
- [ ] Admin accounts load from environment
- [ ] Password change functionality works
- [ ] Tenant editing disabled
- [ ] Local development environment configured
- [ ] Production deployment tested
- [ ] Security warnings resolved

## 🆘 Support

If you encounter security issues:

1. **Immediate**: Change admin passwords
2. **Check**: GitHub Secrets configuration
3. **Verify**: No credentials in source code
4. **Test**: Admin login functionality
5. **Contact**: Repository administrators

---

**Remember**: Security is an ongoing process. Regularly review and update credentials, monitor access logs, and keep the system updated with the latest security practices.
