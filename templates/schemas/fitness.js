/**
 * Fitness/Gym Industry Schema
 *
 * Additional tables for gyms, fitness centers, yoga studios
 */

module.exports = {
  tables: {
    // Membership plans
    membership_plans: `
      CREATE TABLE IF NOT EXISTS membership_plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        billing_period VARCHAR(50) DEFAULT 'monthly',
        duration_months INTEGER,
        features TEXT[],
        class_credits INTEGER,
        guest_passes INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Member memberships
    memberships: `
      CREATE TABLE IF NOT EXISTS memberships (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
        plan_id INTEGER REFERENCES membership_plans(id),
        status VARCHAR(50) DEFAULT 'active',
        start_date DATE NOT NULL,
        end_date DATE,
        auto_renew BOOLEAN DEFAULT true,
        remaining_credits INTEGER DEFAULT 0,
        freeze_until DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Fitness classes
    fitness_classes: `
      CREATE TABLE IF NOT EXISTS fitness_classes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        instructor_id INTEGER REFERENCES staff_members(id),
        duration_minutes INTEGER NOT NULL,
        capacity INTEGER NOT NULL,
        difficulty_level VARCHAR(50),
        equipment_needed TEXT,
        calories_burn INTEGER,
        image_url TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Class schedule
    class_schedule: `
      CREATE TABLE IF NOT EXISTS class_schedule (
        id SERIAL PRIMARY KEY,
        class_id INTEGER REFERENCES fitness_classes(id) ON DELETE CASCADE,
        instructor_id INTEGER REFERENCES staff_members(id),
        room VARCHAR(100),
        day_of_week INTEGER,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        recurring BOOLEAN DEFAULT true,
        start_date DATE,
        end_date DATE,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Class bookings
    class_bookings: `
      CREATE TABLE IF NOT EXISTS class_bookings (
        id SERIAL PRIMARY KEY,
        schedule_id INTEGER REFERENCES class_schedule(id),
        customer_id INTEGER REFERENCES customers(id),
        class_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'booked',
        checked_in BOOLEAN DEFAULT false,
        checked_in_at TIMESTAMP,
        waitlist_position INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Check-ins
    gym_checkins: `
      CREATE TABLE IF NOT EXISTS gym_checkins (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id),
        membership_id INTEGER REFERENCES memberships(id),
        check_in_time TIMESTAMP DEFAULT NOW(),
        check_out_time TIMESTAMP,
        duration_minutes INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Personal training sessions
    pt_sessions: `
      CREATE TABLE IF NOT EXISTS pt_sessions (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id),
        trainer_id INTEGER REFERENCES staff_members(id),
        booking_id INTEGER REFERENCES bookings(id),
        session_type VARCHAR(100),
        goals TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
  },

  indexes: [
    'CREATE INDEX IF NOT EXISTS idx_memberships_customer ON memberships(customer_id)',
    'CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status)',
    'CREATE INDEX IF NOT EXISTS idx_class_schedule_class ON class_schedule(class_id)',
    'CREATE INDEX IF NOT EXISTS idx_class_schedule_day ON class_schedule(day_of_week)',
    'CREATE INDEX IF NOT EXISTS idx_class_bookings_schedule ON class_bookings(schedule_id)',
    'CREATE INDEX IF NOT EXISTS idx_class_bookings_date ON class_bookings(class_date)',
    'CREATE INDEX IF NOT EXISTS idx_checkins_customer ON gym_checkins(customer_id)',
    'CREATE INDEX IF NOT EXISTS idx_checkins_time ON gym_checkins(check_in_time)'
  ]
};
