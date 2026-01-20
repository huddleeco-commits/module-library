import React, { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('customers');
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ totalCustomers: 0, totalShermCoins: 0 });
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

  const handleAddCoins = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/add-coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addCoinForm)
      });
      setAddCoinForm({ customerId: '', amount: '', reason: '' });
      fetchCustomers();
      fetchStats();
    } catch (error) {
      console.error('Error adding coins:', error);
    }
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderCustomersTab = () => (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-lg w-full max-w-md"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3 text-left">ID</th>
              <th className="border p-3 text-left">Name</th>
              <th className="border p-3 text-left">Email</th>
              <th className="border p-3 text-left">ShermCoins</th>
              <th className="border p-3 text-left">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer.id}>
                <td className="border p-3">{customer.id}</td>
                <td className="border p-3">{customer.name}</td>
                <td className="border p-3">{customer.email}</td>
                <td className="border p-3 font-semibold">{customer.balance || 0}</td>
                <td className="border p-3">{customer.last_activity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAddCoinsTab = () => (
    <div className="max-w-md">
      <form onSubmit={handleAddCoins}>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Customer</label>
          <select
            value={addCoinForm.customerId}
            onChange={(e) => setAddCoinForm({...addCoinForm, customerId: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            required
          >
            <option value="">Select customer</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name} - {customer.email}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Amount</label>
          <input
            type="number"
            value={addCoinForm.amount}
            onChange={(e) => setAddCoinForm({...addCoinForm, amount: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            required
            min="1"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Reason</label>
          <input
            type="text"
            value={addCoinForm.reason}
            onChange={(e) => setAddCoinForm({...addCoinForm, reason: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="e.g., Bonus, Promotion"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Add ShermCoins
        </button>
      </form>
    </div>
  );

  const renderStatsTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-blue-100 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Total Customers</h3>
        <p className="text-3xl font-bold text-blue-600">{stats.totalCustomers}</p>
      </div>
      <div className="bg-green-100 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Total ShermCoins Issued</h3>
        <p className="text-3xl font-bold text-green-600">{stats.totalShermCoins}</p>
      </div>
      <div className="bg-purple-100 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Active This Month</h3>
        <p className="text-3xl font-bold text-purple-600">{stats.activeThisMonth || 0}</p>
      </div>
    </div>
  );

  const tabs = [
    { id: 'customers', label: 'Customers' },
    { id: 'addCoins', label: 'Add ShermCoins' },
    { id: 'stats', label: 'Statistics' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Loyalty Admin Panel</h1>
        
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'customers' && renderCustomersTab()}
          {activeTab === 'addCoins' && renderAddCoinsTab()}
          {activeTab === 'stats' && renderStatsTab()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;