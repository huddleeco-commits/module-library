import React, { useState } from 'react';
import { Users, Search, Mail, Phone, MapPin, MoreVertical, Plus } from 'lucide-react';

const mockCustomers = [
  { id: 1, name: 'John Smith', email: 'john@example.com', phone: '(555) 123-4567', orders: 12, spent: 450.00, status: 'active' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', phone: '(555) 234-5678', orders: 8, spent: 320.00, status: 'active' },
  { id: 3, name: 'Mike Wilson', email: 'mike@example.com', phone: '(555) 345-6789', orders: 5, spent: 180.00, status: 'inactive' },
  { id: 4, name: 'Emily Brown', email: 'emily@example.com', phone: '(555) 456-7890', orders: 15, spent: 680.00, status: 'active' },
  { id: 5, name: 'David Lee', email: 'david@example.com', phone: '(555) 567-8901', orders: 3, spent: 95.00, status: 'active' },
];

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers] = useState(mockCustomers);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage your customer base</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer.id}>
                  <td>
                    <div className="customer-info">
                      <div className="avatar">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="customer-name">{customer.name}</div>
                        <div className="customer-email">{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <Phone size={14} />
                      {customer.phone}
                    </div>
                  </td>
                  <td>{customer.orders}</td>
                  <td>${customer.spent.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${customer.status}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-icon">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
