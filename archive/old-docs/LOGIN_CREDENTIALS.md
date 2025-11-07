# HomeCare Management - Login Credentials

## 🔐 Predefined User Accounts

### Primary Admin Account
- **Username**: `Jess`
- **Password**: `JessCard2025!`
- **Role**: Admin
- **Tenant**: `Jess`
- **Access**: Full administrative access to Jess's home care data

### Developer Account
- **Username**: `GBTech`
- **Password**: `1q2w3e!Q@W#E`
- **Role**: Developer
- **Tenant**: `GBTech`
- **Access**: Full administrative access to GBTech's development data

## 🏢 Tenant Structure

### Data Isolation
Each user's data is completely isolated in separate Firebase tenant directories:

```
Firebase Database:
├── tenants/
│   ├── Jess/
│   │   ├── clients/
│   │   ├── careActions/
│   │   ├── scheduledTasks/
│   │   ├── employees/
│   │   └── careTasks/
│   └── GBTech/
│       ├── clients/
│       ├── careActions/
│       ├── scheduledTasks/
│       ├── employees/
│       └── careTasks/
```

### Security Features
- **Complete Data Isolation**: Jess and GBTech cannot see each other's data
- **Role-based Access**: Different permission levels for different users
- **Secure Authentication**: Password-based authentication with tenant verification
- **Session Management**: Automatic session restoration on page reload

## 🚀 Quick Login

1. **Open the Application**
   - Navigate to `docs/homecare-management.html`
   - Open in your web browser

2. **Login as Jess (Admin)**
   - Username: `Jess`
   - Password: `JessCard2025!`
   - Access: Jess's home care management data

3. **Login as GBTech (Developer)**
   - Username: `GBTech`
   - Password: `1q2w3e!Q@W#E`
   - Access: GBTech's development data

## 🔄 Switching Between Accounts

1. **Logout**: Click the user dropdown → Logout
2. **Login**: Enter different credentials
3. **Data**: Each account maintains separate data

## 📊 What Each Account Can Do

### Jess (Admin Account)
- Manage Jess's home care clients
- Log care actions for Jess's clients
- View Jess's care statistics and dashboard
- Access Jess's client location maps
- Full CRUD operations on Jess's data

### GBTech (Developer Account)
- Manage GBTech's development clients
- Log care actions for GBTech's clients
- View GBTech's care statistics and dashboard
- Access GBTech's client location maps
- Full CRUD operations on GBTech's data

## 🛡️ Security Notes

- **Password Protection**: Both accounts use strong passwords
- **Data Encryption**: All data is encrypted in transit and at rest
- **Access Control**: No cross-tenant data access possible
- **Audit Trail**: All actions are logged with user attribution

## 🔧 Technical Details

### Authentication Flow
1. User enters credentials
2. System validates against predefined users
3. If valid, creates session with tenant ID
4. All subsequent operations use tenant-specific paths
5. Data is completely isolated by tenant

### Session Management
- **Automatic Login**: Sessions persist across browser refreshes
- **Secure Storage**: Credentials stored securely in localStorage
- **Role Display**: User role and tenant shown in navigation
- **Easy Logout**: One-click logout with complete session cleanup

---

**Ready to start?** Use the credentials above to access your respective tenant data!
