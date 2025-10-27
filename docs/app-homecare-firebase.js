// HomeCare Management - Firebase Cloud Sync Version
// Data synced across all browsers/devices using Firebase

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
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

// Default care task types for home care management
const DEFAULT_CARE_TASKS = [
    // PERSONAL CARE TASKS
    { id: 1, name: 'Personal Hygiene Assistance', category: 'Personal Care', common: true },
    { id: 2, name: 'Bathing Assistance', category: 'Personal Care', common: true },
    { id: 3, name: 'Dressing Assistance', category: 'Personal Care', common: true },
    { id: 4, name: 'Grooming Assistance', category: 'Personal Care', common: true },
    { id: 5, name: 'Toileting Assistance', category: 'Personal Care', common: true },
    { id: 6, name: 'Mobility Assistance', category: 'Personal Care', common: true },
    
    // MEDICAL CARE TASKS
    { id: 101, name: 'Medication Administration', category: 'Medical Care', common: true },
    { id: 102, name: 'Vital Signs Check', category: 'Medical Care', common: true },
    { id: 103, name: 'Blood Pressure Monitoring', category: 'Medical Care', common: true },
    { id: 104, name: 'Blood Sugar Testing', category: 'Medical Care', common: true },
    { id: 105, name: 'Wound Care', category: 'Medical Care', common: false },
    { id: 106, name: 'Injection Administration', category: 'Medical Care', common: false },
    { id: 107, name: 'Physical Therapy Exercises', category: 'Medical Care', common: false },
    { id: 108, name: 'Respiratory Care', category: 'Medical Care', common: false },
    
    // DAILY LIVING TASKS
    { id: 201, name: 'Meal Preparation', category: 'Daily Living', common: true },
    { id: 202, name: 'Feeding Assistance', category: 'Daily Living', common: true },
    { id: 203, name: 'Housekeeping', category: 'Daily Living', common: true },
    { id: 204, name: 'Laundry', category: 'Daily Living', common: true },
    { id: 205, name: 'Shopping', category: 'Daily Living', common: true },
    { id: 206, name: 'Transportation', category: 'Daily Living', common: true },
    { id: 207, name: 'Appointment Scheduling', category: 'Daily Living', common: true },
    { id: 208, name: 'Medication Pickup', category: 'Daily Living', common: true },
    
    // EMOTIONAL SUPPORT TASKS
    { id: 301, name: 'Companionship', category: 'Emotional Support', common: true },
    { id: 302, name: 'Social Activities', category: 'Emotional Support', common: true },
    { id: 303, name: 'Mental Health Check', category: 'Emotional Support', common: true },
    { id: 304, name: 'Family Communication', category: 'Emotional Support', common: false },
    { id: 305, name: 'Crisis Intervention', category: 'Emotional Support', common: false },
    
    // SAFETY & MONITORING TASKS
    { id: 401, name: 'Safety Assessment', category: 'Safety & Monitoring', common: true },
    { id: 402, name: 'Fall Risk Assessment', category: 'Safety & Monitoring', common: true },
    { id: 403, name: 'Home Safety Check', category: 'Safety & Monitoring', common: true },
    { id: 404, name: 'Emergency Response', category: 'Safety & Monitoring', common: false },
    { id: 405, name: 'Security Check', category: 'Safety & Monitoring', common: false },
    
    // SPECIALIZED CARE TASKS
    { id: 501, name: 'Dementia Care', category: 'Specialized Care', common: false },
    { id: 502, name: 'Alzheimer\'s Support', category: 'Specialized Care', common: false },
    { id: 503, name: 'Disability Support', category: 'Specialized Care', common: false },
    { id: 504, name: 'Palliative Care', category: 'Specialized Care', common: false },
    { id: 505, name: 'Hospice Support', category: 'Specialized Care', common: false },
    { id: 506, name: 'Rehabilitation Support', category: 'Specialized Care', common: false }
];

// User ID (simple hash of password for single-user system)
let userId = null;
let currentUser = null;

// Local cache
let clients = []; // Changed from 'sites' to 'clients'
let actions = [];
let tasks = DEFAULT_CARE_TASKS;

// Sync status
function showSyncStatus(message, type = 'success') {
    const indicator = document.getElementById('syncIndicator');
    const syncText = document.getElementById('syncText');
    
    indicator.classList.remove('hidden', 'syncing', 'error');
    
    if (type === 'syncing') {
        indicator.classList.add('syncing');
    } else if (type === 'error') {
        indicator.classList.add('error');
    }
    
    syncText.innerHTML = message;
    indicator.classList.remove('hidden');
    
    if (type !== 'syncing') {
        setTimeout(() => {
            indicator.classList.add('hidden');
        }, 3000);
    }
}

