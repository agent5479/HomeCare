// HomeCare Management - Core Firebase Integration
// Professional Care Coordination System

// Firebase Configuration
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, remove, push, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD_iGp3av4E-UH6Wiv8W_IdWPr-lShChTE",
  authDomain: "homecare-ca5ce.firebaseapp.com",
  projectId: "homecare-ca5ce",
  storageBucket: "homecare-ca5ce.firebasestorage.app",
  messagingSenderId: "995264187645",
  appId: "1:995264187645:web:8d554b68d02ceb2fba8294"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Global State Management
let currentUser = null;
let currentTenant = null;
let clients = [];
let careActions = [];
let scheduledTasks = [];
let employees = [];
let careTasks = [];

// Default Care Tasks for Home Care Management
const DEFAULT_CARE_TASKS = [
    // PERSONAL CARE TASKS
    { id: 1, name: 'Personal Hygiene Assistance', category: 'Personal Care', common: true, description: 'Assist with daily hygiene routines' },
    { id: 2, name: 'Bathing Assistance', category: 'Personal Care', common: true, description: 'Help with bathing and showering' },
    { id: 3, name: 'Dressing Assistance', category: 'Personal Care', common: true, description: 'Help with getting dressed and undressed' },
    { id: 4, name: 'Grooming Assistance', category: 'Personal Care', common: true, description: 'Assist with hair care, shaving, and grooming' },
    { id: 5, name: 'Toileting Assistance', category: 'Personal Care', common: true, description: 'Help with bathroom needs' },
    { id: 6, name: 'Mobility Assistance', category: 'Personal Care', common: true, description: 'Help with walking and movement' },
    
    // MEDICAL CARE TASKS
    { id: 101, name: 'Medication Administration', category: 'Medical Care', common: true, description: 'Administer prescribed medications' },
    { id: 102, name: 'Vital Signs Check', category: 'Medical Care', common: true, description: 'Monitor blood pressure, pulse, temperature' },
    { id: 103, name: 'Blood Pressure Monitoring', category: 'Medical Care', common: true, description: 'Regular blood pressure checks' },
    { id: 104, name: 'Blood Sugar Testing', category: 'Medical Care', common: true, description: 'Monitor blood glucose levels' },
    { id: 105, name: 'Wound Care', category: 'Medical Care', common: false, description: 'Clean and dress wounds' },
    { id: 106, name: 'Injection Administration', category: 'Medical Care', common: false, description: 'Give injections as prescribed' },
    { id: 107, name: 'Physical Therapy Exercises', category: 'Medical Care', common: false, description: 'Assist with prescribed exercises' },
    { id: 108, name: 'Respiratory Care', category: 'Medical Care', common: false, description: 'Assist with breathing treatments' },
    
    // DAILY LIVING TASKS
    { id: 201, name: 'Meal Preparation', category: 'Daily Living', common: true, description: 'Prepare nutritious meals' },
    { id: 202, name: 'Feeding Assistance', category: 'Daily Living', common: true, description: 'Help with eating and drinking' },
    { id: 203, name: 'Housekeeping', category: 'Daily Living', common: true, description: 'Light housekeeping tasks' },
    { id: 204, name: 'Laundry', category: 'Daily Living', common: true, description: 'Wash and fold clothes' },
    { id: 205, name: 'Shopping', category: 'Daily Living', common: true, description: 'Grocery and personal shopping' },
    { id: 206, name: 'Transportation', category: 'Daily Living', common: true, description: 'Transport to appointments' },
    { id: 207, name: 'Appointment Scheduling', category: 'Daily Living', common: true, description: 'Schedule medical appointments' },
    { id: 208, name: 'Medication Pickup', category: 'Daily Living', common: true, description: 'Pick up prescriptions' },
    
    // EMOTIONAL SUPPORT TASKS
    { id: 301, name: 'Companionship', category: 'Emotional Support', common: true, description: 'Provide social interaction and companionship' },
    { id: 302, name: 'Social Activities', category: 'Emotional Support', common: true, description: 'Engage in recreational activities' },
    { id: 303, name: 'Mental Health Check', category: 'Emotional Support', common: true, description: 'Monitor emotional well-being' },
    { id: 304, name: 'Family Communication', category: 'Emotional Support', common: false, description: 'Facilitate family communication' },
    { id: 305, name: 'Crisis Intervention', category: 'Emotional Support', common: false, description: 'Provide crisis support' },
    
    // SAFETY & MONITORING TASKS
    { id: 401, name: 'Safety Assessment', category: 'Safety & Monitoring', common: true, description: 'Assess home safety conditions' },
    { id: 402, name: 'Fall Risk Assessment', category: 'Safety & Monitoring', common: true, description: 'Evaluate fall risk factors' },
    { id: 403, name: 'Home Safety Check', category: 'Safety & Monitoring', common: true, description: 'Check for safety hazards' },
    { id: 404, name: 'Emergency Response', category: 'Safety & Monitoring', common: false, description: 'Respond to emergency situations' },
    { id: 405, name: 'Security Check', category: 'Safety & Monitoring', common: false, description: 'Verify home security' },
    
    // SPECIALIZED CARE TASKS
    { id: 501, name: 'Dementia Care', category: 'Specialized Care', common: false, description: 'Specialized dementia support' },
    { id: 502, name: 'Alzheimer\'s Support', category: 'Specialized Care', common: false, description: 'Alzheimer\'s specific care' },
    { id: 503, name: 'Disability Support', category: 'Specialized Care', common: false, description: 'Support for physical disabilities' },
    { id: 504, name: 'Palliative Care', category: 'Specialized Care', common: false, description: 'End-of-life comfort care' },
    { id: 505, name: 'Hospice Support', category: 'Specialized Care', common: false, description: 'Hospice care assistance' },
    { id: 506, name: 'Rehabilitation Support', category: 'Specialized Care', common: false, description: 'Post-injury rehabilitation' }
];

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Predefined Users and Tenants
const PREDEFINED_USERS = {
    'Jess': {
        password: 'JessCard2025!',
        tenantId: 'Jess',
        role: 'admin',
        displayName: 'Jess - HomeCare Admin'
    },
    'GBTech': {
        password: '1q2w3e!Q@W#E',
        tenantId: 'GBTech',
        role: 'developer',
        displayName: 'GBTech - Developer'
    }
};

