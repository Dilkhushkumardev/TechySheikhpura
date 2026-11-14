import {
  FEST_INFO,
  FEST_EVENTS,
  FEST_PASSES,
  FEST_SCHEDULE,
  FEST_FAQS,
  FEST_CLUBS,
  FEST_ORGANIZERS,
  FEST_RESULTS,
} from '../data/techySheikhpuraData';
import type {
  AdminDashboardData,
  InquiryRecord,
  RegistrationRecord,
  ScheduleItemRecord,
  TeamRegistrationRecord,
} from './api';

const TEAMS_STORAGE_KEY = 'techy_sheikhpura_teams';
const PASSES_STORAGE_KEY = 'techy_sheikhpura_passes';
const INQUIRIES_STORAGE_KEY = 'techy_sheikhpura_inquiries';

const SEED_TEAMS: TeamRegistrationRecord[] = [
  {
    teamId: 'TS26-TEAM-101',
    teamName: 'Team CyberKnights',
    eventId: 'hackarena',
    eventTitle: 'HackArena',
    leaderName: 'Aman Verma',
    leaderRoll: '23105147012',
    leaderEmail: 'aman.verma@gecsheikhpura.ac.in',
    leaderPhone: '9876543210',
    branch: 'Computer Science & Engineering (CSE)',
    year: '3rd Year (2024-28)',
    members: [
      { name: 'Rohan Gupta', rollNo: '23105147018', branch: 'CSE' },
      { name: 'Priya Kumari', rollNo: '23105147025', branch: 'CSE' },
      { name: 'Vikash Kumar', rollNo: '23105147031', branch: 'ECE' },
    ],
    projectTitle: 'Campus Flow: Smart IoT Energy Management',
    notes: 'Need 2 power extension sockets at bench',
    status: 'confirmed',
    checkedIn: false,
    checkedInAt: null,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    teamId: 'TS26-TEAM-102',
    teamName: 'Squad AlphaX',
    eventId: 'esports-bgmi',
    eventTitle: 'Esports Arena: BGMI Battle Royale',
    leaderName: 'Sameer Khan',
    leaderRoll: '23105147045',
    leaderEmail: 'sameer.k@gecsheikhpura.ac.in',
    leaderPhone: '9876543211',
    branch: 'Civil Engineering (CE)',
    year: '2nd Year (2025-29)',
    members: [
      { name: 'Rahul Roy', rollNo: '23105147048', branch: 'CE' },
      { name: 'Deepak Jha', rollNo: '23105147052', branch: 'CSE' },
      { name: 'Ankit Singh', rollNo: '23105147055', branch: 'EE' },
    ],
    projectTitle: 'Esports Squad AlphaX',
    notes: '4-man squad ready for Erangel Qualifier',
    status: 'confirmed',
    checkedIn: true,
    checkedInAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

const SEED_PASSES: RegistrationRecord[] = [
  {
    regId: 'TS26-GECS-10021',
    passId: 'all-events-pass',
    passName: 'All-Events Delegate Pass',
    price: 0,
    eventId: 'hackarena',
    eventTitle: 'HackArena',
    fullName: 'Aman Verma',
    rollNo: '23105147012',
    branch: 'CSE',
    year: '3rd Year (2024-28)',
    phone: '9876543210',
    email: 'aman.verma@gecsheikhpura.ac.in',
    teamName: 'Team CyberKnights',
    checkedIn: true,
    checkedInAt: new Date(Date.now() - 3600000).toISOString(),
    bookedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    regId: 'TS26-GECS-10022',
    passId: 'esports-arena-pass',
    passName: 'Esports Arena Pass',
    price: 0,
    eventId: 'esports-bgmi',
    eventTitle: 'Esports Arena: BGMI Battle Royale',
    fullName: 'Sameer Khan',
    rollNo: '23105147045',
    branch: 'CE',
    year: '2nd Year (2025-29)',
    phone: '9876543211',
    email: 'sameer.k@gecsheikhpura.ac.in',
    teamName: 'Squad AlphaX',
    checkedIn: false,
    checkedInAt: null,
    bookedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    regId: 'TS26-GECS-10023',
    passId: 'vip-innovator-pass',
    passName: 'VIP Innovator Pass',
    price: 0,
    eventId: null,
    eventTitle: null,
    fullName: 'Supriya Singh',
    rollNo: '23105147001',
    branch: 'CSE',
    year: '4th Year (2023-27)',
    phone: '9876543210',
    email: 'supriya.singh@gecsheikhpura.ac.in',
    teamName: null,
    checkedIn: false,
    checkedInAt: null,
    bookedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

const SEED_INQUIRIES: InquiryRecord[] = [
  {
    id: 1,
    name: 'Vikash Kumar',
    email: 'vikash.k@gecsheikhpura.ac.in',
    rollNo: '23105147031',
    subject: 'Power sockets at HackArena',
    message: 'Can our team bring multi-plug extension boards for hardware testing?',
    status: 'resolved',
    adminNote: 'Extension sockets provided at central benches.',
    resolvedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

export function getOfflineTeams(): TeamRegistrationRecord[] {
  try {
    const raw = localStorage.getItem(TEAMS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(SEED_TEAMS));
      return [...SEED_TEAMS];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(SEED_TEAMS));
      return [...SEED_TEAMS];
    }
    return parsed as TeamRegistrationRecord[];
  } catch {
    return [...SEED_TEAMS];
  }
}

export function saveOfflineTeam(team: TeamRegistrationRecord): TeamRegistrationRecord {
  try {
    const existing = getOfflineTeams();
    const filtered = existing.filter((t) => t.teamId !== team.teamId);
    const updated = [team, ...filtered];
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // LocalStorage may be blocked in strict private mode
  }
  return team;
}

export function toggleOfflineTeamCheckIn(teamId: string, checkedIn: boolean): TeamRegistrationRecord | null {
  const teams = getOfflineTeams();
  const index = teams.findIndex((t) => t.teamId === teamId);
  if (index === -1) return null;

  const target = teams[index];
  const updated: TeamRegistrationRecord = {
    ...target,
    checkedIn,
    checkedInAt: checkedIn ? new Date().toISOString() : null,
  };
  teams[index] = updated;

  try {
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
  } catch {
    // Ignore storage errors
  }
  return updated;
}

export function deleteOfflineTeam(teamId: string): boolean {
  const teams = getOfflineTeams();
  const filtered = teams.filter((t) => t.teamId !== teamId);
  try {
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // Ignore storage errors
  }
  return filtered.length !== teams.length;
}

export function getOfflineRegistrations(): RegistrationRecord[] {
  try {
    const raw = localStorage.getItem(PASSES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PASSES_STORAGE_KEY, JSON.stringify(SEED_PASSES));
      return [...SEED_PASSES];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(PASSES_STORAGE_KEY, JSON.stringify(SEED_PASSES));
      return [...SEED_PASSES];
    }
    return parsed.map((item: any) => ({
      regId: String(item.regId || `TS26-GECS-${Math.floor(10000 + Math.random() * 90000)}`),
      passId: String(item.passId || 'all-events-pass'),
      passName: String(item.passName || 'All-Events Delegate Pass'),
      price: Number(item.price ?? 149),
      eventId: item.eventId ?? null,
      eventTitle: item.eventTitle ?? null,
      fullName: String(item.fullName || 'Student Delegate'),
      rollNo: String(item.rollNo || '23105147000'),
      branch: String(item.branch || 'CSE'),
      year: String(item.year || '3rd Year'),
      phone: String(item.phone || '9876543210'),
      email: String(item.email || 'student@gecsheikhpura.ac.in'),
      teamName: item.teamName ?? null,
      checkedIn: Boolean(item.checkedIn),
      checkedInAt: item.checkedInAt ?? null,
      bookedAt: String(item.bookedAt || new Date().toISOString()),
      createdAt: String(item.createdAt || item.bookedAt || new Date().toISOString()),
      verifyCode: item.verifyCode,
    }));
  } catch {
    return [...SEED_PASSES];
  }
}

export function toggleOfflineRegistrationCheckIn(regId: string, checkedIn: boolean): RegistrationRecord | null {
  const regs = getOfflineRegistrations();
  const index = regs.findIndex((r) => r.regId === regId);
  if (index === -1) return null;

  const target = regs[index];
  const updated: RegistrationRecord = {
    ...target,
    checkedIn,
    checkedInAt: checkedIn ? new Date().toISOString() : null,
  };
  regs[index] = updated;

  try {
    localStorage.setItem(PASSES_STORAGE_KEY, JSON.stringify(regs));
  } catch {
    // Ignore storage errors
  }
  return updated;
}

export function deleteOfflineRegistration(regId: string): boolean {
  const regs = getOfflineRegistrations();
  const filtered = regs.filter((r) => r.regId !== regId);
  try {
    localStorage.setItem(PASSES_STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // Ignore storage errors
  }
  return filtered.length !== regs.length;
}

export function getOfflineInquiries(): InquiryRecord[] {
  try {
    const raw = localStorage.getItem(INQUIRIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(SEED_INQUIRIES));
      return [...SEED_INQUIRIES];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(SEED_INQUIRIES));
      return [...SEED_INQUIRIES];
    }
    return parsed as InquiryRecord[];
  } catch {
    return [...SEED_INQUIRIES];
  }
}

export function buildOfflineDashboardData(): AdminDashboardData {
  const teams = getOfflineTeams();
  const regs = getOfflineRegistrations();
  const inquiries = getOfflineInquiries();

  const totalRevenue = regs.reduce((sum, r) => sum + r.price, 0);
  const checkedInCount = regs.filter((r) => r.checkedIn).length;
  const checkedInTeams = teams.filter((t) => t.checkedIn).length;
  const openInquiries = inquiries.filter((i) => i.status === 'open').length;

  const passMap = new Map<string, { count: number; revenue: number; name: string; price: number }>();
  for (const r of regs) {
    const existing = passMap.get(r.passId) ?? {
      count: 0,
      revenue: 0,
      name: r.passName,
      price: r.price,
    };
    existing.count += 1;
    existing.revenue += r.price;
    passMap.set(r.passId, existing);
  }

  const passBreakdown = Array.from(passMap.entries()).map(([passId, val]) => ({
    passId,
    passName: val.name,
    price: val.price,
    bookings: val.count,
    revenue: val.revenue,
  }));

  const branchMap = new Map<string, number>();
  for (const r of regs) {
    const b = r.branch || 'Other';
    branchMap.set(b, (branchMap.get(b) ?? 0) + 1);
  }
  const branchBreakdown = Array.from(branchMap.entries()).map(([branch, count]) => ({
    branch,
    count,
  }));

  const scheduleRecords: ScheduleItemRecord[] = FEST_SCHEDULE.map((item, idx) => ({
    ...item,
    id: `sched-offline-${idx + 1}`,
  }));

  const faqRecords = FEST_FAQS.map((faq, idx) => ({
    id: idx + 1,
    q: faq.q,
    a: faq.a,
  }));

  const resultRecords = FEST_RESULTS.map((res) => ({
    id: res.id,
    eventId: res.eventId,
    eventTitle: res.eventTitle,
    position: res.position,
    winnerName: res.winnerName,
    teamName: res.teamName,
    branch: 'CSE',
    rollNo: '23105147000',
    prize: 'Certificate & Trophy',
    announcedAt: new Date().toISOString(),
  }));

  return {
    summary: {
      totalRegistrations: regs.length,
      checkedInCount,
      totalRevenue,
      openInquiries,
      totalTeams: teams.length,
      checkedInTeams,
      totalEvents: FEST_EVENTS.length,
    },
    passBreakdown,
    branchBreakdown,
    registrations: regs,
    inquiries,
    teams,
    events: FEST_EVENTS,
    schedule: scheduleRecords,
    faqs: faqRecords,
    clubs: FEST_CLUBS,
    organizers: FEST_ORGANIZERS,
    announcements: [
      {
        id: 1,
        title: 'Offline / GitHub Pages Demo Mode Active',
        message: 'Client-side storage enabled. All registrations, passes, and check-ins are saved in your browser.',
        priority: 'info',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ],
    results: resultRecords,
    festInfo: {
      ...FEST_INFO,
      shortCollegeName: FEST_INFO.shortCollegeName,
    },
    passes: FEST_PASSES,
    auditLogs: [
      {
        id: 1,
        action: 'STORAGE_INIT',
        targetType: 'system',
        targetId: 'offline',
        details: 'Loaded GitHub Pages client-side storage dataset',
        createdAt: new Date().toISOString(),
      },
    ],
    dbStats: {
      dbPath: 'browser:localStorage (GitHub Pages Mode)',
      journalMode: 'memory',
      foreignKeys: true,
      integrityCheck: 'ok',
      schemaVersion: 8,
      pageSize: 4096,
      pageCount: 1,
      estimatedBytes: 16384,
      tableCounts: {
        registrations: regs.length,
        team_registrations: teams.length,
        inquiries: inquiries.length,
        events: FEST_EVENTS.length,
        passes: FEST_PASSES.length,
        schedule: scheduleRecords.length,
      },
    },
  };
}

export function triggerCsvDownload(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadOfflineTeamsCsv(teamsInput?: TeamRegistrationRecord[]): void {
  const teams = teamsInput ?? getOfflineTeams();
  const headers = [
    'Team ID',
    'Team Name',
    'Event ID',
    'Event Title',
    'Leader Name',
    'Leader Roll',
    'Leader Email',
    'Leader Phone',
    'Branch',
    'Year',
    'Members Count',
    'Members JSON',
    'Project Title',
    'Notes',
    'Status',
    'Checked In',
    'Created At',
  ];

  const escapeCell = (val: unknown) => {
    const s = String(val ?? '').replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = teams.map((t) => [
    escapeCell(t.teamId),
    escapeCell(t.teamName),
    escapeCell(t.eventId),
    escapeCell(t.eventTitle),
    escapeCell(t.leaderName),
    escapeCell(t.leaderRoll),
    escapeCell(t.leaderEmail),
    escapeCell(t.leaderPhone),
    escapeCell(t.branch),
    escapeCell(t.year),
    escapeCell(t.members.length + 1),
    escapeCell(JSON.stringify(t.members)),
    escapeCell(t.projectTitle ?? ''),
    escapeCell(t.notes ?? ''),
    escapeCell(t.status),
    escapeCell(t.checkedIn ? 'Yes' : 'No'),
    escapeCell(t.createdAt),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  triggerCsvDownload(`techysheikhpura-teams-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}

export function downloadOfflineRegistrationsCsv(regsInput?: RegistrationRecord[]): void {
  const regs = regsInput ?? getOfflineRegistrations();
  const headers = [
    'Registration ID',
    'Pass ID',
    'Pass Name',
    'Price (INR)',
    'Event ID',
    'Event Title',
    'Full Name',
    'Roll Number',
    'Branch',
    'Year',
    'Phone',
    'Email',
    'Team Name',
    'Checked In',
    'Booked At',
  ];

  const escapeCell = (val: unknown) => {
    const s = String(val ?? '').replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = regs.map((r) => [
    escapeCell(r.regId),
    escapeCell(r.passId),
    escapeCell(r.passName),
    escapeCell(r.price),
    escapeCell(r.eventId ?? ''),
    escapeCell(r.eventTitle ?? ''),
    escapeCell(r.fullName),
    escapeCell(r.rollNo),
    escapeCell(r.branch),
    escapeCell(r.year),
    escapeCell(r.phone),
    escapeCell(r.email),
    escapeCell(r.teamName ?? ''),
    escapeCell(r.checkedIn ? 'Yes' : 'No'),
    escapeCell(r.bookedAt),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  triggerCsvDownload(`techysheikhpura-registrations-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
