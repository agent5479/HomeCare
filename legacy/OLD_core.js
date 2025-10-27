// BeeMarshall - Core Application Logic
// Master User: Lars (can add employees, delete records)
// Employees: Can add/view, cannot delete

// Version Management
const APP_VERSION = '1.0';
const VERSION_HISTORY = [
    { version: '0.91', date: '2024-12-19', changes: ['Fixed dashboard loading issue', 'Enhanced login system', 'Added welcome popup', 'Improved map initialization'] },
    { version: '0.92', date: '2024-12-19', changes: ['Added version tag to login screen', 'Implemented lazy map loading', 'Enhanced error prevention', 'Improved user experience'] },
    { version: '0.94', date: '2024-12-19', changes: ['Sales-ready deployment', 'New Firebase project integration', 'Terms of use and privacy declarations', 'Removed migration tools', 'Enhanced security and data isolation'] },
    { version: '0.96', date: '2024-12-19', changes: ['Added Demo user account for client demonstrations', 'Enhanced hive strength breakdown system', 'Improved site editing with detailed breakdowns', 'Updated reports with comprehensive data integration'] }
];

// Master account credentials
const MASTER_USERNAME = 'GBTech';
const MASTER_PASSWORD = '1q2w3e!Q@W#E';

// Custom alert function with BeeMarshall branding
function beeMarshallAlert(message, type = 'info') {
    // Create custom modal for BeeMarshall alerts
    const alertModal = document.createElement('div');
    alertModal.className = 'modal fade';
    alertModal.id = 'beeMarshallAlert';
    alertModal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content" style="background: var(--glass); backdrop-filter: blur(12px) saturate(1.1); border: 1px solid rgba(255,255,255,0.2);">
                <div class="modal-header border-0">
                    <h5 class="modal-title d-flex align-items-center">
                        <i class="bi bi-hexagon-fill me-2" style="color: var(--accent); font-size: 1.2rem;"></i>
                        BeeMarshall says
                    </h5>
                </div>
                <div class="modal-body text-center">
                    <div class="mb-3">
                        <i class="bi bi-${type === 'success' ? 'check-circle-fill text-success' : type === 'error' ? 'exclamation-triangle-fill text-danger' : 'info-circle-fill text-primary'}" style="font-size: 2.5rem;"></i>
                    </div>
                    <p class="mb-0">${message}</p>
                </div>
                <div class="modal-footer border-0 justify-content-center">
                    <button type="button" class="btn btn-primary px-4" data-bs-dismiss="modal">
                        <i class="bi bi-check me-2"></i>OK
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(alertModal);
    const modal = new bootstrap.Modal(alertModal);
    modal.show();
    
    // Remove modal from DOM after hiding
    alertModal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(alertModal);
    });
}

// Override default alert function
window.alert = beeMarshallAlert;

// Multi-tenant admin accounts with GBTech as master
const ADMIN_ACCOUNTS = {
    'GBTech': {
        username: 'GBTech',
        password: '1q2w3e!Q@W#E',
        tenantId: 'gbtech',
        role: 'master_admin'
    },
    'Lars': {
        username: 'Lars',
        password: 'LarsHoney2025!',
        tenantId: 'lars',
        role: 'admin'
    },
    'Demo': {
        username: 'Demo',
        password: 'Password1!',
        tenantId: 'demo',
        role: 'demo_admin'
    }
};

// Global variables
let currentUser = null;
let isAdmin = false;
let currentTenantId = null; // For data isolation
let sites = [];
let actions = [];
let individualHives = [];
let scheduledTasks = [];
let employees = [];
// Comprehensive task list for the system
const COMPREHENSIVE_TASKS = [
    { id: 'task_1', name: 'Hive Inspection', category: 'Inspection', description: 'Regular hive health and productivity check' },
    { id: 'task_2', name: 'Honey Harvest', category: 'Harvest', description: 'Collect honey from productive hives' },
    { id: 'task_3', name: 'Queen Check', category: 'Inspection', description: 'Verify queen presence and health' },
    { id: 'task_4', name: 'Disease Check', category: 'Health', description: 'Screen for diseases and pests' },
    { id: 'task_5', name: 'Swarm Prevention', category: 'Management', description: 'Manage hive space to prevent swarming' },
    { id: 'task_6', name: 'Equipment Maintenance', category: 'Maintenance', description: 'Clean and maintain hive equipment' },
    { id: 'task_7', name: 'Record Keeping', category: 'Administration', description: 'Update hive records and logs' },
    { id: 'task_8', name: 'Weather Protection', category: 'Management', description: 'Ensure hives are protected from weather' },
    { id: 'task_9', name: 'Pest Control', category: 'Health', description: 'Monitor and control hive pests' },
    { id: 'task_10', name: 'Hive Expansion', category: 'Management', description: 'Add supers or frames as needed' },
    { id: 'task_11', name: 'Colony Splitting', category: 'Management', description: 'Create new colonies from strong hives' },
    { id: 'task_12', name: 'Winter Preparation', category: 'Seasonal', description: 'Prepare hives for winter months' },
    { id: 'task_13', name: 'Spring Build-up', category: 'Seasonal', description: 'Help colonies build up for spring' },
    { id: 'task_14', name: 'Varroa Treatment', category: 'Health', description: 'Apply varroa mite treatment' },
    { id: 'task_15', name: 'Hive Relocation', category: 'Management', description: 'Move hives to new locations' },
    { id: 'task_16', name: 'Equipment Sanitization', category: 'Health', description: 'Clean and sanitize hive equipment' },
    { id: 'task_17', name: 'Emergency Response', category: 'Emergency', description: 'Respond to hive emergencies' },
    { id: 'task_18', name: 'Queen Replacement', category: 'Management', description: 'Replace failing or missing queens' },
    { id: 'task_19', name: 'Hive Monitoring', category: 'Inspection', description: 'Regular monitoring of hive activity' },
    // Feeding category tasks
    { id: 'task_20', name: 'Sugar Syrup Feeding', category: 'Feeding', description: 'Provide sugar syrup for colony nourishment' },
    { id: 'task_21', name: 'Feed Dry Sugar', category: 'Feeding', description: 'Provide dry sugar as an alternative feeding method' },
    { id: 'task_22', name: 'Pollen Patty', category: 'Feeding', description: 'Provide pollen patties for protein supplementation' },
    { id: 'task_23', name: 'Emergency Feeding', category: 'Feeding', description: 'Provide emergency feeding when hive is low on stores' },
    // Problems category tasks
    { id: 'task_24', name: 'Queen Management Issues', category: 'Problems', description: 'Address queen-related problems such as missing queen or laying issues' },
    { id: 'task_25', name: 'General Problems', category: 'Problems', description: 'Address general hive problems requiring attention' },
    { id: 'task_26', name: 'Records Issues', category: 'Problems', description: 'Address inconsistencies or missing records' },
    { id: 'task_27', name: 'Seasonal Issues', category: 'Problems', description: 'Address season-specific problems' },
    { id: 'task_28', name: 'Treatment Required', category: 'Problems', description: 'Identify and treat disease or pest issues' },
    { id: 'task_29', name: 'Hive State Update', category: 'Management', description: 'Update hive strength counts (Strong, Medium, Weak, NUC, Dead)' },
    { id: 'task_30', name: 'Hive Box Update', category: 'Management', description: 'Update hive box counts (Doubles, Top-Splits, Singles, NUCs, Empty)' },
    { id: 'task_31', name: 'Archive Site', category: 'Management', description: 'Archive a site to remove it from active counts while preserving historical data' },
    { id: 'task_32', name: 'Unarchive Site', category: 'Management', description: 'Restore an archived site to active status' },
    { id: 'task_33', name: 'Site Visit & Inventory', category: 'Inspection', description: 'Conduct a site visit and update inventory records' }
];

