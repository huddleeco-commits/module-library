// Trading Card Platform - Enterprise Settings Panel with Full Security
// XSS Protection, CSRF Tokens, Content Security Policy, Input Validation

class SecureSettingsPanel {
    constructor() {
        // Security tokens
        this.csrfToken = this.generateCSRFToken();
        this.sessionId = this.generateSessionId();
        
        // Settings state
        this.settings = {
            profile: {},
            notifications: {},
            privacy: {},
            trading: {},
            display: {},
            api: {},
            platform: {},
            security: {}
        };
        
        this.activeTab = 'profile';
        this.unsavedChanges = false;
        this.apiKeys = [];
        this.webhooks = [];
        this.loginActivity = [];
        
        // Security features
        this.rateLimiter = new Map();
        this.validationRules = this.initValidationRules();
        
        this.injectStyles();
        this.initializeSecurity();
        this.loadSettings();
    }
    
    // SECURITY METHODS
    initializeSecurity() {
        // Content Security Policy
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
        document.head.appendChild(meta);
        
        // XSS Protection
        this.xssProtector = typeof DOMPurify !== 'undefined' ? DOMPurify : {
            sanitize: (html) => this.escapeHtml(html)
        };
        
        // CSRF Protection
        this.attachCSRFToken();
    }
    
    generateCSRFToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    attachCSRFToken() {
        // Attach CSRF token to all requests
        const originalFetch = window.fetch;
        window.fetch = (url, options = {}) => {
            if (options.method && options.method !== 'GET') {
                options.headers = {
                    ...options.headers,
                    'X-CSRF-Token': this.csrfToken
                };
            }
            return originalFetch(url, options);
        };
    }
    
    validateInput(value, type) {
        const rules = this.validationRules[type];
        if (!rules) return { valid: true };
        
        if (rules.required && !value) {
            return { valid: false, error: 'This field is required' };
        }
        
        if (rules.pattern && !rules.pattern.test(value)) {
            return { valid: false, error: rules.error };
        }
        
        if (rules.maxLength && value.length > rules.maxLength) {
            return { valid: false, error: `Maximum ${rules.maxLength} characters allowed` };
        }
        
        return { valid: true };
    }
    
