// HomeCare Management - Client Management Module
// Professional Client Care Coordination

// Client Management Functions
function showClientsView() {
    hideAllViews();
    document.getElementById('clientsView').classList.remove('hidden');
    renderClients();
}

function showAddClientForm() {
    hideAllViews();
    document.getElementById('clientFormView').classList.remove('hidden');
    document.getElementById('clientFormTitle').textContent = 'Add New Client';
    document.getElementById('clientForm').reset();
    document.getElementById('clientId').value = '';
    
    // Set default values
    document.getElementById('clientStatus').value = 'active';
    document.getElementById('clientCareLevel').value = 'standard';
}

function showEditClientForm(clientId) {
    const client = HomeCareCore.getClient(clientId);
    if (!client) {
        alert('Client not found');
        return;
    }
    
    hideAllViews();
    document.getElementById('clientFormView').classList.remove('hidden');
    document.getElementById('clientFormTitle').textContent = 'Edit Client';
    
    // Populate form with client data
    document.getElementById('clientId').value = client.id;
    document.getElementById('clientName').value = client.name || '';
    document.getElementById('clientDescription').value = client.description || '';
    document.getElementById('clientAge').value = client.age || '';
    document.getElementById('clientStatus').value = client.status || 'active';
    document.getElementById('clientCareLevel').value = client.careLevel || 'standard';
    document.getElementById('clientMedicalConditions').value = client.medicalConditions || '';
    document.getElementById('clientEmergencyContact').value = client.emergencyContact || '';
    document.getElementById('clientAddress').value = client.address || '';
    document.getElementById('clientLat').value = client.latitude || '';
    document.getElementById('clientLng').value = client.longitude || '';
    document.getElementById('clientPhone').value = client.phone || '';
    document.getElementById('clientEmail').value = client.email || '';
    document.getElementById('clientNotes').value = client.notes || '';
}

function renderClients() {
    const clients = HomeCareCore.getClients();
    const clientsList = document.getElementById('clientsList');
    
    if (clients.length === 0) {
        clientsList.innerHTML = `
            <div class="col-12">
                <div class="card text-center py-5">
                    <div class="card-body">
                        <i class="bi bi-people text-muted" style="font-size: 3rem;"></i>
                        <h5 class="card-title mt-3">No Clients Yet</h5>
                        <p class="card-text text-muted">Start by adding your first client to begin care coordination.</p>
                        <button class="btn btn-primary" onclick="showAddClientForm()">
                            <i class="bi bi-person-plus me-1"></i> Add First Client
                        </button>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    const clientsHtml = clients.map(client => {
        const lastModified = client.lastModifiedBy ? `Last updated by ${client.lastModifiedBy}` : '';
        const careLevelClass = getCareLevelClass(client.careLevel);
        const statusClass = getStatusClass(client.status);
        
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card client-card h-100" onclick="showClientDetails('${client.id}')">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-person-heart text-primary me-2"></i>
                                ${client.name}
                            </h5>
                            <span class="badge ${statusClass}">${client.status}</span>
                        </div>
                        
                        <p class="card-text text-muted mb-3">${client.description || 'No description provided'}</p>
                        
                        <div class="row g-2 mb-3">
                            <div class="col-6">
                                <small class="text-muted">Age:</small>
                                <div class="fw-medium">${client.age || 'N/A'}</div>
                            </div>
                            <div class="col-6">
                                <small class="text-muted">Care Level:</small>
                                <div class="fw-medium">
                                    <span class="badge ${careLevelClass}">${client.careLevel || 'Standard'}</span>
                                </div>
                            </div>
                        </div>
                        
                        ${client.medicalConditions ? `
                            <div class="mb-3">
                                <small class="text-muted">Medical Conditions:</small>
                                <div class="small text-truncate" title="${client.medicalConditions}">
                                    ${client.medicalConditions}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${lastModified ? `
                            <small class="text-muted">
                                <i class="bi bi-person me-1"></i> ${lastModified}
                            </small>
                        ` : ''}
                    </div>
                    
                    <div class="card-footer bg-light">
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); showEditClientForm('${client.id}')">
                                <i class="bi bi-pencil me-1"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-outline-info" onclick="event.stopPropagation(); showClientDetails('${client.id}')">
                                <i class="bi bi-eye me-1"></i> View
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation(); deleteClient('${client.id}')">
                                <i class="bi bi-trash me-1"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    clientsList.innerHTML = clientsHtml;
}

