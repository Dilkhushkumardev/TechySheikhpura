import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  CalendarPlus,
  CheckCircle2,
  Database,
  Download,
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
  ShieldCheck,
  Ticket,
  Trash2,
  Trophy,
  Users,
} from 'lucide-react';
import {
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
  downloadDatabaseBackup,
  downloadRegistrationsCsv,
  fetchAdminDashboard,
  toggleAdminAnnouncement,
  toggleRegistrationCheckIn,
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
      className="p-4 rounded-2xl bg-[#0b0b11] border border-white/10 space-y-3 text-xs"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-fuchsia-300 font-bold uppercase">
          Tier ID: {pass.id}
        </span>
        <button
          type="button"
          onClick={() => setIsPopular((prev) => !prev)}
          className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold border transition-colors ${
            isPopular
              ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
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
          className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
        />
        <input
          type="text"
          required
          value={accessScope}
          onChange={(e) => setAccessScope(e.target.value)}
          placeholder="Access Scope"
          className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
        />
        <input
          type="number"
          min={0}
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price (INR)"
          className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-emerald-300 font-mono"
        />
        <input
          type="number"
          min={0}
          required
          value={originalPrice}
          onChange={(e) => setOriginalPrice(e.target.value)}
          placeholder="Original Price (INR)"
          className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-slate-300 font-mono"
        />
      </div>

      <input
        type="text"
        required
        value={tagline}
        onChange={(e) => setTagline(e.target.value)}
        placeholder="Tagline"
        className="w-full px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-slate-200"
      />

      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 rounded-xl bg-fuchsia-600/25 hover:bg-fuchsia-600/40 border border-fuchsia-400/40 text-fuchsia-200 font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
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
      className="lg:col-span-5 p-5 rounded-2xl bg-[#0b0b11] border border-fuchsia-500/30 space-y-3 text-xs"
    >
      <div className="flex items-center gap-2 text-fuchsia-300 font-mono font-bold uppercase">
        <Settings className="w-4 h-4" />
        <span>Fest Identity &amp; Contacts</span>
      </div>
      <input
        type="text"
        required
        value={tagline}
        onChange={(e) => setTagline(e.target.value)}
        placeholder="Fest Tagline"
        className="w-full px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <input
          type="text"
          required
          value={dates}
          onChange={(e) => setDates(e.target.value)}
          placeholder="Dates (e.g. Sep 28 - Sep 29, 2026)"
          className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Official Desk Email"
          className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
        />
      </div>
      <input
        type="text"
        required
        value={venue}
        onChange={(e) => setVenue(e.target.value)}
        placeholder="Campus Venue"
        className="w-full px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <input
          type="text"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Helpdesk Phone"
          className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white font-mono"
        />
        <input
          type="text"
          required
          value={studentConvenor}
          onChange={(e) => setStudentConvenor(e.target.value)}
          placeholder="Student Convenor Phone"
          className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white font-mono"
        />
      </div>
      <input
        type="url"
        required
        value={telegram}
        onChange={(e) => setTelegram(e.target.value)}
        placeholder="Official Telegram URL"
        className="w-full px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-sky-300 font-mono"
      />
      <button
        type="submit"
        disabled={saving}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2"
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
    <div className="p-5 rounded-2xl bg-[#0b0b11] border border-emerald-500/30 space-y-4 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-emerald-300 font-mono font-bold uppercase">
          <Database className="w-4 h-4" />
          <span>SQLite Engine Diagnostics ({Object.keys(dbStats.tableCounts).length} Tables)</span>
        </div>
        <button
          type="button"
          onClick={() => void handleBackup()}
          disabled={downloading}
          className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 font-mono font-bold inline-flex items-center gap-1.5"
        >
          {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          <span>Download .db Backup</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-[11px]">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
          <span className="text-slate-400 block">Journal Mode</span>
          <strong className="text-white uppercase">{dbStats.journalMode}</strong>
        </div>
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
          <span className="text-slate-400 block">Integrity Check</span>
          <strong className="text-emerald-300 uppercase">{dbStats.integrityCheck}</strong>
        </div>
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
          <span className="text-slate-400 block">Schema Version</span>
          <strong className="text-fuchsia-300">v{dbStats.schemaVersion}</strong>
        </div>
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
          <span className="text-slate-400 block">Allocated Size</span>
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
        <div className="p-5 rounded-2xl bg-[#0b0b11] border border-fuchsia-500/30 space-y-4">
          <div className="flex items-center gap-2 text-fuchsia-300 font-mono font-bold uppercase">
            <Bell className="w-4 h-4" />
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
                className="sm:col-span-2 px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
              />
              <select
                value={noticePrio}
                onChange={(e) => setNoticePrio(e.target.value as AnnouncementRecord['priority'])}
                className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white font-mono"
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
              className="w-full px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-mono font-bold uppercase"
            >
              Post Notice
            </button>
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {announcements.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-black/50 border border-white/10 flex items-start justify-between gap-2"
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
                    className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-mono text-white"
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

        <div className="p-5 rounded-2xl bg-[#0b0b11] border border-amber-500/30 space-y-4">
          <div className="flex items-center gap-2 text-amber-300 font-mono font-bold uppercase">
            <Trophy className="w-4 h-4" />
            <span>Official Event Winners &amp; Results ({results.length})</span>
          </div>
          <form onSubmit={handleCreateResult} className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={resEventId}
                onChange={(e) => setResEventId(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
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
                className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-amber-300 font-mono"
              />
              <input
                type="text"
                required
                value={resWinner}
                onChange={(e) => setResWinner(e.target.value)}
                placeholder="Winner Full Name"
                className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
              />
              <input
                type="text"
                value={resTeam}
                onChange={(e) => setResTeam(e.target.value)}
                placeholder="Team Name (Optional)"
                className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
              />
              <input
                type="text"
                required
                value={resBranch}
                onChange={(e) => setResBranch(e.target.value)}
                placeholder="Branch"
                className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
              />
              <input
                type="text"
                required
                value={resPrize}
                onChange={(e) => setResPrize(e.target.value)}
                placeholder="Award / Prize"
                className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-emerald-300"
              />
            </div>
            <button
              type="submit"
              disabled={!resEventId}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 font-mono font-bold uppercase"
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
                  className="p-3 rounded-xl bg-black/50 border border-white/10 flex items-start justify-between gap-2"
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
        <div className="p-5 rounded-2xl bg-[#0b0b11] border border-white/10 space-y-4">
          <h3 className="text-fuchsia-300 font-mono font-bold uppercase">
            Campus Clubs ({clubs.length})
          </h3>
          <form onSubmit={handleCreateClub} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              required
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              placeholder="Club Name"
              className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
            />
            <input
              type="text"
              required
              value={clubRole}
              onChange={(e) => setClubRole(e.target.value)}
              placeholder="Focus / Role"
              className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
            />
            <input
              type="text"
              required
              value={clubLead}
              onChange={(e) => setClubLead(e.target.value)}
              placeholder="Club Lead Name"
              className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
            />
            <select
              value={clubIcon}
              onChange={(e) => setClubIcon(e.target.value as CampusClub['icon'])}
              className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white font-mono"
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
              className="sm:col-span-2 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono font-bold uppercase"
            >
              Add Club Chapter
            </button>
          </form>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {clubs.map((c) => (
              <div key={c.id} className="p-2.5 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between">
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

        <div className="p-5 rounded-2xl bg-[#0b0b11] border border-white/10 space-y-4">
          <h3 className="text-fuchsia-300 font-mono font-bold uppercase">
            Organizing Team &amp; Contacts ({organizers.length})
          </h3>
          <form onSubmit={handleCreateOrganizer} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Name"
              className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
            />
            <input
              type="text"
              required
              value={orgRole}
              onChange={(e) => setOrgRole(e.target.value)}
              placeholder="Role / Designation"
              className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
            />
            <input
              type="text"
              required
              value={orgDept}
              onChange={(e) => setOrgDept(e.target.value)}
              placeholder="Department / Year"
              className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
            />
            <input
              type="text"
              required
              value={orgPhone}
              onChange={(e) => setOrgPhone(e.target.value)}
              placeholder="Phone"
              className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white font-mono"
            />
            <select
              value={orgCategory}
              onChange={(e) => setOrgCategory(e.target.value as OrganizerMember['category'])}
              className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white font-mono"
            >
              <option value="student">student</option>
              <option value="faculty">faculty</option>
              <option value="team">team</option>
            </select>
            <button
              type="submit"
              className="py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono font-bold uppercase"
            >
              Add Organizer
            </button>
          </form>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {organizers.map((m) => (
              <div key={m.id} className="p-2.5 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between">
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
  <div className="rounded-2xl bg-[#0b0b11] border border-white/10 overflow-hidden">
    <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between text-xs font-mono">
      <div className="flex items-center gap-2 text-fuchsia-300 font-bold uppercase">
        <History className="w-4 h-4" />
        <span>Organizer Audit Log (SQLite Append-Only)</span>
      </div>
      <span className="text-slate-400">Latest {logs.length} actions</span>
    </div>
    {logs.length === 0 ? (
      <div className="p-8 text-center text-xs font-mono text-slate-400">
        No organizer audit entries recorded yet.
      </div>
    ) : (
      <div className="divide-y divide-white/5">
        {logs.map((entry) => (
          <div
            key={entry.id}
            className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono hover:bg-white/[0.02]"
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
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [loadingData, setLoadingData] = useState(() => Boolean(sessionStorage.getItem(TOKEN_STORAGE_KEY)));
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ConsoleTab>('registrations');
  const [regSearch, setRegSearch] = useState('');
  const [passFilter, setPassFilter] = useState('All');

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
        setActionError(err instanceof Error ? err.message : 'Failed to load SQLite dashboard');
      }
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (!authToken) return;
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
          setActionError(err instanceof Error ? err.message : 'Failed to load SQLite dashboard');
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
      setAuthError(err instanceof ApiError ? err.message : 'Unable to verify organizer PIN');
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
    try {
      await toggleRegistrationCheckIn(authToken, regId, !current);
      await loadDashboard(authToken);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update check-in status');
    }
  };

  const handleDeleteReg = async (regId: string) => {
    if (!window.confirm(`Delete delegate pass ${regId} permanently from SQLite?`)) return;
    try {
      await deleteAdminRegistration(authToken, regId);
      await loadDashboard(authToken);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete registration');
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

  const handleExportCsv = async () => {
    try {
      await downloadRegistrationsCsv(authToken);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to export CSV');
    }
  };

  if (!authToken) {
    return (
      <div className="min-h-screen bg-[#020003] text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl bg-[#0b0b11]/95 border border-fuchsia-500/35 p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Fest Home</span>
            </Link>
            <span className="text-[10px] font-mono uppercase tracking-widest text-fuchsia-400 font-bold">
              SQLite Desk Auth
            </span>
          </div>

          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-fuchsia-500/15 border border-fuchsia-400/40 flex items-center justify-center text-fuchsia-400">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black font-display text-white">Organizer Console</h1>
            <p className="text-xs text-slate-400 font-sans">
              Enter your Organizer Access PIN to manage live delegate passes, gate check-ins, support tickets, and fest events.
            </p>
          </div>

          {authError && (
            <div role="alert" className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-mono text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-pin" className="block text-xs font-mono text-slate-300 mb-1.5">
                Organizer PIN
              </label>
              <input
                id="admin-pin"
                type="password"
                required
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Default dev PIN: GECS2026"
                className="w-full px-4 py-3 rounded-xl bg-[#020003] border border-white/15 text-white font-mono text-sm focus:border-fuchsia-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 text-white font-bold text-xs font-mono uppercase tracking-wider hover:opacity-95 shadow-glow-fuchsia flex items-center justify-center gap-2"
            >
              {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Unlock Dashboard</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020003] text-slate-100 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300"
              aria-label="Back to fest home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
                {FEST_INFO.shortName} <span className="text-fuchsia-400">Desk Console</span>
              </h1>
              <p className="text-xs font-mono text-slate-400">
                Real-Time SQLite Registration &amp; Operations Backend
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadDashboard(authToken)}
              disabled={loadingData}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-200 inline-flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-xs font-mono text-rose-200 inline-flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>
          </div>
        </div>

        {actionError && (
          <div role="alert" className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-mono">
            {actionError}
          </div>
        )}

        {dashboard && (
          <>
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-5 rounded-2xl bg-[#0b0b11] border border-white/10">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono uppercase">
                  <span>Registrations</span>
                  <Ticket className="w-4 h-4 text-fuchsia-400" />
                </div>
                <div className="text-3xl font-black font-mono text-white mt-2">
                  {dashboard.summary.totalRegistrations}
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-[#0b0b11] border border-white/10">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono uppercase">
                  <span>Gate Checked-In</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-black font-mono text-emerald-400 mt-2">
                  {dashboard.summary.checkedInCount}
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-[#0b0b11] border border-white/10">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono uppercase">
                  <span>Fee Revenue</span>
                  <IndianRupee className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-black font-mono text-white mt-2">
                  ₹{dashboard.summary.totalRevenue}
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-[#0b0b11] border border-white/10">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono uppercase">
                  <span>Open Queries</span>
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-3xl font-black font-mono text-sky-300 mt-2">
                  {dashboard.summary.openInquiries}
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-[#0b0b11] border border-white/10 col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono uppercase">
                  <span>Active Events</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-black font-mono text-white mt-2">
                  {dashboard.summary.totalEvents}
                </div>
              </div>
            </div>

            {/* Pass Tier Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dashboard.passBreakdown.map((tier) => (
                <div
                  key={tier.passId}
                  className="p-4 rounded-2xl bg-[#0b0b11]/80 border border-white/10 flex items-center justify-between font-mono text-xs"
                >
                  <div>
                    <span className="text-white font-bold block">{tier.passName}</span>
                    <span className="text-slate-400">₹{tier.price} per pass</span>
                  </div>
                  <div className="text-right">
                    <strong className="text-fuchsia-300 text-base block">{tier.bookings} sold</strong>
                    <span className="text-emerald-400">₹{tier.revenue}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3 font-mono text-xs">
              {(
                [
                  { id: 'registrations', label: `Passes (${dashboard.registrations.length})` },
                  { id: 'inquiries', label: `Helpdesk Tickets (${dashboard.inquiries.length})` },
                  { id: 'events', label: `Events Catalog (${dashboard.events.length})` },
                  { id: 'schedule', label: `Schedule (${dashboard.schedule.length})` },
                  { id: 'faqs', label: `FAQs (${dashboard.faqs.length})` },
                  { id: 'community', label: `Notices & Results (${dashboard.announcements.length}/${dashboard.results.length})` },
                  { id: 'settings', label: `Settings & DB (${dashboard.passes.length})` },
                  { id: 'audit', label: `Audit (${dashboard.auditLogs.length})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-glow-fuchsia'
                      : 'bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
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
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0b0b11] border border-white/15 text-xs text-white font-mono focus:border-fuchsia-400 focus:outline-none"
                      />
                    </div>
                    <select
                      value={passFilter}
                      onChange={(e) => setPassFilter(e.target.value)}
                      aria-label="Filter by pass tier"
                      className="px-3.5 py-2.5 rounded-xl bg-[#0b0b11] border border-white/15 text-xs text-white font-mono focus:outline-none"
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
                    className="px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/35 text-emerald-300 text-xs font-mono font-bold inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV ({dashboard.registrations.length})</span>
                  </button>
                </div>

                {filteredRegistrations.length === 0 ? (
                  <div className="p-10 rounded-2xl bg-[#0b0b11] border border-white/10 text-center text-xs font-mono text-slate-400">
                    No delegate registrations found yet. Bookings created on the homepage appear here in real time.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0b0b11]">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-white/5 text-slate-300 uppercase text-[10px]">
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
                          <tr key={reg.regId} className="hover:bg-white/[0.03]">
                            <td className="p-3.5 font-bold text-fuchsia-300 whitespace-nowrap">
                              {reg.regId}
                            </td>
                            <td className="p-3.5">
                              <strong className="text-white block">{reg.fullName}</strong>
                              <span className="text-slate-400">{reg.rollNo}</span>
                            </td>
                            <td className="p-3.5 text-slate-300">
                              <span className="block max-w-[190px] truncate">{reg.branch}</span>
                              <span className="text-slate-500">{reg.year}</span>
                            </td>
                            <td className="p-3.5">
                              <span className="text-white block">{reg.passName} (₹{reg.price})</span>
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
                                className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors ${
                                  reg.checkedIn
                                    ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300'
                                    : 'bg-amber-500/15 border border-amber-400/35 text-amber-300 hover:bg-emerald-500/20'
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
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
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
                  <div className="p-10 rounded-2xl bg-[#0b0b11] border border-white/10 text-center text-xs font-mono text-slate-400">
                    No support tickets submitted yet.
                  </div>
                ) : (
                  dashboard.inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="p-5 rounded-2xl bg-[#0b0b11] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                          <span className="text-fuchsia-300 font-bold">#{inq.id}</span>
                          <strong className="text-white">{inq.subject}</strong>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                              inq.status === 'resolved'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {inq.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-sans">{inq.message}</p>
                        {inq.adminNote && (
                          <p className="text-[11px] font-mono text-emerald-300">
                            Resolution Note: {inq.adminNote}
                          </p>
                        )}
                        <p className="text-[11px] font-mono text-slate-500">
                          From {inq.name} ({inq.email}){inq.rollNo ? ` • Roll: ${inq.rollNo}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => void handleToggleInquiry(inq.id, inq.status)}
                          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono font-bold text-white"
                        >
                          {inq.status === 'open' ? 'Mark Resolved' : 'Reopen'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteInquiry(inq.id)}
                          aria-label={`Delete inquiry ${inq.id}`}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
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
                  className="lg:col-span-5 p-5 rounded-2xl bg-[#0b0b11] border border-fuchsia-500/30 space-y-3 text-xs"
                >
                  <div className="flex items-center gap-2 text-fuchsia-300 font-mono font-bold uppercase">
                    <CalendarPlus className="w-4 h-4" />
                    <span>Add Event to SQLite</span>
                  </div>

                  <input
                    type="text"
                    required
                    value={evTitle}
                    onChange={(e) => setEvTitle(e.target.value)}
                    placeholder="Event Title (e.g. AI Agents Sprint)"
                    className="w-full px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    value={evTagline}
                    onChange={(e) => setEvTagline(e.target.value)}
                    placeholder="Short Tagline"
                    className="w-full px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={evCategory}
                      onChange={(e) => setEvCategory(e.target.value as FestEvent['category'])}
                      className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
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
                      className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={evTime}
                      onChange={(e) => setEvTime(e.target.value)}
                      placeholder="Time"
                      className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
                    />
                    <input
                      type="text"
                      required
                      value={evVenue}
                      onChange={(e) => setEvVenue(e.target.value)}
                      placeholder="Venue"
                      className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={evTeamSize}
                      onChange={(e) => setEvTeamSize(e.target.value)}
                      placeholder="Team Size"
                      className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
                    />
                    <input
                      type="text"
                      value={evPrizes}
                      onChange={(e) => setEvPrizes(e.target.value)}
                      placeholder="Prize Pool"
                      className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
                    />
                  </div>
                  <textarea
                    rows={3}
                    required
                    minLength={10}
                    value={evDescription}
                    onChange={(e) => setEvDescription(e.target.value)}
                    placeholder="Event description and judging focus..."
                    className="w-full px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white resize-none focus:border-fuchsia-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={creatingEvent}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-mono font-bold uppercase tracking-wider hover:opacity-95"
                  >
                    {creatingEvent ? 'Saving Event...' : 'Publish Event'}
                  </button>
                </form>

                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dashboard.events.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-4 rounded-2xl bg-[#0b0b11] border border-white/10 flex items-start justify-between gap-3"
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
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 shrink-0"
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
                  className="lg:col-span-5 p-5 rounded-2xl bg-[#0b0b11] border border-fuchsia-500/30 space-y-3 text-xs"
                >
                  <div className="flex items-center gap-2 text-fuchsia-300 font-mono font-bold uppercase">
                    <CalendarPlus className="w-4 h-4" />
                    <span>Add Schedule Slot</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={schedDay}
                      onChange={(e) => setSchedDay(e.target.value as 'Day 1' | 'Day 2')}
                      className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
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
                      className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    value={schedTitle}
                    onChange={(e) => setSchedTitle(e.target.value)}
                    placeholder="Session Title"
                    className="w-full px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={schedCategory}
                      onChange={(e) => setSchedCategory(e.target.value)}
                      placeholder="Category"
                      className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
                    />
                    <input
                      type="text"
                      required
                      value={schedVenue}
                      onChange={(e) => setSchedVenue(e.target.value)}
                      placeholder="Venue"
                      className="px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
                    />
                  </div>
                  <textarea
                    rows={2}
                    required
                    minLength={5}
                    value={schedDesc}
                    onChange={(e) => setSchedDesc(e.target.value)}
                    placeholder="Short schedule description..."
                    className="w-full px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white resize-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-mono font-bold uppercase tracking-wider"
                  >
                    Add Schedule Slot
                  </button>
                </form>

                <div className="lg:col-span-7 space-y-2.5">
                  {dashboard.schedule.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-4 rounded-2xl bg-[#0b0b11] border border-white/10 flex items-start justify-between gap-3"
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
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 shrink-0"
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
                  className="lg:col-span-5 p-5 rounded-2xl bg-[#0b0b11] border border-fuchsia-500/30 space-y-3 text-xs"
                >
                  <div className="flex items-center gap-2 text-fuchsia-300 font-mono font-bold uppercase">
                    <MessageSquare className="w-4 h-4" />
                    <span>Add FAQ Entry</span>
                  </div>
                  <input
                    type="text"
                    required
                    minLength={5}
                    value={faqQuestion}
                    onChange={(e) => setFaqQuestion(e.target.value)}
                    placeholder="Question..."
                    className="w-full px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white"
                  />
                  <textarea
                    rows={3}
                    required
                    minLength={5}
                    value={faqAnswer}
                    onChange={(e) => setFaqAnswer(e.target.value)}
                    placeholder="Answer..."
                    className="w-full px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white resize-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-mono font-bold uppercase tracking-wider"
                  >
                    Publish FAQ
                  </button>
                </form>

                <div className="lg:col-span-7 space-y-2.5">
                  {dashboard.faqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="p-4 rounded-2xl bg-[#0b0b11] border border-white/10 flex items-start justify-between gap-3"
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