// Simple hash function for password
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'user_' + Math.abs(hash).toString(36);
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Check if logged in
    userId = localStorage.getItem('userId');
    currentUser = localStorage.getItem('currentUser') || 'User';
    
    if (userId) {
        showMainApp();
        loadDataFromFirebase();
    }
    
    // Setup forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('clientForm').addEventListener('submit', handleSaveClient);
    document.getElementById('actionForm').addEventListener('submit', handleLogAction);
    
    // Set today's date
    document.getElementById('actionDate').valueAsDate = new Date();
    
    // Setup geolocation button if present
    setupGeolocation();
});

// Authentication
function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('loginPassword').value;
    const username = document.getElementById('loginUsername') ? document.getElementById('loginUsername').value : 'User';
    
    if (!password) {
        alert('Please enter a password');
        return;
    }
    
    userId = simpleHash(password);
    currentUser = username || 'User';
    localStorage.setItem('userId', userId);
    localStorage.setItem('currentUser', currentUser);
    
    showMainApp();
    loadDataFromFirebase();
}

function logout() {
    userId = null;
    currentUser = null;
    localStorage.removeItem('userId');
    localStorage.removeItem('currentUser');
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('loginPassword').value = '';
}

function showMainApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    
    // Update user name in navbar if present
    const userNameEl = document.getElementById('currentUserName');
    if (userNameEl) {
        userNameEl.textContent = currentUser;
    }
    
    showDashboard();
}

// Geolocation setup
function setupGeolocation() {
    // Add click handler for "Use My Location" button if it exists
    const geoButton = document.getElementById('useLocationBtn');
    if (geoButton) {
        geoButton.addEventListener('click', getCurrentLocation);
    }
}