function showClientDetails(clientId) {
    const client = HomeCareCore.getClient(clientId);
    if (!client) {
        alert('Client not found');
        return;
    }
    
    // Create modal for client details
    const modalHtml = `
        <div class="modal fade" id="clientDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-person-heart text-primary me-2"></i>
                            ${client.name} - Client Details
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6 class="text-primary">Basic Information</h6>
                                <table class="table table-sm">
                                    <tr>
                                        <td><strong>Name:</strong></td>
                                        <td>${client.name}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Age:</strong></td>
                                        <td>${client.age || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Status:</strong></td>
                                        <td><span class="badge ${getStatusClass(client.status)}">${client.status}</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Care Level:</strong></td>
                                        <td><span class="badge ${getCareLevelClass(client.careLevel)}">${client.careLevel}</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Phone:</strong></td>
                                        <td>${client.phone || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Email:</strong></td>
                                        <td>${client.email || 'N/A'}</td>
                                    </tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <h6 class="text-primary">Care Information</h6>
                                <table class="table table-sm">
                                    <tr>
                                        <td><strong>Medical Conditions:</strong></td>
                                        <td>${client.medicalConditions || 'None listed'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Emergency Contact:</strong></td>
                                        <td>${client.emergencyContact || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Address:</strong></td>
                                        <td>${client.address || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Location:</strong></td>
                                        <td>
                                            ${client.latitude && client.longitude ? 
                                                `${client.latitude.toFixed(4)}, ${client.longitude.toFixed(4)}` : 
                                                'Not specified'
                                            }
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                        
                        ${client.description ? `
                            <div class="mt-3">
                                <h6 class="text-primary">Description</h6>
                                <p class="text-muted">${client.description}</p>
                            </div>
                        ` : ''}
                        
                        ${client.notes ? `
                            <div class="mt-3">
                                <h6 class="text-primary">Notes</h6>
                                <p class="text-muted">${client.notes}</p>
                            </div>
                        ` : ''}
                        
                        <div class="mt-3">
                            <h6 class="text-primary">Recent Care Actions</h6>
                            <div id="clientRecentActions">
                                ${getClientRecentActions(clientId)}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="showEditClientForm('${client.id}'); bootstrap.Modal.getInstance(document.getElementById('clientDetailsModal')).hide();">
                            <i class="bi bi-pencil me-1"></i> Edit Client
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('clientDetailsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('clientDetailsModal'));
    modal.show();
}

function getClientRecentActions(clientId) {
    const actions = HomeCareCore.getCareActionsForClient(clientId);
    const recentActions = actions.slice(-5).reverse();
    
    if (recentActions.length === 0) {
        return '<p class="text-muted">No care actions recorded yet.</p>';
    }
    
    return recentActions.map(action => `
        <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
            <div>
                <strong>${action.taskName}</strong>
                <br>
                <small class="text-muted">
                    ${HomeCareCore.formatDate(action.date)} at ${action.time || 'N/A'}
                </small>
            </div>
            <span class="badge bg-secondary">${action.taskCategory}</span>
        </div>
    `).join('');
}

function handleSaveClient(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const clientData = {
        id: document.getElementById('clientId').value || null,
        name: document.getElementById('clientName').value,
        description: document.getElementById('clientDescription').value,
        age: parseInt(document.getElementById('clientAge').value) || null,
        status: document.getElementById('clientStatus').value,
        careLevel: document.getElementById('clientCareLevel').value,
        medicalConditions: document.getElementById('clientMedicalConditions').value,
        emergencyContact: document.getElementById('clientEmergencyContact').value,
        address: document.getElementById('clientAddress').value,
        latitude: parseFloat(document.getElementById('clientLat').value) || null,
        longitude: parseFloat(document.getElementById('clientLng').value) || null,
        phone: document.getElementById('clientPhone').value,
        email: document.getElementById('clientEmail').value,
        notes: document.getElementById('clientNotes').value
    };
    
    // Validation
    if (!clientData.name.trim()) {
        alert('Client name is required');
        return;
    }
    
    try {
        HomeCareCore.saveClient(clientData).then(() => {
            showSyncStatus('Client saved successfully', 'success');
            showClientsView();
        }).catch(error => {
            console.error('Error saving client:', error);
            showSyncStatus('Error saving client', 'error');
        });
    } catch (error) {
        console.error('Error saving client:', error);
        showSyncStatus('Error saving client', 'error');
    }
}

function deleteClient(clientId) {
    const client = HomeCareCore.getClient(clientId);
    if (!client) {
        alert('Client not found');
        return;
    }
    
    if (confirm(`Are you sure you want to delete client "${client.name}"? This action cannot be undone.`)) {
        try {
            HomeCareCore.deleteClient(clientId).then(() => {
                showSyncStatus('Client deleted successfully', 'success');
                renderClients();
            }).catch(error => {
                console.error('Error deleting client:', error);
                showSyncStatus('Error deleting client', 'error');
            });
        } catch (error) {
            console.error('Error deleting client:', error);
            showSyncStatus('Error deleting client', 'error');
        }
    }
}

// Utility Functions
function getCareLevelClass(careLevel) {
    switch (careLevel) {
        case 'standard': return 'bg-primary';
        case 'intensive': return 'bg-warning';
        case 'specialized': return 'bg-info';
        case 'palliative': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

function getStatusClass(status) {
    switch (status) {
        case 'active': return 'bg-success';
        case 'inactive': return 'bg-secondary';
        case 'discharged': return 'bg-info';
        default: return 'bg-secondary';
    }
}

function hideAllViews() {
    const views = ['dashboardView', 'clientsView', 'clientFormView', 'actionsView', 'logActionView'];
    views.forEach(viewId => {
        const element = document.getElementById(viewId);
        if (element) {
            element.classList.add('hidden');
        }
    });
}

function showSyncStatus(message, type = 'success') {
    const indicator = document.getElementById('syncIndicator');
    const syncText = document.getElementById('syncText');
    
    if (!indicator || !syncText) return;
    
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

// Update UI function for core module
function updateClientsUI() {
    if (document.getElementById('clientsView') && !document.getElementById('clientsView').classList.contains('hidden')) {
        renderClients();
    }
    
    // Update dashboard stats if visible
    if (document.getElementById('dashboardView') && !document.getElementById('dashboardView').classList.contains('hidden')) {
        updateDashboardStats();
    }
}

function updateDashboardStats() {
    const stats = HomeCareCore.getDashboardStats();
    
    const statClients = document.getElementById('statClients');
    const statActiveClients = document.getElementById('statActiveClients');
    
    if (statClients) statClients.textContent = stats.totalClients;
    if (statActiveClients) statActiveClients.textContent = stats.activeClients;
}

// Export functions
window.HomeCareClients = {
    showClientsView,
    showAddClientForm,
    showEditClientForm,
    showClientDetails,
    renderClients,
    handleSaveClient,
    deleteClient,
    updateClientsUI,
    updateDashboardStats
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set up form event listener
    const clientForm = document.getElementById('clientForm');
    if (clientForm) {
        clientForm.addEventListener('submit', handleSaveClient);
    }
    
    console.log('HomeCare Clients module loaded');
});