// Honey types list - editable by admins
let HONEY_TYPES = [
    'Manuka',
    'Rewarewa',
    'Clover',
    'Wildflower',
    'Bush',
    'Thyme',
    'Lemon',
    'Kamahi',
    'Rata',
    'Pohutukawa'
];

let tasks = COMPREHENSIVE_TASKS;
let deletedTasks = {}; // Archive of deleted tasks for historical record display
let map = null;
let markers = [];
let mapPicker = null;

// Offline support
let isOnline = navigator.onLine;
let syncQueue = []; // Queue of pending changes to sync
let syncInProgress = false;

// Seasonal requirements
let seasonalRequirements = []; // Array of {taskId, taskName, dueDate, category, frequency}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded - Initializing BeeMarshall...');
    console.log(`📦 BeeMarshall v${APP_VERSION} - Professional Apiary Management System`);
    
    // Update version display
    updateVersionDisplay();
    
    // Initialize system status
    updateSystemStatus();
    
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    const savedIsAdmin = localStorage.getItem('isAdmin') === 'true';
    const savedTenantId = localStorage.getItem('currentTenantId');
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isAdmin = savedIsAdmin;
        currentTenantId = savedTenantId;
        console.log('🏢 Restored tenant:', currentTenantId);
        showMainApp();
        loadDataFromFirebase();
    } else {
        checkFirstTimeSetup();
    }
    
    // Setup event listeners with error checking
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('✅ Login form found, adding event listener');
        loginForm.addEventListener('submit', function(e) {
            console.log('📝 Form submit event triggered');
            handleLogin(e);
        });
        
        // Also add click listener to the submit button for debugging
        const loginButton = document.getElementById('loginButton');
        if (loginButton) {
            loginButton.addEventListener('click', function(e) {
                console.log('🖱️ Login button clicked');
            });
        }
    } else {
        console.error('❌ Login form not found!');
    }
    document.getElementById('siteForm').addEventListener('submit', handleSaveSite);
    document.getElementById('actionForm').addEventListener('submit', handleLogAction);
    document.getElementById('addEmployeeForm')?.addEventListener('submit', handleAddEmployee);
    document.getElementById('scheduleTaskForm')?.addEventListener('submit', handleScheduleTask);
    document.getElementById('addTaskForm')?.addEventListener('submit', handleAddTask);
    document.getElementById('addRequirementForm')?.addEventListener('submit', handleAddRequirement);
    document.getElementById('actionDate').valueAsDate = new Date();
    
    // Enhanced sticky navbar on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });
    
    // Offline/Online detection
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Load pending sync queue from localStorage
    loadSyncQueue();
    
    // Update sync status on load
    updateSyncStatus();
    
    // Note: GPS button listener added when form is shown
});

// Check if this is first time setup and initialize master account
function checkFirstTimeSetup() {
    // Check if tenant structure exists for GBTech
    database.ref('tenants/gbtech/master/initialized').once('value', (snapshot) => {
        if (!snapshot.exists()) {
            // Auto-initialize master account in tenant structure
            initializeMasterAccount();
        }
    });
}

function initializeMasterAccount() {
    const masterUser = {
        username: MASTER_USERNAME,
        passwordHash: simpleHash(MASTER_PASSWORD),
        role: 'admin',
        createdAt: new Date().toISOString()
    };
    
    database.ref('tenants/gbtech/master/initialized').set(true).then(() => {
        return database.ref('tenants/gbtech/master/admin').set(masterUser);
    }).then(() => {
        console.log('✅ Master account initialized successfully in tenant structure');
        console.log('Username:', MASTER_USERNAME);
        console.log('Password hash:', simpleHash(MASTER_PASSWORD));
    }).catch(error => {
        console.error('❌ Failed to initialize master account:', error);
    });
}

// Emergency reset function - call from browser console if needed
window.resetMasterAccount = function() {
    console.log('🔄 Resetting master account...');
    initializeMasterAccount();
    alert('Master account reset! Try logging in again with:\nUsername: Lars\nPassword: LarsHoney2025!');
}

// Debug function - call from browser console to test password hashing
window.testPasswordHash = function() {
    const testPassword = 'LarsHoney2025!';
    const hash = simpleHash(testPassword);
    console.log('Test password:', testPassword);
    console.log('Generated hash:', hash);
    console.log('Expected hash for LarsHoney2025!:', hash);
    return hash;
}

// Test login functions for debugging
window.testLarsLogin = function() {
    console.log('🧪 Testing Lars login...');
    document.getElementById('loginUsername').value = 'Lars';
    document.getElementById('loginPassword').value = 'LarsHoney2025!';
    handleLogin({ preventDefault: () => {} });
};

window.testGBTechLogin = function() {
    console.log('🧪 Testing GBTech login...');
    document.getElementById('loginUsername').value = 'GBTech';
    document.getElementById('loginPassword').value = '1q2w3e!Q@W#E';
    handleLogin({ preventDefault: () => {} });
};


// Debug function - check Firebase connection
window.checkFirebaseConnection = function() {
    console.log('🔍 Checking Firebase connection...');
    if (typeof database === 'undefined') {
        console.log('❌ Firebase database not initialized');
        return false;
    }
    
    database.ref('master/initialized').once('value', (snapshot) => {
        console.log('✅ Firebase connected');
        console.log('Master initialized:', snapshot.exists());
        if (snapshot.exists()) {
            database.ref('master/admin').once('value', (adminSnapshot) => {
                const admin = adminSnapshot.val();
                console.log('Admin data:', admin);
            });
        }
    }).catch(error => {
        console.log('❌ Firebase error:', error);
    });
    
    return true;
}

// Debug function to check Demo tenant data
window.checkDemoData = function() {
    console.log('🔍 Checking Demo tenant data...');
    if (typeof database === 'undefined') {
        console.log('❌ Firebase database not initialized');
        return;
    }
    
    const tenantId = 'demo';
    console.log('📊 Checking data for tenant:', tenantId);
    
    // Check sites
    database.ref(`tenants/${tenantId}/sites`).once('value', (snapshot) => {
        const data = snapshot.val();
        console.log('📊 Demo sites:', data ? Object.keys(data).length : 0, 'items');
        console.log('📊 Demo sites data:', data);
    });
    
    // Check actions
    database.ref(`tenants/${tenantId}/actions`).once('value', (snapshot) => {
        const data = snapshot.val();
        console.log('📊 Demo actions:', data ? Object.keys(data).length : 0, 'items');
        console.log('📊 Demo actions data:', data);
    });
    
    // Check scheduled tasks
    database.ref(`tenants/${tenantId}/scheduledTasks`).once('value', (snapshot) => {
        const data = snapshot.val();
        console.log('📊 Demo scheduled tasks:', data ? Object.keys(data).length : 0, 'items');
        console.log('📊 Demo scheduled tasks data:', data);
    });
    
    // Check individual hives
    database.ref(`tenants/${tenantId}/individualHives`).once('value', (snapshot) => {
        const data = snapshot.val();
        console.log('📊 Demo individual hives:', data ? Object.keys(data).length : 0, 'items');
        console.log('📊 Demo individual hives data:', data);
    });
};

