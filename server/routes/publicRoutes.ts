import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  DuplicateRegistrationError,
  DuplicateTeamRegistrationError,
  createInquiry,
  createRegistration,
  createTeamRegistration,
  getEventById,
  getEventStats,
  getFestBundle,
  getHealthStats,
  getDatabaseDiagnostics,
  getRegistrationById,
  getTeamRegistrationById,
  listActivity,
  listAnnouncements,
  listClubs,
  listEventResults,
  listEvents,
  listFaqs,
  listOrganizers,
  listPasses,
  listSchedule,
  listTeamRegistrations,
  verifyRegistrations,
  type OrganizerMember,
  type TeamMember,
} from '../db/database.ts';
import { isPassVerifyCodeValid } from '../middleware/auth.ts';
import {
  HttpError,
  decodeRouteParam,
  isValidEmail,
  readJsonBody,
  readOptionalString,
  readRequiredString,
  sendJson,
} from './helpers.ts';

export async function handlePublicRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  url: URL
): Promise<boolean> {
  const method = req.method || 'GET';

  if ((method === 'GET' || method === 'HEAD') && pathname === '/api') {
    sendJson(res, 200, {
      service: 'TechySheikhpura 2026 Backend API',
      version: '1.1.0',
      docs: '/api/health',
      endpoints: [
        'GET /api/health',
        'GET /api/fest',
        'GET /api/events',
        'GET /api/events/:id',
        'GET /api/events/:id/stats',
        'GET /api/passes',
        'GET /api/schedule',
        'GET /api/faqs',
        'GET /api/clubs',
        'GET /api/organizers',
        'GET /api/announcements',
        'GET /api/results',
        'GET /api/activity',
        'POST /api/registrations',
        'GET /api/registrations/verify',
        'GET /api/registrations/:regId',
        'POST /api/team-registrations',
        'GET /api/team-registrations/verify',
        'GET /api/team-registrations/:teamId',
        'POST /api/inquiries',
        'POST /api/admin/auth',
      ],
    });
    return true;
  }

  if ((method === 'GET' || method === 'HEAD') && pathname === '/api/health') {
    sendJson(res, 200, {
      ok: true,
      service: 'techysheikhpura-api',
      database: 'sqlite',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      stats: getHealthStats(),
    });
    return true;
  }

  if ((method === 'GET' || method === 'HEAD') && pathname === '/api/health/db') {
    const diagnostics = getDatabaseDiagnostics();
    sendJson(res, 200, {
      ok: diagnostics.integrityCheck === 'ok',
      service: 'techysheikhpura-api',
      engine: 'node:sqlite (Node 24)',
      diagnostics,
      timestamp: new Date().toISOString(),
    });
    return true;
  }

  if (method === 'GET' && pathname === '/api/fest') {
    sendJson(res, 200, getFestBundle());
    return true;
  }

  if (method === 'GET' && pathname === '/api/events') {
    const category = url.searchParams.get('category') || undefined;
    const q = url.searchParams.get('q') || undefined;
    sendJson(res, 200, { events: listEvents({ category, q }) });
    return true;
  }

  const eventStatsMatch = pathname.match(/^\/api\/events\/([^/]+)\/stats$/);
  if (method === 'GET' && eventStatsMatch) {
    const eventId = decodeRouteParam(eventStatsMatch[1]);
    const stats = getEventStats(eventId);
    if (!stats) {
      sendJson(res, 404, { error: 'Event not found' });
      return true;
    }
    sendJson(res, 200, stats);
    return true;
  }

  if (method === 'GET' && pathname.startsWith('/api/events/')) {
    const id = decodeRouteParam(pathname.slice('/api/events/'.length));
    const event = getEventById(id);
    if (!event) {
      sendJson(res, 404, { error: 'Event not found' });
      return true;
    }
    sendJson(res, 200, { event });
    return true;
  }

  if (method === 'GET' && pathname === '/api/passes') {
    sendJson(res, 200, { passes: listPasses() });
    return true;
  }

  if (method === 'GET' && pathname === '/api/schedule') {
    const dayParam = url.searchParams.get('day');
    const day = dayParam === 'Day 1' || dayParam === 'Day 2' ? dayParam : undefined;
    sendJson(res, 200, { schedule: listSchedule(day) });
    return true;
  }

  if (method === 'GET' && pathname === '/api/faqs') {
    sendJson(res, 200, { faqs: listFaqs() });
    return true;
  }

  if (method === 'GET' && pathname === '/api/clubs') {
    sendJson(res, 200, { clubs: listClubs() });
    return true;
  }

  if (method === 'GET' && pathname === '/api/organizers') {
    const categoryRaw = url.searchParams.get('category');
    const category: OrganizerMember['category'] | undefined =
      categoryRaw === 'faculty' || categoryRaw === 'student' || categoryRaw === 'team'
        ? categoryRaw
        : undefined;
    sendJson(res, 200, { organizers: listOrganizers(category) });
    return true;
  }

  if (method === 'GET' && pathname === '/api/announcements') {
    sendJson(res, 200, { announcements: listAnnouncements(true) });
    return true;
  }

  if (method === 'GET' && pathname === '/api/results') {
    const eventId = url.searchParams.get('eventId') || undefined;
    sendJson(res, 200, { results: listEventResults(eventId) });
    return true;
  }

  if (method === 'GET' && pathname === '/api/activity') {
    const parsedLimit = Number.parseInt(url.searchParams.get('limit') || '12', 10);
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 50) : 12;
    sendJson(res, 200, { activityStream: listActivity(limit) });
    return true;
  }

  if (method === 'POST' && pathname === '/api/registrations') {
    const body = await readJsonBody(req);
    const passId = readRequiredString(body, 'passId', 2, 60);
    const fullName = readRequiredString(body, 'fullName', 2, 120);
    const rollNo = readRequiredString(body, 'rollNo', 3, 40);
    const branch = readRequiredString(body, 'branch', 2, 60);
    const year = readRequiredString(body, 'year', 2, 40);
    const phone = readRequiredString(body, 'phone', 10, 20);
    const email = readRequiredString(body, 'email', 5, 160);
    const eventId = readOptionalString(body, 'eventId', 60);
    const teamName = readOptionalString(body, 'teamName', 80);

    const digitCount = phone.replace(/\D/g, '').length;
    if (digitCount < 10) {
      throw new HttpError(400, 'Please enter a valid 10-digit WhatsApp / Mobile number');
    }
    if (!isValidEmail(email)) {
      throw new HttpError(400, 'Please enter a valid email address');
    }

    try {
      const registration = createRegistration({
        passId,
        eventId,
        fullName,
        rollNo,
        branch,
        year,
        phone,
        email,
        teamName,
      });
      sendJson(res, 201, {
        registration,
        activityStream: listActivity(12),
      });
    } catch (error) {
      if (error instanceof DuplicateRegistrationError) {
        sendJson(res, 409, {
          error: error.message,
          existingRegId: error.existingRegId,
        });
        return true;
      }
      if (error instanceof Error && error.message.startsWith('Unknown ')) {
        throw new HttpError(400, error.message);
      }
      throw error;
    }
    return true;
  }

  if (method === 'GET' && pathname === '/api/registrations/verify') {
    const q = (
      url.searchParams.get('q') ||
      url.searchParams.get('regId') ||
      url.searchParams.get('email') ||
      url.searchParams.get('rollNo') ||
      ''
    ).trim();
    if (q.length < 2) {
      throw new HttpError(400, 'Provide at least 2 characters to search registrations');
    }
    const sig = (url.searchParams.get('sig') || '').trim();
    const registrations = verifyRegistrations(q);
    let signatureStatus: 'valid' | 'invalid' | 'unchecked' = 'unchecked';
    if (sig && registrations.length > 0) {
      const matchesAll = registrations.some((r) => isPassVerifyCodeValid(r.verifyCode, sig));
      signatureStatus = matchesAll ? 'valid' : 'invalid';
    } else if (sig && registrations.length === 0) {
      signatureStatus = 'invalid';
    }

    sendJson(res, 200, {
      query: q,
      count: registrations.length,
      signatureStatus,
      registrations,
    });
    return true;
  }

  const singleRegMatch = pathname.match(/^\/api\/registrations\/([^/]+)$/);
  if (method === 'GET' && singleRegMatch) {
    const regId = decodeRouteParam(singleRegMatch[1]);
    const registration = getRegistrationById(regId);
    if (!registration) {
      sendJson(res, 404, { error: `Registration ${regId} not found` });
      return true;
    }
    sendJson(res, 200, { registration });
    return true;
  }

  if (method === 'POST' && pathname === '/api/team-registrations') {
    const body = await readJsonBody(req);
    const teamName = readRequiredString(body, 'teamName', 2, 80);
    const eventId = readRequiredString(body, 'eventId', 2, 60);
    const leaderName = readRequiredString(body, 'leaderName', 2, 120);
    const leaderRoll = readRequiredString(body, 'leaderRoll', 3, 40);
    const leaderEmail = readRequiredString(body, 'leaderEmail', 5, 160);
    const leaderPhone = readRequiredString(body, 'leaderPhone', 10, 20);
    const branch = readRequiredString(body, 'branch', 2, 60);
    const year = readRequiredString(body, 'year', 2, 40);
    const projectTitle = readOptionalString(body, 'projectTitle', 160);
    const notes = readOptionalString(body, 'notes', 1000);

    const digitCount = leaderPhone.replace(/\D/g, '').length;
    if (digitCount < 10) {
      throw new HttpError(400, 'Please enter a valid 10-digit WhatsApp / Mobile number for team leader');
    }
    if (!isValidEmail(leaderEmail)) {
      throw new HttpError(400, 'Please enter a valid email address for team leader');
    }

    const rawMembers = Array.isArray(body.members) ? body.members : [];
    const members: TeamMember[] = [];
    for (const raw of rawMembers) {
      if (raw && typeof raw === 'object') {
        const m = raw as Record<string, unknown>;
        const mName = typeof m.name === 'string' ? m.name.trim() : '';
        const mRoll = typeof m.rollNo === 'string' ? m.rollNo.trim() : '';
        const mBranch = typeof m.branch === 'string' ? m.branch.trim() : undefined;
        const mPhone = typeof m.phone === 'string' ? m.phone.trim() : undefined;
        if (mName && mRoll) {
          members.push({ name: mName, rollNo: mRoll, branch: mBranch, phone: mPhone });
        }
      }
    }

    try {
      const teamRegistration = createTeamRegistration({
        teamName,
        eventId,
        leaderName,
        leaderRoll,
        leaderEmail,
        leaderPhone,
        branch,
        year,
        members,
        projectTitle,
        notes,
      });
      sendJson(res, 201, {
        teamRegistration,
        activityStream: listActivity(12),
      });
    } catch (error) {
      if (error instanceof DuplicateTeamRegistrationError) {
        sendJson(res, 409, {
          error: error.message,
          existingTeamId: error.existingTeamId,
        });
        return true;
      }
      if (error instanceof Error && error.message.startsWith('Unknown ')) {
        throw new HttpError(400, error.message);
      }
      throw error;
    }
    return true;
  }

  if (method === 'GET' && pathname === '/api/team-registrations/verify') {
    const q = (
      url.searchParams.get('q') ||
      url.searchParams.get('teamId') ||
      url.searchParams.get('leaderRoll') ||
      url.searchParams.get('teamName') ||
      ''
    ).trim();
    if (q.length < 2) {
      throw new HttpError(400, 'Provide at least 2 characters to search team registrations');
    }
    const eventId = url.searchParams.get('eventId') || undefined;
    const teams = listTeamRegistrations({ q, eventId });
    sendJson(res, 200, {
      query: q,
      count: teams.length,
      teams,
    });
    return true;
  }

  const singleTeamMatch = pathname.match(/^\/api\/team-registrations\/([^/]+)$/);
  if (method === 'GET' && singleTeamMatch) {
    const teamId = decodeRouteParam(singleTeamMatch[1]);
    const teamRegistration = getTeamRegistrationById(teamId);
    if (!teamRegistration) {
      sendJson(res, 404, { error: `Team registration ${teamId} not found` });
      return true;
    }
    sendJson(res, 200, { teamRegistration });
    return true;
  }

  if (method === 'POST' && pathname === '/api/inquiries') {
    const body = await readJsonBody(req);
    const name = readRequiredString(body, 'name', 2, 120);
    const email = readRequiredString(body, 'email', 5, 160);
    const rollNo = readOptionalString(body, 'rollNo', 40);
    const subject = readRequiredString(body, 'subject', 3, 160);
    const message = readRequiredString(body, 'message', 10, 2000);

    if (!isValidEmail(email)) {
      throw new HttpError(400, 'Please provide a valid email address');
    }

    const inquiry = createInquiry({ name, email, rollNo, subject, message });
    sendJson(res, 201, { inquiry });
    return true;
  }

  return false;
}

