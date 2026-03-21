require('dotenv').config();
const { Sequelize } = require('sequelize');

const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:dfFIMnAERKgUcWzpGavFgpqUxbFGlZCX@caboose.proxy.rlwy.net:46081/railway';

const s = new Sequelize(DB_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: false
});

async function run() {
  try {
    await s.authenticate();
    console.log('Connected to DB');

    // Check existing tables
    const tables = await s.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
      { type: s.QueryTypes.SELECT }
    );
    console.log('\nExisting tables:');
    tables.forEach(t => console.log(' -', t.table_name));

    // Create visit_records if not exists
    await s.query(`
      CREATE TABLE IF NOT EXISTS public.visit_records (
        id                  BIGINT PRIMARY KEY,
        hospital_id         BIGINT,
        patient_id          BIGINT,
        doctor_id           BIGINT,
        department          VARCHAR(50)    DEFAULT 'General',
        visit_date          VARCHAR(20),
        visit_type          VARCHAR(20)    DEFAULT 'OPD',
        chief_complaint     TEXT,
        duration            VARCHAR(50),
        history             TEXT,
        allergies           TEXT,
        family_history      TEXT,
        surgical_history    TEXT,
        bp_systolic         INTEGER,
        bp_diastolic        INTEGER,
        temperature         NUMERIC(4,1),
        pulse               INTEGER,
        spo2                INTEGER,
        weight              NUMERIC(5,1),
        height              NUMERIC(5,1),
        bmi                 NUMERIC(4,1),
        examination_notes   TEXT,
        diagnosis_primary   TEXT,
        diagnosis_secondary TEXT,
        icd_code            VARCHAR(20),
        severity            VARCHAR(20),
        prescription        JSONB          DEFAULT '[]',
        lab_requests        JSONB          DEFAULT '[]',
        radiology_requests  JSONB          DEFAULT '[]',
        referral_to         TEXT,
        referral_notes      TEXT,
        followup_date       VARCHAR(20),
        followup_instructions TEXT,
        advice              TEXT,
        dept_data           JSONB          DEFAULT '{}',
        status              VARCHAR(20)    DEFAULT 'draft',
        created_at          BIGINT,
        updated_at          BIGINT
      )
    `);
    console.log('\n✅ visit_records table created (or already exists)');

    // Verify it's there now
    const [check] = await s.query(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema='public' AND table_name='visit_records'",
      { type: s.QueryTypes.SELECT }
    );
    console.log('visit_records exists:', check.count === '1' ? 'YES ✅' : 'NO ❌');

    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
}

run();