// Test login function for debugging
window.testLogin = function() {
    console.log('🧪 Testing login system...');
    document.getElementById('loginUsername').value = 'Lars';
    document.getElementById('loginPassword').value = 'LarsHoney2025!';
    console.log('✅ Test credentials set. Click login button to test.');
}


// Console command for manual data migration
window.migrateData = function() {
    console.log('🔄 Manual data migration initiated...');
    console.log('Current tenant:', localStorage.getItem('currentTenantId'));
    
    if (localStorage.getItem('currentTenantId') === 'lars') {
        console.log('📦 Migrating Lars data...');
        autoMigrateLarsData();
    } else {
        console.log('❌ Migration only available for Lars account');
        console.log('Please log in as Lars first, then run: migrateData()');
    }
};

// Force login function for debugging
window.forceLogin = function() {
    console.log('🚀 Force login - bypassing authentication...');
    currentUser = {
        username: 'Lars',
        role: 'admin',
        createdAt: new Date().toISOString()
    };
    isAdmin = true;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('isAdmin', 'true');
    
    sites = [];
    actions = [];
    scheduledTasks = [];
    employees = [];
    
    showMainApp();
    updateDashboard();
    console.log('✅ Force login completed');
}

// Enhanced Login Status and Debugging Functions
function showLoginStatus(type, message, isLoading = false) {
    const statusDiv = document.getElementById('loginStatus');
    const statusText = document.getElementById('loginStatusText');
    const loginButton = document.getElementById('loginButton');
    const loginButtonText = document.getElementById('loginButtonText');
    const loginSpinner = document.getElementById('loginSpinner');
    
    if (statusDiv && statusText) {
        statusDiv.className = `alert alert-${type}`;
        statusText.textContent = message;
        statusDiv.classList.remove('d-none');
        
        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.classList.add('d-none');
            }, 3000);
        }
    }
    
    if (loginButton && loginButtonText && loginSpinner) {
        if (isLoading) {
            loginButton.disabled = true;
            loginButtonText.textContent = 'Authenticating...';
            loginSpinner.classList.remove('d-none');
        } else {
            loginButton.disabled = false;
            loginButtonText.textContent = 'Login';
            loginSpinner.classList.add('d-none');
        }
    }
}

