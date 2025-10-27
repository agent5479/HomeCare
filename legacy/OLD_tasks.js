// BeeMarshall - Task Management Module

// Note: COMPREHENSIVE_TASKS is defined in core.js
// This module uses the global COMPREHENSIVE_TASKS variable

// Helper function to safely get task name (handles deleted tasks)
function getTaskDisplayName(taskName, taskId) {
    // If task exists in current tasks, use it
    const currentTask = tasks.find(t => t.name === taskName || t.id === taskId);
    if (currentTask) {
        return currentTask.name;
    }
    
    // Check if it's a deleted task
    if (taskId && deletedTasks && deletedTasks[taskId]) {
        return `[Deleted: ${deletedTasks[taskId].name}]`;
    }
    
    // Fallback to the stored name with deleted indicator
    if (taskName) {
        return `[Deleted: ${taskName}]`;
    }
    
    // Try to find in COMPREHENSIVE_TASKS if available
    if (typeof COMPREHENSIVE_TASKS !== 'undefined' && taskId) {
        const comprehensiveTask = COMPREHENSIVE_TASKS.find(t => t.id === taskId);
        if (comprehensiveTask) {
            return comprehensiveTask.name;
        }
    }
    
    return '[Unknown Task]';
}

// Task Management Functions
function showTasks() {
    if (!isAdmin) {
        alert('Only administrators can manage tasks.');
        return;
    }
    
    console.log('🔄 Switching to Tasks view...');
    hideAllViews();
    
    // Small delay to ensure all views are hidden before showing new view
    setTimeout(() => {
        const view = document.getElementById('tasksView');
        if (view) {
            view.classList.remove('hidden');
        }
        
        if (typeof updateActiveNav === 'function') {
            updateActiveNav('Task');
        }
        
        renderTasksList();
        
        // Set up toggle event listeners
        setupTaskDisplayToggles();
        
        // Show/hide honey type management for admins
        if (typeof isAdmin !== 'undefined' && isAdmin) {
            document.getElementById('honeyTypeManagement').style.display = 'block';
            loadHoneyTypes();
        }
        
        console.log('✅ Tasks view displayed');
    }, 10);
}

