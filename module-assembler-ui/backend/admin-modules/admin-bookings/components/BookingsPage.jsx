import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, Plus, Check, X } from 'lucide-react';

const mockBookings = [
  { id: 1, customer: 'John Smith', phone: '(555) 123-4567', date: '2024-01-20', time: '6:00 PM', guests: 4, status: 'confirmed' },
  { id: 2, customer: 'Sarah Johnson', phone: '(555) 234-5678', date: '2024-01-20', time: '7:30 PM', guests: 2, status: 'pending' },
  { id: 3, customer: 'Mike Wilson', phone: '(555) 345-6789', date: '2024-01-21', time: '6:30 PM', guests: 6, status: 'confirmed' },
  { id: 4, customer: 'Emily Brown', phone: '(555) 456-7890', date: '2024-01-21', time: '8:00 PM', guests: 3, status: 'pending' },
  { id: 5, customer: 'David Lee', phone: '(555) 567-8901', date: '2024-01-22', time: '7:00 PM', guests: 2, status: 'cancelled' },
];

export default function BookingsPage() {
  const [bookings] = useState(mockBookings);
  const [filter, setFilter] = useState('all');

  const filteredBookings = bookings.filter(b =>
    filter === 'all' || b.status === filter
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bookings</h1>
          <p className="page-subtitle">Manage reservations and appointments</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} />
          New Booking
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="filter-tabs">
            {['all', 'confirmed', 'pending', 'cancelled'].map(status => (
              <button
                key={status}
                className={`filter-tab ${filter === status ? 'active' : ''}`}
                onClick={() => setFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="bookings-list">
          {filteredBookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <div className="booking-customer">
                  <User size={18} />
                  <span className="customer-name">{booking.customer}</span>
                </div>
                <span className={`status-badge ${booking.status}`}>
                  {booking.status}
                </span>
              </div>

              <div className="booking-details">
                <div className="booking-detail">
                  <Calendar size={16} />
                  <span>{booking.date}</span>
                </div>
                <div className="booking-detail">
                  <Clock size={16} />
                  <span>{booking.time}</span>
                </div>
                <div className="booking-detail">
                  <User size={16} />
                  <span>{booking.guests} guests</span>
                </div>
                <div className="booking-detail">
                  <Phone size={16} />
                  <span>{booking.phone}</span>
                </div>
              </div>

              {booking.status === 'pending' && (
                <div className="booking-actions">
                  <button className="btn-success">
                    <Check size={16} />
                    Confirm
                  </button>
                  <button className="btn-danger">
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
