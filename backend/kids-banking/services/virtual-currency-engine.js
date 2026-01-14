// backend/services/famcoinEngine.js - Revolutionary Kids Banking System
class FamCoinEngine {
  constructor() {
    // 1 FamCoin = $0.01 USD (100 FamCoins = $1)
    this.FAMCOIN_TO_USD = 0.01;
    
    // Account types
    this.accountTypes = ['spending', 'savings', 'investing', 'charity'];
    
    // Default auto-split percentages
    this.defaultSplit = {
      spending: 50,
      savings: 30,
      investing: 10,
      charity: 10
    };
    
    // Age-appropriate modes
    this.ageModes = {
      simple: { minAge: 4, maxAge: 7 },
      standard: { minAge: 8, maxAge: 12 },
      advanced: { minAge: 13, maxAge: 18 }
    };
    
    // Earning rates per activity (in FamCoins)
    this.earningRates = {
      // Tasks
      task_complete: 50,
      chore_complete: 25,
      homework_complete: 75,
      
      // Reading
      book_chapter: 10,
      book_finished: 200,
      reading_30min: 30,
      
      // Sports
      practice_attend: 100,
      game_attend: 150,
      
      // Music
      practice_30min: 75,
      performance: 300,
      
      // Life Progress
      level_up: 500,
      achievement: 250,
      perfect_day: 1000,
      
      // Social
      family_time: 50,
      help_sibling: 40,
      
      // Special
      good_grades: 500,
      weekly_allowance: 1000 // $10/week default
    };
  }
  
  // Initialize member's banking accounts
  initializeBankingAccounts(memberId, memberData = {}) {
    const age = memberData.age || 10;
    const mode = this.getAgeMode(age);
    
    const accounts = {
      memberId,
      memberName: memberData.name || 'Member',
      age,
      mode,
      totalBalance: 0,
      
      // Individual account balances
      balances: {
        spending: 0,
        savings: 0,
        investing: 0,
        charity: 0
      },
      
      // Account settings
      settings: {
        autoSplit: { ...this.defaultSplit },
        interestRate: memberData.interestRate || 5, // 5% monthly on savings
        taxRate: memberData.taxRate || 0, // 0% default, parents can enable
        spendingLimit: memberData.spendingLimit || null,
        requireApproval: memberData.requireApproval !== false,
        autoApproveUnder: memberData.autoApproveUnder || 500 // $5
      },
      
      // Transaction history
      transactions: [],
      receipts: [],
      
      // Goals
      savingsGoals: [],
      
      // Stats
      stats: {
        totalEarned: 0,
        totalSpent: 0,
        totalSaved: 0,
        totalDonated: 0,
        totalTaxesPaid: 0
      },
      
      createdAt: new Date().toISOString()
    };
    
    // Simplify for young kids
    if (mode === 'simple') {
      accounts.balances = { spending: 0 };
      accounts.settings.autoSplit = { spending: 100 };
    }
    
    return accounts;
  }
  
  // Determine age mode
  getAgeMode(age) {
    if (age >= 13) return 'advanced';
    if (age >= 8) return 'standard';
    return 'simple';
  }
  
  // Award FamCoins for an action
  awardFamCoins(accounts, action, customAmount = null, metadata = {}) {
    const amount = customAmount || this.earningRates[action] || 10;
    
    // Apply taxes if enabled
    const taxRate = accounts.settings.taxRate / 100;
    const taxAmount = Math.floor(amount * taxRate);
    const netAmount = amount - taxAmount;
    
    // Split into accounts based on settings
    const split = accounts.settings.autoSplit;
    const distribution = {};
    
    Object.keys(accounts.balances).forEach(accountType => {
      const percentage = split[accountType] || 0;
      const accountAmount = Math.floor((netAmount * percentage) / 100);
      distribution[accountType] = accountAmount;
      accounts.balances[accountType] += accountAmount;
    });
    
    // Update total balance
    accounts.totalBalance += netAmount;
    accounts.stats.totalEarned += netAmount;
    accounts.stats.totalTaxesPaid += taxAmount;
    
    // Create transaction record
    const transaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'earning',
      action,
      grossAmount: amount,
      taxAmount,
      netAmount,
      distribution,
      metadata,
      timestamp: new Date().toISOString()
    };
    
    accounts.transactions.unshift(transaction);
    
    // Generate receipt
    const receipt = this.generateReceipt(accounts, transaction, 'earning');
    accounts.receipts.unshift(receipt);
    