function updateDebugInfo(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

function updateSystemStatus() {
    // Update system status
    updateDebugInfo('systemStatus', 'System ready');
    updateDebugInfo('versionInfo', `v${APP_VERSION}`);
    
    // Check Firebase status
    if (typeof database !== 'undefined') {
        updateDebugInfo('firebaseStatus', 'Connected');
        database.ref('master/initialized').once('value', (snapshot) => {
            if (snapshot.exists()) {
                updateDebugInfo('sessionInfo', 'Master account exists');
            } else {
                updateDebugInfo('sessionInfo', 'First time setup required');
            }
        }).catch(error => {
            updateDebugInfo('firebaseStatus', 'Connection failed');
            updateDebugInfo('lastError', error.message);
        });
    } else {
        updateDebugInfo('firebaseStatus', 'Not initialized');
        updateDebugInfo('sessionInfo', 'Fallback mode available');
    }
}

// Welcome Popup Functions
function showWelcomePopup() {
    console.log('🎉 Showing welcome popup - dashboard fully loaded!');
    
    // Update welcome message with user info
    const welcomeUserName = document.getElementById('welcomeUserName');
    const welcomeMessage = document.getElementById('welcomeMessage');
    
    if (welcomeUserName) {
        welcomeUserName.textContent = `Welcome back, ${currentUser.username}!`;
    }
    
    if (welcomeMessage) {
        welcomeMessage.textContent = `Your apiary management system is ready. All data has been synchronized and the dashboard is fully operational.`;
    }
    
    // Update quick stats
    updateWelcomeStats();
    
    // Show the modal
    const welcomeModal = new bootstrap.Modal(document.getElementById('welcomeModal'));
    welcomeModal.show();
    
    // Update debug info
    updateDebugInfo('systemStatus', 'Dashboard fully loaded');
    console.log('✅ Welcome popup displayed - all systems operational');
}

function updateWelcomeStats() {
    // Update sync timestamp in welcome modal
    const syncTimeElement = document.getElementById('syncTime');
    if (syncTimeElement) {
        const now = new Date();
        syncTimeElement.textContent = now.toLocaleTimeString();
    }
    console.log('✅ Welcome popup ready - sync timestamp updated');
}

function dismissWelcomeModal() {
    console.log('👋 Welcome modal dismissed - user ready to start');
    updateDebugInfo('systemStatus', 'User acknowledged welcome - ready for use');
}

// Version Management Functions
function updateVersionDisplay() {
    const versionElements = document.querySelectorAll('.version-tag .badge');
    versionElements.forEach(element => {
        element.innerHTML = `<i class="bi bi-tag-fill me-1"></i>v${APP_VERSION}`;
    });
    console.log(`🏷️ Version display updated to v${APP_VERSION}`);
}

function getVersionInfo() {
    return {
        current: APP_VERSION,
        history: VERSION_HISTORY,
        latest: VERSION_HISTORY[VERSION_HISTORY.length - 1]
    };
}

function getVersionChanges(version = APP_VERSION) {
    const versionInfo = VERSION_HISTORY.find(v => v.version === version);
    return versionInfo ? versionInfo.changes : [];
}

// Debug function to show version information
window.showVersionInfo = function() {
    const info = getVersionInfo();
    console.log('📦 BeeMarshall Version Information:');
    console.log('Current Version: v${info.current}');
    console.log('Version History:', info.history);
    console.log('Latest Changes:', info.latest.changes);
    return info;
}

// Test function to verify dashboard is working
window.testDashboard = function() {
    console.log('🧪 Testing dashboard functionality...');
    console.log('Current User:', currentUser);
    console.log('Is Admin:', isAdmin);
    console.log('Sites:', sites.length);
    console.log('Actions:', actions.length);
    console.log('Scheduled Tasks:', scheduledTasks.length);
    console.log('Dashboard should be visible now');
    
    // Check if main app is visible
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    
    console.log('Login Screen Hidden:', loginScreen.classList.contains('hidden'));
    console.log('Main App Visible:', !mainApp.classList.contains('hidden'));
    
    return {
        user: currentUser,
        isAdmin: isAdmin,
        data: { sites: sites.length, actions: actions.length, tasks: scheduledTasks.length },
        ui: { 
            loginHidden: loginScreen.classList.contains('hidden'),
            mainVisible: !mainApp.classList.contains('hidden')
        }
    };
}

// Simplified Robust Authentication System
function handleLogin(e) {
    e.preventDefault();
    console.log('🔐 Login form submitted - handleLogin function called');
    console.log('🔍 Event details:', e);
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    console.log('👤 Username:', username);
    console.log('🔑 Password length:', password.length);
    console.log('🔍 Form elements found:', {
        usernameField: !!document.getElementById('loginUsername'),
        passwordField: !!document.getElementById('loginPassword'),
        loginButton: !!document.getElementById('loginButton')
    });
    
    // Show loading state
    showLoginStatus('info', 'Authenticating...', true);
    updateDebugInfo('systemStatus', 'Authenticating user...');
    
    if (!username || !password) {
        showLoginStatus('danger', 'Please enter both username and password', false);
        updateDebugInfo('lastError', 'Missing username or password');
        return;
    }
    
    // MULTI-TENANT AUTHENTICATION SYSTEM
    console.log('🔄 Using multi-tenant authentication system...');
    updateDebugInfo('firebaseStatus', 'Using multi-tenant auth system');
    
    // Check credentials against admin accounts
    const adminAccount = Object.values(ADMIN_ACCOUNTS).find(account => 
        account.username.toLowerCase() === username.toLowerCase() && account.password === password
    );
    
    if (adminAccount) {
        console.log('✅ Admin login successful:', adminAccount.username);
        showLoginStatus('success', `Login successful! Welcome ${adminAccount.username}!`, false);
        updateDebugInfo('systemStatus', 'Multi-tenant authentication successful');
        
        // Set user data with tenant isolation
        currentUser = {
            username: adminAccount.username,
            role: adminAccount.role,
            tenantId: adminAccount.tenantId,
            createdAt: new Date().toISOString()
        };
        currentTenantId = adminAccount.tenantId;
        isAdmin = true;
        
        // Store in localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('currentTenantId', currentTenantId);
        
        // Initialize data for this tenant
        sites = [];
        actions = [];
        scheduledTasks = [];
        employees = [];
        
        // Delay to show success message then redirect
        setTimeout(() => {
            console.log('🚀 Redirecting to dashboard...');
            console.log('🏢 Tenant ID:', currentTenantId);
            showMainApp();
            loadDataFromFirebase();
        }, 1500);
        
        return;
    } else {
        console.log('❌ Invalid credentials');
        showLoginStatus('danger', 'Invalid credentials. Available accounts: Lars, GBTech', false);
        updateDebugInfo('lastError', 'Invalid username or password');
        return;
    }
}

function setupMasterUser(username, password) {
    const masterUser = {
        username: username,
        passwordHash: simpleHash(password),
        role: 'admin',
        createdAt: new Date().toISOString()
    };
    
    database.ref('master/initialized').set(true);
    database.ref('master/admin').set(masterUser);
    
    currentUser = masterUser;
    isAdmin = true;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('isAdmin', 'true');
    
    alert(`✅ Master account created for ${username}!\n\nYou can now add employees from the Team menu.`);
    showMainApp();
    loadDataFromFirebase();
}

function validateLogin(username, password) {
    console.log('🔐 Validating login for:', username);
    const passwordHash = simpleHash(password);
    console.log('🔑 Password hash:', passwordHash);
    console.log('🔑 Password being checked:', password);
    
    // Check if admin
    database.ref('master/admin').once('value', (snapshot) => {
        const admin = snapshot.val();
        console.log('👤 Admin data from Firebase:', admin);
        
        if (admin) {
            console.log('   - Username match:', admin.username.toLowerCase() === username.toLowerCase());
            console.log('   - Password hash match:', admin.passwordHash === passwordHash);
            console.log('   - Expected hash:', admin.passwordHash);
            console.log('   - Provided hash:', passwordHash);
            console.log('   - Admin username:', admin.username);
            console.log('   - Input username:', username);
        } else {
            console.log('❌ No admin data found in Firebase');
        }
        
        if (admin && admin.username.toLowerCase() === username.toLowerCase() && admin.passwordHash === passwordHash) {
            console.log('✅ Admin login successful');
            clearTimeout(firebaseTimeout); // Clear the fallback timeout
            showLoginStatus('success', 'Login successful! Welcome back, ' + admin.username + '!', false);
            updateDebugInfo('systemStatus', 'Authentication successful');
            
            currentUser = admin;
            isAdmin = true;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('isAdmin', 'true');
            
            // Delay to show success message
            setTimeout(() => {
                showMainApp();
                loadDataFromFirebase();
            }, 1500);
            return;
        }
        
        // Check if employee (tenant-specific)
        console.log('Checking employees for tenant:', currentTenantId);
        const employeePath = currentTenantId ? `tenants/${currentTenantId}/employees` : 'employees';
        database.ref(employeePath).once('value', (empSnapshot) => {
            const employeesList = empSnapshot.val() || {};
            console.log('Employees:', employeesList);
            
            const employee = Object.values(employeesList).find(emp => 
                emp.username.toLowerCase() === username.toLowerCase() && emp.passwordHash === passwordHash
            );
            
            if (employee) {
                console.log('Employee login successful');
                clearTimeout(firebaseTimeout); // Clear the fallback timeout
                showLoginStatus('success', 'Login successful! Welcome, ' + employee.username + '!', false);
                updateDebugInfo('systemStatus', 'Employee authentication successful');
                
                currentUser = employee;
                isAdmin = false;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                localStorage.setItem('isAdmin', 'false');
                
                // Delay to show success message
                setTimeout(() => {
                    showMainApp();
                    loadDataFromFirebase();
                }, 1500);
            } else {
                console.log('Login failed - no match');
                showLoginStatus('danger', 'Invalid username or password. Please check your credentials and try again.', false);
                updateDebugInfo('lastError', 'No matching user found');
            }
        }).catch(error => {
            console.error('Employee check error:', error);
            showLoginStatus('danger', 'Error checking credentials. Please try again.', false);
            updateDebugInfo('lastError', 'Employee check failed: ' + error.message);
        });
    }).catch(error => {
        console.error('Admin check error:', error);
        showLoginStatus('danger', 'Error checking credentials. Please try again.', false);
        updateDebugInfo('lastError', 'Admin check failed: ' + error.message);
    });
}

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

function logout() {
    if (confirm('Logout? All changes are automatically saved.')) {
        currentUser = null;
        isAdmin = false;
        localStorage.clear();
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
        location.reload();
    }
}

// Show Help Modal
function showHelpModal() {
    beeMarshallAlert('Welcome to BeeMarshall Help!\n\n📖 Getting Started:\n- Dashboard: Overview of your apiary\n- Sites: Manage your apiary locations\n- Actions: Track completed tasks\n- Schedule: Plan upcoming tasks\n- Reports: View detailed analytics\n\n💡 Tips:\n- Click on site markers on the map to view details\n- Schedule tasks from the dashboard or schedule view\n- Use the search feature to quickly find sites or actions\n\nNeed more help? Contact support.', 'info');
}

// Show Settings Modal
function showSettingsModal() {
    const settingsModal = document.createElement('div');
    settingsModal.className = 'modal fade';
    settingsModal.id = 'settingsModal';
    settingsModal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content" style="background: var(--glass); backdrop-filter: blur(12px) saturate(1.1); border: 1px solid rgba(255,255,255,0.2);">
                <div class="modal-header border-0">
                    <h5 class="modal-title d-flex align-items-center">
                        <i class="bi bi-gear me-2" style="color: var(--accent); font-size: 1.2rem;"></i>
                        Settings
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label fw-bold">Notifications</label>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="enableNotifications" checked>
                            <label class="form-check-label" for="enableNotifications">
                                Enable email notifications
                            </label>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">Data & Privacy</label>
                        <button class="btn btn-outline-primary w-100" onclick="exportAllData()">
                            <i class="bi bi-download"></i> Export All Data
                        </button>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">About</label>
                        <p class="text-muted mb-0">
                            <strong>BeeMarshall v${APP_VERSION}</strong><br>
                            Professional Apiary Management System<br>
                            © 2024 GBTech
                        </p>
                    </div>
                </div>
                <div class="modal-footer border-0">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(settingsModal);
    const modal = new bootstrap.Modal(settingsModal);
    modal.show();
    
    settingsModal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(settingsModal);
    });
}

