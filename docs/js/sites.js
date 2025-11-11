// CareMarshall - Site Management Module (v0.8)

// Global variable to track whether to show archived sites
let showArchivedSites = false;

// Cache for rendered sites data to avoid recomputation
let sitesRenderCache = {
    data: null,
    archiveFilter: null,
    timestamp: 0
};
const SITE_CACHE_TTL = 100; // Cache for 100ms to handle rapid calls

// Function to invalidate the render cache (call when sites data changes)
function invalidateSitesRenderCache() {
    sitesRenderCache.data = null;
    sitesRenderCache.timestamp = 0;
}

// Site types and their associated colors
const SITE_TYPES = {
    'home_care': { name: 'Home Care', color: '#0d6efd', icon: 'bi-house-heart-fill' },
    'residential_care': { name: 'Residential Care', color: '#28a745', icon: 'bi-building' },
    'assisted_living': { name: 'Assisted Living', color: '#20c997', icon: 'bi-house-check-fill' },
    'rest_home': { name: 'Rest Home', color: '#17a2b8', icon: 'bi-house-door-fill' },
    'hospital_care': { name: 'Hospital Care', color: '#dc3545', icon: 'bi-hospital-fill' },
    'dementia_care': { name: 'Dementia Care', color: '#6f42c1', icon: 'bi-heart-pulse-fill' },
    'rehabilitation': { name: 'Rehabilitation', color: '#fd7e14', icon: 'bi-activity' },
    'respite_care': { name: 'Respite Care', color: '#e83e8c', icon: 'bi-moon-stars-fill' },
    'day_care': { name: 'Day Care', color: '#ffc107', icon: 'bi-sun-fill' },
    'hospice': { name: 'Hospice', color: '#6c757d', icon: 'bi-heart-pulse' },
    'independent_living': { name: 'Independent Living', color: '#198754', icon: 'bi-person-check-fill' },
    'supported_living': { name: 'Supported Living', color: '#0dcaf0', icon: 'bi-people-fill' },
    'disability_support': { name: 'Disability Support', color: '#d63384', icon: 'bi-universal-access-circle' },
    'mental_health': { name: 'Mental Health', color: '#6610f2', icon: 'bi-emoji-smile-fill' },
    'other': { name: 'Other/Custom', color: '#adb5bd', icon: 'bi-gear-fill' }
};

const CARE_SERVICE_DEFINITIONS = [
    { key: 'personalCare', elementId: 'servicePersonalCare', label: 'Personal Care', icon: 'bi-person-hearts', color: '#1976D2' },
    { key: 'medicationManagement', elementId: 'serviceMedicationManagement', label: 'Medication Management', icon: 'bi-capsule', color: '#D63384' },
    { key: 'mealPreparation', elementId: 'serviceMealPreparation', label: 'Meal Preparation', icon: 'bi-egg-fried', color: '#FF8A65' },
    { key: 'mobilityAssistance', elementId: 'serviceMobilityAssistance', label: 'Mobility Assistance', icon: 'bi-person-wheelchair', color: '#26A69A' },
    { key: 'companionship', elementId: 'serviceCompanionship', label: 'Companionship', icon: 'bi-people-heart', color: '#6F42C1' },
    { key: 'housekeeping', elementId: 'serviceHousekeeping', label: 'Housekeeping', icon: 'bi-broom', color: '#8D6E63' },
    { key: 'transportation', elementId: 'serviceTransportation', label: 'Transportation', icon: 'bi-bus-front', color: '#0DCAF0' },
    { key: 'respiteCare', elementId: 'serviceRespite', label: 'Respite Care', icon: 'bi-heart-pulse', color: '#FF6F91' }
];

