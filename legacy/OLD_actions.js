// BeeMarshall - Actions Management Module

function showLogActionForm() {
    hideAllViews();
    document.getElementById('logActionView').classList.remove('hidden');
    populateActionForm();
}

function populateActionForm() {
    const siteSelect = document.getElementById('actionSite');
    siteSelect.innerHTML = '<option value="">Select site...</option>' +
        sites.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    
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
                    <input class="form-check-input task-checkbox" type="checkbox" value="${task.id}" id="task${task.id}">
                    <label class="form-check-label" for="task${task.id}">
                        ${task.name}
                        ${task.common ? '<span class="badge bg-success badge-sm">★</span>' : ''}
                    </label>
                </div>
            `).join('')}
        </div>
    `).join('');
    
    document.getElementById('taskCheckboxes').innerHTML = `<div class="row">${html}</div>`;
    filterTaskCheckboxes('common');
}

function filterTaskCheckboxes(filter) {
    document.querySelectorAll('.task-checkbox-item').forEach(item => {
        item.style.display = (filter === 'all' || item.dataset.common === 'true') ? '' : 'none';
    });
}

function loadSiteHives() {
    const siteId = parseInt(document.getElementById('actionSite').value);
    const hives = individualHives.filter(h => h.siteId === siteId);
    
    if (hives.length > 0) {
        const select = document.getElementById('actionHive');
        select.innerHTML = '<option value="">All hives in site</option>' +
            hives.map(h => `<option value="${h.id}">${h.hiveName} (${h.status})</option>`).join('');
        document.getElementById('individualHiveSelect').classList.remove('hidden');
    } else {
        document.getElementById('individualHiveSelect').classList.add('hidden');
    }
}

function handleLogAction(e) {
    e.preventDefault();
    
    const siteId = parseInt(document.getElementById('actionSite').value);
    const date = document.getElementById('actionDate').value;
    const notes = document.getElementById('actionNotes').value;
    const flag = document.getElementById('actionFlag').value;
    const individualHiveId = document.getElementById('actionHive')?.value || null;
    
    if (!siteId) {
        alert('Please select a site');
        return;
    }
    
    const selectedTasks = Array.from(document.querySelectorAll('.task-checkbox:checked'))
        .map(cb => parseInt(cb.value));
    
    if (selectedTasks.length === 0) {
        alert('Please select at least one task');
        return;
    }
    
    showSyncStatus('<i class="bi bi-arrow-repeat"></i> Logging actions...', 'syncing');
    
    const promises = selectedTasks.map(taskId => {
        const task = tasks.find(t => t.id === taskId);
        const action = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            siteId,
            individualHiveId,
            taskId,
            taskName: task.name,
            taskCategory: task.category,
            date,
            notes,
            flag,
            loggedBy: currentUser.username,
            createdAt: new Date().toISOString()
        };
        // Use tenant-specific path for data isolation
        const tenantPath = currentTenantId ? `tenants/${currentTenantId}/actions` : 'actions';
        return database.ref(`${tenantPath}/${action.id}`).set(action);
    });
    
    Promise.all(promises).then(() => {
        showSyncStatus(`<i class="bi bi-check"></i> ${selectedTasks.length} action(s) logged by ${currentUser.username}`);
        document.getElementById('actionForm').reset();
        document.getElementById('actionDate').valueAsDate = new Date();
        showActions();
    });
}

function populateActionFilters() {
    const siteFilter = document.getElementById('filterSite');
    siteFilter.innerHTML = '<option value="">All Sites</option>' +
        sites.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    
    const categories = [...new Set(tasks.map(t => t.category))].sort();
    document.getElementById('filterCategory').innerHTML = '<option value="">All Categories</option>' +
        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    
    const employeeNames = [...new Set(actions.map(a => a.loggedBy))].filter(Boolean);
    document.getElementById('filterEmployee').innerHTML = '<option value="">All Employees</option>' +
        employeeNames.map(name => `<option value="${name}">${name}</option>`).join('');
}

