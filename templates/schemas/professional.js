/**
 * Professional Services Industry Schema
 *
 * Additional tables for law firms, accounting, consulting, agencies
 */

module.exports = {
  tables: {
    // Clients (extends customers with professional details)
    professional_clients: `
      CREATE TABLE IF NOT EXISTS professional_clients (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
        company_name VARCHAR(255),
        industry VARCHAR(100),
        client_type VARCHAR(50) DEFAULT 'individual',
        retainer_amount DECIMAL(10, 2),
        hourly_rate DECIMAL(10, 2),
        payment_terms VARCHAR(100) DEFAULT 'net30',
        tax_id VARCHAR(50),
        primary_contact_name VARCHAR(255),
        primary_contact_email VARCHAR(255),
        primary_contact_phone VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Cases/Matters/Projects
    client_matters: `
      CREATE TABLE IF NOT EXISTS client_matters (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES professional_clients(id) ON DELETE CASCADE,
        matter_number VARCHAR(50) UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        matter_type VARCHAR(100),
        status VARCHAR(50) DEFAULT 'active',
        assigned_to INTEGER REFERENCES users(id),
        team_members INTEGER[],
        open_date DATE DEFAULT CURRENT_DATE,
        close_date DATE,
        budget DECIMAL(12, 2),
        billing_type VARCHAR(50) DEFAULT 'hourly',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Time entries
    time_entries: `
      CREATE TABLE IF NOT EXISTS time_entries (
        id SERIAL PRIMARY KEY,
        matter_id INTEGER REFERENCES client_matters(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id),
        date DATE NOT NULL,
        hours DECIMAL(5, 2) NOT NULL,
        description TEXT NOT NULL,
        activity_type VARCHAR(100),
        billable BOOLEAN DEFAULT true,
        hourly_rate DECIMAL(10, 2),
        amount DECIMAL(10, 2),
        status VARCHAR(50) DEFAULT 'draft',
        invoiced BOOLEAN DEFAULT false,
        invoice_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Expenses
    matter_expenses: `
      CREATE TABLE IF NOT EXISTS matter_expenses (
        id SERIAL PRIMARY KEY,
        matter_id INTEGER REFERENCES client_matters(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id),
        date DATE NOT NULL,
        category VARCHAR(100),
        description TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        receipt_url TEXT,
        billable BOOLEAN DEFAULT true,
        markup_percent DECIMAL(5, 2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        invoiced BOOLEAN DEFAULT false,
        invoice_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Invoices
    client_invoices: `
      CREATE TABLE IF NOT EXISTS client_invoices (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES professional_clients(id),
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        matter_id INTEGER REFERENCES client_matters(id),
        issue_date DATE NOT NULL,
        due_date DATE NOT NULL,
        time_charges DECIMAL(12, 2) DEFAULT 0,
        expenses DECIMAL(12, 2) DEFAULT 0,
        adjustments DECIMAL(12, 2) DEFAULT 0,
        subtotal DECIMAL(12, 2) DEFAULT 0,
        tax DECIMAL(12, 2) DEFAULT 0,
        total DECIMAL(12, 2) DEFAULT 0,
        amount_paid DECIMAL(12, 2) DEFAULT 0,
        balance_due DECIMAL(12, 2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'draft',
        sent_at TIMESTAMP,
        paid_at TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Documents
    client_documents: `
      CREATE TABLE IF NOT EXISTS client_documents (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES professional_clients(id),
        matter_id INTEGER REFERENCES client_matters(id),
        name VARCHAR(255) NOT NULL,
        file_url TEXT NOT NULL,
        file_type VARCHAR(50),
        file_size INTEGER,
        document_type VARCHAR(100),
        version INTEGER DEFAULT 1,
        uploaded_by INTEGER REFERENCES users(id),
        confidential BOOLEAN DEFAULT false,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Consultations/Meetings (extends bookings)
    consultations: `
      CREATE TABLE IF NOT EXISTS consultations (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id),
        client_id INTEGER REFERENCES professional_clients(id),
        matter_id INTEGER REFERENCES client_matters(id),
        consultation_type VARCHAR(100),
        location VARCHAR(255),
        virtual_link TEXT,
        agenda TEXT,
        meeting_notes TEXT,
        follow_up_actions TEXT,
        billable BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
  },

  indexes: [
    'CREATE INDEX IF NOT EXISTS idx_prof_clients_customer ON professional_clients(customer_id)',
    'CREATE INDEX IF NOT EXISTS idx_matters_client ON client_matters(client_id)',
    'CREATE INDEX IF NOT EXISTS idx_matters_status ON client_matters(status)',
    'CREATE INDEX IF NOT EXISTS idx_matters_assigned ON client_matters(assigned_to)',
    'CREATE INDEX IF NOT EXISTS idx_time_entries_matter ON time_entries(matter_id)',
    'CREATE INDEX IF NOT EXISTS idx_time_entries_user ON time_entries(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date)',
    'CREATE INDEX IF NOT EXISTS idx_expenses_matter ON matter_expenses(matter_id)',
    'CREATE INDEX IF NOT EXISTS idx_invoices_client ON client_invoices(client_id)',
    'CREATE INDEX IF NOT EXISTS idx_invoices_status ON client_invoices(status)',
    'CREATE INDEX IF NOT EXISTS idx_documents_matter ON client_documents(matter_id)'
  ]
};
