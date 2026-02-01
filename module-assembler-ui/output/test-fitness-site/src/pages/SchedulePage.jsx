import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, ChevronLeft, ChevronRight, Zap, Heart, Dumbbell } from 'lucide-react';

const COLORS = {
  "primary": "#DC2626",
  "secondary": "#EF4444",
  "accent": "#FCA5A5",
  "background": "#FEF2F2",
  "text": "#1F2937"
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SCHEDULE = {
  Monday: [
    { time: '6:00 AM', name: 'Morning HIIT', duration: '45 min', trainer: 'Mike J.', category: 'cardio', spots: 4 },
    { time: '8:00 AM', name: 'Yoga Flow', duration: '60 min', trainer: 'Sarah C.', category: 'mind-body', spots: 8 },
    { time: '12:00 PM', name: 'Lunch Express', duration: '30 min', trainer: 'Emily R.', category: 'cardio', spots: 6 },
    { time: '5:30 PM', name: 'Strength & Power', duration: '60 min', trainer: 'Marcus W.', category: 'strength', spots: 2 },
    { time: '7:00 PM', name: 'Spin Class', duration: '45 min', trainer: 'Emily R.', category: 'cardio', spots: 0 }
  ],
  Tuesday: [
    { time: '6:00 AM', name: 'CrossFit WOD', duration: '60 min', trainer: 'David P.', category: 'strength', spots: 5 },
    { time: '9:00 AM', name: 'Pilates Core', duration: '45 min', trainer: 'Lisa T.', category: 'mind-body', spots: 10 },
    { time: '12:00 PM', name: 'Boxing Basics', duration: '45 min', trainer: 'Marcus W.', category: 'cardio', spots: 3 },
    { time: '6:00 PM', name: 'HIIT Training', duration: '45 min', trainer: 'Mike J.', category: 'cardio', spots: 1 },
    { time: '7:30 PM', name: 'Yoga Restore', duration: '60 min', trainer: 'Sarah C.', category: 'mind-body', spots: 12 }
  ],
  Wednesday: [
    { time: '6:00 AM', name: 'Spin Class', duration: '45 min', trainer: 'Emily R.', category: 'cardio', spots: 7 },
    { time: '8:00 AM', name: 'Strength Training', duration: '60 min', trainer: 'Mike J.', category: 'strength', spots: 4 },
    { time: '12:00 PM', name: 'Yoga Express', duration: '30 min', trainer: 'Sarah C.', category: 'mind-body', spots: 6 },
    { time: '5:30 PM', name: 'Boxing Fitness', duration: '60 min', trainer: 'Marcus W.', category: 'cardio', spots: 0 },
    { time: '7:00 PM', name: 'CrossFit', duration: '60 min', trainer: 'David P.', category: 'strength', spots: 3 }
  ],
  Thursday: [
    { time: '6:00 AM', name: 'Morning HIIT', duration: '45 min', trainer: 'Mike J.', category: 'cardio', spots: 5 },
    { time: '9:00 AM', name: 'Pilates Mat', duration: '45 min', trainer: 'Lisa T.', category: 'mind-body', spots: 8 },
    { time: '12:00 PM', name: 'Lunch Spin', duration: '30 min', trainer: 'Emily R.', category: 'cardio', spots: 4 },
    { time: '6:00 PM', name: 'Strength & Conditioning', duration: '60 min', trainer: 'Mike J.', category: 'strength', spots: 2 },
    { time: '7:30 PM', name: 'Yoga Flow', duration: '60 min', trainer: 'Sarah C.', category: 'mind-body', spots: 10 }
  ],
  Friday: [
    { time: '6:00 AM', name: 'CrossFit WOD', duration: '60 min', trainer: 'David P.', category: 'strength', spots: 6 },
    { time: '8:00 AM', name: 'Yoga Vinyasa', duration: '60 min', trainer: 'Sarah C.', category: 'mind-body', spots: 9 },
    { time: '12:00 PM', name: 'Express HIIT', duration: '30 min', trainer: 'Mike J.', category: 'cardio', spots: 3 },
    { time: '5:00 PM', name: 'Happy Hour Spin', duration: '45 min', trainer: 'Emily R.', category: 'cardio', spots: 1 }
  ],
  Saturday: [
    { time: '8:00 AM', name: 'Weekend Warriors HIIT', duration: '60 min', trainer: 'Mike J.', category: 'cardio', spots: 8 },
    { time: '9:30 AM', name: 'Yoga All Levels', duration: '75 min', trainer: 'Sarah C.', category: 'mind-body', spots: 12 },
    { time: '11:00 AM', name: 'Boxing Bootcamp', duration: '60 min', trainer: 'Marcus W.', category: 'cardio', spots: 5 },
    { time: '1:00 PM', name: 'Open Gym CrossFit', duration: '90 min', trainer: 'David P.', category: 'strength', spots: 10 }
  ],
  Sunday: [
    { time: '9:00 AM', name: 'Sunday Yoga', duration: '75 min', trainer: 'Sarah C.', category: 'mind-body', spots: 15 },
    { time: '10:30 AM', name: 'Pilates Reformer', duration: '50 min', trainer: 'Lisa T.', category: 'mind-body', spots: 6 },
    { time: '12:00 PM', name: 'Recovery & Stretch', duration: '45 min', trainer: 'Sarah C.', category: 'mind-body', spots: 20 }
  ]
};

const CATEGORY_COLORS = {
  cardio: '#EF4444',
  strength: '#3B82F6',
  'mind-body': '#10B981'
};

export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [filter, setFilter] = useState('all');

  const classes = SCHEDULE[selectedDay] || [];
  const filtered = filter === 'all' ? classes : classes.filter(c => c.category === filter);

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', backgroundColor: COLORS.primary, color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Class Schedule</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>Find and book your next workout</p>
      </section>

      <section style={{ backgroundColor: 'white', borderBottom: '1px solid rgba(0,0,0,0.06)', position: 'sticky', top: '72px', zIndex: 50 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
            {DAYS.map(day => (
              <button key={day} onClick={() => setSelectedDay(day)} style={{ padding: '12px 20px', borderRadius: '8px', border: 'none', backgroundColor: selectedDay === day ? COLORS.primary : 'transparent', color: selectedDay === day ? 'white' : COLORS.text, fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {day}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '24px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '12px', justifyContent: 'center' }}>
          {[
            { id: 'all', label: 'All Classes' },
            { id: 'cardio', label: 'Cardio', icon: Zap },
            { id: 'strength', label: 'Strength', icon: Dumbbell },
            { id: 'mind-body', label: 'Mind & Body', icon: Heart }
          ].map(cat => (
            <button key={cat.id} onClick={() => setFilter(cat.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '20px', border: filter === cat.id ? 'none' : '1px solid #E5E7EB', backgroundColor: filter === cat.id ? (cat.id === 'all' ? COLORS.primary : CATEGORY_COLORS[cat.id]) : 'transparent', color: filter === cat.id ? 'white' : COLORS.text, fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}>
              {cat.icon && <cat.icon size={16} />}
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      <section style={{ padding: '40px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ opacity: 0.6 }}>No classes scheduled for this filter.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filtered.map((cls, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px 24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderLeft: `4px solid ${CATEGORY_COLORS[cls.category]}` }}>
                  <div style={{ minWidth: '80px' }}>
                    <div style={{ fontSize: '18px', fontWeight: '700' }}>{cls.time}</div>
                    <div style={{ fontSize: '14px', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} /> {cls.duration}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{cls.name}</h3>
                    <p style={{ fontSize: '14px', opacity: 0.6 }}>with {cls.trainer}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      {cls.spots === 0 ? (
                        <span style={{ color: '#EF4444', fontWeight: '600', fontSize: '14px' }}>Full</span>
                      ) : (
                        <span style={{ color: cls.spots <= 3 ? '#F59E0B' : '#10B981', fontWeight: '600', fontSize: '14px' }}>
                          {cls.spots} spots left
                        </span>
                      )}
                    </div>
                    <button disabled={cls.spots === 0} style={{ padding: '10px 20px', backgroundColor: cls.spots === 0 ? '#E5E7EB' : COLORS.primary, color: cls.spots === 0 ? '#9CA3AF' : 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: cls.spots === 0 ? 'not-allowed' : 'pointer' }}>
                      {cls.spots === 0 ? 'Waitlist' : 'Book'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>Need Personalized Training?</h2>
          <p style={{ opacity: 0.7, marginBottom: '24px' }}>Book a 1-on-1 session with one of our expert trainers</p>
          <Link to="/trainers" style={{ display: 'inline-block', backgroundColor: COLORS.primary, color: 'white', padding: '14px 28px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>
            View Trainers
          </Link>
        </div>
      </section>
    </div>
  );
}