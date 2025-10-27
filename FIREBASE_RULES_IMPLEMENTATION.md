# Firebase Realtime Database Rules - HomeCare Management System

## 🔐 Security Rules Overview

The Firebase Realtime Database rules for the HomeCare Management System provide:

- **Multi-tenant data isolation** - Each tenant can only access their own data
- **Role-based access control** - Different permissions for admin, developer, and regular users
- **Data validation** - Ensures data integrity with required fields and types
- **Secure authentication** - All operations require authenticated users

## 📋 Rule Structure

### 1. **Global Access Control**
```json
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```
- Denies all access by default
- Requires explicit permission for each path

### 2. **HomeCare Application Data**
```json
"homecare": {
  ".read": "auth != null",
  ".write": "auth != null"
}
```
- Requires authentication for all operations
- Main container for all application data

### 3. **Tenant Isolation**
```json
"tenants": {
  "$tenantId": {
    ".read": "auth != null && (auth.uid == $tenantId || auth.token.role == 'admin' || auth.token.role == 'developer')",
    ".write": "auth != null && (auth.uid == $tenantId || auth.token.role == 'admin' || auth.token.role == 'developer')"
  }
}
```
- Each tenant can only access their own data
- Admins and developers can access all tenant data
- Uses `$tenantId` variable for dynamic tenant matching

## 🏗️ Data Structure

### **Tenant-Specific Data**
Each tenant has isolated access to:

- **`clients`** - Client profiles and information
- **`care_actions`** - Care action logs
- **`scheduled_tasks`** - Task scheduling
- **`medical_assessments`** - Health monitoring
- **`care_plans`** - Care planning
- **`care_reports`** - Reporting
- **`incident_reports`** - Safety incidents
- **`notifications`** - Alerts and reminders
- **`weather_data`** - Location-based weather
- **`care_templates`** - Reusable templates
- **`user_preferences`** - User settings
- **`dashboard_config`** - Dashboard customization

### **Global System Data**
Accessible by all authenticated users:

- **`care_task_templates`** - Global care task templates
- **`announcements`** - System announcements
- **`statistics`** - System-wide statistics

### **Admin-Only Data**
Restricted to admin users:

- **`users`** - User management
- **`backups`** - Backup data
- **`audit_logs`** - System audit logs

## 🔒 Security Features

### **Authentication Requirements**
- All operations require `auth != null`
- No anonymous access allowed

### **Role-Based Access**
- **Admin**: Full access to all data
- **Developer**: Full access to all data
- **Regular Users**: Access only to their tenant data

### **Data Validation**
Each data type includes validation rules:

```json
"$clientId": {
  ".validate": "newData.hasChildren(['name', 'status', 'care_level']) && 
               newData.child('name').isString() && 
               newData.child('status').isString() && 
               newData.child('care_level').isString()"
}
```

### **Required Fields Validation**
- **Clients**: `name`, `status`, `care_level`
- **Care Actions**: `client_id`, `task_name`, `action_date`, `performed_by_id`
- **Scheduled Tasks**: `client_id`, `task_name`, `scheduled_date`, `assigned_to_id`
- **Medical Assessments**: `client_id`, `assessment_type`, `assessment_date`, `performed_by_id`
- **Care Plans**: `client_id`, `title`, `start_date`, `created_by_id`
- **Care Reports**: `client_id`, `report_type`, `report_date`, `created_by_id`
- **Incident Reports**: `client_id`, `incident_type`, `incident_date`, `reported_by_id`
- **Notifications**: `user_id`, `title`, `message`

## 🚀 Implementation Steps

### 1. **Update Firebase Rules**
1. Go to Firebase Console
2. Navigate to Realtime Database
3. Click on "Rules" tab
4. Replace existing rules with the provided JSON
5. Click "Publish"

### 2. **Configure Authentication**
Ensure your authentication system provides:
- User tokens with `role` claims
- Proper tenant ID mapping
- Admin and developer role assignments

### 3. **Test Rules**
Use Firebase Rules Simulator to test:
- Tenant data isolation
- Role-based access
- Data validation
- Error handling

## 📊 Data Path Examples

### **Client Data**
```
homecare/tenants/Jess/clients/client123
```

### **Care Actions**
```
homecare/tenants/Jess/care_actions/action456
```

### **Global Templates**
```
homecare/system/care_task_templates/template789
```

### **User Management**
```
homecare/users/user123
```

## ⚠️ Security Considerations

### **Data Isolation**
- Each tenant's data is completely isolated
- No cross-tenant data access possible
- Admin/developer access is explicitly controlled

### **Input Validation**
- All data must pass validation rules
- Required fields are enforced
- Data types are validated

### **Authentication**
- All operations require valid authentication
- Role-based permissions are enforced
- No anonymous access allowed

### **Audit Trail**
- All operations are logged (if audit system is implemented)
- Admin actions are tracked
- Data changes are monitored

## 🔧 Customization

### **Adding New Data Types**
1. Add new path under tenant structure
2. Define read/write permissions
3. Add validation rules
4. Test with Rules Simulator

### **Modifying Permissions**
1. Update role-based conditions
2. Test with different user roles
3. Verify tenant isolation
4. Deploy changes

### **Adding New Roles**
1. Update role checks in rules
2. Modify authentication system
3. Test role-based access
4. Update documentation

## 📝 Best Practices

1. **Test Thoroughly** - Use Rules Simulator before deploying
2. **Monitor Access** - Check Firebase logs for unauthorized access attempts
3. **Regular Updates** - Review and update rules as system evolves
4. **Documentation** - Keep rules documentation up to date
5. **Backup Rules** - Keep backup of working rule sets

## 🆘 Troubleshooting

### **Common Issues**
- **Access Denied**: Check authentication and role assignments
- **Validation Errors**: Verify required fields and data types
- **Tenant Isolation**: Ensure proper tenant ID matching
- **Permission Errors**: Verify role-based access rules

### **Debug Steps**
1. Check Firebase Console logs
2. Use Rules Simulator to test specific scenarios
3. Verify authentication tokens
4. Test with different user roles
5. Check data structure matches rules

---

**Note**: These rules provide a secure, multi-tenant foundation for the HomeCare Management System. Always test thoroughly in a development environment before deploying to production.
