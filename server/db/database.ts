import { randomInt } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync, type SQLOutputValue } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { getServerConfig } from '../config/env.ts';
import { computePassVerifyCode } from '../middleware/auth.ts';
import {
  FEST_CLUBS,
  FEST_EVENTS,
  FEST_FAQS,
  FEST_INFO,
  FEST_ORGANIZERS,
  FEST_PASSES,
  FEST_SCHEDULE,
  type CampusClub,
  type FestEvent,
  type FestPass,
  type OrganizerMember,
  type ScheduleItem,
} from '../../src/data/techySheikhpuraData.ts';

export type { CampusClub, OrganizerMember };

type SqlRow = Record<string, SQLOutputValue>;

export interface FestStat {
  label: string;
  value: string;
}

export interface FestInfoPayload {
  name: string;
  shortName: string;
  tagline: string;
  subtitle: string;
  collegeName: string;
  shortCollegeName: string;
  dates: string;
  venue: string;
  stats: FestStat[];
  contacts: {
    email: string;
    phone: string;
    studentConvenor: string;
    telegram: string;
  };
}

export interface ActivityItem {
  id: number;
  name: string;
  branch: string;
  action: string;
  time: string;
  createdAt: string;
}

export interface FaqItem {
  id: number;
  q: string;
  a: string;
}

export interface RegistrationRecord {
  regId: string;
  passId: string;
  passName: string;
  price: number;
  eventId: string | null;
  eventTitle: string | null;
  fullName: string;
  rollNo: string;
  branch: string;
  year: string;
  phone: string;
  email: string;
  teamName: string | null;
  verifyCode: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  bookedAt: string;
  createdAt: string;
}

export interface AuditLogRecord {
  id: number;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
}

export interface UpdatePassInput {
  name?: string;
  tagline?: string;
  price?: number;
  originalPrice?: number;
  isPopular?: boolean;
  accessScope?: string;
  features?: string[];
}

export interface InquiryRecord {
  id: number;
  name: string;
  email: string;
  rollNo: string | null;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  adminNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface AnnouncementRecord {
  id: number;
  title: string;
  message: string;
  priority: 'info' | 'important' | 'urgent';
  isActive: boolean;
  createdAt: string;
}

export interface EventResultRecord {
  id: number;
  eventId: string;
  eventTitle: string;
  position: string;
  winnerName: string;
  teamName: string | null;
  branch: string;
  rollNo: string | null;
  prize: string;
  announcedAt: string;
}

export interface DatabaseDiagnostics {
  dbPath: string;
  journalMode: string;
  foreignKeys: boolean;
  integrityCheck: string;
  schemaVersion: number;
  pageSize: number;
  pageCount: number;
  estimatedBytes: number;
  tableCounts: Record<string, number>;
}

export interface CreateRegistrationInput {
  passId: string;
  eventId?: string;
  fullName: string;
  rollNo: string;
  branch: string;
  year: string;
  phone: string;
  email: string;
  teamName?: string;
}

export interface CreateEventInput {
  id: string;
  title: string;
  tagline: string;
  category: FestEvent['category'];
  date: string;
  time: string;
  venue: string;
  image: string;
  description: string;
  teamSize: string;
  entryFee: string;
  prizes: string;
  rules: string[];
  coordinators: { name: string; contact: string }[];
  featured?: boolean;
}

export interface ScheduleItemRecord extends ScheduleItem {
  id: string;
}

export interface CreateScheduleInput {
  id?: string;
  day: 'Day 1' | 'Day 2';
  time: string;
  title: string;
  category: string;
  venue: string;
  description: string;
}

export interface UpdateFestInfoInput {
  tagline?: string;
  dates?: string;
  venue?: string;
  email?: string;
  phone?: string;
  studentConvenor?: string;
  telegram?: string;
}

export interface CreateInquiryInput {
  name: string;
  email: string;
  rollNo?: string;
  subject: string;
  message: string;
}

const DB_MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));

let dbInstance: DatabaseSync | null = null;
let activeDbPath = ':memory:';

function asString(value: SQLOutputValue | undefined, fallback = ''): string {
  return typeof value === 'string' ? value : value == null ? fallback : String(value);
}

function asNullableString(value: SQLOutputValue | undefined): string | null {
  return typeof value === 'string' ? value : null;
}

function asNumber(value: SQLOutputValue | undefined, fallback = 0): number {
  return typeof value === 'number' ? value : typeof value === 'bigint' ? Number(value) : fallback;
}

