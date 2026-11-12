import type {
  CampusClub,
  FestEvent,
  FestPass,
  OrganizerMember,
  ScheduleItem,
} from '../data/techySheikhpuraData';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

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
  id?: number;
  q: string;
  a: string;
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

export interface HealthStats {
  events: number;
  passes: number;
  schedule: number;
  faqs: number;
  registrations: number;
  checkedIn: number;
  inquiries: number;
  clubs?: number;
  organizers?: number;
  announcements?: number;
  results?: number;
}

export interface FestBundleResponse {
  festInfo: FestInfoPayload;
  events: FestEvent[];
  passes: FestPass[];
  schedule: ScheduleItem[];
  faqs: FaqItem[];
  clubs: CampusClub[];
  organizers: OrganizerMember[];
  announcements: AnnouncementRecord[];
  results: EventResultRecord[];
  activityStream: ActivityItem[];
  stats: HealthStats;
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
  checkedIn: boolean;
  checkedInAt: string | null;
  bookedAt: string;
  createdAt: string;
  verifyCode?: string;
}

export interface CreateRegistrationPayload {
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

export interface CreateRegistrationResponse {
  registration: RegistrationRecord;
  activityStream: ActivityItem[];
}

export interface InquiryRecord {
  id: number;
  name: string;
  email: string;
  rollNo: string | null;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  adminNote?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface CreateInquiryPayload {
  name: string;
  email: string;
  rollNo?: string;
  subject: string;
  message: string;
}

export interface CreateEventPayload {
  id?: string;
  title: string;
  tagline: string;
  category: FestEvent['category'];
  date: string;
  time: string;
  venue: string;
  image?: string;
  description: string;
  teamSize?: string;
  entryFee?: string;
  prizes?: string;
  rules?: string[];
  coordinators?: { name: string; contact: string }[];
  featured?: boolean;
}

export interface ScheduleItemRecord extends ScheduleItem {
  id: string;
}

export interface CreateSchedulePayload {
  day: 'Day 1' | 'Day 2';
  time: string;
  title: string;
  category: string;
  venue: string;
  description: string;
}

export interface UpdateFestInfoPayload {
  tagline?: string;
  dates?: string;
  venue?: string;
  email?: string;
  phone?: string;
  studentConvenor?: string;
  telegram?: string;
}

export interface AdminDashboardData {
  summary: {
    totalRegistrations: number;
    checkedInCount: number;
    totalRevenue: number;
    openInquiries: number;
    totalEvents: number;
  };
  passBreakdown: {
    passId: string;
    passName: string;
    price: number;
    bookings: number;
    revenue: number;
  }[];
  branchBreakdown: {
    branch: string;
    count: number;
  }[];
  registrations: RegistrationRecord[];
  inquiries: InquiryRecord[];
  events: FestEvent[];
  schedule: ScheduleItemRecord[];
  faqs: { id: number; q: string; a: string }[];
  clubs: CampusClub[];
  organizers: OrganizerMember[];
  announcements: AnnouncementRecord[];
  results: EventResultRecord[];
  festInfo: FestInfoPayload;
  passes: FestPass[];
  auditLogs: AuditLogRecord[];
  dbStats: DatabaseDiagnostics;
}

export interface AuditLogRecord {
  id: number;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
}

export interface UpdatePassPayload {
  name?: string;
  tagline?: string;
  price?: number;
  originalPrice?: number;
  isPopular?: boolean;
  accessScope?: string;
  features?: string[];
}

export class ApiError extends Error {
  readonly status: number;
  readonly existingRegId?: string;

  constructor(status: number, message: string, existingRegId?: string) {
    super(message);
    this.status = status;
    this.existingRegId = existingRegId;
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    const body = (parsed && typeof parsed === 'object' ? parsed : {}) as {
      error?: string;
      existingRegId?: string;
    };
    throw new ApiError(
      response.status,
      body.error || `Request failed with status ${response.status}`,
      body.existingRegId
    );
  }

