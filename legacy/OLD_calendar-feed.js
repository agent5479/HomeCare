// BeeMarshall - Calendar Feed System
// Server-based ICS feed for calendar applications

// Generate server-based calendar feed URL
// This uses Firebase to generate a shareable ICS feed that updates automatically
function generateServerCalendarFeed(tenantId = null) {
    if (!tenantId) {
        tenantId = currentTenantId || 'demo';
    }
    
    // Create a shareable URL that points to a backend service
    const baseUrl = window.location.origin;
    const feedUrl = `${baseUrl}/calendar/${tenantId}.ics`;
    
    Logger.log('📅 Generated server calendar feed URL:', feedUrl);
    
    return feedUrl;
}

// Copy server calendar feed link to clipboard
function copyServerCalendarFeedLink() {
    const feedUrl = generateServerCalendarFeed();
    
    navigator.clipboard.writeText(feedUrl).then(() => {
        beeMarshallAlert(
            `📋 Server Calendar Feed Link Copied!\n\n✅ URL: ${feedUrl}\n\n📅 Subscribe to this link in:\n• Google Calendar\n• Outlook\n• Apple Calendar\n• Any calendar app\n\n🔄 The feed updates automatically when you schedule tasks!`,
            'success'
        );
    }).catch(err => {
        Logger.error('Failed to copy calendar feed link:', err);
        
        // Fallback: show the URL in an alert
        beeMarshallAlert(
            `📋 Copy this URL:\n\n${feedUrl}\n\n📅 Subscribe to this link in your calendar app to get automatic task updates.`,
            'info'
        );
    });
}