function withTransaction<T>(db: DatabaseSync, fn: () => T): T {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function seedFestData(db: DatabaseSync): void {
  withTransaction(db, () => {
    // Sync fest_info from FEST_INFO baseline on first run
    const festCount = asNumber((db.prepare('SELECT COUNT(*) AS count FROM fest_info').get() as SqlRow | undefined)?.count);
    if (festCount === 0) {
      db.prepare(`
        INSERT INTO fest_info (
          id, name, tagline, college_name, short_college, dates, venue,
          email, phone, student_convenor, telegram, stats_json
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        FEST_INFO.name,
        FEST_INFO.tagline,
        FEST_INFO.collegeName,
        FEST_INFO.shortCollegeName,
        FEST_INFO.dates,
        FEST_INFO.venue,
        FEST_INFO.contacts.email,
        FEST_INFO.contacts.phone,
        FEST_INFO.contacts.studentConvenor,
        FEST_INFO.contacts.telegram,
        JSON.stringify(FEST_INFO.stats)
      );
    }

    const eventsCount = asNumber((db.prepare('SELECT COUNT(*) AS count FROM events').get() as SqlRow | undefined)?.count);
    if (eventsCount === 0) {
      const insertEvent = db.prepare(`
        INSERT INTO events (
          id, title, tagline, category, date, time, venue, image,
          description, team_size, entry_fee, prizes, featured, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const insertRule = db.prepare(
        'INSERT INTO event_rules (event_id, rule_text, sort_order) VALUES (?, ?, ?)'
      );
      const insertCoordinator = db.prepare(
        'INSERT INTO event_coordinators (event_id, name, contact, sort_order) VALUES (?, ?, ?, ?)'
      );

      FEST_EVENTS.forEach((ev, index) => {
        insertEvent.run(
          ev.id,
          ev.title,
          ev.tagline,
          ev.category,
          ev.date,
          ev.time,
          ev.venue,
          ev.image,
          ev.description,
          ev.teamSize,
          ev.entryFee,
          ev.prizes,
          ev.featured ? 1 : 0,
          index
        );
        ev.rules.forEach((rule, rIdx) => {
          insertRule.run(ev.id, rule, rIdx);
        });
        ev.coordinators.forEach((coord, cIdx) => {
          insertCoordinator.run(ev.id, coord.name, coord.contact, cIdx);
        });
      });
    }

    const passesCount = asNumber((db.prepare('SELECT COUNT(*) AS count FROM passes').get() as SqlRow | undefined)?.count);
    if (passesCount === 0) {
      const insertPass = db.prepare(`
        INSERT INTO passes (
          id, name, tagline, price, original_price, badge, is_popular, access_scope, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const insertFeature = db.prepare(
        'INSERT INTO pass_features (pass_id, feature_text, sort_order) VALUES (?, ?, ?)'
      );

      FEST_PASSES.forEach((pass, index) => {
        insertPass.run(
          pass.id,
          pass.name,
          pass.tagline,
          pass.price,
          pass.originalPrice,
          pass.isPopular ? 'Most Popular' : null,
          pass.isPopular ? 1 : 0,
          pass.accessScope,
          index
        );
        pass.features.forEach((feat, fIdx) => {
          insertFeature.run(pass.id, feat, fIdx);
        });
      });
    }

    const scheduleCount = asNumber((db.prepare('SELECT COUNT(*) AS count FROM schedule_items').get() as SqlRow | undefined)?.count);
    if (scheduleCount === 0) {
      const insertSchedule = db.prepare(`
        INSERT INTO schedule_items (id, day, time, title, category, venue, description, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      FEST_SCHEDULE.forEach((item, index) => {
        insertSchedule.run(
          `${item.day === 'Day 2' ? 'day2' : 'day1'}-${index + 1}`,
          item.day,
          item.time,
          item.title,
          item.category,
          item.venue,
          item.description,
          index
        );
      });
    }

    const faqsCount = asNumber((db.prepare('SELECT COUNT(*) AS count FROM faqs').get() as SqlRow | undefined)?.count);
    if (faqsCount === 0) {
      const insertFaq = db.prepare(
        'INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)'
      );
      FEST_FAQS.forEach((faq, index) => {
        insertFaq.run(faq.q, faq.a, index);
      });
    }

    const activityCount = asNumber((db.prepare('SELECT COUNT(*) AS count FROM activity_feed').get() as SqlRow | undefined)?.count);
    if (activityCount === 0) {
      const initialFeed = [
        { name: 'Aman Kumar', branch: 'CSE 3rd Yr', action: 'booked All-Events Pass (₹149)', time: '2m ago' },
        { name: 'Team CyberKnights', branch: 'CSE 2nd Yr', action: 'registered for HackArena (24H)', time: '4m ago' },
        { name: 'Rohan Patel', branch: 'Mechanical', action: 'registered for AeroStrike Drone Derby', time: '7m ago' },
        { name: 'Priya Sharma', branch: 'EE 3rd Yr', action: 'registered for Track-O-Bot', time: '11m ago' },
        { name: 'Squad AlphaX', branch: 'Civil & CSE', action: 'booked BGMI Esports Battle (₹29)', time: '15m ago' },
        { name: 'Vikash Gupta', branch: 'ECE 4th Yr', action: 'booked VIP All-Access Pass (₹199)', time: '18m ago' },
      ];
      const insertActivity = db.prepare(
        'INSERT INTO activity_feed (actor_name, branch, action_text, time_label) VALUES (?, ?, ?, ?)'
      );
      for (const item of initialFeed) {
        insertActivity.run(item.name, item.branch, item.action, item.time);
      }
    }

    const clubsCount = asNumber((db.prepare('SELECT COUNT(*) AS count FROM campus_clubs').get() as SqlRow | undefined)?.count);
    if (clubsCount === 0) {
      const insertClub = db.prepare(`
        INSERT INTO campus_clubs (id, name, role, icon, color_class, lead_name, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      FEST_CLUBS.forEach((club, index) => {
        insertClub.run(club.id, club.name, club.role, club.icon, club.colorClass, club.leadName, index);
      });
    }

    const organizersCount = asNumber((db.prepare('SELECT COUNT(*) AS count FROM organizers').get() as SqlRow | undefined)?.count);
    if (organizersCount === 0) {
      const insertOrg = db.prepare(`
        INSERT INTO organizers (id, name, role, department, phone, category, featured_footer, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      FEST_ORGANIZERS.forEach((member, index) => {
        insertOrg.run(
          member.id,
          member.name,
          member.role,
          member.department,
          member.phone,
          member.category,
          member.featuredFooter ? 1 : 0,
          index
        );
      });
    }

    const announcementsCount = asNumber((db.prepare('SELECT COUNT(*) AS count FROM announcements').get() as SqlRow | undefined)?.count);
    if (announcementsCount === 0) {
      const insertNotice = db.prepare(`
        INSERT INTO announcements (title, message, priority, is_active)
        VALUES (?, ?, ?, 1)
      `);
      insertNotice.run(
        'Delegate Pass Window Live',
        'All-Events Tech Passes (₹149) and Esports Arena slots (₹29) are open with instant HMAC-sealed QR verification.',
        'important'
      );
      insertNotice.run(
        'HackArena 24H Problem Statement Briefing',
        'Opening track release begins Day 1 at 10:30 AM sharp in the Central Computing Center, Admin Block.',
        'info'
      );
      insertNotice.run(
        'Carry College ID Card at Entry Gate',
        'Keep both your GEC Sheikhpura Student ID and digital QR Delegate Pass ready for rapid gate check-in.',
        'info'
      );
    }
  });
}

function runMigrations(db: DatabaseSync): void {
  const inquiryColumns = db.prepare('PRAGMA table_info(inquiries)').all() as SqlRow[];
  const existingCols = new Set(inquiryColumns.map((col) => asString(col.name)));
  if (!existingCols.has('admin_note')) {
    db.exec('ALTER TABLE inquiries ADD COLUMN admin_note TEXT;');
  }
  if (!existingCols.has('resolved_at')) {
    db.exec('ALTER TABLE inquiries ADD COLUMN resolved_at TEXT;');
  }

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS trg_inquiries_resolved_at
    AFTER UPDATE OF status ON inquiries
    FOR EACH ROW
    WHEN NEW.status != OLD.status
    BEGIN
      UPDATE inquiries
      SET resolved_at = CASE WHEN NEW.status = 'resolved' THEN datetime('now') ELSE NULL END
      WHERE id = NEW.id;
    END;
  `);

  db.prepare('INSERT OR IGNORE INTO schema_migrations (version, description) VALUES (?, ?)').run(
    1,
    'Core fest schema, registrations, inquiries, activity feed, audit logs'
  );
  db.prepare('INSERT OR IGNORE INTO schema_migrations (version, description) VALUES (?, ?)').run(
    2,
    'Added campus_clubs, organizers, announcements, event_results, analytics views, and inquiry resolution triggers'
  );

  const hasV3 = asNumber(
    (db.prepare('SELECT COUNT(*) AS c FROM schema_migrations WHERE version = 3').get() as SqlRow | undefined)?.c
  );
  if (hasV3 === 0) {
    db.prepare(`
      UPDATE organizers
      SET id = 'org-dilkhush', name = 'Dilkhush'
      WHERE id = 'org-aryan'
    `).run();
    db.prepare(`
      UPDATE organizers
      SET id = 'org-amrita', name = 'Amrita'
      WHERE id = 'org-aditya'
    `).run();
    db.prepare(`
      UPDATE organizers
      SET id = 'org-ashish', name = 'Ashish'
      WHERE id = 'org-vikash'
    `).run();
    db.prepare('INSERT OR IGNORE INTO schema_migrations (version, description) VALUES (?, ?)').run(
      3,
      'Updated footer organizer contacts to Dilkhush, Amrita, and Ashish'
    );
  }
}

export function initDatabase(customPath?: string): DatabaseSync {
  if (dbInstance && !customPath) {
    return dbInstance;
  }

  if (dbInstance && customPath) {
    closeDatabase();
  }

  const targetPath = customPath ?? getServerConfig().dbPath;
  if (targetPath !== ':memory:') {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  }

  const db = new DatabaseSync(targetPath);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA busy_timeout = 5000;');
  db.exec('PRAGMA foreign_keys = ON;');

  const schemaSql = fs.readFileSync(path.join(DB_MODULE_DIR, 'schema.sql'), 'utf8');
  db.exec(schemaSql);
  runMigrations(db);
  seedFestData(db);

  dbInstance = db;
  activeDbPath = targetPath;
  return db;
}

export function closeDatabase(): void {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch {
      // Ignore already closed instance
    }
    dbInstance = null;
    activeDbPath = ':memory:';
  }
}

export function getDb(): DatabaseSync {
  return dbInstance ?? initDatabase();
}

export function getFestInfo(): FestInfoPayload {
  const db = getDb();
  const row = db.prepare('SELECT * FROM fest_info WHERE id = 1').get() as SqlRow | undefined;
  if (!row) {
    return FEST_INFO;
  }
  let parsedStats: FestStat[] = FEST_INFO.stats;
  try {
    const candidate: unknown = JSON.parse(asString(row.stats_json, '[]'));
    if (Array.isArray(candidate)) {
      parsedStats = candidate as FestStat[];
    }
  } catch {
    parsedStats = FEST_INFO.stats;
  }

  return {
    name: asString(row.name, FEST_INFO.name),
    shortName: FEST_INFO.shortName,
    tagline: asString(row.tagline, FEST_INFO.tagline),
    subtitle: FEST_INFO.subtitle,
    collegeName: asString(row.college_name, FEST_INFO.collegeName),
    shortCollegeName: asString(row.short_college, FEST_INFO.shortCollegeName),
    dates: asString(row.dates, FEST_INFO.dates),
    venue: asString(row.venue, FEST_INFO.venue),
    stats: parsedStats,
    contacts: {
      email: asString(row.email, FEST_INFO.contacts.email),
      phone: asString(row.phone, FEST_INFO.contacts.phone),
      studentConvenor: asString(row.student_convenor, FEST_INFO.contacts.studentConvenor),
      telegram: asString(row.telegram, FEST_INFO.contacts.telegram),
    },
  };
}

export function updateFestInfo(input: UpdateFestInfoInput): FestInfoPayload {
  const db = getDb();
  const current = getFestInfo();
  db.prepare(`
    UPDATE fest_info
    SET tagline = ?, dates = ?, venue = ?, email = ?, phone = ?,
        student_convenor = ?, telegram = ?, updated_at = datetime('now')
    WHERE id = 1
  `).run(
    input.tagline?.trim() || current.tagline,
    input.dates?.trim() || current.dates,
    input.venue?.trim() || current.venue,
    input.email?.trim() || current.contacts.email,
    input.phone?.trim() || current.contacts.phone,
    input.studentConvenor?.trim() || current.contacts.studentConvenor,
    input.telegram?.trim() || current.contacts.telegram
  );
  return getFestInfo();
}

function hydrateEventRows(db: DatabaseSync, eventRows: SqlRow[]): FestEvent[] {
  const rulesRows = db.prepare('SELECT event_id, rule_text FROM event_rules ORDER BY sort_order ASC, id ASC').all() as SqlRow[];
  const coordRows = db.prepare('SELECT event_id, name, contact FROM event_coordinators ORDER BY sort_order ASC, id ASC').all() as SqlRow[];

  const rulesMap = new Map<string, string[]>();
  for (const r of rulesRows) {
    const eid = asString(r.event_id);
    const list = rulesMap.get(eid) ?? [];
    list.push(asString(r.rule_text));
    rulesMap.set(eid, list);
  }

  const coordMap = new Map<string, { name: string; contact: string }[]>();
  for (const c of coordRows) {
    const eid = asString(c.event_id);
    const list = coordMap.get(eid) ?? [];
    list.push({ name: asString(c.name), contact: asString(c.contact) });
    coordMap.set(eid, list);
  }

  return eventRows.map((row) => {
    const id = asString(row.id);
    return {
      id,
      title: asString(row.title),
      tagline: asString(row.tagline),
      category: asString(row.category) as FestEvent['category'],
      date: asString(row.date),
      time: asString(row.time),
      venue: asString(row.venue),
      image: asString(row.image),
      description: asString(row.description),
      teamSize: asString(row.team_size),
      entryFee: asString(row.entry_fee),
      prizes: asString(row.prizes),
      rules: rulesMap.get(id) ?? [],
      coordinators: coordMap.get(id) ?? [],
      featured: asNumber(row.featured) === 1,
    };
  });
}

export function listEvents(filters?: { category?: string; q?: string }): FestEvent[] {
  const db = getDb();
  const clauses: string[] = [];
  const params: string[] = [];

  if (filters?.category && filters.category !== 'All') {
    clauses.push('category = ?');
    params.push(filters.category);
  }

  if (filters?.q && filters.q.trim() !== '') {
    const pattern = `%${filters.q.trim().toLowerCase()}%`;
    clauses.push('(LOWER(title) LIKE ? OR LOWER(tagline) LIKE ? OR LOWER(description) LIKE ? OR LOWER(venue) LIKE ?)');
    params.push(pattern, pattern, pattern, pattern);
  }

  const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = db.prepare(`SELECT * FROM events ${whereSql} ORDER BY sort_order ASC, created_at ASC`).all(...params) as SqlRow[];
  return hydrateEventRows(db, rows);
}

export function getEventById(id: string): FestEvent | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM events WHERE id = ?').get(id) as SqlRow | undefined;
  if (!row) return null;
  return hydrateEventRows(db, [row])[0] ?? null;
}

export function createEvent(input: CreateEventInput): FestEvent {
  const db = getDb();
  withTransaction(db, () => {
    const maxSort = asNumber((db.prepare('SELECT COALESCE(MAX(sort_order), 0) AS m FROM events').get() as SqlRow | undefined)?.m);
    db.prepare(`
      INSERT INTO events (
        id, title, tagline, category, date, time, venue, image,
        description, team_size, entry_fee, prizes, featured, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      input.id,
      input.title,
      input.tagline,
      input.category,
      input.date,
      input.time,
      input.venue,
      input.image,
      input.description,
      input.teamSize,
      input.entryFee,
      input.prizes,
      input.featured ? 1 : 0,
      maxSort + 1
    );

    const insertRule = db.prepare('INSERT INTO event_rules (event_id, rule_text, sort_order) VALUES (?, ?, ?)');
    input.rules.forEach((rule, idx) => insertRule.run(input.id, rule, idx));

    const insertCoord = db.prepare('INSERT INTO event_coordinators (event_id, name, contact, sort_order) VALUES (?, ?, ?, ?)');
    input.coordinators.forEach((c, idx) => insertCoord.run(input.id, c.name, c.contact, idx));
  });

  const created = getEventById(input.id);
  if (!created) {
    throw new Error('Failed to load newly created event');
  }
  return created;
}

export function deleteEvent(id: string): boolean {
  const db = getDb();
  const info = db.prepare('DELETE FROM events WHERE id = ?').run(id);
  return info.changes > 0;
}

export function updateEvent(
  id: string,
  input: Partial<Omit<CreateEventInput, 'id'>>
): FestEvent | null {
  const existing = getEventById(id);
  if (!existing) return null;

  const db = getDb();
  withTransaction(db, () => {
    db.prepare(`
      UPDATE events
      SET title = ?, tagline = ?, category = ?, date = ?, time = ?, venue = ?,
          image = ?, description = ?, team_size = ?, entry_fee = ?, prizes = ?, featured = ?
      WHERE id = ?
    `).run(
      input.title?.trim() ?? existing.title,
      input.tagline?.trim() ?? existing.tagline,
      input.category ?? existing.category,
      input.date?.trim() ?? existing.date,
      input.time?.trim() ?? existing.time,
      input.venue?.trim() ?? existing.venue,
      input.image?.trim() ?? existing.image,
      input.description?.trim() ?? existing.description,
      input.teamSize?.trim() ?? existing.teamSize,
      input.entryFee?.trim() ?? existing.entryFee,
      input.prizes?.trim() ?? existing.prizes,
      input.featured !== undefined ? (input.featured ? 1 : 0) : existing.featured ? 1 : 0,
      id
    );

    if (input.rules) {
      db.prepare('DELETE FROM event_rules WHERE event_id = ?').run(id);
      const insertRule = db.prepare('INSERT INTO event_rules (event_id, rule_text, sort_order) VALUES (?, ?, ?)');
      input.rules.forEach((rule, idx) => insertRule.run(id, rule, idx));
    }

    if (input.coordinators) {
      db.prepare('DELETE FROM event_coordinators WHERE event_id = ?').run(id);
      const insertCoord = db.prepare('INSERT INTO event_coordinators (event_id, name, contact, sort_order) VALUES (?, ?, ?, ?)');
      input.coordinators.forEach((c, idx) => insertCoord.run(id, c.name, c.contact, idx));
    }
  });

  return getEventById(id);
}

export function getEventStats(eventId: string): {
  eventId: string;
  eventTitle: string;
  totalRegistrations: number;
  checkedInCount: number;
} | null {
  const db = getDb();
  const row = db
    .prepare(
      'SELECT event_id, event_title, total_registrations, checked_in_count FROM v_event_registration_summary WHERE event_id = ?'
    )
    .get(eventId) as SqlRow | undefined;

  if (!row) return null;

  return {
    eventId: asString(row.event_id),
    eventTitle: asString(row.event_title),
    totalRegistrations: asNumber(row.total_registrations),
    checkedInCount: asNumber(row.checked_in_count),
  };
}

export function listPasses(): FestPass[] {
  const db = getDb();
  const passRows = db.prepare('SELECT * FROM passes ORDER BY sort_order ASC').all() as SqlRow[];
  const featRows = db.prepare('SELECT pass_id, feature_text FROM pass_features ORDER BY sort_order ASC, id ASC').all() as SqlRow[];

  const featMap = new Map<string, string[]>();
  for (const row of featRows) {
    const pid = asString(row.pass_id);
    const list = featMap.get(pid) ?? [];
    list.push(asString(row.feature_text));
    featMap.set(pid, list);
  }

  return passRows.map((row) => {
    const id = asString(row.id);
    return {
      id,
      name: asString(row.name),
      tagline: asString(row.tagline),
      price: asNumber(row.price),
      originalPrice: asNumber(row.original_price),
      isPopular: asNumber(row.is_popular) === 1,
      accessScope: asString(row.access_scope),
      features: featMap.get(id) ?? [],
    };
  });
}

export function updatePass(id: string, patch: UpdatePassInput): FestPass | null {
  const existing = listPasses().find((p) => p.id === id);
  if (!existing) return null;

  const db = getDb();
  withTransaction(db, () => {
    const nextPopular = patch.isPopular !== undefined ? patch.isPopular : Boolean(existing.isPopular);
    db.prepare(`
      UPDATE passes
      SET name = ?, tagline = ?, price = ?, original_price = ?, is_popular = ?, access_scope = ?
      WHERE id = ?
    `).run(
      patch.name?.trim() ?? existing.name,
      patch.tagline?.trim() ?? existing.tagline,
      patch.price ?? existing.price,
      patch.originalPrice ?? existing.originalPrice,
      nextPopular ? 1 : 0,
      patch.accessScope?.trim() ?? existing.accessScope,
      id
    );

    if (patch.features && patch.features.length > 0) {
      db.prepare('DELETE FROM pass_features WHERE pass_id = ?').run(id);
      const insertFeat = db.prepare('INSERT INTO pass_features (pass_id, feature_text, sort_order) VALUES (?, ?, ?)');
      patch.features.forEach((feat, idx) => insertFeat.run(id, feat.trim(), idx));
    }
  });

  return listPasses().find((p) => p.id === id) ?? null;
}

export function listSchedule(day?: 'Day 1' | 'Day 2'): ScheduleItemRecord[] {
  const db = getDb();
  const rows = day
    ? (db.prepare('SELECT * FROM schedule_items WHERE day = ? ORDER BY sort_order ASC').all(day) as SqlRow[])
    : (db.prepare('SELECT * FROM schedule_items ORDER BY sort_order ASC').all() as SqlRow[]);

  return rows.map((row) => ({
    id: asString(row.id),
    day: asString(row.day) as 'Day 1' | 'Day 2',
    time: asString(row.time),
    title: asString(row.title),
    category: asString(row.category),
    venue: asString(row.venue),
    description: asString(row.description),
  }));
}

export function createScheduleItem(input: CreateScheduleInput): ScheduleItemRecord {
  const db = getDb();
  const maxSort = asNumber((db.prepare('SELECT COALESCE(MAX(sort_order), 0) AS m FROM schedule_items').get() as SqlRow | undefined)?.m);
  const id = input.id?.trim() || `${input.day === 'Day 2' ? 'day2' : 'day1'}-${Date.now()}`;
  db.prepare(`
    INSERT INTO schedule_items (id, day, time, title, category, venue, description, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.day,
    input.time.trim(),
    input.title.trim(),
    input.category.trim(),
    input.venue.trim(),
    input.description.trim(),
    maxSort + 1
  );
  return {
    id,
    day: input.day,
    time: input.time.trim(),
    title: input.title.trim(),
    category: input.category.trim(),
    venue: input.venue.trim(),
    description: input.description.trim(),
  };
}

export function deleteScheduleItem(id: string): boolean {
  const db = getDb();
  const info = db.prepare('DELETE FROM schedule_items WHERE id = ?').run(id);
  return info.changes > 0;
}

export function updateScheduleItem(
  id: string,
  patch: Partial<Omit<CreateScheduleInput, 'id'>>
): ScheduleItemRecord | null {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM schedule_items WHERE id = ?').get(id) as SqlRow | undefined;
  if (!existing) return null;

  const day = patch.day ?? (asString(existing.day) as 'Day 1' | 'Day 2');
  const time = patch.time?.trim() ?? asString(existing.time);
  const title = patch.title?.trim() ?? asString(existing.title);
  const category = patch.category?.trim() ?? asString(existing.category);
  const venue = patch.venue?.trim() ?? asString(existing.venue);
  const description = patch.description?.trim() ?? asString(existing.description);

  db.prepare(`
    UPDATE schedule_items
    SET day = ?, time = ?, title = ?, category = ?, venue = ?, description = ?
    WHERE id = ?
  `).run(day, time, title, category, venue, description, id);

  return { id, day, time, title, category, venue, description };
}

export function listFaqs(): FaqItem[] {
  const db = getDb();
  const rows = db.prepare('SELECT id, question, answer FROM faqs ORDER BY sort_order ASC, id ASC').all() as SqlRow[];
  return rows.map((row) => ({
    id: asNumber(row.id),
    q: asString(row.question),
    a: asString(row.answer),
  }));
}

export function createFaq(input: { q: string; a: string }): FaqItem {
  const db = getDb();
  const maxSort = asNumber((db.prepare('SELECT COALESCE(MAX(sort_order), 0) AS m FROM faqs').get() as SqlRow | undefined)?.m);
  const info = db
    .prepare('INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)')
    .run(input.q.trim(), input.a.trim(), maxSort + 1);
  return {
    id: Number(info.lastInsertRowid),
    q: input.q.trim(),
    a: input.a.trim(),
  };
}

export function updateFaq(id: number, patch: { q?: string; a?: string }): FaqItem | null {
  const db = getDb();
  const existing = db.prepare('SELECT id, question, answer FROM faqs WHERE id = ?').get(id) as SqlRow | undefined;
  if (!existing) return null;
  const q = patch.q?.trim() ?? asString(existing.question);
  const a = patch.a?.trim() ?? asString(existing.answer);
  db.prepare('UPDATE faqs SET question = ?, answer = ? WHERE id = ?').run(q, a, id);
  return { id, q, a };
}

export function deleteFaq(id: number): boolean {
  const db = getDb();
  const info = db.prepare('DELETE FROM faqs WHERE id = ?').run(id);
  return info.changes > 0;
}

export function listActivity(limit = 10): ActivityItem[] {
  const db = getDb();
  const rows = db
    .prepare('SELECT id, actor_name, branch, action_text, time_label, created_at FROM activity_feed ORDER BY id DESC LIMIT ?')
    .all(limit) as SqlRow[];
  return rows.map((row) => ({
    id: asNumber(row.id),
    name: asString(row.actor_name),
    branch: asString(row.branch),
    action: asString(row.action_text),
    time: asString(row.time_label),
    createdAt: asString(row.created_at),
  }));
}

function mapRegistrationRow(row: SqlRow): RegistrationRecord {
  const regId = asString(row.reg_id);
  const passId = asString(row.pass_id);
  const rollNo = asString(row.roll_no);
  const email = asString(row.email);

  return {
    regId,
    passId,
    passName: asString(row.pass_name),
    price: asNumber(row.price),
    eventId: asNullableString(row.event_id),
    eventTitle: asNullableString(row.event_title),
    fullName: asString(row.full_name),
    rollNo,
    branch: asString(row.branch),
    year: asString(row.year),
    phone: asString(row.phone),
    email,
    teamName: asNullableString(row.team_name),
    verifyCode: computePassVerifyCode(regId, passId, rollNo, email),
    checkedIn: asNumber(row.checked_in) === 1,
    checkedInAt: asNullableString(row.checked_in_at),
    bookedAt: asString(row.booked_at),
    createdAt: asString(row.created_at),
  };
}

export class DuplicateRegistrationError extends Error {
  readonly existingRegId: string;
  constructor(existingRegId: string, message: string) {
    super(message);
    this.existingRegId = existingRegId;
  }
}

export function createRegistration(input: CreateRegistrationInput): RegistrationRecord {
  const db = getDb();
  const passRow = db.prepare('SELECT id, name, price FROM passes WHERE id = ?').get(input.passId) as SqlRow | undefined;
  if (!passRow) {
    throw new Error(`Unknown pass tier: ${input.passId}`);
  }

  let eventTitle: string | null = null;
  let resolvedEventId: string | null = null;
  if (input.eventId) {
    const evRow = db.prepare('SELECT id, title FROM events WHERE id = ?').get(input.eventId) as SqlRow | undefined;
    if (!evRow) {
      throw new Error(`Unknown event id: ${input.eventId}`);
    }
    resolvedEventId = asString(evRow.id);
    eventTitle = asString(evRow.title);
  }

  const normalizedRoll = input.rollNo.trim().toUpperCase();
  const normalizedEmail = input.email.trim().toLowerCase();

  return withTransaction(db, () => {
    const duplicate = db
      .prepare('SELECT reg_id FROM registrations WHERE pass_id = ? AND (UPPER(roll_no) = ? OR LOWER(email) = ?) LIMIT 1')
      .get(input.passId, normalizedRoll, normalizedEmail) as SqlRow | undefined;

    if (duplicate) {
      const existingId = asString(duplicate.reg_id);
      throw new DuplicateRegistrationError(
        existingId,
        `A ${asString(passRow.name)} pass is already registered under Roll No or Email (${existingId}). Use Verify Pass to view it.`
      );
    }

    let regId = '';
    const checkExists = db.prepare('SELECT 1 FROM registrations WHERE reg_id = ?');
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = `TS26-GECS-${randomInt(10000, 100000)}`;
      if (!checkExists.get(candidate)) {
        regId = candidate;
        break;
      }
    }
    if (!regId) {
      throw new Error('Could not allocate unique registration ID');
    }

    const passName = asString(passRow.name);
    const price = asNumber(passRow.price);
    const bookedAt = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    db.prepare(`
      INSERT INTO registrations (
        reg_id, pass_id, pass_name, price, event_id, event_title,
        full_name, roll_no, branch, year, phone, email, team_name, booked_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      regId,
      input.passId,
      passName,
      price,
      resolvedEventId,
      eventTitle,
      input.fullName.trim(),
      normalizedRoll,
      input.branch.trim(),
      input.year.trim(),
      input.phone.trim(),
      normalizedEmail,
      input.teamName?.trim() || null,
      bookedAt
    );

    const shortBranch = input.branch.includes('(')
      ? input.branch.slice(input.branch.indexOf('(') + 1, input.branch.indexOf(')'))
      : input.branch;
    const actionText = eventTitle
      ? `registered for ${eventTitle} (${passName})`
      : `booked ${passName} (₹${price})`;

    db.prepare(
      'INSERT INTO activity_feed (actor_name, branch, action_text, time_label) VALUES (?, ?, ?, ?)'
    ).run(input.fullName.trim(), shortBranch, actionText, 'Just now');

    const created = db.prepare('SELECT * FROM registrations WHERE reg_id = ?').get(regId) as SqlRow | undefined;
    if (!created) {
      throw new Error('Failed to retrieve saved registration');
    }
    return mapRegistrationRow(created);
  });
}

export function verifyRegistrations(query: string): RegistrationRecord[] {
  const db = getDb();
  const clean = query.trim();
  if (!clean) return [];
  const rows = db
    .prepare(
      `SELECT * FROM registrations
       WHERE UPPER(reg_id) = UPPER(?) OR UPPER(roll_no) = UPPER(?) OR LOWER(email) = LOWER(?)
       ORDER BY created_at DESC`
    )
    .all(clean, clean, clean) as SqlRow[];
  return rows.map(mapRegistrationRow);
}

export function getRegistrationById(regId: string): RegistrationRecord | null {
  const db = getDb();
  const row = db
    .prepare('SELECT * FROM registrations WHERE UPPER(reg_id) = UPPER(?)')
    .get(regId.trim()) as SqlRow | undefined;
  return row ? mapRegistrationRow(row) : null;
}

export function updateRegistration(
  regId: string,
  patch: { teamName?: string | null; phone?: string; branch?: string; year?: string }
): RegistrationRecord | null {
  const existing = getRegistrationById(regId);
  if (!existing) return null;
  const db = getDb();
  db.prepare(`
    UPDATE registrations
    SET team_name = ?, phone = ?, branch = ?, year = ?
    WHERE reg_id = ?
  `).run(
    patch.teamName !== undefined ? (patch.teamName?.trim() || null) : existing.teamName,
    patch.phone?.trim() || existing.phone,
    patch.branch?.trim() || existing.branch,
    patch.year?.trim() || existing.year,
    existing.regId
  );
  return getRegistrationById(existing.regId);
}

export function queryRegistrations(options?: {
  q?: string;
  passId?: string;
  checkedIn?: boolean;
  page?: number;
  limit?: number;
}): {
  items: RegistrationRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const db = getDb();
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (options?.passId) {
    clauses.push('pass_id = ?');
    params.push(options.passId);
  }
  if (typeof options?.checkedIn === 'boolean') {
    clauses.push('checked_in = ?');
    params.push(options.checkedIn ? 1 : 0);
  }
  const cleanQ = options?.q?.trim().toLowerCase();
  if (cleanQ) {
    clauses.push(
      '(LOWER(reg_id) LIKE ? OR LOWER(full_name) LIKE ? OR LOWER(roll_no) LIKE ? OR LOWER(email) LIKE ? OR LOWER(branch) LIKE ?)'
    );
    const pattern = `%${cleanQ}%`;
    params.push(pattern, pattern, pattern, pattern, pattern);
  }

  const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  const total = asNumber(
    (db.prepare(`SELECT COUNT(*) AS c FROM registrations ${whereSql}`).get(...params) as SqlRow | undefined)?.c
  );
  const limit = Math.min(Math.max(options?.limit ?? 25, 1), 100);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const page = Math.min(Math.max(options?.page ?? 1, 1), totalPages);
  const offset = (page - 1) * limit;

  const rows = db
    .prepare(`SELECT * FROM registrations ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset) as SqlRow[];

  return {
    items: rows.map(mapRegistrationRow),
    total,
    page,
    limit,
    totalPages,
  };
}

function sanitizeCsvField(value: string | number | boolean | null): string {
  const raw = String(value ?? '');
  const isSafeSignedNumber = /^[+-]?\d[\d\s()-]*$/.test(raw);
  const guarded =
    !isSafeSignedNumber && /^[=@\t\r+-]/.test(raw) ? `'${raw}` : raw;
  return `"${guarded.replace(/"/g, '""')}"`;
}

export function exportRegistrationsCsv(): string {
  const db = getDb();
  const rows = (db.prepare('SELECT * FROM registrations ORDER BY created_at DESC').all() as SqlRow[]).map(mapRegistrationRow);
  const headers = [
    'RegID',
    'FullName',
    'RollNo',
    'Branch',
    'Year',
    'PassID',
    'PassName',
    'Price',
    'Event',
    'Team',
    'Phone',
    'Email',
    'VerifyCode',
    'CheckedIn',
    'CheckedInAt',
    'BookedAt',
    'CreatedAt',
  ];

  const lines = rows.map((r) =>
    [
      r.regId,
      r.fullName,
      r.rollNo,
      r.branch,
      r.year,
      r.passId,
      r.passName,
      r.price,
      r.eventTitle,
      r.teamName,
      r.phone,
      r.email,
      r.verifyCode,
      r.checkedIn,
      r.checkedInAt,
      r.bookedAt,
      r.createdAt,
    ]
      .map(sanitizeCsvField)
      .join(',')
  );

  return [headers.join(','), ...lines].join('\r\n');
}

export function setRegistrationCheckIn(regId: string, checkedIn: boolean): RegistrationRecord | null {
  const db = getDb();
  const timestamp = checkedIn ? new Date().toISOString() : null;
  const info = db
    .prepare('UPDATE registrations SET checked_in = ?, checked_in_at = ? WHERE reg_id = ?')
    .run(checkedIn ? 1 : 0, timestamp, regId);
  if (info.changes === 0) return null;
  const updated = db.prepare('SELECT * FROM registrations WHERE reg_id = ?').get(regId) as SqlRow | undefined;
  return updated ? mapRegistrationRow(updated) : null;
}

export function deleteRegistration(regId: string): boolean {
  const db = getDb();
  const info = db.prepare('DELETE FROM registrations WHERE reg_id = ?').run(regId);
  return info.changes > 0;
}

function mapInquiryRow(row: SqlRow): InquiryRecord {
  return {
    id: asNumber(row.id),
    name: asString(row.name),
    email: asString(row.email),
    rollNo: asNullableString(row.roll_no),
    subject: asString(row.subject),
    message: asString(row.message),
    status: asString(row.status) as 'open' | 'resolved',
    adminNote: asNullableString(row.admin_note),
    resolvedAt: asNullableString(row.resolved_at),
    createdAt: asString(row.created_at),
  };
}

export function createInquiry(input: CreateInquiryInput): InquiryRecord {
  const db = getDb();
  const info = db
    .prepare('INSERT INTO inquiries (name, email, roll_no, subject, message) VALUES (?, ?, ?, ?, ?)')
    .run(
      input.name.trim(),
      input.email.trim().toLowerCase(),
      input.rollNo?.trim().toUpperCase() || null,
      input.subject.trim(),
      input.message.trim()
    );
  const row = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(Number(info.lastInsertRowid)) as SqlRow | undefined;
  if (!row) {
    throw new Error('Failed to create inquiry');
  }
  return mapInquiryRow(row);
}

export function updateInquiryStatus(
  id: number,
  status: 'open' | 'resolved',
  adminNote?: string
): InquiryRecord | null {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id) as SqlRow | undefined;
  if (!existing) return null;
  const resolvedAt = status === 'resolved' ? new Date().toISOString() : null;
  const nextNote = adminNote !== undefined ? (adminNote.trim() || null) : asNullableString(existing.admin_note);
  db.prepare('UPDATE inquiries SET status = ?, admin_note = ?, resolved_at = ? WHERE id = ?').run(
    status,
    nextNote,
    resolvedAt,
    id
  );
  const row = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id) as SqlRow | undefined;
  return row ? mapInquiryRow(row) : null;
}

export function deleteInquiry(id: number): boolean {
  const db = getDb();
  const info = db.prepare('DELETE FROM inquiries WHERE id = ?').run(id);
  return info.changes > 0;
}

export function listClubs(): CampusClub[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM campus_clubs ORDER BY sort_order ASC, name ASC').all() as SqlRow[];
  return rows.map((row) => ({
    id: asString(row.id),
    name: asString(row.name),
    role: asString(row.role),
    icon: asString(row.icon) as CampusClub['icon'],
    colorClass: asString(row.color_class),
    leadName: asString(row.lead_name),
  }));
}

export function createClub(input: CampusClub): CampusClub {
  const db = getDb();
  const maxSort = asNumber((db.prepare('SELECT COALESCE(MAX(sort_order), 0) AS m FROM campus_clubs').get() as SqlRow | undefined)?.m);
  db.prepare(`
    INSERT INTO campus_clubs (id, name, role, icon, color_class, lead_name, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.id.trim(),
    input.name.trim(),
    input.role.trim(),
    input.icon,
    input.colorClass.trim(),
    input.leadName.trim(),
    maxSort + 1
  );
  return { ...input };
}

export function deleteClub(id: string): boolean {
  const db = getDb();
  const info = db.prepare('DELETE FROM campus_clubs WHERE id = ?').run(id);
  return info.changes > 0;
}

export function listOrganizers(category?: OrganizerMember['category']): OrganizerMember[] {
  const db = getDb();
  const rows = category
    ? (db.prepare('SELECT * FROM organizers WHERE category = ? ORDER BY sort_order ASC, name ASC').all(category) as SqlRow[])
    : (db.prepare('SELECT * FROM organizers ORDER BY sort_order ASC, name ASC').all() as SqlRow[]);
  return rows.map((row) => ({
    id: asString(row.id),
    name: asString(row.name),
    role: asString(row.role),
    department: asString(row.department),
    phone: asString(row.phone),
    category: asString(row.category) as OrganizerMember['category'],
    featuredFooter: asNumber(row.featured_footer) === 1,
  }));
}

export function createOrganizer(input: OrganizerMember): OrganizerMember {
  const db = getDb();
  const maxSort = asNumber((db.prepare('SELECT COALESCE(MAX(sort_order), 0) AS m FROM organizers').get() as SqlRow | undefined)?.m);
  db.prepare(`
    INSERT INTO organizers (id, name, role, department, phone, category, featured_footer, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.id.trim(),
    input.name.trim(),
    input.role.trim(),
    input.department.trim(),
    input.phone.trim(),
    input.category,
    input.featuredFooter ? 1 : 0,
    maxSort + 1
  );
  return { ...input };
}

export function deleteOrganizer(id: string): boolean {
  const db = getDb();
  const info = db.prepare('DELETE FROM organizers WHERE id = ?').run(id);
  return info.changes > 0;
}

function mapAnnouncementRow(row: SqlRow): AnnouncementRecord {
  return {
    id: asNumber(row.id),
    title: asString(row.title),
    message: asString(row.message),
    priority: asString(row.priority) as AnnouncementRecord['priority'],
    isActive: asNumber(row.is_active) === 1,
    createdAt: asString(row.created_at),
  };
}

export function listAnnouncements(activeOnly = false): AnnouncementRecord[] {
  const db = getDb();
  const rows = activeOnly
    ? (db.prepare('SELECT * FROM announcements WHERE is_active = 1 ORDER BY id DESC').all() as SqlRow[])
    : (db.prepare('SELECT * FROM announcements ORDER BY id DESC').all() as SqlRow[]);
  return rows.map(mapAnnouncementRow);
}

export function createAnnouncement(input: {
  title: string;
  message: string;
  priority: AnnouncementRecord['priority'];
}): AnnouncementRecord {
  const db = getDb();
  const info = db
    .prepare('INSERT INTO announcements (title, message, priority, is_active) VALUES (?, ?, ?, 1)')
    .run(input.title.trim(), input.message.trim(), input.priority);
  const row = db
    .prepare('SELECT * FROM announcements WHERE id = ?')
    .get(Number(info.lastInsertRowid)) as SqlRow | undefined;
  if (!row) {
    throw new Error('Failed to create announcement');
  }
  return mapAnnouncementRow(row);
}

export function toggleAnnouncementActive(id: number, isActive: boolean): AnnouncementRecord | null {
  const db = getDb();
  const info = db
    .prepare('UPDATE announcements SET is_active = ? WHERE id = ?')
    .run(isActive ? 1 : 0, id);
  if (info.changes === 0) return null;
  const row = db.prepare('SELECT * FROM announcements WHERE id = ?').get(id) as SqlRow | undefined;
  return row ? mapAnnouncementRow(row) : null;
}

export function deleteAnnouncement(id: number): boolean {
  const db = getDb();
  const info = db.prepare('DELETE FROM announcements WHERE id = ?').run(id);
  return info.changes > 0;
}

export function listEventResults(eventId?: string): EventResultRecord[] {
  const db = getDb();
  const baseQuery = `
    SELECT r.*, e.title AS event_title
    FROM event_results r
    JOIN events e ON e.id = r.event_id
  `;
  const rows = eventId
    ? (db.prepare(`${baseQuery} WHERE r.event_id = ? ORDER BY r.id ASC`).all(eventId) as SqlRow[])
    : (db.prepare(`${baseQuery} ORDER BY r.id DESC`).all() as SqlRow[]);
  return rows.map((row) => ({
    id: asNumber(row.id),
    eventId: asString(row.event_id),
    eventTitle: asString(row.event_title),
    position: asString(row.position),
    winnerName: asString(row.winner_name),
    teamName: asNullableString(row.team_name),
    branch: asString(row.branch),
    rollNo: asNullableString(row.roll_no),
    prize: asString(row.prize),
    announcedAt: asString(row.announced_at),
  }));
}

export function createEventResult(input: {
  eventId: string;
  position: string;
  winnerName: string;
  teamName?: string;
  branch: string;
  rollNo?: string;
  prize: string;
}): EventResultRecord {
  const event = getEventById(input.eventId);
  if (!event) {
    throw new Error(`Event '${input.eventId}' does not exist`);
  }
  const db = getDb();
  const info = db
    .prepare(`
      INSERT INTO event_results (event_id, position, winner_name, team_name, branch, roll_no, prize)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      input.eventId,
      input.position.trim(),
      input.winnerName.trim(),
      input.teamName?.trim() || null,
      input.branch.trim(),
      input.rollNo?.trim().toUpperCase() || null,
      input.prize.trim()
    );
  const created = listEventResults(input.eventId).find((item) => item.id === Number(info.lastInsertRowid));
  if (!created) {
    throw new Error('Failed to create event result');
  }
  return created;
}

export function deleteEventResult(id: number): boolean {
  const db = getDb();
  const info = db.prepare('DELETE FROM event_results WHERE id = ?').run(id);
  return info.changes > 0;
}

const ALL_TABLES = [
  'schema_migrations',
  'fest_info',
  'events',
  'event_rules',
  'event_coordinators',
  'passes',
  'pass_features',
  'schedule_items',
  'faqs',
  'registrations',
  'inquiries',
  'activity_feed',
  'audit_logs',
  'campus_clubs',
  'organizers',
  'announcements',
  'event_results',
] as const;

export function getDatabaseDiagnostics(): DatabaseDiagnostics {
  const db = getDb();
  const integrityRow = db.prepare('PRAGMA integrity_check').get() as SqlRow | undefined;
  const journalRow = db.prepare('PRAGMA journal_mode').get() as SqlRow | undefined;
  const fkRow = db.prepare('PRAGMA foreign_keys').get() as SqlRow | undefined;
  const pageSizeRow = db.prepare('PRAGMA page_size').get() as SqlRow | undefined;
  const pageCountRow = db.prepare('PRAGMA page_count').get() as SqlRow | undefined;
  const versionRow = db
    .prepare('SELECT COALESCE(MAX(version), 0) AS v FROM schema_migrations')
    .get() as SqlRow | undefined;

  const tableCounts: Record<string, number> = {};
  for (const table of ALL_TABLES) {
    const countRow = db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get() as SqlRow | undefined;
    tableCounts[table] = asNumber(countRow?.c);
  }

  const pageSize = asNumber(pageSizeRow?.page_size, 4096);
  const pageCount = asNumber(pageCountRow?.page_count, 0);

  return {
    dbPath: activeDbPath,
    journalMode: asString(journalRow?.journal_mode, 'wal'),
    foreignKeys: asNumber(fkRow?.foreign_keys) === 1,
    integrityCheck: asString(integrityRow?.integrity_check, 'ok'),
    schemaVersion: asNumber(versionRow?.v),
    pageSize,
    pageCount,
    estimatedBytes: pageSize * pageCount,
    tableCounts,
  };
}

export function createDatabaseBackupBuffer(): Buffer {
  const db = getDb();
  const tmpFile = path.join(os.tmpdir(), `techysheikhpura-backup-${Date.now()}-${randomInt(1000, 9999)}.db`);
  try {
    db.prepare('VACUUM INTO ?').run(tmpFile);
    return fs.readFileSync(tmpFile);
  } finally {
    if (fs.existsSync(tmpFile)) {
      fs.rmSync(tmpFile, { force: true });
    }
  }
}

export function recordAuditLog(
  action: string,
  targetType: string,
  targetId: string,
  details: string
): void {
  const db = getDb();
  db.prepare(
    'INSERT INTO audit_logs (action, target_type, target_id, details) VALUES (?, ?, ?, ?)'
  ).run(action, targetType, targetId, details);
}

export function listAuditLogs(limit = 50): AuditLogRecord[] {
  const db = getDb();
  const safeLimit = Math.min(Math.max(limit, 1), 200);
  const rows = db
    .prepare('SELECT id, action, target_type, target_id, details, created_at FROM audit_logs ORDER BY id DESC LIMIT ?')
    .all(safeLimit) as SqlRow[];
  return rows.map((row) => ({
    id: asNumber(row.id),
    action: asString(row.action),
    targetType: asString(row.target_type),
    targetId: asString(row.target_id),
    details: asString(row.details),
    createdAt: asString(row.created_at),
  }));
}

export function getHealthStats() {
  const db = getDb();
  return {
    events: asNumber((db.prepare('SELECT COUNT(*) AS c FROM events').get() as SqlRow | undefined)?.c),
    passes: asNumber((db.prepare('SELECT COUNT(*) AS c FROM passes').get() as SqlRow | undefined)?.c),
    schedule: asNumber((db.prepare('SELECT COUNT(*) AS c FROM schedule_items').get() as SqlRow | undefined)?.c),
    faqs: asNumber((db.prepare('SELECT COUNT(*) AS c FROM faqs').get() as SqlRow | undefined)?.c),
    registrations: asNumber((db.prepare('SELECT COUNT(*) AS c FROM registrations').get() as SqlRow | undefined)?.c),
    checkedIn: asNumber((db.prepare('SELECT COUNT(*) AS c FROM registrations WHERE checked_in = 1').get() as SqlRow | undefined)?.c),
    inquiries: asNumber((db.prepare('SELECT COUNT(*) AS c FROM inquiries').get() as SqlRow | undefined)?.c),
    clubs: asNumber((db.prepare('SELECT COUNT(*) AS c FROM campus_clubs').get() as SqlRow | undefined)?.c),
    organizers: asNumber((db.prepare('SELECT COUNT(*) AS c FROM organizers').get() as SqlRow | undefined)?.c),
    announcements: asNumber((db.prepare('SELECT COUNT(*) AS c FROM announcements WHERE is_active = 1').get() as SqlRow | undefined)?.c),
    results: asNumber((db.prepare('SELECT COUNT(*) AS c FROM event_results').get() as SqlRow | undefined)?.c),
  };
}

export function getFestBundle() {
  return {
    festInfo: getFestInfo(),
    events: listEvents(),
    passes: listPasses(),
    schedule: listSchedule(),
    faqs: listFaqs(),
    clubs: listClubs(),
    organizers: listOrganizers(),
    announcements: listAnnouncements(true),
    results: listEventResults(),
    activityStream: listActivity(12),
    stats: getHealthStats(),
  };
}

export function getAdminDashboard() {
  const db = getDb();
  const regRows = db.prepare('SELECT * FROM registrations ORDER BY created_at DESC').all() as SqlRow[];
  const inqRows = db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all() as SqlRow[];
  const passBreakdownRows = db.prepare('SELECT * FROM v_pass_tier_summary').all() as SqlRow[];
  const branchRows = db.prepare('SELECT * FROM v_branch_distribution').all() as SqlRow[];

  const totalRevenueRow = db
    .prepare('SELECT COALESCE(SUM(price), 0) AS totalRevenue FROM registrations')
    .get() as SqlRow | undefined;

  const registrations = regRows.map(mapRegistrationRow);
  const inquiries: InquiryRecord[] = inqRows.map(mapInquiryRow);

  return {
    summary: {
      totalRegistrations: registrations.length,
      checkedInCount: registrations.filter((r) => r.checkedIn).length,
      totalRevenue: asNumber(totalRevenueRow?.totalRevenue),
      openInquiries: inquiries.filter((i) => i.status === 'open').length,
      totalEvents: getHealthStats().events,
    },
    passBreakdown: passBreakdownRows.map((r) => ({
      passId: asString(r.pass_id),
      passName: asString(r.pass_name),
      price: asNumber(r.price),
      bookings: asNumber(r.bookings),
      revenue: asNumber(r.revenue),
    })),
    branchBreakdown: branchRows.map((r) => ({
      branch: asString(r.branch),
      count: asNumber(r.bookings),
    })),
    registrations,
    inquiries,
    events: listEvents(),
    passes: listPasses(),
    schedule: listSchedule(),
    faqs: listFaqs(),
    clubs: listClubs(),
    organizers: listOrganizers(),
    announcements: listAnnouncements(false),
    results: listEventResults(),
    festInfo: getFestInfo(),
    auditLogs: listAuditLogs(30),
    dbStats: getDatabaseDiagnostics(),
  };
}