  return parsed as T;
}

export function fetchFestBundle(): Promise<FestBundleResponse> {
  return requestJson<FestBundleResponse>('/api/fest');
}

export function createRegistration(
  payload: CreateRegistrationPayload
): Promise<CreateRegistrationResponse> {
  return requestJson<CreateRegistrationResponse>('/api/registrations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export type VerifySignatureStatus = 'valid' | 'invalid' | 'unchecked';

export function verifyRegistrations(
  query: string,
  sig?: string
): Promise<{
  query: string;
  count: number;
  signatureStatus?: VerifySignatureStatus;
  registrations: RegistrationRecord[];
}> {
  const params = new URLSearchParams({ q: query.trim() });
  if (sig?.trim()) {
    params.set('sig', sig.trim());
  }
  return requestJson(`/api/registrations/verify?${params.toString()}`);
}

export function createInquiry(
  payload: CreateInquiryPayload
): Promise<{ inquiry: InquiryRecord }> {
  return requestJson<{ inquiry: InquiryRecord }>('/api/inquiries', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface AdminAuthResponse {
  authenticated: boolean;
  token: string;
  expiresAt: string;
}

export function verifyAdminPin(pin: string): Promise<AdminAuthResponse> {
  return requestJson<AdminAuthResponse>('/api/admin/auth', {
    method: 'POST',
    body: JSON.stringify({ pin }),
  });
}

function adminAuthHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export function fetchAdminDashboard(token: string): Promise<AdminDashboardData> {
  return requestJson<AdminDashboardData>('/api/admin/dashboard', {
    headers: adminAuthHeaders(token),
  });
}

export function updateAdminFestInfo(
  token: string,
  payload: UpdateFestInfoPayload
): Promise<{ festInfo: FestInfoPayload }> {
  return requestJson('/api/admin/fest', {
    method: 'PATCH',
    headers: adminAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function updateAdminPass(
  token: string,
  passId: string,
  payload: UpdatePassPayload
): Promise<{ pass: FestPass }> {
  return requestJson(`/api/admin/passes/${encodeURIComponent(passId)}`, {
    method: 'PATCH',
    headers: adminAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function downloadRegistrationsCsv(token: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/admin/registrations/export.csv`, {
    headers: adminAuthHeaders(token),
  });
  if (!response.ok) {
    throw new ApiError(response.status, 'Failed to download CSV export');
  }
  const csv = await response.text();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `techysheikhpura-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function toggleRegistrationCheckIn(
  token: string,
  regId: string,
  checkedIn: boolean
): Promise<{ registration: RegistrationRecord }> {
  return requestJson(`/api/admin/registrations/${encodeURIComponent(regId)}/checkin`, {
    method: 'PATCH',
    headers: adminAuthHeaders(token),
    body: JSON.stringify({ checkedIn }),
  });
}

export function deleteAdminRegistration(
  token: string,
  regId: string
): Promise<{ deleted: boolean; regId: string }> {
  return requestJson(`/api/admin/registrations/${encodeURIComponent(regId)}`, {
    method: 'DELETE',
    headers: adminAuthHeaders(token),
  });
}

export function updateAdminInquiryStatus(
  token: string,
  id: number,
  status: 'open' | 'resolved',
  adminNote?: string
): Promise<{ inquiry: InquiryRecord }> {
  return requestJson(`/api/admin/inquiries/${id}/status`, {
    method: 'PATCH',
    headers: adminAuthHeaders(token),
    body: JSON.stringify({ status, ...(adminNote !== undefined ? { adminNote } : {}) }),
  });
}

export function deleteAdminInquiry(
  token: string,
  id: number
): Promise<{ deleted: boolean; id: number }> {
  return requestJson(`/api/admin/inquiries/${id}`, {
    method: 'DELETE',
    headers: adminAuthHeaders(token),
  });
}

export function createAdminEvent(
  token: string,
  payload: CreateEventPayload
): Promise<{ event: FestEvent }> {
  return requestJson('/api/admin/events', {
    method: 'POST',
    headers: adminAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function deleteAdminEvent(
  token: string,
  id: string
): Promise<{ deleted: boolean; id: string }> {
  return requestJson(`/api/admin/events/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: adminAuthHeaders(token),
  });
}

export function createAdminScheduleItem(
  token: string,
  payload: CreateSchedulePayload
): Promise<{ item: ScheduleItemRecord }> {
  return requestJson('/api/admin/schedule', {
    method: 'POST',
    headers: adminAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function deleteAdminScheduleItem(
  token: string,
  id: string
): Promise<{ deleted: boolean; id: string }> {
  return requestJson(`/api/admin/schedule/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: adminAuthHeaders(token),
  });
}

export function createAdminFaq(
  token: string,
  payload: { q: string; a: string }
): Promise<{ faq: { id: number; q: string; a: string } }> {
  return requestJson('/api/admin/faqs', {
    method: 'POST',
    headers: adminAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function deleteAdminFaq(
  token: string,
  id: number
): Promise<{ deleted: boolean; id: number }> {
  return requestJson(`/api/admin/faqs/${id}`, {
    method: 'DELETE',
    headers: adminAuthHeaders(token),
  });
}

export async function downloadDatabaseBackup(token: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/admin/db/backup`, {
    headers: adminAuthHeaders(token),
  });
  if (!response.ok) {
    throw new ApiError(response.status, 'Failed to download SQLite backup snapshot');
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `techysheikhpura-backup-${new Date().toISOString().slice(0, 10)}.db`;
  link.click();
  URL.revokeObjectURL(url);
}

export function createAdminClub(
  token: string,
  payload: Omit<CampusClub, 'id'> & { id?: string }
): Promise<{ club: CampusClub }> {
  return requestJson('/api/admin/clubs', {
    method: 'POST',
    headers: adminAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function deleteAdminClub(token: string, id: string): Promise<{ deleted: boolean; id: string }> {
  return requestJson(`/api/admin/clubs/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: adminAuthHeaders(token),
  });
}

export function createAdminOrganizer(
  token: string,
  payload: Omit<OrganizerMember, 'id'> & { id?: string }
): Promise<{ organizer: OrganizerMember }> {
  return requestJson('/api/admin/organizers', {
    method: 'POST',
    headers: adminAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function deleteAdminOrganizer(token: string, id: string): Promise<{ deleted: boolean; id: string }> {
  return requestJson(`/api/admin/organizers/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: adminAuthHeaders(token),
  });
}

export function createAdminAnnouncement(
  token: string,
  payload: { title: string; message: string; priority: AnnouncementRecord['priority'] }
): Promise<{ announcement: AnnouncementRecord }> {
  return requestJson('/api/admin/announcements', {
    method: 'POST',
    headers: adminAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function toggleAdminAnnouncement(
  token: string,
  id: number,
  isActive: boolean
): Promise<{ announcement: AnnouncementRecord }> {
  return requestJson(`/api/admin/announcements/${id}`, {
    method: 'PATCH',
    headers: adminAuthHeaders(token),
    body: JSON.stringify({ isActive }),
  });
}

export function deleteAdminAnnouncement(
  token: string,
  id: number
): Promise<{ deleted: boolean; id: number }> {
  return requestJson(`/api/admin/announcements/${id}`, {
    method: 'DELETE',
    headers: adminAuthHeaders(token),
  });
}

export function createAdminResult(
  token: string,
  payload: {
    eventId: string;
    position: string;
    winnerName: string;
    teamName?: string;
    branch: string;
    rollNo?: string;
    prize: string;
  }
): Promise<{ result: EventResultRecord }> {
  return requestJson('/api/admin/results', {
    method: 'POST',
    headers: adminAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function deleteAdminResult(
  token: string,
  id: number
): Promise<{ deleted: boolean; id: number }> {
  return requestJson(`/api/admin/results/${id}`, {
    method: 'DELETE',
    headers: adminAuthHeaders(token),
  });
}

