// CareMarshall - Regulatory Compliance Module
// Tracks statutory obligations for NZ care providers

// Regulatory deadlines and obligations for NZ care providers
const COMPLIANCE_DEADLINES = {
    annualRegistration: {
        date: 31, // 31 March - Annual registration renewal
        month: 2, // March (0-indexed)
        label: 'Annual Registration Renewal (31 March)',
        description: 'Renew Health and Disability Services registration',
        reminders: [30, 14, 7, 1] // Days before
    },
    insuranceRenewal: {
        date: 1, // 1 April - Insurance renewal
        month: 3, // April (0-indexed)
        label: 'Professional Indemnity Insurance Renewal (1 April)',
        description: 'Renew professional indemnity and public liability insurance',
        reminders: [30, 14, 7, 1] // Days before
    },
    privacyAudit: {
        date: 1, // 1 June - Privacy Act compliance audit
        month: 5, // June (0-indexed)
        label: 'Privacy Act Compliance Review (1 June)',
        description: 'Annual review of privacy policies and data protection measures',
        reminders: [30, 14, 7, 1] // Days before
    },
    recordKeepingAudit: {
        date: 30, // 30 June - Record keeping audit
        month: 5, // June (0-indexed)
        label: 'Record Keeping Compliance Audit (30 June)',
        description: 'Annual audit of client records and documentation compliance',
        reminders: [30, 14, 7, 1] // Days before
    },
    healthSafetyReview: {
        date: 1, // 1 September - Health and Safety review
        month: 8, // September (0-indexed)
        label: 'Health & Safety Policy Review (1 Sept)',
        description: 'Review and update health and safety policies and procedures',
        reminders: [30, 14, 7, 1] // Days before
    },
    trainingCompliance: {
        date: 31, // 31 December - Training compliance
        month: 11, // December (0-indexed)
        label: 'Annual Training Compliance Review (31 Dec)',
        description: 'Verify all staff training and certifications are current',
        reminders: [30, 14, 7, 1] // Days before
    }
};

// Incident reporting requirement
const INCIDENT_REPORTING_DEADLINE = 24; // Must report serious incidents within 24 hours

/**
 * Show compliance dashboard
 */