function getCurrentLocation() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }
    
    showSyncStatus('<i class="bi bi-crosshair"></i> Getting location...', 'syncing');
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            document.getElementById('clientLat').value = position.coords.latitude.toFixed(6);
            document.getElementById('clientLng').value = position.coords.longitude.toFixed(6);
            showSyncStatus('<i class="bi bi-check"></i> Location captured!', 'success');
        },
        function(error) {
            showSyncStatus('<i class="bi bi-x"></i> Could not get location', 'error');
            console.error('Geolocation error:', error);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// Firebase Data Management with Tenant Structure
function loadDataFromFirebase() {
    showSyncStatus('<i class="bi bi-arrow-repeat"></i> Loading...', 'syncing');
    
    // Listen for clients (tenant-specific)
    database.ref(`tenants/${userId}/clients`).on('value', (snapshot) => {
        const data = snapshot.val();
        clients = data ? Object.values(data) : [];
        updateDashboard();
        if (document.getElementById('clientsView').classList.contains('hidden') === false) {
            renderClients();
        }
        showSyncStatus('<i class="bi bi-cloud-check"></i> Synced');
    });
    
    // Listen for actions (tenant-specific)
    database.ref(`tenants/${userId}/actions`).on('value', (snapshot) => {
        const data = snapshot.val();
        actions = data ? Object.values(data) : [];
        updateDashboard();
        if (document.getElementById('actionsView').classList.contains('hidden') === false) {
            renderActions();
        }
        showSyncStatus('<i class="bi bi-cloud-check"></i> Synced');
    });
    
    // Initialize tasks if not exists (tenant-specific)
    database.ref(`tenants/${userId}/tasks`).once('value', (snapshot) => {
        if (!snapshot.exists()) {
            DEFAULT_CARE_TASKS.forEach(task => {
                database.ref(`tenants/${userId}/tasks/${task.id}`).set(task);
            });
        } else {
            tasks = Object.values(snapshot.val());
        }
    });
}

function saveClientToFirebase(client) {
    showSyncStatus('<i class="bi bi-arrow-repeat"></i> Saving...', 'syncing');
    client.lastModifiedBy = currentUser;
    client.lastModifiedAt = new Date().toISOString();
    
    return database.ref(`tenants/${userId}/clients/${client.id}`).set(client)
        .then(() => {
            showSyncStatus('<i class="bi bi-cloud-check"></i> Saved by ' + currentUser);
        })
        .catch((error) => {
            showSyncStatus('<i class="bi bi-exclamation-triangle"></i> Error saving', 'error');
            console.error('Error:', error);
        });
}

function deleteClientFromFirebase(clientId) {
    showSyncStatus('<i class="bi bi-arrow-repeat"></i> Deleting...', 'syncing');
    return database.ref(`tenants/${userId}/clients/${clientId}`).remove()
        .then(() => {
            showSyncStatus('<i class="bi bi-cloud-check"></i> Deleted');
        })
        .catch((error) => {
            showSyncStatus('<i class="bi bi-exclamation-triangle"></i> Error deleting', 'error');
            console.error('Error:', error);
        });
}

function saveActionToFirebase(action) {
    showSyncStatus('<i class="bi bi-arrow-repeat"></i> Saving...', 'syncing');
    action.loggedBy = currentUser;
    
    return database.ref(`tenants/${userId}/actions/${action.id}`).set(action)
        .then(() => {
            showSyncStatus('<i class="bi bi-cloud-check"></i> Logged by ' + currentUser);
        })
        .catch((error) => {
            showSyncStatus('<i class="bi bi-exclamation-triangle"></i> Error saving', 'error');
            console.error('Error:', error);
        });
}

function deleteActionFromFirebase(actionId) {
    showSyncStatus('<i class="bi bi-arrow-repeat"></i> Deleting...', 'syncing');
    return database.ref(`tenants/${userId}/actions/${actionId}`).remove()
        .then(() => {
            showSyncStatus('<i class="bi bi-cloud-check"></i> Deleted');
        })
        .catch((error) => {
            showSyncStatus('<i class="bi bi-exclamation-triangle"></i> Error deleting', 'error');
            console.error('Error:', error);
        });
}

// Navigation
function hideAllViews() {
    document.getElementById('dashboardView').classList.add('hidden');
    document.getElementById('clientsView').classList.add('hidden');
    document.getElementById('clientFormView').classList.add('hidden');
    document.getElementById('actionsView').classList.add('hidden');
    document.getElementById('logActionView').classList.add('hidden');
}

function showDashboard() {
    hideAllViews();
    document.getElementById('dashboardView').classList.remove('hidden');
    updateDashboard();
}

function showClients() {
    hideAllViews();
    document.getElementById('clientsView').classList.remove('hidden');
    renderClients();
}

function showActions() {
    hideAllViews();
    document.getElementById('actionsView').classList.remove('hidden');
    renderActions();
}

function showAddClientForm() {
    hideAllViews();
    document.getElementById('clientFormView').classList.remove('hidden');
    document.getElementById('clientFormTitle').textContent = 'Add Client';
    document.getElementById('clientForm').reset();
    document.getElementById('clientId').value = '';
}

function showLogActionForm() {
    hideAllViews();
    document.getElementById('logActionView').classList.remove('hidden');
    populateActionForm();
}

// Dashboard
function updateDashboard() {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === 'active').length;
    document.getElementById('statClients').textContent = totalClients;
    document.getElementById('statActiveClients').textContent = activeClients;
    document.getElementById('statActions').textContent = actions.length;
    
    // Update map
    if (typeof google !== 'undefined') {
        initMap();
    }
    
    // Recent actions
    const recentActions = actions.slice(-10).reverse();
    const recentActionsHtml = recentActions.length > 0 
        ? recentActions.map(action => {
            const client = clients.find(c => c.id === action.clientId);
            const clientName = client ? client.name : 'Unknown';
            const loggedBy = action.loggedBy || 'Unknown';
            return `
                <div class="action-item">
                    <div class="d-flex justify-content-between">
                        <div>
                            <strong>${action.taskName}</strong> - ${clientName}
                            <br><small class="text-muted">${action.date} • Logged by: ${loggedBy}</small>
                        </div>
                    </div>
                    ${action.notes ? `<p class="mb-0 mt-1"><small>${action.notes}</small></p>` : ''}
                </div>
            `;
        }).join('')
        : '<p class="text-muted">No care actions recorded yet.</p>';
    
    document.getElementById('recentActions').innerHTML = recentActionsHtml;
}

// Google Maps
let map;
let markers = [];

