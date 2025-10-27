// BeeMarshall - Navigation Module

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
        'complianceView'
    ];
    
    // Hide all views with forced reflow
    viewIds.forEach(id => {
        const view = document.getElementById(id);
        if (view) {
            view.classList.add('hidden');
            // Force browser reflow to ensure the hidden class is applied
            void view.offsetHeight;
        }
    });
    
    console.log('🔄 All views hidden');
}

function showDashboard() {
    console.log('🔄 Switching to Dashboard view...');
    hideAllViews();
    
    // Small delay to ensure all views are hidden before showing new view
    setTimeout(() => {
        const view = document.getElementById('dashboardView');
        if (view) {
            view.classList.remove('hidden');
        }
        
        if (typeof updateActiveNav === 'function') {
            updateActiveNav('dashboard');
        }
        
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
        
        console.log('✅ Dashboard view displayed');
    }, 10);
}

function showSites() {
    console.log('🔄 Switching to Sites view...');
    hideAllViews();
    
    // Small delay to ensure all views are hidden before showing new view
    setTimeout(() => {
        const view = document.getElementById('sitesView');
        if (view) {
            view.classList.remove('hidden');
        }
        
        if (typeof updateActiveNav === 'function') {
            updateActiveNav('Sites');
        }
        
        renderSites();
        renderSiteTypeFilter();
        
        console.log('✅ Sites view displayed');
    }, 10);
}

function showActions() {
    console.log('🔄 Switching to Actions view...');
    hideAllViews();
    
    // Small delay to ensure all views are hidden before showing new view
    setTimeout(() => {
        const view = document.getElementById('actionsView');
        if (view) {
            view.classList.remove('hidden');
        }
        
        if (typeof updateActiveNav === 'function') {
            updateActiveNav('Actions');
        }
        
        populateActionFilters();
        renderActions();
        
        console.log('✅ Actions view displayed');
    }, 10);
}

function showLogActionForm() {
    hideAllViews();
    
    // Small delay to ensure all views are hidden before showing new view
    setTimeout(() => {
        const view = document.getElementById('logActionView');
        if (view) {
            view.classList.remove('hidden');
        }
        
        if (typeof populateActionForm === 'function') {
            populateActionForm();
        }
    }, 10);
}

function showScheduledTasks() {
    console.log('🔄 Switching to Schedule view...');
    console.log('📊 Current data state:', {
        scheduledTasks: scheduledTasks ? scheduledTasks.length : 'undefined',
        sites: sites ? sites.length : 'undefined',
        tasks: tasks ? tasks.length : 'undefined',
        individualHives: individualHives ? individualHives.length : 'undefined'
    });
    
    hideAllViews();
    
    // Small delay to ensure all views are hidden before showing new view
    setTimeout(() => {
        const view = document.getElementById('scheduledView');
        if (view) {
            view.classList.remove('hidden');
        }
        
        if (typeof updateActiveNav === 'function') {
            updateActiveNav('Schedule');
        }
        
        console.log('📊 About to call renderScheduledTasks()');
        renderScheduledTasks();
        
        console.log('📊 About to call renderScheduleTimeline()');
        renderScheduleTimeline();
        
        console.log('✅ Schedule view displayed');
    }, 10);
}

function showFlagged() {
    hideAllViews();
    document.getElementById('flaggedView').classList.remove('hidden');
    renderFlaggedItems();
}

function showEmployees() {
    if (!isAdmin) {
        alert('Only Lars (admin) can access employee management!');
        return;
    }
    hideAllViews();
    document.getElementById('employeesView').classList.remove('hidden');
    renderEmployees();
}

function showManageTasks() {
    if (!isAdmin) {
        alert('Only administrators can manage tasks.');
        return;
    }
    hideAllViews();
    document.getElementById('manageTasksView').classList.remove('hidden');
    renderTasksList();
}

function showSeasonalRequirements() {
    if (!isAdmin) {
        alert('Only administrators can manage seasonal requirements.');
        return;
    }
    hideAllViews();
    document.getElementById('seasonalRequirementsView').classList.remove('hidden');
    populateSiteCheckboxes();
    renderSeasonalRequirements();
    renderComplianceStatus();
}

function showSuggestedSchedule() {
    hideAllViews();
    document.getElementById('suggestedScheduleView').classList.remove('hidden');
    renderSuggestedSchedule();
}

function showReports() {
    // Open reports in new tab
    window.open('reports.html', '_blank');
}


