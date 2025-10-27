// BeeMarshall - Enhanced Scheduling Module

// Check for overdue tasks and automatically flag them as urgent
function checkAndFlagOverdueTasks() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let hasUpdates = false;
    
    scheduledTasks.forEach(task => {
        if (!task.completed) {
            const taskDate = new Date(task.dueDate);
            taskDate.setHours(0, 0, 0, 0);
            
            // If task is overdue and not already urgent, mark as urgent
            if (taskDate < today && task.priority !== 'urgent') {
                task.priority = 'urgent';
                task.overdue = true;
                task.overdueDate = new Date().toISOString();
                hasUpdates = true;
                
                console.log(`Task "${task.taskId}" is overdue and marked as urgent`);
            }
        }
    });
    
    // Save updates to Firebase if any changes were made
    if (hasUpdates) {
        saveScheduledTasks();
    }
}

// Enhanced scheduling with timeline view and task completion

// Simple site lookup function - only handles current siteId format
function getSiteForTask(task) {
    if (!task || !sites || sites.length === 0) return null;
    
    // Only look for siteId (current format)
    if (task.siteId) {
        return sites.find(s => s.id === task.siteId);
    }
    
    return null;
}

function renderScheduledTasks() {
    console.log('🔄 renderScheduledTasks() called');
    console.log('📊 scheduledTasks available:', scheduledTasks ? scheduledTasks.length : 'undefined');
    
    if (!scheduledTasks) {
        console.error('❌ scheduledTasks is undefined - cannot render');
        document.getElementById('scheduledTasksList').innerHTML = '<p class="text-danger">Error: Scheduled tasks data not available. Please refresh the page.</p>';
        return;
    }
    
    // Check for overdue tasks first
    console.log('📊 Checking for overdue tasks...');
    checkAndFlagOverdueTasks();
    
    const pending = scheduledTasks.filter(t => !t.completed);
    const completed = scheduledTasks.filter(t => t.completed);
    
    console.log('📊 Task counts:', {
        total: scheduledTasks.length,
        pending: pending.length,
        completed: completed.length
    });
    
    // Add "Schedule New Task" button at the top
    const scheduleButton = `
        <div class="mb-4">
            <button class="btn btn-primary" onclick="showScheduleTaskModal()">
                <i class="bi bi-plus-circle"></i> Schedule New Task
            </button>
            <button class="btn btn-outline-secondary ms-2" onclick="showSuggestedSchedule()">
                <i class="bi bi-lightbulb"></i> Suggested Schedule
            </button>
        </div>
    `;
    
    const pendingHtml = pending.length > 0
        ? pending.map(t => {
            // Use the enhanced site lookup function
            const site = getSiteForTask(t);
            const hive = individualHives.find(h => h.id === t.individualHiveId);
            const task = tasks.find(tk => tk.id === t.taskId);
            const displayTaskName = task ? task.name : getTaskDisplayName(null, t.taskId);
            const priorityClass = t.priority === 'urgent' ? 'danger' : t.priority === 'high' ? 'warning' : 'secondary';
            const dueDate = new Date(t.dueDate);
            const isOverdue = dueDate < new Date() && !t.completed;
            
            return `
                <div class="card mb-3 scheduled-task ${isOverdue ? 'border-danger' : ''}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <h5 class="mb-2">
                                    ${displayTaskName}
                                    <span class="badge bg-${priorityClass}">${t.priority || 'normal'}</span>
                                    ${isOverdue ? '<span class="badge bg-danger">OVERDUE</span>' : ''}
                                </h5>
                                <p class="mb-1">
                                    <i class="bi bi-geo-alt"></i> ${site?.name || 'Site Not Found'}
                                    ${hive ? ` • <i class="bi bi-hexagon"></i> ${hive.hiveName}` : ''}
                                    ${!site ? ` <small class="text-warning">(ID: ${t.siteId || t.clusterId || 'N/A'})</small>` : ''}
                                </p>
                                <p class="mb-1">
                                    <i class="bi bi-calendar"></i> Due: ${dueDate.toLocaleDateString()}
                                    ${t.scheduledTime ? ` • <i class="bi bi-clock"></i> ${t.scheduledTime}` : ''}
                                </p>
                                ${t.notes ? `<p class="mb-2"><small><strong>Notes:</strong> ${t.notes}</small></p>` : ''}
                                <div class="d-flex gap-2">
                                    <button class="btn btn-success btn-sm" onclick="completeScheduledTask('${t.id}')">
                                        <i class="bi bi-check-circle"></i> Complete
                                    </button>
                                    <button class="btn btn-outline-primary btn-sm" onclick="editScheduledTask('${t.id}')">
                                        <i class="bi bi-pencil"></i> Edit
                                    </button>
                                    ${isOverdue ? `<button class="btn btn-outline-warning btn-sm" onclick="rescheduleOverdueTask('${t.id}')">
                                        <i class="bi bi-calendar-plus"></i> Reschedule
                                    </button>` : ''}
                                    <button class="btn btn-outline-danger btn-sm" onclick="cancelScheduledTask('${t.id}')">
                                        <i class="bi bi-x-circle"></i> Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('')
        : '<p class="text-muted">No pending scheduled tasks.</p>';
    
    const completedHtml = completed.length > 0
        ? `
            <div class="mt-4">
                <h6><i class="bi bi-check-circle-fill text-success"></i> Recently Completed</h6>
                <div class="accordion" id="completedTasksAccordion">
                    ${completed.slice(0, 10).map(t => {
                        // Use the enhanced site lookup function
                        const site = getSiteForTask(t);
                        const hive = individualHives.find(h => h.id === t.individualHiveId);
                        const task = tasks.find(tk => tk.id === t.taskId);
                        const displayTaskName = task ? task.name : getTaskDisplayName(null, t.taskId);
                        const completedDate = new Date(t.completedAt);
                        
                        return `
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="heading${t.id}">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${t.id}">
                                        <i class="bi bi-check-circle-fill text-success me-2"></i>
                                        ${displayTaskName} - ${site?.name || 'Site Not Found'}
                                        <span class="badge bg-success ms-2">Completed ${completedDate.toLocaleDateString()}</span>
                                    </button>
                                </h2>
                                <div id="collapse${t.id}" class="accordion-collapse collapse" data-bs-parent="#completedTasksAccordion">
                                    <div class="accordion-body">
                                        <p><strong>Site:</strong> ${site?.name || 'Site Not Found'}</p>
                                        ${hive ? `<p><strong>Hive:</strong> ${hive.hiveName}</p>` : ''}
                                        <p><strong>Completed by:</strong> ${t.completedBy || 'Unknown'}</p>
                                        <p><strong>Completed on:</strong> ${completedDate.toLocaleString()}</p>
                                        ${t.notes ? `<p><strong>Notes:</strong> ${t.notes}</p>` : ''}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `
        : '';
    
    console.log('📊 About to update DOM with scheduled tasks HTML');
    console.log('📊 HTML length:', (scheduleButton + pendingHtml + completedHtml).length);
    
    try {
        document.getElementById('scheduledTasksList').innerHTML = scheduleButton + pendingHtml + completedHtml;
        console.log('✅ renderScheduledTasks() completed successfully');
    } catch (error) {
        console.error('❌ Error updating scheduled tasks DOM:', error);
        document.getElementById('scheduledTasksList').innerHTML = '<p class="text-danger">Error rendering scheduled tasks. Please refresh the page.</p>';
    }
}

function renderScheduleTimeline() {
    console.log('🔄 renderScheduleTimeline() called');
    
    const timelineContainer = document.getElementById('scheduleTimeline');
    if (!timelineContainer) {
        console.error('❌ scheduleTimeline container not found');
        return;
    }
    
    console.log('📊 scheduledTasks for timeline:', scheduledTasks ? scheduledTasks.length : 'undefined');
    
    if (!scheduledTasks) {
        console.error('❌ scheduledTasks is undefined for timeline');
        timelineContainer.innerHTML = '<p class="text-danger">Error: Scheduled tasks data not available for timeline.</p>';
        return;
    }
    
    // Get all scheduled tasks sorted by date
    const allTasks = [...scheduledTasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    console.log('📊 Timeline tasks count:', allTasks.length);
    
    if (allTasks.length === 0) {
        timelineContainer.innerHTML = '<p class="text-muted">No scheduled tasks to display on timeline.</p>';
        return;
    }
    
    // Group tasks by date
    const tasksByDate = {};
    allTasks.forEach(task => {
        const date = new Date(task.dueDate).toDateString();
        if (!tasksByDate[date]) {
            tasksByDate[date] = [];
        }
        tasksByDate[date].push(task);
    });
    
    const timelineHtml = Object.keys(tasksByDate).map(date => {
        const tasks = tasksByDate[date];
        const dateObj = new Date(date);
        const isToday = dateObj.toDateString() === new Date().toDateString();
        const isPast = dateObj < new Date() && !isToday;
        
        return `
            <div class="timeline-date ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}">
                <h6 class="timeline-date-header">
                    <i class="bi bi-calendar-date"></i> ${dateObj.toLocaleDateString()}
                    ${isToday ? '<span class="badge bg-primary">Today</span>' : ''}
                </h6>
                <div class="timeline-tasks">
                    ${tasks.map(task => {
                        // Use the enhanced site lookup function
                        const site = getSiteForTask(task);
                        const hive = individualHives.find(h => h.id === task.individualHiveId);
                        const taskObj = tasks.find(tk => tk.id === task.taskId);
                        const displayTaskName = taskObj ? taskObj.name : getTaskDisplayName(null, task.taskId);
                        const priorityClass = task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : 'secondary';
                        const isCompleted = task.completed;
                        
                        return `
                            <div class="timeline-task ${isCompleted ? 'completed' : ''}">
                                <div class="timeline-task-content">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>${displayTaskName}</strong>
                                            <span class="badge bg-${priorityClass}">${task.priority || 'normal'}</span>
                                            ${isCompleted ? '<span class="badge bg-success">Completed</span>' : ''}
                                        </div>
                                        <div class="timeline-task-actions">
                                            ${!isCompleted ? `
                                                <button class="btn btn-success btn-sm" onclick="completeScheduledTask('${task.id}')">
                                                    <i class="bi bi-check"></i>
                                                </button>
                                            ` : ''}
                                        </div>
                                    </div>
                                    <p class="mb-1">
                                        <i class="bi bi-geo-alt"></i> ${site?.name || 'Unknown'}
                                        ${hive ? ` • <i class="bi bi-hexagon"></i> ${hive.hiveName}` : ''}
                                    </p>
                                    ${task.scheduledTime ? `<p class="mb-1"><i class="bi bi-clock"></i> ${task.scheduledTime}</p>` : ''}
                                    ${task.notes ? `<p class="mb-0"><small>${task.notes}</small></p>` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
    
    // Convert to simple bullet point list
    const bulletListHtml = Object.keys(tasksByDate).map(date => {
        const tasks = tasksByDate[date];
        const dateObj = new Date(date);
        const isToday = dateObj.toDateString() === new Date().toDateString();
        const isPast = dateObj < new Date() && !isToday;
        
        const dateHeader = `<h6 class="mb-2 ${isToday ? 'text-primary' : isPast ? 'text-muted' : ''}">
            <i class="bi bi-calendar-date"></i> ${dateObj.toLocaleDateString()}
            ${isToday ? '<span class="badge bg-primary ms-2">Today</span>' : ''}
        </h6>`;
        
        const taskList = tasks.map(task => {
            // Use the enhanced site lookup function
            const site = getSiteForTask(task);
            const hive = individualHives.find(h => h.id === task.individualHiveId);
            const taskObj = tasks.find(tk => tk.id === task.taskId);
            const displayTaskName = taskObj ? taskObj.name : getTaskDisplayName(null, task.taskId);
            const priorityClass = task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : 'secondary';
            const isCompleted = task.completed;
            
            return `<li class="mb-1 ${isCompleted ? 'text-muted' : ''}">
                <strong>${displayTaskName}</strong>
                <span class="badge bg-${priorityClass} ms-1">${task.priority || 'normal'}</span>
                ${isCompleted ? '<span class="badge bg-success ms-1">Completed</span>' : ''}
                <br><small class="text-muted">
                                        <i class="bi bi-geo-alt"></i> ${site?.name || 'Unknown'}
                    ${hive ? ` • <i class="bi bi-hexagon"></i> ${hive.hiveName}` : ''}
                    ${task.scheduledTime ? ` • <i class="bi bi-clock"></i> ${task.scheduledTime}` : ''}
                </small>
                ${!isCompleted ? `
                    <button class="btn btn-success btn-sm ms-2" onclick="completeScheduledTask('${task.id}')">
                        <i class="bi bi-check"></i>
                    </button>
                ` : ''}
            </li>`;
        }).join('');
        
        return `${dateHeader}<ul class="list-unstyled mb-3">${taskList}</ul>`;
    }).join('');
    
    console.log('📊 About to update timeline DOM');
    console.log('📊 Timeline HTML length:', bulletListHtml.length);
    
    try {
        timelineContainer.innerHTML = `
            <div>
                <h5><i class="bi bi-timeline"></i> Schedule Timeline</h5>
                ${bulletListHtml}
            </div>
        `;
        console.log('✅ renderScheduleTimeline() completed successfully');
    } catch (error) {
        console.error('❌ Error updating timeline DOM:', error);
        timelineContainer.innerHTML = '<p class="text-danger">Error rendering timeline. Please refresh the page.</p>';
    }
}

function showScheduleTaskModal() {
    const siteSelect = document.getElementById('scheduleSite');
    siteSelect.innerHTML = '<option value="">Select site...</option>' +
        sites.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    
    const taskSelect = document.getElementById('scheduleTask');
    taskSelect.innerHTML = '<option value="">Select task...</option>' +
        tasks.map(t => `<option value="${t.id}">${t.category}: ${t.name}</option>`).join('');
    
    // Set default date to today
    document.getElementById('scheduleDueDate').valueAsDate = new Date();
    
    const modal = new bootstrap.Modal(document.getElementById('scheduleTaskModal'));
    modal.show();
}

function handleScheduleTask(e) {
    e.preventDefault();
    
    const siteId = parseInt(document.getElementById('scheduleSite').value);
    const taskId = parseInt(document.getElementById('scheduleTask').value);
    const dueDate = document.getElementById('scheduleDueDate').value;
    const scheduledTime = document.getElementById('scheduleTime').value;
    const priority = document.getElementById('schedulePriority').value;
    const notes = document.getElementById('scheduleNotes').value;
    const individualHiveId = document.getElementById('scheduleHive')?.value || null;
    
    if (!siteId || !taskId) {
        alert('Please select both site and task.');
        return;
    }
    
    const task = {
        id: Date.now().toString(),
        siteId: siteId,
        individualHiveId: individualHiveId,
        taskId: taskId,
        dueDate: dueDate,
        scheduledTime: scheduledTime,
        priority: priority,
        notes: notes,
        completed: false,
        createdBy: currentUser.username,
        createdAt: new Date().toISOString()
    };
    
    // Use tenant-specific path for data isolation
    const tasksPath = currentTenantId ? `tenants/${currentTenantId}/scheduledTasks` : 'scheduledTasks';
    database.ref(`${tasksPath}/${task.id}`).set(task)
        .then(() => {
            beeMarshallAlert('✅ Task scheduled successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('scheduleTaskModal')).hide();
            document.getElementById('scheduleTaskForm').reset();
            renderScheduledTasks();
            renderScheduleTimeline();
        });
}

function completeScheduledTask(id) {
    // Check permission - all users can complete tasks
    if (!hasPermission('TASK_COMPLETE')) {
        showPermissionDeniedAlert('complete tasks');
        return;
    }
    
    const task = scheduledTasks.find(t => t.id === id);
    if (!task) return;
    
    // Find the task name from the comprehensive tasks list
    const taskObj = tasks.find(t => t.id === task.taskId);
    const taskName = taskObj ? taskObj.name : getTaskDisplayName(null, task.taskId);
    const taskCategory = taskObj ? taskObj.category : 'Task';
    
    // Convert scheduled task to completed action
    const action = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        siteId: task.siteId,
        individualHiveId: task.individualHiveId,
        taskId: task.taskId,
        taskName: taskName,
        taskCategory: taskCategory,
        date: new Date().toISOString().split('T')[0],
        notes: task.notes || '',
        flag: '',
        loggedBy: currentUser.username,
        createdAt: new Date().toISOString(),
        fromScheduledTask: true,
        originalScheduledTaskId: id
    };
    
    // Save the action with tenant isolation
    const actionsPath = currentTenantId ? `tenants/${currentTenantId}/actions` : 'actions';
    const tasksPath = currentTenantId ? `tenants/${currentTenantId}/scheduledTasks` : 'scheduledTasks';
    
    database.ref(`${actionsPath}/${action.id}`).set(action)
        .then(() => {
            // Mark scheduled task as completed
            return database.ref(`${tasksPath}/${id}`).update({
                completed: true,
                completedBy: currentUser.username,
                completedAt: new Date().toISOString()
            });
        })
        .then(() => {
            alert('✅ Task completed and logged as action!');
            renderScheduledTasks();
            renderScheduleTimeline();
            
            // Refresh calendar if it's visible
            if (calendar && isCalendarView) {
                refreshCalendar();
            }
        });
}

function editScheduledTask(id) {
    const task = scheduledTasks.find(t => t.id === id);
    if (!task) return;
    
    // Pre-fill the schedule form with existing data
    document.getElementById('scheduleSite').value = task.siteId;
    document.getElementById('scheduleTask').value = task.taskId;
    document.getElementById('scheduleDueDate').value = task.dueDate;
    document.getElementById('scheduleTime').value = task.scheduledTime || '';
    document.getElementById('schedulePriority').value = task.priority || 'normal';
    document.getElementById('scheduleNotes').value = task.notes || '';
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('scheduleTaskModal'));
    modal.show();
    
    // Update the form to save changes instead of creating new
    document.getElementById('scheduleTaskForm').onsubmit = function(e) {
        e.preventDefault();
        updateScheduledTask(id);
    };
}

function updateScheduledTask(id) {
    const siteId = parseInt(document.getElementById('scheduleSite').value);
    const taskId = parseInt(document.getElementById('scheduleTask').value);
    const dueDate = document.getElementById('scheduleDueDate').value;
    const scheduledTime = document.getElementById('scheduleTime').value;
    const priority = document.getElementById('schedulePriority').value;
    const notes = document.getElementById('scheduleNotes').value;
    
    const updates = {
        siteId: siteId,
        taskId: taskId,
        dueDate: dueDate,
        scheduledTime: scheduledTime,
        priority: priority,
        notes: notes,
        lastModifiedBy: currentUser.username,
        lastModifiedAt: new Date().toISOString()
    };
    
    // Use tenant-specific path for data isolation
    const tasksPath = currentTenantId ? `tenants/${currentTenantId}/scheduledTasks` : 'scheduledTasks';
    database.ref(`${tasksPath}/${id}`).update(updates)
        .then(() => {
            beeMarshallAlert('✅ Task updated successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('scheduleTaskModal')).hide();
            document.getElementById('scheduleTaskForm').reset();
            renderScheduledTasks();
            renderScheduleTimeline();
        });
}

function cancelScheduledTask(id) {
    if (confirm('Cancel this scheduled task? This cannot be undone.')) {
        // Use tenant-specific path for data isolation
        const tasksPath = currentTenantId ? `tenants/${currentTenantId}/scheduledTasks` : 'scheduledTasks';
        database.ref(`${tasksPath}/${id}`).remove()
            .then(() => {
                alert('✅ Task cancelled.');
                renderScheduledTasks();
                renderScheduleTimeline();
            });
    }
}

// Suggested Schedule based on geographical and seasonal processes
function showSuggestedSchedule() {
    hideAllViews();
    document.getElementById('suggestedScheduleView').classList.remove('hidden');
    renderSuggestedSchedule();
}

function renderSuggestedSchedule() {
    const suggestions = generateSeasonalSuggestions();
    
    const html = suggestions.map(suggestion => `
        <div class="card mb-3 suggested-task">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h5 class="mb-2">
                            ${suggestion.taskName}
                            <span class="badge bg-info">${suggestion.season}</span>
                            <span class="badge bg-secondary">${suggestion.category}</span>
                        </h5>
                        <p class="mb-2">${suggestion.description}</p>
                        <p class="mb-1">
                            <strong>Recommended for:</strong> ${suggestion.recommendedSites.join(', ')}
                        </p>
                        <p class="mb-1">
                            <strong>Suggested timing:</strong> ${suggestion.timing}
                        </p>
                        <p class="mb-2">
                            <strong>Priority:</strong> 
                            <span class="badge bg-${suggestion.priority === 'high' ? 'danger' : suggestion.priority === 'medium' ? 'warning' : 'secondary'}">
                                ${suggestion.priority}
                            </span>
                        </p>
                    </div>
                    <div class="suggested-task-actions">
                        <button class="btn btn-primary" onclick="scheduleFromSuggestion('${suggestion.id}')">
                            <i class="bi bi-calendar-plus"></i> Schedule
                        </button>
                        <button class="btn btn-outline-secondary" onclick="editSuggestion('${suggestion.id}')">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('suggestedTasksList').innerHTML = html || '<p class="text-muted">No seasonal suggestions available.</p>';
}

function generateSeasonalSuggestions() {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const suggestions = [];
    
    // Spring suggestions (Sep-Nov in NZ)
    if (currentMonth >= 9 || currentMonth <= 11) {
        suggestions.push({
            id: 'spring_inspection',
            taskName: 'Spring Hive Inspection',
            description: 'Comprehensive inspection after winter to assess colony health and prepare for spring buildup.',
            season: 'Spring',
            category: 'Inspection',
            priority: 'high',
            timing: 'Early spring (September)',
            recommendedSites: sites.map(s => s.name),
            taskId: 101 // General Hive Inspection
        });
        
        suggestions.push({
            id: 'spring_feeding',
            taskName: 'Spring Sugar Syrup Feeding',
            description: '1:1 sugar syrup to stimulate brood rearing and colony buildup.',
            season: 'Spring',
            category: 'Feeding',
            priority: 'high',
            timing: 'Early to mid-spring',
            recommendedSites: sites.map(s => s.name),
            taskId: 201 // Sugar Syrup 1:1
        });
    }
    
    // Summer suggestions (Dec-Feb in NZ)
    if (currentMonth >= 12 || currentMonth <= 2) {
        suggestions.push({
            id: 'summer_ventilation',
            taskName: 'Summer Ventilation Setup',
            description: 'Ensure adequate ventilation to prevent overheating during hot summer months.',
            season: 'Summer',
            category: 'Maintenance',
            priority: 'medium',
            timing: 'Mid-summer',
            recommendedSites: sites.map(s => s.name),
            taskId: 602 // Summer Ventilation Setup
        });
        
        suggestions.push({
            id: 'honey_harvest',
            taskName: 'Honey Harvest',
            description: 'Harvest honey when supers are full and capped.',
            season: 'Summer',
            category: 'Harvest',
            priority: 'high',
            timing: 'Late summer/early autumn',
            recommendedSites: sites.filter(s => s.harvestTimeline).map(s => s.name),
            taskId: 401 // Honey Harvest
        });
    }
    
    // Autumn suggestions (Mar-May in NZ)
    if (currentMonth >= 3 && currentMonth <= 5) {
        suggestions.push({
            id: 'fall_winterization',
            taskName: 'Fall Winterization',
            description: 'Prepare hives for winter with adequate food stores and protection.',
            season: 'Autumn',
            category: 'Seasonal',
            priority: 'high',
            timing: 'Late autumn',
            recommendedSites: sites.map(s => s.name),
            taskId: 603 // Fall Winterization
        });
        
        suggestions.push({
            id: 'varroa_treatment',
            taskName: 'Varroa Treatment',
            description: 'Treat for varroa mites before winter to ensure healthy overwintering.',
            season: 'Autumn',
            category: 'Treatment',
            priority: 'high',
            timing: 'Late autumn',
            recommendedSites: sites.map(s => s.name),
            taskId: 301 // Varroa Treatment - Formic Acid
        });
    }
    
    // Winter suggestions (Jun-Aug in NZ)
    if (currentMonth >= 6 && currentMonth <= 8) {
        suggestions.push({
            id: 'winter_insulation',
            taskName: 'Winter Insulation Check',
            description: 'Ensure hives are properly insulated and protected from winter weather.',
            season: 'Winter',
            category: 'Maintenance',
            priority: 'medium',
            timing: 'Mid-winter',
            recommendedSites: sites.map(s => s.name),
            taskId: 604 // Winter Insulation
        });
    }
    
    return suggestions;
}

function scheduleFromSuggestion(suggestionId) {
    const suggestion = generateSeasonalSuggestions().find(s => s.id === suggestionId);
    if (!suggestion) return;
    
    // Pre-fill the schedule form
    document.getElementById('scheduleTask').value = suggestion.taskId;
    document.getElementById('schedulePriority').value = suggestion.priority;
    document.getElementById('scheduleNotes').value = `Scheduled from seasonal suggestion: ${suggestion.description}`;
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('scheduleTaskModal'));
    modal.show();
}

function editSuggestion(suggestionId) {
    // For now, just show the suggestion details
    const suggestion = generateSeasonalSuggestions().find(s => s.id === suggestionId);
    if (suggestion) {
        alert(`Edit suggestion: ${suggestion.taskName}\n\nThis feature will allow customizing seasonal suggestions in future updates.`);
    }
}

// Reschedule overdue task - transform it into a new scheduled task
function rescheduleOverdueTask(taskId) {
    const task = scheduledTasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newDate = prompt(`Reschedule "${getTaskDisplayName(null, task.taskId)}" to a new date:\n\nCurrent due date: ${new Date(task.dueDate).toLocaleDateString()}\n\nEnter new date (YYYY-MM-DD):`, new Date().toISOString().split('T')[0]);
    
    if (newDate && newDate !== new Date(task.dueDate).toISOString().split('T')[0]) {
        // Validate date
        const newDateObj = new Date(newDate);
        if (isNaN(newDateObj.getTime())) {
            alert('Invalid date format. Please use YYYY-MM-DD format.');
            return;
        }
        
        // Update the task
        task.dueDate = newDate;
        task.priority = 'normal'; // Reset priority
        task.overdue = false;
        task.overdueDate = null;
        task.rescheduled = true;
        task.rescheduledDate = new Date().toISOString();
        task.rescheduledBy = currentUser.username;
        
        // Save to Firebase
        saveScheduledTasks();
        
        // Refresh the display
        renderScheduledTasks();
        renderScheduleTimeline();
        
        beeMarshallAlert(`Task rescheduled successfully to ${newDateObj.toLocaleDateString()}!`, 'success');
    }
}

// Enhanced edit scheduled task function - opens modal
function editScheduledTask(taskId) {
    const task = scheduledTasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Populate the edit modal
    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editTaskSite').value = task.siteId;
    document.getElementById('editTaskType').value = task.taskId;
    document.getElementById('editTaskDate').value = new Date(task.dueDate).toISOString().split('T')[0];
    document.getElementById('editTaskTime').value = task.scheduledTime || '';
    document.getElementById('editTaskPriority').value = task.priority || 'normal';
    document.getElementById('editTaskNotes').value = task.notes || '';
    
    // Populate dropdowns
    populateEditTaskDropdowns();
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('editScheduledTaskModal'));
    modal.show();
}

// Populate edit task dropdowns
function populateEditTaskDropdowns() {
    // Populate site dropdown
    const siteSelect = document.getElementById('editTaskSite');
    siteSelect.innerHTML = '<option value="">Select site...</option>' + 
        sites.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    
    // Populate task dropdown
    const taskSelect = document.getElementById('editTaskType');
    taskSelect.innerHTML = '<option value="">Select task...</option>' + 
        Object.entries(COMPREHENSIVE_TASKS).map(([key, task]) => 
            `<option value="${key}">${task.name}</option>`
        ).join('');
}

// Handle edit scheduled task form submission
function handleEditScheduledTask() {
    const taskId = document.getElementById('editTaskId').value;
    const task = scheduledTasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Get form values
    const siteId = document.getElementById('editTaskSite').value;
    const taskType = document.getElementById('editTaskType').value;
    const dueDate = document.getElementById('editTaskDate').value;
    const scheduledTime = document.getElementById('editTaskTime').value;
    const priority = document.getElementById('editTaskPriority').value;
    const notes = document.getElementById('editTaskNotes').value;
    
    // Validate
    if (!siteId || !taskType || !dueDate) {
        alert('Please fill in all required fields.');
        return;
    }
    
    const newDateObj = new Date(dueDate);
    if (isNaN(newDateObj.getTime())) {
        alert('Invalid date format.');
        return;
    }
    
    // Update the task
    task.siteId = siteId;
    task.taskId = taskType;
    task.dueDate = dueDate;
    task.scheduledTime = scheduledTime || null;
    task.priority = priority;
    task.notes = notes;
    
    // If it was overdue and new date is in the future, reset priority
    if (task.overdue && newDateObj > new Date()) {
        task.priority = 'normal';
        task.overdue = false;
        task.overdueDate = null;
    }
    
    task.lastModified = new Date().toISOString();
    task.lastModifiedBy = currentUser.username;
    
    // Save to Firebase
    saveScheduledTasks();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editScheduledTaskModal'));
    modal.hide();
    
    // Refresh the display
    renderScheduledTasks();
    renderScheduleTimeline();
    
    // Refresh calendar if it's visible
    if (calendar && isCalendarView) {
        refreshCalendar();
    }
    
    beeMarshallAlert('Task updated successfully!', 'success');
}

// Calendar Feed Generation
function generateCalendarFeed() {
    const futureTasks = scheduledTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return !task.completed && taskDate >= today;
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    if (futureTasks.length === 0) {
        alert('No scheduled tasks to export to calendar.');
        return;
    }
    
    const icsContent = generateICS(futureTasks);
    downloadICS(icsContent, 'BeeMarshall-Scheduled-Tasks.ics');
}

function generateEnhancedICS(tasks) {
    const now = new Date();
    const nowUTC = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//BeeMarshall//Scheduled Tasks//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:BeeMarshall Scheduled Tasks',
        'X-WR-TIMEZONE:UTC',
        'X-WR-CALDESC:Scheduled beekeeping tasks from BeeMarshall',
        'X-WR-RELCALID:beemarshall-tasks'
    ];
    
    tasks.forEach(task => {
        // Use the enhanced site lookup function
        const site = getSiteForTask(task);
        const taskObj = tasks.find(tk => tk.id === task.taskId);
        const displayTaskName = taskObj ? taskObj.name : getTaskDisplayName(null, task.taskId);
        
        const startDate = new Date(task.dueDate);
        if (task.scheduledTime) {
            const [hours, minutes] = task.scheduledTime.split(':');
            startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
            startDate.setHours(9, 0, 0, 0); // Default to 9 AM if no time specified
        }
        
        const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000)); // 2 hours duration
        
        const startUTC = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endUTC = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        
        const summary = displayTaskName;
        const description = `Site: ${site?.name || 'Unknown'}\nPriority: ${task.priority || 'normal'}\nType: ${task.type || 'scheduled'}\n${task.notes ? `Notes: ${task.notes}` : ''}`;
        const location = site?.name || 'Apiary Location';
        
        icsContent.push(
            'BEGIN:VEVENT',
            `UID:${task.id}@beemarshall.com`,
            `DTSTART:${startUTC}`,
            `DTEND:${endUTC}`,
            `DTSTAMP:${nowUTC}`,
            `SUMMARY:${summary}`,
            `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
            `LOCATION:${location}`,
            `STATUS:CONFIRMED`,
            `PRIORITY:${task.priority === 'urgent' ? '1' : task.priority === 'high' ? '2' : '3'}`,
            `CATEGORIES:BEEKEEPING`,
            `CREATED:${nowUTC}`,
            `LAST-MODIFIED:${nowUTC}`,
            `URL:https://beemarshall.com/task/${task.id}`,
            'END:VEVENT'
        );
    });
    
    icsContent.push('END:VCALENDAR');
    
    return icsContent.join('\r\n');
}

function generateICS(tasks) {
    const now = new Date();
    const nowUTC = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//BeeMarshall//Scheduled Tasks//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:BeeMarshall Scheduled Tasks',
        'X-WR-TIMEZONE:UTC',
        'X-WR-CALDESC:Scheduled beekeeping tasks from BeeMarshall'
    ];
    
    tasks.forEach(task => {
        // Use the enhanced site lookup function
        const site = getSiteForTask(task);
        const taskObj = tasks.find(tk => tk.id === task.taskId);
        const displayTaskName = taskObj ? taskObj.name : getTaskDisplayName(null, task.taskId);
        
        const startDate = new Date(task.dueDate);
        if (task.scheduledTime) {
            const [hours, minutes] = task.scheduledTime.split(':');
            startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
            startDate.setHours(9, 0, 0, 0); // Default to 9 AM if no time specified
        }
        
        const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000)); // 2 hours duration
        
        const startUTC = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endUTC = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        
        const summary = displayTaskName;
        const description = `Site: ${site?.name || 'Unknown'}\nPriority: ${task.priority || 'normal'}\nType: ${task.type || 'scheduled'}\n${task.notes ? `Notes: ${task.notes}` : ''}`;
        const location = site?.name || 'Apiary Location';
        
        icsContent.push(
            'BEGIN:VEVENT',
            `UID:${task.id}@beemarshall.com`,
            `DTSTART:${startUTC}`,
            `DTEND:${endUTC}`,
            `DTSTAMP:${nowUTC}`,
            `SUMMARY:${summary}`,
            `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
            `LOCATION:${location}`,
            `STATUS:CONFIRMED`,
            `PRIORITY:${task.priority === 'urgent' ? '1' : task.priority === 'high' ? '2' : '3'}`,
            `CATEGORIES:BEEKEEPING`,
            `CREATED:${nowUTC}`,
            `LAST-MODIFIED:${nowUTC}`,
            'END:VEVENT'
        );
    });
    
    icsContent.push('END:VCALENDAR');
    
    return icsContent.join('\r\n');
}

function downloadICS(icsContent, filename) {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

function copyCalendarFeedLink() {
    console.log('copyCalendarFeedLink called - generating ICS data URL');
    
    // Generate a data URL for the ICS file
    const futureTasks = scheduledTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return !task.completed && taskDate >= today;
    });
    
    console.log(`Found ${futureTasks.length} future tasks for calendar feed`);
    
    if (futureTasks.length === 0) {
        alert('No scheduled tasks available for calendar feed.');
        return;
    }
    
    const icsContent = generateICS(futureTasks);
    const dataUrl = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(icsContent);
    
    console.log('Generated ICS data URL:', dataUrl.substring(0, 100) + '...');
    
    // Copy the data URL to clipboard
    navigator.clipboard.writeText(dataUrl).then(() => {
        beeMarshallAlert(`📋 Calendar Feed Link Copied!\n\n✅ Share this link with your team!\n\n📅 Staff can:\n• Import directly to Google Calendar, Outlook, etc.\n• Bookmark for automatic updates\n• Use as a live calendar feed\n\n📊 The link contains ${futureTasks.length} scheduled task(s) and will always show current data.`, 'success');
    }).catch(err => {
        console.log('Clipboard copy failed, falling back to download:', err);
        // Fallback: download the file instead
        downloadICS(icsContent, `BeeMarshall-Scheduled-Tasks-${new Date().toISOString().split('T')[0]}.ics`);
        beeMarshallAlert('📋 Calendar file downloaded!\n\n✅ Share this .ics file with your team!\n\n📅 Staff can import it into their calendar applications.\n\n📱 For Google Calendar: Import from file\n📱 For Apple Calendar: Double-click the file', 'success');
    });
}

// Schedule for Next Visit functionality
function showScheduleForNextVisit() {
    hideAllViews();
    document.getElementById('scheduleForNextVisitView').classList.remove('hidden');
    populateNextVisitForm();
}

function populateNextVisitForm() {
    const siteSelect = document.getElementById('nextVisitSite');
    siteSelect.innerHTML = '<option value="">Choose site...</option>' +
        sites.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('nextVisitDate').valueAsDate = tomorrow;
    
    // Populate tasks
    populateNextVisitTasks();
    
    // Add form submit event listener
    document.getElementById('nextVisitForm').addEventListener('submit', handleNextVisitForm);
}

function populateNextVisitTasks() {
    const tasksByCategory = {};
    tasks.forEach(task => {
        if (!tasksByCategory[task.category]) tasksByCategory[task.category] = [];
        tasksByCategory[task.category].push(task);
    });
    
    const html = Object.keys(tasksByCategory).sort().map(category => `
        <div class="col-md-6 mb-3 category-section">
            <h6 class="category-header"><i class="bi bi-tag-fill"></i> ${category}</h6>
            ${tasksByCategory[category].map(task => `
                <div class="form-check task-checkbox-item ${task.common ? 'common-task' : ''}" data-common="${task.common}">
                    <input class="form-check-input next-visit-task-checkbox" type="checkbox" value="${task.id}" id="nextVisitTask${task.id}">
                    <label class="form-check-label" for="nextVisitTask${task.id}">
                        ${task.name}
                        ${task.common ? '<span class="badge bg-success badge-sm">★</span>' : ''}
                    </label>
                </div>
            `).join('')}
        </div>
    `).join('');
    
    document.getElementById('nextVisitTaskCheckboxes').innerHTML = `<div class="row">${html}</div>`;
    filterNextVisitTasks('common');
}

function filterNextVisitTasks(filter) {
    document.querySelectorAll('#nextVisitTaskCheckboxes .task-checkbox-item').forEach(item => {
        item.style.display = (filter === 'all' || item.dataset.common === 'true') ? '' : 'none';
    });
}

function handleNextVisitForm(e) {
    e.preventDefault();
    
    const siteId = parseInt(document.getElementById('nextVisitSite').value);
    const date = document.getElementById('nextVisitDate').value;
    const time = document.getElementById('nextVisitTime').value;
    const priority = document.getElementById('nextVisitPriority').value;
    const notes = document.getElementById('nextVisitNotes').value;
    
    if (!siteId) {
        alert('Please select a site.');
        return;
    }
    
    const selectedTasks = Array.from(document.querySelectorAll('.next-visit-task-checkbox:checked'))
        .map(cb => parseInt(cb.value));
    
    if (selectedTasks.length === 0) {
        alert('Please select at least one task to schedule for next visit.');
        return;
    }
    
    showSyncStatus('<i class="bi bi-arrow-repeat"></i> Scheduling tasks for next visit...', 'syncing');
    
    const promises = selectedTasks.map(taskId => {
        const task = tasks.find(t => t.id === taskId);
        const scheduledTask = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            siteId: siteId,
            taskId: taskId,
            dueDate: date,
            scheduledTime: time,
            priority: priority,
            notes: notes,
            completed: false,
            createdBy: currentUser.username,
            createdAt: new Date().toISOString(),
            type: 'next-visit'
        };
        // Use tenant-specific path for data isolation
        const tasksPath = currentTenantId ? `tenants/${currentTenantId}/scheduledTasks` : 'scheduledTasks';
        return database.ref(`${tasksPath}/${scheduledTask.id}`).set(scheduledTask);
    });
    
    Promise.all(promises).then(() => {
        showSyncStatus(`<i class="bi bi-check"></i> ${selectedTasks.length} task(s) scheduled for next visit by ${currentUser.username}`);
        document.getElementById('nextVisitForm').reset();
        
        // Set default date to tomorrow again
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('nextVisitDate').valueAsDate = tomorrow;
        
        // Go back to scheduled tasks view
        showScheduledTasks();
    });
}

// Schedule task for specific site (called from map popup)
function scheduleTaskForSite(siteId) {
    // Show the schedule task modal
    const modal = new bootstrap.Modal(document.getElementById('scheduleTaskModal'));
    modal.show();
    
    // Pre-populate the site dropdown
    setTimeout(() => {
        const siteSelect = document.getElementById('scheduleSite');
        if (siteSelect) {
            siteSelect.value = siteId;
        }
    }, 100);
}

// Calendar View Functions
let calendar = null;
let isCalendarView = false;

function toggleCalendarView() {
    const calendarView = document.getElementById('calendarView');
    const listView = document.getElementById('listView');
    const toggleBtn = document.getElementById('calendarToggleBtn');
    
    if (isCalendarView) {
        // Switch to list view
        calendarView.classList.add('hidden');
        listView.classList.remove('hidden');
        toggleBtn.innerHTML = '<i class="bi bi-calendar3"></i> Calendar View';
        isCalendarView = false;
    } else {
        // Switch to calendar view
        listView.classList.add('hidden');
        calendarView.classList.remove('hidden');
        toggleBtn.innerHTML = '<i class="bi bi-list"></i> List View';
        isCalendarView = true;
        
        // Initialize calendar if not already done
        if (!calendar) {
            initializeCalendar();
        } else {
            // Refresh calendar with current data
            refreshCalendar();
        }
    }
}

function initializeCalendar() {
    const calendarEl = document.getElementById('taskCalendar');
    
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        height: 'auto',
        events: function(fetchInfo, successCallback, failureCallback) {
            // Convert scheduled tasks to FullCalendar events
            const events = scheduledTasks.map(task => {
                // Use the enhanced site lookup function
                const site = getSiteForTask(task);
                const taskName = getTaskDisplayName(null, task.taskId);
                const dueDate = new Date(task.dueDate);
                const isOverdue = dueDate < new Date() && !task.completed;
                
                return {
                    id: task.id,
                    title: `${taskName} - ${site?.name || 'Unknown'}`,
                    start: task.dueDate,
                    allDay: !task.scheduledTime,
                    extendedProps: {
                        task: task,
                        site: site,
                        taskName: taskName
                    },
                    className: [
                        `priority-${task.priority || 'normal'}`,
                        task.completed ? 'completed' : '',
                        isOverdue ? 'overdue' : ''
                    ].filter(Boolean).join(' ')
                };
            });
            
            successCallback(events);
        },
        eventClick: function(info) {
            const task = info.event.extendedProps.task;
            showTaskDetails(task);
        },
        dateClick: function(info) {
            // Allow scheduling new tasks by clicking on dates
            const clickedDate = info.dateStr;
            scheduleTaskForDate(clickedDate);
        },
        eventDidMount: function(info) {
            // Add custom styling and tooltips
            const task = info.event.extendedProps.task;
            const site = info.event.extendedProps.site;
            
            // Add tooltip
            info.el.title = `${task.notes || 'No notes'}\nSite: ${site?.name || 'Unknown'}\nPriority: ${task.priority || 'normal'}`;
        }
    });
    
    calendar.render();
}

function refreshCalendar() {
    if (calendar) {
        calendar.refetchEvents();
    }
}

function showTaskDetails(task) {
        // Use the enhanced site lookup function
        const site = getSiteForTask(task);
    const taskName = getTaskDisplayName(null, task.taskId);
    
    const modal = new bootstrap.Modal(document.createElement('div'));
    const modalHtml = `
        <div class="modal fade" id="taskDetailsModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Task Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <strong>Task:</strong> ${taskName}<br>
                                <strong>Site:</strong> ${site?.name || 'Unknown'}<br>
                                <strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}<br>
                                <strong>Priority:</strong> <span class="badge bg-${task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : 'info'}">${task.priority || 'normal'}</span>
                            </div>
                            <div class="col-md-6">
                                <strong>Status:</strong> ${task.completed ? 'Completed' : 'Pending'}<br>
                                <strong>Time:</strong> ${task.scheduledTime || 'All day'}<br>
                                <strong>Notes:</strong> ${task.notes || 'None'}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        ${!task.completed ? `
                            <button type="button" class="btn btn-success" onclick="completeScheduledTask('${task.id}')">
                                <i class="bi bi-check"></i> Mark Complete
                            </button>
                            <button type="button" class="btn btn-warning" onclick="editScheduledTask('${task.id}')">
                                <i class="bi bi-pencil"></i> Edit
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const taskModal = new bootstrap.Modal(document.getElementById('taskDetailsModal'));
    taskModal.show();
    
    // Clean up modal after it's hidden
    document.getElementById('taskDetailsModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function scheduleTaskForDate(dateStr) {
    // Pre-populate the schedule task modal with the selected date
    const modal = new bootstrap.Modal(document.getElementById('scheduleTaskModal'));
    modal.show();
    
    setTimeout(() => {
        const dateInput = document.getElementById('scheduleDueDate');
        if (dateInput) {
            dateInput.value = dateStr;
        }
    }, 100);
}

function exportToGoogleCalendar() {
    // Generate ICS file for Google Calendar import
    const futureTasks = scheduledTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return !task.completed && taskDate >= today;
    });
    
    if (futureTasks.length === 0) {
        beeMarshallAlert('No scheduled tasks to export.', 'info');
        return;
    }
    
    // Generate ICS content
    const icsContent = generateICS(futureTasks);
    
    // Create a more comprehensive ICS file
    const enhancedICS = generateEnhancedICS(futureTasks);
    
    // Download the ICS file
    downloadICS(enhancedICS, `BeeMarshall-Tasks-${new Date().toISOString().split('T')[0]}.ics`);
    
    // Show instructions
    beeMarshallAlert(`📅 Calendar Export Ready!\n\n✅ ICS file downloaded with ${futureTasks.length} scheduled task(s)\n\n📋 To import into Google Calendar:\n1. Open Google Calendar\n2. Click the "+" button\n3. Select "Import from file"\n4. Choose the downloaded .ics file\n\n📱 For Apple Calendar:\n1. Double-click the .ics file\n2. It will open in Calendar app automatically`, 'success');
}

// Save scheduled tasks to Firebase
function saveScheduledTasks() {
    if (!currentTenantId) {
        console.error('❌ No tenant ID for saving scheduled tasks');
        return;
    }
    
    console.log('💾 Saving scheduled tasks to Firebase...');
    const tasksPath = `tenants/${currentTenantId}/scheduledTasks`;
    
    // Convert array to object with task IDs as keys
    const tasksObject = {};
    scheduledTasks.forEach(task => {
        tasksObject[task.id] = task;
    });
    
    database.ref(tasksPath).set(tasksObject)
        .then(() => {
            console.log('✅ Scheduled tasks saved successfully');
        })
        .catch(error => {
            console.error('❌ Error saving scheduled tasks:', error);
        });
}