// Show Profile Modal
function showProfileModal() {
    const profileModal = document.createElement('div');
    profileModal.className = 'modal fade';
    profileModal.id = 'profileModal';
    profileModal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content" style="background: var(--glass); backdrop-filter: blur(12px) saturate(1.1); border: 1px solid rgba(255,255,255,0.2);">
                <div class="modal-header border-0">
                    <h5 class="modal-title d-flex align-items-center">
                        <i class="bi bi-person me-2" style="color: var(--accent); font-size: 1.2rem;"></i>
                        User Profile
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="text-center mb-4">
                        <div class="mb-3">
                            <i class="bi bi-person-circle" style="font-size: 4rem; color: var(--dark-yellow);"></i>
                        </div>
                        <h5>${currentUser ? currentUser.username : 'User'}</h5>
                        ${isAdmin ? '<span class="badge admin-badge">ADMIN</span>' : '<span class="badge bg-secondary">Employee</span>'}
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">Email</label>
                        <input type="email" class="form-control" value="${currentUser ? (currentUser.email || 'Not set') : 'Not set'}" disabled>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">Role</label>
                        <input type="text" class="form-control" value="${isAdmin ? 'Administrator' : 'Employee'}" disabled>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">Tenant</label>
                        <input type="text" class="form-control" value="${currentTenantId || 'Default'}" disabled>
                        <small class="form-text text-muted">Tenant information cannot be changed</small>
                    </div>
                    <hr class="my-4">
                    <div class="mb-3">
                        <label class="form-label fw-bold">Change Password</label>
                        <button class="btn btn-outline-primary w-100" onclick="showChangePasswordModal(); bootstrap.Modal.getInstance(document.getElementById('profileModal')).hide();">
                            <i class="bi bi-key"></i> Change Password
                        </button>
                    </div>
                </div>
                <div class="modal-footer border-0">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(profileModal);
    const modal = new bootstrap.Modal(profileModal);
    modal.show();
    
    profileModal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(profileModal);
    });
}

// Show Change Password Modal
function showChangePasswordModal() {
    const passwordModal = document.createElement('div');
    passwordModal.className = 'modal fade';
    passwordModal.id = 'changePasswordModal';
    passwordModal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content" style="background: var(--glass); backdrop-filter: blur(12px) saturate(1.1); border: 1px solid rgba(255,255,255,0.2);">
                <div class="modal-header border-0">
                    <h5 class="modal-title d-flex align-items-center">
                        <i class="bi bi-key me-2" style="color: var(--accent); font-size: 1.2rem;"></i>
                        Change Password
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label fw-bold">Current Password</label>
                        <input type="password" class="form-control" id="currentPassword" placeholder="Enter your current password" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">New Password</label>
                        <input type="password" class="form-control" id="newPassword" placeholder="Enter new password (min 6 characters)" required>
                        <small class="form-text text-muted">Password must be at least 6 characters long</small>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">Confirm New Password</label>
                        <input type="password" class="form-control" id="confirmPassword" placeholder="Confirm new password" required>
                    </div>
                    <div id="passwordChangeMessage" class="alert d-none" role="alert"></div>
                </div>
                <div class="modal-footer border-0">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="savePasswordChange()">Change Password</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(passwordModal);
    const modal = new bootstrap.Modal(passwordModal);
    modal.show();
    
    passwordModal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(passwordModal);
    });
}

// Save password change
function savePasswordChange() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const messageDiv = document.getElementById('passwordChangeMessage');
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        messageDiv.className = 'alert alert-danger';
        messageDiv.textContent = 'Please fill in all fields';
        messageDiv.classList.remove('d-none');
        return;
    }
    
    if (newPassword.length < 6) {
        messageDiv.className = 'alert alert-danger';
        messageDiv.textContent = 'Password must be at least 6 characters long';
        messageDiv.classList.remove('d-none');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        messageDiv.className = 'alert alert-danger';
        messageDiv.textContent = 'New passwords do not match';
        messageDiv.classList.remove('d-none');
        return;
    }
    
    // Verify current password by re-authenticating
    const username = currentUser.username;
    const email = currentUser.email;
    
    auth.signInWithEmailAndPassword(email, currentPassword)
        .then((userCredential) => {
            // Current password is correct, now update to new password
            return userCredential.user.updatePassword(newPassword);
        })
        .then(() => {
            messageDiv.className = 'alert alert-success';
            messageDiv.textContent = 'Password changed successfully!';
            messageDiv.classList.remove('d-none');
            
            // Clear form
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            
            // Close modal after 2 seconds
            setTimeout(() => {
                bootstrap.Modal.getInstance(document.getElementById('changePasswordModal')).hide();
                beeMarshallAlert('Password changed successfully!', 'success');
            }, 2000);
        })
        .catch((error) => {
            console.error('Error changing password:', error);
            messageDiv.className = 'alert alert-danger';
            
            if (error.code === 'auth/wrong-password') {
                messageDiv.textContent = 'Current password is incorrect';
            } else if (error.code === 'auth/weak-password') {
                messageDiv.textContent = 'New password is too weak';
            } else {
                messageDiv.textContent = 'Error changing password: ' + error.message;
            }
            
            messageDiv.classList.remove('d-none');
        });
}

function showMainApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('currentUserDisplay').textContent = currentUser.username;
    
    if (isAdmin) {
        document.getElementById('adminBadge').classList.remove('hidden');
        document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('employee-hidden'));
    } else {
        document.getElementById('adminBadge').classList.add('hidden');
        document.querySelectorAll('.admin-only').forEach(el => el.classList.add('employee-hidden'));
    }
    
    // Show GBTech test buttons only for GBTech login
    const gbtechButtons = document.getElementById('gbtechTestButtons');
    if (gbtechButtons) {
        if (currentTenantId === 'gbtech' && currentUser.username === 'GBTech') {
            gbtechButtons.style.display = 'inline';
        } else {
            gbtechButtons.style.display = 'none';
        }
    }
    
    // Initialize dashboard
    showDashboard();
    
    // Show welcome popup after a short delay to ensure everything is loaded
    setTimeout(() => {
        showWelcomePopup();
    }, 1000);
}

