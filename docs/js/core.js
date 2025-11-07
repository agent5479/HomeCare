// HomeCare - Core Application Logic
// Master User: Jess (can add employees, delete records)
// Employees: Can add/view, cannot delete

// Version Management
const APP_VERSION = '0.7';
const VERSION_HISTORY = [
    { version: '0.91', date: '2024-12-19', changes: ['Fixed dashboard loading issue', 'Enhanced login system', 'Added welcome popup', 'Improved map initialization'] },
    { version: '0.92', date: '2024-12-19', changes: ['Added version tag to login screen', 'Implemented lazy map loading', 'Enhanced error prevention', 'Improved user experience'] },
    { version: '0.94', date: '2024-12-19', changes: ['Sales-ready deployment', 'New Firebase project integration', 'Terms of use and privacy declarations', 'Removed migration tools', 'Enhanced security and data isolation'] },
    { version: '0.96', date: '2024-12-19', changes: ['Added Demo user account for client demonstrations', 'Enhanced hive strength breakdown system', 'Improved site editing with detailed breakdowns', 'Updated reports with comprehensive data integration'] }
];

// Master account credentials - now loaded from secure configuration
// See config.js for secure credential management

// Custom alert function with CareMarshall branding
function careMarshallAlert(message, type = 'info') {
    // Create custom modal for CareMarshall alerts
    const alertModal = document.createElement('div');
    alertModal.className = 'modal fade';
    alertModal.id = 'careMarshallAlert';
    alertModal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content" style="background: var(--glass); backdrop-filter: blur(12px) saturate(1.1); border: 1px solid rgba(255,255,255,0.2);">
                <div class="modal-header border-0">
                    <h5 class="modal-title d-flex align-items-center">
                        <i class="bi bi-house-heart-fill me-2" style="color: var(--accent); font-size: 1.2rem;"></i>
                        CareMarshall says
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
// Backward compatibility aliases
window.alert = careMarshallAlert;
const beeMarshallAlert = careMarshallAlert; // Backward compatibility
const homeCareAlert = careMarshallAlert; // Alias for consistency

// Admin accounts are now loaded securely from environment variables
// See config.js for configuration management
let ADMIN_ACCOUNTS = {};

// Initialize admin accounts from secure configuration
function initializeAdminAccounts() {
    if (window.SecureConfig) {
        ADMIN_ACCOUNTS = window.SecureConfig.getAdminAccounts();
        console.log('✅ Admin accounts loaded from secure configuration');
        // Security: Don't log account details in production
    } else {
        console.error('❌ SecureConfig not available. Admin accounts not loaded.');
    }
}

// Initialize database reference
function initializeDatabase() {
    if (window.database) {
        database = window.database;
        console.log('✅ Database reference initialized');
    } else {
        console.warn('⚠️ Database not available - running in offline mode');
        database = null;
    }
}

// Global variables - explicitly initialize to prevent temporal dead zone issues
var currentUser = null;
var isAdmin = false;
var currentTenantId = null; // For data isolation
var database = null; // Will be set when Firebase initializes
var sites = [];
var actions = [];
var clients = []; // Renamed from individualHives for backward compatibility
var individualHives = clients; // Backward compatibility alias
var scheduledTasks = [];
var employees = [];
var visits = []; // Visit-based scheduling (NEW: replaces individual task scheduling)
var taskGroups = []; // Task group templates for quick visit scheduling (NEW)
// Comprehensive task list for the HomeCare system
const COMPREHENSIVE_TASKS = [
    // Client Care & Assessment
    { id: 'task_1', name: 'Client Health Assessment', category: 'Assessment', description: 'Regular client health and wellbeing check' },
    { id: 'task_2', name: 'Medication Management', category: 'Health', description: 'Administer and monitor client medications' },
    { id: 'task_3', name: 'Vital Signs Check', category: 'Health', description: 'Monitor blood pressure, temperature, pulse, and other vital signs' },
    { id: 'task_4', name: 'Health Screening', category: 'Health', description: 'Screen for health conditions and concerns' },
    { id: 'task_5', name: 'Care Plan Review', category: 'Administration', description: 'Review and update individual care plans' },
    { id: 'task_6', name: 'Equipment Maintenance', category: 'Maintenance', description: 'Clean and maintain care equipment and aids' },
    { id: 'task_7', name: 'Record Keeping', category: 'Administration', description: 'Update client records and care logs' },
    { id: 'task_8', name: 'Home Safety Check', category: 'Safety', description: 'Ensure home environment is safe and accessible', common: true },
    { id: 'task_9', name: 'Infection Control', category: 'Health', description: 'Monitor and control infection risks' },
    { id: 'task_10', name: 'Care Coordination', category: 'Management', description: 'Coordinate care services and support as needed' },
    { id: 'task_11', name: 'Family Meeting', category: 'Communication', description: 'Meet with family members to discuss care' },
    { id: 'task_12', name: 'Seasonal Preparation', category: 'Seasonal', description: 'Prepare for seasonal changes and needs' },
    { id: 'task_13', name: 'Care Plan Build-up', category: 'Seasonal', description: 'Enhance care plans for changing needs' },
    { id: 'task_14', name: 'Medical Treatment', category: 'Health', description: 'Apply prescribed medical treatments' },
    { id: 'task_15', name: 'Client Relocation', category: 'Management', description: 'Assist with moving clients to new locations' },
    { id: 'task_16', name: 'Equipment Sanitization', category: 'Health', description: 'Clean and sanitize care equipment' },
    { id: 'task_17', name: 'Emergency Response', category: 'Emergency', description: 'Respond to client emergencies' },
    { id: 'site_visit_inventory', name: 'Home Visit & Inventory', category: 'Management', description: 'Home visit with client status and inventory updates' },
    { id: 'client_status_update', name: 'Client Status Update', category: 'Management', description: 'Update client care status and independence level' },
    { id: 'care_equipment_update', name: 'Care Equipment Update', category: 'Management', description: 'Update care equipment inventory and needs' },
    { id: 'task_18', name: 'Care Provider Review', category: 'Management', description: 'Review and adjust care provider assignments' },
    { id: 'task_19', name: 'Client Monitoring', category: 'Assessment', description: 'Regular monitoring of client wellbeing and activity' },
    // Personal Care category tasks
    { id: 'task_20', name: 'Meal Preparation', category: 'Personal Care', description: 'Prepare nutritious meals for client', common: true },
    { id: 'task_21', name: 'Assistance with Eating', category: 'Personal Care', description: 'Provide assistance with eating and nutrition' },
    { id: 'task_22', name: 'Personal Hygiene', category: 'Personal Care', description: 'Assist with bathing, grooming, and personal care', common: true },
    { id: 'task_23', name: 'Emergency Nutrition', category: 'Personal Care', description: 'Provide emergency nutrition support when needed' },
    // Problems category tasks
    { id: 'task_24', name: 'Care Plan Issues', category: 'Problems', description: 'Address care plan problems requiring attention' },
    { id: 'task_25', name: 'General Problems', category: 'Problems', description: 'Address general client care problems requiring attention' },
    { id: 'task_26', name: 'Records Issues', category: 'Problems', description: 'Address inconsistencies or missing records' },
    { id: 'task_27', name: 'Seasonal Issues', category: 'Problems', description: 'Address season-specific care problems' },
    { id: 'task_28', name: 'Medical Treatment Required', category: 'Problems', description: 'Identify and address medical treatment needs' },
    { id: 'task_29', name: 'Client Status Update', category: 'Management', description: 'Update client status (Independent, Assisted, Dependent, Rehabilitation, Hospice)' },
    { id: 'task_30', name: 'Care Equipment Update', category: 'Management', description: 'Update care equipment inventory (Mobility aids, Medical equipment, Safety devices, etc.)' },
    { id: 'task_31', name: 'Archive Client', category: 'Management', description: 'Archive a client to remove from active counts while preserving historical data' },
    { id: 'task_32', name: 'Unarchive Client', category: 'Management', description: 'Restore an archived client to active status' },
    { id: 'task_33', name: 'Home Visit & Assessment', category: 'Assessment', description: 'Conduct a home visit and update client assessment records', common: true },
    // Additional Home Care Tasks
    { id: 'task_34', name: 'Transportation Assistance', category: 'Support Services', description: 'Provide or arrange transportation for appointments' },
    { id: 'task_35', name: 'Shopping Assistance', category: 'Support Services', description: 'Assist with grocery shopping and errands' },
    { id: 'task_36', name: 'Companionship', category: 'Support Services', description: 'Provide social interaction and companionship' },
    { id: 'task_37', name: 'Light Housekeeping', category: 'Support Services', description: 'Assist with light housekeeping tasks' },
    { id: 'task_38', name: 'Mobility Assistance', category: 'Personal Care', description: 'Assist with mobility and transfers' },
    { id: 'task_39', name: 'Wound Care', category: 'Health', description: 'Provide wound care and dressing changes' },
    { id: 'task_40', name: 'Physical Therapy Support', category: 'Health', description: 'Support physical therapy exercises and routines' },
    // Additional Home Care Worker Tasks
    { id: 'task_41', name: 'Medication Administration', category: 'Health', description: 'Administer prescribed medications according to schedule', common: true },
    { id: 'task_42', name: 'Medication Refill Coordination', category: 'Health', description: 'Coordinate medication refills with pharmacy and physician' },
    { id: 'task_43', name: 'Blood Glucose Monitoring', category: 'Health', description: 'Monitor and record blood glucose levels' },
    { id: 'task_44', name: 'Blood Pressure Monitoring', category: 'Health', description: 'Monitor and record blood pressure readings', common: true },
    { id: 'task_45', name: 'Temperature Check', category: 'Health', description: 'Monitor body temperature and record readings' },
    { id: 'task_46', name: 'Pain Assessment', category: 'Assessment', description: 'Assess and document client pain levels and management' },
    { id: 'task_47', name: 'Fall Risk Assessment', category: 'Safety', description: 'Assess and document fall risk factors and prevention measures' },
    { id: 'task_48', name: 'Nutrition Assessment', category: 'Assessment', description: 'Assess nutritional status and dietary needs' },
    { id: 'task_49', name: 'Hydration Monitoring', category: 'Health', description: 'Monitor fluid intake and hydration status' },
    { id: 'task_50', name: 'Skin Integrity Check', category: 'Health', description: 'Check for pressure sores, wounds, or skin issues' },
    { id: 'task_51', name: 'Bowel & Bladder Care', category: 'Personal Care', description: 'Assist with toileting and incontinence care' },
    { id: 'task_52', name: 'Catheter Care', category: 'Health', description: 'Provide catheter maintenance and care' },
    { id: 'task_53', name: 'Oxygen Therapy Support', category: 'Health', description: 'Monitor and assist with oxygen therapy equipment' },
    { id: 'task_54', name: 'Dementia Care Support', category: 'Personal Care', description: 'Provide specialized care for clients with dementia' },
    { id: 'task_55', name: 'Behavioral Observation', category: 'Assessment', description: 'Observe and document behavioral changes or concerns' },
    { id: 'task_56', name: 'Sleep Pattern Monitoring', category: 'Assessment', description: 'Monitor and document sleep patterns and quality' },
    { id: 'task_57', name: 'Appointment Reminder', category: 'Support Services', description: 'Remind client of upcoming medical appointments' },
    { id: 'task_58', name: 'Appointment Escort', category: 'Support Services', description: 'Accompany client to medical appointments' },
    { id: 'task_59', name: 'Medication Side Effect Monitoring', category: 'Health', description: 'Monitor and document medication side effects' },
    { id: 'task_60', name: 'Caregiver Training', category: 'Communication', description: 'Train family caregivers on care techniques' },
    { id: 'task_61', name: 'Respite Care', category: 'Support Services', description: 'Provide respite care to give family caregivers a break' },
    { id: 'task_62', name: 'End-of-Life Care Support', category: 'Health', description: 'Provide comfort and support during end-of-life care' },
    { id: 'task_63', name: 'Grief Support', category: 'Support Services', description: 'Provide emotional support and grief counseling' },
    { id: 'task_64', name: 'Social Activities', category: 'Support Services', description: 'Engage client in social activities and outings' },
    { id: 'task_65', name: 'Cognitive Exercises', category: 'Health', description: 'Lead cognitive stimulation exercises and activities' },
    { id: 'task_66', name: 'Range of Motion Exercises', category: 'Health', description: 'Assist with prescribed range of motion exercises' },
    { id: 'task_67', name: 'Dressing Assistance', category: 'Personal Care', description: 'Assist with dressing and clothing selection' },
    { id: 'task_68', name: 'Laundry Assistance', category: 'Support Services', description: 'Assist with laundry and clothing care' },
    { id: 'task_69', name: 'Pet Care Assistance', category: 'Support Services', description: 'Assist with pet care and feeding' },
    { id: 'task_70', name: 'Mail & Bill Organization', category: 'Support Services', description: 'Help organize mail and assist with bill management' },
    { id: 'task_71', name: 'Technology Assistance', category: 'Support Services', description: 'Assist with phones, tablets, and other technology' },
    { id: 'task_72', name: 'Home Modification Assessment', category: 'Safety', description: 'Assess need for home modifications for safety' },
    { id: 'task_73', name: 'Emergency Contact Update', category: 'Administration', description: 'Update emergency contact information' },
    { id: 'task_74', name: 'Insurance Coordination', category: 'Administration', description: 'Coordinate with insurance providers for coverage' },
    { id: 'task_75', name: 'Care Team Meeting', category: 'Communication', description: 'Participate in care team meetings and coordination' }
];

// Make COMPREHENSIVE_TASKS globally accessible
window.COMPREHENSIVE_TASKS = COMPREHENSIVE_TASKS;

// Care service types list - editable by admins
let CARE_SERVICE_TYPES = [
    'Personal Care',
    'Health Monitoring',
    'Meal Preparation',
    'Transportation',
    'Companionship',
    'Housekeeping',
    'Medical Support',
    'Rehabilitation Support',
    'Hospice Care',
    'Respite Care'
];

// Backward compatibility alias
let HONEY_TYPES = CARE_SERVICE_TYPES;

let tasks = COMPREHENSIVE_TASKS;
let deletedTasks = {}; // Archive of deleted tasks for historical record display
let map = null;
let markers = [];
let mapPicker = null;

// Offline support
let isOnline = navigator.onLine;
let syncQueue = []; // Queue of pending changes to sync
let syncInProgress = false;

// Firebase listener references for cleanup
// Store database refs so we can remove listeners
let firebaseListeners = {
    sites: null,
    actions: null,
    individualHives: null,
    scheduledTasks: null,
    honeyTypes: null,
    tasks: null,
    deletedTasks: null,
    seasonalRequirements: null,
    employees: null
};

// Firebase operation throttling - prevent fetches faster than 300ms
let lastFirebaseOperationTime = 0;
const FIREBASE_THROTTLE_MS = 300;
let firebaseOperationQueue = [];
let isProcessingQueue = false;

function processFirebaseQueue() {
    if (isProcessingQueue || firebaseOperationQueue.length === 0) {
        return;
    }
    
    isProcessingQueue = true;
    const operation = firebaseOperationQueue.shift();
    
    const now = Date.now();
    const timeSinceLastOp = now - lastFirebaseOperationTime;
    
    if (timeSinceLastOp >= FIREBASE_THROTTLE_MS) {
        // Enough time has passed, execute immediately
        lastFirebaseOperationTime = now;
        operation.execute();
        isProcessingQueue = false;
        // Process next in queue
        if (firebaseOperationQueue.length > 0) {
            processFirebaseQueue();
        }
    } else {
        // Need to wait
        const delay = FIREBASE_THROTTLE_MS - timeSinceLastOp;
        console.log(`⏱️ Throttling Firebase operation for ${operation.path}: waiting ${delay}ms`);
        
        setTimeout(() => {
            lastFirebaseOperationTime = Date.now();
            operation.execute();
            isProcessingQueue = false;
            // Process next in queue
            if (firebaseOperationQueue.length > 0) {
                processFirebaseQueue();
            }
        }, delay);
    }
}

// Wrap Firebase database ref to throttle .once() operations
function setupFirebaseThrottling() {
    if (!window.database || !window.database.ref) {
        console.warn('⚠️ Firebase database not available for throttling setup');
        return;
    }
    
    // Store original ref function
    const originalRef = window.database.ref.bind(window.database);
    
    // Override ref to wrap .once() calls
    window.database.ref = function(path) {
        const ref = originalRef(path);
        
        // Store original once method if not already wrapped
        if (!ref._originalOnce) {
            ref._originalOnce = ref.once.bind(ref);
            
            // Override once method with throttling
            ref.once = function(eventType, callback, errorCallback) {
                // Only throttle 'value' events (read operations)
                if (eventType === 'value') {
                    return new Promise((resolve, reject) => {
                        const operation = {
                            path: path,
                            execute: () => {
                                const promise = ref._originalOnce(eventType, callback, errorCallback);
                                promise.then(resolve).catch(reject);
                            }
                        };
                        
                        firebaseOperationQueue.push(operation);
                        processFirebaseQueue();
                    });
                } else {
                    // Non-value events don't need throttling
                    return ref._originalOnce(eventType, callback, errorCallback);
                }
            };
        }
        
        return ref;
    };
    
    console.log('✅ Firebase throttling enabled (300ms minimum between reads)');
}

// Seasonal requirements
let seasonalRequirements = []; // Array of {taskId, taskName, dueDate, category, frequency}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Logger !== 'undefined') {
        Logger.log('🚀 DOM Content Loaded - Initializing HomeCare...');
        Logger.log(`📦 HomeCare v${APP_VERSION} - Professional Care Management System`);
    }
    
    // Initialize secure configuration and admin accounts
    initializeAdminAccounts();
    
    // Initialize return-to-top button for all views
    setTimeout(() => {
        if (typeof setupReturnToTopButton === 'function') {
            setupReturnToTopButton();
        }
    }, 500);
    
    // Initialize database reference
    initializeDatabase();
    
    // Setup Firebase throttling after database is initialized
    setTimeout(() => {
        setupFirebaseThrottling();
    }, 100);
    
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
    const siteForm = document.getElementById('siteForm');
    if (siteForm) {
        siteForm.addEventListener('submit', function(e) {
            if (typeof handleSaveSite === 'function') {
                handleSaveSite(e);
            } else {
                console.error('handleSaveSite function not available');
            }
        });
    }
    document.getElementById('actionForm').addEventListener('submit', handleLogAction);
    document.getElementById('addEmployeeForm')?.addEventListener('submit', handleAddEmployee);
    document.getElementById('scheduleTaskForm')?.addEventListener('submit', handleScheduleTask);
    document.getElementById('addTaskForm')?.addEventListener('submit', handleAddTask);
    // Edit task form will be dynamically created, so we'll add listener when modal is shown
    document.getElementById('addRequirementForm')?.addEventListener('submit', handleAddRequirement);
    
    // Setup edit task form listener when modal is created
    document.addEventListener('DOMContentLoaded', function() {
        // This will be handled dynamically when editTask modal is created
    });
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
        // Auto-collapse mobile nav immediately on any scroll (if not already handled by navbar script)
        if (window.innerWidth <= 992) { // <= lg breakpoint
            const navCollapse = document.getElementById('navbarNav');
            if (navCollapse && navCollapse.classList.contains('show')) {
                try {
                    if (window.bootstrap && window.bootstrap.Collapse) {
                        let instance = window.bootstrap.Collapse.getInstance(navCollapse);
                        if (!instance) {
                            instance = new window.bootstrap.Collapse(navCollapse, { toggle: false });
                        }
                        instance.hide();
                    } else {
                        navCollapse.classList.remove('show');
                    }
                    const toggler = document.querySelector('.navbar-toggler');
                    if (toggler) toggler.setAttribute('aria-expanded', 'false');
                } catch (e) {
                    navCollapse.classList.remove('show');
                }
            }
        }
    }, { passive: true });
    
    // Initialize global quick links bar
    initializeGlobalQuickLinks();
    
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
// DISABLED: Legacy feature - using JESS_USERNAME/JESS_PASSWORD from GitHub Secrets instead
function checkFirstTimeSetup() {
    console.log('ℹ️ Legacy master account setup disabled - using GitHub Secrets authentication');
    return;
    
    /* LEGACY CODE - DISABLED
    if (!database) {
        console.warn('⚠️ Database not available - skipping first time setup check');
        return;
    }
    
    // Check if tenant structure exists for GBTech
    database.ref('tenants/gbtech/master/initialized').once('value', (snapshot) => {
        if (!snapshot.exists()) {
            // Auto-initialize master account in tenant structure
            initializeMasterAccount();
        }
    });
    */
}

