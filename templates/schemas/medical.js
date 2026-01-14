/**
 * Medical/Healthcare Industry Schema
 *
 * Additional tables for clinics, dental offices, healthcare providers
 */

module.exports = {
  tables: {
    // Practitioners/Doctors
    practitioners: `
      CREATE TABLE IF NOT EXISTS practitioners (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        title VARCHAR(100),
        credentials VARCHAR(255),
        specialty VARCHAR(255),
        license_number VARCHAR(100),
        npi_number VARCHAR(50),
        bio TEXT,
        image_url TEXT,
        accepting_patients BOOLEAN DEFAULT true,
        schedule JSONB DEFAULT '{}',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Patients (extends customers with medical info)
    patients: `
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
        date_of_birth DATE,
        gender VARCHAR(20),
        blood_type VARCHAR(10),
        emergency_contact_name VARCHAR(255),
        emergency_contact_phone VARCHAR(50),
        insurance_provider VARCHAR(255),
        insurance_id VARCHAR(100),
        insurance_group VARCHAR(100),
        primary_practitioner_id INTEGER REFERENCES practitioners(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Medical history (basic, non-PHI)
    medical_history: `
      CREATE TABLE IF NOT EXISTS medical_history (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
        allergies TEXT[],
        medications TEXT[],
        conditions TEXT[],
        family_history TEXT,
        notes TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Appointments (extends bookings)
    medical_appointments: `
      CREATE TABLE IF NOT EXISTS medical_appointments (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id),
        patient_id INTEGER REFERENCES patients(id),
        practitioner_id INTEGER REFERENCES practitioners(id),
        appointment_type VARCHAR(100),
        reason_for_visit TEXT,
        symptoms TEXT,
        vitals JSONB DEFAULT '{}',
        visit_notes TEXT,
        follow_up_required BOOLEAN DEFAULT false,
        follow_up_date DATE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Treatment plans
    treatment_plans: `
      CREATE TABLE IF NOT EXISTS treatment_plans (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patients(id),
        practitioner_id INTEGER REFERENCES practitioners(id),
        diagnosis TEXT,
        treatment TEXT,
        medications TEXT,
        instructions TEXT,
        start_date DATE,
        end_date DATE,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,

    // Insurance claims
    insurance_claims: `
      CREATE TABLE IF NOT EXISTS insurance_claims (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patients(id),
        appointment_id INTEGER REFERENCES medical_appointments(id),
        claim_number VARCHAR(100),
        procedure_codes TEXT[],
        diagnosis_codes TEXT[],
        amount_billed DECIMAL(10, 2),
        amount_approved DECIMAL(10, 2),
        amount_paid DECIMAL(10, 2),
        patient_responsibility DECIMAL(10, 2),
        status VARCHAR(50) DEFAULT 'submitted',
        submitted_at TIMESTAMP,
        processed_at TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
  },

  indexes: [
    'CREATE INDEX IF NOT EXISTS idx_practitioners_specialty ON practitioners(specialty)',
    'CREATE INDEX IF NOT EXISTS idx_practitioners_active ON practitioners(active)',
    'CREATE INDEX IF NOT EXISTS idx_patients_customer ON patients(customer_id)',
    'CREATE INDEX IF NOT EXISTS idx_medical_appts_patient ON medical_appointments(patient_id)',
    'CREATE INDEX IF NOT EXISTS idx_medical_appts_practitioner ON medical_appointments(practitioner_id)',
    'CREATE INDEX IF NOT EXISTS idx_treatment_plans_patient ON treatment_plans(patient_id)',
    'CREATE INDEX IF NOT EXISTS idx_insurance_claims_patient ON insurance_claims(patient_id)',
    'CREATE INDEX IF NOT EXISTS idx_insurance_claims_status ON insurance_claims(status)'
  ]
};
