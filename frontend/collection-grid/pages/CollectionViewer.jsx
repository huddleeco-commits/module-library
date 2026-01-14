import { useState, useEffect, useContext, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  ArrowLeft, Package, Search, SortAsc, SortDesc, Download, 
  Crown, Layers, X, Edit2, DollarSign, Sparkles, Store, 
  Activity, Filter, TrendingUp, Zap
} from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import Button from '../components/shared/Button';
import CardGrid from '../components/cards/CardGrid';
import CardDetailModal from '../components/cards/CardDetailModal';
import ImageEditor from '../components/cards/ImageEditor';
import MarkAsListedModal from '../components/cards/MarkAsListedModal';
import MarkAsSoldModal from '../components/cards/MarkAsSoldModal';
import EbayListingModal from '../components/ebay/EbayListingModal';
import EbayExportModal from '../components/ebay/EbayExportModal';
import AddToShowcaseModal from '../components/showcase/AddToShowcaseModal';
import { collectionsAPI } from '../api/collections';
import { cardsAPI } from '../api/cards';
import { apiFetch } from '../config/api';
import GradingReviewPanel from '../components/GradingReviewPanel';
import BulkAskingPriceModal from '../components/cards/BulkAskingPriceModal';
import EditableCell, { EditableCurrencyCell } from '../components/shared/EditableCell';