    return {
      success: true,
      transaction,
      receipt,
      newBalance: accounts.totalBalance,
      distribution
    };
  }
  
  // Transfer between accounts
  transferBetweenAccounts(accounts, fromAccount, toAccount, amount) {
    if (accounts.balances[fromAccount] < amount) {
      return {
        success: false,
        error: 'Insufficient funds'
      };
    }
    
    accounts.balances[fromAccount] -= amount;
    accounts.balances[toAccount] += amount;
    
    const transaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'transfer',
      from: fromAccount,
      to: toAccount,
      amount,
      timestamp: new Date().toISOString()
    };
    
    accounts.transactions.unshift(transaction);
    
    const receipt = this.generateReceipt(accounts, transaction, 'transfer');
    accounts.receipts.unshift(receipt);
    
    return {
      success: true,
      transaction,
      receipt,
      newBalances: accounts.balances
    };
  }
  
  // Request purchase (spending FamCoins)
  requestPurchase(accounts, purchaseData) {
    const {
      item,
      amount,
      fromAccount = 'spending',
      category,
      needsApproval = true
    } = purchaseData;
    
    // Check if enough funds
    if (accounts.balances[fromAccount] < amount) {
      return {
        success: false,
        error: 'Insufficient funds',
        balance: accounts.balances[fromAccount],
        needed: amount
      };
    }
    
    // Check if auto-approve
    const autoApprove = !accounts.settings.requireApproval || 
                        amount <= accounts.settings.autoApproveUnder;
    
    const purchase = {
      id: `pur-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      memberId: accounts.memberId,
      memberName: accounts.memberName,
      item,
      amount,
      amountUSD: this.famCoinsToUSD(amount),
      fromAccount,
      category,
      status: autoApprove ? 'approved' : 'pending',
      autoApproved: autoApprove,
      requestedAt: new Date().toISOString(),
      approvedAt: autoApprove ? new Date().toISOString() : null,
      approvedBy: autoApprove ? 'AUTO' : null
    };
    
    // If auto-approved, process immediately
    if (autoApprove) {
      return this.approvePurchase(accounts, purchase);
    }
    
    return {
      success: true,
      purchase,
      needsApproval: true
    };
  }
  
  // Approve purchase
  approvePurchase(accounts, purchase, approverName = 'Parent') {
    accounts.balances[purchase.fromAccount] -= purchase.amount;
    accounts.totalBalance -= purchase.amount;
    accounts.stats.totalSpent += purchase.amount;
    
    purchase.status = 'approved';
    purchase.approvedAt = new Date().toISOString();
    purchase.approvedBy = approverName;
    
    const transaction = {
      id: purchase.id,
      type: 'purchase',
      item: purchase.item,
      amount: purchase.amount,
      fromAccount: purchase.fromAccount,
      category: purchase.category,
      approvedBy: approverName,
      timestamp: new Date().toISOString()
    };
    
    accounts.transactions.unshift(transaction);
    
    const receipt = this.generateReceipt(accounts, transaction, 'purchase');
    accounts.receipts.unshift(receipt);
    
    return {
      success: true,
      purchase,
      transaction,
      receipt,
      newBalance: accounts.totalBalance
    };
  }
  
  // Withdraw FamCoins to real money
  withdrawToRealMoney(accounts, amount, withdrawalData) {
    if (accounts.balances.spending < amount) {
      return {
        success: false,
        error: 'Insufficient funds in spending account'
      };
    }
    
    accounts.balances.spending -= amount;
    accounts.totalBalance -= amount;
    
    const usdAmount = this.famCoinsToUSD(amount);
    
    const transaction = {
      id: `wth-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'withdrawal',
      amount,
      amountUSD: usdAmount,
      method: withdrawalData.method || 'cash',
      purpose: withdrawalData.purpose,
      timestamp: new Date().toISOString()
    };
    
    accounts.transactions.unshift(transaction);
    
    const receipt = this.generateReceipt(accounts, transaction, 'withdrawal');
    accounts.receipts.unshift(receipt);
    
    return {
      success: true,
      transaction,
      receipt,
      amountUSD: usdAmount,
      newBalance: accounts.totalBalance
    };
  }
  
  // Parent deposits FamCoins
  depositFamCoins(accounts, amount, depositData) {
    const toAccount = depositData.toAccount || 'spending';
    
    accounts.balances[toAccount] += amount;
    accounts.totalBalance += amount;
    
    const transaction = {
      id: `dep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'deposit',
      amount,
      amountUSD: this.famCoinsToUSD(amount),
      toAccount,
      reason: depositData.reason,
      depositedBy: depositData.parentName,
      timestamp: new Date().toISOString()
    };
    
    accounts.transactions.unshift(transaction);
    
    const receipt = this.generateReceipt(accounts, transaction, 'deposit');
    accounts.receipts.unshift(receipt);
    
    return {
      success: true,
      transaction,
      receipt,
      newBalance: accounts.totalBalance
    };
  }
  
  // Apply interest to savings
  applySavingsInterest(accounts) {
    const savingsBalance = accounts.balances.savings;
    const interestRate = accounts.settings.interestRate / 100;
    const interestEarned = Math.floor(savingsBalance * interestRate);
    
    if (interestEarned > 0) {
      accounts.balances.savings += interestEarned;
      accounts.totalBalance += interestEarned;
      accounts.stats.totalEarned += interestEarned;
      
      const transaction = {
        id: `int-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'interest',
        amount: interestEarned,
        rate: accounts.settings.interestRate,
        principal: savingsBalance,
        timestamp: new Date().toISOString()
      };
      
      accounts.transactions.unshift(transaction);
      
      const receipt = this.generateReceipt(accounts, transaction, 'interest');
      accounts.receipts.unshift(receipt);
      
      return {
        success: true,
        interestEarned,
        newSavingsBalance: accounts.balances.savings
      };
    }
    
    return { success: false, message: 'No interest earned' };
  }
  
  // Generate receipt
  generateReceipt(accounts, transaction, type) {
    const receiptNumber = `RCT-${accounts.memberId.substring(0, 3).toUpperCase()}-${Date.now()}`;
    
    return {
      receiptNumber,
      transactionId: transaction.id,
      type,
      memberName: accounts.memberName,
      memberId: accounts.memberId,
      transaction,
      balances: { ...accounts.balances },
      totalBalance: accounts.totalBalance,
      timestamp: new Date().toISOString()
    };
  }
  
  // Convert FamCoins to USD
  famCoinsToUSD(famCoins) {
    return (famCoins * this.FAMCOIN_TO_USD).toFixed(2);
  }
  
  // Convert USD to FamCoins
  usdToFamCoins(usd) {
    return Math.floor(usd / this.FAMCOIN_TO_USD);
  }
  
  // Format FamCoin display
  formatFamCoins(amount) {
    return `${amount.toLocaleString()} FC ($${this.famCoinsToUSD(amount)})`;
  }
}

// Singleton instance
const famcoinEngine = new FamCoinEngine();

module.exports = famcoinEngine;