// Authentication Functions
function login(username, password) {
    return new Promise((resolve, reject) => {
        if (!username || !password) {
            reject(new Error('Username and password are required'));
            return;
        }
        
        // Check against predefined users
        const user = PREDEFINED_USERS[username];
        if (!user || user.password !== password) {
            reject(new Error('Invalid username or password'));
            return;
        }
        
        currentUser = username;
        currentTenant = user.tenantId;
        
        // Store in localStorage
        localStorage.setItem('homecare_user', username);
        localStorage.setItem('homecare_tenant', user.tenantId);
        localStorage.setItem('homecare_role', user.role);
        localStorage.setItem('homecare_displayName', user.displayName);
        
        console.log(`🏥 Logged in as ${user.displayName} (${user.role})`);
        console.log(`🏢 Tenant: ${user.tenantId}`);
        
        resolve({ 
            username, 
            tenantId: user.tenantId, 
            role: user.role,
            displayName: user.displayName
        });
    });
}

function logout() {
    currentUser = null;
    currentTenant = null;
    localStorage.removeItem('homecare_user');
    localStorage.removeItem('homecare_tenant');
    localStorage.removeItem('homecare_role');
    localStorage.removeItem('homecare_displayName');
    
    // Clear all data
    clients = [];
    careActions = [];
    scheduledTasks = [];
    employees = [];
    careTasks = [];
    
    console.log('🏥 Logged out successfully');
}