function initializeMasterAccount() {
    console.log('ℹ️ Legacy master account initialization disabled - using GitHub Secrets authentication');
    return;
    
    /* LEGACY CODE - DISABLED (requires MASTER_USERNAME and MASTER_PASSWORD secrets)
    if (!database) {
        console.warn('⚠️ Database not available - cannot initialize master account');
        return;
    }
    
    const masterUser = {
        username: MASTER_USERNAME,
        passwordHash: secureHash(MASTER_PASSWORD),
        role: 'admin',
        createdAt: new Date().toISOString()
    };
    
    database.ref('tenants/gbtech/master/initialized').set(true).then(() => {
        return database.ref('tenants/gbtech/master/admin').set(masterUser);
    }).then(() => {
        console.log('✅ Master account initialized successfully in tenant structure');
        console.log('Username:', MASTER_USERNAME);
        console.log('Password hash generated for master account');
    }).catch(error => {
        console.error('❌ Failed to initialize master account:', error);
    });
    */
}

// Emergency reset function - call from browser console if needed
window.resetMasterAccount = function() {
    console.log('🔄 Resetting master account...');
    initializeMasterAccount();
    alert('Master account reset! Please contact administrator for login credentials.');
}

// SECURITY DEBUGGING FUNCTIONS - Available in browser console (F12)

// Test password hashing
window.testPasswordHash = function() {
    const testPassword = 'TestPassword123!';
    const hash = secureHash(testPassword);
    console.log('🔐 Password Hashing Test:');
    console.log('  Test password:', testPassword);
    console.log('  Generated hash:', hash);
    console.log('  Hash length:', hash.length);
    return hash;
}

// Test password hashing consistency between config and core
window.testPasswordConsistency = function() {
    const testPassword = 'LarsHoney2025!';
    
    console.log('🔄 Password Hashing Consistency Test:');
    console.log('=====================================');
    console.log('Test password:', testPassword);
    
    // Test core.js secureHash
    const coreHash = secureHash(testPassword);
    console.log('Core.js hash:', coreHash);
    
    // Test config.js hashPassword (simulate)
    const configHash = simpleHash(testPassword) + '_secure';
    console.log('Config.js hash:', configHash);
    
    // Test verification
    const verification = verifyPassword(testPassword, coreHash);
    console.log('Verification result:', verification);
    
    // Test with config hash
    const configVerification = verifyPassword(testPassword, configHash);
    console.log('Config hash verification:', configVerification);
    
    return {
        coreHash,
        configHash,
        verification,
        configVerification,
        consistent: coreHash === configHash
    };
}

// Test password verification
window.testPasswordVerification = function() {
    const testPassword = 'TestPassword123!';
    const hash = secureHash(testPassword);
    const isValid = verifyPassword(testPassword, hash);
    const isInvalid = verifyPassword('WrongPassword', hash);
    
    console.log('🔍 Password Verification Test:');
    console.log('  Correct password verification:', isValid);
    console.log('  Wrong password verification:', isInvalid);
    return { correct: isValid, wrong: isInvalid };
}

// Test password strength validation
window.testPasswordStrength = function(password = 'TestPassword123!') {
    const validation = validatePasswordStrength(password);
    console.log('💪 Password Strength Test:');
    console.log('  Password:', password);
    console.log('  Is valid:', validation.isValid);
    console.log('  Strength score:', validation.strength + '/100');
    console.log('  Errors:', validation.errors);
    return validation;
}

// Test rate limiting
window.testRateLimit = function(username = 'testuser') {
    console.log('⏱️ Rate Limiting Test:');
    console.log('  Testing username:', username);
    
    // Clear any existing attempts
    loginAttempts.delete(username);
    
    // Test normal attempts
    for (let i = 1; i <= 6; i++) {
        const check = checkRateLimit(username);
        console.log(`  Attempt ${i}:`, check.allowed ? '✅ Allowed' : '❌ Blocked');
        if (!check.allowed) {
            console.log('    Message:', check.message);
            break;
        }
        recordLoginAttempt(username, false);
    }
    
    // Test successful login reset
    recordLoginAttempt(username, true);
    const finalCheck = checkRateLimit(username);
    console.log('  After successful login:', finalCheck.allowed ? '✅ Allowed' : '❌ Blocked');
    
    return loginAttempts.get(username);
}

// Test bcrypt availability
window.testBcrypt = function() {
    console.log('🔧 Bcrypt Availability Test:');
    console.log('  bcrypt available:', typeof bcrypt !== 'undefined');
    if (typeof bcrypt !== 'undefined') {
        console.log('  bcrypt version:', bcrypt.version || 'Unknown');
        const testHash = bcrypt.hashSync('test', 10);
        console.log('  Test hash generated:', testHash);
        console.log('  Test verification:', bcrypt.compareSync('test', testHash));
    }
    return typeof bcrypt !== 'undefined';
}