// Make renderTasksList globally accessible
window.renderTasksList = function(filterCategory = 'All') {
    // Use the comprehensive tasks list directly
    const tasksToUse = typeof tasks !== 'undefined' ? tasks : (typeof COMPREHENSIVE_TASKS !== 'undefined' ? COMPREHENSIVE_TASKS : []);
    
    // Filter tasks by category if specified
    let filteredTasks = tasksToUse;
    if (filterCategory !== 'All') {
        filteredTasks = tasksToUse.filter(task => task.category === filterCategory);
    }
    
    // Check display mode
    const isGrouped = document.getElementById('taskGroupingToggle')?.checked ?? true;
    const isAlphabetical = document.getElementById('taskAlphabeticalToggle')?.checked ?? false;
    
    let html = '';
    
    if (isAlphabetical) {
        // Display all tasks alphabetically
        const sortedTasks = filteredTasks.sort((a, b) => a.name.localeCompare(b.name));
        
        html = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th style="width: 40%">Task Name</th>
                            <th style="width: 20%">Category</th>
                            <th style="width: 20%">Common</th>
                            <th style="width: 20%">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedTasks.map(task => `
                            <tr>
                                <td>${task.name}</td>
                                <td><span class="badge bg-primary">${task.category}</span></td>
                                <td>
                                    ${task.common 
                                        ? '<span class="badge bg-success">Quick List</span>' 
                                        : '<span class="badge bg-secondary">Full List</span>'}
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" onclick="editTask(${task.id})" title="Edit">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${task.id})" title="Delete">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (isGrouped) {
        // Group tasks by category (original behavior)
        const tasksByCategory = {};
        filteredTasks.forEach(task => {
            if (!tasksByCategory[task.category]) {
                tasksByCategory[task.category] = [];
            }
            tasksByCategory[task.category].push(task);
        });
        
        // Sort categories alphabetically
        const sortedCategories = Object.keys(tasksByCategory).sort();
        
        html = sortedCategories.map(category => `
            <div class="category-section mb-4">
                <div class="d-flex justify-content-between align-items-center category-header">
                    <h5 class="mb-0"><i class="bi bi-folder2-open"></i> ${category}</h5>
                    <span class="badge bg-dark">${tasksByCategory[category].length} tasks</span>
                </div>
                <div class="table-responsive mt-2">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th style="width: 60%">Task Name</th>
                                <th style="width: 20%">Common</th>
                                <th style="width: 20%">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tasksByCategory[category].map(task => `
                                <tr>
                                    <td>${task.name}</td>
                                    <td>
                                        ${task.common 
                                            ? '<span class="badge bg-success">Quick List</span>' 
                                            : '<span class="badge bg-secondary">Full List</span>'}
                                    </td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-primary" onclick="editTask(${task.id})" title="Edit">
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${task.id})" title="Delete">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `).join('');
    }
    
    document.getElementById('tasksList').innerHTML = html || '<p class="text-muted">No tasks found. Add your first task above!</p>';
};

// Add new task
function handleAddTask() {
    const categorySelect = document.getElementById('newTaskCategory').value;
    const categoryCustom = document.getElementById('newTaskCategoryCustom').value.trim();
    const category = categoryCustom || categorySelect;
    const name = document.getElementById('newTaskName').value.trim();
    const common = document.getElementById('newTaskCommon').checked;
    
    if (!category) {
        beeMarshallAlert('Please select or enter a category.', 'warning');
        return;
    }
    
    if (!name) {
        beeMarshallAlert('Please enter a task name.', 'warning');
        return;
    }
    
    // Generate new ID (max existing ID + 1)
    const maxId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) : 0;
    const newId = maxId + 1;
    
    const newTask = {
        id: newId,
        name: name,
        category: category,
        common: common,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.username
    };
    
    // Save to Firebase
    database.ref(`tasks/${newId}`).set(newTask).then(() => {
        beeMarshallAlert(`✅ Task "${name}" added successfully!`, 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addTaskModal'));
        if (modal) {
            modal.hide();
        }
        
        // Tasks will be reloaded automatically from Firebase listener
    }).catch(error => {
        console.error('Error adding task:', error);
        beeMarshallAlert('❌ Error adding task. Please try again.', 'error');
    });
}

function editTask(taskId) {
    // Only allow this function when in the task management view
    const tasksView = document.getElementById('tasksView');
    if (!tasksView || tasksView.classList.contains('hidden')) {
        beeMarshallAlert('Please navigate to Task Management to edit tasks.', 'info');
        // Switch to task management view
        showTasks();
        return;
    }
    
    const tasksToUse = typeof tasks !== 'undefined' ? tasks : (typeof COMPREHENSIVE_TASKS !== 'undefined' ? COMPREHENSIVE_TASKS : []);
    const task = tasksToUse.find(t => t.id === taskId);
    if (!task) return;
    
    // Create a modal for better task editing experience
    const modalHtml = `
        <div class="modal fade" id="editTaskModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Task</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editTaskForm">
                            <input type="hidden" id="editTaskId" value="${taskId}">
                            <div class="mb-3">
                                <label for="editTaskName" class="form-label">Task Name *</label>
                                <input type="text" class="form-control" id="editTaskName" value="${task.name}" required>
                            </div>
                            <div class="mb-3">
                                <label for="editTaskCategory" class="form-label">Category *</label>
                                <select class="form-select" id="editTaskCategory" required>
                                    <option value="Inspection" ${task.category === 'Inspection' ? 'selected' : ''}>Inspection</option>
                                    <option value="Health" ${task.category === 'Health' ? 'selected' : ''}>Health</option>
                                    <option value="Management" ${task.category === 'Management' ? 'selected' : ''}>Management</option>
                                    <option value="Harvest" ${task.category === 'Harvest' ? 'selected' : ''}>Harvest</option>
                                    <option value="Maintenance" ${task.category === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
                                    <option value="Feeding" ${task.category === 'Feeding' ? 'selected' : ''}>Feeding</option>
                                    <option value="Problems" ${task.category === 'Problems' ? 'selected' : ''}>Problems</option>
                                    <option value="Administration" ${task.category === 'Administration' ? 'selected' : ''}>Administration</option>
                                    <option value="Seasonal" ${task.category === 'Seasonal' ? 'selected' : ''}>Seasonal</option>
                                    <option value="Emergency" ${task.category === 'Emergency' ? 'selected' : ''}>Emergency</option>
                                    <option value="Custom" ${task.category === 'Custom' ? 'selected' : ''}>Custom</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="editTaskCategoryCustom" class="form-label">Custom Category</label>
                                <input type="text" class="form-control" id="editTaskCategoryCustom" 
                                       value="${task.category && !['Inspection', 'Health', 'Management', 'Harvest', 'Maintenance', 'Feeding', 'Problems', 'Administration', 'Seasonal', 'Emergency', 'Custom'].includes(task.category) ? task.category : ''}"
                                       placeholder="Enter custom category (e.g., Regional Practice)">
                                <div class="form-text">Leave blank if using predefined category</div>
                            </div>
                            <div class="mb-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="editTaskCommon" ${task.common ? 'checked' : ''}>
                                    <label class="form-check-label" for="editTaskCommon">
                                        Add to Quick List (commonly used tasks)
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="handleEditTask()">Update Task</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('editTaskModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editTaskModal'));
    modal.show();
    
    // Clean up modal when hidden
    document.getElementById('editTaskModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function handleEditTask() {
    const taskId = parseInt(document.getElementById('editTaskId').value);
    const categorySelect = document.getElementById('editTaskCategory').value;
    const categoryCustom = document.getElementById('editTaskCategoryCustom').value.trim();
    const category = categoryCustom || categorySelect;
    const name = document.getElementById('editTaskName').value.trim();
    const common = document.getElementById('editTaskCommon').checked;
    
    if (!category) {
        beeMarshallAlert('Please select or enter a category.', 'warning');
        return;
    }
    
    if (!name) {
        beeMarshallAlert('Please enter a task name.', 'warning');
        return;
    }
    
    const updates = {
        name: name,
        category: category,
        common: common,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.username
    };
    
    // Update in Firebase
    database.ref(`tasks/${taskId}`).update(updates).then(() => {
        beeMarshallAlert('✅ Task updated successfully!', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
        if (modal) {
            modal.hide();
        }
        
        // Tasks will be reloaded automatically from Firebase listener
    }).catch(error => {
        console.error('Error updating task:', error);
        beeMarshallAlert('❌ Error updating task. Please try again.', 'error');
    });
}

function deleteTask(taskId) {
    // Only allow this function when in the task management view
    const tasksView = document.getElementById('tasksView');
    if (!tasksView || tasksView.classList.contains('hidden')) {
        beeMarshallAlert('Please navigate to Task Management to delete tasks.', 'info');
        // Switch to task management view
        showTasks();
        return;
    }
    
    const tasksToUse = typeof tasks !== 'undefined' ? tasks : (typeof COMPREHENSIVE_TASKS !== 'undefined' ? COMPREHENSIVE_TASKS : []);
    const task = tasksToUse.find(t => t.id === taskId);
    if (!task) return;
    
    // Check how many actions use this task
    const affectedActions = actions.filter(a => a.task === task.name || a.taskId === taskId);
    const affectedScheduled = scheduledTasks.filter(t => t.taskId === taskId);
    const totalAffected = affectedActions.length + affectedScheduled.length;
    
    let warningMessage = `⚠️ DELETE TASK\n\n` +
        `Task: ${task.name}\n` +
        `Category: ${task.category}\n\n`;
    
    if (totalAffected > 0) {
        warningMessage += `🚨 WARNING: This task is used in ${totalAffected} record(s):\n`;
        if (affectedActions.length > 0) {
            warningMessage += `   • ${affectedActions.length} completed action(s)\n`;
        }
        if (affectedScheduled.length > 0) {
            warningMessage += `   • ${affectedScheduled.length} scheduled task(s)\n`;
        }
        warningMessage += `\n`;
        warningMessage += `These records will show as "[Deleted: ${task.name}]" but will NOT be deleted.\n`;
        warningMessage += `Historical data will be preserved.\n\n`;
    }
    
    warningMessage += `Are you sure you want to delete this task?`;
    
    const confirmDelete = confirm(warningMessage);
    
    if (confirmDelete) {
        // Archive the task name before deleting for reference
        database.ref(`deletedTasks/${taskId}`).set({
            id: taskId,
            name: task.name,
            category: task.category,
            deletedAt: new Date().toISOString(),
            deletedBy: currentUser.username
        });
        
        database.ref(`tasks/${taskId}`).remove().then(() => {
            if (totalAffected > 0) {
                alert(`✅ Task deleted.\n\n${totalAffected} historical record(s) will now show as "[Deleted: ${task.name}]"`);
            } else {
                beeMarshallAlert('✅ Task deleted successfully!', 'success');
            }
            // Tasks will be reloaded automatically from Firebase listener
        }).catch(error => {
            console.error('Error deleting task:', error);
            beeMarshallAlert('❌ Error deleting task. Please try again.', 'error');
        });
    }
}

// Additional task management functions
function showAddTaskForm() {
    // Only allow this function when in the task management view
    const tasksView = document.getElementById('tasksView');
    if (!tasksView || tasksView.classList.contains('hidden')) {
        beeMarshallAlert('Please navigate to Task Management to add tasks.', 'info');
        // Switch to task management view
        showTasks();
        return;
    }
    
    // Create a modal for better task creation experience
    const modalHtml = `
        <div class="modal fade" id="addTaskModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add New Task</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addTaskForm">
                            <div class="mb-3">
                                <label for="newTaskName" class="form-label">Task Name *</label>
                                <input type="text" class="form-control" id="newTaskName" required 
                                       placeholder="e.g., Check queen cells, Inspect for mites">
                            </div>
                            <div class="mb-3">
                                <label for="newTaskCategory" class="form-label">Category *</label>
                                <select class="form-select" id="newTaskCategory" required>
                                    <option value="">Select category...</option>
                                    <option value="Inspection">Inspection</option>
                                    <option value="Health">Health</option>
                                    <option value="Management">Management</option>
                                    <option value="Harvest">Harvest</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Feeding">Feeding</option>
                                    <option value="Problems">Problems</option>
                                    <option value="Administration">Administration</option>
                                    <option value="Seasonal">Seasonal</option>
                                    <option value="Emergency">Emergency</option>
                                    <option value="Custom">Custom</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="newTaskCategoryCustom" class="form-label">Custom Category</label>
                                <input type="text" class="form-control" id="newTaskCategoryCustom" 
                                       placeholder="Enter custom category (e.g., Regional Practice)">
                                <div class="form-text">Leave blank if using predefined category</div>
                            </div>
                            <div class="mb-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="newTaskCommon">
                                    <label class="form-check-label" for="newTaskCommon">
                                        Add to Quick List (commonly used tasks)
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="handleAddTask()">Add Task</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('addTaskModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addTaskModal'));
    modal.show();
    
    // Clean up modal when hidden
    document.getElementById('addTaskModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function filterTasksByCategory(category) {
    renderTasksList(category);
}

// Task Display Toggle Functions
function setupTaskDisplayToggles() {
    const groupingToggle = document.getElementById('taskGroupingToggle');
    const alphabeticalToggle = document.getElementById('taskAlphabeticalToggle');
    
    if (groupingToggle) {
        groupingToggle.addEventListener('change', function() {
            if (this.checked) {
                alphabeticalToggle.checked = false;
            }
            renderTasksList();
        });
    }
    
    if (alphabeticalToggle) {
        alphabeticalToggle.addEventListener('change', function() {
            if (this.checked) {
                groupingToggle.checked = false;
            }
            renderTasksList();
        });
    }
}

// Honey Type Management Functions
function loadHoneyTypes() {
    if (typeof HONEY_TYPES === 'undefined') {
        console.error('HONEY_TYPES not defined');
        return;
    }
    
    const container = document.getElementById('honeyTypesList');
    if (!container) return;
    
    container.innerHTML = HONEY_TYPES.map((type, index) => `
        <div class="list-group-item d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
                <span class="me-2">${type}</span>
                <span class="badge bg-success">Active</span>
            </div>
            <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary" onclick="editHoneyType(${index})" title="Edit">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-outline-warning" onclick="toggleHoneyType(${index})" title="Deactivate">
                    <i class="bi bi-eye-slash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function addHoneyType() {
    const input = document.getElementById('newHoneyType');
    const newType = input.value.trim();
    
    if (!newType) {
        beeMarshallAlert('Please enter a honey type name.', 'warning');
        return;
    }
    
    if (HONEY_TYPES.includes(newType)) {
        beeMarshallAlert('This honey type already exists.', 'warning');
        return;
    }
    
    // Add to global array
    HONEY_TYPES.push(newType);
    
    // Save to Firebase
    const tenantPath = currentTenantId ? `tenants/${currentTenantId}/honeyTypes` : 'honeyTypes';
    database.ref(tenantPath).set(HONEY_TYPES).then(() => {
        beeMarshallAlert(`✅ Honey type "${newType}" added successfully!`, 'success');
        input.value = '';
        loadHoneyTypes();
    }).catch(error => {
        console.error('Error adding honey type:', error);
        beeMarshallAlert('❌ Error adding honey type. Please try again.', 'error');
    });
}

function editHoneyType(index) {
    const currentType = HONEY_TYPES[index];
    const newType = prompt('Edit honey type name:', currentType);
    
    if (newType === null) return; // User cancelled
    
    const trimmedType = newType.trim();
    if (!trimmedType) {
        beeMarshallAlert('Honey type name cannot be empty.', 'warning');
        return;
    }
    
    if (trimmedType === currentType) return; // No change
    
    if (HONEY_TYPES.includes(trimmedType)) {
        beeMarshallAlert('This honey type name already exists.', 'warning');
        return;
    }
    
    // Update the array
    HONEY_TYPES[index] = trimmedType;
    
    // Save to Firebase
    const tenantPath = currentTenantId ? `tenants/${currentTenantId}/honeyTypes` : 'honeyTypes';
    database.ref(tenantPath).set(HONEY_TYPES).then(() => {
        beeMarshallAlert(`✅ Honey type updated: "${currentType}" → "${trimmedType}"`, 'success');
        loadHoneyTypes();
    }).catch(error => {
        console.error('Error updating honey type:', error);
        beeMarshallAlert('❌ Error updating honey type. Please try again.', 'error');
    });
}

function toggleHoneyType(index) {
    const honeyType = HONEY_TYPES[index];
    const isActive = true; // For now, we'll implement deactivation later
    
    if (isActive) {
        if (confirm(`Deactivate honey type "${honeyType}"?\n\nThis will hide it from new site selections but won't affect existing sites.`)) {
            // For now, just remove from the list
            // In a full implementation, you'd mark it as inactive instead
            HONEY_TYPES.splice(index, 1);
            
            const tenantPath = currentTenantId ? `tenants/${currentTenantId}/honeyTypes` : 'honeyTypes';
            database.ref(tenantPath).set(HONEY_TYPES).then(() => {
                beeMarshallAlert(`✅ Honey type "${honeyType}" deactivated.`, 'success');
                loadHoneyTypes();
            }).catch(error => {
                console.error('Error deactivating honey type:', error);
                beeMarshallAlert('❌ Error deactivating honey type. Please try again.', 'error');
            });
        }
    }
}