function isAuthenticated() {
    return currentUser && currentTenant;
}

// Data Loading Functions
function loadAllData() {
    if (!isAuthenticated()) {
        console.error('User not authenticated');
        return;
    }
    
    loadClients();
    loadCareActions();
    loadScheduledTasks();
    loadEmployees();
    loadCareTasks();
}

function loadClients() {
    const clientsRef = ref(database, `tenants/${currentTenant}/clients`);
    
    onValue(clientsRef, (snapshot) => {
        const data = snapshot.val();
        clients = data ? Object.values(data) : [];
        console.log(`Loaded ${clients.length} clients for tenant ${currentTenant}`);
        
        // Trigger UI update
        if (typeof updateClientsUI === 'function') {
            updateClientsUI();
        }
    }, (error) => {
        console.error('Error loading clients:', error);
    });
}

function loadCareActions() {
    const actionsRef = ref(database, `tenants/${currentTenant}/careActions`);
    
    onValue(actionsRef, (snapshot) => {
        const data = snapshot.val();
        careActions = data ? Object.values(data) : [];
        console.log(`Loaded ${careActions.length} care actions for tenant ${currentTenant}`);
        
        // Trigger UI update
        if (typeof updateCareActionsUI === 'function') {
            updateCareActionsUI();
        }
    }, (error) => {
        console.error('Error loading care actions:', error);
    });
}

function loadScheduledTasks() {
    const tasksRef = ref(database, `tenants/${currentTenant}/scheduledTasks`);
    
    onValue(tasksRef, (snapshot) => {
        const data = snapshot.val();
        scheduledTasks = data ? Object.values(data) : [];
        console.log(`Loaded ${scheduledTasks.length} scheduled tasks for tenant ${currentTenant}`);
        
        // Trigger UI update
        if (typeof updateScheduledTasksUI === 'function') {
            updateScheduledTasksUI();
        }
    }, (error) => {
        console.error('Error loading scheduled tasks:', error);
    });
}

function loadEmployees() {
    const employeesRef = ref(database, `tenants/${currentTenant}/employees`);
    
    onValue(employeesRef, (snapshot) => {
        const data = snapshot.val();
        employees = data ? Object.values(data) : [];
        console.log(`Loaded ${employees.length} employees for tenant ${currentTenant}`);
        
        // Trigger UI update
        if (typeof updateEmployeesUI === 'function') {
            updateEmployeesUI();
        }
    }, (error) => {
        console.error('Error loading employees:', error);
    });
}

function loadCareTasks() {
    const tasksRef = ref(database, `tenants/${currentTenant}/careTasks`);
    
    onValue(tasksRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            careTasks = Object.values(data);
        } else {
            // Initialize with default tasks
            careTasks = DEFAULT_CARE_TASKS;
            initializeDefaultTasks();
        }
        console.log(`Loaded ${careTasks.length} care tasks for tenant ${currentTenant}`);
        
        // Trigger UI update
        if (typeof updateCareTasksUI === 'function') {
            updateCareTasksUI();
        }
    }, (error) => {
        console.error('Error loading care tasks:', error);
    });
}

function initializeDefaultTasks() {
    const tasksRef = ref(database, `tenants/${currentTenant}/careTasks`);
    
    DEFAULT_CARE_TASKS.forEach(task => {
        set(ref(database, `tenants/${currentTenant}/careTasks/${task.id}`), {
            ...task,
            createdAt: new Date().toISOString(),
            createdBy: currentUser
        });
    });
}

