# 🔥 Firebase Secrets Setup Guide

## 🚨 **CRITICAL: Firebase API Keys Secured**

All Firebase configuration has been moved to GitHub Secrets for security. The following files have been secured:
- ✅ `docs/beemarshall-full.html` - Firebase config now uses environment variables
- ✅ `docs/reports.html` - Firebase config now uses environment variables  
- ✅ `docs/js/env-config.js` - Development environment secured
- ✅ `docs/js/config.js` - Fallback values removed

## 🔥 **HomeCare Firebase Project**

**Project ID**: `homecare-ca5ce`  
**Database URL**: `https://homecare-ca5ce-default-rtdb.firebaseio.com`  
**Auth Domain**: `homecare-ca5ce.firebaseapp.com`  
**Storage Bucket**: `homecare-ca5ce.appspot.com`

## 🔧 **GitHub Secrets Required**

Go to your repository → **Settings** → **Secrets and variables** → **Actions**

### **Admin Credentials (Required)**
| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `JESS_USERNAME` | Primary admin username | `Jess` |
| `JESS_PASSWORD` | Primary admin password | `YourSecurePassword123!` |

### **Tenant Configuration (Optional)**
| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `DEFAULT_TENANT_ID` | Default tenant identifier for data isolation | `default` |

**Note**: The system supports backward compatibility with `GBTECH_USERNAME`, `GBTECH_PASSWORD`, `LARS_USERNAME`, and `LARS_PASSWORD` if you need to migrate from an older setup.

### **Firebase Configuration (Required)**
| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `FIREBASE_API_KEY` | Firebase API key | `[Your Firebase API Key]` |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `[Your Firebase Auth Domain]` |
| `FIREBASE_DATABASE_URL` | Firebase database URL | `[Your Firebase Database URL]` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `[Your Firebase Project ID]` |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `[Your Firebase Storage Bucket]` |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | `[Your Firebase Messaging Sender ID]` |
| `FIREBASE_APP_ID` | Firebase app ID | `[Your Firebase App ID]` |

### **API Keys (Optional)**
| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | `AIzaSyABC123...XYZ` |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key | `your-openweather-api-key` |

## 📋 **Step-by-Step Setup**

### **Step 1: Get Your Firebase Configuration**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `homecare-ca5ce`
3. Click the **⚙️ Settings** gear icon
4. Select **Project settings**
5. Scroll down to **Your apps** section
6. Click on your web app or create a new one
7. Copy the configuration values

**Expected values for homecare-ca5ce:**
- **Project ID**: `homecare-ca5ce`
- **Database URL**: `https://homecare-ca5ce-default-rtdb.firebaseio.com`
- **Auth Domain**: `homecare-ca5ce.firebaseapp.com`
- **Storage Bucket**: `homecare-ca5ce.appspot.com`

### **Step 2: Set GitHub Secrets**

1. Go to your GitHub repository
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret one by one:

#### **Admin Credentials:**
```
Name: GBTECH_USERNAME
Value: GBTech

Name: GBTECH_PASSWORD  
Value: [Your secure password]

Name: LARS_USERNAME
Value: Lars

Name: LARS_PASSWORD
Value: [Your secure password]
```

#### **Firebase Configuration:**
```
Name: FIREBASE_API_KEY
Value: [Your Firebase API Key]

Name: FIREBASE_AUTH_DOMAIN
Value: [Your Firebase Auth Domain]

Name: FIREBASE_DATABASE_URL
Value: [Your Firebase Database URL]

Name: FIREBASE_PROJECT_ID
Value: [Your Firebase Project ID]

Name: FIREBASE_STORAGE_BUCKET
Value: [Your Firebase Storage Bucket]

Name: FIREBASE_MESSAGING_SENDER_ID
Value: [Your Firebase Messaging Sender ID]

Name: FIREBASE_APP_ID
Value: [Your Firebase App ID]
```

#### **API Keys (Optional):**
```
Name: GOOGLE_MAPS_API_KEY
Value: [Your Google Maps API key]

Name: OPENWEATHER_API_KEY
Value: [Your OpenWeatherMap API key]
```

### **Step 3: Verify Setup**

1. Push any change to the `main` branch
2. Go to **Actions** tab in your repository
3. Check that the deployment workflow runs successfully
4. Visit your GitHub Pages site to verify it works

## 🔍 **Current Firebase Configuration**

Based on the codebase analysis, here are the current Firebase values that need to be set as secrets:

### **Primary Firebase Project Configuration**
```javascript
{
  apiKey: "[Your Firebase API Key]",
  authDomain: "[Your Firebase Auth Domain]",
  databaseURL: "[Your Firebase Database URL]",
  projectId: "[Your Firebase Project ID]",
  storageBucket: "[Your Firebase Storage Bucket]",
  messagingSenderId: "[Your Firebase Messaging Sender ID]",
  appId: "[Your Firebase App ID]"
}
```

## 🚨 **Security Notes**

### **What Was Secured:**
- ✅ Firebase API keys removed from source code
- ✅ All Firebase configuration moved to environment variables
- ✅ Development environment file secured with placeholders
- ✅ GitHub Actions workflow updated to inject secrets

### **What You Need to Do:**
1. **Set all GitHub Secrets** with your actual values
2. **Use strong passwords** for admin accounts
3. **Test the deployment** to ensure everything works
4. **Monitor access logs** for any suspicious activity

## 🐛 **Troubleshooting**

### **Issue: Firebase not initializing**
- **Cause:** Missing or incorrect Firebase secrets
- **Solution:** Verify all Firebase secrets are set correctly
- **Debug:** Check browser console for Firebase errors

### **Issue: Admin login not working**
- **Cause:** Missing or incorrect admin credentials
- **Solution:** Verify admin username/password secrets are set
- **Debug:** Check browser console for authentication errors

### **Issue: Deployment fails**
- **Cause:** Missing required secrets
- **Solution:** Ensure all required secrets are set
- **Debug:** Check GitHub Actions logs

## 📞 **Support**

If you encounter issues:

1. **Check GitHub Secrets** - Ensure all required secrets are set
2. **Verify Firebase Project** - Ensure project is active and accessible
3. **Test Local Development** - Update `docs/js/env-config.js` with your values
4. **Check Deployment Logs** - Review GitHub Actions workflow logs

---

**Security Status:** ✅ **FIREBASE CONFIGURATION SECURED**  
**Last Updated:** December 19, 2024  
**Next Review:** January 19, 2025