function showComplianceView() {
    hideAllViews();
    scrollToTop();
    // CRITICAL: Populate filters AND render content WHILE view is still hidden
    // This prevents browser from calculating layout with partial content
    renderComplianceDashboard();
    setTimeout(() => {
        const view = document.getElementById('complianceView');
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
        updateActiveNav('Compliance');
        // Scroll reset immediately after showing view (everything already rendered)
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, 10);
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
            <p class="mb-0">Track your statutory obligations as a registered care provider. Automated reminders will help you stay compliant with regulatory requirements.</p>
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
        annualRegistration: profile?.compliance?.[currentYear]?.annualRegistrationCompleted || false,
        insuranceRenewal: profile?.compliance?.[currentYear]?.insuranceRenewalCompleted || false,
        privacyAudit: profile?.compliance?.[currentYear]?.privacyAuditCompleted || false,
        recordKeepingAudit: profile?.compliance?.[currentYear]?.recordKeepingAuditCompleted || false,
        healthSafetyReview: profile?.compliance?.[currentYear]?.healthSafetyReviewCompleted || false,
        trainingCompliance: profile?.compliance?.[currentYear]?.trainingComplianceCompleted || false
    };
    
    const totalObligations = 6;
    const completedObligations = Object.values(status).filter(v => v).length;
    const percentage = (completedObligations / totalObligations) * 100;
    
    return `
        <div class="mb-3">
            <h5>${currentYear} Compliance Status</h5>
            <div class="progress mb-2" style="height: 25px;">
                <div class="progress-bar ${percentage === 100 ? 'bg-success' : percentage >= 75 ? 'bg-info' : percentage >= 50 ? 'bg-warning' : 'bg-danger'}" 
                     role="progressbar" 
                     style="width: ${percentage}%">
                    ${Math.round(percentage)}% Complete
                </div>
            </div>
        </div>
        
        <div class="small">
            ${renderStatusItem('Annual Registration Renewal', status.annualRegistration)}
            ${renderStatusItem('Insurance Renewal', status.insuranceRenewal)}
            ${renderStatusItem('Privacy Act Compliance', status.privacyAudit)}
            ${renderStatusItem('Record Keeping Audit', status.recordKeepingAudit)}
            ${renderStatusItem('Health & Safety Review', status.healthSafetyReview)}
            ${renderStatusItem('Training Compliance', status.trainingCompliance)}
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
    const currentYear = new Date().getFullYear();
    const profile = getUserProfile();
    const complianceStatus = profile?.compliance?.[currentYear] || {};
    
    const obligations = [
        {
            period: '31 March',
            deadline: '31 March',
            obligations: [
                { 
                    name: 'Annual Registration Renewal', 
                    description: 'Renew Health and Disability Services registration', 
                    required: true,
                    key: 'annualRegistrationCompleted'
                },
                { 
                    name: 'Registration Documentation', 
                    description: 'Submit updated registration documents and certifications', 
                    required: true,
                    key: 'registrationDocsCompleted'
                }
            ]
        },
        {
            period: '1 April',
            deadline: '1 April',
            obligations: [
                { 
                    name: 'Insurance Renewal', 
                    description: 'Renew professional indemnity and public liability insurance', 
                    required: true,
                    key: 'insuranceRenewalCompleted'
                }
            ]
        },
        {
            period: '1 June',
            deadline: '30 June',
            obligations: [
                { 
                    name: 'Privacy Act Compliance Review', 
                    description: 'Annual review of privacy policies and data protection', 
                    required: true,
                    key: 'privacyAuditCompleted'
                },
                { 
                    name: 'Record Keeping Audit', 
                    description: 'Annual audit of client records and documentation', 
                    required: true,
                    key: 'recordKeepingAuditCompleted'
                }
            ]
        },
        {
            period: '1 September',
            deadline: '1 September',
            obligations: [
                { 
                    name: 'Health & Safety Policy Review', 
                    description: 'Review and update health and safety policies', 
                    required: true,
                    key: 'healthSafetyReviewCompleted'
                }
            ]
        },
        {
            period: '31 December',
            deadline: '31 December',
            obligations: [
                { 
                    name: 'Annual Training Compliance', 
                    description: 'Verify all staff training and certifications are current', 
                    required: true,
                    key: 'trainingComplianceCompleted'
                }
            ]
        },
        {
            period: 'On Occurrence',
            deadline: '24 Hours',
            obligations: [
                { 
                    name: 'Serious Incident Reporting', 
                    description: 'Report serious incidents to appropriate authorities within 24 hours', 
                    required: true,
                    key: 'incidentReported'
                }
            ]
        }
    ];
    
    return obligations.map((period, index) => `
        <div class="card mb-3">
            <div class="card-header">
                <strong>${period.period} — Due: ${period.deadline}</strong>
            </div>
            <div class="card-body">
                ${period.obligations.map(obligation => {
                    const isCompleted = complianceStatus[obligation.key] || false;
                    const completionDate = complianceStatus[`${obligation.key}Date`];
                    const details = complianceStatus[`${obligation.key}Details`];
                    
                    return `
                        <div class="card mb-2 ${isCompleted ? 'border-success' : 'border-light'}">
                            <div class="card-body py-2">
                                <div class="form-check d-flex align-items-start">
                                    <input class="form-check-input me-3" 
                                           type="checkbox" 
                                           id="compliance_${obligation.key}" 
                                           ${isCompleted ? 'checked' : ''}
                                           onchange="toggleComplianceStatus('${obligation.key}', ${currentYear})"
                                           style="transform: scale(1.2); margin-top: 0.25rem;">
                                    <div class="flex-grow-1">
                                        <label class="form-check-label" for="compliance_${obligation.key}">
                                            <strong class="${isCompleted ? 'text-success' : ''}">${obligation.name}</strong>
                                            ${!obligation.required ? '<span class="badge bg-secondary ms-2">Conditional</span>' : ''}
                                            ${isCompleted ? '<span class="badge bg-success ms-2"><i class="bi bi-check-circle"></i> Completed</span>' : ''}
                                        </label>
                                        <br><small class="text-muted">${obligation.description}</small>
                                        ${completionDate ? `<br><small class="text-success"><i class="bi bi-calendar-check"></i> Completed: ${formatDate(new Date(completionDate))}</small>` : ''}
                                        ${details ? `
                                            <br><div class="mt-2 p-2 bg-light rounded border">
                                                <div class="d-flex justify-content-between align-items-start">
                                                    <div class="flex-grow-1">
                                                        <small class="text-dark"><strong><i class="bi bi-info-circle"></i> Details:</strong></small>
                                                        <br><small class="text-dark">${details}</small>
                                                    </div>
                                                    <button class="btn btn-sm btn-outline-secondary ms-2" 
                                                            onclick="editComplianceDetails('${obligation.key}', ${currentYear})"
                                                            title="Edit details">
                                                        <i class="bi bi-pencil"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
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
            <div class="col-md-6 mb-3">
                <label class="form-label"><strong>Health & Disability Services Registration Number</strong></label>
                <input type="text" class="form-control" id="hdsRegistration" 
                       value="${profile?.hdsRegistration || ''}" 
                       placeholder="Enter your HDS registration number">
                <small class="form-text text-muted">Required for providing health care services</small>
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label"><strong>Service Provider Type</strong></label>
                <select class="form-select" id="serviceProviderType">
                    <option value="">Select type...</option>
                    <option value="rest-home" ${profile?.serviceProviderType === 'rest-home' ? 'selected' : ''}>Rest Home</option>
                    <option value="hospital" ${profile?.serviceProviderType === 'hospital' ? 'selected' : ''}>Hospital</option>
                    <option value="home-care" ${profile?.serviceProviderType === 'home-care' ? 'selected' : ''}>Home Care Provider</option>
                    <option value="disability" ${profile?.serviceProviderType === 'disability' ? 'selected' : ''}>Disability Support</option>
                    <option value="other" ${profile?.serviceProviderType === 'other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6 mb-3">
                <label class="form-label"><strong>Professional Indemnity Insurance Provider</strong></label>
                <input type="text" class="form-control" id="insuranceProvider" 
                       value="${profile?.insuranceProvider || ''}" 
                       placeholder="Insurance company name">
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label"><strong>Insurance Policy Number</strong></label>
                <input type="text" class="form-control" id="insurancePolicyNumber" 
                       value="${profile?.insurancePolicyNumber || ''}" 
                       placeholder="Policy number">
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6 mb-3">
                <label class="form-label"><strong>Insurance Expiry Date</strong></label>
                <input type="date" class="form-control" id="insuranceExpiry" 
                       value="${profile?.insuranceExpiry || ''}">
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label"><strong>Privacy Officer Name</strong></label>
                <input type="text" class="form-control" id="privacyOfficer" 
                       value="${profile?.privacyOfficer || ''}" 
                       placeholder="Name of designated privacy officer">
                <small class="form-text text-muted">Required under Privacy Act 2020</small>
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
 * Toggle compliance status for a specific obligation
 */
function toggleComplianceStatus(obligationKey, year) {
    const checkbox = document.getElementById(`compliance_${obligationKey}`);
    const isCompleted = checkbox.checked;
    
    // If marking as completed, show the details modal
    if (isCompleted) {
        showComplianceDetailsModal(obligationKey, year, checkbox);
    } else {
        // If unchecking, just save immediately
        saveComplianceStatus(obligationKey, year, false, checkbox);
    }
}

/**
 * Show compliance details modal
 */
function showComplianceDetailsModal(obligationKey, year, checkbox) {
    // Set modal title and button text for new entry
    document.querySelector('#complianceDetailsModal .modal-title').textContent = 'Mark Obligation as Achieved';
    const submitButton = document.querySelector('#complianceDetailsModal .btn-success');
    submitButton.innerHTML = '<i class="bi bi-check-circle"></i> Mark as Achieved';
    
    // Set hidden fields
    document.getElementById('complianceObligationKey').value = obligationKey;
    document.getElementById('complianceYear').value = year;
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('complianceDate').value = today;
    
    // Clear details field
    document.getElementById('complianceDetails').value = '';
    
    // Store checkbox reference for cancel handler
    window.pendingComplianceCheckbox = checkbox;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('complianceDetailsModal'));
    modal.show();
    
    // Handle modal close (user clicks X or outside)
    const modalElement = document.getElementById('complianceDetailsModal');
    modalElement.addEventListener('hidden.bs.modal', function onModalHidden() {
        // Revert checkbox if modal was closed without submitting
        if (checkbox && checkbox.checked) {
            checkbox.checked = false;
        }
        modalElement.removeEventListener('hidden.bs.modal', onModalHidden);
        window.pendingComplianceCheckbox = null;
    }, { once: true });
}

/**
 * Edit existing compliance details
 */
function editComplianceDetails(obligationKey, year) {
    const profile = getUserProfile();
    const complianceStatus = profile?.compliance?.[year] || {};
    
    // Set modal title and button text for edit mode
    document.querySelector('#complianceDetailsModal .modal-title').textContent = 'Edit Compliance Details';
    const submitButton = document.querySelector('#complianceDetailsModal .btn-success');
    submitButton.innerHTML = '<i class="bi bi-check-circle"></i> Update Details';
    
    // Set hidden fields
    document.getElementById('complianceObligationKey').value = obligationKey;
    document.getElementById('complianceYear').value = year;
    
    // Set existing date
    const existingDate = complianceStatus[`${obligationKey}Date`];
    document.getElementById('complianceDate').value = existingDate || new Date().toISOString().split('T')[0];
    
    // Set existing details
    const existingDetails = complianceStatus[`${obligationKey}Details`] || '';
    document.getElementById('complianceDetails').value = existingDetails;
    
    // No checkbox for edit mode
    window.pendingComplianceCheckbox = null;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('complianceDetailsModal'));
    modal.show();
}

/**
 * Handle compliance details submission
 */
function handleComplianceDetails() {
    const obligationKey = document.getElementById('complianceObligationKey').value;
    const year = parseInt(document.getElementById('complianceYear').value);
    const details = document.getElementById('complianceDetails').value.trim();
    const date = document.getElementById('complianceDate').value;
    
    const checkbox = window.pendingComplianceCheckbox;
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('complianceDetailsModal'));
    modal.hide();
    
    // Save with details
    saveComplianceStatus(obligationKey, year, true, checkbox, details, date);
}

/**
 * Save compliance status
 */
function saveComplianceStatus(obligationKey, year, isCompleted, checkbox, details = null, date = null) {
    const profile = getUserProfile();
    
    if (!profile.compliance) {
        profile.compliance = {};
    }
    if (!profile.compliance[year]) {
        profile.compliance[year] = {};
    }
    
    profile.compliance[year][obligationKey] = isCompleted;
    
    if (isCompleted) {
        // Use provided date or current date
        const completionDate = date || new Date().toISOString().split('T')[0];
        profile.compliance[year][`${obligationKey}Date`] = completionDate;
        
        // Store details if provided
        if (details) {
            profile.compliance[year][`${obligationKey}Details`] = details;
        }
    } else {
        // Remove all related data
        delete profile.compliance[year][`${obligationKey}Date`];
        delete profile.compliance[year][`${obligationKey}Details`];
    }
    
    showSyncStatus('<i class="bi bi-arrow-repeat"></i> Saving...', 'syncing');
    
    const tenantPath = currentTenantId ? `tenants/${currentTenantId}/users/${currentUser.uid}` : `users/${currentUser.uid}`;
    
    database.ref(tenantPath).update({ complianceProfile: profile })
        .then(() => {
            const statusText = isCompleted ? 'marked as completed' : 'marked as pending';
            showSyncStatus(`<i class="bi bi-check"></i> ${obligationKey} ${statusText}!`, 'success');
            currentUser.complianceProfile = profile;
            
            // Update the compliance dashboard
            renderComplianceDashboard();
        })
        .catch(error => {
            showSyncStatus('<i class="bi bi-x"></i> Save failed', 'error');
            console.error('Error updating compliance status:', error);
            
            // Revert checkbox state
            if (checkbox) {
                checkbox.checked = !isCompleted;
            }
        });
}

/**
 * Mark obligation as completed (legacy function for backward compatibility)
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
            careMarshallAlert(`✅ ${obligationType} marked as completed`, 'success');
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
    Logger.log('≡ƒôï Compliance module initialized');
    
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
                    careMarshallAlert(
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