// Client Management Functions
function saveClient(clientData) {
    if (!isAuthenticated()) {
        throw new Error('User not authenticated');
    }
    
    const clientId = clientData.id || generateId();
    const client = {
        id: clientId,
        name: clientData.name,
        description: clientData.description || '',
        age: clientData.age || null,
        status: clientData.status || 'active',
        careLevel: clientData.careLevel || 'standard',
        medicalConditions: clientData.medicalConditions || '',
        emergencyContact: clientData.emergencyContact || '',
        address: clientData.address || '',
        latitude: clientData.latitude || null,
        longitude: clientData.longitude || null,
        phone: clientData.phone || '',
        email: clientData.email || '',
        notes: clientData.notes || '',
        createdAt: clientData.createdAt || new Date().toISOString(),
        lastModifiedBy: currentUser,
        lastModifiedAt: new Date().toISOString()
    };
    
    const clientRef = ref(database, `tenants/${currentTenant}/clients/${clientId}`);
    return set(clientRef, client);
}

function deleteClient(clientId) {
    if (!isAuthenticated()) {
        throw new Error('User not authenticated');
    }
    
    const clientRef = ref(database, `tenants/${currentTenant}/clients/${clientId}`);
    return remove(clientRef);
}

function getClient(clientId) {
    return clients.find(client => client.id === clientId);
}

// Care Action Management Functions
function saveCareAction(actionData) {
    if (!isAuthenticated()) {
        throw new Error('User not authenticated');
    }
    
    const actionId = actionData.id || generateId();
    const action = {
        id: actionId,
        clientId: actionData.clientId,
        taskId: actionData.taskId,
        taskName: actionData.taskName,
        taskCategory: actionData.taskCategory,
        date: actionData.date,
        time: actionData.time || new Date().toTimeString().slice(0, 5),
        notes: actionData.notes || '',
        status: actionData.status || 'completed',
        priority: actionData.priority || 'normal',
        loggedBy: currentUser,
        createdAt: new Date().toISOString()
    };
    
    const actionRef = ref(database, `tenants/${currentTenant}/careActions/${actionId}`);
    return set(actionRef, action);
}

function deleteCareAction(actionId) {
    if (!isAuthenticated()) {
        throw new Error('User not authenticated');
    }
    
    const actionRef = ref(database, `tenants/${currentTenant}/careActions/${actionId}`);
    return remove(actionRef);
}

function getCareActionsForClient(clientId) {
    return careActions.filter(action => action.clientId === clientId);
}

// Scheduled Task Management Functions
function saveScheduledTask(taskData) {
    if (!isAuthenticated()) {
        throw new Error('User not authenticated');
    }
    
    const taskId = taskData.id || generateId();
    const task = {
        id: taskId,
        clientId: taskData.clientId,
        taskId: taskData.taskId,
        taskName: taskData.taskName,
        taskCategory: taskData.taskCategory,
        scheduledDate: taskData.scheduledDate,
        scheduledTime: taskData.scheduledTime,
        priority: taskData.priority || 'normal',
        status: taskData.status || 'pending',
        notes: taskData.notes || '',
        createdBy: currentUser,
        createdAt: new Date().toISOString(),
        lastModifiedBy: currentUser,
        lastModifiedAt: new Date().toISOString()
    };
    
    const taskRef = ref(database, `tenants/${currentTenant}/scheduledTasks/${taskId}`);
    return set(taskRef, task);
}

function deleteScheduledTask(taskId) {
    if (!isAuthenticated()) {
        throw new Error('User not authenticated');
    }
    
    const taskRef = ref(database, `tenants/${currentTenant}/scheduledTasks/${taskId}`);
    return remove(taskRef);
}

function completeScheduledTask(taskId, notes = '') {
    if (!isAuthenticated()) {
        throw new Error('User not authenticated');
    }
    
    const task = scheduledTasks.find(t => t.id === taskId);
    if (!task) {
        throw new Error('Scheduled task not found');
    }
    
    // Create care action from scheduled task
    const actionData = {
        clientId: task.clientId,
        taskId: task.taskId,
        taskName: task.taskName,
        taskCategory: task.taskCategory,
        date: task.scheduledDate,
        time: task.scheduledTime,
        notes: notes || task.notes,
        priority: task.priority,
        loggedBy: currentUser
    };
    
    // Save care action
    saveCareAction(actionData).then(() => {
        // Delete scheduled task
        deleteScheduledTask(taskId);
    });
}