function initMap() {
    const mapOptions = {
        zoom: 10,
        center: clients.length > 0 
            ? { lat: clients[0].latitude, lng: clients[0].longitude }
            : { lat: 40.7128, lng: -74.0060 },
        mapTypeId: 'terrain'
    };
    
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    
    clients.forEach(client => {
        const marker = new google.maps.Marker({
            position: { lat: client.latitude, lng: client.longitude },
            map: map,
            title: client.name,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#4A90E2',
                fillOpacity: 0.8,
                strokeColor: '#2E5BBA',
                strokeWeight: 2
            }
        });
        
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px;">
                    <h6><strong>${client.name}</strong></h6>
                    <p class="mb-1"><small>${client.description || 'No description'}</small></p>
                    <p class="mb-0"><strong>Status:</strong> ${client.status || 'Active'}</p>
                </div>
            `
        });
        
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
        
        markers.push(marker);
    });
    
    if (clients.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        clients.forEach(client => {
            bounds.extend(new google.maps.LatLng(client.latitude, client.longitude));
        });
        map.fitBounds(bounds);
    }
}

// Client Management
function renderClients() {
    const clientsHtml = clients.length > 0
        ? clients.map(client => {
            const lastModified = client.lastModifiedBy ? `Last updated by ${client.lastModifiedBy}` : '';
            return `
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="card client-card h-100" onclick="editClient(${client.id})">
                        <div class="card-body">
                            <h5 class="card-title">
                                <i class="bi bi-person-heart text-primary"></i> ${client.name}
                            </h5>
                            <p class="card-text text-muted">${client.description || 'No description'}</p>
                            <ul class="list-unstyled">
                                <li><strong>Status:</strong> ${client.status || 'Active'}</li>
                                <li><strong>Age:</strong> ${client.age || 'N/A'}</li>
                                <li><strong>Care Level:</strong> ${client.careLevel || 'Standard'}</li>
                            </ul>
                            ${lastModified ? `<small class="text-muted"><i class="bi bi-person"></i> ${lastModified}</small>` : ''}
                        </div>
                        <div class="card-footer bg-light">
                            <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); editClient(${client.id})">
                                <i class="bi bi-pencil"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation(); deleteClient(${client.id})">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('')
        : '<div class="col-12"><p class="text-center text-muted">No clients yet. Add your first client!</p></div>';
    
    document.getElementById('clientsList').innerHTML = clientsHtml;
}

function handleSaveClient(e) {
    e.preventDefault();
    
    const id = document.getElementById('clientId').value;
    
    const client = {
        id: id ? parseInt(id) : Date.now(),
        name: document.getElementById('clientName').value,
        description: document.getElementById('clientDescription').value,
        latitude: parseFloat(document.getElementById('clientLat').value),
        longitude: parseFloat(document.getElementById('clientLng').value),
        age: parseInt(document.getElementById('clientAge').value),
        status: document.getElementById('clientStatus').value,
        careLevel: document.getElementById('clientCareLevel').value,
        medicalConditions: document.getElementById('clientMedicalConditions').value,
        emergencyContact: document.getElementById('clientEmergencyContact').value,
        notes: document.getElementById('clientNotes').value,
        createdAt: id ? clients.find(c => c.id === parseInt(id)).createdAt : new Date().toISOString()
    };
    
    saveClientToFirebase(client).then(() => {
        showClients();
    });
}

function editClient(id) {
    const client = clients.find(c => c.id === id);
    
    if (client) {
        hideAllViews();
        document.getElementById('clientFormView').classList.remove('hidden');
        document.getElementById('clientFormTitle').textContent = 'Edit Client';
        
        document.getElementById('clientId').value = client.id;
        document.getElementById('clientName').value = client.name;
        document.getElementById('clientDescription').value = client.description || '';
        document.getElementById('clientLat').value = client.latitude;
        document.getElementById('clientLng').value = client.longitude;
        document.getElementById('clientAge').value = client.age || '';
        document.getElementById('clientStatus').value = client.status || 'active';
        document.getElementById('clientCareLevel').value = client.careLevel || 'standard';
        document.getElementById('clientMedicalConditions').value = client.medicalConditions || '';
        document.getElementById('clientEmergencyContact').value = client.emergencyContact || '';
        document.getElementById('clientNotes').value = client.notes || '';
    }
}

function deleteClient(id) {
    if (confirm('Are you sure you want to delete this client?')) {
        deleteClientFromFirebase(id).then(() => {
            renderClients();
        });
    }
}

