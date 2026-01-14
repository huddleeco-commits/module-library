/**
 * Card Price Component
 * Displays and manages card pricing information
 */

import { formatPrice, formatPercent, formatDate } from '../../services/utils/formatters.js';
import { getCardPriceHistory } from '../../services/api/marketplace.js';

export class CardPrice {
    constructor(priceData = {}) {
        this.data = {
            current: priceData.current || 0,
            previous: priceData.previous || null,
            high: priceData.high || null,
            low: priceData.low || null,
            average: priceData.average || null,
            lastUpdated: priceData.lastUpdated || new Date().toISOString(),
            currency: priceData.currency || 'USD',
            history: priceData.history || []
        };
        
        this.element = null;
        this.chartElement = null;
        this.showChart = false;
    }
    
    /**
     * Calculate price change
     * @returns {object} Change amount and percentage
     */
    calculateChange() {
        if (!this.data.previous || this.data.previous === 0) {
            return { amount: 0, percentage: 0, direction: 'unchanged' };
        }
        
        const amount = this.data.current - this.data.previous;
        const percentage = (amount / this.data.previous) * 100;
        const direction = amount > 0 ? 'up' : amount < 0 ? 'down' : 'unchanged';
        
        return { amount, percentage, direction };
    }
    
    /**
     * Render price display
     * @param {object} options - Display options
     * @returns {HTMLElement} Price element
     */
    render(options = {}) {
        const {
            showChange = true,
            showRange = false,
            showHistory = false,
            size = 'medium',
            className = ''
        } = options;
        
        this.element = document.createElement('div');
        this.element.className = `card-price-display price-${size} ${className}`;
        
        // Main price
        const mainPrice = document.createElement('div');
        mainPrice.className = 'price-main';
        
        const priceValue = document.createElement('span');
        priceValue.className = 'price-value';
        priceValue.textContent = formatPrice(this.data.current);
        mainPrice.appendChild(priceValue);
        
        // Price change
        if (showChange && this.data.previous !== null) {
            const change = this.calculateChange();
            const changeElement = this.createChangeElement(change);
            mainPrice.appendChild(changeElement);
        }
        
        this.element.appendChild(mainPrice);
        
        // Price range
        if (showRange && (this.data.high !== null || this.data.low !== null)) {
            const rangeElement = this.createRangeElement();
            this.element.appendChild(rangeElement);
        }
        
        // Price history chart
        if (showHistory && this.data.history.length > 0) {
            const historyElement = this.createHistoryElement();
            this.element.appendChild(historyElement);
        }
        
        return this.element;
    }
    
    /**
     * Create price change element
     * @param {object} change - Change data
     * @returns {HTMLElement} Change element
     */
    createChangeElement(change) {
        const container = document.createElement('div');
        container.className = `price-change change-${change.direction}`;
        
        const arrow = document.createElement('span');
        arrow.className = 'change-arrow';
        arrow.textContent = change.direction === 'up' ? '▲' : 
                           change.direction === 'down' ? '▼' : '–';
        
        const amount = document.createElement('span');
        amount.className = 'change-amount';
        amount.textContent = formatPrice(Math.abs(change.amount));
        
        const percentage = document.createElement('span');
        percentage.className = 'change-percentage';
        percentage.textContent = `(${formatPercent(Math.abs(change.percentage), 1)})`;
        
        container.appendChild(arrow);
        container.appendChild(amount);
        container.appendChild(percentage);
        
        return container;
    }
    
    /**
     * Create price range element
     * @returns {HTMLElement} Range element
     */
    createRangeElement() {
        const container = document.createElement('div');
        container.className = 'price-range';
        
        if (this.data.low !== null) {
            const low = document.createElement('div');
            low.className = 'range-item';
            low.innerHTML = `
                <span class="range-label">Low</span>
                <span class="range-value">${formatPrice(this.data.low)}</span>
            `;
            container.appendChild(low);
        }
        
        if (this.data.average !== null) {
            const avg = document.createElement('div');
            avg.className = 'range-item';
            avg.innerHTML = `
                <span class="range-label">Avg</span>
                <span class="range-value">${formatPrice(this.data.average)}</span>
            `;
            container.appendChild(avg);
        }
        
        if (this.data.high !== null) {
            const high = document.createElement('div');
            high.className = 'range-item';
            high.innerHTML = `
                <span class="range-label">High</span>
                <span class="range-value">${formatPrice(this.data.high)}</span>
            `;
            container.appendChild(high);
        }
        
        return container;
    }
    
