import React, { useState } from 'react';
import { FileText, Plus, Edit, Trash2, Eye, Search } from 'lucide-react';

const mockContent = [
  { id: 1, title: 'Welcome Message', type: 'page', status: 'published', updated: '2024-01-15' },
  { id: 2, title: 'About Us', type: 'page', status: 'published', updated: '2024-01-14' },
  { id: 3, title: 'Menu Specials', type: 'section', status: 'draft', updated: '2024-01-13' },
  { id: 4, title: 'Contact Information', type: 'page', status: 'published', updated: '2024-01-12' },
  { id: 5, title: 'Holiday Hours', type: 'announcement', status: 'scheduled', updated: '2024-01-11' },
];

export default function ContentPage() {
  const [content] = useState(mockContent);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContent = content.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Content</h1>
          <p className="page-subtitle">Manage your website content</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} />
          New Content
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="content-list">
          {filteredContent.map(item => (
            <div key={item.id} className="content-item">
              <div className="content-icon">
                <FileText size={20} />
              </div>
              <div className="content-details">
                <h3 className="content-title">{item.title}</h3>
                <div className="content-meta">
                  <span className="content-type">{item.type}</span>
                  <span className="content-date">Updated {item.updated}</span>
                </div>
              </div>
              <span className={`status-badge ${item.status}`}>{item.status}</span>
              <div className="content-actions">
                <button className="btn-icon" title="View">
                  <Eye size={18} />
                </button>
                <button className="btn-icon" title="Edit">
                  <Edit size={18} />
                </button>
                <button className="btn-icon danger" title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