// Actions - Enhanced with comprehensive care task list
function populateActionForm() {
    const clientSelect = document.getElementById('actionClient');
    clientSelect.innerHTML = '<option value="">Select a client...</option>' +
        clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    
    // Group tasks by category
    const tasksByCategory = {};
    tasks.forEach(task => {
        if (!tasksByCategory[task.category]) {
            tasksByCategory[task.category] = [];
        }
        tasksByCategory[task.category].push(task);
    });
    
    // Create filter for common tasks
    const taskCheckboxesHtml = `
        <div class="col-12 mb-3">
            <div class="btn-group" role="group">
                <input type="radio" class="btn-check" name="taskFilter" id="filterAll" checked onclick="filterTasks('all')">
                <label class="btn btn-outline-primary" for="filterAll">All Tasks</label>
                
                <input type="radio" class="btn-check" name="taskFilter" id="filterCommon" onclick="filterTasks('common')">
                <label class="btn btn-outline-success" for="filterCommon">Common Only</label>
            </div>
        </div>
        ${Object.keys(tasksByCategory).sort().map(category => `
            <div class="col-md-6 mb-3">
                <h6 class="text-primary border-bottom pb-2"><i class="bi bi-tag"></i> ${category}</h6>
                ${tasksByCategory[category].map(task => `
                    <div class="form-check task-item ${task.common ? 'common-task' : ''}" data-common="${task.common}">
                        <input class="form-check-input task-checkbox" type="checkbox" value="${task.id}" id="task${task.id}">
                        <label class="form-check-label" for="task${task.id}">
                            ${task.name} ${task.common ? '<span class="badge badge-sm bg-success">Common</span>' : ''}
                        </label>
                    </div>
                `).join('')}
            </div>
        `).join('')}
    `;
    
    document.getElementById('taskCheckboxes').innerHTML = taskCheckboxesHtml;
}

function filterTasks(filter) {
    const allTasks = document.querySelectorAll('.task-item');
    allTasks.forEach(task => {
        if (filter === 'all') {
            task.style.display = '';
        } else if (filter === 'common') {
            task.style.display = task.dataset.common === 'true' ? '' : 'none';
        }
    });
}

function handleLogAction(e) {
    e.preventDefault();
    
    const clientId = parseInt(document.getElementById('actionClient').value);
    const date = document.getElementById('actionDate').value;
    const notes = document.getElementById('actionNotes').value;
    
    if (!clientId) {
        alert('Please select a client');
        return;
    }
    
    const selectedTasks = Array.from(document.querySelectorAll('.task-checkbox:checked'))
        .map(cb => parseInt(cb.value));
    
    if (selectedTasks.length === 0) {
        alert('Please select at least one task');
        return;
    }
    
    const promises = selectedTasks.map(taskId => {
        const task = tasks.find(t => t.id === taskId);
        const action = {
            id: Date.now() + Math.random(),
            clientId: clientId,
            taskId: taskId,
            taskName: task.name,
            taskCategory: task.category,
            date: date,
            notes: notes,
            createdAt: new Date().toISOString()
        };
        return saveActionToFirebase(action);
    });
    
    Promise.all(promises).then(() => {
        alert(`Successfully logged ${selectedTasks.length} care action(s) by ${currentUser}!`);
        showActions();
    });
}

function renderActions() {
    const sortedActions = [...actions].reverse();
    
    const actionsHtml = sortedActions.length > 0
        ? sortedActions.map(action => {
            const client = clients.find(c => c.id === action.clientId);
            const clientName = client ? client.name : 'Unknown';
            const loggedBy = action.loggedBy || 'Unknown';
            return `
                <div class="action-item">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <div class="d-flex align-items-center mb-1">
                                <span class="badge bg-secondary me-2">${action.taskCategory || 'Task'}</span>
                                <strong>${action.taskName}</strong>
                            </div>
                            <div class="text-muted">
                                <small>
                                    <i class="bi bi-person-heart"></i> ${clientName} • 
                                    <i class="bi bi-calendar"></i> ${action.date} • 
                                    <i class="bi bi-person"></i> ${loggedBy}
                                </small>
                            </div>
                            ${action.notes ? `<p class="mb-0 mt-2"><small>${action.notes}</small></p>` : ''}
                        </div>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteAction('${action.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('')
        : '<p class="text-muted">No care actions recorded yet.</p>';
    
    document.getElementById('actionsList').innerHTML = actionsHtml;
}

function deleteAction(id) {
    if (confirm('Delete this care action?')) {
        deleteActionFromFirebase(id).then(() => {
            renderActions();
        });
    }
}
