/**
 * Main Marketplace Component - Streamlined Version
 * Clean orchestrator for marketplace components
 */

import { MarketplaceFilters } from './MarketplaceFilters.js';
import { MarketplaceStats } from './MarketplaceStats.js';
import { MarketplaceGrid } from './MarketplaceGrid.js';
import { MarketplacePagination } from './MarketplacePagination.js';
import { showNotification } from '../shared/Notification.js';

// Singleton instance
let marketplaceInstance = null;

export class Marketplace {
    constructor(containerId, options = {}) {
        // Ensure singleton
        if (marketplaceInstance) {
            marketplaceInstance.destroy();
        }
        
        this.containerId = containerId;
        this.container = null;
        
        this.options = {
            itemsPerPage: 24,
            enableStats: true,
            ...options
        };
        
        // Components
        this.components = {
            filters: null,
            stats: null,
            grid: null,
            pagination: null
        };
        
        // Simple state
        this.state = {
            cards: [],
            totalItems: 0,
            currentPage: 1,
            filters: {},
            isLoading: false
        };
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize marketplace
     */
    async init() {
        try {
            // Get container
            this.container = document.getElementById(this.containerId);
            if (!this.container) {
                throw new Error(`Container "${this.containerId}" not found`);
            }
            
            // Render structure
            this.render();
            
            // Initialize components
            this.initComponents();
            
            // Load initial data
            await this.loadData();
            
            // Store instance
            marketplaceInstance = this;
            
        } catch (error) {
            console.error('Marketplace initialization failed:', error);
            this.showError(error.message);
        }
    }
    
    /**
     * Render marketplace structure
     */
    render() {
        this.container.className = 'marketplace-container';
        this.container.innerHTML = `
            <div class="marketplace-layout">
                <!-- Header -->
                <header class="marketplace-header">
                    <h1 class="marketplace-title">Card Marketplace</h1>
                    <div class="marketplace-actions">
                        <button class="btn-refresh" onclick="marketplace.refresh()">
                            <span>🔄 Refresh</span>
                        </button>
                    </div>
                </header>
                
                <!-- Filters -->
                <div id="marketplace-filters" class="marketplace-filters-top"></div>
                
                <!-- Stats (optional) -->
                ${this.options.enableStats ? 
                    '<div id="marketplace-stats" class="marketplace-stats-container"></div>' : 
                    ''}
                
                <!-- Main Content -->
                <div class="marketplace-main">
                    <div class="marketplace-content">
                        <!-- Grid -->
                        <div id="marketplace-grid" class="marketplace-grid-container"></div>
                        
                        <!-- Pagination -->
                        <div id="marketplace-pagination" class="marketplace-pagination-container"></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Initialize components
     */
    initComponents() {
        // Filters
        this.components.filters = new MarketplaceFilters({
            onFilterChange: (filters) => this.handleFilterChange(filters),
            onReset: () => this.handleFilterReset()
        });
        document.getElementById('marketplace-filters').appendChild(
            this.components.filters.render()
        );
        
        // Stats (optional)
        if (this.options.enableStats) {
            this.components.stats = new MarketplaceStats({
                autoRefresh: false
            });
            document.getElementById('marketplace-stats').appendChild(
                this.components.stats.render()
            );
        }
        
        // Grid
        this.components.grid = new MarketplaceGrid({
            itemsPerPage: this.options.itemsPerPage,
            viewMode: 'grid'
        });
        document.getElementById('marketplace-grid').appendChild(
            this.components.grid.render()
        );
        
        // Pagination
        this.components.pagination = new MarketplacePagination({
            totalItems: 0,
            itemsPerPage: this.options.itemsPerPage,
            currentPage: 1,
            onPageChange: (page) => this.handlePageChange(page),
            onItemsPerPageChange: (items) => this.handleItemsPerPageChange(items)
        });
        document.getElementById('marketplace-pagination').appendChild(
            this.components.pagination.render()
        );
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for grid events
        const gridEl = document.getElementById('marketplace-grid');
        if (gridEl) {
            // Buy now event
            gridEl.addEventListener('buy-now', (e) => {
                this.handleBuyNow(e.detail.card);
            });
            
            // Make offer event
            gridEl.addEventListener('make-offer', (e) => {
                this.handleMakeOffer(e.detail.card);
            });
            
            // Watchlist toggle
            gridEl.addEventListener('toggle-watchlist', (e) => {
                this.handleWatchlistToggle(e.detail.card);
            });
        }
    }
    
    /**
     * Load marketplace data
     */
    async loadData() {
        if (this.state.isLoading) return;
        
        this.state.isLoading = true;
        
        try {
            // Build request params
            const params = new URLSearchParams({
                page: this.state.currentPage,
                limit: this.options.itemsPerPage,
                ...this.state.filters
            });
            
            // Try API call
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/marketplace/cards?${params}`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // Update state
                this.state.cards = data.cards || [];
                this.state.totalItems = data.total || 0;
                
                // Update components
                this.updateComponents();
            } else {
                // Use empty state
                this.state.cards = [];
                this.state.totalItems = 0;
                this.updateComponents();
            }
            
        } catch (error) {
            console.error('Failed to load data:', error);
            // Components will handle empty state
            this.state.cards = [];
            this.state.totalItems = 0;
            this.updateComponents();
        } finally {
            this.state.isLoading = false;
        }
    }
    
    /**
     * Update all components
     */
    updateComponents() {
        // Update grid
        if (this.components.grid) {
            this.components.grid.updateCards(this.state.cards);
        }
        
        // Update pagination
        if (this.components.pagination) {
            this.components.pagination.updateTotalItems(this.state.totalItems);
        }
        
        // Update stats
        if (this.components.stats) {
            this.components.stats.updateStats({
                totalCards: this.state.totalItems,
                totalValue: this.calculateTotalValue(),
                averagePrice: this.calculateAveragePrice(),
                gradedPercentage: this.calculateGradedPercentage()
            });
        }
    }
    
    /**
     * Handle filter change
     */
    async handleFilterChange(filters) {
        this.state.filters = filters;
        this.state.currentPage = 1; // Reset to page 1
        
        // Reset pagination
        if (this.components.pagination) {
            this.components.pagination.reset();
        }
        
        await this.loadData();
    }
    
    /**
     * Handle filter reset
     */
    async handleFilterReset() {
        this.state.filters = {};
        this.state.currentPage = 1;
        
        if (this.components.pagination) {
            this.components.pagination.reset();
        }
        
        await this.loadData();
    }
    
    /**
     * Handle page change
     */
    async handlePageChange(page) {
        this.state.currentPage = page;
        await this.loadData();
    }
    
    /**
     * Handle items per page change
     */
    async handleItemsPerPageChange(itemsPerPage) {
        this.options.itemsPerPage = itemsPerPage;
        this.state.currentPage = 1;
        await this.loadData();
    }
    
    /**
     * Handle buy now
     */
    handleBuyNow(card) {
        // Would integrate with checkout
        showNotification(`Proceeding to checkout for ${card.name}`, 'info');
        
        // Navigate to checkout (example)
        // window.location.href = `/checkout?cardId=${card.id}`;
    }
    
    /**
     * Handle make offer
     */
    handleMakeOffer(card) {
        // Would open offer modal
        showNotification(`Make an offer for ${card.name}`, 'info');
        
        // Open offer modal (would need to implement)
        // this.openOfferModal(card);
    }
    
    /**
     * Handle watchlist toggle
     */
    handleWatchlistToggle(card) {
        // Save to localStorage for now
        let watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
        const index = watchlist.findIndex(id => id === card.id);
        
        if (index > -1) {
            watchlist.splice(index, 1);
            showNotification('Removed from watchlist', 'info');
        } else {
            watchlist.push(card.id);
            showNotification('Added to watchlist', 'success');
        }
        
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
    }
    
    /**
     * Calculate total value
     */
    calculateTotalValue() {
        return this.state.cards.reduce((sum, card) => sum + (card.price || 0), 0);
    }
    
    /**
     * Calculate average price
     */
    calculateAveragePrice() {
        if (this.state.cards.length === 0) return 0;
        return Math.round(this.calculateTotalValue() / this.state.cards.length);
    }
    
    /**
     * Calculate graded percentage
     */
    calculateGradedPercentage() {
        if (this.state.cards.length === 0) return 0;
        const graded = this.state.cards.filter(card => card.grading?.isGraded || card.gradeCompany).length;
        return Math.round((graded / this.state.cards.length) * 100);
    }
    
    /**
     * Refresh marketplace
     */
    async refresh() {
        showNotification('Refreshing...', 'info');
        await this.loadData();
        showNotification('Marketplace refreshed', 'success');
    }
    
    /**
     * Show error state
     */
    showError(message) {
        if (this.container) {
            this.container.innerHTML = `
                <div class="marketplace-error">
                    <h2>Error</h2>
                    <p>${message}</p>
                    <button onclick="location.reload()">Reload</button>
                </div>
            `;
        }
    }
    
    /**
     * Destroy marketplace
     */
    destroy() {
        // Destroy components
        Object.values(this.components).forEach(component => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });
        
        // Clear references
        this.components = {};
        
        // Clear container
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        // Clear instance
        if (marketplaceInstance === this) {
            marketplaceInstance = null;
        }
    }
}

// Export singleton getter
export function getMarketplace() {
    return marketplaceInstance;
}

// Auto-initialize on DOM ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const container = document.getElementById('marketplace-root');
        if (container && !marketplaceInstance) {
            window.marketplace = new Marketplace('marketplace-root');
        }
    });
}

// Global initialization function
if (typeof window !== 'undefined') {
    window.initMarketplace = function() {
        const container = document.getElementById('marketplace-root');
        if (container) {
            if (marketplaceInstance) {
                marketplaceInstance.destroy();
            }
            return new Marketplace('marketplace-root');
        }
        return null;
    };
}

export default Marketplace;