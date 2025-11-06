// CareMarshall - Dashboard Module with Calendar Widget

// Helper function to update active navigation state
function updateActiveNav(section) {
    console.log(`🎯 Updating navigation to: ${section}`);
    
    // First, remove active class from ALL nav links (including dropdowns)
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Also remove active from any other elements
    document.querySelectorAll('.active').forEach(el => {
        if (el.classList.contains('nav-link')) {
            el.classList.remove('active');
        }
    });
    
    // Map sections to their corresponding function names
    const sectionMap = {
        'dashboard': 'showDashboard',
        'Sites': 'showSites',
        'Actions': 'showActions',
        'Schedule': 'showScheduledTasks',
        'Tasks': 'showTasks',
        'Task': 'showTasks',
        'Compliance': 'showComplianceView',
        'Data Integrity': 'showIntegrityCheck',
        'Team': 'showEmployees',
        'Employees': 'showEmployees'
    };
    
    const functionName = sectionMap[section] || `show${section}`;
    console.log(`🔍 Looking for function: ${functionName}`);
    
    // Add active class to current section (check onclick attributes)
    const allNavLinks = document.querySelectorAll('.nav-link');
    allNavLinks.forEach(link => {
        const onclick = link.getAttribute('onclick');
        // Use exact match with parentheses to avoid partial matches
        if (onclick && onclick.trim() === `${functionName}()`) {
            link.classList.add('active');
            console.log(`✅ Activated nav link with onclick: ${onclick}`);
        } else if (onclick) {
            console.log(`⏭️ Skipped nav link with onclick: ${onclick}`);
        }
    });
    
    console.log(`🎯 Navigation updated to: ${section} (function: ${functionName})`);
}

// Helper function to safely get task name (handles deleted tasks) - make globally accessible
window.getTaskDisplayName = function(taskName, taskId) {
    console.log(`🔍 getTaskDisplayName called with taskName: "${taskName}", taskId: "${taskId}"`);
    
    // Check both window.tasks and global tasks
    const windowTasks = window.tasks || [];
    const globalTasks = (typeof tasks !== 'undefined') ? tasks : [];
    const tasksArray = [...windowTasks, ...globalTasks];
    
    console.log(`📋 Available tasks: ${tasksArray.length} tasks`);
    console.log(`📋 window.COMPREHENSIVE_TASKS available: ${typeof window.COMPREHENSIVE_TASKS !== 'undefined'}`);
    
    // If task exists in current tasks, use it
    const currentTask = tasksArray.find(t => t.name === taskName || t.id === taskId);
    if (currentTask) {
        console.log(`✅ Found in current tasks: ${currentTask.name}`);
        return currentTask.name;
    }
    
    // Check if it's a deleted task
    if (taskId && window.deletedTasks && window.deletedTasks[taskId]) {
        console.log(`🗑️ Found in deleted tasks: ${window.deletedTasks[taskId].name}`);
        return `[Deleted: ${window.deletedTasks[taskId].name}]`;
    }
    
    // Fallback to the stored name with deleted indicator
    if (taskName) {
        console.log(`📝 Using stored task name: ${taskName}`);
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
            console.log(`🔄 Trying mapped ID: ${mappedId}`);
        }
        
        // If still no match and taskId is numeric, try reverse mapping (task_N -> N)
        if (!comprehensiveTask && typeof taskId === 'number') {
            comprehensiveTask = window.COMPREHENSIVE_TASKS.find(t => {
                const numericId = parseInt(t.id.replace('task_', ''));
                return numericId === taskId;
            });
            console.log(`🔄 Trying reverse mapping for numeric ID: ${taskId}`);
        }
        
        if (comprehensiveTask) {
            console.log(`✅ Found in COMPREHENSIVE_TASKS: ${comprehensiveTask.name}`);
            return comprehensiveTask.name;
        } else {
            console.log(`❌ Task ID "${taskId}" not found in COMPREHENSIVE_TASKS`);
            console.log(`📋 Available task IDs in COMPREHENSIVE_TASKS:`, window.COMPREHENSIVE_TASKS.map(t => t.id).slice(0, 10));
        }
    }
    
    // If we have a taskId but no name, try to find it in COMPREHENSIVE_TASKS
    if (taskId) {
        console.log(`⚠️ Falling back to Task ID: ${taskId}`);
        return `[Task ID: ${taskId}]`;
    }
    
    console.log(`❌ No task ID provided, returning Unknown Task`);
    return '[Unknown Task]';
};

