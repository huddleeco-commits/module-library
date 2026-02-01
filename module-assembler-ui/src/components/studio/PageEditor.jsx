/**
 * Page Editor Component
 * Business info form and page customization
 */

import React, { useState } from 'react';
import { PAGE_NAMES } from '../../constants/page-packages';

export default function PageEditor({ config, onUpdateBusinessInfo, onUpdatePages }) {
  const [activeTab, setActiveTab] = useState('business');

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '250px 1fr',
      gap: '24px'
    }}>
      {/* Sidebar Tabs */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '8px',
        height: 'fit-content',
        position: 'sticky',
        top: '100px'
      }}>
        <TabButton
          active={activeTab === 'business'}
          onClick={() => setActiveTab('business')}
          icon="🏢"
          label="Business Info"
        />
        <TabButton
          active={activeTab === 'pages'}
          onClick={() => setActiveTab('pages')}
          icon="📄"
          label="Pages"
          badge={config.pages.length}
        />
        <TabButton
          active={activeTab === 'content'}
          onClick={() => setActiveTab('content')}
          icon="✏️"
          label="Content"
        />
      </div>

      {/* Main Content */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px'
      }}>
        {activeTab === 'business' && (
          <BusinessInfoForm
            info={config.businessInfo}
            onChange={onUpdateBusinessInfo}
          />
        )}

        {activeTab === 'pages' && (
          <PageManager
            selectedPages={config.pages}
            industry={config.industry}
            packageType={config.package}
            onChange={onUpdatePages}
          />
        )}

        {activeTab === 'content' && (
          <ContentPreview config={config} />
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, badge }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '14px 16px',
        backgroundColor: active ? '#EEF2FF' : 'transparent',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '4px',
        transition: 'all 0.2s'
      }}
    >
      <span style={{ fontSize: '18px' }}>{icon}</span>
      <span style={{
        fontWeight: active ? '600' : '500',
        color: active ? '#6366F1' : '#64748B',
        flex: 1,
        textAlign: 'left'
      }}>
        {label}
      </span>
      {badge && (
        <span style={{
          backgroundColor: active ? '#6366F1' : '#E2E8F0',
          color: active ? 'white' : '#64748B',
          padding: '2px 8px',
          borderRadius: '10px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}

function BusinessInfoForm({ info, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...info, [field]: value });
  };

  return (
    <div>
      <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
        Business Information
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <FormField
          label="Business Name"
          required
          value={info.name}
          onChange={(v) => handleChange('name', v)}
          placeholder="e.g., Iron Peak Fitness"
        />

        <FormField
          label="Tagline / Slogan"
          value={info.tagline}
          onChange={(v) => handleChange('tagline', v)}
          placeholder="e.g., Push Your Limits. Exceed Your Goals."
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField
            label="Phone Number"
            value={info.phone}
            onChange={(v) => handleChange('phone', v)}
            placeholder="(555) 123-4567"
          />

          <FormField
            label="Email Address"
            type="email"
            value={info.email}
            onChange={(v) => handleChange('email', v)}
            placeholder="info@yourbusiness.com"
          />
        </div>

        <FormField
          label="Address"
          value={info.address}
          onChange={(v) => handleChange('address', v)}
          placeholder="123 Main St, City, State 12345"
        />

        <FormField
          label="About / Description"
          multiline
          value={info.description}
          onChange={(v) => handleChange('description', v)}
          placeholder="Tell us about your business..."
        />
      </div>
    </div>
  );
}

function FormField({ label, required, value, onChange, placeholder, type = 'text', multiline }) {
  const inputStyles = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    fontSize: '15px',
    transition: 'border-color 0.2s',
    outline: 'none'
  };

  return (
    <div>
      <label style={{
        display: 'block',
        marginBottom: '6px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151'
      }}>
        {label}
        {required && <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>}
      </label>
      {multiline ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          style={{ ...inputStyles, resize: 'vertical' }}
        />
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={inputStyles}
        />
      )}
    </div>
  );
}

function PageManager({ selectedPages, industry, packageType, onChange }) {
  const allPages = Object.keys(PAGE_NAMES);

  const togglePage = (page) => {
    if (selectedPages.includes(page)) {
      onChange(selectedPages.filter(p => p !== page));
    } else {
      onChange([...selectedPages, page]);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
          Manage Pages
        </h3>
        <span style={{ color: '#64748B', fontSize: '14px' }}>
          {selectedPages.length} pages selected
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '12px'
      }}>
        {allPages.map(page => (
          <div
            key={page}
            onClick={() => togglePage(page)}
            style={{
              padding: '14px 16px',
              backgroundColor: selectedPages.includes(page) ? '#EEF2FF' : '#F8FAFC',
              border: selectedPages.includes(page) ? '2px solid #6366F1' : '2px solid transparent',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s'
            }}
          >
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              backgroundColor: selectedPages.includes(page) ? '#6366F1' : '#E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px'
            }}>
              {selectedPages.includes(page) && '✓'}
            </div>
            <span style={{
              fontWeight: selectedPages.includes(page) ? '600' : '500',
              color: selectedPages.includes(page) ? '#6366F1' : '#64748B',
              fontSize: '14px'
            }}>
              {PAGE_NAMES[page] || page}
            </span>
          </div>
        ))}
      </div>

      <p style={{
        marginTop: '20px',
        padding: '12px 16px',
        backgroundColor: '#FEF3C7',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#92400E'
      }}>
        💡 Tip: The home page is always included. Add or remove pages based on your needs.
      </p>
    </div>
  );
}

function ContentPreview({ config }) {
  return (
    <div>
      <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
        Content Preview
      </h3>

      <div style={{
        padding: '24px',
        backgroundColor: '#F8FAFC',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#64748B', marginBottom: '16px' }}>
          AI will generate custom content based on your selections.
        </p>
        <div style={{
          display: 'inline-flex',
          gap: '8px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {config.pages.map(page => (
            <span
              key={page}
              style={{
                padding: '6px 12px',
                backgroundColor: 'white',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#64748B',
                border: '1px solid #E2E8F0'
              }}
            >
              {PAGE_NAMES[page] || page}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