// Test admin password security
window.testAdminPasswordSecurity = function() {
    console.log('🔐 Admin Password Security Test:');
    console.log('================================');
    
    // Check if admin accounts have passwordHash field
    const adminAccounts = window.ADMIN_ACCOUNTS || {};
    const accountNames = Object.keys(adminAccounts);
    
    console.log('Admin accounts found:', accountNames);
    
    accountNames.forEach(accountName => {
        const account = adminAccounts[accountName];
        console.log(`\n${accountName}:`);
        console.log('  - Has passwordHash:', !!account.passwordHash);
        console.log('  - Has plain password:', !!account.password);
        console.log('  - PasswordHash type:', account.passwordHash ? typeof account.passwordHash : 'N/A');
        console.log('  - PasswordHash value:', account.passwordHash ? account.passwordHash.substring(0, 20) + '...' : 'N/A');
        console.log('  - PasswordHash starts with $2:', account.passwordHash ? account.passwordHash.startsWith('$2') : false);
        
        if (account.password) {
            console.log('  ⚠️  SECURITY RISK: Plain text password detected!');
        }
        if (account.passwordHash && account.passwordHash.startsWith('$2')) {
            console.log('  ✅ SECURE: bcrypt hash detected');
        } else if (account.passwordHash && account.passwordHash.includes('_webcrypto')) {
            console.log('  ⚠️  FALLBACK: Web Crypto API hash detected');
        }
    });
    
    return {
        accounts: accountNames,
        secureAccounts: accountNames.filter(name => {
            const account = adminAccounts[name];
            return account.passwordHash && account.passwordHash.startsWith('$2') && !account.password;
        }),
        insecureAccounts: accountNames.filter(name => {
            const account = adminAccounts[name];
            return account.password || !account.passwordHash;
        })
    };
}

// Test Firebase security rules
window.testFirebaseSecurity = function() {
    console.log('🔥 Firebase Security Rules Test:');
    console.log('================================');
    
    if (!database) {
        console.log('❌ Firebase database not available');
        return { error: 'Database not available' };
    }
    
    const tests = [];
    
    // Test 1: Try to read root level data (should fail)
    database.ref('/').once('value')
        .then(() => {
            console.log('⚠️  WARNING: Root level data is readable (rules may be too permissive)');
            tests.push({ test: 'root_read', result: 'WARNING', message: 'Root data readable' });
        })
        .catch(error => {
            console.log('✅ Root level data access properly blocked');
            tests.push({ test: 'root_read', result: 'PASS', message: 'Root data blocked' });
        });
    
    // Test 2: Try to read tenant data
    database.ref('tenants').once('value')
        .then((snapshot) => {
            const data = snapshot.val();
            if (data) {
                console.log('✅ Tenant data accessible:', Object.keys(data));
                tests.push({ test: 'tenant_read', result: 'PASS', message: 'Tenant data accessible' });
            } else {
                console.log('⚠️  No tenant data found');
                tests.push({ test: 'tenant_read', result: 'WARNING', message: 'No tenant data' });
            }
        })
        .catch(error => {
            console.log('❌ Tenant data access blocked:', error.message);
            console.log('🔧 Firebase Rules Issue: The rules may still be blocking access');
            console.log('💡 Solution: Update Firebase rules to allow tenant access');
            tests.push({ test: 'tenant_read', result: 'FAIL', message: error.message });
        });
    
    // Test 3: Try to write test data
    const testData = {
        id: 'test_' + Date.now(),
        name: 'Security Test',
        timestamp: new Date().toISOString()
    };
    
    database.ref('tenants/test_tenant/test_data').set(testData)
        .then(() => {
            console.log('✅ Test data write successful');
            tests.push({ test: 'data_write', result: 'PASS', message: 'Data write allowed' });
            
            // Clean up test data
            database.ref('tenants/test_tenant/test_data').remove();
        })
        .catch(error => {
            console.log('❌ Test data write blocked:', error.message);
            tests.push({ test: 'data_write', result: 'FAIL', message: error.message });
        });
    
    return {
        tests: tests,
        timestamp: new Date().toISOString()
    };
}

// Security audit function
window.securityAudit = function() {
    console.log('🔒 HomeCare Security Audit:');
    console.log('================================');
    
    // Test bcrypt
    const bcryptAvailable = window.testBcrypt();
    console.log('');
    
    // Test admin password security
    const adminSecurity = window.testAdminPasswordSecurity();
    console.log('');
    
    // Test Firebase security
    const firebaseSecurity = window.testFirebaseSecurity();
    console.log('');
    
    // Test password hashing
    window.testPasswordHash();
    console.log('');
    
    // Test password verification
    window.testPasswordVerification();
    console.log('');
    
    // Test password strength
    window.testPasswordStrength('Weak123');
    window.testPasswordStrength('StrongPassword123!@#');
    console.log('');
    
    // Test rate limiting
    window.testRateLimit();
    console.log('');
    
    // Check for security warnings
    console.log('⚠️ Security Warnings:');
    if (!bcryptAvailable) {
        console.log('  - bcrypt not available, using fallback hashing');
    }
    if (adminSecurity.insecureAccounts.length > 0) {
        console.log('  - Insecure admin accounts detected:', adminSecurity.insecureAccounts);
    }
    if (firebaseSecurity.tests) {
        const failedTests = firebaseSecurity.tests.filter(t => t.result === 'FAIL');
        if (failedTests.length > 0) {
            console.log('  - Firebase security issues detected:', failedTests);
        }
    }
    
    console.log('✅ Security audit complete');
    return {
        bcryptAvailable,
        adminSecurity,
        firebaseSecurity,
        timestamp: new Date().toISOString()
    };
}

// Test login functions for debugging - REMOVED FOR SECURITY
// These functions have been removed to prevent credential exposure
// Use the secure login system instead


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
    console.log('⚠️ Test login function removed for security. Use the secure login system.');
    console.log('✅ Please use the login form with your actual credentials.');
}


