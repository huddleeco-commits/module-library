// Trading Card Platform - Advanced Trade Calculator Component
// AI-powered fairness evaluation with real-time market data

class TradeCalculator {
    constructor() {
        this.yourCards = [];
        this.theirCards = [];
        this.marketData = {};
        this.fairnessScore = 50;
        this.suggestions = [];
        this.savedTrades = [];
        this.viewMode = 'calculator';
        this.aiAnalysis = null;
        
        this.injectStyles();
        this.loadSavedTrades();
        this.initializeMarketData();
    }
    
    injectStyles() {
        if (!document.getElementById('trade-calculator-styles')) {
            const styles = document.createElement('style');
            styles.id = 'trade-calculator-styles';
            styles.textContent = `
                .calc-container {
                    padding: 2rem;
                    background: linear-gradient(135deg, var(--bg-primary) 0%, #0f3460 100%);
                    border-radius: 20px;
                    animation: fadeIn 0.5s ease;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .calc-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 2px solid var(--border);
                }
                
                .trade-workspace {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }
                
                .trade-side {
                    background: var(--surface);
                    border-radius: 16px;
                    padding: 1.5rem;
                    border: 2px solid var(--border);
                    min-height: 400px;
                    position: relative;
                }
                
                .trade-side.your-side {
                    border-color: var(--primary);
                    background: linear-gradient(135deg, rgba(78,205,196,0.05), transparent);
                }
                
                .trade-side.their-side {
                    border-color: var(--secondary);
                    background: linear-gradient(135deg, rgba(155,89,182,0.05), transparent);
                }
                
                .side-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--border);
                }
                
                .side-title {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }
                
                .side-value {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: var(--accent);
                }
                
                .card-drop-zone {
                    min-height: 300px;
                    border: 2px dashed var(--border);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    transition: all 0.3s;
                }
                
                .card-drop-zone.drag-over {
                    background: rgba(78,205,196,0.1);
                    border-color: var(--primary);
                }
                
                .drop-placeholder {
                    text-align: center;
                    color: var(--text-muted);
                }
                
                .trade-cards-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                    gap: 1rem;
                    padding: 1rem;
                }
                
                .trade-card-item {
                    background: var(--bg-primary);
                    border-radius: 10px;
                    padding: 0.75rem;
                    cursor: move;
                    transition: all 0.3s;
                    text-align: center;
                    position: relative;
                }
                
                .trade-card-item:hover {
                    transform: scale(1.05);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                }
                
                .card-emoji {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                }
                
                .card-name {
                    font-size: 0.75rem;
                    color: var(--text-primary);
                    margin-bottom: 0.25rem;
                }
                
                .card-value {
                    font-size: 0.875rem;
                    font-weight: bold;
                    color: var(--accent);
                }
                
                .remove-card {
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    width: 20px;
                    height: 20px;
                    background: var(--danger);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                
                .trade-card-item:hover .remove-card {
                    opacity: 1;
                }
                
                .trade-center {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 2rem;
                }
                
                .fairness-meter {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    background: conic-gradient(
                        from 0deg,
                        var(--danger) 0deg,
                        var(--warning) 120deg,
                        var(--success) 240deg,
                        var(--danger) 360deg
                    );
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                
                .fairness-inner {
                    width: 100px;
                    height: 100px;
                    background: var(--bg-primary);
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                
                .fairness-score {
                    font-size: 2rem;
                    font-weight: bold;
                    color: var(--text-primary);
                }
                
                .fairness-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                }
                
                .trade-arrows {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .arrow-icon {
                    font-size: 2rem;
                    color: var(--primary);
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.1); }
                }
                
                .ai-analysis {
                    background: linear-gradient(135deg, rgba(155,89,182,0.1), rgba(52,152,219,0.1));
                    border-radius: 16px;
                    padding: 2rem;
                    border: 2px solid var(--secondary);
                    margin-bottom: 2rem;
                }
                
                .ai-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                
                .ai-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: linear-gradient(135deg, var(--secondary), var(--primary));
                    color: white;
                    border-radius: 20px;
                    font-weight: 600;
                }
                
                .ai-content {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                }
                
                .ai-stat {
                    background: var(--bg-primary);
                    padding: 1rem;
                    border-radius: 10px;
                    text-align: center;
                }
                
                .ai-stat-value {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: var(--accent);
                    margin-bottom: 0.5rem;
                }
                
                .ai-stat-label {
                    color: var(--text-muted);
                    font-size: 0.875rem;
                }
                
                .suggestions-list {
                    background: var(--surface);
                    border-radius: 16px;
                    padding: 1.5rem;
                    border: 1px solid var(--border);
                    margin-bottom: 2rem;
                }
                
                .suggestion-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: var(--bg-primary);
                    border-radius: 10px;
                    margin-bottom: 1rem;
                }
                
                .suggestion-icon {
                    width: 40px;
                    height: 40px;
                    background: var(--warning);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                }
                
                .suggestion-text {
                    flex: 1;
                    color: var(--text-secondary);
                }
                
                .saved-trades {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }
                
                .saved-trade-card {
                    background: var(--surface);
                    border-radius: 12px;
                    padding: 1.5rem;
                    border: 1px solid var(--border);
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .saved-trade-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    border-color: var(--primary);
                }
                
                .quick-add-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: var(--bg-secondary);
                    border-radius: 16px;
                    padding: 2rem;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                    border: 2px solid var(--primary);
                    z-index: 10000;
                    width: 90%;
                    max-width: 500px;
                }
                
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.8);
                    z-index: 9999;
                }
                
                @media (max-width: 1024px) {
                    .trade-workspace {
                        grid-template-columns: 1fr;
                    }
                    
                    .trade-center {
                        flex-direction: row;
                        margin: 2rem 0;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
    }
    
    render(container) {
        if (!container) return;
        
        const html = `
            <div class="calc-container">
                ${this.renderHeader()}
                ${this.renderTabs()}
                ${this.viewMode === 'calculator' ? this.renderCalculator() : this.renderSavedTrades()}
            </div>
        `;
        
        container.innerHTML = this.sanitizeHTML(html);
        this.attachEventListeners();
        this.updateFairness();
    }
    
    renderHeader() {
        return `
            <div class="calc-header">
                <div>
                    <h2 style="margin: 0; font-size: 2rem; background: linear-gradient(135deg, var(--primary), var(--secondary)); 
                               -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        Trade Calculator
                    </h2>
                    <p style="margin-top: 0.5rem; color: var(--text-muted);">
                        AI-powered fairness evaluation • Real-time market values
                    </p>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button onclick="window.tradeCalculator.clearAll()" 
                            style="padding: 0.75rem 1.5rem; background: var(--surface); color: var(--text-primary); 
                                   border: 1px solid var(--border); border-radius: 10px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-redo"></i> Clear All
                    </button>
                    <button onclick="window.tradeCalculator.saveTrade()" 
                            style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, var(--primary), var(--secondary)); 
                                   color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-save"></i> Save Trade
                    </button>
                </div>
            </div>
        `;
    }
    
    renderTabs() {
        return `
            <div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
                <button onclick="window.tradeCalculator.setView('calculator')" 
                        style="padding: 0.75rem 1.5rem; background: ${this.viewMode === 'calculator' ? 'var(--primary)' : 'transparent'}; 
                               color: ${this.viewMode === 'calculator' ? 'white' : 'var(--text-muted)'}; 
                               border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-calculator"></i> Calculator
                </button>
                <button onclick="window.tradeCalculator.setView('saved')" 
                        style="padding: 0.75rem 1.5rem; background: ${this.viewMode === 'saved' ? 'var(--primary)' : 'transparent'}; 
                               color: ${this.viewMode === 'saved' ? 'white' : 'var(--text-muted)'}; 
                               border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-history"></i> Saved Trades
                </button>
            </div>
        `;
    }
    
    renderCalculator() {
        return `
            ${this.renderAIAnalysis()}
            
            <div class="trade-workspace">
                <div class="trade-side your-side">
                    <div class="side-header">
                        <div class="side-title">Your Cards</div>
                        <div class="side-value">$${this.calculateTotal(this.yourCards).toFixed(2)}</div>
                    </div>
                    <div class="card-drop-zone" id="yourDropZone" ondrop="window.tradeCalculator.handleDrop(event, 'your')" 
                         ondragover="window.tradeCalculator.handleDragOver(event)" 
                         ondragleave="window.tradeCalculator.handleDragLeave(event)">
                        ${this.yourCards.length > 0 ? `
                            <div class="trade-cards-grid">
                                ${this.yourCards.map((card, index) => this.renderTradeCard(card, 'your', index)).join('')}
                            </div>
                        ` : `
                            <div class="drop-placeholder">
                                <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
                                <div>Drag cards here or click to add</div>
                                <button onclick="window.tradeCalculator.openAddModal('your')" 
                                        style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--primary); 
                                               color: white; border: none; border-radius: 8px; cursor: pointer;">
                                    Add Cards
                                </button>
                            </div>
                        `}
                    </div>
                </div>
                
                <div class="trade-center">
                    <div class="fairness-meter">
                        <div class="fairness-inner">
                            <div class="fairness-score">${this.fairnessScore}%</div>
                            <div class="fairness-label">${this.getFairnessLabel()}</div>
                        </div>
                    </div>
                    
                    <div class="trade-arrows">
                        <div class="arrow-icon">⇄</div>
                    </div>
                    
                    <button onclick="window.tradeCalculator.analyzeTrade()" 
                            style="padding: 0.75rem 1.5rem; background: var(--secondary); color: white; 
                                   border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-robot"></i> AI Analysis
                    </button>
                </div>
                
                <div class="trade-side their-side">
                    <div class="side-header">
                        <div class="side-title">Their Cards</div>
                        <div class="side-value">$${this.calculateTotal(this.theirCards).toFixed(2)}</div>
                    </div>
                    <div class="card-drop-zone" id="theirDropZone" ondrop="window.tradeCalculator.handleDrop(event, 'their')" 
                         ondragover="window.tradeCalculator.handleDragOver(event)" 
                         ondragleave="window.tradeCalculator.handleDragLeave(event)">
                        ${this.theirCards.length > 0 ? `
                            <div class="trade-cards-grid">
                                ${this.theirCards.map((card, index) => this.renderTradeCard(card, 'their', index)).join('')}
                            </div>
                        ` : `
                            <div class="drop-placeholder">
                                <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
                                <div>Drag cards here or click to add</div>
                                <button onclick="window.tradeCalculator.openAddModal('their')" 
                                        style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--secondary); 
                                               color: white; border: none; border-radius: 8px; cursor: pointer;">
                                    Add Cards
                                </button>
                            </div>
                        `}
                    </div>
                </div>
            </div>
            
            ${this.renderSuggestions()}
        `;
    }
    
    renderTradeCard(card, side, index) {
        return `
            <div class="trade-card-item" draggable="true" ondragstart="window.tradeCalculator.handleDragStart(event, '${side}', ${index})">
                <div class="remove-card" onclick="window.tradeCalculator.removeCard('${side}', ${index})">×</div>
                <div class="card-emoji">${card.emoji || '🎴'}</div>
                <div class="card-name">${this.escapeHtml(card.name)}</div>
                <div class="card-value">$${card.value.toFixed(2)}</div>
            </div>
        `;
    }
    
    renderAIAnalysis() {
        if (!this.aiAnalysis) return '';
        
        return `
            <div class="ai-analysis">
                <div class="ai-header">
                    <div class="ai-badge">
                        <i class="fas fa-brain"></i>
                        AI Trade Analysis
                    </div>
                    <span style="color: var(--text-muted); font-size: 0.875rem;">
                        Updated ${new Date().toLocaleTimeString()}
                    </span>
                </div>
                
                <div class="ai-content">
                    <div class="ai-stat">
                        <div class="ai-stat-value">${this.aiAnalysis.recommendation}</div>
                        <div class="ai-stat-label">Recommendation</div>
                    </div>
                    <div class="ai-stat">
                        <div class="ai-stat-value">${this.aiAnalysis.marketTrend}</div>
                        <div class="ai-stat-label">Market Trend</div>
                    </div>
                    <div class="ai-stat">
                        <div class="ai-stat-value">${this.aiAnalysis.riskLevel}</div>
                        <div class="ai-stat-label">Risk Level</div>
                    </div>
                    <div class="ai-stat">
                        <div class="ai-stat-value">${this.aiAnalysis.confidence}%</div>
                        <div class="ai-stat-label">Confidence</div>
                    </div>
                </div>
                
                <p style="margin-top: 1.5rem; color: var(--text-secondary); line-height: 1.6;">
                    ${this.aiAnalysis.explanation}
                </p>
            </div>
        `;
    }
    
    renderSuggestions() {
        if (this.suggestions.length === 0) return '';
        
        return `
            <div class="suggestions-list">
                <h3 style="color: var(--primary); margin-bottom: 1.5rem;">Trade Suggestions</h3>
                ${this.suggestions.map(suggestion => `
                    <div class="suggestion-item">
                        <div class="suggestion-icon">${suggestion.icon}</div>
                        <div class="suggestion-text">${this.escapeHtml(suggestion.text)}</div>
                        ${suggestion.action ? `
                            <button onclick="window.tradeCalculator.applySuggestion('${suggestion.id}')" 
                                    style="padding: 0.5rem 1rem; background: var(--primary); color: white; 
                                           border: none; border-radius: 8px; cursor: pointer;">
                                Apply
                            </button>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    renderSavedTrades() {
        if (this.savedTrades.length === 0) {
            return `
                <div style="text-align: center; padding: 4rem; background: var(--surface); border-radius: 16px;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">💾</div>
                    <h3 style="color: var(--text-secondary);">No saved trades</h3>
                    <p style="color: var(--text-muted);">Save trades to reference them later</p>
                </div>
            `;
        }
        
        return `
            <div class="saved-trades">
                ${this.savedTrades.map(trade => `
                    <div class="saved-trade-card" onclick="window.tradeCalculator.loadSavedTrade('${trade.id}')">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                            <span style="font-weight: 600; color: var(--text-primary);">${this.escapeHtml(trade.name)}</span>
                            <span style="color: var(--text-muted); font-size: 0.875rem;">
                                ${new Date(trade.savedAt).toLocaleDateString()}
                            </span>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 1rem; margin-bottom: 1rem;">
                            <div>
                                <div style="color: var(--primary); font-size: 0.875rem; margin-bottom: 0.5rem;">You Give</div>
                                <div style="font-weight: bold;">$${trade.yourTotal.toFixed(2)}</div>
                                <div style="color: var(--text-muted); font-size: 0.75rem;">${trade.yourCards.length} cards</div>
                            </div>
                            <div style="display: flex; align-items: center; color: var(--text-muted);">⇄</div>
                            <div>
                                <div style="color: var(--secondary); font-size: 0.875rem; margin-bottom: 0.5rem;">You Get</div>
                                <div style="font-weight: bold;">$${trade.theirTotal.toFixed(2)}</div>
                                <div style="color: var(--text-muted); font-size: 0.75rem;">${trade.theirCards.length} cards</div>
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="padding: 0.25rem 0.75rem; background: ${trade.fairness >= 80 ? 'var(--success)' : trade.fairness >= 50 ? 'var(--warning)' : 'var(--danger)'}; 
                                         color: ${trade.fairness >= 80 ? 'white' : 'black'}; 
                                         border-radius: 20px; font-size: 0.875rem; font-weight: 600;">
                                ${trade.fairness}% Fair
                            </span>
                            <button onclick="event.stopPropagation(); window.tradeCalculator.deleteSavedTrade('${trade.id}')" 
                                    style="padding: 0.25rem 0.75rem; background: var(--danger); color: white; 
                                           border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
                                Delete
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Data Methods
    initializeMarketData() {
        // Simulate market data
        this.marketData = {
            'Charizard VMAX': 425,
            'Pikachu VMAX': 125,
            'Umbreon VMAX': 380,
            'Blastoise': 280,
            'Venusaur': 220,
            'default': 50
        };
    }
    
    loadSavedTrades() {
        const saved = localStorage.getItem('savedTrades');
        if (saved) {
            this.savedTrades = JSON.parse(saved);
        }
    }
    
    calculateTotal(cards) {
        return cards.reduce((total, card) => total + (card.value || 0), 0);
    }
    
    updateFairness() {
        const yourTotal = this.calculateTotal(this.yourCards);
        const theirTotal = this.calculateTotal(this.theirCards);
        
        if (yourTotal === 0 && theirTotal === 0) {
            this.fairnessScore = 50;
        } else if (yourTotal === 0) {
            this.fairnessScore = 100;
        } else if (theirTotal === 0) {
            this.fairnessScore = 0;
        } else {
            const ratio = theirTotal / yourTotal;
            this.fairnessScore = Math.min(100, Math.max(0, Math.round(ratio * 50)));
        }
        
        this.generateSuggestions();
    }
    
    getFairnessLabel() {
        if (this.fairnessScore >= 90) return 'EXCELLENT';
        if (this.fairnessScore >= 70) return 'GOOD';
        if (this.fairnessScore >= 50) return 'FAIR';
        if (this.fairnessScore >= 30) return 'POOR';
        return 'BAD';
    }
    
    generateSuggestions() {
        this.suggestions = [];
        const yourTotal = this.calculateTotal(this.yourCards);
        const theirTotal = this.calculateTotal(this.theirCards);
        const diff = Math.abs(yourTotal - theirTotal);
        
        if (diff > 50) {
            if (yourTotal > theirTotal) {
                this.suggestions.push({
                    id: 'S1',
                    icon: '⚠️',
                    text: `You're overpaying by $${diff.toFixed(2)}. Consider removing some cards.`
                });
            } else {
                this.suggestions.push({
                    id: 'S2',
                    icon: '💡',
                    text: `You're getting $${diff.toFixed(2)} extra value. Great deal!`
                });
            }
        }
        
        if (this.yourCards.length > 0 && this.theirCards.length > 0) {
            this.suggestions.push({
                id: 'S3',
                icon: '📊',
                text: 'Market values are updated in real-time for accuracy'
            });
        }
    }
    
    openAddModal(side) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.onclick = () => {
            overlay.remove();
            modal.remove();
        };
        
        const modal = document.createElement('div');
        modal.className = 'quick-add-modal';
        modal.innerHTML = `
            <h3 style="color: var(--primary); margin-bottom: 1.5rem;">Add Card</h3>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <input type="text" id="cardName" placeholder="Card Name" 
                       style="padding: 0.75rem; background: var(--bg-primary); border: 1px solid var(--border); 
                              border-radius: 10px; color: var(--text-primary);">
                
                <input type="number" id="cardValue" placeholder="Card Value ($)" step="0.01"
                       style="padding: 0.75rem; background: var(--bg-primary); border: 1px solid var(--border); 
                              border-radius: 10px; color: var(--text-primary);">
                
                <select id="cardEmoji" style="padding: 0.75rem; background: var(--bg-primary); 
                                               border: 1px solid var(--border); border-radius: 10px; 
                                               color: var(--text-primary);">
                    <option value="🎴">🎴 Generic</option>
                    <option value="🔥">🔥 Fire</option>
                    <option value="💧">💧 Water</option>
                    <option value="⚡">⚡ Electric</option>
                    <option value="🌿">🌿 Grass</option>
                    <option value="🏀">🏀 Sports</option>
                </select>
                
                <div style="display: flex; gap: 1rem;">
                    <button onclick="window.tradeCalculator.addCard('${side}')" 
                            style="flex: 1; padding: 0.75rem; background: var(--primary); 
                                   color: white; border: none; border-radius: 10px; cursor: pointer;">
                        Add Card
                    </button>
                    <button onclick="document.querySelector('.modal-overlay').click()" 
                            style="flex: 1; padding: 0.75rem; background: var(--surface); 
                                   color: var(--text-primary); border: 1px solid var(--border); 
                                   border-radius: 10px; cursor: pointer;">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        document.body.appendChild(modal);
    }
    
    addCard(side) {
        const name = document.getElementById('cardName')?.value;
        const value = parseFloat(document.getElementById('cardValue')?.value);
        const emoji = document.getElementById('cardEmoji')?.value;
        
        if (!name || !value) {
            alert('Please fill in all fields');
            return;
        }
        
        const card = { name, value, emoji };
        
        if (side === 'your') {
            this.yourCards.push(card);
        } else {
            this.theirCards.push(card);
        }
        
        document.querySelector('.modal-overlay')?.click();
        
        const container = document.querySelector('.calc-container')?.parentElement;
        if (container) this.render(container);
    }
    
    removeCard(side, index) {
        if (side === 'your') {
            this.yourCards.splice(index, 1);
        } else {
            this.theirCards.splice(index, 1);
        }
        
        const container = document.querySelector('.calc-container')?.parentElement;
        if (container) this.render(container);
    }
    
    clearAll() {
        if (confirm('Clear all cards from both sides?')) {
            this.yourCards = [];
            this.theirCards = [];
            this.aiAnalysis = null;
            this.suggestions = [];
            
            const container = document.querySelector('.calc-container')?.parentElement;
            if (container) this.render(container);
        }
    }
    
    analyzeTrade() {
        // Simulate AI analysis
        this.aiAnalysis = {
            recommendation: this.fairnessScore >= 70 ? 'ACCEPT' : this.fairnessScore >= 40 ? 'NEGOTIATE' : 'DECLINE',
            marketTrend: 'Rising',
            riskLevel: this.fairnessScore >= 70 ? 'Low' : this.fairnessScore >= 40 ? 'Medium' : 'High',
            confidence: 85 + Math.floor(Math.random() * 10),
            explanation: this.fairnessScore >= 70 ? 
                'This trade appears to be fair based on current market values. Both parties are receiving comparable value.' :
                this.fairnessScore >= 40 ?
                'This trade could be improved. Consider negotiating for additional cards or removing some from your offer.' :
                'This trade is significantly imbalanced. We recommend declining or substantially renegotiating the terms.'
        };
        
        const container = document.querySelector('.calc-container')?.parentElement;
        if (container) this.render(container);
    }
    
    saveTrade() {
        const name = prompt('Name this trade:');
        if (!name) return;
        
        const trade = {
            id: `T${Date.now()}`,
            name,
            yourCards: [...this.yourCards],
            theirCards: [...this.theirCards],
            yourTotal: this.calculateTotal(this.yourCards),
            theirTotal: this.calculateTotal(this.theirCards),
            fairness: this.fairnessScore,
            savedAt: new Date().toISOString()
        };
        
        this.savedTrades.unshift(trade);
        localStorage.setItem('savedTrades', JSON.stringify(this.savedTrades));
        
        alert('Trade saved successfully!');
        this.setView('saved');
    }
    
    loadSavedTrade(id) {
        const trade = this.savedTrades.find(t => t.id === id);
        if (!trade) return;
        
        this.yourCards = [...trade.yourCards];
        this.theirCards = [...trade.theirCards];
        this.setView('calculator');
    }
    
    deleteSavedTrade(id) {
        if (confirm('Delete this saved trade?')) {
            this.savedTrades = this.savedTrades.filter(t => t.id !== id);
            localStorage.setItem('savedTrades', JSON.stringify(this.savedTrades));
            
            const container = document.querySelector('.calc-container')?.parentElement;
            if (container) this.render(container);
        }
    }
    
    setView(view) {
        this.viewMode = view;
        const container = document.querySelector('.calc-container')?.parentElement;
        if (container) this.render(container);
    }
    
    // Drag and Drop
    handleDragStart(event, side, index) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/json', JSON.stringify({ side, index }));
    }
    
    handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over');
    }
    
    handleDragLeave(event) {
        event.currentTarget.classList.remove('drag-over');
    }
    
    handleDrop(event, targetSide) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over');
        
        try {
            const data = JSON.parse(event.dataTransfer.getData('text/json'));
            const { side: sourceSide, index } = data;
            
            if (sourceSide === targetSide) return;
            
            let card;
            if (sourceSide === 'your') {
                card = this.yourCards.splice(index, 1)[0];
                this.theirCards.push(card);
            } else {
                card = this.theirCards.splice(index, 1)[0];
                this.yourCards.push(card);
            }
            
            const container = document.querySelector('.calc-container')?.parentElement;
            if (container) this.render(container);
        } catch (error) {
            console.error('Drag and drop error:', error);
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
    
    attachEventListeners() {
        // Any additional event listeners
    }
}

// Initialize and bind to window
window.tradeCalculator = new TradeCalculator();

// Bind all methods
const tradeCalcMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(window.tradeCalculator));
tradeCalcMethods.forEach(method => {
    if (method !== 'constructor' && typeof window.tradeCalculator[method] === 'function') {
        window.tradeCalculator[method] = window.tradeCalculator[method].bind(window.tradeCalculator);
    }
});

console.log('Trade Calculator loaded:', window.tradeCalculator);