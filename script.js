document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Load initial data
    fetchLeadsData();
    
    // Set up auto-refresh
    setupAutoRefresh();
    
    // Manual refresh button
    document.getElementById('manual-refresh').addEventListener('click', function() {
        fetchLeadsData();
        resetRefreshTimer();
    });
});

// Mock data storage (replaces database)
let mockLeads = [];

function fetchLeadsData() {
    // In a real implementation, this would fetch from your API
    // For this no-database version, we'll use the mock data
    
    // Calculate counts
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    
    const totalLeads = mockLeads.filter(lead => lead.status === 'approved').length;
    const todayLeads = mockLeads.filter(lead => {
        const leadDate = new Date(lead.datetime);
        return lead.status === 'approved' && leadDate >= twentyFourHoursAgo;
    }).length;
    
    // Get recent leads (last 50 approved)
    const recentLeads = mockLeads
        .filter(lead => lead.status === 'approved')
        .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
        .slice(0, 50);
    
    // Update the UI
    updateDashboard({
        total_leads: totalLeads,
        today_leads: todayLeads,
        recent_leads: recentLeads
    });
}

function updateDashboard(data) {
    // Update counters
    document.getElementById('total-leads').textContent = data.total_leads;
    document.getElementById('today-leads').textContent = data.today_leads;
    
    // Update last updated time
    const now = new Date();
    document.getElementById('last-updated').textContent = now.toLocaleString();
    
    // Update recent leads table
    updateLeadsTable(data.recent_leads);
}

function updateLeadsTable(leads) {
    const tableBody = document.getElementById('leads-table-body');
    tableBody.innerHTML = '';
    
    if (leads.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" class="no-leads">No leads found</td>';
        tableBody.appendChild(row);
        return;
    }
    
    leads.forEach(lead => {
        const row = document.createElement('tr');
        row.classList.add('new-lead');
        
        // Format datetime for better readability
        const leadDate = new Date(lead.datetime);
        const formattedDate = leadDate.toLocaleString();
        
        row.innerHTML = `
            <td>${lead.offer_id || 'N/A'}</td>
            <td>${lead.offer_name || 'Unknown Offer'}</td>
            <td>${formattedDate}</td>
            <td>${lead.country || 'Unknown'}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

function setupAutoRefresh() {
    let countdown = 10;
    const countdownElement = document.getElementById('refresh-countdown');
    
    const refreshInterval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;
        
        if (countdown <= 0) {
            fetchLeadsData();
            resetRefreshTimer();
        }
    }, 1000);
    
    window.refreshInterval = refreshInterval;
}

function resetRefreshTimer() {
    clearInterval(window.refreshInterval);
    document.getElementById('refresh-countdown').textContent = '10';
    setupAutoRefresh();
}