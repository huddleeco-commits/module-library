/**
 * Team Management Page
 * Manage team members, roles, and permissions
 */
import React, { useState } from 'react';
import { Users, Plus, Shield, Mail, Phone, Edit, Trash2, UserCheck, UserX } from 'lucide-react';

export default function TeamPage() {
  const [members] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active', avatar: 'JD', lastActive: '2 min ago' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Manager', status: 'active', avatar: 'JS', lastActive: '1 hour ago' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'Staff', status: 'active', avatar: 'BW', lastActive: '3 hours ago' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Staff', status: 'inactive', avatar: 'AB', lastActive: '2 days ago' },
  ]);

  const roleColors = {
    Admin: { bg: '#fae8ff', color: '#a855f7' },
    Manager: { bg: '#dbeafe', color: '#3b82f6' },
    Staff: { bg: '#f1f5f9', color: '#64748b' },
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', margin: 0 }}>Team</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>Manage team members and permissions</p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', background: '#6366f1', color: 'white',
          border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
        }}>
          <Plus size={18} /> Add Member
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: '#dcfce7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={24} style={{ color: '#16a34a' }} />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e' }}>{members.filter(m => m.status === 'active').length}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Active Members</div>
            </div>
          </div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: '#fae8ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={24} style={{ color: '#a855f7' }} />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e' }}>{members.filter(m => m.role === 'Admin').length}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Admins</div>
            </div>
          </div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: '#fee2e2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserX size={24} style={{ color: '#ef4444' }} />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e' }}>{members.filter(m => m.status === 'inactive').length}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Inactive</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Member</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Role</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Status</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Last Active</th>
              <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px', background: '#6366f1', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: '600', fontSize: '14px'
                    }}>
                      {member.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: '500', color: '#1a1a2e' }}>{member.name}</div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>{member.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '500',
                    background: roleColors[member.role].bg, color: roleColors[member.role].color
                  }}>
                    {member.role}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: '500',
                    background: member.status === 'active' ? '#dcfce7' : '#f1f5f9',
                    color: member.status === 'active' ? '#16a34a' : '#64748b'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: member.status === 'active' ? '#16a34a' : '#94a3b8' }} />
                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>{member.lastActive}</td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <button style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><Edit size={16} /></button>
                  <button style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
