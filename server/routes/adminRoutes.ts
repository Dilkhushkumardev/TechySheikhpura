import type { IncomingMessage, ServerResponse } from 'node:http';
import type { CampusClub, FestEvent, OrganizerMember } from '../../src/data/techySheikhpuraData.ts';
import {
  createAnnouncement,
  createClub,
  createDatabaseBackupBuffer,
  createEvent,
  createEventResult,
  createFaq,
  createOrganizer,
  createScheduleItem,
  deleteAnnouncement,
  deleteClub,
  deleteEvent,
  deleteEventResult,
  deleteFaq,
  deleteInquiry,
  deleteOrganizer,
  deleteRegistration,
  deleteScheduleItem,
  exportRegistrationsCsv,
  getAdminDashboard,
  getDatabaseDiagnostics,
  listAuditLogs,
  queryRegistrations,
  recordAuditLog,
  setRegistrationCheckIn,
  toggleAnnouncementActive,
  updateEvent,
  updateFaq,
  updateFestInfo,
  updateInquiryStatus,
  updatePass,
  updateRegistration,
  updateScheduleItem,
  type CreateEventInput,
} from '../db/database.ts';
import {
  extractSubmittedPin,
  isRequestAdminAuthorized,
  issueAdminSessionToken,
  verifyOrganizerPin,
} from '../middleware/auth.ts';
import {
  HttpError,
  decodeRouteParam,
  isValidEmail,
  readJsonBody,
  readOptionalString,
  readRequiredString,
  sendCsv,
  sendJson,
} from './helpers.ts';

const ALLOWED_CATEGORIES: ReadonlySet<FestEvent['category']> = new Set([
  'Coding',
  'Robotics',
  'Aero & Drone',
  'Esports',
  'Startup & Pitch',
  'Mechanical & Civil',
  'Fun & Brain',
]);

function slugifyId(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return slug || `item-${Date.now()}`;
}

function parseRules(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return raw
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((s) => s.trim());
}

function parseCoordinators(raw: unknown): { name: string; contact: string }[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return raw
    .filter(
      (item): item is { name: string; contact: string } =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as { name?: unknown }).name === 'string' &&
        typeof (item as { contact?: unknown }).contact === 'string'
    )
    .map((c) => ({ name: c.name.trim(), contact: c.contact.trim() }));
}

function parseCreateEventInput(body: Record<string, unknown>): CreateEventInput {
  const title = readRequiredString(body, 'title', 3, 120);
  const category = readRequiredString(body, 'category', 3, 30) as FestEvent['category'];
  if (!ALLOWED_CATEGORIES.has(category)) {
    throw new HttpError(400, 'Invalid event category');
  }

  const rawId = readOptionalString(body, 'id', 60);
  const id = rawId ? slugifyId(rawId) : slugifyId(title);

  const rules = parseRules(body.rules);
  const coordinators = parseCoordinators(body.coordinators);

  return {
    id,
    title,
    tagline: readRequiredString(body, 'tagline', 3, 160),
    category,
    date: readRequiredString(body, 'date', 3, 60),
    time: readRequiredString(body, 'time', 2, 60),
    venue: readRequiredString(body, 'venue', 2, 120),
    image: readOptionalString(body, 'image', 400) || '/tech-events-hero.png',
    description: readRequiredString(body, 'description', 10, 1200),
    teamSize: readOptionalString(body, 'teamSize', 60) || '1 - 4 Members',
    entryFee: readOptionalString(body, 'entryFee', 60) || 'Included in Delegate Pass',
    prizes: readOptionalString(body, 'prizes', 80) || 'Merit Certificate + Trophy',
    rules:
      rules && rules.length > 0
        ? rules
        : ['Valid college ID card is mandatory at reporting desk.', "Judges' decision will be final."],
    coordinators:
      coordinators && coordinators.length > 0
        ? coordinators
        : [{ name: 'Student Convenor', contact: '+91 82100 45678' }],
    featured: Boolean(body.featured),
  };
}

