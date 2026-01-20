import React, { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('customers');
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ totalCustomers: 0, totalShermCoin: 0 });
  const [addCoinForm, setAddCoinForm] = useState({ customerId: '', amount: '' });

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
      await fetch('/api/add-shermcoin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addCoinForm)
      });
      setAddCoinForm({ customerId: '', amount: '' });
      fetchCustomers();
      fetchStats();
    } catch (error) {
      console.error('Error adding ShermCoin:', error);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      
      <div className="tabs">
        <button 
          className={activeTab === 'customers' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('customers')}
        >
          Customers
        </button>
        <button 
          className={activeTab === 'addcoin' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('addcoin')}
        >
          Add ShermCoin
        </button>
        <button 
          className={activeTab === 'stats' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('stats')}
        >
          Stats
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'customers' && (
          <div className="customers-tab">
            <h2>Customers</h2>
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <table className="customers-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>ShermCoin Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <tr key={customer.id}>
                    <td>{customer.id}</td>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.shermcoin_balance || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'addcoin' && (
          <div className="addcoin-tab">
            <h2>Add ShermCoin</h2>
            <form onSubmit={handleAddShermCoin} className="addcoin-form">
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
              <button type="submit" className="submit-btn">Add ShermCoin</button>
            </form>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="stats-tab">
            <h2>Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Customers</h3>
                <div className="stat-value">{stats.totalCustomers}</div>
              </div>
              <div className="stat-card">
                <h3>Total ShermCoin in Circulation</h3>
                <div className="stat-value">{stats.totalShermCoin}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-panel {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        .tabs {
          display: flex;
          border-bottom: 2px solid #ddd;
          margin-bottom: 20px;
        }
        .tab {
          padding: 12px 24px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 16px;
          border-bottom: 3px solid transparent;
        }
        .tab.active {
          border-bottom-color: #007bff;
          color: #007bff;
        }
        .search-input {
          width: 300px;
          padding: 8px;
          margin-bottom: 20px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .customers-table {
          width: 100%;
          border-collapse: collapse;
        }
        .customers-table th,
        .customers-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        .customers-table th {
          background-color: #f8f9fa;
        }
        .addcoin-form {
          max-width: 400px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        .form-group input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .submit-btn {
          background-color: #007bff;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        .stat-card {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 8px;
          text-align: center;
        }
        .stat-value {
          font-size: 2em;
          font-weight: bold;
          color: #007bff;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;