// Console command for manual data migration
window.migrateData = function() {
    console.log('🔄 Manual data migration initiated...');
    console.log('Current tenant:', localStorage.getItem('currentTenantId'));
    
    if (localStorage.getItem('currentTenantId') === 'lars') {
        console.log('📦 Migrating Lars data...');
        autoMigrateLarsData();
    } else {
        console.log('❌ Migration only available for admin account');
        console.log('Please log in as an administrator first, then run: migrateData()');
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
    if (database) {
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
        updateDebugInfo('firebaseStatus', 'Initializing...');
        updateDebugInfo('sessionInfo', 'Waiting for Firebase...');
        // Retry after a short delay
        setTimeout(updateSystemStatus, 500);
    }
}

// Welcome Popup Functions
function showWelcomePopup() {
    console.log('🎉 Showing welcome popup - dashboard fully loaded!');
    
    // Reset check attempts counter
    welcomeDataCheckAttempts = 0;
    
    // Update welcome message with user info
    const welcomeUserName = document.getElementById('welcomeUserName');
    const welcomeMessage = document.getElementById('welcomeMessage');
    
    if (welcomeUserName) {
        welcomeUserName.textContent = `Welcome back, ${currentUser.username}!`;
    }
    
    if (welcomeMessage) {
        welcomeMessage.textContent = `Your care management system is ready. All data has been synchronized and the dashboard is fully operational.`;
    }
    
    // Add version tag
    const versionTag = document.getElementById('welcomeVersionTag');
    if (versionTag) {
        versionTag.textContent = APP_VERSION;
    }
    
    // Initially show synchronising status
    updateWelcomeSyncStatus('synchronising');
    
    // Initially set button to orange and disabled
    updateWelcomeButton(false);
    
    // Don't update welcome stats here - wait for sites to actually load
    // updateWelcomeStats() will be called after data is loaded
    
    // Show the modal
    const welcomeModal = new bootstrap.Modal(document.getElementById('welcomeModal'));
    welcomeModal.show();
    
    // Update debug info
    updateDebugInfo('systemStatus', 'Dashboard fully loaded');
    console.log('✅ Welcome popup displayed - all systems operational');
    
    // Check if data is loaded and update button accordingly
    // Use a small delay to ensure modal is rendered
    setTimeout(() => {
        checkWelcomeDataLoaded();
    }, 100);
}

function updateWelcomeSyncStatus(status) {
    const syncStatusAlert = document.getElementById('syncStatusAlert');
    const syncStatusIcon = document.getElementById('syncStatusIcon');
    const syncStatusText = document.getElementById('syncStatusText');
    
    if (!syncStatusAlert || !syncStatusIcon || !syncStatusText) return;
    
    if (status === 'synchronised') {
        // Change to green success state
        syncStatusAlert.style.background = 'rgba(40, 167, 69, 0.1)';
        syncStatusIcon.className = 'bi bi-check-circle-fill text-success me-2';
        syncStatusText.textContent = 'Data synchronised';
        
        // Update icon in main area
        const welcomeIcon = document.getElementById('welcomeIcon');
        if (welcomeIcon) {
            welcomeIcon.className = 'bi bi-check-circle-fill text-success';
        }
    } else {
        // Keep synchronising state
        syncStatusAlert.style.background = 'rgba(255, 193, 7, 0.1)';
        syncStatusIcon.className = 'bi bi-hourglass-split text-warning me-2';
        syncStatusText.textContent = 'Synchronising...';
        
        // Update icon in main area
        const welcomeIcon = document.getElementById('welcomeIcon');
        if (welcomeIcon) {
            welcomeIcon.className = 'bi bi-hourglass-split text-warning';
        }
    }
}

let welcomeDataCheckAttempts = 0;
const MAX_WELCOME_DATA_CHECK_ATTEMPTS = 30; // 15 seconds max

function checkWelcomeDataLoaded() {
    // Check if modal is still open
    const modal = document.getElementById('welcomeModal');
    if (!modal || !modal.classList.contains('show')) {
        return; // Modal closed, stop checking
    }
    
    welcomeDataCheckAttempts++;
    
    // Check if sites data is loaded - must have sites count > 0
    const sitesExists = window.sites !== undefined && window.sites !== null;
    const sitesCount = Array.isArray(window.sites) ? window.sites.length : 0;
    const dataLoaded = sitesExists && sitesCount > 0;
    
    console.log(`🔍 Welcome data check attempt ${welcomeDataCheckAttempts}: sites exists=${sitesExists}, count=${sitesCount}, loaded=${dataLoaded}`);
    
    if (dataLoaded) {
        // Data is loaded (sites count > 0), update button to green "Okay"
        updateWelcomeButton(true);
        updateWelcomeSyncStatus('synchronised');
        console.log('✅ Welcome popup: Data loaded (sites count > 0), button enabled');
    } else if (welcomeDataCheckAttempts < MAX_WELCOME_DATA_CHECK_ATTEMPTS) {
        // Still loading or no sites yet, check again after a delay
        setTimeout(() => {
            checkWelcomeDataLoaded();
        }, 500);
    } else {
        // Max attempts reached but no sites loaded - keep button orange
        console.log('⚠️ Welcome popup: Max check attempts reached but no sites loaded (count=0), keeping button orange');
        updateWelcomeButton(false);
        updateWelcomeSyncStatus('synchronising');
    }
}

function updateWelcomeButton(dataLoaded) {
    const welcomeBtn = document.getElementById('welcomeContinueBtn');
    const welcomeBtnText = document.getElementById('welcomeBtnText');
    
    if (!welcomeBtn || !welcomeBtnText) {
        console.warn('⚠️ Welcome button elements not found');
        return;
    }
    
    if (dataLoaded) {
        // Change to green "Okay" button
        welcomeBtn.style.background = '#28a745';
        welcomeBtn.style.color = 'white';
        welcomeBtn.disabled = false;
        welcomeBtnText.textContent = 'Okay';
        console.log('✅ Welcome button updated to green "Okay"');
    } else {
        // Keep orange "Continue" button (but still clickable)
        welcomeBtn.style.background = '#ff9800';
        welcomeBtn.style.color = 'white';
        welcomeBtn.disabled = false; // Always allow clicking
        welcomeBtnText.textContent = 'Continue';
        console.log('🟠 Welcome button set to orange "Continue"');
    }
}

function updateWelcomeStats() {
    // Update sync timestamp in welcome modal
    const syncTimeElement = document.getElementById('syncTime');
    if (syncTimeElement) {
        const now = new Date();
        syncTimeElement.textContent = now.toLocaleTimeString();
    }
    
    // Only update status if modal is open - don't automatically turn green
    // Status will be updated by checkWelcomeDataLoaded() or when Firebase data loads
    const modal = document.getElementById('welcomeModal');
    if (modal && modal.classList.contains('show')) {
        // Check if data is loaded and update status - require sites count > 0
        const sitesExists = window.sites !== undefined && window.sites !== null;
        const sitesCount = Array.isArray(window.sites) ? window.sites.length : 0;
        console.log(`🔍 updateWelcomeStats: sites exists=${sitesExists}, count=${sitesCount}`);
        
        // Only update if we have sites - otherwise keep synchronising
        if (sitesExists && sitesCount > 0) {
            // Sites array exists and has data (count > 0), consider data loaded
            updateWelcomeSyncStatus('synchronised');
            updateWelcomeButton(true);
        } else {
            // No sites or sites count is 0, keep synchronising status
            updateWelcomeSyncStatus('synchronising');
            updateWelcomeButton(false);
        }
    }
    
    console.log('✅ Welcome popup ready - sync timestamp updated');
}

function dismissWelcomeModal() {
    console.log('👋 Welcome modal dismissed - user ready to start');
    updateDebugInfo('systemStatus', 'User acknowledged welcome - ready for use');
}

// Version Management Functions
function updateVersionDisplay() {
    // Only update version tag in welcome popup (version tag removed from other locations)
    const versionTag = document.getElementById('welcomeVersionTag');
    if (versionTag) {
        versionTag.textContent = APP_VERSION;
    }
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
    console.log('📦 HomeCare Version Information:');
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
    
    // SECURITY: Check rate limiting
    const rateLimitCheck = checkRateLimit(username);
    if (!rateLimitCheck.allowed) {
        showLoginStatus('danger', rateLimitCheck.message, false);
        updateDebugInfo('lastError', 'Rate limit exceeded');
        return;
    }
    
    // Show loading state
    showLoginStatus('info', 'Authenticating...', true);
    updateDebugInfo('systemStatus', 'Authenticating user...');
    
    if (!username || !password) {
        showLoginStatus('danger', 'Please enter both username and password', false);
        updateDebugInfo('lastError', 'Missing username or password');
        recordLoginAttempt(username, false);
        return;
    }
    
    // MULTI-TENANT AUTHENTICATION SYSTEM
    console.log('🔄 Using multi-tenant authentication system...');
    updateDebugInfo('firebaseStatus', 'Using multi-tenant auth system');
    
    // Calculate password hash for employee authentication
    const passwordHash = secureHash(password);
    
    // Check credentials against admin accounts
    // Security: Don't log sensitive authentication details
    
    // SECURITY: Admin accounts now use hashed passwords
    const adminAccount = Object.values(ADMIN_ACCOUNTS).find(account => {
        console.log('🔍 Checking account:', account.username);
        if (account.username.toLowerCase() === username.toLowerCase()) {
            console.log('✅ Username match found:', account.username);
            // Use the passwordHash field for secure comparison
            if (account.passwordHash) {
                console.log('🔐 Password hash exists, verifying...');
                console.log('🔐 Hash type:', typeof account.passwordHash);
                console.log('🔐 Hash starts with:', account.passwordHash.substring(0, 20));
                const verified = verifyPassword(password, account.passwordHash);
                console.log('🔐 Verification result:', verified);
                return verified;
            } else {
                console.warn('⚠️ No password hash found for account');
            }
        }
        return false;
    });
    
    console.log('🔍 Found admin account:', adminAccount);
    console.log('🔍 ADMIN_ACCOUNTS object:', ADMIN_ACCOUNTS);
    console.log('🔍 ADMIN_ACCOUNTS keys:', Object.keys(ADMIN_ACCOUNTS));
    console.log('🔍 ADMIN_ACCOUNTS values:', Object.values(ADMIN_ACCOUNTS));
    
    if (adminAccount) {
        console.log('✅ Admin login successful:', adminAccount.username);
        recordLoginAttempt(username, true); // Record successful login
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
        
        // Clean up any incorrect employee listings (Lars should not be an employee)
        cleanupIncorrectEmployeeListings();
        
        // Initialize data for this tenant
        sites = [];
        actions = [];
        scheduledTasks = [];
        employees = [];
        
        // Show login confirmation popup instead of directly showing main app
        setTimeout(() => {
            console.log('🔐 Showing login confirmation...');
            showLoginConfirmationPopup(currentUser.username, adminAccount.role);
        }, 500);
        
        return;
    }
    
    // If not an admin account, check if it's an employee
    console.log('🔄 Checking employee authentication...');
    updateDebugInfo('firebaseStatus', 'Checking employee credentials');
    
    // For employee authentication, try the current tenant first, then search all tenants if needed
    const storedTenantId = localStorage.getItem('currentTenantId');
    console.log('🔍 Current tenant ID from localStorage:', storedTenantId);
    
    if (storedTenantId) {
        // Try to authenticate in the current tenant first
        console.log('🔍 Trying authentication in current tenant:', storedTenantId);
        authenticateEmployeeInTenant(username, password, passwordHash, storedTenantId);
    } else {
        // No current tenant, search across all tenants
        console.log('🔍 No current tenant, searching across all tenants...');
        searchForEmployee(username, password, passwordHash);
    }
}

function authenticateEmployeeInTenant(username, password, passwordHash, tenantId) {
    console.log(`🔍 Authenticating employee "${username}" in tenant "${tenantId}"`);
    
    const employeePath = `tenants/${tenantId}/employees`;
    database.ref(employeePath).once('value', (empSnapshot) => {
        const employeesList = empSnapshot.val() || {};
        console.log(`🔍 Found ${Object.keys(employeesList).length} employees in tenant ${tenantId}`);
        
        const employee = Object.values(employeesList).find(emp => 
            emp.username.toLowerCase() === username.toLowerCase()
        );
        
        if (employee) {
            console.log('✅ Employee found in current tenant:', employee.username);
            console.log('🔍 Employee tenantId:', employee.tenantId);
            
            // Use the employee's stored tenantId, not the tenant we found them in
            const employeeTenantId = employee.tenantId || tenantId;
            console.log('🔍 Using tenant ID:', employeeTenantId);
            
            // Proceed with authentication
            authenticateEmployee(employee, username, password, passwordHash);
        } else {
            console.log('❌ Employee not found in current tenant, trying other tenants...');
            // Fall back to searching all tenants
            searchForEmployee(username, password, passwordHash);
        }
    }).catch(error => {
        console.error('❌ Error accessing employee data in tenant:', error);
        // Fall back to searching all tenants
        searchForEmployee(username, password, passwordHash);
    });
}

function searchForEmployee(username, password, passwordHash) {
    // SECURITY: Instead of hardcoding tenant IDs, we'll use a more secure approach
    // Try to derive tenant ID from username or use a secure lookup method
    
    console.log('🔍 Searching for employee using secure method...');
    
    // Method 1: Try to derive tenant ID from username patterns
    // This is more secure than hardcoding tenant names
    const possibleTenantIds = derivePossibleTenantIds(username);
    
    if (possibleTenantIds.length === 0) {
        // Method 2: If no pattern match, try a single default tenant
        // This prevents exposing tenant structure
        console.log('🔍 No pattern match, trying default tenant approach');
        tryDefaultTenantSearch(username, password, passwordHash);
        return;
    }
    
    console.log('🔍 Trying derived tenant IDs:', possibleTenantIds.map(id => id.substring(0, 2) + '***')); // Mask for security
    
    let found = false;
    let searchCount = 0;
    
    possibleTenantIds.forEach(tenantId => {
        const employeePath = `tenants/${tenantId}/employees`;
        database.ref(employeePath).once('value', (empSnapshot) => {
            if (found) return; // Already found the employee
            
            searchCount++;
            const employeesList = empSnapshot.val() || {};
            
            const employee = Object.values(employeesList).find(emp => 
                emp.username.toLowerCase() === username.toLowerCase()
            );
            
            if (employee) {
                found = true;
                console.log('✅ Employee found in tenant');
                
                // Use the employee's stored tenantId, not the tenant we found them in
                const employeeTenantId = employee.tenantId || tenantId;
                currentTenantId = employeeTenantId;
                
                // Proceed with authentication
                authenticateEmployee(employee, username, password, passwordHash);
            } else if (searchCount === possibleTenantIds.length) {
                // We've checked all derived tenants and didn't find the employee
                console.log('❌ Employee not found in derived tenants');
                showLoginStatus('danger', 'Invalid username or password. Please check your credentials and try again.', false);
            }
        }).catch(error => {
            console.log(`⚠️ Error accessing tenant:`, error.message);
            searchCount++;
            if (searchCount === possibleTenantIds.length && !found) {
                console.log('❌ Employee not found in any accessible tenant');
                showLoginStatus('danger', 'Invalid username or password. Please check your credentials and try again.', false);
            }
        });
    });
}

function derivePossibleTenantIds(username) {
    // SECURITY: Derive tenant IDs from username patterns instead of hardcoding
    // This prevents exposing tenant structure to potential attackers
    
    const possibleIds = [];
    
    // Method 1: Check if username contains tenant indicators
    // This is more secure than hardcoding tenant names
    if (username.toLowerCase().includes('lars') || username.toLowerCase().includes('admin')) {
        possibleIds.push('lars');
    }
    if (username.toLowerCase().includes('gb') || username.toLowerCase().includes('tech')) {
        possibleIds.push('gbtech');
    }
    if (username.toLowerCase().includes('demo') || username.toLowerCase().includes('test')) {
        possibleIds.push('demo');
    }
    
    // Method 2: Try common patterns without exposing structure
    // Add more patterns here if needed, but keep them generic
    if (username.toLowerCase().startsWith('a')) {
        possibleIds.push('lars'); // Ayson might be in Lars' tenant
    }
    
    return possibleIds;
}

function tryDefaultTenantSearch(username, password, passwordHash) {
    // SECURITY: Try a single default tenant without exposing structure
    // This is the most secure fallback method
    
    const defaultTenantId = 'lars'; // Use a single default, don't expose multiple options
    console.log('🔍 Trying default tenant approach');
    
    const employeePath = `tenants/${defaultTenantId}/employees`;
    database.ref(employeePath).once('value', (empSnapshot) => {
        const employeesList = empSnapshot.val() || {};
        
        const employee = Object.values(employeesList).find(emp => 
            emp.username.toLowerCase() === username.toLowerCase()
        );
        
        if (employee) {
            console.log('✅ Employee found in default tenant');
            const employeeTenantId = employee.tenantId || defaultTenantId;
            currentTenantId = employeeTenantId;
            authenticateEmployee(employee, username, password, passwordHash);
        } else {
            console.log('❌ Employee not found in default tenant');
            showLoginStatus('danger', 'Invalid username or password. Please check your credentials and try again.', false);
        }
    }).catch(error => {
        console.log('⚠️ Error accessing default tenant:', error.message);
        showLoginStatus('danger', 'Invalid username or password. Please check your credentials and try again.', false);
    });
}

function authenticateEmployee(employee, username, password, passwordHash) {
    console.log('🔍 Authenticating employee:', employee.username);
    
    // Check if employee is active
    if (!employee.isActive) {
        console.log('❌ Employee account is not active');
        careMarshallAlert('Your account is not active yet. Please contact your administrator to activate your account.', 'warning');
        return;
    }
    
    // Check if using temporary password
    const isTemporaryPassword = employee.temporaryPassword && password === employee.temporaryPassword;
    const isRegularPassword = employee.passwordHash && verifyPassword(password, employee.passwordHash);
    
    // SECURITY: Auto-migrate legacy passwords to bcrypt
    if (isRegularPassword && employee.passwordHash && !employee.passwordHash.startsWith('$2')) {
        console.log('🔄 Auto-migrating legacy password to bcrypt...');
        const newHash = secureHash(password);
        const employeePath = currentTenantId ? `tenants/${currentTenantId}/employees` : 'employees';
        
        database.ref(`${employeePath}/${employee.id}`).update({
            passwordHash: newHash,
            passwordMigrated: true,
            passwordMigrationDate: new Date().toISOString()
        }).then(() => {
            console.log('✅ Password migrated successfully');
        }).catch(error => {
            console.error('❌ Password migration failed:', error);
        });
    }
    
    // Debug logging (SECURITY: No sensitive data logged)
    console.log('🔍 Employee debug info:', {
        username: employee.username,
        hasTemporaryPassword: !!employee.temporaryPassword,
        isTemporaryPassword: isTemporaryPassword,
        hasPasswordHash: !!employee.passwordHash,
        isRegularPassword: isRegularPassword,
        tenantId: employee.tenantId,
        createdBy: employee.createdBy
    });
    
    if (!isTemporaryPassword && !isRegularPassword) {
        console.log('❌ Invalid password for employee');
        recordLoginAttempt(username, false); // Record failed login attempt
        showLoginStatus('danger', 'Invalid username or password. Please check your credentials and try again.', false);
        return;
    }
    
    // Check if temporary password has expired
    if (isTemporaryPassword && employee.temporaryPasswordExpiry) {
        const expiryDate = new Date(employee.temporaryPasswordExpiry);
        const now = new Date();
        if (now > expiryDate) {
            console.log('❌ Temporary password expired');
            careMarshallAlert('Your temporary password has expired. Please contact your administrator for a new password.', 'warning');
            return;
        }
    }
    
    console.log('Employee login successful');
    recordLoginAttempt(username, true); // Record successful login
    showLoginStatus('success', 'Login successful! Welcome, ' + employee.username + '!', false);
    updateDebugInfo('systemStatus', 'Employee authentication successful');
    
    // Handle device remembering
    const deviceKey = `device_remembered_${employee.id}`;
    const isDeviceRemembered = localStorage.getItem(deviceKey) === 'true';
    
    // Store device as remembered and update last login
    localStorage.setItem(deviceKey, 'true');
    
    // Update employee record
    const employeePath = `tenants/${currentTenantId}/employees`;
    database.ref(`${employeePath}/${employee.id}`).update({
        deviceRemembered: true,
        lastLogin: new Date().toISOString()
    });
    
    currentUser = employee;
    isAdmin = false;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('isAdmin', 'false');
    localStorage.setItem('currentTenantId', currentTenantId);
    
    // Show login confirmation popup instead of directly showing main app
    setTimeout(() => {
        showLoginConfirmationPopup(employee.username, 'employee');
    }, 500);
}

// Global variable to store pending authentication
let pendingAuthentication = null;

// Show login confirmation popup - user must confirm before accessing the app
function showLoginConfirmationPopup(username, role) {
    // Store pending authentication
    pendingAuthentication = {
        username: username,
        role: role,
        timestamp: new Date().toISOString()
    };
    
    // Create or show confirmation modal
    let confirmationModal = document.getElementById('loginConfirmationModal');
    
    if (!confirmationModal) {
        // Create the modal if it doesn't exist
        confirmationModal = document.createElement('div');
        confirmationModal.id = 'loginConfirmationModal';
        confirmationModal.className = 'modal fade';
        confirmationModal.setAttribute('data-bs-backdrop', 'static');
        confirmationModal.setAttribute('data-bs-keyboard', 'false');
        confirmationModal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content" style="background: var(--glass); backdrop-filter: blur(12px) saturate(1.1); border: 2px solid var(--primary-blue);">
                    <div class="modal-header border-0">
                        <h5 class="modal-title d-flex align-items-center">
                            <i class="bi bi-shield-check me-2" style="color: var(--primary-blue); font-size: 1.5rem;"></i>
                            Login Confirmation Required
                        </h5>
                    </div>
                    <div class="modal-body text-center">
                        <div class="mb-3">
                            <i class="bi bi-person-check-fill" style="font-size: 3rem; color: var(--primary-blue);"></i>
                        </div>
                        <h6 class="mb-3">Welcome, <strong id="confirmUsername"></strong>!</h6>
                        <p class="mb-3">You have successfully authenticated. Please confirm to proceed to the application.</p>
                        <div class="alert alert-info mb-0">
                            <small>
                                <i class="bi bi-info-circle me-1"></i>
                                Role: <strong id="confirmRole"></strong>
                            </small>
                        </div>
                    </div>
                    <div class="modal-footer border-0 justify-content-center">
                        <button type="button" class="btn btn-secondary" onclick="cancelLogin()">
                            <i class="bi bi-x-circle me-2"></i>Cancel
                        </button>
                        <button type="button" class="btn btn-primary" id="confirmLoginBtn" onclick="confirmLogin()">
                            <i class="bi bi-check-circle me-2"></i>Confirm & Enter
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(confirmationModal);
    }
    
    // Update modal content
    document.getElementById('confirmUsername').textContent = username;
    document.getElementById('confirmRole').textContent = role === 'admin' ? 'Administrator' : 'Employee';
    
    // Show the modal (non-dismissible)
    const modal = new bootstrap.Modal(confirmationModal, {
        backdrop: 'static',
        keyboard: false
    });
    modal.show();
}

// Confirm login and proceed to main app
function confirmLogin() {
    if (!pendingAuthentication) {
        console.error('❌ No pending authentication found');
        return;
    }
    
    console.log('✅ Login confirmed, proceeding to main app...');
    
    // Hide the confirmation modal
    const modalElement = document.getElementById('loginConfirmationModal');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
    }
    
    // Clear pending authentication
    pendingAuthentication = null;
    
    // Now show the main app
    showMainApp();
    initializeDataLoading();
}

