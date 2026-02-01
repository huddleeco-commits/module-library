import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, Plus, Edit2, Trash2, ChevronLeft, ChevronRight,
  Twitter, Linkedin, Instagram, Facebook, FileText, Mail,
  Check, X, Loader2, Filter, BarChart3, RefreshCw
} from 'lucide-react';

const styles = {
  container: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px'
  },
  header: {
    marginBottom: '24px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b'
  },
  tabsContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '12px'
  },
  tab: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  },
  tabActive: {
    background: '#6366f1',
    color: '#fff'
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '24px'
  },
  calendarSection: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  calendarTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a1a2e'
  },
  calendarNav: {
    display: 'flex',
    gap: '8px'
  },
  navButton: {
    padding: '8px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px'
  },
  dayHeader: {
    padding: '8px',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase'
  },
  dayCell: {
    minHeight: '80px',
    padding: '8px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative'
  },
  dayCellToday: {
    border: '2px solid #6366f1'
  },
  dayCellSelected: {
    background: '#f0f0ff'
  },
  dayCellOtherMonth: {
    background: '#f8fafc',
    opacity: 0.5
  },
  dayNumber: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1a1a2e',
    marginBottom: '4px'
  },
  dayEntries: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  dayEntry: {
    fontSize: '10px',
    padding: '2px 4px',
    borderRadius: '4px',
    color: '#fff',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  moreEntries: {
    fontSize: '10px',
    color: '#64748b',
    marginTop: '2px'
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  formTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    minHeight: '100px',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#fff',
    cursor: 'pointer'
  },
  platformGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px'
  },
  platformButton: {
    padding: '12px 8px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s',
    fontSize: '11px',
    color: '#64748b'
  },
  platformButtonSelected: {
    border: '2px solid #6366f1',
    background: '#f0f0ff',
    color: '#6366f1'
  },
  dateTimeRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  button: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    background: '#6366f1',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  },
  buttonSecondary: {
    background: '#f1f5f9',
    color: '#64748b'
  },
  buttonDanger: {
    background: '#fee2e2',
    color: '#dc2626'
  },
  buttonRow: {
    display: 'flex',
    gap: '8px'
  },
  statsCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px'
  },
  statItem: {
    padding: '12px',
    borderRadius: '8px',
    background: '#f8fafc',
    textAlign: 'center'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a2e'
  },
  statLabel: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px'
  },
  listSection: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  listTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a2e'
  },
  scheduleItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    marginBottom: '12px',
    transition: 'all 0.2s'
  },
  scheduleItemIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  scheduleItemContent: {
    flex: 1,
    minWidth: 0
  },
  scheduleItemTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  scheduleItemMeta: {
    fontSize: '12px',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  scheduleItemActions: {
    display: 'flex',
    gap: '4px'
  },
  iconButton: {
    padding: '6px',
    borderRadius: '6px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  statusBadge: {
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '500'
  },
  error: {
    padding: '12px 16px',
    borderRadius: '8px',
    background: '#fee2e2',
    color: '#dc2626',
    fontSize: '14px',
    marginBottom: '16px'
  },
  success: {
    padding: '12px 16px',
    borderRadius: '8px',
    background: '#dcfce7',
    color: '#16a34a',
    fontSize: '14px',
    marginBottom: '16px'
  },
  suggestedTimes: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginTop: '8px'
  },
  suggestedTimeChip: {
    padding: '4px 10px',
    borderRadius: '12px',
    background: '#f0f0ff',
    color: '#6366f1',
    fontSize: '12px',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#64748b'
  },
  emptyIcon: {
    marginBottom: '12px',
    opacity: 0.5
  },
  characterCount: {
    fontSize: '11px',
    color: '#64748b',
    textAlign: 'right',
    marginTop: '4px'
  },
  characterCountWarning: {
    color: '#f59e0b'
  },
  characterCountError: {
    color: '#dc2626'
  }
};

const PLATFORM_ICONS = {
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  blog: FileText,
  email: Mail
};

const PLATFORM_COLORS = {
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
  instagram: '#E4405F',
  facebook: '#1877F2',
  blog: '#6366f1',
  email: '#8b5cf6'
};