export default function CollectionViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  // State
  const [collection, setCollection] = useState(null);
  const [cards, setCards] = useState([]);
  const [displayedCards, setDisplayedCards] = useState([]);
  const [cardsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreCards, setHasMoreCards] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('player');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('list');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  const [showBadges, setShowBadges] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [selectedSet, setSelectedSet] = useState(null);
  
  // Filters
  const [filter, setFilter] = useState('all');
  const [showGradingReview, setShowGradingReview] = useState(false);
  
  // Modals
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [editingImage, setEditingImage] = useState(null);
  const [showListModal, setShowListModal] = useState(false);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [showEbayListingModal, setShowEbayListingModal] = useState(false);
  const [showEbayExport, setShowEbayExport] = useState(false);
  const [showDataSources, setShowDataSources] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddToShowcase, setShowAddToShowcase] = useState(false);
  const [showBulkAskingPrice, setShowBulkAskingPrice] = useState(false);
  
  // Data preferences
  const [dataPreferences, setDataPreferences] = useState({
    showEbay: true,
    showSportsCardsPro: true,
    showPSA: true,
    showPopReport: true
  });
  
  // eBay connection status
  const [ebayConnected, setEbayConnected] = useState(false);
  const [bulkPanelCollapsed, setBulkPanelCollapsed] = useState(false);
  
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Helper: Get SportsCardsPro price
  const getSportsCardsProPrice = (card) => {
    if (!card.is_graded || !card.grading_company || !card.grade) {
      return card.sportscardspro_raw ? parseFloat(card.sportscardspro_raw) : null;
    }
    
    const company = card.grading_company.toLowerCase();
    const grade = parseFloat(card.grade);
    
    if (company.includes('psa')) {
      if (grade === 10 && card.sportscardspro_psa10) return parseFloat(card.sportscardspro_psa10);
      if (grade === 9 && card.sportscardspro_psa9) return parseFloat(card.sportscardspro_psa9);
      if (grade === 8 && card.sportscardspro_psa8) return parseFloat(card.sportscardspro_psa8);
      if (grade === 7 && card.sportscardspro_psa7) return parseFloat(card.sportscardspro_psa7);
    }
    else if (company.includes('bgs') && grade >= 9.5 && card.sportscardspro_bgs10) {
      return parseFloat(card.sportscardspro_bgs10);
    }
    else if (company.includes('cgc') && grade >= 9.5 && card.sportscardspro_cgc10) {
      return parseFloat(card.sportscardspro_cgc10);
    }
    else if (company.includes('sgc') && grade >= 9.5 && card.sportscardspro_sgc10) {
      return parseFloat(card.sportscardspro_sgc10);
    }
    
    if (card.sportscardspro_psa10) return parseFloat(card.sportscardspro_psa10);
    if (card.sportscardspro_raw) return parseFloat(card.sportscardspro_raw);
    
    return null;
  };

  // Helper: Build eBay search query
  const buildEbaySearchQuery = (card) => {
    const cleanSetName = card.set_name?.replace(/^\d{4}\s+/, '') || '';
    let query = `${card.year} ${cleanSetName} ${card.player}`;
    
    if (card.card_number) {
      query += ` #${card.card_number}`;
    }
    
    if (card.parallel && card.parallel !== 'Base') {
      query += ` ${card.parallel}`;
    }
    
    if (card.grading_company) {
      query += ` ${card.grading_company} ${card.grade}`;
    }
    
    return query.trim();
  };

  // Helper: Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      unlisted: { label: 'Unlisted', color: 'bg-slate-600/50 text-slate-300' },
      listed: { label: '📍 Listed', color: 'bg-blue-600/20 text-blue-400 border-blue-500' },
      sold: { label: '✅ Sold', color: 'bg-green-600/20 text-green-400 border-green-500' }
    };
    const s = statusMap[status || 'unlisted'];
    return { label: s.label, color: s.color };
  };

  // Load collection data
  useEffect(() => {
    loadCollectionData();
    checkEbayConnection();
    loadDataPreferences();
  }, [id]);

  // Scroll detection for infinite loading
  useEffect(() => {
    const handleScroll = () => {
      const scrolledToBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500;
      
      if (scrolledToBottom && hasMoreCards && !loading) {
        loadMoreCards();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMoreCards, loading, currentPage]);

  const loadCollectionData = async () => {
  try {
    setLoading(true);
    
    // Get collection details
    const collectionsResponse = await collectionsAPI.getAll();
    if (collectionsResponse.success) {
      const coll = collectionsResponse.collections.find(c => c.id === parseInt(id));
      if (coll) {
        setCollection(coll);
      } else {
        console.error('❌ Collection not found in response');
        alert('❌ Collection not found - refresh the page');
        return;
      }
    }
    
    // Get cards in collection
    const cardsResponse = await collectionsAPI.getCards(id);
    if (cardsResponse.success) {
      setCards(cardsResponse.cards);
      
      // 🔥 LAZY LOAD: Only show first 50 cards initially
      const initialCards = cardsResponse.cards.slice(0, cardsPerPage);
      setDisplayedCards(initialCards);
      setHasMoreCards(cardsResponse.cards.length > cardsPerPage);
      setCurrentPage(1);
      
      console.log(`✅ Loaded ${cardsResponse.cards.length} cards (showing ${initialCards.length})`);
    }
  } catch (error) {
    console.error('Failed to load collection:', error);
    alert('❌ Failed to load collection - try refreshing');
  } finally {
    setLoading(false);
  }
};

  const checkEbayConnection = async () => {
    try {
      const response = await apiFetch('/ebay/seller-status');
      const data = await response.json();
      if (data.success) {
        setEbayConnected(data.connected);
      }
    } catch (error) {
      console.error('Failed to check eBay connection:', error);
    }
  };

  const loadDataPreferences = async () => {
    try {
      const response = await apiFetch('/users/data-preferences');
      const data = await response.json();
      if (data.success && data.preferences) {
        setDataPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Failed to load data preferences:', error);
    }
  };

  // Batch Pricing Handler
  const handleBatchPrice = async () => {
    const confirmed = window.confirm(
      `⏱️ Price ALL ${cards.length} cards in this collection?\n\n` +
      `⚠️ IMPORTANT:\n` +
      `• Pricing time: ~${Math.ceil(cards.length / 10)} minutes\n` +
      `• Fetches real market data\n\n` +
      `Ready to start?`
    );
    
    if (!confirmed) return;
    
    setLoading(true);
    
    try {
      let successCount = 0;
      let failCount = 0;
      
      alert(`🚀 Starting batch pricing for ${cards.length} cards...\n\nDO NOT close this window!`);
      
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        
        if (i % 10 === 0) {
          console.log(`💰 Pricing progress: ${i}/${cards.length} cards...`);
        }
        
        try {
          const searchQuery = buildEbaySearchQuery(card);
          
          const cardDetails = {
            cardId: card.id,
            player: card.player,
            year: card.year,
            setName: card.set_name?.replace(/^\d{4}\s+/, ''),
            cardNumber: card.card_number,
            parallel: card.parallel,
            gradingCompany: card.grading_company,
            grade: card.grade,
            isGraded: !!card.grading_company,
            sport: card.sport
          };
          
          const response = await apiFetch('/cards/quick-price-check', {
            method: 'POST',
            body: JSON.stringify({ searchQuery, cardDetails })
          });
          
          const data = await response.json();
          
          if (data.success && data.sales && data.sales.length > 0) {
            successCount++;
          } else {
            failCount++;
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`❌ Failed to price card ${card.id}:`, error);
          failCount++;
        }
      }
      
      alert(
        `✅ Pricing Complete!\n\n` +
        `Success: ${successCount} cards\n` +
        `Failed: ${failCount} cards`
      );
      
      if (successCount > 0) {
        loadCollectionData();
      }
      
    } catch (error) {
      console.error('Batch pricing failed:', error);
      alert('❌ Failed to update prices');
    } finally {
      setLoading(false);
    }
  };

  // PSA Data Population
  const handlePopulatePSAData = async () => {
    const psaCards = cards.filter(card => 
      card.is_graded && 
      card.grading_company && 
      card.grading_company.toLowerCase().includes('psa') &&
      card.cert_number
    );
    
    if (psaCards.length === 0) {
      alert('❌ No PSA graded cards found in this collection!');
      return;
    }
    
    const confirmed = window.confirm(
      `🔍 Populate PSA Data for ${psaCards.length} card${psaCards.length > 1 ? 's' : ''}?\n\n` +
      `⏱️ Estimated time: ~${Math.ceil(psaCards.length / 2)} minutes\n\n` +
      `Ready to start?`
    );
    
    if (!confirmed) return;
    
    setLoading(true);
    
    try {
      let successCount = 0;
      let failCount = 0;
      
      for (let i = 0; i < psaCards.length; i++) {
        const card = psaCards[i];
        
        try {
          const response = await apiFetch(`/psa/card/${card.id}`, {
            method: 'POST'
          });
          
          const data = await response.json();
          
          if (data.success) {
            successCount++;
          } else {
            failCount++;
          }
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error(`❌ Failed for card ${card.id}:`, error);
          failCount++;
        }
      }
      
      alert(
        `✅ PSA Data Complete!\n\n` +
        `Success: ${successCount} cards\n` +
        `Failed: ${failCount} cards`
      );
      
      if (successCount > 0) {
        loadCollectionData();
      }
      
    } catch (error) {
      console.error('PSA population failed:', error);
      alert('❌ Failed to populate PSA data');
    } finally {
      setLoading(false);
    }
  };

  // Card Status Updates
  const updateCardStatus = async (cardId, newStatus, priceData = {}) => {
    try {
      const response = await apiFetch(`/cards/${cardId}/listing-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_status: newStatus,
          listing_price: priceData.listing_price,
          acquisition_type: priceData.acquisition_type,
          purchase_price: priceData.purchase_price,
          pack_price: priceData.pack_price,
          cards_in_pack: priceData.cards_in_pack,
          platform: priceData.platform,
          ebay_listing_url: priceData.ebay_listing_url,
          estimated_profit: priceData.estimated_profit,
          profit_margin: priceData.profit_margin,
          sold_price: priceData.sold_price,
          sold_date: priceData.sold_date,
          buyer_paid_shipping: priceData.buyer_paid_shipping,
          notes: priceData.notes
        })
      });

      const data = await response.json();
      if (data.success) {
        setCards(prevCards =>
          prevCards.map(card =>
            card.id === cardId
              ? { 
                  ...card, 
                  listing_status: newStatus, 
                  listing_price: priceData.listing_price || card.listing_price,
                  sold_price: priceData.sold_price || card.sold_price,
                  estimated_profit: priceData.estimated_profit || card.estimated_profit,
                  profit_margin: priceData.profit_margin || card.profit_margin
                }
              : card
          )
        );
        
        setTimeout(() => {
          loadCollectionData();
        }, 1000);
        
        return true;
      } else {
        alert('Failed to update card status');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to update status:', error);
      alert('Failed to update card status: ' + error.message);
      return false;
    }
  };

  const handleCardStatusChange = async (cardId, currentStatus) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const status = currentStatus || 'unlisted';

    if (status === 'unlisted') {
      setSelectedCard(card);
      setShowListModal(true);
    } else if (status === 'listed') {
      setSelectedCard(card);
      setShowSoldModal(true);
    } else if (status === 'sold') {
      const confirm = window.confirm('Mark this card as unlisted again?');
      if (confirm) {
        await updateCardStatus(cardId, 'unlisted', {
          listing_price: null,
          sold_price: null,
          estimated_profit: null
        });
      }
    }
  };

  const handleMarkAsListed = async (data) => {
    if (!selectedCard) return;
    
    const updatePayload = {
      listing_price: data.listing_price,
      acquisition_type: data.acquisition_type,
      purchase_price: data.purchase_price,
      pack_price: data.pack_price,
      cards_in_pack: data.cards_in_pack,
      platform: data.platform,
      ebay_listing_url: data.ebay_listing_url,
      estimated_profit: data.estimated_profit,
      profit_margin: data.profit_margin
    };
    
    const success = await updateCardStatus(selectedCard.id, 'listed', updatePayload);
    if (success) {
      setShowListModal(false);
      setSelectedCard(null);
      loadCollectionData();
    }
  };

  const handleMarkAsSold = async (data) => {
    if (!selectedCard) return;
    const success = await updateCardStatus(selectedCard.id, 'sold', data);
    if (success) {
      setShowSoldModal(false);
      setSelectedCard(null);
      loadCollectionData();
    }
  };

  const handleRemoveListing = async (cardId) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    
    if (!confirm(`Remove "${card.player}" from listings?`)) return;

    const success = await updateCardStatus(cardId, 'unlisted', {
      listing_price: null,
      sold_price: null,
      estimated_profit: null
    });

    if (success) {
      alert('✅ Card removed from listings!');
    }
  };

  // Export Handlers
  const handleExportCSV = async () => {
    if (selectedCards.length === 0) {
      alert('⚠️ Please select cards to export');
      return;
    }
    
    try {
      const response = await apiFetch('/cards/export-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardIds: selectedCards })
      });
      
      if (!response.ok) {
        const error = await response.json();
        if (error.tier && error.limit) {
          alert(`⚠️ ${error.error}\n\nYour ${error.tier} plan limit: ${error.limit} cards\nSelected: ${selectedCards.length} cards`);
        } else {
          alert('Failed to export CSV');
        }
        return;
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collection.name}-export-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      alert(`✅ Exported ${selectedCards.length} cards!`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('❌ Export failed');
    }
  };

  const handleExportExcel = async () => {
    if (selectedCards.length === 0) {
      alert('⚠️ Please select cards to export');
      return;
    }
    
    if (user?.subscriptionTier !== 'pro' && user?.subscriptionTier !== 'premium') {
      const upgrade = window.confirm('Excel export is a Premium feature!\n\nUpgrade to Premium?');
      if (upgrade) {
        navigate('/pricing');
      }
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await apiFetch('/cards/export-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardIds: selectedCards })
      });
      
      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to export Excel');
        setLoading(false);
        return;
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collection.name}-Premium-Export-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      alert(`✅ Premium Excel export complete!`);
    } catch (error) {
      console.error('Excel export failed:', error);
      alert('❌ Export failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCards = async () => {
    if (selectedCards.length === 0) return;
    
    if (!confirm(`Remove ${selectedCards.length} cards from "${collection.name}"?\n\nCards will NOT be deleted, only removed from this collection.`)) {
      return;
    }
    
    try {
      await collectionsAPI.removeCards(id, selectedCards);
      alert(`✅ Removed ${selectedCards.length} cards from collection!`);
      setSelectedCards([]);
      setSelectMode(false);
      loadCollectionData();
    } catch (error) {
      console.error('Failed to remove cards:', error);
      alert('❌ Failed to remove cards');
    }
  };

  // 🔥 Inline Edit Handler - updates card field and syncs across all views
  const handleInlineEdit = async (cardId, field, value) => {
    try {
      const response = await apiFetch(`/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      
      const data = await response.json();
      
      if (data.success || response.ok) {
        // Update local state immediately for instant UI feedback
        setCards(prevCards =>
          prevCards.map(card =>
            card.id === cardId
              ? { ...card, [field]: value }
              : card
          )
        );
        return true;
      } else {
        throw new Error(data.error || 'Failed to update');
      }
    } catch (error) {
      console.error('❌ Inline edit failed:', error);
      throw error;
    }
  };

  const handleToggleCardSelection = (cardId) => {
    if (selectedCards.includes(cardId)) {
      setSelectedCards(selectedCards.filter(id => id !== cardId));
    } else {
      setSelectedCards([...selectedCards, cardId]);
    }
  };

  const handleBulkEbayListing = async () => {
    if (selectedCards.length === 0) return;
    
    // Check if eBay policies are configured
    if (!user?.ebay_payment_policy_id || !user?.ebay_return_policy_id || !user?.ebay_fulfillment_policy_id) {
      const connect = window.confirm(
        '📦 eBay not connected or policies missing!\n\n' +
        'Go to Settings → eBay Selling to connect and configure?'
      );
      if (connect) {
        navigate('/settings?tab=ebay');
      }
      return;
    }
    
    setShowEbayListingModal(true);
  };

  const handleBulkShowcase = async () => {
  if (selectedCards.length === 0) return;
  setShowAddToShowcase(true);
};

  const loadMoreCards = () => {
    const nextPage = currentPage + 1;
    const startIndex = currentPage * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    
    const moreCards = filteredAndSortedCards.slice(startIndex, endIndex);
    
    if (moreCards.length > 0) {
      setDisplayedCards(prev => [...prev, ...moreCards]);
      setCurrentPage(nextPage);
      setHasMoreCards(endIndex < filteredAndSortedCards.length);
      console.log(`📄 Loaded page ${nextPage} (${moreCards.length} more cards)`);
    }
  };

  // Filtered and sorted cards
  const filteredAndSortedCards = useMemo(() => {
    const filtered = cards
      .filter(card => {
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          return (
            card.player?.toLowerCase().includes(search) ||
            card.team?.toLowerCase().includes(search) ||
            card.set_name?.toLowerCase().includes(search) ||
            card.card_number?.toLowerCase().includes(search)
          );
        }
        return true;
      })
      .filter(card => {
        // Status filter
        if (filter === 'all') return true;
        if (filter === 'priced') return card.ebay_avg !== null;
        if (filter === 'unlisted') return !card.listing_status || card.listing_status === 'unlisted';
        if (filter === 'listed') return card.listing_status === 'listed';
        if (filter === 'sold') return card.listing_status === 'sold';
        if (filter === 'showcased') return card.is_public === true || card.is_public === 1;
        if (filter === 'grading_review') return card.grading_review_status !== null;
        return true;
      })
      .sort((a, b) => {
        let aVal, bVal;

        if (sortBy === 'lastName') {
          const getLastName = (player) => {
            if (!player) return '';
            const parts = player.trim().split(' ');
            return parts[parts.length - 1].toLowerCase();
          };
          aVal = getLastName(a.player);
          bVal = getLastName(b.player);
        } else {
          aVal = a[sortBy];
          bVal = b[sortBy];

          if (sortBy === 'ebay_avg') {
            aVal = a.ebay_low || 0;
            bVal = b.ebay_low || 0;
          }

          if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal?.toLowerCase() || '';
          }
        }

        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    
    // 🔥 AUTO-LOAD ALL CARDS when user searches or filters
    if (searchTerm || filter !== 'all') {
      console.log('🔍 Search/filter active - showing all results');
      setDisplayedCards(filtered);
      setHasMoreCards(false);
    } else {
      // Reset to paginated view when search/filter cleared
      const initial = filtered.slice(0, cardsPerPage);
      setDisplayedCards(initial);
      setHasMoreCards(filtered.length > cardsPerPage);
      setCurrentPage(1);
    }
    
    return filtered;
  }, [cards, searchTerm, sortBy, sortOrder, filter, cardsPerPage]);

  // Get cards by set
  const getCardsBySet = () => {
    const sets = {};
    filteredAndSortedCards.forEach(card => {
      const setKey = `${card.year} ${card.set_name}`;
      if (!sets[setKey]) {
        sets[setKey] = {
          name: setKey,
          year: card.year,
          setName: card.set_name,
          cards: [],
          totalValue: 0
        };
      }
      sets[setKey].cards.push(card);
      if (card.ebay_avg) {
        sets[setKey].totalValue += parseFloat(card.ebay_avg);
      }
    });
    return Object.values(sets).sort((a, b) => b.year - a.year);
  };

  // View Renderers
  const renderGridView = (cards) => (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
      {cards.map(card => (
        <div
          key={card.id}
          onClick={() => {
            setSelectedCard(card);
            setIsCardModalOpen(true);
          }}
          className='bg-slate-800 rounded-lg p-3 border border-slate-700 hover:border-cyan-500 transition-all cursor-pointer'
        >
          {selectMode && (
            <input
              type='checkbox'
              checked={selectedCards.includes(card.id)}
              onChange={(e) => {
                e.stopPropagation();
                handleToggleCardSelection(card.id);
              }}
              className='mb-2'
            />
          )}
          <div className='flex gap-2 mb-3 justify-center'>
            {card.front_image_url ? (
              <img
                src={card.front_image_thumb || card.front_image_url}
                alt={card.player}
                className='w-20 h-28 object-cover rounded'
                loading='lazy'
              />
            ) : (
              <div className='w-20 h-28 bg-slate-700 rounded flex items-center justify-center'>
                <Package className='w-8 h-8 text-slate-500' />
              </div>
            )}
          </div>
          <h3 className='text-sm font-bold text-white truncate'>{card.player}</h3>
          <p className='text-xs text-slate-400 truncate'>{card.year} {card.set_name}</p>
          {card.is_graded && (
            <p className='text-xs text-cyan-400 mt-1'>{card.grading_company} {card.grade}</p>
          )}
          <div className='mt-3 space-y-2 pt-2 border-t border-slate-700'>
            {card.ebay_low && (
              <div className='flex justify-between items-center'>
                <span className='text-xs text-slate-400'>Lowest BIN:</span>
                <span className='text-sm font-bold text-green-400'>${parseFloat(card.ebay_low).toFixed(2)}</span>
              </div>
            )}
            {(() => {
              const scpPrice = getSportsCardsProPrice(card);
              return scpPrice ? (
                <div className='flex justify-between items-center'>
                  <span className='text-xs text-slate-400'>Sold Comp:</span>
                  <span className='text-sm font-bold text-blue-400'>${scpPrice.toFixed(2)}</span>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      ))}
    </div>
  );

  const renderTableView = (cards) => (
    <div className='bg-slate-800 rounded-lg overflow-x-auto'>
      <table className='w-full'>
        <thead className='bg-slate-700'>
          <tr>
            {selectMode && <th className='px-4 py-3'></th>}
            <th className='px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase'>Image</th>
            <th className='px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase'>Player</th>
            <th className='px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase'>Set</th>
            <th className='px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase'>Grade</th>
            <th className='px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase'>Lowest BIN</th>
            <th className='px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase'>Sold Comp</th>
            <th className='px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase'>
              <span className='flex items-center justify-end gap-1'>
                My Price
                <Edit2 size={12} className='text-purple-400' />
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {cards.map(card => (
            <tr 
              key={card.id} 
              className='border-b border-slate-700 hover:bg-slate-700/50 transition-colors'
            >
              {selectMode && (
                <td className='px-4 py-3'>
                  <input
                    type='checkbox'
                    checked={selectedCards.includes(card.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleToggleCardSelection(card.id);
                    }}
                  />
                </td>
              )}
              <td 
                className='px-4 py-3 cursor-pointer'
                onClick={() => { setSelectedCard(card); setIsCardModalOpen(true); }}
              >
                {card.front_image_url ? (
                  <img src={card.front_image_thumb || card.front_image_url} alt={card.player} className='w-12 h-16 object-cover rounded' loading='lazy' />
                ) : (
                  <div className='w-12 h-16 bg-slate-700 rounded flex items-center justify-center'>
                    <Package className='w-4 h-4 text-slate-500' />
                  </div>
                )}
              </td>
              <td 
                className='px-4 py-3 cursor-pointer'
                onClick={() => { setSelectedCard(card); setIsCardModalOpen(true); }}
              >
                <p className='text-white font-medium'>{card.player}</p>
                <p className='text-xs text-slate-400'>{card.sport}</p>
              </td>
              <td 
                className='px-4 py-3 cursor-pointer'
                onClick={() => { setSelectedCard(card); setIsCardModalOpen(true); }}
              >
                <p className='text-sm text-white'>{card.set_name}</p>
                <p className='text-xs text-slate-400'>{card.year} {card.card_number && `#${card.card_number}`}</p>
              </td>
              <td 
                className='px-4 py-3 cursor-pointer'
                onClick={() => { setSelectedCard(card); setIsCardModalOpen(true); }}
              >
                {card.is_graded ? (
                  <span className='text-cyan-400 text-sm font-medium'>{card.grading_company} {card.grade}</span>
                ) : (
                  <span className='text-slate-500 text-sm'>Raw</span>
                )}
              </td>
              <td 
                className='px-4 py-3 text-right cursor-pointer'
                onClick={() => { setSelectedCard(card); setIsCardModalOpen(true); }}
              >
                {card.ebay_low ? (
                  <span className='text-green-400 font-bold'>${parseFloat(card.ebay_low).toFixed(2)}</span>
                ) : (
                  <span className='text-slate-500 text-sm'>-</span>
                )}
              </td>
              <td 
                className='px-4 py-3 text-right cursor-pointer'
                onClick={() => { setSelectedCard(card); setIsCardModalOpen(true); }}
              >
                {(() => {
                  const scpPrice = getSportsCardsProPrice(card);
                  return scpPrice ? (
                    <span className='text-blue-400 font-bold'>${scpPrice.toFixed(2)}</span>
                  ) : (
                    <span className='text-slate-500 text-sm'>-</span>
                  );
                })()}
              </td>
              {/* INLINE EDITABLE MY PRICE CELL */}
              <td className='px-2 py-2'>
                <EditableCurrencyCell
                  value={card.asking_price}
                  onSave={async (newValue) => {
                    await handleInlineEdit(card.id, 'asking_price', newValue);
                  }}
                  placeholder='Set price'
                  className='text-purple-400'
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderExcelView = (cards) => (
    <div className='bg-slate-800 rounded-lg overflow-x-auto'>
      <div className='mb-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-center justify-between'>
        <div>
          <p className='text-cyan-400 font-bold'>📊 Excel Edit Mode</p>
          <p className='text-xs text-slate-400'>Click any highlighted cell to edit • Changes save automatically</p>
        </div>
      </div>
      <table className='w-full border-collapse'>
        <thead className='bg-emerald-600'>
          <tr>
            <th className='border border-slate-600 px-3 py-2 text-left text-xs font-bold text-white'>ID</th>
            <th className='border border-slate-600 px-3 py-2 text-left text-xs font-bold text-white'>Front</th>
            <th className='border border-slate-600 px-3 py-2 text-left text-xs font-bold text-white bg-emerald-500'>✏️ Player</th>
            <th className='border border-slate-600 px-3 py-2 text-left text-xs font-bold text-white bg-emerald-500'>✏️ Year</th>
            <th className='border border-slate-600 px-3 py-2 text-left text-xs font-bold text-white bg-emerald-500'>✏️ Set</th>
            <th className='border border-slate-600 px-3 py-2 text-left text-xs font-bold text-white bg-emerald-500'>✏️ Card #</th>
            <th className='border border-slate-600 px-3 py-2 text-left text-xs font-bold text-white bg-emerald-500'>✏️ Parallel</th>
            <th className='border border-slate-600 px-3 py-2 text-left text-xs font-bold text-white bg-emerald-500'>✏️ Sport</th>
            <th className='border border-slate-600 px-3 py-2 text-left text-xs font-bold text-white bg-emerald-500'>✏️ Team</th>
            <th className='border border-slate-600 px-3 py-2 text-left text-xs font-bold text-white bg-emerald-500'>✏️ Grader</th>
            <th className='border border-slate-600 px-3 py-2 text-left text-xs font-bold text-white bg-emerald-500'>✏️ Grade</th>
            <th className='border border-slate-600 px-3 py-2 text-left text-xs font-bold text-white bg-emerald-500'>✏️ Cert #</th>
            <th className='border border-slate-600 px-3 py-2 text-right text-xs font-bold text-white'>Lowest BIN</th>
            <th className='border border-slate-600 px-3 py-2 text-right text-xs font-bold text-white bg-purple-600'>✏️ My Price</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((card, index) => (
            <tr 
              key={card.id} 
              className={`${index % 2 === 0 ? 'bg-slate-900/50' : 'bg-slate-800/50'} hover:bg-slate-700/50 transition-colors`}
            >
              <td className='border border-slate-700 px-3 py-2 text-slate-400 text-sm'>{card.id}</td>
              
              <td 
                className='border border-slate-700 px-3 py-2 cursor-pointer hover:bg-slate-600/50'
                onClick={() => { setSelectedCard(card); setIsCardModalOpen(true); }}
              >
                {card.front_image_url ? (
                  <img src={card.front_image_thumb || card.front_image_url} alt={card.player} className='w-12 h-16 object-cover rounded' loading='lazy' />
                ) : (
                  <div className='w-12 h-16 bg-slate-700 rounded flex items-center justify-center'>
                    <Package className='w-4 h-4 text-slate-500' />
                  </div>
                )}
              </td>
              
              <td className='border border-slate-700 px-1 py-1 bg-emerald-900/20'>
                <EditableCell
                  value={card.player}
                  onSave={(val) => handleInlineEdit(card.id, 'player', val)}
                  className='text-white font-medium'
                />
              </td>
              
              <td className='border border-slate-700 px-1 py-1 bg-emerald-900/20'>
                <EditableCell
                  value={card.year}
                  onSave={(val) => handleInlineEdit(card.id, 'year', val)}
                  className='text-white'
                />
              </td>
              
              <td className='border border-slate-700 px-1 py-1 bg-emerald-900/20'>
                <EditableCell
                  value={card.set_name}
                  onSave={(val) => handleInlineEdit(card.id, 'set_name', val)}
                  className='text-white'
                />
              </td>
              
              <td className='border border-slate-700 px-1 py-1 bg-emerald-900/20'>
                <EditableCell
                  value={card.card_number}
                  onSave={(val) => handleInlineEdit(card.id, 'card_number', val)}
                  placeholder='#'
                  className='text-white'
                />
              </td>
              
              <td className='border border-slate-700 px-1 py-1 bg-emerald-900/20'>
                <EditableCell
                  value={card.parallel}
                  onSave={(val) => handleInlineEdit(card.id, 'parallel', val)}
                  placeholder='Base'
                  className='text-white'
                />
              </td>
              
              <td className='border border-slate-700 px-1 py-1 bg-emerald-900/20'>
                <EditableCell
                  value={card.sport}
                  onSave={(val) => handleInlineEdit(card.id, 'sport', val)}
                  placeholder='Sport'
                  className='text-white'
                />
              </td>
              
              <td className='border border-slate-700 px-1 py-1 bg-emerald-900/20'>
                <EditableCell
                  value={card.team}
                  onSave={(val) => handleInlineEdit(card.id, 'team', val)}
                  placeholder='Team'
                  className='text-white'
                />
              </td>
              
              <td className='border border-slate-700 px-1 py-1 bg-emerald-900/20'>
                <EditableCell
                  value={card.grading_company}
                  onSave={(val) => handleInlineEdit(card.id, 'grading_company', val)}
                  placeholder='PSA/BGS/SGC'
                  className='text-cyan-400'
                />
              </td>
              
              <td className='border border-slate-700 px-1 py-1 bg-emerald-900/20'>
                <EditableCell
                  value={card.grade}
                  onSave={(val) => handleInlineEdit(card.id, 'grade', val)}
                  placeholder='10'
                  className='text-cyan-400'
                />
              </td>
              
              <td className='border border-slate-700 px-1 py-1 bg-emerald-900/20'>
                <EditableCell
                  value={card.cert_number}
                  onSave={(val) => handleInlineEdit(card.id, 'cert_number', val)}
                  placeholder='Cert #'
                  className='text-white'
                />
              </td>
              
              <td className='border border-slate-700 px-3 py-2 text-right'>
                {card.ebay_low ? (
                  <span className='text-green-400 font-bold'>${parseFloat(card.ebay_low).toFixed(2)}</span>
                ) : (
                  <span className='text-slate-500'>-</span>
                )}
              </td>
              
              <td className='border border-slate-700 px-1 py-1 bg-purple-900/30'>
                <EditableCurrencyCell
                  value={card.asking_price}
                  onSave={(val) => handleInlineEdit(card.id, 'asking_price', val)}
                  placeholder='$0.00'
                  className='text-purple-400 font-bold'
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderCarouselView = (cards) => {
    if (cards.length === 0) return null;
    const currentCard = cards[carouselIndex];
    return (
      <div className='relative bg-slate-800 rounded-2xl p-8 min-h-[600px] flex items-center justify-center'>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCarouselIndex(prev => (prev > 0 ? prev - 1 : cards.length - 1));
          }}
          className='absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center z-10'
        >
          <span className='text-white text-2xl'>←</span>
        </button>
        <div 
          onClick={() => {
            setSelectedCard(currentCard);
            setIsCardModalOpen(true);
          }}
          className='text-center cursor-pointer hover:scale-105 transition-transform'
        >
          {currentCard.front_image_url && (
            <img src={currentCard.front_image_url} alt={currentCard.player} className='w-80 h-auto mx-auto rounded-xl shadow-2xl mb-4' loading='lazy' />
          )}
          <h2 className='text-3xl font-bold text-white mb-2'>{currentCard.player}</h2>
          <p className='text-xl text-slate-400'>{currentCard.year} {currentCard.set_name}</p>
          {currentCard.is_graded && (
            <p className='text-lg text-cyan-400 mt-2'>{currentCard.grading_company} {currentCard.grade}</p>
          )}
          <p className='text-slate-400 mt-4'>Card {carouselIndex + 1} of {cards.length}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCarouselIndex(prev => (prev < cards.length - 1 ? prev + 1 : 0));
          }}
          className='absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center z-10'
        >
          <span className='text-white text-2xl'>→</span>
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-20 w-20 border-4 border-indigo-500/30 border-t-indigo-500 mx-auto mb-4'></div>
          <p className='text-slate-400'>Loading collection...</p>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-400'>Collection not found</p>
          <Button onClick={() => navigate('/dashboard')} className='mt-4'>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900'>
      <Navbar />
      
      <div className='max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8'>
        
        {/* Header */}
        <div className='mb-6'>
          <Button
            onClick={() => navigate('/dashboard')}
            variant='secondary'
            className='mb-4'
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Button>

          <div 
            className='bg-slate-800/50 rounded-2xl p-6 border-2 border-slate-700'
            style={{ borderLeftWidth: '8px', borderLeftColor: collection.color }}
          >
            <div className='flex items-center justify-between flex-wrap gap-4'>
              <div>
                <h1 className='text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2'>
                  {collection.name}
                </h1>
                {collection.description && (
                  <p className='text-slate-400'>{collection.description}</p>
                )}
                <div className='flex items-center gap-4 mt-3'>
                  <span className='text-slate-300'>
                    <Package size={18} className='inline mr-1' />
                    {cards.length} cards
                  </span>
                  {parseFloat(collection.total_value) > 0 && (
                    <span className='text-emerald-400 font-bold text-lg'>
                      ${parseFloat(collection.total_value).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <div className='flex gap-2 flex-wrap'>
                <Button
                  onClick={() => setEditMode(!editMode)}
                  variant={editMode ? 'success' : 'secondary'}
                  className='text-sm'
                >
                  <Edit2 size={16} />
                  {editMode ? 'Done' : 'Edit'}
                </Button>
                
                <Button
                  onClick={() => setSelectMode(!selectMode)}
                  variant={selectMode ? 'primary' : 'secondary'}
                  className='text-sm'
                >
                  <Store size={16} />
                  Bulk
                  {selectedCards.length > 0 && ` (${selectedCards.length})`}
                </Button>

                <Button
                  onClick={handleBatchPrice}
                  variant='secondary'
                  className='text-sm bg-emerald-500/10 border-2 border-emerald-500/30'
                >
                  <DollarSign size={16} />
                  Price All
                </Button>

                <Button
                  onClick={handlePopulatePSAData}
                  variant='secondary'
                  className='text-sm bg-purple-500/10 border-2 border-purple-500/30'
                >
                  <Sparkles size={16} />
                  PSA Data
                </Button>

                <Button
                  onClick={() => setShowGradingReview(true)}
                  variant='secondary'
                  className='text-sm bg-amber-500/10 border-2 border-amber-500/30 hover:border-amber-500/50'
                >
                  <Search size={16} />
                  Grade Review
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Sort */}
        <div className='bg-slate-800/50 rounded-2xl p-4 mb-6 border-2 border-slate-700'>
          <div className='flex flex-col md:flex-row gap-3'>
            <div className='flex-1 relative'>
              <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-500' size={20} />
              <input
                type='text'
                placeholder='Search cards...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-12 pr-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none'
              />
            </div>

            <div className='flex gap-2'>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className='px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none'
              >
                <option value='player'>First Name</option>
                <option value='lastName'>Last Name</option>
                <option value='team'>Team</option>
                <option value='set_name'>Set</option>
                <option value='year'>Year</option>
                <option value='ebay_avg'>Lowest BIN</option>
              </select>

              <Button
                variant='secondary'
                size='sm'
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc size={20} /> : <SortDesc size={20} />}
              </Button>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className='flex flex-wrap gap-2 mt-4'>
            <Button
              onClick={() => setViewMode('list')}
              variant={viewMode === 'list' ? 'primary' : 'secondary'}
              size='sm'
            >
              📋 List
            </Button>
            <Button
              onClick={() => setViewMode('grid')}
              variant={viewMode === 'grid' ? 'primary' : 'secondary'}
              size='sm'
            >
              🎴 Grid
            </Button>
            <Button
              onClick={() => setViewMode('table')}
              variant={viewMode === 'table' ? 'primary' : 'secondary'}
              size='sm'
            >
              📈 Table
            </Button>
            <Button
              onClick={() => {
                setViewMode('carousel');
                setCarouselIndex(0);
              }}
              variant={viewMode === 'carousel' ? 'primary' : 'secondary'}
              size='sm'
            >
              👆 Swipe
            </Button>
            <Button
              onClick={() => {
                setViewMode('sets');
                setSelectedSet(null);
              }}
              variant={viewMode === 'sets' ? 'primary' : 'secondary'}
              size='sm'
            >
              <Layers size={16} />
              Sets
            </Button>

            <Button
  onClick={() => setViewMode('excel')}
  variant={viewMode === 'excel' ? 'primary' : 'secondary'}
  size='sm'
  className='bg-emerald-500/20 border border-emerald-500/30'
>
  📊 Excel
</Button>
          </div>

          {/* Status Filter Tabs */}
          <div className='flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide'>
            <Button 
              variant={filter === 'all' ? 'primary' : 'secondary'} 
              size='sm'
              onClick={() => setFilter('all')}
              className={`whitespace-nowrap text-xs ${
                filter === 'all' 
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600' 
                  : 'bg-slate-700/50 hover:bg-slate-700'
              }`}
            >
              All ({cards.length})
            </Button>
            <Button 
              variant={filter === 'priced' ? 'success' : 'secondary'} 
              size='sm'
              onClick={() => setFilter('priced')}
              className={`whitespace-nowrap text-xs ${
                filter === 'priced' 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600' 
                  : 'bg-slate-700/50 hover:bg-slate-700'
              }`}
            >
              💰 Priced ({cards.filter(c => c.ebay_avg).length})
            </Button>
            <Button 
              variant={filter === 'unlisted' ? 'secondary' : 'secondary'} 
              size='sm'
              onClick={() => setFilter('unlisted')}
              className={`whitespace-nowrap text-xs ${
                filter === 'unlisted' 
                  ? 'bg-slate-600 text-white' 
                  : 'bg-slate-700/50 hover:bg-slate-700'
              }`}
            >
              Unlisted ({cards.filter(c => !c.listing_status || c.listing_status === 'unlisted').length})
            </Button>
            <Button 
              variant={filter === 'listed' ? 'secondary' : 'secondary'} 
              size='sm'
              onClick={() => setFilter('listed')}
              className={`whitespace-nowrap text-xs ${
                filter === 'listed' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700/50 hover:bg-slate-700'
              }`}
            >
              📍 Listed ({cards.filter(c => c.listing_status === 'listed').length})
            </Button>
            <Button 
              variant={filter === 'sold' ? 'secondary' : 'secondary'} 
              size='sm'
              onClick={() => setFilter('sold')}
              className={`whitespace-nowrap text-xs ${
                filter === 'sold' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-slate-700/50 hover:bg-slate-700'
              }`}
            >
              ✅ Sold ({cards.filter(c => c.listing_status === 'sold').length})
            </Button>
            <Button 
              variant={filter === 'showcased' ? 'secondary' : 'secondary'} 
              size='sm'
              onClick={() => setFilter('showcased')}
              className={`whitespace-nowrap text-xs ${
                filter === 'showcased' 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                  : 'bg-slate-700/50 hover:bg-slate-700'
              }`}
            >
              ⭐ Showcased ({cards.filter(c => c.is_public).length})
            </Button>
            <Button 
              variant={filter === 'grading_review' ? 'secondary' : 'secondary'} 
              size='sm'
              onClick={() => setFilter('grading_review')}
              className={`whitespace-nowrap text-xs ${
                filter === 'grading_review' 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
                  : 'bg-slate-700/50 hover:bg-slate-700'
              }`}
            >
              🔍 Grade Review ({cards.filter(c => c.grading_review_status).length})
            </Button>
          </div>
        </div>

        {/* Cards Display */}
        {viewMode === 'sets' && !selectedSet ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8'>
            {getCardsBySet().map(set => (
              <div
                key={set.name}
                onClick={() => setSelectedSet(set.name)}
                className='bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border-2 border-slate-700 hover:border-indigo-500/50 transition-all cursor-pointer hover:scale-105'
              >
                <div className='flex items-center justify-between mb-4'>
                  <Layers className='text-indigo-400' size={32} />
                  <span className='bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-full text-xs font-bold'>
                    {set.cards.length} cards
                  </span>
                </div>
                <h3 className='font-bold text-white text-lg mb-2'>{set.setName}</h3>
                <p className='text-slate-400 text-sm mb-3'>{set.year}</p>
                {set.totalValue > 0 && (
                  <p className='text-emerald-400 font-bold'>
                    ${set.totalValue.toFixed(2)} total
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <>
            {selectedSet && (
              <div className='mb-4 flex items-center gap-4'>
                <Button
                  onClick={() => setSelectedSet(null)}
                  variant='secondary'
                  size='sm'
                >
                  ← Back to Sets
                </Button>
                <h2 className='text-xl font-bold text-white'>{selectedSet}</h2>
              </div>
            )}
            
            {viewMode === 'list' && (
              <CardGrid 
                editMode={editMode}
                selectMode={selectMode}
                selectedCards={selectedCards}
                onSelectCard={handleToggleCardSelection}
                onCropCard={(card) => setEditingImage({ card, side: 'front' })}
                onUpdate={loadCollectionData}
                onQuickUpdate={loadCollectionData}
                showStatusToggle={true}
                showBadges={showBadges}
                dataPreferences={dataPreferences}
                onStatusChange={handleCardStatusChange}
                onRemoveListing={handleRemoveListing}
                getStatusBadge={getStatusBadge}
                onCardModalOpen={setIsCardModalOpen}
                cards={selectedSet 
                  ? displayedCards.filter(c => `${c.year} ${c.set_name}` === selectedSet)
                  : displayedCards
                } 
              />
            )}
            
            {viewMode === 'grid' && renderGridView(
              selectedSet 
                ? displayedCards.filter(c => `${c.year} ${c.set_name}` === selectedSet)
                : displayedCards
            )}
            
            {viewMode === 'table' && renderTableView(
              selectedSet 
                ? displayedCards.filter(c => `${c.year} ${c.set_name}` === selectedSet)
                : displayedCards
            )}

            {viewMode === 'carousel' && renderCarouselView(
              selectedSet 
                ? displayedCards.filter(c => `${c.year} ${c.set_name}` === selectedSet)
                : displayedCards
            )}
            
            {viewMode === 'excel' && renderExcelView(
  selectedSet 
    ? displayedCards.filter(c => `${c.year} ${c.set_name}` === selectedSet)
    : displayedCards
)}
          </>
        )}

        {/* Load More Indicator */}
        {hasMoreCards && !searchTerm && filter === 'all' && (
          <div className='flex justify-center py-8'>
            <div className='flex items-center gap-3 bg-slate-800/50 px-6 py-3 rounded-xl border border-slate-700'>
              <div className='animate-spin rounded-full h-6 w-6 border-2 border-indigo-500/30 border-t-indigo-500'></div>
              <span className='text-slate-400'>Loading more cards...</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {cards.length === 0 && (
          <div className='text-center py-16 bg-slate-800/30 rounded-3xl border-2 border-dashed border-indigo-500/30'>
            <Package size={64} className='mx-auto text-slate-600 mb-4' />
            <h3 className='text-2xl font-black text-white mb-2'>No Cards in Collection</h3>
            <p className='text-slate-400 mb-6'>Add cards from your dashboard</p>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      {editingImage && (
        <ImageEditor
          image={editingImage.side === 'front' ? editingImage.card.front_image_url : editingImage.card.back_image_url}
          card={editingImage.card}
          editingSide={editingImage.side}
          onClose={() => setEditingImage(null)}
          onUpdate={loadCollectionData}
          onSave={() => {
            setEditingImage(null);
            loadCollectionData();
          }}
        />
      )}

      {showListModal && selectedCard && (
        <MarkAsListedModal
          card={selectedCard}
          onClose={() => {
            setShowListModal(false);
            setSelectedCard(null);
          }}
          onConfirm={handleMarkAsListed}
        />
      )}

      {showSoldModal && selectedCard && (
        <MarkAsSoldModal
          card={selectedCard}
          onClose={() => {
            setShowSoldModal(false);
            setSelectedCard(null);
          }}
          onConfirm={handleMarkAsSold}
        />
      )}

      {showEbayListingModal && (
        <EbayListingModal
          cards={cards.filter(c => selectedCards.includes(c.id))}
          onClose={() => {
            setShowEbayListingModal(false);
            setSelectMode(false);
            setSelectedCards([]);
          }}
          onSuccess={() => {
            loadCollectionData();
            setShowEbayListingModal(false);
            setSelectMode(false);
            setSelectedCards([]);
          }}
        />
      )}

      {showEbayExport && (
        <EbayExportModal
          cards={cards.filter(c => selectedCards.includes(c.id))}
          onClose={() => {
            setShowEbayExport(false);
            setSelectMode(false);
            setSelectedCards([]);
          }}
        />
      )}

      {/* Add to Showcase Modal */}
{showAddToShowcase && (
  <AddToShowcaseModal
    cards={cards.filter(c => selectedCards.includes(c.id))}
    onClose={() => setShowAddToShowcase(false)}
    onSuccess={() => {
      setShowAddToShowcase(false);
      setSelectMode(false);
      setSelectedCards([]);
      loadCollectionData();
    }}
  />
)}

      {isCardModalOpen && selectedCard && createPortal(
  <CardDetailModal
    card={selectedCard}
    onClose={() => {
      setIsCardModalOpen(false);
      setSelectedCard(null);
    }}
    onUpdate={() => {
      // 🔥 STAY IN COLLECTION - Just refresh the collection data
      loadCollectionData();
    }}
  />,
  document.body
)}

      {/* Bulk Asking Price Modal */}
      {showBulkAskingPrice && (
        <BulkAskingPriceModal
          cards={selectedCards.length > 0 ? cards.filter(c => selectedCards.includes(c.id)) : filteredAndSortedCards}
          onClose={() => setShowBulkAskingPrice(false)}
          onComplete={(count) => {
            setShowBulkAskingPrice(false);
            setSelectMode(false);
            setSelectedCards([]);
            loadCollectionData();
          }}
        />
      )}

      {/* Grading Review Panel */}
      {showGradingReview && (
        <GradingReviewPanel
          onClose={() => setShowGradingReview(false)}
          onUpdate={loadCollectionData}
        />
      )}

{/* Floating Actions Panel - Auto-hide when modals open */}
{selectMode && selectedCards.length > 0 && !showEbayListingModal && !showEbayExport && !showAddToShowcase && (
  <div className={`fixed ${bulkPanelCollapsed ? 'bottom-6 right-6' : 'bottom-6 left-1/2 -translate-x-1/2'} z-40 ${bulkPanelCollapsed ? 'w-auto' : 'w-[95%] max-w-5xl'} transition-all duration-300`}>
    <div className='bg-slate-900/95 backdrop-blur-xl rounded-2xl border-2 border-cyan-500/50 shadow-2xl'>
      {bulkPanelCollapsed ? (
        /* COLLAPSED STATE */
        <div className='flex items-center gap-3 p-3'>
          <div className='flex items-center gap-2'>
            <div className='p-2 bg-cyan-500/20 rounded-lg'>
              <Store className='text-cyan-400' size={18} />
            </div>
            <div>
              <p className='text-white font-bold text-sm'>
                {selectedCards.length} selected
              </p>
            </div>
          </div>
          <button
            onClick={() => setBulkPanelCollapsed(false)}
            className='p-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors'
            title='Show Actions'
          >
            <span className='text-white text-lg'>↑</span>
          </button>
          <button
            onClick={() => {
              setSelectMode(false);
              setSelectedCards([]);
            }}
            className='p-2 hover:bg-slate-800 rounded-lg transition-colors'
          >
            <X className='text-slate-400 hover:text-white' size={18} />
          </button>
        </div>
      ) : (
        /* EXPANDED STATE */
        <>
          <div className='flex items-center justify-between p-4'>
            <div>
              <h3 className='font-bold text-white'>Collection Actions</h3>
              <p className='text-xs text-slate-400'>
                {selectedCards.length} card{selectedCards.length !== 1 ? 's' : ''} selected
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setBulkPanelCollapsed(true)}
                className='p-2 hover:bg-slate-800 rounded-lg transition-colors'
                title='Minimize'
              >
                <span className='text-slate-400 hover:text-white text-xl'>↓</span>
              </button>
              <button
                onClick={() => {
                  setSelectMode(false);
                  setSelectedCards([]);
                }}
                className='p-2 hover:bg-slate-800 rounded-lg transition-colors'
              >
                <X className='text-slate-400 hover:text-white' size={20} />
              </button>
            </div>
          </div>

          <div className='px-4 pb-4'>
            <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2'>
              <Button
                onClick={handleBulkShowcase}
                variant='primary'
                size='sm'
                className='flex items-center justify-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 text-xs py-2'
              >
                <Sparkles size={14} />
                Showcase
              </Button>

              <Button
                onClick={handleBulkEbayListing}
                variant='success'
                size='sm'
                className='flex items-center justify-center gap-1 bg-green-600 text-xs py-2'
              >
                <Store size={14} />
                {ebayConnected ? '✓ eBay' : '🔗 eBay'}
              </Button>

              <Button
                onClick={() => setShowEbayExport(true)}
                variant='secondary'
                size='sm'
                className='flex items-center justify-center gap-1 bg-blue-600/20 border border-blue-500/30 text-xs py-2'
              >
                🏪 eBay CSV
              </Button>

              <Button
                onClick={handleExportCSV}
                variant='secondary'
                size='sm'
                className='flex items-center justify-center gap-1 bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 text-xs py-2'
              >
                <Download size={14} />
                CSV
              </Button>

              {(user?.subscriptionTier === 'pro' || user?.subscriptionTier === 'premium') ? (
                <Button
                  onClick={handleExportExcel}
                  variant='primary'
                  size='sm'
                  className='flex items-center justify-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-xs py-2'
                >
                  <Crown size={14} />
                  Excel
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('/pricing')}
                  variant='secondary'
                  size='sm'
                  className='flex items-center justify-center gap-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs py-2'
                >
                  <Crown size={14} />
                  Excel
                </Button>
              )}

              <Button
                onClick={handleRemoveCards}
                variant='danger'
                size='sm'
                className='flex items-center justify-center gap-1 bg-red-600 text-xs py-2'
              >
                <X size={14} />
                Remove
              </Button>

              <Button
                onClick={() => {
                  setSelectedCards(filteredAndSortedCards.map(c => c.id));
                }}
                variant='secondary'
                size='sm'
                className='flex items-center justify-center gap-1 text-xs py-2 bg-cyan-500/20 border border-cyan-500/30'
              >
                Select All
              </Button>

              <Button
                onClick={() => setSelectedCards([])}
                variant='secondary'
                size='sm'
                className='flex items-center justify-center gap-1 text-xs py-2 bg-slate-700/50 hover:bg-slate-700'
              >
                Clear
              </Button>

              <Button
                onClick={() => setShowBulkAskingPrice(true)}
                variant='secondary'
                size='sm'
                className='flex items-center justify-center gap-1 bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500 text-emerald-300 text-xs py-2'
              >
                <DollarSign size={14} />
                My Price
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  </div>
)}
    </div>
  );
}