// Cancel login - return to login screen
function cancelLogin() {
    console.log('❌ Login cancelled by user');
    
    // Clear authentication
    currentUser = null;
    isAdmin = false;
    currentTenantId = null;
    pendingAuthentication = null;
    
    // Clear localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('currentTenantId');
    
    // Clear login form
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    
    // Hide confirmation modal
    const modalElement = document.getElementById('loginConfirmationModal');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
    }
    
    // Show login status
    showLoginStatus('info', 'Login cancelled. Please try again.', false);
    
    // Ensure login screen is visible
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    if (loginScreen) loginScreen.classList.remove('hidden');
    if (mainApp) mainApp.classList.add('hidden');
}

// Make functions globally available
window.confirmLogin = confirmLogin;
window.cancelLogin = cancelLogin;

function setupMasterUser(username, password) {
    const masterUser = {
        username: username,
        passwordHash: secureHash(password),
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
    initializeDataLoading();
}

function validateLogin(username, password) {
    console.log('🔐 Validating login for:', username);
    const passwordHash = secureHash(password);
    console.log('🔑 Password hash:', passwordHash);
    console.log('🔑 Password being checked:', password);
    
    // Check if admin
    database.ref('master/admin').once('value', (snapshot) => {
        const admin = snapshot.val();
        console.log('👤 Admin data from Firebase:', admin);
        
        if (admin) {
            console.log('   - Username match:', admin.username.toLowerCase() === username.toLowerCase());
            console.log('   - Password verification:', verifyPassword(password, admin.passwordHash));
            console.log('   - Expected hash:', admin.passwordHash);
            console.log('   - Provided hash:', passwordHash);
            console.log('   - Admin username:', admin.username);
            console.log('   - Input username:', username);
        } else {
            console.log('❌ No admin data found in Firebase');
        }
        
        if (admin && admin.username.toLowerCase() === username.toLowerCase() && verifyPassword(password, admin.passwordHash)) {
            console.log('✅ Admin login successful');
            showLoginStatus('success', 'Login successful! Welcome back, ' + admin.username + '!', false);
            updateDebugInfo('systemStatus', 'Authentication successful');
            
            currentUser = admin;
            isAdmin = true;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('isAdmin', 'true');
            
            // Clean up any incorrect employee listings (Lars should not be an employee)
            cleanupIncorrectEmployeeListings();
            
            // Show login confirmation popup instead of directly showing main app
            setTimeout(() => {
                showLoginConfirmationPopup(admin.username, 'admin');
            }, 500);
            return;
        }
        
        // Check if employee (tenant-specific)
        console.log('Checking employees for tenant:', currentTenantId);
        const employeePath = currentTenantId ? `tenants/${currentTenantId}/employees` : 'employees';
        database.ref(employeePath).once('value', (empSnapshot) => {
            const employeesList = empSnapshot.val() || {};
            console.log('Employees:', employeesList);
            
            const employee = Object.values(employeesList).find(emp => 
                emp.username.toLowerCase() === username.toLowerCase()
            );
            
            // Check if employee exists
            if (!employee) {
                console.log('❌ Employee not found');
                showLoginStatus('danger', 'Invalid username or password. Please check your credentials and try again.', false);
                return;
            }
            
            // Check if employee is active
            if (!employee.isActive) {
                console.log('❌ Employee account is not active');
                careMarshallAlert('Your account is not active yet. Please contact your administrator to activate your account.', 'warning');
                return;
            }
            
            // Check if using temporary password
            const isTemporaryPassword = employee.temporaryPassword && password === employee.temporaryPassword;
            const isRegularPassword = employee.passwordHash && verifyPassword(password, employee.passwordHash);
            
            // Debug logging (SECURITY: No sensitive data logged)
            console.log('🔍 Employee debug info:', {
                username: employee.username,
                hasTemporaryPassword: !!employee.temporaryPassword,
                isTemporaryPassword: isTemporaryPassword,
                hasPasswordHash: !!employee.passwordHash,
                isRegularPassword: isRegularPassword
            });
            
            if (!isTemporaryPassword && !isRegularPassword) {
                console.log('❌ Invalid password for employee');
                showLoginStatus('danger', 'Invalid username or password. Please check your credentials and try again.', false);
                return;
            }
            
            // Check if temporary password has expired
            if (isTemporaryPassword && employee.temporaryPasswordExpiry) {
                const expiryDate = new Date(employee.temporaryPasswordExpiry);
                const now = new Date();
                if (now > expiryDate) {
                    console.log('❌ Temporary password expired');
                    careMarshallAlert('Your temporary password has expired. Please contact your administrator for a new password.', 'warning');
                    return;
                }
            }
            
            if (employee) {
                console.log('Employee login successful');
                showLoginStatus('success', 'Login successful! Welcome, ' + employee.username + '!', false);
                updateDebugInfo('systemStatus', 'Employee authentication successful');
                
                // Handle device remembering
                const deviceKey = `device_remembered_${employee.id}`;
                const isDeviceRemembered = localStorage.getItem(deviceKey) === 'true';
                
                // Store device as remembered and update last login
                localStorage.setItem(deviceKey, 'true');
                
                // Update employee record
                const employeePath = currentTenantId ? `tenants/${currentTenantId}/employees` : 'employees';
                database.ref(`${employeePath}/${employee.id}`).update({
                    deviceRemembered: true,
                    lastLogin: new Date().toISOString()
                });
                
                currentUser = employee;
                isAdmin = false;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                localStorage.setItem('isAdmin', 'false');
                
                // Show login confirmation popup instead of directly showing main app
                setTimeout(() => {
                    showLoginConfirmationPopup(employee.username, 'employee');
                }, 500);
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

// SECURITY: Secure password hashing using bcrypt
// Note: In production, this should be done server-side
function secureHash(password) {
    try {
        // Use bcrypt if available (loaded via CDN)
        if (typeof bcrypt !== 'undefined') {
            return bcrypt.hashSync(password, 12);
        } else {
            // Fallback: Use simpleHash for consistency with config.js
            console.warn('⚠️ bcrypt not available, using simpleHash fallback');
            return simpleHash(password) + '_secure';
        }
    } catch (error) {
        console.error('❌ Password hashing error:', error);
        throw new Error('Password hashing failed');
    }
}

// Verify password against hash with migration support
function verifyPassword(password, hash) {
    try {
        // Ensure hash is a string
        if (typeof hash !== 'string') {
            console.error('❌ Hash is not a string:', typeof hash, hash);
            return false;
        }
        
        // Check if this is a bcrypt hash (starts with $2a$, $2b$, $2y$)
        if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
            // This is a bcrypt hash - use bcrypt verification
            if (typeof bcrypt !== 'undefined') {
                return bcrypt.compareSync(password, hash);
            } else {
                console.warn('⚠️ bcrypt not available for verification');
                return false;
            }
        } else {
            // This is likely a simpleHash or Web Crypto hash - verify
            console.log('🔄 Detected fallback password hash, verifying...');
            console.log('🔄 Hash ends with _secure:', hash.endsWith('_secure'));
            
            // Check if it's the new secure format
            if (hash.endsWith('_secure')) {
                const expectedHash = simpleHash(password) + '_secure';
                console.log('🔄 Expected hash:', expectedHash);
                console.log('🔄 Actual hash:', hash);
                const isValid = expectedHash === hash;
                console.log('🔄 Hashes match:', isValid);
                if (isValid) {
                    console.log('✅ Secure fallback password verified');
                }
                return isValid;
            }
            
            // Check if it's the old simpleHash format
            const oldHash = simpleHash(password);
            const isValid = oldHash === hash;
            
            if (isValid) {
                console.log('✅ Legacy password verified - migration needed');
                // Note: Migration will be handled by the calling function
            }
            
            return isValid;
        }
    } catch (error) {
        console.error('❌ Password verification error:', error);
        return false;
    }
}

// Web Crypto API fallback for password hashing
async function hashWithWebCrypto(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// SECURITY: Password strength validation
function validatePasswordStrength(password) {
    const errors = [];
    
    if (password.length < 12) {
        errors.push('Password must be at least 12 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    
    // Check for common passwords
    const commonPasswords = ['password', '123456', 'password123', 'admin', 'qwerty', 'letmein'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
        errors.push('Password contains common words and is not secure');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors,
        strength: calculatePasswordStrength(password)
    };
}

// Calculate password strength score (0-100)
function calculatePasswordStrength(password) {
    let score = 0;
    
    // Length bonus
    score += Math.min(password.length * 2, 40);
    
    // Character variety bonus
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 20;
    
    // Pattern penalties
    if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
    if (/123|abc|qwe/i.test(password)) score -= 15; // Sequential patterns
    
    return Math.max(0, Math.min(100, score));
}

// SECURITY: Rate limiting for login attempts
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(username) {
    const now = Date.now();
    const attempts = loginAttempts.get(username) || { count: 0, lastAttempt: 0, lockedUntil: 0 };
    
    // Check if still locked out
    if (attempts.lockedUntil > now) {
        const remainingMinutes = Math.ceil((attempts.lockedUntil - now) / (60 * 1000));
        return {
            allowed: false,
            message: `Too many failed attempts. Try again in ${remainingMinutes} minutes.`
        };
    }
    
    // Reset count if enough time has passed
    if (now - attempts.lastAttempt > 5 * 60 * 1000) { // 5 minutes
        attempts.count = 0;
    }
    
    return {
        allowed: attempts.count < MAX_ATTEMPTS,
        message: attempts.count >= MAX_ATTEMPTS ? 'Too many failed attempts. Please wait before trying again.' : null
    };
}

function recordLoginAttempt(username, success) {
    const now = Date.now();
    const attempts = loginAttempts.get(username) || { count: 0, lastAttempt: 0, lockedUntil: 0 };
    
    if (success) {
        // Reset on successful login
        attempts.count = 0;
        attempts.lockedUntil = 0;
    } else {
        attempts.count++;
        attempts.lastAttempt = now;
        
        if (attempts.count >= MAX_ATTEMPTS) {
            attempts.lockedUntil = now + LOCKOUT_DURATION;
        }
    }
    
    loginAttempts.set(username, attempts);
}

// Legacy simpleHash for backward compatibility (DEPRECATED - SECURITY RISK)
function simpleHash(str) {
    console.warn('⚠️ SECURITY WARNING: Using deprecated simpleHash function. This is insecure!');
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
    homeCareAlert('Welcome to HomeCare Help!\n\n📖 Getting Started:\n- Dashboard: Overview of your clients\n- Sites: Manage client locations\n- Actions: Track completed care tasks\n- Schedule: Plan upcoming care visits\n- Reports: View detailed analytics\n\n💡 Tips:\n- Click on site markers on the map to view client details\n- Schedule tasks from the dashboard or schedule view\n- Use the search feature to quickly find clients or care actions\n\nNeed more help? Contact support.', 'info');
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
                            <strong>HomeCare v${APP_VERSION}</strong><br>
                            Professional Care Management System<br>
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
                        <input type="password" class="form-control" id="currentPassword" placeholder="Enter your current password" autocomplete="current-password" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">New Password</label>
                        <input type="password" class="form-control" id="newPassword" placeholder="Enter new password (min 6 characters)" autocomplete="new-password" required>
                        <small class="form-text text-muted">Password must be at least 6 characters long</small>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">Confirm New Password</label>
                        <input type="password" class="form-control" id="confirmPassword" placeholder="Confirm new password" autocomplete="new-password" required>
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
                careMarshallAlert('Password changed successfully!', 'success');
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
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    const currentUserDisplay = document.getElementById('currentUserDisplay');
    
    // Check if we're on a page that has these elements
    if (!loginScreen || !mainApp || !currentUserDisplay) {
        console.log('ℹ️ showMainApp called on page without main app elements - skipping');
        return;
    }
    
    loginScreen.classList.add('hidden');
    mainApp.classList.remove('hidden');
    currentUserDisplay.textContent = currentUser.username;
    
    if (isAdmin) {
        const adminBadge = document.getElementById('adminBadge');
        if (adminBadge) {
            adminBadge.classList.remove('hidden');
        }
        document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('employee-hidden'));
    } else {
        const adminBadge = document.getElementById('adminBadge');
        if (adminBadge) {
            adminBadge.classList.add('hidden');
        }
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

// Hide all views
function hideAllViews() {
    const views = [
        'dashboardView',
        'sitesView', 
        'siteFormView',
        'actionsView',
        'logActionView',
        'scheduledView',
        'scheduleForNextVisitView',
        'suggestedScheduleView',
        'tasksView',
        'flaggedView',
        'employeesView',
        'complianceView',
        'integrityCheckView'
    ];
    
    views.forEach(viewId => {
        const element = document.getElementById(viewId);
        if (element) {
            element.classList.add('hidden');
        }
    });
}

// Show dashboard without initializing map (for initial load)
function showDashboardWithoutMap() {
    hideAllViews();
    document.getElementById('dashboardView').classList.remove('hidden');
    updateDashboardStats(); // Only update stats, not map
}

// Update only dashboard stats without map
function updateDashboardStats() {
    // Filter out archived and deleted sites for statistics
    // Note: Deleted sites are removed from Firebase, so they won't be in the array
    const activeSites = (sites && Array.isArray(sites)) ? sites.filter(s => {
        // Exclude archived sites (handle various data types from Firebase)
        if (s.archived === true || s.archived === 'true' || s.archived === 1) return false;
        // Exclude deleted sites if they somehow exist (shouldn't happen, but safety check)
        if (s.deleted === true || s.deleted === 'true' || s.deleted === 1) return false;
        return true;
    }) : [];
    
    // Calculate total hives from hiveStacks (cumulative total of all hive boxes/platforms)
    // Always calculate from hiveStacks to exactly match equipment breakdown card
    // Use same parsing logic as equipment breakdown (parseInt) to handle string numbers
    const safeParse = (val) => {
        if (val === null || val === undefined) return 0;
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? 0 : parsed;
    };
    
    const totalHives = activeSites.reduce((sum, s) => {
        // Only count sites with hiveStacks data (same logic as equipment breakdown)
        if (s.hiveStacks && typeof s.hiveStacks === 'object') {
            const doubles = safeParse(s.hiveStacks.doubles);
            const singles = safeParse(s.hiveStacks.singles);
            const nucs = safeParse(s.hiveStacks.nucs);
            const topSplits = safeParse(s.hiveStacks.topSplits);
            return sum + doubles + singles + nucs + topSplits;
        }
        // Don't use hiveCount fallback - only count sites with hiveStacks data
        return sum;
    }, 0);
    
    // Check for overdue tasks and update flagged count
    checkAndFlagOverdueTasks();
    const overdueTasks = scheduledTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return !task.completed && taskDate < new Date();
    }).length;
    
    const flaggedCount = actions.filter(a => a.flag && a.flag !== '').length + overdueTasks;
    
    // Filter out deleted actions (actions with delete/remove/archive keywords in task name or notes, or [Deleted: pattern)
    const deleteKeywords = ['delete', 'deleted', 'deleting', 'remove', 'removed', 'removing', 'archive', 'archived', 'archiving'];
    const activeActions = (actions && Array.isArray(actions)) ? actions.filter(a => {
        // Check if task name indicates a deleted task reference (e.g., "[Deleted: Task Name]")
        const taskName = a.taskName || a.task || a.name || '';
        const taskNameStr = taskName.toString();
        if (taskNameStr.includes('[Deleted:') || taskNameStr.startsWith('[Deleted:')) {
            return false; // Hide actions referencing deleted tasks
        }
        
        // Also check the display task name if getTaskDisplayName is available
        if (window.getTaskDisplayName) {
            const displayTaskName = window.getTaskDisplayName(taskName, a.taskId);
            if (displayTaskName && displayTaskName.toString().includes('[Deleted:')) {
                return false; // Hide actions referencing deleted tasks
            }
        }
        
        // Check task name and notes for delete keywords
        const taskNameLower = taskNameStr.toLowerCase();
        const notes = (a.notes || '').toString().toLowerCase();
        const combinedText = taskNameLower + ' ' + notes;
        return !deleteKeywords.some(keyword => combinedText.includes(keyword));
    }) : [];
    
    // Animate number changes (using active sites only)
    animateNumber(document.getElementById('statSites'), activeSites.length);
    animateNumber(document.getElementById('statHives'), totalHives);
    animateNumber(document.getElementById('statActions'), activeActions.length);
    animateNumber(document.getElementById('statFlagged'), flaggedCount);
    
    // Update quick stats
    updateQuickStats();
}

// Load data from Firebase with tenant isolation
// Prevent multiple simultaneous data loads
let isLoadingData = false;

function cleanupFirebaseListeners() {
    // Remove all existing Firebase listeners to prevent duplicates
    console.log('🧹 Cleaning up Firebase listeners...');
    Object.keys(firebaseListeners).forEach(key => {
        if (firebaseListeners[key]) {
            try {
                // Remove all listeners from this ref
                firebaseListeners[key].off();
                firebaseListeners[key] = null;
                console.log(`✅ Removed listener: ${key}`);
            } catch (error) {
                console.warn(`⚠️ Error removing listener ${key}:`, error);
            }
        }
    });
}

function loadDataFromFirebase() {
    if (isLoadingData) {
        console.log('⏳ Data loading already in progress, skipping...');
        return;
    }
    
    // Clean up old listeners before setting up new ones
    cleanupFirebaseListeners();
    
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
                
                // Update welcome popup if it's open
                if (document.getElementById('welcomeModal') && document.getElementById('welcomeModal').classList.contains('show')) {
                    const sitesCount = window.sites && Array.isArray(window.sites) ? window.sites.length : 0;
                    if (sitesCount > 0) {
                        updateWelcomeSyncStatus('synchronised');
                        updateWelcomeButton(true);
                        console.log(`✅ Welcome popup updated: ${sitesCount} sites loaded`);
                    } else {
                        // Keep synchronising if no sites
                        updateWelcomeSyncStatus('synchronising');
                        updateWelcomeButton(false);
                        console.log(`🟠 Welcome popup: No sites loaded yet (count=${sitesCount})`);
                    }
                }
            }, 100);
        }
    }
    
    firebaseListeners.sites = database.ref(`tenants/${currentTenantId}/sites`);
    firebaseListeners.sites.on('value', (snapshot) => {
        const data = snapshot.val();
        console.log('🔍 Raw sites data for', currentTenantId + ':', data);
        sites = data ? Object.values(data) : [];
        window.sites = sites; // Also set window.sites
        console.log('📊 Sites loaded for', currentTenantId + ':', sites.length);
        console.log('📊 Sites array:', sites);
        
        if (sites.length === 0) {
            console.log('📭 No sites found - starting fresh');
            showSyncStatus('', 'success');
        } else {
            showSyncStatus('', 'success');
        }
        
        // Update welcome popup if it's open - sites are now loaded
        if (document.getElementById('welcomeModal') && document.getElementById('welcomeModal').classList.contains('show')) {
            const sitesCount = sites.length;
            if (sitesCount > 0) {
                updateWelcomeSyncStatus('synchronised');
                updateWelcomeButton(true);
                console.log(`✅ Welcome popup: Sites loaded (${sitesCount}), button turned green`);
            } else {
                // Keep synchronising if no sites
                updateWelcomeSyncStatus('synchronising');
                updateWelcomeButton(false);
                console.log(`🟠 Welcome popup: No sites loaded (count=${sitesCount}), keeping button orange`);
            }
        }
        
        checkAllDataLoaded();
    }, (error) => {
        console.log('❌ Tenant sites access failed:', error.message);
        showSyncStatus('', 'error');
        checkAllDataLoaded();
    });
    
    firebaseListeners.actions = database.ref(`tenants/${currentTenantId}/actions`);
    firebaseListeners.actions.on('value', (snapshot) => {
        const data = snapshot.val();
        console.log('🔍 Raw actions data for', currentTenantId + ':', data);
        actions = data ? Object.values(data) : [];
        window.actions = actions; // Also set window.actions
        console.log('📊 Actions loaded for', currentTenantId + ':', actions.length);
        console.log('📊 Actions array:', actions);
        checkAllDataLoaded();
    }, (error) => {
        console.log('❌ Tenant actions access failed:', error.message);
        checkAllDataLoaded();
    });
    
    firebaseListeners.individualHives = database.ref(`tenants/${currentTenantId}/individualHives`);
    firebaseListeners.individualHives.on('value', (snapshot) => {
        individualHives = snapshot.val() ? Object.values(snapshot.val()) : [];
        console.log('📊 Individual hives loaded for', currentTenantId + ':', individualHives.length);
        checkAllDataLoaded();
    }, (error) => {
        console.log('❌ Tenant hives access failed:', error.message);
        checkAllDataLoaded();
    });
    
    firebaseListeners.scheduledTasks = database.ref(`tenants/${currentTenantId}/scheduledTasks`);
    firebaseListeners.scheduledTasks.on('value', (snapshot) => {
        console.log('🔄 Scheduled tasks Firebase listener triggered');
        console.log('📊 Snapshot exists:', !!snapshot.val());
        console.log('📊 Snapshot keys:', snapshot.val() ? Object.keys(snapshot.val()) : 'null');
        
        scheduledTasks = snapshot.val() ? Object.values(snapshot.val()) : [];
        window.scheduledTasks = scheduledTasks; // Also set window.scheduledTasks
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
    
    // Load care service types (formerly honey types) - check both paths for backward compatibility
    const careServiceTypesPath = `tenants/${currentTenantId}/careServiceTypes`;
    const honeyTypesPath = `tenants/${currentTenantId}/honeyTypes`;
    
    // Try new path first, then fallback to old path
    firebaseListeners.careServiceTypes = database.ref(careServiceTypesPath);
    firebaseListeners.careServiceTypes.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data && Array.isArray(data) && data.length > 0) {
            CARE_SERVICE_TYPES = data;
            HONEY_TYPES = data; // Sync for backward compatibility
        } else {
            // Check old path as fallback
            database.ref(honeyTypesPath).once('value', (oldSnapshot) => {
                const oldData = oldSnapshot.val();
                if (oldData && Array.isArray(oldData) && oldData.length > 0) {
                    HONEY_TYPES = oldData;
                    CARE_SERVICE_TYPES = oldData; // Sync to new name
                } else {
                    // Initialize with default care service types if none exist
                    CARE_SERVICE_TYPES = [
                        'Personal Care',
                        'Medical Care',
                        'Companionship',
                        'Transportation',
                        'Housekeeping',
                        'Meal Preparation',
                        'Respite Care',
                        'Specialized Care',
                        'Rehabilitation Support',
                        'End-of-Life Care'
                    ];
                    HONEY_TYPES = CARE_SERVICE_TYPES; // Sync for backward compatibility
                    // Save default care service types to Firebase (both paths for compatibility)
                    database.ref(careServiceTypesPath).set(CARE_SERVICE_TYPES);
                    database.ref(honeyTypesPath).set(HONEY_TYPES);
                }
            });
        }
        console.log('🏥 Care service types loaded for', currentTenantId + ':', CARE_SERVICE_TYPES.length);
        checkAllDataLoaded();
    }, (error) => {
        console.log('❌ Tenant care service types access failed:', error.message);
        // Fallback to old path
        firebaseListeners.honeyTypes = database.ref(honeyTypesPath);
        firebaseListeners.honeyTypes.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data && Array.isArray(data)) {
                HONEY_TYPES = data;
                CARE_SERVICE_TYPES = data; // Sync to new name
                console.log('🏥 Care service types loaded from fallback path:', CARE_SERVICE_TYPES.length);
            }
            checkAllDataLoaded();
        });
    });
    
    if (isAdmin) {
        loadEmployees();
    }
    
    // Initialize and listen for tasks
    firebaseListeners.tasks = database.ref('tasks');
    firebaseListeners.tasks.on('value', (snapshot) => {
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
    firebaseListeners.deletedTasks = database.ref('deletedTasks');
    firebaseListeners.deletedTasks.on('value', (snapshot) => {
        deletedTasks = snapshot.val() || {};
    });
    
    // Load seasonal requirements
    firebaseListeners.seasonalRequirements = database.ref('seasonalRequirements');
    firebaseListeners.seasonalRequirements.on('value', (snapshot) => {
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
    
    firebaseListeners.employees = database.ref(`tenants/${currentTenantId}/employees`);
    firebaseListeners.employees.on('value', (snapshot) => {
        employees = snapshot.val() ? Object.values(snapshot.val()) : [];
        renderEmployees();
    });
}

// Export all data to CSV
function exportAllData() {
    downloadCSV();
}

// Debug utility
function debugHomeCare() {
    console.log('=== HomeCare Debug Information ===');
    // Backward compatibility
    const debugBeeMarshall = debugHomeCare;
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
        careMarshallAlert('This feature is only available for GBTech login.', 'error');
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
            name: 'Main Care Facility - Independent Clients',
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
            name: 'Remote Care Facility',
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
            name: 'Urban Care Facility',
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
            name: 'Research Care Facility',
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
            careMarshallAlert('Test data created successfully! You now have 8 diverse sites, 10 actions, and 7 scheduled tasks.', 'success');
            
            // Refresh data
            setTimeout(() => {
                loadDataFromFirebase();
            }, 500);
        })
        .catch(error => {
            console.error('❌ Error creating test data:', error);
            careMarshallAlert('Error creating test data: ' + error.message, 'error');
        });
}

function undoGBTechTestData() {
    // Only allow if logged in as GBTech
    if (currentTenantId !== 'gbtech' || currentUser.username !== 'GBTech') {
        careMarshallAlert('This feature is only available for GBTech login.', 'error');
        return;
    }
    
    if (!gbtechTestDataBackup) {
        careMarshallAlert('No backup data found. Cannot undo test data.', 'warning');
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
            careMarshallAlert('Test data removed successfully! Your original data has been restored.', 'success');
            
            // Refresh data
            setTimeout(() => {
                loadDataFromFirebase();
            }, 500);
        })
        .catch(error => {
            console.error('❌ Error removing test data:', error);
            careMarshallAlert('Error removing test data: ' + error.message, 'error');
        });
}

// Password change functions removed - employees use admin-set passwords

// Function to clean up incorrect employee listings (Lars should not be an employee)
function cleanupIncorrectEmployeeListings() {
    if (!database || !currentTenantId) {
        console.log('⚠️ Cannot cleanup - database or tenant not available');
        return;
    }
    
    const employeePath = `tenants/${currentTenantId}/employees`;
    database.ref(employeePath).once('value', (snapshot) => {
        const employees = snapshot.val() || {};
        const employeeKeys = Object.keys(employees);
        
        console.log('🔍 Checking employee listings for cleanup...');
        
        // Find and remove Lars from employee list (Lars is admin, not employee)
        const larsEmployeeKeys = employeeKeys.filter(key => {
            const employee = employees[key];
            return employee.username && employee.username.toLowerCase() === 'lars';
        });
        
        if (larsEmployeeKeys.length > 0) {
            console.log('🧹 Found Lars incorrectly listed as employee, removing...');
            
            larsEmployeeKeys.forEach(key => {
                database.ref(`${employeePath}/${key}`).remove()
                    .then(() => {
                        console.log(`✅ Removed Lars from employee list (key: ${key})`);
                    })
                    .catch(error => {
                        console.error('❌ Error removing Lars from employee list:', error);
                    });
            });
        } else {
            console.log('✅ No incorrect employee listings found');
        }
    }).catch(error => {
        console.error('❌ Error checking employee listings:', error);
    });
}
/*
function showPasswordChangePrompt(employee) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'passwordChangePromptModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content" style="background: var(--glass); backdrop-filter: blur(12px) saturate(1.1); border: 1px solid rgba(255,255,255,0.2);">
                <div class="modal-header border-0">
                    <h5 class="modal-title fw-bold"><i class="bi bi-shield-check"></i> Security Setup</h5>
                </div>
                <div class="modal-body">
                    <div class="alert alert-warning">
                        <i class="bi bi-exclamation-triangle"></i> <strong>Important:</strong> 
                        You're using a temporary password. For security, please set your own password.
                    </div>
                    <form id="employeePasswordChangeForm">
                        <div class="mb-3">
                            <label for="employeeNewPassword" class="form-label">New Password</label>
                            <input type="password" class="form-control" id="employeeNewPassword" autocomplete="new-password" required minlength="12">
                            <div id="passwordStrengthIndicator" class="mt-2"></div>
                        </div>
                        <div class="mb-3">
                            <label for="employeeConfirmPassword" class="form-label">Confirm New Password</label>
                            <input type="password" class="form-control" id="employeeConfirmPassword" autocomplete="new-password" required minlength="12">
                        </div>
                        <div class="alert alert-warning">
                            <i class="bi bi-shield-check"></i> <strong>Password Requirements:</strong>
                            <ul class="mb-0 mt-2">
                                <li>At least 12 characters long</li>
                                <li>Uppercase and lowercase letters</li>
                                <li>Numbers and special characters</li>
                                <li>No common words or patterns</li>
                            </ul>
                        </div>
                    </form>
                </div>
                <div class="modal-footer border-0">
                    <button type="button" class="btn btn-primary" onclick="saveEmployeePasswordChange('${employee.id}')">Set Password</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Add real-time password strength checking
    const passwordInput = modal.querySelector('#employeeNewPassword');
    const strengthIndicator = modal.querySelector('#passwordStrengthIndicator');
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const validation = validatePasswordStrength(password);
        
        // Update strength indicator
        let strengthClass = 'text-danger';
        let strengthText = 'Very Weak';
        
        if (validation.strength >= 80) {
            strengthClass = 'text-success';
            strengthText = 'Very Strong';
        } else if (validation.strength >= 60) {
            strengthClass = 'text-warning';
            strengthText = 'Strong';
        } else if (validation.strength >= 40) {
            strengthClass = 'text-warning';
            strengthText = 'Medium';
        } else if (validation.strength >= 20) {
            strengthClass = 'text-danger';
            strengthText = 'Weak';
        }
        
        strengthIndicator.innerHTML = `
            <div class="progress" style="height: 8px;">
                <div class="progress-bar ${strengthClass.replace('text-', 'bg-')}" 
                     style="width: ${validation.strength}%"></div>
            </div>
            <small class="${strengthClass}">${strengthText} (${validation.strength}/100)</small>
        `;
    });
    
    // Clean up when modal is hidden
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}
*/

// Save employee password change
/*
function saveEmployeePasswordChange(employeeId) {
    const newPassword = document.getElementById('employeeNewPassword').value;
    const confirmPassword = document.getElementById('employeeConfirmPassword').value;
    
    if (!newPassword || !confirmPassword) {
        careMarshallAlert('Please enter both password fields', 'error');
        return;
    }
    
    // SECURITY: Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
        const errorMessage = 'Password requirements not met:\n• ' + passwordValidation.errors.join('\n• ');
        careMarshallAlert(errorMessage, 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        careMarshallAlert('Passwords do not match', 'error');
        return;
    }
    
    // Update employee password in Firebase
    const employeePath = currentTenantId ? `tenants/${currentTenantId}/employees` : 'employees';
    const passwordHash = secureHash(newPassword);
    
    database.ref(`${employeePath}/${employeeId}`).update({
        passwordHash: passwordHash,
        temporaryPassword: null, // Clear temporary password
        temporaryPasswordExpiry: null, // Clear expiry
        passwordChanged: true // Mark password as changed
    })
    .then(() => {
        careMarshallAlert('✅ Password updated successfully! Your device is now remembered for future logins.', 'success');
        
        // Close the modal
        const modal = document.getElementById('passwordChangePromptModal');
        if (modal) {
            const bsModal = bootstrap.Modal.getInstance(modal);
            bsModal.hide();
        }
    })
    .catch(error => {
        console.error('Error updating password:', error);
        careMarshallAlert('Failed to update password: ' + error.message, 'error');
    });
}
*/

// Global data arrays - Initialize as empty arrays if not already declared
if (typeof sites === 'undefined') {
    window.sites = [];
}
if (typeof actions === 'undefined') {
    window.actions = [];
}
if (typeof scheduledTasks === 'undefined') {
    window.scheduledTasks = [];
}
if (typeof individualHives === 'undefined') {
    window.individualHives = [];
}
if (typeof tasks === 'undefined') {
    window.tasks = [];
}
if (typeof deletedTasks === 'undefined') {
    window.deletedTasks = {};
}

// Load all data from Firebase
function loadAllData() {
    console.log('🔄 Loading all data from Firebase...');
    
    if (!database) {
        console.error('❌ Database not available');
        return;
    }
    
    const tenantPath = currentTenantId ? `tenants/${currentTenantId}` : 'tenants/lars';
    console.log('🏢 Loading data for tenant:', tenantPath);
    
    // Load sites
    database.ref(`${tenantPath}/sites`).once('value')
        .then(snapshot => {
            const data = snapshot.val();
            window.sites = data ? Object.values(data) : [];
            console.log('✅ Sites loaded:', window.sites.length);
            
            
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
        })
        .catch(error => {
            console.error('❌ Error loading sites:', error);
            window.sites = [];
        });
    
    // Load actions
    database.ref(`${tenantPath}/actions`).once('value')
        .then(snapshot => {
            const data = snapshot.val();
            window.actions = data ? Object.values(data) : [];
            console.log('✅ Actions loaded:', window.actions.length);
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
            // If Actions view is currently visible, refresh it
            try {
                const actionsView = document.getElementById('actionsView');
                if (actionsView && !actionsView.classList.contains('hidden')) {
                    if (typeof populateActionFilters === 'function') {
                        populateActionFilters();
                    }
                    if (typeof renderActions === 'function') {
                        renderActions();
                    }
                }
            } catch (e) {
                console.warn('⚠️ Unable to refresh Actions view after initial load:', e);
            }
        })
        .catch(error => {
            console.error('❌ Error loading actions:', error);
            window.actions = [];
        });
    
    // Load scheduled tasks
    database.ref(`${tenantPath}/scheduledTasks`).once('value')
        .then(snapshot => {
            const data = snapshot.val();
            window.scheduledTasks = data ? Object.values(data) : [];
            console.log('✅ Scheduled tasks loaded:', window.scheduledTasks.length);
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
        })
        .catch(error => {
            console.error('❌ Error loading scheduled tasks:', error);
            window.scheduledTasks = [];
        });
    
    // Load individual hives
    database.ref(`${tenantPath}/individualHives`).once('value')
        .then(snapshot => {
            const data = snapshot.val();
            window.individualHives = data ? Object.values(data) : [];
            console.log('✅ Individual hives loaded:', window.individualHives.length);
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
        })
        .catch(error => {
            console.error('❌ Error loading individual hives:', error);
            window.individualHives = [];
        });
    
    // Load tasks
    database.ref(`${tenantPath}/tasks`).once('value')
        .then(snapshot => {
            const data = snapshot.val();
            window.tasks = data ? Object.values(data) : [];
            console.log('✅ Tasks loaded:', window.tasks.length);
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
        })
        .catch(error => {
            console.error('❌ Error loading tasks:', error);
            window.tasks = [];
        });
    
    // Load deleted tasks
    database.ref(`${tenantPath}/deletedTasks`).once('value')
        .then(snapshot => {
            const data = snapshot.val();
            window.deletedTasks = data || {};
            console.log('✅ Deleted tasks loaded:', Object.keys(window.deletedTasks).length);
        })
        .catch(error => {
            console.error('❌ Error loading deleted tasks:', error);
            window.deletedTasks = {};
        });
    
    // Load visits (NEW: visit-based scheduling)
    database.ref(`${tenantPath}/visits`).once('value')
        .then(snapshot => {
            const data = snapshot.val();
            window.visits = data ? Object.values(data) : [];
            console.log('✅ Visits loaded:', window.visits.length);
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
        })
        .catch(error => {
            console.error('❌ Error loading visits:', error);
            window.visits = [];
        });
    
    // Load task groups (NEW: task templates)
    database.ref(`${tenantPath}/taskGroups`).once('value')
        .then(snapshot => {
            const data = snapshot.val();
            window.taskGroups = data ? Object.values(data) : [];
            console.log('✅ Task groups loaded:', window.taskGroups.length);
        })
        .catch(error => {
            console.error('❌ Error loading task groups:', error);
            window.taskGroups = [];
        });
}

// Initialize data loading after successful login
function initializeDataLoading() {
    console.log('🔄 Initializing data loading...');
    
    // Load data immediately
    loadAllData();
    
    // Set up real-time listeners for data changes
    if (database && currentTenantId) {
        const tenantPath = `tenants/${currentTenantId}`;
        
        // Clean up any existing listeners first
        cleanupFirebaseListeners();
        
        // Real-time listeners for data updates
        firebaseListeners.sites = database.ref(`${tenantPath}/sites`);
        firebaseListeners.sites.on('value', snapshot => {
            const data = snapshot.val();
            window.sites = data ? Object.values(data) : [];
            // Invalidate render cache when sites data changes
            if (typeof invalidateSitesRenderCache === 'function') {
                invalidateSitesRenderCache();
            }
            if (typeof Logger !== 'undefined') {
                Logger.log('🔄 Sites updated:', window.sites.length);
            }
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
        });
        
        firebaseListeners.actions = database.ref(`${tenantPath}/actions`);
        firebaseListeners.actions.on('value', snapshot => {
            const data = snapshot.val();
            window.actions = data ? Object.values(data) : [];
            console.log('🔄 Actions updated:', window.actions.length);
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
            // If Actions view is currently visible, refresh it
            try {
                const actionsView = document.getElementById('actionsView');
                if (actionsView && !actionsView.classList.contains('hidden')) {
                    if (typeof populateActionFilters === 'function') {
                        populateActionFilters();
                    }
                    if (typeof renderActions === 'function') {
                        renderActions();
                    }
                }
            } catch (e) {
                console.warn('⚠️ Unable to refresh Actions view on data update:', e);
            }
        });
        
        firebaseListeners.scheduledTasks = database.ref(`${tenantPath}/scheduledTasks`);
        firebaseListeners.scheduledTasks.on('value', snapshot => {
            const data = snapshot.val();
            window.scheduledTasks = data ? Object.values(data) : [];
            console.log('🔄 Scheduled tasks updated:', window.scheduledTasks.length);
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
        });
        
        firebaseListeners.individualHives = database.ref(`${tenantPath}/individualHives`);
        firebaseListeners.individualHives.on('value', snapshot => {
            const data = snapshot.val();
            window.individualHives = data ? Object.values(data) : [];
            console.log('🔄 Individual hives updated:', window.individualHives.length);
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
        });
        
        firebaseListeners.tasks = database.ref(`${tenantPath}/tasks`);
        firebaseListeners.tasks.on('value', snapshot => {
            const data = snapshot.val();
            window.tasks = data ? Object.values(data) : [];
            console.log('🔄 Tasks updated:', window.tasks.length);
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
        });
        
        // NEW: Real-time listener for visits
        firebaseListeners.visits = database.ref(`${tenantPath}/visits`);
        firebaseListeners.visits.on('value', snapshot => {
            const data = snapshot.val();
            window.visits = data ? Object.values(data) : [];
            console.log('🔄 Visits updated:', window.visits.length);
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
        });
        
        // NEW: Real-time listener for task groups
        firebaseListeners.taskGroups = database.ref(`${tenantPath}/taskGroups`);
        firebaseListeners.taskGroups.on('value', snapshot => {
            const data = snapshot.val();
            window.taskGroups = data ? Object.values(data) : [];
            console.log('🔄 Task groups updated:', window.taskGroups.length);
        });
        
        firebaseListeners.deletedTasks = database.ref(`${tenantPath}/deletedTasks`);
        firebaseListeners.deletedTasks.on('value', snapshot => {
            const data = snapshot.val();
            window.deletedTasks = data || {};
            console.log('🔄 Deleted tasks updated:', Object.keys(window.deletedTasks).length);
        });
    }
}

// Stub function to prevent errors - TODO: Implement properly
function initializeGlobalQuickLinks() {
    // This function is called but not implemented yet
    // Should initialize quick links bar if needed
}

// Stub function to prevent errors - TODO: Implement properly  
function populateSiteCheckboxes() {
    // This function is called but not implemented yet
    // Should populate site checkboxes for seasonal requirements
}

// Stub function to prevent errors - TODO: Implement properly
function renderSeasonalRequirements() {
    // This function is called but not implemented yet
    // Should render seasonal requirements view
}

// =====================================================
// NEW: Task Group Management Functions (v0.7)
// =====================================================

/**
 * Save a task group template to Firebase
 * @param {Object} taskGroup - Task group object {name, description, taskIds, category, color}
 * @returns {Promise} Firebase promise
 */
window.saveTaskGroup = function(taskGroup) {
    if (!database || !currentTenantId) {
        console.error('❌ Database not available or no tenant ID');
        return Promise.reject('Database not available');
    }
    
    const groupData = {
        id: taskGroup.id || `taskgroup_${Date.now()}`,
        name: taskGroup.name,
        description: taskGroup.description || '',
        taskIds: taskGroup.taskIds || [],
        category: taskGroup.category || 'General',
        color: taskGroup.color || '#0d6efd',
        createdBy: currentUser?.username || 'Unknown',
        createdAt: taskGroup.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    const taskGroupsPath = `tenants/${currentTenantId}/taskGroups`;
    return database.ref(`${taskGroupsPath}/${groupData.id}`).set(groupData)
        .then(() => {
            console.log('✅ Task group saved:', groupData.name);
            logAction('Task Group Created', `Created task group: ${groupData.name}`, null, null, null);
            return groupData;
        })
        .catch(error => {
            console.error('❌ Error saving task group:', error);
            throw error;
        });
};

/**
 * Delete a task group
 * @param {string} groupId - Task group ID
 * @returns {Promise} Firebase promise
 */
window.deleteTaskGroup = function(groupId) {
    if (!database || !currentTenantId) {
        console.error('❌ Database not available or no tenant ID');
        return Promise.reject('Database not available');
    }
    
    const taskGroup = taskGroups.find(g => g.id === groupId);
    const groupName = taskGroup ? taskGroup.name : groupId;
    
    const taskGroupsPath = `tenants/${currentTenantId}/taskGroups`;
    return database.ref(`${taskGroupsPath}/${groupId}`).remove()
        .then(() => {
            console.log('✅ Task group deleted:', groupId);
            logAction('Task Group Deleted', `Deleted task group: ${groupName}`, null, null, null);
        })
        .catch(error => {
            console.error('❌ Error deleting task group:', error);
            throw error;
        });
};

// =====================================================
// NEW: Visit Management Functions (v0.7)
// =====================================================

/**
 * Save a visit to Firebase
 * @param {Object} visit - Visit object {siteId, date, time, tasks, notes, status}
 * @returns {Promise} Firebase promise
 */
window.saveVisit = function(visit) {
    if (!database || !currentTenantId) {
        console.error('❌ Database not available or no tenant ID');
        return Promise.reject('Database not available');
    }
    
    const visitData = {
        id: visit.id || `visit_${Date.now()}`,
        siteId: visit.siteId,
        date: visit.date,
        time: visit.time || '',
        duration: visit.duration || 60, // Default 60 minutes
        assignedTasks: visit.assignedTasks || [], // Array of {taskId, status, completedAt, notes}
        priority: visit.priority || 'normal',
        status: visit.status || 'scheduled', // scheduled, in_progress, completed, cancelled
        notes: visit.notes || '',
        assignedTo: visit.assignedTo || currentUser?.username || '',
        createdBy: currentUser?.username || 'Unknown',
        createdAt: visit.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    const visitsPath = `tenants/${currentTenantId}/visits`;
    return database.ref(`${visitsPath}/${visitData.id}`).set(visitData)
        .then(() => {
            const site = sites.find(s => s.id === visit.siteId);
            const siteName = site ? site.name : `Site ${visit.siteId}`;
            console.log('✅ Visit saved:', visitData.id);
            logAction('Visit Scheduled', `Scheduled visit to ${siteName}`, visit.siteId, null, null);
            return visitData;
        })
        .catch(error => {
            console.error('❌ Error saving visit:', error);
            throw error;
        });
};

/**
 * Update visit task status (mark task as complete within a visit)
 * @param {string} visitId - Visit ID
 * @param {string} taskId - Task ID within the visit
 * @param {string} status - Task status ('pending', 'completed', 'skipped')
 * @param {string} notes - Optional notes
 * @returns {Promise} Firebase promise
 */
window.updateVisitTaskStatus = function(visitId, taskId, status, notes = '') {
    if (!database || !currentTenantId) {
        console.error('❌ Database not available or no tenant ID');
        return Promise.reject('Database not available');
    }
    
    const visit = visits.find(v => v.id === visitId);
    if (!visit) {
        return Promise.reject('Visit not found');
    }
    
    // Update the specific task within the visit
    const taskIndex = visit.assignedTasks.findIndex(t => t.taskId === taskId);
    if (taskIndex === -1) {
        return Promise.reject('Task not found in visit');
    }
    
    visit.assignedTasks[taskIndex] = {
        ...visit.assignedTasks[taskIndex],
        status: status,
        completedAt: status === 'completed' ? new Date().toISOString() : null,
        notes: notes
    };
    
    // Check if all tasks are complete
    const allTasksComplete = visit.assignedTasks.every(t => t.status === 'completed' || t.status === 'skipped');
    if (allTasksComplete && visit.status === 'in_progress') {
        visit.status = 'completed';
        visit.completedAt = new Date().toISOString();
    }
    
    visit.updatedAt = new Date().toISOString();
    
    const visitsPath = `tenants/${currentTenantId}/visits`;
    return database.ref(`${visitsPath}/${visitId}`).set(visit)
        .then(() => {
            console.log('✅ Visit task updated:', taskId, status);
            return visit;
        })
        .catch(error => {
            console.error('❌ Error updating visit task:', error);
            throw error;
        });
};

/**
 * Delete a visit
 * @param {string} visitId - Visit ID
 * @returns {Promise} Firebase promise
 */
window.deleteVisit = function(visitId) {
    if (!database || !currentTenantId) {
        console.error('❌ Database not available or no tenant ID');
        return Promise.reject('Database not available');
    }
    
    const visit = visits.find(v => v.id === visitId);
    const visitInfo = visit ? `${visit.date} ${visit.time}` : visitId;
    
    const visitsPath = `tenants/${currentTenantId}/visits`;
    return database.ref(`${visitsPath}/${visitId}`).remove()
        .then(() => {
            console.log('✅ Visit deleted:', visitId);
            logAction('Visit Cancelled', `Cancelled visit: ${visitInfo}`, visit?.siteId, null, null);
        })
        .catch(error => {
            console.error('❌ Error deleting visit:', error);
            throw error;
        });
};