    /**
     * Create price history element
     * @returns {HTMLElement} History element
     */
    createHistoryElement() {
        const container = document.createElement('div');
        container.className = 'price-history';
        
        const header = document.createElement('div');
        header.className = 'history-header';
        header.innerHTML = `
            <h4>Price History</h4>
            <button class="history-toggle">Show Chart</button>
        `;
        container.appendChild(header);
        
        // Chart container
        this.chartElement = document.createElement('div');
        this.chartElement.className = 'history-chart';
        this.chartElement.style.display = 'none';
        container.appendChild(this.chartElement);
        
        // Toggle button handler
        const toggleBtn = header.querySelector('.history-toggle');
        toggleBtn.addEventListener('click', () => {
            this.toggleChart();
            toggleBtn.textContent = this.showChart ? 'Hide Chart' : 'Show Chart';
        });
        
        return container;
    }
    
    /**
     * Toggle price history chart
     */
    toggleChart() {
        this.showChart = !this.showChart;
        
        if (this.showChart) {
            this.renderChart();
            this.chartElement.style.display = 'block';
        } else {
            this.chartElement.style.display = 'none';
        }
    }
    
    /**
     * Render price history chart
     */
    renderChart() {
        if (!this.chartElement || this.data.history.length === 0) return;
        
        // Create simple line chart
        const width = this.chartElement.offsetWidth || 300;
        const height = 200;
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        
        // Get data points
        const prices = this.data.history.map(h => h.price);
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);
        const priceRange = maxPrice - minPrice || 1;
        
        // Draw grid
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 0.5;
        
        // Horizontal lines
        for (let i = 0; i <= 4; i++) {
            const y = (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Draw line chart
        ctx.strokeStyle = '#4ecdc4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        this.data.history.forEach((point, index) => {
            const x = (width / (this.data.history.length - 1)) * index;
            const y = height - ((point.price - minPrice) / priceRange) * height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw points
        ctx.fillStyle = '#4ecdc4';
        this.data.history.forEach((point, index) => {
            const x = (width / (this.data.history.length - 1)) * index;
            const y = height - ((point.price - minPrice) / priceRange) * height;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Clear and add canvas
        this.chartElement.innerHTML = '';
        this.chartElement.appendChild(canvas);
        
        // Add labels
        const labels = document.createElement('div');
        labels.className = 'chart-labels';
        labels.innerHTML = `
            <div class="chart-label-top">${formatPrice(maxPrice)}</div>
            <div class="chart-label-bottom">${formatPrice(minPrice)}</div>
        `;
        this.chartElement.appendChild(labels);
    }
    
    /**
     * Update price data
     * @param {object} newData - New price data
     */
    update(newData) {
        Object.assign(this.data, newData);
        
        if (this.element) {
            // Re-render with same options
            const parent = this.element.parentElement;
            const newElement = this.render();
            parent.replaceChild(newElement, this.element);
        }
    }
    
    /**
     * Load price history from API
     * @param {string} cardId - Card ID
     * @param {string} period - Time period
     */
    async loadHistory(cardId, period = '1m') {
        try {
            const response = await getCardPriceHistory(cardId, period);
            
            if (response.success && response.history) {
                this.data.history = response.history;
                
                // Update high/low/average from history
                const prices = response.history.map(h => h.price);
                this.data.high = Math.max(...prices);
                this.data.low = Math.min(...prices);
                this.data.average = prices.reduce((a, b) => a + b, 0) / prices.length;
                
                this.update(this.data);
            }
        } catch (error) {
            console.error('Error loading price history:', error);
        }
    }
    
    /**
     * Create compact price badge
     * @param {number} price - Price value
     * @param {string} className - Additional classes
     * @returns {HTMLElement} Price badge
     */
    static createBadge(price, className = '') {
        const badge = document.createElement('span');
        badge.className = `price-badge ${className}`;
        badge.textContent = formatPrice(price);
        return badge;
    }
    
    /**
     * Create price comparison element
     * @param {array} prices - Array of price objects
     * @returns {HTMLElement} Comparison element
     */
    static createComparison(prices) {
        const container = document.createElement('div');
        container.className = 'price-comparison';
        
        prices.forEach(priceObj => {
            const item = document.createElement('div');
            item.className = 'comparison-item';
            item.innerHTML = `
                <div class="comparison-label">${priceObj.label}</div>
                <div class="comparison-value">${formatPrice(priceObj.value)}</div>
            `;
            container.appendChild(item);
        });
        
        return container;
    }
}

/**
 * Create a simple price display
 * @param {number} price - Price value
 * @param {object} options - Display options
 * @returns {HTMLElement} Price element
 */
export function createPriceDisplay(price, options = {}) {
    const priceComponent = new CardPrice({ current: price });
    return priceComponent.render(options);
}

export default CardPrice;