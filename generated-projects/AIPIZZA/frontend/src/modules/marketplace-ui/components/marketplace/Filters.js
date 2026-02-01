/**
 * Marketplace Filters Component - Enhanced Version
 * Modern inline filter controls with advanced panel
 */

import { createInput, createSelect, createCheckbox, createButton } from '../shared/UIComponents.js';
import { GRADING_COMPANIES, PRICE_RANGES, SORT_OPTIONS, CARD_CONDITIONS } from '../../config/constants.js';
import { showNotification } from '../shared/Notification.js';

export class MarketplaceFilters {
    constructor(options = {}) {
        this.options = {
            onFilterChange: null,
            onSearch: null,
            onReset: null,
            showAdvanced: true,
            ...options
        };
        
        // Current filter state
        this.filters = {
            search: '',
            priceMin: null,
            priceMax: null,
            gradeMin: null,
            gradeMax: null,
            gradeCompany: 'all',
            condition: 'all',
            category: 'all',
            year: 'all',
            set: 'all',
            player: '',
            team: '',
            sortBy: 'newest',
            viewMode: 'grid',
            authenticated: false,
            freeShipping: false,
            buyNow: false,
            auction: false
        };
        
        // Available options (populated dynamically)
        this.availableOptions = {
            years: this.generateYearOptions(),
            sets: [],
            teams: [],
            categories: ['Sports', 'Pokemon', 'Magic', 'Yu-Gi-Oh', 'Other']
        };
        
        this.element = null;
        this.searchTimeout = null;
        this.isAdvancedOpen = false;
        this.activeFilterCount = 0;
    }
    
    /**
     * Render filters component
     */
    render() {
        this.element = document.createElement('div');
        this.element.className = 'marketplace-filters-wrapper';
        
        // Main filter bar
        const filterBar = document.createElement('div');
        filterBar.className = 'filter-bar-horizontal';
        
        const filterContent = document.createElement('div');
        filterContent.className = 'filter-content-horizontal';
        
        const filterRow = document.createElement('div');
        filterRow.className = 'filter-row-inline';
        
        // Search with icon
        const searchGroup = this.createSearchInput();
        filterRow.appendChild(searchGroup);
        
        // Quick filters
        const gradeSelect = this.createCompactSelect('gradeCompany', [
            { value: 'all', label: 'All Grades' },
            { value: 'psa', label: 'PSA' },
            { value: 'bgs', label: 'BGS' },
            { value: 'sgc', label: 'SGC' },
            { value: 'cgc', label: 'CGC' }
        ]);
        filterRow.appendChild(gradeSelect);
        
        const conditionSelect = this.createCompactSelect('condition', [
            { value: 'all', label: 'Any Condition' },
            { value: 'mint', label: 'Mint' },
            { value: 'near-mint', label: 'Near Mint' },
            { value: 'excellent', label: 'Excellent' },
            { value: 'good', label: 'Good' }
        ]);
        filterRow.appendChild(conditionSelect);
        
        const sortSelect = this.createCompactSelect('sortBy', [
            { value: 'newest', label: 'Newest' },
            { value: 'price-low', label: 'Price ↑' },
            { value: 'price-high', label: 'Price ↓' },
            { value: 'grade-high', label: 'Grade ↓' },
            { value: 'popular', label: 'Popular' }
        ]);
        filterRow.appendChild(sortSelect);
        
        // Price range
        const priceRange = this.createCompactPriceRange();
        filterRow.appendChild(priceRange);
        
        // Action buttons
        const actions = this.createFilterActions();
        filterRow.appendChild(actions);
        
        filterContent.appendChild(filterRow);
        filterBar.appendChild(filterContent);
        this.element.appendChild(filterBar);
        
        // Active filters display
        const activeFilters = this.createActiveFiltersDisplay();
        this.element.appendChild(activeFilters);
        
        // Advanced filters panel
        if (this.options.showAdvanced) {
            const advancedPanel = this.createAdvancedPanel();
            this.element.appendChild(advancedPanel);
        }
        
        // Setup all event handlers
        this.setupEventHandlers();
        
        return this.element;
    }
    
