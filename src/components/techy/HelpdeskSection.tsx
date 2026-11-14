import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Send,
  CheckCircle,
  Loader2,
  ShieldAlert,
  ArrowUpRight,
  Users,
  Sparkles,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  Radio,
  UserCheck,
} from 'lucide-react';
import {
  FEST_EVENTS,
  FEST_ORGANIZERS,
  type FestEvent,
  type OrganizerMember,
} from '../../data/techySheikhpuraData';
import {
  ApiError,
  createInquiry,
  createTeamRegistration,
  type InquiryRecord,
  type TeamRegistrationRecord,
} from '../../services/api';
import { saveOfflineTeam } from '../../services/offlineStorage';

interface HelpdeskSectionProps {
  telegramUrl: string;
  contactEmail: string;
  leadContact?: OrganizerMember;
}

const SUBJECT_PRESETS = [
  'Pass Verification / Payment Query',
  'HackArena / Team Registration Help',
  'Robotics & Aero Arena Guidelines',
  'Campus Reporting & Accommodation',
  'Other Fest Support Query',
];

const BRANCH_OPTIONS = [
  'Computer Science & Engineering (CSE)',
  'Civil Engineering (CE)',
  'Electrical Engineering (EE)',
  'Electronics & Communication (ECE)',
  'Mechanical Engineering (ME)',
];

