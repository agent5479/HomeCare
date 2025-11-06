// HomeCare - Interactive Client Analysis Card
// Functions for client status analysis card on dashboard

// Update client status breakdown
function updateClientStatusBreakdown() {
    if (!window.sites || window.sites.length === 0) {
        if (typeof Logger !== 'undefined') {
            Logger.log('📭 No sites data for client status breakdown');
        }
        return;
    }
    
    let totalIndependent = 0;
    let totalAssisted = 0;
    let totalDependent = 0;
    let totalRehabilitation = 0;
    let totalHospice = 0;
    let totalQuarantine = 0;
    
    window.sites.forEach(site => {
        // Exclude archived and deleted sites from calculations (same filtering as dashboard)
        if (site.archived === true || site.archived === 'true' || site.archived === 1) return;
        if (site.deleted === true || site.deleted === 'true' || site.deleted === 1) return;
        
        // Support both old hiveStrength and new clientStatus field names for backward compatibility
        const clientStatus = site.clientStatus || site.hiveStrength;
        if (clientStatus) {
            // Map old hive strength to new client status
            totalIndependent += clientStatus.independent || clientStatus.strong || 0;
            totalAssisted += clientStatus.assisted || clientStatus.medium || 0;
            totalDependent += clientStatus.dependent || clientStatus.weak || 0;
            totalRehabilitation += clientStatus.rehabilitation || clientStatus.nuc || 0;
            totalHospice += clientStatus.hospice || clientStatus.dead || 0;
        }
        // Count quarantine sites
        if (site.isQuarantine) {
            totalQuarantine++;
        }
    });
    
    // Calculate total active clients (excluding hospice)
    const totalActiveClients = totalIndependent + totalAssisted + totalDependent + totalRehabilitation;
    
    // Update the display - maintain backward compatibility with old IDs
    const strongEl = document.getElementById('strongCount');
    const mediumEl = document.getElementById('mediumCount');
    const weakEl = document.getElementById('weakCount');
    const nucEl = document.getElementById('nucCount');
    const deadEl = document.getElementById('deadCount');
    const quarantineEl = document.getElementById('quarantineCount');
    
    if (strongEl) strongEl.textContent = totalIndependent;
    if (mediumEl) mediumEl.textContent = totalAssisted;
    if (weakEl) weakEl.textContent = totalDependent;
    if (nucEl) nucEl.textContent = totalRehabilitation;
    if (deadEl) deadEl.textContent = totalHospice;
    if (quarantineEl) quarantineEl.textContent = totalQuarantine;
    
    // Update correlation display if it exists
    const correlationEl = document.getElementById('hiveBreakdownTotal');
    if (correlationEl) {
        correlationEl.textContent = totalActiveClients;
    }
    
    // Also update equipment breakdown
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

