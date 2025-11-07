// CareMarshall - Task Management Module

// Note: COMPREHENSIVE_TASKS is defined in core.js
// This module uses the global COMPREHENSIVE_TASKS variable

// Helper function to safely get task name (handles deleted tasks)
// Make getTaskDisplayName globally available (also defined in dashboard.js, but this is the canonical version)
window.getTaskDisplayName = function getTaskDisplayName(taskName, taskId) {
    // Check both window.tasks and global tasks
    const windowTasks = window.tasks || [];
    const globalTasks = (typeof tasks !== 'undefined') ? tasks : [];
    const tasksArray = [...windowTasks, ...globalTasks];
    
    // If task exists in current tasks, use it
    const currentTask = tasksArray.find(t => t.name === taskName || t.id === taskId);
    if (currentTask) {
        return currentTask.name;
    }
    
    
    // Check if it's a deleted task
    if (taskId && window.deletedTasks && window.deletedTasks[taskId]) {
        return `[Deleted: ${window.deletedTasks[taskId].name}]`;
    }
    
    // Fallback to the stored name with deleted indicator
    if (taskName) {
        return `[Deleted: ${taskName}]`;
    }
    
    // Try to find in COMPREHENSIVE_TASKS if available
    if (typeof window.COMPREHENSIVE_TASKS !== 'undefined' && taskId) {
        // First try exact match
        let comprehensiveTask = window.COMPREHENSIVE_TASKS.find(t => t.id === taskId);
        
        // If no exact match and taskId is numeric, try mapping to task_N format
        if (!comprehensiveTask && typeof taskId === 'number') {
            const mappedId = `task_${taskId}`;
            comprehensiveTask = window.COMPREHENSIVE_TASKS.find(t => t.id === mappedId);
        }
        
        // If still no match and taskId is numeric, try reverse mapping (task_N -> N)
        if (!comprehensiveTask && typeof taskId === 'number') {
            comprehensiveTask = window.COMPREHENSIVE_TASKS.find(t => {
                const numericId = parseInt(t.id.replace('task_', ''));
                return numericId === taskId;
            });
        }
        
        if (comprehensiveTask) {
            return comprehensiveTask.name;
        }
    }
    
    // If we have a taskId but no name, try to find it in COMPREHENSIVE_TASKS
    if (taskId) {
        if (typeof window.COMPREHENSIVE_TASKS !== 'undefined') {
            // First try exact match
            let comprehensiveTask = window.COMPREHENSIVE_TASKS.find(t => t.id === taskId);
            
            // If no exact match and taskId is numeric, try mapping to task_N format
            if (!comprehensiveTask && typeof taskId === 'number') {
                const mappedId = `task_${taskId}`;
                comprehensiveTask = window.COMPREHENSIVE_TASKS.find(t => t.id === mappedId);
            }
            
            // If still no match and taskId is numeric, try reverse mapping (task_N -> N)
            if (!comprehensiveTask && typeof taskId === 'number') {
                comprehensiveTask = window.COMPREHENSIVE_TASKS.find(t => {
                    const numericId = parseInt(t.id.replace('task_', ''));
                    return numericId === taskId;
                });
            }
            
            if (comprehensiveTask) {
                return comprehensiveTask.name;
            }
        }
        return `[Task ID: ${taskId}]`;
    }
    
    return '[Unknown Task]';
}

