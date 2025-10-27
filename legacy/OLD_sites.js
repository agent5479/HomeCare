// BeeMarshall - Site Management Module with Custom Grouping

// Global variable to track whether to show archived sites
let showArchivedSites = false;

// Site types and their associated colors
const SITE_TYPES = {
    'production': { name: 'Production', color: '#28a745', icon: 'bi-hexagon-fill' },
    'nucleus': { name: 'Nucleus', color: '#17a2b8', icon: 'bi-circle-fill' },
    'queen-rearing': { name: 'Queen Rearing', color: '#ffc107', icon: 'bi-star-fill' },
    'research': { name: 'Research', color: '#6f42c1', icon: 'bi-flask' },
    'education': { name: 'Education', color: '#fd7e14', icon: 'bi-book' },
    'quarantine': { name: 'Quarantine', color: '#dc3545', icon: 'bi-shield-exclamation' },
    'backup': { name: 'Backup', color: '#6c757d', icon: 'bi-archive' },
    'custom': { name: 'Custom', color: '#20c997', icon: 'bi-gear' }
};

function renderSites() {
    // Filter sites based on archive status
    const visibleSites = sites.filter(c => {
        if (showArchivedSites) {
            return c.archived === true;
        } else {
            return !c.archived; // Show non-archived by default
        }
    });
    
    const html = visibleSites.length > 0
        ? visibleSites.map(c => {
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
            
            const functionalClassification = c.functionalClassification || 'production';
            const typeInfo = SITE_TYPES[functionalClassification] || SITE_TYPES['custom'];
            
            // Add archived indicator
            const archivedBadge = c.archived ? `<span class="badge bg-secondary ms-2">Archived</span>` : '';
            
            // Get landowner info
            const landownerInfo = c.landownerName ? `${c.landownerName}${c.landownerPhone ? ' • ' + c.landownerPhone : ''}` : 'Not specified';
            
            // Get hive strength breakdown for inline editing
            const hiveStrong = c.hiveStrength?.strong || 0;
            const hiveMedium = c.hiveStrength?.medium || 0;
            const hiveWeak = c.hiveStrength?.weak || 0;
            const hiveNUC = c.hiveStrength?.nuc || 0;
            const hiveDead = c.hiveStrength?.dead || 0;
            
            // Get hive stacks for clickable cards
            const hiveDoubles = c.hiveStacks?.doubles || 0;
            const hiveTopSplits = c.hiveStacks?.topSplits || 0;
            const hiveSingles = c.hiveStacks?.singles || 0;
            const hiveNUCs = c.hiveStacks?.nucs || 0;
            const hiveEmpty = c.hiveStacks?.empty || 0;
            
            // Get honey potentials
            const honeyPotentials = c.honeyPotentials || [];
            const honeyPotentialsList = honeyPotentials.length > 0 
                ? honeyPotentials.map(p => `<span class="badge bg-warning me-1">${p}</span>`).join('')
                : '<span class="text-muted">None specified</span>';
            
            // Determine functional classification label
            const functionalClassificationLabel = c.functionalClassification || 'Not specified';
            
            return `
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="card site-card h-100" data-site-type="${functionalClassification}" ${c.archived ? 'style="opacity: 0.7;"' : ''}>
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="card-title">
                                    <i class="bi ${typeInfo.icon}" style="color: ${typeInfo.color}"></i> 
                                    ${c.name}
                                    ${archivedBadge}
                                </h5>
                                <span class="badge" style="background-color: ${typeInfo.color}; color: white;">
                                    ${typeInfo.name}
                                </span>
                            </div>
                            
                            <!-- Landowner & Phone -->
                            <div class="mb-2">
                                <i class="bi bi-person-fill text-muted me-1"></i>
                                <strong>Landowner:</strong> ${landownerInfo}
                            </div>
                            
                            <!-- Functional Classification -->
                            <div class="mb-2">
                                <i class="bi bi-calendar-event text-muted me-1"></i>
                                <strong>Functional Classification:</strong> ${functionalClassificationLabel}
                            </div>
                            
                            <!-- Seasonal Classification -->
                            <div class="mb-2">
                                <i class="bi bi-sun text-muted me-1"></i>
                                <strong>Seasonal Classification:</strong> ${c.seasonalClassification || c.seasonal_classification || 'Not specified'}
                            </div>
                            
                            <!-- Total Hive Count -->
                            <div class="mb-2">
                                <i class="bi bi-hexagon text-muted me-1"></i>
                                <strong>Total Hives:</strong> <span class="badge bg-primary">${c.hiveCount || 0}</span>
                            </div>
                            
                            <!-- Hive Count Summary (Editable inline) -->
                            <div class="mb-3">
                                <strong><i class="bi bi-hexagon-fill"></i> Hive Strength:</strong>
                                <div class="d-flex flex-wrap gap-2 mt-2">
                                    <div class="badge bg-success d-flex align-items-center px-3 py-2 hive-strength-badge" onclick="quickEditHiveStrength(${c.id}, 'Strong', ${hiveStrong})" style="cursor: pointer; font-size: 1rem; font-weight: 600; min-width: 80px; justify-content: center;">
                                        <i class="bi bi-hexagon-fill me-1"></i>
                                        <span>Strong: <strong id="hiveStrong_${c.id}">${hiveStrong}</strong></span>
                                    </div>
                                    <div class="badge bg-warning text-dark d-flex align-items-center px-3 py-2 hive-strength-badge" onclick="quickEditHiveStrength(${c.id}, 'Medium', ${hiveMedium})" style="cursor: pointer; font-size: 1rem; font-weight: 600; min-width: 80px; justify-content: center;">
                                        <i class="bi bi-hexagon me-1"></i>
                                        <span>Med: <strong id="hiveMedium_${c.id}">${hiveMedium}</strong></span>
                                    </div>
                                    <div class="badge bg-danger d-flex align-items-center px-3 py-2 hive-strength-badge" onclick="quickEditHiveStrength(${c.id}, 'Weak', ${hiveWeak})" style="cursor: pointer; font-size: 1rem; font-weight: 600; min-width: 80px; justify-content: center;">
                                        <i class="bi bi-hexagon me-1"></i>
                                        <span>Weak: <strong id="hiveWeak_${c.id}">${hiveWeak}</strong></span>
                                    </div>
                                    <div class="badge bg-info d-flex align-items-center px-3 py-2 hive-strength-badge" onclick="quickEditHiveStrength(${c.id}, 'NUC', ${hiveNUC})" style="cursor: pointer; font-size: 1rem; font-weight: 600; min-width: 80px; justify-content: center;">
                                        <i class="bi bi-hexagon-half me-1"></i>
                                        <span>NUC: <strong id="hiveNUC_${c.id}">${hiveNUC}</strong></span>
                                    </div>
                                    <div class="badge bg-secondary d-flex align-items-center px-3 py-2 hive-strength-badge" onclick="quickEditHiveStrength(${c.id}, 'Dead', ${hiveDead})" style="cursor: pointer; font-size: 1rem; font-weight: 600; min-width: 80px; justify-content: center;">
                                        <i class="bi bi-hexagon me-1"></i>
                                        <span>Dead: <strong id="hiveDead_${c.id}">${hiveDead}</strong></span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Hive Boxes (Clickable mini cards) -->
                            <div class="mb-3">
                                <strong><i class="bi bi-boxes"></i> Hive Boxes:</strong>
                                <div class="d-flex flex-wrap gap-2 mt-2">
                                    <div class="card hive-box-card" onclick="quickEditHiveBox(${c.id}, 'doubles', ${hiveDoubles})" style="cursor: pointer; min-width: 100px; max-width: 120px; background-color: #e3f2fd; border: 2px solid #2196f3;">
                                        <div class="card-body p-2 text-center">
                                            <i class="bi bi-stack" style="font-size: 1.2rem; color: #1976d2;"></i>
                                            <div class="fw-bold mt-1" style="font-size: 0.9rem; color: #1976d2;">Doubles</div>
                                            <div class="h5 mb-0" id="boxDoubles_${c.id}" style="color: #1976d2; font-weight: 600;">${hiveDoubles}</div>
                                        </div>
                                    </div>
                                    <div class="card hive-box-card" onclick="quickEditHiveBox(${c.id}, 'topSplits', ${hiveTopSplits})" style="cursor: pointer; min-width: 100px; max-width: 120px; background-color: #f3e5f5; border: 2px solid #9c27b0;">
                                        <div class="card-body p-2 text-center">
                                            <i class="bi bi-layers-half" style="font-size: 1.2rem; color: #7b1fa2;"></i>
                                            <div class="fw-bold mt-1" style="font-size: 0.9rem; color: #7b1fa2;">Top-Splits</div>
                                            <div class="h5 mb-0" id="boxTopSplits_${c.id}" style="color: #7b1fa2; font-weight: 600;">${hiveTopSplits}</div>
                                        </div>
                                    </div>
                                    <div class="card hive-box-card" onclick="quickEditHiveBox(${c.id}, 'singles', ${hiveSingles})" style="cursor: pointer; min-width: 100px; max-width: 120px; background-color: #e8f5e8; border: 2px solid #4caf50;">
                                        <div class="card-body p-2 text-center">
                                            <i class="bi bi-square" style="font-size: 1.2rem; color: #388e3c;"></i>
                                            <div class="fw-bold mt-1" style="font-size: 0.9rem; color: #388e3c;">Singles</div>
                                            <div class="h5 mb-0" id="boxSingles_${c.id}" style="color: #388e3c; font-weight: 600;">${hiveSingles}</div>
                                        </div>
                                    </div>
                                    <div class="card hive-box-card" onclick="quickEditHiveBox(${c.id}, 'nucs', ${hiveNUCs})" style="cursor: pointer; min-width: 100px; max-width: 120px; background-color: #fff3e0; border: 2px solid #ff9800;">
                                        <div class="card-body p-2 text-center">
                                            <i class="bi bi-circle" style="font-size: 1.2rem; color: #f57c00;"></i>
                                            <div class="fw-bold mt-1" style="font-size: 0.9rem; color: #f57c00;">NUCs</div>
                                            <div class="h5 mb-0" id="boxNucs_${c.id}" style="color: #f57c00; font-weight: 600;">${hiveNUCs}</div>
                                        </div>
                                    </div>
                                    <div class="card hive-box-card" onclick="quickEditHiveBox(${c.id}, 'empty', ${hiveEmpty})" style="cursor: pointer; min-width: 100px; max-width: 120px; background-color: #f5f5f5; border: 2px solid #9e9e9e;">
                                        <div class="card-body p-2 text-center">
                                            <i class="bi bi-square" style="font-size: 1.2rem; color: #616161;"></i>
                                            <div class="fw-bold mt-1" style="font-size: 0.9rem; color: #616161;">Empty</div>
                                            <div class="h5 mb-0" id="boxEmpty_${c.id}" style="color: #616161; font-weight: 600;">${hiveEmpty}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Honey Potentials -->
                            <div class="mb-3">
                                <strong><i class="bi bi-flower1"></i> Honey Potentials:</strong>
                                <div class="mt-1">
                                    ${honeyPotentialsList}
                                </div>
                            </div>
                            
                            ${c.lastModifiedBy ? `<small class="text-muted"><i class="bi bi-person"></i> ${c.lastModifiedBy}</small>` : ''}
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
        }).join('')
        : '<div class="col-12"><p class="text-center text-muted my-5">' + (showArchivedSites ? 'No archived sites.' : 'No sites found.') + '</p></div>';
    
    document.getElementById('sitesList').innerHTML = html;
    
    // Update the show archived button text
    updateArchivedButtonText();
}

function renderSiteTypeFilter() {
    const filterContainer = document.getElementById('functionalClassificationFilter');
    if (!filterContainer) return;
    
    const filterHtml = `
        <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center">
                <label class="form-label mb-0"><strong>Filter:</strong></label>
                <button class="btn btn-sm btn-outline-secondary" type="button" onclick="toggleSiteFilter()" id="filterToggleBtn">
                    <i class="bi bi-chevron-down" id="filterToggleIcon"></i> Functional Classifications
                </button>
            </div>
            <div class="collapse" id="siteFilterOptions">
                <div class="mt-2">
                    <div class="btn-group-vertical w-100" role="group">
                        <input type="radio" class="btn-check" name="siteTypeFilter" id="filterAll" value="all" checked>
                        <label class="btn btn-outline-secondary btn-sm" for="filterAll">All Types</label>
                        
                        <input type="radio" class="btn-check" name="siteTypeFilter" id="filterProduction" value="production">
                        <label class="btn btn-outline-secondary btn-sm" for="filterProduction" style="border-color: #28a745; color: #28a745;">
                            <i class="bi bi-hexagon-fill"></i> Production
                        </label>
                        
                        <input type="radio" class="btn-check" name="siteTypeFilter" id="filterNucleus" value="nucleus">
                        <label class="btn btn-outline-secondary btn-sm" for="filterNucleus" style="border-color: #17a2b8; color: #17a2b8;">
                            <i class="bi bi-circle-fill"></i> NUC
                        </label>
                        
                        <input type="radio" class="btn-check" name="siteTypeFilter" id="filterQueenRearing" value="queen-rearing">
                        <label class="btn btn-outline-secondary btn-sm" for="filterQueenRearing" style="border-color: #ffc107; color: #ffc107;">
                            <i class="bi bi-star-fill"></i> Queen Rearing
                        </label>
                        
                        <input type="radio" class="btn-check" name="siteTypeFilter" id="filterResearch" value="research">
                        <label class="btn btn-outline-secondary btn-sm" for="filterResearch" style="border-color: #6f42c1; color: #6f42c1;">
                            <i class="bi bi-flask"></i> Research
                        </label>
                        
                        <input type="radio" class="btn-check" name="siteTypeFilter" id="filterEducation" value="education">
                        <label class="btn btn-outline-secondary btn-sm" for="filterEducation" style="border-color: #fd7e14; color: #fd7e14;">
                            <i class="bi bi-book"></i> Education
                        </label>
                        
                        <input type="radio" class="btn-check" name="siteTypeFilter" id="filterQuarantine" value="quarantine">
                        <label class="btn btn-outline-secondary btn-sm" for="filterQuarantine" style="border-color: #dc3545; color: #dc3545;">
                            <i class="bi bi-shield-exclamation"></i> Quarantine
                        </label>
                        
                        <input type="radio" class="btn-check" name="siteTypeFilter" id="filterBackup" value="backup">
                        <label class="btn btn-outline-secondary btn-sm" for="filterBackup" style="border-color: #6c757d; color: #6c757d;">
                            <i class="bi bi-archive"></i> Backup
                        </label>
                        
                        <input type="radio" class="btn-check" name="siteTypeFilter" id="filterCustom" value="custom">
                        <label class="btn btn-outline-secondary btn-sm" for="filterCustom" style="border-color: #20c997; color: #20c997;">
                            <i class="bi bi-gear"></i> Custom
                        </label>
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
            toggleBtn.innerHTML = '<i class="bi bi-chevron-down"></i> Types';
        } else {
            // Expand
            filterOptions.classList.add('show');
            toggleIcon.className = 'bi bi-chevron-up';
            toggleBtn.innerHTML = '<i class="bi bi-chevron-up"></i> Types';
        }
    }
}

