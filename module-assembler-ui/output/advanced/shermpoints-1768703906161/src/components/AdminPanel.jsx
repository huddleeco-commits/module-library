import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('customers');
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ totalCustomers: 0, totalShermCoin: 0, avgBalance: 0 });
  const [addCoinForm, setAddCoinForm] = useState({ customerId: '', amount: '', reason: '' });

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddShermCoin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/add-shermcoin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addCoinForm)
      });
      if (response.ok) {
        setAddCoinForm({ customerId: '', amount: '', reason: '' });
        fetchCustomers();
        fetchStats();
      }
    } catch (error) {
      console.error('Error adding ShermCoin:', error);
    }
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <h1>ShermCoin Admin Panel</h1>
      </header>
      
      <nav className="admin-nav">
        <button 
          className={activeTab === 'customers' ? 'active' : ''}
          onClick={() => setActiveTab('customers')}
        >
          Customers
        </button>
        <button 
          className={activeTab === 'add-coin' ? 'active' : ''}
          onClick={() => setActiveTab('add-coin')}
        >
          Add ShermCoin
        </button>
        <button 
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
      </nav>

      <main className="admin-content">
        {activeTab === 'customers' && (
          <div className="customers-tab">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <table className="customers-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>ShermCoin Balance</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <tr key={customer.id}>
                    <td>{customer.id}</td>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.balance || 0}</td>
                    <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'add-coin' && (
          <div className="add-coin-tab">
            <form onSubmit={handleAddShermCoin} className="add-coin-form">
              <h2>Add ShermCoin to Customer</h2>
              <div className="form-group">
                <label>Customer ID:</label>
                <input
                  type="number"
                  value={addCoinForm.customerId}
                  onChange={(e) => setAddCoinForm({...addCoinForm, customerId: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Amount:</label>
                <input
                  type="number"
                  step="0.01"
                  value={addCoinForm.amount}
                  onChange={(e) => setAddCoinForm({...addCoinForm, amount: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Reason:</label>
                <input
                  type="text"
                  value={addCoinForm.reason}
                  onChange={(e) => setAddCoinForm({...addCoinForm, reason: e.target.value})}
                  placeholder="Bonus, purchase, etc."
                  required
                />
              </div>
              <button type="submit">Add ShermCoin</button>
            </form>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="stats-tab">
            <h2>Platform Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Customers</h3>
                <div className="stat-value">{stats.totalCustomers}</div>
              </div>
              <div className="stat-card">
                <h3>Total ShermCoin Issued</h3>
                <div className="stat-value">{stats.totalShermCoin}</div>
              </div>
              <div className="stat-card">
                <h3>Average Balance</h3>
                <div className="stat-value">{stats.avgBalance}</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;