// Generate ICS content from current scheduled tasks
function generateICSCalendarFeed() {
    if (!scheduledTasks || scheduledTasks.length === 0) {
        return generateEmptyICS();
    }
    
    const now = new Date();
    const nowUTC = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//BeeMarshall//Task Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:BeeMarshall Scheduled Tasks',
        'X-WR-TIMEZONE:UTC',
        'X-WR-CALDESC:Automatic task calendar from BeeMarshall Apiary Management',
        `X-WR-CALID:${generateServerCalendarFeed()}`
    ];
    
    // Add future tasks to calendar
    const futureTasks = scheduledTasks.filter(task => {
        if (task.completed) return false;
        const taskDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return taskDate >= today;
    });
    
    futureTasks.forEach(task => {
        const site = sites.find(s => s.id === task.siteId);
        const taskObj = tasks.find(tk => tk.id === task.taskId);
        const displayTaskName = taskObj ? taskObj.name : getTaskDisplayName(null, task.taskId);
        
        const startDate = new Date(task.dueDate);
        if (task.scheduledTime) {
            const [hours, minutes] = task.scheduledTime.split(':');
            startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
            startDate.setHours(9, 0, 0, 0); // Default to 9 AM
        }
        
        const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000)); // 2 hours duration
        
        const startUTC = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endUTC = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        
        const summary = displayTaskName;
        const description = `BeeMarshall Task\n\nSite: ${site?.name || 'Unknown'}\nPriority: ${task.priority || 'normal'}\nType: ${task.type || 'scheduled'}\n${task.notes ? `\nNotes: ${task.notes}` : ''}\n\nView in BeeMarshall: ${window.location.origin}`;
        const location = site?.name || 'Apiary Location';
        
        icsContent.push(
            'BEGIN:VEVENT',
            `UID:${task.id}@beemarshall.com`,
            `DTSTART:${startUTC}`,
            `DTEND:${endUTC}`,
            `DTSTAMP:${nowUTC}`,
            `SUMMARY:${summary}`,
            `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
            `LOCATION:${location}`,
            `STATUS:CONFIRMED`,
            `PRIORITY:${task.priority === 'urgent' ? '1' : task.priority === 'high' ? '2' : '3'}`,
            `CATEGORIES:BEEKEEPING,APIARY`,
            `CREATED:${nowUTC}`,
            `LAST-MODIFIED:${nowUTC}`,
            `SEQUENCE:0`,
            'END:VEVENT'
        );
    });
    
    icsContent.push('END:VCALENDAR');
    
    return icsContent.join('\r\n');
}

// Generate empty ICS calendar
function generateEmptyICS() {
    const now = new Date();
    const nowUTC = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//BeeMarshall//Task Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:BeeMarshall Scheduled Tasks',
        'X-WR-TIMEZONE:UTC',
        'X-WR-CALDESC:Automatic task calendar from BeeMarshall Apiary Management',
        'END:VCALENDAR'
    ].join('\r\n');
}

// Export ICS feed URL for backend service
function getCalendarFeedURL() {
    return generateServerCalendarFeed();
}

// Display calendar subscription instructions
function showCalendarSubscriptionInstructions() {
    const feedUrl = generateServerCalendarFeed();
    
    const instructionsModal = `
        <div class="modal fade" id="calendarInstructionsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-calendar-plus"></i> Subscribe to Task Calendar
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <h6><i class="bi bi-link-45deg"></i> Your Calendar Feed URL:</h6>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" id="feedUrlInput" value="${feedUrl}" readonly>
                            <button class="btn btn-outline-primary" onclick="copyFeedUrl()">
                                <i class="bi bi-clipboard"></i> Copy
                            </button>
                        </div>
                        
                        <hr>
                        
                        <h6><i class="bi bi-google"></i> Google Calendar:</h6>
                        <ol>
                            <li>Open <a href="https://calendar.google.com" target="_blank">Google Calendar</a></li>
                            <li>Click the <strong>"+"</strong> next to "Other calendars"</li>
                            <li>Select <strong>"From URL"</strong></li>
                            <li>Paste the URL above and click <strong>"Add calendar"</strong></li>
                        </ol>
                        
                        <h6><i class="bi bi-apple"></i> Apple Calendar (macOS/iOS):</h6>
                        <ol>
                            <li>Open <strong>Calendar</strong> app</li>
                            <li>Go to <strong>File → New Calendar Subscription</strong></li>
                            <li>Paste the URL above</li>
                            <li>Configure refresh interval (e.g., "Every 5 minutes")</li>
                            <li>Click <strong>"OK"</strong></li>
                        </ol>
                        
                        <h6><i class="bi bi-microsoft"></i> Outlook:</h6>
                        <ol>
                            <li>Open Outlook and go to <strong>Calendar</strong></li>
                            <li>Click <strong>"Add calendar" → "Subscribe from web"</strong></li>
                            <li>Paste the URL above</li>
                            <li>Give it a name and select a calendar color</li>
                            <li>Click <strong>"Import"</strong></li>
                        </ol>
                        
                        <div class="alert alert-info mt-3">
                            <i class="bi bi-info-circle"></i> <strong>Tip:</strong> The calendar will automatically update when you schedule new tasks. You only need to subscribe once!
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to DOM if not already present
    let modalElement = document.getElementById('calendarInstructionsModal');
    if (modalElement) {
        modalElement.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', instructionsModal);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('calendarInstructionsModal'));
    modal.show();
}

// Helper function to copy feed URL
function copyFeedUrl() {
    const input = document.getElementById('feedUrlInput');
    input.select();
    document.execCommand('copy');
    
    const button = event.target.closest('button');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="bi bi-check"></i> Copied!';
    
    setTimeout(() => {
        button.innerHTML = originalText;
    }, 2000);
}

// Expose functions globally
window.generateServerCalendarFeed = generateServerCalendarFeed;
window.copyServerCalendarFeedLink = copyServerCalendarFeedLink;
window.generateICSCalendarFeed = generateICSCalendarFeed;
window.showCalendarSubscriptionInstructions = showCalendarSubscriptionInstructions;
window.getCalendarFeedURL = getCalendarFeedURL;
