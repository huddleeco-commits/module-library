import { useState, useEffect } from 'react';
import { Package, DollarSign, TrendingUp, Clock, Filter, Grid, List, Search } from 'lucide-react';
import { apiFetch } from '../config/api';
import CardGrid from '../components/cards/CardGrid';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';

export default function Gallery() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid'); // grid or list
  const [filters, setFilters] = useState({
    status: 'all', // all, unlisted, listed, sold
    search: '',
    sortBy: 'recent', // recent, price_high, price_low, profit_high
    performanceSpike: false
  });
  const [stats, setStats] = useState({
    total: 0,
    unlisted: 0,
    listed: 0,
    sold: 0,
    totalProfit: 0,
    avgMargin: 0
  });

  useEffect(() => {
    loadGallery();
  }, [filters]);

  const loadGallery = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sort', filters.sortBy);
      if (filters.performanceSpike) params.append('spike', 'true');

      const response = await apiFetch(`/selling/gallery?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setCards(data.cards || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Failed to load gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCardStatus = async (cardId, newStatus, priceData = {}) => {
    try {
      const response = await apiFetch(`/selling/cards/${cardId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          ...priceData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        loadGallery(); // Reload to get updated data
        return true;
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update card status');
      return false;
    }
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      unlisted: 'bg-slate-600/50 text-slate-300 border-slate-600',
      listed: 'bg-blue-600/20 text-blue-400 border-blue-500',
      sold: 'bg-green-600/20 text-green-400 border-green-500'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || styles.unlisted}`}>
        {status ? status.toUpperCase() : 'UNLISTED'}
      </span>
    );
  };

  const CardListItem = ({ card }) => (
    <div className='bg-slate-800/50 rounded-xl p-4 flex items-center gap-4 hover:bg-slate-800 transition-all border border-slate-700'>
      <img 
        src={card.front_image_url || '/placeholder.png'} 
        alt={card.player}
        className='w-20 h-28 object-cover rounded-lg'
      />
      
      <div className='flex-1'>
        <h3 className='font-bold text-lg'>{card.player}</h3>
        <p className='text-slate-400 text-sm'>
          {card.year} {card.set_name} {card.card_number && `#${card.card_number}`}
        </p>
        {card.parallel && (
          <span className='text-xs text-yellow-400'>{card.parallel}</span>
        )}
      </div>

      <div className='flex flex-col items-end gap-2'>
        <StatusBadge status={card.listing_status} />
        
        {card.listing_status === 'listed' && (
          <div className='text-right'>
            <div className='text-xl font-bold'>${card.listing_price}</div>
            <div className='text-xs text-slate-400'>
              {card.ebay_watchers || 0} watchers
            </div>
          </div>
        )}

        {card.listing_status === 'sold' && (
          <div className='text-right'>
            <div className='text-xl font-bold text-green-400'>${card.sold_price}</div>
            <div className='text-xs text-green-400'>
              Profit: ${card.estimated_profit || 0}
            </div>
          </div>
        )}

        {card.performance_spike && (
          <div className='flex items-center gap-1 text-orange-400'>
            <TrendingUp size={16} />
            <span className='text-xs'>HOT</span>
          </div>
        )}
      </div>

      <div className='flex gap-2'>
        {card.listing_status === 'unlisted' && (
          <Button
            size='sm'
            onClick={() => {
              const price = prompt('Enter listing price:');
              if (price) {
                updateCardStatus(card.id, 'listed', { 
                  listing_price: parseFloat(price) 
                });
              }
            }}
            className='bg-blue-600 hover:bg-blue-700'
          >
            List
          </Button>
        )}

        {card.listing_status === 'listed' && (
          <Button
            size='sm'
            onClick={() => {
              const price = prompt('Enter sold price:');
              if (price) {
                updateCardStatus(card.id, 'sold', { 
                  sold_price: parseFloat(price) 
                });
              }
            }}
            className='bg-green-600 hover:bg-green-700'
          >
            Mark Sold
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className='p-6'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400'>
          Card Gallery
        </h1>
        <p className='text-slate-400 mt-2'>Manage your collection and track sales</p>
      </div>

      {/* Stats Bar */}
      <div className='grid grid-cols-1 md:grid-cols-6 gap-4 mb-8'>
        <div className='bg-slate-800/50 rounded-xl p-4 border border-slate-700'>
          <div className='text-slate-400 text-sm mb-1'>Total Cards</div>
          <div className='text-2xl font-bold'>{stats.total}</div>
        </div>
        <div className='bg-slate-800/50 rounded-xl p-4 border border-slate-700'>
          <div className='text-slate-400 text-sm mb-1'>Unlisted</div>
          <div className='text-2xl font-bold text-slate-300'>{stats.unlisted}</div>
        </div>
        <div className='bg-blue-900/30 rounded-xl p-4 border border-blue-700'>
          <div className='text-blue-400 text-sm mb-1'>Listed</div>
          <div className='text-2xl font-bold text-blue-400'>{stats.listed}</div>
        </div>
        <div className='bg-green-900/30 rounded-xl p-4 border border-green-700'>
          <div className='text-green-400 text-sm mb-1'>Sold</div>
          <div className='text-2xl font-bold text-green-400'>{stats.sold}</div>
        </div>
        <div className='bg-purple-900/30 rounded-xl p-4 border border-purple-700'>
          <div className='text-purple-400 text-sm mb-1'>Total Profit</div>
          <div className='text-2xl font-bold text-purple-400'>${stats.totalProfit}</div>
        </div>
        <div className='bg-orange-900/30 rounded-xl p-4 border border-orange-700'>
          <div className='text-orange-400 text-sm mb-1'>Avg Margin</div>
          <div className='text-2xl font-bold text-orange-400'>{stats.avgMargin}%</div>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700'>
        <div className='flex flex-wrap gap-4 items-center'>
          {/* Search */}
          <div className='flex-1 min-w-[200px]'>
            <Input
              placeholder='Search cards...'
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              icon={<Search size={18} />}
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className='px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white'
          >
            <option value='all'>All Cards</option>
            <option value='unlisted'>Unlisted</option>
            <option value='listed'>Listed</option>
            <option value='sold'>Sold</option>
          </select>

          {/* Sort */}
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
            className='px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white'
          >
            <option value='recent'>Most Recent</option>
            <option value='price_high'>Price: High to Low</option>
            <option value='price_low'>Price: Low to High</option>
            <option value='profit_high'>Profit: High to Low</option>
          </select>

          {/* Performance Spike Filter */}
          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='checkbox'
              checked={filters.performanceSpike}
              onChange={(e) => setFilters({...filters, performanceSpike: e.target.checked})}
              className='w-4 h-4'
            />
            <span className='text-orange-400 font-bold'>
              <TrendingUp size={16} className='inline mr-1' />
              Hot Cards Only
            </span>
          </label>

          {/* View Toggle */}
          <div className='flex gap-2'>
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg ${view === 'grid' ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg ${view === 'list' ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Cards Display */}
      {loading ? (
        <div className='text-center py-12'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent'></div>
        </div>
      ) : cards.length === 0 ? (
        <div className='text-center py-12 text-slate-400'>
          <Package size={48} className='mx-auto mb-4 opacity-50' />
          <p>No cards found matching your filters</p>
        </div>
      ) : view === 'grid' ? (
        <CardGrid cards={cards} onCardClick={() => {}} />
      ) : (
        <div className='space-y-2'>
          {cards.map(card => (
            <CardListItem key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}