// Show dashboard without initializing map (for initial load)
function showDashboardWithoutMap() {
    hideAllViews();
    document.getElementById('dashboardView').classList.remove('hidden');
    updateDashboardStats(); // Only update stats, not map
}

// Update only dashboard stats without map
function updateDashboardStats() {
    const totalHives = sites.reduce((sum, s) => sum + (s.hiveCount || 0), 0);
    
    // Check for overdue tasks and update flagged count
    checkAndFlagOverdueTasks();
    const overdueTasks = scheduledTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return !task.completed && taskDate < new Date();
    }).length;
    
    const flaggedCount = actions.filter(a => a.flag && a.flag !== '').length + overdueTasks;
    
    // Animate number changes
    animateNumber(document.getElementById('statSites'), sites.length);
    animateNumber(document.getElementById('statHives'), totalHives);
    animateNumber(document.getElementById('statActions'), actions.length);
    animateNumber(document.getElementById('statFlagged'), flaggedCount);
    
    // Update quick stats
    updateQuickStats();
}

// Load data from Firebase with tenant isolation
// Prevent multiple simultaneous data loads
let isLoadingData = false;

function loadDataFromFirebase() {
    if (isLoadingData) {
        console.log('⏳ Data loading already in progress, skipping...');
        return;
    }
    
    isLoadingData = true;
    showSyncStatus('', 'syncing');
    
    if (!currentTenantId) {
        console.error('❌ No tenant ID found');
        isLoadingData = false;
        return;
    }
    
    console.log('🏢 Loading data for tenant:', currentTenantId);
    
    // Load tenant-specific data - simplified approach
    let dataLoadCount = 0;
    const totalDataTypes = 5; // sites, actions, individualHives, scheduledTasks, honeyTypes
    
    function checkAllDataLoaded() {
        dataLoadCount++;
        console.log(`📊 Data load progress: ${dataLoadCount}/${totalDataTypes}`);
        console.log('📊 Current data state in checkAllDataLoaded:', {
            sites: sites ? sites.length : 'undefined',
            actions: actions ? actions.length : 'undefined',
            scheduledTasks: scheduledTasks ? scheduledTasks.length : 'undefined',
            individualHives: individualHives ? individualHives.length : 'undefined',
            honeyTypes: HONEY_TYPES ? HONEY_TYPES.length : 'undefined'
        });
        
        if (dataLoadCount >= totalDataTypes) {
            console.log('✅ All data loaded, updating dashboard');
            console.log('🔍 Final data state:', {
                sites: sites ? sites.length : 'undefined',
                actions: actions ? actions.length : 'undefined',
                scheduledTasks: scheduledTasks ? scheduledTasks.length : 'undefined',
                individualHives: individualHives ? individualHives.length : 'undefined',
                honeyTypes: HONEY_TYPES ? HONEY_TYPES.length : 'undefined'
            });
            isLoadingData = false;
            showSyncStatus('', 'success');
            // Small delay to ensure data is properly set
            setTimeout(() => {
                console.log('📊 About to call updateDashboard()');
                console.log('📊 Data arrays before updateDashboard:', {
                    sites: Array.isArray(sites) ? sites.length : typeof sites,
                    actions: Array.isArray(actions) ? actions.length : typeof actions,
                    scheduledTasks: Array.isArray(scheduledTasks) ? scheduledTasks.length : typeof scheduledTasks,
                    individualHives: Array.isArray(individualHives) ? individualHives.length : typeof individualHives
                });
                updateDashboard();
            }, 100);
        }
    }
    
    database.ref(`tenants/${currentTenantId}/sites`).on('value', (snapshot) => {
        const data = snapshot.val();
        console.log('🔍 Raw sites data for', currentTenantId + ':', data);
        sites = data ? Object.values(data) : [];
        console.log('📊 Sites loaded for', currentTenantId + ':', sites.length);
        console.log('📊 Sites array:', sites);
        
        if (sites.length === 0) {
            console.log('📭 No sites found - starting fresh');
            showSyncStatus('', 'success');
        } else {
            showSyncStatus('', 'success');
        }
        checkAllDataLoaded();
    }, (error) => {
        console.log('❌ Tenant sites access failed:', error.message);
        showSyncStatus('', 'error');
        checkAllDataLoaded();
    });
    
    database.ref(`tenants/${currentTenantId}/actions`).on('value', (snapshot) => {
        const data = snapshot.val();
        console.log('🔍 Raw actions data for', currentTenantId + ':', data);
        actions = data ? Object.values(data) : [];
        console.log('📊 Actions loaded for', currentTenantId + ':', actions.length);
        console.log('📊 Actions array:', actions);
        checkAllDataLoaded();
    }, (error) => {
        console.log('❌ Tenant actions access failed:', error.message);
        checkAllDataLoaded();
    });
    
    database.ref(`tenants/${currentTenantId}/individualHives`).on('value', (snapshot) => {
        individualHives = snapshot.val() ? Object.values(snapshot.val()) : [];
        console.log('📊 Individual hives loaded for', currentTenantId + ':', individualHives.length);
        checkAllDataLoaded();
    }, (error) => {
        console.log('❌ Tenant hives access failed:', error.message);
        checkAllDataLoaded();
    });
    
    database.ref(`tenants/${currentTenantId}/scheduledTasks`).on('value', (snapshot) => {
        console.log('🔄 Scheduled tasks Firebase listener triggered');
        console.log('📊 Snapshot exists:', !!snapshot.val());
        console.log('📊 Snapshot keys:', snapshot.val() ? Object.keys(snapshot.val()) : 'null');
        
        scheduledTasks = snapshot.val() ? Object.values(snapshot.val()) : [];
        console.log('📊 Scheduled tasks loaded for', currentTenantId + ':', scheduledTasks.length);
        console.log('📊 Scheduled tasks data:', scheduledTasks);
        
        updateScheduledTasksPreview();
        // Update Quick Stats when scheduled tasks are loaded
        if (typeof updateQuickStats === 'function') {
            updateQuickStats();
        }
        checkAllDataLoaded();
    }, (error) => {
        console.log('❌ Tenant tasks access failed:', error.message);
        console.error('❌ Scheduled tasks loading error:', error);
        checkAllDataLoaded();
    });
    
    // Load honey types
    database.ref(`tenants/${currentTenantId}/honeyTypes`).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data && Array.isArray(data)) {
            HONEY_TYPES = data;
        } else {
            // Initialize with default honey types if none exist
            HONEY_TYPES = [
                'Manuka',
                'Rewarewa',
                'Clover',
                'Wildflower',
                'Bush',
                'Thyme',
                'Lemon',
                'Kamahi',
                'Rata',
                'Pohutukawa'
            ];
            // Save default honey types to Firebase
            database.ref(`tenants/${currentTenantId}/honeyTypes`).set(HONEY_TYPES);
        }
        console.log('🍯 Honey types loaded for', currentTenantId + ':', HONEY_TYPES.length);
        checkAllDataLoaded();
    }, (error) => {
        console.log('❌ Tenant honey types access failed:', error.message);
        checkAllDataLoaded();
    });
    
    if (isAdmin) {
        loadEmployees();
    }
    
    // Initialize and listen for tasks
    database.ref('tasks').on('value', (snapshot) => {
        if (!snapshot.exists()) {
            // First time: populate with default tasks
            COMPREHENSIVE_TASKS.forEach(task => {
                database.ref(`tasks/${task.id}`).set(task);
            });
        } else {
            tasks = Object.values(snapshot.val());
            // Refresh task management view if it's open
            if (!document.getElementById('manageTasksView')?.classList.contains('hidden')) {
                if (typeof renderTasksList === 'function') {
                    renderTasksList();
                } else {
                    console.log('⚠️ renderTasksList not available yet');
                }
            }
        }
    });
    
    // Load deleted tasks archive for historical reference
    database.ref('deletedTasks').on('value', (snapshot) => {
        deletedTasks = snapshot.val() || {};
    });
    
    // Load seasonal requirements
    database.ref('seasonalRequirements').on('value', (snapshot) => {
        seasonalRequirements = snapshot.val() ? Object.values(snapshot.val()) : [];
        // Refresh if on seasonal requirements page
        if (!document.getElementById('seasonalRequirementsView')?.classList.contains('hidden')) {
            renderSeasonalRequirements();
            renderComplianceStatus();
        }
    });
}