const STATUS_STYLES = {
  scheduled: { background: '#dbeafe', color: '#1d4ed8' },
  published: { background: '#dcfce7', color: '#16a34a' },
  failed: { background: '#fee2e2', color: '#dc2626' },
  cancelled: { background: '#f1f5f9', color: '#64748b' },
  draft: { background: '#fef3c7', color: '#d97706' }
};

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ContentScheduler({
  apiBaseUrl = '',
  onContentScheduled = null
}) {
  const [activeTab, setActiveTab] = useState('calendar');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarData, setCalendarData] = useState(null);

  // Form state
  const [platforms, setPlatforms] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    platform: '',
    scheduledDate: '',
    scheduledTime: '09:00',
    recurrence: 'none',
    tags: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [suggestedTimes, setSuggestedTimes] = useState([]);

  // List state
  const [scheduleList, setScheduleList] = useState([]);
  const [stats, setStats] = useState(null);

  // Fetch platforms on mount
  useEffect(() => {
    fetchPlatforms();
    fetchStats();
  }, []);

  // Fetch calendar when month changes
  useEffect(() => {
    fetchCalendar();
  }, [currentDate]);

  // Fetch suggested times when platform or date changes
  useEffect(() => {
    if (formData.platform && formData.scheduledDate) {
      fetchSuggestedTimes();
    }
  }, [formData.platform, formData.scheduledDate]);

  const fetchPlatforms = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/scheduler/platforms`);
      const data = await res.json();
      if (data.success) {
        setPlatforms(data.platforms);
      }
    } catch (err) {
      console.error('Failed to fetch platforms:', err);
      // Fallback defaults
      setPlatforms([
        { key: 'twitter', name: 'Twitter/X', maxLength: 280 },
        { key: 'linkedin', name: 'LinkedIn', maxLength: 3000 },
        { key: 'instagram', name: 'Instagram', maxLength: 2200 },
        { key: 'facebook', name: 'Facebook', maxLength: 5000 },
        { key: 'blog', name: 'Blog Post', maxLength: null },
        { key: 'email', name: 'Email', maxLength: null }
      ]);
    }
  };

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const res = await fetch(`${apiBaseUrl}/api/scheduler/calendar/${year}/${month}`);
      const data = await res.json();
      if (data.success) {
        setCalendarData(data);
      }
    } catch (err) {
      console.error('Failed to fetch calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/scheduler/stats`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchSuggestedTimes = async () => {
    try {
      const res = await fetch(
        `${apiBaseUrl}/api/scheduler/suggested-times/${formData.platform}?date=${formData.scheduledDate}`
      );
      const data = await res.json();
      if (data.success) {
        setSuggestedTimes(data.suggestedTimes || []);
      }
    } catch (err) {
      console.error('Failed to fetch suggested times:', err);
    }
  };

  const fetchScheduleList = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/scheduler/schedule?limit=50`);
      const data = await res.json();
      if (data.success) {
        setScheduleList(data.entries);
      }
    } catch (err) {
      setError('Failed to fetch schedule list');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const url = editingId
        ? `${apiBaseUrl}/api/scheduler/schedule/${editingId}`
        : `${apiBaseUrl}/api/scheduler/schedule`;

      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
        })
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to schedule content');
      }

      setSuccess(editingId ? 'Content updated successfully!' : 'Content scheduled successfully!');
      resetForm();
      fetchCalendar();
      fetchStats();

      if (onContentScheduled) {
        onContentScheduled(data.entry);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scheduled content?')) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/scheduler/schedule/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete');
      }

      setSuccess('Content deleted successfully!');
      fetchCalendar();
      fetchStats();
      fetchScheduleList();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry) => {
    setFormData({
      title: entry.title || '',
      content: entry.content,
      platform: entry.platform,
      scheduledDate: entry.scheduledDate,
      scheduledTime: entry.scheduledTime || '09:00',
      recurrence: entry.recurrence || 'none',
      tags: (entry.tags || []).join(', ')
    });
    setEditingId(entry.id);
    setActiveTab('calendar');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      platform: '',
      scheduledDate: selectedDate || '',
      scheduledTime: '09:00',
      recurrence: 'none',
      tags: ''
    });
    setEditingId(null);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const selectDate = (dateStr) => {
    setSelectedDate(dateStr);
    setFormData(prev => ({ ...prev, scheduledDate: dateStr }));
  };

  const getMonthName = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getCalendarDays = () => {
    if (!calendarData) return [];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isOtherMonth: true,
        date: null,
        entries: []
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const calDay = calendarData.days?.find(d => d.date === dateStr);
      days.push({
        day,
        isOtherMonth: false,
        date: dateStr,
        entries: calDay?.entries || [],
        isToday: dateStr === new Date().toISOString().split('T')[0]
      });
    }

    // Next month days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        isOtherMonth: true,
        date: null,
        entries: []
      });
    }

    return days;
  };

  const getPlatformMaxLength = () => {
    const platform = platforms.find(p => p.key === formData.platform);
    return platform?.maxLength || null;
  };

  const getCharacterCountStyle = () => {
    const maxLength = getPlatformMaxLength();
    if (!maxLength) return {};
    const length = formData.content.length;
    if (length > maxLength) return styles.characterCountError;
    if (length > maxLength * 0.9) return styles.characterCountWarning;
    return {};
  };

  const renderCalendarView = () => (
    <div style={styles.mainContent}>
      <div style={styles.calendarSection}>
        <div style={styles.calendarHeader}>
          <h3 style={styles.calendarTitle}>{getMonthName()}</h3>
          <div style={styles.calendarNav}>
            <button style={styles.navButton} onClick={() => navigateMonth(-1)}>
              <ChevronLeft size={18} />
            </button>
            <button style={styles.navButton} onClick={() => navigateMonth(1)}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div style={styles.calendarGrid}>
          {DAYS_OF_WEEK.map(day => (
            <div key={day} style={styles.dayHeader}>{day}</div>
          ))}
          {getCalendarDays().map((day, idx) => (
            <div
              key={idx}
              style={{
                ...styles.dayCell,
                ...(day.isOtherMonth ? styles.dayCellOtherMonth : {}),
                ...(day.isToday ? styles.dayCellToday : {}),
                ...(day.date === selectedDate ? styles.dayCellSelected : {})
              }}
              onClick={() => day.date && selectDate(day.date)}
            >
              <div style={styles.dayNumber}>{day.day}</div>
              <div style={styles.dayEntries}>
                {day.entries.slice(0, 2).map((entry, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.dayEntry,
                      background: PLATFORM_COLORS[entry.platform] || '#6366f1'
                    }}
                  >
                    {entry.title || entry.content.substring(0, 15)}
                  </div>
                ))}
                {day.entries.length > 2 && (
                  <div style={styles.moreEntries}>+{day.entries.length - 2} more</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.sidebar}>
        <div style={styles.formCard}>
          <h4 style={styles.formTitle}>
            {editingId ? <Edit2 size={16} /> : <Plus size={16} />}
            {editingId ? 'Edit Scheduled Content' : 'Schedule New Content'}
          </h4>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Platform</label>
              <div style={styles.platformGrid}>
                {platforms.map(platform => {
                  const Icon = PLATFORM_ICONS[platform.key] || FileText;
                  return (
                    <button
                      key={platform.key}
                      type="button"
                      style={{
                        ...styles.platformButton,
                        ...(formData.platform === platform.key ? styles.platformButtonSelected : {})
                      }}
                      onClick={() => setFormData(prev => ({ ...prev, platform: platform.key }))}
                    >
                      <Icon size={18} color={formData.platform === platform.key ? '#6366f1' : '#64748b'} />
                      {platform.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Content</label>
              <textarea
                style={styles.textarea}
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter your content..."
                required
              />
              {getPlatformMaxLength() && (
                <div style={{ ...styles.characterCount, ...getCharacterCountStyle() }}>
                  {formData.content.length} / {getPlatformMaxLength()} characters
                </div>
              )}
            </div>

            <div style={styles.dateTimeRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date</label>
                <input
                  type="date"
                  style={styles.input}
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Time</label>
                <input
                  type="time"
                  style={styles.input}
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  required
                />
              </div>
            </div>

            {suggestedTimes.length > 0 && (
              <div style={styles.suggestedTimes}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Suggested:</span>
                {suggestedTimes.map(time => (
                  <button
                    key={time.hour}
                    type="button"
                    style={styles.suggestedTimeChip}
                    onClick={() => setFormData(prev => ({ ...prev, scheduledTime: time.time }))}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>Recurrence</label>
              <select
                style={styles.select}
                value={formData.recurrence}
                onChange={(e) => setFormData(prev => ({ ...prev, recurrence: e.target.value }))}
              >
                <option value="none">No repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Tags (comma-separated)</label>
              <input
                type="text"
                style={styles.input}
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="e.g., promo, launch, weekly"
              />
            </div>

            <div style={styles.buttonRow}>
              <button
                type="submit"
                style={styles.button}
                disabled={loading}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : editingId ? <Check size={16} /> : <Plus size={16} />}
                {editingId ? 'Update' : 'Schedule'}
              </button>
              {editingId && (
                <button
                  type="button"
                  style={{ ...styles.button, ...styles.buttonSecondary, flex: '0 0 auto', width: 'auto' }}
                  onClick={resetForm}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </form>
        </div>

        {stats && (
          <div style={styles.statsCard}>
            <h4 style={styles.formTitle}>
              <BarChart3 size={16} />
              Statistics
            </h4>
            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{stats.total}</div>
                <div style={styles.statLabel}>Total</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{stats.upcoming}</div>
                <div style={styles.statLabel}>Upcoming</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{stats.thisWeek}</div>
                <div style={styles.statLabel}>This Week</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{stats.thisMonth}</div>
                <div style={styles.statLabel}>This Month</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderListView = () => {
    useEffect(() => {
      if (activeTab === 'list') {
        fetchScheduleList();
      }
    }, [activeTab]);

    return (
      <div style={styles.listSection}>
        <div style={styles.listHeader}>
          <h3 style={styles.listTitle}>Scheduled Content</h3>
          <button
            style={{ ...styles.button, width: 'auto' }}
            onClick={fetchScheduleList}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {scheduleList.length === 0 ? (
          <div style={styles.emptyState}>
            <Calendar size={48} style={styles.emptyIcon} />
            <p>No scheduled content yet</p>
            <p style={{ fontSize: '12px' }}>Create your first schedule from the Calendar tab</p>
          </div>
        ) : (
          scheduleList.map(entry => {
            const Icon = PLATFORM_ICONS[entry.platform] || FileText;
            const statusStyle = STATUS_STYLES[entry.status] || STATUS_STYLES.scheduled;
            return (
              <div key={entry.id} style={styles.scheduleItem}>
                <div
                  style={{
                    ...styles.scheduleItemIcon,
                    background: `${PLATFORM_COLORS[entry.platform]}20`
                  }}
                >
                  <Icon size={20} color={PLATFORM_COLORS[entry.platform]} />
                </div>
                <div style={styles.scheduleItemContent}>
                  <div style={styles.scheduleItemTitle}>
                    {entry.title || entry.content.substring(0, 50)}
                  </div>
                  <div style={styles.scheduleItemMeta}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {entry.scheduledDate}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {entry.scheduledTime}
                    </span>
                    <span
                      style={{
                        ...styles.statusBadge,
                        ...statusStyle
                      }}
                    >
                      {entry.status}
                    </span>
                  </div>
                </div>
                <div style={styles.scheduleItemActions}>
                  <button
                    style={styles.iconButton}
                    onClick={() => handleEdit(entry)}
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    style={{ ...styles.iconButton, color: '#dc2626' }}
                    onClick={() => handleDelete(entry.id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        button:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <div style={styles.header}>
        <h1 style={styles.title}>
          <Calendar size={32} color="#6366f1" />
          Content Scheduler
        </h1>
        <p style={styles.subtitle}>
          Plan and schedule your content across all platforms
        </p>
      </div>

      <div style={styles.tabsContainer}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'calendar' ? styles.tabActive : {})
          }}
          onClick={() => setActiveTab('calendar')}
        >
          <Calendar size={16} />
          Calendar
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'list' ? styles.tabActive : {})
          }}
          onClick={() => setActiveTab('list')}
        >
          <Filter size={16} />
          List View
        </button>
      </div>

      {activeTab === 'calendar' ? renderCalendarView() : renderListView()}
    </div>
  );
}