function showAddSiteForm() {
    hideAllViews();
    document.getElementById('siteFormView').classList.remove('hidden');
    document.getElementById('siteFormTitle').textContent = 'Add New Site';
    document.getElementById('siteForm').reset();
    document.getElementById('siteId').value = '';
    document.getElementById('anomalySection')?.classList.add('hidden');
    document.getElementById('mapPickerContainer').classList.add('hidden');
    
    // Populate functional classification dropdown
    populateFunctionalClassificationDropdown();
    
    // Render honey potentials checkboxes (empty for new site)
    renderHoneyPotentials([]);
    
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
        beeMarshallAlert('⚠️ Site name is required', 'warning');
        nameField.focus();
        nameField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    
    const hiveCountField = document.getElementById('siteHiveCount');
    const hiveCount = parseInt(hiveCountField.value);
    const seasonalClassification = document.getElementById('seasonalClassification').value;
    
    // Allow 0 hives only for Summer Only and Winter Only sites
    const isZeroHiveAllowed = seasonalClassification === 'summer-only' || seasonalClassification === 'winter-only';
    
    if (isNaN(hiveCount) || hiveCount < 0 || (!isZeroHiveAllowed && hiveCount <= 0)) {
        const message = isZeroHiveAllowed 
            ? '⚠️ Please enter a valid hive count (0 or greater)'
            : '⚠️ Please enter a valid hive count (must be greater than 0)';
        beeMarshallAlert(message, 'warning');
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
        beeMarshallAlert('⚠️ Please enter valid GPS coordinates', 'warning');
        latField.focus();
        latField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    
    if (lat < -90 || lat > 90) {
        beeMarshallAlert('⚠️ Latitude must be between -90 and 90 degrees', 'warning');
        latField.focus();
        latField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    
    if (lng < -180 || lng > 180) {
        beeMarshallAlert('⚠️ Longitude must be between -180 and 180 degrees', 'warning');
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
    
    const site = {
        id: id ? parseInt(id) : Date.now(),
        name: document.getElementById('siteName').value,
        description: document.getElementById('siteDescription').value,
        latitude: parseFloat(document.getElementById('siteLat').value) || 0,
        longitude: parseFloat(document.getElementById('siteLng').value) || 0,
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
        } : (sites.find(c => c.id === parseInt(id))?.hiveStacks || {
            doubles: 0,
            topSplits: 0,
            singles: 0,
            nucs: 0,
            empty: 0
        }),
        harvestTimeline: document.getElementById('siteHarvest').value,
        sugarRequirements: document.getElementById('siteSugar').value,
        notes: document.getElementById('siteNotes').value,
        functionalClassification: document.getElementById('functionalClassification').value || 'production',
        seasonalClassification: document.getElementById('seasonalClassification').value || 'summer',
        landownerName: document.getElementById('landownerName').value,
        landownerPhone: document.getElementById('landownerPhone').value,
        landownerEmail: document.getElementById('landownerEmail').value,
        landownerAddress: document.getElementById('landownerAddress').value,
        accessType: document.getElementById('accessType').value,
        contactBeforeVisit: document.getElementById('contactBeforeVisit').checked,
        isQuarantine: document.getElementById('isQuarantine').checked,
        // Get selected honey potentials from checkboxes
        honeyPotentials: getSelectedHoneyPotentials(),
        lastModifiedBy: currentUser.username,
        lastModifiedAt: new Date().toISOString(),
        createdAt: id ? (sites.find(c => c.id === parseInt(id))?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };
    
    // Preserve harvest records if they exist
    if (id) {
        const existingSite = sites.find(c => c.id === parseInt(id));
        if (existingSite && existingSite.harvestRecords) {
            site.harvestRecords = existingSite.harvestRecords;
        }
    }
    
    showSyncStatus('<i class="bi bi-arrow-repeat"></i> Saving...', 'syncing');
    
    // Use tenant-specific path for data isolation
    const tenantPath = currentTenantId ? `tenants/${currentTenantId}/sites` : 'sites';
    database.ref(`${tenantPath}/${site.id}`).set(site)
        .then(() => {
            beeMarshallAlert(`✅ Site "${site.name}" has been saved successfully!`, 'success');
            showSyncStatus('<i class="bi bi-check"></i> Saved by ' + currentUser.username);
            // Close the form and return to sites view
            setTimeout(() => {
                showSites();
            }, 500);
        })
        .catch(error => {
            console.error('Error saving site:', error);
            beeMarshallAlert('❌ Error saving site. Please try again.', 'error');
            showSyncStatus('Error saving');
        });
}

function editSite(id) {
    const site = sites.find(c => c.id === id);
    if (!site) return;
    
    hideAllViews();
    document.getElementById('siteFormView').classList.remove('hidden');
    document.getElementById('siteFormTitle').textContent = 'Edit: ' + site.name;
    
    // Populate functional classification dropdown BEFORE setting values
    populateFunctionalClassificationDropdown();
    
    document.getElementById('siteId').value = site.id;
    document.getElementById('siteName').value = site.name;
    document.getElementById('siteDescription').value = site.description || '';
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
    
    document.getElementById('siteSugar').value = site.sugarRequirements || '';
    document.getElementById('siteNotes').value = site.notes || '';
    document.getElementById('functionalClassification').value = site.functionalClassification || site.siteType || 'production';
    document.getElementById('seasonalClassification').value = site.seasonalClassification || site.seasonal_classification || 'summer';
    document.getElementById('landownerName').value = site.landownerName || '';
    document.getElementById('landownerPhone').value = site.landownerPhone || '';
    document.getElementById('landownerEmail').value = site.landownerEmail || '';
    document.getElementById('landownerAddress').value = site.landownerAddress || '';
    document.getElementById('accessType').value = site.accessType || '';
    document.getElementById('contactBeforeVisit').checked = site.contactBeforeVisit || false;
    document.getElementById('isQuarantine').checked = site.isQuarantine || false;
    
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
}

/**
 * Render honey potentials checkboxes in the form
 */
function renderHoneyPotentials(selectedPotentials = []) {
    const container = document.getElementById('honeyPotentialsContainer');
    if (!container) return;
    
    if (!HONEY_TYPES || HONEY_TYPES.length === 0) {
        container.innerHTML = '<p class="text-muted small">No honey types available. Add honey types in Task Management.</p>';
        return;
    }
    
    container.innerHTML = HONEY_TYPES.map(type => {
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
        beeMarshallAlert('Please enter a date and quantity', 'warning');
        return;
    }
    
    // Get existing records from the current site being edited
    const siteId = document.getElementById('siteId').value;
    let harvestRecords = [];
    
    if (siteId) {
        const existingSite = sites.find(c => c.id === parseInt(siteId));
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
        beeMarshallAlert('✅ Harvest record updated', 'success');
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
        beeMarshallAlert('✅ Harvest record added', 'success');
    }
    
    // Sort by date (newest first)
    harvestRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Update the site in the array temporarily (will be saved when form is submitted)
    if (siteId) {
        const siteIndex = sites.findIndex(c => c.id === parseInt(siteId));
        if (siteIndex !== -1) {
            sites[siteIndex].harvestRecords = harvestRecords;
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
        beeMarshallAlert('No site selected', 'error');
        return;
    }
    
    const existingSite = sites.find(c => c.id === parseInt(siteId));
    if (!existingSite || !existingSite.harvestRecords || !existingSite.harvestRecords[index]) {
        beeMarshallAlert('Record not found', 'error');
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
        beeMarshallAlert('No site selected', 'error');
        return;
    }
    
    const siteIndex = sites.findIndex(c => c.id === parseInt(siteId));
    if (siteIndex === -1) {
        beeMarshallAlert('Site not found', 'error');
        return;
    }
    
    if (!sites[siteIndex].harvestRecords) {
        sites[siteIndex].harvestRecords = [];
    }
    
    sites[siteIndex].harvestRecords.splice(index, 1);
    
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
    
    renderHarvestRecords(sites[siteIndex].harvestRecords);
    
    beeMarshallAlert('Harvest record removed', 'info');
}

function viewSiteDetails(id) {
    const site = sites.find(c => c.id === id);
    if (!site) return;
    
    const typeInfo = SITE_TYPES[site.siteType] || SITE_TYPES['custom'];
    
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
                                <p><strong>Hive Count:</strong> ${site.hiveCount}</p>
                                <p><strong>GPS Coordinates:</strong> ${site.latitude.toFixed(6)}, ${site.longitude.toFixed(6)}</p>
                                
                                <div class="mt-2">
                                    <button class="btn btn-sm btn-outline-primary" onclick="openInMaps(${site.id})">
                                        <i class="bi bi-geo-alt-fill"></i> View on Maps
                                    </button>
                                </div>
                                
                                <h6 class="mt-3">Landowner Information</h6>
                                ${site.landownerName ? `<p><strong>Name:</strong> ${site.landownerName}</p>` : ''}
                                ${site.landownerPhone ? `<p><strong>Phone:</strong> ${site.landownerPhone}</p>` : ''}
                                ${site.landownerEmail ? `<p><strong>Email:</strong> ${site.landownerEmail}</p>` : ''}
                                ${site.landownerAddress ? `<p><strong>Address:</strong> ${site.landownerAddress}</p>` : ''}
                            </div>
                            <div class="col-md-6">
                                <h6>Site Details</h6>
                                <p><strong>Site Type:</strong> ${site.siteType || 'Not specified'}</p>
                                <p><strong>Access Type:</strong> ${site.accessType || 'Not specified'}</p>
                                <p><strong>Contact Before Visit:</strong> ${site.contactBeforeVisit ? 'Yes' : 'No'}</p>
                                <p><strong>Quarantine Status:</strong> ${site.isQuarantine ? 'Yes' : 'No'}</p>
                                
                                <h6 class="mt-3">Timeline & Requirements</h6>
                                ${site.harvestTimeline ? `<p><strong>Harvest Timeline:</strong> ${site.harvestTimeline}</p>` : ''}
                                ${site.sugarRequirements ? `<p><strong>Sugar Requirements:</strong> ${site.sugarRequirements}</p>` : ''}
                                
                                ${site.notes ? `
                                    <h6 class="mt-3">Notes</h6>
                                    <p>${site.notes}</p>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" onclick="editSite(${site.id}); bootstrap.Modal.getInstance(document.getElementById('siteDetailsModal')).hide();">
                            <i class="bi bi-pencil"></i> Edit Site
                        </button>
                        <button type="button" class="btn btn-success" onclick="scheduleTaskForSite(${site.id}); bootstrap.Modal.getInstance(document.getElementById('siteDetailsModal')).hide();">
                            <i class="bi bi-calendar-plus"></i> Schedule Task
                        </button>
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
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('siteDetailsModal'));
    modal.show();
}

function scheduleTaskForSite(siteId) {
    // Pre-fill the schedule form with the selected site
    document.getElementById('scheduleSite').value = siteId;
    
    // Show the schedule modal
    const modal = new bootstrap.Modal(document.getElementById('scheduleTaskModal'));
    modal.show();
}

function archiveSite(id) {
    const site = sites.find(c => c.id === id);
    if (!site) {
        beeMarshallAlert('Site not found', 'error');
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
            beeMarshallAlert(`✅ "${site.name}" has been archived`, 'success');
            
            // Log as action
            const actionText = `Archived site: ${site.name}`;
            const action = {
                id: Date.now(),
                siteId: id,
                task: 'Archive Site',
                date: new Date().toISOString(),
                employee: currentUser.username,
                notes: actionText
            };
            
            const actionPath = currentTenantId ? `tenants/${currentTenantId}/actions` : 'actions';
            database.ref(`${actionPath}/${action.id}`).set(action).then(() => {
                // Refresh the sites list to update the UI
                renderSites();
            });
        }).catch(error => {
            console.error('Error archiving site:', error);
            beeMarshallAlert('❌ Error archiving site. Please try again.', 'error');
        });
    }
}

function unarchiveSite(id) {
    if (!isAdmin) {
        beeMarshallAlert('Only administrators can unarchive sites', 'error');
        return;
    }
    
    const site = sites.find(c => c.id === id);
    if (!site) {
        beeMarshallAlert('Site not found', 'error');
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
            beeMarshallAlert(`✅ "${site.name}" has been unarchived`, 'success');
            
            // Log as action
            const actionText = `Unarchived site: ${site.name}`;
            const action = {
                id: Date.now(),
                siteId: id,
                task: 'Unarchive Site',
                date: new Date().toISOString(),
                employee: currentUser.username,
                notes: actionText
            };
            
            const actionPath = currentTenantId ? `tenants/${currentTenantId}/actions` : 'actions';
            database.ref(`${actionPath}/${action.id}`).set(action).then(() => {
                // Refresh the sites list to update the UI
                renderSites();
            });
        }).catch(error => {
            console.error('Error unarchiving site:', error);
            beeMarshallAlert('❌ Error unarchiving site. Please try again.', 'error');
        });
    }
}

function deleteSite(id) {
    // Only admins can delete, and only from archived state
    if (!isAdmin) {
        beeMarshallAlert('Only administrators can delete sites', 'error');
        return;
    }
    
    const site = sites.find(c => c.id === id);
    if (!site) {
        beeMarshallAlert('Site not found', 'error');
        return;
    }
    
    if (!site.archived) {
        beeMarshallAlert('⚠️ Sites must be archived before they can be permanently deleted.\n\nPlease archive the site first, then use the "Show Archived Sites" button to delete it.', 'warning');
        return;
    }
    
    const confirmMessage = `⚠️ PERMANENT DELETION\n\nSite: ${site.name}\n\n⚠️ WARNING: This will permanently delete:\n• The site and all its data\n• Historical harvest records for this site\n• All associated actions and history\n\n⚠️ This action CANNOT be undone!\n\nAre you absolutely sure you want to permanently delete this site?`;
    
    if (confirm(confirmMessage)) {
        // Double confirmation
        if (confirm('This is your last chance. Permanently delete this site? This action CANNOT be undone.')) {
            const tenantPath = currentTenantId ? `tenants/${currentTenantId}/sites` : 'sites';
            database.ref(`${tenantPath}/${id}`).remove().then(() => {
                beeMarshallAlert(`🗑️ Site "${site.name}" has been permanently deleted`, 'success');
                // Refresh the sites list to update the UI
                renderSites();
            }).catch(error => {
                console.error('Error deleting site:', error);
                beeMarshallAlert('❌ Error deleting site. Please try again.', 'error');
            });
        }
    }
}

/**
 * Open site location in maps application
 * Detects platform and opens appropriate app (Google Maps or Apple Maps)
 */
function openInMaps(siteId) {
    const site = sites.find(c => c.id === siteId);
    if (!site) {
        beeMarshallAlert('Site not found', 'error');
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
    if (map && sites && sites.length > 0) {
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
    
    // Always use Collingwood, NZ as default center
    const center = [-40.6764, 172.6856]; // Collingwood, NZ
    console.log('📍 Map center set to Collingwood, NZ');
    
    // Use global map if it exists, otherwise skip
    if (!window.beeMarshallMap) {
        console.log('🗺️ Global map not initialized, skipping site rendering');
        return;
    }
    
    // Use the global map
    map = window.beeMarshallMap;
    
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
    if (!sites || sites.length === 0) {
        console.log('📍 No sites to render yet');
        return;
    }
    
    console.log(`📍 Rendering ${sites.length} sites on map`);
    
    // Add marker for each site with type-specific colors
    sites.forEach(site => {
        try {
            const typeInfo = SITE_TYPES[site.siteType] || SITE_TYPES['custom'];
            
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
                            <a href="#" onclick="viewSiteDetails(${site.id}); return false;" style="color: ${typeInfo.color}; text-decoration: none; font-weight: bold; cursor: pointer;">
                                <i class="bi ${typeInfo.icon}"></i> ${site.name}
                            </a>
                        </h6>
                        <p class="mb-1"><small>${site.description || 'No description'}</small></p>
                        <p class="mb-1"><strong>Type:</strong> <span style="color: ${typeInfo.color};">${typeInfo.name}</span></p>
                        <p class="mb-1"><strong>Hives:</strong> ${site.hiveCount}</p>
                        ${site.harvestTimeline ? `<p class="mb-1"><strong>Harvest:</strong> ${site.harvestTimeline}</p>` : ''}
                        ${site.sugarRequirements ? `<p class="mb-1"><strong>Sugar:</strong> ${site.sugarRequirements}</p>` : ''}
                        ${site.landownerName ? `<p class="mb-1"><strong>Landowner:</strong> ${site.landownerName}</p>` : ''}
                        
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
                            <button class="btn btn-sm btn-primary" onclick="viewSiteDetails(${site.id}); return false;">
                                <i class="bi bi-eye"></i> View Details
                            </button>
                            <button class="btn btn-sm btn-outline-primary" onclick="openInMaps(${site.id}); return false;">
                                <i class="bi bi-geo-alt-fill"></i> View on Maps
                            </button>
                            <button class="btn btn-sm btn-success" onclick="scheduleTaskForSite(${site.id}); return false;">
                                <i class="bi bi-calendar-plus"></i> Schedule Task
                            </button>
                            <button class="btn btn-sm btn-outline-warning" onclick="editSite(${site.id}); return false;">
                                <i class="bi bi-pencil"></i> Edit Site
                            </button>
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
    if (sites.length > 1 && markers.length > 0) {
        try {
            const group = new L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.1));
        } catch (error) {
            console.error('Error fitting bounds:', error);
        }
    }
}

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
            beeMarshallAlert('Could not get location: ' + error.message, 'error');
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
            const lat = parseFloat(document.getElementById('siteLat').value) || -40.6764; // Collingwood, NZ
            const lng = parseFloat(document.getElementById('siteLng').value) || 172.6856;
            
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
    
    const site = sites.find(c => c.id === parseInt(siteId));
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
                        <i class="bi bi-hexagon-fill me-2"></i>
                        <strong>Total Active Hives:</strong> <span id="totalActiveHives" class="badge bg-success ms-2" style="font-size: 1.2rem;">${totalHives}</span>
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
        const site = sites.find(c => c.id === parseInt(siteId));
        if (site) {
            // Update site data
            if (!site.hiveStacks) site.hiveStacks = {};
            site.hiveStacks[type] = newValue;
            site.hiveCount = visualHiveData.doubles + visualHiveData.topSplits + visualHiveData.singles + visualHiveData.nucs;
            
            // Save to Firebase
            const tenantPath = currentTenantId ? `tenants/${currentTenantId}/sites` : 'sites';
            database.ref(`${tenantPath}/${site.id}`).update({
                hiveStacks: site.hiveStacks,
                hiveCount: site.hiveCount,
                lastModified: new Date().toISOString(),
                lastModifiedBy: currentUser.username
            }).then(() => {
                // Log as action
                const typeLabel = type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                const actionText = `Hive inventory updated at ${site.name}: ${typeLabel} changed from ${oldValue} to ${newValue}`;
                logSiteVisitAction(site.id, actionText);
                
                console.log('✅ Hive inventory auto-saved:', typeLabel, oldValue, '→', newValue);
            }).catch(error => {
                console.error('Error auto-saving hive changes:', error);
            });
        }
    }
}

function saveVisualHiveChanges() {
    const siteId = document.getElementById('siteId')?.value;
    if (!siteId) {
        beeMarshallAlert('No site selected', 'warning');
        return;
    }
    
    const site = sites.find(c => c.id === parseInt(siteId));
    if (!site) {
        beeMarshallAlert('Site not found', 'error');
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
        beeMarshallAlert('No changes detected', 'info');
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
        
        beeMarshallAlert('✅ Site inventory updated and logged as action!', 'success');
    }).catch(error => {
        console.error('Error saving visual hive changes:', error);
        beeMarshallAlert('❌ Error saving changes', 'error');
    });
}

function logSiteVisitAction(siteId, notes) {
    const newAction = {
        id: Date.now(),
        siteId: parseInt(siteId),
        task: 'Site Visit & Inventory',
        notes: notes,
        completedBy: currentUser.username,
        completedAt: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
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
        beeMarshallAlert('No site selected', 'warning');
        return;
    }
    
    // Get the site
    const site = sites.find(c => c.id === parseInt(siteId));
    if (!site) {
        beeMarshallAlert('Site not found', 'error');
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
            beeMarshallAlert(`⚠️ Warning: State total (${newStateTotal}) does not match Hive Box total (${currentHiveBoxTotal})\n\nPlease adjust other state counts or update the Hive Box totals first.`, 'warning');
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
            notes: actionText,
            completedBy: currentUser.username,
            completedAt: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0]
        };
        
        actions.push(newAction);
        
        const actionPath = currentTenantId ? `tenants/${currentTenantId}/actions` : 'actions';
        return database.ref(`${actionPath}/${newAction.id}`).set(newAction);
    }).then(() => {
        console.log(`✅ ${state} hive count updated: ${currentValue} → ${newValue}`);
        beeMarshallAlert(`✅ ${state} hive count updated: ${currentValue} → ${newValue}`, 'success');
        
        // Trigger recalculation of totals
        if (typeof updateHiveStrengthTotals === 'function') {
            updateHiveStrengthTotals();
        }
    }).catch(error => {
        console.error('Error updating hive state:', error);
        beeMarshallAlert(`❌ Error updating ${state} hive count: ${error.message}`, 'error');
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
    
    const archivedCount = sites.filter(c => c.archived === true).length;
    const activeCount = sites.filter(c => !c.archived).length;
    
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
    const site = sites.find(c => c.id === siteId);
    if (!site) {
        beeMarshallAlert('Site not found', 'error');
        return;
    }
    
    // Prompt for new value
    const newValueStr = prompt(`Update ${state} hives for ${site.name}:\n\nCurrent: ${currentValue}\n\nEnter new count:`, currentValue);
    if (newValueStr === null) return; // User cancelled
    
    const newValue = parseInt(newValueStr) || 0;
    
    if (newValue < 0) {
        beeMarshallAlert('Count cannot be negative', 'warning');
        return;
    }
    
    // Update site data
    if (!site.hiveStrength) site.hiveStrength = {};
    site.hiveStrength[state.toLowerCase()] = newValue;
    
    // Save to Firebase
    const tenantPath = currentTenantId ? `tenants/${currentTenantId}/sites` : 'sites';
    database.ref(`${tenantPath}/${siteId}`).update({
        hiveStrength: site.hiveStrength,
        lastModified: new Date().toISOString(),
        lastModifiedBy: currentUser.username
    }).then(() => {
        // Update the display immediately
        const elementId = state === 'NUC' ? `hiveNUC_${siteId}` : `hive${state}_${siteId}`;
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = newValue;
        }
        
        // Log as action
        const actionText = `Updated ${state} hives at ${site.name}: ${currentValue} → ${newValue}`;
        const newAction = {
            id: Date.now(),
            siteId: siteId,
            task: 'Hive State Update',
            notes: actionText,
            completedBy: currentUser.username,
            completedAt: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0]
        };
        
        actions.push(newAction);
        
        const actionPath = currentTenantId ? `tenants/${currentTenantId}/actions` : 'actions';
        return database.ref(`${actionPath}/${newAction.id}`).set(newAction);
    }).then(() => {
        beeMarshallAlert(`✅ ${state} hive count updated: ${currentValue} → ${newValue}`, 'success');
    }).catch(error => {
        console.error('Error updating hive strength:', error);
        beeMarshallAlert(`❌ Error updating ${state} hive count: ${error.message}`, 'error');
    });
}

/**
 * Quick edit hive box count from summary card
 * Opens a prompt for entering new count and updates Firebase
 */
function quickEditHiveBox(siteId, boxType, currentValue) {
    const site = sites.find(c => c.id === siteId);
    if (!site) {
        beeMarshallAlert('Site not found', 'error');
        return;
    }
    
    // Format the box type for display
    const boxTypeLabel = boxType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    
    // Prompt for new value
    const newValueStr = prompt(`Update ${boxTypeLabel} for ${site.name}:\n\nCurrent: ${currentValue}\n\nEnter new count:`, currentValue);
    if (newValueStr === null) return; // User cancelled
    
    const newValue = parseInt(newValueStr) || 0;
    
    if (newValue < 0) {
        beeMarshallAlert('Count cannot be negative', 'warning');
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
    
    // Save to Firebase
    const tenantPath = currentTenantId ? `tenants/${currentTenantId}/sites` : 'sites';
    database.ref(`${tenantPath}/${siteId}`).update({
        hiveStacks: site.hiveStacks,
        hiveCount: site.hiveCount,
        lastModified: new Date().toISOString(),
        lastModifiedBy: currentUser.username
    }).then(() => {
        // Update the display immediately
        const elementId = `box${boxType.charAt(0).toUpperCase() + boxType.slice(1)}_${siteId}`;
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = newValue;
        }
        
        // Log as action
        const actionText = `Updated ${boxTypeLabel} at ${site.name}: ${currentValue} → ${newValue}`;
        const newAction = {
            id: Date.now(),
            siteId: siteId,
            task: 'Hive Box Update',
            notes: actionText,
            completedBy: currentUser.username,
            completedAt: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0]
        };
        
        actions.push(newAction);
        
        const actionPath = currentTenantId ? `tenants/${currentTenantId}/actions` : 'actions';
        return database.ref(`${actionPath}/${newAction.id}`).set(newAction);
    }).then(() => {
        beeMarshallAlert(`✅ ${boxTypeLabel} count updated: ${currentValue} → ${newValue}`, 'success');
        
        // Update dashboard statistics if we're on the dashboard
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
    }).catch(error => {
        console.error('Error updating hive box:', error);
        beeMarshallAlert(`❌ Error updating ${boxTypeLabel} count: ${error.message}`, 'error');
    });
}