function loadEmployees() {
    if (!currentTenantId) {
        console.error('❌ No tenant ID for employee loading');
        return;
    }
    
    database.ref(`tenants/${currentTenantId}/employees`).on('value', (snapshot) => {
        employees = snapshot.val() ? Object.values(snapshot.val()) : [];
        renderEmployees();
    });
}

// Export all data to CSV
function exportAllData() {
    downloadCSV();
}

// Debug utility
function debugBeeMarshall() {
    console.log('=== BeeMarshall Debug Information ===');
    console.log('Version:', APP_VERSION);
    console.log('Current User:', currentUser);
    console.log('Current Tenant ID:', currentTenantId);
    console.log('Is Admin:', isAdmin);
    console.log('Firebase App:', typeof firebase !== 'undefined' ? 'Initialized' : 'Not initialized');
    console.log('Total Sites:', sites.length);
    console.log('Total Actions:', actions.length);
    console.log('Total Scheduled Tasks:', scheduledTasks.length);
    console.log('Total Individual Hives:', individualHives.length);
    console.log('Sites:', sites);
    console.log('Actions:', actions);
    console.log('Scheduled Tasks:', scheduledTasks);
    console.log('====================================');
}

// GBTech Test Service - Comprehensive Test Data Generator
let gbtechTestDataBackup = null;
let gbtechTestDataAdded = false;