export const HelpdeskSection: React.FC<HelpdeskSectionProps> = ({
  telegramUrl,
  contactEmail,
  leadContact,
}) => {
  const [activeTab, setActiveTab] = useState<'team-reg' | 'inquiry'>('team-reg');

  // Inquiry Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [subject, setSubject] = useState(SUBJECT_PRESETS[0]);
  const [message, setMessage] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<InquiryRecord | null>(null);

  // Quick Team Registration State
  const [eventId, setEventId] = useState(FEST_EVENTS[0]?.id || 'hackarena');
  const [teamName, setTeamName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderRoll, setLeaderRoll] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [leaderBranch, setLeaderBranch] = useState(BRANCH_OPTIONS[0]);
  const [member2Name, setMember2Name] = useState('');
  const [member2Roll, setMember2Roll] = useState('');
  const [submittingTeam, setSubmittingTeam] = useState(false);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [submittedTeam, setSubmittedTeam] = useState<TeamRegistrationRecord | null>(null);

  const selectedEvent: FestEvent =
    FEST_EVENTS.find((e) => e.id === eventId) || FEST_EVENTS[0];

  const featuredLead =
    leadContact ||
    FEST_ORGANIZERS.find((m) => m.featuredFooter) || {
      id: 'org-supriya',
      name: 'Supriya Singh',
      role: 'Student Convenor & Lead Organizer',
      department: 'GEC Sheikhpura',
      phone: '+91 98765 43210',
      category: 'student',
      featuredFooter: true,
    };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setInquiryError('Please enter your name, email, and query details.');
      return;
    }

    setInquiryError(null);
    setSubmittingInquiry(true);

    try {
      const { inquiry } = await createInquiry({
        name: name.trim(),
        email: email.trim(),
        rollNo: rollNo.trim() || undefined,
        subject,
        message: message.trim(),
      });
      setSubmittedTicket(inquiry);
      setName('');
      setEmail('');
      setRollNo('');
      setMessage('');
    } catch (err) {
      if (err instanceof ApiError) {
        setInquiryError(err.message);
      } else {
        // Offline ticket fallback
        const offlineTicket: InquiryRecord = {
          id: Math.floor(100 + Math.random() * 900),
          name: name.trim(),
          email: email.trim(),
          rollNo: rollNo.trim() || null,
          subject,
          message: message.trim(),
          status: 'open',
          createdAt: new Date().toISOString(),
        };
        setSubmittedTicket(offlineTicket);
        setName('');
        setEmail('');
        setRollNo('');
        setMessage('');
      }
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamError(null);

    if (
      !teamName.trim() ||
      !leaderName.trim() ||
      !leaderRoll.trim() ||
      !leaderEmail.trim() ||
      !leaderPhone.trim()
    ) {
      setTeamError('Please fill in team name and all required leader details.');
      return;
    }

    if (leaderPhone.replace(/\D/g, '').length < 10) {
      setTeamError('Leader WhatsApp/Phone must contain at least 10 digits.');
      return;
    }

    setSubmittingTeam(true);

    const membersList = [];
    if (member2Name.trim() && member2Roll.trim()) {
      membersList.push({
        name: member2Name.trim(),
        rollNo: member2Roll.trim().toUpperCase(),
        branch: leaderBranch,
      });
    }

    try {
      const res = await createTeamRegistration({
        teamName: teamName.trim(),
        eventId,
        leaderName: leaderName.trim(),
        leaderRoll: leaderRoll.trim().toUpperCase(),
        leaderEmail: leaderEmail.trim().toLowerCase(),
        leaderPhone: leaderPhone.trim(),
        branch: leaderBranch,
        year: '3rd Year (2024-28)',
        members: membersList,
      });

      setSubmittedTeam(res.teamRegistration);
      saveOfflineTeam(res.teamRegistration);
      setTeamName('');
      setLeaderName('');
      setLeaderRoll('');
      setLeaderEmail('');
      setLeaderPhone('');
      setMember2Name('');
      setMember2Roll('');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setTeamError(err.message);
        return;
      }
      // Offline fallback for static GitHub Pages
      const offlineTeamId = `TS26-TEAM-${Math.floor(100 + Math.random() * 900)}`;
      const fallbackTeam: TeamRegistrationRecord = {
        teamId: offlineTeamId,
        teamName: teamName.trim(),
        eventId,
        eventTitle: FEST_EVENTS.find((e) => e.id === eventId)?.title ?? eventId,
        leaderName: leaderName.trim(),
        leaderRoll: leaderRoll.trim().toUpperCase(),
        leaderEmail: leaderEmail.trim().toLowerCase(),
        leaderPhone: leaderPhone.trim(),
        branch: leaderBranch,
        year: '3rd Year (2024-28)',
        members: membersList,
        projectTitle: null,
        notes: null,
        status: 'confirmed',
        checkedIn: false,
        checkedInAt: null,
        createdAt: new Date().toISOString(),
      };
      saveOfflineTeam(fallbackTeam);
      setSubmittedTeam(fallbackTeam);
      setTeamName('');
      setLeaderName('');
      setLeaderRoll('');
      setLeaderEmail('');
      setLeaderPhone('');
      setMember2Name('');
      setMember2Roll('');
    } finally {
      setSubmittingTeam(false);
    }
  };

  return (
    <section
      id="contact"
      className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 scroll-mt-28"
    >
      {/* Ambient Cyber Lighting Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container with Glowing Gradient Cyber Border */}
      <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-fuchsia-500/40 via-purple-500/20 to-emerald-500/40 shadow-[0_0_60px_rgba(217,70,239,0.12)]">
        <div className="rounded-[calc(1.5rem-1px)] bg-[#07060e]/95 backdrop-blur-2xl p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative">
          
          {/* LEFT COLUMN: COMMAND & CONTACTS HUB (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Operational Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Desk Open • Real-Time Registration &amp; Support</span>
            </div>

            {/* Futuristic Heading */}
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-white leading-tight">
                Desk Open:{' '}
                <span className="bg-gradient-to-r from-fuchsia-400 via-pink-300 to-emerald-400 bg-clip-text text-transparent">
                  Team Contact
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                The official technical desk of <strong>GEC Sheikhpura</strong> is live. Register your squads for HackArena, Track-O-Bot, AeroStrike &amp; BGMI, or connect with our convenor desk for instant campus guidance.
              </p>
            </div>

            {/* HIGHLIGHTED STUDENT CONVENOR CARD (Supriya Singh) */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-fuchsia-950/50 via-purple-950/40 to-[#0c0915] border border-fuchsia-500/40 shadow-[0_0_30px_rgba(217,70,239,0.12)] relative overflow-hidden space-y-3 group hover:border-fuchsia-400/70 transition-all">
              <div className="absolute top-0 right-0 w-28 h-28 bg-fuchsia-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white font-bold font-display shadow-glow-fuchsia text-base">
                    SS
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-white font-heading text-sm sm:text-base">
                        {featuredLead.name}
                      </strong>
                      <span className="px-2 py-0.5 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/40 text-[10px] font-mono text-fuchsia-300 uppercase font-bold">
                        Lead Convenor
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-sans block">
                      {featuredLead.role} • {featuredLead.department}
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Actions: Call & WhatsApp */}
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
                <a
                  href={`tel:${featuredLead.phone.replace(/\s+/g, '')}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-fuchsia-600/25 hover:bg-fuchsia-600/40 border border-fuchsia-400/40 hover:border-fuchsia-400/70 text-white font-bold transition-all shadow-sm group-hover:shadow-glow-fuchsia"
                >
                  <Phone className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>Call {featuredLead.phone}</span>
                </a>
                <a
                  href={`https://wa.me/${featuredLead.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 font-bold transition-all"
                  title="WhatsApp Student Convenor"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Quick Links & Desk Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              {/* Official Email */}
              <div className="p-3.5 rounded-2xl bg-[#030106] border border-white/10 hover:border-emerald-500/40 transition-colors space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Official Support Email</span>
                </div>
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-white hover:text-emerald-300 font-bold block truncate transition-colors text-xs"
                >
                  {contactEmail}
                </a>
              </div>

              {/* Telegram Channel */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-400/30 hover:border-sky-400/60 text-sky-300 hover:text-white transition-all space-y-1 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-sky-400">
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 animate-pulse text-sky-400" />
                    <span>Telegram Updates</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
                <strong className="text-white text-xs block">Join Official Channel</strong>
              </a>

              {/* Campus Desk Hours */}
              <div className="p-3.5 rounded-2xl bg-[#030106] border border-white/10 space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-fuchsia-400" />
                    <span>Campus Location &amp; Desk Hours</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <Clock className="w-3 h-3" />
                    <span>09:00 AM – 08:00 PM</span>
                  </div>
                </div>
                <p className="text-slate-300 text-[11px] font-sans">
                  Government Engineering College, Sheikhpura — Administrative Block, NH-333A, Mehus, Bihar 811105
                </p>
              </div>
            </div>

            {/* Dedicated Team Page Callout Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-fuchsia-950/30 to-[#050308] border border-fuchsia-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-fuchsia-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-fuchsia-400" />
                  <span>Full Roster Portal (3 to 6 Members)</span>
                </span>
                <Link
                  to="/team-register"
                  className="text-[11px] text-fuchsia-400 hover:text-white underline inline-flex items-center gap-1"
                >
                  <span>Open</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                Need more member slots, custom problem tracks, or team pass certificates? Use our dedicated full-screen portal.
              </p>
            </div>

          </div>

          {/* RIGHT COLUMN: INTERACTIVE CYBER DESK TERMINAL (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Segmented Cyber Switcher Tabs */}
            <div className="flex rounded-2xl bg-[#030106] p-1.5 border border-white/15 gap-1.5 text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('team-reg')}
                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'team-reg'
                    ? 'bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 text-white shadow-glow-fuchsia'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="w-4 h-4 text-white" />
                <span>Squad Register (Desk Open)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('inquiry')}
                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'inquiry'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Ask Support Query</span>
              </button>
            </div>

            {/* TAB 1: QUICK TEAM REGISTRATION */}
            {activeTab === 'team-reg' && (
              <div className="p-6 sm:p-8 rounded-2xl bg-[#030106]/90 border border-fuchsia-500/30 shadow-[0_0_35px_rgba(217,70,239,0.08)]">
                {submittedTeam ? (
                  <div className="p-6 sm:p-8 rounded-2xl bg-[#07060e] border border-emerald-500/40 text-center space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                      <CheckCircle className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
                        REGISTRATION CONFIRMED
                      </span>
                      <h3 className="text-2xl font-bold font-heading text-white">
                        {submittedTeam.teamName}
                      </h3>
                      <span className="inline-block px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-400/40 text-xs font-mono text-fuchsia-300 font-bold">
                        Team ID: {submittedTeam.teamId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 max-w-md mx-auto font-sans leading-relaxed">
                      Squad recorded under <strong className="text-white">{submittedTeam.eventTitle}</strong> for leader{' '}
                      <strong className="text-white">{submittedTeam.leaderName}</strong> ({submittedTeam.leaderRoll}). Saved directly in the TechySheikhpura Desk queue!
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                      <Link
                        to="/team-register"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-xs font-mono font-bold text-white shadow-glow-fuchsia transition-transform hover:scale-105"
                      >
                        Open Full Team Pass &amp; Details
                      </Link>
                      <button
                        type="button"
                        onClick={() => setSubmittedTeam(null)}
                        className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono font-bold text-white transition-colors"
                      >
                        Register Another Team
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleTeamSubmit} className="space-y-4 text-xs font-sans">
                    {teamError && (
                      <div
                        role="alert"
                        className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 font-mono flex items-center gap-2"
                      >
                        <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                        <span>{teamError}</span>
                      </div>
                    )}

                    {/* Event & Team Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label htmlFor="desk-event" className="block text-slate-200 mb-1.5 font-semibold">
                          Target Fest Arena / Event <span className="text-rose-400">*</span>
                        </label>
                        <select
                          id="desk-event"
                          value={eventId}
                          onChange={(e) => setEventId(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#090812] border border-white/15 text-white focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/30 focus:outline-none font-mono text-xs transition-all"
                        >
                          {FEST_EVENTS.map((ev) => (
                            <option key={ev.id} value={ev.id}>
                              {ev.title} ({ev.teamSize})
                            </option>
                          ))}
                        </select>
                        <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                          Scope: <strong className="text-fuchsia-300">{selectedEvent.teamSize}</strong> • {selectedEvent.category}
                        </span>
                      </div>

                      <div>
                        <label htmlFor="desk-team-name" className="block text-slate-200 mb-1.5 font-semibold">
                          Squad / Team Name <span className="text-rose-400">*</span>
                        </label>
                        <input
                          id="desk-team-name"
                          type="text"
                          required
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          placeholder="e.g. CyberKnights, Squad Alpha"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#090812] border border-white/15 text-white focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/30 focus:outline-none font-mono text-xs transition-all placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    {/* Leader Name & Roll No */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label htmlFor="desk-leader-name" className="block text-slate-200 mb-1.5 font-semibold">
                          Team Leader Name <span className="text-rose-400">*</span>
                        </label>
                        <input
                          id="desk-leader-name"
                          type="text"
                          required
                          value={leaderName}
                          onChange={(e) => setLeaderName(e.target.value)}
                          placeholder="Leader's Full Name"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#090812] border border-white/15 text-white focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/30 focus:outline-none text-xs transition-all placeholder:text-slate-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="desk-leader-roll" className="block text-slate-200 mb-1.5 font-semibold">
                          Leader Roll No. <span className="text-rose-400">*</span>
                        </label>
                        <input
                          id="desk-leader-roll"
                          type="text"
                          required
                          value={leaderRoll}
                          onChange={(e) => setLeaderRoll(e.target.value)}
                          placeholder="e.g. 23105147042"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#090812] border border-white/15 text-white focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/30 focus:outline-none font-mono text-xs transition-all placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    {/* Leader Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label htmlFor="desk-leader-email" className="block text-slate-200 mb-1.5 font-semibold">
                          Leader Email Address <span className="text-rose-400">*</span>
                        </label>
                        <input
                          id="desk-leader-email"
                          type="email"
                          required
                          value={leaderEmail}
                          onChange={(e) => setLeaderEmail(e.target.value)}
                          placeholder="leader@gecsheikhpura.ac.in"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#090812] border border-white/15 text-white focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/30 focus:outline-none font-mono text-xs transition-all placeholder:text-slate-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="desk-leader-phone" className="block text-slate-200 mb-1.5 font-semibold">
                          WhatsApp / Contact No. <span className="text-rose-400">*</span>
                        </label>
                        <input
                          id="desk-leader-phone"
                          type="tel"
                          required
                          value={leaderPhone}
                          onChange={(e) => setLeaderPhone(e.target.value)}
                          placeholder="10-digit mobile number"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#090812] border border-white/15 text-white focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/30 focus:outline-none font-mono text-xs transition-all placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    {/* Department */}
                    <div>
                      <label htmlFor="desk-leader-branch" className="block text-slate-200 mb-1.5 font-semibold">
                        Department / Branch
                      </label>
                      <select
                        id="desk-leader-branch"
                        value={leaderBranch}
                        onChange={(e) => setLeaderBranch(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#090812] border border-white/15 text-white focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/30 focus:outline-none font-mono text-xs transition-all"
                      >
                        {BRANCH_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Teammate 2 Quick Slots */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label htmlFor="desk-member2-name" className="block text-slate-200 mb-1.5 font-semibold">
                          Teammate 2 Name (Optional)
                        </label>
                        <input
                          id="desk-member2-name"
                          type="text"
                          value={member2Name}
                          onChange={(e) => setMember2Name(e.target.value)}
                          placeholder="e.g. Priya Kumari"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#090812] border border-white/15 text-white focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/30 focus:outline-none text-xs transition-all placeholder:text-slate-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="desk-member2-roll" className="block text-slate-200 mb-1.5 font-semibold">
                          Teammate 2 Roll No.
                        </label>
                        <input
                          id="desk-member2-roll"
                          type="text"
                          value={member2Roll}
                          onChange={(e) => setMember2Roll(e.target.value)}
                          placeholder="e.g. 23105147045"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#090812] border border-white/15 text-white focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/30 focus:outline-none font-mono text-xs transition-all placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-white/10">
                      <Link
                        to={`/team-register?event=${eventId}`}
                        className="text-xs font-mono text-fuchsia-300 hover:text-white transition-colors flex items-center gap-1.5"
                      >
                        <Users className="w-3.5 h-3.5 text-fuchsia-400" />
                        <span>Need 3+ members? Full Roster Page →</span>
                      </Link>

                      <button
                        type="submit"
                        disabled={submittingTeam}
                        className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 text-white font-bold font-mono text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-60 shadow-glow-fuchsia inline-flex items-center justify-center gap-2 transition-all hover:scale-105"
                      >
                        {submittingTeam ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Confirming Squad...</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4" />
                            <span>Confirm Squad Registration</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB 2: INQUIRY / SUPPORT TICKET */}
            {activeTab === 'inquiry' && (
              <div className="p-6 sm:p-8 rounded-2xl bg-[#030106]/90 border border-emerald-500/30 shadow-[0_0_35px_rgba(16,185,129,0.08)]">
                {submittedTicket ? (
                  <div className="p-6 sm:p-8 rounded-2xl bg-[#07060e] border border-emerald-500/40 text-center space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                      <CheckCircle className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
                        TICKET LOGGED
                      </span>
                      <h3 className="text-2xl font-bold font-heading text-white">
                        Ticket #{submittedTicket.id}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-300 max-w-md mx-auto font-sans leading-relaxed">
                      Logged for <strong className="text-white">{submittedTicket.name}</strong> ({submittedTicket.email}) under{' '}
                      <span className="text-fuchsia-300 font-semibold">{submittedTicket.subject}</span>. Our student coordinator desk will review it shortly.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmittedTicket(null)}
                      className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono font-bold text-white transition-colors"
                    >
                      Submit Another Query
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-4 text-xs font-sans">
                    {inquiryError && (
                      <div
                        role="alert"
                        className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 font-mono flex items-center gap-2"
                      >
                        <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                        <span>{inquiryError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label htmlFor="inq-name" className="block text-slate-200 mb-1.5 font-semibold">
                          Your Name <span className="text-rose-400">*</span>
                        </label>
                        <input
                          id="inq-name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your Full Name"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#090812] border border-white/15 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/25 focus:outline-none transition-all placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="inq-roll" className="block text-slate-200 mb-1.5 font-semibold">
                          Roll No. (Optional)
                        </label>
                        <input
                          id="inq-roll"
                          type="text"
                          value={rollNo}
                          onChange={(e) => setRollNo(e.target.value)}
                          placeholder="e.g. 23105147042"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#090812] border border-white/15 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/25 focus:outline-none font-mono transition-all placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label htmlFor="inq-email" className="block text-slate-200 mb-1.5 font-semibold">
                          Email Address <span className="text-rose-400">*</span>
                        </label>
                        <input
                          id="inq-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="student@gecsheikhpura.ac.in"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#090812] border border-white/15 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/25 focus:outline-none transition-all placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="inq-subject" className="block text-slate-200 mb-1.5 font-semibold">
                          Query Topic
                        </label>
                        <select
                          id="inq-subject"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#090812] border border-white/15 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/25 focus:outline-none transition-all"
                        >
                          {SUBJECT_PRESETS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="inq-message" className="block text-slate-200 mb-1.5 font-semibold">
                        Message / Query Details <span className="text-rose-400">*</span>
                      </label>
                      <textarea
                        id="inq-message"
                        rows={3}
                        required
                        minLength={10}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe your question, pass issue, or team query clearly..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#090812] border border-white/15 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/25 focus:outline-none resize-none transition-all placeholder:text-slate-500"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={submittingInquiry}
                        className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold font-mono text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-60 shadow-[0_0_20px_rgba(16,185,129,0.3)] inline-flex items-center justify-center gap-2 transition-all hover:scale-105"
                      >
                        {submittingInquiry ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Sending Ticket...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Submit Support Ticket</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </section>
  );
};
