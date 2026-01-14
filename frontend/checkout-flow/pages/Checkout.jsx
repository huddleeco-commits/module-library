// frontend/src/pages/CheckoutPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import { 
  ShoppingCart, 
  CreditCard, 
  Edit2, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  DollarSign,
  Smartphone,
  Wallet,
  Tag,
  User
} from 'lucide-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get cart from navigation state or localStorage
  const initialCart = location.state?.cart || JSON.parse(localStorage.getItem('vendorCart') || '[]');
  const vendorId = location.state?.vendorId || localStorage.getItem('checkoutVendorId');

  const [cart, setCart] = useState(initialCart);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [bundleDiscount, setBundleDiscount] = useState(0);
  const [discountReason, setDiscountReason] = useState('');
  const [editingPrice, setEditingPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [vendorInfo, setVendorInfo] = useState(null);
  
  // Customer info (optional)
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  useEffect(() => {
    if (!vendorId) {
      navigate('/');
      return;
    }
    
    if (cart.length === 0) {
      // Don't redirect - let the "cart is empty" UI show below
      setLoading(false);
      return;
    }
    
    loadPaymentMethods();
    loadVendorInfo();
  }, [vendorId]);

  const loadPaymentMethods = async () => {
    try {
      const response = await axios.get(
        `${getApiUrl()}/payment-settings/vendor/${vendorId}`
      );
      setPaymentMethods(response.data.payment_methods || []);
      setVendorInfo({
        vendor_name: response.data.vendor_name,
        business_name: response.data.business_name,
        booth_number: response.data.booth_number,
        payment_instructions: response.data.payment_instructions
      });
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      setError('Failed to load payment options');
    } finally {
      setLoading(false);
    }
  };

  const loadVendorInfo = async () => {
    try {
      const response = await axios.get(
        `${getApiUrl()}/vendor/info/${vendorId}`
      );
      // Additional vendor info if needed
    } catch (error) {
      console.error('Failed to load vendor info:', error);
    }
  };

  // Calculate totals
  const originalTotal = cart.reduce((sum, item) => sum + parseFloat(item.asking_price || 0), 0);
  const negotiatedTotal = cart.reduce((sum, item) => sum + parseFloat(item.negotiated_price || item.asking_price || 0), 0);
  const finalTotal = negotiatedTotal - bundleDiscount;
  const totalSavings = originalTotal - finalTotal;

  const updateCartPrice = (cardId, newPrice) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.card_id === cardId
          ? {
              ...item,
              negotiated_price: parseFloat(newPrice) || item.asking_price,
              discount: item.asking_price - (parseFloat(newPrice) || item.asking_price)
            }
          : item
      )
    );
    setEditingPrice(null);
  };

  const removeFromCart = (cardId) => {
    setCart(prevCart => prevCart.filter(item => item.card_id !== cardId));
  };

  const applyQuickDiscount = (percentage) => {
    const discount = (negotiatedTotal * percentage) / 100;
    setBundleDiscount(discount);
    setDiscountReason(`${percentage}% bundle discount`);
  };

  const handleCheckout = async () => {
  if (!selectedPaymentMethod) {
    setError('Please select a payment method');
    return;
  }

  if (cart.length === 0) {
    setError('Cart is empty');
    return;
  }

  setProcessing(true);
  setError('');

  try {
    // Create order (NO AUTH REQUIRED - Guest checkout)
    const orderData = {
      vendor_id: parseInt(vendorId),
      items: cart.map(item => ({
        card_id: item.card_id,
        player: item.player,
        year: item.year,
        set_name: item.set_name,
        card_number: item.card_number,
        grade: item.grade,
        grading_company: item.grading_company,
        asking_price: item.asking_price,
        negotiated_price: item.negotiated_price || item.asking_price
      })),
      bundle_discount: bundleDiscount,
      discount_reason: discountReason || 'Customer checkout',
      payment_method: selectedPaymentMethod.type,
      customer_email: customerEmail || null,
      customer_phone: customerPhone || null,
      customer_name: customerName || null
    };

    console.log('📦 Creating order...', orderData);

    // Use fetch instead of axios to bypass auth interceptors
    const response = await fetch(
      `${getApiUrl()}/orders/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create order');
    }

    const data = await response.json();
    console.log('✅ Full response:', data);

    if (!data.success) {
      throw new Error('Order creation failed');
    }

    const order = data.order;
    console.log('📋 Order object:', order);

    const orderId = order.order_id || order.order_number;
    console.log('🎯 Order ID:', orderId);

    if (!orderId) {
      console.error('❌ NO ORDER ID!', order);
      throw new Error('No order ID returned');
    }

    // Clear cart
    localStorage.removeItem('vendorCart');
    localStorage.removeItem('checkoutVendorId');

    console.log('🚀 Navigating to:', `/order-confirmation/${orderId}`);

// Store order data in sessionStorage FIRST (before navigation)
sessionStorage.setItem('pendingOrder', JSON.stringify({
  order,
  paymentMethod: selectedPaymentMethod,
  vendorInfo
}));

console.log('💾 Order data stored in sessionStorage');

// Force navigation by using window.location instead of react-router
// This bypasses any router guards that might be interfering
window.location.href = `/order-confirmation/${orderId}`;

console.log('✅ Navigation called');

  } catch (error) {
    console.error('❌ Checkout failed:', error);
    setError(error.message || 'Checkout failed. Please try again.');
  } finally {
    setProcessing(false);
  }
};

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center'>
        <div className='text-white text-xl'>Loading checkout...</div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4'>
        <div className='bg-white/10 backdrop-blur-xl rounded-2xl p-8 text-center max-w-md border border-white/20'>
          <ShoppingCart size={64} className='text-purple-400 mx-auto mb-4' />
          <h2 className='text-2xl font-bold text-white mb-2'>Cart is Empty</h2>
          <p className='text-purple-200 mb-6'>Add some cards to your cart to checkout</p>
          <button
            onClick={() => navigate(-1)}
            className='px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all'
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4'>
      <div className='max-w-4xl mx-auto'>
        
        {/* Header */}
        <div className='bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/20'>
          <button
            onClick={() => navigate(-1)}
            className='flex items-center gap-2 text-purple-300 hover:text-white mb-4 transition-colors'
          >
            <ArrowLeft size={20} />
            Back to Display
          </button>
          
          <h1 className='text-3xl font-black text-white flex items-center gap-3'>
            <ShoppingCart size={32} className='text-purple-400' />
            Checkout
          </h1>
          {vendorInfo && (
            <p className='text-purple-200 mt-2'>
              {vendorInfo.business_name || vendorInfo.vendor_name}
              {vendorInfo.booth_number && ` - Booth #${vendorInfo.booth_number}`}
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className='bg-red-500/20 border-2 border-red-400 rounded-xl p-4 mb-6 flex items-center gap-3'>
            <AlertCircle className='text-red-400' size={24} />
            <span className='text-white font-semibold'>{error}</span>
          </div>
        )}

        {/* Customer Info (Optional) */}
        <div className='bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/20'>
          <h2 className='text-xl font-bold text-white mb-4 flex items-center gap-2'>
            <User size={24} className='text-purple-400' />
            Your Info (Optional)
          </h2>
          
          <p className='text-slate-400 text-sm mb-4'>
            Provide your contact info to receive your order number and claim your cards digitally later
          </p>

          <div className='space-y-3'>
            <input
              type='text'
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder='Name (optional)'
              className='w-full px-4 py-3 bg-slate-800 text-white rounded-xl border-2 border-slate-700 focus:border-purple-500 focus:outline-none'
            />
            
            <input
              type='email'
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder='Email (optional)'
              className='w-full px-4 py-3 bg-slate-800 text-white rounded-xl border-2 border-slate-700 focus:border-purple-500 focus:outline-none'
            />
            
            <input
              type='tel'
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder='Phone (optional)'
              className='w-full px-4 py-3 bg-slate-800 text-white rounded-xl border-2 border-slate-700 focus:border-purple-500 focus:outline-none'
            />
          </div>
        </div>

        {/* Cart Items */}
        <div className='bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/20'>
          <h2 className='text-xl font-bold text-white mb-4 flex items-center gap-2'>
            <ShoppingCart size={24} className='text-purple-400' />
            Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
          </h2>

          <div className='space-y-4'>
            {cart.map((item) => (
              <div
                key={item.card_id}
                className='bg-slate-800/50 rounded-xl p-4 border border-slate-700'
              >
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex-1'>
                    <h3 className='font-bold text-white text-lg'>{item.player}</h3>
                    <p className='text-slate-400 text-sm'>
                      {item.year} {item.set_name}
                      {item.card_number && ` #${item.card_number}`}
                    </p>
                    {item.grade && (
                      <p className='text-purple-400 font-bold text-sm mt-1'>
                        {item.grading_company} {item.grade}
                      </p>
                    )}

                    {/* Price Editor */}
                    <div className='mt-3 flex items-center gap-4'>
                      <div>
                        <span className='text-xs text-slate-400'>Original:</span>
                        <p className='text-slate-500 line-through text-sm'>
                          ${parseFloat(item.asking_price).toFixed(2)}
                        </p>
                      </div>
                      
                      <div>
                        <span className='text-xs text-slate-400'>Price:</span>
                        {editingPrice === item.card_id ? (
                          <input
                            type='number'
                            step='0.01'
                            value={item.negotiated_price || item.asking_price}
                            onChange={(e) => updateCartPrice(item.card_id, e.target.value)}
                            onBlur={() => setEditingPrice(null)}
                            autoFocus
                            className='w-24 px-2 py-1 bg-slate-900 text-white border-2 border-purple-500 rounded text-lg font-bold'
                          />
                        ) : (
                          <button
                            onClick={() => setEditingPrice(item.card_id)}
                            className='flex items-center gap-2 text-white font-bold text-lg hover:text-purple-400 transition-colors'
                          >
                            ${parseFloat(item.negotiated_price || item.asking_price).toFixed(2)}
                            <Edit2 size={14} />
                          </button>
                        )}
                      </div>

                      {item.discount > 0 && (
                        <div className='text-green-400 text-sm font-bold'>
                          Save ${item.discount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.card_id)}
                    className='p-2 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-all'
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bundle Discount */}
          <div className='mt-6 pt-6 border-t border-slate-700'>
            <h3 className='text-white font-bold mb-3 flex items-center gap-2'>
              <Tag size={20} className='text-yellow-400' />
              Bundle Discount (Optional)
            </h3>
            
            <div className='flex gap-2 mb-3'>
              <button
                onClick={() => applyQuickDiscount(10)}
                className='px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-bold transition-all'
              >
                -10%
              </button>
              <button
                onClick={() => applyQuickDiscount(20)}
                className='px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-bold transition-all'
              >
                -20%
              </button>
              <button
                onClick={() => applyQuickDiscount(30)}
                className='px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-bold transition-all'
              >
                -30%
              </button>
            </div>

            <div className='flex gap-2'>
              <input
                type='number'
                step='0.01'
                value={bundleDiscount}
                onChange={(e) => setBundleDiscount(parseFloat(e.target.value) || 0)}
                placeholder='0.00'
                className='w-32 px-3 py-2 bg-slate-800 text-white border-2 border-slate-700 rounded-lg focus:border-purple-500 focus:outline-none'
              />
              <input
                type='text'
                value={discountReason}
                onChange={(e) => setDiscountReason(e.target.value)}
                placeholder='Reason (optional)'
                className='flex-1 px-3 py-2 bg-slate-800 text-white border-2 border-slate-700 rounded-lg focus:border-purple-500 focus:outline-none'
              />
            </div>
          </div>

          {/* Price Summary */}
          <div className='mt-6 pt-6 border-t border-slate-700 space-y-2'>
            <div className='flex justify-between text-slate-400'>
              <span>Subtotal:</span>
              <span>${originalTotal.toFixed(2)}</span>
            </div>
            {negotiatedTotal < originalTotal && (
              <div className='flex justify-between text-green-400'>
                <span>Negotiated Price:</span>
                <span>${negotiatedTotal.toFixed(2)}</span>
              </div>
            )}
            {bundleDiscount > 0 && (
              <div className='flex justify-between text-yellow-400'>
                <span>Bundle Discount:</span>
                <span>-${bundleDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className='flex justify-between text-2xl font-black text-white pt-2 border-t border-slate-700'>
              <span>Total:</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
            {totalSavings > 0 && (
              <div className='text-center text-green-400 font-bold text-sm'>
                🎉 You save ${totalSavings.toFixed(2)}!
              </div>
            )}
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className='bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/20'>
          <h2 className='text-xl font-bold text-white mb-4 flex items-center gap-2'>
            <CreditCard size={24} className='text-purple-400' />
            Payment Method
          </h2>

          {paymentMethods.length === 0 ? (
            <div className='text-center py-8 text-yellow-400'>
              ⚠️ Vendor hasn't configured payment methods yet
            </div>
          ) : (
            <div className='space-y-3'>
              {paymentMethods.map((method) => (
                <button
                  key={method.type}
                  onClick={() => setSelectedPaymentMethod(method)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedPaymentMethod?.type === method.type
                      ? 'bg-purple-600/30 border-purple-500'
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      {method.type === 'venmo' && <DollarSign size={24} className='text-purple-400' />}
                      {method.type === 'zelle' && <Smartphone size={24} className='text-cyan-400' />}
                      {method.type === 'cashapp' && <Wallet size={24} className='text-green-400' />}
                      {method.type === 'cash' && <DollarSign size={24} className='text-emerald-400' />}
                      <div>
                        <div className='text-white font-bold'>{method.label}</div>
                        <div className='text-slate-400 text-sm'>{method.handle}</div>
                      </div>
                    </div>
                    <span className='text-2xl'>{method.icon}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {vendorInfo?.payment_instructions && (
            <div className='mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg'>
              <p className='text-yellow-200 text-sm'>
                <strong>Instructions:</strong> {vendorInfo.payment_instructions}
              </p>
            </div>
          )}
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={!selectedPaymentMethod || processing || cart.length === 0}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            selectedPaymentMethod && !processing && cart.length > 0
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white hover:scale-105 shadow-xl'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          {processing ? (
            <span className='flex items-center justify-center gap-2'>
              <div className='animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white'></div>
              Processing...
            </span>
          ) : (
            `Complete Purchase - $${finalTotal.toFixed(2)}`
          )}
        </button>

      </div>
    </div>
  );
}