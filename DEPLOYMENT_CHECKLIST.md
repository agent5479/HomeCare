# HomeCare v0.7 - Deployment Checklist

## ✅ Pre-Deployment Verification

### GitHub Secrets Configuration
Verify all secrets are set in GitHub repository:
- [ ] `JESS_USERNAME` - Primary admin username
- [ ] `JESS_PASSWORD` - Primary admin password
- [ ] `DEFAULT_TENANT_ID` - Default tenant identifier
- [ ] `FIREBASE_API_KEY` - Firebase API key
- [ ] `FIREBASE_APP_ID` - Firebase app ID
- [ ] `FIREBASE_AUTH_DOMAIN` - Firebase auth domain (should be `homecare-ca5ce.firebaseapp.com`)
- [ ] `FIREBASE_DATABASE_URL` - Firebase database URL (should be `https://homecare-ca5ce-default-rtdb.firebaseio.com`)
- [ ] `FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- [ ] `FIREBASE_PROJECT_ID` - Firebase project ID (should be `homecare-ca5ce`)
- [ ] `FIREBASE_STORAGE_BUCKET` - Firebase storage bucket (should be `homecare-ca5ce.appspot.com`)

### Firebase Project Verification
- [ ] Firebase project `homecare-ca5ce` is active
- [ ] Realtime Database is enabled
- [ ] Database rules are configured (see FUNCTIONAL_SETTINGS_README.md)
- [ ] Authentication is enabled (if using Firebase Auth)

### Code Verification
- [ ] All JavaScript files updated (core.js, dashboard.js, sites.js, etc.)
- [ ] HTML files updated (beemarshall-full.html, index.html, reports.html)
- [ ] CSS updated (brand.css)
- [ ] Configuration files updated (config.js)
- [ ] GitHub Actions workflow updated (.github/workflows/deploy.yml)

### Testing Checklist
- [ ] Test login with JESS_USERNAME credentials
- [ ] Verify map loads correctly
- [ ] Verify client status breakdown displays
- [ ] Test task creation and scheduling
- [ ] Verify data sync to Firebase
- [ ] Test on mobile devices
- [ ] Verify all icons display correctly
- [ ] Check color scheme displays properly

---

## 🚀 Deployment Steps

### Step 1: Verify Git Configuration
```bash
git remote -v
# Should show: https://github.com/agent5479/HomeCare.git
```

### Step 2: Commit All Changes
```bash
git add .
git commit -m "Complete rebranding to HomeCare v0.7 - Professional Care Management System"
```

### Step 3: Push to GitHub
```bash
git push origin main
```

### Step 4: Monitor Deployment
1. Go to GitHub repository → Actions tab
2. Monitor the deployment workflow
3. Verify `env-config.js` is generated correctly
4. Check for any errors in the workflow logs

### Step 5: Verify GitHub Pages
1. Go to repository → Settings → Pages
2. Verify source is set to "GitHub Actions"
3. Check that site is live at: `https://agent5479.github.io/HomeCare/`

### Step 6: Test Live Site
- [ ] Visit live site URL
- [ ] Test login functionality
- [ ] Verify all features work
- [ ] Check browser console for errors
- [ ] Test on different browsers

---

## 🔍 Post-Deployment Verification

### Functional Testing
- [ ] Login works with JESS_USERNAME/JESS_PASSWORD
- [ ] Dashboard loads correctly
- [ ] Client status breakdown displays
- [ ] Map displays client locations
- [ ] Tasks can be created and scheduled
- [ ] Actions can be logged
- [ ] Reports generate correctly
- [ ] Data exports work

### Visual Verification
- [ ] Blue color scheme displays correctly
- [ ] HomeCare icons display (house-heart, etc.)
- [ ] All branding text shows "HomeCare"
- [ ] No yellow/gold colors visible
- [ ] No hexagon icons visible

### Data Verification
- [ ] Firebase connection works
- [ ] Data syncs correctly
- [ ] Tenant isolation works
- [ ] No data loss during transition

---

## 🐛 Troubleshooting

### Issue: Login Not Working
- Check GitHub Secrets are set correctly
- Verify JESS_USERNAME and JESS_PASSWORD are correct
- Check browser console for errors
- Verify Firebase configuration

### Issue: Map Not Loading
- Check if Leaflet library loads
- Verify map initialization code
- Check browser console for errors
- Verify homeCareMap variable is set

### Issue: Client Status Not Displaying
- Verify client-analysis.js is loaded
- Check if updateClientStatusBreakdown() is called
- Verify data structure in Firebase
- Check browser console for errors

### Issue: Colors Not Updated
- Clear browser cache
- Verify brand.css is loaded
- Check CSS variables are set correctly
- Hard refresh (Ctrl+F5 or Cmd+Shift+R)

---

## 📞 Support

If issues persist:
1. Check browser console for errors
2. Review GitHub Actions logs
3. Verify all secrets are set
4. Check Firebase console for data
5. Review REBRANDING_COMPLETE_SUMMARY.md

---

**Last Updated**: January 28, 2025  
**Version**: 0.7