// Employee Management Functions
function saveEmployee(employeeData) {
    if (!isAuthenticated()) {
        throw new Error('User not authenticated');
    }
    
    const employeeId = employeeData.id || generateId();
    const employee = {
        id: employeeId,
        username: employeeData.username,
        email: employeeData.email || '',
        firstName: employeeData.firstName || '',
        lastName: employeeData.lastName || '',
        role: employeeData.role || 'caregiver',
        status: employeeData.status || 'active',
        phone: employeeData.phone || '',
        address: employeeData.address || '',
        emergencyContact: employeeData.emergencyContact || '',
        skills: employeeData.skills || [],
        certifications: employeeData.certifications || [],
        notes: employeeData.notes || '',
        createdBy: currentUser,
        createdAt: new Date().toISOString(),
        lastModifiedBy: currentUser,
        lastModifiedAt: new Date().toISOString()
    };
    
    const employeeRef = ref(database, `tenants/${currentTenant}/employees/${employeeId}`);
    return set(employeeRef, employee);
}

function deleteEmployee(employeeId) {
    if (!isAuthenticated()) {
        throw new Error('User not authenticated');
    }
    
    const employeeRef = ref(database, `tenants/${currentTenant}/employees/${employeeId}`);
    return remove(employeeRef);
}

// Dashboard Statistics
function getDashboardStats() {
    const activeClients = clients.filter(client => client.status === 'active').length;
    const todayActions = careActions.filter(action => {
        const actionDate = new Date(action.date);
        const today = new Date();
        return actionDate.toDateString() === today.toDateString();
    }).length;
    
    const pendingTasks = scheduledTasks.filter(task => task.status === 'pending').length;
    const urgentTasks = scheduledTasks.filter(task => task.priority === 'urgent' && task.status === 'pending').length;
    
    return {
        totalClients: clients.length,
        activeClients: activeClients,
        totalActions: careActions.length,
        todayActions: todayActions,
        pendingTasks: pendingTasks,
        urgentTasks: urgentTasks,
        totalEmployees: employees.length
    };
}

// Export functions for use in other modules
window.HomeCareCore = {
    // Authentication
    login,
    logout,
    isAuthenticated,
    getCurrentUser: () => currentUser,
    getCurrentTenant: () => currentTenant,
    
    // Data Management
    loadAllData,
    loadClients,
    loadCareActions,
    loadScheduledTasks,
    loadEmployees,
    loadCareTasks,
    
    // Client Management
    saveClient,
    deleteClient,
    getClient,
    getClients: () => clients,
    
    // Care Action Management
    saveCareAction,
    deleteCareAction,
    getCareActionsForClient,
    getCareActions: () => careActions,
    
    // Scheduled Task Management
    saveScheduledTask,
    deleteScheduledTask,
    completeScheduledTask,
    getScheduledTasks: () => scheduledTasks,
    
    // Employee Management
    saveEmployee,
    deleteEmployee,
    getEmployees: () => employees,
    
    // Care Tasks
    getCareTasks: () => careTasks,
    
    // Dashboard
    getDashboardStats,
    
    // Utilities
    generateId,
    formatDate,
    formatDateTime
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check for existing authentication
    const savedUser = localStorage.getItem('homecare_user');
    const savedTenant = localStorage.getItem('homecare_tenant');
    const savedRole = localStorage.getItem('homecare_role');
    const savedDisplayName = localStorage.getItem('homecare_displayName');
    
    if (savedUser && savedTenant) {
        currentUser = savedUser;
        currentTenant = savedTenant;
        
        console.log(`🏥 Restored session: ${savedDisplayName || savedUser} (${savedRole || 'user'})`);
        console.log(`🏢 Tenant: ${savedTenant}`);
        
        loadAllData();
    }
    
    console.log('HomeCare Core module loaded');
});
