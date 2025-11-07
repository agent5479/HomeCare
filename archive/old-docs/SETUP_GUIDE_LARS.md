# 🔐 BeeMarshall - Setup Guide for Lars (Master User)

## 🎯 **Complete System with Security & Team Management**

---

## ✅ **New Features Implemented**

### 1. **Master User System (Lars Only)**
- ✅ Lars is the admin/owner
- ✅ Only Lars can add employees
- ✅ Only Lars can delete records
- ✅ Employees can add/view only

### 2. **Employee Management**
- ✅ Lars creates employee accounts
- ✅ Each employee has unique username & password
- ✅ Track which employee logged which action
- ✅ Lars can remove employees

### 3. **Flagging System**
- ✅ Flag problems/anomalies as: Urgent 🚨, Warning ⚠️, Info ℹ️
- ✅ Flagged items show on dashboard
- ✅ Separate "Flagged" view for all flagged items
- ✅ Visual indicators (colored borders)

### 4. **Task Scheduling**
- ✅ Schedule tasks for next visit
- ✅ Priority levels (normal, high, urgent)
- ✅ Due dates
- ✅ Mark as complete when done

### 5. **GPS & Maps**
- ✅ "Use My GPS Location" button (field-ready!)
- ✅ Click map to set location
- ✅ Proper Google Maps integration (fixed!)
- ✅ Interactive map picker

### 6. **70+ Comprehensive Tasks**
- ✅ 9 categories
- ✅ Common tasks filter
- ✅ All beekeeping activities covered

---

## 🚀 **First Time Setup (Lars - You Do This Once)**

### Step 1: Access the App
```
https://agent5479.github.io/BeeMarshall/larsbees-full.html
```

### Step 2: Create Master Account
- **Username:** Use your assigned username
- **Password:** Use your assigned password
- Click **Login**

**✅ System will recognize this as first-time setup and create your master account!**

### Step 3: Add Your First Employee
1. Click **"Team"** in navigation
2. Fill in:
   - **Employee Name:** (e.g., "John Smith")
   - **Password:** Create password for employee (e.g., "Employee123")
3. Click **"Add Employee"**
4. **✅ Give employee their credentials!**

### Step 4: Add Hive Clusters
1. Click **"Add Cluster"**
2. Click **"Use My GPS Location"** (if in field)
3. Or click **"Pick on Map"** and click location
4. Enter hive count and details
5. Save

### Step 5: Start Logging!
- You and employees can now log actions
- Use flagging for problems
- Schedule tasks for next visits

---

## 👥 **Employee Access**

### How Employees Login:
1. Visit: https://agent5479.github.io/BeeMarshall/larsbees-full.html
2. **Username:** Their name (you gave them)
3. **Password:** Password you created for them
4. Login

### What Employees Can Do:
- ✅ View all clusters
- ✅ Log actions
- ✅ Flag problems
- ✅ Schedule tasks
- ✅ View history
- ✅ Edit clusters
- ❌ Cannot delete anything
- ❌ Cannot add other employees

### What Only Lars Can Do:
- ✅ Everything employees can do, PLUS:
- ✅ Add/remove employees
- ✅ Delete clusters
- ✅ Delete actions
- ✅ Remove flagged items
- ✅ Full admin control

---

## 🚨 **Flagging System - How to Use**

### When to Flag:

**🚨 Urgent (Red):**
- Infected hive found
- Queen lost
- Emergency situation
- Immediate action needed

**⚠️ Warning (Yellow):**
- Weak colony
- Food stores low
- Pest problem developing
- Monitor closely

**ℹ️ Info (Blue):**
- Note for next visit
- Observation to review
- Reminder

### How to Flag:
1. When logging action
2. Select flag level from dropdown
3. Add notes explaining the issue
4. Save

### Viewing Flagged Items:
- Dashboard shows urgent flags
- Click "Flagged" in nav to see all
- Filter by flag level
- Unflag when resolved (Lars only)

---

## 📅 **Scheduling Tasks - How to Use**

### Schedule a Task:
1. From action log form, click "Add Scheduled Task"
2. Select cluster
3. Select task to be done
4. Set due date (optional)
5. Set priority (normal/high/urgent)
6. Add notes
7. Save

### View Scheduled Tasks:
- Dashboard shows next 5 tasks
- Click "Scheduled" in nav for full list
- See cluster, task, priority
- Click "Complete" when done

### Use Cases:
- "Varroa treatment due in 2 weeks"
- "Check queen status on next visit"
- "Harvest ready mid-June"
- "Replace weak frames at North Field"

---

## 🗺️ **GPS Location Capture**

### In the Field (Phone):
1. Stand at hive location
2. Click "Add Cluster"
3. Click **"Use My GPS Location"**
4. Coordinates automatically filled!
5. Add details and save

### From Office (Computer):
1. Click "Add Cluster"
2. Click **"Pick on Map"**
3. Map opens
4. Click where hives are located
5. Or drag marker to exact spot
6. Coordinates automatically filled!

