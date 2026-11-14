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
} from 'lucide-react';
import { FEST_EVENTS, type FestEvent } from '../../data/techySheikhpuraData';
import {
  ApiError,
  createInquiry,
  createTeamRegistration,
  type InquiryRecord,
  type TeamRegistrationRecord,
} from '../../services/api';

interface HelpdeskSectionProps {
  telegramUrl: string;
  contactEmail: string;
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
        setInquiryError('Unable to reach backend helpdesk right now. Reach us on Telegram or email below.');
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
      setTeamName('');
      setLeaderName('');
      setLeaderRoll('');
      setLeaderEmail('');
      setLeaderPhone('');
      setMember2Name('');
      setMember2Roll('');
    } catch (err) {
      if (err instanceof ApiError) {
        setTeamError(err.message);
      } else if (err instanceof Error) {
        setTeamError(err.message);
      } else {
        setTeamError('Unable to save team registration to backend. Please check connection.');
      }
    } finally {
      setSubmittingTeam(false);
    }
  };

  return (
    <section
      id="contact"
      className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative z-10 scroll-mt-28"
    >
      <div className="rounded-3xl bg-[#0b0b11]/90 border border-emerald-500/30 hover:border-emerald-500/40 glass-card p-6 sm:p-10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start transition-all">
        {/* Left Copy */}
        <div className="lg:col-span-5 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/35 text-emerald-300 font-mono text-[11px] font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Desk Open • Registration &amp; Student Support</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black font-display text-white leading-tight">
            Desk Open: <span className="text-gradient-techverse">Team Registration</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            The organizer desk is live! Register your squad for HackArena, RoboWar, Drone Derby, BGMI Esports, or submit inquiries. Every registration is stored directly in the TechySheikhpura SQLite database.
          </p>

          {/* Quick Dedicated Team Portal Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-fuchsia-950/40 via-purple-950/30 to-[#050308] border border-fuchsia-500/35 space-y-2">
            <div className="flex items-center gap-2 text-fuchsia-300 font-mono text-xs font-bold">
              <Sparkles className="w-4 h-4 text-fuchsia-400" />
              <span>Full Squad Roster Portal</span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans">
              Have 3 to 6 team members or custom problem statements? Use our dedicated full-screen team registration portal.
            </p>
            <Link
              to="/team-register"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-fuchsia-300 hover:text-white pt-1 transition-colors"
            >
              <span>Open Dedicated Team Page</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 pt-1 text-xs font-mono">
            <div className="p-3.5 rounded-2xl bg-[#050308] border border-white/10 hover:border-emerald-500/35 transition-colors">
              <span className="text-[10px] text-slate-400 uppercase block">Official Support Email</span>
              <a
                href={`mailto:${contactEmail}`}
                className="text-emerald-400 hover:text-white font-bold transition-colors"
              >
                {contactEmail}
              </a>
            </div>
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-500/10 border border-sky-400/25 text-sky-300 hover:bg-sky-500/15 transition-colors"
            >
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Instant Updates Channel</span>
                <strong className="text-xs font-bold text-white">Join GEC Sheikhpura Telegram</strong>
              </div>
              <ArrowUpRight className="w-4 h-4 shrink-0" />
            </a>
          </div>
        </div>

        {/* Right Form & Tab Switcher */}
        <div className="lg:col-span-7 space-y-4">
          {/* Desk Switcher Tabs */}
          <div className="flex rounded-2xl bg-[#050308] p-1.5 border border-white/15 gap-1 text-xs font-mono font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('team-reg')}
              className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === 'team-reg'
                  ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-glow-fuchsia'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Team Registration (Desk Open)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('inquiry')}
              className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === 'inquiry'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/35'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Ask Support Query</span>
            </button>
          </div>

          {/* TAB 1: TEAM REGISTRATION AT DESK */}
          {activeTab === 'team-reg' && (
            <div>
              {submittedTeam ? (
                <div className="p-6 sm:p-8 rounded-2xl bg-[#050308] border border-emerald-500/40 text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold font-heading text-white">
                    Team Registered — {submittedTeam.teamId}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Squad <strong>{submittedTeam.teamName}</strong> recorded under{' '}
                    <span className="text-fuchsia-300">{submittedTeam.eventTitle}</span> for leader{' '}
                    <strong>{submittedTeam.leaderName}</strong> ({submittedTeam.leaderRoll}). Saved directly in SQLite Desk queue!
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <Link
                      to="/team-register"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-xs font-mono font-bold text-white transition-transform hover:scale-105"
                    >
                      View Team Details &amp; Pass
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSubmittedTeam(null)}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono font-bold text-white transition-colors"
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
                      className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 font-mono flex items-center gap-2"
                    >
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>{teamError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="desk-event" className="block text-slate-300 mb-1 font-medium">
                        Target Event <span className="text-rose-400">*</span>
                      </label>
                      <select
                        id="desk-event"
                        value={eventId}
                        onChange={(e) => setEventId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none font-mono text-xs"
                      >
                        {FEST_EVENTS.map((ev) => (
                          <option key={ev.id} value={ev.id}>
                            {ev.title} ({ev.teamSize})
                          </option>
                        ))}
                      </select>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                        Team Size: <strong className="text-fuchsia-300">{selectedEvent.teamSize}</strong>
                      </span>
                    </div>

                    <div>
                      <label htmlFor="desk-team-name" className="block text-slate-300 mb-1 font-medium">
                        Team Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        id="desk-team-name"
                        type="text"
                        required
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="e.g. CyberKnights, Squad Alpha"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003]/85 border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none font-mono text-xs transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="desk-leader-name" className="block text-slate-300 mb-1 font-medium">
                        Team Leader Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        id="desk-leader-name"
                        type="text"
                        required
                        value={leaderName}
                        onChange={(e) => setLeaderName(e.target.value)}
                        placeholder="e.g. Aditya Raj"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003]/85 border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none text-xs transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="desk-leader-roll" className="block text-slate-300 mb-1 font-medium">
                        Leader Roll No. <span className="text-rose-400">*</span>
                      </label>
                      <input
                        id="desk-leader-roll"
                        type="text"
                        required
                        value={leaderRoll}
                        onChange={(e) => setLeaderRoll(e.target.value)}
                        placeholder="e.g. 23105147042"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003]/85 border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none font-mono text-xs transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="desk-leader-email" className="block text-slate-300 mb-1 font-medium">
                        Leader Email <span className="text-rose-400">*</span>
                      </label>
                      <input
                        id="desk-leader-email"
                        type="email"
                        required
                        value={leaderEmail}
                        onChange={(e) => setLeaderEmail(e.target.value)}
                        placeholder="student@gecsheikhpura.ac.in"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003]/85 border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none font-mono text-xs transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="desk-leader-phone" className="block text-slate-300 mb-1 font-medium">
                        WhatsApp / Mobile <span className="text-rose-400">*</span>
                      </label>
                      <input
                        id="desk-leader-phone"
                        type="tel"
                        required
                        value={leaderPhone}
                        onChange={(e) => setLeaderPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003]/85 border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none font-mono text-xs transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="desk-leader-branch" className="block text-slate-300 mb-1 font-medium">
                      Leader Department / Branch
                    </label>
                    <select
                      id="desk-leader-branch"
                      value={leaderBranch}
                      onChange={(e) => setLeaderBranch(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none font-mono text-xs"
                    >
                      {BRANCH_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="desk-member2-name" className="block text-slate-300 mb-1 font-medium">
                        Teammate 2 Name (Optional)
                      </label>
                      <input
                        id="desk-member2-name"
                        type="text"
                        value={member2Name}
                        onChange={(e) => setMember2Name(e.target.value)}
                        placeholder="e.g. Priya Kumari"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003]/85 border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none text-xs transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="desk-member2-roll" className="block text-slate-300 mb-1 font-medium">
                        Teammate 2 Roll No.
                      </label>
                      <input
                        id="desk-member2-roll"
                        type="text"
                        value={member2Roll}
                        onChange={(e) => setMember2Roll(e.target.value)}
                        placeholder="e.g. 23105147045"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003]/85 border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none font-mono text-xs transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <Link
                      to={`/team-register?event=${eventId}`}
                      className="text-[11px] font-mono text-fuchsia-300 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <span>Need more team members? Full Roster Page →</span>
                    </Link>

                    <button
                      type="submit"
                      disabled={submittingTeam}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 text-white font-bold font-mono text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-60 shadow-glow-fuchsia inline-flex items-center justify-center gap-2 transition-all hover:scale-105"
                    >
                      {submittingTeam ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving to SQLite Desk...</span>
                        </>
                      ) : (
                        <>
                          <Users className="w-4 h-4" />
                          <span>Register Squad at Desk</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: INQUIRY / SUPPORT FORM */}
          {activeTab === 'inquiry' && (
            <div>
              {submittedTicket ? (
                <div className="p-6 sm:p-8 rounded-2xl bg-[#050308] border border-emerald-500/40 text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold font-heading text-white">
                    Query Logged — Ticket #{submittedTicket.id}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Saved for <strong>{submittedTicket.name}</strong> ({submittedTicket.email}) under{' '}
                    <span className="text-fuchsia-300">{submittedTicket.subject}</span>. Our coordinator desk will review it shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmittedTicket(null)}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono font-bold text-white transition-colors"
                  >
                    Submit Another Query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4 text-xs font-sans">
                  {inquiryError && (
                    <div
                      role="alert"
                      className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 font-mono flex items-center gap-2"
                    >
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>{inquiryError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="inq-name" className="block text-slate-300 mb-1 font-medium">
                        Your Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        id="inq-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Aditya Raj"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003]/85 border border-white/15 text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/25 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="inq-roll" className="block text-slate-300 mb-1 font-medium">
                        Roll No. (Optional)
                      </label>
                      <input
                        id="inq-roll"
                        type="text"
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                        placeholder="e.g. 23105147042"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003]/85 border border-white/15 text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/25 focus:outline-none font-mono transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="inq-email" className="block text-slate-300 mb-1 font-medium">
                        Email Address <span className="text-rose-400">*</span>
                      </label>
                      <input
                        id="inq-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@gecsheikhpura.ac.in"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003]/85 border border-white/15 text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/25 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="inq-subject" className="block text-slate-300 mb-1 font-medium">
                        Topic / Desk
                      </label>
                      <select
                        id="inq-subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003] border border-white/15 text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/25 focus:outline-none transition-all"
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
                    <label htmlFor="inq-message" className="block text-slate-300 mb-1 font-medium">
                      Message <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      id="inq-message"
                      rows={3}
                      required
                      minLength={10}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your question or team update clearly..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003]/85 border border-white/15 text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/25 focus:outline-none resize-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingInquiry}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold font-mono text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-60 inline-flex items-center justify-center gap-2 transition-all"
                  >
                    {submittingInquiry ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending to Desk...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Support Ticket</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
