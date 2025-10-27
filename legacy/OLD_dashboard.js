// BeeMarshall - Dashboard Module with Calendar Widget

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
        'Sites': 'showSites',
        'Actions': 'showActions',
        'Schedule': 'showScheduledTasks',
        'Tasks': 'showTasks',
        'Task': 'showTasks',
        'Compliance': 'showComplianceView',
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
};

function updateDashboard() {
    console.log('📊 Updating dashboard with data...');
    console.log('🔍 Current data state:', {
        sites: sites ? sites.length : 'undefined',
        actions: actions ? actions.length : 'undefined',
        scheduledTasks: scheduledTasks ? scheduledTasks.length : 'undefined',
        individualHives: individualHives ? individualHives.length : 'undefined'
    });
    
    // Check if data arrays are properly initialized
    if (!sites) {
        console.error('❌ Sites array is undefined!');
        sites = [];
    }
    if (!actions) {
        console.error('❌ Actions array is undefined!');
        actions = [];
    }
    if (!scheduledTasks) {
        console.error('❌ Scheduled tasks array is undefined!');
        scheduledTasks = [];
    }
    if (!individualHives) {
        console.error('❌ Individual hives array is undefined!');
        individualHives = [];
    }
    
    // Filter out archived sites for statistics
    const activeSites = sites.filter(s => !s.archived);
    
    const totalHives = activeSites.reduce((sum, s) => sum + (s.hiveCount || 0), 0);
    console.log('📊 Total hives calculated:', totalHives);
    
    // Check for overdue tasks and update flagged count
    checkAndFlagOverdueTasks();
    const overdueTasksCount = scheduledTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return !task.completed && taskDate < new Date();
    }).length;
    
    const flaggedCount = actions.filter(a => a.flag && a.flag !== '').length + overdueTasksCount;
    console.log('📊 Flagged count calculated:', flaggedCount);
    
    // Make flaggedCount globally accessible
    window.flaggedCount = flaggedCount;
    
    // Set numbers directly without animation (active sites only)
    document.getElementById('statSites').textContent = activeSites.length;
    document.getElementById('statHives').textContent = totalHives;
    document.getElementById('statActions').textContent = actions.length;
    document.getElementById('statFlagged').textContent = flaggedCount;
    
    console.log('📊 Dashboard cards updated:', {
        sites: sites.length,
        hives: totalHives,
        actions: actions.length,
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
    const urgentFlagged = actions.filter(a => a.flag === 'urgent');
    const overdueTasksForAlert = scheduledTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return !task.completed && taskDate < new Date();
    });
    
    // Check for upcoming harvests (within 30 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    const upcomingHarvests = sites.filter(site => {
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
                const site = sites.find(s => s.id === a.siteId);
                return `<div class="mb-2">
                    <strong>${site?.name || 'Unknown'}:</strong> ${a.taskName}
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
                const site = sites.find(s => s.id === task.siteId);
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
    
    const recentActions = [...actions].reverse().slice(0, 10);
    const recentHtml = recentActions.length > 0 
        ? recentActions.map(a => {
                const site = sites.find(s => s.id === a.siteId);
            const flagIcon = a.flag === 'urgent' ? '🚨' : a.flag === 'warning' ? '⚠️' : a.flag === 'info' ? 'ℹ️' : '';
            const displayTaskName = getTaskDisplayName(a.taskName, a.taskId);
            return `
                <div class="action-item ${a.flag ? 'flag-' + a.flag : ''}">
                    <div><strong>${flagIcon} ${displayTaskName}</strong> - ${site?.name || 'Unknown'}</div>
                    <small class="text-muted">${a.date} • ${a.loggedBy || 'User'}</small>
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
    const pending = scheduledTasks.filter(t => !t.completed);
    const html = pending.length > 0
        ? pending.slice(0, 5).map(t => {
                const site = sites.find(s => s.id === t.siteId);
            const task = tasks.find(tk => tk.id === t.taskId);
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
    
    // Get all future scheduled tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const futureTasks = scheduledTasks.filter(task => {
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
                        const site = sites.find(s => s.id === task.siteId);
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
    const task = scheduledTasks.find(t => t.id === taskId);
    if (task) {
        // You can implement a modal or redirect to the scheduled tasks view
        showScheduledTasks();
    }
}

function updateQuickStats() {
    console.log('📊 Updating Quick Stats...');
    console.log('📊 Scheduled tasks available:', scheduledTasks ? scheduledTasks.length : 'undefined');
    
    if (!scheduledTasks || scheduledTasks.length === 0) {
        console.log('⚠️ No scheduled tasks data available for Quick Stats');
        return;
    }
    
    const today = new Date();
    const thisWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Calculate this week's tasks
    const thisWeekTasks = scheduledTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return !task.completed && taskDate >= today && taskDate <= thisWeek;
    }).length;
    
    // Calculate completed tasks
    const completedTasks = scheduledTasks.filter(task => task.completed).length;
    
    // Calculate pending tasks
    const pendingTasks = scheduledTasks.filter(task => !task.completed).length;
    
    // Calculate overdue tasks
    const overdueTasksForStats = scheduledTasks.filter(task => {
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
                    tooltipText = `View and manage all ${sites.length} apiary sites`;
                    break;
                case 'actions':
                    tooltipText = `View and manage all ${actions.length} logged actions`;
                    break;
                case 'flagged':
                    tooltipText = `View ${flaggedCount} flagged issues requiring attention`;
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
            const site = sites.find(s => s.name === siteName);
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
        sites: sites ? sites.length : 'undefined',
        actions: actions ? actions.length : 'undefined',
        scheduledTasks: scheduledTasks ? scheduledTasks.length : 'undefined',
        individualHives: individualHives ? individualHives.length : 'undefined'
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
            beeMarshallAlert('Task management not available', 'error');
        }
    } else if (action === 'action') {
        // For actions - open scheduling for follow-up
        const actionObj = actions.find(a => a.id === itemId);
        if (actionObj && typeof showScheduleTaskModal === 'function') {
            showScheduleTaskModal();
        } else {
            beeMarshallAlert('Scheduling not available', 'error');
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
        const site = sites.find(s => s.id === siteId);
        if (site) {
            site.harvestTimeline = '';
            
            const tenantPath = currentTenantId ? `tenants/${currentTenantId}/sites` : 'sites';
            database.ref(`${tenantPath}/${site.id}`).update({ harvestTimeline: '' })
                .then(() => {
                    beeMarshallAlert('✅ Harvest marked as addressed', 'success');
                    updateDashboard();
                });
        }
    } else {
        // Schedule a harvest task
        const site = sites.find(s => s.id === siteId);
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
                beeMarshallAlert('📅 Please select a harvest task to schedule', 'info');
            }
        } else {
            beeMarshallAlert('Scheduling not available', 'error');
        }
    }
}
