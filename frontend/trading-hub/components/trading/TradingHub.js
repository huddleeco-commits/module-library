// Trading Card Platform - Trading Hub Component
// Revolutionary trade system with AI-powered fair trade analysis

class TradingHub {
    constructor() {
        this.activeTrades = [];
        this.tradeHistory = [];
        this.pendingTrades = [];
        this.currentTrade = null;
        this.tradeMode = 'overview'; // overview, create, review, history
        this.selectedMyCards = [];
        this.selectedTheirCards = [];
        this.tradePartner = null;
        this.fairnessScore = 0;
        this.filters = {
            status: 'all',
            partner: '',
            dateRange: 'all'
        };
        
        this.injectStyles();
        this.loadTradeData();
    }
    
    injectStyles() {
        if (!document.getElementById('trading-hub-styles')) {
            const styles = document.createElement('style');
            styles.id = 'trading-hub-styles';
            styles.textContent = `
                .trading-hub-container {
                    padding: 2rem;
                    animation: fadeIn 0.5s ease;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .trade-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                
                .trade-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }
                
                .stat-card {
                    background: var(--surface);
                    border-radius: 16px;
                    padding: 1.5rem;
                    border: 1px solid var(--border);
                    transition: all 0.3s;
                    position: relative;
                    overflow: hidden;
                }
                
                .stat-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, var(--primary), var(--secondary));
                }
                
                .stat-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }
                
                .stat-icon {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, var(--primary), var(--secondary));
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.25rem;
                    margin-bottom: 1rem;
                }
                
                .stat-value {
                    font-size: 2rem;
                    font-weight: bold;
                    color: var(--text-primary);
                    margin-bottom: 0.25rem;
                }
                
                .stat-label {
                    color: var(--text-muted);
                    font-size: 0.875rem;
                }
                
                .trade-tabs {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    border-bottom: 2px solid var(--border);
                    padding-bottom: 0;
                }
                
                .trade-tab {
                    padding: 1rem 1.5rem;
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    position: relative;
                    transition: all 0.3s;
                    font-weight: 600;
                }
                
                .trade-tab:hover {
                    color: var(--text-primary);
                }
                
                .trade-tab.active {
                    color: var(--primary);
                }
                
                .trade-tab.active::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, var(--primary), var(--secondary));
                }
                
                .trade-builder {
                    display: grid;
                    grid-template-columns: 1fr 120px 1fr;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }
                
                .trade-side {
                    background: var(--surface);
                    border-radius: 20px;
                    padding: 2rem;
                    border: 2px solid var(--border);
                    min-height: 500px;
                }
                
                .trade-side.my-side {
                    border-color: var(--primary);
                }
                
                .trade-side.their-side {
                    border-color: var(--secondary);
                }
                
                .trade-center {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 2rem;
                }
                
                .trade-arrows {
                    font-size: 3rem;
                    color: var(--primary);
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.7; }
                }
                
                .fairness-meter {
                    width: 100%;
                    height: 120px;
                    background: var(--surface);
                    border-radius: 16px;
                    padding: 1rem;
                    border: 1px solid var(--border);
                }
                
                .fairness-bar {
                    width: 100%;
                    height: 30px;
                    background: var(--bg-primary);
                    border-radius: 15px;
                    overflow: hidden;
                    position: relative;
                    margin: 1rem 0;
                }
                
                .fairness-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--danger), var(--warning), var(--success));
                    transition: width 0.5s ease;
                    border-radius: 15px;
                }
                
                .fairness-indicator {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 4px;
                    height: 40px;
                    background: white;
                    border-radius: 2px;
                    transition: left 0.5s ease;
                    box-shadow: 0 0 10px rgba(0,0,0,0.5);
                }
                
                .card-selector {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 1rem;
                    margin-top: 1rem;
                    max-height: 300px;
                    overflow-y: auto;
                    padding: 0.5rem;
                }
                
                .selectable-card {
                    background: var(--bg-primary);
                    border-radius: 12px;
                    padding: 1rem;
                    cursor: pointer;
                    border: 2px solid transparent;
                    transition: all 0.3s;
                    position: relative;
                }
                
                .selectable-card:hover {
                    transform: translateY(-3px);
                    border-color: var(--primary);
                }
                
                .selectable-card.selected {
                    background: rgba(78, 205, 196, 0.1);
                    border-color: var(--primary);
                }
                
                .selectable-card.selected::after {
                    content: '✓';
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    background: var(--primary);
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                }
                
                .trade-card-image {
                    width: 100%;
                    height: 100px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                }
                
                .trade-item {
                    background: var(--surface);
                    border-radius: 16px;
                    padding: 1.5rem;
                    margin-bottom: 1rem;
                    border: 1px solid var(--border);
                    transition: all 0.3s;
                    cursor: pointer;
                }
                
                .trade-item:hover {
                    transform: translateX(5px);
                    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                }
                
                .trade-status {
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    display: inline-block;
                }
                
                .status-pending {
                    background: var(--warning);
                    color: black;
                }
                
                .status-accepted {
                    background: var(--success);
                    color: white;
                }
                
                .status-rejected {
                    background: var(--danger);
                    color: white;
                }
                
                .status-completed {
                    background: var(--primary);
                    color: white;
                }
                
                .trade-summary {
                    display: flex;
                    gap: 2rem;
                    align-items: center;
                    margin-top: 1rem;
                }
                
                .summary-side {
                    flex: 1;
                    padding: 1rem;
                    background: var(--bg-primary);
                    border-radius: 12px;
                }
                
                .ai-suggestion {
                    background: linear-gradient(135deg, rgba(155, 89, 182, 0.1), rgba(78, 205, 196, 0.1));
                    border: 2px solid var(--primary);
                    border-radius: 16px;
                    padding: 1.5rem;
                    margin: 2rem 0;
                }
                
                .ai-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }
                
                .ai-icon {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, var(--primary), var(--secondary));
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    animation: rotate 4s linear infinite;
                }
                
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .trade-actions {
                    display: flex;
                    gap: 1rem;
                    margin-top: 2rem;
                    justify-content: center;
                }
                
                .action-button {
                    padding: 1rem 2rem;
                    border-radius: 12px;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s;
                }
                
                .btn-primary {
                    background: linear-gradient(135deg, var(--primary), var(--secondary));
                    color: white;
                }
                
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(78, 205, 196, 0.3);
                }
                
                .btn-secondary {
                    background: var(--surface);
                    color: var(--text-primary);
                    border: 1px solid var(--border);
                }
                
                .btn-secondary:hover {
                    background: var(--bg-primary);
                }
                
                .btn-danger {
                    background: var(--danger);
                    color: white;
                }
                
                .btn-danger:hover {
                    filter: brightness(1.1);
                }
                
                .trade-chat {
                    background: var(--surface);
                    border-radius: 16px;
                    padding: 1.5rem;
                    margin-top: 2rem;
                    max-height: 300px;
                    overflow-y: auto;
                }
                
                .notification-badge {
                    background: var(--danger);
                    color: white;
                    border-radius: 10px;
                    padding: 0.125rem 0.5rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    margin-left: 0.5rem;
                }
                
                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    color: var(--text-muted);
                }
                
                .empty-icon {
                    font-size: 5rem;
                    margin-bottom: 1rem;
                    opacity: 0.3;
                }
                
                @media (max-width: 1024px) {
                    .trade-builder {
                        grid-template-columns: 1fr;
                    }
                    
                    .trade-center {
                        flex-direction: row;
                        padding: 1rem;
                    }
                    
                    .trade-stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                
                @media (max-width: 640px) {
                    .trade-stats-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .trade-tabs {
                        flex-wrap: wrap;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
    }
    
    render(container) {
        if (!container) return;
        
        const html = `
            <div class="trading-hub-container">
                ${this.renderHeader()}
                ${this.renderStats()}
                ${this.renderTabs()}
                ${this.renderContent()}
            </div>
        `;
        
        container.innerHTML = this.sanitizeHTML(html);
        this.attachEventListeners();
    }
    
    renderHeader() {
        return `
            <div class="trade-header">
                <div>
                    <h2 style="margin: 0; color: var(--primary);">Trading Hub</h2>
                    <p style="margin-top: 0.5rem; color: var(--text-muted);">
                        Manage your card trades with AI-powered fairness analysis
                    </p>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button onclick="window.tradingHub.startNewTrade()" 
                            class="action-button btn-primary">
                        <i class="fas fa-plus"></i> New Trade
                    </button>
                    <button onclick="window.tradingHub.viewTradeHistory()" 
                            class="action-button btn-secondary">
                        <i class="fas fa-history"></i> History
                    </button>
                </div>
            </div>
        `;
    }
    
    renderStats() {
        const completedTrades = this.tradeHistory.filter(t => t.status === 'completed').length;
        const successRate = this.tradeHistory.length > 0 ? 
            Math.round((completedTrades / this.tradeHistory.length) * 100) : 0;
        const totalValue = this.calculateTotalTradeValue();
        
        return `
            <div class="trade-stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-exchange-alt"></i>
                    </div>
                    <div class="stat-value">${this.activeTrades.length}</div>
                    <div class="stat-label">Active Trades</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-value">${this.pendingTrades.length}</div>
                    <div class="stat-label">Pending Approval</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-value">${completedTrades}</div>
                    <div class="stat-label">Completed Trades</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-percentage"></i>
                    </div>
                    <div class="stat-value">${successRate}%</div>
                    <div class="stat-label">Success Rate</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-value">$${totalValue.toLocaleString()}</div>
                    <div class="stat-label">Total Trade Value</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-star"></i>
                    </div>
                    <div class="stat-value">4.9</div>
                    <div class="stat-label">Trade Rating</div>
                </div>
            </div>
        `;
    }
    
    renderTabs() {
        return `
            <div class="trade-tabs">
                <button class="trade-tab ${this.tradeMode === 'overview' ? 'active' : ''}" 
                        onclick="window.tradingHub.setMode('overview')">
                    Active Trades ${this.activeTrades.length > 0 ? 
                        `<span class="notification-badge">${this.activeTrades.length}</span>` : ''}
                </button>
                <button class="trade-tab ${this.tradeMode === 'pending' ? 'active' : ''}" 
                        onclick="window.tradingHub.setMode('pending')">
                    Pending ${this.pendingTrades.length > 0 ? 
                        `<span class="notification-badge">${this.pendingTrades.length}</span>` : ''}
                </button>
                <button class="trade-tab ${this.tradeMode === 'create' ? 'active' : ''}" 
                        onclick="window.tradingHub.setMode('create')">
                    Create Trade
                </button>
                <button class="trade-tab ${this.tradeMode === 'history' ? 'active' : ''}" 
                        onclick="window.tradingHub.setMode('history')">
                    History
                </button>
            </div>
        `;
    }
    
    renderContent() {
        switch(this.tradeMode) {
            case 'create':
                return this.renderTradeBuilder();
            case 'pending':
                return this.renderPendingTrades();
            case 'history':
                return this.renderTradeHistory();
            case 'review':
                return this.renderTradeReview();
            default:
                return this.renderActiveTrades();
        }
    }
    
    renderTradeBuilder() {
        return `
            ${this.renderPartnerSelector()}
            
            <div class="trade-builder">
                <div class="trade-side my-side">
                    <h3 style="color: var(--primary); margin-bottom: 1rem;">
                        <i class="fas fa-user"></i> Your Cards
                    </h3>
                    <div style="margin-bottom: 1rem;">
                        <input type="text" placeholder="Search your collection..." 
                               id="myCardSearch"
                               style="width: 100%; padding: 0.75rem; background: var(--bg-primary); 
                                      border: 1px solid var(--border); border-radius: 8px; 
                                      color: var(--text-primary);">
                    </div>
                    <div class="card-selector">
                        ${this.renderMyCards()}
                    </div>
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                        <div style="color: var(--text-muted); font-size: 0.875rem;">Selected Cards Value:</div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--accent);">
                            $${this.calculateSelectedValue(this.selectedMyCards)}
                        </div>
                    </div>
                </div>
                
                <div class="trade-center">
                    <div class="trade-arrows">⇄</div>
                    ${this.renderFairnessMeter()}
                    ${this.renderAISuggestion()}
                </div>
                
                <div class="trade-side their-side">
                    <h3 style="color: var(--secondary); margin-bottom: 1rem;">
                        <i class="fas fa-user-friends"></i> Their Cards
                    </h3>
                    <div style="margin-bottom: 1rem;">
                        <input type="text" placeholder="Search their collection..." 
                               id="theirCardSearch"
                               style="width: 100%; padding: 0.75rem; background: var(--bg-primary); 
                                      border: 1px solid var(--border); border-radius: 8px; 
                                      color: var(--text-primary);">
                    </div>
                    <div class="card-selector">
                        ${this.renderTheirCards()}
                    </div>
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                        <div style="color: var(--text-muted); font-size: 0.875rem;">Selected Cards Value:</div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--accent);">
                            $${this.calculateSelectedValue(this.selectedTheirCards)}
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="background: var(--surface); border-radius: 16px; padding: 1.5rem; margin-bottom: 2rem;">
                <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-weight: 600;">
                    Trade Message (Optional)
                </label>
                <textarea id="tradeMessage" 
                          placeholder="Add a message to your trade proposal..." 
                          rows="3"
                          style="width: 100%; padding: 0.75rem; background: var(--bg-primary); 
                                 border: 1px solid var(--border); border-radius: 8px; 
                                 color: var(--text-primary); resize: vertical;"></textarea>
            </div>
            