function parsePartialEventInput(body: Record<string, unknown>): Partial<Omit<CreateEventInput, 'id'>> {
  const categoryRaw = readOptionalString(body, 'category', 30);
  let category: FestEvent['category'] | undefined;
  if (categoryRaw) {
    if (!ALLOWED_CATEGORIES.has(categoryRaw as FestEvent['category'])) {
      throw new HttpError(400, 'Invalid event category');
    }
    category = categoryRaw as FestEvent['category'];
  }

  return {
    title: readOptionalString(body, 'title', 120),
    tagline: readOptionalString(body, 'tagline', 160),
    category,
    date: readOptionalString(body, 'date', 60),
    time: readOptionalString(body, 'time', 60),
    venue: readOptionalString(body, 'venue', 120),
    image: readOptionalString(body, 'image', 400),
    description: readOptionalString(body, 'description', 1200),
    teamSize: readOptionalString(body, 'teamSize', 60),
    entryFee: readOptionalString(body, 'entryFee', 60),
    prizes: readOptionalString(body, 'prizes', 80),
    rules: parseRules(body.rules),
    coordinators: parseCoordinators(body.coordinators),
    featured: typeof body.featured === 'boolean' ? body.featured : undefined,
  };
}

export async function handleAdminRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  url: URL
): Promise<boolean> {
  const method = req.method || 'GET';

  if (method === 'POST' && pathname === '/api/admin/auth') {
    const body = await readJsonBody(req);
    const pin = readOptionalString(body, 'pin', 64) || extractSubmittedPin(req);
    if (!pin || !verifyOrganizerPin(pin)) {
      sendJson(res, 401, { error: 'Invalid organizer access PIN' });
      return true;
    }
    recordAuditLog('ADMIN_LOGIN', 'session', 'organizer', 'Issued signed HMAC admin token');
    sendJson(res, 200, issueAdminSessionToken());
    return true;
  }

  if (!pathname.startsWith('/api/admin/')) {
    return false;
  }

  if (!isRequestAdminAuthorized(req)) {
    throw new HttpError(401, 'Valid organizer Bearer token or PIN required');
  }

  if (method === 'GET' && pathname === '/api/admin/dashboard') {
    sendJson(res, 200, getAdminDashboard());
    return true;
  }

  if (method === 'GET' && pathname === '/api/admin/audit') {
    const limitParam = Number.parseInt(url.searchParams.get('limit') || '50', 10);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 50;
    sendJson(res, 200, { auditLogs: listAuditLogs(limit) });
    return true;
  }

  if (method === 'GET' && pathname === '/api/admin/db/stats') {
    sendJson(res, 200, { dbStats: getDatabaseDiagnostics() });
    return true;
  }

  if (method === 'GET' && pathname === '/api/admin/db/backup') {
    const buffer = createDatabaseBackupBuffer();
    recordAuditLog('DB_BACKUP', 'database', 'sqlite', `Exported ${buffer.length} byte SQLite snapshot`);
    const dateStamp = new Date().toISOString().slice(0, 10);
    res.writeHead(200, {
      'Content-Type': 'application/vnd.sqlite3',
      'Content-Disposition': `attachment; filename="techysheikhpura-backup-${dateStamp}.db"`,
      'Content-Length': buffer.length,
      'Cache-Control': 'no-store',
    });
    res.end(buffer);
    return true;
  }

  if (method === 'GET' && pathname === '/api/admin/registrations') {
    const q = url.searchParams.get('q') || undefined;
    const passId = url.searchParams.get('passId') || undefined;
    const checkedInParam = url.searchParams.get('checkedIn');
    const checkedIn =
      checkedInParam === 'true' || checkedInParam === '1'
        ? true
        : checkedInParam === 'false' || checkedInParam === '0'
          ? false
          : undefined;
    const page = Number.parseInt(url.searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(url.searchParams.get('limit') || '25', 10);
    sendJson(
      res,
      200,
      queryRegistrations({
        q,
        passId,
        checkedIn,
        page: Number.isFinite(page) ? page : 1,
        limit: Number.isFinite(limit) ? limit : 25,
      })
    );
    return true;
  }

  if (method === 'PATCH' && pathname === '/api/admin/fest') {
    const body = await readJsonBody(req);
    const email = readOptionalString(body, 'email', 160);
    if (email && !isValidEmail(email)) {
      throw new HttpError(400, 'Invalid contact email');
    }
    const festInfo = updateFestInfo({
      tagline: readOptionalString(body, 'tagline', 160),
      dates: readOptionalString(body, 'dates', 80),
      venue: readOptionalString(body, 'venue', 240),
      email,
      phone: readOptionalString(body, 'phone', 30),
      studentConvenor: readOptionalString(body, 'studentConvenor', 30),
      telegram: readOptionalString(body, 'telegram', 240),
    });
    recordAuditLog('FEST_UPDATED', 'fest_info', '1', `Updated fest metadata (${festInfo.dates})`);
    sendJson(res, 200, { festInfo });
    return true;
  }

  const passPatchMatch = pathname.match(/^\/api\/admin\/passes\/([^/]+)$/);
  if (method === 'PATCH' && passPatchMatch) {
    const passId = decodeRouteParam(passPatchMatch[1]);
    const body = await readJsonBody(req);
    const price = typeof body.price === 'number' && Number.isFinite(body.price) && body.price >= 0
      ? Math.round(body.price)
      : undefined;
    const originalPrice =
      typeof body.originalPrice === 'number' &&
      Number.isFinite(body.originalPrice) &&
      body.originalPrice >= 0
        ? Math.round(body.originalPrice)
        : undefined;
    const features = Array.isArray(body.features)
      ? body.features.filter((f): f is string => typeof f === 'string' && f.trim().length > 0)
      : undefined;

    const updatedPass = updatePass(passId, {
      name: readOptionalString(body, 'name', 100),
      tagline: readOptionalString(body, 'tagline', 180),
      price,
      originalPrice,
      isPopular: typeof body.isPopular === 'boolean' ? body.isPopular : undefined,
      accessScope: readOptionalString(body, 'accessScope', 160),
      features,
    });
    if (!updatedPass) {
      sendJson(res, 404, { error: `Pass tier '${passId}' not found` });
      return true;
    }
    recordAuditLog('PASS_UPDATED', 'pass', passId, `Updated ${updatedPass.name} (₹${updatedPass.price})`);
    sendJson(res, 200, { pass: updatedPass });
    return true;
  }

  if (method === 'GET' && pathname === '/api/admin/registrations/export.csv') {
    const csv = exportRegistrationsCsv();
    recordAuditLog('CSV_EXPORTED', 'registrations', 'all', 'Downloaded delegate CSV export');
    const dateStamp = new Date().toISOString().slice(0, 10);
    sendCsv(res, `techysheikhpura-registrations-${dateStamp}.csv`, csv);
    return true;
  }

  const checkInMatch = pathname.match(/^\/api\/admin\/registrations\/([^/]+)\/checkin$/);
  if (method === 'PATCH' && checkInMatch) {
    const regId = decodeRouteParam(checkInMatch[1]);
    const body = await readJsonBody(req);
    if (typeof body.checkedIn !== 'boolean') {
      throw new HttpError(400, 'checkedIn boolean field is required');
    }
    const registration = setRegistrationCheckIn(regId, body.checkedIn);
    if (!registration) {
      sendJson(res, 404, { error: `Registration ${regId} not found` });
      return true;
    }
    recordAuditLog(
      registration.checkedIn ? 'PASS_CHECKED_IN' : 'PASS_CHECKIN_REVOKED',
      'registration',
      registration.regId,
      `${registration.fullName} (${registration.rollNo})`
    );
    sendJson(res, 200, { registration });
    return true;
  }

  const regPatchMatch = pathname.match(/^\/api\/admin\/registrations\/([^/]+)$/);
  if (method === 'PATCH' && regPatchMatch) {
    const regId = decodeRouteParam(regPatchMatch[1]);
    const body = await readJsonBody(req);
    const phone = readOptionalString(body, 'phone', 20);
    if (phone && phone.replace(/\D/g, '').length < 10) {
      throw new HttpError(400, 'Phone number must contain at least 10 digits');
    }
    const teamNameRaw = body.teamName === null ? null : readOptionalString(body, 'teamName', 80);
    const updated = updateRegistration(regId, {
      teamName: teamNameRaw,
      phone,
      branch: readOptionalString(body, 'branch', 60),
      year: readOptionalString(body, 'year', 40),
    });
    if (!updated) {
      sendJson(res, 404, { error: `Registration ${regId} not found` });
      return true;
    }
    recordAuditLog('REGISTRATION_UPDATED', 'registration', updated.regId, `Updated profile for ${updated.fullName}`);
    sendJson(res, 200, { registration: updated });
    return true;
  }

  const regDeleteMatch = pathname.match(/^\/api\/admin\/registrations\/([^/]+)$/);
  if (method === 'DELETE' && regDeleteMatch) {
    const regId = decodeRouteParam(regDeleteMatch[1]);
    if (!deleteRegistration(regId)) {
      sendJson(res, 404, { error: `Registration ${regId} not found` });
      return true;
    }
    recordAuditLog('REGISTRATION_DELETED', 'registration', regId, 'Removed registration from SQLite');
    sendJson(res, 200, { deleted: true, regId });
    return true;
  }

  const inquiryStatusMatch = pathname.match(/^\/api\/admin\/inquiries\/(\d+)\/status$/);
  if (method === 'PATCH' && inquiryStatusMatch) {
    const id = Number.parseInt(inquiryStatusMatch[1], 10);
    const body = await readJsonBody(req);
    const status = body.status;
    if (status !== 'open' && status !== 'resolved') {
      throw new HttpError(400, "status must be 'open' or 'resolved'");
    }
    const adminNote = readOptionalString(body, 'adminNote', 500);
    const inquiry = updateInquiryStatus(id, status, adminNote);
    if (!inquiry) {
      sendJson(res, 404, { error: `Inquiry #${id} not found` });
      return true;
    }
    recordAuditLog('INQUIRY_UPDATED', 'inquiry', String(id), `Marked inquiry status=${status}`);
    sendJson(res, 200, { inquiry });
    return true;
  }

  const inquiryDeleteMatch = pathname.match(/^\/api\/admin\/inquiries\/(\d+)$/);
  if (method === 'DELETE' && inquiryDeleteMatch) {
    const id = Number.parseInt(inquiryDeleteMatch[1], 10);
    if (!deleteInquiry(id)) {
      sendJson(res, 404, { error: `Inquiry #${id} not found` });
      return true;
    }
    recordAuditLog('INQUIRY_DELETED', 'inquiry', String(id), 'Deleted inquiry ticket');
    sendJson(res, 200, { deleted: true, id });
    return true;
  }

  if (method === 'POST' && pathname === '/api/admin/events') {
    const body = await readJsonBody(req);
    const input = parseCreateEventInput(body);
    try {
      const event = createEvent(input);
      recordAuditLog('EVENT_CREATED', 'event', event.id, `Created ${event.title} (${event.category})`);
      sendJson(res, 201, { event });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to create event';
      if (msg.includes('UNIQUE') || msg.includes('PRIMARY KEY')) {
        throw new HttpError(409, `Event with id '${input.id}' already exists`);
      }
      throw error;
    }
    return true;
  }

  const eventPutMatch = pathname.match(/^\/api\/admin\/events\/([^/]+)$/);
  if (method === 'PUT' && eventPutMatch) {
    const id = decodeRouteParam(eventPutMatch[1]);
    const body = await readJsonBody(req);
    const patch = parsePartialEventInput(body);
    const event = updateEvent(id, patch);
    if (!event) {
      sendJson(res, 404, { error: `Event '${id}' not found` });
      return true;
    }
    recordAuditLog('EVENT_UPDATED', 'event', id, `Updated ${event.title}`);
    sendJson(res, 200, { event });
    return true;
  }

  const eventDeleteMatch = pathname.match(/^\/api\/admin\/events\/([^/]+)$/);
  if (method === 'DELETE' && eventDeleteMatch) {
    const id = decodeRouteParam(eventDeleteMatch[1]);
    if (!deleteEvent(id)) {
      sendJson(res, 404, { error: `Event '${id}' not found` });
      return true;
    }
    recordAuditLog('EVENT_DELETED', 'event', id, 'Deleted event from catalog');
    sendJson(res, 200, { deleted: true, id });
    return true;
  }

  if (method === 'POST' && pathname === '/api/admin/schedule') {
    const body = await readJsonBody(req);
    const dayRaw = readRequiredString(body, 'day', 5, 10);
    if (dayRaw !== 'Day 1' && dayRaw !== 'Day 2') {
      throw new HttpError(400, "day must be 'Day 1' or 'Day 2'");
    }
    const item = createScheduleItem({
      id: readOptionalString(body, 'id', 60),
      day: dayRaw,
      time: readRequiredString(body, 'time', 2, 60),
      title: readRequiredString(body, 'title', 3, 140),
      category: readRequiredString(body, 'category', 2, 60),
      venue: readRequiredString(body, 'venue', 2, 120),
      description: readRequiredString(body, 'description', 5, 400),
    });
    recordAuditLog('SCHEDULE_CREATED', 'schedule', item.id, `${item.day} ${item.time}: ${item.title}`);
    sendJson(res, 201, { item });
    return true;
  }

  const schedPatchMatch = pathname.match(/^\/api\/admin\/schedule\/([^/]+)$/);
  if (method === 'PATCH' && schedPatchMatch) {
    const id = decodeRouteParam(schedPatchMatch[1]);
    const body = await readJsonBody(req);
    const dayRaw = readOptionalString(body, 'day', 10);
    const day = dayRaw === 'Day 1' || dayRaw === 'Day 2' ? dayRaw : undefined;
    const item = updateScheduleItem(id, {
      day,
      time: readOptionalString(body, 'time', 60),
      title: readOptionalString(body, 'title', 140),
      category: readOptionalString(body, 'category', 60),
      venue: readOptionalString(body, 'venue', 120),
      description: readOptionalString(body, 'description', 400),
    });
    if (!item) {
      sendJson(res, 404, { error: `Schedule item '${id}' not found` });
      return true;
    }
    recordAuditLog('SCHEDULE_UPDATED', 'schedule', id, `${item.day} ${item.time}: ${item.title}`);
    sendJson(res, 200, { item });
    return true;
  }

  const schedDeleteMatch = pathname.match(/^\/api\/admin\/schedule\/([^/]+)$/);
  if (method === 'DELETE' && schedDeleteMatch) {
    const id = decodeRouteParam(schedDeleteMatch[1]);
    if (!deleteScheduleItem(id)) {
      sendJson(res, 404, { error: `Schedule item '${id}' not found` });
      return true;
    }
    recordAuditLog('SCHEDULE_DELETED', 'schedule', id, 'Removed schedule item');
    sendJson(res, 200, { deleted: true, id });
    return true;
  }

  if (method === 'POST' && pathname === '/api/admin/faqs') {
    const body = await readJsonBody(req);
    const faq = createFaq({
      q: readRequiredString(body, 'q', 5, 240),
      a: readRequiredString(body, 'a', 5, 1200),
    });
    recordAuditLog('FAQ_CREATED', 'faq', String(faq.id), faq.q);
    sendJson(res, 201, { faq });
    return true;
  }

  const faqPatchMatch = pathname.match(/^\/api\/admin\/faqs\/(\d+)$/);
  if (method === 'PATCH' && faqPatchMatch) {
    const id = Number.parseInt(faqPatchMatch[1], 10);
    const body = await readJsonBody(req);
    const faq = updateFaq(id, {
      q: readOptionalString(body, 'q', 240),
      a: readOptionalString(body, 'a', 1200),
    });
    if (!faq) {
      sendJson(res, 404, { error: `FAQ #${id} not found` });
      return true;
    }
    recordAuditLog('FAQ_UPDATED', 'faq', String(id), faq.q);
    sendJson(res, 200, { faq });
    return true;
  }

  const faqDeleteMatch = pathname.match(/^\/api\/admin\/faqs\/(\d+)$/);
  if (method === 'DELETE' && faqDeleteMatch) {
    const id = Number.parseInt(faqDeleteMatch[1], 10);
    if (!deleteFaq(id)) {
      sendJson(res, 404, { error: `FAQ #${id} not found` });
      return true;
    }
    recordAuditLog('FAQ_DELETED', 'faq', String(id), 'Deleted FAQ item');
    sendJson(res, 200, { deleted: true, id });
    return true;
  }

  if (method === 'POST' && pathname === '/api/admin/clubs') {
    const body = await readJsonBody(req);
    const name = readRequiredString(body, 'name', 2, 80);
    const iconRaw = readOptionalString(body, 'icon', 20) || 'cpu';
    const allowedIcons = new Set<CampusClub['icon']>(['code', 'bot', 'plane', 'sparkles', 'gamepad', 'cpu']);
    const icon: CampusClub['icon'] = allowedIcons.has(iconRaw as CampusClub['icon'])
      ? (iconRaw as CampusClub['icon'])
      : 'cpu';
    const id = readOptionalString(body, 'id', 60) || slugifyId(name);
    try {
      const club = createClub({
        id,
        name,
        role: readRequiredString(body, 'role', 2, 100),
        icon,
        colorClass: readOptionalString(body, 'colorClass', 60) || 'text-fuchsia-400',
        leadName: readOptionalString(body, 'leadName', 80) || 'Student Lead',
      });
      recordAuditLog('CLUB_CREATED', 'club', club.id, club.name);
      sendJson(res, 201, { club });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to create club';
      if (msg.includes('UNIQUE') || msg.includes('PRIMARY KEY')) {
        throw new HttpError(409, `Club with id '${id}' already exists`);
      }
      throw error;
    }
    return true;
  }

  const clubDeleteMatch = pathname.match(/^\/api\/admin\/clubs\/([^/]+)$/);
  if (method === 'DELETE' && clubDeleteMatch) {
    const id = decodeRouteParam(clubDeleteMatch[1]);
    if (!deleteClub(id)) {
      sendJson(res, 404, { error: `Club '${id}' not found` });
      return true;
    }
    recordAuditLog('CLUB_DELETED', 'club', id, 'Deleted campus club');
    sendJson(res, 200, { deleted: true, id });
    return true;
  }

  if (method === 'POST' && pathname === '/api/admin/organizers') {
    const body = await readJsonBody(req);
    const name = readRequiredString(body, 'name', 2, 80);
    const catRaw = readRequiredString(body, 'category', 4, 20);
    if (catRaw !== 'faculty' && catRaw !== 'student' && catRaw !== 'team') {
      throw new HttpError(400, "category must be 'faculty', 'student', or 'team'");
    }
    const id = readOptionalString(body, 'id', 60) || slugifyId(name);
    const member = createOrganizer({
      id,
      name,
      role: readRequiredString(body, 'role', 2, 100),
      department: readRequiredString(body, 'department', 2, 80),
      phone: readRequiredString(body, 'phone', 6, 30),
      category: catRaw as OrganizerMember['category'],
      featuredFooter: Boolean(body.featuredFooter),
    });
    recordAuditLog('ORGANIZER_CREATED', 'organizer', member.id, `${member.name} (${member.role})`);
    sendJson(res, 201, { organizer: member });
    return true;
  }

  const orgDeleteMatch = pathname.match(/^\/api\/admin\/organizers\/([^/]+)$/);
  if (method === 'DELETE' && orgDeleteMatch) {
    const id = decodeRouteParam(orgDeleteMatch[1]);
    if (!deleteOrganizer(id)) {
      sendJson(res, 404, { error: `Organizer '${id}' not found` });
      return true;
    }
    recordAuditLog('ORGANIZER_DELETED', 'organizer', id, 'Removed organizer member');
    sendJson(res, 200, { deleted: true, id });
    return true;
  }

  if (method === 'POST' && pathname === '/api/admin/announcements') {
    const body = await readJsonBody(req);
    const prioRaw = readOptionalString(body, 'priority', 20) || 'info';
    const priority = prioRaw === 'urgent' || prioRaw === 'important' ? prioRaw : 'info';
    const announcement = createAnnouncement({
      title: readRequiredString(body, 'title', 3, 140),
      message: readRequiredString(body, 'message', 5, 500),
      priority,
    });
    recordAuditLog('ANNOUNCEMENT_CREATED', 'announcement', String(announcement.id), announcement.title);
    sendJson(res, 201, { announcement });
    return true;
  }

  const annPatchMatch = pathname.match(/^\/api\/admin\/announcements\/(\d+)$/);
  if (method === 'PATCH' && annPatchMatch) {
    const id = Number.parseInt(annPatchMatch[1], 10);
    const body = await readJsonBody(req);
    if (typeof body.isActive !== 'boolean') {
      throw new HttpError(400, 'isActive boolean field is required');
    }
    const announcement = toggleAnnouncementActive(id, body.isActive);
    if (!announcement) {
      sendJson(res, 404, { error: `Announcement #${id} not found` });
      return true;
    }
    recordAuditLog('ANNOUNCEMENT_TOGGLED', 'announcement', String(id), `isActive=${body.isActive}`);
    sendJson(res, 200, { announcement });
    return true;
  }

  const annDeleteMatch = pathname.match(/^\/api\/admin\/announcements\/(\d+)$/);
  if (method === 'DELETE' && annDeleteMatch) {
    const id = Number.parseInt(annDeleteMatch[1], 10);
    if (!deleteAnnouncement(id)) {
      sendJson(res, 404, { error: `Announcement #${id} not found` });
      return true;
    }
    recordAuditLog('ANNOUNCEMENT_DELETED', 'announcement', String(id), 'Deleted announcement');
    sendJson(res, 200, { deleted: true, id });
    return true;
  }

  if (method === 'POST' && pathname === '/api/admin/results') {
    const body = await readJsonBody(req);
    const eventId = readRequiredString(body, 'eventId', 2, 60);
    try {
      const result = createEventResult({
        eventId,
        position: readRequiredString(body, 'position', 1, 60),
        winnerName: readRequiredString(body, 'winnerName', 2, 120),
        teamName: readOptionalString(body, 'teamName', 80),
        branch: readRequiredString(body, 'branch', 2, 60),
        rollNo: readOptionalString(body, 'rollNo', 40),
        prize: readRequiredString(body, 'prize', 2, 120),
      });
      recordAuditLog('RESULT_PUBLISHED', 'result', String(result.id), `${result.eventTitle}: ${result.position} - ${result.winnerName}`);
      sendJson(res, 201, { result });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to publish result';
      if (msg.includes('does not exist')) {
        throw new HttpError(400, msg);
      }
      throw error;
    }
    return true;
  }

  const resDeleteMatch = pathname.match(/^\/api\/admin\/results\/(\d+)$/);
  if (method === 'DELETE' && resDeleteMatch) {
    const id = Number.parseInt(resDeleteMatch[1], 10);
    if (!deleteEventResult(id)) {
      sendJson(res, 404, { error: `Result #${id} not found` });
      return true;
    }
    recordAuditLog('RESULT_DELETED', 'result', String(id), 'Deleted published result');
    sendJson(res, 200, { deleted: true, id });
    return true;
  }

  return false;
}