// Task Management Functions
function showTasks() {
    if (!isAdmin) {
        alert('Only administrators can manage tasks.');
        return;
    }
    hideAllViews();
    scrollToTop();
    setTimeout(() => {
        const view = document.getElementById('tasksView');
        if (view) {
            view.classList.remove('hidden');
            view.style.display = '';
        }
        const tasksList = document.getElementById('scheduledTasksList');
        const timeline = document.getElementById('scheduleTimeline');
        if (tasksList) {
            tasksList.style.display = 'none';
            tasksList.classList.add('hidden');
        }
        if (timeline) {
            timeline.style.display = 'none';
            timeline.classList.add('hidden');
        }
        updateActiveNav('Tasks');
        renderTasksList();
        setupTaskDisplayToggles();
        
        if (typeof isAdmin !== 'undefined' && isAdmin) {
            document.getElementById('honeyTypeManagement').style.display = 'block';
            loadHoneyTypes();
        }
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
                                        <button class="btn btn-sm btn-outline-primary" onclick="editTask(${typeof task.id === 'string' ? `'${task.id}'` : task.id})" title="Edit">
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${typeof task.id === 'string' ? `'${task.id}'` : task.id})" title="Delete">
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
                                        <button class="btn btn-sm btn-outline-primary" onclick="editTask(${typeof task.id === 'string' ? `'${task.id}'` : task.id})" title="Edit">
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${typeof task.id === 'string' ? `'${task.id}'` : task.id})" title="Delete">
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
function handleAddTask(e) {
    // Prevent form submission if called from form event
    if (e && e.preventDefault) {
        e.preventDefault();
    }
    
    const categorySelect = document.getElementById('newTaskCategory').value;
    const categoryCustom = document.getElementById('newTaskCategoryCustom').value.trim();
    const category = categoryCustom || categorySelect;
    const name = document.getElementById('newTaskName').value.trim();
    const common = document.getElementById('newTaskCommon').checked;
    
    if (!category) {
        careMarshallAlert('Please select or enter a category.', 'warning');
        return false;
    }
    
    if (!name) {
        careMarshallAlert('Please enter a task name.', 'warning');
        return false;
    }
    
    // Generate new ID (max existing ID + 1)
    const tasksToUse = typeof tasks !== 'undefined' ? tasks : [];
    const maxId = tasksToUse.length > 0 ? Math.max(...tasksToUse.map(t => {
        // Handle both numeric and string IDs
        const id = typeof t.id === 'string' ? parseInt(t.id.replace('task_', '')) || 0 : t.id;
        return id;
    })) : 0;
    const newId = maxId + 1;
    
    const newTask = {
        id: newId,
        name: name,
        category: category,
        common: common,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.username
    };
    
    // Use tenant-specific path for data isolation
    const tasksPath = currentTenantId ? `tenants/${currentTenantId}/tasks` : 'tasks';
    
    // Save to Firebase
    database.ref(`${tasksPath}/${newId}`).set(newTask).then(() => {
        careMarshallAlert(`✅ Task "${name}" added successfully!`, 'success');
        
        // Reset form
        const form = document.getElementById('addTaskForm');
        if (form) {
            form.reset();
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addTaskModal'));
        if (modal) {
            modal.hide();
        }
        
        // Tasks will be reloaded automatically from Firebase listener
        return false;
    }).catch(error => {
        console.error('Error adding task:', error);
        careMarshallAlert('❌ Error adding task. Please try again.', 'error');
        return false;
    });
    
    return false;
}

function editTask(taskId) {
    console.log('🔧 editTask called with taskId:', taskId, 'type:', typeof taskId);
    
    // Only allow this function when in the task management view
    const tasksView = document.getElementById('tasksView');
    if (!tasksView || tasksView.classList.contains('hidden')) {
        careMarshallAlert('Please navigate to Task Management to edit tasks.', 'info');
        // Switch to task management view
        showTasks();
        return;
    }
    
    const tasksToUse = typeof tasks !== 'undefined' ? tasks : (typeof COMPREHENSIVE_TASKS !== 'undefined' ? COMPREHENSIVE_TASKS : []);
    console.log('🔧 Available tasks:', tasksToUse.length);
    console.log('🔧 Task IDs:', tasksToUse.map(t => t.id));
    
    // Handle both string and numeric task IDs
    const taskIdNum = typeof taskId === 'string' ? parseInt(taskId) : taskId;
    const task = tasksToUse.find(t => {
        const tId = typeof t.id === 'string' ? parseInt(t.id.replace('task_', '')) || t.id : t.id;
        return tId === taskId || tId === taskIdNum || t.id === taskId;
    });
    
    if (!task) {
        console.log('❌ Task not found with ID:', taskId);
        careMarshallAlert('Task not found. Please refresh the page and try again.', 'error');
        return;
    }
    
    console.log('✅ Found task:', task);
    
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
                            <input type="hidden" id="editTaskId" value="${task.id}">
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
                        <button type="submit" class="btn btn-primary" form="editTaskForm">Update Task</button>
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
    
    // Add form submit event listener
    const editForm = document.getElementById('editTaskForm');
    if (editForm) {
        // Remove any existing listeners to avoid duplicates
        const newEditForm = editForm.cloneNode(true);
        editForm.parentNode.replaceChild(newEditForm, editForm);
        newEditForm.addEventListener('submit', handleEditTask);
    }
    
    // Clean up modal when hidden
    document.getElementById('editTaskModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function handleEditTask(e) {
    // Prevent form submission if called from form event
    if (e && e.preventDefault) {
        e.preventDefault();
    }
    
    const taskIdInput = document.getElementById('editTaskId');
    if (!taskIdInput) {
        careMarshallAlert('Task ID not found. Please try again.', 'error');
        return false;
    }
    
    // Handle both string and numeric task IDs
    const taskIdValue = taskIdInput.value;
    const taskId = isNaN(taskIdValue) ? taskIdValue : parseInt(taskIdValue);
    
    const categorySelect = document.getElementById('editTaskCategory').value;
    const categoryCustom = document.getElementById('editTaskCategoryCustom').value.trim();
    const category = categoryCustom || categorySelect;
    const name = document.getElementById('editTaskName').value.trim();
    const common = document.getElementById('editTaskCommon').checked;
    
    if (!category) {
        careMarshallAlert('Please select or enter a category.', 'warning');
        return false;
    }
    
    if (!name) {
        careMarshallAlert('Please enter a task name.', 'warning');
        return false;
    }
    
    const updates = {
        name: name,
        category: category,
        common: common,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.username
    };
    
    // Use tenant-specific path for data isolation
    const tasksPath = currentTenantId ? `tenants/${currentTenantId}/tasks` : 'tasks';
    
    // Update in Firebase
    database.ref(`${tasksPath}/${taskId}`).update(updates).then(() => {
        careMarshallAlert('✅ Task updated successfully!', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
        if (modal) {
            modal.hide();
        }
        
        // Tasks will be reloaded automatically from Firebase listener
        return false;
    }).catch(error => {
        console.error('Error updating task:', error);
        careMarshallAlert('❌ Error updating task. Please try again.', 'error');
        return false;
    });
    
    return false;
}

function deleteTask(taskId) {
    // Only allow this function when in the task management view
    const tasksView = document.getElementById('tasksView');
    if (!tasksView || tasksView.classList.contains('hidden')) {
        careMarshallAlert('Please navigate to Task Management to delete tasks.', 'info');
        // Switch to task management view
        showTasks();
        return;
    }
    
    const tasksToUse = typeof tasks !== 'undefined' ? tasks : (typeof COMPREHENSIVE_TASKS !== 'undefined' ? COMPREHENSIVE_TASKS : []);
    
    // Handle both string and numeric task IDs
    const taskIdNum = typeof taskId === 'string' ? parseInt(taskId) : taskId;
    const task = tasksToUse.find(t => {
        const tId = typeof t.id === 'string' ? parseInt(t.id.replace('task_', '')) || t.id : t.id;
        return tId === taskId || tId === taskIdNum || t.id === taskId;
    });
    
    if (!task) {
        careMarshallAlert('Task not found. Please refresh the page and try again.', 'error');
        return;
    }
    
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
        // Use tenant-specific path for data isolation
        const tasksPath = currentTenantId ? `tenants/${currentTenantId}/tasks` : 'tasks';
        const deletedTasksPath = currentTenantId ? `tenants/${currentTenantId}/deletedTasks` : 'deletedTasks';
        
        // Archive the task name before deleting for reference
        database.ref(`${deletedTasksPath}/${taskId}`).set({
            id: taskId,
            name: task.name,
            category: task.category,
            deletedAt: new Date().toISOString(),
            deletedBy: currentUser.username
        });
        
        database.ref(`${tasksPath}/${taskId}`).remove().then(() => {
            if (totalAffected > 0) {
                alert(`✅ Task deleted.\n\n${totalAffected} historical record(s) will now show as "[Deleted: ${task.name}]"`);
            } else {
                careMarshallAlert('✅ Task deleted successfully!', 'success');
            }
            // Tasks will be reloaded automatically from Firebase listener
        }).catch(error => {
            console.error('Error deleting task:', error);
            careMarshallAlert('❌ Error deleting task. Please try again.', 'error');
        });
    }
}

// Additional task management functions
function showAddTaskForm() {
    // Only allow this function when in the task management view
    const tasksView = document.getElementById('tasksView');
    if (!tasksView || tasksView.classList.contains('hidden')) {
        careMarshallAlert('Please navigate to Task Management to add tasks.', 'info');
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
                        <button type="submit" class="btn btn-primary" form="addTaskForm">Add Task</button>
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

// Care Service Type Management Functions (formerly Honey Types)
function loadHoneyTypes() {
    // Support both new CARE_SERVICE_TYPES and old HONEY_TYPES for backward compatibility
    const serviceTypes = typeof CARE_SERVICE_TYPES !== 'undefined' ? CARE_SERVICE_TYPES : 
                         (typeof HONEY_TYPES !== 'undefined' ? HONEY_TYPES : []);
    
    if (serviceTypes.length === 0) {
        console.error('Care service types not defined');
        return;
    }
    
    const container = document.getElementById('honeyTypesList');
    if (!container) return;
    
    // serviceTypes already declared above - use existing variable
    container.innerHTML = serviceTypes.map((type, index) => `
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
        homeCareAlert('Please enter a care service type name.', 'warning');
        return;
    }
    
    // Support both new and old array names
    const serviceTypes = typeof CARE_SERVICE_TYPES !== 'undefined' ? CARE_SERVICE_TYPES : HONEY_TYPES;
    if (serviceTypes.includes(newType)) {
        homeCareAlert('This care service type already exists.', 'warning');
        return;
    }
    
    // Add to global array (prefer CARE_SERVICE_TYPES, fallback to HONEY_TYPES)
    if (typeof CARE_SERVICE_TYPES !== 'undefined') {
        CARE_SERVICE_TYPES.push(newType);
        if (typeof HONEY_TYPES !== 'undefined') HONEY_TYPES.push(newType); // Sync for compatibility
    } else {
        HONEY_TYPES.push(newType);
    }
    
    // Save to Firebase (support both new and old field names)
    const serviceTypesArray = typeof CARE_SERVICE_TYPES !== 'undefined' ? CARE_SERVICE_TYPES : HONEY_TYPES;
    const tenantPath = currentTenantId ? `tenants/${currentTenantId}/careServiceTypes` : 'careServiceTypes';
    const fallbackPath = currentTenantId ? `tenants/${currentTenantId}/honeyTypes` : 'honeyTypes';
    
    // Save to new path, also save to old path for backward compatibility
    database.ref(tenantPath).set(serviceTypesArray).then(() => {
        // Also save to old path for backward compatibility
        if (typeof HONEY_TYPES !== 'undefined') {
            database.ref(fallbackPath).set(HONEY_TYPES);
        }
        homeCareAlert(`✅ Care service type "${newType}" added successfully!`, 'success');
        input.value = '';
        loadHoneyTypes();
    }).catch(error => {
        console.error('Error adding care service type:', error);
        homeCareAlert('❌ Error adding care service type. Please try again.', 'error');
    });
}

function editHoneyType(index) {
    const serviceTypes = typeof CARE_SERVICE_TYPES !== 'undefined' ? CARE_SERVICE_TYPES : HONEY_TYPES;
    const currentType = serviceTypes[index];
    const newType = prompt('Edit care service type name:', currentType);
    
    if (newType === null) return; // User cancelled
    
    const trimmedType = newType.trim();
    if (!trimmedType) {
        homeCareAlert('Care service type name cannot be empty.', 'warning');
        return;
    }
    
    if (trimmedType === currentType) return; // No change
    
    if (serviceTypes.includes(trimmedType)) {
        homeCareAlert('This care service type name already exists.', 'warning');
        return;
    }
    
    // Update the array (prefer CARE_SERVICE_TYPES, sync to HONEY_TYPES for compatibility)
    if (typeof CARE_SERVICE_TYPES !== 'undefined') {
        CARE_SERVICE_TYPES[index] = trimmedType;
        if (typeof HONEY_TYPES !== 'undefined' && HONEY_TYPES[index]) {
            HONEY_TYPES[index] = trimmedType;
        }
    } else {
        HONEY_TYPES[index] = trimmedType;
    }
    
    // Save to Firebase (support both new and old field names)
    const serviceTypesArray = typeof CARE_SERVICE_TYPES !== 'undefined' ? CARE_SERVICE_TYPES : HONEY_TYPES;
    const tenantPath = currentTenantId ? `tenants/${currentTenantId}/careServiceTypes` : 'careServiceTypes';
    const fallbackPath = currentTenantId ? `tenants/${currentTenantId}/honeyTypes` : 'honeyTypes';
    
    database.ref(tenantPath).set(serviceTypesArray).then(() => {
        if (typeof HONEY_TYPES !== 'undefined') {
            database.ref(fallbackPath).set(HONEY_TYPES);
        }
        homeCareAlert(`✅ Care service type updated: "${currentType}" → "${trimmedType}"`, 'success');
        loadHoneyTypes();
    }).catch(error => {
        console.error('Error updating care service type:', error);
        homeCareAlert('❌ Error updating care service type. Please try again.', 'error');
    });
}

function toggleHoneyType(index) {
    const serviceTypes = typeof CARE_SERVICE_TYPES !== 'undefined' ? CARE_SERVICE_TYPES : HONEY_TYPES;
    const serviceType = serviceTypes[index];
    const isActive = true; // For now, we'll implement deactivation later
    
    if (isActive) {
        if (confirm(`Deactivate care service type "${serviceType}"?\n\nThis will hide it from new selections but won't affect existing records.`)) {
            // For now, just remove from the list
            // In a full implementation, you'd mark it as inactive instead
            if (typeof CARE_SERVICE_TYPES !== 'undefined') {
                CARE_SERVICE_TYPES.splice(index, 1);
                if (typeof HONEY_TYPES !== 'undefined' && HONEY_TYPES[index]) {
                    HONEY_TYPES.splice(index, 1);
                }
            } else {
                HONEY_TYPES.splice(index, 1);
            }
            
            // Save to Firebase (support both new and old field names)
            const serviceTypesArray = typeof CARE_SERVICE_TYPES !== 'undefined' ? CARE_SERVICE_TYPES : HONEY_TYPES;
            const tenantPath = currentTenantId ? `tenants/${currentTenantId}/careServiceTypes` : 'careServiceTypes';
            const fallbackPath = currentTenantId ? `tenants/${currentTenantId}/honeyTypes` : 'honeyTypes';
            
            database.ref(tenantPath).set(serviceTypesArray).then(() => {
                if (typeof HONEY_TYPES !== 'undefined') {
                    database.ref(fallbackPath).set(HONEY_TYPES);
                }
                homeCareAlert(`✅ Care service type "${serviceType}" deactivated.`, 'success');
                loadHoneyTypes();
            }).catch(error => {
                console.error('Error deactivating care service type:', error);
                homeCareAlert('❌ Error deactivating care service type. Please try again.', 'error');
            });
        }
    }
}
