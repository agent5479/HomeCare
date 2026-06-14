// HomeCare - Interactive Client Analysis Card
// Functions for client status analysis card on dashboard

// Update client status breakdown
function updateClientStatusBreakdown() {
    const container = document.getElementById('careTypeBreakdown');
    const totalEl = document.getElementById('careTypeTotal');
    
    if (!container) {
        if (typeof Logger !== 'undefined') {
            Logger.warn('⚠️ careTypeBreakdown container not found on dashboard.');
        }
        return;
    }
    
    const siteTypes = (typeof SITE_TYPES !== 'undefined') ? SITE_TYPES : {};
    const counts = {};
    Object.keys(siteTypes).forEach(key => counts[key] = 0);
    
    let totalActiveSites = 0;
    
    if (Array.isArray(window.sites)) {
        window.sites.forEach(site => {
            if (site.archived === true || site.archived === 'true' || site.archived === 1) return;
            if (site.deleted === true || site.deleted === 'true' || site.deleted === 1) return;
            
            totalActiveSites++;
            
            const classification = site.functionalClassification || site.siteType || 'other';
            if (typeof counts[classification] === 'undefined') {
                counts[classification] = 0;
            }
            counts[classification]++;
        });
    }
    
    if (totalEl) {
        totalEl.textContent = totalActiveSites;
    }
    
    const typeEntries = Object.entries(siteTypes);
    if (typeEntries.length === 0) {
        container.innerHTML = `<div class="text-muted small">No care type definitions configured.</div>`;
        return;
    }
    
    const cardsHtml = typeEntries.map(([key, def]) => {
        const count = counts[key] || 0;
        const color = def.color || '#1976D2';
        const icon = def.icon || 'bi-house-heart';
        const cardClass = count === 0 ? 'care-type-card empty' : 'care-type-card';
        return `
            <div class="${cardClass}" style="--care-color: ${color};">
                <div class="care-type-icon">
                    <i class="bi ${icon}"></i>
                </div>
                <div class="care-type-count">${count}</div>
                <div class="care-type-label">${def.name}</div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = cardsHtml;
    
    // Also update equipment breakdown (legacy compatibility)
    updateEquipmentBreakdown();
}

// Update equipment breakdown (care equipment)
function updateEquipmentBreakdown() {
    if (!window.sites || window.sites.length === 0) {
        if (typeof Logger !== 'undefined') {
            Logger.log('📭 No sites data for equipment breakdown');
        }
        return;
    }
    
    let totalDoubles = 0;
    let totalTopSplits = 0;
    let totalSingles = 0;
    let totalNUCs = 0;
    let totalEmpty = 0;
    
    let sitesProcessed = 0;
    let sitesWithEquipment = 0;
    window.sites.forEach(site => {
        // Exclude archived and deleted sites from calculations (same filtering as dashboard)
        if (site.archived === true || site.archived === 'true' || site.archived === 1) return;
        if (site.deleted === true || site.deleted === 'true' || site.deleted === 1) return;
        
        sitesProcessed++;
        // Support both old hiveStacks and new careEquipment field names for backward compatibility
        const equipment = site.careEquipment || site.hiveStacks;
        if (equipment && typeof equipment === 'object') {
            sitesWithEquipment++;
            // Helper function to safely parse numeric values
            const safeParse = (val) => {
                if (val === null || val === undefined) return 0;
                const parsed = parseInt(val, 10);
                return isNaN(parsed) ? 0 : parsed;
            };
            
            const doubles = safeParse(equipment.doubles);
            const topSplits = safeParse(equipment.topSplits);
            const singles = safeParse(equipment.singles);
            const nucs = safeParse(equipment.nucs);
            const empty = safeParse(equipment.empty);
            
            totalDoubles += doubles;
            totalTopSplits += topSplits;
            totalSingles += singles;
            totalNUCs += nucs;
            totalEmpty += empty;
            
            if (typeof Logger !== 'undefined' && (doubles > 0 || topSplits > 0 || singles > 0 || nucs > 0 || empty > 0)) {
                Logger.log(`📊 Site "${site.name}": doubles=${doubles}, topSplits=${topSplits}, singles=${singles}, nucs=${nucs}, empty=${empty}`);
            }
        }
    });
    
    if (typeof Logger !== 'undefined') {
        Logger.log('📊 Equipment breakdown - sites processed:', sitesProcessed, 'of', window.sites.length, '| sites with equipment:', sitesWithEquipment);
    }
    
    // Calculate total equipment (excluding empty)
    const totalEquipment = totalDoubles + totalTopSplits + totalSingles + totalNUCs;
    
    // Update the display
    const doublesEl = document.getElementById('equipmentDoublesCount');
    const topSplitsEl = document.getElementById('equipmentTopSplitsCount');
    const singlesEl = document.getElementById('equipmentSinglesCount');
    const nucsEl = document.getElementById('equipmentNUCsCount');
    const emptyEl = document.getElementById('equipmentEmptyCount');
    const totalEl = document.getElementById('equipmentTotalCount');
    
    if (doublesEl) doublesEl.textContent = totalDoubles;
    if (topSplitsEl) topSplitsEl.textContent = totalTopSplits;
    if (singlesEl) singlesEl.textContent = totalSingles;
    if (nucsEl) nucsEl.textContent = totalNUCs;
    if (emptyEl) emptyEl.textContent = totalEmpty;
    if (totalEl) totalEl.textContent = totalEquipment;
    
    if (typeof Logger !== 'undefined') {
        Logger.log('📊 Equipment breakdown updated:', {
            doubles: totalDoubles,
            topSplits: totalTopSplits,
            singles: totalSingles,
            nucs: totalNUCs,
            empty: totalEmpty,
            total: totalEquipment
        });
    }
}

// Make functions globally accessible
window.updateClientStatusBreakdown = updateClientStatusBreakdown;
window.updateEquipmentBreakdown = updateEquipmentBreakdown;

// Backward compatibility aliases
window.updateHiveStrengthBreakdown = updateClientStatusBreakdown;


