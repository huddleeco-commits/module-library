// Trading Card Platform - Enhanced SGC Slab Marketplace Component
// Fixed overlap issues and added inspection tools

class CardMarketplace {
    constructor() {
        this.listings = [];
        this.filteredListings = [];
        this.viewMode = 'grid';
        this.sortBy = 'newest';
        this.filters = {
            category: 'all',
            priceMin: '',
            priceMax: '',
            condition: 'all',
            graded: 'all',
            gradeMin: '',
            gradeMax: '',
            player: '',
            set: '',
            search: ''
        };
        this.isFilterPanelOpen = false;
        this.currentPage = 1;
        this.itemsPerPage = 24;
        this.isLoading = false;
        this.selectedCard = null;
        this.modalImageIndex = 0;
        this.zoomLevel = 1;
        
        this.injectStyles();
        this.loadListings().then(() => {
            console.log('SGC Marketplace initialized');
        });
    }
    
    injectStyles() {
        if (!document.getElementById('marketplace-styles')) {
            const styles = document.createElement('style');
            styles.id = 'marketplace-styles';
            styles.textContent = `
                @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto:wght@400;700;900&display=swap');
                
                .marketplace-container {
                    animation: fadeIn 0.5s ease;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .filter-bar {
                    background: var(--surface);
                    border-radius: 12px;
                    padding: 1rem;
                    margin-bottom: 1.5rem;
                    border: 1px solid var(--border);
                    transition: all 0.3s ease;
                }
                
                .filter-collapse {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease;
                    opacity: 0;
                }
                
                .filter-collapse.open {
                    max-height: 800px;
                    opacity: 1;
                    margin-top: 1.5rem;
                }
                
                .search-bar {
                    position: relative;
                    flex: 1;
                    max-width: 500px;
                }
                
                .search-input {
                    width: 100%;
                    padding: 0.75rem 1rem 0.75rem 3rem;
                    background: var(--bg-primary);
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    color: var(--text-primary);
                    transition: all 0.3s;
                }
                
                .search-input:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.1);
                }
                
                .card-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 2rem;
                    padding: 1rem 0;
                }
                
                /* SGC Slab Card Container - Fixed Structure */
                .slab-card-container {
                    background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
                    border-radius: 12px;
                    border: 2px solid #333;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    overflow: visible;
                    display: flex;
                    flex-direction: column;
                }
                
                /* Flippable Card Section - Fixed height */
                .slab-flip-section {
                    position: relative;
                    width: 100%;
                    height: 320px;
                    perspective: 1000px;
                }
                
                .slab-flip-inner {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    transition: transform 0.8s;
                    transform-style: preserve-3d;
                }
                
                .slab-card-container:hover .slab-flip-inner {
                    transform: rotateY(180deg);
                }
                
                .slab-front, .slab-back {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    -webkit-backface-visibility: hidden;
                    backface-visibility: hidden;
                    display: flex;
                    flex-direction: column;
                }
                
                .slab-back {
                    transform: rotateY(180deg);
                }
                
                .slab-label {
                    background: linear-gradient(90deg, #FFD700, #FFA500, #FFD700);
                    background-size: 200% 100%;
                    animation: goldShine 3s linear infinite;
                    color: black;
                    padding: 8px;
                    font-weight: 900;
                    font-size: 0.85rem;
                    text-align: center;
                    font-family: 'Bebas Neue', sans-serif;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    border-radius: 10px 10px 0 0;
                }
                
                @keyframes goldShine {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 200% 50%; }
                }
                
                .slab-card-content {
                    flex: 1;
                    position: relative;
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    height: calc(100% - 35px);
                }
                
                .slab-grade-container {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: white;
                    padding: 3px;
                    border-radius: 8px;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.5);
                    z-index: 10;
                }
                
                .slab-grade-box {
                    background: black;
                    color: white;
                    padding: 8px 12px;
                    font-size: 1.8rem;
                    font-weight: 900;
                    font-family: 'Roboto', sans-serif;
                    border-radius: 5px;
                    min-width: 50px;
                    text-align: center;
                }
                
                .slab-grade-label {
                    background: white;
                    color: black;
                    padding: 2px 6px;
                    font-size: 0.6rem;
                    font-weight: bold;
                    text-align: center;
                    margin-top: 1px;
                }
                
                .slab-image-container {
    flex: 1;
    margin: 10px 0;
    background: #000;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 240px;
    max-height: 260px;
}
                
                .slab-image {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    object-position: center;
                    image-rendering: -webkit-optimize-contrast;
                    image-rendering: crisp-edges;
                    filter: contrast(105%) brightness(102%) saturate(105%);
                }
                
                .slab-image.enhanced {
                    filter: contrast(110%) brightness(105%) saturate(110%) sharpen(1);
                }
                
                .modal-slab-image, 
                .corner-image, 
                .surface-image,
                .centering-image,
                .fullscreen-image {
                    image-rendering: -webkit-optimize-contrast;
                    image-rendering: crisp-edges;
                    filter: contrast(102%) brightness(101%) saturate(103%);
                }
                
                .slab-cert {
                    position: absolute;
                    bottom: 5px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0,0,0,0.7);
                    color: #FFD700;
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 0.65rem;
                    font-family: monospace;
                }
                
                /* Static Bottom Section */
                .slab-info-section {
                    background: rgba(0,0,0,0.3);
                    padding: 15px;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    border-radius: 0 0 10px 10px;
                }
                
                .slab-player-name {
                    font-size: 1rem;
                    font-weight: 900;
                    color: white;
                    margin-bottom: 3px;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                }
                
                .slab-set-name {
                    font-size: 0.75rem;
                    color: var(--primary);
                    margin-bottom: 8px;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                }
                
                .slab-price {
                    font-size: 1.4rem;
                    font-weight: 900;
                    color: #4ecdc4;
                    margin-bottom: 12px;
                }
                
                .slab-actions {
                    display: flex;
                    gap: 8px;
                }
                
                .slab-btn {
                    flex: 1;
                    padding: 8px;
                    border: none;
                    border-radius: 6px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-size: 0.85rem;
                }
                
                .slab-btn-primary {
                    background: var(--success);
                    color: white;
                }
                
                .slab-btn-primary:hover {
                    background: #3eb34e;
                    transform: translateY(-1px);
                }
                
                .slab-btn-secondary {
                    background: var(--primary);
                    color: white;
                }
                
                .slab-btn-secondary:hover {
                    background: #3fb4ac;
                    transform: translateY(-1px);
                }
                
                /* Corner Inspector Styles - Enhanced */
                .corner-inspector {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.98);
                    z-index: 15000;
                    display: none;
                    overflow-y: auto;
                }
                
                .corner-inspector.active {
                    display: block;
                }
                
                .inspector-content {
                    max-width: 1600px;
                    margin: 30px auto;
                    padding: 20px;
                }
                
                .inspector-header {
                    background: linear-gradient(90deg, #FFD700, #FFA500);
                    padding: 15px 20px;
                    border-radius: 10px 10px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .inspector-title {
                    color: black;
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: 1.5rem;
                    letter-spacing: 2px;
                    margin: 0;
                }
                
                .inspector-close {
                    background: rgba(0,0,0,0.5);
                    color: white;
                    border: none;
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    font-size: 1.3rem;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .inspector-close:hover {
                    background: rgba(0,0,0,0.8);
                    transform: rotate(90deg);
                }
                
                .corner-controls {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 20px;
                    background: var(--surface);
                    padding: 15px;
                    border-radius: 10px;
                    border: 1px solid var(--border);
                }
                
                .corner-control-group {
                    flex: 1;
                    min-width: 150px;
                }
                
                .control-label {
                    color: var(--primary);
                    font-size: 0.8rem;
                    font-weight: bold;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                }
                
                .corner-grid {
                    display: grid;
                    gap: 20px;
                    margin-bottom: 20px;
                }
                
                .side-section {
                    background: var(--surface);
                    border-radius: 12px;
                    padding: 20px;
                    border: 1px solid var(--border);
                }
                
                .side-label {
                    color: var(--primary);
                    font-size: 1.1rem;
                    font-weight: bold;
                    margin-bottom: 15px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .corners-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 15px;
                }
                
                .corner-box {
                    background: #000;
                    border-radius: 8px;
                    padding: 10px;
                    border: 2px solid #333;
                    position: relative;
                    overflow: hidden;
                    transition: border-color 0.3s;
                }
                
                .corner-box:hover {
                    border-color: var(--primary);
                }
                
                .corner-label {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    background: rgba(255,215,0,0.9);
                    color: black;
                    padding: 5px 10px;
                    border-radius: 5px;
                    font-weight: bold;
                    font-size: 0.8rem;
                    z-index: 1;
                }
                
                .corner-score {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    padding: 8px 12px;
                    border-radius: 8px;
                    font-weight: bold;
                    font-size: 1.2rem;
                    z-index: 1;
                }
                
                .score-perfect {
                    background: #00ff00;
                    color: black;
                }
                
                .score-excellent {
                    background: #4ecdc4;
                    color: white;
                }
                
                .score-good {
                    background: #FFD700;
                    color: black;
                }
                
                .score-fair {
                    background: #FFA500;
                    color: black;
                }
                
                .score-poor {
                    background: #ff6b6b;
                    color: white;
                }
                
                .corner-image-container {
                    width: 100%;
                    height: 350px;
                    position: relative;
                    overflow: hidden;
                    cursor: crosshair;
                }
                
                .corner-image {
                    position: absolute;
                    width: 400%;
                    height: 400%;
                    object-fit: contain;
                    transition: filter 0.3s ease;
                }
                
                .corner-image.enhanced {
                    filter: contrast(150%) brightness(110%) saturate(120%);
                }
                
                /* Corner image positioning */
                .corner-image.top-left {
                    top: 0;
                    left: 0;
                    transform-origin: top left;
                }
                
                .corner-image.top-right {
                    top: 0;
                    right: 0;
                    left: auto;
                    transform-origin: top right;
                }
                
                .corner-image.bottom-left {
                    bottom: 0;
                    top: auto;
                    left: 0;
                    transform-origin: bottom left;
                }
                
                .corner-image.bottom-right {
                    bottom: 0;
                    top: auto;
                    right: 0;
                    left: auto;
                    transform-origin: bottom right;
                }
                
                .corner-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    display: none;
                }
                
                .corner-overlay.active {
                    display: block;
                }
                
                .corner-gridlines {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                }
                
                .gridline {
                    position: absolute;
                    background: rgba(255, 0, 0, 0.2);
                }
                
                .gridline.horizontal {
                    width: 100%;
                    height: 1px;
                }
                
                .gridline.vertical {
                    height: 100%;
                    width: 1px;
                }
                
                /* Zoom container styles */
                .corner-image-container.zoomed {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90vw;
                    max-width: 1000px;
                    height: 80vh;
                    z-index: 9999;
                    background: #000;
                    border: 3px solid var(--primary);
                    box-shadow: 0 0 50px rgba(78, 205, 196, 0.5);
                }
                
                .corner-image-container.zoomed .corner-image {
                    width: 1000%;
                    height: 1000%;
                }
                
                .zoom-controls {
                    position: absolute;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0,0,0,0.8);
                    padding: 10px 20px;
                    border-radius: 30px;
                    display: flex;
                    gap: 15px;
                    align-items: center;
                    z-index: 10001;
                }
                
                .zoom-btn {
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    background: var(--primary);
                    color: white;
                    border: none;
                    cursor: pointer;
                    font-size: 1.2rem;
                }
                
                .zoom-level-display {
                    color: white;
                    font-weight: bold;
                    min-width: 60px;
                    text-align: center;
                }
                
                .corner-measurement {
                    position: absolute;
                    background: rgba(0,0,0,0.8);
                    color: #FFD700;
                    padding: 5px 8px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: bold;
                    pointer-events: none;
                    display: none;
                    z-index: 100;
                }
                
                .corner-defect-marker {
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    border: 2px solid #ff0000;
                    border-radius: 50%;
                    background: rgba(255,0,0,0.3);
                    cursor: pointer;
                    z-index: 5;
                }
                
                .corner-defect-label {
                    position: absolute;
                    top: -25px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(255,0,0,0.9);
                    color: white;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-size: 0.7rem;
                    white-space: nowrap;
                    display: none;
                }
                
                .corner-defect-marker:hover .corner-defect-label {
                    display: block;
                }
                
                .magnifier {
                    position: absolute;
                    width: 250px;
                    height: 250px;
                    border: 3px solid var(--primary);
                    border-radius: 50%;
                    pointer-events: none;
                    display: none;
                    overflow: hidden;
                    box-shadow: 0 0 20px rgba(78, 205, 196, 0.5);
                    background: #000;
                    z-index: 1000;
                }
                
                .magnifier-image {
                    position: absolute;
                    width: 400%;
                    height: 400%;
                    transform-origin: top left;
                }
                
                .magnifier-image.top-left {
                    transform-origin: top left;
                }
                
                .magnifier-image.top-right {
                    transform-origin: top right;
                }
                
                .magnifier-image.bottom-left {
                    transform-origin: bottom left;
                }
                
                .magnifier-image.bottom-right {
                    transform-origin: bottom right;
                }
                
                .magnifier::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: rgba(255, 0, 0, 0.5);
                    pointer-events: none;
                }
                
                .magnifier::before {
                    content: '';
                    position: absolute;
                    left: 50%;
                    top: 0;
                    bottom: 0;
                    width: 1px;
                    background: rgba(255, 0, 0, 0.5);
                    pointer-events: none;
                    z-index: 1;
                }
                
                .corner-analysis-panel {
                    background: rgba(0,0,0,0.5);
                    border-radius: 12px;
                    padding: 20px;
                    margin-top: 20px;
                }
                
                .analysis-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    margin-bottom: 20px;
                }
                
                .analysis-item {
                    text-align: center;
                    padding: 15px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                
                .analysis-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    margin-bottom: 8px;
                }
                
                .analysis-value {
                    font-size: 1.5rem;
                    font-weight: bold;
                }
                
                .condition-notes {
                    margin-top: 10px;
                    padding: 10px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 6px;
                    color: var(--text-muted);
                    font-size: 0.85rem;
                }
                
                .corner-comparison-mode {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }
                
                /* Unified Modal Layout */
                .modal-unified-container {
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .modal-main-grid {
                    display: grid;
                    grid-template-columns: 320px 380px 260px;
                    gap: 12px;
                    padding: 12px;
                    background: #1a1a1a;
                    border-radius: 0 0 12px 12px;
                    max-width: 980px;
                    margin: 0 auto;
                }
                
                /* Left Section */
                .modal-left-section {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                .card-display-area {
                    background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
                    border: 2px solid #333;
                    border-radius: 12px;
                    padding: 10px;
                }
                
                .slab-image-container {
                    background: #000;
                    border-radius: 8px;
                    height: 280px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }
                
                .slab-display-image {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                
                .image-toggle-buttons {
                    display: flex;
                    gap: 10px;
                    margin-top: 10px;
                }
                
                .toggle-btn {
                    flex: 1;
                    padding: 8px;
                    background: rgba(78, 205, 196, 0.1);
                    border: 1px solid var(--primary);
                    color: white;
                    border-radius: 6px;
                    cursor: pointer;
                }
                
                .toggle-btn.active {
                    background: var(--primary);
                }
                
                .inspection-tools-row {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                }
                
                .tool-btn-mini {
                    padding: 10px 5px;
                    background: rgba(78, 205, 196, 0.1);
                    border: 1px solid #444;
                    border-radius: 8px;
                    color: var(--primary);
                    cursor: pointer;
                    font-size: 0.7rem;
                    text-align: center;
                    transition: all 0.3s;
                }
                
                .tool-btn-mini:hover {
                    background: rgba(78, 205, 196, 0.2);
                    border-color: var(--primary);
                }
                
                /* Middle Section */
                .modal-middle-section {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .price-display-section {
                    background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
                    border: 2px solid #333;
                    border-radius: 12px;
                    padding: 12px;
                }
                
                .price-row {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    margin-bottom: 15px;
                }
                
                .price-stat {
                    text-align: center;
                }
                
                .mini-chart-container {
                    height: 100px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 8px;
                    padding: 10px;
                }

                .chart-section {
                    background: rgba(0,0,0,0.3);
                    border-radius: 8px;
                    padding: 10px;
                }
                
                .chart-time-selector {
                    display: flex;
                    justify-content: center;
                    gap: 5px;
                    margin-bottom: 10px;
                }
                
                .time-btn {
                    padding: 4px 12px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 4px;
                    color: var(--text-muted);
                    cursor: pointer;
                    font-size: 0.75rem;
                    transition: all 0.2s;
                }
                
                .time-btn:hover {
                    background: rgba(78, 205, 196, 0.1);
                    border-color: var(--primary);
                    color: var(--primary);
                }
                
                .time-btn.active {
                    background: var(--primary);
                    border-color: var(--primary);
                    color: white;
                }
                
                .mini-chart-container {
                    height: 100px;
                    position: relative;
                }
                
                .market-stats-section,
                .grade-details-section {
                    background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
                    border: 2px solid #333;
                    border-radius: 12px;
                    padding: 12px;
                }
                
                .section-header {
                    background: linear-gradient(90deg, #4ecdc4, #44a8a0);
                    color: white;
                    padding: 6px 10px;
                    margin: -12px -12px 10px -12px;
                    border-radius: 10px 10px 0 0;
                    font-weight: bold;
                    font-size: 0.8rem;
                    text-align: center;
                    letter-spacing: 1px;
                }
                
                .stats-grid-compact {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 10px;
                }
                
                .stat-item {
                    text-align: center;
                    padding: 8px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 6px;
                }
                
                .stat-label {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    margin-bottom: 3px;
                }
                
                .stat-value {
                    font-size: 1.3rem;
                    font-weight: bold;
                    color: var(--primary);
                }
                
                .stat-period {
                    font-size: 0.65rem;
                    color: var(--text-muted);
                    margin-top: 2px;
                }
                
                .trend-up {
                    color: #4ecdc4 !important;
                }
                
                .grade-display-compact {
                    text-align: center;
                }
                
                .main-grade {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 10px;
                }
                
                .grade-num {
                    font-size: 2.5rem;
                    font-weight: 900;
                    color: #FFD700;
                }
                
                .grade-text {
                    font-size: 1rem;
                    color: #FFD700;
                    font-weight: bold;
                }
                
                .subgrades-compact {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 5px;
                    margin-bottom: 10px;
                    font-size: 0.8rem;
                }
                
                .subgrade-item {
                    padding: 5px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 4px;
                }
                
                .population-info {
                    display: flex;
                    justify-content: space-around;
                    padding-top: 10px;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }
                
                /* Right Section */
                .modal-right-section {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .card-info-section {
                    background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
                    border: 2px solid #333;
                    border-radius: 12px;
                    padding: 10px;
                }
                
                .info-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .info-item {
                    display: flex;
                    justify-content: space-between;
                    padding-bottom: 8px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                
                .info-label {
                    color: var(--text-muted);
                    font-size: 0.85rem;
                }
                
                .info-value {
                    color: white;
                    font-weight: 600;
                    font-size: 0.85rem;
                }
                
                .current-price-section {
                    background: linear-gradient(135deg, rgba(78, 205, 196, 0.1), rgba(78, 205, 196, 0.05));
                    border: 2px solid var(--primary);
                    border-radius: 12px;
                    padding: 10px;
                    text-align: center;
                }
                
                .price-large {
                    font-size: 1.8rem;
                    font-weight: 900;
                    color: #4ecdc4;
                    margin: 5px 0;
                }
                
                .price-note {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }
                
                .seller-compact {
                    background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
                    border: 2px solid #333;
                    border-radius: 12px;
                    padding: 12px;
                }
                
                .seller-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .seller-avatar {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #4ecdc4, #44a8a0);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    color: white;
                }
                
                .seller-info {
                    flex: 1;
                }
                
                .seller-name {
                    font-weight: bold;
                    font-size: 0.9rem;
                }
                
                .seller-rating {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }
                
                .msg-btn {
                    padding: 8px 12px;
                    background: rgba(78, 205, 196, 0.1);
                    border: 1px solid var(--primary);
                    border-radius: 6px;
                    color: var(--primary);
                    cursor: pointer;
                }
                
                .action-buttons-section {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                .btn-buy-now {
                    padding: 12px;
                    background: var(--success);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    font-size: 1rem;
                    cursor: pointer;
                }
                
                .btn-make-offer {
                    padding: 12px;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                }
                
                .secondary-actions {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }
                
                .btn-watch,
                .btn-share {
                    padding: 8px;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 6px;
                    color: white;
                    cursor: pointer;
                    font-size: 0.85rem;
                }
                
                @media (max-width: 1200px) {
                    .modal-main-grid {
                        grid-template-columns: 1fr;
                    }
                }
                    display: grid;
                    grid-template-columns: 400px 1fr 320px;
                    gap: 20px;
                    padding: 20px;
                    max-height: 85vh;
                    overflow-y: auto;
                }
                
                .modal-column-left,
                .modal-column-middle,
                .modal-column-right {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                
                .modal-panel {
                    background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
                    border: 2px solid #333;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                }
                
                .panel-header {
                    background: linear-gradient(90deg, #4ecdc4, #44a8a0);
                    color: white;
                    padding: 10px 15px;
                    font-weight: bold;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                
                .panel-content {
                    padding: 15px;
                }
                
                /* Specific Panel Styles */
                .card-display-panel .modal-slab-display {
                    background: #000;
                    border-radius: 8px;
                    padding: 10px;
                }
                
                .price-chart-panel canvas {
                    width: 100%;
                    height: 200px;
                }
                
                .chart-stats {
                    display: flex;
                    justify-content: space-around;
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 1px solid rgba(255,255,255,0.1);
                }
                
                .chart-stat {
                    text-align: center;
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }
                
                .stat-box {
                    background: rgba(0,0,0,0.3);
                    padding: 12px;
                    border-radius: 8px;
                    text-align: center;
                }
                
                .stat-title {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    margin-bottom: 5px;
                }
                
                .stat-box .stat-value {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: var(--primary);
                }
                
                .stat-subtitle {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    margin-top: 3px;
                }
                
                .grade-breakdown {
                    text-align: center;
                }
                
                .grade-main {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                    margin-bottom: 15px;
                }
                
                .grade-number {
                    font-size: 3rem;
                    font-weight: 900;
                    color: #FFD700;
                }
                
                .subgrades {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 15px;
                }
                
                .subgrade {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 6px;
                }
                
                .pop-report {
                    display: flex;
                    justify-content: space-around;
                    padding-top: 10px;
                    border-top: 1px solid rgba(255,255,255,0.1);
                }
                
                .inspection-tools-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                }
                
                .tool-button {
                    padding: 12px 8px;
                    background: rgba(78, 205, 196, 0.1);
                    border: 1px solid var(--primary);
                    border-radius: 8px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s;
                    text-align: center;
                    font-size: 0.75rem;
                }
                
                .tool-button:hover {
                    background: var(--primary);
                    transform: translateY(-2px);
                }
                
                .tool-button i {
                    font-size: 1.2rem;
                    margin-bottom: 4px;
                }
                
                .info-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                
                .info-label {
                    color: var(--text-muted);
                    font-size: 0.85rem;
                }
                
                .info-value {
                    color: white;
                    font-weight: 600;
                }
                
                .price-display-large {
                    text-align: center;
                    padding: 10px 0;
                }
                
                .price-display-large .price {
                    font-size: 2.5rem;
                    font-weight: 900;
                    color: #4ecdc4;
                    margin: 10px 0;
                }
                
                .price-meta {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }
                
                .price-comparison {
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 1px solid rgba(255,255,255,0.1);
                }
                
                .comp-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 5px 0;
                }
                
                .seller-info {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    margin-bottom: 10px;
                }
                
                .seller-avatar {
                    width: 45px;
                    height: 45px;
                    background: linear-gradient(135deg, #4ecdc4, #44a8a0);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 1.2rem;
                    color: white;
                }
                
                .seller-details {
                    flex: 1;
                }
                
                .seller-name {
                    font-weight: bold;
                    margin-bottom: 3px;
                }
                
                .seller-stats {
                    display: flex;
                    gap: 10px;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }
                
                .message-btn {
                    width: 100%;
                    padding: 8px;
                    background: rgba(78, 205, 196, 0.1);
                    border: 1px solid var(--primary);
                    border-radius: 8px;
                    color: var(--primary);
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .message-btn:hover {
                    background: var(--primary);
                    color: white;
                }
                
                .action-buttons-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }
                
                .action-btn-primary {
                    grid-column: span 2;
                    padding: 12px;
                    background: var(--success);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .action-btn-primary:hover {
                    background: #3eb34e;
                    transform: translateY(-2px);
                }
                
                .action-btn-secondary {
                    grid-column: span 2;
                    padding: 12px;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .action-btn-secondary:hover {
                    background: #3fb4ac;
                    transform: translateY(-2px);
                }
                
                .action-btn-tertiary {
                    padding: 10px;
                    background: rgba(255,255,255,0.1);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .action-btn-tertiary:hover {
                    background: rgba(255,255,255,0.2);
                }
                
                .image-nav-buttons {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin-top: 10px;
                }
                
                /* Responsive adjustments */
                @media (max-width: 1400px) {
                    .modal-grid-container {
                        grid-template-columns: 350px 1fr 280px;
                    }
                }
                
                @media (max-width: 1200px) {
                    .modal-grid-container {
                        grid-template-columns: 1fr;
                        max-height: 90vh;
                    }
                    
                    .modal-column-left,
                    .modal-column-middle,
                    .modal-column-right {
                        width: 100%;
                    }
                }

                /* Gamified Modal Styles */
                .modal-gamified-container {
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .modal-symmetric-layout {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    padding: 20px;
                    background: #1a1a1a;
                }
                
                .modal-top-section {
                    display: grid;
                    grid-template-columns: 1fr 300px 280px;
                    gap: 20px;
                    align-items: start;
                }
                
                .card-showcase {
                    position: relative;
                    background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
                    border-radius: 16px;
                    padding: 20px;
                    border: 2px solid #333;
                }
                
                .grade-badge-float {
                    position: absolute;
                    top: -15px;
                    right: 20px;
                    background: linear-gradient(135deg, #FFD700, #FFA500);
                    padding: 10px 20px;
                    border-radius: 12px;
                    box-shadow: 0 5px 20px rgba(255, 215, 0, 0.4);
                    z-index: 10;
                }
                
                .grade-number {
                    font-size: 2rem;
                    font-weight: 900;
                    color: black;
                    text-align: center;
                }
                
                .grade-label {
                    font-size: 0.7rem;
                    font-weight: bold;
                    color: black;
                    text-align: center;
                    letter-spacing: 1px;
                }
                
                .card-3d-container {
                    height: 350px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #000;
                    border-radius: 12px;
                    overflow: hidden;
                    margin-bottom: 15px;
                }
                
                .showcase-image {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }
                
                .image-selector {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                }
                
                .img-thumb {
                    width: 60px;
                    height: 60px;
                    border: 2px solid #444;
                    border-radius: 8px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .img-thumb.active {
                    border-color: var(--primary);
                    box-shadow: 0 0 10px rgba(78, 205, 196, 0.5);
                }
                
                .img-thumb img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .action-center {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                
                .price-hero {
                    background: linear-gradient(135deg, rgba(78, 205, 196, 0.1), rgba(78, 205, 196, 0.05));
                    border: 2px solid var(--primary);
                    border-radius: 16px;
                    padding: 20px;
                    text-align: center;
                }
                
                .price-label {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 10px;
                }
                
                .price-display {
                    display: flex;
                    align-items: baseline;
                    justify-content: center;
                    gap: 5px;
                    margin-bottom: 10px;
                }
                
                .currency {
                    font-size: 1.5rem;
                    color: #4ecdc4;
                }
                
                .price-main {
                    font-size: 2.5rem;
                    font-weight: 900;
                    color: #4ecdc4;
                }
                
                .price-trend {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-size: 0.9rem;
                }
                
                .trend-arrow {
                    color: #4ecdc4;
                    font-size: 1.2rem;
                }
                
                .trend-value {
                    color: #4ecdc4;
                    font-weight: bold;
                }
                
                .trend-period {
                    color: var(--text-muted);
                }
                
                .action-buttons-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                .btn-action {
                    padding: 12px 20px;
                    border: none;
                    border-radius: 12px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }
                
                .btn-buy {
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                    font-size: 1.1rem;
                }
                
                .btn-buy:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 20px rgba(76, 175, 80, 0.4);
                }
                
                .btn-offer {
                    background: linear-gradient(135deg, #4ecdc4, #44a8a0);
                    color: white;
                }
                
                .btn-offer:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 20px rgba(78, 205, 196, 0.4);
                }
                
                .btn-group {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                }
                
                .btn-small {
                    padding: 10px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: white;
                    font-size: 1.2rem;
                }
                
                .btn-small:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: scale(1.1);
                }
                
                .seller-mini {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    padding: 15px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 12px;
                }
                
                .info-panel {
                    background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
                    border: 2px solid #333;
                    border-radius: 16px;
                    padding: 20px;
                }
                
                .panel-title {
                    color: var(--primary);
                    font-size: 0.9rem;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 15px;
                }
                
                .info-grid-compact {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                .modal-middle-section {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                }
                
                .stat-card {
                    background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
                    border: 2px solid #333;
                    border-radius: 16px;
                    padding: 15px;
                    transition: all 0.3s;
                }
                
                .stat-card:hover {
                    border-color: var(--primary);
                    box-shadow: 0 5px 20px rgba(78, 205, 196, 0.1);
                }
                
                .stat-card-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 15px;
                }
                
                .stat-card-header h4 {
                    margin: 0;
                    font-size: 0.9rem;
                    color: var(--primary);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                
                .stat-icon {
                    font-size: 1.5rem;
                }
                
                .stat-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                }
                
                .stat-box {
                    text-align: center;
                    padding: 10px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 8px;
                }
                
                .stat-val {
                    font-size: 1.2rem;
                    font-weight: bold;
                    color: var(--primary);
                }
                
                .stat-lbl {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    margin-top: 5px;
                }
                
                .grade-breakdown-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    margin-bottom: 15px;
                }
                
                .subgrade {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 12px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 8px;
                }
                
                .subgrade-label {
                    color: var(--text-muted);
                    font-size: 0.85rem;
                }
                
                .subgrade-value {
                    color: #FFD700;
                    font-weight: bold;
                }
                
                .pop-report-bar {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    padding-top: 10px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    color: var(--text-muted);
                    font-size: 0.85rem;
                }
                
                .chart-card {
                    grid-column: span 1;
                }
                
                .chart-tabs {
                    display: flex;
                    gap: 5px;
                    margin-bottom: 10px;
                }
                
                .chart-tab {
                    padding: 5px 10px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                    color: var(--text-muted);
                    cursor: pointer;
                    font-size: 0.75rem;
                    transition: all 0.2s;
                }
                
                .chart-tab.active {
                    background: var(--primary);
                    border-color: var(--primary);
                    color: white;
                }
                
                .modal-bottom-section {
                    padding: 20px 0;
                }
                
                .tools-grid-gamified {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 15px;
                }
                
                .tool-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                    padding: 15px;
                    background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
                    border: 2px solid #333;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .tool-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(78, 205, 196, 0.2);
                }
                
                .tool-icon {
                    font-size: 2rem;
                }
                
                .tool-name {
                    font-weight: bold;
                    color: var(--primary);
                    font-size: 0.9rem;
                }
                
                .tool-desc {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-align: center;
                }
                
                @media (max-width: 1200px) {
                    .modal-top-section {
                        grid-template-columns: 1fr;
                    }
                    
                    .modal-middle-section {
                        grid-template-columns: 1fr;
                    }
                    
                    .tools-grid-gamified {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
                
                /* Enhanced Modal Styles */
                .card-modal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.95);
                    z-index: 10000;
                    overflow-y: auto;
                    animation: fadeIn 0.3s;
                }
                
                .card-modal.active {
                    display: block;
                }
                
                .modal-content {
                    max-width: 980px;
                    width: 90vw;
                    margin: 20px auto;
                    background: #1a1a1a;
                    border-radius: 20px;
                    border: 1px solid #333;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.9);
                    position: relative;
                }
                
                .modal-header {
                    background: linear-gradient(90deg, #FFD700, #FFA500);
                    padding: 15px 20px;
                    position: relative;
                }
                
                .modal-close {
                    position: absolute;
                    top: 15px;
                    right: 20px;
                    background: rgba(0,0,0,0.5);
                    color: white;
                    border: none;
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    font-size: 1.3rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .modal-close:hover {
                    background: rgba(0,0,0,0.8);
                    transform: rotate(90deg);
                }
                
                .modal-body {
                    padding: 0;
                    background: #1a1a1a;
                    max-height: calc(90vh - 60px);
                    overflow-y: auto;
                }

                /* Wide Modal Layout Styles */
                .modal-wide-container {
                    width: 100%;
                }
                
                .modal-layout {
                    display: grid;
                    grid-template-columns: 400px 550px 350px;
                    gap: 20px;
                    padding: 20px;
                    background: #1a1a1a;
                    max-height: calc(90vh - 80px);
                    overflow-y: auto;
                }
                
                .image-section, .stats-section, .info-section {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                
                .card-display {
                    background: #000;
                    border-radius: 12px;
                    height: 300px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid #333;
                }
                
                .card-image {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                
                .image-controls, .action-buttons, .secondary-buttons {
                    display: flex;
                    gap: 10px;
                }
                
                .tools-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }
                
                .price-chart-box, .market-box, .grade-box, .info-box, .price-box, .seller-box {
                    background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
                    border: 2px solid #333;
                    border-radius: 12px;
                    padding: 15px;
                }
                
                @media (max-width: 900px) {
                    .modal-body {
                        grid-template-columns: 1fr;
                    }
                    
                    .image-controls {
                        flex-direction: column;
                    }
                    
                    .inspection-tools {
                        width: 100%;
                        justify-content: center;
                    }
                }
                
                .modal-slab-display {
                    background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
                    border-radius: 12px;
                    border: 2px solid #444;
                    padding: 15px;
                    padding-bottom: 90px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.8);
                    position: relative;
                    min-height: 550px;
                    height: 100%;
                }
                
                .modal-image-viewer {
                    position: relative;
                    overflow: hidden;
                    border-radius: 8px;
                    background: #000;
                    cursor: zoom-in;
                }
                
                .modal-slab-image {
                    width: 100%;
                    height: auto;
                    display: block;
                    transition: transform 0.3s;
                }
                
                .image-controls {
                    position: absolute;
                    bottom: 10px;
                    left: 10px;
                    right: 10px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
                    padding: 10px;
                    background: rgba(0,0,0,0.7);
                    border-radius: 8px;
                    flex-wrap: wrap;
                    backdrop-filter: blur(5px);
                }
                
                .image-nav-btn {
                    padding: 8px 15px;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s;
                }
                
                .image-nav-btn:hover {
                    background: #3fb4ac;
                    transform: scale(1.05);
                }
                
                .image-nav-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .inspection-tools {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }
                
                .tool-btn {
                    padding: 8px 12px;
                    background: rgba(255,255,255,0.1);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-size: 0.85rem;
                    white-space: nowrap;
                    min-width: fit-content;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                }
                
                .tool-btn:hover {
                    background: rgba(255,255,255,0.2);
                }
                
                .tool-btn.active {
                    background: var(--primary);
                    border-color: var(--primary);
                }
                
                /* Fullscreen Modal */
                .fullscreen-viewer {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.98);
                    z-index: 20000;
                    padding: 20px;
                }
                
                .fullscreen-viewer.active {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                
                .fullscreen-image-container {
                    position: relative;
                    max-width: 90%;
                    max-height: 80vh;
                    overflow: auto;
                }
                
                .fullscreen-image {
                    display: block;
                    width: auto;
                    height: auto;
                    max-width: 100%;
                    cursor: move;
                    transform-origin: center;
                }
                
                .fullscreen-controls {
                    position: fixed;
                    bottom: 30px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0,0,0,0.8);
                    padding: 15px 30px;
                    border-radius: 30px;
                    display: flex;
                    gap: 20px;
                    align-items: center;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.2);
                }
                
                .zoom-control {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: white;
                }
                
                .zoom-btn {
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    background: var(--primary);
                    color: white;
                    border: none;
                    font-size: 1.2rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s;
                }
                
                .zoom-btn:hover {
                    background: #3fb4ac;
                    transform: scale(1.1);
                }
                
                .zoom-level {
                    min-width: 60px;
                    text-align: center;
                    font-weight: bold;
                }
                
                .fullscreen-close {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: none;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    font-size: 1.5rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    backdrop-filter: blur(10px);
                }
                
                .fullscreen-close:hover {
                    background: rgba(255,255,255,0.3);
                    transform: rotate(90deg);
                }
                
                .modal-details {
                    color: var(--text-primary);
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                    padding: 5px;
                }
                
                /* Price & Trend Section */
                .price-trend-section {
                    display: grid;
                    grid-template-columns: 250px 1fr;
                    gap: 30px;
                    padding: 25px;
                    background: #222;
                    border-radius: 12px;
                    border: 1px solid #333;
                }
                
                .current-price-box {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                
                .price-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                }
                
                .price-display {
                    display: flex;
                    align-items: baseline;
                    margin-bottom: 8px;
                }
                
                .currency {
                    font-size: 1.5rem;
                    color: #4ecdc4;
                    margin-right: 4px;
                }
                
                .price-number {
                    font-size: 2.5rem;
                    font-weight: 900;
                    color: #4ecdc4;
                }
                
                .price-meta {
                    display: flex;
                    gap: 15px;
                    font-size: 0.85rem;
                }
                
                .trend-indicator {
                    font-weight: bold;
                }
                
                .trend-indicator.positive {
                    color: #4ecdc4;
                }
                
                .time-listed {
                    color: var(--text-muted);
                }
                
                .price-chart-container {
                    position: relative;
                    min-height: 120px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .chart-placeholder {
                    width: 100%;
                    height: 100%;
                    position: relative;
                }
                
                .chart-label {
                    position: absolute;
                    bottom: 10px;
                    right: 10px;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                }
                
                /* Metrics Bar */
                .metrics-bar {
                    display: flex;
                    background: #222;
                    border-radius: 10px;
                    padding: 20px;
                    align-items: center;
                    border: 1px solid #333;
                }
                
                .metric-item {
                    flex: 1;
                    text-align: center;
                }
                
                .metric-title {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    margin-bottom: 5px;
                }
                
                .metric-value {
                    font-size: 1.4rem;
                    font-weight: bold;
                    margin-bottom: 3px;
                }
                
                .metric-value.success {
                    color: #4ecdc4;
                }
                
                .metric-date, .metric-count, .metric-percentile {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }
                
                .metric-range {
                    font-size: 1.1rem;
                    font-weight: bold;
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                    margin-bottom: 3px;
                }
                
                .range-low {
                    color: #ff6b6b;
                }
                
                .range-high {
                    color: #4ecdc4;
                }
                
                .metric-divider {
                    width: 1px;
                    height: 40px;
                    background: rgba(255,255,255,0.1);
                    margin: 0 15px;
                }
                
                /* Details Grid */
                .details-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                }
                
                .detail-card {
                    display: flex;
                    gap: 12px;
                    padding: 18px;
                    background: #222;
                    border: 1px solid #333;
                    border-radius: 10px;
                    align-items: center;
                    transition: all 0.3s;
                }
                
                .detail-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-2px);
                }
                
                .detail-icon {
                    font-size: 1.5rem;
                    filter: grayscale(20%);
                }
                
                .detail-content {
                    flex: 1;
                }
                
                .detail-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    margin-bottom: 4px;
                }
                
                .detail-main {
                    display: flex;
                    align-items: baseline;
                    gap: 8px;
                }
                
                .grade-value {
                    font-size: 1.3rem;
                    font-weight: 900;
                    color: #FFD700;
                }
                
                .grade-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }
                
                .detail-text {
                    font-weight: 600;
                    color: var(--text-primary);
                }
                
                .detail-subtext {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }
                
                .pop-value {
                    font-weight: bold;
                    color: var(--primary);
                }
                
                .pop-higher {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }
                
                .demand-level {
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: bold;
                }
                
                .demand-level.high {
                    background: rgba(255, 107, 107, 0.2);
                    color: #ff6b6b;
                }
                
                .watchers {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }
                
                /* Accordion */
                .info-accordion {
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 10px;
                    overflow: hidden;
                }
                
                .accordion-item {
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                
                .accordion-item:last-child {
                    border-bottom: none;
                }
                
                .accordion-header {
                    width: 100%;
                    padding: 18px;
                    background: #222;
                    border: none;
                    color: var(--text-primary);
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: all 0.3s;
                    font-weight: 600;
                }
                
                .accordion-header:hover {
                    background: rgba(0,0,0,0.3);
                }
                
                .accordion-content {
                    padding: 15px;
                    background: rgba(0,0,0,0.1);
                }
                
                .spec-row, .timeline-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                
                .spec-row:last-child, .timeline-item:last-child {
                    border-bottom: none;
                }
                
                /* Seller Section */
                .seller-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px;
                    background: rgba(0,0,0,0.2);
                    border-radius: 10px;
                }
                
                .seller-badge {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }
                
                .seller-avatar {
                    width: 45px;
                    height: 45px;
                    background: linear-gradient(135deg, #4ecdc4, #44a8a0);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 1.2rem;
                    color: white;
                }
                
                .seller-metrics {
                    display: flex;
                    gap: 12px;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }
                
                .message-seller-btn {
                    padding: 8px 16px;
                    background: rgba(78, 205, 196, 0.1);
                    border: 1px solid var(--primary);
                    border-radius: 8px;
                    color: var(--primary);
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .message-seller-btn:hover {
                    background: var(--primary);
                    color: white;
                }
                
                /* Enhanced Action Buttons */
                .modal-actions-enhanced {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-top: 10px;
                }
                
                .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 15px;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .action-btn.primary {
                    background: linear-gradient(135deg, #4ecdc4, #44a8a0);
                    color: white;
                }
                
                .action-btn.secondary {
                    background: rgba(255, 107, 107, 0.1);
                    border: 1px solid #ff6b6b;
                    color: #ff6b6b;
                }
                
                .action-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                }
                
                .btn-content {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .btn-label {
                    font-weight: bold;
                    font-size: 0.9rem;
                }
                
                .btn-price {
                    font-size: 1.1rem;
                    font-weight: 900;
                }
                
                .btn-hint {
                    font-size: 0.75rem;
                    opacity: 0.8;
                }
                
                .price-overview-card {
                    background: linear-gradient(135deg, rgba(78, 205, 196, 0.1), rgba(78, 205, 196, 0.05));
                    border: 1px solid rgba(78, 205, 196, 0.3);
                    border-radius: 12px;
                    padding: 20px;
                }
                
                .price-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                
                .price-label {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                
                .price-trend {
                    font-size: 0.9rem;
                    font-weight: bold;
                }
                
                .price-main {
                    font-size: 2.5rem;
                    font-weight: 900;
                    color: #4ecdc4;
                    margin-bottom: 5px;
                }
                
                .price-subtext {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }
                
                .market-data-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    padding: 15px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 10px;
                }
                
                .market-stat {
                    text-align: center;
                }
                
                .stat-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    margin-bottom: 5px;
                }
                
                .stat-value {
                    font-size: 1.3rem;
                    font-weight: bold;
                    color: var(--text-primary);
                }
                
                .stat-change {
                    font-size: 0.8rem;
                    margin-top: 3px;
                }
                
                .stat-change.positive {
                    color: #4ecdc4;
                }
                
                .info-tabs {
                    background: rgba(0,0,0,0.2);
                    border-radius: 10px;
                    overflow: hidden;
                }
                
                .tab-header {
                    display: flex;
                    background: rgba(0,0,0,0.3);
                }
                
                .tab-btn {
                    flex: 1;
                    padding: 12px;
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: all 0.3s;
                    font-weight: 600;
                }
                
                .tab-btn.active {
                    background: var(--primary);
                    color: white;
                }
                
                .tab-content {
                    padding: 20px;
                }
                
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                
                .info-label {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }
                
                .info-value {
                    color: var(--text-primary);
                    font-weight: 600;
                }
                
                .grade-badge {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: bold;
                }
                
                .grade-badge.gem-mint {
                    background: linear-gradient(135deg, #FFD700, #FFA500);
                    color: black;
                }
                
                .grade-badge.mint {
                    background: linear-gradient(135deg, #4ecdc4, #44a8a0);
                    color: white;
                }
                
                .grade-badge.nm {
                    background: linear-gradient(135deg, #95a5a6, #7f8c8d);
                    color: white;
                }
                
                .seller-info-card {
                    background: rgba(0,0,0,0.2);
                    border-radius: 10px;
                    padding: 15px;
                }
                
                .seller-header {
                    display: flex;
                    gap: 15px;
                    align-items: center;
                }
                
                .seller-avatar {
                    width: 50px;
                    height: 50px;
                    background: var(--primary);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: white;
                }
                
                .seller-details {
                    flex: 1;
                }
                
                .seller-name {
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                
                .seller-stats {
                    display: flex;
                    gap: 15px;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }
                
                .history-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                .history-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px;
                    background: rgba(0,0,0,0.2);
                    border-radius: 8px;
                }
                
                .history-date {
                    color: var(--text-muted);
                    font-size: 0.85rem;
                }
                
                .history-price {
                    font-weight: bold;
                    color: var(--primary);
                }
                
                .history-platform {
                    color: var(--text-muted);
                    font-size: 0.85rem;
                }
                
                .detail-section {
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                
                .detail-section:last-of-type {
                    border-bottom: none;
                }
                
                .detail-title {
                    color: var(--primary);
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 8px;
                    font-weight: bold;
                }
                
                .detail-value {
                    font-size: 1.3rem;
                    font-weight: 900;
                    margin-bottom: 5px;
                }
                
                .grade-display {
                    display: inline-block;
                    background: white;
                    color: black;
                    padding: 12px 20px;
                    font-size: 2rem;
                    font-weight: 900;
                    border-radius: 10px;
                    box-shadow: 0 5px 20px rgba(255, 215, 0, 0.3);
                    margin-right: 10px;
                }
                
                .modal-actions {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-top: 25px;
                }
                
                .modal-btn {
                    padding: 12px;
                    border: none;
                    border-radius: 10px;
                    font-size: 1rem;
                    font-weight: bold;
                    cursor: pointer;
                    text-transform: uppercase;
                    transition: all 0.3s;
                }
                
                .modal-btn-buy {
                    background: var(--success);
                    color: white;
                }
                
                .modal-btn-buy:hover {
                    background: #3eb34e;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
                }
                
                .modal-btn-offer {
                    background: var(--primary);
                    color: white;
                }
                
                .modal-btn-offer:hover {
                    background: #3fb4ac;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(78, 205, 196, 0.3);
                }
                
                .stats-bar {
                    display: flex;
                    gap: 2rem;
                    padding: 1rem;
                    background: var(--surface);
                    border-radius: 12px;
                    margin-bottom: 1.5rem;
                    border: 1px solid var(--border);
                }
                
                .stat-item {
                    text-align: center;
                    flex: 1;
                }
                
                .stat-value {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: var(--primary);
                }
                
                .stat-label {
                    font-size: 0.875rem;
                    color: var(--text-muted);
                    margin-top: 0.25rem;
                }
                
                /* Centering Tool Styles */
                .centering-tool {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.98);
                    z-index: 15000;
                    display: none;
                    overflow-y: auto;
                }
                
                .centering-tool.active {
                    display: block;
                }
                
                .centering-content {
                    max-width: 1200px;
                    margin: 30px auto;
                    padding: 20px;
                }
                
                .centering-header {
                    background: linear-gradient(90deg, #4ecdc4, #44a8a0);
                    padding: 15px 20px;
                    border-radius: 10px 10px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .centering-workspace {
                    display: grid;
                    grid-template-columns: 600px 1fr;
                    gap: 30px;
                    background: var(--surface);
                    padding: 30px;
                    border-radius: 12px;
                    border: 1px solid var(--border);
                }
                
                .centering-image-container {
                    position: relative;
                    background: #000;
                    border-radius: 12px;
                    overflow: hidden;
                    height: 600px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .centering-image {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    display: block;
                }
                
                .centering-grid {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    pointer-events: none;
                }
                
                .centering-line {
                    position: absolute;
                    background: rgba(255, 0, 0, 0.5);
                    transition: all 0.3s;
                }
                
                .centering-line.horizontal {
                    height: 2px;
                    width: 100%;
                    left: 0;
                    cursor: ns-resize;
                    pointer-events: all;
                }
                
                .centering-line.vertical {
                    width: 2px;
                    height: 100%;
                    top: 0;
                    cursor: ew-resize;
                    pointer-events: all;
                }
                
                .centering-line:hover {
                    background: rgba(255, 255, 0, 0.8);
                    box-shadow: 0 0 10px rgba(255, 255, 0, 0.5);
                }
                
                .centering-line.active-drag {
                    background: #00ff00 !important;
                    box-shadow: 0 0 20px rgba(0, 255, 0, 0.8);
                    z-index: 100;
                }
                
                .centering-helper-text {
                    position: fixed;
                    background: rgba(0, 0, 0, 0.9);
                    color: #FFD700;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    font-weight: bold;
                    pointer-events: none;
                    z-index: 1000;
                    display: none;
                }
                
                .centering-helper-text.active {
                    display: block;
                }
                
                .centering-percentage {
                    position: absolute;
                    background: rgba(0, 0, 0, 0.8);
                    color: #FFD700;
                    padding: 5px 10px;
                    border-radius: 5px;
                    font-weight: bold;
                    font-size: 0.9rem;
                    z-index: 10;
                    backdrop-filter: blur(5px);
                }
                
                .line-label {
                    position: absolute;
                    left: 10px;
                    top: -8px;
                    background: rgba(0, 0, 0, 0.9);
                    color: #FFD700;
                    padding: 2px 8px;
                    border-radius: 3px;
                    font-size: 0.7rem;
                    font-weight: bold;
                    pointer-events: none;
                }
                
                .line-label-vertical {
                    position: absolute;
                    top: 10px;
                    left: -20px;
                    background: rgba(0, 0, 0, 0.9);
                    color: #FFD700;
                    padding: 2px 8px;
                    border-radius: 3px;
                    font-size: 0.7rem;
                    font-weight: bold;
                    writing-mode: vertical-rl;
                    pointer-events: none;
                }
                
                .centering-snap-btn,
                .centering-auto-btn,
                .centering-flip-btn {
                    padding: 8px 12px;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    z-index: 20;
                }
                
                .centering-snap-btn:hover,
                .centering-auto-btn:hover,
                .centering-flip-btn:hover {
                    background: #3fb4ac;
                }
                
                .centering-crosshair {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 40px;
                    height: 40px;
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                    z-index: 5;
                }
                
                .centering-crosshair::before,
                .centering-crosshair::after {
                    content: '';
                    position: absolute;
                    background: rgba(255, 255, 255, 0.3);
                }
                
                .centering-crosshair::before {
                    top: 50%;
                    left: 0;
                    width: 100%;
                    height: 1px;
                    transform: translateY(-50%);
                }
                
                .centering-crosshair::after {
                    left: 50%;
                    top: 0;
                    height: 100%;
                    width: 1px;
                    transform: translateX(-50%);
                }
                
                .centering-visual-guide {
                    position: absolute;
                    pointer-events: none;
                    border: 2px solid rgba(78, 205, 196, 0.3);
                    background: rgba(78, 205, 196, 0.05);
                    transition: all 0.3s;
                }
                
                .centering-line.snapping {
                    background: #FFD700 !important;
                    box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
                }
                
                .centering-results {
                    background: rgba(0,0,0,0.3);
                    padding: 20px;
                    border-radius: 12px;
                }
                
                .centering-score {
                    font-size: 3rem;
                    font-weight: 900;
                    text-align: center;
                    margin-bottom: 20px;
                    padding: 20px;
                    border-radius: 12px;
                }
                
                .centering-perfect {
                    background: linear-gradient(135deg, #00ff00, #00cc00);
                    color: white;
                }
                
                .centering-good {
                    background: linear-gradient(135deg, #4ecdc4, #3aa8a0);
                    color: white;
                }
                
                .centering-fair {
                    background: linear-gradient(135deg, #ffd700, #ffb700);
                    color: black;
                }
                
                .centering-poor {
                    background: linear-gradient(135deg, #ff6b6b, #ff5252);
                    color: white;
                }
                
                /* Surface Inspector Styles */
                .surface-inspector {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.98);
                    z-index: 15000;
                    display: none;
                    overflow-y: auto;
                }
                
                .surface-inspector.active {
                    display: block;
                }
                
                .surface-content {
                    max-width: 1600px;
                    margin: 30px auto;
                    padding: 20px;
                }
                
                .surface-header {
                    background: linear-gradient(90deg, #9b59b6, #8e44ad);
                    padding: 15px 20px;
                    border-radius: 10px 10px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .surface-workspace {
                    background: var(--surface);
                    padding: 30px;
                    border-radius: 12px;
                    border: 1px solid var(--border);
                }
                
                .surface-controls {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }
                
                .surface-control-group {
                    background: rgba(0,0,0,0.3);
                    padding: 15px;
                    border-radius: 8px;
                    flex: 1;
                    min-width: 200px;
                }
                
                .surface-label {
                    color: var(--primary);
                    font-size: 0.9rem;
                    font-weight: bold;
                    margin-bottom: 10px;
                    text-transform: uppercase;
                }
                
                .surface-slider {
                    width: 100%;
                    margin: 10px 0;
                }
                
                .surface-value {
                    text-align: center;
                    color: white;
                    font-weight: bold;
                    margin-top: 5px;
                }
                
                .surface-images-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 20px;
                }
                
                .surface-image-box {
                    position: relative;
                    background: #000;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 2px solid #333;
                }
                
                .surface-image-label {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    background: rgba(0,0,0,0.8);
                    color: var(--primary);
                    padding: 8px 15px;
                    border-radius: 8px;
                    font-weight: bold;
                    font-size: 0.9rem;
                    z-index: 1;
                }
                
                .surface-image {
                    width: 100%;
                    height: 500px;
                    object-fit: contain;
                    display: block;
                    cursor: crosshair;
                }
                
                .surface-split-container {
                    position: relative;
                    width: 100%;
                    height: 600px;
                    overflow: hidden;
                    border-radius: 12px;
                    background: #000;
                }
                
                .surface-split-slider {
                    position: absolute;
                    top: 0;
                    left: 50%;
                    width: 4px;
                    height: 100%;
                    background: var(--primary);
                    cursor: ew-resize;
                    z-index: 10;
                    transform: translateX(-50%);
                }
                
                .surface-split-slider::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 30px;
                    height: 30px;
                    background: var(--primary);
                    border-radius: 50%;
                    opacity: 0.8;
                }
                
                .surface-original-half {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 50%;
                    height: 100%;
                    overflow: hidden;
                }
                
                .surface-filtered-half {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 50%;
                    height: 100%;
                    overflow: hidden;
                }
                
                .surface-defect-marker {
                    position: absolute;
                    width: 30px;
                    height: 30px;
                    border: 2px solid #ff0000;
                    border-radius: 50%;
                    background: rgba(255,0,0,0.3);
                    cursor: pointer;
                    animation: pulse 2s infinite;
                    z-index: 5;
                }
                
                .surface-defect-tooltip {
                    position: absolute;
                    background: rgba(0,0,0,0.9);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    white-space: nowrap;
                    pointer-events: none;
                    z-index: 100;
                    display: none;
                }
                
                .surface-defect-marker:hover .surface-defect-tooltip {
                    display: block;
                    top: -35px;
                    left: 50%;
                    transform: translateX(-50%);
                }
                
                .surface-analysis-panel {
                    background: rgba(0,0,0,0.5);
                    border-radius: 12px;
                    padding: 20px;
                    margin-top: 20px;
                }
                
                .surface-score-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 15px;
                    margin-bottom: 20px;
                }
                
                .surface-score-item {
                    text-align: center;
                    padding: 15px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                
                .surface-score-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    margin-bottom: 8px;
                }
                
                .surface-score-value {
                    font-size: 1.5rem;
                    font-weight: bold;
                }
                
                .score-excellent {
                    color: #00ff00;
                }
                
                .score-good {
                    color: #4ecdc4;
                }
                
                .score-fair {
                    color: #FFD700;
                }
                
                .score-poor {
                    color: #ff6b6b;
                }
                
                .surface-magnifier-box {
                    position: fixed;
                    width: 250px;
                    height: 250px;
                    border: 3px solid var(--primary);
                    border-radius: 50%;
                    overflow: hidden;
                    pointer-events: none;
                    display: none;
                    z-index: 1000;
                    box-shadow: 0 0 30px rgba(78, 205, 196, 0.5);
                }
                
                .surface-magnifier-img {
                    position: absolute;
                    width: 500%;
                    height: 500%;
                }
                
                @media (max-width: 768px) {
                    .centering-workspace,
                    .surface-images-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
    }
    
    render(container) {
        if (!container) return;
        
        const html = `
            <div class="marketplace-container" style="padding: 2rem;">
                ${this.renderHeader()}
                ${this.renderStats()}
                ${this.renderFilterBar()}
                ${this.renderListings()}
                ${this.renderPagination()}
                ${this.renderModal()}
                ${this.renderFullscreenViewer()}
                ${this.renderCornerInspector()}
                ${this.renderCenteringTool()}
                ${this.renderSurfaceInspector()}
            </div>
        `;
        
        container.innerHTML = html;
        this.attachEventListeners();
        setTimeout(() => this.enhanceAllImages(), 100);
    }
    
    renderHeader() {
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div>
                    <h2 style="color: var(--primary); margin: 0;">Card Marketplace</h2>
                    <p style="color: var(--text-muted); margin-top: 0.5rem;">
                        ${this.filteredListings.length} Premium Slabs Available
                    </p>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button onclick="window.listingCreator?.open()" 
                            style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, var(--primary), var(--secondary)); 
                                   color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-plus"></i> List Card
                    </button>
                    <button onclick="window.cardMarketplace.toggleViewMode()" 
                            style="padding: 0.75rem 1rem; background: var(--surface); border: 1px solid var(--border); 
                                   border-radius: 10px; color: var(--text-primary); cursor: pointer;">
                        <i class="fas fa-${this.viewMode === 'grid' ? 'list' : 'th'}"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    renderStats() {
        const totalValue = this.filteredListings.reduce((sum, l) => sum + (parseFloat(l.price) || 0), 0);
        const avgPrice = this.filteredListings.length > 0 ? totalValue / this.filteredListings.length : 0;
        const gradedCount = this.filteredListings.filter(l => l.gradeCompany).length;
        const gemMint = this.filteredListings.filter(l => parseFloat(l.grade) >= 10).length;
        
        return `
            <div class="stats-bar">
                <div class="stat-item">
                    <div class="stat-value">${this.filteredListings.length}</div>
                    <div class="stat-label">Total Slabs</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">$${totalValue.toLocaleString()}</div>
                    <div class="stat-label">Total Value</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">$${Math.floor(avgPrice)}</div>
                    <div class="stat-label">Avg Price</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${gemMint}</div>
                    <div class="stat-label">Gem Mint 10s</div>
                </div>
            </div>
        `;
    }
    
    renderFilterBar() {
        const players = [...new Set(this.listings.map(l => l.cardName))].sort();
        const sets = [...new Set(this.listings.map(l => l.setName))].sort();
        
        return `
            <div class="filter-bar">
                <div class="filter-controls" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                    <div class="search-bar">
                        <i class="fas fa-search" style="position: absolute; left: 1rem; top: 50%; 
                           transform: translateY(-50%); color: var(--text-muted);"></i>
                        <input type="text" 
                               class="search-input" 
                               id="searchInput"
                               placeholder="Search players, sets, or years..." 
                               value="${this.filters.search}">
                    </div>
                    
                    <select id="playerFilter" 
                            style="padding: 0.75rem; background: var(--bg-primary); border: 1px solid var(--border); 
                                   border-radius: 10px; color: var(--text-primary); cursor: pointer;">
                        <option value="">All Players</option>
                        ${players.map(p => `
                            <option value="${p}" ${this.filters.player === p ? 'selected' : ''}>${p}</option>
                        `).join('')}
                    </select>
                    
                    <select id="sortFilter" 
                            style="padding: 0.75rem; background: var(--bg-primary); border: 1px solid var(--border); 
                                   border-radius: 10px; color: var(--text-primary); cursor: pointer;">
                        <option value="newest">Newest First</option>
                        <option value="price-low" ${this.sortBy === 'price-low' ? 'selected' : ''}>Price: Low to High</option>
                        <option value="price-high" ${this.sortBy === 'price-high' ? 'selected' : ''}>Price: High to Low</option>
                        <option value="grade-high" ${this.sortBy === 'grade-high' ? 'selected' : ''}>Grade: High to Low</option>
                    </select>
                    
                    <select id="pageSizeFilter" 
                            style="padding: 0.75rem; background: var(--bg-primary); border: 1px solid var(--border); 
                                   border-radius: 10px; color: var(--text-primary); cursor: pointer;">
                        <option value="12" ${this.itemsPerPage === 12 ? 'selected' : ''}>12 per page</option>
                        <option value="24" ${this.itemsPerPage === 24 ? 'selected' : ''}>24 per page</option>
                        <option value="48" ${this.itemsPerPage === 48 ? 'selected' : ''}>48 per page</option>
                        <option value="72" ${this.itemsPerPage === 72 ? 'selected' : ''}>72 per page</option>
                        <option value="100" ${this.itemsPerPage === 100 ? 'selected' : ''}>100 per page</option>
                    </select>
                    
                    <button onclick="window.cardMarketplace.toggleFilters()" 
                            style="padding: 0.75rem 1rem; background: var(--bg-primary); border: 1px solid var(--border); 
                                   border-radius: 10px; color: var(--text-primary); cursor: pointer; 
                                   display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-filter"></i> 
                        Advanced Filters
                        ${this.getActiveFilterCount() > 0 ? 
                            `<span style="background: var(--primary); color: white; border-radius: 50%; 
                                         width: 20px; height: 20px; display: flex; align-items: center; 
                                         justify-content: center; font-size: 0.75rem;">
                                ${this.getActiveFilterCount()}
                            </span>` : ''
                        }
                    </button>
                </div>
                
                <div class="filter-collapse ${this.isFilterPanelOpen ? 'open' : ''}" id="filterPanel">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                                gap: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); 
                                          font-size: 0.875rem;">
                                Price Range
                            </label>
                            <div style="display: flex; gap: 0.5rem;">
                                <input type="number" 
                                       id="priceMin"
                                       placeholder="Min" 
                                       value="${this.filters.priceMin}"
                                       style="width: 100%; padding: 0.5rem; background: var(--bg-primary); 
                                              border: 1px solid var(--border); border-radius: 8px; 
                                              color: var(--text-primary);">
                                <input type="number" 
                                       id="priceMax"
                                       placeholder="Max" 
                                       value="${this.filters.priceMax}"
                                       style="width: 100%; padding: 0.5rem; background: var(--bg-primary); 
                                              border: 1px solid var(--border); border-radius: 8px; 
                                              color: var(--text-primary);">
                            </div>
                        </div>
                        
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); 
                                          font-size: 0.875rem;">
                                Grade Range
                            </label>
                            <div style="display: flex; gap: 0.5rem;">
                                <input type="number" 
                                       id="gradeMin"
                                       placeholder="Min" 
                                       min="1" max="10" step="0.5"
                                       value="${this.filters.gradeMin}"
                                       style="width: 100%; padding: 0.5rem; background: var(--bg-primary); 
                                              border: 1px solid var(--border); border-radius: 8px; 
                                              color: var(--text-primary);">
                                <input type="number" 
                                       id="gradeMax"
                                       placeholder="Max" 
                                       min="1" max="10" step="0.5"
                                       value="${this.filters.gradeMax}"
                                       style="width: 100%; padding: 0.5rem; background: var(--bg-primary); 
                                              border: 1px solid var(--border); border-radius: 8px; 
                                              color: var(--text-primary);">
                            </div>
                        </div>
                        
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); 
                                          font-size: 0.875rem;">
                                Card Set
                            </label>
                            <select id="setFilter" 
                                    style="width: 100%; padding: 0.5rem; background: var(--bg-primary); 
                                           border: 1px solid var(--border); border-radius: 8px; 
                                           color: var(--text-primary);">
                                <option value="">All Sets</option>
                                ${sets.map(s => `
                                    <option value="${s}" ${this.filters.set === s ? 'selected' : ''}>${s}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div style="display: flex; align-items: flex-end;">
                            <button onclick="window.cardMarketplace.clearFilters()" 
                                    style="width: 100%; padding: 0.5rem; background: var(--danger); 
                                           color: white; border: none; border-radius: 8px; 
                                           cursor: pointer;">
                                <i class="fas fa-times"></i> Clear All
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderListings() {
        if (this.isLoading) {
            return this.renderSkeleton();
        }
        
        if (this.filteredListings.length === 0) {
            return `
                <div class="no-results" style="text-align: center; padding: 4rem 2rem; color: var(--text-muted);">
                    <i class="fas fa-search" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <h3>No cards found</h3>
                    <p>Try adjusting your filters or search terms</p>
                    <button onclick="window.cardMarketplace.clearFilters()" 
                            style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: var(--primary); 
                                   color: white; border: none; border-radius: 10px; cursor: pointer;">
                        Clear Filters
                    </button>
                </div>
            `;
        }
        
        const startIdx = (this.currentPage - 1) * this.itemsPerPage;
        const endIdx = startIdx + this.itemsPerPage;
        const pageListings = this.filteredListings.slice(startIdx, endIdx);
        
        return `
            <div class="card-grid">
                ${pageListings.map(listing => this.renderSlabCard(listing)).join('')}
            </div>
        `;
    }
    
    renderSlabCard(listing) {
        const certNumber = listing._originalData?.grading?.certNumber || 'N/A';
        const grade = listing.grade || 'N/A';
        
        return `
            <div class="slab-card-container" data-card-id="${listing.id}">
                <!-- Flippable Card Section -->
                <div class="slab-flip-section">
                    <div class="slab-flip-inner">
                        <!-- Front of Card -->
                        <div class="slab-front">
                            <div class="slab-label">${listing.gradeCompany ? listing.gradeCompany + ' AUTHENTICATED' : 'RAW CARD'}</div>
                            <div class="slab-card-content">
                                ${listing.gradeCompany ? `
    <div class="slab-grade-container">
        <div class="slab-grade-box">${grade}</div>
        <div class="slab-grade-label">${grade >= 10 ? 'GEM MINT' : grade >= 9 ? 'MINT' : 'NM-MT'}</div>
    </div>
` : ''}
                                
                                <div class="slab-image-container">
                                    ${listing.images?.length > 0 ? 
                                        `<img src="${listing.images[0]}" class="slab-image" alt="${listing.cardName}">` :
                                        `<div style="font-size: 3rem; opacity: 0.2;">ðŸŽ´</div>`
                                    }
                                </div>
                                
                                ${listing.gradeCompany && certNumber !== 'N/A' ? `<div class="slab-cert">CERT #${certNumber}</div>` : ''}
                            </div>
                        </div>
                        
                        <!-- Back of Card -->
                        <div class="slab-back">
                            <div class="slab-label">${listing.gradeCompany ? listing.gradeCompany + ' AUTHENTICATED' : 'RAW CARD'}</div>
                            <div class="slab-card-content">
                                <div class="slab-image-container">
                                    ${listing.images?.length > 1 ? 
                                        `<img src="${listing.images[1]}" class="slab-image" alt="${listing.cardName} Back">` :
                                        `<div style="text-align: center; color: var(--text-muted); padding: 20px;">
                                            <div style="font-size: 3rem; opacity: 0.2; margin-bottom: 10px;">ðŸŽ´</div>
                                            <div>Back Image</div>
                                        </div>`
                                    }
                                </div>
                                <div class="slab-cert">CERT #${certNumber}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Static Bottom Section -->
                <div class="slab-info-section">
                    <div class="slab-player-name">${listing.cardName}</div>
                    <div class="slab-set-name">${listing.setName}</div>
                    <div class="slab-price">$${listing.price}</div>
                    <div class="slab-actions">
                        <button onclick="window.cardMarketplace.quickBuy('${listing.id}')" 
                                class="slab-btn slab-btn-primary">
                            Buy Now
                        </button>
                        <button onclick="window.cardMarketplace.makeOffer('${listing.id}')" 
                                class="slab-btn slab-btn-secondary">
                            Make Offer
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderSkeleton() {
        return `
            <div class="card-grid">
                ${Array(6).fill('').map(() => `
                    <div class="listing-card skeleton" style="height: 400px;"></div>
                `).join('')}
            </div>
        `;
    }
    
    renderModal() {
        return `
            <div class="card-modal" id="cardModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 style="margin: 0; color: black; font-family: 'Bebas Neue', sans-serif; 
                                   font-size: 1.8rem; letter-spacing: 2px;">CARD DETAILS</h2>
                        <button class="modal-close" onclick="window.cardMarketplace.closeModal()">Ã—</button>
                    </div>
                    <div class="modal-body" id="modalBody">
                        <!-- Content will be dynamically inserted -->
                    </div>
                </div>
            </div>
        `;
    }
    
    renderFullscreenViewer() {
        return `
            <div class="fullscreen-viewer" id="fullscreenViewer">
                <button class="fullscreen-close" onclick="window.cardMarketplace.closeFullscreen()">Ã—</button>
                <div class="fullscreen-image-container" id="fullscreenImageContainer">
                    <img class="fullscreen-image" id="fullscreenImage" alt="Card Detail">
                </div>
                <div class="fullscreen-controls">
                    <button class="image-nav-btn" onclick="window.cardMarketplace.prevImage()">
                        <i class="fas fa-chevron-left"></i> Previous
                    </button>
                    <div class="zoom-control">
                        <button class="zoom-btn" onclick="window.cardMarketplace.zoomOut()">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="zoom-level" id="zoomLevel">100%</span>
                        <button class="zoom-btn" onclick="window.cardMarketplace.zoomIn()">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="image-nav-btn" onclick="window.cardMarketplace.nextImage()">
                        Next <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    renderCornerInspector() {
        return `
            <div class="corner-inspector" id="cornerInspector">
                <div class="inspector-content">
                    <div class="inspector-header">
                        <h2 class="inspector-title">ADVANCED CORNER & EDGE ANALYZER</h2>
                        <button class="inspector-close" onclick="window.cardMarketplace.closeCornerInspector()">Ã—</button>
                    </div>
                    
                    <!-- Controls Panel -->
                    <div class="corner-controls">
                        <div class="corner-control-group">
                            <div class="control-label">Enhancement</div>
                            <select id="cornerEnhancement" onchange="window.cardMarketplace.updateCornerEnhancement()"
                                    style="width: 100%; padding: 6px; background: var(--bg-primary); 
                                           border: 1px solid var(--border); border-radius: 6px; 
                                           color: var(--text-primary);">
                                <option value="normal">Normal View</option>
                                <option value="enhanced">Enhanced Contrast</option>
                                <option value="whitening">Detect Whitening</option>
                                <option value="sharpness">Edge Sharpness</option>
                                <option value="damage">Damage Detection</option>
                            </select>
                        </div>
                        
                        <div class="corner-control-group">
                            <div class="control-label">View Mode</div>
                            <select id="cornerViewMode" onchange="window.cardMarketplace.changeCornerView()"
                                    style="width: 100%; padding: 6px; background: var(--bg-primary); 
                                           border: 1px solid var(--border); border-radius: 6px; 
                                           color: var(--text-primary);">
                                <option value="all">All Corners</option>
                                <option value="comparison">Side-by-Side</option>
                                <option value="focus">Focus Mode</option>
                                <option value="overlay">Overlay Analysis</option>
                            </select>
                        </div>
                        
                        <div class="corner-control-group">
                            <div class="control-label">Magnification</div>
                            <input type="range" id="cornerMagnification" 
                                   min="4" max="10" value="4" 
                                   oninput="window.cardMarketplace.updateCornerMagnification()"
                                   style="width: 100%;">
                            <div style="text-align: center; color: var(--text-muted); font-size: 0.8rem;">
                                <span id="magLevel">4x</span>
                            </div>
                        </div>
                        
                        <div class="corner-control-group">
                            <div class="control-label">Tools</div>
                            <div style="display: flex; gap: 8px;">
                                <button onclick="window.cardMarketplace.toggleCornerGrid()" 
                                        style="flex: 1; padding: 6px; background: rgba(78, 205, 196, 0.1); 
                                               border: 1px solid var(--primary); border-radius: 6px; 
                                               color: var(--primary); cursor: pointer; font-size: 0.8rem;">
                                    Grid
                                </button>
                                <button onclick="window.cardMarketplace.toggleCornerMeasure()" 
                                        style="flex: 1; padding: 6px; background: rgba(78, 205, 196, 0.1); 
                                               border: 1px solid var(--primary); border-radius: 6px; 
                                               color: var(--primary); cursor: pointer; font-size: 0.8rem;">
                                    Measure
                                </button>
                                <button onclick="window.cardMarketplace.markCornerDefects()" 
                                        style="flex: 1; padding: 6px; background: rgba(78, 205, 196, 0.1); 
                                               border: 1px solid var(--primary); border-radius: 6px; 
                                               color: var(--primary); cursor: pointer; font-size: 0.8rem;">
                                    Mark
                                </button>
                            </div>
                        </div>
                        
                        <div class="corner-control-group">
                            <div class="control-label">Actions</div>
                            <button onclick="window.cardMarketplace.autoAnalyzeCorners()" 
                                    style="width: 100%; padding: 8px; 
                                           background: linear-gradient(135deg, #FFD700, #FFA500); 
                                           color: black; border: none; border-radius: 6px; 
                                           cursor: pointer; font-weight: bold;">
                                ðŸ¤– Auto-Analyze
                            </button>
                        </div>
                    </div>
                    
                    <!-- Analysis Panel -->
                    <div class="corner-analysis-panel">
                        <div class="analysis-grid">
                            <div class="analysis-item">
                                <div class="analysis-label">Overall Score</div>
                                <div class="analysis-value score-excellent" id="cornerOverallScore">95</div>
                            </div>
                            <div class="analysis-item">
                                <div class="analysis-label">Sharpness</div>
                                <div class="analysis-value score-good" id="cornerSharpness">Sharp</div>
                            </div>
                            <div class="analysis-item">
                                <div class="analysis-label">Whitening</div>
                                <div class="analysis-value score-excellent" id="cornerWhitening">None</div>
                            </div>
                            <div class="analysis-item">
                                <div class="analysis-label">Consistency</div>
                                <div class="analysis-value score-good" id="cornerConsistency">Good</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="corner-grid" id="cornerGrid">
                        <!-- Content will be dynamically inserted -->
                    </div>
                </div>
            </div>
        `;
    }
    
    renderPagination() {
        const totalPages = Math.ceil(this.filteredListings.length / this.itemsPerPage);
        
        if (totalPages <= 1) return '';
        
        return `
            <div style="display: flex; justify-content: center; gap: 0.5rem; margin-top: 2rem;">
                <button onclick="window.cardMarketplace.goToPage(${this.currentPage - 1})" 
                        style="padding: 0.5rem 1rem; background: var(--surface); border: 1px solid var(--border); 
                               border-radius: 8px; color: var(--text-primary); cursor: pointer;"
                        ${this.currentPage === 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                    <i class="fas fa-chevron-left"></i>
                </button>
                
                ${Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                    const pageNum = i + 1;
                    return `
                        <button onclick="window.cardMarketplace.goToPage(${pageNum})" 
                                style="padding: 0.5rem 1rem; background: ${this.currentPage === pageNum ? 'var(--primary)' : 'var(--surface)'}; 
                                       color: ${this.currentPage === pageNum ? 'white' : 'var(--text-primary)'}; 
                                       border: 1px solid var(--border); border-radius: 8px; cursor: pointer;">
                            ${pageNum}
                        </button>
                    `;
                }).join('')}
                
                <button onclick="window.cardMarketplace.goToPage(${this.currentPage + 1})" 
                        style="padding: 0.5rem 1rem; background: var(--surface); border: 1px solid var(--border); 
                               border-radius: 8px; color: var(--text-primary); cursor: pointer;"
                        ${this.currentPage === totalPages ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
    }
    
    // Data Methods
    async loadListings() {
        this.isLoading = true;
        
        try {
            const response = await fetch('http://localhost:3000/api/marketplace/cards');
            const data = await response.json();
            
            if (data.success && data.cards) {
                this.listings = data.cards.map(card => ({
                    id: card._id || card.id,
                    cardName: card.cardDetails?.name || card.name || 'Unknown Card',
                    setName: card.cardDetails?.set || card.set || 'Unknown Set',
                    price: card.pricing?.price || card.price || 0,
                    condition: this.mapCondition(card.grading),
                    gradeCompany: card.grading?.isGraded ? (card.grading?.company?.toUpperCase() || 'SGC') : '',
                    grade: card.grading?.grade?.toString() || '',
                    category: card.cardDetails?.category || 'sports',
                    seller: card.seller?.username || 'Anonymous',
                    images: card.images?.map(img => img.url) || [],
                    listingType: card.listing?.type || 'sale',
                    createdAt: card.createdAt || new Date().toISOString(),
                    _originalData: card
                }));
                
                console.log(`Loaded ${this.listings.length} cards from API`);
                this.saveListings();
            }
        } catch (error) {
            console.error('Error loading listings:', error);
        }
        
        this.isLoading = false;
        this.applyFilters();
        
        const container = document.querySelector('.marketplace-container')?.parentElement;
        if (container) {
            this.render(container);
        }
    }
    
    mapCondition(grading) {
    if (!grading?.isGraded || !grading?.company) return 'raw';
    const grade = parseFloat(grading.grade);
    if (grade >= 9.5) return 'mint';
    if (grade >= 8.5) return 'near-mint';
    if (grade >= 7) return 'lightly-played';
    if (grade >= 5) return 'moderately-played';
    return 'heavily-played';
}
    
    saveListings() {
        localStorage.setItem('marketplaceListings', JSON.stringify(this.listings));
    }
    
    applyFilters() {
        let filtered = [...this.listings];
        
        if (this.filters.search) {
            const search = this.filters.search.toLowerCase();
            filtered = filtered.filter(l => 
                l.cardName.toLowerCase().includes(search) ||
                l.setName.toLowerCase().includes(search) ||
                l.seller.toLowerCase().includes(search) ||
                l.grade.toString().includes(search)
            );
        }
        
        if (this.filters.player) {
            filtered = filtered.filter(l => l.cardName === this.filters.player);
        }
        
        if (this.filters.set) {
            filtered = filtered.filter(l => l.setName === this.filters.set);
        }
        
        if (this.filters.priceMin) {
            filtered = filtered.filter(l => l.price >= parseFloat(this.filters.priceMin));
        }
        if (this.filters.priceMax) {
            filtered = filtered.filter(l => l.price <= parseFloat(this.filters.priceMax));
        }
        
        if (this.filters.gradeMin) {
            filtered = filtered.filter(l => parseFloat(l.grade) >= parseFloat(this.filters.gradeMin));
        }
        if (this.filters.gradeMax) {
            filtered = filtered.filter(l => parseFloat(l.grade) <= parseFloat(this.filters.gradeMax));
        }
        
        filtered = this.sortListings(filtered);
        
        this.filteredListings = filtered;
        this.currentPage = 1;
    }
    
    sortListings(listings) {
        const sorted = [...listings];
        
        switch(this.sortBy) {
            case 'price-low':
                return sorted.sort((a, b) => a.price - b.price);
            case 'price-high':
                return sorted.sort((a, b) => b.price - a.price);
            case 'grade-high':
                return sorted.sort((a, b) => parseFloat(b.grade) - parseFloat(a.grade));
            case 'newest':
            default:
                return sorted.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
        }
    }
    
    // UI Methods
    toggleViewMode() {
        this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
        const container = document.querySelector('.marketplace-container').parentElement;
        this.render(container);
    }
    
    toggleFilters() {
        this.isFilterPanelOpen = !this.isFilterPanelOpen;
        const panel = document.getElementById('filterPanel');
        if (panel) {
            panel.classList.toggle('open');
        }
    }
    
    clearFilters() {
        this.filters = {
            category: 'all',
            priceMin: '',
            priceMax: '',
            condition: 'all',
            graded: 'all',
            gradeMin: '',
            gradeMax: '',
            player: '',
            set: '',
            search: ''
        };
        this.applyFilters();
        const container = document.querySelector('.marketplace-container').parentElement;
        this.render(container);
    }
    
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredListings.length / this.itemsPerPage);
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        const container = document.querySelector('.marketplace-container').parentElement;
        this.render(container);
    }
    
    // Actions
    openModal(cardId) {
        const listing = this.listings.find(l => l.id === cardId);
        if (!listing) return;
        
        this.selectedCard = listing;
        this.modalImageIndex = 0;
        
        const modal = document.getElementById('cardModal');
        const modalBody = document.getElementById('modalBody');
        
        if (modal && modalBody) {
            modalBody.innerHTML = `
                <div style="width: 100%; max-width: 1200px; margin: 0 auto; padding: 20px;">
                    <div style="display: grid; grid-template-columns: 280px 1fr; gap: 20px; background: #1a1a1a; padding: 20px; border-radius: 12px;">
                        
                        <!-- Left: Card Display -->
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <div style="position: relative; background: linear-gradient(145deg, #2a2a2a, #1a1a1a); border: 2px solid #333; border-radius: 12px; padding: 10px;">
                                ${listing.gradeCompany ? `
    <div style="position: absolute; top: -8px; right: 10px; background: linear-gradient(135deg, #FFD700, #FFA500); padding: 6px 12px; border-radius: 6px; z-index: 10;">
        <span style="font-size: 1.2rem; font-weight: 900; color: black;">${listing.gradeCompany} ${listing.grade}</span>
    </div>
` : ''}
                                <div style="background: #000; border-radius: 8px; height: 250px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                    ${listing.images?.length > 0 ? 
                                        `<img src="${listing.images[this.modalImageIndex]}" 
                                              style="width: 100%; height: 100%; object-fit: contain;" 
                                              id="modalImage" 
                                              alt="${listing.cardName}"
                                              onload="window.cardMarketplace.enhanceImageQuality(this)">` :
                                        `<div style="font-size: 3rem; opacity: 0.2;">📋</div>`
                                    }
                                </div>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; margin-top: 8px;">
                                    ${listing.images?.map((img, idx) => `
                                        <button onclick="window.cardMarketplace.switchImage(${idx})" style="padding: 6px; background: ${idx === this.modalImageIndex ? 'var(--primary)' : 'rgba(78, 205, 196, 0.1)'}; border: 1px solid var(--primary); color: white; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                                            ${idx === 0 ? 'Front' : 'Back'}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Right: Grid Layout for Info -->
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                            
                            <!-- Price & Actions Box -->
                            <div style="background: linear-gradient(145deg, #2a2a2a, #1a1a1a); border: 2px solid var(--primary); border-radius: 12px; padding: 15px; display: flex; flex-direction: column; gap: 10px;">
                                <div style="text-align: center;">
                                    <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Current Price</div>
                                    <div style="font-size: 2rem; font-weight: 900; color: #4ecdc4;">$${listing.price}</div>
                                    <div style="font-size: 0.75rem; color: var(--text-muted);">â†‘ 12.5% vs 30d avg</div>
                                </div>
                                <button onclick="window.cardMarketplace.quickBuy('${listing.id}')" style="padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
                                    ðŸ’° Buy Now
                                </button>
                                <button onclick="window.cardMarketplace.makeOffer('${listing.id}')" style="padding: 10px; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
                                    ðŸ¤ Make Offer
                                </button>
                                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px;">
                                    <button onclick="window.cardMarketplace.addToWatchlist('${listing.id}')" style="padding: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: white; cursor: pointer;">â¤ï¸</button>
                                    <button onclick="window.cardMarketplace.shareCard('${listing.id}')" style="padding: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: white; cursor: pointer;">ðŸ“¤</button>
                                    <button onclick="window.cardMarketplace.contactSeller('${listing.id}')" style="padding: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: white; cursor: pointer;">ðŸ’¬</button>
                                </div>
                            </div>
                            
                            <!-- Card Info Box -->
                            <div style="background: linear-gradient(145deg, #2a2a2a, #1a1a1a); border: 2px solid #333; border-radius: 12px; padding: 15px;">
                                <div style="font-size: 0.8rem; font-weight: bold; color: var(--primary); margin-bottom: 10px; text-transform: uppercase;">Card Info</div>
                                <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem;">
                                    ${listing.gradeCompany ? `
    <div style="display: flex; justify-content: space-between;">
        <span style="color: var(--text-muted);">Grading Co</span>
        <span style="color: white; font-weight: bold;">${listing.gradeCompany}</span>
    </div>
    <div style="display: flex; justify-content: space-between;">
        <span style="color: var(--text-muted);">Cert #</span>
        <span style="color: white; font-weight: bold;">${listing._originalData?.grading?.certNumber || 'N/A'}</span>
    </div>
` : `
    <div style="display: flex; justify-content: space-between;">
        <span style="color: var(--text-muted);">Condition</span>
        <span style="color: white; font-weight: bold;">Raw Card</span>
    </div>
`}
                                    <div style="display: flex; justify-content: space-between;">
                                        <span style="color: var(--text-muted);">Player</span>
                                        <span style="color: white; font-weight: bold;">${listing.cardName}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <span style="color: var(--text-muted);">Set</span>
                                        <span style="color: white; font-weight: bold;">${listing.setName}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <span style="color: var(--text-muted);">Year</span>
                                        <span style="color: white; font-weight: bold;">${listing._originalData?.cardDetails?.year || '1999'}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <span style="color: var(--text-muted);">Card #</span>
                                        <span style="color: white; font-weight: bold;">${listing._originalData?.cardDetails?.number || '318'}</span>
                                    </div>
                                </div>
                                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
                                    <div style="display: flex; gap: 8px; align-items: center;">
                                        <div style="width: 30px; height: 30px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 0.9rem;">
                                            ${listing.seller.charAt(0).toUpperCase()}
                                        </div>
                                        <div style="flex: 1;">
                                            <div style="font-weight: bold; font-size: 0.85rem;">${listing.seller}</div>
                                            <div style="font-size: 0.7rem; color: var(--text-muted);">⭐ 4.9 • 523 sales</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Market Stats Box -->
                            <div style="background: linear-gradient(145deg, #2a2a2a, #1a1a1a); border: 2px solid #333; border-radius: 12px; padding: 15px;">
                                <div style="font-size: 0.8rem; font-weight: bold; color: #ff6b6b; margin-bottom: 10px; text-transform: uppercase;">Market Stats</div>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                                    <div style="text-align: center;">
                                        <div style="font-size: 1.1rem; font-weight: bold; color: var(--primary);">$${(listing.price * 0.75).toFixed(0)}</div>
                                        <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Low 90D</div>
                                    </div>
                                    <div style="text-align: center;">
                                        <div style="font-size: 1.1rem; font-weight: bold; color: var(--primary);">$${(listing.price * 1.25).toFixed(0)}</div>
                                        <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">High 90D</div>
                                    </div>
                                    <div style="text-align: center;">
                                        <div style="font-size: 1.1rem; font-weight: bold; color: var(--primary);">24</div>
                                        <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Sales 30D</div>
                                    </div>
                                    <div style="text-align: center;">
                                        <div style="font-size: 1.1rem; font-weight: bold; color: var(--primary);">15</div>
                                        <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Watching</div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Grade Details Box -->
                            <div style="background: linear-gradient(145deg, #2a2a2a, #1a1a1a); border: 2px solid #333; border-radius: 12px; padding: 15px;">
                                <div style="font-size: 0.8rem; font-weight: bold; color: #FFD700; margin-bottom: 10px; text-transform: uppercase;">Grade Details</div>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                                    <div style="text-align: center;">
                                        <div style="font-size: 0.7rem; color: var(--text-muted);">Centering</div>
                                        <div style="font-size: 1rem; font-weight: bold; color: #FFD700;">9.5</div>
                                    </div>
                                    <div style="text-align: center;">
                                        <div style="font-size: 0.7rem; color: var(--text-muted);">Corners</div>
                                        <div style="font-size: 1rem; font-weight: bold; color: #FFD700;">10</div>
                                    </div>
                                    <div style="text-align: center;">
                                        <div style="font-size: 0.7rem; color: var(--text-muted);">Edges</div>
                                        <div style="font-size: 1rem; font-weight: bold; color: #FFD700;">10</div>
                                    </div>
                                    <div style="text-align: center;">
                                        <div style="font-size: 0.7rem; color: var(--text-muted);">Surface</div>
                                        <div style="font-size: 1rem; font-weight: bold; color: #FFD700;">9.5</div>
                                    </div>
                                </div>
                                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center; font-size: 0.75rem; color: var(--text-muted);">
                                    Pop: 247 â€¢ Higher: 12
                                </div>
                            </div>
                            
                            <!-- Price History Box -->
                            <div style="background: linear-gradient(145deg, #2a2a2a, #1a1a1a); border: 2px solid #333; border-radius: 12px; padding: 15px;">
                                <div style="font-size: 0.8rem; font-weight: bold; color: var(--primary); margin-bottom: 10px; text-transform: uppercase;">Price History</div>
                                <div style="display: flex; gap: 5px; margin-bottom: 10px;">
                                    <button onclick="window.cardMarketplace.updateChart('1m')" style="flex: 1; padding: 4px; background: var(--primary); border: none; border-radius: 3px; color: white; cursor: pointer; font-size: 0.65rem;">1M</button>
                                    <button onclick="window.cardMarketplace.updateChart('3m')" style="flex: 1; padding: 4px; background: rgba(255,255,255,0.1); border: none; border-radius: 3px; color: var(--text-muted); cursor: pointer; font-size: 0.65rem;">3M</button>
                                    <button onclick="window.cardMarketplace.updateChart('1y')" style="flex: 1; padding: 4px; background: rgba(255,255,255,0.1); border: none; border-radius: 3px; color: var(--text-muted); cursor: pointer; font-size: 0.65rem;">1Y</button>
                                </div>
                                <canvas id="priceHistoryChart" style="height: 100px;"></canvas>
                            </div>
                            
                            <!-- Inspection Tools Box -->
                            <div style="background: linear-gradient(145deg, #2a2a2a, #1a1a1a); border: 2px solid #333; border-radius: 12px; padding: 15px;">
                                <div style="font-size: 0.8rem; font-weight: bold; color: var(--primary); margin-bottom: 10px; text-transform: uppercase;">Inspection Tools</div>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                                    <button onclick="window.cardMarketplace.openCornerInspector()" style="padding: 8px; background: rgba(78, 205, 196, 0.1); border: 1px solid #444; border-radius: 6px; color: var(--primary); cursor: pointer; font-size: 0.75rem;">
                                        ðŸ” Corners
                                    </button>
                                    <button onclick="window.cardMarketplace.openCenteringTool()" style="padding: 8px; background: rgba(78, 205, 196, 0.1); border: 1px solid #444; border-radius: 6px; color: var(--primary); cursor: pointer; font-size: 0.75rem;">
                                        ðŸŽ¯ Centering
                                    </button>
                                    <button onclick="window.cardMarketplace.openSurfaceInspector()" style="padding: 8px; background: rgba(78, 205, 196, 0.1); border: 1px solid #444; border-radius: 6px; color: var(--primary); cursor: pointer; font-size: 0.75rem;">
                                        âœ¨ Surface
                                    </button>
                                    <button onclick="window.cardMarketplace.openFullscreen()" style="padding: 8px; background: rgba(78, 205, 196, 0.1); border: 1px solid #444; border-radius: 6px; color: var(--primary); cursor: pointer; font-size: 0.75rem;">
                                        ðŸ–¼ï¸ Fullscreen
                                    </button>
                                    <button onclick="window.cardMarketplace.openToolsGuide()" style="padding: 8px; background: rgba(78, 205, 196, 0.1); border: 1px solid #444; border-radius: 6px; color: var(--primary); cursor: pointer; font-size: 0.75rem; grid-column: span 2;">
                                        ðŸ“– Guide
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            modal.classList.add('active');
            this.initPriceHistoryChart(listing.cardName, listing.setName);
        }
    }
    
    async initPriceHistoryChart(cardName, setName, period = '1m') {
        const canvas = document.getElementById('priceHistoryChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Mock data for different time periods
        const chartDataByPeriod = {
            '1m': {
                labels: ['4w ago', '3w ago', '2w ago', '1w ago', '3d ago', 'Yesterday', 'Today'],
                data: [285, 295, 310, 305, 320, 315, 330]
            },
            '3m': {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Today'],
                data: [250, 265, 280, 295, 310, 315, 330]
            },
            '6m': {
                labels: ['6m ago', '5m ago', '4m ago', '3m ago', '2m ago', '1m ago', 'Today'],
                data: [220, 235, 260, 285, 300, 315, 330]
            },
            '1y': {
                labels: ['Jan 23', 'Apr 23', 'Jul 23', 'Oct 23', 'Jan 24', 'Apr 24', 'Today'],
                data: [180, 195, 220, 250, 280, 310, 330]
            },
            'all': {
                labels: ['2021', '2022', '2023', '2024', 'Today'],
                data: [120, 150, 210, 280, 330]
            }
        };
        
        const selectedData = chartDataByPeriod[period] || chartDataByPeriod['1m'];
        
        const chartData = {
            labels: selectedData.labels,
            datasets: [{
                label: 'Sale Price',
                data: selectedData.data,
                borderColor: '#4ecdc4',
                backgroundColor: 'rgba(78, 205, 196, 0.05)',
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#4ecdc4',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        };
        
        if (window.Chart) {
            new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value;
                                },
                                color: '#888'
                            },
                            grid: {
                                color: 'rgba(255,255,255,0.05)'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#888'
                            },
                            grid: {
                                color: 'rgba(255,255,255,0.05)'
                            }
                        }
                    }
                }
            });
        }
    }

    updateChart(period) {
        // Update button states
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Reinitialize chart with new period
        if (this.selectedCard) {
            this.initPriceHistoryChart(this.selectedCard.cardName, this.selectedCard.setName, period);
        }
    }
    
    switchImage(index) {
        if (!this.selectedCard || !this.selectedCard.images) return;
        
        this.modalImageIndex = index;
        const modalImage = document.getElementById('modalImage');
        if (modalImage && this.selectedCard.images[index]) {
            modalImage.src = this.selectedCard.images[index];
        }
    }
    
    openCornerInspector() {
        if (!this.selectedCard) return;
        
        const inspector = document.getElementById('cornerInspector');
        const grid = document.getElementById('cornerGrid');
        
        if (inspector && grid) {
            const frontImage = this.selectedCard.images?.[0];
            const backImage = this.selectedCard.images?.[1];
            
            // Initialize corner analysis mode
            this.cornerViewMode = 'all';
            this.cornerEnhancement = 'normal';
            this.cornerMagnification = 4;
            this.cornerDefects = [];
            this.showGrid = false;
            this.showMeasure = false;
            
            grid.innerHTML = `
                <!-- Front Card Corners -->
                <div class="side-section">
                    <div class="side-label">
                        <span><i class="fas fa-square"></i> Front Card - All Corners & Edges</span>
                        <button onclick="window.cardMarketplace.analyzeCardSide('front')" 
                                style="padding: 5px 10px; background: var(--primary); color: white; 
                                       border: none; border-radius: 5px; cursor: pointer; font-size: 0.8rem;">
                            Analyze Front
                        </button>
                    </div>
                    <div class="corners-container">
                        <div class="corner-box" data-corner="tl-front">
                            <div class="corner-label">TOP LEFT</div>
                            <div class="corner-score score-excellent" id="tl-front-score">95</div>
                            <div class="corner-image-container" 
                                 onclick="window.cardMarketplace.toggleCornerZoom(event, 'tl-front')"
                                 onmousemove="window.cardMarketplace.handleCornerMagnify(event, 'tl-front')"
                                 onmouseleave="window.cardMarketplace.hideCornerMagnify('tl-front')"
                                 id="tl-front-container">
                                ${frontImage ? 
                                    `<img src="${frontImage}" 
                                          class="corner-image top-left" 
                                          id="tl-front-img"
                                          alt="Top Left Corner">
                                     <div class="corner-overlay" id="tl-front-overlay">
                                        <div class="corner-gridlines" id="tl-front-grid"></div>
                                     </div>
                                     <div class="corner-measurement" id="tl-front-measure"></div>
                                     <div class="magnifier" id="tl-front-mag">
                                        <img src="${frontImage}" class="magnifier-image" id="tl-front-mag-img">
                                     </div>
                                     <button class="close-zoom" onclick="event.stopPropagation(); window.cardMarketplace.closeZoom('tl-front')">Ã—</button>` :
                                    '<div style="padding: 50px; text-align: center; color: var(--text-muted);">No Image</div>'
                                }
                            </div>
                            <div class="condition-notes">
                                <strong>Analysis:</strong> <span id="tl-front-analysis">Checking for whitening, bending, or soft corners...</span>
                            </div>
                        </div>
                        
                        <div class="corner-box" data-corner="tr-front">
                            <div class="corner-label">TOP RIGHT</div>
                            <div class="corner-score score-excellent" id="tr-front-score">94</div>
                            <div class="corner-image-container"
                                 onclick="window.cardMarketplace.toggleCornerZoom(event, 'tr-front')"
                                 onmousemove="window.cardMarketplace.handleCornerMagnify(event, 'tr-front')"
                                 onmouseleave="window.cardMarketplace.hideCornerMagnify('tr-front')"
                                 id="tr-front-container">
                                ${frontImage ? 
                                    `<img src="${frontImage}" 
                                          class="corner-image top-right" 
                                          id="tr-front-img"
                                          alt="Top Right Corner">
                                     <div class="corner-overlay" id="tr-front-overlay">
                                        <div class="corner-gridlines" id="tr-front-grid"></div>
                                     </div>
                                     <div class="corner-measurement" id="tr-front-measure"></div>
                                     <div class="magnifier" id="tr-front-mag">
                                        <img src="${frontImage}" class="magnifier-image" id="tr-front-mag-img">
                                     </div>
                                     <button class="close-zoom" onclick="event.stopPropagation(); window.cardMarketplace.closeZoom('tr-front')">Ã—</button>` :
                                    '<div style="padding: 50px; text-align: center; color: var(--text-muted);">No Image</div>'
                                }
                            </div>
                            <div class="condition-notes">
                                <strong>Analysis:</strong> <span id="tr-front-analysis">Checking for chipping, surface wear, or dings...</span>
                            </div>
                        </div>
                        
                        <div class="corner-box" data-corner="bl-front">
                            <div class="corner-label">BOTTOM LEFT</div>
                            <div class="corner-score score-good" id="bl-front-score">92</div>
                            <div class="corner-image-container"
                                 onclick="window.cardMarketplace.toggleCornerZoom(event, 'bl-front')"
                                 onmousemove="window.cardMarketplace.handleCornerMagnify(event, 'bl-front')"
                                 onmouseleave="window.cardMarketplace.hideCornerMagnify('bl-front')"
                                 id="bl-front-container">
                                ${frontImage ? 
                                    `<img src="${frontImage}" 
                                          class="corner-image bottom-left" 
                                          id="bl-front-img"
                                          alt="Bottom Left Corner">
                                     <div class="corner-overlay" id="bl-front-overlay">
                                        <div class="corner-gridlines" id="bl-front-grid"></div>
                                     </div>
                                     <div class="corner-measurement" id="bl-front-measure"></div>
                                     <div class="magnifier" id="bl-front-mag">
                                        <img src="${frontImage}" class="magnifier-image" id="bl-front-mag-img">
                                     </div>
                                     <button class="close-zoom" onclick="event.stopPropagation(); window.cardMarketplace.closeZoom('bl-front')">Ã—</button>` :
                                    '<div style="padding: 50px; text-align: center; color: var(--text-muted);">No Image</div>'
                                }
                            </div>
                            <div class="condition-notes">
                                <strong>Analysis:</strong> <span id="bl-front-analysis">Inspecting for fraying, peeling, or damage...</span>
                            </div>
                        </div>
                        
                        <div class="corner-box" data-corner="br-front">
                            <div class="corner-label">BOTTOM RIGHT</div>
                            <div class="corner-score score-good" id="br-front-score">91</div>
                            <div class="corner-image-container"
                                 onclick="window.cardMarketplace.toggleCornerZoom(event, 'br-front')"
                                 onmousemove="window.cardMarketplace.handleCornerMagnify(event, 'br-front')"
                                 onmouseleave="window.cardMarketplace.hideCornerMagnify('br-front')"
                                 id="br-front-container">
                                ${frontImage ? 
                                    `<img src="${frontImage}" 
                                          class="corner-image bottom-right" 
                                          id="br-front-img"
                                          alt="Bottom Right Corner">
                                     <div class="corner-overlay" id="br-front-overlay">
                                        <div class="corner-gridlines" id="br-front-grid"></div>
                                     </div>
                                     <div class="corner-measurement" id="br-front-measure"></div>
                                     <div class="magnifier" id="br-front-mag">
                                        <img src="${frontImage}" class="magnifier-image" id="br-front-mag-img">
                                     </div>
                                     <button class="close-zoom" onclick="event.stopPropagation(); window.cardMarketplace.closeZoom('br-front')">Ã—</button>` :
                                    '<div style="padding: 50px; text-align: center; color: var(--text-muted);">No Image</div>'
                                }
                            </div>
                            <div class="condition-notes">
                                <strong>Analysis:</strong> <span id="br-front-analysis">Examining for rounding, blunting, or creases...</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Back Card Corners -->
                ${backImage ? `
                    <div class="side-section">
                        <div class="side-label">
                            <span><i class="fas fa-square"></i> Back Card - All Corners & Edges</span>
                            <button onclick="window.cardMarketplace.analyzeCardSide('back')" 
                                    style="padding: 5px 10px; background: var(--primary); color: white; 
                                           border: none; border-radius: 5px; cursor: pointer; font-size: 0.8rem;">
                                Analyze Back
                            </button>
                        </div>
                        <div class="corners-container">
                            ${['tl', 'tr', 'bl', 'br'].map(corner => `
                                <div class="corner-box" data-corner="${corner}-back">
                                    <div class="corner-label">${corner.toUpperCase().replace('TL', 'TOP LEFT').replace('TR', 'TOP RIGHT').replace('BL', 'BOTTOM LEFT').replace('BR', 'BOTTOM RIGHT')}</div>
                                    <div class="corner-score score-good" id="${corner}-back-score">90</div>
                                    <div class="corner-image-container"
                                         onmousemove="window.cardMarketplace.handleCornerMagnify(event, '${corner}-back')"
                                         onmouseleave="window.cardMarketplace.hideCornerMagnify('${corner}-back')">
                                        <img src="${backImage}" 
                                              class="corner-image ${corner.includes('t') ? 'top' : 'bottom'}-${corner.includes('l') ? 'left' : 'right'}" 
                                              id="${corner}-back-img"
                                              alt="Back ${corner.toUpperCase()} Corner">
                                        <div class="corner-overlay" id="${corner}-back-overlay">
                                            <div class="corner-gridlines" id="${corner}-back-grid"></div>
                                        </div>
                                        <div class="magnifier" id="${corner}-back-mag">
                                            <img src="${backImage}" class="magnifier-image" id="${corner}-back-mag-img">
                                        </div>
                                    </div>
                                    <div class="condition-notes">
                                        <strong>Analysis:</strong> <span id="${corner}-back-analysis">Back corners often show more wear</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Advanced Analysis Section -->
                <div class="side-section" style="background: rgba(255,215,0,0.1); border-color: #FFD700;">
                    <div class="side-label">
                        <i class="fas fa-chart-line"></i> DETAILED CORNER ANALYSIS
                    </div>
                    <div style="color: var(--text-primary); line-height: 1.8;">
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px;">
                            <div>
                                <h4 style="color: #FFD700; margin-bottom: 10px;">Front Card Analysis</h4>
                                <div id="frontCornerAnalysis">
                                    <div style="margin-bottom: 8px;">
                                        <span style="color: var(--text-muted);">Average Score:</span> 
                                        <strong style="color: var(--primary);" id="frontAvgScore">93</strong>
                                    </div>
                                    <div style="margin-bottom: 8px;">
                                        <span style="color: var(--text-muted);">Weakest Corner:</span> 
                                        <strong style="color: #FFA500;" id="frontWeakest">Bottom Right (91)</strong>
                                    </div>
                                    <div style="margin-bottom: 8px;">
                                        <span style="color: var(--text-muted);">Issues Found:</span> 
                                        <strong style="color: #ff6b6b;" id="frontIssues">Minor whitening</strong>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 style="color: #FFD700; margin-bottom: 10px;">Back Card Analysis</h4>
                                <div id="backCornerAnalysis">
                                    <div style="margin-bottom: 8px;">
                                        <span style="color: var(--text-muted);">Average Score:</span> 
                                        <strong style="color: var(--primary);" id="backAvgScore">90</strong>
                                    </div>
                                    <div style="margin-bottom: 8px;">
                                        <span style="color: var(--text-muted);">Weakest Corner:</span> 
                                        <strong style="color: #FFA500;" id="backWeakest">All Corners (90)</strong>
                                    </div>
                                    <div style="margin-bottom: 8px;">
                                        <span style="color: var(--text-muted);">Issues Found:</span> 
                                        <strong style="color: #ff6b6b;" id="backIssues">Slight wear</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div style="background: rgba(78, 205, 196, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                            <h4 style="color: var(--primary); margin-bottom: 10px;">ðŸ“Š Grade Impact Assessment</h4>
                            <div id="gradeImpactAnalysis">
                                <p><strong>Current Grade:</strong> ${this.selectedCard.grade || 'Ungraded'}</p>
                                <p><strong>Corner Condition:</strong> <span id="cornerConditionLevel">Near Mint to Mint</span></p>
                                <p><strong>Maximum Possible Grade:</strong> <span id="maxPossibleGrade">PSA 9-10 / BGS 9.5</span></p>
                                <p><strong>Recommendation:</strong> <span id="cornerRecommendation">Corners are in excellent condition for high-grade submission</span></p>
                            </div>
                        </div>
                        
                        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
                            <h4 style="color: #FFD700; margin-bottom: 10px;">ðŸ” Professional Tips</h4>
                            <ul style="margin-left: 20px;">
                                <li>Use the magnifier (hover) for detailed inspection at ${this.cornerMagnification}x zoom</li>
                                <li>Click any corner for full-screen examination</li>
                                <li>Enable Grid overlay to check for consistent angles</li>
                                <li>Use Measure tool to quantify whitening width</li>
                                <li>Switch to "Whitening" enhancement to highlight edge wear</li>
                                <li>Compare all corners for consistency - variation may indicate trimming</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 20px; display: flex; gap: 10px;">
                    <button onclick="window.cardMarketplace.exportCornerAnalysis()" 
                            style="flex: 1; padding: 12px; background: var(--success); 
                                   color: white; border: none; border-radius: 8px; 
                                   cursor: pointer; font-weight: bold;">
                        ðŸ“Š Export Corner Report
                    </button>
                    <button onclick="window.cardMarketplace.compareToGradeStandards()" 
                            style="flex: 1; padding: 12px; background: var(--primary); 
                                   color: white; border: none; border-radius: 8px; 
                                   cursor: pointer; font-weight: bold;">
                        ðŸ“ Compare to Grade Standards
                    </button>
                </div>
            `;
            
            inspector.classList.add('active');
            this.initializeCornerAnalysis();
        }
    }
    
    initializeCornerAnalysis() {
        // Initialize corner scoring system
        this.cornerScores = {
            'tl-front': 95,
            'tr-front': 94,
            'bl-front': 92,
            'br-front': 91,
            'tl-back': 90,
            'tr-back': 90,
            'bl-back': 90,
            'br-back': 90
        };
        
        this.updateCornerAnalysis();
    }
    
    updateCornerAnalysis() {
        // Calculate average scores
        const frontScores = ['tl-front', 'tr-front', 'bl-front', 'br-front']
            .map(id => this.cornerScores[id]);
        const backScores = ['tl-back', 'tr-back', 'bl-back', 'br-back']
            .map(id => this.cornerScores[id]);
        
        const frontAvg = Math.round(frontScores.reduce((a, b) => a + b, 0) / frontScores.length);
        const backAvg = Math.round(backScores.reduce((a, b) => a + b, 0) / backScores.length);
        
        // Update display
        document.getElementById('frontAvgScore').textContent = frontAvg;
        document.getElementById('backAvgScore').textContent = backAvg;
        
        // Update overall score
        const overallAvg = Math.round((frontAvg + backAvg) / 2);
        document.getElementById('cornerOverallScore').textContent = overallAvg;
        document.getElementById('cornerOverallScore').className = 'analysis-value ' + this.getScoreClass(overallAvg);
        
        // Determine grade impact
        this.determineGradeImpact(overallAvg);
    }
    
    determineGradeImpact(score) {
        let condition, maxGrade, recommendation;
        
        if (score >= 95) {
            condition = 'Gem Mint';
            maxGrade = 'PSA 10 / BGS 10';
            recommendation = 'Perfect corners suitable for highest grades';
        } else if (score >= 90) {
            condition = 'Mint to Near Mint';
            maxGrade = 'PSA 9-10 / BGS 9.5';
            recommendation = 'Excellent corners for high-grade submission';
        } else if (score >= 85) {
            condition = 'Near Mint';
            maxGrade = 'PSA 8-9 / BGS 9';
            recommendation = 'Good corners, minor issues may limit top grades';
        } else if (score >= 80) {
            condition = 'Excellent to Near Mint';
            maxGrade = 'PSA 7-8 / BGS 8.5';
            recommendation = 'Visible corner wear will impact grade';
        } else {
            condition = 'Very Good to Excellent';
            maxGrade = 'PSA 6-7 / BGS 8 or lower';
            recommendation = 'Significant corner wear present';
        }
        
        document.getElementById('cornerConditionLevel').textContent = condition;
        document.getElementById('maxPossibleGrade').textContent = maxGrade;
        document.getElementById('cornerRecommendation').textContent = recommendation;
    }
    
    updateCornerEnhancement() {
        const mode = document.getElementById('cornerEnhancement').value;
        const images = document.querySelectorAll('.corner-image');
        
        images.forEach(img => {
            switch(mode) {
                case 'normal':
                    img.style.filter = '';
                    break;
                case 'enhanced':
                    img.style.filter = 'contrast(150%) brightness(110%) saturate(120%)';
                    break;
                case 'whitening':
                    img.style.filter = 'contrast(200%) brightness(90%) saturate(0%)';
                    break;
                case 'sharpness':
                    img.style.filter = 'contrast(180%) brightness(100%) drop-shadow(0 0 2px rgba(255,255,255,0.5))';
                    break;
                case 'damage':
                    img.style.filter = 'contrast(250%) brightness(80%) saturate(50%)';
                    break;
            }
        });
    }
    
    updateCornerMagnification() {
        const value = document.getElementById('cornerMagnification').value;
        this.cornerMagnification = parseInt(value);
        document.getElementById('magLevel').textContent = value + 'x';
        
        // Update magnifier size
        document.querySelectorAll('.magnifier-image').forEach(img => {
            img.style.width = (value * 300) + '%';
            img.style.height = (value * 300) + '%';
        });
    }
    
    toggleCornerGrid() {
        this.showGrid = !this.showGrid;
        document.querySelectorAll('.corner-overlay').forEach(overlay => {
            if (this.showGrid) {
                overlay.classList.add('active');
                // Add grid lines
                const grid = overlay.querySelector('.corner-gridlines');
                if (grid && !grid.hasChildNodes()) {
                    for (let i = 1; i < 4; i++) {
                        const hLine = document.createElement('div');
                        hLine.className = 'gridline horizontal';
                        hLine.style.top = (i * 25) + '%';
                        grid.appendChild(hLine);
                        
                        const vLine = document.createElement('div');
                        vLine.className = 'gridline vertical';
                        vLine.style.left = (i * 25) + '%';
                        grid.appendChild(vLine);
                    }
                }
            } else {
                overlay.classList.remove('active');
            }
        });
    }
    
    toggleCornerMeasure() {
        this.showMeasure = !this.showMeasure;
        if (this.showMeasure) {
            this.showNotification('Click and drag on any corner to measure distances');
        }
    }
    
    markCornerDefects() {
        this.markingMode = true;
        this.showNotification('Click on corners to mark defects');
    }
    
    handleCornerMagnify(event, cornerId) {
        const container = event.currentTarget;
        const magnifier = document.getElementById(`${cornerId}-mag`);
        const magnifierImg = document.getElementById(`${cornerId}-mag-img`);
        const sourceImg = document.getElementById(`${cornerId}-img`);
        
        if (magnifier && magnifierImg && sourceImg) {
            magnifier.style.display = 'block';
            
            const rect = container.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            // Position magnifier at cursor
            magnifier.style.left = (x - 100) + 'px';
            magnifier.style.top = (y - 100) + 'px';
            
            // Calculate mouse position as percentage of container
            const percentX = (x / rect.width) * 100;
            const percentY = (y / rect.height) * 100;
            
            // Set magnifier image size
            const mag = this.cornerMagnification || 4;
            magnifierImg.style.width = (mag * 100) + '%';
            magnifierImg.style.height = (mag * 100) + '%';
            
            // Position the magnified image to show correct area
            // Since we're showing a corner (25% of full image), adjust accordingly
            let imgLeft, imgTop;
            
            if (cornerId.includes('tl')) {
                // Top-left corner
                imgLeft = -(percentX * mag);
                imgTop = -(percentY * mag);
            } else if (cornerId.includes('tr')) {
                // Top-right corner - offset from right side
                imgLeft = -((100 - percentX) * mag) - 300;
                imgTop = -(percentY * mag);
            } else if (cornerId.includes('bl')) {
                // Bottom-left corner - offset from bottom
                imgLeft = -(percentX * mag);
                imgTop = -((100 - percentY) * mag) - 300;
            } else if (cornerId.includes('br')) {
                // Bottom-right corner - offset from bottom-right
                imgLeft = -((100 - percentX) * mag) - 300;
                imgTop = -((100 - percentY) * mag) - 300;
            }
            
            magnifierImg.style.left = imgLeft + '%';
            magnifierImg.style.top = imgTop + '%';
            
            // Apply same filters as source
            if (sourceImg.style.filter) {
                magnifierImg.style.filter = sourceImg.style.filter;
            }
            
            // Show measurement if enabled
            if (this.showMeasure) {
                const measure = document.getElementById(`${cornerId}-measure`);
                if (measure) {
                    measure.style.display = 'block';
                    measure.style.left = x + 'px';
                    measure.style.top = (y - 30) + 'px';
                    measure.textContent = `${Math.round(percentX)}%, ${Math.round(percentY)}%`;
                }
            }
            
            // Mark defects if in marking mode
            if (this.markingMode && event.type === 'click') {
                this.addCornerDefect(cornerId, percentX, percentY);
            }
        }
    }
    
    hideCornerMagnify(cornerId) {
        const magnifier = document.getElementById(`${cornerId}-mag`);
        const measure = document.getElementById(`${cornerId}-measure`);
        if (magnifier) magnifier.style.display = 'none';
        if (measure) measure.style.display = 'none';
    }
    
    addCornerDefect(cornerId, x, y) {
        const container = document.getElementById(`${cornerId}-container`);
        if (!container) return;
        
        const marker = document.createElement('div');
        marker.className = 'corner-defect-marker';
        marker.style.left = x + '%';
        marker.style.top = y + '%';
        marker.innerHTML = `
            <div class="corner-defect-label">
                Defect #${this.cornerDefects.length + 1}
            </div>
        `;
        
        container.appendChild(marker);
        
        this.cornerDefects.push({
            corner: cornerId,
            x: x,
            y: y,
            type: 'whitening'
        });
        
        // Update corner score
        const currentScore = this.cornerScores[cornerId];
        this.cornerScores[cornerId] = Math.max(0, currentScore - 2);
        document.getElementById(`${cornerId}-score`).textContent = this.cornerScores[cornerId];
        
        this.updateCornerAnalysis();
    }
    
    autoAnalyzeCorners() {
        this.showNotification('Analyzing all corners...');
        
        // Simulate analysis for each corner
        const corners = ['tl-front', 'tr-front', 'bl-front', 'br-front', 'tl-back', 'tr-back', 'bl-back', 'br-back'];
        
        corners.forEach((corner, index) => {
            setTimeout(() => {
                // Random score between 85-98
                const score = 85 + Math.floor(Math.random() * 13);
                this.cornerScores[corner] = score;
                
                // Update display
                const scoreElement = document.getElementById(`${corner}-score`);
                if (scoreElement) {
                    scoreElement.textContent = score;
                    scoreElement.className = 'corner-score ' + this.getScoreClass(score);
                }
                
                // Update analysis text
                const analysisElement = document.getElementById(`${corner}-analysis`);
                if (analysisElement) {
                    let analysis = '';
                    if (score >= 95) analysis = 'Perfect corner, no visible wear';
                    else if (score >= 90) analysis = 'Minimal wear, slight softness';
                    else if (score >= 85) analysis = 'Light whitening visible';
                    else analysis = 'Moderate wear detected';
                    
                    analysisElement.textContent = analysis;
                }
                
                if (index === corners.length - 1) {
                    this.updateCornerAnalysis();
                    this.showNotification('Analysis complete!');
                }
            }, 200 * index);
        });
    }
    
    analyzeCardSide(side) {
        const corners = side === 'front' ? 
            ['tl-front', 'tr-front', 'bl-front', 'br-front'] :
            ['tl-back', 'tr-back', 'bl-back', 'br-back'];
        
        this.showNotification(`Analyzing ${side} corners...`);
        
        corners.forEach((corner, index) => {
            setTimeout(() => {
                const score = 85 + Math.floor(Math.random() * 13);
                this.cornerScores[corner] = score;
                document.getElementById(`${corner}-score`).textContent = score;
                
                if (index === corners.length - 1) {
                    this.updateCornerAnalysis();
                }
            }, 200 * index);
        });
    }
    
    changeCornerView() {
        const mode = document.getElementById('cornerViewMode').value;
        this.cornerViewMode = mode;
        
        // Re-render based on view mode
        if (mode === 'comparison') {
            this.showCornerComparison();
        } else if (mode === 'focus') {
            this.showNotification('Click on any corner to focus');
        } else if (mode === 'overlay') {
            this.showCornerOverlay();
        }
    }
    
    showCornerComparison() {
        // Side-by-side comparison view
        this.showNotification('Comparison mode activated');
    }
    
    showCornerOverlay() {
        // Overlay analysis visualization
        this.showNotification('Overlay analysis activated');
    }
    
    exportCornerAnalysis() {
        const analysis = {
            card: this.selectedCard.cardName,
            date: new Date().toISOString(),
            corners: this.cornerScores,
            defects: this.cornerDefects,
            averageScore: Math.round(Object.values(this.cornerScores).reduce((a, b) => a + b, 0) / Object.keys(this.cornerScores).length),
            enhancement: document.getElementById('cornerEnhancement').value,
            magnification: this.cornerMagnification,
            assessment: {
                frontAverage: document.getElementById('frontAvgScore').textContent,
                backAverage: document.getElementById('backAvgScore').textContent,
                condition: document.getElementById('cornerConditionLevel').textContent,
                maxGrade: document.getElementById('maxPossibleGrade').textContent,
                recommendation: document.getElementById('cornerRecommendation').textContent
            }
        };
        
        // Create downloadable JSON
        const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `corner-analysis-${this.selectedCard.cardName}-${Date.now()}.json`;
        a.click();
        
        this.showNotification('Corner analysis exported successfully!');
    }
    
    compareToGradeStandards() {
        const modal = document.createElement('div');
        modal.className = 'card-modal active';
        modal.style.zIndex = '20000';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px; margin: 20px auto;">
                <div class="modal-header">
                    <h2 style="margin: 0; color: black; font-family: 'Bebas Neue', sans-serif; 
                               font-size: 1.8rem; letter-spacing: 2px;">GRADING STANDARDS COMPARISON</h2>
                    <button class="modal-close" onclick="this.closest('.card-modal').remove()">Ã—</button>
                </div>
                <div class="modal-body" style="padding: 25px;">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                        <div style="background: linear-gradient(145deg, #2a2a2a, #1a1a1a); 
                                    border: 2px solid #FFD700; border-radius: 12px; padding: 15px;">
                            <h3 style="color: #FFD700; text-align: center; margin-bottom: 15px;">PSA Standards</h3>
                            <div style="color: var(--text-primary); font-size: 0.9rem;">
                                <p><strong>10:</strong> Perfect corners, no visible wear</p>
                                <p><strong>9:</strong> One corner with slight touch of wear</p>
                                <p><strong>8:</strong> Two-three corners with slight wear</p>
                                <p><strong>7:</strong> Slight rounding on corners</p>
                                <p><strong>6:</strong> Visible corner wear</p>
                            </div>
                        </div>
                        
                        <div style="background: linear-gradient(145deg, #2a2a2a, #1a1a1a); 
                                    border: 2px solid #4ecdc4; border-radius: 12px; padding: 15px;">
                            <h3 style="color: #4ecdc4; text-align: center; margin-bottom: 15px;">BGS Standards</h3>
                            <div style="color: var(--text-primary); font-size: 0.9rem;">
                                <p><strong>10:</strong> Pristine corners, zero wear</p>
                                <p><strong>9.5:</strong> Mint corners, minimal wear</p>
                                <p><strong>9:</strong> Near mint corners</p>
                                <p><strong>8.5:</strong> Light corner wear</p>
                                <p><strong>8:</strong> Moderate corner wear</p>
                            </div>
                        </div>
                        
                        <div style="background: linear-gradient(145deg, #2a2a2a, #1a1a1a); 
                                    border: 2px solid #ff6b6b; border-radius: 12px; padding: 15px;">
                            <h3 style="color: #ff6b6b; text-align: center; margin-bottom: 15px;">SGC Standards</h3>
                            <div style="color: var(--text-primary); font-size: 0.9rem;">
                                <p><strong>10:</strong> Gem mint corners</p>
                                <p><strong>9.5:</strong> Mint+ corners</p>
                                <p><strong>9:</strong> Mint corners</p>
                                <p><strong>8.5:</strong> Near mint/mint</p>
                                <p><strong>8:</strong> Near mint corners</p>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 20px; background: rgba(78, 205, 196, 0.1); 
                                border-radius: 12px; text-align: center;">
                        <h4 style="color: var(--primary); margin-bottom: 10px;">Your Card's Corner Assessment</h4>
                        <div style="font-size: 1.5rem; font-weight: bold; color: white;">
                            Score: ${document.getElementById('cornerOverallScore').textContent} / 100
                        </div>
                        <div style="margin-top: 10px; color: var(--text-primary);">
                            ${document.getElementById('cornerRecommendation').textContent}
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    renderCenteringTool() {
        return `
            <div class="centering-tool" id="centeringTool">
                <div class="centering-content">
                    <div class="centering-header">
                        <h2 class="inspector-title">CENTERING MEASUREMENT TOOL</h2>
                        <button class="inspector-close" onclick="window.cardMarketplace.closeCenteringTool()">Ã—</button>
                    </div>
                        <div class="centering-image-container" id="centeringImageContainer">
                            <!-- Image will be dynamically inserted -->
                        </div>
                        <div class="centering-results">
                            <div id="centeringScore" class="centering-score centering-perfect">
                                50/50
                            </div>
                            <div class="detail-section">
                                <div class="detail-title">Horizontal Centering</div>
                                <div id="horizontalResult" style="font-size: 1.5rem; color: var(--primary);">
                                    Left: 50% | Right: 50%
                                </div>
                            </div>
                            <div class="detail-section">
                                <div class="detail-title">Vertical Centering</div>
                                <div id="verticalResult" style="font-size: 1.5rem; color: var(--primary);">
                                    Top: 50% | Bottom: 50%
                                </div>
                            </div>
                            <div class="detail-section">
                                <div class="detail-title">Grade Impact</div>
                                <div id="gradeImpact" style="color: var(--text-primary);">
                                    <p><strong style="color: #00ff00;">Perfect Centering!</strong></p>
                                    <ul style="margin-left: 20px;">
                                        <li>PSA 10 / BGS 10: âœ… Qualifies (50/50 or better)</li>
                                        <li>SGC 10: âœ… Qualifies (55/45 or better)</li>
                                        <li>PSA 9: âœ… Qualifies (60/40 or better)</li>
                                        <li>Overall Impact: No deduction</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="detail-section" style="background: rgba(78, 205, 196, 0.1); padding: 15px; border-radius: 8px;">
                                <p><strong>ðŸ’¡ How to Use:</strong></p>
                                <p style="margin-top: 10px;">Drag the red lines to match the borders of your card. The tool will automatically calculate the centering percentages and show you how it affects potential grades.</p>
                                <p style="margin-top: 10px;">For slabbed cards, align with the actual card edges, not the slab.</p>
                                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                                    <strong>Keyboard Shortcuts:</strong>
                                    <ul style="margin: 10px 0 0 20px; font-size: 0.85rem;">
                                        <li>Arrow Keys: Fine adjust lines (Hold Shift for larger steps)</li>
                                        <li>Ctrl + Arrow: Move opposite border</li>
                                        <li>Ctrl + C: Snap to perfect center (50/50)</li>
                                        <li>Ctrl + A: Auto-detect borders</li>
                                    </ul>
                                </div>
                                <div style="margin-top: 15px;">
                                    <strong>Visual Indicators:</strong>
                                    <ul style="margin: 10px 0 0 20px; font-size: 0.85rem;">
                                        <li>Blue overlay shows the detected card area</li>
                                        <li>Crosshair marks the exact center</li>
                                        <li>Percentages update in real-time</li>
                                        <li>Grade impact shows immediately</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderSurfaceInspector() {
        return `
            <div class="surface-inspector" id="surfaceInspector">
                <div class="surface-content">
                    <div class="surface-header">
                        <h2 class="inspector-title">ADVANCED SURFACE ANALYSIS INSPECTOR</h2>
                        <button class="inspector-close" onclick="window.cardMarketplace.closeSurfaceInspector()">Ã—</button>
                    </div>
                    <div class="surface-workspace">
                        <div class="surface-controls">
                            <div class="surface-control-group">
                                <div class="surface-label">Contrast</div>
                                <input type="range" class="surface-slider" id="contrastSlider" 
                                       min="50" max="300" value="100" 
                                       oninput="window.cardMarketplace.updateSurfaceFilters()">
                                <div class="surface-value" id="contrastValue">100%</div>
                            </div>
                            <div class="surface-control-group">
                                <div class="surface-label">Brightness</div>
                                <input type="range" class="surface-slider" id="brightnessSlider" 
                                       min="30" max="200" value="100" 
                                       oninput="window.cardMarketplace.updateSurfaceFilters()">
                                <div class="surface-value" id="brightnessValue">100%</div>
                            </div>
                            <div class="surface-control-group">
                                <div class="surface-label">Saturation</div>
                                <input type="range" class="surface-slider" id="saturationSlider" 
                                       min="0" max="200" value="100" 
                                       oninput="window.cardMarketplace.updateSurfaceFilters()">
                                <div class="surface-value" id="saturationValue">100%</div>
                            </div>
                            <div class="surface-control-group">
                                <div class="surface-label">Sharpen</div>
                                <input type="range" class="surface-slider" id="sharpenSlider" 
                                       min="0" max="100" value="0" 
                                       oninput="window.cardMarketplace.updateSurfaceFilters()">
                                <div class="surface-value" id="sharpenValue">0%</div>
                            </div>
                            <div class="surface-control-group">
                                <div class="surface-label">Defect Detection</div>
                                <select id="defectMode" onchange="window.cardMarketplace.changeDefectMode()" 
                                        style="width: 100%; padding: 8px; background: var(--bg-primary); 
                                               border: 1px solid var(--border); border-radius: 6px; 
                                               color: var(--text-primary);">
                                    <option value="none">None</option>
                                    <option value="scratches">Scratches</option>
                                    <option value="print">Print Lines</option>
                                    <option value="stains">Stains/Spots</option>
                                    <option value="creases">Creases</option>
                                    <option value="edges">Edge Wear</option>
                                    <option value="foil">Foil Issues</option>
                                    <option value="auto">Auto-Detect All</option>
                                </select>
                            </div>
                            <div class="surface-control-group">
                                <div class="surface-label">View Mode</div>
                                <div style="display: flex; flex-direction: column; gap: 8px;">
                                    <button onclick="window.cardMarketplace.setSurfaceView('grid')" 
                                            style="padding: 8px; background: var(--primary); color: white; 
                                                   border: none; border-radius: 6px; cursor: pointer;">
                                        Grid View
                                    </button>
                                    <button onclick="window.cardMarketplace.setSurfaceView('split')" 
                                            style="padding: 8px; background: var(--warning); color: white; 
                                                   border: none; border-radius: 6px; cursor: pointer;">
                                        Split Compare
                                    </button>
                                    <button onclick="window.cardMarketplace.setSurfaceView('magnify')" 
                                            style="padding: 8px; background: var(--info); color: white; 
                                                   border: none; border-radius: 6px; cursor: pointer;">
                                        Magnifier Mode
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="surface-analysis-panel">
                            <div class="surface-score-grid">
                                <div class="surface-score-item">
                                    <div class="surface-score-label">Overall Surface</div>
                                    <div class="surface-score-value score-excellent" id="overallScore">95%</div>
                                </div>
                                <div class="surface-score-item">
                                    <div class="surface-score-label">Scratches</div>
                                    <div class="surface-score-value score-good" id="scratchScore">None</div>
                                </div>
                                <div class="surface-score-item">
                                    <div class="surface-score-label">Print Quality</div>
                                    <div class="surface-score-value score-excellent" id="printScore">Sharp</div>
                                </div>
                                <div class="surface-score-item">
                                    <div class="surface-score-label">Gloss Level</div>
                                    <div class="surface-score-value score-good" id="glossScore">High</div>
                                </div>
                                <div class="surface-score-item">
                                    <div class="surface-score-label">Defects Found</div>
                                    <div class="surface-score-value score-excellent" id="defectCount">0</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="surface-images-grid" id="surfaceImagesGrid">
                            <!-- Images will be dynamically inserted -->
                        </div>
                        
                        <div class="surface-magnifier-box" id="surfaceMagnifier">
                            <img class="surface-magnifier-img" id="surfaceMagnifierImg">
                        </div>
                        
                        <div style="margin-top: 20px; padding: 20px; background: rgba(255,215,0,0.1); 
                                    border-radius: 12px; border: 1px solid #FFD700;">
                            <h3 style="color: #FFD700; margin-bottom: 15px;">Advanced Detection Guide:</h3>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
                                        gap: 15px; color: var(--text-primary);">
                                <div>
                                    <strong style="color: var(--danger);">ðŸ” Scratches:</strong>
                                    <p style="margin-top: 5px;">Set Contrast to 150-200%, Brightness to 120%</p>
                                </div>
                                <div>
                                    <strong style="color: var(--warning);">ðŸ“ Print Lines:</strong>
                                    <p style="margin-top: 5px;">Sharpen to 50%, Contrast to 180%</p>
                                </div>
                                <div>
                                    <strong style="color: var(--info);">ðŸ’§ Stains/Spots:</strong>
                                    <p style="margin-top: 5px;">Saturation to 150%, Brightness to 80%</p>
                                </div>
                                <div>
                                    <strong style="color: var(--success);">ðŸ“ Creases:</strong>
                                    <p style="margin-top: 5px;">Contrast to 200%, Sharpen to 75%</p>
                                </div>
                                <div>
                                    <strong style="color: var(--primary);">âœ¨ Foil Damage:</strong>
                                    <p style="margin-top: 5px;">Brightness to 150%, Saturation to 0%</p>
                                </div>
                                <div>
                                    <strong style="color: #9b59b6;">ðŸŽ¯ Edge Wear:</strong>
                                    <p style="margin-top: 5px;">Contrast to 250%, Focus on borders</p>
                                </div>
                            </div>
                            
                            <div style="margin-top: 20px; padding: 15px; background: rgba(78, 205, 196, 0.1); 
                                        border-radius: 8px;">
                                <h4 style="color: var(--primary); margin-bottom: 10px;">ðŸ’¡ Pro Tips:</h4>
                                <ul style="margin-left: 20px; color: var(--text-primary);">
                                    <li>Use Split Compare to see filtered vs original side-by-side</li>
                                    <li>Magnifier Mode: Hold SHIFT and move mouse to inspect details</li>
                                    <li>Auto-Detect scans for all common defects automatically</li>
                                    <li>Mark defects by clicking on the image in any mode</li>
                                    <li>Export analysis report for grading submission</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div style="margin-top: 20px; display: flex; gap: 10px;">
                            <button onclick="window.cardMarketplace.autoAnalyzeSurface()" 
                                    style="flex: 1; padding: 12px; background: linear-gradient(135deg, #4ecdc4, #44a8a0); 
                                           color: white; border: none; border-radius: 8px; cursor: pointer; 
                                           font-weight: bold;">
                                ðŸ¤– Auto-Analyze Surface
                            </button>
                            <button onclick="window.cardMarketplace.resetSurfaceFilters()" 
                                    style="flex: 1; padding: 12px; background: var(--danger); 
                                           color: white; border: none; border-radius: 8px; cursor: pointer; 
                                           font-weight: bold;">
                                â†» Reset All Filters
                            </button>
                            <button onclick="window.cardMarketplace.exportSurfaceAnalysis()" 
                                    style="flex: 1; padding: 12px; background: var(--success); 
                                           color: white; border: none; border-radius: 8px; cursor: pointer; 
                                           font-weight: bold;">
                                ðŸ“Š Export Analysis
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    openCenteringTool() {
        if (!this.selectedCard) return;
        
        const tool = document.getElementById('centeringTool');
        const container = document.getElementById('centeringImageContainer');
        
        if (tool && container) {
            const frontImage = this.selectedCard.images?.[0];
            
            // Initialize centering mode
            this.centeringMode = 'edges'; // 'edges' or 'borders'
            this.cardEdges = { top: 10, bottom: 90, left: 10, right: 90 };
            this.cardBorders = { top: 25, bottom: 75, left: 25, right: 75 };
            
            container.innerHTML = `
    ${frontImage ? 
        `<img src="${frontImage}" class="centering-image" alt="Card for centering">
         
         <div class="centering-grid">
            <!-- Card Edge Lines (Blue) - Outer boundaries -->
            <div class="centering-line horizontal" id="topEdge" 
                 style="top: 10%; background: #00a8ff; height: 3px; box-shadow: 0 0 10px rgba(0,168,255,0.5);"
                 onmousedown="window.cardMarketplace.startDragging(event, 'topEdge', 'horizontal', true)">
                 <span style="position: absolute; left: 10px; top: -20px; background: #000; color: #00a8ff; padding: 2px 6px; border-radius: 3px; font-size: 0.7rem;">TOP EDGE</span>
            </div>
            <div class="centering-line horizontal" id="bottomEdge" 
                 style="top: 90%; background: #00a8ff; height: 3px; box-shadow: 0 0 10px rgba(0,168,255,0.5);"
                 onmousedown="window.cardMarketplace.startDragging(event, 'bottomEdge', 'horizontal', true)">
                 <span style="position: absolute; left: 10px; bottom: -20px; background: #000; color: #00a8ff; padding: 2px 6px; border-radius: 3px; font-size: 0.7rem;">BOTTOM EDGE</span>
            </div>
            <div class="centering-line vertical" id="leftEdge" 
                 style="left: 10%; background: #00a8ff; width: 3px; box-shadow: 0 0 10px rgba(0,168,255,0.5);"
                 onmousedown="window.cardMarketplace.startDragging(event, 'leftEdge', 'vertical', true)">
                 <span style="position: absolute; top: 10px; left: -60px; background: #000; color: #00a8ff; padding: 2px 6px; border-radius: 3px; font-size: 0.7rem; writing-mode: vertical-rl;">LEFT EDGE</span>
            </div>
            <div class="centering-line vertical" id="rightEdge" 
                 style="left: 90%; background: #00a8ff; width: 3px; box-shadow: 0 0 10px rgba(0,168,255,0.5);"
                 onmousedown="window.cardMarketplace.startDragging(event, 'rightEdge', 'vertical', true)">
                 <span style="position: absolute; top: 10px; right: -60px; background: #000; color: #00a8ff; padding: 2px 6px; border-radius: 3px; font-size: 0.7rem; writing-mode: vertical-rl;">RIGHT EDGE</span>
            </div>
            
            <!-- Design Border Lines (Green) - Inner image borders -->
            <div class="centering-line horizontal" id="topBorder" 
                 style="top: 25%; background: #00ff00; height: 2px; box-shadow: 0 0 10px rgba(0,255,0,0.5);"
                 onmousedown="window.cardMarketplace.startDragging(event, 'topBorder', 'horizontal', true)">
                 <span style="position: absolute; right: 10px; top: -20px; background: #000; color: #00ff00; padding: 2px 6px; border-radius: 3px; font-size: 0.7rem;">TOP FRAME</span>
            </div>
            <div class="centering-line horizontal" id="bottomBorder" 
                 style="top: 75%; background: #00ff00; height: 2px; box-shadow: 0 0 10px rgba(0,255,0,0.5);"
                 onmousedown="window.cardMarketplace.startDragging(event, 'bottomBorder', 'horizontal', true)">
                 <span style="position: absolute; right: 10px; bottom: -20px; background: #000; color: #00ff00; padding: 2px 6px; border-radius: 3px; font-size: 0.7rem;">BOTTOM FRAME</span>
            </div>
            <div class="centering-line vertical" id="leftBorder" 
                 style="left: 25%; background: #00ff00; width: 2px; box-shadow: 0 0 10px rgba(0,255,0,0.5);"
                 onmousedown="window.cardMarketplace.startDragging(event, 'leftBorder', 'vertical', true)">
                 <span style="position: absolute; bottom: 10px; left: -65px; background: #000; color: #00ff00; padding: 2px 6px; border-radius: 3px; font-size: 0.7rem; writing-mode: vertical-rl;">LEFT FRAME</span>
            </div>
            <div class="centering-line vertical" id="rightBorder" 
                 style="left: 75%; background: #00ff00; width: 2px; box-shadow: 0 0 10px rgba(0,255,0,0.5);"
                 onmousedown="window.cardMarketplace.startDragging(event, 'rightBorder', 'vertical', true)">
                 <span style="position: absolute; bottom: 10px; right: -65px; background: #000; color: #00ff00; padding: 2px 6px; border-radius: 3px; font-size: 0.7rem; writing-mode: vertical-rl;">RIGHT FRAME</span>
            </div>
            
            <div class="centering-crosshair"></div>
         </div>
         
         <!-- Instructions -->
         <div style="position: fixed; top: 80px; left: 20px; background: rgba(0,0,0,0.9); color: white; padding: 15px; border-radius: 8px; max-width: 250px;">
            <div style="color: #00a8ff; font-weight: bold; margin-bottom: 10px;">BLUE LINES: Card Edges</div>
            <div style="font-size: 0.8rem; margin-bottom: 10px;">Align with the outer boundaries of the physical card</div>
            <div style="color: #00ff00; font-weight: bold; margin-bottom: 10px;">GREEN LINES: Design Frame</div>
            <div style="font-size: 0.8rem;">Align with the image/design borders inside the card</div>
         </div>
         
         <!-- Measurements -->
         <div style="position: fixed; top: 80px; right: 20px; background: rgba(0,0,0,0.9); color: white; padding: 15px; border-radius: 8px; min-width: 200px; border: 1px solid #00a8ff;">
            <div id="measurementDisplay">
                <div style="color: #00a8ff; margin-bottom: 10px; font-weight: bold;">CARD DIMENSIONS</div>
                <div id="cardWidth">Width: Calculating...</div>
                <div id="cardHeight">Height: Calculating...</div>
            </div>
         </div>
         
         <!-- Live Centering Results -->
         <div style="position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.9); padding: 20px; border-radius: 12px; min-width: 300px;">
            <div style="text-align: center;">
                <div style="font-size: 2rem; font-weight: 900; color: #FFD700; margin-bottom: 10px;" id="centeringScore">--/--</div>
                <div style="display: flex; gap: 30px; justify-content: center;">
                    <div>
                        <div style="color: var(--text-muted); font-size: 0.75rem;">HORIZONTAL</div>
                        <div id="horizontalCentering" style="color: #00ff00; font-weight: bold;">-- | --</div>
                    </div>
                    <div>
                        <div style="color: var(--text-muted); font-size: 0.75rem;">VERTICAL</div>
                        <div id="verticalCentering" style="color: #00ff00; font-weight: bold;">-- | --</div>
                    </div>
                </div>
            </div>
         </div>
         
         <!-- Action Buttons -->
         <div style="position: fixed; bottom: 30px; right: 40px; display: flex; gap: 10px;">
            <button onclick="window.cardMarketplace.snapToCenter()" style="padding: 12px 24px; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
                Snap to 50/50
            </button>
            <button onclick="window.cardMarketplace.toggleBackImage()" style="padding: 12px 24px; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
                Check Back
            </button>
            <button onclick="window.cardMarketplace.calculateFinalCentering()" style="padding: 12px 24px; background: linear-gradient(135deg, #FFD700, #FFA500); color: black; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
                Calculate Results
            </button>
         </div>` :
        '<div style="padding: 100px; text-align: center; color: var(--text-muted);">No image available</div>'
    }
`;

tool.classList.add('active');

this.initKeyboardShortcuts();
        this.addMagnifyingGlass();
        this.highlightCenteringQuality();
        }
    }
    
    closeCenteringTool() {
        const tool = document.getElementById('centeringTool');
        if (tool) {
            tool.classList.remove('active');
        }
    }

    toggleCenteringMode() {
        console.log('Current mode:', this.centeringMode);
        
        if (this.centeringMode === 'edges') {
            // Switch to borders mode
            this.centeringMode = 'borders';
            
            // Keep edge lines visible but dimmed
            document.querySelectorAll('.edge-line').forEach(line => {
                line.style.opacity = '0.4';
                line.style.pointerEvents = 'none';
            });
            
            // Show border lines
            document.querySelectorAll('.border-line').forEach(line => {
                line.style.display = 'block';
            });
            
            // Update mode indicator
            const indicator = document.querySelector('.centering-mode-indicator');
            if (indicator) {
                indicator.innerHTML = `
                    <div style="font-size: 0.9rem; margin-bottom: 5px;">STEP 2 OF 2</div>
                    <div style="font-size: 1.1rem;">Set Design Borders</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 5px;">
                        Align green lines with image borders
                    </div>
                `;
            }
            
            // Show live results
            const liveResults = document.getElementById('liveResults');
            if (liveResults) {
                liveResults.style.display = 'block';
            }
            
            // Update button
            const btn = document.getElementById('nextStepBtn');
            if (btn) {
                btn.textContent = 'â† Back to Card Edges';
                btn.style.background = 'linear-gradient(135deg, #ff6b6b, #ff5252)';
            }
            
            // Calculate centering
            this.calculateAccurateCentering();
            
        } else {
            // Switch back to edges mode
            this.centeringMode = 'edges';
            
            // Show edge lines
            document.querySelectorAll('.edge-line').forEach(line => {
                line.style.opacity = '1';
                line.style.pointerEvents = 'all';
            });
            
            // Hide border lines
            document.querySelectorAll('.border-line').forEach(line => {
                line.style.display = 'none';
            });
            
            // Update mode indicator
            const indicator = document.querySelector('.centering-mode-indicator');
            if (indicator) {
                indicator.innerHTML = `
                    <div style="font-size: 0.9rem; margin-bottom: 5px;">STEP 1 OF 2</div>
                    <div style="font-size: 1.1rem;">Set Card Edges</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 5px;">
                        Align lines with the outer card boundaries
                    </div>
                `;
            }
            
            
            // Hide live results
            const liveResults = document.getElementById('liveResults');
            if (liveResults) {
                liveResults.style.display = 'none';
            }
            
            // Update button
            const btn = document.getElementById('nextStepBtn');
            if (btn) {
                btn.textContent = 'Next: Set Design Borders â†’';
                btn.style.background = 'linear-gradient(135deg, #4ecdc4, #44a8a0)';
            }
        }
    }
    
    startDragging(event, lineId, direction, isEdgeLine = false) {
    const line = document.getElementById(lineId);
    const container = document.getElementById('centeringImageContainer');
    
    if (!line || !container) return;
    
    // Add active class for visual feedback
    line.classList.add('active-drag');
    
    // Create helper text
    let helperText = document.getElementById('centeringHelper');
    if (!helperText) {
        helperText = document.createElement('div');
        helperText.id = 'centeringHelper';
        helperText.className = 'centering-helper-text';
        document.body.appendChild(helperText);
    }
    helperText.classList.add('active');
    
    const onMouseMove = (e) => {
        const rect = container.getBoundingClientRect();
        
        if (direction === 'horizontal') {
            const percentage = ((e.clientY - rect.top) / rect.height) * 100;
            const minLimit = isEdgeLine ? 0 : 5;
            const maxLimit = isEdgeLine ? 100 : 95;
            if (percentage >= minLimit && percentage <= maxLimit) {
                line.style.top = percentage + '%';
                
                // Update helper text with correct line names
                let lineType = '';
                if (lineId === 'topEdge') lineType = 'Top Edge';
                else if (lineId === 'bottomEdge') lineType = 'Bottom Edge';
                else if (lineId === 'topBorder') lineType = 'Top Border';
                else if (lineId === 'bottomBorder') lineType = 'Bottom Border';
                
                helperText.textContent = `${lineType}: ${percentage.toFixed(1)}%`;
                helperText.style.left = (e.clientX + 15) + 'px';
                helperText.style.top = (e.clientY - 30) + 'px';
            }
        } else {
            const percentage = ((e.clientX - rect.left) / rect.width) * 100;
            const minLimit = isEdgeLine ? 0 : 5;
            const maxLimit = isEdgeLine ? 100 : 95;
            if (percentage >= minLimit && percentage <= maxLimit) {
                line.style.left = percentage + '%';
                
                // Update helper text with correct line names
                let lineType = '';
                if (lineId === 'leftEdge') lineType = 'Left Edge';
                else if (lineId === 'rightEdge') lineType = 'Right Edge';
                else if (lineId === 'leftBorder') lineType = 'Left Border';
                else if (lineId === 'rightBorder') lineType = 'Right Border';
                
                helperText.textContent = `${lineType}: ${percentage.toFixed(1)}%`;
                helperText.style.left = (e.clientX + 15) + 'px';
                helperText.style.top = (e.clientY - 30) + 'px';
            }
        }
        
        // Always calculate centering while dragging
this.calculateFinalCentering();
    };
    
    const onMouseUp = () => {
        line.classList.remove('active-drag');
        helperText.classList.remove('active');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}
    
    calculateCentering() {
        const topLine = document.getElementById('topLine');
        const bottomLine = document.getElementById('bottomLine');
        const leftLine = document.getElementById('leftLine');
        const rightLine = document.getElementById('rightLine');
        
        if (!topLine || !bottomLine || !leftLine || !rightLine) return;
        
        const topPos = parseFloat(topLine.style.top);
        const bottomPos = parseFloat(bottomLine.style.top);
        const leftPos = parseFloat(leftLine.style.left);
        const rightPos = parseFloat(rightLine.style.left);
        
        // Calculate percentages
        const topBorder = topPos;
        const bottomBorder = 100 - bottomPos;
        const leftBorder = leftPos;
        const rightBorder = 100 - rightPos;
        
        // Calculate ratios
        const verticalTotal = topBorder + bottomBorder;
        const horizontalTotal = leftBorder + rightBorder;
        
        const topPercent = Math.round((topBorder / verticalTotal) * 100);
        const bottomPercent = Math.round((bottomBorder / verticalTotal) * 100);
        const leftPercent = Math.round((leftBorder / horizontalTotal) * 100);
        const rightPercent = Math.round((rightBorder / horizontalTotal) * 100);
        
        // Update display
        document.getElementById('topPercent').textContent = topPercent + '%';
        document.getElementById('bottomPercent').textContent = bottomPercent + '%';
        document.getElementById('leftPercent').textContent = leftPercent + '%';
        document.getElementById('rightPercent').textContent = rightPercent + '%';
        
        document.getElementById('horizontalResult').innerHTML = 
            `Left: ${leftPercent}% | Right: ${rightPercent}%`;
        document.getElementById('verticalResult').innerHTML = 
            `Top: ${topPercent}% | Bottom: ${bottomPercent}%`;
        
        // Calculate worst centering
        const worstCentering = Math.max(
            Math.abs(50 - topPercent),
            Math.abs(50 - bottomPercent),
            Math.abs(50 - leftPercent),
            Math.abs(50 - rightPercent)
        );
        
        // Update score and grade impact
        const score = document.getElementById('centeringScore');
        const impact = document.getElementById('gradeImpact');
        
        const worseRatio = 50 - worstCentering;
        const betterRatio = 50 + worstCentering;
        
        score.textContent = `${worseRatio}/${betterRatio}`;
        
        // Determine grade impact
        let gradeClass, gradeHTML;
        
        if (worstCentering <= 5) {
            gradeClass = 'centering-perfect';
            gradeHTML = `
                <p><strong style="color: #00ff00;">Excellent Centering!</strong></p>
                <ul style="margin-left: 20px;">
                    <li>PSA 10 / BGS 10: âœ… Qualifies (50/50 or better)</li>
                    <li>SGC 10: âœ… Qualifies (55/45 or better)</li>
                    <li>PSA 9: âœ… Qualifies (60/40 or better)</li>
                    <li>Overall Impact: No deduction</li>
                </ul>
            `;
        } else if (worstCentering <= 10) {
            gradeClass = 'centering-good';
            gradeHTML = `
                <p><strong style="color: #4ecdc4;">Good Centering</strong></p>
                <ul style="margin-left: 20px;">
                    <li>PSA 10 / BGS 10: âŒ Does not qualify</li>
                    <li>SGC 10: âœ… Qualifies (55/45 or better)</li>
                    <li>PSA 9: âœ… Qualifies (60/40 or better)</li>
                    <li>Overall Impact: Slight deduction possible</li>
                </ul>
            `;
        } else if (worstCentering <= 15) {
            gradeClass = 'centering-fair';
            gradeHTML = `
                <p><strong style="color: #ffd700;">Fair Centering</strong></p>
                <ul style="margin-left: 20px;">
                    <li>PSA 10 / BGS 10: âŒ Does not qualify</li>
                    <li>SGC 10: âŒ Does not qualify</li>
                    <li>PSA 9: âœ… Qualifies (60/40 or better)</li>
                    <li>Max Grade: PSA 9 / SGC 9.5</li>
                </ul>
            `;
        } else {
            gradeClass = 'centering-poor';
            gradeHTML = `
                <p><strong style="color: #ff6b6b;">Poor Centering</strong></p>
                <ul style="margin-left: 20px;">
                    <li>PSA 10 / BGS 10: âŒ Does not qualify</li>
                    <li>SGC 10: âŒ Does not qualify</li>
                    <li>PSA 9: âŒ Does not qualify</li>
                    <li>Max Grade: PSA 8 / SGC 8.5 or lower</li>
                    <li>Significant grade reduction</li>
                </ul>
            `;
        }
        
        score.className = 'centering-score ' + gradeClass;
        impact.innerHTML = gradeHTML;
        
        // Update visual guide
        this.updateVisualGuide();
    }
    
    updateVisualGuide() {
        const topLine = document.getElementById('topLine');
        const bottomLine = document.getElementById('bottomLine');
        const leftLine = document.getElementById('leftLine');
        const rightLine = document.getElementById('rightLine');
        const guide = document.getElementById('visualGuide');
        
        if (!topLine || !bottomLine || !leftLine || !rightLine || !guide) return;
        
        const topPos = parseFloat(topLine.style.top);
        const bottomPos = parseFloat(bottomLine.style.top);
        const leftPos = parseFloat(leftLine.style.left);
        const rightPos = parseFloat(rightLine.style.left);
        
        guide.style.top = topPos + '%';
        guide.style.left = leftPos + '%';
        guide.style.width = (rightPos - leftPos) + '%';
        guide.style.height = (bottomPos - topPos) + '%';
    }
    
    snapToCenter() {
        const lines = ['topLine', 'bottomLine', 'leftLine', 'rightLine'];
        const positions = [25, 75, 25, 75];
        
        lines.forEach((lineId, index) => {
            const line = document.getElementById(lineId);
            if (line) {
                line.classList.add('snapping');
                if (index < 2) {
                    line.style.top = positions[index] + '%';
                } else {
                    line.style.left = positions[index] + '%';
                }
                setTimeout(() => line.classList.remove('snapping'), 500);
            }
        });
        
        this.calculateCentering();
    }
    
    autoDetectBorders() {
        // Define common border detection patterns for trading cards
        const borderOptions = [
            {
                name: 'Outer Card Edge',
                description: 'The gray/white border (actual card edge)',
                positions: { top: 15, bottom: 85, left: 18, right: 82 },
                confidence: 'Manual'
            },
            {
                name: 'Design Border',
                description: 'The colored frame/design border',
                positions: { top: 19, bottom: 81, left: 22, right: 78 },
                confidence: 'Manual'
            },
            {
                name: 'Player Image Area',
                description: 'The photo/image boundary',
                positions: { top: 24, bottom: 76, left: 26, right: 74 },
                confidence: 'Manual'
            }
        ];
        
        // Create selection modal
        const modal = document.createElement('div');
        modal.id = 'borderSelectionModal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1a1a1a;
            border: 2px solid var(--primary);
            border-radius: 12px;
            padding: 20px;
            z-index: 10000;
            max-width: 500px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.9);
        `;
        
        modal.innerHTML = `
            <h3 style="color: var(--primary); margin-bottom: 15px;">Select Border Type</h3>
            <p style="color: var(--text-muted); margin-bottom: 20px; font-size: 0.9rem;">
                Multiple borders detected. Choose which one to measure:
            </p>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                ${borderOptions.map((option, index) => `
                    <div class="border-option" 
                         style="background: rgba(78, 205, 196, 0.1); border: 1px solid #444; 
                                border-radius: 8px; padding: 15px; cursor: pointer; transition: all 0.3s;"
                         onmouseover="this.style.borderColor='var(--primary)'; this.style.background='rgba(78, 205, 196, 0.2)'"
                         onmouseout="this.style.borderColor='#444'; this.style.background='rgba(78, 205, 196, 0.1)'"
                         onclick="window.cardMarketplace.applyBorderOption(${index})">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="color: white; font-weight: bold; margin-bottom: 5px;">
                                    ${option.name}
                                </div>
                                <div style="color: var(--text-muted); font-size: 0.85rem;">
                                    ${option.description}
                                </div>
                            </div>
                            <div style="text-align: center;">
                                <div style="color: ${option.confidence > 90 ? '#4ecdc4' : option.confidence > 80 ? '#FFD700' : '#FFA500'}; 
                                            font-size: 1.5rem; font-weight: bold;">
                                    ${option.confidence}%
                                </div>
                                <div style="color: var(--text-muted); font-size: 0.7rem;">
                                    Confidence
                                </div>
                            </div>
                        </div>
                        <button style="margin-top: 10px; padding: 5px 10px; background: var(--primary); 
                                       color: white; border: none; border-radius: 4px; font-size: 0.85rem;"
                                onclick="event.stopPropagation(); window.cardMarketplace.previewBorderOption(${index})">
                            Preview
                        </button>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <button onclick="window.cardMarketplace.closeBorderModal()" 
                        style="flex: 1; padding: 10px; background: #444; color: white; 
                               border: none; border-radius: 6px; cursor: pointer;">
                    Cancel
                </button>
                <button onclick="window.cardMarketplace.manualAdjustMode()" 
                        style="flex: 1; padding: 10px; background: var(--warning); color: white; 
                               border: none; border-radius: 6px; cursor: pointer;">
                    Manual Adjust
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Store options for use
        this.borderOptions = borderOptions;
    }
    
    applyBorderOption(index) {
        const option = this.borderOptions[index];
        if (!option) return;
        
        const lines = {
            topLine: option.positions.top,
            bottomLine: option.positions.bottom,
            leftLine: option.positions.left,
            rightLine: option.positions.right
        };
        
        Object.entries(lines).forEach(([lineId, position]) => {
            const line = document.getElementById(lineId);
            if (line) {
                line.classList.add('snapping');
                if (lineId.includes('top') || lineId.includes('bottom')) {
                    line.style.top = position + '%';
                } else {
                    line.style.left = position + '%';
                }
                setTimeout(() => line.classList.remove('snapping'), 500);
            }
        });
        
        this.calculateCentering();
        this.closeBorderModal();
        this.showNotification(`Applied: ${option.name}`);
    }
    
    previewBorderOption(index) {
        const option = this.borderOptions[index];
        if (!option) return;
        
        // Temporarily apply the border positions
        const originalPositions = {
            topLine: document.getElementById('topLine').style.top,
            bottomLine: document.getElementById('bottomLine').style.top,
            leftLine: document.getElementById('leftLine').style.left,
            rightLine: document.getElementById('rightLine').style.left
        };
        
        this.applyBorderOption(index);
        
        // Revert after 2 seconds
        setTimeout(() => {
            Object.entries(originalPositions).forEach(([lineId, position]) => {
                const line = document.getElementById(lineId);
                if (line) {
                    if (lineId.includes('top') || lineId.includes('bottom')) {
                        line.style.top = position;
                    } else {
                        line.style.left = position;
                    }
                }
            });
            this.calculateCentering();
        }, 2000);
        
        this.showNotification('Previewing for 2 seconds...');
    }
    
    closeBorderModal() {
        const modal = document.getElementById('borderSelectionModal');
        if (modal) {
            modal.remove();
        }
    }
    
    manualAdjustMode() {
        this.closeBorderModal();
        this.showNotification('Manual adjustment mode - drag the lines to position');
        
        // Highlight all lines
        ['topLine', 'bottomLine', 'leftLine', 'rightLine'].forEach(lineId => {
            const line = document.getElementById(lineId);
            if (line) {
                line.style.boxShadow = '0 0 15px rgba(78, 205, 196, 0.8)';
                setTimeout(() => {
                    line.style.boxShadow = '';
                }, 3000);
            }
        });
    }
    
    toggleBackImage() {
        const container = document.getElementById('centeringImageContainer');
        const img = container?.querySelector('.centering-image');
        
        if (!img || !this.selectedCard?.images) return;
        
        const currentSrc = img.src;
        const frontImage = this.selectedCard.images[0];
        const backImage = this.selectedCard.images[1];
        
        if (backImage && currentSrc === frontImage) {
            img.src = backImage;
            this.showNotification('Viewing back of card');
        } else if (frontImage) {
            img.src = frontImage;
            this.showNotification('Viewing front of card');
        }
    }
    
    nextCenteringStep() {
        if (this.centeringMode === 'edges') {
            // Switch to border mode
            this.centeringMode = 'borders';
            
            // Hide edge lines
            document.querySelectorAll('.edge-line').forEach(line => {
                line.style.opacity = '0.3';
                line.style.pointerEvents = 'none';
            });
            
            // Show border lines
            document.querySelectorAll('.border-line').forEach(line => {
                line.style.display = 'block';
            });
            
            // Update mode indicator
            const indicator = document.querySelector('.centering-mode-indicator');
            if (indicator) {
                indicator.innerHTML = `
                    <div style="font-size: 0.9rem; margin-bottom: 5px;">STEP 2 OF 2</div>
                    <div style="font-size: 1.1rem;">Set Design Borders</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 5px;">
                        Align with the image/design boundaries
                    </div>
                `;
            }
            
            // Show live results
            document.getElementById('liveResults').style.display = 'block';
            
            // Change button
            const btn = document.getElementById('nextStepBtn');
            if (btn) {
                btn.textContent = 'â† Back to Edges';
                btn.onclick = () => this.prevCenteringStep();
                btn.style.background = 'linear-gradient(135deg, #ff6b6b, #ff5252)';
            }
            
            // Calculate initial centering
            this.calculateAccurateCentering();
        }
    }
    
    prevCenteringStep() {
        this.centeringMode = 'edges';
        
        // Show edge lines
        document.querySelectorAll('.edge-line').forEach(line => {
            line.style.opacity = '1';
            line.style.pointerEvents = 'all';
        });
        
        // Hide border lines
        document.querySelectorAll('.border-line').forEach(line => {
            line.style.display = 'none';
        });
        
        // Update mode indicator
        const indicator = document.querySelector('.centering-mode-indicator');
        if (indicator) {
            indicator.innerHTML = `
                <div style="font-size: 0.9rem; margin-bottom: 5px;">STEP 1 OF 2</div>
                <div style="font-size: 1.1rem;">Set Card Edges</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 5px;">
                    Align lines with the outer card boundaries
                </div>
            `;
        }
        
        // Hide live results
        document.getElementById('liveResults').style.display = 'none';
        
        // Change button back
        const btn = document.getElementById('nextStepBtn');
        if (btn) {
            btn.textContent = 'Next: Set Design Borders â†’';
            btn.onclick = () => this.nextCenteringStep();
            btn.style.background = 'linear-gradient(135deg, #4ecdc4, #44a8a0)';
        }
    }
    
    calculateAccurateCentering() {
        // Get positions of all lines
        const topEdge = parseFloat(document.getElementById('topEdge').style.top);
        const bottomEdge = parseFloat(document.getElementById('bottomEdge').style.top);
        const leftEdge = parseFloat(document.getElementById('leftEdge').style.left);
        const rightEdge = parseFloat(document.getElementById('rightEdge').style.left);
        
        const topBorder = parseFloat(document.getElementById('topBorder').style.top);
        const bottomBorder = parseFloat(document.getElementById('bottomBorder').style.top);
        const leftBorder = parseFloat(document.getElementById('leftBorder').style.left);
        const rightBorder = parseFloat(document.getElementById('rightBorder').style.left);
        
        // Calculate actual distances
        const topMargin = topBorder - topEdge;
        const bottomMargin = bottomEdge - bottomBorder;
        const leftMargin = leftBorder - leftEdge;
        const rightMargin = rightEdge - rightBorder;
        
        // Calculate percentages
        const verticalTotal = topMargin + bottomMargin;
        const horizontalTotal = leftMargin + rightMargin;
        
        const topPercent = Math.round((topMargin / verticalTotal) * 100);
        const bottomPercent = Math.round((bottomMargin / verticalTotal) * 100);
        const leftPercent = Math.round((leftMargin / horizontalTotal) * 100);
        const rightPercent = Math.round((rightMargin / horizontalTotal) * 100);
        
        // Update display
        const worstCentering = Math.max(
            Math.abs(50 - topPercent),
            Math.abs(50 - bottomPercent),
            Math.abs(50 - leftPercent),
            Math.abs(50 - rightPercent)
        );
        
        const worseRatio = 50 - worstCentering;
        const betterRatio = 50 + worstCentering;
        
        document.getElementById('liveCenteringScore').textContent = `${worseRatio}/${betterRatio}`;
        document.getElementById('liveHorizontal').textContent = `${leftPercent}% | ${rightPercent}%`;
        document.getElementById('liveVertical').textContent = `${topPercent}% | ${bottomPercent}%`;
        
        // Color code based on quality
        const scoreElement = document.getElementById('liveCenteringScore');
        if (worstCentering <= 5) {
            scoreElement.style.color = '#00ff00';
        } else if (worstCentering <= 10) {
            scoreElement.style.color = '#4ecdc4';
        } else if (worstCentering <= 15) {
            scoreElement.style.color = '#FFD700';
        } else {
            scoreElement.style.color = '#ff6b6b';
        }
        
        // Update main results panel
        this.updateCenteringResults(topPercent, bottomPercent, leftPercent, rightPercent, worstCentering);
        
        // Calculate actual card dimensions
        if (this.centeringMode === 'borders') {
            this.calculateCardDimensions();
        }
    }

    calculateFinalCentering() {
    // Get all line positions
    const topEdge = parseFloat(document.getElementById('topEdge').style.top);
    const bottomEdge = parseFloat(document.getElementById('bottomEdge').style.top);
    const leftEdge = parseFloat(document.getElementById('leftEdge').style.left);
    const rightEdge = parseFloat(document.getElementById('rightEdge').style.left);
    
    const topBorder = parseFloat(document.getElementById('topBorder').style.top);
    const bottomBorder = parseFloat(document.getElementById('bottomBorder').style.top);
    const leftBorder = parseFloat(document.getElementById('leftBorder').style.left);
    const rightBorder = parseFloat(document.getElementById('rightBorder').style.left);
    
    // Calculate centering
    const topMargin = topBorder - topEdge;
    const bottomMargin = bottomEdge - bottomBorder;
    const leftMargin = leftBorder - leftEdge;
    const rightMargin = rightEdge - rightBorder;
    
    const verticalTotal = topMargin + bottomMargin;
    const horizontalTotal = leftMargin + rightMargin;
    
    const topPercent = Math.round((topMargin / verticalTotal) * 100);
    const bottomPercent = Math.round((bottomMargin / verticalTotal) * 100);
    const leftPercent = Math.round((leftMargin / horizontalTotal) * 100);
    const rightPercent = Math.round((rightMargin / horizontalTotal) * 100);
    
    // Update display - both floating score and side panel
    const worstCentering = Math.max(
        Math.abs(50 - topPercent),
        Math.abs(50 - bottomPercent),
        Math.abs(50 - leftPercent),
        Math.abs(50 - rightPercent)
    );
    
    const worseRatio = 50 - worstCentering;
    const betterRatio = 50 + worstCentering;
    
    // Update all displays
    document.getElementById('centeringScore').textContent = `${worseRatio}/${betterRatio}`;
    document.getElementById('horizontalCentering').textContent = `${leftPercent}% | ${rightPercent}%`;
    document.getElementById('verticalCentering').textContent = `${topPercent}% | ${bottomPercent}%`;
    
    // Update horizontal and vertical results in side panel
    const horizontalResult = document.getElementById('horizontalResult');
    if (horizontalResult) {
        horizontalResult.innerHTML = `Left: ${leftPercent}% | Right: ${rightPercent}%`;
    }
    
    const verticalResult = document.getElementById('verticalResult');
    if (verticalResult) {
        verticalResult.innerHTML = `Top: ${topPercent}% | Bottom: ${bottomPercent}%`;
    }
    
    // Update grade impact
    const gradeImpact = document.getElementById('gradeImpact');
    if (gradeImpact) {
        let gradeHTML;
        if (worstCentering <= 5) {
            gradeHTML = `
                <p><strong style="color: #00ff00;">Perfect Centering!</strong></p>
                <ul style="margin-left: 20px;">
                    <li>PSA 10 / BGS 10: âœ… Qualifies (50/50 or better)</li>
                    <li>SGC 10: âœ… Qualifies (55/45 or better)</li>
                    <li>PSA 9: âœ… Qualifies (60/40 or better)</li>
                    <li>Overall Impact: No deduction</li>
                </ul>
            `;
        } else if (worstCentering <= 10) {
            gradeHTML = `
                <p><strong style="color: #4ecdc4;">Good Centering</strong></p>
                <ul style="margin-left: 20px;">
                    <li>PSA 10 / BGS 10: âŒ Does not qualify</li>
                    <li>SGC 10: âœ… Qualifies (55/45 or better)</li>
                    <li>PSA 9: âœ… Qualifies (60/40 or better)</li>
                    <li>Overall Impact: Slight deduction possible</li>
                </ul>
            `;
        } else if (worstCentering <= 15) {
            gradeHTML = `
                <p><strong style="color: #ffd700;">Fair Centering</strong></p>
                <ul style="margin-left: 20px;">
                    <li>PSA 10 / BGS 10: âŒ Does not qualify</li>
                    <li>SGC 10: âŒ Does not qualify</li>
                    <li>PSA 9: âœ… Qualifies (60/40 or better)</li>
                    <li>Max Grade: PSA 9 / SGC 9.5</li>
                </ul>
            `;
        } else {
            gradeHTML = `
                <p><strong style="color: #ff6b6b;">Poor Centering</strong></p>
                <ul style="margin-left: 20px;">
                    <li>PSA 10 / BGS 10: âŒ Does not qualify</li>
                    <li>SGC 10: âŒ Does not qualify</li>
                    <li>PSA 9: âŒ Does not qualify</li>
                    <li>Max Grade: PSA 8 / SGC 8.5 or lower</li>
                </ul>
            `;
        }
        gradeImpact.innerHTML = gradeHTML;
    }
    
    // Update card dimensions
    this.calculateCardDimensions();
}

    calculateCardDimensions() {
        // Standard trading card is 2.5" x 3.5" (63.5mm x 88.9mm)
        const container = document.getElementById('centeringImageContainer');
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        
        // Get edge positions
        const topEdge = parseFloat(document.getElementById('topEdge').style.top);
        const bottomEdge = parseFloat(document.getElementById('bottomEdge').style.top);
        const leftEdge = parseFloat(document.getElementById('leftEdge').style.left);
        const rightEdge = parseFloat(document.getElementById('rightEdge').style.left);
        
        // Calculate percentages that represent the card
        const cardHeightPercent = bottomEdge - topEdge;
        const cardWidthPercent = rightEdge - leftEdge;
        
        // Calculate pixels
        const cardHeightPx = (cardHeightPercent / 100) * rect.height;
        const cardWidthPx = (cardWidthPercent / 100) * rect.width;
        
        // Calculate ratio to determine actual size
        const aspectRatio = cardWidthPx / cardHeightPx;
        const standardRatio = 63.5 / 88.9; // Standard card ratio
        
        // Estimate actual dimensions based on aspect ratio
        let estimatedWidth, estimatedHeight;
        if (Math.abs(aspectRatio - standardRatio) < 0.1) {
            // Likely a standard card
            estimatedWidth = 63.5;
            estimatedHeight = 88.9;
        } else {
            // Calculate based on image scale
            const scale = cardWidthPx / 250; // Assume ~250px represents standard width
            estimatedWidth = 63.5 * scale;
            estimatedHeight = 88.9 * scale;
        }
        
        // Update measurement display
        const measureDisplay = document.getElementById('measurementDisplay');
        if (measureDisplay) {
            measureDisplay.innerHTML = `
                <div style="color: #00a8ff; margin-bottom: 5px;">Card Dimensions:</div>
                <div id="cardWidth">Width: ${estimatedWidth.toFixed(1)}mm (${(estimatedWidth/25.4).toFixed(2)}")</div>
                <div id="cardHeight">Height: ${estimatedHeight.toFixed(1)}mm (${(estimatedHeight/25.4).toFixed(2)}")</div>
                <div style="color: #FFD700; margin-top: 5px;">Pixels: ${Math.round(cardWidthPx)} x ${Math.round(cardHeightPx)}</div>
            `;
        }
    }
    
    updateCenteringResults(topPercent, bottomPercent, leftPercent, rightPercent, worstCentering) {
        document.getElementById('horizontalResult').innerHTML = 
            `Left: ${leftPercent}% | Right: ${rightPercent}%`;
        document.getElementById('verticalResult').innerHTML = 
            `Top: ${topPercent}% | Bottom: ${bottomPercent}%`;
        
        const worseRatio = 50 - worstCentering;
        const betterRatio = 50 + worstCentering;
        
        document.getElementById('centeringScore').textContent = `${worseRatio}/${betterRatio}`;
        
        // Update grade impact with same logic as before
        let gradeClass, gradeHTML;
        if (worstCentering <= 5) {
            gradeClass = 'centering-perfect';
            gradeHTML = `<p><strong style="color: #00ff00;">Excellent Centering!</strong></p>...`;
        } // ... rest of the grade logic
    }
    
    initKeyboardShortcuts() {
        const handleKeyPress = (e) => {
            if (!document.getElementById('centeringTool').classList.contains('active')) return;
            
            const step = e.shiftKey ? 1 : 0.5;
            let lineId = null;
            let direction = null;
            
            switch(e.key) {
                case 'ArrowUp':
                    if (e.ctrlKey) {
                        lineId = 'topLine';
                        direction = 'up';
                    } else {
                        lineId = 'bottomLine';
                        direction = 'up';
                    }
                    break;
                case 'ArrowDown':
                    if (e.ctrlKey) {
                        lineId = 'topLine';
                        direction = 'down';
                    } else {
                        lineId = 'bottomLine';
                        direction = 'down';
                    }
                    break;
                case 'ArrowLeft':
                    if (e.ctrlKey) {
                        lineId = 'leftLine';
                        direction = 'left';
                    } else {
                        lineId = 'rightLine';
                        direction = 'left';
                    }
                    break;
                case 'ArrowRight':
                    if (e.ctrlKey) {
                        lineId = 'leftLine';
                        direction = 'right';
                    } else {
                        lineId = 'rightLine';
                        direction = 'right';
                    }
                    break;
                case 'c':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.snapToCenter();
                    }
                    break;
                case 'a':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.autoDetectBorders();
                    }
                    break;
            }
            
            if (lineId && direction) {
                e.preventDefault();
                this.adjustLineWithKeyboard(lineId, direction, step);
            }
        };
        
        document.addEventListener('keydown', handleKeyPress);
        
        // Clean up when closing
        const tool = document.getElementById('centeringTool');
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && !tool.classList.contains('active')) {
                    document.removeEventListener('keydown', handleKeyPress);
                    observer.disconnect();
                }
            });
        });
        observer.observe(tool, { attributes: true });
    }
    
    adjustLineWithKeyboard(lineId, direction, step) {
        const line = document.getElementById(lineId);
        if (!line) return;
        
        const isHorizontal = lineId === 'topLine' || lineId === 'bottomLine';
        const currentPos = parseFloat(isHorizontal ? line.style.top : line.style.left);
        
        let newPos = currentPos;
        if (direction === 'up' || direction === 'left') {
            newPos -= step;
        } else {
            newPos += step;
        }
        
        newPos = Math.max(5, Math.min(95, newPos));
        
        if (isHorizontal) {
            line.style.top = newPos + '%';
        } else {
            line.style.left = newPos + '%';
        }
        
        this.calculateCentering();
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(78, 205, 196, 0.9);
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: bold;
            z-index: 100;
        `;
        notification.textContent = message;
        document.getElementById('centeringImageContainer')?.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    }
    
    highlightCenteringQuality() {
        const topLine = document.getElementById('topLine');
        const bottomLine = document.getElementById('bottomLine');
        const leftLine = document.getElementById('leftLine');
        const rightLine = document.getElementById('rightLine');
        
        if (!topLine || !bottomLine || !leftLine || !rightLine) return;
        
        const topPos = parseFloat(topLine.style.top);
        const bottomPos = parseFloat(bottomLine.style.top);
        const leftPos = parseFloat(leftLine.style.left);
        const rightPos = parseFloat(rightLine.style.left);
        
        // Calculate how close to perfect centering
        const verticalDiff = Math.abs(topPos - (100 - bottomPos));
        const horizontalDiff = Math.abs(leftPos - (100 - rightPos));
        
        const maxDiff = Math.max(verticalDiff, horizontalDiff);
        
        // Update line colors based on quality
        const lines = [topLine, bottomLine, leftLine, rightLine];
        lines.forEach(line => {
            if (!line.classList.contains('active-drag')) {
                if (maxDiff < 2) {
                    line.style.background = '#00ff00'; // Perfect
                } else if (maxDiff < 5) {
                    line.style.background = '#90EE90'; // Excellent
                } else if (maxDiff < 10) {
                    line.style.background = '#FFD700'; // Good
                } else if (maxDiff < 15) {
                    line.style.background = '#FFA500'; // Fair
                } else {
                    line.style.background = '#ff6b6b'; // Poor
                }
            }
        });
    }
    
    showCenteringFeedback() {
        const score = document.getElementById('centeringScore');
        if (!score) return;
        
        const text = score.textContent;
        const [left, right] = text.split('/').map(n => parseInt(n));
        const diff = Math.abs(50 - left);
        
        let message = '';
        if (diff === 0) {
            message = 'ðŸŽ¯ Perfect 50/50 centering!';
        } else if (diff <= 5) {
            message = 'âœ… Excellent centering - PSA 10 eligible!';
        } else if (diff <= 10) {
            message = 'ðŸ‘ Good centering - PSA 9 eligible';
        } else if (diff <= 15) {
            message = 'âš ï¸ Fair centering - May impact grade';
        } else {
            message = 'âŒ Poor centering - Significant grade reduction';
        }
        
        this.showNotification(message);
    }
    
    addMagnifyingGlass() {
        const container = document.getElementById('centeringImageContainer');
        if (!container) return;
        
        const magnifier = document.createElement('div');
        magnifier.id = 'centeringMagnifier';
        magnifier.style.cssText = `
            position: absolute;
            width: 100px;
            height: 100px;
            border: 2px solid var(--primary);
            border-radius: 50%;
            pointer-events: none;
            display: none;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(78, 205, 196, 0.5);
            z-index: 50;
        `;
        
        const magnifierImg = document.createElement('img');
        magnifierImg.src = container.querySelector('.centering-image')?.src;
        magnifierImg.style.cssText = `
            position: absolute;
            width: 400%;
            height: 400%;
        `;
        
        magnifier.appendChild(magnifierImg);
        container.appendChild(magnifier);
        
        container.addEventListener('mousemove', (e) => {
            if (e.shiftKey) {
                magnifier.style.display = 'block';
                const rect = container.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                magnifier.style.left = (x - 50) + 'px';
                magnifier.style.top = (y - 50) + 'px';
                
                magnifierImg.style.left = -(x * 4 - 50) + 'px';
                magnifierImg.style.top = -(y * 4 - 50) + 'px';
            } else {
                magnifier.style.display = 'none';
            }
        });
        
        container.addEventListener('mouseleave', () => {
            magnifier.style.display = 'none';
        });
    }
    
    openSurfaceInspector() {
        if (!this.selectedCard) return;
        
        const inspector = document.getElementById('surfaceInspector');
        const grid = document.getElementById('surfaceImagesGrid');
        
        if (inspector && grid) {
            const frontImage = this.selectedCard.images?.[0];
            const backImage = this.selectedCard.images?.[1];
            
            // Initialize surface view mode
            this.surfaceViewMode = 'grid';
            this.surfaceDefects = [];
            
            grid.innerHTML = `
                ${frontImage ? `
                    <div class="surface-image-box" id="frontNormalBox">
                        <div class="surface-image-label">Front - Original</div>
                        <img src="${frontImage}" class="surface-image" 
                             id="surfaceFrontNormal" alt="Front Normal"
                             onclick="window.cardMarketplace.markDefect(event, 'front')"
                             onmousemove="window.cardMarketplace.handleSurfaceMagnify(event, 'front')">
                    </div>
                    <div class="surface-image-box" id="frontFilteredBox">
                        <div class="surface-image-label">Front - Filtered</div>
                        <img src="${frontImage}" class="surface-image" 
                             id="surfaceFrontFiltered" alt="Front Filtered"
                             style="filter: contrast(100%) brightness(100%) saturate(100%);"
                             onclick="window.cardMarketplace.markDefect(event, 'front-filtered')"
                             onmousemove="window.cardMarketplace.handleSurfaceMagnify(event, 'front-filtered')">
                    </div>
                ` : ''}
                
                ${backImage ? `
                    <div class="surface-image-box" id="backNormalBox">
                        <div class="surface-image-label">Back - Original</div>
                        <img src="${backImage}" class="surface-image" 
                             id="surfaceBackNormal" alt="Back Normal"
                             onclick="window.cardMarketplace.markDefect(event, 'back')"
                             onmousemove="window.cardMarketplace.handleSurfaceMagnify(event, 'back')">
                    </div>
                    <div class="surface-image-box" id="backFilteredBox">
                        <div class="surface-image-label">Back - Filtered</div>
                        <img src="${backImage}" class="surface-image" 
                             id="surfaceBackFiltered" alt="Back Filtered"
                             style="filter: contrast(100%) brightness(100%) saturate(100%);"
                             onclick="window.cardMarketplace.markDefect(event, 'back-filtered')"
                             onmousemove="window.cardMarketplace.handleSurfaceMagnify(event, 'back-filtered')">
                    </div>
                ` : ''}
                
                ${!frontImage && !backImage ? 
                    '<div style="grid-column: 1/-1; padding: 100px; text-align: center; color: var(--text-muted);">No images available</div>' 
                : ''}
            `;
            
            inspector.classList.add('active');
            this.initSurfaceAnalysis();
        }
    }
    
    closeSurfaceInspector() {
        const inspector = document.getElementById('surfaceInspector');
        if (inspector) {
            inspector.classList.remove('active');
        }
    }
    
    updateSurfaceFilters() {
        const contrast = document.getElementById('contrastSlider')?.value || 100;
        const brightness = document.getElementById('brightnessSlider')?.value || 100;
        const saturation = document.getElementById('saturationSlider')?.value || 100;
        const sharpen = document.getElementById('sharpenSlider')?.value || 0;
        
        // Update value displays
        document.getElementById('contrastValue').textContent = contrast + '%';
        document.getElementById('brightnessValue').textContent = brightness + '%';
        document.getElementById('saturationValue').textContent = saturation + '%';
        document.getElementById('sharpenValue').textContent = sharpen + '%';
        
        // Create filter string
        let filterString = `contrast(${contrast}%) brightness(${brightness}%) saturate(${saturation}%)`;
        
        // Add sharpen effect using SVG filter if needed
        if (sharpen > 0) {
            filterString += ` drop-shadow(0 0 ${sharpen/10}px rgba(255,255,255,0.5))`;
        }
        
        // Apply to filtered images
        const filteredImages = document.querySelectorAll('#surfaceFrontFiltered, #surfaceBackFiltered');
        filteredImages.forEach(img => {
            img.style.filter = filterString;
        });
        
        // Update analysis scores based on current filters
        this.updateSurfaceScores();
    }
    
    initSurfaceAnalysis() {
        // Initialize defect detection
        this.surfaceDefects = [];
        this.updateSurfaceScores();
    }
    
    updateSurfaceScores() {
        // Simulate analysis based on current filter settings
        const contrast = document.getElementById('contrastSlider')?.value || 100;
        const brightness = document.getElementById('brightnessSlider')?.value || 100;
        
        // Calculate simulated scores
        const overallScore = Math.max(0, 100 - this.surfaceDefects.length * 5);
        document.getElementById('overallScore').textContent = overallScore + '%';
        document.getElementById('overallScore').className = 'surface-score-value ' + this.getScoreClass(overallScore);
        
        document.getElementById('defectCount').textContent = this.surfaceDefects.length;
        document.getElementById('defectCount').className = 'surface-score-value ' + 
            (this.surfaceDefects.length === 0 ? 'score-excellent' : 
             this.surfaceDefects.length <= 2 ? 'score-good' : 
             this.surfaceDefects.length <= 4 ? 'score-fair' : 'score-poor');
        
        // Update other scores based on filter analysis
        if (contrast > 150) {
            document.getElementById('scratchScore').textContent = 'Checking...';
        }
        if (brightness < 80) {
            document.getElementById('printScore').textContent = 'Enhanced';
        }
    }
    
    getScoreClass(score) {
        if (score >= 95) return 'score-excellent';
        if (score >= 85) return 'score-good';
        if (score >= 70) return 'score-fair';
        return 'score-poor';
    }
    
    markDefect(event, imageType) {
        const rect = event.target.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        
        // Add defect marker
        const marker = document.createElement('div');
        marker.className = 'surface-defect-marker';
        marker.style.left = x + '%';
        marker.style.top = y + '%';
        marker.innerHTML = `
            <div class="surface-defect-tooltip">
                Defect #${this.surfaceDefects.length + 1}
                <br>Type: ${document.getElementById('defectMode').value}
                <br>Location: ${Math.round(x)}%, ${Math.round(y)}%
            </div>
        `;
        
        event.target.parentElement.appendChild(marker);
        
        this.surfaceDefects.push({
            type: document.getElementById('defectMode').value,
            x: x,
            y: y,
            imageType: imageType
        });
        
        this.updateSurfaceScores();
    }
    
    handleSurfaceMagnify(event, imageType) {
        if (!event.shiftKey) {
            document.getElementById('surfaceMagnifier').style.display = 'none';
            return;
        }
        
        const magnifier = document.getElementById('surfaceMagnifier');
        const magnifierImg = document.getElementById('surfaceMagnifierImg');
        
        magnifier.style.display = 'block';
        magnifierImg.src = event.target.src;
        
        // Apply same filters to magnified image
        magnifierImg.style.filter = event.target.style.filter;
        
        // Position magnifier
        magnifier.style.left = (event.pageX + 20) + 'px';
        magnifier.style.top = (event.pageY - 125) + 'px';
        
        // Position magnified image
        const rect = event.target.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        
        magnifierImg.style.left = `-${x * 5 - 25}%`;
        magnifierImg.style.top = `-${y * 5 - 25}%`;
    }
    
    setSurfaceView(mode) {
        this.surfaceViewMode = mode;
        const grid = document.getElementById('surfaceImagesGrid');
        
        if (mode === 'split') {
            // Create split comparison view
            const frontImage = this.selectedCard.images?.[0];
            if (frontImage) {
                grid.innerHTML = `
                    <div class="surface-split-container" style="grid-column: 1/-1;">
                        <div class="surface-original-half">
                            <img src="${frontImage}" style="width: 200%; height: 100%; object-fit: cover;">
                        </div>
                        <div class="surface-filtered-half">
                            <img src="${frontImage}" style="width: 200%; height: 100%; object-fit: cover; 
                                 position: absolute; right: 0; 
                                 filter: contrast(${document.getElementById('contrastSlider').value}%) 
                                        brightness(${document.getElementById('brightnessSlider').value}%) 
                                        saturate(${document.getElementById('saturationSlider').value}%);">
                        </div>
                        <div class="surface-split-slider" id="splitSlider"
                             onmousedown="window.cardMarketplace.startSplitDrag(event)"></div>
                    </div>
                `;
            }
        } else if (mode === 'magnify') {
            this.showNotification('Hold SHIFT and move mouse over image to magnify');
        } else {
            // Return to grid view
            this.openSurfaceInspector();
        }
    }
    
    startSplitDrag(event) {
        const slider = event.target;
        const container = slider.parentElement;
        const startX = event.clientX;
        const startLeft = parseFloat(slider.style.left) || 50;
        
        const onMouseMove = (e) => {
            const rect = container.getBoundingClientRect();
            const newLeft = ((e.clientX - rect.left) / rect.width) * 100;
            
            if (newLeft >= 10 && newLeft <= 90) {
                slider.style.left = newLeft + '%';
                container.querySelector('.surface-original-half').style.width = newLeft + '%';
                container.querySelector('.surface-filtered-half').style.width = (100 - newLeft) + '%';
            }
        };
        
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
    
    changeDefectMode() {
        const mode = document.getElementById('defectMode').value;
        
        // Apply preset filters based on defect type
        const presets = {
            'scratches': { contrast: 180, brightness: 120, saturation: 80, sharpen: 30 },
            'print': { contrast: 200, brightness: 90, saturation: 100, sharpen: 50 },
            'stains': { contrast: 120, brightness: 80, saturation: 150, sharpen: 0 },
            'creases': { contrast: 250, brightness: 80, saturation: 50, sharpen: 75 },
            'edges': { contrast: 300, brightness: 100, saturation: 0, sharpen: 80 },
            'foil': { contrast: 100, brightness: 150, saturation: 0, sharpen: 20 },
            'auto': { contrast: 150, brightness: 100, saturation: 100, sharpen: 25 }
        };
        
        if (presets[mode]) {
            const preset = presets[mode];
            document.getElementById('contrastSlider').value = preset.contrast;
            document.getElementById('brightnessSlider').value = preset.brightness;
            document.getElementById('saturationSlider').value = preset.saturation;
            document.getElementById('sharpenSlider').value = preset.sharpen;
            this.updateSurfaceFilters();
            
            if (mode === 'auto') {
                this.autoAnalyzeSurface();
            }
        }
    }
    
    autoAnalyzeSurface() {
        // Simulate auto-analysis
        this.showNotification('Analyzing surface for all defect types...');
        
        // Cycle through different filter presets
        const analysisSteps = [
            { name: 'Scratches', delay: 500 },
            { name: 'Print Lines', delay: 1000 },
            { name: 'Stains', delay: 1500 },
            { name: 'Creases', delay: 2000 },
            { name: 'Edge Wear', delay: 2500 }
        ];
        
        analysisSteps.forEach(step => {
            setTimeout(() => {
                document.getElementById('defectMode').value = step.name.toLowerCase().replace(' ', '');
                this.changeDefectMode();
                this.showNotification(`Checking for ${step.name}...`);
            }, step.delay);
        });
        
        setTimeout(() => {
            // Show final analysis
            const defectCount = Math.floor(Math.random() * 3);
            document.getElementById('defectCount').textContent = defectCount;
            document.getElementById('overallScore').textContent = (100 - defectCount * 8) + '%';
            this.showNotification(`Analysis complete! ${defectCount} potential issues found.`);
        }, 3000);
    }
    
    resetSurfaceFilters() {
        document.getElementById('contrastSlider').value = 100;
        document.getElementById('brightnessSlider').value = 100;
        document.getElementById('saturationSlider').value = 100;
        document.getElementById('sharpenSlider').value = 0;
        document.getElementById('defectMode').value = 'none';
        
        // Clear defect markers
        document.querySelectorAll('.surface-defect-marker').forEach(marker => marker.remove());
        this.surfaceDefects = [];
        
        this.updateSurfaceFilters();
        this.showNotification('All filters reset');
    }
    
    exportSurfaceAnalysis() {
        const analysis = {
            card: this.selectedCard.cardName,
            date: new Date().toISOString(),
            filters: {
                contrast: document.getElementById('contrastSlider').value,
                brightness: document.getElementById('brightnessSlider').value,
                saturation: document.getElementById('saturationSlider').value,
                sharpen: document.getElementById('sharpenSlider').value
            },
            defects: this.surfaceDefects,
            scores: {
                overall: document.getElementById('overallScore').textContent,
                scratches: document.getElementById('scratchScore').textContent,
                print: document.getElementById('printScore').textContent,
                gloss: document.getElementById('glossScore').textContent,
                defectCount: document.getElementById('defectCount').textContent
            }
        };
        
        // Create downloadable JSON
        const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `surface-analysis-${this.selectedCard.cardName}-${Date.now()}.json`;
        a.click();
        
        this.showNotification('Analysis exported successfully!');
    }
    
    applySurfacePreset(preset) {
        const contrastSlider = document.getElementById('contrastSlider');
        const brightnessSlider = document.getElementById('brightnessSlider');
        const edgeSlider = document.getElementById('edgeSlider');
        
        switch(preset) {
            case 'normal':
                contrastSlider.value = 100;
                brightnessSlider.value = 100;
                edgeSlider.value = 0;
                break;
            case 'scratches':
                contrastSlider.value = 150;
                brightnessSlider.value = 120;
                edgeSlider.value = 0;
                break;
            case 'print':
                contrastSlider.value = 180;
                brightnessSlider.value = 90;
                edgeSlider.value = 30;
                break;
            case 'gloss':
                contrastSlider.value = 90;
                brightnessSlider.value = 130;
                edgeSlider.value = 0;
                break;
            case 'creases':
                contrastSlider.value = 200;
                brightnessSlider.value = 80;
                edgeSlider.value = 50;
                break;
        }
        
        this.updateSurfaceFilters();
    }
    
    handleCornerHover(event, cornerId) {
        const container = event.currentTarget;
        const magnifier = document.getElementById(`${cornerId}-mag`);
        const magnifierImg = document.getElementById(`${cornerId}-mag-img`);
        
        if (magnifier && magnifierImg) {
            magnifier.style.display = 'block';
            
            const rect = container.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            // Position magnifier
            magnifier.style.left = (x - 75) + 'px';
            magnifier.style.top = (y - 75) + 'px';
            
            // Position magnified image - simple approach for raw cards
            const percentX = (x / rect.width) * 100;
            const percentY = (y / rect.height) * 100;
            
            // Set magnified image position based on corner
            if (cornerId.includes('tl')) {
                magnifierImg.style.left = `-${percentX * 8}%`;
                magnifierImg.style.top = `-${percentY * 8}%`;
            } else if (cornerId.includes('tr')) {
                magnifierImg.style.right = `-${(100 - percentX) * 8}%`;
                magnifierImg.style.left = 'auto';
                magnifierImg.style.top = `-${percentY * 8}%`;
            } else if (cornerId.includes('bl')) {
                magnifierImg.style.left = `-${percentX * 8}%`;
                magnifierImg.style.bottom = `-${(100 - percentY) * 8}%`;
                magnifierImg.style.top = 'auto';
            } else if (cornerId.includes('br')) {
                magnifierImg.style.right = `-${(100 - percentX) * 8}%`;
                magnifierImg.style.left = 'auto';
                magnifierImg.style.bottom = `-${(100 - percentY) * 8}%`;
                magnifierImg.style.top = 'auto';
            }
        }
    }
    
    hideCornerMagnifier(cornerId) {
        const magnifier = document.getElementById(`${cornerId}-mag`);
        if (magnifier) {
            magnifier.style.display = 'none';
        }
    }
    
    enablePixelInspector(imageElement) {
        if (!imageElement) return;
        
        const container = imageElement.parentElement;
        let pixelInfo = document.createElement('div');
        pixelInfo.style.cssText = `
            position: absolute;
            bottom: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: #FFD700;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 0.8rem;
            font-family: monospace;
            pointer-events: none;
        `;
        container.appendChild(pixelInfo);
        
        imageElement.addEventListener('mousemove', (e) => {
            const rect = imageElement.getBoundingClientRect();
            const x = Math.round((e.clientX - rect.left) / rect.width * 100);
            const y = Math.round((e.clientY - rect.top) / rect.height * 100);
            pixelInfo.textContent = `Position: ${x}%, ${y}%`;
        });
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
        
        event.target.classList.add('active');
        const tabContent = document.getElementById(`${tabName}-tab`);
        if (tabContent) {
            tabContent.style.display = 'block';
        }
    }
    
    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'today';
        if (days === 1) return 'yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        return `${Math.floor(days / 30)} months ago`;
    }

    toggleAccordion(section) {
        const content = document.getElementById(`${section}-content`);
        if (content) {
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
            event.currentTarget.classList.toggle('active');
        }
    }
    
    contactSeller(listingId) {
        alert(`Opening message to seller for listing ${listingId}`);
    }
    
    initPriceChart() {
        // Placeholder for eBay API chart initialization
        // Will be replaced with actual Chart.js implementation when API is integrated
        const canvas = document.getElementById('priceChart');
        if (canvas) {
            // Show placeholder for now
            const placeholder = canvas.nextElementSibling;
            if (placeholder) {
                canvas.style.display = 'none';
                placeholder.style.display = 'block';
            }
        }
    }
    
    closeCornerInspector() {
        const inspector = document.getElementById('cornerInspector');
        if (inspector) {
            inspector.classList.remove('active');
        }
    }
    
    openToolsGuide() {
        const modal = document.createElement('div');
        modal.className = 'card-modal active';
        modal.style.zIndex = '20000';
        modal.style.overflowY = 'auto';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px; margin: 20px auto;">
                <div class="modal-header">
                    <h2 style="margin: 0; color: black; font-family: 'Bebas Neue', sans-serif; 
                               font-size: 1.8rem; letter-spacing: 2px;">CARD ASSESSMENT TOOLS</h2>
                    <button class="modal-close" onclick="this.closest('.card-modal').remove()">Ã—</button>
                </div>
                <div class="modal-body" style="padding: 25px; display: block; max-height: 70vh; overflow-y: auto;">
                    <div style="background: rgba(78, 205, 196, 0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                        <p style="margin: 0; color: var(--text-primary);">
                            Use these professional-grade tools to thoroughly assess card condition before buying or selling.
                        </p>
                    </div>
                    
                    <div class="detail-section">
                        <h3 style="color: var(--primary); margin-bottom: 15px;">
                            <i class="fas fa-microscope"></i> Corner Inspector
                        </h3>
                        <p style="color: var(--text-primary); margin-bottom: 10px;">
                            <strong>What it does:</strong> Magnifies all four corners at high resolution for detailed inspection.
                        </p>
                        <p style="color: var(--text-muted); margin-bottom: 10px;">
                            <strong>How to use:</strong> Click "Inspect Corners" to view enlarged corner images. Look for:
                        </p>
                        <ul style="color: var(--text-muted); margin-left: 20px;">
                            <li>Whitening or fraying on edges</li>
                            <li>Bent or soft corners</li>
                            <li>Peeling or layer separation</li>
                            <li>Consistency across all corners</li>
                        </ul>
                    </div>
                    
                    <div class="detail-section">
                        <h3 style="color: var(--primary); margin-bottom: 15px;">
                            <i class="fas fa-crosshairs"></i> Centering Tool
                        </h3>
                        <p style="color: var(--text-primary); margin-bottom: 10px;">
                            <strong>What it does:</strong> Measures exact centering percentages using adjustable guidelines.
                        </p>
                        <p style="color: var(--text-muted); margin-bottom: 10px;">
                            <strong>How to use:</strong> Drag the red lines to match card borders. The tool calculates:
                        </p>
                        <ul style="color: var(--text-muted); margin-left: 20px;">
                            <li>Left/Right centering ratio</li>
                            <li>Top/Bottom centering ratio</li>
                            <li>PSA accepts 60/40 or better for 9+</li>
                            <li>BGS requires 50/50 for pristine</li>
                        </ul>
                    </div>
                    
                    <div class="detail-section">
                        <h3 style="color: var(--primary); margin-bottom: 15px;">
                            <i class="fas fa-adjust"></i> Surface Inspector
                        </h3>
                        <p style="color: var(--text-primary); margin-bottom: 10px;">
                            <strong>What it does:</strong> Applies contrast and brightness filters to reveal surface defects.
                        </p>
                        <p style="color: var(--text-muted); margin-bottom: 10px;">
                            <strong>How to use:</strong> Adjust sliders to highlight different issues:
                        </p>
                        <ul style="color: var(--text-muted); margin-left: 20px;">
                            <li><strong>High Contrast:</strong> Reveals scratches and print lines</li>
                            <li><strong>Low Brightness:</strong> Shows staining and discoloration</li>
                            <li><strong>Edge Detection:</strong> Finds indentations and pressure marks</li>
                        </ul>
                    </div>
                    
                    <div class="detail-section">
                        <h3 style="color: var(--primary); margin-bottom: 15px;">
                            <i class="fas fa-search-plus"></i> Zoom & Fullscreen
                        </h3>
                        <p style="color: var(--text-primary); margin-bottom: 10px;">
                            <strong>What it does:</strong> Provides detailed examination at up to 3x magnification.
                        </p>
                        <p style="color: var(--text-muted); margin-bottom: 10px;">
                            <strong>Pro tips:</strong>
                        </p>
                        <ul style="color: var(--text-muted); margin-left: 20px;">
                            <li>Use fullscreen for overall card inspection</li>
                            <li>Zoom to check for alterations or trimming</li>
                            <li>Compare front and back for consistent wear</li>
                        </ul>
                    </div>
                    
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 15px; border-radius: 10px; margin-top: 20px;">
                        <h4 style="color: #FFD700; margin-bottom: 10px;">
                            <i class="fas fa-lightbulb"></i> Quick Assessment Checklist
                        </h4>
                        <div style="color: var(--text-primary);">
                            <label style="display: block; margin: 5px 0;">
                                <input type="checkbox" style="margin-right: 10px;">
                                Corners sharp and intact (use Corner Inspector)
                            </label>
                            <label style="display: block; margin: 5px 0;">
                                <input type="checkbox" style="margin-right: 10px;">
                                Edges clean without whitening (check all four sides)
                            </label>
                            <label style="display: block; margin: 5px 0;">
                                <input type="checkbox" style="margin-right: 10px;">
                                Surface free of scratches (use Surface Inspector)
                            </label>
                            <label style="display: block; margin: 5px 0;">
                                <input type="checkbox" style="margin-right: 10px;">
                                Centering 60/40 or better (use Centering Tool)
                            </label>
                            <label style="display: block; margin: 5px 0;">
                                <input type="checkbox" style="margin-right: 10px;">
                                No creases or bends (check in fullscreen)
                            </label>
                            <label style="display: block; margin: 5px 0;">
                                <input type="checkbox" style="margin-right: 10px;">
                                Print quality is sharp (zoom to verify)
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    showRawAnalysis() {
        const analysis = this.analyzeRawCardCondition();
        
        const modal = document.createElement('div');
        modal.className = 'card-modal active';
        modal.style.zIndex = '20000';
        modal.style.overflowY = 'auto';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px; margin: 20px auto; height: auto; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2 style="margin: 0; color: black; font-family: 'Bebas Neue', sans-serif; 
                               font-size: 1.8rem; letter-spacing: 2px;">RAW CARD ANALYSIS</h2>
                    <button class="modal-close" onclick="this.closest('.card-modal').remove()">Ã—</button>
                </div>
                <div class="modal-body" style="padding: 25px;">
                    <div class="detail-section" style="text-align: center; padding: 20px; 
                                background: linear-gradient(135deg, #4ecdc4, #44a8a0); 
                                border-radius: 12px; margin-bottom: 20px;">
                        <div style="font-size: 3rem; font-weight: 900; color: white;">
                            ${analysis.estimatedGrade}
                        </div>
                        <div style="color: white; margin-top: 10px;">Estimated Grade</div>
                    </div>
                    
                    <div class="detail-section">
                        <div class="detail-title">Corner Analysis</div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>Sharpness: ${analysis.cornerSharpness}%</span>
                            <div style="width: 200px; height: 10px; background: #333; border-radius: 5px; overflow: hidden;">
                                <div style="width: ${analysis.cornerSharpness}%; height: 100%; 
                                            background: ${analysis.cornerSharpness > 90 ? '#4ecdc4' : analysis.cornerSharpness > 75 ? '#ffd700' : '#ff6b6b'};"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <div class="detail-title">Edge Condition</div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>Wear: ${analysis.edgeWear}%</span>
                            <div style="width: 200px; height: 10px; background: #333; border-radius: 5px; overflow: hidden;">
                                <div style="width: ${100 - analysis.edgeWear}%; height: 100%; 
                                            background: ${analysis.edgeWear < 10 ? '#4ecdc4' : analysis.edgeWear < 25 ? '#ffd700' : '#ff6b6b'};"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <div class="detail-title">Surface Quality</div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>Cleanliness: ${analysis.surfaceClean}%</span>
                            <div style="width: 200px; height: 10px; background: #333; border-radius: 5px; overflow: hidden;">
                                <div style="width: ${analysis.surfaceClean}%; height: 100%; 
                                            background: ${analysis.surfaceClean > 85 ? '#4ecdc4' : analysis.surfaceClean > 70 ? '#ffd700' : '#ff6b6b'};"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="padding: 20px; background: ${analysis.recommendation.includes('Worth') ? 'rgba(78, 205, 196, 0.1)' : 'rgba(255, 107, 107, 0.1)'}; 
                                border-radius: 12px; text-align: center; margin-top: 20px;">
                        <div style="font-size: 1.2rem; font-weight: bold; color: var(--text-primary);">
                            ${analysis.recommendation}
                        </div>
                        <div style="margin-top: 10px; color: var(--text-muted);">
                            ${analysis.estimatedGrade >= 8 ? 
                                'This card shows potential for a good grade. Consider professional grading.' : 
                                'This card may have value as a raw card for collectors or personal collections.'}
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    openFullscreen() {
        if (!this.selectedCard || !this.selectedCard.images?.length) return;
        
        const viewer = document.getElementById('fullscreenViewer');
        const image = document.getElementById('fullscreenImage');
        
        if (viewer && image) {
            image.src = this.selectedCard.images[this.modalImageIndex] || this.selectedCard.images[0];
            viewer.classList.add('active');
            this.zoomLevel = 1;
            this.updateZoomLevel();
        }
    }
    
    closeFullscreen() {
        const viewer = document.getElementById('fullscreenViewer');
        if (viewer) {
            viewer.classList.remove('active');
        }
    }
    
    zoomIn() {
        this.zoomLevel = Math.min(this.zoomLevel + 0.25, 3);
        this.updateZoomLevel();
    }
    
    zoomOut() {
        this.zoomLevel = Math.max(this.zoomLevel - 0.25, 0.5);
        this.updateZoomLevel();
    }
    
    updateZoomLevel() {
        const image = document.getElementById('fullscreenImage');
        const zoomDisplay = document.getElementById('zoomLevel');
        
        if (image) {
            image.style.transform = `scale(${this.zoomLevel})`;
        }
        if (zoomDisplay) {
            zoomDisplay.textContent = `${Math.round(this.zoomLevel * 100)}%`;
        }
    }
    
    prevImage() {
        if (!this.selectedCard || !this.selectedCard.images) return;
        
        this.modalImageIndex = Math.max(0, this.modalImageIndex - 1);
        const image = document.getElementById('fullscreenImage');
        if (image) {
            image.src = this.selectedCard.images[this.modalImageIndex];
        }
    }
    
    nextImage() {
        if (!this.selectedCard || !this.selectedCard.images) return;
        
        this.modalImageIndex = Math.min(this.selectedCard.images.length - 1, this.modalImageIndex + 1);
        const image = document.getElementById('fullscreenImage');
        if (image) {
            image.src = this.selectedCard.images[this.modalImageIndex];
        }
    }
    
    toggleZoom() {
        const modalImage = document.getElementById('modalImage');
        if (modalImage) {
            modalImage.style.cursor = modalImage.style.cursor === 'zoom-in' ? 'zoom-out' : 'zoom-in';
            modalImage.style.transform = modalImage.style.transform === 'scale(2)' ? 'scale(1)' : 'scale(2)';
        }
    }
    
    closeModal() {
        const modal = document.getElementById('cardModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.selectedCard = null;
        this.modalImageIndex = 0;
    }
    
    quickBuy(listingId) {
        const listing = this.listings.find(l => l.id === listingId);
        if (listing) {
            alert(`Quick Buy: ${listing.cardName} for $${listing.price}`);
        }
    }
    
    makeOffer(listingId) {
        const listing = this.listings.find(l => l.id === listingId);
        if (listing) {
            const offer = prompt(`Make an offer for ${listing.cardName} (Listed at $${listing.price}):`);
            if (offer) {
                alert(`Offer of $${offer} submitted!`);
            }
        }
    }

    enhanceImageQuality(img) {
        // Apply subtle enhancement for clarity
        if (img) {
            img.style.imageRendering = '-webkit-optimize-contrast';
            img.style.imageRendering = 'crisp-edges';
            
            // Slight sharpening using CSS filter
            const currentFilter = img.style.filter || '';
            if (!currentFilter.includes('contrast')) {
                img.style.filter = 'contrast(105%) brightness(102%) saturate(105%)';
            }
            
            // For high-res images, ensure maximum quality
            img.loading = 'eager';
            img.decoding = 'sync';
        }
    }
    
    enhanceAllImages() {
        // Enhance all card images on page
        const images = document.querySelectorAll('.slab-image, .modal-slab-image, .corner-image, .surface-image, .centering-image, .fullscreen-image');
        images.forEach(img => this.enhanceImageQuality(img));
    }

    toggleImageEnhancement() {
        const images = document.querySelectorAll('.slab-image, .modal-slab-image, .corner-image, .surface-image');
        images.forEach(img => {
            if (img.classList.contains('enhanced')) {
                img.classList.remove('enhanced');
                img.style.filter = 'contrast(105%) brightness(102%) saturate(105%)';
            } else {
                img.classList.add('enhanced');
                img.style.filter = 'contrast(110%) brightness(105%) saturate(110%) drop-shadow(0 0 0.5px rgba(0,0,0,0.5))';
            }
        });
    }
    
    // Event Listeners
    attachEventListeners() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let timeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.filters.search = e.target.value;
                    this.applyFilters();
                    const container = document.querySelector('.marketplace-container').parentElement;
                    this.render(container);
                }, 300);
            });
        }
        
        const playerFilter = document.getElementById('playerFilter');
        if (playerFilter) {
            playerFilter.addEventListener('change', (e) => {
                this.filters.player = e.target.value;
                this.applyFilters();
                const container = document.querySelector('.marketplace-container').parentElement;
                this.render(container);
            });
        }
        
        const setFilter = document.getElementById('setFilter');
        if (setFilter) {
            setFilter.addEventListener('change', (e) => {
                this.filters.set = e.target.value;
                this.applyFilters();
                const container = document.querySelector('.marketplace-container').parentElement;
                this.render(container);
            });
        }
        
        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.applyFilters();
                const container = document.querySelector('.marketplace-container').parentElement;
                this.render(container);
            });
        }
        
        const pageSizeFilter = document.getElementById('pageSizeFilter');
        if (pageSizeFilter) {
            pageSizeFilter.addEventListener('change', (e) => {
                this.itemsPerPage = parseInt(e.target.value);
                this.currentPage = 1; // Reset to first page when changing page size
                const container = document.querySelector('.marketplace-container').parentElement;
                this.render(container);
            });
        }
        
        ['priceMin', 'priceMax', 'gradeMin', 'gradeMax'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', (e) => {
                    this.filters[id] = e.target.value;
                    this.applyFilters();
                    const container = document.querySelector('.marketplace-container').parentElement;
                    this.render(container);
                });
            }
        });
        
        // Add click event for card containers to open modal
        document.querySelectorAll('.slab-card-container').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't open modal if clicking on buttons
                if (!e.target.closest('button')) {
                    const cardId = card.dataset.cardId;
                    this.openModal(cardId);
                }
            });
        });
    }
    
    getActiveFilterCount() {
        let count = 0;
        if (this.filters.player) count++;
        if (this.filters.set) count++;
        if (this.filters.priceMin) count++;
        if (this.filters.priceMax) count++;
        if (this.filters.gradeMin) count++;
        if (this.filters.gradeMax) count++;
        return count;
    }
    
    compareCards() {
        alert('Compare feature: Shows similar cards and price comparisons');
    }
    
    addToWatchlist(cardId) {
        alert(`Added to watchlist: ${cardId}`);
    }
    
    shareCard(cardId) {
        alert(`Share card: ${cardId}`);
    }
}

// Initialize
window.cardMarketplace = new CardMarketplace();