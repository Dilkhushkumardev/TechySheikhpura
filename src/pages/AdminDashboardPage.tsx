import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  CalendarPlus,
  CheckCircle2,
  Database,
  Download,
  HelpCircle,
  History,
  IndianRupee,
  Loader2,
  Lock,
  LogOut,
  MessageSquare,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Ticket,
  Trash2,
  Trophy,
  Users,
} from 'lucide-react';
import { TechyLogo } from '../components/techy/TechyLogo';
import {
  FEST_EVENTS,
  FEST_INFO,
  type CampusClub,
  type FestEvent,
  type FestPass,
  type OrganizerMember,
} from '../data/techySheikhpuraData';
import {
  ApiError,
  createAdminAnnouncement,
  createAdminClub,
  createAdminEvent,
  createAdminFaq,
  createAdminOrganizer,
  createAdminResult,
  createAdminScheduleItem,
  deleteAdminAnnouncement,
  deleteAdminClub,
  deleteAdminEvent,
  deleteAdminFaq,
  deleteAdminInquiry,
  deleteAdminOrganizer,
  deleteAdminRegistration,
  deleteAdminResult,
  deleteAdminScheduleItem,
  deleteAdminTeamRegistration,
  downloadDatabaseBackup,
  downloadRegistrationsCsv,
  downloadTeamsCsv,
  fetchAdminDashboard,
  toggleAdminAnnouncement,
  toggleRegistrationCheckIn,
  toggleTeamRegistrationCheckIn,
  updateAdminFestInfo,
  updateAdminInquiryStatus,
  updateAdminPass,
  verifyAdminPin,
  type AdminDashboardData,
  type AnnouncementRecord,
  type AuditLogRecord,
  type DatabaseDiagnostics,
  type EventResultRecord,
  type FestInfoPayload,
} from '../services/api';
import {
  buildOfflineDashboardData,
  deleteOfflineRegistration,
  deleteOfflineTeam,
  downloadOfflineRegistrationsCsv,
  downloadOfflineTeamsCsv,
  toggleOfflineRegistrationCheckIn,
  toggleOfflineTeamCheckIn,
} from '../services/offlineStorage';

const TOKEN_STORAGE_KEY = 'techy_admin_token';
const CATEGORIES: FestEvent['category'][] = [
  'Coding',
  'Robotics',
  'Aero & Drone',
  'Esports',
  'Startup & Pitch',
  'Mechanical & Civil',
  'Fun & Brain',
];

type ConsoleTab =
  | 'registrations'
  | 'teams'
  | 'inquiries'
  | 'events'
  | 'schedule'
  | 'faqs'
  | 'community'
  | 'settings'
  | 'audit';

interface PassEditorCardProps {
  pass: FestPass;
  token: string;
  onSaved: () => Promise<void>;
  onError: (msg: string) => void;
}

