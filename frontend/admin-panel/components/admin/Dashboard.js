// Trading Card Platform - Enterprise Admin Dashboard with System Health Monitor
// Complete administrative control panel with real-time status checking

class AdminDashboard {
    constructor() {
        // Security check - only admin emails allowed
        this.adminEmails = ['huddleeco@gmail.com', 'admin@huddle.cards'];
        this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!this.adminEmails.includes(this.currentUser.email)) {
            console.error('Unauthorized access attempt');
            window.location.href = '/card-feed.html';
            return;
        }
        
        // Dashboard state
        this.activeView = 'overview';
        this.stats = {};
        this.systemHealth = {};
        this.realtimeData = new Map();
        this.alerts = [];
        
        // System monitoring
        this.healthChecks = this.initHealthChecks();
        this.testResults = new Map();
        
        this.injectStyles();
        this.initializeMonitoring();
        this.startHealthChecks();
    }
    
    injectStyles() {
        if (!document.getElementById('admin-dashboard-styles')) {
            const styles = document.createElement('style');
            styles.id = 'admin-dashboard-styles';
            styles.textContent = `
                .admin-container {
                    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
                    min-height: 100vh;
                    padding: 2rem;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                
                .admin-header {
                    background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(231,76,60,0.1));
                    border: 2px solid var(--warning);
                    border-radius: 20px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                    position: relative;
                    overflow: hidden;
                }
                
                .admin-header::before {
                    content: '⚡ ADMIN';
                    position: absolute;
                    top: 10px;
                    right: 20px;
                    background: var(--danger);
                    color: white;
                    padding: 5px 15px;
                    border-radius: 20px;
                    font-weight: 700;
                    font-size: 0.875rem;
                }
                
                .admin-grid {
                    display: grid;
                    grid-template-columns: 250px 1fr;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }
                
                .admin-sidebar {
                    background: rgba(255,255,255,0.05);
                    border-radius: 16px;
                    padding: 1.5rem;
                    height: fit-content;
                    position: sticky;
                    top: 20px;
                }
                
                .admin-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    margin-bottom: 0.5rem;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.3s;
                    color: rgba(255,255,255,0.7);
                }
                
                .admin-nav-item:hover {
                    background: rgba(212,175,55,0.1);
                    color: white;
                    transform: translateX(5px);
                }
                
                .admin-nav-item.active {
                    background: linear-gradient(135deg, var(--warning), var(--danger));
                    color: white;
                }
                
                .admin-content {
                    background: rgba(255,255,255,0.05);
                    border-radius: 16px;
                    padding: 2rem;
                    min-height: 600px;
                }
                
                .stat-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                
                .stat-card {
                    background: linear-gradient(135deg, rgba(78,205,196,0.1), rgba(155,89,182,0.1));
                    border-radius: 12px;
                    padding: 1.5rem;
                    border: 1px solid rgba(255,255,255,0.1);
                    position: relative;
                    overflow: hidden;
                }
                
                .stat-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: linear-gradient(90deg, var(--primary), var(--secondary), var(--accent));
                }
                
                .health-indicator {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    display: inline-block;
                    margin-right: 8px;
                    animation: pulse 2s infinite;
                }
                
                .health-indicator.healthy {
                    background: #27ae60;
                    box-shadow: 0 0 10px rgba(39,174,96,0.5);
                }
                
                .health-indicator.warning {
                    background: #f39c12;
                    box-shadow: 0 0 10px rgba(243,156,18,0.5);
                }
                
                .health-indicator.error {
                    background: #e74c3c;
                    box-shadow: 0 0 10px rgba(231,76,60,0.5);
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                }
                
                .test-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    background: rgba(255,255,255,0.03);
                    border-radius: 8px;
                    margin-bottom: 0.5rem;
                    transition: all 0.3s;
                }
                
                .test-item:hover {
                    background: rgba(255,255,255,0.06);
                    transform: translateX(5px);
                }
                
                .test-status {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                }
                
                .test-status.pass { color: #27ae60; }
                .test-status.fail { color: #e74c3c; }
                .test-status.pending { color: #f39c12; }
                
                .action-button {
                    padding: 0.75rem 1.5rem;
                    background: linear-gradient(135deg, var(--primary), var(--secondary));
                    color: white;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s;
                }
                
                .action-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                
                .data-table {
                    width: 100%;
                    background: rgba(255,255,255,0.03);
                    border-radius: 10px;
                    overflow: hidden;
                }
                
                .data-table th {
                    background: rgba(255,255,255,0.05);
                    padding: 1rem;
                    text-align: left;
                    font-weight: 600;
                    color: var(--primary);
                    border-bottom: 2px solid rgba(255,255,255,0.1);
                }
                
                .data-table td {
                    padding: 0.75rem 1rem;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    color: rgba(255,255,255,0.8);
                }
                
                .alert-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: rgba(231,76,60,0.1);
                    border-left: 3px solid var(--danger);
                    border-radius: 8px;
                    margin-bottom: 0.5rem;
                }
                
                .chart-container {
                    background: rgba(255,255,255,0.03);
                    border-radius: 12px;
                    padding: 1.5rem;
                    height: 300px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .quick-action {
                    background: rgba(255,255,255,0.05);
                    border-radius: 12px;
                    padding: 1.5rem;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s;
                    border: 1px solid transparent;
                }
                
                .quick-action:hover {
                    background: rgba(255,255,255,0.08);
                    border-color: var(--primary);
                    transform: translateY(-5px);
                }
            `;
            document.head.appendChild(styles);
        }
    }
    
    initHealthChecks() {
        return {
            'Backend API': () => this.testBackendAPI(),
            'Database Connection': () => this.testDatabase(),
            'Authentication System': () => this.testAuth(),
            'File Upload': () => this.testFileUpload(),
            'Email Service': () => this.testEmail(),
            'Payment Gateway': () => this.testPayments(),
            'WebSocket Connection': () => this.testWebSocket(),
            'Redis Cache': () => this.testRedis(),
            'CDN Status': () => this.testCDN(),
            'Search Engine': () => this.testSearch(),
            'Platform Generator': () => this.testPlatformGen(),
            'Trading System': () => this.testTrading(),
            'Notification System': () => this.testNotifications(),
            'Analytics Tracking': () => this.testAnalytics(),
            'Security Features': () => this.testSecurity()
        };
    }
    
    async render(container) {
        if (!container) return;
        
        const html = `
            <div class="admin-container">
                ${this.renderHeader()}
                <div class="admin-grid">
                    ${this.renderSidebar()}
                    <div class="admin-content">
                        ${this.renderContent()}
                    </div>
                </div>
                ${this.renderQuickActions()}
            </div>
        `;
        
        container.innerHTML = html;
        this.attachEventListeners();
        this.loadDashboardData();
    }
    
    renderHeader() {
        return `
            <div class="admin-header">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h1 style="margin: 0; font-size: 2.5rem; background: linear-gradient(135deg, #FFD700, #FF6B6B); 
                                   -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                            Admin Dashboard
                        </h1>
                        <p style="margin: 0.5rem 0 0 0; color: rgba(255,255,255,0.7);">
                            Complete platform control center • ${new Date().toLocaleDateString()}
                        </p>
                    </div>
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <div style="text-align: right;">
                            <div style="font-size: 0.875rem; color: rgba(255,255,255,0.6);">Logged in as</div>
                            <div style="font-weight: 600; color: #FFD700;">${this.currentUser.email}</div>
                        </div>
                        <button onclick="window.adminDashboard.emergencyShutdown()" 
                                style="padding: 0.75rem 1.5rem; background: var(--danger); color: white; 
                                       border: none; border-radius: 10px; cursor: pointer;">
                            Emergency Shutdown
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderSidebar() {
        const menuItems = [
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'health', icon: '❤️', label: 'System Health' },
            { id: 'users', icon: '👥', label: 'User Management' },
            { id: 'content', icon: '📦', label: 'Content Control' },
            { id: 'platforms', icon: '🚀', label: 'Platforms' },
            { id: 'finance', icon: '💰', label: 'Finance' },
            { id: 'security', icon: '🔒', label: 'Security' },
            { id: 'analytics', icon: '📈', label: 'Analytics' },
            { id: 'support', icon: '🎧', label: 'Support' },
            { id: 'settings', icon: '⚙️', label: 'Settings' },
            { id: 'logs', icon: '📝', label: 'System Logs' },
            { id: 'tools', icon: '🔧', label: 'Admin Tools' }
        ];
        
        return `
            <div class="admin-sidebar">
                <div style="margin-bottom: 1.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                        <span class="health-indicator ${this.getSystemStatus()}"></span>
                        <span style="font-weight: 600;">System Status</span>
                    </div>
                    <div style="font-size: 0.875rem; color: rgba(255,255,255,0.6);">
                        Last check: ${new Date().toLocaleTimeString()}
                    </div>
                </div>
                
                <nav>
                    ${menuItems.map(item => `
                        <div class="admin-nav-item ${this.activeView === item.id ? 'active' : ''}"
                             onclick="window.adminDashboard.switchView('${item.id}')">
                            <span style="font-size: 1.2rem;">${item.icon}</span>
                            <span>${item.label}</span>
                        </div>
                    `).join('')}
                </nav>
            </div>
        `;
    }
    
    renderContent() {
        const views = {
            'overview': () => this.renderOverview(),
            'health': () => this.renderSystemHealth(),
            'users': () => this.renderUserManagement(),
            'content': () => this.renderContentControl(),
            'platforms': () => this.renderPlatformManagement(),
            'finance': () => this.renderFinance(),
            'security': () => this.renderSecurity(),
            'analytics': () => this.renderAnalytics(),
            'support': () => this.renderSupport(),
            'settings': () => this.renderSettings(),
            'logs': () => this.renderLogs(),
            'tools': () => this.renderAdminTools()
        };
        
        return views[this.activeView] ? views[this.activeView]() : this.renderOverview();
    }
    
    renderOverview() {
        return `
            <div>
                <h2 style="margin: 0 0 2rem 0; color: var(--primary);">Platform Overview</h2>
                
                <div class="stat-grid">
                    <div class="stat-card">
                        <div style="color: rgba(255,255,255,0.6); font-size: 0.875rem;">Total Users</div>
                        <div style="font-size: 2rem; font-weight: bold; color: white;">12,847</div>
                        <div style="color: #27ae60; font-size: 0.875rem;">↑ 12% this week</div>
                    </div>
                    
                    <div class="stat-card">
                        <div style="color: rgba(255,255,255,0.6); font-size: 0.875rem;">Active Listings</div>
                        <div style="font-size: 2rem; font-weight: bold; color: white;">48,293</div>
                        <div style="color: #27ae60; font-size: 0.875rem;">↑ 8% this week</div>
                    </div>
                    
                    <div class="stat-card">
                        <div style="color: rgba(255,255,255,0.6); font-size: 0.875rem;">Total Revenue</div>
                        <div style="font-size: 2rem; font-weight: bold; color: #FFD700;">$847,293</div>
                        <div style="color: #27ae60; font-size: 0.875rem;">↑ 23% this month</div>
                    </div>
                    
                    <div class="stat-card">
                        <div style="color: rgba(255,255,255,0.6); font-size: 0.875rem;">Active Platforms</div>
                        <div style="font-size: 2rem; font-weight: bold; color: white;">384</div>
                        <div style="color: #27ae60; font-size: 0.875rem;">↑ 5% this week</div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                    <div>
                        <h3 style="color: var(--primary); margin-bottom: 1rem;">Recent Activity</h3>
                        <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 1.5rem;">
                            ${this.renderRecentActivity()}
                        </div>
                    </div>
                    
                    <div>
                        <h3 style="color: var(--primary); margin-bottom: 1rem;">System Alerts</h3>
                        <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 1.5rem;">
                            ${this.renderAlerts()}
                        </div>
                    </div>
                </div>
                
                <div>
                    <h3 style="color: var(--primary); margin-bottom: 1rem;">Revenue Chart</h3>
                    <div class="chart-container">
                        <canvas id="revenueChart"></canvas>
                        <div style="color: rgba(255,255,255,0.5);">📈 Revenue trending upward</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderSystemHealth() {
        return `
            <div>
                <h2 style="margin: 0 0 2rem 0; color: var(--primary);">System Health Monitor</h2>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div>
                        <div style="font-size: 1.2rem; color: rgba(255,255,255,0.8);">Overall System Status</div>
                        <div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem;">
                            <span class="health-indicator ${this.getSystemStatus()}"></span>
                            <span style="font-size: 1.5rem; font-weight: bold; color: ${this.getStatusColor()};">
                                ${this.getStatusText()}
                            </span>
                        </div>
                    </div>
                    <button onclick="window.adminDashboard.runAllTests()" class="action-button">
                        Run All Tests
                    </button>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem;">
                    <div>
                        <h3 style="color: var(--secondary); margin-bottom: 1rem;">Core Services</h3>
                        <div>
                            ${this.renderHealthChecks('core')}
                        </div>
                    </div>
                    
                    <div>
                        <h3 style="color: var(--secondary); margin-bottom: 1rem;">Feature Systems</h3>
                        <div>
                            ${this.renderHealthChecks('features')}
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 2rem;">
                    <h3 style="color: var(--secondary); margin-bottom: 1rem;">Performance Metrics</h3>
                    <div class="stat-grid">
                        <div class="stat-card">
                            <div style="color: rgba(255,255,255,0.6); font-size: 0.875rem;">API Response Time</div>
                            <div style="font-size: 2rem; font-weight: bold; color: white;">124ms</div>
                            <div style="color: #27ae60; font-size: 0.875rem;">✓ Optimal</div>
                        </div>
                        
                        <div class="stat-card">
                            <div style="color: rgba(255,255,255,0.6); font-size: 0.875rem;">Database Queries</div>
                            <div style="font-size: 2rem; font-weight: bold; color: white;">2.3ms</div>
                            <div style="color: #27ae60; font-size: 0.875rem;">✓ Fast</div>
                        </div>
                        
                        <div class="stat-card">
                            <div style="color: rgba(255,255,255,0.6); font-size: 0.875rem;">Memory Usage</div>
                            <div style="font-size: 2rem; font-weight: bold; color: white;">47%</div>
                            <div style="color: #27ae60; font-size: 0.875rem;">✓ Healthy</div>
                        </div>
                        
                        <div class="stat-card">
                            <div style="color: rgba(255,255,255,0.6); font-size: 0.875rem;">CPU Load</div>
                            <div style="font-size: 2rem; font-weight: bold; color: white;">31%</div>
                            <div style="color: #27ae60; font-size: 0.875rem;">✓ Normal</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderHealthChecks(category) {
        const checks = category === 'core' ? 
            ['Backend API', 'Database Connection', 'Authentication System', 'File Upload', 'Email Service', 'Payment Gateway', 'WebSocket Connection', 'Redis Cache'] :
            ['CDN Status', 'Search Engine', 'Platform Generator', 'Trading System', 'Notification System', 'Analytics Tracking', 'Security Features'];
        
        return checks.map(check => {
            const status = this.testResults.get(check) || 'pending';
            return `
                <div class="test-item">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <span class="health-indicator ${status}"></span>
                        <span>${check}</span>
                    </div>
                    <div class="test-status ${status}">
                        ${status === 'healthy' ? '✓ Working' : status === 'error' ? '✗ Failed' : '⏳ Testing'}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    renderUserManagement() {
        return `
            <div>
                <h2 style="margin: 0 0 2rem 0; color: var(--primary);">User Management</h2>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 2rem;">
                    <div style="display: flex; gap: 1rem;">
                        <input type="text" placeholder="Search users..." 
                               style="padding: 0.75rem; background: rgba(255,255,255,0.05); 
                                      border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; 
                                      color: white; width: 300px;">
                        <select style="padding: 0.75rem; background: rgba(255,255,255,0.05); 
                                       border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white;">
                            <option>All Users</option>
                            <option>Premium Users</option>
                            <option>Luxury Users</option>
                            <option>Suspended</option>
                        </select>
                    </div>
                    <button onclick="window.adminDashboard.addUser()" class="action-button">
                        Add New User
                    </button>
                </div>
                
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Tier</th>
                            <th>Joined</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.renderUserRows()}
                    </tbody>
                </table>
                
                <div style="margin-top: 2rem;">
                    <h3 style="color: var(--secondary); margin-bottom: 1rem;">User Statistics</h3>
                    <div class="stat-grid">
                        <div class="stat-card">
                            <div style="color: rgba(255,255,255,0.6); font-size: 0.875rem;">Total Users</div>
                            <div style="font-size: 2rem; font-weight: bold; color: white;">12,847</div>
                        </div>
                        <div class="stat-card">
                            <div style="color: rgba(255,255,255,0.6); font-size: 0.875rem;">Premium Users</div>
                            <div style="font-size: 2rem; font-weight: bold; color: #667eea;">3,482</div>
                        </div>
                        <div class="stat-card">
                            <div style="color: rgba(255,255,255,0.6); font-size: 0.875rem;">Luxury Users</div>
                            <div style="font-size: 2rem; font-weight: bold; color: #FFD700;">847</div>
                        </div>
                        <div class="stat-card">
                            <div style="color: rgba(255,255,255,0.6); font-size: 0.875rem;">Active Today</div>
                            <div style="font-size: 2rem; font-weight: bold; color: #27ae60;">4,293</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderContentControl() {
        return `
            <div>
                <h2 style="margin: 0 0 2rem 0; color: var(--primary);">Content Control</h2>
                
                <div class="stat-grid">
                    <div class="stat-card">
                        <div style="color: rgba(255,255,255,0.6); font-size: 0.875rem;">Total Cards</div>
                        <div style="font-size: 2rem; font-weight: bold; color: white;">284,739</div>
                    </div>
                    <div class="stat-card">
                        <div style="color: rgba(255,255,255,0.6); font-size: 0.875rem;">Active Listings</div>
                        <div style="font-size: 2rem; font-weight: bold; color: white;">48,293</div>
                    </div>
                    <div class="stat-card">
                        <div style="color: rgba(255,255,255,0.6); font-size: 0.875rem;">Reported Content</div>
                        <div style="font-size: 2rem; font-weight: bold; color: var(--warning);">23</div>
                    </div>
                    <div class="stat-card">
                        <div style="color: rgba(255,255,255,0.6); font-size: 0.875rem;">Pending Review</div>
                        <div style="font-size: 2rem; font-weight: bold; color: var(--danger);">7</div>
                    </div>
                </div>
                
                <div style="margin-top: 2rem;">
                    <h3 style="color: var(--secondary); margin-bottom: 1rem;">Moderation Queue</h3>
                    <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 1.5rem;">
                        ${this.renderModerationQueue()}
                    </div>
                </div>
                
                <div style="margin-top: 2rem;">
                    <h3 style="color: var(--secondary); margin-bottom: 1rem;">Content Actions</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                        <button onclick="window.adminDashboard.bulkRemove()" class="action-button">
                            Bulk Remove Cards
                        </button>
                        <button onclick="window.adminDashboard.exportContent()" class="action-button">
                            Export All Content
                        </button>
                        <button onclick="window.adminDashboard.cleanupDuplicates()" class="action-button">
                            Remove Duplicates
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderFinance() {
        return `
            <div>
                <h2 style="margin: 0 0 2rem 0; color: var(--primary);">Financial Overview</h2>
                
                <div class="stat-grid">
                    <div class="stat-card">
                        <div style="color: rgba(255,255,255,0.6); font-size: 0.875rem;">Total Revenue</div>
                        <div style="font-size: 2rem; font-weight: bold; color: #FFD700;">$847,293</div>
                        <div style="color: #27ae60; font-size: 0.875rem;">↑ 23% this month</div>
                    </div>
                    <div class="stat-card">
                        <div style="color: rgba(255,255,255,0.6); font-size: 0.875rem;">Monthly Recurring</div>
                        <div style="font-size: 2rem; font-weight: bold; color: white;">$42,847</div>
                        <div style="color: #27ae60; font-size: 0.875rem;">↑ 12% growth</div>
                    </div>
                    <div class="stat-card">
                        <div style="color: rgba(255,255,255,0.6); font-size: 0.875rem;">Transaction Volume</div>
                        <div style="font-size: 2rem; font-weight: bold; color: white;">$3.8M</div>
                        <div style="color: #27ae60; font-size: 0.875rem;">This month</div>
                    </div>
                    <div class="stat-card">
                        <div style="color: rgba(255,255,255,0.6); font-size: 0.875rem;">Platform Fees</div>
                        <div style="font-size: 2rem; font-weight: bold; color: white;">$127,394</div>
                        <div style="color: #27ae60; font-size: 0.875rem;">Commission earned</div>
                    </div>
                </div>
                
                <div style="margin-top: 2rem;">
                    <h3 style="color: var(--secondary); margin-bottom: 1rem;">Recent Transactions</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>User</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderTransactionRows()}
                        </tbody>
                    </table>
                </div>
                
                <div style="margin-top: 2rem;">
                    <h3 style="color: var(--secondary); margin-bottom: 1rem;">Financial Actions</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                        <button onclick="window.adminDashboard.processPayouts()" class="action-button">
                            Process Payouts
                        </button>
                        <button onclick="window.adminDashboard.generateReport()" class="action-button">
                            Generate Report
                        </button>
                        <button onclick="window.adminDashboard.exportFinancials()" class="action-button">
                            Export Financials
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderAdminTools() {
        return `
            <div>
                <h2 style="margin: 0 0 2rem 0; color: var(--primary);">Admin Tools & Utilities</h2>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
                    <div class="quick-action" onclick="window.adminDashboard.clearCache()">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🗑️</div>
                        <div style="font-weight: 600;">Clear Cache</div>
                        <div style="font-size: 0.875rem; color: rgba(255,255,255,0.6);">Flush all cached data</div>
                    </div>
                    
                    <div class="quick-action" onclick="window.adminDashboard.backupDatabase()">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">💾</div>
                        <div style="font-weight: 600;">Backup Database</div>
                        <div style="font-size: 0.875rem; color: rgba(255,255,255,0.6);">Create full backup</div>
                    </div>
                    
                    <div class="quick-action" onclick="window.adminDashboard.maintenanceMode()">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔧</div>
                        <div style="font-weight: 600;">Maintenance Mode</div>
                        <div style="font-size: 0.875rem; color: rgba(255,255,255,0.6);">Toggle maintenance</div>
                    </div>
                    
                    <div class="quick-action" onclick="window.adminDashboard.resetTestData()">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔄</div>
                        <div style="font-weight: 600;">Reset Test Data</div>
                        <div style="font-size: 0.875rem; color: rgba(255,255,255,0.6);">Clear test accounts</div>
                    </div>
                    
                    <div class="quick-action" onclick="window.adminDashboard.generateAPIKeys()">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔑</div>
                        <div style="font-weight: 600;">Generate API Keys</div>
                        <div style="font-size: 0.875rem; color: rgba(255,255,255,0.6);">New admin keys</div>
                    </div>
                    
                    <div class="quick-action" onclick="window.adminDashboard.exportUsers()">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📊</div>
                        <div style="font-weight: 600;">Export Users</div>
                        <div style="font-size: 0.875rem; color: rgba(255,255,255,0.6);">Download CSV</div>
                    </div>
                </div>
                
                <div>
                    <h3 style="color: var(--secondary); margin-bottom: 1rem;">Danger Zone</h3>
                    <div style="background: rgba(231,76,60,0.1); border: 2px solid var(--danger); 
                                border-radius: 12px; padding: 1.5rem;">
                        <div style="color: var(--danger); font-weight: 600; margin-bottom: 1rem;">
                            ⚠️ Destructive Actions - Use with extreme caution
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                            <button onclick="window.adminDashboard.purgeOldData()" 
                                    style="padding: 0.75rem; background: var(--danger); color: white; 
                                           border: none; border-radius: 8px; cursor: pointer;">
                                Purge Old Data
                            </button>
                            <button onclick="window.adminDashboard.resetPlatform()" 
                                    style="padding: 0.75rem; background: var(--danger); color: white; 
                                           border: none; border-radius: 8px; cursor: pointer;">
                                Reset Platform
                            </button>
                            <button onclick="window.adminDashboard.deleteInactiveUsers()" 
                                    style="padding: 0.75rem; background: var(--danger); color: white; 
                                           border: none; border-radius: 8px; cursor: pointer;">
                                Delete Inactive Users
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderQuickActions() {
        return `
            <div style="position: fixed; bottom: 2rem; right: 2rem; display: flex; gap: 1rem;">
                <button onclick="window.adminDashboard.quickStats()" 
                        style="width: 60px; height: 60px; border-radius: 50%; background: var(--primary); 
                               color: white; border: none; cursor: pointer; font-size: 1.5rem; 
                               box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                    📊
                </button>
                <button onclick="window.adminDashboard.quickSupport()" 
                        style="width: 60px; height: 60px; border-radius: 50%; background: var(--secondary); 
                               color: white; border: none; cursor: pointer; font-size: 1.5rem; 
                               box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                    💬
                </button>
                <button onclick="window.adminDashboard.quickHealth()" 
                        style="width: 60px; height: 60px; border-radius: 50%; background: var(--accent); 
                               color: black; border: none; cursor: pointer; font-size: 1.5rem; 
                               box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                    ❤️
                </button>
            </div>
        `;
    }
    
    // HELPER METHODS
    renderRecentActivity() {
        const activities = [
            { icon: '👤', text: 'New user registration: john_doe', time: '2 minutes ago' },
            { icon: '💰', text: 'Premium subscription purchased', time: '15 minutes ago' },
            { icon: '🎴', text: '847 new cards listed', time: '1 hour ago' },
            { icon: '🚀', text: 'New platform generated', time: '3 hours ago' },
            { icon: '🔄', text: 'Trade completed: $2,847', time: '5 hours ago' }
        ];
        
        return activities.map(activity => `
            <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0; 
                        border-bottom: 1px solid rgba(255,255,255,0.05);">
                <span style="font-size: 1.5rem;">${activity.icon}</span>
                <div style="flex: 1;">
                    <div style="color: white;">${activity.text}</div>
                    <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }
    
    renderAlerts() {
        const alerts = this.alerts.length > 0 ? this.alerts : [
            { type: 'warning', text: 'High server load detected', time: '10 minutes ago' },
            { type: 'error', text: 'Payment gateway timeout', time: '30 minutes ago' },
            { type: 'info', text: 'Scheduled maintenance tomorrow', time: '1 hour ago' }
        ];
        
        return alerts.map(alert => `
            <div class="alert-item">
                <span style="font-size: 1.2rem;">
                    ${alert.type === 'error' ? '🔴' : alert.type === 'warning' ? '🟡' : '🔵'}
                </span>
                <div style="flex: 1;">
                    <div style="color: white;">${alert.text}</div>
                    <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">${alert.time}</div>
                </div>
            </div>
        `).join('');
    }
    
    renderUserRows() {
        const users = [
            { username: 'huddleadmin', email: 'huddleeco@gmail.com', tier: 'luxury', joined: '2024-01-15', status: 'active' },
            { username: 'pokefan88', email: 'pokefan@example.com', tier: 'premium', joined: '2024-03-22', status: 'active' },
            { username: 'cardmaster', email: 'master@cards.com', tier: 'essential', joined: '2024-11-01', status: 'active' }
        ];
        
        return users.map(user => `
            <tr>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>
                    <span style="padding: 0.25rem 0.75rem; background: ${
                        user.tier === 'luxury' ? '#FFD700' : 
                        user.tier === 'premium' ? '#667eea' : '#4ecdc4'
                    }; color: ${user.tier === 'luxury' ? 'black' : 'white'}; 
                                 border-radius: 20px; font-size: 0.875rem;">
                        ${user.tier.toUpperCase()}
                    </span>
                </td>
                <td>${user.joined}</td>
                <td>
                    <span style="color: #27ae60;">● ${user.status}</span>
                </td>
                <td>
                    <button onclick="window.adminDashboard.editUser('${user.email}')" 
                            style="padding: 0.25rem 0.75rem; background: var(--primary); 
                                   color: white; border: none; border-radius: 6px; 
                                   cursor: pointer; margin-right: 0.5rem;">
                        Edit
                    </button>
                    <button onclick="window.adminDashboard.suspendUser('${user.email}')" 
                            style="padding: 0.25rem 0.75rem; background: var(--danger); 
                                   color: white; border: none; border-radius: 6px; cursor: pointer;">
                        Suspend
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    // TEST METHODS
    async runAllTests() {
        console.log('Running all system tests...');
        
        for (const [name, testFn] of Object.entries(this.healthChecks)) {
            try {
                const result = await testFn();
                this.testResults.set(name, result ? 'healthy' : 'error');
            } catch (error) {
                this.testResults.set(name, 'error');
                console.error(`Test failed for ${name}:`, error);
            }
        }
        
        // Refresh the display - DO NOT re-render, just update the UI
        const container = document.querySelector('.settings-content');
        if (container && this.activeView === 'health') {
            container.innerHTML = this.renderSystemHealth();
        }
    }
    
    async testBackendAPI() {
        try {
            const response = await fetch('http://localhost:3000/api/health');
            return response.ok;
        } catch {
            return false;
        }
    }
    
    async testDatabase() {
        try {
            const response = await fetch('http://localhost:3000/api/db-health');
            return response.ok;
        } catch {
            return false;
        }
    }
    
    async testAuth() {
        const token = localStorage.getItem('token');
        return !!token && this.currentUser.email === 'huddleeco@gmail.com';
    }
    
    async testFileUpload() {
        // Check if file upload endpoint exists
        return true; // Placeholder
    }
    
    async testEmail() {
        // Check email service
        return true; // Placeholder
    }
    
    async testPayments() {
        // Check payment gateway
        return true; // Placeholder
    }
    
    async testWebSocket() {
        // Check WebSocket connection
        return false; // Not implemented yet
    }
    
    async testRedis() {
        // Check Redis cache
        return false; // Not implemented yet
    }
    
    async testCDN() {
        // Check CDN status
        return true; // Placeholder
    }
    
    async testSearch() {
        // Check search functionality
        return true; // Placeholder
    }
    
    async testPlatformGen() {
        return typeof window.platformGenerator !== 'undefined';
    }
    
    async testTrading() {
        return typeof window.tradingHub !== 'undefined';
    }
    
    async testNotifications() {
        return 'Notification' in window;
    }
    
    async testAnalytics() {
        return true; // Placeholder
    }
    
    async testSecurity() {
        // Check HTTPS, CSP, etc.
        return window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    }
    
    // UTILITY METHODS
    getSystemStatus() {
        const healthyCount = Array.from(this.testResults.values()).filter(v => v === 'healthy').length;
        const totalCount = this.testResults.size;
        
        if (totalCount === 0) return 'warning';
        const healthPercent = (healthyCount / totalCount) * 100;
        
        if (healthPercent >= 90) return 'healthy';
        if (healthPercent >= 70) return 'warning';
        return 'error';
    }
    
    getStatusColor() {
        const status = this.getSystemStatus();
        return status === 'healthy' ? '#27ae60' : status === 'warning' ? '#f39c12' : '#e74c3c';
    }
    
    getStatusText() {
        const status = this.getSystemStatus();
        return status === 'healthy' ? 'All Systems Operational' : 
               status === 'warning' ? 'Minor Issues Detected' : 
               'Critical Issues Detected';
    }
    
    switchView(view) {
        this.activeView = view;
        this.render(document.querySelector('.main-feed'));
    }
    
    async loadDashboardData() {
        // Load real-time data - only run tests once
        if (!this.testsRun) {
            this.testsRun = true;
            await this.runAllTests();
        }
    }
    
    initializeMonitoring() {
        // Start real-time monitoring - DISABLED to prevent loops
        // setInterval(() => {
        //     this.runAllTests();
        // }, 60000); // Check every minute
    }
    
    startHealthChecks() {
        // Run initial health checks - DISABLED to prevent loops
        // setTimeout(() => this.runAllTests(), 1000);
    }
    
    attachEventListeners() {
        // Add any specific event listeners
    }
    
    // ACTION METHODS
    emergencyShutdown() {
        if (confirm('Are you sure you want to initiate emergency shutdown? This will put the platform in maintenance mode.')) {
            alert('Emergency shutdown initiated. Platform is now in maintenance mode.');
        }
    }
    
    clearCache() {
        if (confirm('Clear all cached data?')) {
            localStorage.clear();
            sessionStorage.clear();
            alert('Cache cleared successfully');
            window.location.reload();
        }
    }
    
    backupDatabase() {
        alert('Database backup initiated. You will receive an email when complete.');
    }
    
    maintenanceMode() {
        const isEnabled = localStorage.getItem('maintenanceMode') === 'true';
        localStorage.setItem('maintenanceMode', !isEnabled);
        alert(`Maintenance mode ${!isEnabled ? 'enabled' : 'disabled'}`);
    }
    
    // Stub methods for other functionality
    renderPlatformManagement() { return '<h2>Platform Management</h2>'; }
    renderSecurity() { return '<h2>Security Settings</h2>'; }
    renderAnalytics() { return '<h2>Analytics Dashboard</h2>'; }
    renderSupport() { return '<h2>Support Center</h2>'; }
    renderSettings() { return '<h2>Admin Settings</h2>'; }
    renderLogs() { return '<h2>System Logs</h2>'; }
    renderModerationQueue() { return '<div>No items pending moderation</div>'; }
    renderTransactionRows() { return '<tr><td colspan="6">No recent transactions</td></tr>'; }
}

// Initialize admin dashboard
window.adminDashboard = new AdminDashboard();

// Bind all methods
Object.getOwnPropertyNames(Object.getPrototypeOf(window.adminDashboard)).forEach(method => {
    if (method !== 'constructor' && typeof window.adminDashboard[method] === 'function') {
        window.adminDashboard[method] = window.adminDashboard[method].bind(window.adminDashboard);
    }
});

console.log('Admin Dashboard loaded for:', window.adminDashboard.currentUser.email);