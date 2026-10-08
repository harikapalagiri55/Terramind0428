const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'cybershield.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for durability and performance
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize Schema
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      head_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'employee')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      department_id TEXT NOT NULL,
      role_title TEXT NOT NULL,
      role_category TEXT NOT NULL CHECK(role_category IN ('Developer', 'HR', 'Finance', 'Payroll', 'Executive', 'General')),
      risk_score INTEGER DEFAULT 25,
      remediation_status TEXT DEFAULT 'good_standing' CHECK(remediation_status IN ('good_standing', 'remediation_required', 'training_completed')),
      resilience_points INTEGER DEFAULT 120,
      streak_count INTEGER DEFAULT 1,
      simulations_tested INTEGER DEFAULT 0,
      simulations_clicked INTEGER DEFAULT 0,
      simulations_reported INTEGER DEFAULT 0,
      avatar_url TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(department_id) REFERENCES departments(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS training_modules (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      target_role TEXT NOT NULL,
      category TEXT NOT NULL,
      estimated_minutes INTEGER DEFAULT 3,
      description TEXT NOT NULL,
      indicators_json TEXT NOT NULL,
      content_markdown TEXT NOT NULL,
      quiz_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS phishing_templates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      target_role TEXT NOT NULL,
      scenario TEXT NOT NULL,
      difficulty TEXT DEFAULT 'Medium' CHECK(difficulty IN ('Easy', 'Medium', 'Hard')),
      sender_name TEXT NOT NULL,
      sender_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      body_html TEXT NOT NULL,
      simulated_link_text TEXT NOT NULL,
      simulated_link_url TEXT NOT NULL,
      red_flags_json TEXT NOT NULL,
      recommended_training_id TEXT,
      is_custom INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(recommended_training_id) REFERENCES training_modules(id)
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      target_department_id TEXT,
      target_role TEXT,
      template_id TEXT NOT NULL,
      status TEXT DEFAULT 'active' CHECK(status IN ('draft', 'active', 'paused', 'completed')),
      total_targets INTEGER DEFAULT 0,
      clicked_count INTEGER DEFAULT 0,
      reported_count INTEGER DEFAULT 0,
      opened_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      launched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(template_id) REFERENCES phishing_templates(id),
      FOREIGN KEY(target_department_id) REFERENCES departments(id)
    );

    CREATE TABLE IF NOT EXISTS campaign_targets (
      id TEXT PRIMARY KEY,
      campaign_id TEXT NOT NULL,
      employee_id TEXT NOT NULL,
      status TEXT DEFAULT 'delivered' CHECK(status IN ('delivered', 'opened', 'clicked', 'reported')),
      delivered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      opened_at DATETIME,
      clicked_at DATETIME,
      reported_at DATETIME,
      FOREIGN KEY(campaign_id) REFERENCES campaigns(id),
      FOREIGN KEY(employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS interaction_events (
      id TEXT PRIMARY KEY,
      campaign_id TEXT,
      employee_id TEXT NOT NULL,
      event_type TEXT NOT NULL CHECK(event_type IN ('EMAIL_DELIVERED', 'EMAIL_OPENED', 'LINK_CLICKED', 'SIMULATION_REPORTED', 'TRAINING_OPENED', 'TRAINING_COMPLETED', 'REMEDIATION_ASSIGNED')),
      payload_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(campaign_id) REFERENCES campaigns(id),
      FOREIGN KEY(employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS risk_history (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      previous_score INTEGER NOT NULL,
      new_score INTEGER NOT NULL,
      change_delta INTEGER NOT NULL,
      reason TEXT NOT NULL,
      trigger_event_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(employee_id) REFERENCES employees(id),
      FOREIGN KEY(trigger_event_id) REFERENCES interaction_events(id)
    );

    CREATE TABLE IF NOT EXISTS training_assignments (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      module_id TEXT NOT NULL,
      campaign_id TEXT,
      status TEXT DEFAULT 'assigned' CHECK(status IN ('assigned', 'in_progress', 'completed')),
      score INTEGER DEFAULT 0,
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY(employee_id) REFERENCES employees(id),
      FOREIGN KEY(module_id) REFERENCES training_modules(id),
      FOREIGN KEY(campaign_id) REFERENCES campaigns(id)
    );

    CREATE TABLE IF NOT EXISTS security_audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      email TEXT NOT NULL,
      event_type TEXT NOT NULL,
      auth_method TEXT DEFAULT 'Password + TOTP',
      ip_address TEXT DEFAULT '127.0.0.1 (Internal Loopback)',
      user_agent TEXT,
      status TEXT DEFAULT 'SUCCESS',
      details_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(department_id);
    CREATE INDEX IF NOT EXISTS idx_campaign_targets_emp ON campaign_targets(employee_id);
    CREATE INDEX IF NOT EXISTS idx_interaction_events_emp ON interaction_events(employee_id);
    CREATE INDEX IF NOT EXISTS idx_interaction_events_time ON interaction_events(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_training_assignments_emp ON training_assignments(employee_id);
    CREATE INDEX IF NOT EXISTS idx_security_audit_logs_email ON security_audit_logs(email);
    CREATE INDEX IF NOT EXISTS idx_security_audit_logs_time ON security_audit_logs(created_at DESC);
  `);

  // Non-destructive migrations for existing database
  try { db.exec(`ALTER TABLE users ADD COLUMN mfa_enabled INTEGER DEFAULT 1`); } catch (_) {}
  try { db.exec(`ALTER TABLE users ADD COLUMN mfa_secret TEXT DEFAULT 'CS-SEC-7492'`); } catch (_) {}
  try { db.exec(`ALTER TABLE users ADD COLUMN passkey_enrolled INTEGER DEFAULT 1`); } catch (_) {}
  try { db.exec(`ALTER TABLE users ADD COLUMN auth_strength TEXT DEFAULT 'HARDENED_MFA'`); } catch (_) {}
}

initSchema();

module.exports = {
  db,
  initSchema
};