function updateDashboard() {
    console.log('📊 Updating dashboard with data...');
    console.log('🔍 Current data state:', {
        sites: window.sites ? window.sites.length : 'undefined',
        actions: window.actions ? window.actions.length : 'undefined',
        scheduledTasks: window.scheduledTasks ? window.scheduledTasks.length : 'undefined',
        clients: window.clients ? window.clients.length : (window.individualHives ? window.individualHives.length : 'undefined'),
        individualHives: window.individualHives ? window.individualHives.length : (window.clients ? window.clients.length : 'undefined'), // Backward compatibility
        tasks: window.tasks ? window.tasks.length : 'undefined',
        globalTasks: tasks ? tasks.length : 'undefined'
    });
    
    // Check if we have the essential data
    if (!window.sites || !window.actions) {
        console.log('⚠️ Essential data not loaded yet, skipping dashboard update');
        return;
    }
    
    // Update client status analysis card if it exists (backward compatibility)
    if (typeof updateClientStatusBreakdown === 'function') {
        updateClientStatusBreakdown();
    } else if (typeof updateHiveStrengthBreakdown === 'function') {
        updateHiveStrengthBreakdown();
    }
    
    // Update equipment breakdown card if it exists
    if (typeof updateEquipmentBreakdown === 'function') {
        updateEquipmentBreakdown();
    }
    
    // Check if data arrays are properly initialized
    if (!window.sites) {
        console.error('❌ Sites array is undefined!');
        window.sites = [];
    }
    if (!window.actions) {
        console.error('❌ Actions array is undefined!');
        window.actions = [];
    }
    if (!window.scheduledTasks) {
        console.error('❌ Scheduled tasks array is undefined!');
        window.scheduledTasks = [];
    }
    // Support both new clients array and old individualHives for backward compatibility
    if (!window.clients && !window.individualHives) {
        console.error('❌ Clients array is undefined!');
        window.clients = [];
        window.individualHives = window.clients; // Backward compatibility alias
    }
    
    // Filter out archived and deleted sites for statistics
    // Note: Deleted sites are removed from Firebase, so they won't be in the array
    const activeSites = (window.sites && Array.isArray(window.sites)) ? window.sites.filter(s => {
        // Exclude archived sites (handle various data types from Firebase)
        if (s.archived === true || s.archived === 'true' || s.archived === 1) return false;
        // Exclude deleted sites if they somehow exist (shouldn't happen, but safety check)
        if (s.deleted === true || s.deleted === 'true' || s.deleted === 1) return false;
        return true;
    }) : [];
    
    // Calculate total clients from care equipment (cumulative total of all equipment)
    // Always calculate from careEquipment/hiveStacks to exactly match equipment breakdown card
    // Support both new careEquipment and old hiveStacks field names for backward compatibility
    // Use same parsing logic as equipment breakdown (parseInt) to handle string numbers
    const safeParse = (val) => {
        if (val === null || val === undefined) return 0;
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? 0 : parsed;
    };
    
    const totalClients = activeSites.reduce((sum, s) => {
        // Support both new careEquipment and old hiveStacks field names
        const equipment = s.careEquipment || s.hiveStacks;
        // Only count sites with equipment data (same logic as equipment breakdown)
        if (equipment && typeof equipment === 'object') {
            const doubles = safeParse(equipment.doubles);
            const singles = safeParse(equipment.singles);
            const nucs = safeParse(equipment.nucs);
            const topSplits = safeParse(equipment.topSplits);
            return sum + doubles + singles + nucs + topSplits;
        }
        // Don't use hiveCount fallback - only count sites with hiveStacks data
        return sum;
    }, 0);
    console.log('📊 Total clients calculated (cumulative total from equipment):', totalClients);
    
    // Check for overdue tasks and update flagged count
    checkAndFlagOverdueTasks();
    const overdueTasksCount = (window.scheduledTasks && Array.isArray(window.scheduledTasks)) ? window.scheduledTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return !task.completed && taskDate < new Date();
    }).length : 0;
    
    const flaggedCount = (window.actions && Array.isArray(window.actions)) ? window.actions.filter(a => a.flag && a.flag !== '').length + overdueTasksCount : overdueTasksCount;
    console.log('📊 Flagged count calculated:', flaggedCount);
    
    // Make flaggedCount globally accessible
    window.flaggedCount = flaggedCount;
    
    // Filter out deleted actions (actions with delete/remove/archive keywords in task name or notes, or [Deleted: pattern)
    const deleteKeywords = ['delete', 'deleted', 'deleting', 'remove', 'removed', 'removing', 'archive', 'archived', 'archiving'];
    const activeActions = (window.actions && Array.isArray(window.actions)) ? window.actions.filter(a => {
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
    
    // Set numbers directly without animation (active sites only)
    document.getElementById('statSites').textContent = activeSites.length;
    const statHivesEl = document.getElementById('statHives');
    if (statHivesEl) statHivesEl.textContent = totalClients;
    document.getElementById('statActions').textContent = activeActions.length;
    document.getElementById('statFlagged').textContent = flaggedCount;
    // Emphasize flagged card severity by count with progressive transition
    const flaggedCard = document.querySelector('.dashboard-stat-card.flagged-card');
    if (flaggedCard) {
        const c = flaggedCount;
        
        // Helper function to interpolate between two RGB colors
        function interpolateColor(color1, color2, factor) {
            const r1 = parseInt(color1.slice(1, 3), 16);
            const g1 = parseInt(color1.slice(3, 5), 16);
            const b1 = parseInt(color1.slice(5, 7), 16);
            const r2 = parseInt(color2.slice(1, 3), 16);
            const g2 = parseInt(color2.slice(3, 5), 16);
            const b2 = parseInt(color2.slice(5, 7), 16);
            
            const r = Math.round(r1 + (r2 - r1) * factor);
            const g = Math.round(g1 + (g2 - g1) * factor);
            const b = Math.round(b1 + (b2 - b1) * factor);
            
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }
        
        // Color scale: 0 = normal card color, 11+ = warning red/orange
        // Normal card color (light yellow/cream): #FFFACD (var(--glass) equivalent)
        // Warning red/orange: #FF6B35 (vibrant orange-red) or #D93A2F (warning red)
        const normalColor = '#FFFACD'; // Same as other cards
        const warningColor = '#FF6B35'; // Vibrant orange-red warning color
        
        let bg, fg, border;
        
        // Progressive color transition: 0 = normal, 1-10 = gradual, 11+ = full warning
        // Factor ranges from 0 (0 flags) to 1 (10+ flags)
        const factor = Math.min(c / 10, 1.0); // Smooth progression: 0 flags = 0, 10 flags = 1.0
        
        if (c === 0) {
            // 0 flags: Same as normal cards (factor = 0)
            bg = normalColor;
            fg = '#000000';
            border = 'rgba(255,255,255,0.2)';
        } else if (c >= 11) {
            // 11+ flags: Full warning red/orange (factor = 1.0)
            bg = warningColor;
            fg = '#ffffff';
            border = '#E85A2A';
        } else {
            // 1-10 flags: Progressive transition using interpolated colors
            bg = interpolateColor(normalColor, warningColor, factor);
            
            // Text color transitions from black to white when background gets dark
            // Switch to white text when factor > 0.5 (around 5-6 flags)
            if (factor > 0.5) {
                fg = '#ffffff';
            } else {
                fg = '#000000';
            }
            
            // Border color also interpolates smoothly
            const borderNormal = '#E1A77A'; // Light border (matches normal card style)
            const borderWarning = '#E85A2A'; // Darker border (matches warning)
            border = interpolateColor(borderNormal, borderWarning, factor);
        }
        
        flaggedCard.style.backgroundColor = bg;
        flaggedCard.style.borderColor = border;
        flaggedCard.style.color = fg;
        
        // Also adjust inner text color for labels/numbers
        const statNum = flaggedCard.querySelector('#statFlagged');
        const statLabel = flaggedCard.querySelector('.stat-label');
        if (statNum) statNum.style.color = fg;
        if (statLabel) statLabel.style.color = fg;
        const icon = flaggedCard.querySelector('.stat-icon-container i');
        if (icon) icon.style.color = fg;
    }
    
    console.log('📊 Dashboard cards updated:', {
        sites: activeSites.length,
        clients: totalClients,
        hives: totalClients, // Backward compatibility
        actions: (window.actions && Array.isArray(window.actions)) ? window.actions.length : 0,
        flagged: flaggedCount
    });
    
    // Update quick stats
    updateQuickStats();
    
    // Auto-load map after data is confirmed
    console.log('📊 Dashboard updated - auto-loading map with data');
    setTimeout(() => {
        if (typeof activateMap === 'function') {
            activateMap();
        }
    }, 1000);
    
    // Show flagged alert if any urgent actions, overdue tasks, or upcoming harvests
    const urgentFlagged = window.actions.filter(a => a.flag === 'urgent');
    const overdueTasksForAlert = window.scheduledTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return !task.completed && taskDate < new Date();
    });
    
    // Check for upcoming harvests (within 30 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    const upcomingHarvests = window.sites.filter(site => {
        if (!site.harvestTimeline) return false;
        try {
            const harvestDate = new Date(site.harvestTimeline);
            harvestDate.setHours(0, 0, 0, 0);
            return harvestDate >= today && harvestDate <= thirtyDaysFromNow;
        } catch (e) {
            return false;
        }
    });
    
    if (urgentFlagged.length > 0 || overdueTasksForAlert.length > 0 || upcomingHarvests.length > 0) {
        let flaggedHtml = '';
        
        // Add urgent actions
        if (urgentFlagged.length > 0) {
            flaggedHtml += urgentFlagged.slice(0, 3).map(a => {
                const site = window.sites.find(s => s.id === a.siteId);
                return `<div class="mb-2">
                    <strong>${site?.name || 'Unknown'}:</strong> ${getTaskDisplayName(a.taskName, a.taskId)}
                    <br><small>${a.notes}</small>
                    <br>
                    <div class="mt-1">
                        <button class="btn btn-sm btn-outline-primary" onclick="handleUrgentItemAction('action', '${a.id}')">
                            <i class="bi bi-calendar-plus"></i> Schedule Follow-up
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="handleUrgentItemAction('complete', '${a.id}')">
                            <i class="bi bi-check"></i> Mark Addressed
                        </button>
                    </div>
                </div>`;
            }).join('');
        }
        
        // Add overdue tasks
        if (overdueTasksForAlert.length > 0) {
            flaggedHtml += overdueTasksForAlert.slice(0, 3).map(task => {
                const site = window.sites.find(s => s.id === task.siteId);
                const taskName = getTaskDisplayName(null, task.taskId);
                return `
                    <div class="mb-2">
                        <strong>OVERDUE: ${taskName}</strong> - ${site?.name || 'Unknown'}
                        <br><small>Due: ${new Date(task.dueDate).toLocaleDateString()}</small>
                        <br>
                        <div class="mt-1">
                            <button class="btn btn-sm btn-outline-primary" onclick="handleUrgentItemAction('reschedule', '${task.id}')">
                                <i class="bi bi-calendar-plus"></i> Reschedule
                            </button>
                            <button class="btn btn-sm btn-outline-success" onclick="handleUrgentItemAction('complete', '${task.id}')">
                                <i class="bi bi-check"></i> Mark Complete
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        // Add upcoming harvests
        if (upcomingHarvests.length > 0) {
            flaggedHtml += upcomingHarvests.slice(0, 3).map(site => {
                const harvestDate = new Date(site.harvestTimeline);
                const daysUntil = Math.ceil((harvestDate - today) / (1000 * 60 * 60 * 24));
                return `
                    <div class="mb-2">
                        <strong>🍯 HARVEST: ${site.name}</strong>
                        <br><small>Expected: ${harvestDate.toLocaleDateString()} (${daysUntil} days)</small>
                        <br>
                        <div class="mt-1">
                            <button class="btn btn-sm btn-outline-primary" onclick="handleHarvestAction('${site.id}', '${site.harvestTimeline}')">
                                <i class="bi bi-calendar-plus"></i> Schedule Harvest
                            </button>
                            <button class="btn btn-sm btn-outline-success" onclick="handleHarvestAction('${site.id}', '${site.harvestTimeline}', true)">
                                <i class="bi bi-check"></i> Mark Addressed
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        document.getElementById('flaggedItemsList').innerHTML = flaggedHtml;
        document.getElementById('flaggedAlert').classList.remove('hidden');
    } else {
        document.getElementById('flaggedAlert').classList.add('hidden');
    }
    
    if (typeof L !== 'undefined') {
        initMap();
    }
    
    const recentActions = [...window.actions].reverse().slice(0, 10);
    const recentHtml = recentActions.length > 0 
        ? recentActions.map(a => {
                const site = window.sites.find(s => s.id === a.siteId);
            const flagIcon = a.flag === 'urgent' ? '🚨' : a.flag === 'warning' ? '⚠️' : a.flag === 'info' ? 'ℹ️' : '';
            const displayTaskName = getTaskDisplayName(a.taskName, a.taskId);
            return `
                <div class="action-item ${a.flag ? 'flag-' + a.flag : ''}">
                    <div><strong>${flagIcon} ${displayTaskName}</strong> - ${site?.name || 'Unknown'}</div>
                    <small class="text-muted">${a.date} • ${a.loggedBy || a.completedBy || a.employee || 'Unknown'}</small>
                    ${a.notes ? `<p class="mb-0 mt-1"><small>${a.notes}</small></p>` : ''}
                </div>
            `;
        }).join('')
        : '<p class="text-muted">No actions yet.</p>';
    
    document.getElementById('recentActions').innerHTML = recentHtml;
    
    updateScheduledTasksPreview();
    updateCalendarWidget();
}

function updateScheduledTasksPreview() {
    if (!window.scheduledTasks || !Array.isArray(window.scheduledTasks)) {
        console.log('⚠️ window.scheduledTasks not available yet');
        return;
    }
    
    const pending = window.scheduledTasks.filter(t => !t.completed);
    const html = pending.length > 0
        ? pending.slice(0, 5).map(t => {
                const site = window.sites.find(s => s.id === t.siteId);
            const task = (window.tasks || tasks || []).find(tk => tk.id === t.taskId);
            const displayTaskName = task ? task.name : getTaskDisplayName(null, t.taskId);
            
            const priorityBadge = t.priority === 'urgent' ? 'danger' : t.priority === 'high' ? 'warning' : 'secondary';
            return `
                <div class="scheduled-task p-2 mb-2 rounded">
                    <div class="d-flex justify-content-between">
                        <div>
                            <strong>${displayTaskName}</strong>
                            <span class="badge bg-${priorityBadge}">${t.priority || 'normal'}</span>
                            <br><small>${site?.name || 'Unknown'}</small>
                        </div>
                        <button class="btn btn-sm btn-success" onclick="completeScheduledTask('${t.id}')">
                            <i class="bi bi-check"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('')
        : '<p class="text-muted">No scheduled tasks.</p>';
    
    const scheduledTasksElement = document.getElementById('scheduledTasksPreview');
    if (scheduledTasksElement) {
        scheduledTasksElement.innerHTML = html;
    }
}

function updateCalendarWidget() {
    const calendarContainer = document.getElementById('calendarWidget');
    if (!calendarContainer) return;
    
    if (!window.scheduledTasks || !Array.isArray(window.scheduledTasks)) {
        console.log('⚠️ window.scheduledTasks not available for calendar widget');
        return;
    }
    
    // Get all future scheduled tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const futureTasks = window.scheduledTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return !task.completed && taskDate >= today;
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    if (futureTasks.length === 0) {
        calendarContainer.innerHTML = `
            <div class="calendar-widget">
                <p class="text-muted">No tasks scheduled for the future.</p>
                <button class="btn btn-sm btn-primary mt-2" onclick="showScheduleTaskModal()">
                    <i class="bi bi-plus"></i> Schedule Task
                </button>
            </div>
        `;
        return;
    }
    
    // Group tasks by date
    const tasksByDate = {};
    futureTasks.forEach(task => {
        const date = new Date(task.dueDate).toDateString();
        if (!tasksByDate[date]) {
            tasksByDate[date] = [];
        }
        tasksByDate[date].push(task);
    });
    
    // Get next 14 days or all future tasks, whichever is smaller
    const datesToShow = Object.keys(tasksByDate).slice(0, 14);
    
    const calendarHtml = datesToShow.map(date => {
        const tasks = tasksByDate[date];
        const dateObj = new Date(date);
        const isToday = dateObj.toDateString() === today.toDateString();
        const isTomorrow = dateObj.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString();
        const isThisWeek = dateObj <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        return `
            <div class="calendar-date ${isToday ? 'today' : ''} ${isTomorrow ? 'tomorrow' : ''} ${isThisWeek ? 'this-week' : ''}">
                <div class="calendar-date-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <strong>${dateObj.toLocaleDateString()}</strong>
                        <div class="date-badges">
                            ${isToday ? '<span class="badge bg-primary">Today</span>' : ''}
                            ${isTomorrow ? '<span class="badge bg-info">Tomorrow</span>' : ''}
                            ${!isToday && !isTomorrow && isThisWeek ? '<span class="badge bg-secondary">This Week</span>' : ''}
                        </div>
                    </div>
                    <small class="text-muted">${tasks.length} task${tasks.length !== 1 ? 's' : ''}</small>
                </div>
                <div class="calendar-tasks">
                    ${tasks.map(task => {
                        const site = window.sites.find(s => s.id === task.siteId);
                        const taskObj = tasks.find(tk => tk.id === task.taskId);
                        const displayTaskName = taskObj ? taskObj.name : getTaskDisplayName(null, task.taskId);
                        const priorityClass = task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : 'secondary';
                        const isOverdue = new Date(task.dueDate) < today;
                        
                        return `
                            <div class="calendar-task ${isOverdue ? 'overdue' : ''}" onclick="viewScheduledTask('${task.id}')">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div class="flex-grow-1">
                                        <div class="task-header">
                                            <strong class="task-name">${displayTaskName}</strong>
                                            <span class="badge bg-${priorityClass}">${task.priority || 'normal'}</span>
                                            ${isOverdue ? '<span class="badge bg-danger">Overdue</span>' : ''}
                                        </div>
                                        <div class="task-details">
                                            <small><i class="bi bi-geo-alt"></i> ${site?.name || 'Unknown'}</small>
                                            ${task.scheduledTime ? `<br><small><i class="bi bi-clock"></i> ${task.scheduledTime}</small>` : ''}
                                            ${task.type === 'next-visit' ? '<br><small><i class="bi bi-calendar-plus"></i> Next Visit</small>' : ''}
                                        </div>
                                    </div>
                                    <div class="task-actions">
                                        <button class="btn btn-sm btn-success" onclick="event.stopPropagation(); completeScheduledTask('${task.id}')" title="Complete Task">
                                            <i class="bi bi-check"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
    
    // Add summary information
    const totalTasks = futureTasks.length;
    const overdueTasksInCalendar = futureTasks.filter(task => new Date(task.dueDate) < today).length;
    const thisWeekTasks = futureTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    }).length;
    
    calendarContainer.innerHTML = `
        <div class="calendar-widget">
            
            <div class="calendar-summary mb-3">
                <div class="row text-center">
                    <div class="col-4">
                        <div class="summary-item">
                            <strong class="text-primary">${totalTasks}</strong>
                            <br><small>Total</small>
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="summary-item">
                            <strong class="text-info">${thisWeekTasks}</strong>
                            <br><small>This Week</small>
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="summary-item">
                            <strong class="text-danger">${overdueTasksInCalendar}</strong>
                            <br><small>Overdue</small>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="calendar-content">
                ${calendarHtml}
            </div>
            
            ${futureTasks.length > 14 ? `
                <div class="text-center mt-3">
                    <small class="text-muted">Showing next 14 days. <a href="#" onclick="showScheduledTasks()">View all ${futureTasks.length} tasks</a></small>
                </div>
            ` : ''}
        </div>
    `;
}

function viewScheduledTask(taskId) {
    // Find the task and show its details
    const task = window.scheduledTasks.find(t => t.id === taskId);
    if (task) {
        // You can implement a modal or redirect to the scheduled tasks view
        showScheduledTasks();
    }
}

function updateQuickStats() {
    console.log('📊 Updating Quick Stats...');
    console.log('📊 Scheduled tasks available:', window.scheduledTasks ? window.scheduledTasks.length : 'undefined');
    
    if (!window.scheduledTasks || window.scheduledTasks.length === 0) {
        console.log('⚠️ No scheduled tasks data available for Quick Stats');
        return;
    }
    
    const today = new Date();
    const thisWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Calculate this week's tasks
    const thisWeekTasks = window.scheduledTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return !task.completed && taskDate >= today && taskDate <= thisWeek;
    }).length;
    
    // Calculate completed tasks
    const completedTasks = window.scheduledTasks.filter(task => task.completed).length;
    
    // Calculate pending tasks
    const pendingTasks = window.scheduledTasks.filter(task => !task.completed).length;
    
    // Calculate overdue tasks
    const overdueTasksForStats = window.scheduledTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return !task.completed && taskDate < today;
    }).length;
    
    console.log('📊 Quick Stats calculated:', {
        thisWeek: thisWeekTasks,
        completed: completedTasks,
        pending: pendingTasks,
        overdue: overdueTasksForStats
    });
    
    // Update quick stats
    const statThisWeek = document.getElementById('statThisWeek');
    const statCompleted = document.getElementById('statCompleted');
    const statPending = document.getElementById('statPending');
    const statOverdue = document.getElementById('statOverdue');
    
    if (statThisWeek) {
        console.log('📊 Updating statThisWeek:', thisWeekTasks);
        try {
            animateNumber(statThisWeek, thisWeekTasks);
        } catch (error) {
            console.log('⚠️ Animation failed, setting direct value:', thisWeekTasks);
            statThisWeek.textContent = thisWeekTasks;
        }
    }
    if (statCompleted) {
        console.log('📊 Updating statCompleted:', completedTasks);
        try {
            animateNumber(statCompleted, completedTasks);
        } catch (error) {
            console.log('⚠️ Animation failed, setting direct value:', completedTasks);
            statCompleted.textContent = completedTasks;
        }
    }
    if (statPending) {
        console.log('📊 Updating statPending:', pendingTasks);
        try {
            animateNumber(statPending, pendingTasks);
        } catch (error) {
            console.log('⚠️ Animation failed, setting direct value:', pendingTasks);
            statPending.textContent = pendingTasks;
        }
    }
    if (statOverdue) {
        console.log('📊 Updating statOverdue:', overdueTasksForStats);
        try {
            animateNumber(statOverdue, overdueTasksForStats);
        } catch (error) {
            console.log('⚠️ Animation failed, setting direct value:', overdueTasksForStats);
            statOverdue.textContent = overdueTasksForStats;
        }
    }
}

// Check for overdue tasks and automatically flag them as urgent
function checkAndFlagOverdueTasks() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let hasUpdates = false;
    
    window.scheduledTasks.forEach(task => {
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
        if (typeof saveScheduledTasks === 'function') {
            saveScheduledTasks();
        } else {
            console.log('⚠️ saveScheduledTasks function not available, skipping save');
        }
    }
}

// Enhanced dashboard cards interactivity
function makeDashboardCardsClickable() {
    // Enhanced click handlers with visual feedback
    const cards = document.querySelectorAll('.dashboard-stat-card');
    
    cards.forEach(card => {
        // Add click animation
        card.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add click animation
            this.style.transform = 'translateY(-8px) scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Navigate to appropriate section
            const target = this.dataset.target;
            switch(target) {
                case 'sites':
                    setTimeout(() => showSites(), 200);
                    break;
                case 'actions':
                    setTimeout(() => showActions(), 200);
                    break;
                case 'flagged':
                    setTimeout(() => showFlagged(), 200);
                    break;
                default:
                    setTimeout(() => showSites(), 200);
            }
        });
        
        // Add keyboard accessibility
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
        
        // Make cards focusable
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Navigate to ${card.dataset.target} section`);
        
        // Add tooltip functionality
        card.addEventListener('mouseenter', function() {
            const target = this.dataset.target;
            let tooltipText = '';
            switch(target) {
                case 'sites':
                    tooltipText = `View and manage all ${window.sites.length} care locations`;
                    break;
                case 'actions':
                    tooltipText = `View and manage all ${window.actions.length} logged actions`;
                    break;
                case 'flagged':
                    tooltipText = `View ${window.flaggedCount || 0} flagged issues requiring attention`;
                    break;
                default:
                    tooltipText = 'Click to navigate to this section';
            }
            this.setAttribute('title', tooltipText);
        });
    });
}

// Add number animation effect
function animateNumber(element, targetValue, duration = 1000) {
    const startValue = parseInt(element.textContent) || 0;
    const increment = (targetValue - startValue) / (duration / 16);
    let currentValue = startValue;
    
    const timer = setInterval(() => {
        currentValue += increment;
        if ((increment > 0 && currentValue >= targetValue) || 
            (increment < 0 && currentValue <= targetValue)) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        element.textContent = Math.floor(currentValue);
    }, 16);
}

// Make recent actions clickable
function makeRecentActionsClickable() {
    const actionItems = document.querySelectorAll('.action-item');
    actionItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function() {
            const actionText = this.querySelector('strong').textContent;
            const siteName = actionText.split(' - ')[1];
            const site = window.sites.find(s => s.name === siteName);
            if (site) {
                viewSiteDetails(site.id);
            }
        });
    });
}

// Debug function to force dashboard refresh
window.forceDashboardRefresh = function() {
    console.log('🔄 Force refreshing dashboard...');
    console.log('📊 Current data state:', {
        sites: window.sites ? window.sites.length : 'undefined',
        actions: window.actions ? window.actions.length : 'undefined',
        scheduledTasks: window.scheduledTasks ? window.scheduledTasks.length : 'undefined',
        individualHives: window.individualHives ? window.individualHives.length : 'undefined'
    });
    
    updateDashboard();
    console.log('✅ Dashboard refresh completed');
};

// Debug function to check dashboard elements
window.checkDashboardElements = function() {
    console.log('🔍 Checking dashboard elements...');
    
    const statSites = document.getElementById('statSites');
    const statHives = document.getElementById('statHives');
    const statActions = document.getElementById('statActions');
    const statFlagged = document.getElementById('statFlagged');
    
    console.log('📊 Dashboard elements found:', {
        statSites: !!statSites,
        statHives: !!statHives,
        statActions: !!statActions,
        statFlagged: !!statFlagged
    });
    
    if (statSites) console.log('📊 statSites current value:', statSites.textContent);
    if (statHives) console.log('📊 statHives current value:', statHives.textContent);
    if (statActions) console.log('📊 statActions current value:', statActions.textContent);
    if (statFlagged) console.log('📊 statFlagged current value:', statFlagged.textContent);
    
    return {
        elements: { statSites: !!statSites, statHives: !!statHives, statActions: !!statActions, statFlagged: !!statFlagged },
        values: {
            statSites: statSites ? statSites.textContent : 'not found',
            statHives: statHives ? statHives.textContent : 'not found',
            statActions: statActions ? statActions.textContent : 'not found',
            statFlagged: statFlagged ? statFlagged.textContent : 'not found'
        }
    };
};

// Sync status functions
function showSyncStatus(message, type = 'success') {
    const indicator = document.getElementById('syncIndicator');
    const syncText = document.getElementById('syncText');
    
    indicator.classList.remove('hidden', 'syncing', 'error');
    if (type === 'syncing') {
        indicator.classList.add('syncing');
        syncText.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Syncing...';
    } else if (type === 'error') {
        indicator.classList.add('error');
        syncText.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Error';
    } else {
        syncText.innerHTML = '<i class="bi bi-check-circle"></i> Synced';
    }
    
    indicator.classList.remove('hidden');
    
    if (type !== 'syncing') {
        setTimeout(() => indicator.classList.add('hidden'), 2000);
    }
}

function handleOnline() {
    isOnline = true;
    showSyncStatus('', 'success');
    processSyncQueue();
}

function handleOffline() {
    isOnline = false;
    showSyncStatus('', 'error');
}

function loadSyncQueue() {
    const saved = localStorage.getItem('syncQueue');
    if (saved) {
        syncQueue = JSON.parse(saved);
    }
}

function saveSyncQueue() {
    localStorage.setItem('syncQueue', JSON.stringify(syncQueue));
}

function addToSyncQueue(operation) {
    syncQueue.push(operation);
    saveSyncQueue();
}

function processSyncQueue() {
    if (syncInProgress || syncQueue.length === 0) return;
    
    syncInProgress = true;
    showSyncStatus('<i class="bi bi-arrow-repeat"></i> Syncing...', 'syncing');
    
    const operation = syncQueue.shift();
    saveSyncQueue();
    
    // Process the operation
    database.ref(operation.path).set(operation.data)
        .then(() => {
            showSyncStatus('<i class="bi bi-check"></i> Synced', 'success');
            syncInProgress = false;
            if (syncQueue.length > 0) {
                setTimeout(processSyncQueue, 1000);
            }
        })
        .catch(error => {
            console.error('Sync error:', error);
            showSyncStatus('<i class="bi bi-x"></i> Sync failed', 'error');
            syncInProgress = false;
        });
}

function updateSyncStatus() {
    const status = isOnline ? 'Online' : 'Offline';
    const icon = isOnline ? 'bi-wifi' : 'bi-wifi-off';
    const color = isOnline ? 'text-success' : 'text-warning';
    
    const syncStatus = document.getElementById('syncStatus');
    if (syncStatus) {
        syncStatus.innerHTML = `<i class="bi ${icon} ${color}"></i> ${status}`;
    }
}

/**
 * Handle actions on urgent items from the dashboard
 * @param {string} action - Type of action: 'action', 'reschedule', 'complete'
 * @param {string} itemId - ID of the action or task
 */
function handleUrgentItemAction(action, itemId) {
    event.stopPropagation();
    
    if (action === 'complete' || action === 'reschedule') {
        // For tasks - complete or reschedule
        if (typeof completeScheduledTask === 'function') {
            completeScheduledTask(itemId);
        } else {
            careMarshallAlert('Task management not available', 'error');
        }
    } else if (action === 'action') {
        // For actions - open scheduling for follow-up
        const actionObj = window.actions.find(a => a.id === itemId);
        if (actionObj && typeof showScheduleTaskModal === 'function') {
            showScheduleTaskModal();
        } else {
            careMarshallAlert('Scheduling not available', 'error');
        }
    }
}

/**
 * Handle harvest-specific actions
 * @param {string} siteId - ID of the site
 * @param {string} harvestDate - Expected harvest date
 * @param {boolean} markAddressed - Whether to mark as addressed (clears harvest date)
 */
function handleHarvestAction(siteId, harvestDate, markAddressed = false) {
    event.stopPropagation();
    
    if (markAddressed) {
        // Clear the harvest date to mark as addressed
        const site = window.sites.find(s => s.id === siteId);
        if (site) {
            site.harvestTimeline = '';
            
            const tenantPath = currentTenantId ? `tenants/${currentTenantId}/sites` : 'sites';
            database.ref(`${tenantPath}/${site.id}`).update({ harvestTimeline: '' })
                .then(() => {
                    careMarshallAlert('✅ Harvest marked as addressed', 'success');
                    updateDashboard();
                });
        }
    } else {
        // Schedule a harvest task
        const site = window.sites.find(s => s.id === siteId);
        if (site && typeof showScheduleTaskModal === 'function') {
            // Try to find a harvest task in the tasks list
            const harvestTask = tasks.find(t => 
                t.name.toLowerCase().includes('harvest') || 
                t.category.toLowerCase().includes('harvest')
            );
            
            if (harvestTask) {
                // Pre-fill with harvest task
                document.getElementById('scheduleSite').value = siteId;
                document.getElementById('scheduleTask').value = harvestTask.id;
                document.getElementById('scheduleDueDate').value = harvestDate;
                
                const modal = new bootstrap.Modal(document.getElementById('scheduleTaskModal'));
                modal.show();
            } else {
                // Just open the scheduling modal
                showScheduleTaskModal();
                document.getElementById('scheduleSite').value = siteId;
                document.getElementById('scheduleDueDate').value = harvestDate;
                careMarshallAlert('📅 Please select a harvest task to schedule', 'info');
            }
        } else {
            careMarshallAlert('Scheduling not available', 'error');
        }
    }
}
