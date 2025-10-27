// BeeMarshall - NZ Regulatory Compliance Module
// Tracks statutory obligations for New Zealand beekeepers

// Regulatory deadlines and obligations
const COMPLIANCE_DEADLINES = {
    colonySnapshot: {
        date: 31, // 31 March - Snapshot date for colony counts
        month: 2, // March (0-indexed)
        label: 'Colony Count Snapshot (31 March)',
        description: 'Confirm exact colony counts as at 31 March for levy calculation',
        reminders: [14, 7, 1] // Days before
    },
    levyInvoice: {
        date: 1, // 1 April - Levy invoices generated
        month: 3, // April (0-indexed)
        label: 'Levy Invoice Generated (1 April)',
        description: 'New levy invoice available and returns now open',
        reminders: [0] // Same day notification
    },
    adrDeadline: {
        date: 1, // 1 June - ADR & Colony Return deadline
        month: 5, // June (0-indexed)
        label: 'ADR & Colony Return Deadline (1 June)',
        description: 'Submit Annual Disease Return and Colony Return by 1 June',
        reminders: [45, 16, 7, 1] // Days before: 15 May, 16 May, 25 May, 31 May
    },
    levyPaymentDue: {
        date: 1, // 1 June - Levy payment due
        month: 5, // June (0-indexed)
        label: 'Levy Payment Due (1 June)',
        description: 'Levy payment must be completed by 1 June',
        reminders: [7, 1] // Days before: 25 May, 31 May
    },
    coiStart: {
        date: 1, // 1 August - COI inspection window opens
        month: 7, // August (0-indexed)
        label: 'COI Inspection Window Opens (1 Aug)',
        description: 'Certificate of Inspection period begins (if no DECA)',
        reminders: [2, 0] // 30 July, 1 August
    },
    coiEnd: {
        date: 30, // 30 November - COI window closes
        month: 10, // November (0-indexed)
        label: 'COI Inspection Window Closes (30 Nov)',
        description: 'Last day to complete Certificate of Inspection',
        reminders: [45, 10, 1] // 15 Oct, 20 Nov, 29 Nov
    }
};

// AFB Reporting requirement
const AFB_REPORTING_DEADLINE = 7; // Must report within 7 days of detection

/**
 * Show compliance dashboard
 */
function showComplianceView() {
    hideAllViews();
    document.getElementById('complianceView').classList.remove('hidden');
    if (typeof updateActiveNav === 'function') {
        updateActiveNav('Compliance');
    }
    renderComplianceDashboard();
}

/**
 * Render compliance dashboard with all obligations
 */
function renderComplianceDashboard() {
    const container = document.getElementById('complianceDashboard');
    if (!container) return;
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    let html = `
        <div class="alert alert-info">
            <h5><i class="bi bi-shield-check"></i> NZ Regulatory Compliance</h5>
            <p class="mb-0">Track your statutory obligations as a registered beekeeper in New Zealand. Automated reminders will help you stay compliant with NZBB requirements.</p>
        </div>
        
        <div class="row">
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="bi bi-calendar-event"></i> Upcoming Deadlines</h5>
                    </div>
                    <div class="card-body">
                        ${renderUpcomingDeadlines()}
                    </div>
                </div>
            </div>
            
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="bi bi-check-circle"></i> Compliance Status</h5>
                    </div>
                    <div class="card-body">
                        ${renderComplianceStatus()}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-12 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="bi bi-list-ul"></i> All Compliance Obligations</h5>
                    </div>
                    <div class="card-body">
                        ${renderAllObligations()}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-12 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="bi bi-user"></i> Your Profile Settings</h5>
                    </div>
                    <div class="card-body">
                        ${renderProfileSettings()}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Render upcoming deadlines
 */
function renderUpcomingDeadlines() {
    const currentDate = new Date();
    const upcoming = getUpcomingDeadlines(30); // Next 30 days
    
    if (upcoming.length === 0) {
        return '<p class="text-muted text-center my-3">No deadlines in the next 30 days</p>';
    }
    
    return upcoming.map(item => {
        const daysUntil = item.daysUntil;
        const urgencyClass = daysUntil <= 7 ? 'danger' : daysUntil <= 14 ? 'warning' : 'info';
        
        return `
            <div class="alert alert-${urgencyClass} d-flex justify-content-between align-items-center mb-2">
                <div>
                    <strong>${item.label}</strong>
                    <br><small>${formatDate(item.date)}</small>
                </div>
                <div class="text-end">
                    <span class="badge bg-${urgencyClass}">${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}</span>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Render compliance status
 */
function renderComplianceStatus() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Check completion status for current year
    const profile = getUserProfile();
    
    const status = {
        adr: profile?.compliance?.[currentYear]?.adrCompleted || false,
        colonyReturn: profile?.compliance?.[currentYear]?.colonyReturnCompleted || false,
        levyPaid: profile?.compliance?.[currentYear]?.levyPaid || false,
        coi: profile?.compliance?.[currentYear]?.coiCompleted || false
    };
    
    const totalObligations = 4;
    const completedObligations = Object.values(status).filter(v => v).length;
    const percentage = (completedObligations / totalObligations) * 100;
    
    return `
        <div class="mb-3">
            <h5>${currentYear} Status</h5>
            <div class="progress mb-2" style="height: 25px;">
                <div class="progress-bar ${percentage === 100 ? 'bg-success' : percentage >= 50 ? 'bg-warning' : 'bg-danger'}" 
                     role="progressbar" 
                     style="width: ${percentage}%">
                    ${Math.round(percentage)}% Complete
                </div>
            </div>
        </div>
        
        <div class="small">
            ${renderStatusItem('Annual Disease Return', status.adr)}
            ${renderStatusItem('Colony Return', status.colonyReturn)}
            ${renderStatusItem('Levy Payment', status.levyPaid)}
            ${!profile?.hasDECA ? renderStatusItem('Certificate of Inspection', status.coi) : ''}
        </div>
    `;
}

