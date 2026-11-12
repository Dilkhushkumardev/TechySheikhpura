import assert from 'node:assert/strict';
import fs from 'node:fs';
import type http from 'node:http';
import type { AddressInfo } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { createAppServer } from '../app.ts';
import { closeDatabase, initDatabase } from '../db/database.ts';
import { resetAllRateLimiters } from '../middleware/rateLimit.ts';

interface JsonResult<T = Record<string, unknown>> {
  status: number;
  headers: Headers;
  data: T;
}

describe('TechySheikhpura Backend API & SQLite Integration', () => {
  let server: http.Server;
  let baseUrl = '';
  let tempDir = '';

  async function apiJson<T = Record<string, unknown>>(
    endpoint: string,
    init?: RequestInit
  ): Promise<JsonResult<T>> {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
    const text = await response.text();
    const data = (text ? JSON.parse(text) : {}) as T;
    return { status: response.status, headers: response.headers, data };
  }

  before(async () => {
    process.env.NODE_ENV = 'test';
    process.env.ORGANIZER_PIN = 'TESTPIN99';
    process.env.SESSION_SECRET = 'test-signing-secret-at-least-32-chars';
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'techy-backend-test-'));
    const testDbPath = path.join(tempDir, 'fest.sqlite');

    initDatabase(testDbPath);
    server = createAppServer();
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve());
    });
    const addr = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${addr.port}`;
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    closeDatabase();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('seeds SQLite catalog and returns security headers on /api/health & /api/fest', async () => {
    const health = await apiJson<{
      ok: boolean;
      database: string;
      stats: { events: number; passes: number; schedule: number; faqs: number };
    }>('/api/health');

    assert.equal(health.status, 200);
    assert.equal(health.data.ok, true);
    assert.equal(health.data.database, 'sqlite');
    assert.equal(health.data.stats.events, 14);
    assert.equal(health.data.stats.passes, 3);
    assert.equal(health.data.stats.schedule, 11);
    assert.equal(health.data.stats.faqs, 5);
    assert.equal(health.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(health.headers.get('x-frame-options'), 'DENY');
    assert.ok(health.headers.get('x-request-id'));

    const apiIndex = await apiJson<{ service: string; version: string }>('/api');
    assert.equal(apiIndex.status, 200);
    assert.match(apiIndex.data.service, /TechySheikhpura/);

    const headHealth = await fetch(`${baseUrl}/api/health`, { method: 'HEAD' });
    assert.equal(headHealth.status, 200);

    const malformedParam = await apiJson('/api/events/%ZZ');
    assert.equal(malformedParam.status, 400);

    const filteredEvents = await apiJson<{ events: { id: string; category: string }[] }>(
      '/api/events?category=Coding'
    );
    assert.equal(filteredEvents.status, 200);
    assert.ok(filteredEvents.data.events.length >= 1);
    assert.ok(filteredEvents.data.events.every((e) => e.category === 'Coding'));
  });

  it('creates delegate pass atomically, enforces duplicate protection, and verifies pass', async () => {
    const payload = {
      passId: 'all-events-pass',
      eventId: 'hackarena',
      fullName: 'Aarav Verma',
      rollNo: '24-CSE-012',
      branch: 'Computer Science & Engineering (CSE)',
      year: '2nd Year',
      phone: '9876543210',
      email: 'aarav@gecsheikhpura.ac.in',
      teamName: 'NullPointers',
    };

    const created = await apiJson<{
      registration: { regId: string; teamName: string | null; verifyCode: string };
    }>('/api/registrations', { method: 'POST', body: JSON.stringify(payload) });
    assert.equal(created.status, 201);
    const regId = created.data.registration.regId;
    const verifyCode = created.data.registration.verifyCode;
    assert.match(regId, /^TS26-GECS-\d{5}$/);
    assert.match(verifyCode, /^[0-9A-F]{12}$/);
    assert.equal(created.data.registration.teamName, 'NullPointers');

    const duplicate = await apiJson<{ existingRegId: string }>('/api/registrations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    assert.equal(duplicate.status, 409);
    assert.equal(duplicate.data.existingRegId, regId);

    const lookupValid = await apiJson<{ count: number; signatureStatus: string }>(
      `/api/registrations/verify?q=${regId}&sig=${verifyCode}`
    );
    assert.equal(lookupValid.status, 200);
    assert.equal(lookupValid.data.count, 1);
    assert.equal(lookupValid.data.signatureStatus, 'valid');

    const lookupTampered = await apiJson<{ count: number; signatureStatus: string }>(
      `/api/registrations/verify?q=${regId}&sig=DEADBEEF0000`
    );
    assert.equal(lookupTampered.status, 200);
    assert.equal(lookupTampered.data.signatureStatus, 'invalid');

    const byId = await apiJson<{ registration: { regId: string } }>(`/api/registrations/${regId}`);
    assert.equal(byId.status, 200);
    assert.equal(byId.data.registration.regId, regId);

    const stats = await apiJson<{ totalRegistrations: number }>('/api/events/hackarena/stats');
    assert.equal(stats.status, 200);
    assert.equal(stats.data.totalRegistrations, 1);
  });

  it('validates student inquiry input and stores support ticket', async () => {
    const invalid = await apiJson('/api/inquiries', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Aarav',
        email: 'not-an-email',
        subject: 'Help',
        message: 'Testing email format validation rules.',
      }),
    });
    assert.equal(invalid.status, 400);

    const created = await apiJson<{ inquiry: { id: number; status: string } }>('/api/inquiries', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Aarav Verma',
        email: 'aarav@gecsheikhpura.ac.in',
        rollNo: '24-CSE-012',
        subject: 'Power Extension Request',
        message: 'Need two additional AC sockets at desk 4 for our autonomous bot.',
      }),
    });
    assert.equal(created.status, 201);
    assert.equal(created.data.inquiry.status, 'open');
  });

  it('issues HMAC-signed admin tokens, performs full CRUD, exports CSV, and checks rate limiting', async () => {
    resetAllRateLimiters();

    const unauth = await apiJson('/api/admin/dashboard');
    assert.equal(unauth.status, 401);

    const tampered = await apiJson('/api/admin/dashboard', {
      headers: { Authorization: 'Bearer fake.signature' },
    });
    assert.equal(tampered.status, 401);

    const badPin = await apiJson('/api/admin/auth', {
      method: 'POST',
      body: JSON.stringify({ pin: 'WRONGPIN' }),
    });
    assert.equal(badPin.status, 401);

    const auth = await apiJson<{ authenticated: boolean; token: string; expiresAt: string }>(
      '/api/admin/auth',
      { method: 'POST', body: JSON.stringify({ pin: 'TESTPIN99' }) }
    );
    assert.equal(auth.status, 200);
    assert.equal(auth.data.authenticated, true);
    assert.ok(auth.data.token.includes('.'));

    const bearerHeaders = { Authorization: `Bearer ${auth.data.token}` };

    // Fest metadata patch
    const festUpdate = await apiJson<{ festInfo: { tagline: string } }>('/api/admin/fest', {
      method: 'PATCH',
      headers: bearerHeaders,
      body: JSON.stringify({ tagline: 'Engineered In Sheikhpura' }),
    });
    assert.equal(festUpdate.status, 200);
    assert.equal(festUpdate.data.festInfo.tagline, 'Engineered In Sheikhpura');

    // Event create -> update -> delete
    const createdEvent = await apiJson<{ event: { id: string; title: string } }>('/api/admin/events', {
      method: 'POST',
      headers: bearerHeaders,
      body: JSON.stringify({
        title: 'AI Kernel Quest',
        tagline: 'Automated systems challenge',
        category: 'Coding',
        date: 'Day 2 (Nov 29)',
        time: '01:00 PM',
        venue: 'Computing Lab 2',
        description: 'Optimize algorithmic pipelines cleanly.',
      }),
    });
    assert.equal(createdEvent.status, 201);
    const evId = createdEvent.data.event.id;

    const updatedEvent = await apiJson<{ event: { venue: string } }>(`/api/admin/events/${evId}`, {
      method: 'PUT',
      headers: bearerHeaders,
      body: JSON.stringify({ venue: 'Main Innovation Hall' }),
    });
    assert.equal(updatedEvent.status, 200);
    assert.equal(updatedEvent.data.event.venue, 'Main Innovation Hall');

    const deletedEvent = await apiJson(`/api/admin/events/${evId}`, {
      method: 'DELETE',
      headers: bearerHeaders,
    });
    assert.equal(deletedEvent.status, 200);

    // Schedule CRUD
    const schedAdd = await apiJson<{ item: { id: string } }>('/api/admin/schedule', {
      method: 'POST',
      headers: bearerHeaders,
      body: JSON.stringify({
        day: 'Day 2',
        time: '04:45 PM',
        title: 'Backend Demo Showcase',
        category: 'Tech Talk',
        venue: 'Auditorium',
        description: 'Live walkthrough of campus systems.',
      }),
    });
    assert.equal(schedAdd.status, 201);
    const schedPatch = await apiJson<{ item: { venue: string } }>(
      `/api/admin/schedule/${schedAdd.data.item.id}`,
      {
        method: 'PATCH',
        headers: bearerHeaders,
        body: JSON.stringify({ venue: 'Smart Seminar Hall' }),
      }
    );
    assert.equal(schedPatch.status, 200);
    assert.equal(schedPatch.data.item.venue, 'Smart Seminar Hall');

    const schedDel = await apiJson(`/api/admin/schedule/${schedAdd.data.item.id}`, {
      method: 'DELETE',
      headers: bearerHeaders,
    });
    assert.equal(schedDel.status, 200);

    // FAQ CRUD (including PATCH)
    const faqAdd = await apiJson<{ faq: { id: number } }>('/api/admin/faqs', {
      method: 'POST',
      headers: bearerHeaders,
      body: JSON.stringify({
        q: 'Can teams include students from multiple branches?',
        a: 'Yes, cross-department teams within GEC Sheikhpura are allowed.',
      }),
    });
    assert.equal(faqAdd.status, 201);
    const faqPatch = await apiJson<{ faq: { a: string } }>(`/api/admin/faqs/${faqAdd.data.faq.id}`, {
      method: 'PATCH',
      headers: bearerHeaders,
      body: JSON.stringify({ a: 'Updated cross-department team allowance confirmed.' }),
    });
    assert.equal(faqPatch.status, 200);
    assert.match(faqPatch.data.faq.a, /Updated cross-department/);
    const faqDel = await apiJson(`/api/admin/faqs/${faqAdd.data.faq.id}`, {
      method: 'DELETE',
      headers: bearerHeaders,
    });
    assert.equal(faqDel.status, 200);

    // Community entities: Clubs, Organizers, Announcements, Event Results + Inquiry Trigger/Note
    const clubsRes = await apiJson<{ clubs: { id: string }[] }>('/api/clubs');
    assert.equal(clubsRes.status, 200);
    assert.equal(clubsRes.data.clubs.length, 5);

    const orgsRes = await apiJson<{ organizers: { category: string }[] }>(
      '/api/organizers?category=student'
    );
    assert.equal(orgsRes.status, 200);
    assert.ok(orgsRes.data.organizers.length >= 3);

    const clubCreate = await apiJson<{ club: { id: string } }>('/api/admin/clubs', {
      method: 'POST',
      headers: bearerHeaders,
      body: JSON.stringify({
        name: 'CloudNative GECS',
        role: 'Backend & DevOps Circle',
        icon: 'cpu',
        leadName: 'Dilkhush',
      }),
    });
    assert.equal(clubCreate.status, 201);
    const clubDel = await apiJson(`/api/admin/clubs/${clubCreate.data.club.id}`, {
      method: 'DELETE',
      headers: bearerHeaders,
    });
    assert.equal(clubDel.status, 200);

    const noticeAdd = await apiJson<{ announcement: { id: number; isActive: boolean } }>(
      '/api/admin/announcements',
      {
        method: 'POST',
        headers: bearerHeaders,
        body: JSON.stringify({
          title: 'Keynote Room Update',
          message: 'Shifted keynote session to Main Auditorium Hall.',
          priority: 'urgent',
        }),
      }
    );
    assert.equal(noticeAdd.status, 201);
    const noticeToggle = await apiJson<{ announcement: { isActive: boolean } }>(
      `/api/admin/announcements/${noticeAdd.data.announcement.id}`,
      {
        method: 'PATCH',
        headers: bearerHeaders,
        body: JSON.stringify({ isActive: false }),
      }
    );
    assert.equal(noticeToggle.status, 200);
    assert.equal(noticeToggle.data.announcement.isActive, false);
    const noticeDel = await apiJson(`/api/admin/announcements/${noticeAdd.data.announcement.id}`, {
      method: 'DELETE',
      headers: bearerHeaders,
    });
    assert.equal(noticeDel.status, 200);

    const resultAdd = await apiJson<{ result: { id: number; eventTitle: string } }>(
      '/api/admin/results',
      {
        method: 'POST',
        headers: bearerHeaders,
        body: JSON.stringify({
          eventId: 'hackarena',
          position: '1st Place',
          winnerName: 'Aarav Verma',
          teamName: 'NullPointers',
          branch: 'CSE',
          prize: '₹18,000',
        }),
      }
    );
    assert.equal(resultAdd.status, 201);
    const publicResults = await apiJson<{ results: { id: number }[] }>('/api/results?eventId=hackarena');
    assert.equal(publicResults.status, 200);
    assert.equal(publicResults.data.results.length, 1);
    const resultDel = await apiJson(`/api/admin/results/${resultAdd.data.result.id}`, {
      method: 'DELETE',
      headers: bearerHeaders,
    });
    assert.equal(resultDel.status, 200);

    const resolvedInq = await apiJson<{
      inquiry: { status: string; adminNote: string | null; resolvedAt: string | null };
    }>('/api/admin/inquiries/1/status', {
      method: 'PATCH',
      headers: bearerHeaders,
      body: JSON.stringify({ status: 'resolved', adminNote: 'Socket strip assigned at Desk 4' }),
    });
    assert.equal(resolvedInq.status, 200);
    assert.equal(resolvedInq.data.inquiry.status, 'resolved');
    assert.equal(resolvedInq.data.inquiry.adminNote, 'Socket strip assigned at Desk 4');
    assert.ok(resolvedInq.data.inquiry.resolvedAt);

    // SQLite Diagnostics & Online VACUUM INTO Binary Snapshot Backup
    const dbStats = await apiJson<{
      dbStats: { integrityCheck: string; schemaVersion: number; tableCounts: Record<string, number> };
    }>('/api/admin/db/stats', { headers: bearerHeaders });
    assert.equal(dbStats.status, 200);
    assert.equal(dbStats.data.dbStats.integrityCheck, 'ok');
    assert.equal(dbStats.data.dbStats.schemaVersion, 3);
    assert.equal(Object.keys(dbStats.data.dbStats.tableCounts).length, 17);

    const footerContactsRes = await apiJson<{ organizers: { name: string; featuredFooter: boolean }[] }>(
      '/api/organizers?category=student'
    );
    assert.equal(footerContactsRes.status, 200);
    assert.deepEqual(
      footerContactsRes.data.organizers.filter((m) => m.featuredFooter).map((m) => m.name),
      ['Dilkhush', 'Amrita', 'Ashish']
    );

    const backupRes = await fetch(`${baseUrl}/api/admin/db/backup`, { headers: bearerHeaders });
    assert.equal(backupRes.status, 200);
    const backupBuf = Buffer.from(await backupRes.arrayBuffer());
    assert.ok(backupBuf.subarray(0, 15).toString('utf8').startsWith('SQLite format 3'));

    // Pass tier update
    const passUpdate = await apiJson<{ pass: { id: string; price: number } }>(
      '/api/admin/passes/vip-innovator-pass',
      {
        method: 'PATCH',
        headers: bearerHeaders,
        body: JSON.stringify({ price: 249 }),
      }
    );
    assert.equal(passUpdate.status, 200);
    assert.equal(passUpdate.data.pass.price, 249);

    // Seed formula-looking name + signed phone for CSV safety & pagination check
    const formulaReg = await apiJson('/api/registrations', {
      method: 'POST',
      body: JSON.stringify({
        passId: 'vip-innovator-pass',
        fullName: '=1+1',
        rollNo: '24-ME-099',
        branch: 'Mechanical Engineering (ME)',
        year: '2nd Year',
        phone: '+91 9876543210',
        email: 'csvguard@gecsheikhpura.ac.in',
      }),
    });
    assert.equal(formulaReg.status, 201);

    const paginated = await apiJson<{
      total: number;
      page: number;
      items: { rollNo: string }[];
    }>('/api/admin/registrations?q=csvguard&passId=vip-innovator-pass&page=1&limit=10', {
      headers: bearerHeaders,
    });
    assert.equal(paginated.status, 200);
    assert.equal(paginated.data.total, 1);
    assert.equal(paginated.data.items.length, 1);
    assert.equal(paginated.data.items[0].rollNo, '24-ME-099');

    // CSV export with formula injection hardening + phone preservation
    const csvResponse = await fetch(`${baseUrl}/api/admin/registrations/export.csv`, {
      headers: bearerHeaders,
    });
    assert.equal(csvResponse.status, 200);
    const csvBody = await csvResponse.text();
    assert.ok(csvBody.includes('RegID,FullName'));
    assert.ok(csvBody.includes('VerifyCode'));
    assert.ok(csvBody.includes('Aarav Verma'));
    assert.ok(csvBody.includes("'=1+1"));
    assert.ok(!csvBody.includes('"=1+1"'));
    assert.ok(csvBody.includes('+91 9876543210'));

    // Audit trail verification
    const audit = await apiJson<{ auditLogs: { action: string }[] }>('/api/admin/audit?limit=50', {
      headers: bearerHeaders,
    });
    assert.equal(audit.status, 200);
    const actions = new Set(audit.data.auditLogs.map((entry) => entry.action));
    assert.ok(actions.has('ADMIN_LOGIN'));
    assert.ok(actions.has('FEST_UPDATED'));
    assert.ok(actions.has('PASS_UPDATED'));
    assert.ok(actions.has('CSV_EXPORTED'));
    assert.ok(actions.has('DB_BACKUP'));
    assert.ok(actions.has('RESULT_PUBLISHED'));
    assert.ok(actions.has('ANNOUNCEMENT_CREATED'));

    // Brute force auth rate limiting returns 429 after 15 requests
    resetAllRateLimiters();
    const attempts = await Promise.all(
      Array.from({ length: 15 }, () =>
        apiJson('/api/admin/auth', {
          method: 'POST',
          body: JSON.stringify({ pin: 'BAD' }),
        })
      )
    );
    assert.ok(attempts.every((attempt) => attempt.status === 401));
    const blocked = await apiJson('/api/admin/auth', {
      method: 'POST',
      body: JSON.stringify({ pin: 'TESTPIN99' }),
    });
    assert.equal(blocked.status, 429);
    assert.ok(blocked.headers.get('retry-after'));
  });
});
