// backend/routes/kids-banking.js - Kids Banking API Routes
const express = require('express');
const router = express.Router();
const famcoinEngine = require('../services/famcoinEngine');

// In-memory storage (replace with database later)
let bankingAccounts = {};
let pendingPurchases = [];

// Initialize account if doesn't exist
function initializeAccount(memberId, memberData = {}) {
  if (!bankingAccounts[memberId]) {
    // Auto-detect Cline family members
    if (!memberData.name && memberId.includes('cline')) {
      const clineMembers = {
        'adam-cline': { name: 'Adam', age: 42, role: 'Parent' },
        'sheila-cline': { name: 'Sheila', age: 39, role: 'Parent' },
        'liam-cline': { name: 'Liam', age: 8, role: 'Child' },
        'sorara-cline': { name: 'Sorara', age: 6, role: 'Child' }
      };
      memberData = clineMembers[memberId] || memberData;
    }
    
    bankingAccounts[memberId] = famcoinEngine.initializeBankingAccounts(memberId, memberData);
    console.log(`💰 Initialized banking account for: ${bankingAccounts[memberId].memberName}`);
  }
  return bankingAccounts[memberId];
}

// GET /api/platforms/kids-banking/:familyId - Get all family banking accounts
router.get('/:familyId', (req, res) => {
  const { familyId } = req.params;
  
  // Initialize Cline family for testing
  if (familyId === 'cline-family-2025') {
    initializeAccount('adam-cline');
    initializeAccount('sheila-cline');
    initializeAccount('liam-cline');
    initializeAccount('sorara-cline');
  }
  
  const accounts = Object.values(bankingAccounts);
  const totalFamilyBalance = accounts.reduce((sum, acc) => sum + acc.totalBalance, 0);
  
  console.log(`💰 Fetching ${accounts.length} banking accounts for family ${familyId}`);
  
  res.json({
    success: true,
    accounts,
    familyStats: {
      totalBalance: totalFamilyBalance,
      totalBalanceUSD: famcoinEngine.famCoinsToUSD(totalFamilyBalance),
      totalMembers: accounts.length
    }
  });
});

// GET /api/platforms/kids-banking/account/:memberId - Get individual account
router.get('/account/:memberId', (req, res) => {
  const account = initializeAccount(req.params.memberId);
  
  res.json({
    success: true,
    account
  });
});