// Internal render function (actual rendering logic)
function _renderSitesInternal() {
    // Ensure window.sites is available and is an array
    if (!window.sites || !Array.isArray(window.sites)) {
        if (typeof Logger !== 'undefined') {
            Logger.warn('⚠️ window.sites is not available or not an array:', window.sites);
        }
        const sitesList = document.getElementById('sitesList');
        if (sitesList) {
            sitesList.innerHTML = '<div class="col-12"><p class="text-center text-muted my-5">Loading sites...</p></div>';
        }
        return;
    }
    
    // Check cache first
    const now = Date.now();
    const cacheValid = sitesRenderCache.data && 
                       sitesRenderCache.archiveFilter === showArchivedSites &&
                       (now - sitesRenderCache.timestamp) < SITE_CACHE_TTL;
    
    let sortedSites, sitesByLetter;
    
    if (cacheValid) {
        // Use cached data
        sortedSites = sitesRenderCache.data.sortedSites;
        sitesByLetter = sitesRenderCache.data.sitesByLetter;
    } else {
        // Filter sites based on archive status
        const visibleSites = window.sites.filter(c => {
            if (showArchivedSites) {
                return c.archived === true;
            } else {
                return !c.archived; // Show non-archived by default
            }
        });
        
        // Sort sites alphabetically by name (create new array to avoid mutating original)
        sortedSites = [...visibleSites].sort((a, b) => {
            const nameA = (a.name || '').toLowerCase();
            const nameB = (b.name || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });
        
        // Group sites by first letter for alphabetical markers
        sitesByLetter = {};
        sortedSites.forEach(site => {
            const firstLetter = (site.name || '').charAt(0).toUpperCase();
            const letter = /[A-Z]/.test(firstLetter) ? firstLetter : '#';
            if (!sitesByLetter[letter]) {
                sitesByLetter[letter] = [];
            }
            sitesByLetter[letter].push(site);
        });
        
        // Update cache
        sitesRenderCache.data = { sortedSites, sitesByLetter };
        sitesRenderCache.archiveFilter = showArchivedSites;
        sitesRenderCache.timestamp = now;
    }
    
    // Generate HTML with alphabetical sections using array for better performance
    const htmlParts = [];
    if (sortedSites.length > 0) {
        // Sort letters alphabetically (# for non-alphabetic goes last)
        const sortedLetters = Object.keys(sitesByLetter).sort((a, b) => {
            if (a === '#') return 1;
            if (b === '#') return -1;
            return a.localeCompare(b);
        });
        
        // Add alphabetical navigation bar at the top
        const navLinks = sortedLetters.map(letter => 
            `<a href="#section-${letter}" 
               class="btn btn-sm btn-outline-primary alphabet-nav-link" 
               onclick="event.preventDefault(); scrollToLetterSection('${letter}'); return false;"
               style="min-width: 40px; padding: 0.25rem 0.5rem; font-weight: 600;">
                ${letter}
            </a>`
        ).join('');
        
        htmlParts.push(`
            <div class="col-12 mb-4">
                <div class="card shadow-sm" style="background: #f8f9fa; border: 1px solid #dee2e6;">
                    <div class="card-body p-3">
                        <div class="d-flex flex-wrap align-items-center justify-content-center gap-2" id="alphabetNavBar">
                            <span class="text-muted me-2" style="font-weight: 600;">Jump to:</span>
                            ${navLinks}
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        sortedLetters.forEach(letter => {
            // Add alphabetical section marker with anchor
            htmlParts.push(`
                <div class="col-12 mb-3 mt-4" id="section-${letter}">
                    <a name="section-${letter}" id="anchor-section-${letter}"></a>
                    <div class="alphabet-marker" style="background-color: #f8f9fa; padding: 10px 15px; border-left: 4px solid #007bff; border-radius: 4px;">
                        <h4 class="mb-0" style="color: #007bff; font-weight: bold;">
                            <i class="bi bi-bookmark-fill"></i> ${letter}
                        </h4>
                    </div>
                </div>
            `);
            
            // Add sites for this letter (build cards in array, then join)
            const siteCards = sitesByLetter[letter].map(c => {
                // Get last visit date from site object (not from actions)
                let lastVisitDate = null;
                if (c.lastVisitDate) {
                    lastVisitDate = new Date(c.lastVisitDate);
                }
                
                // Format last visit date
                let lastVisitDisplay = '';
                if (lastVisitDate && !isNaN(lastVisitDate.getTime())) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const visitDate = new Date(lastVisitDate);
                    visitDate.setHours(0, 0, 0, 0);
                    const daysDiff = Math.floor((today - visitDate) / (1000 * 60 * 60 * 24));
                    
                    const formattedDate = visitDate.toLocaleDateString('en-NZ', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                    });
                    
                    if (daysDiff === 0) {
                        lastVisitDisplay = `<span class="badge bg-success text-white ms-2 clickable-visit-badge" onclick="event.stopPropagation(); updateSiteVisitDate(${c.id})" style="cursor: pointer;" title="Click to update visit date (Last visit: ${formattedDate})"><i class="bi bi-calendar-check"></i> Today</span>`;
                    } else if (daysDiff === 1) {
                        lastVisitDisplay = `<span class="badge bg-info text-white ms-2 clickable-visit-badge" onclick="event.stopPropagation(); updateSiteVisitDate(${c.id})" style="cursor: pointer;" title="Click to update visit date (Last visit: ${formattedDate})"><i class="bi bi-calendar-check"></i> Yesterday</span>`;
                    } else if (daysDiff <= 7) {
                        lastVisitDisplay = `<span class="badge bg-warning text-dark ms-2 clickable-visit-badge" onclick="event.stopPropagation(); updateSiteVisitDate(${c.id})" style="cursor: pointer;" title="Click to update visit date (Last visit: ${formattedDate})"><i class="bi bi-calendar-check"></i> ${daysDiff} days ago</span>`;
                    } else {
                        lastVisitDisplay = `<span class="badge bg-secondary text-white ms-2 clickable-visit-badge" onclick="event.stopPropagation(); updateSiteVisitDate(${c.id})" style="cursor: pointer;" title="Click to update visit date (Last visit: ${formattedDate})"><i class="bi bi-calendar-check"></i> ${formattedDate}</span>`;
                    }
                } else {
                    lastVisitDisplay = `<span class="badge bg-light text-dark ms-2 clickable-visit-badge" onclick="event.stopPropagation(); updateSiteVisitDate(${c.id})" style="cursor: pointer;" title="Click to record visit date"><i class="bi bi-calendar-x"></i> No visits</span>`;
                }
                
                // Archive button for admins only (shown on active sites)
                const archiveBtn = (isAdmin && !c.archived) ? `
                    <button class="btn btn-sm btn-outline-warning" onclick="event.stopPropagation(); archiveSite(${c.id})">
                        <i class="bi bi-archive"></i> Archive
                    </button>
                ` : '';
                
                // Delete button only for admins on archived sites
                const deleteBtn = (isAdmin && c.archived) ? `
                    <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation(); deleteSite(${c.id})">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                ` : '';
                
                // Unarchive button for admins on archived sites
                const unarchiveBtn = (isAdmin && c.archived) ? `
                    <button class="btn btn-sm btn-outline-success" onclick="event.stopPropagation(); unarchiveSite(${c.id})">
                        <i class="bi bi-arrow-counterclockwise"></i> Unarchive
                    </button>
                ` : '';
                
                const functionalClassification = c.functionalClassification || 'home_care';
                const typeInfo = SITE_TYPES[functionalClassification] || SITE_TYPES['other'];
                
                // Add archived indicator
                const archivedBadge = c.archived ? `<span class="badge bg-secondary ms-2">Archived</span>` : '';
                
                // Get compact landowner/contact info for one-line display (avoid bloat)
                const landownerName = c.landownerName || '';
                const landownerPhone = c.landownerPhone || '';
                const landownerEmail = c.landownerEmail || '';
                const contactNotes = c.contactNotes || c.landownerAddress || '';
                const contactLine = [landownerName, landownerPhone].filter(Boolean).join(' • ');
                const notesLine = contactNotes;
                const landownerDisplay = [contactLine, notesLine].filter(Boolean).join(', ');
                const landownerTitle = [contactLine, notesLine].filter(Boolean).join(' — ');
                const physicalAddress = c.physicalAddress || c.address || '';
                const expectedHoursRaw = c.expectedServiceHours ?? c.expectedHours ?? null;
                const expectedHours = (expectedHoursRaw !== null && expectedHoursRaw !== undefined && !Number.isNaN(Number(expectedHoursRaw)))
                    ? Number(expectedHoursRaw)
                    : null;
                
                // Get clients at this site
                const siteClients = (window.clients || window.individualHives || []).filter(client => client.siteId === c.id);
                const clientCount = siteClients.length;
                
                // Get pending tasks for this site
                const siteTasks = (window.scheduledTasks || []).filter(task => 
                    task.siteId === c.id && !task.completed
                ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
                const overdueTasks = siteTasks.filter(task => new Date(task.dueDate) < new Date());
                const urgentTasks = siteTasks.filter(task => task.priority === 'urgent');
                
                // Get special needs flags
                const specialNeeds = c.specialNeeds || {};
                const activeFlags = [];
                if (specialNeeds.wheelchairAccessible) activeFlags.push({ icon: 'bi-wheelchair', label: 'Wheelchair Access', color: 'primary', bg: 'bg-primary' });
                if (specialNeeds.medicalEquipmentOnSite) activeFlags.push({ icon: 'bi-heart-pulse', label: 'Medical Equipment', color: 'danger', bg: 'bg-danger' });
                if (specialNeeds.specialInstructionsRequired) activeFlags.push({ icon: 'bi-exclamation-triangle', label: 'Special Instructions', color: 'warning', bg: 'bg-warning text-dark' });
                if (specialNeeds.petPresent) activeFlags.push({ icon: 'bi-heart', label: 'Pet Present', color: 'info', bg: 'bg-info' });
                if (specialNeeds.familyMemberPresent) activeFlags.push({ icon: 'bi-people', label: 'Family Present', color: 'success', bg: 'bg-success' });
                if (specialNeeds.restrictedAccess) activeFlags.push({ icon: 'bi-shield-lock', label: 'Restricted Access', color: 'secondary', bg: 'bg-secondary' });
                if (specialNeeds.emergencyContactRequired) activeFlags.push({ icon: 'bi-telephone', label: 'Emergency Contact', color: 'danger', bg: 'bg-danger' });
                if (specialNeeds.medicationStorageAvailable) activeFlags.push({ icon: 'bi-capsule', label: 'Med Storage', color: 'primary', bg: 'bg-primary' });
                if (specialNeeds.oxygenEquipment) activeFlags.push({ icon: 'bi-airplane', label: 'Oxygen Equipment', color: 'info', bg: 'bg-info' });
                if (specialNeeds.dementiaCare) activeFlags.push({ icon: 'bi-brain', label: 'Dementia Care', color: 'purple', bg: 'bg-purple', style: 'background-color: #6f42c1;' });
                if (specialNeeds.fallRisk) activeFlags.push({ icon: 'bi-exclamation-circle', label: 'Fall Risk', color: 'warning', bg: 'bg-warning text-dark' });
                if (specialNeeds.woundCareRequired) activeFlags.push({ icon: 'bi-bandaid', label: 'Wound Care', color: 'danger', bg: 'bg-danger' });
                
                // Check if contact before visit is required (handle both boolean and string values)
                const needsContact = c.contactBeforeVisit === true || c.contactBeforeVisit === 'true' || c.contactBeforeVisit === 1 || c.contactBeforeVisit === '1';
                
                const careServicesData = c.careServices || {};
                const selectedCareServices = CARE_SERVICE_DEFINITIONS.filter(service => careServicesData[service.key]);
                const serviceCount = selectedCareServices.length;
                
                // Determine classification labels (compact for summary card)
                const seasonalDisplay = (() => {
                    const seasonalValue = c.seasonalClassification || c.seasonal_classification || '';
                    if (!seasonalValue) return '';
                    const seasonalMap = {
                        'summer': 'Temporary / Seasonal',
                        'winter': 'Short-term Care',
                        'all-year': 'Long-term Care',
                        'summer-only': 'Seasonal (Legacy)',
                        'winter-only': 'Short-term (Legacy)',
                        'All Year Round': 'Long-term Care',
                        'Summer Site': 'Temporary / Seasonal',
                        'Winter Site': 'Short-term Care'
                    };
                    return seasonalMap[seasonalValue] || seasonalValue;
                })();
                
                // Seasonal badge styling
                const seasonalBadge = (() => {
                    if (!seasonalDisplay) return '';
                    const seasonalColorMap = {
                        'Temporary / Seasonal': '#ffc107',
                        'Short-term Care': '#0dcaf0',
                        'Long-term Care': '#20c997',
                        'Seasonal (Legacy)': '#ffcd39',
                        'Short-term (Legacy)': '#39c0ed'
                    };
                    const bg = seasonalColorMap[seasonalDisplay] || '#6c757d';
                    return `<span class="badge ms-2" style="background-color: ${bg}; color: #111;">${seasonalDisplay}</span>`;
                })();
                
                return `
                    <div class="col-md-6 col-lg-4 mb-3">
                        <div class="card site-card h-100" data-site-id="${c.id}" data-site-type="${functionalClassification}" ${c.archived ? 'style="opacity: 0.7;"' : ''}>
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                    <h5 class="card-title">
                                        <i class="bi ${typeInfo.icon}" style="color: ${typeInfo.color}"></i> 
                                        <strong>${c.name}</strong>
                                        ${archivedBadge}
                                    </h5>
                                    <div>
                                        <span class="badge" style="background-color: ${typeInfo.color}; color: white;">
                                            ${typeInfo.name}
                                        </span>
                                        ${seasonalBadge}
                                        ${needsContact ? `<span class="badge bg-warning text-dark ms-2 contact-required-badge" style="font-weight: bold;" title="Contact required before visit"><i class="bi bi-telephone-fill"></i> Contact Required</span>` : ''}
                                        ${c.isQuarantine ? `<span class="badge bg-danger ms-2" style="font-weight: bold;" title="Isolation/Quarantine required"><i class="bi bi-shield-exclamation"></i> Isolation</span>` : ''}
                                        <button class="btn btn-sm btn-outline-info ms-2" onclick="event.stopPropagation(); showSiteCarePlan(${c.id});" title="View care plan details">
                                            <i class="bi bi-info-circle"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Last Visit Date -->
                                <div class="mb-2">
                                    ${lastVisitDisplay}
                                </div>
                                
                                <!-- Physical Address -->
                                ${physicalAddress ? `
                                <div class="mb-2">
                                    <strong><i class="bi bi-geo-alt-fill text-primary me-1"></i> Address:</strong>
                                    <div class="small">${physicalAddress}</div>
                                </div>
                                ` : ''}
                                
                                ${expectedHours !== null ? `
                                <div class="mb-2">
                                    <strong><i class="bi bi-hourglass-split text-primary me-1"></i> Expected Hours per Visit:</strong>
                                    <span>${expectedHours % 1 === 0 ? expectedHours : expectedHours.toFixed(1)} ${expectedHours === 1 ? 'hour' : 'hours'}</span>
                                </div>
                                ` : ''}
                                
                                <!-- Contact Information (Enhanced for employees) -->
                                <div class="mb-2">
                                    <div class="d-flex align-items-center justify-content-between mb-1">
                                        <strong><i class="bi bi-person-fill text-primary me-1"></i> Contact:</strong>
                                        ${landownerName ? `<button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); showContactDetails(${c.id})" title="View full contact details">
                                            <i class="bi bi-telephone"></i> Details
                                        </button>` : ''}
                                    </div>
                                    ${landownerName ? `<div class="small">
                                        <i class="bi bi-person"></i> ${landownerName}
                                        ${landownerPhone ? ` • <a href="tel:${landownerPhone}" onclick="event.stopPropagation();" class="text-decoration-none"><i class="bi bi-telephone"></i> ${landownerPhone}</a>` : ''}
                                        ${landownerEmail ? ` • <a href="mailto:${landownerEmail}" onclick="event.stopPropagation();" class="text-decoration-none"><i class="bi bi-envelope"></i> Email</a>` : ''}
                                    </div>` : '<span class="text-muted small">No contact information</span>'}
                                    ${contactNotes ? `<div class="small text-muted mt-1">
                                        <i class="bi bi-journal-text"></i> ${contactNotes}
                                    </div>` : ''}
                                </div>
                                
                                <!-- Client Summary (if clients exist) -->
                                ${clientCount > 0 ? `
                                <div class="mb-2">
                                    <div class="d-flex align-items-center justify-content-between mb-1">
                                        <strong><i class="bi bi-house-heart text-primary me-1"></i> Clients (${clientCount}):</strong>
                                        <button class="btn btn-sm btn-outline-info" onclick="event.stopPropagation(); showSiteClients(${c.id})" title="View client details">
                                            <i class="bi bi-list-ul"></i> View All
                                        </button>
                                    </div>
                                </div>
                                ` : ''}
                                
                                <!-- Tasks Summary (if tasks exist) -->
                                ${siteTasks.length > 0 ? `
                                <div class="mb-2">
                                    <div class="d-flex align-items-center justify-content-between mb-1">
                                        <strong><i class="bi bi-list-check text-primary me-1"></i> Tasks (${siteTasks.length}):</strong>
                                        <button class="btn btn-sm btn-outline-success" onclick="event.stopPropagation(); showSiteTasks(${c.id})" title="View all tasks">
                                            <i class="bi bi-calendar-check"></i> View Tasks
                                        </button>
                                    </div>
                                    <div class="small">
                                        ${overdueTasks.length > 0 ? `<span class="badge bg-danger me-1">${overdueTasks.length} Overdue</span>` : ''}
                                        ${urgentTasks.length > 0 ? `<span class="badge bg-warning text-dark me-1">${urgentTasks.length} Urgent</span>` : ''}
                                        ${siteTasks.length - overdueTasks.length - urgentTasks.length > 0 ? `<span class="badge bg-secondary">${siteTasks.length - overdueTasks.length - urgentTasks.length} Pending</span>` : ''}
                                    </div>
                                    ${siteTasks.length > 0 ? `<div class="small text-muted mt-1">
                                        Next: ${new Date(siteTasks[0].dueDate).toLocaleDateString()}
                                    </div>` : ''}
                                </div>
                                ` : ''}
                                
                                <!-- Special Needs Flags -->
                                ${activeFlags.length > 0 ? `
                                <div class="mb-2">
                                    <strong><i class="bi bi-flag-fill text-primary me-1"></i> Special Needs:</strong>
                                    <div class="d-flex flex-wrap gap-1 mt-1">
                                        ${activeFlags.map(flag => `
                                            <span class="badge ${flag.bg} ${flag.style ? `style="${flag.style}"` : ''}" title="${flag.label}">
                                                <i class="bi ${flag.icon}"></i> ${flag.label}
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                                ` : ''}
                                
                                <!-- Description (truncated if too long) -->
                                ${c.description ? `<div class="mb-2" title="${c.description}">
                                    <i class="bi bi-card-text text-muted me-1"></i>
                                    <strong>Description:</strong> <span class="d-inline-block text-truncate" style="max-width: 100%;">${c.description.length > 100 ? c.description.substring(0, 100) + '...' : c.description}</span>
                                </div>` : ''}
                                
                                <!-- Care Plan Snapshot -->
                                <div class="mb-2">
                                    <strong><i class="bi bi-clipboard-check"></i> Care Plan Snapshot:</strong>
                                    ${siteTasks.length > 0 ? `
                                        <ul class="list-unstyled small mt-2 mb-0">
                                            ${siteTasks.slice(0, 4).map(task => {
                                                const taskName = typeof getTaskDisplayName === 'function'
                                                    ? getTaskDisplayName(null, task.taskId)
                                                    : (task.taskName || 'Scheduled task');
                                                const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '';
                                                return `<li class="d-flex align-items-start">
                                                    <i class="bi bi-dot text-primary me-1"></i>
                                                    <span>
                                                        <span class="fw-semibold">${taskName}</span>
                                                        ${dueDate ? `<small class="text-muted ms-1">(${dueDate})</small>` : ''}
                                                    </span>
                                                </li>`;
                                            }).join('')}
                                        </ul>
                                        ${siteTasks.length > 4 ? `<div class="text-muted small mt-1">+${siteTasks.length - 4} additional scheduled tasks</div>` : ''}
                                    ` : `<div class="text-muted small mt-1">No scheduled tasks yet. Use the schedule to add recurring visits.</div>`}
                                </div>
                                
                                <!-- Care Services Snapshot -->
                                <div class="mb-3">
                                    <strong><i class="bi bi-clipboard2-heart"></i> Care Services:</strong>
                                    ${serviceCount > 0 ? `
                                        <div class="d-flex flex-wrap gap-1 gap-md-2 mt-2">
                                            ${selectedCareServices.map(service => `
                                                <span class="badge" style="background: ${service.color}; color: #fff; font-size: 0.75rem; font-weight: 600;">
                                                    <i class="bi ${service.icon}"></i> ${service.label}
                                                </span>
                                            `).join('')}
                                        </div>
                                    ` : `<div class="text-muted small mt-1">No primary care services documented yet.</div>`}
                                </div>
                                
                                <!-- Notes display and quick edit -->
                                <div class="mb-2">
                                    ${c.notes ? `
                                        <div class="d-flex align-items-center justify-content-between">
                                            <div class="flex-grow-1">
                                                <i class="bi bi-sticky-fill text-info me-1"></i>
                                                <strong>Note:</strong> 
                                                <span class="text-truncate d-inline-block" style="max-width: 70%;" title="${c.notes}">${c.notes.length > 50 ? c.notes.substring(0, 50) + '...' : c.notes}</span>
                                            </div>
                                            <button class="btn btn-sm btn-outline-secondary" onclick="quickEditSiteNote(${c.id})" title="Edit note">
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                        </div>
                                    ` : `
                                        <div class="d-flex align-items-center justify-content-between">
                                            <span class="text-muted"><i class="bi bi-sticky text-muted me-1"></i> No notes</span>
                                            <button class="btn btn-sm btn-outline-secondary" onclick="quickEditSiteNote(${c.id})" title="Add note">
                                                <i class="bi bi-plus"></i> Add Note
                                            </button>
                                        </div>
                                    `}
                                </div>
                            </div>
                            <div class="card-footer bg-light">
                                ${isAdmin ? `<button class="btn btn-primary" onclick="editSite(${c.id})"><i class="bi bi-pencil"></i> Update</button>` : ''}
                                <button class="btn btn-sm btn-outline-info" onclick="viewSiteDetails(${c.id})">
                                    <i class="bi bi-eye"></i> View
                                </button>
                                ${archiveBtn}
                                ${unarchiveBtn}
                                ${deleteBtn}
                            </div>
                        </div>
                    </div>
                `;
            });
            
            htmlParts.push(siteCards.join(''));
        });
    } else {
        htmlParts.push(`<div class="col-12"><p class="text-center text-muted my-5">${showArchivedSites ? 'No archived sites.' : 'No sites found.'}</p></div>`);
    }
    
    // Use requestAnimationFrame for DOM update to batch with browser paint
    requestAnimationFrame(() => {
        const sitesList = document.getElementById('sitesList');
        if (sitesList) {
            sitesList.innerHTML = htmlParts.join('');
        }
        // Update the show archived button text
        updateArchivedButtonText();
    });
}

// Debounced render function for external calls
let renderSitesDebounced = null;
function renderSites() {
    if (!renderSitesDebounced && typeof debounce === 'function') {
        renderSitesDebounced = debounce(_renderSitesInternal, 100);
    }
    if (renderSitesDebounced) {
        renderSitesDebounced();
    } else {
        _renderSitesInternal();
    }
    
    // Setup return-to-top button visibility after rendering
    setupReturnToTopButton();
}

// Make renderSites globally available
window.renderSites = renderSites;

// Store scroll handler to avoid duplicate listeners
let returnToTopScrollHandler = null;

/**
 * Setup return-to-top button visibility based on scroll position
 * Button is positioned next to sync overlay in bottom right
 */
function setupReturnToTopButton() {
    const returnToTopBtn = document.getElementById('returnToTopBtn');
    if (!returnToTopBtn) {
        if (typeof Logger !== 'undefined') {
            Logger.warn('⚠️ returnToTopBtn element not found');
        }
        return;
    }
    
    // Remove existing listener if any
    if (returnToTopScrollHandler) {
        window.removeEventListener('scroll', returnToTopScrollHandler);
    }
    
    // Function to update button position - always on left side
    const updateButtonPosition = () => {
        // Position button on the left side (opposite of sync overlay)
        returnToTopBtn.style.left = '20px';
        returnToTopBtn.style.right = 'auto';
        returnToTopBtn.style.bottom = '20px';
    };
    
    // Show/hide button based on scroll position (works for all views)
    const handleScroll = () => {
        // Check if mainApp is visible (user is logged in)
        const mainApp = document.getElementById('mainApp');
        if (!mainApp || mainApp.classList.contains('hidden')) {
            returnToTopBtn.style.display = 'none';
            returnToTopBtn.style.visibility = 'hidden';
            return;
        }
        
        // Check scroll position from window or document
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        
        if (scrollTop > 300) {
            // Show button
            returnToTopBtn.style.display = 'flex';
            returnToTopBtn.style.visibility = 'visible';
            returnToTopBtn.style.opacity = '0.9';
            returnToTopBtn.style.position = 'fixed';
            returnToTopBtn.style.zIndex = '1050';
            updateButtonPosition();
            // Force a reflow to ensure visibility
            void returnToTopBtn.offsetHeight;
        } else {
            // Hide button
            returnToTopBtn.style.display = 'none';
            returnToTopBtn.style.visibility = 'hidden';
        }
    };
    
    // Store handler for cleanup
    let scrollTimeout;
    returnToTopScrollHandler = () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(() => {
            handleScroll();
        }, 100);
    };
    
    // Watch for window resize to update position if needed
    window.addEventListener('resize', () => {
        requestAnimationFrame(() => {
            updateButtonPosition();
        });
    }, { passive: true });
    
    // Check on initial load
    handleScroll();
    updateButtonPosition();
    
    // Force initial check after a short delay to ensure DOM is ready
    setTimeout(() => {
        handleScroll();
        updateButtonPosition();
    }, 200);
    
    // Add throttled scroll listener for performance
    window.addEventListener('scroll', returnToTopScrollHandler, { passive: true });
}

/**
 * Scroll to top (works for all views)
 */
function scrollToTopSites() {
    // Scroll window to top - works for all views
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Also ensure document elements are scrolled
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
}

/**
 * Scroll to a specific letter section in the sites list
 * @param {string} letter - The letter to scroll to (e.g., 'A', 'B', '#')
 */
function scrollToLetterSection(letter) {
    if (typeof Logger !== 'undefined') {
        Logger.log(`📍 Scrolling to letter section: ${letter}`);
    }
    
    // Try to find the section marker with retries
    let attempts = 0;
    const maxAttempts = 10;
    
    const tryScroll = () => {
        attempts++;
        const sectionMarker = document.getElementById(`section-${letter}`);
        
        if (sectionMarker) {
            // Use requestAnimationFrame for smooth scrolling
            requestAnimationFrame(() => {
                setTimeout(() => {
                    sectionMarker.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    console.log(`✅ Scrolled to section ${letter}`);
                }, 100);
            });
        } else if (attempts < maxAttempts) {
            // Section marker not found yet, retry
            setTimeout(tryScroll, 100);
        } else {
            console.warn(`⚠️ Section marker for letter ${letter} not found after ${maxAttempts} attempts`);
        }
    };
    
    tryScroll();
}

function renderSiteTypeFilter() {
    const filterContainer = document.getElementById('functionalClassificationFilter');
    if (!filterContainer) return;
    
    // Generate filter options dynamically from SITE_TYPES
    let filterOptionsHtml = `
        <input type="radio" class="btn-check" name="siteTypeFilter" id="filterAll" value="all" checked>
        <label class="btn btn-outline-secondary btn-sm" for="filterAll">All Types</label>
    `;
    
    // Add each care facility type from SITE_TYPES
    Object.entries(SITE_TYPES).forEach(([key, type]) => {
        const safeId = `filter${key.replace(/_/g, '')}`;
        filterOptionsHtml += `
            <input type="radio" class="btn-check" name="siteTypeFilter" id="${safeId}" value="${key}">
            <label class="btn btn-outline-secondary btn-sm" for="${safeId}" style="border-color: ${type.color}; color: ${type.color};">
                <i class="${type.icon}"></i> ${type.name}
            </label>
        `;
    });
    
    const filterHtml = `
        <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center">
                <label class="form-label mb-0"><strong>Filter:</strong></label>
                <button class="btn btn-sm btn-outline-secondary" type="button" onclick="toggleSiteFilter()" id="filterToggleBtn">
                    <i class="bi bi-chevron-down" id="filterToggleIcon"></i> Care Facility Types
                </button>
            </div>
            <div class="collapse" id="siteFilterOptions">
                <div class="mt-2">
                    <div class="btn-group-vertical w-100" role="group">
                        ${filterOptionsHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    filterContainer.innerHTML = filterHtml;
    
    // Add event listeners for filtering
    document.querySelectorAll('input[name="siteTypeFilter"]').forEach(radio => {
        radio.addEventListener('change', function() {
            filterSitesByType(this.value);
        });
    });
}

function filterSitesByType(type) {
    const siteCards = document.querySelectorAll('.site-card');
    
    siteCards.forEach(card => {
        if (type === 'all' || card.dataset.siteType === type) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update the radio button selection
    const radioButton = document.querySelector(`input[name="siteTypeFilter"][value="${type}"]`);
    if (radioButton) {
        radioButton.checked = true;
    }
}

function toggleSiteFilter() {
    const filterOptions = document.getElementById('siteFilterOptions');
    const toggleIcon = document.getElementById('filterToggleIcon');
    const toggleBtn = document.getElementById('filterToggleBtn');
    
    if (filterOptions && toggleIcon && toggleBtn) {
        if (filterOptions.classList.contains('show')) {
            // Collapse
            filterOptions.classList.remove('show');
            toggleIcon.className = 'bi bi-chevron-down';
            toggleBtn.innerHTML = '<i class="bi bi-chevron-down"></i> Care Facility Types';
        } else {
            // Expand
            filterOptions.classList.add('show');
            toggleIcon.className = 'bi bi-chevron-up';
            toggleBtn.innerHTML = '<i class="bi bi-chevron-up"></i> Care Facility Types';
        }
    }
}

function showAddSiteForm() {
    // Check if user has permission to add sites
    if (!isAdmin) {
        careMarshallAlert('Only administrators can add new sites. Contact your administrator to add new sites.', 'warning');
        return;
    }
    
    hideAllViews();
    if (typeof updateActiveNav === 'function') {
        updateActiveNav('sites');
    }
    if (typeof scrollToTop === 'function') {
        scrollToTop();
    }
    
    const siteFormView = document.getElementById('siteFormView');
    if (siteFormView) {
        siteFormView.classList.remove('hidden');
        siteFormView.style.display = '';
    }
    
    document.getElementById('siteFormTitle').textContent = 'Add New Client';
    document.getElementById('siteForm').reset();
    document.getElementById('siteId').value = '';
    const addressField = document.getElementById('siteAddress');
    if (addressField) {
        addressField.value = '';
    }
    document.getElementById('anomalySection')?.classList.add('hidden');
    document.getElementById('mapPickerContainer').classList.add('hidden');
    
    // Populate functional classification dropdown
    populateFunctionalClassificationDropdown();
    
    // Add event listener for seasonal classification changes
    const seasonalClassificationSelect = document.getElementById('seasonalClassification');
    const hiveCountField = document.getElementById('siteHiveCount');
    const formText = document.querySelector('#siteHiveCount + .form-text');
    
    if (seasonalClassificationSelect && hiveCountField && formText) {
        seasonalClassificationSelect.addEventListener('change', function() {
            const isZeroHiveAllowed = this.value === 'summer-only' || this.value === 'winter-only';
            
            if (isZeroHiveAllowed) {
                hiveCountField.min = '0';
                formText.textContent = 'Total number of hives in this site (0 allowed for seasonal-only sites)';
            } else {
                hiveCountField.min = '1';
                formText.textContent = 'Total number of hives in this site';
            }
        });
    }
    
    // Setup GPS button
    setTimeout(() => {
        const btn = document.getElementById('useLocationBtn');
        if (btn) {
            btn.onclick = getCurrentLocation;
        }
    }, 100);
}

function validateCoordinates() {
    const lat = parseFloat(document.getElementById('siteLat').value);
    const lng = parseFloat(document.getElementById('siteLng').value);
    
    const latField = document.getElementById('siteLat');
    const lngField = document.getElementById('siteLng');
    
    // Reset validation classes
    latField.classList.remove('is-valid', 'is-invalid');
    lngField.classList.remove('is-valid', 'is-invalid');
    
    // Validate latitude
    if (!isNaN(lat) && lat >= -90 && lat <= 90) {
        latField.classList.add('is-valid');
    } else if (latField.value.trim() !== '') {
        latField.classList.add('is-invalid');
    }
    
    // Validate longitude
    if (!isNaN(lng) && lng >= -180 && lng <= 180) {
        lngField.classList.add('is-valid');
    } else if (lngField.value.trim() !== '') {
        lngField.classList.add('is-invalid');
    }
}

function populateFunctionalClassificationDropdown() {
    const typeSelect = document.getElementById('functionalClassification');
    if (!typeSelect) return;
    
    // Preserve current value if it exists
    const currentValue = typeSelect.value;
    
    const options = Object.entries(SITE_TYPES).map(([key, type]) => 
        `<option value="${key}" style="color: ${type.color}">
            <i class="bi ${type.icon}"></i> ${type.name}
        </option>`
    ).join('');
    
    typeSelect.innerHTML = `<option value="">Select functional classification...</option>${options}`;
    
    // Restore the value if it was set
    if (currentValue) {
        typeSelect.value = currentValue;
    }
}

function handleSaveSite(e) {
    e.preventDefault();
    
    // Validate required fields and focus on first invalid field
    const nameField = document.getElementById('siteName');
    const nameValue = nameField.value.trim();
    if (!nameValue) {
        careMarshallAlert('⚠️ Site name is required', 'warning');
        nameField.focus();
        nameField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    
    const hiveCountField = document.getElementById('siteHiveCount');
    const hiveCount = parseInt(hiveCountField.value);
    const seasonalClassification = document.getElementById('seasonalClassification').value;
    
    // Allow 0 hives for all sites (some sites may be waiting for action or new contracts)
    if (isNaN(hiveCount) || hiveCount < 0) {
        careMarshallAlert('⚠️ Please enter a valid hive count (0 or greater)', 'warning');
        hiveCountField.focus();
        hiveCountField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    
    // Validate coordinates
    const latField = document.getElementById('siteLat');
    const lngField = document.getElementById('siteLng');
    const lat = parseFloat(latField.value);
    const lng = parseFloat(lngField.value);
    
    if (isNaN(lat) || isNaN(lng)) {
        careMarshallAlert('⚠️ Please enter valid GPS coordinates', 'warning');
        latField.focus();
        latField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    
    if (lat < -90 || lat > 90) {
        careMarshallAlert('⚠️ Latitude must be between -90 and 90 degrees', 'warning');
        latField.focus();
        latField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    
    if (lng < -180 || lng > 180) {
        careMarshallAlert('⚠️ Longitude must be between -180 and 180 degrees', 'warning');
        lngField.focus();
        lngField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    
    const id = document.getElementById('siteId').value;
    
    // Get hive strength from display elements (not input fields)
    const strongElement = document.getElementById('hiveStateStrong');
    const mediumElement = document.getElementById('hiveStateMedium');
    const weakElement = document.getElementById('hiveStateWeak');
    const nucElement = document.getElementById('hiveStateNUC');
    const deadElement = document.getElementById('hiveStateDead');
    
    const contactNotesField = document.getElementById('landownerNotes');
    const contactNotes = contactNotesField ? contactNotesField.value : '';
    
    const expectedHoursField = document.getElementById('expectedServiceHours');
    const expectedHoursValue = expectedHoursField ? parseFloat(expectedHoursField.value) : NaN;
    
    const careServices = {};
    CARE_SERVICE_DEFINITIONS.forEach(service => {
        careServices[service.key] = document.getElementById(service.elementId)?.checked || false;
    });
    
    const physicalAddressField = document.getElementById('siteAddress');
    const physicalAddress = physicalAddressField ? physicalAddressField.value.trim() : '';
    if (!physicalAddress) {
        careMarshallAlert('⚠️ Physical address is required for mapping and scheduling.', 'warning');
        physicalAddressField?.focus();
        physicalAddressField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    
    const careNotesFieldInput = document.getElementById('careNotes');
    const regularTasksFieldInput = document.getElementById('regularTasksList');
    
    const site = {
        id: id ? parseInt(id) : Date.now(),
        name: document.getElementById('siteName').value,
        description: document.getElementById('siteDescription').value,
        // Client Demographics (NEW v0.8)
        clientAge: parseInt(document.getElementById('clientAge')?.value) || null,
        disabilityClassification: document.getElementById('disabilityClassification')?.value || '',
        disabilityNotes: document.getElementById('disabilityNotes')?.value || '',
        latitude: parseFloat(document.getElementById('siteLat').value) || 0,
        longitude: parseFloat(document.getElementById('siteLng').value) || 0,
        physicalAddress,
        address: physicalAddress,
        hiveCount: parseInt(document.getElementById('siteHiveCount').value),
        // Hive strength breakdown from display elements
        hiveStrength: {
            strong: strongElement ? parseInt(strongElement.textContent) || 0 : 0,
            medium: mediumElement ? parseInt(mediumElement.textContent) || 0 : 0,
            weak: weakElement ? parseInt(weakElement.textContent) || 0 : 0,
            nuc: nucElement ? parseInt(nucElement.textContent) || 0 : 0,
            dead: deadElement ? parseInt(deadElement.textContent) || 0 : 0
        },
        // Hive stack configuration - get from visual grid data if available, otherwise from site data
        hiveStacks: visualHiveData ? {
            doubles: visualHiveData.doubles || 0,
            topSplits: visualHiveData.topSplits || 0,
            singles: visualHiveData.singles || 0,
            nucs: visualHiveData.nucs || 0,
            empty: visualHiveData.empty || 0
        } : (window.sites.find(c => c.id === parseInt(id))?.hiveStacks || {
            doubles: 0,
            topSplits: 0,
            singles: 0,
            nucs: 0,
            empty: 0
        }),
        harvestTimeline: document.getElementById('siteHarvest')?.value || '',
        sugarRequirements: document.getElementById('siteSugar')?.value || '',
        notes: document.getElementById('siteNotes')?.value || '',
        functionalClassification: document.getElementById('functionalClassification').value || 'production',
        seasonalClassification: document.getElementById('seasonalClassification').value || 'summer',
        landownerName: document.getElementById('landownerName').value,
        landownerPhone: document.getElementById('landownerPhone').value,
        landownerEmail: document.getElementById('landownerEmail').value,
        contactNotes,
        // Backward compatibility - legacy property
        landownerAddress: contactNotes,
        accessType: document.getElementById('accessType').value,
        contactBeforeVisit: document.getElementById('contactBeforeVisit').checked,
        isQuarantine: document.getElementById('isQuarantine').checked,
        careServices,
        expectedServiceHours: Number.isNaN(expectedHoursValue) ? null : Number(expectedHoursValue.toFixed(2)),
        careNotes: careNotesFieldInput ? careNotesFieldInput.value : '',
        regularTasks: regularTasksFieldInput ? regularTasksFieldInput.value : '',
        // Legal & Compliance Information
        legalCompliance: {
            hdsRegistrationNumber: document.getElementById('hdsRegistrationNumber')?.value || '',
            registrationExpiry: document.getElementById('registrationExpiry')?.value || '',
            insuranceProvider: document.getElementById('insuranceProvider')?.value || '',
            insurancePolicyNumber: document.getElementById('insurancePolicyNumber')?.value || '',
            insuranceExpiry: document.getElementById('insuranceExpiry')?.value || '',
            privacyOfficer: document.getElementById('privacyOfficer')?.value || '',
            healthSafetyOfficer: document.getElementById('healthSafetyOfficer')?.value || '',
            recordRetentionYears: parseInt(document.getElementById('recordRetentionYears')?.value) || 7,
            privacyCompliance: document.getElementById('privacyCompliance')?.checked || false,
            healthSafetyCompliance: document.getElementById('healthSafetyCompliance')?.checked || false,
            incidentReportingEnabled: document.getElementById('incidentReportingEnabled')?.checked || false
        },
        // Special needs flags
        specialNeeds: {
            wheelchairAccessible: document.getElementById('wheelchairAccessible')?.checked || false,
            medicalEquipmentOnSite: document.getElementById('medicalEquipmentOnSite')?.checked || false,
            specialInstructionsRequired: document.getElementById('specialInstructionsRequired')?.checked || false,
            petPresent: document.getElementById('petPresent')?.checked || false,
            familyMemberPresent: document.getElementById('familyMemberPresent')?.checked || false,
            restrictedAccess: document.getElementById('restrictedAccess')?.checked || false,
            emergencyContactRequired: document.getElementById('emergencyContactRequired')?.checked || false,
            medicationStorageAvailable: document.getElementById('medicationStorageAvailable')?.checked || false,
            oxygenEquipment: document.getElementById('oxygenEquipment')?.checked || false,
            dementiaCare: document.getElementById('dementiaCare')?.checked || false,
            fallRisk: document.getElementById('fallRisk')?.checked || false,
            woundCareRequired: document.getElementById('woundCareRequired')?.checked || false
        },
        // Care service types (removed - use task groups instead)
        lastModifiedBy: currentUser.username,
        lastModifiedAt: new Date().toISOString(),
        createdAt: id ? (window.sites.find(c => c.id === parseInt(id))?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };
    
    // Preserve harvest records if they exist
    if (id) {
        const existingSite = window.sites.find(c => c.id === parseInt(id));
        if (existingSite && existingSite.harvestRecords) {
            site.harvestRecords = existingSite.harvestRecords;
        }
    }
    
    // Show sync status
    if (window.syncStatusManager) {
        window.syncStatusManager.updateSyncStatus('syncing', 'Saving site...');
    }
    
    // Use tenant-specific path for data isolation
    const tenantPath = currentTenantId ? `tenants/${currentTenantId}/sites` : 'sites';
    
    // Check if we're online and can save directly
    if (navigator.onLine && window.database) {
        database.ref(`${tenantPath}/${site.id}`).set(site)
            .then(() => {
                const tenantInfo = currentTenantId ? ` to tenant: ${currentTenantId}` : '';
                careMarshallAlert(`✅ Client "${site.name}" has been saved successfully${tenantInfo}!\n\nData saved to: ${tenantPath}/${site.id}`, 'success');
                if (window.syncStatusManager) {
                    window.syncStatusManager.updateSyncStatus('synced');
                }
                // Close the form and return to sites view, then scroll to the site card
                setTimeout(() => {
                    showSites();
                    // Scroll to the site card after rendering
                    setTimeout(() => {
                        const siteCard = document.querySelector(`[data-site-id="${site.id}"]`);
                        if (siteCard) {
                            siteCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 100);
                }, 500);
            })
            .catch(error => {
                console.error('Error saving site:', error);
                // Add to pending changes queue
                if (window.syncStatusManager) {
                    window.syncStatusManager.addPendingChange({
                        type: 'site_save',
                        path: `${tenantPath}/${site.id}`,
                        data: site,
                        method: 'set'
                    });
                }
                const tenantInfo = currentTenantId ? ` to tenant: ${currentTenantId}` : '';
                careMarshallAlert(`⚠️ Client "${site.name}" saved locally${tenantInfo}.\n\nWill sync to ${tenantPath}/${site.id} when connection is restored.`, 'warning');
                // Close the form and return to sites view, then scroll to the site card
                setTimeout(() => {
                    showSites();
                    // Scroll to the site card after rendering
                    setTimeout(() => {
                        const siteCard = document.querySelector(`[data-site-id="${site.id}"]`);
                        if (siteCard) {
                            siteCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 100);
                }, 500);
            });
    } else {
        // Offline - add to pending changes
        if (window.syncStatusManager) {
            window.syncStatusManager.addPendingChange({
                type: 'site_save',
                path: `${tenantPath}/${site.id}`,
                data: site,
                method: 'set'
            });
        }
        const tenantInfo = currentTenantId ? ` to tenant: ${currentTenantId}` : '';
        careMarshallAlert(`⚠️ Client "${site.name}" saved locally${tenantInfo}.\n\nWill sync to ${tenantPath}/${site.id} when connection is restored.`, 'warning');
        // Close the form and return to sites view
        setTimeout(() => {
            showSites();
        }, 500);
    }
}

// Make editSite globally accessible
window.editSite = function(id) {
    // Check if user has permission to edit sites
    if (!isAdmin) {
        careMarshallAlert('Only administrators can edit client details. Please contact an administrator if updates are required.', 'warning');
        return;
    }
    
    const site = window.sites.find(c => c.id === id);
    if (!site) return;
    
    hideAllViews();
    
    if (typeof updateActiveNav === 'function') {
        updateActiveNav('sites');
    }
    if (typeof scrollToTop === 'function') {
        scrollToTop();
    }
    
    const siteFormView = document.getElementById('siteFormView');
    if (siteFormView) {
        siteFormView.classList.remove('hidden');
        siteFormView.style.display = '';
    }
    document.getElementById('siteFormTitle').textContent = 'Edit: ' + site.name;
    
    // Populate functional classification dropdown BEFORE setting values
    populateFunctionalClassificationDropdown();
    
    document.getElementById('siteId').value = site.id;
    const careServices = site.careServices || {};
    document.getElementById('siteName').value = site.name;
    const addressField = document.getElementById('siteAddress');
    if (addressField) {
        addressField.value = site.physicalAddress || site.address || site.landownerAddress || site.contactNotes || '';
    }
    const expectedHoursField = document.getElementById('expectedServiceHours');
    if (expectedHoursField) {
        expectedHoursField.value = site.expectedServiceHours ?? site.expectedHours ?? '';
    }
    document.getElementById('siteDescription').value = site.description || '';
    // Client Demographics (NEW v0.7)
    document.getElementById('clientAge').value = site.clientAge || '';
    document.getElementById('disabilityClassification').value = site.disabilityClassification || '';
    document.getElementById('disabilityNotes').value = site.disabilityNotes || '';
    // Ensure coordinates are properly formatted as numbers
    const lat = parseFloat(site.latitude);
    const lng = parseFloat(site.longitude);
    
    console.log('Editing site coordinates:', { 
        original: { lat: site.latitude, lng: site.longitude },
        parsed: { lat, lng }
    });
    
    document.getElementById('siteLat').value = isNaN(lat) ? '' : lat.toFixed(6);
    document.getElementById('siteLng').value = isNaN(lng) ? '' : lng.toFixed(6);
    document.getElementById('siteHiveCount').value = site.hiveCount;
    
    // Handle harvest timeline date - ensure it's a valid date string for date input
    const harvestDateInput = document.getElementById('siteHarvest');
    if (harvestDateInput && site.harvestTimeline) {
        // Try to parse the date - if it's not in the correct format, leave it empty
        const parsedDate = new Date(site.harvestTimeline);
        if (!isNaN(parsedDate.getTime())) {
            // Valid date - format as YYYY-MM-DD for date input
            const year = parsedDate.getFullYear();
            const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
            const day = String(parsedDate.getDate()).padStart(2, '0');
            harvestDateInput.value = `${year}-${month}-${day}`;
        } else {
            harvestDateInput.value = '';
        }
    } else if (harvestDateInput) {
        harvestDateInput.value = '';
    }
    
    if (document.getElementById('siteSugar')) document.getElementById('siteSugar').value = site.sugarRequirements || '';
    if (document.getElementById('siteNotes')) document.getElementById('siteNotes').value = site.notes || '';
    const careNotesField = document.getElementById('careNotes');
    if (careNotesField) {
        careNotesField.value = site.careNotes || '';
    }
    const regularTasksField = document.getElementById('regularTasksList');
    if (regularTasksField) {
        regularTasksField.value = site.regularTasks || site.regularTasksList || '';
    }
    CARE_SERVICE_DEFINITIONS.forEach(service => {
        const checkbox = document.getElementById(service.elementId);
        if (checkbox) {
            checkbox.checked = !!careServices[service.key];
        }
    });
    document.getElementById('functionalClassification').value = site.functionalClassification || site.siteType || 'production';
    document.getElementById('seasonalClassification').value = site.seasonalClassification || site.seasonal_classification || 'summer';
    document.getElementById('landownerName').value = site.landownerName || '';
    document.getElementById('landownerPhone').value = site.landownerPhone || '';
    document.getElementById('landownerEmail').value = site.landownerEmail || '';
    if (document.getElementById('landownerNotes')) {
        document.getElementById('landownerNotes').value = site.contactNotes || site.landownerAddress || '';
    }
    document.getElementById('accessType').value = site.accessType || '';
    document.getElementById('contactBeforeVisit').checked = site.contactBeforeVisit || false;
    document.getElementById('isQuarantine').checked = site.isQuarantine || false;
    
    // Populate legal & compliance information
    const legalCompliance = site.legalCompliance || {};
    if (document.getElementById('hdsRegistrationNumber')) document.getElementById('hdsRegistrationNumber').value = legalCompliance.hdsRegistrationNumber || '';
    if (document.getElementById('registrationExpiry')) document.getElementById('registrationExpiry').value = legalCompliance.registrationExpiry || '';
    if (document.getElementById('insuranceProvider')) document.getElementById('insuranceProvider').value = legalCompliance.insuranceProvider || '';
    if (document.getElementById('insurancePolicyNumber')) document.getElementById('insurancePolicyNumber').value = legalCompliance.insurancePolicyNumber || '';
    if (document.getElementById('insuranceExpiry')) document.getElementById('insuranceExpiry').value = legalCompliance.insuranceExpiry || '';
    if (document.getElementById('privacyOfficer')) document.getElementById('privacyOfficer').value = legalCompliance.privacyOfficer || '';
    if (document.getElementById('healthSafetyOfficer')) document.getElementById('healthSafetyOfficer').value = legalCompliance.healthSafetyOfficer || '';
    if (document.getElementById('recordRetentionYears')) document.getElementById('recordRetentionYears').value = legalCompliance.recordRetentionYears || 7;
    if (document.getElementById('privacyCompliance')) document.getElementById('privacyCompliance').checked = legalCompliance.privacyCompliance || false;
    if (document.getElementById('healthSafetyCompliance')) document.getElementById('healthSafetyCompliance').checked = legalCompliance.healthSafetyCompliance || false;
    if (document.getElementById('incidentReportingEnabled')) document.getElementById('incidentReportingEnabled').checked = legalCompliance.incidentReportingEnabled || false;
    
    // Check if there's any legal compliance data and enable the checkbox if so
    const hasLegalComplianceData = legalCompliance.hdsRegistrationNumber || legalCompliance.insuranceProvider || 
                                    legalCompliance.privacyOfficer || legalCompliance.healthSafetyOfficer;
    const enableLegalComplianceCheckbox = document.getElementById('enableLegalCompliance');
    if (enableLegalComplianceCheckbox) {
        enableLegalComplianceCheckbox.checked = !!hasLegalComplianceData;
        // Trigger the toggle to show/hide the card
        if (typeof toggleLegalComplianceCard === 'function') {
            toggleLegalComplianceCard();
        }
    }
    
    // Populate special needs flags
    const specialNeeds = site.specialNeeds || {};
    const flagCheckboxes = {
        'wheelchairAccessible': specialNeeds.wheelchairAccessible || false,
        'medicalEquipmentOnSite': specialNeeds.medicalEquipmentOnSite || false,
        'specialInstructionsRequired': specialNeeds.specialInstructionsRequired || false,
        'petPresent': specialNeeds.petPresent || false,
        'familyMemberPresent': specialNeeds.familyMemberPresent || false,
        'restrictedAccess': specialNeeds.restrictedAccess || false,
        'emergencyContactRequired': specialNeeds.emergencyContactRequired || false,
        'medicationStorageAvailable': specialNeeds.medicationStorageAvailable || false,
        'oxygenEquipment': specialNeeds.oxygenEquipment || false,
        'dementiaCare': specialNeeds.dementiaCare || false,
        'fallRisk': specialNeeds.fallRisk || false,
        'woundCareRequired': specialNeeds.woundCareRequired || false
    };
    
    Object.keys(flagCheckboxes).forEach(flagId => {
        const checkbox = document.getElementById(flagId);
        if (checkbox) {
            checkbox.checked = flagCheckboxes[flagId];
        }
    });
    
    // Populate hive strength breakdown
    if (site.hiveStrength) {
        // Update the Hive State display elements (not input fields)
        const strongElement = document.getElementById('hiveStateStrong');
        const mediumElement = document.getElementById('hiveStateMedium');
        const weakElement = document.getElementById('hiveStateWeak');
        const nucElement = document.getElementById('hiveStateNUC');
        const deadElement = document.getElementById('hiveStateDead');
        
        if (strongElement) strongElement.textContent = site.hiveStrength.strong || 0;
        if (mediumElement) mediumElement.textContent = site.hiveStrength.medium || 0;
        if (weakElement) weakElement.textContent = site.hiveStrength.weak || 0;
        if (nucElement) nucElement.textContent = site.hiveStrength.nuc || 0;
        if (deadElement) deadElement.textContent = site.hiveStrength.dead || 0;
        
        // Show the Hive State card if there are any hives
        const hiveStateCard = document.getElementById('hiveStateCard');
        if (hiveStateCard) {
            const totalHives = (site.hiveStrength.strong || 0) + (site.hiveStrength.medium || 0) + 
                              (site.hiveStrength.weak || 0) + (site.hiveStrength.nuc || 0) + 
                              (site.hiveStrength.dead || 0);
            if (totalHives > 0) {
                hiveStateCard.style.display = 'block';
            }
        }
    }
    
    // Populate stack configuration - these elements are no longer in the HTML
    // The visual hive grid now replaces these inputs
    // Stack configuration data is now stored in visualHiveData and rendered via the grid
    
    // Update the visual hive grid with existing data
    if (typeof initializeVisualHiveGrid === 'function') {
        initializeVisualHiveGrid(site);
    }
    // updateStackTotals(); // Removed - no longer needed with visual hive grid
    
    document.getElementById('anomalySection')?.classList.remove('hidden');
    document.getElementById('mapPickerContainer').classList.add('hidden');
    
    // Add event listeners for coordinate validation
    document.getElementById('siteLat').addEventListener('blur', validateCoordinates);
    document.getElementById('siteLng').addEventListener('blur', validateCoordinates);
    
    // Setup GPS button
    setTimeout(() => {
        const btn = document.getElementById('useLocationBtn');
        if (btn) {
            btn.onclick = getCurrentLocation;
        }
    }, 100);
    
    // Render harvest records if they exist
    if (site.harvestRecords && site.harvestRecords.length > 0) {
        renderHarvestRecords(site.harvestRecords);
    }
    
    // Initialize and render visual hive grid - auto-populate on page load
    visualHiveData = null; // Reset visual data
    renderVisualHiveGrid(); // Render immediately on page load
    
    // Render honey potentials checkboxes
    renderHoneyPotentials(site.honeyPotentials || []);
    
    // Add event listener for seasonal classification changes
    const seasonalClassificationSelect = document.getElementById('seasonalClassification');
    const hiveCountField = document.getElementById('siteHiveCount');
    const formText = document.querySelector('#siteHiveCount + .form-text');
    
    if (seasonalClassificationSelect && hiveCountField && formText) {
        seasonalClassificationSelect.addEventListener('change', function() {
            const isZeroHiveAllowed = this.value === 'summer-only' || this.value === 'winter-only';
            
            if (isZeroHiveAllowed) {
                hiveCountField.min = '0';
                formText.textContent = 'Total number of hives in this site (0 allowed for seasonal-only sites)';
            } else {
                hiveCountField.min = '1';
                formText.textContent = 'Total number of hives in this site';
            }
        });
    }
};

/**
 * Render honey potentials checkboxes in the form
 */
function renderHoneyPotentials(selectedPotentials = []) {
    const container = document.getElementById('honeyPotentialsContainer');
    if (!container) return;
    
    // Support both CARE_SERVICE_TYPES and HONEY_TYPES for backward compatibility
    const serviceTypes = (typeof CARE_SERVICE_TYPES !== 'undefined' && CARE_SERVICE_TYPES.length > 0) ? CARE_SERVICE_TYPES :
                         (typeof HONEY_TYPES !== 'undefined' && HONEY_TYPES.length > 0) ? HONEY_TYPES : [];
    
    if (serviceTypes.length === 0) {
        container.innerHTML = '<p class="text-muted small">No care service types available. Add care service types in Task Management.</p>';
        return;
    }
    
    container.innerHTML = serviceTypes.map(type => {
        const isChecked = selectedPotentials.includes(type);
        return `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${type}" id="honey_${type}" ${isChecked ? 'checked' : ''}>
                <label class="form-check-label" for="honey_${type}">
                    ${type}
                </label>
            </div>
        `;
    }).join('');
}

/**
 * Get selected honey potentials from checkboxes
 */
function getSelectedHoneyPotentials() {
    const container = document.getElementById('honeyPotentialsContainer');
    if (!container) return [];
    
    const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// Global variable to track which record is being edited
let editingHarvestRecordIndex = null;

/**
 * Add or update a harvest record to the current site form
 */
function addHarvestRecord() {
    const date = document.getElementById('harvestDate').value;
    const quantity = document.getElementById('harvestQuantity').value;
    const notes = document.getElementById('harvestNotes').value;
    
    if (!date || !quantity) {
        careMarshallAlert('Please enter a date and quantity', 'warning');
        return;
    }
    
    // Get existing records from the current site being edited
    const siteId = document.getElementById('siteId').value;
    let harvestRecords = [];
    
    if (siteId) {
        const existingSite = window.sites.find(c => c.id === parseInt(siteId));
        if (existingSite && existingSite.harvestRecords) {
            harvestRecords = [...existingSite.harvestRecords];
        }
    }
    
    if (editingHarvestRecordIndex !== null && editingHarvestRecordIndex >= 0) {
        // Update existing record - preserve original metadata and add modification info
        const existingRecord = harvestRecords[editingHarvestRecordIndex];
        harvestRecords[editingHarvestRecordIndex] = {
            ...existingRecord,
            date: date,
            quantity: parseFloat(quantity),
            notes: notes || '',
            modifiedBy: currentUser.username,
            modifiedAt: new Date().toISOString()
        };
        careMarshallAlert('✅ Harvest record updated', 'success');
    } else {
        // Add new record
        const recordToSave = {
            date: date,
            quantity: parseFloat(quantity),
            notes: notes || '',
            addedBy: currentUser.username,
            addedAt: new Date().toISOString()
        };
        harvestRecords.push(recordToSave);
        careMarshallAlert('✅ Harvest record added', 'success');
    }
    
    // Sort by date (newest first)
    harvestRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Update the site in the array temporarily (will be saved when form is submitted)
    if (siteId) {
        const siteIndex = window.sites.findIndex(c => c.id === parseInt(siteId));
        if (siteIndex !== -1) {
            window.sites[siteIndex].harvestRecords = harvestRecords;
        }
    }
    
    // Render the updated records
    renderHarvestRecords(harvestRecords);
    
    // Clear the input fields and reset edit state
    document.getElementById('harvestDate').value = '';
    document.getElementById('harvestQuantity').value = '';
    document.getElementById('harvestNotes').value = '';
    editingHarvestRecordIndex = null;
    
    // Reset button text
    const addBtn = document.querySelector('button[onclick="addHarvestRecord()"]');
    if (addBtn) {
        addBtn.innerHTML = '<i class="bi bi-plus"></i> Add Harvest Record';
    }
}

/**
 * Edit an existing harvest record
 */
function editHarvestRecord(index) {
    const siteId = document.getElementById('siteId').value;
    if (!siteId) {
        careMarshallAlert('No site selected', 'error');
        return;
    }
    
    const existingSite = window.sites.find(c => c.id === parseInt(siteId));
    if (!existingSite || !existingSite.harvestRecords || !existingSite.harvestRecords[index]) {
        careMarshallAlert('Record not found', 'error');
        return;
    }
    
    const record = existingSite.harvestRecords[index];
    
    // Populate the input fields with the record data
    document.getElementById('harvestDate').value = record.date;
    document.getElementById('harvestQuantity').value = record.quantity;
    document.getElementById('harvestNotes').value = record.notes || '';
    
    // Set the index being edited
    editingHarvestRecordIndex = index;
    
    // Update button text
    const addBtn = document.querySelector('button[onclick="addHarvestRecord()"]');
    if (addBtn) {
        addBtn.innerHTML = '<i class="bi bi-check"></i> Update Record';
    }
    
    // Scroll to the input fields
    document.getElementById('harvestDate').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    document.getElementById('harvestDate').focus();
}

/**
 * Render harvest records in the container
 */
function renderHarvestRecords(records) {
    const container = document.getElementById('harvestRecordsContainer');
    if (!container) return;
    
    if (!records || records.length === 0) {
        container.innerHTML = '<p class="text-muted small">No harvest records yet. Add your first harvest below.</p>';
        return;
    }
    
    // Determine if any record has been modified
    const hasModifiedRecords = records.some(r => r.modifiedBy);
    const modifiedColumnHtml = hasModifiedRecords ? '<th>Modified By</th>' : '';
    
    const recordsHtml = `
        <div class="table-responsive">
            <table class="table table-sm table-hover">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Quantity (kg)</th>
                        <th>Notes</th>
                        <th>Added By</th>
                        ${modifiedColumnHtml}
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    ${records.map((record, index) => {
                        const rowClass = record.modifiedBy ? 'class="table-warning"' : '';
                        const modifiedCellHtml = hasModifiedRecords 
                            ? `<td><small class="text-muted">${record.modifiedBy ? `<span class="text-warning"><i class="bi bi-pencil"></i> ${record.modifiedBy}</span>` : '-'}</small></td>`
                            : '';
                        
                        return `
                        <tr ${rowClass}>
                            <td>${new Date(record.date).toLocaleDateString()}</td>
                            <td><strong>${record.quantity.toFixed(1)}</strong></td>
                            <td>${record.notes || '-'}</td>
                            <td><small class="text-muted">${record.addedBy}</small></td>
                            ${modifiedCellHtml}
                            <td>
                                <button class="btn btn-sm btn-outline-primary" onclick="editHarvestRecord(${index})" title="Edit this record">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="removeHarvestRecord(${index})" title="Delete this record">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                    }).join('')}
                </tbody>
                <tfoot>
                    <tr class="table-info">
                        <th>Total</th>
                        <th><strong>${records.reduce((sum, r) => sum + r.quantity, 0).toFixed(1)} kg</strong></th>
                        <th colspan="${hasModifiedRecords ? '4' : '3'}"></th>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
    
    container.innerHTML = recordsHtml;
}

/**
 * Remove a harvest record by index
 */
function removeHarvestRecord(index) {
    if (!confirm('Are you sure you want to remove this harvest record?')) {
        return;
    }
    
    const siteId = document.getElementById('siteId').value;
    if (!siteId) {
        careMarshallAlert('No site selected', 'error');
        return;
    }
    
    const siteIndex = window.sites.findIndex(c => c.id === parseInt(siteId));
    if (siteIndex === -1) {
        careMarshallAlert('Site not found', 'error');
        return;
    }
    
    if (!window.sites[siteIndex].harvestRecords) {
        window.sites[siteIndex].harvestRecords = [];
    }
    
    window.sites[siteIndex].harvestRecords.splice(index, 1);
    
    // Reset edit state if the deleted record was being edited
    if (editingHarvestRecordIndex === index) {
        editingHarvestRecordIndex = null;
        document.getElementById('harvestDate').value = '';
        document.getElementById('harvestQuantity').value = '';
        document.getElementById('harvestNotes').value = '';
        
        // Reset button text
        const addBtn = document.querySelector('button[onclick="addHarvestRecord()"]');
        if (addBtn) {
            addBtn.innerHTML = '<i class="bi bi-plus"></i> Add Harvest Record';
        }
    }
    
    renderHarvestRecords(window.sites[siteIndex].harvestRecords);
    
    careMarshallAlert('Harvest record removed', 'info');
}

function viewSiteDetails(id) {
    const site = window.sites.find(c => c.id === id);
    if (!site) return;
    
    const typeInfo = SITE_TYPES[site.siteType] || SITE_TYPES['other'];
    
    const detailsHtml = `
        <div class="modal fade" id="siteDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi ${typeInfo.icon}" style="color: ${typeInfo.color}"></i>
                            ${site.name}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6>Basic Information</h6>
                                <p><strong>Type:</strong> <span class="badge" style="background-color: ${typeInfo.color}; color: white;">${typeInfo.name}</span></p>
                                <p><strong>Description:</strong> ${site.description || 'No description'}</p>
                                <p><strong>Clients:</strong> ${site.hiveCount}</p>
                                ${site.expectedServiceHours ? `<p><strong>Expected Hours per Visit:</strong> ${site.expectedServiceHours % 1 === 0 ? site.expectedServiceHours : site.expectedServiceHours.toFixed(1)}</p>` : ''}
                                <p><strong>GPS Coordinates:</strong> ${site.latitude.toFixed(6)}, ${site.longitude.toFixed(6)}</p>
                                
                                <div class="mt-2">
                                    <button class="btn btn-sm btn-outline-primary" onclick="openInMaps(${site.id})">
                                        <i class="bi bi-geo-alt-fill"></i> View on Maps
                                    </button>
                                </div>
                                
                                <h6 class="mt-3">Contact Information</h6>
                                ${site.landownerName ? `<p><strong>Name:</strong> ${site.landownerName}</p>` : ''}
                                ${site.landownerPhone ? `<p><strong>Phone:</strong> <a href="tel:${site.landownerPhone}" class="btn btn-sm btn-outline-primary"><i class="bi bi-telephone-fill"></i> ${site.landownerPhone}</a></p>` : ''}
                                ${site.landownerEmail ? `<p><strong>Email:</strong> <a href="mailto:${site.landownerEmail}" class="btn btn-sm btn-outline-primary"><i class="bi bi-envelope-fill"></i> ${site.landownerEmail}</a></p>` : ''}
                                ${(site.contactNotes || site.landownerAddress) ? `<p><strong>Contact Notes:</strong> ${site.contactNotes || site.landownerAddress}</p>` : ''}
                                
                                <!-- Clients at this site -->
                                ${(() => {
                                    const siteClients = (window.clients || window.individualHives || []).filter(client => client.siteId === site.id);
                                    if (siteClients.length === 0) return '';
                                    return `
                                        <h6 class="mt-3">Clients (${siteClients.length})</h6>
                                        <div style="max-height: 200px; overflow-y: auto;">
                                            ${siteClients.slice(0, 5).map(client => {
                                                const clientName = client.clientName || client.hiveName || `Client ${client.id}`;
                                                const status = client.status || client.hiveStrength || 'unknown';
                                                return `<p class="mb-1"><i class="bi bi-house-heart"></i> ${clientName} <span class="badge bg-secondary">${status}</span></p>`;
                                            }).join('')}
                                            ${siteClients.length > 5 ? `<p class="text-muted small">... and ${siteClients.length - 5} more clients</p>` : ''}
                                        </div>
                                        <button class="btn btn-sm btn-outline-info mt-2" onclick="showSiteClients(${site.id})">
                                            <i class="bi bi-list-ul"></i> View All Clients
                                        </button>
                                    `;
                                })()}
                                
                                <!-- Pending Tasks -->
                                ${(() => {
                                    const siteTasks = (window.scheduledTasks || []).filter(task => 
                                        task.siteId === site.id && !task.completed
                                    ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
                                    if (siteTasks.length === 0) return '';
                                    const overdueTasks = siteTasks.filter(task => new Date(task.dueDate) < new Date());
                                    return `
                                        <h6 class="mt-3">Pending Tasks (${siteTasks.length})</h6>
                                        <div style="max-height: 200px; overflow-y: auto;">
                                            ${siteTasks.slice(0, 5).map(task => {
                                                const taskName = typeof getTaskDisplayName === 'function' ? getTaskDisplayName(null, task.taskId) : (task.taskName || 'Unknown Task');
                                                const dueDate = new Date(task.dueDate);
                                                const isOverdue = dueDate < new Date();
                                                return `<p class="mb-1 ${isOverdue ? 'text-danger' : ''}">
                                                    <i class="bi bi-calendar"></i> ${taskName}
                                                    ${isOverdue ? '<span class="badge bg-danger">OVERDUE</span>' : ''}
                                                    <small class="text-muted"> - ${dueDate.toLocaleDateString()}</small>
                                                </p>`;
                                            }).join('')}
                                            ${siteTasks.length > 5 ? `<p class="text-muted small">... and ${siteTasks.length - 5} more tasks</p>` : ''}
                                        </div>
                                        <button class="btn btn-sm btn-outline-success mt-2" onclick="showSiteTasks(${site.id})">
                                            <i class="bi bi-list-check"></i> View All Tasks
                                        </button>
                                    `;
                                })()}
                            </div>
                            <div class="col-md-6">
                                <h6>Site Details</h6>
                                <p><strong>Site Type:</strong> ${SITE_TYPES[classificationKey]?.name || site.functionalClassification || site.siteType || 'Not specified'}</p>
                                <p><strong>Access Type:</strong> ${site.accessType || 'Not specified'}</p>
                                <p><strong>Contact Before Visit:</strong> ${site.contactBeforeVisit ? 'Yes' : 'No'}</p>
                                <p><strong>Isolation/Quarantine:</strong> ${site.isQuarantine ? 'Yes' : 'No'}</p>
                                
                                <!-- Legal & Compliance Information -->
                                ${site.legalCompliance ? `
                                    <h6 class="mt-3"><i class="bi bi-shield-check"></i> Legal & Compliance</h6>
                                    ${site.legalCompliance.hdsRegistrationNumber ? `<p><strong>HDS Registration:</strong> ${site.legalCompliance.hdsRegistrationNumber}</p>` : ''}
                                    ${site.legalCompliance.registrationExpiry ? `<p><strong>Registration Expires:</strong> ${new Date(site.legalCompliance.registrationExpiry).toLocaleDateString()}</p>` : ''}
                                    ${site.legalCompliance.insuranceProvider ? `<p><strong>Insurance:</strong> ${site.legalCompliance.insuranceProvider}${site.legalCompliance.insurancePolicyNumber ? ` (${site.legalCompliance.insurancePolicyNumber})` : ''}</p>` : ''}
                                    ${site.legalCompliance.insuranceExpiry ? `<p><strong>Insurance Expires:</strong> ${new Date(site.legalCompliance.insuranceExpiry).toLocaleDateString()}</p>` : ''}
                                    ${site.legalCompliance.privacyOfficer ? `<p><strong>Privacy Officer:</strong> ${site.legalCompliance.privacyOfficer}</p>` : ''}
                                    ${site.legalCompliance.healthSafetyOfficer ? `<p><strong>H&S Officer:</strong> ${site.legalCompliance.healthSafetyOfficer}</p>` : ''}
                                    <div class="mt-2">
                                        ${site.legalCompliance.privacyCompliance ? `<span class="badge bg-success me-1"><i class="bi bi-check-circle"></i> Privacy Act Compliant</span>` : ''}
                                        ${site.legalCompliance.healthSafetyCompliance ? `<span class="badge bg-success me-1"><i class="bi bi-check-circle"></i> H&S Act Compliant</span>` : ''}
                                        ${site.legalCompliance.incidentReportingEnabled ? `<span class="badge bg-info me-1"><i class="bi bi-exclamation-triangle"></i> Incident Reporting Active</span>` : ''}
                                    </div>
                                ` : ''}
                                
                                ${site.notes ? `
                                    <h6 class="mt-3">Notes</h6>
                                    <p>${site.notes}</p>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        ${isAdmin ? `<button type="button" class="btn btn-primary" onclick="editSite(${site.id}); bootstrap.Modal.getInstance(document.getElementById('siteDetailsModal')).hide();">
                            <i class="bi bi-pencil"></i> Edit Site
                        </button>` : ''}
                        ${isAdmin ? `<button type="button" class="btn btn-success" onclick="scheduleTaskForSite(${site.id}); bootstrap.Modal.getInstance(document.getElementById('siteDetailsModal')).hide();">
                            <i class="bi bi-calendar-plus"></i> Schedule Task
                        </button>` : ''}
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('siteDetailsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', detailsHtml);
    
    // Show modal - use a small delay to ensure DOM is ready and any popups are closed
    setTimeout(() => {
        const modalElement = document.getElementById('siteDetailsModal');
        if (modalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        } else {
            console.error('Bootstrap Modal not available or modal element not found');
        }
    }, 150);
}

function scheduleTaskForSite(siteId) {
    // Pre-fill the schedule form with the selected site
    document.getElementById('scheduleSite').value = siteId;
    
    // Show the schedule modal
    const modal = new bootstrap.Modal(document.getElementById('scheduleTaskModal'));
    modal.show();
}

function archiveSite(id) {
    const site = window.sites.find(c => c.id === id);
    if (!site) {
        careMarshallAlert('Site not found', 'error');
        return;
    }
    
    if (confirm(`Archive "${site.name}"? This will:\n\n• Stop the site from appearing in hive/site counts\n• Keep historical harvest data\n• Make the site accessible only from "Show Archived Sites"\n\nYou can unarchive it later if needed.`)) {
        const tenantPath = currentTenantId ? `tenants/${currentTenantId}/sites` : 'sites';
        database.ref(`${tenantPath}/${id}`).update({
            archived: true,
            archivedDate: new Date().toISOString(),
            archivedBy: currentUser.username,
            lastModified: new Date().toISOString(),
            lastModifiedBy: currentUser.username
        }).then(() => {
            careMarshallAlert(`✅ "${site.name}" has been archived`, 'success');
            
            // Log as action
            const actionText = `Archived site: ${site.name}`;
            const action = {
                id: Date.now(),
                siteId: id,
                task: 'Archive Site',
                taskName: 'Archive Site',
                taskCategory: 'Management',
                date: new Date().toISOString().split('T')[0],
                loggedBy: currentUser.username,
                notes: actionText,
                createdAt: new Date().toISOString()
            };
            
            const actionPath = currentTenantId ? `tenants/${currentTenantId}/actions` : 'actions';
            database.ref(`${actionPath}/${action.id}`).set(action).then(() => {
                // Refresh the sites list to update the UI
                renderSites();
            });
        }).catch(error => {
            console.error('Error archiving site:', error);
            careMarshallAlert('❌ Error archiving site. Please try again.', 'error');
        });
    }
}

function unarchiveSite(id) {
    if (!isAdmin) {
        careMarshallAlert('Only administrators can unarchive sites', 'error');
        return;
    }
    
    const site = window.sites.find(c => c.id === id);
    if (!site) {
        careMarshallAlert('Site not found', 'error');
        return;
    }
    
    if (confirm(`Unarchive "${site.name}"? This will restore it to active status and include it in hive/site counts.`)) {
        const tenantPath = currentTenantId ? `tenants/${currentTenantId}/sites` : 'sites';
        database.ref(`${tenantPath}/${id}`).update({
            archived: false,
            unarchivedDate: new Date().toISOString(),
            unarchivedBy: currentUser.username,
            lastModified: new Date().toISOString(),
            lastModifiedBy: currentUser.username
        }).then(() => {
            careMarshallAlert(`✅ "${site.name}" has been unarchived`, 'success');
            
            // Log as action
            const actionText = `Unarchived site: ${site.name}`;
            const action = {
                id: Date.now(),
                siteId: id,
                task: 'Unarchive Site',
                taskName: 'Unarchive Site',
                taskCategory: 'Management',
                date: new Date().toISOString().split('T')[0],
                loggedBy: currentUser.username,
                notes: actionText,
                createdAt: new Date().toISOString()
            };
            
            const actionPath = currentTenantId ? `tenants/${currentTenantId}/actions` : 'actions';
            database.ref(`${actionPath}/${action.id}`).set(action).then(() => {
                // Refresh the sites list to update the UI
                renderSites();
            });
        }).catch(error => {
            console.error('Error unarchiving site:', error);
            careMarshallAlert('❌ Error unarchiving site. Please try again.', 'error');
        });
    }
}

function deleteSite(id) {
    // Only admins can delete, and only from archived state
    if (!isAdmin) {
        careMarshallAlert('Only administrators can delete sites', 'error');
        return;
    }
    
    const site = window.sites.find(c => c.id === id);
    if (!site) {
        careMarshallAlert('Site not found', 'error');
        return;
    }
    
    if (!site.archived) {
        careMarshallAlert('⚠️ Sites must be archived before they can be permanently deleted.\n\nPlease archive the site first, then use the "Show Archived Sites" button to delete it.', 'warning');
        return;
    }
    
    const confirmMessage = `⚠️ PERMANENT DELETION\n\nSite: ${site.name}\n\n⚠️ WARNING: This will permanently delete:\n• The site and all its data\n• Historical harvest records for this site\n• All associated actions and history\n\n⚠️ This action CANNOT be undone!\n\nAre you absolutely sure you want to permanently delete this site?`;
    
    if (confirm(confirmMessage)) {
        // Double confirmation
        if (confirm('This is your last chance. Permanently delete this site? This action CANNOT be undone.')) {
            const tenantPath = currentTenantId ? `tenants/${currentTenantId}/sites` : 'sites';
            database.ref(`${tenantPath}/${id}`).remove().then(() => {
                careMarshallAlert(`🗑️ Site "${site.name}" has been permanently deleted`, 'success');
                // Refresh the sites list to update the UI
                renderSites();
            }).catch(error => {
                console.error('Error deleting site:', error);
                careMarshallAlert('❌ Error deleting site. Please try again.', 'error');
            });
        }
    }
}

/**
 * Open site location in maps application
 * Detects platform and opens appropriate app (Google Maps or Apple Maps)
 */
function openInMaps(siteId) {
    const site = window.sites.find(c => c.id === siteId);
    if (!site) {
        careMarshallAlert('Site not found', 'error');
        return;
    }
    
    const lat = site.latitude;
    const lon = site.longitude;
    const name = encodeURIComponent(site.name);
    
    // Detect platform
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isAndroid = /android/i.test(userAgent);
    
    let mapUrl;
    
    if (isIOS) {
        // Apple Maps URL scheme
        mapUrl = `maps://maps.apple.com/?ll=${lat},${lon}&q=${lat},${lon}&label=${name}`;
        
        // Try to open Apple Maps, fall back to web URL if it fails
        window.location.href = mapUrl;
        
        // Fallback to web-based Apple Maps
        setTimeout(() => {
            window.open(`https://maps.apple.com/?ll=${lat},${lon}&q=${lat},${lon}&label=${name}`, '_blank');
        }, 100);
    } else if (isAndroid) {
        // Google Maps URL scheme
        mapUrl = `google.navigation:q=${lat},${lon}&label=${name}`;
        
        // Try to open Google Maps app, fall back to web URL if it fails
        window.location.href = mapUrl;
        
        // Fallback to web-based Google Maps
        setTimeout(() => {
            window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}&query_place_id=${name}`, '_blank');
        }, 100);
    } else {
        // Desktop/other platforms - open Google Maps in new tab
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}&query_place_id=${name}`;
        window.open(googleMapsUrl, '_blank');
    }
    
    Logger.log(`🗺️ Opening ${site.name} in maps (${isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop'})`);
}

// Update map with new site data
function updateMapWithSites() {
    console.log('🔄 Updating map with site data...');
    if (map && window.sites && window.sites.length > 0) {
        renderSites();
    } else if (map) {
        console.log('📍 Map exists but no sites to render');
    } else {
        console.log('🗺️ Map not initialized yet');
    }
}

// Activate map when user clicks the placeholder
function activateMap() {
    console.log('🗺️ User clicked to activate map...');
    
    // Hide placeholder
    const placeholder = document.getElementById('mapPlaceholder');
    const mapElement = document.getElementById('map');
    
    if (placeholder && mapElement) {
        placeholder.style.display = 'none';
        mapElement.style.display = 'block';
        
        // Initialize map
        initMap();
        
        console.log('✅ Map activated and initialized');
    } else {
        console.error('❌ Map elements not found');
    }
}

// Enhanced map with site type colors
function initMap() {
    console.log('🗺️ Initializing map...');
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.log('❌ Map element not found');
        return;
    }
    
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.log('⏳ Leaflet not yet loaded, will retry...');
        setTimeout(initMap, 500);
        return;
    }
    
    // Always use Takaka, NZ as default center
    const center = [-40.8557, 172.8066]; // Takaka, NZ
    console.log('📍 Map center set to Takaka, NZ');
    
    // Use global map if it exists, otherwise skip (support both new and old names)
    const globalMap = window.homeCareMap || window.careMarshallMap;
    if (!globalMap) {
        console.log('🗺️ Global map not initialized, skipping site rendering');
        return;
    }
    
    // Use the global map
    map = globalMap;
    // Maintain backward compatibility
    if (!window.homeCareMap && window.careMarshallMap) {
        window.homeCareMap = window.careMarshallMap;
    }
    
    // Clear existing markers
    if (map._layers) {
        Object.values(map._layers).forEach(layer => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });
    }
    markers = [];
    
    // Only render sites if we have data
    if (!window.sites || window.sites.length === 0) {
        console.log('📍 No sites to render yet');
        return;
    }
    
    console.log(`📍 Rendering ${window.sites.length} sites on map`);
    
    // Add marker for each site with type-specific colors
    window.sites.forEach(site => {
        try {
            const classificationKey = site.functionalClassification || site.siteType || 'other';
            const typeInfo = SITE_TYPES[classificationKey] || SITE_TYPES['other'];
            
            // Create custom icon with site type color
            const customIcon = L.divIcon({
                className: 'custom-site-marker',
                html: `<div style="
                    background-color: ${typeInfo.color};
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 10px;
                "><i class="bi ${typeInfo.icon}"></i></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            
            // Get pending tasks for this site
            const siteTasks = scheduledTasks.filter(task => 
                task.siteId === site.id && !task.completed
            ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            
            const marker = L.marker([site.latitude, site.longitude], { icon: customIcon })
                .bindPopup(`
                    <div style="padding:10px; min-width:250px;">
                        <h6>
                            <a href="#" onclick="event.stopPropagation(); const mapInstance = window.homeCareMap || window.careMarshallMap; if (mapInstance) { mapInstance.closePopup(); } setTimeout(() => viewSiteDetails(${site.id}), 100); return false;" style="color: ${typeInfo.color}; text-decoration: none; font-weight: bold; cursor: pointer;">
                                <i class="bi ${typeInfo.icon}"></i> ${site.name}
                            </a>
                        </h6>
                        <p class="mb-1"><small>${site.description || 'No description'}</small></p>
                                    <p class="mb-1"><strong>Type:</strong> <span style="color: ${typeInfo.color};">${typeInfo.name}</span></p>
                                    ${site.expectedServiceHours ? `<p class="mb-1"><strong>Expected Hours:</strong> ${site.expectedServiceHours % 1 === 0 ? site.expectedServiceHours : site.expectedServiceHours.toFixed(1)}</p>` : ''}
                                    ${site.physicalAddress || site.address ? `<p class="mb-1"><strong>Address:</strong> ${site.physicalAddress || site.address}</p>` : ''}
                        <p class="mb-1"><strong>Clients:</strong> ${site.hiveCount || 0}</p>
                        ${site.landownerName ? `<p class="mb-1"><strong>Contact:</strong> ${site.landownerName}${site.landownerPhone ? ` • ${site.landownerPhone}` : ''}</p>` : ''}
                        ${site.legalCompliance?.hdsRegistrationNumber ? `<p class="mb-1"><small><strong>HDS Reg:</strong> ${site.legalCompliance.hdsRegistrationNumber}</small></p>` : ''}
                        ${site.legalCompliance?.insuranceProvider ? `<p class="mb-1"><small><strong>Insurance:</strong> ${site.legalCompliance.insuranceProvider}</small></p>` : ''}
                        ${site.legalCompliance?.privacyCompliance ? `<p class="mb-1"><small><span class="badge bg-success"><i class="bi bi-check-circle"></i> Privacy Compliant</span></small></p>` : ''}
                        ${site.legalCompliance?.healthSafetyCompliance ? `<p class="mb-1"><small><span class="badge bg-success"><i class="bi bi-check-circle"></i> H&S Compliant</span></small></p>` : ''}
                        
                        <!-- Clients at this site -->
                        ${(() => {
                            const siteClients = (window.clients || window.individualHives || []).filter(client => client.siteId === site.id);
                            if (siteClients.length > 0) {
                                const statusCounts = {
                                    independent: siteClients.filter(c => (c.status || c.hiveStrength) === 'independent' || (c.status || c.hiveStrength) === 'strong').length,
                                    assisted: siteClients.filter(c => (c.status || c.hiveStrength) === 'assisted' || (c.status || c.hiveStrength) === 'medium').length,
                                    dependent: siteClients.filter(c => (c.status || c.hiveStrength) === 'dependent' || (c.status || c.hiveStrength) === 'weak').length
                                };
                                return `<p class="mb-1"><small><strong>Client Status:</strong> Ind: ${statusCounts.independent}, Asst: ${statusCounts.assisted}, Dep: ${statusCounts.dependent}</small></p>`;
                            }
                            return '';
                        })()}
                        
                        ${siteTasks.length > 0 ? `
                            <div class="mt-3">
                                <h6 class="mb-2"><i class="bi bi-list-check"></i> Pending Tasks (${siteTasks.length})</h6>
                                <div class="pending-tasks-list" style="max-height: 150px; overflow-y: auto;">
                                    ${siteTasks.slice(0, 5).map(task => {
                                        const taskName = getTaskDisplayName(null, task.taskId);
                                        const dueDate = new Date(task.dueDate);
                                        const isOverdue = dueDate < new Date();
                                        const priorityClass = task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : 'secondary';
                                        
                                        return `
                                            <div class="pending-task-item mb-2 p-2" style="border-left: 3px solid var(--${priorityClass}); background: rgba(0,0,0,0.05); border-radius: 3px;">
                                                <div class="d-flex justify-content-between align-items-start">
                                                    <div class="flex-grow-1">
                                                        <strong style="font-size: 0.85rem;">${taskName}</strong>
                                                        <br><small class="text-muted">Due: ${dueDate.toLocaleDateString()}</small>
                                                        ${isOverdue ? '<br><span class="badge bg-danger" style="font-size: 0.7rem;">OVERDUE</span>' : ''}
                                                        ${task.priority !== 'normal' ? `<br><span class="badge bg-${priorityClass}" style="font-size: 0.7rem;">${task.priority.toUpperCase()}</span>` : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                    ${siteTasks.length > 5 ? `<small class="text-muted">... and ${siteTasks.length - 5} more tasks</small>` : ''}
                                </div>
                            </div>
                        ` : `
                            <div class="mt-3">
                                <p class="text-muted mb-0"><i class="bi bi-check-circle"></i> No pending tasks</p>
                            </div>
                        `}
                        
                        <div class="mt-3 d-grid gap-1">
                            <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); const mapInstance = window.homeCareMap || window.careMarshallMap; if (mapInstance) { mapInstance.closePopup(); } scrollToSiteCard(${site.id}); return false;">
                                <i class="bi bi-eye"></i> View Details
                            </button>
                            <button class="btn btn-sm btn-outline-primary" onclick="openInMaps(${site.id}); return false;">
                                <i class="bi bi-geo-alt-fill"></i> View on Maps
                            </button>
                            <button class="btn btn-sm btn-success" onclick="scheduleTaskForSite(${site.id}); return false;">
                                <i class="bi bi-calendar-plus"></i> Schedule Task
                            </button>
                            ${isAdmin ? `<button class="btn btn-sm btn-outline-warning" onclick="editSite(${site.id}); return false;">
                                <i class="bi bi-pencil"></i> Edit Site
                            </button>` : ''}
                            ${siteTasks.length > 0 ? `
                                <button class="btn btn-sm btn-outline-info" onclick="showScheduledTasks(); return false;">
                                    <i class="bi bi-list-check"></i> View All Tasks
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `, {
                    maxWidth: 300,
                    className: 'site-popup'
                })
                .on('popupopen', function() {
                    // Ensure popup events work correctly
                    const popup = this.getPopup();
                    const popupElement = popup.getElement();
                    if (popupElement) {
                        popupElement.style.zIndex = '1000';
                    }
                })
                .addTo(map);
            
            markers.push(marker);
        } catch (error) {
            console.error('Error adding marker for site:', site.name, error);
        }
    });
    
    // Fit bounds to show all markers
    if (window.sites.length > 1 && markers.length > 0) {
        try {
            const group = new L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.1));
        } catch (error) {
            console.error('Error fitting bounds:', error);
        }
    }
}

/**
 * Complete a task from the site tasks modal
 * Available to all users (employees and admins)
 */
function completeTaskFromSite(taskId, siteId) {
    const task = (window.scheduledTasks || []).find(t => t.id === taskId);
    if (!task) {
        careMarshallAlert('Task not found', 'error');
        return;
    }
    
    const taskName = typeof getTaskDisplayName === 'function' ? getTaskDisplayName(null, task.taskId) : (task.taskName || 'Unknown Task');
    const site = window.sites.find(s => s.id === siteId);
    const siteName = site ? site.name : 'Unknown Site';
    
    // Confirm completion
    if (confirm(`Mark task as complete?\n\nTask: ${taskName}\nSite: ${siteName}\nDue: ${new Date(task.dueDate).toLocaleDateString()}`)) {
        // Use tenant-specific path for data isolation
        const tenantPath = currentTenantId ? `tenants/${currentTenantId}/scheduledTasks` : 'scheduledTasks';
        const actionsPath = currentTenantId ? `tenants/${currentTenantId}/actions` : 'actions';
        
        // Find the task name from the comprehensive tasks list
        const taskObj = (window.COMPREHENSIVE_TASKS || []).find(t => t.id === task.taskId);
        const fullTaskName = taskObj ? taskObj.name : taskName;
        const taskCategory = taskObj ? taskObj.category : 'Task';
        
        // Create an action record for the completed task
        const action = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            siteId: task.siteId,
            individualHiveId: task.individualHiveId || null,
            taskId: task.taskId,
            taskName: fullTaskName,
            taskCategory: taskCategory,
            date: new Date().toISOString().split('T')[0],
            notes: task.notes || '',
            flag: '',
            loggedBy: currentUser ? currentUser.username : 'Unknown',
            createdAt: new Date().toISOString(),
            fromScheduledTask: true,
            originalScheduledTaskId: taskId
        };
        
        const updates = {
            completed: true,
            completedAt: new Date().toISOString(),
            completedBy: currentUser ? currentUser.username : 'Unknown'
        };
        
        // Show sync status
        if (window.syncStatusManager) {
            window.syncStatusManager.updateSyncStatus('syncing', 'Completing task...');
        }
        
        if (navigator.onLine && window.database) {
            // Save the action first, then mark task as completed
            database.ref(`${actionsPath}/${action.id}`).set(action)
                .then(() => database.ref(`${tenantPath}/${taskId}`).update(updates))
                .then(() => {
                    if (window.syncStatusManager) {
                        window.syncStatusManager.updateSyncStatus('synced');
                    }
                    careMarshallAlert(`✅ Task completed successfully!\n\nTask: ${fullTaskName}\nCompleted by: ${currentUser ? currentUser.username : 'Unknown'}`, 'success');
                    // Refresh the task modal
                    showSiteTasks(siteId);
                    // Refresh scheduled tasks if function exists
                    if (typeof renderScheduledTasks === 'function') {
                        renderScheduledTasks();
                    }
                    // Refresh dashboard if function exists
                    if (typeof updateDashboard === 'function') {
                        updateDashboard();
                    }
                })
                .catch(error => {
                    console.error('Error completing task:', error);
                    if (window.syncStatusManager) {
                        window.syncStatusManager.updateSyncStatus('error', 'Error completing task');
                    }
                    careMarshallAlert('Error completing task. Please try again.', 'error');
                });
        } else {
            // Offline - queue changes
            if (window.syncStatusManager) {
                window.syncStatusManager.addPendingChange({
                    type: 'action_log',
                    path: `${actionsPath}/${action.id}`,
                    data: action,
                    method: 'set'
                });
                window.syncStatusManager.addPendingChange({
                    type: 'task_complete',
                    path: `${tenantPath}/${taskId}`,
                    data: updates,
                    method: 'update'
                });
                window.syncStatusManager.updateSyncStatus('offline', 'Saved locally, will sync later');
            }
            careMarshallAlert('⚠️ Task completion saved locally. Will sync when connection is restored.', 'warning');
            // Refresh the task modal
            showSiteTasks(siteId);
        }
    }
}

// Make functions globally available
window.initMap = initMap;
window.showContactDetails = showContactDetails;
window.showSiteClients = showSiteClients;
window.showSiteTasks = showSiteTasks;
window.completeTaskFromSite = completeTaskFromSite;

// GPS Location
function getCurrentLocation() {
    if (!navigator.geolocation) {
        alert('GPS not supported by your browser');
        return;
    }
    
    showSyncStatus('<i class="bi bi-crosshair"></i> Getting GPS...', 'syncing');
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude.toFixed(6);
            const lng = position.coords.longitude.toFixed(6);
            
            document.getElementById('siteLat').value = lat;
            document.getElementById('siteLng').value = lng;
            
            // Trigger validation to show success state
            validateCoordinates();
            
            showSyncStatus('<i class="bi bi-check"></i> Location captured!', 'success');
        },
        (error) => {
            showSyncStatus('<i class="bi bi-x"></i> GPS error', 'error');
            careMarshallAlert('Could not get location: ' + error.message, 'error');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

// Map Picker with OpenStreetMap
function showMapPicker() {
    const container = document.getElementById('mapPickerContainer');
    
    if (typeof L === 'undefined') {
        alert('OpenStreetMap is still loading. Please wait a moment and try again.');
        return;
    }
    
    container.classList.toggle('hidden');
    
    if (!container.classList.contains('hidden')) {
        setTimeout(() => {
            const lat = parseFloat(document.getElementById('siteLat').value) || -40.8557; // Takaka, NZ
            const lng = parseFloat(document.getElementById('siteLng').value) || 172.8066; // Takaka, NZ
            
            // Clear existing map if any
            if (mapPicker) {
                mapPicker.remove();
            }
            
            mapPicker = L.map('mapPicker').setView([lat, lng], 13);
            
            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(mapPicker);
            
            let pickerMarker = L.marker([lat, lng], { draggable: true })
                .addTo(mapPicker);
            
            // Click map to move marker
            mapPicker.on('click', (e) => {
                pickerMarker.setLatLng(e.latlng);
                document.getElementById('siteLat').value = e.latlng.lat.toFixed(6);
                document.getElementById('siteLng').value = e.latlng.lng.toFixed(6);
                // Trigger validation to show success state
                validateCoordinates();
            });
            
            // Drag marker
            pickerMarker.on('dragend', (e) => {
                const latlng = e.target.getLatLng();
                document.getElementById('siteLat').value = latlng.lat.toFixed(6);
                document.getElementById('siteLng').value = latlng.lng.toFixed(6);
                // Trigger validation to show success state
                validateCoordinates();
            });
        }, 200);
    }
}

// Visual Hive Box Grid for Site Reporting
let visualHiveData = null; // Track changes in visual grid

function renderVisualHiveGrid() {
    const container = document.getElementById('visualHiveGrid');
    if (!container) return;
    
    const siteId = document.getElementById('siteId')?.value;
    if (!siteId) {
        container.innerHTML = '<p class="text-muted">Please select a site first to render the grid.</p>';
        return;
    }
    
    const site = window.sites.find(c => c.id === parseInt(siteId));
    if (!site) {
        container.innerHTML = '<p class="text-muted">Site not found.</p>';
        return;
    }
    
    // Initialize visual hive data if not exists
    if (!visualHiveData) {
        visualHiveData = {
            doubles: site.hiveStacks?.doubles || 0,
            topSplits: site.hiveStacks?.topSplits || 0,
            singles: site.hiveStacks?.singles || 0,
            nucs: site.hiveStacks?.nucs || 0,
            empty: site.hiveStacks?.empty || 0
        };
    }
    
    const totalHives = visualHiveData.doubles + visualHiveData.topSplits + visualHiveData.singles + visualHiveData.nucs;
    
    let html = `
        <style>
            .hive-box {
                cursor: pointer;
                transition: all 0.3s ease;
                border: 3px solid;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                position: relative;
                overflow: hidden;
            }
            .hive-box::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
                pointer-events: none;
            }
            .hive-box:hover {
                transform: translateY(-5px) scale(1.05);
                box-shadow: 0 8px 20px rgba(0,0,0,0.2);
            }
            .hive-box:active {
                transform: translateY(-2px) scale(1.02);
            }
            .hive-box i {
                font-size: 2.5rem;
                margin-bottom: 0.5rem;
                display: block;
            }
            .hive-count-display {
                font-size: 3rem;
                font-weight: 700;
                line-height: 1;
                margin: 0.5rem 0;
            }
            .hive-label-text {
                font-size: 0.9rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
        </style>
        
        <div class="row g-3 mb-4">
            <div class="col-6 col-md-4 col-lg-2-4">
                <div class="hive-box" style="border-color: #0d6efd; background: linear-gradient(135deg, #cfe2ff 0%, #b6d4fe 100%);" onclick="toggleHiveBox('doubles')" title="Click to update Double Stacks">
                    <div class="card-body text-center p-4">
                        <i class="bi bi-stack text-primary"></i>
                        <div id="doublesCount" class="hive-count-display text-primary">${visualHiveData.doubles}</div>
                        <div class="hive-label-text text-primary">Double Stacks</div>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-4 col-lg-2-4">
                <div class="hive-box" style="border-color: #198754; background: linear-gradient(135deg, #d1e7dd 0%, #badbcc 100%);" onclick="toggleHiveBox('topSplits')" title="Click to update Top-Splits">
                    <div class="card-body text-center p-4">
                        <i class="bi bi-layers-half text-success"></i>
                        <div id="topSplitsCount" class="hive-count-display text-success">${visualHiveData.topSplits}</div>
                        <div class="hive-label-text text-success">Top-Splits</div>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-4 col-lg-2-4">
                <div class="hive-box" style="border-color: #ffc107; background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);" onclick="toggleHiveBox('singles')" title="Click to update Single Stacks">
                    <div class="card-body text-center p-4">
                        <i class="bi bi-square text-warning"></i>
                        <div id="singlesCount" class="hive-count-display text-warning">${visualHiveData.singles}</div>
                        <div class="hive-label-text text-warning">Single Stacks</div>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-4 col-lg-2-4">
                <div class="hive-box" style="border-color: #0dcaf0; background: linear-gradient(135deg, #cff4fc 0%, #b6effb 100%);" onclick="toggleHiveBox('nucs')" title="Click to update NUC Stacks">
                    <div class="card-body text-center p-4">
                        <i class="bi bi-circle text-info"></i>
                        <div id="nucsCount" class="hive-count-display text-info">${visualHiveData.nucs}</div>
                        <div class="hive-label-text text-info">NUC Stacks</div>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-4 col-lg-2-4">
                <div class="hive-box" style="border-color: #6c757d; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);" onclick="toggleHiveBox('empty')" title="Click to update Empty Platforms">
                    <div class="card-body text-center p-4">
                        <i class="bi bi-square text-secondary"></i>
                        <div id="emptyCount" class="hive-count-display text-secondary">${visualHiveData.empty}</div>
                        <div class="hive-label-text text-secondary">Empty Platforms</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-12">
                <div class="alert alert-success d-flex align-items-center justify-content-between">
                    <div>
                        <i class="bi bi-house-heart-fill me-2"></i>
                        <strong>Total Active Clients:</strong> <span id="totalActiveHives" class="badge bg-success ms-2" style="font-size: 1.2rem;">${totalHives}</span>
                    </div>
                    <small class="text-muted">Click any box above to update counts</small>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

function toggleHiveBox(type) {
    if (!visualHiveData) return;
    
    // Show modal to increment or decrement
    const modalHtml = `
        <div class="modal fade" id="hiveBoxModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Update ${type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="input-group mb-3">
                            <button class="btn btn-outline-danger" onclick="adjustHiveCount('${type}', -1)">
                                <i class="bi bi-dash"></i>
                            </button>
                            <input type="number" class="form-control text-center" id="hiveCountInput" value="${visualHiveData[type]}" min="0">
                            <button class="btn btn-outline-success" onclick="adjustHiveCount('${type}', 1)">
                                <i class="bi bi-plus"></i>
                            </button>
                        </div>
                        <div class="d-grid">
                            <button class="btn btn-primary" onclick="updateHiveCount('${type}')">
                                Update Count
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal
    const existingModal = document.getElementById('hiveBoxModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('hiveBoxModal'));
    modal.show();
    
    // Clean up on close
    document.getElementById('hiveBoxModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function adjustHiveCount(type, delta) {
    const input = document.getElementById('hiveCountInput');
    const newValue = Math.max(0, parseInt(input.value) + delta);
    input.value = newValue;
}

function updateHiveCount(type) {
    const input = document.getElementById('hiveCountInput');
    const newValue = parseInt(input.value) || 0;
    const oldValue = visualHiveData[type];
    
    // Update visual data
    visualHiveData[type] = newValue;
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('hiveBoxModal'));
    if (modal) modal.hide();
    
    // Re-render grid
    renderVisualHiveGrid();
    
    // Form inputs no longer exist - visual grid replaces them
    // updateStackTotals(); // Removed - no longer needed with visual hive grid
    
    // Auto-save to Firebase and log as action
    const siteId = document.getElementById('siteId')?.value;
    if (siteId && oldValue !== newValue) {
        const site = window.sites.find(c => c.id === parseInt(siteId));
        if (site) {
            // Update site data
            if (!site.hiveStacks) site.hiveStacks = {};
            site.hiveStacks[type] = newValue;
            site.hiveCount = visualHiveData.doubles + visualHiveData.topSplits + visualHiveData.singles + visualHiveData.nucs;
            
            // Save to Firebase with sync status
            const tenantPath = currentTenantId ? `tenants/${currentTenantId}/sites` : 'sites';
            const updateData = {
                hiveStacks: site.hiveStacks,
                hiveCount: site.hiveCount,
                lastModified: new Date().toISOString(),
                lastModifiedBy: currentUser.username
            };
            
            if (navigator.onLine && window.database) {
                database.ref(`${tenantPath}/${site.id}`).update(updateData).then(() => {
                    // Log as action
                    const typeLabel = type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    const actionText = `Hive inventory updated at ${site.name}: ${typeLabel} changed from ${oldValue} to ${newValue}`;
                    logSiteVisitAction(site.id, actionText);
                    
                    console.log('✅ Hive inventory auto-saved:', typeLabel, oldValue, '→', newValue);
                }).catch(error => {
                    console.error('Error auto-saving hive changes:', error);
                    // Add to pending changes
                    if (window.syncStatusManager) {
                        window.syncStatusManager.addPendingChange({
                            type: 'hive_update',
                            path: `${tenantPath}/${site.id}`,
                            data: updateData,
                            method: 'update'
                        });
                    }
                });
            } else {
                // Offline - add to pending changes
                if (window.syncStatusManager) {
                    window.syncStatusManager.addPendingChange({
                        type: 'hive_update',
                        path: `${tenantPath}/${site.id}`,
                        data: updateData,
                        method: 'update'
                    });
                }
            }
        }
    }
}

function saveVisualHiveChanges() {
    const siteId = document.getElementById('siteId')?.value;
    if (!siteId) {
        careMarshallAlert('No site selected', 'warning');
        return;
    }
    
    const site = window.sites.find(c => c.id === parseInt(siteId));
    if (!site) {
        careMarshallAlert('Site not found', 'error');
        return;
    }
    
    // Detect changes
    const oldValues = {
        doubles: site.hiveStacks?.doubles || 0,
        topSplits: site.hiveStacks?.topSplits || 0,
        singles: site.hiveStacks?.singles || 0,
        nucs: site.hiveStacks?.nucs || 0,
        empty: site.hiveStacks?.empty || 0
    };
    
    const changes = [];
    if (oldValues.doubles !== visualHiveData.doubles) {
        changes.push(`Doubles: ${oldValues.doubles} → ${visualHiveData.doubles}`);
    }
    if (oldValues.topSplits !== visualHiveData.topSplits) {
        changes.push(`Top-Splits: ${oldValues.topSplits} → ${visualHiveData.topSplits}`);
    }
    if (oldValues.singles !== visualHiveData.singles) {
        changes.push(`Singles: ${oldValues.singles} → ${visualHiveData.singles}`);
    }
    if (oldValues.nucs !== visualHiveData.nucs) {
        changes.push(`NUCs: ${oldValues.nucs} → ${visualHiveData.nucs}`);
    }
    if (oldValues.empty !== visualHiveData.empty) {
        changes.push(`Empty: ${oldValues.empty} → ${visualHiveData.empty}`);
    }
    
    if (changes.length === 0) {
        careMarshallAlert('No changes detected', 'info');
        return;
    }
    
    // Update site data
    site.hiveStacks = {
        doubles: visualHiveData.doubles,
        topSplits: visualHiveData.topSplits,
        singles: visualHiveData.singles,
        nucs: visualHiveData.nucs,
        empty: visualHiveData.empty
    };
    
    site.hiveCount = visualHiveData.doubles + visualHiveData.topSplits + visualHiveData.singles + visualHiveData.nucs;
    
    // Save to Firebase
    const siteRef = database.ref(`sites/${site.id}`);
    siteRef.update({
        hiveStacks: site.hiveStacks,
        hiveCount: site.hiveCount,
        lastModified: new Date().toISOString(),
        lastModifiedBy: currentUser.username
    }).then(() => {
        // Log as action
        const actionText = `Site visit and inventory update at ${site.name}. Changes: ${changes.join('; ')}`;
        logSiteVisitAction(site.id, actionText);
        
        careMarshallAlert('✅ Site inventory updated and logged as action!', 'success');
    }).catch(error => {
        console.error('Error saving visual hive changes:', error);
        careMarshallAlert('❌ Error saving changes', 'error');
    });
}

function logSiteVisitAction(siteId, notes) {
    const newAction = {
        id: Date.now(),
        siteId: parseInt(siteId),
        task: 'Site Visit & Inventory',
        taskName: 'Site Visit & Inventory',
        taskId: 'site_visit_inventory',
        taskCategory: 'Management',
        notes: notes,
        loggedBy: currentUser.username,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
    };
    
    actions.push(newAction);
    
    // Save to Firebase with tenant isolation
    const tenantPath = currentTenantId ? `tenants/${currentTenantId}/actions` : 'actions';
    database.ref(`${tenantPath}/${newAction.id}`).set(newAction);
}

// Edit hive state count (clickable numbers in Hive State card)
function editHiveStateCount(state) {
    const siteId = document.getElementById('siteId')?.value;
    if (!siteId) {
        careMarshallAlert('No site selected', 'warning');
        return;
    }
    
    // Get the site
    const site = window.sites.find(c => c.id === parseInt(siteId));
    if (!site) {
        careMarshallAlert('Site not found', 'error');
        return;
    }
    
    // Calculate current total from Hive Box totals (exclude Dead)
    const currentHiveBoxTotal = (visualHiveData ? 
        (visualHiveData.doubles + visualHiveData.topSplits + visualHiveData.singles + visualHiveData.nucs) :
        (site.hiveStacks?.doubles || 0) + (site.hiveStacks?.topSplits || 0) + 
        (site.hiveStacks?.singles || 0) + (site.hiveStacks?.nucs || 0)
    );
    
    // Get current hive state values
    const currentStrong = parseInt(document.getElementById('hiveStateStrong')?.textContent) || 0;
    const currentMedium = parseInt(document.getElementById('hiveStateMedium')?.textContent) || 0;
    const currentWeak = parseInt(document.getElementById('hiveStateWeak')?.textContent) || 0;
    const currentNUC = parseInt(document.getElementById('hiveStateNUC')?.textContent) || 0;
    
    // Calculate current state total (excluding Dead)
    const currentStateTotal = currentStrong + currentMedium + currentWeak + currentNUC;
    
    // Show total information
    const totalInfo = `Current Hive Box Total: ${currentHiveBoxTotal}\nCurrent State Total (Excluding Dead): ${currentStateTotal}`;
    
    // Get current value for this state
    const idMap = {
        'Strong': 'hiveStateStrong',
        'Medium': 'hiveStateMedium',
        'Weak': 'hiveStateWeak',
        'NUC': 'hiveStateNUC',
        'Dead': 'hiveStateDead'
    };
    
    const elementId = idMap[state];
    const currentElement = document.getElementById(elementId);
    const currentValue = parseInt(currentElement.textContent) || 0;
    
    // Prompt for new value
    const newValueStr = prompt(`${totalInfo}\n\nEnter new count for ${state} hives:`, currentValue);
    if (newValueStr === null) return; // User cancelled
    
    const newValue = parseInt(newValueStr) || 0;
    
    // If not updating Dead, validate that state total matches hive box total
    if (state !== 'Dead') {
        const otherStateTotal = (state === 'Strong' ? 0 : currentStrong) +
                               (state === 'Medium' ? 0 : currentMedium) +
                               (state === 'Weak' ? 0 : currentWeak) +
                               (state === 'NUC' ? 0 : currentNUC);
        
        const newStateTotal = otherStateTotal + newValue;
        
        if (newStateTotal !== currentHiveBoxTotal) {
            careMarshallAlert(`⚠️ Warning: State total (${newStateTotal}) does not match Hive Box total (${currentHiveBoxTotal})\n\nPlease adjust other state counts or update the Hive Box totals first.`, 'warning');
            return;
        }
    }
    
    // Update the visual element
    currentElement.textContent = newValue;
    
    // Update hive strength data
    if (!site.hiveStrength) site.hiveStrength = {};
    site.hiveStrength[state.toLowerCase()] = newValue;
    
    // Save to Firebase
    const tenantPath = currentTenantId ? `tenants/${currentTenantId}/sites` : 'sites';
    database.ref(`${tenantPath}/${site.id}`).update({
        hiveStrength: site.hiveStrength,
        lastModified: new Date().toISOString(),
        lastModifiedBy: currentUser.username
    }).then(() => {
        // Log as action (save to Firebase, not just push to array)
        const actionText = `Updated ${state} hives at ${site.name}: ${currentValue} → ${newValue}`;
        const newAction = {
            id: Date.now(),
            siteId: parseInt(siteId),
            task: 'Hive State Update',
            taskName: 'Hive State Update',
            taskId: 'hive_state_update',
            taskCategory: 'Management',
            notes: actionText,
            loggedBy: currentUser.username,
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        };
        
        actions.push(newAction);
        
        const actionPath = currentTenantId ? `tenants/${currentTenantId}/actions` : 'actions';
        return database.ref(`${actionPath}/${newAction.id}`).set(newAction);
    }).then(() => {
        console.log(`✅ ${state} hive count updated: ${currentValue} → ${newValue}`);
        careMarshallAlert(`✅ ${state} hive count updated: ${currentValue} → ${newValue}`, 'success');
        
        // Trigger recalculation of totals
        if (typeof updateHiveStrengthTotals === 'function') {
            updateHiveStrengthTotals();
        }
    }).catch(error => {
        console.error('Error updating hive state:', error);
        careMarshallAlert(`❌ Error updating ${state} hive count: ${error.message}`, 'error');
    });
}

/**
 * Toggle between showing active and archived sites
 */
function toggleArchivedSites() {
    showArchivedSites = !showArchivedSites;
    renderSites();
}

/**
 * Update the archived button text based on current state
 */
function updateArchivedButtonText() {
    const button = document.getElementById('toggleArchivedButton');
    if (!button) return;
    
    const archivedCount = window.sites.filter(c => c.archived === true).length;
    const activeCount = window.sites.filter(c => !c.archived).length;
    
    if (showArchivedSites) {
        button.innerHTML = '<i class="bi bi-arrow-left"></i> Show Active Sites';
        button.classList.remove('btn-outline-secondary');
        button.classList.add('btn-outline-primary');
    } else {
        button.innerHTML = `<i class="bi bi-archive"></i> Show Archived Sites${archivedCount > 0 ? ` (${archivedCount})` : ''}`;
        button.classList.remove('btn-outline-primary');
        button.classList.add('btn-outline-secondary');
    }
}

/**
 * Quick edit hive strength from summary card
 * Opens a prompt for entering new count and updates Firebase
 */
function quickEditHiveStrength(siteId, state, currentValue) {
    const site = window.sites.find(c => c.id === siteId);
    if (!site) {
        careMarshallAlert('Site not found', 'error');
        return;
    }
    
    // Prompt for new value
    const newValueStr = prompt(`Update ${state} hives for ${site.name}:\n\nCurrent: ${currentValue}\n\nEnter new count:`, currentValue);
    if (newValueStr === null) return; // User cancelled
    
    const newValue = parseInt(newValueStr) || 0;
    
    if (newValue < 0) {
        careMarshallAlert('Count cannot be negative. Use 0 for empty or waiting sites.', 'warning');
        return;
    }
    
    // Update site data
    if (!site.hiveStrength) site.hiveStrength = {};
    site.hiveStrength[state.toLowerCase()] = newValue;
    
    // Prepare references and payloads
    const tenantPath = currentTenantId ? `tenants/${currentTenantId}/sites` : 'sites';
    const updateData = {
        hiveStrength: site.hiveStrength,
        lastModified: new Date().toISOString(),
        lastModifiedBy: currentUser.username
    };
    const elementId = state === 'NUC' ? `hiveNUC_${siteId}` : `hive${state}_${siteId}`;
    const element = document.getElementById(elementId);
    const actionText = `Updated ${state} hives at ${site.name}: ${currentValue} → ${newValue}`;
    const newAction = {
        id: Date.now(),
        siteId: siteId,
        task: 'Hive State Update',
        taskName: 'Hive State Update',
        taskId: 'hive_state_update',
        taskCategory: 'Management',
        notes: actionText,
        loggedBy: currentUser.username,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
    };
    const actionPath = currentTenantId ? `tenants/${currentTenantId}/actions` : 'actions';

    // Show sync status
    if (window.syncStatusManager) {
        window.syncStatusManager.updateSyncStatus('syncing', 'Saving hive update...');
    }

    if (navigator.onLine && window.database) {
        database.ref(`${tenantPath}/${siteId}`).update(updateData)
            .then(() => database.ref(`${actionPath}/${newAction.id}`).set(newAction))
            .then(() => {
                if (element) element.textContent = newValue;
                actions.push(newAction);
                if (window.syncStatusManager) {
                    window.syncStatusManager.updateSyncStatus('synced');
                }
                careMarshallAlert(`✅ ${state} hive count updated: ${currentValue} → ${newValue}`, 'success');
            })
            .catch(error => {
                console.error('Error updating hive strength (online path):', error);
                // Queue for later sync
                if (window.syncStatusManager) {
                    window.syncStatusManager.addPendingChange({
                        type: 'hive_update',
                        path: `${tenantPath}/${siteId}`,
                        data: updateData,
                        method: 'update'
                    });
                    window.syncStatusManager.addPendingChange({
                        type: 'action_log',
                        path: `${actionPath}/${newAction.id}`,
                        data: newAction,
                        method: 'set'
                    });
                    window.syncStatusManager.updateSyncStatus('offline', 'Saved locally, will sync later');
                }
                if (element) element.textContent = newValue;
                actions.push(newAction);
                careMarshallAlert('⚠️ Saved locally. Will sync when connection is restored.', 'warning');
            });
    } else {
        // Offline: queue changes and update UI immediately
        if (window.syncStatusManager) {
            window.syncStatusManager.addPendingChange({
                type: 'hive_update',
                path: `${tenantPath}/${siteId}`,
                data: updateData,
                method: 'update'
            });
            window.syncStatusManager.addPendingChange({
                type: 'action_log',
                path: `${actionPath}/${newAction.id}`,
                data: newAction,
                method: 'set'
            });
            window.syncStatusManager.updateSyncStatus('offline', 'Saved locally, will sync later');
        }
        if (element) element.textContent = newValue;
        actions.push(newAction);
        careMarshallAlert('⚠️ Saved locally. Will sync when connection is restored.', 'warning');
    }
}

/**
 * Quick edit hive box count from summary card
 * Opens a prompt for entering new count and updates Firebase
 */
// Update site visit date (called from clickable badge)
function updateSiteVisitDate(siteId) {
    const site = window.sites.find(s => s.id === siteId);
    if (!site) {
        careMarshallAlert('Site not found', 'error');
        return;
    }
    
    // Set current visit date in input if it exists
    const visitDateInput = document.getElementById('visitDateInput');
    const clearCheckbox = document.getElementById('clearVisitDate');
    
    if (site.lastVisitDate) {
        const date = new Date(site.lastVisitDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        visitDateInput.value = `${year}-${month}-${day}`;
        clearCheckbox.checked = false;
    } else {
        // Default to today
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        visitDateInput.value = `${year}-${month}-${day}`;
        clearCheckbox.checked = false;
    }
    
    // Store site ID for save function
    visitDateInput.dataset.siteId = siteId;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('updateVisitDateModal'));
    modal.show();
}

/**
 * Helper function to log an action to Firebase
 * @param {Object} actionData - Action data object
 */
function logAction(actionData) {
    const action = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        siteId: actionData.siteId || null,
        individualHiveId: actionData.individualHiveId || null,
        taskId: actionData.taskId || null,
        taskName: actionData.taskName || 'Action',
        taskCategory: actionData.taskCategory || 'General',
        date: actionData.date || new Date().toISOString().split('T')[0],
        notes: actionData.notes || '',
        flag: actionData.flag || '',
        loggedBy: currentUser ? currentUser.username : 'Unknown',
        createdAt: new Date().toISOString(),
        ...(actionData.extraFields || {})
    };
    
    const actionsPath = currentTenantId ? `tenants/${currentTenantId}/actions` : 'actions';
    
    if (navigator.onLine && window.database) {
        return database.ref(`${actionsPath}/${action.id}`).set(action)
            .catch(error => {
                console.error('Error logging action:', error);
                // Queue for later sync
                if (window.syncStatusManager) {
                    window.syncStatusManager.addPendingChange({
                        type: 'action_log',
                        path: `${actionsPath}/${action.id}`,
                        data: action,
                        method: 'set'
                    });
                }
                return Promise.reject(error);
            });
    } else {
        // Offline - queue for later sync
        if (window.syncStatusManager) {
            window.syncStatusManager.addPendingChange({
                type: 'action_log',
                path: `${actionsPath}/${action.id}`,
                data: action,
                method: 'set'
            });
        }
        return Promise.resolve();
    }
}

// Save site visit date
function saveSiteVisitDate() {
    const visitDateInput = document.getElementById('visitDateInput');
    const clearCheckbox = document.getElementById('clearVisitDate');
    const siteId = parseInt(visitDateInput.dataset.siteId);
    
    if (!siteId) {
        careMarshallAlert('Site ID not found', 'error');
        return;
    }
    
    const site = window.sites.find(s => s.id === siteId);
    if (!site) {
        careMarshallAlert('Site not found', 'error');
        return;
    }
    
    let updateData = {
        lastModifiedBy: currentUser.username,
        lastModifiedAt: new Date().toISOString()
    };
    
    const previousVisitDate = site.lastVisitDate;
    let actionNotes = '';
    
    if (clearCheckbox.checked) {
        // Clear visit date
        updateData.lastVisitDate = null;
        actionNotes = 'Visit date cleared';
    } else {
        // Set visit date
        const dateValue = visitDateInput.value;
        if (!dateValue) {
            careMarshallAlert('Please select a date', 'warning');
            return;
        }
        
        // Store as ISO string (date only, no time)
        const date = new Date(dateValue);
        date.setHours(0, 0, 0, 0);
        updateData.lastVisitDate = date.toISOString();
        actionNotes = `Visit date set to ${date.toLocaleDateString()}`;
    }
    
    // Show sync status
    if (window.syncStatusManager) {
        window.syncStatusManager.updateSyncStatus('syncing', 'Updating visit date...');
    }
    
    // Update in Firebase
    const tenantPath = currentTenantId ? `tenants/${currentTenantId}/sites` : 'sites';
    
    if (navigator.onLine && window.database) {
        database.ref(`${tenantPath}/${siteId}`).update(updateData)
            .then(() => {
                // Update local site object
                if (updateData.lastVisitDate) {
                    site.lastVisitDate = updateData.lastVisitDate;
                } else {
                    delete site.lastVisitDate;
                }
                site.lastModifiedBy = updateData.lastModifiedBy;
                site.lastModifiedAt = updateData.lastModifiedAt;
                
                // Log action for visit date update
                logAction({
                    siteId: siteId,
                    taskName: 'Site Visit Recorded',
                    taskCategory: 'Site Management',
                    date: updateData.lastVisitDate ? new Date(updateData.lastVisitDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    notes: actionNotes + (previousVisitDate ? ` (Previous: ${new Date(previousVisitDate).toLocaleDateString()})` : '')
                }).catch(error => {
                    console.error('Error logging visit date action:', error);
                    // Don't fail the whole operation if action logging fails
                });
                
                // Re-render sites to show updated badge
                if (typeof renderSites === 'function') {
                    renderSites();
                }
                
                if (window.syncStatusManager) {
                    window.syncStatusManager.updateSyncStatus('synced');
                }
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('updateVisitDateModal'));
                if (modal) {
                    modal.hide();
                }
                
                careMarshallAlert(`✅ Visit date ${clearCheckbox.checked ? 'cleared' : 'updated'} successfully`, 'success');
            })
            .catch(error => {
                console.error('Error updating visit date:', error);
                if (window.syncStatusManager) {
                    window.syncStatusManager.updateSyncStatus('error', 'Failed to update visit date');
                }
                careMarshallAlert(`❌ Error updating visit date: ${error.message}`, 'error');
            });
    } else {
        // Offline - add to pending changes
        if (window.syncStatusManager) {
            window.syncStatusManager.addPendingChange({
                type: 'site_update',
                path: `${tenantPath}/${siteId}`,
                data: updateData,
                method: 'update'
            });
        }
        
        // Update local site object
        if (updateData.lastVisitDate) {
            site.lastVisitDate = updateData.lastVisitDate;
        } else {
            delete site.lastVisitDate;
        }
        site.lastModifiedBy = updateData.lastModifiedBy;
        site.lastModifiedAt = updateData.lastModifiedAt;
        
        // Re-render sites
        if (typeof renderSites === 'function') {
            renderSites();
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('updateVisitDateModal'));
        if (modal) {
            modal.hide();
        }
        
        careMarshallAlert('⚠️ Visit date saved locally. Will sync when connection is restored.', 'warning');
    }
}

// Make functions globally accessible
window.updateSiteVisitDate = updateSiteVisitDate;
window.saveSiteVisitDate = saveSiteVisitDate;

function quickEditHiveBox(siteId, boxType, currentValue) {
    const site = window.sites.find(c => c.id === siteId);
    if (!site) {
        careMarshallAlert('Site not found', 'error');
        return;
    }
    
    // Format the box type for display
    const boxTypeLabel = boxType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    
    // Prompt for new value
    const newValueStr = prompt(`Update ${boxTypeLabel} for ${site.name}:\n\nCurrent: ${currentValue}\n\nEnter new count:`, currentValue);
    if (newValueStr === null) return; // User cancelled
    
    const newValue = parseInt(newValueStr) || 0;
    
    if (newValue < 0) {
        careMarshallAlert('Count cannot be negative. Use 0 for empty or waiting sites.', 'warning');
        return;
    }
    
    // Update site data
    if (!site.hiveStacks) site.hiveStacks = {};
    site.hiveStacks[boxType] = newValue;
    
    // Recalculate total hive count (excluding empty)
    site.hiveCount = (site.hiveStacks.doubles || 0) + 
                       (site.hiveStacks.topSplits || 0) + 
                       (site.hiveStacks.singles || 0) + 
                       (site.hiveStacks.nucs || 0);
    
    // Prepare references and payloads
    const tenantPath = currentTenantId ? `tenants/${currentTenantId}/sites` : 'sites';
    const updateData = {
        hiveStacks: site.hiveStacks,
        hiveCount: site.hiveCount,
        lastModified: new Date().toISOString(),
        lastModifiedBy: currentUser.username
    };
    const elementId = `box${boxType.charAt(0).toUpperCase() + boxType.slice(1)}_${siteId}`;
    const element = document.getElementById(elementId);
    const actionText = `Updated ${boxTypeLabel} at ${site.name}: ${currentValue} → ${newValue}`;
    const newAction = {
        id: Date.now(),
        siteId: siteId,
        task: 'Hive Box Update',
        taskName: 'Hive Box Update',
        taskId: 'hive_box_update',
        taskCategory: 'Management',
        notes: actionText,
        loggedBy: currentUser.username,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
    };
    const actionPath = currentTenantId ? `tenants/${currentTenantId}/actions` : 'actions';

    // Show sync status
    if (window.syncStatusManager) {
        window.syncStatusManager.updateSyncStatus('syncing', 'Saving hive update...');
    }

    if (navigator.onLine && window.database) {
        database.ref(`${tenantPath}/${siteId}`).update(updateData)
            .then(() => database.ref(`${actionPath}/${newAction.id}`).set(newAction))
            .then(() => {
                if (element) element.textContent = newValue;
                actions.push(newAction);
                if (window.syncStatusManager) {
                    window.syncStatusManager.updateSyncStatus('synced');
                }
                careMarshallAlert(`✅ ${boxTypeLabel} count updated: ${currentValue} → ${newValue}`, 'success');
                if (typeof updateDashboard === 'function') {
                    updateDashboard();
                }
            })
            .catch(error => {
                console.error('Error updating hive box (online path):', error);
                // Queue for later sync
                if (window.syncStatusManager) {
                    window.syncStatusManager.addPendingChange({
                        type: 'hive_update',
                        path: `${tenantPath}/${siteId}`,
                        data: updateData,
                        method: 'update'
                    });
                    window.syncStatusManager.addPendingChange({
                        type: 'action_log',
                        path: `${actionPath}/${newAction.id}`,
                        data: newAction,
                        method: 'set'
                    });
                    window.syncStatusManager.updateSyncStatus('offline', 'Saved locally, will sync later');
                }
                if (element) element.textContent = newValue;
                actions.push(newAction);
                careMarshallAlert('⚠️ Saved locally. Will sync when connection is restored.', 'warning');
                if (typeof updateDashboard === 'function') {
                    updateDashboard();
                }
            });
    } else {
        // Offline: queue changes and update UI immediately
        if (window.syncStatusManager) {
            window.syncStatusManager.addPendingChange({
                type: 'hive_update',
                path: `${tenantPath}/${siteId}`,
                data: updateData,
                method: 'update'
            });
            window.syncStatusManager.addPendingChange({
                type: 'action_log',
                path: `${actionPath}/${newAction.id}`,
                data: newAction,
                method: 'set'
            });
            window.syncStatusManager.updateSyncStatus('offline', 'Saved locally, will sync later');
        }
        if (element) element.textContent = newValue;
        actions.push(newAction);
        careMarshallAlert('⚠️ Saved locally. Will sync when connection is restored.', 'warning');
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
    }
}

/**
 * Quick edit site note from summary card
 * Opens a prompt for entering/editing notes and updates Firebase
 */
function quickEditSiteNote(siteId) {
    const site = window.sites.find(c => c.id === siteId);
    if (!site) {
        careMarshallAlert('Site not found', 'error');
        return;
    }
    
    const currentNote = site.notes || '';
    const newNote = prompt(`Edit note for ${site.name}:\n\n(Leave empty to remove note)`, currentNote);
    
    // If user cancelled, do nothing
    if (newNote === null) return;
    
    // Update site data
    const updatedNote = newNote.trim();
    const previousNote = site.notes || '';
    site.notes = updatedNote || null;
    
    // Prepare references and payloads
    const tenantPath = currentTenantId ? `tenants/${currentTenantId}/sites` : 'sites';
    const updateData = {
        notes: updatedNote || null,
        lastModified: new Date().toISOString(),
        lastModifiedBy: currentUser.username
    };
    
    // Show sync status
    if (window.syncStatusManager) {
        window.syncStatusManager.updateSyncStatus('syncing', 'Saving note...');
    }

    if (navigator.onLine && window.database) {
        database.ref(`${tenantPath}/${siteId}`).update(updateData)
            .then(() => {
                // Log action for note update
                const actionNotes = updatedNote 
                    ? (previousNote ? 'Note updated' : 'Note added')
                    : 'Note removed';
                logAction({
                    siteId: siteId,
                    taskName: 'Site Notes Updated',
                    taskCategory: 'Site Management',
                    date: new Date().toISOString().split('T')[0],
                    notes: `${actionNotes}${updatedNote ? `: ${updatedNote.substring(0, 100)}${updatedNote.length > 100 ? '...' : ''}` : ''}`
                }).catch(error => {
                    console.error('Error logging note update action:', error);
                    // Don't fail the whole operation if action logging fails
                });
                
                if (window.syncStatusManager) {
                    window.syncStatusManager.updateSyncStatus('synced');
                }
                careMarshallAlert(updatedNote ? `✅ Note updated for ${site.name}` : `✅ Note removed from ${site.name}`, 'success');
                // Re-render sites to update the display
                renderSites();
            })
            .catch(error => {
                console.error('Error updating note (online path):', error);
                // Queue for later sync
                if (window.syncStatusManager) {
                    window.syncStatusManager.addPendingChange({
                        type: 'note_update',
                        path: `${tenantPath}/${siteId}`,
                        data: updateData,
                        method: 'update'
                    });
                    window.syncStatusManager.updateSyncStatus('offline', 'Saved locally, will sync later');
                }
                careMarshallAlert('⚠️ Saved locally. Will sync when connection is restored.', 'warning');
                // Re-render sites to update the display
                renderSites();
            });
    } else {
        // Offline: queue changes and update UI immediately
        if (window.syncStatusManager) {
            window.syncStatusManager.addPendingChange({
                type: 'note_update',
                path: `${tenantPath}/${siteId}`,
                data: updateData,
                method: 'update'
            });
            window.syncStatusManager.updateSyncStatus('offline', 'Saved locally, will sync later');
        }
        careMarshallAlert('⚠️ Saved locally. Will sync when connection is restored.', 'warning');
        // Re-render sites to update the display
        renderSites();
    }
}

// Show contact details modal
function showContactDetails(siteId) {
    const site = window.sites.find(s => s.id === siteId);
    if (!site) {
        careMarshallAlert('Site not found', 'error');
        return;
    }
    
    const modalHtml = `
        <div class="modal fade" id="contactDetailsModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="bi bi-telephone"></i> Contact Information - ${site.name}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${site.landownerName ? `
                            <div class="mb-3">
                                <h6><i class="bi bi-person"></i> Contact Name</h6>
                                <p class="mb-0">${site.landownerName}</p>
                            </div>
                        ` : ''}
                        ${site.landownerPhone ? `
                            <div class="mb-3">
                                <h6><i class="bi bi-telephone"></i> Phone</h6>
                                <p class="mb-0">
                                    <a href="tel:${site.landownerPhone}" class="btn btn-outline-primary">
                                        <i class="bi bi-telephone-fill"></i> ${site.landownerPhone}
                                    </a>
                                </p>
                            </div>
                        ` : ''}
                        ${site.landownerEmail ? `
                            <div class="mb-3">
                                <h6><i class="bi bi-envelope"></i> Email</h6>
                                <p class="mb-0">
                                    <a href="mailto:${site.landownerEmail}" class="btn btn-outline-primary">
                                        <i class="bi bi-envelope-fill"></i> ${site.landownerEmail}
                                    </a>
                                </p>
                            </div>
                        ` : ''}
                        ${(site.contactNotes || site.landownerAddress) ? `
                            <div class="mb-3">
                                <h6><i class="bi bi-journal-text"></i> Contact Notes</h6>
                                <p class="mb-0">${site.contactNotes || site.landownerAddress}</p>
                            </div>
                        ` : ''}
                        ${site.contactBeforeVisit ? `
                            <div class="alert alert-warning">
                                <i class="bi bi-exclamation-triangle"></i> <strong>Important:</strong> Contact required before visit
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('contactDetailsModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    setTimeout(() => {
        const modalElement = document.getElementById('contactDetailsModal');
        if (modalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    }, 100);
}

// Show site clients modal
function showSiteClients(siteId) {
    const site = window.sites.find(s => s.id === siteId);
    if (!site) {
        careMarshallAlert('Site not found', 'error');
        return;
    }
    
    const siteClients = (window.clients || window.individualHives || []).filter(client => client.siteId === siteId);
    
    const clientsHtml = siteClients.length > 0 ? siteClients.map(client => {
        const status = client.status || client.hiveStrength || 'unknown';
        const statusColors = {
            'independent': 'success', 'strong': 'success',
            'assisted': 'info', 'medium': 'info',
            'dependent': 'warning', 'weak': 'warning',
            'rehabilitation': 'purple', 'nuc': 'purple',
            'hospice': 'danger', 'dead': 'danger'
        };
        const statusColor = statusColors[status.toLowerCase()] || 'secondary';
        const clientName = client.clientName || client.hiveName || `Client ${client.id}`;
        const needs = client.needs || client.notes || 'No special needs noted';
        
        return `
            <div class="card mb-2">
                <div class="card-body p-2">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h6 class="mb-1">
                                <i class="bi bi-house-heart"></i> ${clientName}
                                <span class="badge bg-${statusColor} ms-2">${status}</span>
                            </h6>
                            <p class="mb-0 small text-muted">${needs.length > 100 ? needs.substring(0, 100) + '...' : needs}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('') : '<p class="text-muted text-center">No clients at this location</p>';
    
    const modalHtml = `
        <div class="modal fade" id="siteClientsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="bi bi-house-heart"></i> Clients at ${site.name}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" style="max-height: 500px; overflow-y: auto;">
                        ${clientsHtml}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('siteClientsModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    setTimeout(() => {
        const modalElement = document.getElementById('siteClientsModal');
        if (modalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    }, 100);
}

// Show site tasks modal
function showSiteTasks(siteId) {
    const site = window.sites.find(s => s.id === siteId);
    if (!site) {
        careMarshallAlert('Site not found', 'error');
        return;
    }
    
    const siteTasks = (window.scheduledTasks || []).filter(task => 
        task.siteId === site.id && !task.completed
    ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    const tasksHtml = siteTasks.length > 0 ? siteTasks.map(task => {
        const taskName = typeof getTaskDisplayName === 'function' ? getTaskDisplayName(null, task.taskId) : (task.taskName || 'Unknown Task');
        const dueDate = new Date(task.dueDate);
        const isOverdue = dueDate < new Date();
        const priorityClass = task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : 'secondary';
        const priorityBadge = task.priority !== 'normal' ? `<span class="badge bg-${priorityClass}">${task.priority.toUpperCase()}</span>` : '';
        
        return `
            <div class="card mb-2 ${isOverdue ? 'border-danger' : ''}">
                <div class="card-body p-2">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h6 class="mb-1">
                                ${taskName}
                                ${isOverdue ? '<span class="badge bg-danger ms-2">OVERDUE</span>' : ''}
                                ${priorityBadge}
                            </h6>
                            <p class="mb-0 small">
                                <i class="bi bi-calendar"></i> Due: ${dueDate.toLocaleDateString()}
                                ${task.notes ? ` • ${task.notes}` : ''}
                            </p>
                        </div>
                        <div class="ms-2">
                            <button class="btn btn-sm btn-success" onclick="completeTaskFromSite('${task.id}', ${site.id})" title="Mark task as complete">
                                <i class="bi bi-check-circle"></i> Complete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('') : '<p class="text-muted text-center">No pending tasks for this location</p>';
    
    const modalHtml = `
        <div class="modal fade" id="siteTasksModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="bi bi-list-check"></i> Tasks for ${site.name}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" style="max-height: 500px; overflow-y: auto;">
                        ${tasksHtml}
                    </div>
                    <div class="modal-footer">
                        ${isAdmin ? `<button type="button" class="btn btn-success" onclick="scheduleTaskForSite(${site.id}); bootstrap.Modal.getInstance(document.getElementById('siteTasksModal')).hide();">
                            <i class="bi bi-calendar-plus"></i> Schedule New Task
                        </button>` : ''}
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('siteTasksModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    setTimeout(() => {
        const modalElement = document.getElementById('siteTasksModal');
        if (modalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    }, 100);
}

window.showSiteCarePlan = function(siteId) {
    const site = window.sites.find(c => c.id === siteId);
    if (!site) {
        careMarshallAlert('Site not found', 'error');
        return;
    }
    
    const previousModal = document.getElementById('siteCarePlanModal');
    if (previousModal) {
        previousModal.remove();
    }
    
    const careServicesBadges = CARE_SERVICE_DEFINITIONS
        .filter(service => site.careServices && site.careServices[service.key])
        .map(service => `<span class="badge me-1 mb-1" style="background:${service.color}; color:#fff;"><i class="bi ${service.icon}"></i> ${service.label}</span>`)
        .join('');
    
    const regularTasks = (site.regularTasks || site.regularTasksList || '')
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);
    
    const siteTasks = (window.scheduledTasks || [])
        .filter(task => task.siteId === siteId && !task.completed)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    const modalHtml = `
        <div class="modal fade" id="siteCarePlanModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header" style="background: linear-gradient(135deg, var(--turquoise), var(--lavender-mist));">
                        <h5 class="modal-title"><i class="bi bi-info-circle"></i> Care Plan • ${site.name}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${site.expectedServiceHours ? `
                        <div class="mb-3">
                            <strong><i class="bi bi-hourglass-split"></i> Expected Hours per Visit:</strong>
                            <div>${site.expectedServiceHours % 1 === 0 ? site.expectedServiceHours : site.expectedServiceHours.toFixed(1)} ${site.expectedServiceHours === 1 ? 'hour' : 'hours'}</div>
                        </div>` : ''}
                        
                        <div class="mb-3">
                            <strong><i class="bi bi-clipboard2-heart"></i> Primary Care Services:</strong>
                            <div class="mt-2">
                                ${careServicesBadges || '<span class="text-muted">No services documented yet.</span>'}
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <strong><i class="bi bi-check2-square"></i> Regular Visit Checklist:</strong>
                            <ol class="mt-2 mb-0">
                                ${regularTasks.length > 0
                                    ? regularTasks.map(item => `<li>${item}</li>`).join('')
                                    : '<li class="text-muted">Add routine visit tasks in the client form to build this checklist.</li>'}
                            </ol>
                        </div>
                        
                        <div>
                            <strong><i class="bi bi-calendar-check"></i> Scheduled Visit Tasks:</strong>
                            <div class="mt-2">
                                ${siteTasks.length > 0
                                    ? `<ul class="list-unstyled mb-0">
                                        ${siteTasks.map(task => {
                                            const taskName = typeof getTaskDisplayName === 'function'
                                                ? getTaskDisplayName(null, task.taskId)
                                                : (task.taskName || 'Scheduled task');
                                            const dueDate = task.dueDate ? new Date(task.dueDate) : null;
                                            const dueLabel = dueDate ? dueDate.toLocaleDateString() : 'No date';
                                            const priorityBadge = task.priority && task.priority !== 'normal'
                                                ? `<span class="badge bg-${task.priority === 'urgent' ? 'danger' : 'warning'} text-dark ms-1">${task.priority.toUpperCase()}</span>`
                                                : '';
                                            return `<li class="mb-2">
                                                <i class="bi bi-dot text-primary"></i>
                                                <span class="fw-semibold">${taskName}</span>
                                                <small class="text-muted ms-1">(${dueLabel})</small>
                                                ${priorityBadge}
                                            </li>`;
                                        }).join('')}
                                    </ul>`
                                    : '<div class="text-muted">No scheduled visit tasks yet.</div>'}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        ${isAdmin ? `<button type="button" class="btn btn-outline-primary" onclick="editSite(${siteId}); document.getElementById('siteCarePlanModal').remove();" data-bs-dismiss="modal">
                            <i class="bi bi-pencil"></i> Edit Client
                        </button>` : ''}
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalElement = document.getElementById('siteCarePlanModal');
    if (!modalElement) return;
    
    modalElement.addEventListener('hidden.bs.modal', () => {
        modalElement.remove();
    }, { once: true });
    
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
};

/**
 * Scroll to a specific site card in the sites view
 * Used when navigating from map popup or other views
 */
function scrollToSiteCard(siteId) {
    console.log(`🔍 scrollToSiteCard called for site ID: ${siteId}`);
    
    // Close map popup if it's open
    const mapInstance = window.homeCareMap || window.careMarshallMap;
    if (mapInstance) {
        mapInstance.closePopup();
    }
    
    // Find the site data first to get its name
    const site = window.sites?.find(s => s.id === siteId);
    
    if (!site) {
        console.warn(`⚠️ Site with ID ${siteId} not found in window.sites`);
        // Still navigate to sites page
        if (typeof showSites === 'function') {
            showSites();
        }
        return;
    }
    
    // Get first letter of site name
    const firstLetter = site.name.charAt(0).toUpperCase();
    const letter = /[A-Z]/.test(firstLetter) ? firstLetter : '#';
    console.log(`📍 Navigating to sites page and scrolling to section: ${letter} (site: ${site.name})`);
    
    // Navigate to sites summary page using showSites() to ensure proper initialization
    // Note: showSites() calls scrollToTop(), so we'll override that with our scroll after a delay
    if (typeof showSites === 'function') {
        showSites();
    } else {
        // Fallback: manually show sites view
        hideAllViews();
        const view = document.getElementById('sitesView');
        if (view) {
            view.classList.remove('hidden');
            view.style.display = '';
        }
        if (typeof updateActiveNav === 'function') {
            updateActiveNav('Sites');
        }
        if (typeof renderSites === 'function') {
            renderSites();
        }
        if (typeof renderSiteTypeFilter === 'function') {
            renderSiteTypeFilter();
        }
    }
    
    // Wait for page to fully load and render, then scroll to the letter section
    // Use a longer initial delay to allow showSites() to complete (including scrollToTop)
    let attempts = 0;
    const maxAttempts = 50; // Increased attempts for better reliability
    
    const tryScroll = () => {
        attempts++;
        console.log(`🔍 Scroll attempt ${attempts}/${maxAttempts} for section: ${letter} (site: ${site.name})`);
        
        // Check if sites view is visible
        const sitesView = document.getElementById('sitesView');
        if (sitesView && sitesView.classList.contains('hidden')) {
            // Sites view not visible yet, wait a bit more
            if (attempts < maxAttempts) {
                setTimeout(tryScroll, 200);
            }
            return;
        }
        
        // Check if sites list container exists
        const sitesList = document.getElementById('sitesList');
        if (!sitesList) {
            if (attempts < maxAttempts) {
                setTimeout(tryScroll, 200);
            } else {
                console.warn('⚠️ sitesList container not found after max attempts');
            }
            return;
        }
        
        // Check if sites are actually rendered (not just loading message)
        const sitesListContent = sitesList.innerHTML.trim();
        const isStillLoading = sitesListContent === '<div class="col-12"><p class="text-center text-muted my-5">Loading sites...</p></div>' || 
                               sitesListContent === '' ||
                               sitesListContent.includes('Loading sites');
        
        if (isStillLoading && attempts < maxAttempts) {
            // Sites not rendered yet, wait longer
            setTimeout(tryScroll, 250);
            return;
        }
        
        // Check if alphabet navigation bar exists (indicates sites are fully rendered)
        const alphabetNavBar = document.getElementById('alphabetNavBar');
        if (!alphabetNavBar && attempts < maxAttempts) {
            // Alphabet nav bar not rendered yet, wait a bit more
            setTimeout(tryScroll, 200);
            return;
        }
        
        const alphabetNavLink = alphabetNavBar ? document.querySelector(`a[href="#section-${letter}"].alphabet-nav-link`) : null;
        
        // Look for the section marker
        const sectionMarker = document.getElementById(`section-${letter}`);
        
        if (sectionMarker) {
            console.log(`✅ Found section marker for letter ${letter}, scrolling...`);
            // Calculate the position and scroll directly to ensure it happens
            const rect = sectionMarker.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const targetPosition = rect.top + scrollTop - 20; // 20px offset from top
            
            // Use requestAnimationFrame to ensure smooth scroll after all rendering
            requestAnimationFrame(() => {
                // Force scroll after a short delay to override any scrollToTop interference
                setTimeout(() => {
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    console.log(`✅ Successfully scrolled to section ${letter} at position ${targetPosition} (site: ${site.name})`);
                }, 150);
            });
        } else {
            // Section marker not found yet
            if (attempts < maxAttempts) {
                // Check if sites are being rendered
                const sitesListContent = sitesList.innerHTML.trim();
                if (sitesListContent && sitesListContent !== '<div class="col-12"><p class="text-center text-muted my-5">Loading sites...</p></div>') {
                    // Sites are rendered but section marker not found - might need to wait for renderSites to complete
                    setTimeout(tryScroll, 150);
                } else {
                    // Sites not rendered yet, wait longer
                    setTimeout(tryScroll, 250);
                }
            } else {
                console.warn(`⚠️ Section marker for letter ${letter} (site: ${site.name}) not found after ${maxAttempts} attempts`);
                // Try to scroll to top of sites list as fallback
                if (sitesList) {
                    sitesList.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }
    };
    
    // Start trying after a longer delay to allow showSites() and scrollToTop() to complete
    // showSites() has a setTimeout of 10ms and calls scrollToTop(), so we need to wait
    // for that to finish before scrolling to our target section
    // Increased delay to 1200ms to ensure scrollToTop() animation completes
    setTimeout(tryScroll, 1200);
}