const PassEditorCard: React.FC<PassEditorCardProps> = ({ pass, token, onSaved, onError }) => {
  const [name, setName] = useState(pass.name);
  const [tagline, setTagline] = useState(pass.tagline);
  const [price, setPrice] = useState(String(pass.price));
  const [originalPrice, setOriginalPrice] = useState(String(pass.originalPrice));
  const [accessScope, setAccessScope] = useState(pass.accessScope);
  const [isPopular, setIsPopular] = useState(Boolean(pass.isPopular));
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Number.parseInt(price, 10);
    const numericOriginal = Number.parseInt(originalPrice, 10);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      onError('Pass price must be a non-negative integer.');
      return;
    }
    setSaving(true);
    try {
      await updateAdminPass(token, pass.id, {
        name: name.trim(),
        tagline: tagline.trim(),
        price: numericPrice,
        originalPrice: Number.isFinite(numericOriginal) && numericOriginal >= 0 ? numericOriginal : numericPrice,
        accessScope: accessScope.trim(),
        isPopular,
      });
      await onSaved();
    } catch (err) {
      onError(err instanceof Error ? err.message : `Failed to update pass '${pass.name}'`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="p-5 rounded-2xl bg-gradient-to-b from-[#0d071a]/95 via-[#080512]/95 to-[#050309]/95 border border-white/10 hover:border-fuchsia-500/35 space-y-3.5 text-xs shadow-lg transition-all"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-fuchsia-300 font-bold uppercase tracking-wider">
          Tier ID: {pass.id}
        </span>
        <button
          type="button"
          onClick={() => setIsPopular((prev) => !prev)}
          className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold border transition-all ${
            isPopular
              ? 'bg-amber-500/20 border-amber-400/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
              : 'bg-white/5 border-white/10 text-slate-400'
          }`}
        >
          {isPopular ? 'Popular Badge: ON' : 'Popular Badge: OFF'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Pass Name"
          className="px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
        />
        <input
          type="text"
          required
          value={accessScope}
          onChange={(e) => setAccessScope(e.target.value)}
          placeholder="Access Scope"
          className="px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
        />
        <input
          type="number"
          min={0}
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price (INR)"
          className="px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-emerald-300 font-mono focus:border-fuchsia-400 focus:outline-none"
        />
        <input
          type="number"
          min={0}
          required
          value={originalPrice}
          onChange={(e) => setOriginalPrice(e.target.value)}
          placeholder="Original Price (INR)"
          className="px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-slate-300 font-mono focus:border-fuchsia-400 focus:outline-none"
        />
      </div>

      <input
        type="text"
        required
        value={tagline}
        onChange={(e) => setTagline(e.target.value)}
        placeholder="Tagline"
        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-slate-200 focus:border-fuchsia-400 focus:outline-none"
      />

      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2.5 rounded-xl bg-fuchsia-600/25 hover:bg-fuchsia-600/40 border border-fuchsia-400/40 text-fuchsia-200 font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(217,70,239,0.15)] transition-all"
      >
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
        <span>Save Tier Pricing</span>
      </button>
    </form>
  );
};

interface FestInfoFormProps {
  festInfo: FestInfoPayload;
  token: string;
  onSaved: () => Promise<void>;
  onError: (msg: string) => void;
}

const FestInfoEditorForm: React.FC<FestInfoFormProps> = ({ festInfo, token, onSaved, onError }) => {
  const [tagline, setTagline] = useState(festInfo.tagline);
  const [dates, setDates] = useState(festInfo.dates);
  const [venue, setVenue] = useState(festInfo.venue);
  const [email, setEmail] = useState(festInfo.contacts.email);
  const [phone, setPhone] = useState(festInfo.contacts.phone);
  const [studentConvenor, setStudentConvenor] = useState(festInfo.contacts.studentConvenor);
  const [telegram, setTelegram] = useState(festInfo.contacts.telegram);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAdminFestInfo(token, {
        tagline: tagline.trim(),
        dates: dates.trim(),
        venue: venue.trim(),
        email: email.trim(),
        phone: phone.trim(),
        studentConvenor: studentConvenor.trim(),
        telegram: telegram.trim(),
      });
      await onSaved();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to update fest metadata');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="lg:col-span-5 p-5 rounded-2xl bg-gradient-to-b from-[#0e071c] via-[#090514] to-[#05030b] border border-fuchsia-500/35 shadow-[0_4px_25px_rgba(217,70,239,0.08)] space-y-3.5 text-xs backdrop-blur-md"
    >
      <div className="flex items-center gap-2 text-fuchsia-300 font-mono font-bold uppercase tracking-wider">
        <Settings className="w-4 h-4 text-fuchsia-400" />
        <span>Fest Identity &amp; Contacts</span>
      </div>
      <input
        type="text"
        required
        value={tagline}
        onChange={(e) => setTagline(e.target.value)}
        placeholder="Fest Tagline"
        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <input
          type="text"
          required
          value={dates}
          onChange={(e) => setDates(e.target.value)}
          placeholder="Dates (e.g. Sep 28 - Sep 29, 2026)"
          className="px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Official Desk Email"
          className="px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
        />
      </div>
      <input
        type="text"
        required
        value={venue}
        onChange={(e) => setVenue(e.target.value)}
        placeholder="Campus Venue"
        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <input
          type="text"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Helpdesk Phone"
          className="px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-white font-mono focus:border-fuchsia-400 focus:outline-none"
        />
        <input
          type="text"
          required
          value={studentConvenor}
          onChange={(e) => setStudentConvenor(e.target.value)}
          placeholder="Student Convenor Phone"
          className="px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-white font-mono focus:border-fuchsia-400 focus:outline-none"
        />
      </div>
      <input
        type="url"
        required
        value={telegram}
        onChange={(e) => setTelegram(e.target.value)}
        placeholder="Official Telegram URL"
        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-sky-300 font-mono focus:border-fuchsia-400 focus:outline-none"
      />
      <button
        type="submit"
        disabled={saving}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        <span>Update Fest Settings</span>
      </button>
    </form>
  );
};

const DatabaseHealthPanel: React.FC<{
  dbStats: DatabaseDiagnostics;
  token: string;
  onError: (msg: string) => void;
}> = ({ dbStats, token, onError }) => {
  const [downloading, setDownloading] = useState(false);

  const handleBackup = async () => {
    setDownloading(true);
    try {
      await downloadDatabaseBackup(token);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to export SQLite backup');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-b from-[#061710] via-[#040d09] to-[#020504] border border-emerald-500/35 shadow-[0_4px_25px_rgba(16,185,129,0.08)] space-y-4 text-xs backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-emerald-300 font-mono font-bold uppercase tracking-wider">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>SQLite Engine Diagnostics ({Object.keys(dbStats.tableCounts).length} Tables)</span>
        </div>
        <button
          type="button"
          onClick={() => void handleBackup()}
          disabled={downloading}
          className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 font-mono font-bold inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all"
        >
          {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          <span>Download .db Backup</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-[11px]">
        <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
          <span className="text-slate-400 block text-[10px]">Journal Mode</span>
          <strong className="text-white uppercase">{dbStats.journalMode}</strong>
        </div>
        <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
          <span className="text-slate-400 block text-[10px]">Integrity Check</span>
          <strong className="text-emerald-300 uppercase">{dbStats.integrityCheck}</strong>
        </div>
        <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
          <span className="text-slate-400 block text-[10px]">Schema Version</span>
          <strong className="text-fuchsia-300">v{dbStats.schemaVersion}</strong>
        </div>
        <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
          <span className="text-slate-400 block text-[10px]">Allocated Size</span>
          <strong className="text-white">{Math.round(dbStats.estimatedBytes / 1024)} KB</strong>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 font-mono text-[10px]">
        {Object.entries(dbStats.tableCounts).map(([table, count]) => (
          <span
            key={table}
            className="px-2.5 py-1 rounded-lg bg-black/50 border border-white/10 text-slate-300"
          >
            {table}: <strong className="text-fuchsia-300">{count}</strong>
          </span>
        ))}
      </div>
    </div>
  );
};

interface CommunityPanelProps {
  announcements: AnnouncementRecord[];
  clubs: CampusClub[];
  organizers: OrganizerMember[];
  results: EventResultRecord[];
  events: FestEvent[];
  token: string;
  onSaved: () => Promise<void>;
  onError: (msg: string) => void;
}

const CommunityAndResultsPanel: React.FC<CommunityPanelProps> = ({
  announcements,
  clubs,
  organizers,
  results,
  events,
  token,
  onSaved,
  onError,
}) => {
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMsg, setNoticeMsg] = useState('');
  const [noticePrio, setNoticePrio] = useState<AnnouncementRecord['priority']>('important');

  const [clubName, setClubName] = useState('');
  const [clubRole, setClubRole] = useState('');
  const [clubLead, setClubLead] = useState('');
  const [clubIcon, setClubIcon] = useState<CampusClub['icon']>('cpu');

  const [orgName, setOrgName] = useState('');
  const [orgRole, setOrgRole] = useState('');
  const [orgDept, setOrgDept] = useState('');
  const [orgPhone, setOrgPhone] = useState('');
  const [orgCategory, setOrgCategory] = useState<OrganizerMember['category']>('student');

  const [resEventId, setResEventId] = useState(events[0]?.id ?? '');
  const [resPos, setResPos] = useState('1st Place');
  const [resWinner, setResWinner] = useState('');
  const [resTeam, setResTeam] = useState('');
  const [resBranch, setResBranch] = useState('CSE');
  const [resPrize, setResPrize] = useState('Cash Prize + Trophy');

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdminAnnouncement(token, { title: noticeTitle, message: noticeMsg, priority: noticePrio });
      setNoticeTitle('');
      setNoticeMsg('');
      await onSaved();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to post announcement');
    }
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdminClub(token, {
        name: clubName,
        role: clubRole,
        leadName: clubLead,
        icon: clubIcon,
        colorClass: 'text-fuchsia-400',
      });
      setClubName('');
      setClubRole('');
      setClubLead('');
      await onSaved();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to add club');
    }
  };

  const handleCreateOrganizer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdminOrganizer(token, {
        name: orgName,
        role: orgRole,
        department: orgDept,
        phone: orgPhone,
        category: orgCategory,
        featuredFooter: false,
      });
      setOrgName('');
      setOrgRole('');
      setOrgDept('');
      setOrgPhone('');
      await onSaved();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to add organizer');
    }
  };

  const handleCreateResult = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdminResult(token, {
        eventId: resEventId,
        position: resPos,
        winnerName: resWinner,
        teamName: resTeam.trim() || undefined,
        branch: resBranch,
        prize: resPrize,
      });
      setResWinner('');
      setResTeam('');
      await onSaved();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to publish result');
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Row 1: Announcements + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0e071c] via-[#090514] to-[#05030b] border border-fuchsia-500/35 shadow-[0_4px_25px_rgba(217,70,239,0.08)] space-y-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-fuchsia-300 font-mono font-bold uppercase tracking-wider">
            <Bell className="w-4 h-4 text-fuchsia-400" />
            <span>Noticeboard Announcements ({announcements.length})</span>
          </div>
          <form onSubmit={handleCreateNotice} className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                required
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                placeholder="Notice title"
                className="sm:col-span-2 px-3 py-2 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
              />
              <select
                value={noticePrio}
                onChange={(e) => setNoticePrio(e.target.value as AnnouncementRecord['priority'])}
                className="px-3 py-2 rounded-xl bg-[#080512] border border-white/15 text-white font-mono focus:border-fuchsia-400 focus:outline-none"
              >
                <option value="info">info</option>
                <option value="important">important</option>
                <option value="urgent">urgent</option>
              </select>
            </div>
            <input
              type="text"
              required
              value={noticeMsg}
              onChange={(e) => setNoticeMsg(e.target.value)}
              placeholder="Announcement details shown on website..."
              className="w-full px-3 py-2 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-mono font-bold uppercase shadow-[0_0_15px_rgba(217,70,239,0.25)] transition-all"
            >
              Post Notice
            </button>
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {announcements.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-start justify-between gap-2 hover:border-white/20 transition-all"
              >
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-300 font-bold">
                    {item.priority} • {item.isActive ? 'ACTIVE' : 'PAUSED'}
                  </span>
                  <h4 className="font-bold text-white">{item.title}</h4>
                  <p className="text-slate-400">{item.message}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      void toggleAdminAnnouncement(token, item.id, !item.isActive)
                        .then(() => onSaved())
                        .catch((err) => onError(err instanceof Error ? err.message : 'Failed to toggle notice'))
                    }
                    className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-mono text-white transition-all"
                  >
                    {item.isActive ? 'Pause' : 'Enable'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void deleteAdminAnnouncement(token, item.id)
                        .then(() => onSaved())
                        .catch((err) => onError(err instanceof Error ? err.message : 'Failed to delete notice'))
                    }
                    aria-label={`Delete notice ${item.id}`}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#181105] via-[#0f0b03] to-[#050301] border border-amber-500/35 shadow-[0_4px_25px_rgba(245,158,11,0.08)] space-y-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-amber-300 font-mono font-bold uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Official Event Winners &amp; Results ({results.length})</span>
          </div>
          <form onSubmit={handleCreateResult} className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={resEventId}
                onChange={(e) => setResEventId(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-amber-400 focus:outline-none"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
              <input
                type="text"
                required
                value={resPos}
                onChange={(e) => setResPos(e.target.value)}
                placeholder="Position (e.g. 1st Place)"
                className="px-3 py-2 rounded-xl bg-[#080512] border border-white/15 text-amber-300 font-mono focus:border-amber-400 focus:outline-none"
              />
              <input
                type="text"
                required
                value={resWinner}
                onChange={(e) => setResWinner(e.target.value)}
                placeholder="Winner Full Name"
                className="px-3 py-2 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-amber-400 focus:outline-none"
              />
              <input
                type="text"
                value={resTeam}
                onChange={(e) => setResTeam(e.target.value)}
                placeholder="Team Name (Optional)"
                className="px-3 py-2 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-amber-400 focus:outline-none"
              />
              <input
                type="text"
                required
                value={resBranch}
                onChange={(e) => setResBranch(e.target.value)}
                placeholder="Branch"
                className="px-3 py-2 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-amber-400 focus:outline-none"
              />
              <input
                type="text"
                required
                value={resPrize}
                onChange={(e) => setResPrize(e.target.value)}
                placeholder="Award / Prize"
                className="px-3 py-2 rounded-xl bg-[#080512] border border-white/15 text-emerald-300 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!resEventId}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 font-mono font-bold uppercase shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all"
            >
              Publish Winner
            </button>
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {results.length === 0 ? (
              <p className="text-slate-500 font-mono">No winners published yet.</p>
            ) : (
              results.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-start justify-between gap-2 hover:border-white/20 transition-all"
                >
                  <div>
                    <span className="text-[10px] font-mono text-amber-300 font-bold uppercase">
                      {r.position} • {r.eventTitle}
                    </span>
                    <h4 className="font-bold text-white">
                      {r.winnerName}
                      {r.teamName ? ` (${r.teamName})` : ''}
                    </h4>
                    <p className="text-slate-400 font-mono">
                      {r.branch} • {r.prize}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      void deleteAdminResult(token, r.id)
                        .then(() => onSaved())
                        .catch((err) => onError(err instanceof Error ? err.message : 'Failed to delete result'))
                    }
                    aria-label={`Delete result ${r.id}`}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Campus Clubs + Core Organizers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0e071c] via-[#090514] to-[#05030b] border border-purple-500/30 shadow-[0_4px_25px_rgba(168,85,247,0.08)] space-y-4 backdrop-blur-md">
          <h3 className="text-fuchsia-300 font-mono font-bold uppercase tracking-wider">
            Campus Clubs ({clubs.length})
          </h3>
          <form onSubmit={handleCreateClub} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              required
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              placeholder="Club Name"
              className="px-3 py-2 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-purple-400 focus:outline-none"
            />
            <input
              type="text"
              required
              value={clubRole}
              onChange={(e) => setClubRole(e.target.value)}
              placeholder="Focus / Role"
              className="px-3 py-2 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-purple-400 focus:outline-none"
            />
            <input
              type="text"
              required
              value={clubLead}
              onChange={(e) => setClubLead(e.target.value)}
              placeholder="Club Lead Name"
              className="px-3 py-2 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-purple-400 focus:outline-none"
            />
            <select
              value={clubIcon}
              onChange={(e) => setClubIcon(e.target.value as CampusClub['icon'])}
              className="px-3 py-2 rounded-xl bg-[#080512] border border-white/15 text-white font-mono focus:border-purple-400 focus:outline-none"
            >
              <option value="code">code</option>
              <option value="bot">bot</option>
              <option value="plane">plane</option>
              <option value="sparkles">sparkles</option>
              <option value="gamepad">gamepad</option>
              <option value="cpu">cpu</option>
            </select>
            <button
              type="submit"
              className="sm:col-span-2 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/35 text-purple-200 font-mono font-bold uppercase transition-all"
            >
              Add Club Chapter
            </button>
          </form>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {clubs.map((c) => (
              <div key={c.id} className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between hover:border-white/20 transition-all">
                <div>
                  <strong className="text-white block">{c.name}</strong>
                  <span className="text-slate-400 font-mono">{c.role} • Lead: {c.leadName}</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    void deleteAdminClub(token, c.id)
                      .then(() => onSaved())
                      .catch((err) => onError(err instanceof Error ? err.message : 'Failed to delete club'))
                  }
                  aria-label={`Delete club ${c.name}`}
                  className="p-1 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0e071c] via-[#090514] to-[#05030b] border border-white/10 hover:border-fuchsia-500/30 shadow-lg space-y-4 backdrop-blur-md transition-all">
          <h3 className="text-fuchsia-300 font-mono font-bold uppercase tracking-wider">
            Organizing Team &amp; Contacts ({organizers.length})
          </h3>
          <form onSubmit={handleCreateOrganizer} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Name"
              className="px-3 py-2 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
            />
            <input
              type="text"
              required
              value={orgRole}
              onChange={(e) => setOrgRole(e.target.value)}
              placeholder="Role / Designation"
              className="px-3 py-2 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
            />
            <input
              type="text"
              required
              value={orgDept}
              onChange={(e) => setOrgDept(e.target.value)}
              placeholder="Department / Year"
              className="px-3 py-2 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
            />
            <input
              type="text"
              required
              value={orgPhone}
              onChange={(e) => setOrgPhone(e.target.value)}
              placeholder="Phone"
              className="px-3 py-2 rounded-xl bg-[#080512] border border-white/15 text-white font-mono focus:border-fuchsia-400 focus:outline-none"
            />
            <select
              value={orgCategory}
              onChange={(e) => setOrgCategory(e.target.value as OrganizerMember['category'])}
              className="px-3 py-2 rounded-xl bg-[#080512] border border-white/15 text-white font-mono focus:border-fuchsia-400 focus:outline-none"
            >
              <option value="student">student</option>
              <option value="faculty">faculty</option>
              <option value="team">team</option>
            </select>
            <button
              type="submit"
              className="py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-mono font-bold uppercase transition-all"
            >
              Add Organizer
            </button>
          </form>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {organizers.map((m) => (
              <div key={m.id} className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between hover:border-white/20 transition-all">
                <div>
                  <strong className="text-white block">{m.name} ({m.category})</strong>
                  <span className="text-slate-400 font-mono">{m.role} • {m.phone}</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    void deleteAdminOrganizer(token, m.id)
                      .then(() => onSaved())
                      .catch((err) => onError(err instanceof Error ? err.message : 'Failed to delete organizer'))
                  }
                  aria-label={`Delete organizer ${m.name}`}
                  className="p-1 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AuditTrailPanel: React.FC<{ logs: AuditLogRecord[] }> = ({ logs }) => (
  <div className="rounded-2xl bg-gradient-to-b from-[#0e071c]/95 via-[#080512]/95 to-[#05030b]/95 border border-white/10 shadow-xl overflow-hidden backdrop-blur-md">
    <div className="px-4 py-3.5 border-b border-white/10 bg-white/[0.03] flex items-center justify-between text-xs font-mono">
      <div className="flex items-center gap-2 text-fuchsia-300 font-bold uppercase tracking-wider">
        <History className="w-4 h-4 text-fuchsia-400" />
        <span>Organizer Audit Log (SQLite Append-Only)</span>
      </div>
      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-400">
        Latest {logs.length} actions
      </span>
    </div>
    {logs.length === 0 ? (
      <div className="p-12 text-center text-xs font-mono text-slate-400">
        <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        No organizer audit entries recorded yet.
      </div>
    ) : (
      <div className="divide-y divide-white/5">
        {logs.map((entry) => (
          <div
            key={entry.id}
            className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono hover:bg-white/[0.02] transition-colors"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-fuchsia-500/15 border border-fuchsia-400/35 text-fuchsia-300 font-bold text-[10px]">
                  {entry.action}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {entry.targetType}:{entry.targetId}
                </span>
              </div>
              <p className="text-slate-200 font-sans text-xs">{entry.details}</p>
            </div>
            <span className="text-[11px] text-slate-500">{entry.createdAt}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

export const AdminDashboardPage: React.FC = () => {
  const [pinInput, setPinInput] = useState('');
  const [authToken, setAuthToken] = useState<string>(() => sessionStorage.getItem(TOKEN_STORAGE_KEY) || '');
  const isOfflineMode = Boolean(authToken.startsWith('offline-'));
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(() => {
    const existing = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    return existing?.startsWith('offline-') ? buildOfflineDashboardData() : null;
  });
  const [loadingData, setLoadingData] = useState(() => {
    const existing = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    return Boolean(existing && !existing.startsWith('offline-'));
  });
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ConsoleTab>('registrations');
  const [regSearch, setRegSearch] = useState('');
  const [passFilter, setPassFilter] = useState('All');
  const [teamSearch, setTeamSearch] = useState('');
  const [teamEventFilter, setTeamEventFilter] = useState('All');

  // New event form state
  const [evTitle, setEvTitle] = useState('');
  const [evTagline, setEvTagline] = useState('');
  const [evCategory, setEvCategory] = useState<FestEvent['category']>('Coding');
  const [evDate, setEvDate] = useState('Day 1 (Sep 28)');
  const [evTime, setEvTime] = useState('11:00 AM');
  const [evVenue, setEvVenue] = useState('Seminar Hall A');
  const [evTeamSize, setEvTeamSize] = useState('1 - 3 Members');
  const [evPrizes, setEvPrizes] = useState('₹5,000 + Trophy');
  const [evDescription, setEvDescription] = useState('');
  const [creatingEvent, setCreatingEvent] = useState(false);

  // Schedule & FAQ quick forms
  const [schedDay, setSchedDay] = useState<'Day 1' | 'Day 2'>('Day 1');
  const [schedTime, setSchedTime] = useState('04:30 PM');
  const [schedTitle, setSchedTitle] = useState('');
  const [schedCategory, setSchedCategory] = useState('Workshop');
  const [schedVenue, setSchedVenue] = useState('Auditorium');
  const [schedDesc, setSchedDesc] = useState('');
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');

  const loadDashboard = useCallback(async (token: string) => {
    setLoadingData(true);
    setActionError(null);
    if (token.startsWith('offline-')) {
      setDashboard(buildOfflineDashboardData());
      setLoadingData(false);
      return;
    }
    try {
      const data = await fetchAdminDashboard(token);
      setDashboard(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        setAuthToken('');
        setDashboard(null);
        setAuthError('Organizer session expired or token invalid.');
      } else {
        // Fallback to offline / GitHub Pages mode
        const offlineToken = 'offline-token-gecs2026';
        sessionStorage.setItem(TOKEN_STORAGE_KEY, offlineToken);
        setAuthToken(offlineToken);
        setDashboard(buildOfflineDashboardData());
      }
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (!authToken || authToken.startsWith('offline-')) return;
    let cancelled = false;
    fetchAdminDashboard(authToken)
      .then((data) => {
        if (!cancelled) {
          setActionError(null);
          setDashboard(data);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);
          setAuthToken('');
          setDashboard(null);
          setAuthError('Organizer session expired or token invalid.');
        } else {
          // Fallback to offline storage if backend is unreachable
          const offlineToken = 'offline-token-gecs2026';
          sessionStorage.setItem(TOKEN_STORAGE_KEY, offlineToken);
          setAuthToken(offlineToken);
          setDashboard(buildOfflineDashboardData());
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingData(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authToken]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinInput.trim();
    if (!cleanPin) return;
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { token } = await verifyAdminPin(cleanPin);
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
      setLoadingData(true);
      setAuthToken(token);
      setPinInput('');
    } catch (err) {
      // Fallback for GitHub Pages static hosting where API is unavailable
      if (cleanPin.toUpperCase() === 'GECS2026') {
        const offlineToken = 'offline-token-gecs2026';
        sessionStorage.setItem(TOKEN_STORAGE_KEY, offlineToken);
        setAuthToken(offlineToken);
        setDashboard(buildOfflineDashboardData());
        setPinInput('');
      } else {
        setAuthError(err instanceof ApiError ? err.message : 'Invalid Organizer Access PIN');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setAuthToken('');
    setDashboard(null);
  };

  const handleToggleCheckIn = async (regId: string, current: boolean) => {
    if (isOfflineMode) {
      toggleOfflineRegistrationCheckIn(regId, !current);
      setDashboard(buildOfflineDashboardData());
      return;
    }
    try {
      await toggleRegistrationCheckIn(authToken, regId, !current);
      await loadDashboard(authToken);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update check-in status');
    }
  };

  const handleDeleteReg = async (regId: string) => {
    if (!window.confirm(`Delete delegate pass ${regId} permanently?`)) return;
    if (isOfflineMode) {
      deleteOfflineRegistration(regId);
      setDashboard(buildOfflineDashboardData());
      return;
    }
    try {
      await deleteAdminRegistration(authToken, regId);
      await loadDashboard(authToken);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete registration');
    }
  };

  const handleToggleTeamCheckIn = async (teamId: string, current: boolean) => {
    if (isOfflineMode) {
      toggleOfflineTeamCheckIn(teamId, !current);
      setDashboard(buildOfflineDashboardData());
      return;
    }
    try {
      await toggleTeamRegistrationCheckIn(authToken, teamId, !current);
      await loadDashboard(authToken);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update team check-in status');
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!window.confirm(`Delete team '${teamName}' (${teamId}) permanently?`)) return;
    if (isOfflineMode) {
      deleteOfflineTeam(teamId);
      setDashboard(buildOfflineDashboardData());
      return;
    }
    try {
      await deleteAdminTeamRegistration(authToken, teamId);
      await loadDashboard(authToken);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete team registration');
    }
  };

  const handleExportTeamsCsv = async () => {
    if (isOfflineMode) {
      downloadOfflineTeamsCsv(dashboard?.teams);
      return;
    }
    try {
      await downloadTeamsCsv(authToken);
    } catch {
      downloadOfflineTeamsCsv(dashboard?.teams);
    }
  };

  const handleToggleInquiry = async (id: number, currentStatus: 'open' | 'resolved') => {
    try {
      await updateAdminInquiryStatus(authToken, id, currentStatus === 'open' ? 'resolved' : 'open');
      await loadDashboard(authToken);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update inquiry');
    }
  };

  const handleDeleteInquiry = async (id: number) => {
    if (!window.confirm(`Remove inquiry #${id} permanently?`)) return;
    try {
      await deleteAdminInquiry(authToken, id);
      await loadDashboard(authToken);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete inquiry');
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingEvent(true);
    setActionError(null);
    try {
      await createAdminEvent(authToken, {
        title: evTitle,
        tagline: evTagline,
        category: evCategory,
        date: evDate,
        time: evTime,
        venue: evVenue,
        teamSize: evTeamSize,
        prizes: evPrizes,
        description: evDescription,
      });
      setEvTitle('');
      setEvTagline('');
      setEvDescription('');
      await loadDashboard(authToken);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setCreatingEvent(false);
    }
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!window.confirm(`Remove event "${title}" from the catalog?`)) return;
    try {
      await deleteAdminEvent(authToken, id);
      await loadDashboard(authToken);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete event');
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      await createAdminScheduleItem(authToken, {
        day: schedDay,
        time: schedTime,
        title: schedTitle,
        category: schedCategory,
        venue: schedVenue,
        description: schedDesc,
      });
      setSchedTitle('');
      setSchedDesc('');
      await loadDashboard(authToken);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to add schedule slot');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await deleteAdminScheduleItem(authToken, id);
      await loadDashboard(authToken);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete schedule slot');
    }
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      await createAdminFaq(authToken, { q: faqQuestion, a: faqAnswer });
      setFaqQuestion('');
      setFaqAnswer('');
      await loadDashboard(authToken);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to create FAQ');
    }
  };

  const handleDeleteFaq = async (id: number) => {
    try {
      await deleteAdminFaq(authToken, id);
      await loadDashboard(authToken);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete FAQ');
    }
  };

  const filteredRegistrations = useMemo(() => {
    if (!dashboard) return [];
    const q = regSearch.toLowerCase().trim();
    return dashboard.registrations.filter((r) => {
      const matchesPass = passFilter === 'All' || r.passName === passFilter;
      const matchesQuery =
        !q ||
        r.regId.toLowerCase().includes(q) ||
        r.fullName.toLowerCase().includes(q) ||
        r.rollNo.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.branch.toLowerCase().includes(q);
      return matchesPass && matchesQuery;
    });
  }, [dashboard, regSearch, passFilter]);

  const filteredTeams = useMemo(() => {
    if (!dashboard || !dashboard.teams) return [];
    const q = teamSearch.toLowerCase().trim();
    return dashboard.teams.filter((t) => {
      const matchEvent = teamEventFilter === 'All' || t.eventId === teamEventFilter || t.eventTitle === teamEventFilter;
      const matchQuery =
        !q ||
        t.teamId.toLowerCase().includes(q) ||
        t.teamName.toLowerCase().includes(q) ||
        t.leaderName.toLowerCase().includes(q) ||
        t.leaderRoll.toLowerCase().includes(q) ||
        t.leaderEmail.toLowerCase().includes(q) ||
        t.eventTitle.toLowerCase().includes(q) ||
        (t.projectTitle && t.projectTitle.toLowerCase().includes(q)) ||
        t.members.some(
          (m) => m.name.toLowerCase().includes(q) || m.rollNo.toLowerCase().includes(q)
        );
      return matchEvent && matchQuery;
    });
  }, [dashboard, teamSearch, teamEventFilter]);

  const handleExportCsv = async () => {
    if (isOfflineMode) {
      downloadOfflineRegistrationsCsv(dashboard?.registrations);
      return;
    }
    try {
      await downloadRegistrationsCsv(authToken);
    } catch {
      downloadOfflineRegistrationsCsv(dashboard?.registrations);
    }
  };

  if (!authToken) {
    return (
      <div className="min-h-screen bg-[#020003] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient Radiant Cyber Lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[400px] bg-fuchsia-600/15 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-600/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

        {/* Double-Border Glowing Cyber Glassmorphic Card */}
        <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-fuchsia-500/50 via-purple-500/25 to-emerald-500/40 shadow-[0_0_60px_rgba(217,70,239,0.2)] max-w-md w-full z-10">
          <div className="rounded-[calc(1.5rem-1px)] bg-[#07060e]/95 backdrop-blur-2xl p-7 sm:p-9 space-y-6">
            
            {/* Top Navigation & Status */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-fuchsia-400" />
                <span>Back to Fest Home</span>
              </Link>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-[10px] font-mono text-emerald-300 font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Console Active</span>
              </div>
            </div>

            {/* Official Techy Brand & Lock Visual */}
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <TechyLogo size={56} glow={true} />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
                  Organizer{' '}
                  <span className="bg-gradient-to-r from-fuchsia-400 via-pink-300 to-purple-400 bg-clip-text text-transparent">
                    Desk Console
                  </span>
                </h1>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  GEC Sheikhpura intra-college fest administration. Access pass management, squad rosters, gate check-ins &amp; CSV export.
                </p>
              </div>
            </div>

            {authError && (
              <div role="alert" className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-mono text-center flex items-center justify-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="admin-pin" className="block text-xs font-mono text-slate-300 font-semibold">
                    Organizer Access PIN
                  </label>
                  <button
                    type="button"
                    onClick={() => setPinInput('GECS2026')}
                    className="text-[10px] font-mono text-fuchsia-300 hover:text-white underline cursor-pointer"
                    title="Click to autofill dev PIN"
                  >
                    Autofill PIN (GECS2026)
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="admin-pin"
                    type="password"
                    required
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Enter PIN: GECS2026"
                    className="w-full px-4 py-3 rounded-xl bg-[#030107] border border-white/20 text-white font-mono text-center tracking-widest text-base focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/30 focus:outline-none transition-all placeholder:tracking-normal placeholder:text-sm placeholder:text-slate-500"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 px-1">
                  <span>Authorized Dev PIN:</span>
                  <code className="text-fuchsia-300 font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded">GECS2026</code>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 text-white font-bold text-xs font-mono uppercase tracking-wider hover:opacity-95 shadow-glow-fuchsia flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Unlock Organizer Console</span>
              </button>
            </form>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>SQLite Engine</span>
              <span>•</span>
              <span>HMAC-SHA256</span>
              <span>•</span>
              <span>Instant Gate Check-In</span>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#020003] text-slate-100 px-4 sm:px-6 lg:px-8 py-8 selection:bg-fuchsia-500 selection:text-white">
      {/* Background Cyber Ambient Lights & Grid */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[550px] h-[550px] rounded-full bg-gradient-to-br from-fuchsia-600/15 via-purple-600/10 to-transparent blur-[120px]" />
        <div className="absolute top-[35%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-cyan-600/10 via-blue-600/5 to-transparent blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-violet-600/15 via-pink-600/10 to-transparent blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Bar */}
        <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0d071b]/90 via-[#070512]/90 to-[#0c0919]/90 border border-fuchsia-500/25 shadow-[0_0_30px_rgba(217,70,239,0.08)] backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-fuchsia-500/40 text-slate-300 hover:text-white transition-all duration-200 group flex items-center justify-center shadow-inner"
              aria-label="Back to fest home"
              title="Return to Fest Home"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </Link>

            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-purple-500/10 border border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.25)]">
                <TechyLogo size={36} glow={true} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                    {FEST_INFO.shortName}{' '}
                    <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                      Desk Console
                    </span>
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE OPS
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                  <span>SQLite &amp; In-Memory Data Hub</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-fuchsia-400/80">HMAC Authenticated</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => void loadDashboard(authToken)}
              disabled={loadingData}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-fuchsia-400/40 text-xs font-mono font-semibold text-slate-200 hover:text-white inline-flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-fuchsia-400 ${loadingData ? 'animate-spin' : ''}`} />
              <span>{loadingData ? 'Syncing...' : 'Sync Data'}</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 hover:border-rose-400 text-xs font-mono font-bold text-rose-200 inline-flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(244,63,94,0.15)] active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Lock Console</span>
            </button>
          </div>
        </div>

        {actionError && (
          <div role="alert" className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-mono flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{actionError}</span>
          </div>
        )}

        {isOfflineMode && (
          <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-amber-200 text-xs font-mono flex flex-wrap items-center justify-between gap-3 shadow-[0_0_20px_rgba(245,158,11,0.08)]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span>
                <strong>GitHub Pages Client Storage Active:</strong> Registrations, team rosters, and gate check-ins are saved directly in your browser.
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-amber-500/25 border border-amber-400/40 text-[10px] text-amber-300 font-bold uppercase tracking-wider">
              Static Mode
            </span>
          </div>
        )}

        {dashboard && (
          <>
            {/* KPI Summary Cards with Cyber Neon Accents */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5 sm:gap-4">
              {/* Passes */}
              <div className="group relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#12081c] via-[#090510] to-[#040207] border border-fuchsia-500/30 hover:border-fuchsia-400/60 shadow-[0_4px_20px_rgba(217,70,239,0.08)] transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider">
                  <span>Passes</span>
                  <div className="p-1.5 rounded-lg bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300">
                    <Ticket className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-2 group-hover:text-fuchsia-300 transition-colors">
                  {dashboard.summary.totalRegistrations}
                </div>
                <div className="text-[10px] font-mono text-fuchsia-400/80 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" />
                  Booked Passes
                </div>
              </div>

              {/* Teams */}
              <div className="group relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#130722] via-[#090512] to-[#040207] border border-purple-500/35 hover:border-purple-400/60 shadow-[0_4px_20px_rgba(168,85,247,0.08)] transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider">
                  <span>Teams</span>
                  <div className="p-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-purple-300 mt-2 group-hover:text-purple-200 transition-colors">
                  {dashboard.summary.totalTeams ?? dashboard.teams?.length ?? 0}
                </div>
                <div className="text-[10px] font-mono text-purple-400/80 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Registered Squads
                </div>
              </div>

              {/* Gate Checked-In */}
              <div className="group relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#061710] via-[#040d09] to-[#020504] border border-emerald-500/30 hover:border-emerald-400/60 shadow-[0_4px_20px_rgba(16,185,129,0.08)] transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider">
                  <span>Gate Verified</span>
                  <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mt-2">
                  {dashboard.summary.checkedInCount}
                </div>
                <div className="text-[10px] font-mono text-emerald-400/80 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Inside Venue
                </div>
              </div>

              {/* Fee Revenue */}
              <div className="group relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#181105] via-[#0f0b03] to-[#050301] border border-amber-500/30 hover:border-amber-400/60 shadow-[0_4px_20px_rgba(245,158,11,0.08)] transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider">
                  <span>Gross Value</span>
                  <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300">
                    <IndianRupee className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300 mt-2">
                  ₹{dashboard.summary.totalRevenue}
                </div>
                <div className="text-[10px] font-mono text-amber-400/80 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Pass Valuation
                </div>
              </div>

              {/* Open Queries */}
              <div className="group relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#05141e] via-[#030d14] to-[#010408] border border-sky-500/30 hover:border-sky-400/60 shadow-[0_4px_20px_rgba(14,165,233,0.08)] transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider">
                  <span>Helpdesk</span>
                  <div className="p-1.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-sky-300 mt-2">
                  {dashboard.summary.openInquiries}
                </div>
                <div className="text-[10px] font-mono text-sky-400/80 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  Open Tickets
                </div>
              </div>

              {/* Active Arenas */}
              <div className="group relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#170617] via-[#0e040f] to-[#040105] border border-pink-500/30 hover:border-pink-400/60 shadow-[0_4px_20px_rgba(236,72,153,0.08)] transition-all duration-300 hover:-translate-y-0.5 col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider">
                  <span>Arenas</span>
                  <div className="p-1.5 rounded-lg bg-pink-500/15 border border-pink-500/30 text-pink-300">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-pink-300 mt-2">
                  {dashboard.summary.totalEvents}
                </div>
                <div className="text-[10px] font-mono text-pink-400/80 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                  Active Tracks
                </div>
              </div>
            </div>

            {/* Pass Tier Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
              {dashboard.passBreakdown.map((tier) => (
                <div
                  key={tier.passId}
                  className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-[#0d071a]/90 to-[#070512]/90 border border-white/10 hover:border-fuchsia-500/40 transition-all duration-200 flex items-center justify-between font-mono text-xs shadow-sm hover:shadow-[0_0_20px_rgba(217,70,239,0.1)]"
                >
                  <div className="space-y-0.5">
                    <span className="text-white font-bold block text-sm">{tier.passName}</span>
                    <span className="text-slate-400 text-[11px]">₹{tier.price} per pass tier</span>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300 font-black text-sm">
                      {tier.bookings} sold
                    </span>
                    <span className="text-emerald-400 font-bold block text-xs mt-1">₹{tier.revenue} total</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Tabs with Cyber Pill Segmented Bar */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 border-b border-white/10 font-mono text-xs no-scrollbar">
              {(
                [
                  { id: 'registrations', label: 'Passes', count: dashboard.registrations.length, icon: Ticket },
                  { id: 'teams', label: 'Teams', count: (dashboard.teams || []).length, icon: Users },
                  { id: 'inquiries', label: 'Helpdesk', count: dashboard.inquiries.length, icon: MessageSquare },
                  { id: 'events', label: 'Events', count: dashboard.events.length, icon: Trophy },
                  { id: 'schedule', label: 'Schedule', count: dashboard.schedule.length, icon: CalendarPlus },
                  { id: 'faqs', label: 'FAQs', count: dashboard.faqs.length, icon: HelpCircle },
                  { id: 'community', label: 'Notices', count: `${dashboard.announcements.length}/${dashboard.results.length}`, icon: Bell },
                  { id: 'settings', label: 'Settings & DB', count: dashboard.passes.length, icon: Settings },
                  { id: 'audit', label: 'Audit', count: dashboard.auditLogs.length, icon: History },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as ConsoleTab)}
                    className={`shrink-0 px-3.5 py-2 rounded-xl font-bold inline-flex items-center gap-2 transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-fuchsia-600 via-purple-600 to-fuchsia-600 text-white shadow-[0_0_20px_rgba(217,70,239,0.35)] border border-fuchsia-400/50 scale-[1.02]'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        isActive
                          ? 'bg-black/30 text-white'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Registrations */}
            {activeTab === 'registrations' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 flex-1">
                    <div className="relative flex-1 min-w-[220px] max-w-md">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={regSearch}
                        onChange={(e) => setRegSearch(e.target.value)}
                        placeholder="Search RegID, student, roll no, branch..."
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#090613] border border-white/15 text-xs text-white font-mono focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400/30 focus:outline-none placeholder:text-slate-500"
                      />
                    </div>
                    <select
                      value={passFilter}
                      onChange={(e) => setPassFilter(e.target.value)}
                      aria-label="Filter by pass tier"
                      className="px-3.5 py-2.5 rounded-xl bg-[#090613] border border-white/15 text-xs text-white font-mono focus:border-fuchsia-400 focus:outline-none"
                    >
                      <option value="All">All Pass Tiers</option>
                      {dashboard.passBreakdown.map((p) => (
                        <option key={p.passId} value={p.passName}>
                          {p.passName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleExportCsv()}
                    disabled={dashboard.registrations.length === 0}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/35 hover:border-emerald-400 text-emerald-300 text-xs font-mono font-bold inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.12)] disabled:opacity-50 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV ({dashboard.registrations.length})</span>
                  </button>
                </div>

                {filteredRegistrations.length === 0 ? (
                  <div className="p-12 rounded-2xl bg-gradient-to-b from-[#0a0714] to-[#040208] border border-white/10 text-center text-xs font-mono text-slate-400 shadow-xl">
                    <Ticket className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    No delegate registrations found yet. Bookings created on the homepage appear here in real time.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-white/10 bg-gradient-to-b from-[#0a0714]/95 to-[#05030a]/95 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-md">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-white/[0.04] text-slate-300 uppercase text-[10px] tracking-wider border-b border-white/10">
                        <tr>
                          <th className="p-3.5">Reg ID</th>
                          <th className="p-3.5">Student &amp; Roll</th>
                          <th className="p-3.5">Branch / Year</th>
                          <th className="p-3.5">Pass &amp; Track</th>
                          <th className="p-3.5">Contact</th>
                          <th className="p-3.5">Gate Check-In</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredRegistrations.map((reg) => (
                          <tr key={reg.regId} className="hover:bg-gradient-to-r hover:from-fuchsia-500/5 hover:via-purple-500/5 hover:to-transparent transition-colors">
                            <td className="p-3.5 whitespace-nowrap">
                              <span className="px-2 py-1 rounded-md bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 font-bold font-mono text-[11px]">
                                {reg.regId}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <strong className="text-white block font-sans">{reg.fullName}</strong>
                              <span className="text-slate-400 font-mono text-[11px]">{reg.rollNo}</span>
                            </td>
                            <td className="p-3.5 text-slate-300">
                              <span className="block max-w-[190px] truncate">{reg.branch}</span>
                              <span className="text-slate-500 text-[11px]">{reg.year}</span>
                            </td>
                            <td className="p-3.5">
                              <span className="text-white block font-semibold">{reg.passName} (₹{reg.price})</span>
                              {(reg.eventTitle || reg.teamName) && (
                                <span className="text-[11px] text-fuchsia-300">
                                  {[reg.eventTitle, reg.teamName].filter(Boolean).join(' • ')}
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-slate-300">
                              <span className="block">{reg.phone}</span>
                              <span className="text-slate-500 text-[11px]">{reg.email}</span>
                            </td>
                            <td className="p-3.5">
                              <button
                                type="button"
                                onClick={() => void handleToggleCheckIn(reg.regId, reg.checkedIn)}
                                className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all shadow-sm ${
                                  reg.checkedIn
                                    ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                                    : 'bg-amber-500/15 border border-amber-400/35 text-amber-300 hover:bg-emerald-500/20 hover:border-emerald-400/40 hover:text-emerald-300'
                                }`}
                              >
                                {reg.checkedIn ? 'Checked In ✓' : 'Check In'}
                              </button>
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => void handleDeleteReg(reg.regId)}
                                aria-label={`Delete ${reg.regId}`}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 hover:shadow-[0_0_10px_rgba(244,63,94,0.2)] transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Team Registrations */}
            {activeTab === 'teams' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 flex-1">
                    <div className="relative flex-1 min-w-[220px] max-w-md">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={teamSearch}
                        onChange={(e) => setTeamSearch(e.target.value)}
                        placeholder="Search Team, Leader, Roll, Event, Member..."
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#090613] border border-white/15 text-xs text-white font-mono focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400/30 focus:outline-none placeholder:text-slate-500"
                      />
                    </div>
                    <select
                      value={teamEventFilter}
                      onChange={(e) => setTeamEventFilter(e.target.value)}
                      aria-label="Filter teams by event"
                      className="px-3.5 py-2.5 rounded-xl bg-[#090613] border border-white/15 text-xs text-white font-mono focus:border-fuchsia-400 focus:outline-none"
                    >
                      <option value="All">All Events ({dashboard.teams?.length ?? 0})</option>
                      {FEST_EVENTS.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleExportTeamsCsv()}
                    disabled={!dashboard.teams || dashboard.teams.length === 0}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/35 hover:border-emerald-400 text-emerald-300 text-xs font-mono font-bold inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.12)] disabled:opacity-50 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Teams CSV ({dashboard.teams?.length ?? 0})</span>
                  </button>
                </div>

                {filteredTeams.length === 0 ? (
                  <div className="p-12 rounded-2xl bg-gradient-to-b from-[#0a0714] to-[#040208] border border-white/10 text-center text-xs font-mono text-slate-400 shadow-xl">
                    <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    No team registrations found matching your filter. Teams registered via Desk Open appear here in real time.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-white/10 bg-gradient-to-b from-[#0a0714]/95 to-[#05030a]/95 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-md">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-white/[0.04] text-slate-300 uppercase text-[10px] tracking-wider border-b border-white/10">
                        <tr>
                          <th className="p-3.5">Team ID &amp; Name</th>
                          <th className="p-3.5">Event Track</th>
                          <th className="p-3.5">Leader Details</th>
                          <th className="p-3.5">Squad Roster</th>
                          <th className="p-3.5">Project / Notes</th>
                          <th className="p-3.5">Desk Check-In</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredTeams.map((team) => (
                          <tr key={team.teamId} className="hover:bg-gradient-to-r hover:from-purple-500/5 hover:via-fuchsia-500/5 hover:to-transparent transition-colors">
                            <td className="p-3.5 whitespace-nowrap">
                              <span className="block text-white font-bold font-sans text-sm">{team.teamName}</span>
                              <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-fuchsia-500/15 border border-fuchsia-500/30 text-[10px] text-fuchsia-300 font-mono">
                                {team.teamId}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/35 text-purple-300 text-[10px] uppercase font-bold inline-block mb-1">
                                {team.eventTitle}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <strong className="text-white block font-sans">{team.leaderName}</strong>
                              <span className="text-slate-400 text-[11px] block">{team.leaderRoll} • {team.branch}</span>
                              <span className="text-slate-500 text-[10px] block font-mono">{team.leaderPhone} • {team.leaderEmail}</span>
                            </td>
                            <td className="p-3.5 text-slate-300 max-w-xs">
                              <div className="flex flex-wrap gap-1">
                                <span className="px-2 py-0.5 rounded-md bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-200 text-[10px] font-bold">
                                  1: {team.leaderName} (L)
                                </span>
                                {team.members.map((m, idx) => (
                                  <span
                                    key={`${m.rollNo}-${idx}`}
                                    className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 text-[10px]"
                                    title={`${m.name} (${m.rollNo})`}
                                  >
                                    {idx + 2}: {m.name} ({m.rollNo})
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="p-3.5 text-slate-300 max-w-xs">
                              {team.projectTitle && (
                                <span className="text-white block font-semibold truncate" title={team.projectTitle}>
                                  {team.projectTitle}
                                </span>
                              )}
                              {team.notes && (
                                <span className="text-slate-400 text-[11px] block truncate" title={team.notes}>
                                  {team.notes}
                                </span>
                              )}
                              {!team.projectTitle && !team.notes && (
                                <span className="text-slate-600 italic">None</span>
                              )}
                            </td>
                            <td className="p-3.5">
                              <button
                                type="button"
                                onClick={() => void handleToggleTeamCheckIn(team.teamId, team.checkedIn)}
                                className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all shadow-sm ${
                                  team.checkedIn
                                    ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                                    : 'bg-amber-500/15 border border-amber-400/35 text-amber-300 hover:bg-emerald-500/20 hover:border-emerald-400/40 hover:text-emerald-300'
                                }`}
                              >
                                {team.checkedIn ? 'Checked In ✓' : 'Check In'}
                              </button>
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => void handleDeleteTeam(team.teamId, team.teamName)}
                                aria-label={`Delete ${team.teamName}`}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 hover:shadow-[0_0_10px_rgba(244,63,94,0.2)] transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Student Inquiries */}
            {activeTab === 'inquiries' && (
              <div className="space-y-3">
                {dashboard.inquiries.length === 0 ? (
                  <div className="p-12 rounded-2xl bg-gradient-to-b from-[#0a0714] to-[#040208] border border-white/10 text-center text-xs font-mono text-slate-400 shadow-xl">
                    <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    No support tickets submitted yet. Helpdesk queries from the contact section appear here in real time.
                  </div>
                ) : (
                  dashboard.inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="p-5 rounded-2xl bg-gradient-to-r from-[#0d071a]/90 via-[#090614]/90 to-[#070512]/90 border border-white/10 hover:border-sky-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 shadow-sm hover:shadow-[0_0_20px_rgba(14,165,233,0.1)]"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                          <span className="px-2 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-sky-300 font-bold">#{inq.id}</span>
                          <strong className="text-white text-sm font-sans">{inq.subject}</strong>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${
                              inq.status === 'resolved'
                                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                                : 'bg-amber-500/20 border-amber-500/30 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                            }`}
                          >
                            {inq.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-sans leading-relaxed">{inq.message}</p>
                        {inq.adminNote && (
                          <p className="text-[11px] font-mono text-emerald-300 bg-emerald-950/30 border border-emerald-500/30 rounded-lg px-2.5 py-1">
                            Resolution Note: {inq.adminNote}
                          </p>
                        )}
                        <p className="text-[11px] font-mono text-slate-500">
                          From <span className="text-slate-300">{inq.name}</span> ({inq.email}){inq.rollNo ? ` • Roll: ${inq.rollNo}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => void handleToggleInquiry(inq.id, inq.status)}
                          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-mono font-bold text-white transition-all active:scale-95"
                        >
                          {inq.status === 'open' ? 'Mark Resolved' : 'Reopen'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteInquiry(inq.id)}
                          aria-label={`Delete inquiry ${inq.id}`}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: Events Catalog + Add Event */}
            {activeTab === 'events' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <form
                  onSubmit={handleAddEvent}
                  className="lg:col-span-5 p-5 rounded-2xl bg-gradient-to-b from-[#0e071c] via-[#090514] to-[#05030b] border border-fuchsia-500/35 shadow-[0_4px_25px_rgba(217,70,239,0.08)] space-y-3.5 text-xs backdrop-blur-md"
                >
                  <div className="flex items-center gap-2 text-fuchsia-300 font-mono font-bold uppercase tracking-wider">
                    <CalendarPlus className="w-4 h-4 text-fuchsia-400" />
                    <span>Add Event to Catalog</span>
                  </div>

                  <input
                    type="text"
                    required
                    value={evTitle}
                    onChange={(e) => setEvTitle(e.target.value)}
                    placeholder="Event Title (e.g. AI Agents Sprint)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400/30 focus:outline-none placeholder:text-slate-500"
                  />
                  <input
                    type="text"
                    required
                    value={evTagline}
                    onChange={(e) => setEvTagline(e.target.value)}
                    placeholder="Short Tagline"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400/30 focus:outline-none placeholder:text-slate-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={evCategory}
                      onChange={(e) => setEvCategory(e.target.value as FestEvent['category'])}
                      className="px-3 py-2 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      required
                      value={evDate}
                      onChange={(e) => setEvDate(e.target.value)}
                      placeholder="Day 1 (Sep 28)"
                      className="px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={evTime}
                      onChange={(e) => setEvTime(e.target.value)}
                      placeholder="Time"
                      className="px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      value={evVenue}
                      onChange={(e) => setEvVenue(e.target.value)}
                      placeholder="Venue"
                      className="px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={evTeamSize}
                      onChange={(e) => setEvTeamSize(e.target.value)}
                      placeholder="Team Size"
                      className="px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={evPrizes}
                      onChange={(e) => setEvPrizes(e.target.value)}
                      placeholder="Prize Pool"
                      className="px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
                    />
                  </div>
                  <textarea
                    rows={3}
                    required
                    minLength={10}
                    value={evDescription}
                    onChange={(e) => setEvDescription(e.target.value)}
                    placeholder="Event description and judging focus..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-white resize-none focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400/30 focus:outline-none placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    disabled={creatingEvent}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-mono font-bold uppercase tracking-wider hover:opacity-95 shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all"
                  >
                    {creatingEvent ? 'Saving Event...' : 'Publish Event'}
                  </button>
                </form>

                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dashboard.events.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-4 rounded-2xl bg-gradient-to-r from-[#0d071a]/90 to-[#070512]/90 border border-white/10 hover:border-fuchsia-500/40 flex items-start justify-between gap-3 transition-all duration-200 shadow-sm hover:shadow-[0_0_20px_rgba(217,70,239,0.1)]"
                    >
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] font-mono uppercase text-fuchsia-400 font-bold">
                          {ev.category} • {ev.date}
                        </span>
                        <h3 className="text-sm font-bold text-white truncate">{ev.title}</h3>
                        <p className="text-[11px] text-slate-400 truncate">{ev.venue} • {ev.time}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleDeleteEvent(ev.id, ev.title)}
                        aria-label={`Delete event ${ev.title}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 shrink-0 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Schedule Management */}
            {activeTab === 'schedule' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <form
                  onSubmit={handleAddSchedule}
                  className="lg:col-span-5 p-5 rounded-2xl bg-gradient-to-b from-[#0e071c] via-[#090514] to-[#05030b] border border-fuchsia-500/35 shadow-[0_4px_25px_rgba(217,70,239,0.08)] space-y-3.5 text-xs backdrop-blur-md"
                >
                  <div className="flex items-center gap-2 text-fuchsia-300 font-mono font-bold uppercase tracking-wider">
                    <CalendarPlus className="w-4 h-4 text-fuchsia-400" />
                    <span>Add Schedule Slot</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={schedDay}
                      onChange={(e) => setSchedDay(e.target.value as 'Day 1' | 'Day 2')}
                      className="px-3 py-2 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
                    >
                      <option value="Day 1">Day 1</option>
                      <option value="Day 2">Day 2</option>
                    </select>
                    <input
                      type="text"
                      required
                      value={schedTime}
                      onChange={(e) => setSchedTime(e.target.value)}
                      placeholder="04:30 PM"
                      className="px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    value={schedTitle}
                    onChange={(e) => setSchedTitle(e.target.value)}
                    placeholder="Session Title"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={schedCategory}
                      onChange={(e) => setSchedCategory(e.target.value)}
                      placeholder="Category"
                      className="px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      value={schedVenue}
                      onChange={(e) => setSchedVenue(e.target.value)}
                      placeholder="Venue"
                      className="px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
                    />
                  </div>
                  <textarea
                    rows={2}
                    required
                    minLength={5}
                    value={schedDesc}
                    onChange={(e) => setSchedDesc(e.target.value)}
                    placeholder="Short schedule description..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-white resize-none focus:border-fuchsia-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-mono font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all"
                  >
                    Add Schedule Slot
                  </button>
                </form>

                <div className="lg:col-span-7 space-y-2.5">
                  {dashboard.schedule.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-4 rounded-2xl bg-gradient-to-r from-[#0d071a]/90 to-[#070512]/90 border border-white/10 hover:border-fuchsia-500/40 flex items-start justify-between gap-3 transition-all duration-200 shadow-sm hover:shadow-[0_0_20px_rgba(217,70,239,0.1)]"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase text-fuchsia-400 font-bold">
                          {slot.day} • {slot.time} • {slot.venue}
                        </span>
                        <h3 className="text-sm font-bold text-white">{slot.title}</h3>
                        <p className="text-xs text-slate-400">{slot.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleDeleteSchedule(slot.id)}
                        aria-label={`Delete schedule ${slot.title}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 shrink-0 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 5: FAQs Management */}
            {activeTab === 'faqs' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <form
                  onSubmit={handleAddFaq}
                  className="lg:col-span-5 p-5 rounded-2xl bg-gradient-to-b from-[#0e071c] via-[#090514] to-[#05030b] border border-fuchsia-500/35 shadow-[0_4px_25px_rgba(217,70,239,0.08)] space-y-3.5 text-xs backdrop-blur-md"
                >
                  <div className="flex items-center gap-2 text-fuchsia-300 font-mono font-bold uppercase tracking-wider">
                    <MessageSquare className="w-4 h-4 text-fuchsia-400" />
                    <span>Add FAQ Entry</span>
                  </div>
                  <input
                    type="text"
                    required
                    minLength={5}
                    value={faqQuestion}
                    onChange={(e) => setFaqQuestion(e.target.value)}
                    placeholder="Question..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
                  />
                  <textarea
                    rows={3}
                    required
                    minLength={5}
                    value={faqAnswer}
                    onChange={(e) => setFaqAnswer(e.target.value)}
                    placeholder="Answer..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080512] border border-white/15 text-white resize-none focus:border-fuchsia-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-mono font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all"
                  >
                    Publish FAQ
                  </button>
                </form>

                <div className="lg:col-span-7 space-y-2.5">
                  {dashboard.faqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="p-4 rounded-2xl bg-gradient-to-r from-[#0d071a]/90 to-[#070512]/90 border border-white/10 hover:border-fuchsia-500/40 flex items-start justify-between gap-3 transition-all duration-200 shadow-sm hover:shadow-[0_0_20px_rgba(217,70,239,0.1)]"
                    >
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-white">{faq.q}</h3>
                        <p className="text-xs text-slate-400">{faq.a}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleDeleteFaq(faq.id)}
                        aria-label={`Delete FAQ ${faq.id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 6: Notices, Clubs, Organizers & Results */}
            {activeTab === 'community' && (
              <CommunityAndResultsPanel
                announcements={dashboard.announcements}
                clubs={dashboard.clubs}
                organizers={dashboard.organizers}
                results={dashboard.results}
                events={dashboard.events}
                token={authToken}
                onSaved={() => loadDashboard(authToken)}
                onError={setActionError}
              />
            )}

            {/* Tab 7: Fest Settings, Pass Tiers & Database Diagnostics */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <DatabaseHealthPanel
                  dbStats={dashboard.dbStats}
                  token={authToken}
                  onError={setActionError}
                />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <FestInfoEditorForm
                    key={`${dashboard.festInfo.dates}|${dashboard.festInfo.venue}|${dashboard.festInfo.tagline}|${dashboard.festInfo.contacts.email}`}
                    festInfo={dashboard.festInfo}
                    token={authToken}
                    onSaved={() => loadDashboard(authToken)}
                    onError={setActionError}
                  />
                  <div className="lg:col-span-7 space-y-4">
                    {dashboard.passes.map((pass) => (
                      <PassEditorCard
                        key={`${pass.id}|${pass.name}|${pass.price}|${pass.originalPrice}|${pass.isPopular ? '1' : '0'}|${pass.accessScope}`}
                        pass={pass}
                        token={authToken}
                        onSaved={() => loadDashboard(authToken)}
                        onError={setActionError}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 8: Organizer Audit Trail */}
            {activeTab === 'audit' && <AuditTrailPanel logs={dashboard.auditLogs} />}
          </>
        )}
      </div>
    </div>
  );
};