// POST /api/platforms/kids-banking/earn - Award FamCoins for action
router.post('/earn', (req, res) => {
  const { memberId, action, customAmount, metadata } = req.body;
  
  const account = initializeAccount(memberId);
  const result = famcoinEngine.awardFamCoins(account, action, customAmount, metadata);
  
  console.log(`💰 ${account.memberName} earned ${result.transaction.netAmount} FamCoins for ${action}`);
  
  // Broadcast via WebSocket
  const io = req.app.get('io');
  if (io) {
    io.emit('famcoin_earned', {
      memberId,
      memberName: account.memberName,
      action,
      amount: result.transaction.netAmount,
      amountUSD: famcoinEngine.famCoinsToUSD(result.transaction.netAmount),
      newBalance: result.newBalance,
      distribution: result.distribution,
      receipt: result.receipt,
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    success: true,
    ...result,
    account
  });
});

// POST /api/platforms/kids-banking/transfer - Transfer between accounts
router.post('/transfer', (req, res) => {
  const { memberId, fromAccount, toAccount, amount } = req.body;
  
  const account = initializeAccount(memberId);
  const result = famcoinEngine.transferBetweenAccounts(account, fromAccount, toAccount, amount);
  
  if (result.success) {
    console.log(`💸 ${account.memberName} transferred ${amount} FC from ${fromAccount} to ${toAccount}`);
    
    // Broadcast
    const io = req.app.get('io');
    if (io) {
      io.emit('famcoin_transfer', {
        memberId,
        memberName: account.memberName,
        ...result,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  res.json({
    ...result,
    account
  });
});

// POST /api/platforms/kids-banking/purchase/request - Request purchase
router.post('/purchase/request', (req, res) => {
  const { memberId, item, amount, category, fromAccount } = req.body;
  
  const account = initializeAccount(memberId);
  const result = famcoinEngine.requestPurchase(account, {
    item,
    amount,
    fromAccount,
    category
  });
  
  if (result.success) {
    if (result.needsApproval) {
      pendingPurchases.push(result.purchase);
      console.log(`🛒 ${account.memberName} requested purchase: ${item} for ${amount} FC (Pending Approval)`);
      
      // Notify parents
      const io = req.app.get('io');
      if (io) {
        io.emit('purchase_request', {
          purchase: result.purchase,
          memberName: account.memberName,
          timestamp: new Date().toISOString()
        });
      }
    } else {
      console.log(`🛒 ${account.memberName} auto-approved purchase: ${item} for ${amount} FC`);
    }
  }
  
  res.json({
    ...result,
    account
  });
});

// POST /api/platforms/kids-banking/purchase/approve - Approve purchase (parent)
router.post('/purchase/approve', (req, res) => {
  const { purchaseId, approverName } = req.body;
  
  const purchaseIndex = pendingPurchases.findIndex(p => p.id === purchaseId);
  
  if (purchaseIndex === -1) {
    return res.status(404).json({ success: false, error: 'Purchase not found' });
  }
  
  const purchase = pendingPurchases[purchaseIndex];
  const account = bankingAccounts[purchase.memberId];
  
  const result = famcoinEngine.approvePurchase(account, purchase, approverName);
  
  if (result.success) {
    pendingPurchases.splice(purchaseIndex, 1);
    console.log(`✅ ${approverName} approved purchase: ${purchase.item} for ${account.memberName}`);
    
    // Broadcast
    const io = req.app.get('io');
    if (io) {
      io.emit('purchase_approved', {
        purchase: result.purchase,
        memberName: account.memberName,
        approverName,
        receipt: result.receipt,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  res.json({
    ...result,
    account
  });
});

// POST /api/platforms/kids-banking/purchase/deny - Deny purchase (parent)
router.post('/purchase/deny', (req, res) => {
  const { purchaseId, reason } = req.body;
  
  const purchaseIndex = pendingPurchases.findIndex(p => p.id === purchaseId);
  
  if (purchaseIndex === -1) {
    return res.status(404).json({ success: false, error: 'Purchase not found' });
  }
  
  const purchase = pendingPurchases.splice(purchaseIndex, 1)[0];
  purchase.status = 'denied';
  purchase.deniedReason = reason;
  
  console.log(`❌ Purchase denied: ${purchase.item} for ${purchase.memberName}`);
  
  // Broadcast
  const io = req.app.get('io');
  if (io) {
    io.emit('purchase_denied', {
      purchase,
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    success: true,
    purchase
  });
});

// GET /api/platforms/kids-banking/purchases/pending - Get pending purchases
router.get('/purchases/pending', (req, res) => {
  res.json({
    success: true,
    purchases: pendingPurchases
  });
});

// POST /api/platforms/kids-banking/withdraw - Withdraw to real money
router.post('/withdraw', (req, res) => {
  const { memberId, amount, method, purpose } = req.body;
  
  const account = initializeAccount(memberId);
  const result = famcoinEngine.withdrawToRealMoney(account, amount, {
    method,
    purpose
  });
  
  if (result.success) {
    console.log(`💵 ${account.memberName} withdrew ${amount} FC ($${result.amountUSD})`);
    
    // Broadcast
    const io = req.app.get('io');
    if (io) {
      io.emit('famcoin_withdrawal', {
        memberId,
        memberName: account.memberName,
        ...result,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  res.json({
    ...result,
    account
  });
});

// POST /api/platforms/kids-banking/deposit - Parent deposits FamCoins
router.post('/deposit', (req, res) => {
  const { memberId, amount, toAccount, reason, parentName } = req.body;
  
  const account = initializeAccount(memberId);
  const result = famcoinEngine.depositFamCoins(account, amount, {
    toAccount,
    reason,
    parentName
  });
  
  console.log(`💰 ${parentName} deposited ${amount} FC to ${account.memberName}'s ${toAccount} account`);
  
  // Broadcast
  const io = req.app.get('io');
  if (io) {
    io.emit('famcoin_deposit', {
      memberId,
      memberName: account.memberName,
      ...result,
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    ...result,
    account
  });
});

// POST /api/platforms/kids-banking/interest - Apply savings interest
router.post('/interest/:memberId', (req, res) => {
  const account = initializeAccount(req.params.memberId);
  const result = famcoinEngine.applySavingsInterest(account);
  
  if (result.success) {
    console.log(`📈 ${account.memberName} earned ${result.interestEarned} FC in savings interest`);
  }
  
  res.json({
    ...result,
    account
  });
});

// GET /api/platforms/kids-banking/transactions/:memberId - Get transaction history
router.get('/transactions/:memberId', (req, res) => {
  const account = initializeAccount(req.params.memberId);
  const limit = parseInt(req.query.limit) || 50;
  
  res.json({
    success: true,
    transactions: account.transactions.slice(0, limit),
    total: account.transactions.length
  });
});

// GET /api/platforms/kids-banking/receipts/:memberId - Get receipts
router.get('/receipts/:memberId', (req, res) => {
  const account = initializeAccount(req.params.memberId);
  const limit = parseInt(req.query.limit) || 50;
  
  res.json({
    success: true,
    receipts: account.receipts.slice(0, limit),
    total: account.receipts.length
  });
});

// PUT /api/platforms/kids-banking/settings/:memberId - Update account settings
router.put('/settings/:memberId', (req, res) => {
  const account = initializeAccount(req.params.memberId);
  
  // Update settings
  Object.assign(account.settings, req.body);
  
  console.log(`⚙️ Updated settings for ${account.memberName}`);
  
  res.json({
    success: true,
    account
  });
});

// Helper function for other routes to access accounts
router.getAccountSync = (memberId) => {
  // Auto-initialize if doesn't exist
  if (!bankingAccounts[memberId]) {
    // Auto-detect Cline family members
    if (memberId.includes('cline')) {
      const clineMembers = {
        'adam-cline': { name: 'Adam', age: 42, role: 'Parent' },
        'sheila-cline': { name: 'Sheila', age: 39, role: 'Parent' },
        'liam-cline': { name: 'Liam', age: 8, role: 'Child' },
        'sorara-cline': { name: 'Sorara', age: 6, role: 'Child' }
      };
      const memberData = clineMembers[memberId];
      if (memberData) {
        return initializeAccount(memberId, memberData);
      }
    }
  }
  return bankingAccounts[memberId] || null;
};

module.exports = router;