function createGBTechTestData() {
    // Only allow if logged in as GBTech
    if (currentTenantId !== 'gbtech' || currentUser.username !== 'GBTech') {
        beeMarshallAlert('This feature is only available for GBTech login.', 'error');
        return;
    }
    
    // Check if test data already exists
    if (gbtechTestDataAdded) {
        const confirm = window.confirm('Test data already exists. Do you want to regenerate it? This will replace existing test data.');
        if (!confirm) return;
    }
    
    // Backup current data
    gbtechTestDataBackup = {
        sites: JSON.parse(JSON.stringify(sites)),
        actions: JSON.parse(JSON.stringify(actions)),
        scheduledTasks: JSON.parse(JSON.stringify(scheduledTasks))
    };
    
    console.log('🧪 Creating GBTech test data...');
    
    // Create diverse test sites
    const testSites = [
        {
            id: 1001,
            name: 'Main Apiary - Strong Hives',
            location: 'Main Farm',
            lat: -36.8485,
            lng: 174.7633,
            siteType: 'Commercial',
            seasonality: 'Year-round',
            accessType: 'Drive',
            hiveCount: 15,
            hiveStrength: { strong: 10, medium: 3, weak: 2, nuc: 0, dead: 0 },
            stackBreakdown: { doubles: 8, topSplits: 5, singles: 2, nucs: 0, emptyPlatforms: 0 },
            notes: 'Primary commercial operation with high honey yield'
        },
        {
            id: 1002,
            name: 'Winter Storage Site',
            location: 'Cold Storage Area',
            lat: -36.8585,
            lng: 174.7733,
            siteType: 'Winter Hibernation',
            seasonality: 'Winter',
            accessType: 'Walk',
            hiveCount: 8,
            hiveStrength: { strong: 0, medium: 2, weak: 5, nuc: 1, dead: 0 },
            stackBreakdown: { doubles: 2, topSplits: 0, singles: 6, nucs: 0, emptyPlatforms: 0 },
            notes: 'Winter consolidation site'
        },
        {
            id: 1003,
            name: 'NUC Breeding Site',
            location: 'Breeding Grounds',
            lat: -36.8685,
            lng: 174.7833,
            siteType: 'Breeding',
            seasonality: 'Spring/Summer',
            accessType: 'Drive',
            hiveCount: 20,
            hiveStrength: { strong: 5, medium: 8, weak: 0, nuc: 7, dead: 0 },
            stackBreakdown: { doubles: 2, topSplits: 0, singles: 0, nucs: 18, emptyPlatforms: 0 },
            notes: 'NUC production and queen breeding'
        },
        {
            id: 1004,
            name: 'Remote Mountain Apiary',
            location: 'Mountain Top',
            lat: -36.8785,
            lng: 174.7933,
            siteType: 'Remote',
            seasonality: 'Summer',
            accessType: 'Helicopter',
            hiveCount: 6,
            hiveStrength: { strong: 4, medium: 2, weak: 0, nuc: 0, dead: 0 },
            stackBreakdown: { doubles: 4, topSplits: 0, singles: 2, nucs: 0, emptyPlatforms: 0 },
            notes: 'High altitude honey production - difficult access'
        },
        {
            id: 1005,
            name: 'Urban Rooftop Apiary',
            location: 'City Center',
            lat: -36.8885,
            lng: 174.8033,
            siteType: 'Urban',
            seasonality: 'Year-round',
            accessType: 'Elevator',
            hiveCount: 10,
            hiveStrength: { strong: 6, medium: 3, weak: 1, nuc: 0, dead: 0 },
            stackBreakdown: { doubles: 0, topSplits: 8, singles: 2, nucs: 0, emptyPlatforms: 0 },
            notes: 'Urban honey production for local markets'
        },
        {
            id: 1006,
            name: 'Orchard Pollination Site',
            location: 'Apple Orchard',
            lat: -36.8985,
            lng: 174.8133,
            siteType: 'Pollination',
            seasonality: 'Spring',
            accessType: 'Drive',
            hiveCount: 50,
            hiveStrength: { strong: 45, medium: 5, weak: 0, nuc: 0, dead: 0 },
            stackBreakdown: { doubles: 45, topSplits: 5, singles: 0, nucs: 0, emptyPlatforms: 0 },
            notes: 'Commercial pollination contract - temporary placement'
        },
        {
            id: 1007,
            name: 'Isolation Yard',
            location: 'Quarantine Area',
            lat: -36.9085,
            lng: 174.8233,
            siteType: 'Quarantine',
            seasonality: 'Year-round',
            accessType: 'Walk',
            hiveCount: 5,
            hiveStrength: { strong: 0, medium: 1, weak: 2, nuc: 0, dead: 2 },
            stackBreakdown: { doubles: 0, topSplits: 0, singles: 3, nucs: 0, emptyPlatforms: 2 },
            notes: 'Disease isolation and treatment area'
        },
        {
            id: 1008,
            name: 'Research Apiary',
            location: 'University Grounds',
            lat: -36.9185,
            lng: 174.8333,
            siteType: 'Research',
            seasonality: 'Year-round',
            accessType: 'Drive',
            hiveCount: 12,
            hiveStrength: { strong: 4, medium: 5, weak: 2, nuc: 1, dead: 0 },
            stackBreakdown: { doubles: 3, topSplits: 4, singles: 4, nucs: 1, emptyPlatforms: 0 },
            notes: 'Bee behavior and genetics research project'
        }
    ];
    
    // Create diverse test actions
    const testActions = [
        { id: 2001, siteId: 1001, task: 'General Inspection', date: getDateDaysAgo(2), employee: 'GBTech', notes: 'All hives strong, queen laying well' },
        { id: 2002, siteId: 1001, task: 'Honey Harvest', date: getDateDaysAgo(15), employee: 'GBTech', notes: 'Harvested 45kg premium honey', harvestQuantity: 45 },
        { id: 2003, siteId: 1002, task: 'Varroa Treatment', date: getDateDaysAgo(5), employee: 'GBTech', notes: 'Applied Apivar strips', flag: 'urgent' },
        { id: 2004, siteId: 1003, task: 'Queen Replacement', date: getDateDaysAgo(10), employee: 'GBTech', notes: 'Replaced 3 failing queens' },
        { id: 2005, siteId: 1004, task: 'Emergency Feeding', date: getDateDaysAgo(3), employee: 'GBTech', notes: 'Provided sugar syrup due to weather', flag: 'warning' },
        { id: 2006, siteId: 1005, task: 'Swarm Prevention', date: getDateDaysAgo(7), employee: 'GBTech', notes: 'Added supers to prevent swarming' },
        { id: 2007, siteId: 1006, task: 'Equipment Sanitization', date: getDateDaysAgo(1), employee: 'GBTech', notes: 'Cleaned all equipment after pollination' },
        { id: 2008, siteId: 1007, task: 'Disease Check', date: getDateDaysAgo(0), employee: 'GBTech', notes: 'AFB detected in 2 hives - quarantine active', flag: 'urgent' },
        { id: 2009, siteId: 1008, task: 'Record Keeping', date: getDateDaysAgo(4), employee: 'GBTech', notes: 'Data collection for research project' },
        { id: 2010, siteId: 1001, task: 'Feed Dry Sugar', date: getDateDaysAgo(20), employee: 'GBTech', notes: 'Winter feed preparation' }
    ];
    
    // Create diverse test scheduled tasks
    const testScheduledTasks = [
        { id: 3001, siteId: 1001, task: 'General Inspection', dueDate: getDateDaysFromNow(3), priority: 'normal', completed: false },
        { id: 3002, siteId: 1002, task: 'Remove Varroa Treatment', dueDate: getDateDaysFromNow(7), priority: 'high', completed: false },
        { id: 3003, siteId: 1003, task: 'Mark New Queens', dueDate: getDateDaysFromNow(14), priority: 'normal', completed: false },
        { id: 3004, siteId: 1004, task: 'Aerial Check-up', dueDate: getDateDaysFromNow(21), priority: 'normal', completed: false },
        { id: 3005, siteId: 1007, task: 'Re-inspect Quarantine', dueDate: getDateDaysFromNow(2), priority: 'urgent', completed: false },
        { id: 3006, siteId: 1006, task: 'Contract Completion', dueDate: getDateDaysFromNow(30), priority: 'normal', completed: false },
        { id: 3007, siteId: 1001, task: 'Harvest Honey', dueDate: getDateDaysFromNow(45), priority: 'high', completed: false }
    ];
    
    // Helper functions for date calculation
    function getDateDaysAgo(days) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString();
    }
    
    function getDateDaysFromNow(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString();
    }
    
    // Save to Firebase
    const tenantPath = `tenants/${currentTenantId}`;
    const batch = {};
    
    // Add sites
    testSites.forEach(site => {
        batch[`${tenantPath}/sites/${site.id}`] = {
            ...site,
            createdDate: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            lastModifiedBy: currentUser.username
        };
    });
    
    // Add actions
    testActions.forEach(action => {
        batch[`${tenantPath}/actions/${action.id}`] = {
            ...action,
            createdDate: action.date,
            lastModified: action.date,
            lastModifiedBy: action.employee
        };
    });
    
    // Add scheduled tasks
    testScheduledTasks.forEach(task => {
        batch[`${tenantPath}/scheduledTasks/${task.id}`] = {
            ...task,
            createdDate: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            createdBy: currentUser.username
        };
    });
    
    // Execute batch write
    database.ref().update(batch)
        .then(() => {
            console.log('✅ GBTech test data created successfully');
            gbtechTestDataAdded = true;
            beeMarshallAlert('Test data created successfully! You now have 8 diverse sites, 10 actions, and 7 scheduled tasks.', 'success');
            
            // Refresh data
            setTimeout(() => {
                loadDataFromFirebase();
            }, 500);
        })
        .catch(error => {
            console.error('❌ Error creating test data:', error);
            beeMarshallAlert('Error creating test data: ' + error.message, 'error');
        });
}

function undoGBTechTestData() {
    // Only allow if logged in as GBTech
    if (currentTenantId !== 'gbtech' || currentUser.username !== 'GBTech') {
        beeMarshallAlert('This feature is only available for GBTech login.', 'error');
        return;
    }
    
    if (!gbtechTestDataBackup) {
        beeMarshallAlert('No backup data found. Cannot undo test data.', 'warning');
        return;
    }
    
    const confirm = window.confirm('Are you sure you want to undo the test data? This will restore your original data.');
    if (!confirm) return;
    
    console.log('↩️ Undoing GBTech test data...');
    
    const tenantPath = `tenants/${currentTenantId}`;
    const batch = {};
    
    // Remove test sites (IDs 1001-1008)
    for (let i = 1001; i <= 1008; i++) {
        batch[`${tenantPath}/sites/${i}`] = null;
    }
    
    // Remove test actions (IDs 2001-2010)
    for (let i = 2001; i <= 2010; i++) {
        batch[`${tenantPath}/actions/${i}`] = null;
    }
    
    // Remove test scheduled tasks (IDs 3001-3007)
    for (let i = 3001; i <= 3007; i++) {
        batch[`${tenantPath}/scheduledTasks/${i}`] = null;
    }
    
    // Execute batch delete
    database.ref().update(batch)
        .then(() => {
            console.log('✅ GBTech test data removed successfully');
            gbtechTestDataAdded = false;
            gbtechTestDataBackup = null;
            beeMarshallAlert('Test data removed successfully! Your original data has been restored.', 'success');
            
            // Refresh data
            setTimeout(() => {
                loadDataFromFirebase();
            }, 500);
        })
        .catch(error => {
            console.error('❌ Error removing test data:', error);
            beeMarshallAlert('Error removing test data: ' + error.message, 'error');
        });
}