---

## 🐝 **Individual Hive Anomaly System**

### Normal Use:
- Track cluster as whole (simpler)
- Most of the time you don't need individual hives

### When Problem Arises:
1. Edit the cluster
2. Click **"Break Into Individual Hives"**
3. Creates separate record for each hive
4. Now you can:
   - Log actions per specific hive
   - Track infected hive separately
   - Set status (healthy, infected, quarantine)
   - Monitor treatment progress

### Example:
- North Field has 10 hives
- Hive 3 gets infected
- Break into individual hives
- Log treatment on Hive 3 specifically
- Other 9 hives still tracked normally

---

## 👥 **Team Workflow Example**

### Monday Morning - Lars at North Field:
```
1. Opens app on phone
2. Log Action → North Field
3. Checks: ✓ General Inspection ✓ Queen Check
4. Flags: ⚠️ Warning
5. Notes: "Hive 5 looks weak, monitor food stores"
6. Saves
```

### Same Day - Employee at South Meadow:
```
1. Opens app on tablet
2. Sees Lars's flagged item on dashboard
3. Log Action → South Meadow
4. Checks: ✓ Sugar Syrup 2:1
5. Notes: "Fed all hives 5L each"
6. Saves
```

### Tuesday - Lars Reviews:
```
1. Opens dashboard
2. Sees employee's feeding logged
3. Checks flagged items
4. Schedules task: "Check North Field Hive 5 food stores"
5. Priority: High
```

### Wednesday - Employee Returns:
```
1. Opens app
2. Sees scheduled task for North Field
3. Goes to North Field
4. Completes task
5. Clicks "Complete" on scheduled task
6. Logs action if treatment needed
```

---

## 🔒 **Security Features**

### Access Control:
- ✅ Only people you add can login
- ✅ Each user has unique credentials
- ✅ Lars controls who has access
- ✅ Remove employees anytime

### Permissions:
- ✅ Lars (admin): Full control
- ✅ Employees: Add/view only, cannot delete
- ✅ Prevents accidental data loss
- ✅ Prevents spam/abuse

### Data Protection:
- ✅ Data stored in Firebase (secure)
- ✅ Only your team can access
- ✅ No public access
- ✅ Automatic backups

---

## 📊 **What Gets Tracked**

### Every Action Logs:
- ✅ What task was done
- ✅ Which cluster/hive
- ✅ When it was done
- ✅ Who did it (Lars or employee name)
- ✅ Any notes/observations
- ✅ Flag level (if flagged)

### Reports Show:
- Actions by employee
- Actions by cluster
- Actions by category
- Flagged items
- Scheduled tasks

---

## 💡 **Best Practices**

### For Lars (Admin):
1. Create strong passwords for employees
2. Remove employees when they leave
3. Review flagged items daily
4. Use scheduling for planning
5. Check employee logs regularly

### For Employees:
1. Log actions immediately (don't wait)
2. Flag problems as you find them
3. Add detailed notes
4. Check scheduled tasks daily
5. Mark tasks complete when done

### For Everyone:
1. Use GPS button in field (accurate!)
2. Use "Common" task filter (faster)
3. Add meaningful notes
4. Flag issues promptly
5. Review dashboard regularly

---

## 🆘 **Troubleshooting**

### "Can't add employees"
- Only Lars (admin) can add employees
- Make sure you're logged in as Lars

### "Can't delete records"
- Only Lars (admin) can delete
- Employees have view/add only

### "GPS not working"
- Enable location permissions in browser
- Use HTTPS (GitHub Pages uses HTTPS by default)
- Try again in 10 seconds

### "Maps not showing"
- Maps load dynamically
- Wait a few seconds
- Refresh page if needed

### "Employee forgot password"
- Lars can remove old employee
- Add them again with new password

---

## 📞 **Quick Reference**

### **URL:**
```
https://agent5479.github.io/BeeMarshall/larsbees-full.html
```

### **Lars Login:**
- Username: `Lars`
- Password: [your master password]
- Role: ADMIN (can do everything)

### **Employee Login:**
- Username: [name you gave them]
- Password: [password you set]
- Role: Employee (add/view only)

### **Key Features:**
- 🗺️ GPS location capture
- 🚨 Problem flagging (urgent/warning/info)
- 📅 Task scheduling
- 👥 Multi-user with permissions
- 🐝 Individual hive anomaly tracking
- 📊 Complete activity tracking

---

## 🎯 **Next Steps**

1. ✅ Access app (wait 2-3 min for GitHub Pages to rebuild)
2. ✅ Create your master account (username: Lars)
3. ✅ Add your employees
4. ✅ Add your hive clusters
5. ✅ Start logging actions!

---

**Your professional, secure, multi-user apiary management system is ready!** 🐝🍯

**Happy Beekeeping, Lars!**

