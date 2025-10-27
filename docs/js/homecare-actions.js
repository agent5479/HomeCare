// HomeCare Management - Care Actions Module
// Professional Care Action Logging and Management

// Care Actions Management Functions
function showActionsView() {
    hideAllViews();
    document.getElementById('actionsView').classList.remove('hidden');
    renderCareActions();
}

function showLogActionForm() {
    hideAllViews();
    document.getElementById('logActionView').classList.remove('hidden');
    populateActionForm();
}

function renderCareActions() {
    const actions = HomeCareCore.getCareActions();
    const actionsList = document.getElementById('actionsList');
    
    if (actions.length === 0) {
        actionsList.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-clipboard-check text-muted" style="font-size: 3rem;"></i>
                <h5 class="mt-3">No Care Actions Yet</h5>
                <p class="text-muted">Start logging care actions to track the care provided to your clients.</p>
                <button class="btn btn-primary" onclick="showLogActionForm()">
                    <i class="bi bi-plus-circle me-1"></i> Log First Action
                </button>
            </div>
        `;
        return;
    }
    
    // Sort actions by date (most recent first)
    const sortedActions = [...actions].sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
    
    const actionsHtml = sortedActions.map(action => {
        const client = HomeCareCore.getClient(action.clientId);
        const clientName = client ? client.name : 'Unknown Client';
        const loggedBy = action.loggedBy || 'Unknown';
        const categoryClass = getCategoryClass(action.taskCategory);
        
        return `
            <div class="action-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <div class="d-flex align-items-center mb-2">
                            <span class="badge ${categoryClass} me-2">${action.taskCategory || 'Task'}</span>
                            <strong class="me-2">${action.taskName}</strong>
                            <span class="badge bg-secondary">${action.priority || 'Normal'}</span>
                        </div>
                        
                        <div class="text-muted mb-2">
                            <div class="row">
                                <div class="col-md-6">
                                    <i class="bi bi-person-heart me-1"></i> ${clientName}
                                </div>
                                <div class="col-md-6">
                                    <i class="bi bi-calendar me-1"></i> ${HomeCareCore.formatDate(action.date)}
                                    ${action.time ? `at ${action.time}` : ''}
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <i class="bi bi-person me-1"></i> Logged by: ${loggedBy}
                                </div>
                                <div class="col-md-6">
                                    <i class="bi bi-check-circle me-1"></i> Status: ${action.status || 'Completed'}
                                </div>
                            </div>
                        </div>
                        
                        ${action.notes ? `
                            <div class="mt-2">
                                <strong>Notes:</strong>
                                <p class="mb-0 text-muted">${action.notes}</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-outline-info" onclick="showActionDetails('${action.id}')" title="View Details">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteCareAction('${action.id}')" title="Delete Action">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    actionsList.innerHTML = actionsHtml;
}

function showActionDetails(actionId) {
    const action = HomeCareCore.getCareActions().find(a => a.id === actionId);
    if (!action) {
        alert('Care action not found');
        return;
    }
    
    const client = HomeCareCore.getClient(action.clientId);
    const clientName = client ? client.name : 'Unknown Client';
    
    // Create modal for action details
    const modalHtml = `
        <div class="modal fade" id="actionDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-clipboard-check text-primary me-2"></i>
                            Care Action Details
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6 class="text-primary">Action Information</h6>
                                <table class="table table-sm">
                                    <tr>
                                        <td><strong>Task:</strong></td>
                                        <td>${action.taskName}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Category:</strong></td>
                                        <td><span class="badge ${getCategoryClass(action.taskCategory)}">${action.taskCategory}</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Priority:</strong></td>
                                        <td><span class="badge bg-secondary">${action.priority || 'Normal'}</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Status:</strong></td>
                                        <td><span class="badge bg-success">${action.status || 'Completed'}</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Date:</strong></td>
                                        <td>${HomeCareCore.formatDate(action.date)}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Time:</strong></td>
                                        <td>${action.time || 'Not specified'}</td>
                                    </tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <h6 class="text-primary">Client Information</h6>
                                <table class="table table-sm">
                                    <tr>
                                        <td><strong>Client:</strong></td>
                                        <td>${clientName}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Logged By:</strong></td>
                                        <td>${action.loggedBy || 'Unknown'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Created:</strong></td>
                                        <td>${HomeCareCore.formatDateTime(action.createdAt)}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                        
                        ${action.notes ? `
                            <div class="mt-3">
                                <h6 class="text-primary">Notes</h6>
                                <div class="bg-light p-3 rounded">
                                    <p class="mb-0">${action.notes}</p>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-outline-danger" onclick="deleteCareAction('${action.id}'); bootstrap.Modal.getInstance(document.getElementById('actionDetailsModal')).hide();">
                            <i class="bi bi-trash me-1"></i> Delete Action
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('actionDetailsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('actionDetailsModal'));
    modal.show();
}

function populateActionForm() {
    const clients = HomeCareCore.getClients();
    const careTasks = HomeCareCore.getCareTasks();
    
    // Populate client dropdown
    const clientSelect = document.getElementById('actionClient');
    clientSelect.innerHTML = '<option value="">Select a client...</option>' +
        clients.map(client => `<option value="${client.id}">${client.name}</option>`).join('');
    
    // Group tasks by category
    const tasksByCategory = {};
    careTasks.forEach(task => {
        if (!tasksByCategory[task.category]) {
            tasksByCategory[task.category] = [];
        }
        tasksByCategory[task.category].push(task);
    });
    
    // Create task checkboxes
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
                <h6 class="text-primary border-bottom pb-2">
                    <i class="bi bi-tag me-1"></i> ${category}
                </h6>
                ${tasksByCategory[category].map(task => `
                    <div class="form-check task-item ${task.common ? 'common-task' : ''}" data-common="${task.common}">
                        <input class="form-check-input task-checkbox" type="checkbox" value="${task.id}" id="task${task.id}">
                        <label class="form-check-label" for="task${task.id}">
                            ${task.name}
                            ${task.common ? '<span class="badge bg-success ms-1">Common</span>' : ''}
                        </label>
                        ${task.description ? `<small class="text-muted d-block">${task.description}</small>` : ''}
                    </div>
                `).join('')}
            </div>
        `).join('')}
    `;
    
    document.getElementById('taskCheckboxes').innerHTML = taskCheckboxesHtml;
    
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('actionDate').value = today;
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
    
    const clientId = document.getElementById('actionClient').value;
    const date = document.getElementById('actionDate').value;
    const time = document.getElementById('actionTime') ? document.getElementById('actionTime').value : '';
    const notes = document.getElementById('actionNotes').value;
    const priority = document.getElementById('actionPriority') ? document.getElementById('actionPriority').value : 'normal';
    
    if (!clientId) {
        alert('Please select a client');
        return;
    }
    
    const selectedTasks = Array.from(document.querySelectorAll('.task-checkbox:checked'))
        .map(cb => parseInt(cb.value));
    
    if (selectedTasks.length === 0) {
        alert('Please select at least one care task');
        return;
    }
    
    const careTasks = HomeCareCore.getCareTasks();
    const promises = selectedTasks.map(taskId => {
        const task = careTasks.find(t => t.id === taskId);
        const actionData = {
            clientId: clientId,
            taskId: taskId,
            taskName: task.name,
            taskCategory: task.category,
            date: date,
            time: time,
            notes: notes,
            priority: priority,
            status: 'completed'
        };
        return HomeCareCore.saveCareAction(actionData);
    });
    
    Promise.all(promises).then(() => {
        showSyncStatus(`Successfully logged ${selectedTasks.length} care action(s)!`, 'success');
        showActionsView();
    }).catch(error => {
        console.error('Error logging care actions:', error);
        showSyncStatus('Error logging care actions', 'error');
    });
}

function deleteCareAction(actionId) {
    const action = HomeCareCore.getCareActions().find(a => a.id === actionId);
    if (!action) {
        alert('Care action not found');
        return;
    }
    
    if (confirm(`Are you sure you want to delete this care action: "${action.taskName}"? This action cannot be undone.`)) {
        try {
            HomeCareCore.deleteCareAction(actionId).then(() => {
                showSyncStatus('Care action deleted successfully', 'success');
                renderCareActions();
            }).catch(error => {
                console.error('Error deleting care action:', error);
                showSyncStatus('Error deleting care action', 'error');
            });
        } catch (error) {
            console.error('Error deleting care action:', error);
            showSyncStatus('Error deleting care action', 'error');
        }
    }
}

// Utility Functions
function getCategoryClass(category) {
    switch (category) {
        case 'Personal Care': return 'bg-primary';
        case 'Medical Care': return 'bg-danger';
        case 'Daily Living': return 'bg-success';
        case 'Emotional Support': return 'bg-info';
        case 'Safety & Monitoring': return 'bg-warning';
        case 'Specialized Care': return 'bg-secondary';
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
function updateCareActionsUI() {
    if (document.getElementById('actionsView') && !document.getElementById('actionsView').classList.contains('hidden')) {
        renderCareActions();
    }
    
    // Update dashboard stats if visible
    if (document.getElementById('dashboardView') && !document.getElementById('dashboardView').classList.contains('hidden')) {
        updateDashboardStats();
    }
}

function updateDashboardStats() {
    const stats = HomeCareCore.getDashboardStats();
    
    const statActions = document.getElementById('statActions');
    const statToday = document.getElementById('statToday');
    
    if (statActions) statActions.textContent = stats.totalActions;
    if (statToday) statToday.textContent = stats.todayActions;
}

// Export functions
window.HomeCareActions = {
    showActionsView,
    showLogActionForm,
    renderCareActions,
    showActionDetails,
    populateActionForm,
    filterTasks,
    handleLogAction,
    deleteCareAction,
    updateCareActionsUI,
    updateDashboardStats
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set up form event listener
    const actionForm = document.getElementById('actionForm');
    if (actionForm) {
        actionForm.addEventListener('submit', handleLogAction);
    }
    
    console.log('HomeCare Actions module loaded');
});