/**
 * Render single status item
 */
function renderStatusItem(label, completed) {
    const icon = completed ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted';
    return `
        <div class="mb-2">
            <i class="bi ${icon}"></i> ${label}
        </div>
    `;
}

/**
 * Render all obligations
 */
function renderAllObligations() {
    const obligations = [
        {
            period: '31 March',
            deadline: '1 June',
            obligations: [
                { name: 'Annual Disease Return (ADR)', description: 'Complete ADR even if no bees', required: true },
                { name: 'Colony Return', description: 'Declare colony count as at 31 March', required: true }
            ]
        },
        {
            period: '1 April',
            deadline: '1 June',
            obligations: [
                { name: 'Levy Payment', description: 'Pay levy invoice', required: true }
            ]
        },
        {
            period: '1 Aug - 30 Nov',
            deadline: '30 Nov',
            obligations: [
                { name: 'Certificate of Inspection (COI)', description: 'Required if no DECA', required: false }
            ]
        },
        {
            period: 'On Detection',
            deadline: '7 Days',
            obligations: [
                { name: 'AFB Reporting', description: 'Report within 7 days of detection', required: true }
            ]
        }
    ];
    
    return obligations.map((period, index) => `
        <div class="card mb-3">
            <div class="card-header">
                <strong>${period.period} → Due: ${period.deadline}</strong>
            </div>
            <div class="card-body">
                ${period.obligations.map(obligation => `
                    <div class="mb-2">
                        <strong>${obligation.name}</strong>
                        ${!obligation.required ? '<span class="badge bg-secondary ms-2">Conditional</span>' : ''}
                        <br><small class="text-muted">${obligation.description}</small>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

/**
 * Render profile settings
 */
function renderProfileSettings() {
    const profile = getUserProfile();
    
    return `
        <div class="row">
            <div class="col-md-6">
                <div class="mb-3">
                    <label class="form-label"><strong>NZBB Registration Number</strong></label>
                    <input type="text" class="form-control" id="nzbbRegistration" 
                           value="${profile?.nzbbRegistration || ''}" 
                           placeholder="Enter your registration number">
                </div>
            </div>
            <div class="col-md-6">
                <div class="mb-3">
                    <label class="form-label"><strong>DECA Status</strong></label>
                    <select class="form-select" id="hasDECA">
                        <option value="false" ${!profile?.hasDECA ? 'selected' : ''}>No DECA</option>
                        <option value="true" ${profile?.hasDECA ? 'selected' : ''}>Holds DECA</option>
                    </select>
                    <small class="form-text text-muted">If you hold a DECA, COI inspection is not required</small>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-12">
                <div class="mb-3">
                    <label class="form-label"><strong>Notification Preferences</strong></label>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="enableNotifications" 
                               ${profile?.notificationsEnabled !== false ? 'checked' : ''}>
                        <label class="form-check-label" for="enableNotifications">
                            Enable automated compliance reminders
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="emailNotifications" 
                               ${profile?.emailNotifications ? 'checked' : ''}>
                        <label class="form-check-label" for="emailNotifications">
                            Send email notifications
                        </label>
                    </div>
                </div>
            </div>
        </div>
        
        <button class="btn btn-primary" onclick="saveComplianceSettings()">
            <i class="bi bi-save"></i> Save Settings
        </button>
    `;
}

/**
 * Get upcoming deadlines
 */
function getUpcomingDeadlines(daysAhead = 365) {
    const currentDate = new Date();
    const upcoming = [];
    
    Object.keys(COMPLIANCE_DEADLINES).forEach(key => {
        const deadline = COMPLIANCE_DEADLINES[key];
        const deadlineDate = new Date(currentDate.getFullYear(), deadline.month, deadline.date);
        
        // If deadline has passed this year, set for next year
        if (deadlineDate < currentDate) {
            deadlineDate.setFullYear(deadlineDate.getFullYear() + 1);
        }
        
        const daysUntil = Math.ceil((deadlineDate - currentDate) / (1000 * 60 * 60 * 24));
        
        if (daysUntil <= daysAhead) {
            upcoming.push({
                key,
                label: deadline.label,
                date: deadlineDate,
                daysUntil,
                deadline
            });
        }
    });
    
    // Sort by date
    upcoming.sort((a, b) => a.date - b.date);
    
    return upcoming;
}

/**
 * Get user profile from Firebase
 */
function getUserProfile() {
    return currentUser?.complianceProfile || {};
}

/**
 * Save compliance settings
 */
function saveComplianceSettings() {
    const profile = {
        nzbbRegistration: document.getElementById('nzbbRegistration').value,
        hasDECA: document.getElementById('hasDECA').value === 'true',
        notificationsEnabled: document.getElementById('enableNotifications').checked,
        emailNotifications: document.getElementById('emailNotifications').checked
    };
    
    showSyncStatus('<i class="bi bi-arrow-repeat"></i> Saving...', 'syncing');
    
    const tenantPath = currentTenantId ? `tenants/${currentTenantId}/users/${currentUser.uid}` : `users/${currentUser.uid}`;
    
    database.ref(tenantPath).update({ complianceProfile: profile })
        .then(() => {
            showSyncStatus('<i class="bi bi-check"></i> Settings saved!', 'success');
            // Update currentUser
            currentUser.complianceProfile = profile;
            renderComplianceDashboard();
        })
        .catch(error => {
            showSyncStatus('<i class="bi bi-x"></i> Save failed', 'error');
            Logger.error('Error saving compliance settings:', error);
        });
}

/**
 * Mark obligation as completed
 */
function markObligationCompleted(obligationType, year) {
    const profile = getUserProfile();
    
    if (!profile.compliance) {
        profile.compliance = {};
    }
    if (!profile.compliance[year]) {
        profile.compliance[year] = {};
    }
    
    profile.compliance[year][obligationType] = true;
    profile.compliance[year][`${obligationType}Date`] = new Date().toISOString();
    
    const tenantPath = currentTenantId ? `tenants/${currentTenantId}/users/${currentUser.uid}` : `users/${currentUser.uid}`;
    
    database.ref(tenantPath).update({ complianceProfile: profile })
        .then(() => {
            beeMarshallAlert(`✅ ${obligationType} marked as completed`, 'success');
            currentUser.complianceProfile = profile;
            renderComplianceDashboard();
        });
}

/**
 * Format date
 */
function formatDate(date) {
    return date.toLocaleDateString('en-NZ', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

/**
 * Initialize compliance module
 */
function initComplianceModule() {
    Logger.log('📋 Compliance module initialized');
    
    // Check for upcoming deadlines and show notifications
    checkComplianceDeadlines();
}

/**
 * Check compliance deadlines and show notifications
 */
function checkComplianceDeadlines() {
    const upcoming = getUpcomingDeadlines(7); // Next 7 days
    
    if (upcoming.length > 0) {
        const profile = getUserProfile();
        
        // Only show if notifications enabled
        if (profile?.notificationsEnabled !== false) {
            upcoming.forEach(item => {
                if (item.daysUntil <= 3) { // Critical deadlines
                    beeMarshallAlert(
                        `⚠️ Compliance Deadline: ${item.label} in ${item.daysUntil} days`,
                        item.daysUntil === 0 ? 'error' : 'warning'
                    );
                }
            });
        }
    }
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initComplianceModule);
} else {
    initComplianceModule();
}