            <div class="trade-actions">
                <button onclick="window.tradingHub.cancelTrade()" class="action-button btn-secondary">
                    Cancel
                </button>
                <button onclick="window.tradingHub.proposeTrade()" 
                        class="action-button btn-primary"
                        ${this.selectedMyCards.length === 0 || this.selectedTheirCards.length === 0 ? 'disabled' : ''}>
                    <i class="fas fa-paper-plane"></i> Send Trade Proposal
                </button>
            </div>
        `;
    }
    
    renderPartnerSelector() {
        return `
            <div style="background: var(--surface); border-radius: 16px; padding: 1.5rem; margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem;">Select Trade Partner</h3>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <input type="text" 
                           id="partnerSearch"
                           placeholder="Enter username or select from recent..." 
                           value="${this.tradePartner ? this.tradePartner.username : ''}"
                           style="flex: 1; padding: 0.75rem; background: var(--bg-primary); 
                                  border: 1px solid var(--border); border-radius: 8px; 
                                  color: var(--text-primary);">
                    <button onclick="window.tradingHub.findPartner()" 
                            class="action-button btn-secondary">
                        <i class="fas fa-search"></i> Find User
                    </button>
                </div>
                ${this.tradePartner ? `
                    <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-primary); 
                                border-radius: 12px; display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 50px; height: 50px; background: linear-gradient(135deg, var(--primary), var(--secondary)); 
                                    border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                                    color: white; font-weight: bold;">
                            ${this.tradePartner.username[0].toUpperCase()}
                        </div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600;">${this.escapeHtml(this.tradePartner.username)}</div>
                            <div style="color: var(--text-muted); font-size: 0.875rem;">
                                ${this.tradePartner.cardCount} cards • ${this.tradePartner.tradeCount} trades completed
                            </div>
                        </div>
                        <div style="color: var(--warning);">
                            ★ ${this.tradePartner.rating}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderMyCards() {
        const myCollection = this.getMyCollection();
        
        if (myCollection.length === 0) {
            return `
                <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>No cards in your collection</p>
                </div>
            `;
        }
        
        return myCollection.map(card => `
            <div class="selectable-card ${this.selectedMyCards.includes(card.id) ? 'selected' : ''}"
                 onclick="window.tradingHub.toggleMyCard('${card.id}')">
                <div class="trade-card-image">${card.emoji || '🎴'}</div>
                <div style="font-weight: 600; font-size: 0.875rem; margin-bottom: 0.25rem;">
                    ${this.escapeHtml(card.name)}
                </div>
                <div style="color: var(--text-muted); font-size: 0.75rem; margin-bottom: 0.5rem;">
                    ${this.escapeHtml(card.set)}
                </div>
                <div style="color: var(--accent); font-weight: bold;">
                    $${card.value}
                </div>
            </div>
        `).join('');
    }
    
    renderTheirCards() {
        if (!this.tradePartner) {
            return `
                <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    <i class="fas fa-user-friends" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>Select a trade partner first</p>
                </div>
            `;
        }
        
        const theirCollection = this.getTheirCollection();
        
        return theirCollection.map(card => `
            <div class="selectable-card ${this.selectedTheirCards.includes(card.id) ? 'selected' : ''}"
                 onclick="window.tradingHub.toggleTheirCard('${card.id}')">
                <div class="trade-card-image">${card.emoji || '🎴'}</div>
                <div style="font-weight: 600; font-size: 0.875rem; margin-bottom: 0.25rem;">
                    ${this.escapeHtml(card.name)}
                </div>
                <div style="color: var(--text-muted); font-size: 0.75rem; margin-bottom: 0.5rem;">
                    ${this.escapeHtml(card.set)}
                </div>
                <div style="color: var(--accent); font-weight: bold;">
                    $${card.value}
                </div>
            </div>
        `).join('');
    }
    
    renderFairnessMeter() {
        const myValue = this.calculateSelectedValue(this.selectedMyCards);
        const theirValue = this.calculateSelectedValue(this.selectedTheirCards);
        const fairness = this.calculateFairness(myValue, theirValue);
        
        return `
            <div class="fairness-meter">
                <div style="font-weight: 600; margin-bottom: 0.5rem; text-align: center;">
                    Trade Fairness: ${fairness}%
                </div>
                <div class="fairness-bar">
                    <div class="fairness-fill" style="width: 100%;"></div>
                    <div class="fairness-indicator" style="left: ${fairness}%;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
                    <span>Their favor</span>
                    <span>Fair</span>
                    <span>Your favor</span>
                </div>
            </div>
        `;
    }
    
    renderAISuggestion() {
        const myValue = this.calculateSelectedValue(this.selectedMyCards);
        const theirValue = this.calculateSelectedValue(this.selectedTheirCards);
        const difference = Math.abs(myValue - theirValue);
        
        if (this.selectedMyCards.length === 0 || this.selectedTheirCards.length === 0) {
            return '';
        }
        
        let suggestion = '';
        if (difference < 10) {
            suggestion = "This trade looks very fair! Both sides are getting similar value.";
        } else if (myValue > theirValue) {
            suggestion = `You're giving $${difference} more in value. Consider asking for another card or cash.`;
        } else {
            suggestion = `You're receiving $${difference} more in value. This is a great deal for you!`;
        }
        