    initValidationRules() {
        return {
            email: {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                error: 'Please enter a valid email address',
                required: true
            },
            phone: {
                pattern: /^[\d\s\-\+\(\)]+$/,
                error: 'Please enter a valid phone number'
            },
            url: {
                pattern: /^https?:\/\/.+\..+/,
                error: 'Please enter a valid URL starting with http:// or https://'
            },
            apiKey: {
                pattern: /^[A-Za-z0-9_\-]{32,}$/,
                error: 'API key must be at least 32 characters'
            },
            text: {
                maxLength: 500,
                pattern: /^[^<>]*$/,
                error: 'Invalid characters detected'
            }
        };
    }
    
    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/\//g, "&#x2F;");
    }
    
    sanitizeHTML(html) {
        return this.xssProtector.sanitize(html, {
            ALLOWED_TAGS: ['div', 'span', 'h3', 'p', 'button', 'input', 'label', 'select', 'option', 'textarea', 'i'],
            ALLOWED_ATTR: ['class', 'style', 'type', 'value', 'onclick', 'onchange', 'placeholder', 'id', 'data-*']
        });
    }
    
    // RATE LIMITING
    checkRateLimit(action) {
        const now = Date.now();
        const limit = { max: 10, window: 60000 }; // 10 requests per minute
        
        if (!this.rateLimiter.has(action)) {
            this.rateLimiter.set(action, []);
        }
        
        const attempts = this.rateLimiter.get(action).filter(time => now - time < limit.window);
        
        if (attempts.length >= limit.max) {
            return false;
        }
        
        attempts.push(now);
        this.rateLimiter.set(action, attempts);
        return true;
    }
    
    injectStyles() {
        if (!document.getElementById('secure-settings-styles')) {
            const styles = document.createElement('style');
            styles.id = 'secure-settings-styles';
            styles.textContent = `
                .settings-container {
                    padding: 2rem;
                    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
                    border-radius: 20px;
                    min-height: calc(100vh - 100px);
                    position: relative;
                }
                
                .settings-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 2rem;
                    background: linear-gradient(135deg, rgba(78,205,196,0.05), rgba(155,89,182,0.05));
                    border-radius: 15px;
                    margin: -2rem -2rem 2rem -2rem;
                    border-bottom: 2px solid var(--border);
                }
                
                .settings-layout {
                    display: grid;
                    grid-template-columns: 250px 1fr;
                    gap: 2rem;
                }
                
                .settings-sidebar {
                    background: var(--surface);
                    border-radius: 16px;
                    padding: 1.5rem;
                    border: 1px solid var(--border);
                    height: fit-content;
                    position: sticky;
                    top: 20px;
                }
                
                .settings-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                
                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.3s;
                    color: var(--text-secondary);
                    border: 1px solid transparent;
                    user-select: none;
                }
                
                .nav-item:hover {
                    background: rgba(78,205,196,0.1);
                    color: var(--text-primary);
                    transform: translateX(5px);
                }
                
                .nav-item.active {
                    background: linear-gradient(135deg, var(--primary), var(--secondary));
                    color: white;
                    border-color: var(--primary);
                }
                
                .settings-content {
                    background: var(--surface);
                    border-radius: 16px;
                    padding: 2rem;
                    border: 1px solid var(--border);
                }
                
                .section-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: var(--primary);
                    margin-bottom: 2rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                
                .setting-group {
                    margin-bottom: 2.5rem;
                    padding-bottom: 2rem;
                    border-bottom: 1px solid var(--border);
                }
                
                .setting-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding: 1rem;
                    background: var(--bg-primary);
                    border-radius: 10px;
                    transition: all 0.3s;
                }
                
                .toggle-switch {
                    width: 50px;
                    height: 26px;
                    background: var(--bg-secondary);
                    border-radius: 13px;
                    position: relative;
                    cursor: pointer;
                    transition: background 0.3s;
                    border: 1px solid var(--border);
                }
                
                .toggle-switch.active {
                    background: var(--primary);
                }
                
                .toggle-slider {
                    width: 22px;
                    height: 22px;
                    background: white;
                    border-radius: 50%;
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    transition: transform 0.3s;
                }
                
                .toggle-switch.active .toggle-slider {
                    transform: translateX(24px);
                }
                
                .input-field {
                    padding: 0.75rem;
                    background: var(--bg-primary);
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    color: var(--text-primary);
                    font-size: 1rem;
                    transition: all 0.3s;
                    width: 100%;
                }
                
                .input-field:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(78,205,196,0.1);
                }
                
                .input-error {
                    border-color: var(--danger) !important;
                }
                
                .error-message {
                    color: var(--danger);
                    font-size: 0.875rem;
                    margin-top: 0.25rem;
                }
                
                .success-badge {
                    background: var(--success);
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.875rem;
                    display: inline-block;
                }
                
                .warning-badge {
                    background: var(--warning);
                    color: black;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.875rem;
                    display: inline-block;
                }
                
                .danger-zone {
                    background: rgba(231,76,60,0.1);
                    border: 2px solid var(--danger);
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-top: 2rem;
                }
                
                @media (max-width: 768px) {
                    .settings-layout {
                        grid-template-columns: 1fr;
                    }
                    
                    .settings-sidebar {
                        position: relative;
                        top: 0;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
    }
    
    async render(container) {
        if (!container) return;
        
        // Load fresh data from backend
        await this.syncWithBackend();
        
        const html = `
            <div class="settings-container">
                ${this.renderHeader()}
                <div class="settings-layout">
                    ${this.renderSidebar()}
                    <div class="settings-content">
                        ${this.renderContent()}
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = this.sanitizeHTML(html);
        this.attachEventListeners();
    }
    
    renderHeader() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return `
            <div class="settings-header">
                <div>
                    <h2 style="margin: 0; font-size: 2rem; background: linear-gradient(135deg, var(--primary), var(--secondary)); 
                               -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        Settings & Preferences
                    </h2>
                    <p style="margin-top: 0.5rem; color: var(--text-muted);">
                        ${this.escapeHtml(user.email || 'Manage your account settings')}
                    </p>
                </div>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    ${this.unsavedChanges ? `
                        <span class="warning-badge">Unsaved Changes</span>
                    ` : ''}
                    <button onclick="window.settingsPanel.saveAll()" 
                            style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, var(--primary), var(--secondary)); 
                                   color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-save"></i> Save All Changes
                    </button>
                </div>
            </div>
        `;
    }
    
    renderSidebar() {
        const tabs = [
            { id: 'profile', icon: '👤', label: 'Profile' },
            { id: 'notifications', icon: '🔔', label: 'Notifications' },
            { id: 'privacy', icon: '🔒', label: 'Privacy & Security' },
            { id: 'trading', icon: '💱', label: 'Trading' },
            { id: 'display', icon: '🎨', label: 'Display' },
            { id: 'api', icon: '🔌', label: 'API & Webhooks' },
            { id: 'platform', icon: '🚀', label: 'Platforms' },
            { id: 'billing', icon: '💳', label: 'Billing' }
        ];
        
        return `
            <div class="settings-sidebar">
                <div class="settings-nav">
                    ${tabs.map(tab => `
                        <div class="nav-item ${this.activeTab === tab.id ? 'active' : ''}" 
                             onclick="window.settingsPanel.switchTab('${tab.id}')">
                            <span style="font-size: 1.2rem; width: 24px; text-align: center;">${tab.icon}</span>
                            <span>${tab.label}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    renderContent() {
        const renders = {
            'profile': () => this.renderProfile(),
            'notifications': () => this.renderNotifications(),
            'privacy': () => this.renderPrivacy(),
            'trading': () => this.renderTrading(),
            'display': () => this.renderDisplay(),
            'api': () => this.renderAPI(),
            'platform': () => this.renderPlatform(),
            'billing': () => this.renderBilling()
        };
        
        return renders[this.activeTab] ? renders[this.activeTab]() : this.renderProfile();
    }
    
    renderProfile() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return `
            <div class="section-title">
                <i class="fas fa-user-circle"></i>
                Profile Settings
            </div>
            
            <div class="setting-group">
                <h3 style="color: var(--text-primary); margin-bottom: 1.5rem;">Personal Information</h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                    <div>
                        <label style="color: var(--text-muted); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">
                            Username
                        </label>
                        <input type="text" class="input-field" id="username" 
                               value="${this.escapeHtml(user.username || '')}" 
                               onchange="window.settingsPanel.updateField('profile', 'username', this.value)"
                               readonly style="opacity: 0.7; cursor: not-allowed;">
                        <small style="color: var(--text-muted);">Username cannot be changed</small>
                    </div>
                    
                    <div>
                        <label style="color: var(--text-muted); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">
                            Display Name
                        </label>
                        <input type="text" class="input-field" id="displayName" 
                               value="${this.escapeHtml(this.settings.profile.displayName || user.displayName || '')}" 
                               onchange="window.settingsPanel.updateField('profile', 'displayName', this.value)">
                    </div>
                    
                    <div>
                        <label style="color: var(--text-muted); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">
                            Email
                        </label>
                        <input type="email" class="input-field" id="email" 
                               value="${this.escapeHtml(user.email || '')}"
                               onchange="window.settingsPanel.updateField('profile', 'email', this.value)">
                        <div id="email-error" class="error-message"></div>
                    </div>
                    
                    <div>
                        <label style="color: var(--text-muted); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">
                            Phone
                        </label>
                        <input type="tel" class="input-field" id="phone" 
                               value="${this.escapeHtml(this.settings.profile.phone || '')}"
                               onchange="window.settingsPanel.updateField('profile', 'phone', this.value)">
                    </div>
                    
                    <div>
                        <label style="color: var(--text-muted); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">
                            Location
                        </label>
                        <input type="text" class="input-field" id="location" 
                               value="${this.escapeHtml(this.settings.profile.location || '')}"
                               onchange="window.settingsPanel.updateField('profile', 'location', this.value)"
                               maxlength="100">
                    </div>
                    
                    <div>
                        <label style="color: var(--text-muted); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">
                            Timezone
                        </label>
                        <select class="input-field" onchange="window.settingsPanel.updateField('profile', 'timezone', this.value)">
                            <option value="EST">Eastern Time</option>
                            <option value="CST">Central Time</option>
                            <option value="MST">Mountain Time</option>
                            <option value="PST">Pacific Time</option>
                        </select>
                    </div>
                </div>
                
                <div style="margin-top: 1.5rem;">
                    <label style="color: var(--text-muted); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">
                        Bio
                    </label>
                    <textarea class="input-field" rows="4" style="resize: vertical;" maxlength="500"
                              onchange="window.settingsPanel.updateField('profile', 'bio', this.value)">${this.escapeHtml(this.settings.profile.bio || '')}</textarea>
                    <small style="color: var(--text-muted);">Maximum 500 characters</small>
                </div>
            </div>
            
            <div class="setting-group">
                <h3 style="color: var(--text-primary); margin-bottom: 1.5rem;">Social Links</h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                    <div>
                        <label style="color: var(--text-muted); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">
                            <i class="fab fa-twitter"></i> Twitter
                        </label>
                        <input type="text" class="input-field" placeholder="@username"
                               value="${this.escapeHtml(this.settings.profile.twitter || '')}"
                               onchange="window.settingsPanel.updateField('profile', 'twitter', this.value)">
                    </div>
                    
                    <div>
                        <label style="color: var(--text-muted); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">
                            <i class="fab fa-instagram"></i> Instagram
                        </label>
                        <input type="text" class="input-field" placeholder="username"
                               value="${this.escapeHtml(this.settings.profile.instagram || '')}"
                               onchange="window.settingsPanel.updateField('profile', 'instagram', this.value)">
                    </div>
                    
                    <div>
                        <label style="color: var(--text-muted); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">
                            <i class="fab fa-discord"></i> Discord
                        </label>
                        <input type="text" class="input-field" placeholder="Username#0000"
                               value="${this.escapeHtml(this.settings.profile.discord || '')}"
                               onchange="window.settingsPanel.updateField('profile', 'discord', this.value)">
                    </div>
                </div>
            </div>
        `;
    }
    
    renderNotifications() {
        return `
            <div class="section-title">
                <i class="fas fa-bell"></i>
                Notification Preferences
            </div>
            
            <div class="setting-group">
                <h3 style="color: var(--text-primary); margin-bottom: 1.5rem;">Email Notifications</h3>
                
                ${this.renderToggle('notifications', 'emailTrades', 'New Trade Offers', 'Get notified when someone sends you a trade offer')}
                ${this.renderToggle('notifications', 'emailMessages', 'Direct Messages', 'Receive email for new messages')}
                ${this.renderToggle('notifications', 'emailPriceAlerts', 'Price Alerts', 'Get notified when cards hit target prices')}
                ${this.renderToggle('notifications', 'emailNewsletter', 'Newsletter', 'Weekly market updates and trends')}
            </div>
            
            <div class="setting-group">
                <h3 style="color: var(--text-primary); margin-bottom: 1.5rem;">Push Notifications</h3>
                
                ${this.renderToggle('notifications', 'pushEnabled', 'Enable Push Notifications', 'Browser notifications for real-time updates')}
                ${this.renderToggle('notifications', 'pushTrades', 'Trade Activity', 'Instant alerts for trades')}
                ${this.renderToggle('notifications', 'pushGrading', 'Grading Updates', 'Card grading status changes')}
            </div>
            
            <div class="setting-group">
                <h3 style="color: var(--text-primary); margin-bottom: 1.5rem;">Notification Schedule</h3>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem;">
                    <div>
                        <label style="color: var(--text-muted); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">
                            Quiet Hours Start
                        </label>
                        <input type="time" class="input-field" value="${this.settings.notifications.quietStart || '22:00'}"
                               onchange="window.settingsPanel.updateField('notifications', 'quietStart', this.value)">
                    </div>
                    <div>
                        <label style="color: var(--text-muted); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">
                            Quiet Hours End
                        </label>
                        <input type="time" class="input-field" value="${this.settings.notifications.quietEnd || '08:00'}"
                               onchange="window.settingsPanel.updateField('notifications', 'quietEnd', this.value)">
                    </div>
                </div>
            </div>
        `;
    }
    
    renderPrivacy() {
        return `
            <div class="section-title">
                <i class="fas fa-shield-alt"></i>
                Privacy & Security
            </div>
            
            <div class="setting-group">
                <h3 style="color: var(--text-primary); margin-bottom: 1.5rem;">Profile Visibility</h3>
                
                ${this.renderToggle('privacy', 'publicProfile', 'Public Profile', 'Allow anyone to view your profile')}
                ${this.renderToggle('privacy', 'showCollection', 'Show Collection', 'Display your collection publicly')}
                ${this.renderToggle('privacy', 'showStats', 'Show Statistics', 'Make trading stats visible')}
                ${this.renderToggle('privacy', 'allowMessages', 'Allow Messages', 'Let users send you messages')}
            </div>
            
            <div class="setting-group">
                <h3 style="color: var(--text-primary); margin-bottom: 1.5rem;">Two-Factor Authentication</h3>
                
                <div style="background: rgba(78,205,196,0.1); border: 2px solid var(--primary); border-radius: 12px; padding: 1.5rem;">
                    ${this.settings.privacy.twoFactorEnabled ? `
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                            <span class="success-badge">✓ 2FA Enabled</span>
                            <span>Your account is protected with two-factor authentication</span>
                        </div>
                        <button onclick="window.settingsPanel.disable2FA()" 
                                style="padding: 0.75rem 1.5rem; background: var(--danger); color: white; 
                                       border: none; border-radius: 10px; cursor: pointer;">
                            Disable 2FA
                        </button>
                    ` : `
                        <div style="text-align: center;">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">🔐</div>
                            <p style="margin-bottom: 1.5rem;">Enhance your account security with 2FA</p>
                            <button onclick="window.settingsPanel.enable2FA()" 
                                    style="padding: 0.75rem 1.5rem; background: var(--primary); color: white; 
                                           border: none; border-radius: 10px; cursor: pointer;">
                                Enable 2FA
                            </button>
                        </div>
                    `}
                </div>
            </div>
            
            <div class="setting-group">
                <h3 style="color: var(--text-primary); margin-bottom: 1.5rem;">Recent Login Activity</h3>
                
                <div style="background: var(--bg-primary); border-radius: 10px; padding: 1rem; max-height: 300px; overflow-y: auto;">
                    ${this.loginActivity.length > 0 ? this.loginActivity.map(activity => `
                        <div style="display: flex; justify-content: space-between; padding: 0.75rem; border-bottom: 1px solid var(--border);">
                            <div>
                                <div style="font-weight: 600;">${this.escapeHtml(activity.device)}</div>
                                <div style="color: var(--text-muted); font-size: 0.875rem;">${this.escapeHtml(activity.location)}</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 0.875rem;">${new Date(activity.time).toLocaleDateString()}</div>
                                <div style="color: ${activity.current ? 'var(--success)' : 'var(--text-muted)'}; font-size: 0.875rem;">
                                    ${activity.current ? 'Current Session' : ''}
                                </div>
                            </div>
                        </div>
                    `).join('') : `
                        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                            No recent activity to display
                        </div>
                    `}
                </div>
            </div>
        `;
    }
    
    renderTrading() {
        return `
            <div class="section-title">
                <i class="fas fa-exchange-alt"></i>
                Trading Preferences
            </div>
            
            <div class="setting-group">
                <h3 style="color: var(--text-primary); margin-bottom: 1.5rem;">Trade Settings</h3>
                
                ${this.renderToggle('trading', 'autoDecline', 'Auto-Decline Low Offers', 'Automatically decline offers below 70% of asking')}
                ${this.renderToggle('trading', 'requireVerification', 'Require Verification', 'Only trade with verified users')}
                ${this.renderToggle('trading', 'escrowEnabled', 'Use Escrow Service', 'Secure high-value trades')}
                
                <div style="margin-top: 1.5rem;">
                    <label style="color: var(--text-muted); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">
                        Minimum Trade Value ($)
                    </label>
                    <input type="number" class="input-field" placeholder="0" min="0" max="10000"
                           value="${this.settings.trading.minValue || 0}"
                           onchange="window.settingsPanel.updateField('trading', 'minValue', this.value)">
                </div>
            </div>
            
            <div class="setting-group">
                <h3 style="color: var(--text-primary); margin-bottom: 1.5rem;">Shipping Preferences</h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                    <div>
                        <label style="color: var(--text-muted); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">
                            Default Shipping Method
                        </label>
                        <select class="input-field" onchange="window.settingsPanel.updateField('trading', 'shippingMethod', this.value)">
                            <option value="standard" ${this.settings.trading.shippingMethod === 'standard' ? 'selected' : ''}>Standard (3-5 days)</option>
                            <option value="express" ${this.settings.trading.shippingMethod === 'express' ? 'selected' : ''}>Express (1-2 days)</option>
                            <option value="overnight" ${this.settings.trading.shippingMethod === 'overnight' ? 'selected' : ''}>Overnight</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="color: var(--text-muted); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">
                            Handling Time
                        </label>
                        <select class="input-field" onchange="window.settingsPanel.updateField('trading', 'handlingTime', this.value)">
                            <option value="same" ${this.settings.trading.handlingTime === 'same' ? 'selected' : ''}>Same Day</option>
                            <option value="1" ${this.settings.trading.handlingTime === '1' ? 'selected' : ''}>1 Business Day</option>
                            <option value="2" ${this.settings.trading.handlingTime === '2' ? 'selected' : ''}>2 Business Days</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderDisplay() {
        const themes = [
            { id: 'dark-vault', name: 'Dark Vault', colors: ['#1a1a2e', '#d4af37'] },
            { id: 'graded-gem', name: 'Graded Gem', colors: ['#ffffff', '#9b59b6'] },
            { id: 'vintage', name: 'Vintage Shop', colors: ['#8b4513', '#f4e4c1'] },
            { id: 'neon', name: 'Neon Market', colors: ['#0a0a0a', '#00ffff'] },
            { id: 'minimal', name: 'Minimal Pro', colors: ['#000000', '#ffffff'] },
            { id: 'royal', name: 'Royal Purple', colors: ['#4a148c', '#ffd700'] }
        ];
        
        return `
            <div class="section-title">
                <i class="fas fa-palette"></i>
                Display & Theme
            </div>
            
            <div class="setting-group">
                <h3 style="color: var(--text-primary); margin-bottom: 1.5rem;">Theme Selection</h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1rem;">
                    ${themes.map(theme => `
                        <div onclick="window.settingsPanel.selectTheme('${theme.id}')" 
                             style="padding: 1rem; border-radius: 10px; border: 2px solid ${this.settings.display.theme === theme.id ? 'var(--primary)' : 'var(--border)'}; 
                                    cursor: pointer; transition: all 0.3s; text-align: center;">
                            <div style="width: 100%; height: 60px; border-radius: 6px; margin-bottom: 0.5rem; 
                                        background: linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]});"></div>
                            <div style="font-weight: 600; font-size: 0.875rem;">${theme.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="setting-group">
                <h3 style="color: var(--text-primary); margin-bottom: 1.5rem;">Display Options</h3>
                
                ${this.renderToggle('display', 'animations', 'Enable Animations', 'Show smooth transitions')}
                ${this.renderToggle('display', 'compactMode', 'Compact Mode', 'Reduce spacing')}
                ${this.renderToggle('display', 'highContrast', 'High Contrast', 'Improve readability')}
                ${this.renderToggle('display', 'reduceMotion', 'Reduce Motion', 'Minimize animations')}
            </div>
        `;
    }
    
    renderAPI() {
        return `
            <div class="section-title">
                <i class="fas fa-code"></i>
                API & Webhooks
            </div>
            
            <div class="setting-group">
                <h3 style="color: var(--text-primary); margin-bottom: 1.5rem;">API Keys</h3>
                
                <div style="margin-bottom: 1.5rem;">
                    ${this.apiKeys.length > 0 ? this.apiKeys.map(key => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; 
                                    background: var(--bg-primary); border-radius: 10px; margin-bottom: 1rem;">
                            <div>
                                <div style="font-weight: 600;">${this.escapeHtml(key.name)}</div>
                                <div style="font-family: monospace; color: var(--primary); margin: 0.5rem 0;">
                                    ${key.visible ? key.value : '••••••••••••••••••••••••••••'}
                                </div>
                                <div style="color: var(--text-muted); font-size: 0.875rem;">
                                    Created: ${new Date(key.created).toLocaleDateString()}
                                </div>
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button onclick="window.settingsPanel.toggleKeyVisibility('${key.id}')" 
                                        style="padding: 0.5rem 1rem; background: var(--surface); border: 1px solid var(--border); 
                                               border-radius: 6px; cursor: pointer; color: var(--text-primary);">
                                    ${key.visible ? 'Hide' : 'Show'}
                                </button>
                                <button onclick="window.settingsPanel.copyKey('${key.id}')" 
                                        style="padding: 0.5rem 1rem; background: var(--primary); border: none; 
                                               border-radius: 6px; cursor: pointer; color: white;">
                                    Copy
                                </button>
                                <button onclick="window.settingsPanel.deleteKey('${key.id}')" 
                                        style="padding: 0.5rem 1rem; background: var(--danger); border: none; 
                                               border-radius: 6px; cursor: pointer; color: white;">
                                    Delete
                                </button>
                            </div>
                        </div>
                    `).join('') : `
                        <div style="text-align: center; padding: 2rem; background: var(--bg-primary); border-radius: 10px;">
                            <div style="font-size: 2rem; margin-bottom: 1rem;">🔑</div>
                            <p style="color: var(--text-muted);">No API keys generated yet</p>
                        </div>
                    `}
                </div>
                
                <button onclick="window.settingsPanel.generateAPIKey()" 
                        style="padding: 0.75rem 1.5rem; background: var(--primary); color: white; 
                               border: none; border-radius: 10px; cursor: pointer;">
                    Generate New API Key
                </button>
            </div>
            
            <div class="setting-group">
                <h3 style="color: var(--text-primary); margin-bottom: 1.5rem;">Webhooks</h3>
                
                <div style="margin-bottom: 1.5rem;">
                    ${this.webhooks.length > 0 ? this.webhooks.map(webhook => `
                        <div style="display: grid; grid-template-columns: 1fr auto; gap: 1rem; padding: 1rem; 
                                    background: var(--bg-primary); border-radius: 10px; margin-bottom: 1rem;">
                            <div>
                                <div style="font-family: monospace; color: var(--text-secondary); word-break: break-all;">
                                    ${this.escapeHtml(webhook.url)}
                                </div>
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                                    <span style="width: 8px; height: 8px; border-radius: 50%; 
                                                 background: ${webhook.active ? 'var(--success)' : 'var(--danger)'};"></span>
                                    <span style="font-size: 0.875rem; color: var(--text-muted);">
                                        ${webhook.active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            <button onclick="window.settingsPanel.deleteWebhook('${webhook.id}')" 
                                    style="padding: 0.5rem 1rem; background: var(--danger); color: white; 
                                           border: none; border-radius: 6px; cursor: pointer; height: fit-content;">
                                Delete
                            </button>
                        </div>
                    `).join('') : `
                        <div style="text-align: center; padding: 2rem; background: var(--bg-primary); border-radius: 10px;">
                            <div style="font-size: 2rem; margin-bottom: 1rem;">🔗</div>
                            <p style="color: var(--text-muted);">No webhooks configured</p>
                        </div>
                    `}
                </div>
                
                <button onclick="window.settingsPanel.addWebhook()" 
                        style="padding: 0.75rem 1.5rem; background: var(--primary); color: white; 
                               border: none; border-radius: 10px; cursor: pointer;">
                    Add Webhook Endpoint
                </button>
            </div>
        `;
    }
    
    renderPlatform() {
        const platforms = JSON.parse(localStorage.getItem('userPlatforms') || '[]');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        return `
            <div class="section-title">
                <i class="fas fa-rocket"></i>
                Platform Settings
            </div>
            
            <div class="setting-group">
                <h3 style="color: var(--text-primary); margin-bottom: 1.5rem;">Your Platforms</h3>
                
                ${platforms.length > 0 ? platforms.map(platform => `
                    <div style="background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(99,102,241,0.1)); 
                                border: 2px solid var(--accent); border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                            <div>
                                <div style="font-size: 1.2rem; font-weight: 600; color: var(--accent);">
                                    ${this.escapeHtml(platform.name)}
                                </div>
                                <div style="color: var(--text-muted);">
                                    ${this.escapeHtml(platform.subdomain)}.huddle.cards
                                </div>
                            </div>
                            <span class="success-badge">Active</span>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem;">
                            <div>
                                <div style="color: var(--text-muted); font-size: 0.875rem;">Tier</div>
                                <div style="font-size: 1.2rem; font-weight: bold;">
                                    ${this.escapeHtml(platform.tier?.toUpperCase() || 'ESSENTIAL')}
                                </div>
                            </div>
                            <div>
                                <div style="color: var(--text-muted); font-size: 0.875rem;">Created</div>
                                <div style="font-size: 1.2rem; font-weight: bold;">
                                    ${new Date(platform.createdAt || Date.now()).toLocaleDateString()}
                                </div>
                            </div>
                            <div>
                                <div style="color: var(--text-muted); font-size: 0.875rem;">Status</div>
                                <div style="font-size: 1.2rem; font-weight: bold; color: var(--success);">
                                    Live
                                </div>
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                            <button onclick="window.open('/generated-platforms/viewer.html?id=${platform.id}', '_blank')" 
                                    style="padding: 0.5rem 1rem; background: var(--primary); color: white; 
                                           border: none; border-radius: 6px; cursor: pointer;">
                                View Platform
                            </button>
                            <button onclick="window.settingsPanel.managePlatform('${platform.id}')" 
                                    style="padding: 0.5rem 1rem; background: var(--surface); color: var(--text-primary); 
                                           border: 1px solid var(--border); border-radius: 6px; cursor: pointer;">
                                Manage
                            </button>
                        </div>
                    </div>
                `).join('') : `
                    <div style="text-align: center; padding: 3rem; background: var(--bg-primary); border-radius: 12px;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">🚀</div>
                        <h3 style="color: var(--text-secondary); margin-bottom: 1rem;">No Platforms Yet</h3>
                        <p style="color: var(--text-muted); margin-bottom: 2rem;">
                            Create your own trading platform with zero fees!
                        </p>
                        <button onclick="window.platformGenerator?.open()" 
                                style="padding: 1rem 2rem; background: linear-gradient(135deg, var(--primary), var(--secondary)); 
                                       color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">
                            Generate Your First Platform
                        </button>
                    </div>
                `}
            </div>
            
            <div class="setting-group">
                <h3 style="color: var(--text-primary); margin-bottom: 1.5rem;">Platform Features</h3>
                
                ${this.renderToggle('platform', 'customDomain', 'Custom Domain', 'Use your own domain')}
                ${this.renderToggle('platform', 'analytics', 'Advanced Analytics', 'Track detailed metrics')}
                ${this.renderToggle('platform', 'aiAssistant', 'AI Assistant', 'AI-powered valuations')}
                ${this.renderToggle('platform', 'bulkImport', 'Bulk Import', 'Import via CSV')}
            </div>
        `;
    }
    
    renderBilling() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const tier = user.tier || 'essential';
        
        const plans = {
            essential: { name: 'Essential', price: 'Free', color: '#4ecdc4' },
            premium: { name: 'Premium', price: '$9.99/mo', color: '#667eea' },
            luxury: { name: 'Luxury', price: '$49.99/mo', color: '#d4af37' }
        };
        
        const currentPlan = plans[tier];
        
        return `
            <div class="section-title">
                <i class="fas fa-credit-card"></i>
                Billing & Subscription
            </div>
            
            <div class="setting-group">
                <h3 style="color: var(--text-primary); margin-bottom: 1.5rem;">Current Plan</h3>
                
                <div style="background: linear-gradient(135deg, ${currentPlan.color}22, ${currentPlan.color}44); 
                            border: 2px solid ${currentPlan.color}; border-radius: 12px; padding: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-size: 1.5rem; font-weight: 600; color: ${currentPlan.color};">
                                ${currentPlan.name} Plan
                            </div>
                            <div style="color: var(--text-muted); margin-top: 0.5rem;">
                                ${currentPlan.price}
                            </div>
                        </div>
                        ${tier !== 'luxury' ? `
                            <button onclick="window.settingsPanel.upgradePlan()" 
                                    style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #FFD700, #FFA500); 
                                           color: black; border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">
                                Upgrade Plan
                            </button>
                        ` : `
                            <span class="success-badge">Maximum Tier</span>
                        `}
                    </div>
                </div>
            </div>
            
            <div class="setting-group">
                <h3 style="color: var(--text-primary); margin-bottom: 1.5rem;">Payment Method</h3>
                
                ${tier !== 'essential' ? `
                    <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; 
                                background: var(--bg-primary); border-radius: 10px; margin-bottom: 1rem;">
                        <div style="font-size: 2rem;">💳</div>
                        <div style="flex: 1;">
                            <div>•••• •••• •••• 4242</div>
                            <div style="color: var(--text-muted); font-size: 0.875rem;">Expires 12/25</div>
                        </div>
                        <button onclick="window.settingsPanel.updatePayment()" 
                                style="padding: 0.5rem 1rem; background: var(--surface); 
                                       border: 1px solid var(--border); border-radius: 6px; 
                                       cursor: pointer; color: var(--text-primary);">
                            Update
                        </button>
                    </div>
                ` : `
                    <div style="text-align: center; padding: 2rem; background: var(--bg-primary); border-radius: 10px;">
                        <p style="color: var(--text-muted);">No payment method required for free plan</p>
                    </div>
                `}
            </div>
            
            ${tier !== 'essential' ? `
                <div class="danger-zone">
                    <div style="color: var(--danger); font-weight: 600; margin-bottom: 1rem;">Danger Zone</div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; margin-bottom: 0.5rem;">Cancel Subscription</div>
                            <div style="color: var(--text-muted); font-size: 0.875rem;">
                                Downgrade to free tier
                            </div>
                        </div>
                        <button onclick="window.settingsPanel.cancelSubscription()" 
                                style="padding: 0.75rem 1.5rem; background: var(--danger); color: white; 
                                       border: none; border-radius: 10px; cursor: pointer;">
                            Cancel Subscription
                        </button>
                    </div>
                </div>
            ` : ''}
        `;
    }
    
    renderToggle(category, key, label, description) {
        const isActive = this.settings[category]?.[key] || false;
        return `
            <div class="setting-item">
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem;">${label}</div>
                    <div style="font-size: 0.875rem; color: var(--text-muted);">${description}</div>
                </div>
                <div class="toggle-switch ${isActive ? 'active' : ''}" 
                     onclick="window.settingsPanel.toggleSetting('${category}', '${key}')">
                    <div class="toggle-slider"></div>
                </div>
            </div>
        `;
    }
    
    // DATA METHODS
    async loadSettings() {
        const token = localStorage.getItem('token');
        
        try {
            // Load from backend
            const response = await fetch('http://localhost:3000/api/user/settings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.settings = data.settings || this.settings;
                this.apiKeys = data.apiKeys || [];
                this.webhooks = data.webhooks || [];
                this.loginActivity = data.loginActivity || [];
            } else {
                // Fallback to localStorage
                this.loadLocalSettings();
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            this.loadLocalSettings();
        }
    }
    
    loadLocalSettings() {
        const saved = localStorage.getItem('userSettings');
        if (saved) {
            try {
                this.settings = JSON.parse(saved);
            } catch (e) {
                console.error('Error parsing settings:', e);
            }
        }
        
        // Load API keys
        const savedKeys = localStorage.getItem('apiKeys');
        if (savedKeys) {
            try {
                this.apiKeys = JSON.parse(savedKeys);
            } catch (e) {
                this.apiKeys = [];
            }
        }
        
        // Load webhooks
        const savedWebhooks = localStorage.getItem('webhooks');
        if (savedWebhooks) {
            try {
                this.webhooks = JSON.parse(savedWebhooks);
            } catch (e) {
                this.webhooks = [];
            }
        }
    }
    
    async saveAll() {
        if (!this.checkRateLimit('save')) {
            alert('Too many save attempts. Please wait a moment.');
            return;
        }
        
        const token = localStorage.getItem('token');
        
        // Show loading state
        const saveBtn = document.querySelector('button[onclick*="saveAll"]');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        }
        
        try {
            const response = await fetch('http://localhost:3000/api/user/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-Token': this.csrfToken
                },
                body: JSON.stringify({
                    settings: this.settings,
                    apiKeys: this.apiKeys,
                    webhooks: this.webhooks
                })
            });
            
            if (response.ok) {
                this.unsavedChanges = false;
                this.showNotification('Settings saved successfully!', 'success');
                
                // Save to localStorage as backup
                this.saveLocalSettings();
                
                // Update UI
                const container = document.querySelector('.settings-container')?.parentElement;
                if (container) this.render(container);
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            // Save locally as fallback
            this.saveLocalSettings();
            this.showNotification('Settings saved locally', 'warning');
        } finally {
            // Restore button state
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Save All Changes';
            }
        }
    }
    
    saveLocalSettings() {
        localStorage.setItem('userSettings', JSON.stringify(this.settings));
        localStorage.setItem('apiKeys', JSON.stringify(this.apiKeys));
        localStorage.setItem('webhooks', JSON.stringify(this.webhooks));
    }
    
    async syncWithBackend() {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        try {
            const response = await fetch('http://localhost:3000/api/user/sync-settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    localSettings: this.settings,
                    timestamp: Date.now()
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.settings) {
                    this.settings = { ...this.settings, ...data.settings };
                }
            }
        } catch (error) {
            console.error('Sync error:', error);
        }
    }
    
    updateField(category, key, value) {
        // Validate input
        const validation = this.validateInput(value, key === 'email' ? 'email' : key === 'phone' ? 'phone' : 'text');
        
        if (!validation.valid) {
            const errorEl = document.getElementById(`${key}-error`);
            if (errorEl) {
                errorEl.textContent = validation.error;
            }
            return;
        }
        
        if (!this.settings[category]) {
            this.settings[category] = {};
        }
        
        this.settings[category][key] = this.escapeHtml(value);
        this.unsavedChanges = true;
        
        // Update header to show unsaved changes
        const container = document.querySelector('.settings-container')?.parentElement;
        if (container) {
            const header = document.querySelector('.settings-header');
            if (header && !header.querySelector('.warning-badge')) {
                const headerDiv = header.querySelector('div:last-child');
                const badge = document.createElement('span');
                badge.className = 'warning-badge';
                badge.textContent = 'Unsaved Changes';
                headerDiv.insertBefore(badge, headerDiv.firstChild);
            }
        }
    }
    
    toggleSetting(category, key) {
        if (!this.settings[category]) {
            this.settings[category] = {};
        }
        
        this.settings[category][key] = !this.settings[category][key];
        this.unsavedChanges = true;
        
        const container = document.querySelector('.settings-container')?.parentElement;
        if (container) this.render(container);
    }
    
    switchTab(tab) {
        this.activeTab = tab;
        const container = document.querySelector('.settings-container')?.parentElement;
        if (container) this.render(container);
    }
    
    selectTheme(themeId) {
        this.settings.display.theme = themeId;
        this.unsavedChanges = true;
        
        // Apply theme immediately
        this.applyTheme(themeId);
        
        const container = document.querySelector('.settings-container')?.parentElement;
        if (container) this.render(container);
    }
    
    applyTheme(themeId) {
        // This would apply the theme to the entire application
        document.body.setAttribute('data-theme', themeId);
        localStorage.setItem('selectedTheme', themeId);
    }
    
    async generateAPIKey() {
        const name = prompt('Enter a name for this API key:');
        if (!name || !name.trim()) return;
        
        const sanitizedName = this.escapeHtml(name);
        
        const newKey = {
            id: `KEY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: sanitizedName,
            value: 'pk_live_' + this.generateSecureKey(),
            created: new Date().toISOString(),
            visible: false,
            lastUsed: null
        };
        
        this.apiKeys.push(newKey);
        this.unsavedChanges = true;
        
        const container = document.querySelector('.settings-container')?.parentElement;
        if (container) this.render(container);
    }
    
    generateSecureKey() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode.apply(null, array))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }
    
    toggleKeyVisibility(id) {
        const key = this.apiKeys.find(k => k.id === id);
        if (key) {
            key.visible = !key.visible;
            const container = document.querySelector('.settings-container')?.parentElement;
            if (container) this.render(container);
        }
    }
    
    async copyKey(id) {
        const key = this.apiKeys.find(k => k.id === id);
        if (key) {
            try {
                await navigator.clipboard.writeText(key.value);
                this.showNotification('API key copied to clipboard', 'success');
            } catch (err) {
                this.showNotification('Failed to copy key', 'error');
            }
        }
    }
    
    deleteKey(id) {
        if (!confirm('Delete this API key? This action cannot be undone.')) return;
        
        this.apiKeys = this.apiKeys.filter(k => k.id !== id);
        this.unsavedChanges = true;
        
        const container = document.querySelector('.settings-container')?.parentElement;
        if (container) this.render(container);
    }
    
    async addWebhook() {
        const url = prompt('Enter webhook URL:');
        if (!url || !url.trim()) return;
        
        // Validate URL
        const validation = this.validateInput(url, 'url');
        if (!validation.valid) {
            alert(validation.error);
            return;
        }
        
        const webhook = {
            id: `WH_${Date.now()}`,
            url: this.escapeHtml(url),
            active: true,
            created: new Date().toISOString(),
            events: ['trade.created', 'trade.accepted', 'price.alert']
        };
        
        // Test webhook
        try {
            const response = await fetch('http://localhost:3000/api/webhooks/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ url: webhook.url })
            });
            
            webhook.active = response.ok;
        } catch (error) {
            webhook.active = false;
        }
        
        this.webhooks.push(webhook);
        this.unsavedChanges = true;
        
        const container = document.querySelector('.settings-container')?.parentElement;
        if (container) this.render(container);
    }
    
    deleteWebhook(id) {
        if (!confirm('Remove this webhook?')) return;
        
        this.webhooks = this.webhooks.filter(w => w.id !== id);
        this.unsavedChanges = true;
        
        const container = document.querySelector('.settings-container')?.parentElement;
        if (container) this.render(container);
    }
    
    async enable2FA() {
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch('http://localhost:3000/api/auth/2fa/enable', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-Token': this.csrfToken
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // Show QR code modal
                const modal = document.createElement('div');
                modal.style.cssText = `
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.8); z-index: 10000;
                    display: flex; align-items: center; justify-content: center;
                `;
                
                modal.innerHTML = this.sanitizeHTML(`
                    <div style="background: var(--bg-secondary); border-radius: 20px; padding: 2rem; max-width: 400px;">
                        <h3 style="margin-bottom: 1rem;">Enable Two-Factor Authentication</h3>
                        <div style="background: white; padding: 1rem; border-radius: 10px; margin-bottom: 1rem;">
                            <img src="${data.qrCode}" alt="2FA QR Code" style="width: 100%;">
                        </div>
                        <p style="margin-bottom: 1rem;">Scan this QR code with your authenticator app</p>
                        <input type="text" id="2fa-code" placeholder="Enter 6-digit code" 
                               style="width: 100%; padding: 0.75rem; margin-bottom: 1rem;">
                        <button onclick="window.settingsPanel.verify2FA()" 
                                style="width: 100%; padding: 0.75rem; background: var(--primary); 
                                       color: white; border: none; border-radius: 10px;">
                            Verify & Enable
                        </button>
                    </div>
                `);
                
                document.body.appendChild(modal);
            }
        } catch (error) {
            console.error('2FA setup error:', error);
            alert('Failed to setup 2FA');
        }
    }
    
    async verify2FA() {
        const code = document.getElementById('2fa-code')?.value;
        if (!code) return;
        
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch('http://localhost:3000/api/auth/2fa/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code })
            });
            
            if (response.ok) {
                this.settings.privacy.twoFactorEnabled = true;
                this.saveAll();
                document.querySelector('[style*="z-index: 10000"]')?.remove();
                this.showNotification('2FA enabled successfully!', 'success');
                
                const container = document.querySelector('.settings-container')?.parentElement;
                if (container) this.render(container);
            } else {
                alert('Invalid code. Please try again.');
            }
        } catch (error) {
            alert('Verification failed');
        }
    }
    
    async disable2FA() {
        if (!confirm('Disable two-factor authentication? This will make your account less secure.')) return;
        
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch('http://localhost:3000/api/auth/2fa/disable', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-Token': this.csrfToken
                }
            });
            
            if (response.ok) {
                this.settings.privacy.twoFactorEnabled = false;
                this.saveAll();
                this.showNotification('2FA disabled', 'warning');
                
                const container = document.querySelector('.settings-container')?.parentElement;
                if (container) this.render(container);
            }
        } catch (error) {
            console.error('Error disabling 2FA:', error);
        }
    }
    
    managePlatform(platformId) {
        window.location.href = `/platform-manager.html?id=${platformId}`;
    }
    
    upgradePlan() {
        if (window.platformGenerator) {
            window.platformGenerator.open();
        } else {
            const script = document.createElement('script');
            script.src = '../components/platform-generator.js';
            script.onload = () => window.platformGenerator.open();
            document.head.appendChild(script);
        }
    }
    
    updatePayment() {
        alert('Payment update feature coming soon');
    }
    
    async cancelSubscription() {
        if (!confirm('Cancel your subscription? You will lose access to premium features.')) return;
        
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch('http://localhost:3000/api/billing/cancel', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-Token': this.csrfToken
                }
            });
            
            if (response.ok) {
                // Update user tier
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                user.tier = 'essential';
                localStorage.setItem('user', JSON.stringify(user));
                
                this.showNotification('Subscription cancelled', 'warning');
                
                // Reload page to reflect changes
                setTimeout(() => window.location.reload(), 2000);
            }
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            alert('Failed to cancel subscription');
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const colors = {
            success: 'var(--success)',
            warning: 'var(--warning)',
            error: 'var(--danger)',
            info: 'var(--primary)'
        };
        
        notification.style.cssText = `
            position: fixed; bottom: 2rem; right: 2rem;
            background: ${colors[type]}; color: white;
            padding: 1rem 1.5rem; border-radius: 10px;
            display: flex; align-items: center; gap: 0.5rem;
            animation: slideUp 0.3s ease; z-index: 10000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        `;
        
        notification.innerHTML = this.sanitizeHTML(message);
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    attachEventListeners() {
        // Warn about unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (this.unsavedChanges) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        });
        
        // Auto-save drafts
        setInterval(() => {
            if (this.unsavedChanges) {
                this.saveLocalSettings();
            }
        }, 30000); // Every 30 seconds
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveAll();
            }
            
            // ESC to cancel changes
            if (e.key === 'Escape' && this.unsavedChanges) {
                if (confirm('Discard unsaved changes?')) {
                    this.loadSettings();
                    this.unsavedChanges = false;
                    const container = document.querySelector('.settings-container')?.parentElement;
                    if (container) this.render(container);
                }
            }
        });
    }
}

// Initialize and bind to window
window.settingsPanel = new SecureSettingsPanel();

// Bind all methods to maintain context
Object.getOwnPropertyNames(Object.getPrototypeOf(window.settingsPanel)).forEach(method => {
    if (method !== 'constructor' && typeof window.settingsPanel[method] === 'function') {
        window.settingsPanel[method] = window.settingsPanel[method].bind(window.settingsPanel);
    }
});

console.log('Secure Settings Panel loaded');