    /**
     * Create search input with icon
     */
    createSearchInput() {
        const wrapper = document.createElement('div');
        wrapper.className = 'filter-search-inline';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'search-input-modern';
        input.placeholder = 'Search cards, players, sets...';
        input.value = this.filters.search;
        
        // Add search on Enter key
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.applyFilters();
            }
        });
        
        wrapper.appendChild(input);
        return wrapper;
    }
    
    /**
     * Create compact select dropdown with enhanced styling
     */
    createCompactSelect(filterName, options) {
        const wrapper = document.createElement('div');
        wrapper.className = 'filter-select-compact';
        
        const select = document.createElement('select');
        select.className = 'select-modern';
        select.name = filterName;
        
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            if (opt.value === this.filters[filterName]) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        
        select.addEventListener('change', (e) => {
            this.filters[filterName] = e.target.value;
            this.applyFilters();
        });
        
        wrapper.appendChild(select);
        return wrapper;
    }
    
    /**
     * Create compact price range inputs
     */
    createCompactPriceRange() {
        const wrapper = document.createElement('div');
        wrapper.className = 'price-range-compact';
        
        const minInput = document.createElement('input');
        minInput.type = 'number';
        minInput.className = 'price-input-min';
        minInput.placeholder = 'Min $';
        minInput.min = '0';
        minInput.value = this.filters.priceMin || '';
        
        const separator = document.createElement('span');
        separator.className = 'price-separator';
        separator.textContent = '–';
        
        const maxInput = document.createElement('input');
        maxInput.type = 'number';
        maxInput.className = 'price-input-max';
        maxInput.placeholder = 'Max $';
        maxInput.min = '0';
        maxInput.value = this.filters.priceMax || '';
        
        // Event handlers with validation
        minInput.addEventListener('change', (e) => {
            const value = e.target.value ? parseFloat(e.target.value) : null;
            if (value !== null && this.filters.priceMax && value > this.filters.priceMax) {
                showNotification('Min price cannot be greater than max price', 'error');
                e.target.value = this.filters.priceMin || '';
                return;
            }
            this.filters.priceMin = value;
            this.applyFilters();
        });
        
        maxInput.addEventListener('change', (e) => {
            const value = e.target.value ? parseFloat(e.target.value) : null;
            if (value !== null && this.filters.priceMin && value < this.filters.priceMin) {
                showNotification('Max price cannot be less than min price', 'error');
                e.target.value = this.filters.priceMax || '';
                return;
            }
            this.filters.priceMax = value;
            this.applyFilters();
        });
        
        wrapper.appendChild(minInput);
        wrapper.appendChild(separator);
        wrapper.appendChild(maxInput);
        
        return wrapper;
    }
    
    /**
     * Create filter action buttons
     */
    createFilterActions() {
        const wrapper = document.createElement('div');
        wrapper.className = 'filter-actions-inline';
        
        // Clear button with badge
        const clearBtn = document.createElement('button');
        clearBtn.className = 'btn-clear-compact';
        clearBtn.innerHTML = `
            Clear
            <span class="filter-count-badge" style="display: none;">0</span>
        `;
        clearBtn.addEventListener('click', () => this.clearFilters());
        
        // Advanced button with icon
        const advancedBtn = document.createElement('button');
        advancedBtn.className = 'btn-advanced-compact';
        advancedBtn.innerHTML = `
            <span>Advanced</span>
            <svg class="advanced-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5z"/>
            </svg>
        `;
        advancedBtn.addEventListener('click', () => this.toggleAdvanced());
        
        wrapper.appendChild(clearBtn);
        if (this.options.showAdvanced) {
            wrapper.appendChild(advancedBtn);
        }
        
        return wrapper;
    }
    
    /**
     * Create active filters display with tags
     */
    createActiveFiltersDisplay() {
        const container = document.createElement('div');
        container.className = 'active-filters-container';
        container.style.display = 'none';
        
        const inner = document.createElement('div');
        inner.className = 'active-filters';
        
        const label = document.createElement('span');
        label.className = 'active-filters-label';
        label.textContent = 'Active Filters:';
        
        const tags = document.createElement('div');
        tags.className = 'filter-tags';
        
        const clearAllBtn = document.createElement('button');
        clearAllBtn.className = 'clear-all-btn';
        clearAllBtn.textContent = 'Clear All';
        clearAllBtn.addEventListener('click', () => this.clearFilters());
        
        inner.appendChild(label);
        inner.appendChild(tags);
        inner.appendChild(clearAllBtn);
        container.appendChild(inner);
        
        return container;
    }
    
    /**
     * Create advanced filters panel
     */
    createAdvancedPanel() {
        const panel = document.createElement('div');
        panel.className = 'advanced-filters-panel';
        panel.style.display = 'none';
        
        const content = document.createElement('div');
        content.className = 'advanced-filters-content';
        
        // Row 1: Grade Range, Year, Category
        const row1 = document.createElement('div');
        row1.className = 'advanced-filter-row';
        
        // Grade range
        const gradeGroup = this.createAdvancedFilterGroup({
            label: 'Grade Range',
            type: 'range',
            name: 'grade',
            min: 1,
            max: 10,
            step: 0.5
        });
        row1.appendChild(gradeGroup);
        
        // Year select
        const yearGroup = this.createAdvancedFilterGroup({
            label: 'Year',
            type: 'select',
            name: 'year',
            options: [
                { value: 'all', label: 'All Years' },
                ...this.availableOptions.years
            ]
        });
        row1.appendChild(yearGroup);
        
        // Category select
        const categoryGroup = this.createAdvancedFilterGroup({
            label: 'Category',
            type: 'select',
            name: 'category',
            options: [
                { value: 'all', label: 'All Categories' },
                ...this.availableOptions.categories.map(cat => ({
                    value: cat.toLowerCase(),
                    label: cat
                }))
            ]
        });
        row1.appendChild(categoryGroup);
        
        content.appendChild(row1);
        
        // Row 2: Player, Team, Set
        const row2 = document.createElement('div');
        row2.className = 'advanced-filter-row';
        
        // Player input with autocomplete
        const playerGroup = this.createAdvancedFilterGroup({
            label: 'Player Name',
            type: 'text',
            name: 'player',
            placeholder: 'e.g., Michael Jordan'
        });
        row2.appendChild(playerGroup);
        
        // Team input
        const teamGroup = this.createAdvancedFilterGroup({
            label: 'Team',
            type: 'text',
            name: 'team',
            placeholder: 'e.g., Lakers'
        });
        row2.appendChild(teamGroup);
        
        // Set input
        const setGroup = this.createAdvancedFilterGroup({
            label: 'Card Set',
            type: 'text',
            name: 'set',
            placeholder: 'e.g., Panini Prizm'
        });
        row2.appendChild(setGroup);
        
        content.appendChild(row2);
        
        // Row 3: Checkboxes
        const row3 = document.createElement('div');
        row3.className = 'advanced-filter-row advanced-checkboxes';
        
        const checkboxOptions = [
            { name: 'authenticated', label: 'Authenticated Only', icon: '✓' },
            { name: 'freeShipping', label: 'Free Shipping', icon: '📦' },
            { name: 'buyNow', label: 'Buy Now Only', icon: '💳' },
            { name: 'auction', label: 'Auctions Only', icon: '🔨' }
        ];
        
        checkboxOptions.forEach(opt => {
            const checkGroup = this.createCheckboxGroup(opt);
            row3.appendChild(checkGroup);
        });
        
        content.appendChild(row3);
        
        // Row 4: Quick presets
        const row4 = document.createElement('div');
        row4.className = 'advanced-filter-row preset-filters';
        
        const presetLabel = document.createElement('div');
        presetLabel.className = 'preset-label';
        presetLabel.textContent = 'Quick Presets:';
        row4.appendChild(presetLabel);
        
        const presets = [
            { label: 'High Grade (9+)', filters: { gradeMin: 9, gradeMax: 10 } },
            { label: 'Budget (<$100)', filters: { priceMax: 100 } },
            { label: 'Premium (>$500)', filters: { priceMin: 500 } },
            { label: 'Recent (2023+)', filters: { year: '2023' } }
        ];
        
        presets.forEach(preset => {
            const btn = document.createElement('button');
            btn.className = 'preset-btn';
            btn.textContent = preset.label;
            btn.addEventListener('click', () => this.applyPreset(preset.filters));
            row4.appendChild(btn);
        });
        
        content.appendChild(row4);
        
        // Action buttons
        const actions = document.createElement('div');
        actions.className = 'advanced-actions';
        
        const applyBtn = document.createElement('button');
        applyBtn.className = 'btn-apply-advanced';
        applyBtn.textContent = 'Apply Filters';
        applyBtn.addEventListener('click', () => {
            this.applyFilters();
            this.toggleAdvanced(false);
        });
        
        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn-reset-advanced';
        resetBtn.textContent = 'Reset Advanced';
        resetBtn.addEventListener('click', () => this.resetAdvancedFilters());
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn-save-search';
        saveBtn.innerHTML = '💾 Save Search';
        saveBtn.addEventListener('click', () => this.saveSearch());
        
        actions.appendChild(applyBtn);
        actions.appendChild(resetBtn);
        actions.appendChild(saveBtn);
        content.appendChild(actions);
        
        panel.appendChild(content);
        return panel;
    }
    
    /**
     * Create advanced filter group
     */
    createAdvancedFilterGroup(config) {
        const group = document.createElement('div');
        group.className = 'advanced-filter-group';
        
        const label = document.createElement('label');
        label.className = 'filter-label';
        label.textContent = config.label;
        group.appendChild(label);
        
        if (config.type === 'range') {
            const rangeContainer = document.createElement('div');
            rangeContainer.className = 'range-container';
            
            const minInput = document.createElement('input');
            minInput.type = 'number';
            minInput.className = 'range-input';
            minInput.placeholder = 'Min';
            minInput.min = config.min;
            minInput.max = config.max;
            minInput.step = config.step;
            minInput.value = this.filters[config.name + 'Min'] || '';
            
            const separator = document.createElement('span');
            separator.className = 'range-separator';
            separator.textContent = '–';
            
            const maxInput = document.createElement('input');
            maxInput.type = 'number';
            maxInput.className = 'range-input';
            maxInput.placeholder = 'Max';
            maxInput.min = config.min;
            maxInput.max = config.max;
            maxInput.step = config.step;
            maxInput.value = this.filters[config.name + 'Max'] || '';
            
            minInput.addEventListener('change', (e) => {
                this.filters[config.name + 'Min'] = e.target.value ? parseFloat(e.target.value) : null;
            });
            
            maxInput.addEventListener('change', (e) => {
                this.filters[config.name + 'Max'] = e.target.value ? parseFloat(e.target.value) : null;
            });
            
            rangeContainer.appendChild(minInput);
            rangeContainer.appendChild(separator);
            rangeContainer.appendChild(maxInput);
            group.appendChild(rangeContainer);
            
        } else if (config.type === 'select') {
            const select = document.createElement('select');
            select.className = 'filter-select-advanced';
            select.name = config.name;
            
            config.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.label;
                if (opt.value === this.filters[config.name]) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
            
            select.addEventListener('change', (e) => {
                this.filters[config.name] = e.target.value;
            });
            
            group.appendChild(select);
            
        } else if (config.type === 'text') {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'filter-input-advanced';
            input.name = config.name;
            input.placeholder = config.placeholder;
            input.value = this.filters[config.name] || '';
            
            input.addEventListener('input', (e) => {
                this.filters[config.name] = e.target.value;
            });
            
            group.appendChild(input);
        }
        
        return group;
    }
    
    /**
     * Create checkbox group with styling
     */
    createCheckboxGroup(config) {
        const group = document.createElement('label');
        group.className = 'checkbox-group';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'filter-checkbox';
        checkbox.name = config.name;
        checkbox.checked = this.filters[config.name] || false;
        
        checkbox.addEventListener('change', (e) => {
            this.filters[config.name] = e.target.checked;
        });
        
        const labelText = document.createElement('span');
        labelText.className = 'checkbox-label';
        labelText.innerHTML = `${config.icon ? config.icon + ' ' : ''}${config.label}`;
        
        group.appendChild(checkbox);
        group.appendChild(labelText);
        
        return group;
    }
    
    /**
     * Setup event handlers
     */
    setupEventHandlers() {
        // Search input with debounce
        const searchInput = this.element.querySelector('.search-input-modern');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.debounceSearch();
            });
        }
    }
    
    /**
     * Toggle advanced panel
     */
    toggleAdvanced(forceState = null) {
        this.isAdvancedOpen = forceState !== null ? forceState : !this.isAdvancedOpen;
        
        const panel = this.element.querySelector('.advanced-filters-panel');
        const btn = this.element.querySelector('.btn-advanced-compact');
        const icon = btn?.querySelector('.advanced-icon');
        
        if (panel) {
            if (this.isAdvancedOpen) {
                panel.style.display = 'block';
                panel.style.animation = 'slideDown 0.3s ease';
                btn?.classList.add('active');
                if (icon) icon.style.transform = 'rotate(180deg)';
            } else {
                panel.style.animation = 'slideUp 0.3s ease';
                setTimeout(() => {
                    panel.style.display = 'none';
                }, 280);
                btn?.classList.remove('active');
                if (icon) icon.style.transform = 'rotate(0)';
            }
        }
    }
    
    /**
     * Debounce search
     */
    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.applyFilters();
        }, 300);
    }
    
    /**
     * Apply filters
     */
    applyFilters() {
        const activeFilters = this.getActiveFilters();
        
        // Update filter count badge
        this.updateFilterCount();
        
        // Update active filters display
        this.updateActiveFiltersDisplay();
        
        // Call callback
        if (this.options.onFilterChange) {
            this.options.onFilterChange(activeFilters);
        }
        
        // Show notification only if filters changed
        if (Object.keys(activeFilters).length > 0) {
            showNotification(`${Object.keys(activeFilters).length} filters applied`, 'success');
        }
    }
    
    /**
     * Apply preset filters
     */
    applyPreset(presetFilters) {
        Object.assign(this.filters, presetFilters);
        this.updateUIFromFilters();
        this.applyFilters();
        showNotification('Preset applied', 'success');
    }
    
    /**
     * Clear all filters
     */
    clearFilters() {
        // Store sort preference
        const currentSort = this.filters.sortBy;
        
        // Reset all filters
        this.filters = {
            search: '',
            priceMin: null,
            priceMax: null,
            gradeMin: null,
            gradeMax: null,
            gradeCompany: 'all',
            condition: 'all',
            category: 'all',
            year: 'all',
            set: 'all',
            player: '',
            team: '',
            sortBy: currentSort, // Preserve sort
            viewMode: 'grid',
            authenticated: false,
            freeShipping: false,
            buyNow: false,
            auction: false
        };
        
        // Update UI
        this.updateUIFromFilters();
        
        // Clear active filters display
        const activeContainer = this.element.querySelector('.active-filters-container');
        if (activeContainer) {
            activeContainer.style.display = 'none';
        }
        
        // Update count
        this.updateFilterCount();
        
        // Call callback
        if (this.options.onReset) {
            this.options.onReset();
        } else if (this.options.onFilterChange) {
            this.options.onFilterChange({});
        }
        
        showNotification('All filters cleared', 'info');
    }
    
    /**
     * Reset only advanced filters
     */
    resetAdvancedFilters() {
        this.filters.gradeMin = null;
        this.filters.gradeMax = null;
        this.filters.year = 'all';
        this.filters.category = 'all';
        this.filters.player = '';
        this.filters.team = '';
        this.filters.set = '';
        this.filters.authenticated = false;
        this.filters.freeShipping = false;
        this.filters.buyNow = false;
        this.filters.auction = false;
        
        this.updateUIFromFilters();
        showNotification('Advanced filters reset', 'info');
    }
    
    /**
     * Update UI elements from current filter state
     */
    updateUIFromFilters() {
        // Update all inputs
        Object.keys(this.filters).forEach(key => {
            const element = this.element.querySelector(`[name="${key}"]`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.filters[key];
                } else {
                    element.value = this.filters[key] || '';
                }
            }
        });
        
        // Update price inputs
        const minPrice = this.element.querySelector('.price-input-min');
        const maxPrice = this.element.querySelector('.price-input-max');
        if (minPrice) minPrice.value = this.filters.priceMin || '';
        if (maxPrice) maxPrice.value = this.filters.priceMax || '';
        
        // Update grade inputs
        const minGrade = this.element.querySelector('[name="gradeMin"]');
        const maxGrade = this.element.querySelector('[name="gradeMax"]');
        if (minGrade) minGrade.value = this.filters.gradeMin || '';
        if (maxGrade) maxGrade.value = this.filters.gradeMax || '';
    }
    
    /**
     * Update filter count badge
     */
    updateFilterCount() {
        const activeFilters = this.getActiveFilters();
        const count = Object.keys(activeFilters).length;
        
        const badge = this.element.querySelector('.filter-count-badge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-flex' : 'none';
        }
        
        this.activeFilterCount = count;
    }
    
    /**
     * Update active filters display
     */
    updateActiveFiltersDisplay() {
        const activeFilters = this.getActiveFilters();
        const container = this.element.querySelector('.active-filters-container');
        const tagsContainer = this.element.querySelector('.filter-tags');
        
        if (!container || !tagsContainer) return;
        
        if (Object.keys(activeFilters).length === 0) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'block';
        tagsContainer.innerHTML = '';
        
        Object.entries(activeFilters).forEach(([key, value]) => {
            if (value && value !== 'all' && value !== false) {
                const tag = document.createElement('div');
                tag.className = 'filter-tag';
                
                const label = this.formatFilterLabel(key);
                const displayValue = this.formatFilterValue(key, value);
                
                tag.innerHTML = `
                    <span class="tag-label">${label}:</span>
                    <span class="tag-value">${displayValue}</span>
                    <button class="tag-remove" data-filter="${key}">×</button>
                `;
                
                tag.querySelector('.tag-remove').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.removeFilter(key);
                });
                
                tagsContainer.appendChild(tag);
            }
        });
    }
    
    /**
     * Remove specific filter
     */
    removeFilter(filterKey) {
        // Reset filter value based on type
        if (filterKey.includes('Min') || filterKey.includes('Max')) {
            this.filters[filterKey] = null;
        } else if (typeof this.filters[filterKey] === 'boolean') {
            this.filters[filterKey] = false;
        } else if (filterKey === 'search' || filterKey === 'player' || filterKey === 'team' || filterKey === 'set') {
            this.filters[filterKey] = '';
        } else {
            this.filters[filterKey] = 'all';
        }
        
        this.updateUIFromFilters();
        this.applyFilters();
    }
    
    /**
     * Get active filters
     */
    getActiveFilters() {
        const active = {};
        
        Object.entries(this.filters).forEach(([key, value]) => {
            // Skip default values
            if (value === null || value === '' || value === 'all' || value === false) {
                return;
            }
            
            // Skip view-related filters
            if (key === 'viewMode' || key === 'sortBy') {
                if (key === 'sortBy' && value !== 'newest') {
                    active[key] = value;
                }
                return;
            }
            
            active[key] = value;
        });
        
        return active;
    }
    
    /**
     * Save current search
     */
    saveSearch() {
        const activeFilters = this.getActiveFilters();
        
        if (Object.keys(activeFilters).length === 0) {
            showNotification('No filters to save', 'warning');
            return;
        }
        
        const savedSearches = JSON.parse(localStorage.getItem('saved_searches') || '[]');
        
        // Create search name
        const searchName = prompt('Name this search:', `Search ${savedSearches.length + 1}`);
        if (!searchName) return;
        
        const newSearch = {
            id: Date.now(),
            name: searchName,
            filters: activeFilters,
            date: new Date().toISOString()
        };
        
        savedSearches.push(newSearch);
        localStorage.setItem('saved_searches', JSON.stringify(savedSearches));
        
        showNotification(`Search "${searchName}" saved`, 'success');
    }
    
    /**
     * Load saved search
     */
    loadSavedSearch(savedSearch) {
        // Reset filters first
        this.clearFilters();
        
        // Apply saved filters
        Object.assign(this.filters, savedSearch.filters);
        
        // Update UI
        this.updateUIFromFilters();
        
        // Apply filters
        this.applyFilters();
        
        showNotification(`Loaded search: ${savedSearch.name}`, 'success');
    }
    
    /**
     * Generate year options
     */
    generateYearOptions() {
        const currentYear = new Date().getFullYear();
        const years = [];
        
        for (let year = currentYear; year >= 1950; year--) {
            years.push({ 
                value: year.toString(), 
                label: year.toString() 
            });
        }
        
        return years;
    }
    
    /**
     * Format filter label for display
     */
    formatFilterLabel(key) {
        const labels = {
            search: 'Search',
            priceMin: 'Min Price',
            priceMax: 'Max Price',
            gradeMin: 'Min Grade',
            gradeMax: 'Max Grade',
            gradeCompany: 'Company',
            condition: 'Condition',
            category: 'Category',
            year: 'Year',
            set: 'Set',
            player: 'Player',
            team: 'Team',
            authenticated: 'Authenticated',
            freeShipping: 'Free Shipping',
            buyNow: 'Buy Now',
            auction: 'Auction'
        };
        
        return labels[key] || this.capitalize(key);
    }
    
    /**
     * Format filter value for display
     */
    formatFilterValue(key, value) {
        if (key.includes('price')) {
            return `$${value}`;
        }
        
        if (typeof value === 'boolean') {
            return 'Yes';
        }
        
        if (key === 'gradeCompany') {
            return value.toUpperCase();
        }
        
        return value;
    }
    
    /**
     * Capitalize string
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).replace(/([A-Z])/g, ' $1').trim();
    }
    
    /**
     * Export current filters
     */
    exportFilters() {
        return this.getActiveFilters();
    }
    
    /**
     * Import filters
     */
    importFilters(filters) {
        Object.assign(this.filters, filters);
        this.updateUIFromFilters();
        this.applyFilters();
    }
    
    /**
     * Get filter statistics
     */
    getFilterStats() {
        return {
            activeCount: this.activeFilterCount,
            hasSearch: Boolean(this.filters.search),
            hasPriceFilter: Boolean(this.filters.priceMin || this.filters.priceMax),
            hasGradeFilter: Boolean(this.filters.gradeMin || this.filters.gradeMax),
            isAdvancedOpen: this.isAdvancedOpen
        };
    }
}

export default MarketplaceFilters;