        return `
            <div class="ai-suggestion">
                <div class="ai-header">
                    <div class="ai-icon">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div>
                        <div style="font-weight: 600;">AI Trade Analysis</div>
                        <div style="font-size: 0.875rem; color: var(--text-muted);">
                            Powered by market data
                        </div>
                    </div>
                </div>
                <div style="color: var(--text-primary);">
                    ${suggestion}
                </div>
            </div>
        `;
    }
    
    renderActiveTrades() {
        if (this.activeTrades.length === 0) {
            return this.renderEmptyState('active');
        }
        
        return `
            <div>
                ${this.activeTrades.map(trade => this.renderTradeItem(trade)).join('')}
            </div>
        `;
    }
    
    renderPendingTrades() {
        if (this.pendingTrades.length === 0) {
            return this.renderEmptyState('pending');
        }
        
        return `
            <div>
                ${this.pendingTrades.map(trade => this.renderPendingTradeItem(trade)).join('')}
            </div>
        `;
    }
    
    renderTradeItem(trade) {
        return `
            <div class="trade-item" onclick="window.tradingHub.viewTrade('${trade.id}')">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 50px; height: 50px; background: linear-gradient(135deg, var(--primary), var(--secondary)); 
                                    border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                                    color: white; font-weight: bold;">
                            ${trade.partner[0].toUpperCase()}
                        </div>
                        <div>
                            <div style="font-weight: 600; color: var(--text-primary);">
                                Trade with ${this.escapeHtml(trade.partner)}
                            </div>
                            <div style="color: var(--text-muted); font-size: 0.875rem;">
                                Started ${this.formatDate(trade.createdAt)}
                            </div>
                        </div>
                    </div>
                    <span class="trade-status status-${trade.status}">${trade.status.toUpperCase()}</span>
                </div>
                
                <div class="trade-summary">
                    <div class="summary-side">
                        <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">You give:</div>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            ${trade.yourCards.map(card => `
                                <span style="padding: 0.25rem 0.5rem; background: var(--surface); 
                                             border-radius: 6px; font-size: 0.875rem;">
                                    ${card.emoji} ${this.escapeHtml(card.name)}
                                </span>
                            `).join('')}
                        </div>
                        <div style="margin-top: 0.5rem; font-weight: bold; color: var(--accent);">
                            Value: $${trade.yourValue}
                        </div>
                    </div>
                    
                    <div style="font-size: 1.5rem; color: var(--primary);">⇄</div>
                    
                    <div class="summary-side">
                        <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">You receive:</div>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            ${trade.theirCards.map(card => `
                                <span style="padding: 0.25rem 0.5rem; background: var(--surface); 
                                             border-radius: 6px; font-size: 0.875rem;">
                                    ${card.emoji} ${this.escapeHtml(card.name)}
                                </span>
                            `).join('')}
                        </div>
                        <div style="margin-top: 0.5rem; font-weight: bold; color: var(--accent);">
                            Value: $${trade.theirValue}
                        </div>
                    </div>
                </div>
                
                ${trade.lastMessage ? `
                    <div style="margin-top: 1rem; padding: 0.75rem; background: var(--bg-primary); 
                                border-radius: 8px; font-size: 0.875rem; color: var(--text-muted);">
                        <i class="fas fa-comment"></i> "${this.escapeHtml(trade.lastMessage)}"
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderPendingTradeItem(trade) {
        const isIncoming = trade.initiator !== 'you';
        
        return `
            <div class="trade-item">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div>
                        <div style="font-weight: 600; color: var(--text-primary);">
                            ${isIncoming ? `${this.escapeHtml(trade.partner)} wants to trade` : 
                                          `Waiting for ${this.escapeHtml(trade.partner)} to respond`}
                        </div>
                        <div style="color: var(--text-muted); font-size: 0.875rem;">
                            ${this.formatDate(trade.createdAt)}
                        </div>
                    </div>
                    <span class="trade-status status-pending">PENDING</span>
                </div>
                
                ${this.renderTradeDetails(trade)}
                
                ${isIncoming ? `
                    <div class="trade-actions">
                        <button onclick="event.stopPropagation(); window.tradingHub.acceptTrade('${trade.id}')" 
                                class="action-button btn-primary">
                            <i class="fas fa-check"></i> Accept
                        </button>
                        <button onclick="event.stopPropagation(); window.tradingHub.counterTrade('${trade.id}')" 
                                class="action-button btn-secondary">
                            <i class="fas fa-exchange-alt"></i> Counter
                        </button>
                        <button onclick="event.stopPropagation(); window.tradingHub.rejectTrade('${trade.id}')" 
                                class="action-button btn-danger">
                            <i class="fas fa-times"></i> Reject
                        </button>
                    </div>
                ` : `
                    <div style="text-align: center; margin-top: 1rem;">
                        <button onclick="event.stopPropagation(); window.tradingHub.cancelTrade('${trade.id}')" 
                                class="action-button btn-secondary">
                            Cancel Trade
                        </button>
                    </div>
                `}
            </div>
        `;
    }
    
    renderTradeDetails(trade) {
        return `
            <div class="trade-summary">
                <div class="summary-side">
                    <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">
                        ${trade.initiator === 'you' ? 'You give:' : 'They give:'}
                    </div>
                    <div>${this.renderCardList(trade.yourCards)}</div>
                    <div style="margin-top: 0.5rem; font-weight: bold; color: var(--accent);">
                        Value: $${trade.yourValue}
                    </div>
                </div>
                
                <div style="font-size: 1.5rem; color: var(--primary);">⇄</div>
                
                <div class="summary-side">
                    <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">
                        ${trade.initiator === 'you' ? 'You receive:' : 'They receive:'}
                    </div>
                    <div>${this.renderCardList(trade.theirCards)}</div>
                    <div style="margin-top: 0.5rem; font-weight: bold; color: var(--accent);">
                        Value: $${trade.theirValue}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderCardList(cards) {
        return cards.map(card => `
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span style="font-size: 1.25rem;">${card.emoji || '🎴'}</span>
                <div>
                    <div style="font-weight: 600; font-size: 0.875rem;">
                        ${this.escapeHtml(card.name)}
                    </div>
                    <div style="color: var(--text-muted); font-size: 0.75rem;">
                        ${this.escapeHtml(card.set)} • ${card.condition}
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    renderTradeHistory() {
        if (this.tradeHistory.length === 0) {
            return this.renderEmptyState('history');
        }
        
        return `
            <div>
                <div style="margin-bottom: 2rem;">
                    <input type="text" placeholder="Search trade history..." 
                           style="width: 100%; padding: 0.75rem; background: var(--surface); 
                                  border: 1px solid var(--border); border-radius: 10px; 
                                  color: var(--text-primary);">
                </div>
                ${this.tradeHistory.map(trade => `
                    <div class="trade-item">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                            <div>
                                <div style="font-weight: 600;">
                                    Trade with ${this.escapeHtml(trade.partner)}
                                </div>
                                <div style="color: var(--text-muted); font-size: 0.875rem;">
                                    ${this.formatDate(trade.completedAt)}
                                </div>
                            </div>
                            <span class="trade-status status-${trade.status}">${trade.status.toUpperCase()}</span>
                        </div>
                        ${this.renderTradeDetails(trade)}
                        ${trade.rating ? `
                            <div style="margin-top: 1rem; color: var(--warning);">
                                ${'★'.repeat(trade.rating)}${'☆'.repeat(5 - trade.rating)}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    renderEmptyState(type) {
        const messages = {
            active: {
                icon: '🤝',
                title: 'No active trades',
                message: 'Start trading to build your collection!'
            },
            pending: {
                icon: '⏳',
                title: 'No pending trades',
                message: 'All caught up! Check back later.'
            },
            history: {
                icon: '📚',
                title: 'No trade history',
                message: 'Your completed trades will appear here.'
            }
        };
        
        const content = messages[type] || messages.active;
        
        return `
            <div class="empty-state">
                <div class="empty-icon">${content.icon}</div>
                <h3>${content.title}</h3>
                <p>${content.message}</p>
                ${type === 'active' ? `
                    <button onclick="window.tradingHub.startNewTrade()" 
                            class="action-button btn-primary" 
                            style="margin-top: 2rem;">
                        <i class="fas fa-plus"></i> Start New Trade
                    </button>
                ` : ''}
            </div>
        `;
    }
    
    // Data Methods
    loadTradeData() {
        // Load from localStorage or use demo data
        const savedTrades = localStorage.getItem('userTrades');
        if (savedTrades) {
            const data = JSON.parse(savedTrades);
            this.activeTrades = data.active || [];
            this.pendingTrades = data.pending || [];
            this.tradeHistory = data.history || [];
        } else {
            // Demo data
            this.activeTrades = [
                {
                    id: 'trade1',
                    partner: 'CardMaster92',
                    status: 'active',
                    yourCards: [
                        { id: 'c1', name: 'Pikachu VMAX', set: 'Vivid Voltage', emoji: '⚡', value: 150 }
                    ],
                    theirCards: [
                        { id: 'c2', name: 'Charizard V', set: 'Champions Path', emoji: '🔥', value: 180 }
                    ],
                    yourValue: 150,
                    theirValue: 180,
                    createdAt: new Date(Date.now() - 86400000).toISOString(),
                    lastMessage: 'Looking forward to this trade!'
                }
            ];
            
            this.pendingTrades = [
                {
                    id: 'trade2',
                    partner: 'RookieCollector',
                    status: 'pending',
                    initiator: 'them',
                    yourCards: [
                        { id: 'c3', name: 'LeBron James Rookie', set: '2003 Topps', emoji: '🏀', value: 800 }
                    ],
                    theirCards: [
                        { id: 'c4', name: 'Kobe Bryant Auto', set: '1996 Topps', emoji: '🏀', value: 750 },
                        { id: 'c5', name: 'Michael Jordan', set: '1990 Fleer', emoji: '🏀', value: 100 }
                    ],
                    yourValue: 800,
                    theirValue: 850,
                    createdAt: new Date(Date.now() - 3600000).toISOString()
                }
            ];
            
            this.tradeHistory = [
                {
                    id: 'trade3',
                    partner: 'VintageTrader',
                    status: 'completed',
                    yourCards: [
                        { id: 'c6', name: 'Black Lotus', set: 'Beta', emoji: '🌺', value: 15000 }
                    ],
                    theirCards: [
                        { id: 'c7', name: 'Mox Ruby', set: 'Beta', emoji: '💎', value: 8000 },
                        { id: 'c8', name: 'Mox Sapphire', set: 'Beta', emoji: '💎', value: 7500 }
                    ],
                    yourValue: 15000,
                    theirValue: 15500,
                    completedAt: new Date(Date.now() - 604800000).toISOString(),
                    rating: 5
                }
            ];
        }
    }
    
    saveTrades() {
        const data = {
            active: this.activeTrades,
            pending: this.pendingTrades,
            history: this.tradeHistory
        };
        localStorage.setItem('userTrades', JSON.stringify(data));
    }
    
    getMyCollection() {
        // Get from collection manager or use demo data
        if (window.collectionManager) {
            return window.collectionManager.collection.map(card => ({
                id: card.id,
                name: card.cardName,
                set: card.setName,
                value: card.value || 0,
                condition: card.condition,
                emoji: card.emoji
            }));
        }
        
        // Demo collection
        return [
            { id: 'my1', name: 'Pikachu VMAX', set: 'Vivid Voltage', value: 150, emoji: '⚡' },
            { id: 'my2', name: 'Mewtwo GX', set: 'Shining Legends', value: 85, emoji: '🔮' },
            { id: 'my3', name: 'Rayquaza VMAX', set: 'Evolving Skies', value: 200, emoji: '🐉' },
            { id: 'my4', name: 'Umbreon VMAX', set: 'Evolving Skies', value: 350, emoji: '🌙' }
        ];
    }
    
    getTheirCollection() {
        // Simulated partner collection
        return [
            { id: 'their1', name: 'Charizard VMAX', set: 'Champions Path', value: 450, emoji: '🔥' },
            { id: 'their2', name: 'Lugia V', set: 'Silver Tempest', value: 120, emoji: '🦅' },
            { id: 'their3', name: 'Giratina VSTAR', set: 'Lost Origin', value: 95, emoji: '👻' },
            { id: 'their4', name: 'Arceus VSTAR', set: 'Brilliant Stars', value: 75, emoji: '✨' }
        ];
    }
    
    // Actions
    setMode(mode) {
        this.tradeMode = mode;
        const container = document.querySelector('.trading-hub-container')?.parentElement;
        if (container) {
            this.render(container);
        }
    }
    
    startNewTrade() {
        this.tradeMode = 'create';
        this.selectedMyCards = [];
        this.selectedTheirCards = [];
        this.tradePartner = null;
        
        const container = document.querySelector('.trading-hub-container')?.parentElement;
        if (container) {
            this.render(container);
        }
    }
    
    findPartner() {
        const input = document.getElementById('partnerSearch');
        if (input && input.value) {
            // Simulate finding a partner
            this.tradePartner = {
                username: input.value,
                cardCount: Math.floor(Math.random() * 500) + 50,
                tradeCount: Math.floor(Math.random() * 100) + 10,
                rating: (Math.random() * 2 + 3).toFixed(1)
            };
            
            const container = document.querySelector('.trading-hub-container')?.parentElement;
            if (container) {
                this.render(container);
            }
        }
    }
    
    toggleMyCard(cardId) {
        const index = this.selectedMyCards.indexOf(cardId);
        if (index === -1) {
            this.selectedMyCards.push(cardId);
        } else {
            this.selectedMyCards.splice(index, 1);
        }
        
        this.updateTradeBuilder();
    }
    
    toggleTheirCard(cardId) {
        const index = this.selectedTheirCards.indexOf(cardId);
        if (index === -1) {
            this.selectedTheirCards.push(cardId);
        } else {
            this.selectedTheirCards.splice(index, 1);
        }
        
        this.updateTradeBuilder();
    }
    
    updateTradeBuilder() {
        // Update only the necessary parts
        const container = document.querySelector('.trading-hub-container')?.parentElement;
        if (container) {
            this.render(container);
        }
    }
    
    proposeTrade() {
        if (this.selectedMyCards.length === 0 || this.selectedTheirCards.length === 0) {
            alert('Please select cards from both sides');
            return;
        }
        
        const message = document.getElementById('tradeMessage')?.value || '';
        
        const newTrade = {
            id: `trade${Date.now()}`,
            partner: this.tradePartner.username,
            status: 'pending',
            initiator: 'you',
            yourCards: this.selectedMyCards.map(id => {
                const card = this.getMyCollection().find(c => c.id === id);
                return card;
            }),
            theirCards: this.selectedTheirCards.map(id => {
                const card = this.getTheirCollection().find(c => c.id === id);
                return card;
            }),
            yourValue: this.calculateSelectedValue(this.selectedMyCards),
            theirValue: this.calculateSelectedValue(this.selectedTheirCards),
            createdAt: new Date().toISOString(),
            message: message
        };
        
        this.pendingTrades.unshift(newTrade);
        this.saveTrades();
        
        alert('Trade proposal sent successfully!');
        this.setMode('pending');
    }
    
    acceptTrade(tradeId) {
        const trade = this.pendingTrades.find(t => t.id === tradeId);
        if (trade) {
            trade.status = 'active';
            this.activeTrades.push(trade);
            this.pendingTrades = this.pendingTrades.filter(t => t.id !== tradeId);
            this.saveTrades();
            
            alert('Trade accepted!');
            this.setMode('overview');
        }
    }
    
    rejectTrade(tradeId) {
        if (confirm('Are you sure you want to reject this trade?')) {
            this.pendingTrades = this.pendingTrades.filter(t => t.id !== tradeId);
            this.saveTrades();
            this.setMode('pending');
        }
    }
    
    counterTrade(tradeId) {
        const trade = this.pendingTrades.find(t => t.id === tradeId);
        if (trade) {
            // Pre-fill trade builder with current trade
            this.selectedMyCards = trade.yourCards.map(c => c.id);
            this.selectedTheirCards = trade.theirCards.map(c => c.id);
            this.tradePartner = { username: trade.partner };
            this.setMode('create');
        }
    }
    
    cancelTrade(tradeId) {
        if (tradeId) {
            if (confirm('Are you sure you want to cancel this trade?')) {
                this.pendingTrades = this.pendingTrades.filter(t => t.id !== tradeId);
                this.saveTrades();
                this.setMode('pending');
            }
        } else {
            this.setMode('overview');
        }
    }
    
    viewTrade(tradeId) {
        const trade = [...this.activeTrades, ...this.pendingTrades, ...this.tradeHistory]
            .find(t => t.id === tradeId);
        
        if (trade) {
            this.currentTrade = trade;
            this.tradeMode = 'review';
            
            const container = document.querySelector('.trading-hub-container')?.parentElement;
            if (container) {
                this.render(container);
            }
        }
    }
    
    viewTradeHistory() {
        this.setMode('history');
    }
    
    // Calculation Methods
    calculateSelectedValue(selectedIds) {
        const myCards = this.getMyCollection();
        const theirCards = this.getTheirCollection();
        const allCards = [...myCards, ...theirCards];
        
        return selectedIds.reduce((total, id) => {
            const card = allCards.find(c => c.id === id);
            return total + (card ? card.value : 0);
        }, 0);
    }
    
    calculateFairness(myValue, theirValue) {
        if (myValue === 0 && theirValue === 0) return 50;
        
        const total = myValue + theirValue;
        const myPercentage = (myValue / total) * 100;
        
        // Convert to fairness scale (0-100, where 50 is perfectly fair)
        const fairness = 100 - Math.abs(50 - myPercentage) * 2;
        return Math.max(0, Math.min(100, Math.round(fairness)));
    }
    
    calculateTotalTradeValue() {
        const completed = this.tradeHistory.filter(t => t.status === 'completed');
        return completed.reduce((total, trade) => {
            return total + trade.yourValue + trade.theirValue;
        }, 0);
    }
    
    // Utility Methods
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            if (hours === 0) {
                const minutes = Math.floor(diff / (1000 * 60));
                return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
            }
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return `${days} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    sanitizeHTML(html) {
        if (typeof DOMPurify !== 'undefined') {
            return DOMPurify.sanitize(html);
        }
        return html;
    }
    
    // Event Listeners
    attachEventListeners() {
        // Search inputs
        const mySearch = document.getElementById('myCardSearch');
        if (mySearch) {
            mySearch.addEventListener('input', (e) => {
                // Filter cards
                console.log('Searching my cards:', e.target.value);
            });
        }
        
        const theirSearch = document.getElementById('theirCardSearch');
        if (theirSearch) {
            theirSearch.addEventListener('input', (e) => {
                // Filter cards
                console.log('Searching their cards:', e.target.value);
            });
        }
    }
}

// Initialize and ensure methods are accessible
window.tradingHub = new TradingHub();

// Make methods globally accessible for onclick handlers
window.tradingHub.startNewTrade = window.tradingHub.startNewTrade.bind(window.tradingHub);
window.tradingHub.viewTradeHistory = window.tradingHub.viewTradeHistory.bind(window.tradingHub);
window.tradingHub.setMode = window.tradingHub.setMode.bind(window.tradingHub);
window.tradingHub.toggleMyCard = window.tradingHub.toggleMyCard.bind(window.tradingHub);
window.tradingHub.toggleTheirCard = window.tradingHub.toggleTheirCard.bind(window.tradingHub);
window.tradingHub.findPartner = window.tradingHub.findPartner.bind(window.tradingHub);
window.tradingHub.proposeTrade = window.tradingHub.proposeTrade.bind(window.tradingHub);
window.tradingHub.cancelTrade = window.tradingHub.cancelTrade.bind(window.tradingHub);
window.tradingHub.acceptTrade = window.tradingHub.acceptTrade.bind(window.tradingHub);
window.tradingHub.rejectTrade = window.tradingHub.rejectTrade.bind(window.tradingHub);
window.tradingHub.counterTrade = window.tradingHub.counterTrade.bind(window.tradingHub);
window.tradingHub.viewTrade = window.tradingHub.viewTrade.bind(window.tradingHub);

// Verify component loaded
console.log('Trading Hub initialized with bound methods:', window.tradingHub);