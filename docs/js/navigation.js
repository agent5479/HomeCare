// HomeCare - Navigation Module

// Universal minimal scroll-to-top function
function scrollToTop() {
    // Force scroll to absolute top before any view changes
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Also ensure any scroll containers are reset
    const mainApp = document.getElementById('mainApp');
    if (mainApp) {
        mainApp.scrollTop = 0;
    }
    const container = mainApp?.querySelector('.container-fluid');
    if (container) {
        container.scrollTop = 0;
    }
}

function hideAllViews() {
    // List of all view containers
    const viewIds = [
        'dashboardView', 
        'sitesView', 
        'siteFormView', 
        'actionsView', 
        'logActionView', 
        'scheduledView', 
        'calendarView',
        'scheduleForNextVisitView', 
        'flaggedView', 
        'employeesView', 
        'manageTasksView',
        'tasksView',
        'seasonalRequirementsView', 
        'suggestedScheduleView',
        'complianceView',
        'integrityCheckView'
    ];
    
    // Hide all views with forced reflow and display:none to prevent carryover
    viewIds.forEach(id => {
        const view = document.getElementById(id);
        if (view) {
            view.classList.add('hidden');
            view.style.display = 'none'; // Double-hide to prevent carryover
            // Force browser reflow to ensure the hidden class is applied
            void view.offsetHeight;
        }
    });
    
    // Also hide any lingering scheduled/timeline panels that might be orphaned
    // Always hide these explicitly, regardless of parent state
    ['scheduledTasksList', 'scheduleTimeline'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = 'none';
            // Also add hidden class for extra safety
            el.classList.add('hidden');
        }
    });
    
    console.log('🔄 All views hidden');
}

function showDashboard() {
    hideAllViews();
    scrollToTop();
    setTimeout(() => {
        const view = document.getElementById('dashboardView');
        if (view) {
            view.classList.remove('hidden');
            view.style.display = '';
        }
        if (typeof updateActiveNav === 'function') {
            updateActiveNav('dashboard');
        }
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
        // Setup return-to-top button for dashboard view
        setTimeout(() => {
            if (typeof setupReturnToTopButton === 'function') {
                setupReturnToTopButton();
            }
        }, 100);
    }, 10);
}

function showSites() {
    hideAllViews();
    scrollToTop();
    setTimeout(() => {
        const view = document.getElementById('sitesView');
        if (view) {
            view.classList.remove('hidden');
            view.style.display = '';
        }
        updateActiveNav('Sites');
        renderSites();
        renderSiteTypeFilter();
        // Setup return-to-top button after view is shown
        setTimeout(() => {
            if (typeof setupReturnToTopButton === 'function') {
                setupReturnToTopButton();
            }
        }, 100);
    }, 10);
}

function showActions() {
    hideAllViews();
    scrollToTop();
    // CRITICAL: Populate filters AND render content WHILE view is still hidden
    // This prevents browser from calculating layout with partial content
    populateActionFilters();
    renderActions(); // Render content while hidden
    setTimeout(() => {
        const view = document.getElementById('actionsView');
        if (view) {
            view.classList.remove('hidden');
            view.style.display = '';
        }
        updateActiveNav('Actions');
        // Scroll reset immediately after showing view (everything already rendered)
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        // Setup return-to-top button for actions view
        setTimeout(() => {
            if (typeof setupReturnToTopButton === 'function') {
                setupReturnToTopButton();
            }
        }, 100);
    }, 10);
}

function showLogActionForm() {
    hideAllViews();
    scrollToTop();
    setTimeout(() => {
        const view = document.getElementById('logActionView');
        if (view) {
            view.classList.remove('hidden');
            view.style.display = '';
        }
        if (typeof populateActionForm === 'function') {
            populateActionForm();
        }
    }, 10);
}

function showScheduledTasks() {
    hideAllViews();
    scrollToTop();
    setTimeout(() => {
        const view = document.getElementById('scheduledView');
        if (view) {
            view.classList.remove('hidden');
            view.style.display = '';
        }
        const tasksList = document.getElementById('scheduledTasksList');
        const timeline = document.getElementById('scheduleTimeline');
        if (tasksList) {
            tasksList.style.display = '';
            tasksList.classList.remove('hidden');
        }
        if (timeline) {
            timeline.style.display = '';
            timeline.classList.remove('hidden');
        }
        updateActiveNav('Schedule');
        renderScheduledTasks();
        renderScheduleTimeline();
    }, 10);
}

function showFlagged() {
    hideAllViews();
    scrollToTop();
    setTimeout(() => {
        const view = document.getElementById('flaggedView');
        if (view) {
            view.classList.remove('hidden');
            view.style.display = '';
        }
        renderFlaggedItems();
    }, 10);
}

function showEmployees() {
    if (!isAdmin) {
        alert('Only Lars (admin) can access employee management!');
        return;
    }
    hideAllViews();
    scrollToTop();
    setTimeout(() => {
        const view = document.getElementById('employeesView');
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
        updateActiveNav('Team');
        renderEmployees();
    }, 10);
}

function showManageTasks() {
    if (!isAdmin) {
        alert('Only administrators can manage tasks.');
        return;
    }
    hideAllViews();
    scrollToTop();
    setTimeout(() => {
        const view = document.getElementById('manageTasksView');
        if (view) {
            view.classList.remove('hidden');
            view.style.display = '';
        }
        renderTasksList();
    }, 10);
}

function showSeasonalRequirements() {
    if (!isAdmin) {
        alert('Only administrators can manage seasonal requirements.');
        return;
    }
    hideAllViews();
    scrollToTop();
    setTimeout(() => {
        const view = document.getElementById('seasonalRequirementsView');
        if (view) {
            view.classList.remove('hidden');
            view.style.display = '';
        }
        populateSiteCheckboxes();
        renderSeasonalRequirements();
        renderComplianceStatus();
    }, 10);
}

function showSuggestedSchedule() {
    hideAllViews();
    scrollToTop();
    setTimeout(() => {
        const view = document.getElementById('suggestedScheduleView');
        if (view) {
            view.classList.remove('hidden');
            view.style.display = '';
        }
        renderSuggestedSchedule();
    }, 10);
}

function showReports() {
    // Open reports in new tab
    window.open('reports.html', '_blank');
}


