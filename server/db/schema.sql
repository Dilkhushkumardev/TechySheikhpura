-- TechySheikhpura '26 Relational SQLite Schema (Compatible with SQLite / Node 24 node:sqlite)

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  description TEXT NOT NULL,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS fest_info (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  college_name TEXT NOT NULL,
  short_college TEXT NOT NULL,
  dates TEXT NOT NULL,
  venue TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  student_convenor TEXT NOT NULL,
  telegram TEXT NOT NULL,
  stats_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  team_size TEXT NOT NULL,
  entry_fee TEXT NOT NULL,
  prizes TEXT NOT NULL,
  featured INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS event_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL,
  rule_text TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event_coordinators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS passes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  original_price INTEGER NOT NULL CHECK (original_price >= 0),
  badge TEXT,
  is_popular INTEGER NOT NULL DEFAULT 0,
  access_scope TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pass_features (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pass_id TEXT NOT NULL,
  feature_text TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (pass_id) REFERENCES passes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS schedule_items (
  id TEXT PRIMARY KEY,
  day TEXT NOT NULL CHECK (day IN ('Day 1', 'Day 2')),
  time TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  venue TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS registrations (
  reg_id TEXT PRIMARY KEY,
  pass_id TEXT NOT NULL,
  pass_name TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  event_id TEXT,
  event_title TEXT,
  full_name TEXT NOT NULL,
  roll_no TEXT NOT NULL,
  branch TEXT NOT NULL,
  year TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  team_name TEXT,
  checked_in INTEGER NOT NULL DEFAULT 0 CHECK (checked_in IN (0, 1)),
  checked_in_at TEXT,
  booked_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (pass_id) REFERENCES passes(id) ON DELETE RESTRICT,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  roll_no TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  admin_note TEXT,
  resolved_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS activity_feed (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_name TEXT NOT NULL,
  branch TEXT NOT NULL,
  action_text TEXT NOT NULL,
  time_label TEXT NOT NULL DEFAULT 'Just now',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS campus_clubs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  icon TEXT NOT NULL CHECK (icon IN ('code', 'bot', 'plane', 'sparkles', 'gamepad', 'cpu')),
  color_class TEXT NOT NULL,
  lead_name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS organizers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  phone TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('faculty', 'student', 'team')),
  featured_footer INTEGER NOT NULL DEFAULT 0 CHECK (featured_footer IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'info' CHECK (priority IN ('info', 'important', 'urgent')),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS event_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL,
  position TEXT NOT NULL,
  winner_name TEXT NOT NULL,
  team_name TEXT,
  branch TEXT NOT NULL,
  roll_no TEXT,
  prize TEXT NOT NULL,
  announced_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_registrations_roll_pass ON registrations(roll_no, pass_id);
CREATE INDEX IF NOT EXISTS idx_registrations_email_pass ON registrations(email, pass_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_created ON registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_feed(id DESC);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(id DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, id DESC);
CREATE INDEX IF NOT EXISTS idx_results_event ON event_results(event_id);

CREATE VIEW IF NOT EXISTS v_pass_tier_summary AS
SELECT
  p.id AS pass_id,
  p.name AS pass_name,
  p.price AS price,
  COUNT(r.reg_id) AS bookings,
  COALESCE(SUM(CASE WHEN r.checked_in = 1 THEN 1 ELSE 0 END), 0) AS checked_in_count,
  COALESCE(SUM(r.price), 0) AS revenue
FROM passes p
LEFT JOIN registrations r ON r.pass_id = p.id
GROUP BY p.id, p.name, p.price, p.sort_order
ORDER BY p.sort_order ASC;

CREATE VIEW IF NOT EXISTS v_event_registration_summary AS
SELECT
  e.id AS event_id,
  e.title AS event_title,
  e.category AS category,
  COUNT(r.reg_id) AS total_registrations,
  COALESCE(SUM(CASE WHEN r.checked_in = 1 THEN 1 ELSE 0 END), 0) AS checked_in_count
FROM events e
LEFT JOIN registrations r ON r.event_id = e.id
GROUP BY e.id, e.title, e.category, e.sort_order
ORDER BY e.sort_order ASC;

CREATE VIEW IF NOT EXISTS v_branch_distribution AS
SELECT
  branch,
  COUNT(*) AS bookings,
  COALESCE(SUM(CASE WHEN checked_in = 1 THEN 1 ELSE 0 END), 0) AS checked_in_count,
  COALESCE(SUM(price), 0) AS revenue
FROM registrations
GROUP BY branch
ORDER BY bookings DESC;

CREATE TRIGGER IF NOT EXISTS trg_fest_info_touch
AFTER UPDATE ON fest_info
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE fest_info SET updated_at = datetime('now') WHERE id = NEW.id;
END;