function renderActions() {
    const siteFilter = document.getElementById('filterSite')?.value;
    const categoryFilter = document.getElementById('filterCategory')?.value;
    const employeeFilter = document.getElementById('filterEmployee')?.value;
    
    let filtered = [...actions];
    if (siteFilter) filtered = filtered.filter(a => a.siteId == siteFilter);
    if (categoryFilter) filtered = filtered.filter(a => a.taskCategory === categoryFilter);
    if (employeeFilter) filtered = filtered.filter(a => a.loggedBy === employeeFilter);
    
    const html = filtered.reverse().length > 0
        ? filtered.map(a => {
            const site = sites.find(s => s.id === a.siteId);
            const hive = individualHives.find(h => h.id === a.individualHiveId);
            const flagIcon = a.flag === 'urgent' ? '🚨' : a.flag === 'warning' ? '⚠️' : a.flag === 'info' ? 'ℹ️' : '';
            const deleteBtn = canDeleteAction() ? `
                <button class="btn btn-sm btn-outline-danger" onclick="deleteAction('${a.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            ` : '';
            
            const displayTaskName = getTaskDisplayName(a.taskName, a.taskId);
            const isDeletedTask = displayTaskName.startsWith('[Deleted:');
            
            return `
                <div class="action-item ${a.flag ? 'flag-' + a.flag : ''}">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <div class="mb-1">
                                ${flagIcon} <span class="badge bg-secondary">${a.taskCategory || 'Task'}</span>
                                <strong class="${isDeletedTask ? 'text-muted' : ''}">${displayTaskName}</strong>
                            </div>
                            <div class="text-muted small">
                                <i class="bi bi-geo-alt"></i> ${site?.name || 'Unknown'}
                                ${hive ? ` • <i class="bi bi-hexagon"></i> ${hive.hiveName}` : ''}
                                <br>
                                <i class="bi bi-calendar"></i> ${a.date} • 
                                <i class="bi bi-person"></i> ${a.loggedBy || 'Unknown'}
                            </div>
                            ${a.notes ? `<p class="mb-0 mt-2"><small><strong>Notes:</strong> ${a.notes}</small></p>` : ''}
                        </div>
                        ${deleteBtn}
                    </div>
                </div>
            `;
        }).join('')
        : '<p class="text-center text-muted my-5">No actions found.</p>';
    
    document.getElementById('actionsList').innerHTML = html;
}

function deleteAction(id) {
    // Check permission
    if (!canDeleteAction()) {
        showPermissionDeniedAlert('delete actions');
        return;
    }
    
    if (confirm('Delete this action? This cannot be undone!')) {
        // Use tenant-specific path for data isolation
        const tenantPath = currentTenantId ? `tenants/${currentTenantId}/actions` : 'actions';
        database.ref(`${tenantPath}/${id}`).remove();
    }
}

function showFlagged() {
    hideAllViews();
    document.getElementById('flaggedView').classList.remove('hidden');
    renderFlaggedItems();
}

function renderFlaggedItems() {
    const flagged = actions.filter(a => a.flag && a.flag !== '');
    const html = flagged.reverse().length > 0
        ? flagged.map(a => {
            const site = sites.find(s => s.id === a.siteId);
            const flagClass = a.flag === 'urgent' ? 'danger' : a.flag === 'warning' ? 'warning' : 'info';
            const flagIcon = a.flag === 'urgent' ? '🚨' : a.flag === 'warning' ? '⚠️' : 'ℹ️';
            
            return `
                <div class="card mb-3 border-${flagClass}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h5>${flagIcon} ${a.taskName}</h5>
                                <p class="mb-1"><i class="bi bi-geo-alt"></i> ${site?.name || 'Unknown'}</p>
                                <p class="mb-1"><small><i class="bi bi-calendar"></i> ${a.date} • <i class="bi bi-person"></i> ${a.loggedBy}</small></p>
                                <span class="badge bg-${flagClass}">${a.flag.toUpperCase()}</span>
                                ${a.notes ? `<p class="mt-2">${a.notes}</p>` : ''}
                            </div>
                            ${isAdmin ? `<button class="btn btn-sm btn-outline-secondary" onclick="unflagAction('${a.id}')"><i class="bi bi-flag"></i> Unflag</button>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('')
        : '<p class="text-center text-muted my-5">No flagged items. Flag important events for team visibility!</p>';
    
    document.getElementById('flaggedItemsList2').innerHTML = html;
}

function unflagAction(id) {
    // Use tenant-specific path for data isolation
    const tenantPath = currentTenantId ? `tenants/${currentTenantId}/actions` : 'actions';
    database.ref(`${tenantPath}/${id}/flag`).set('');
}
