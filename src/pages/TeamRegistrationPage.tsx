import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Users,
  UserPlus,
  Trash2,
  CheckCircle,
  Loader2,
  ShieldAlert,
  Printer,
  Sparkles,
  Ticket,
} from 'lucide-react';
import { FEST_EVENTS, FEST_INFO, type FestEvent } from '../data/techySheikhpuraData';
import {
  ApiError,
  createTeamRegistration,
  type TeamMember,
  type TeamRegistrationRecord,
} from '../services/api';
import { DelegateQrSvg } from '../components/techy/DelegateQrSvg';
import { TechyLogo } from '../components/techy/TechyLogo';

const BRANCH_OPTIONS = [
  'Computer Science & Engineering (CSE)',
  'Civil Engineering (CE)',
  'Electrical Engineering (EE)',
  'Electronics & Communication (ECE)',
  'Mechanical Engineering (ME)',
];

const YEAR_OPTIONS = [
  '1st Year (2026-30)',
  '2nd Year (2025-29)',
  '3rd Year (2024-28)',
  '4th Year (2023-27)',
];

export const TeamRegistrationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const paramEvent = searchParams.get('event');
  const validParamEvent = paramEvent && FEST_EVENTS.some((e) => e.id === paramEvent) ? paramEvent : null;
  const [userSelectedEventId, setUserSelectedEventId] = useState<string | null>(null);
  const selectedEventId = userSelectedEventId ?? (validParamEvent || 'hackarena');

  const [teamName, setTeamName] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [notes, setNotes] = useState('');

  // Leader State
  const [leaderName, setLeaderName] = useState('');
  const [leaderRoll, setLeaderRoll] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [branch, setBranch] = useState(BRANCH_OPTIONS[0]);
  const [year, setYear] = useState(YEAR_OPTIONS[2]);

  // Dynamic Members State (starts with 1 member row for team events)
  const [members, setMembers] = useState<TeamMember[]>([
    { name: '', rollNo: '', branch: BRANCH_OPTIONS[0] },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  const [confirmedTeam, setConfirmedTeam] = useState<TeamRegistrationRecord | null>(null);

  const currentEvent: FestEvent =
    FEST_EVENTS.find((e) => e.id === selectedEventId) || FEST_EVENTS[0];

  const handleAddMember = () => {
    if (members.length >= 5) {
      setError('A team can have a maximum of 6 members (1 leader + 5 members).');
      return;
    }
    setError(null);
    setMembers([
      ...members,
      { name: '', rollNo: '', branch: branch || BRANCH_OPTIONS[0] },
    ]);
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, idx) => idx !== index));
  };

  const handleMemberChange = (
    index: number,
    field: keyof TeamMember,
    value: string
  ) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#10b981', '#38bdf8', '#ffffff'],
      });
    } catch {
      // Ignore if canvas unavailable
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDuplicateId(null);

    // Validate Leader
    if (
      !teamName.trim() ||
      !leaderName.trim() ||
      !leaderRoll.trim() ||
      !leaderEmail.trim() ||
      !leaderPhone.trim()
    ) {
      setError('Please provide team name and all required leader details.');
      return;
    }

    const cleanPhoneDigits = leaderPhone.replace(/\D/g, '');
    if (cleanPhoneDigits.length < 10) {
      setError('Leader WhatsApp/Phone must contain at least 10 digits.');
      return;
    }

    // Filter valid members
    const validMembers: TeamMember[] = members
      .map((m) => ({
        name: m.name.trim(),
        rollNo: m.rollNo.trim().toUpperCase(),
        branch: m.branch?.trim() || branch,
        phone: m.phone?.trim() || undefined,
      }))
      .filter((m) => m.name.length > 0 && m.rollNo.length > 0);

    setSubmitting(true);

    try {
      const response = await createTeamRegistration({
        teamName: teamName.trim(),
        eventId: selectedEventId,
        leaderName: leaderName.trim(),
        leaderRoll: leaderRoll.trim().toUpperCase(),
        leaderEmail: leaderEmail.trim().toLowerCase(),
        leaderPhone: leaderPhone.trim(),
        branch,
        year,
        members: validMembers,
        projectTitle: projectTitle.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setConfirmedTeam(response.teamRegistration);
      triggerCelebration();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status === 409 && err.existingRegId) {
          setDuplicateId(err.existingRegId);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to submit team registration. Please check network connection.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setConfirmedTeam(null);
    setTeamName('');
    setProjectTitle('');
    setNotes('');
    setLeaderName('');
    setLeaderRoll('');
    setLeaderEmail('');
    setLeaderPhone('');
    setMembers([{ name: '', rollNo: '', branch: BRANCH_OPTIONS[0] }]);
    setError(null);
    setDuplicateId(null);
  };

  return (
    <div className="min-h-screen bg-[#020003] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-fuchsia-600/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute top-1/3 left-10 w-80 h-80 bg-purple-600/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-600/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        {/* Navigation Bar Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/#events"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-300 hover:text-white px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-fuchsia-400" />
            <span>Back to Fest Home</span>
          </Link>

          <Link
            to="/admin"
            className="text-xs font-mono text-slate-400 hover:text-fuchsia-300 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 transition-colors"
          >
            Organizer Desk Console →
          </Link>
        </div>

        {/* Page Banner Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/35 text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Desk Open • Official Team Registration</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight">
            Register Your <span className="text-gradient-techverse">Squad &amp; Team</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-sans leading-relaxed">
            Register your team for HackArena 24H, Track-O-Bot, AeroStrike Drone Derby, BGMI Esports, or any intra-college flagship event. Your squad details are instantly recorded in the SQLite Desk database.
          </p>
        </div>

        {confirmedTeam ? (
          /* Confirmation Pass Card */
          <div className="p-6 sm:p-10 rounded-3xl bg-[#0b0b11] border border-emerald-500/40 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold font-display text-white">
                Team Registration Confirmed!
              </h2>
              <p className="text-xs font-mono text-emerald-300">
                Team ID: <strong className="text-white text-sm">{confirmedTeam.teamId}</strong> • Stored in Live SQLite Desk
              </p>
            </div>

            {/* Official Holographic Team Pass Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#050308] via-[#0d0714] to-[#050308] border border-fuchsia-500/35 space-y-5 shadow-inner">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <TechyLogo size={42} glow={true} />
                  <div>
                    <span className="text-[10px] font-mono uppercase text-fuchsia-400 tracking-wider block font-bold">
                      {FEST_INFO.name} Delegate Team Pass
                    </span>
                    <strong className="text-lg font-bold font-display text-white">
                      {confirmedTeam.teamName}
                    </strong>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white border border-white/20">
                  <DelegateQrSvg
                    seedText={confirmedTeam.teamId}
                    label={`Team Pass QR: ${confirmedTeam.teamId}`}
                    className="w-16 h-16"
                  />
                </div>
              </div>

              {/* Event & Logistics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[#020003]/80 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase block">Event Track</span>
                  <strong className="text-fuchsia-300 font-bold block">{confirmedTeam.eventTitle}</strong>
                </div>

                <div className="p-3 rounded-xl bg-[#020003]/80 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase block">Team Leader</span>
                  <strong className="text-white font-bold block">{confirmedTeam.leaderName}</strong>
                  <span className="text-[11px] text-slate-400">{confirmedTeam.leaderRoll}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#020003]/80 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase block">Total Roster</span>
                  <strong className="text-emerald-400 font-bold block">
                    {confirmedTeam.members.length + 1} Squad Members
                  </strong>
                  <span className="text-[11px] text-slate-400">{confirmedTeam.branch}</span>
                </div>
              </div>

              {/* Members Roster */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
                  Registered Squad Members:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-between">
                    <div>
                      <strong className="text-white block">{confirmedTeam.leaderName} (Leader)</strong>
                      <span className="text-[10px] text-slate-400">{confirmedTeam.leaderRoll} • {confirmedTeam.branch}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-fuchsia-500/20 text-fuchsia-300 font-bold">
                      Leader
                    </span>
                  </div>

                  {confirmedTeam.members.map((m, idx) => (
                    <div
                      key={`${m.rollNo}-${idx}`}
                      className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between"
                    >
                      <div>
                        <strong className="text-white block">{m.name}</strong>
                        <span className="text-[10px] text-slate-400">
                          {m.rollNo} • {m.branch || confirmedTeam.branch}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-slate-300">
                        Member #{idx + 2}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {confirmedTeam.projectTitle && (
                <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-xs font-mono">
                  <span className="text-[10px] text-slate-400 uppercase block">Project / Submission Title</span>
                  <span className="text-white font-semibold">{confirmedTeam.projectTitle}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold inline-flex items-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Team Card</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 text-white font-bold inline-flex items-center gap-2 transition-transform hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                <span>Register Another Team</span>
              </button>
            </div>
          </div>
        ) : (
          /* Team Registration Form */
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-[#0b0b11]/90 border border-fuchsia-500/30 p-6 sm:p-10 shadow-2xl space-y-8 backdrop-blur-xl"
          >
            {error && (
              <div
                role="alert"
                className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 font-mono text-xs flex items-start gap-3"
              >
                <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block font-bold">Registration Alert</strong>
                  <p>{error}</p>
                  {duplicateId && (
                    <span className="block text-[11px] text-amber-300">
                      Existing Registration ID: <strong>{duplicateId}</strong>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Section 1: Event Selection & Team Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <Ticket className="w-4 h-4 text-fuchsia-400" />
                <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-fuchsia-300">
                  Step 1: Event &amp; Team Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <label htmlFor="team-event" className="block text-slate-300 mb-1.5 font-medium">
                    Choose Fest Event <span className="text-rose-400">*</span>
                  </label>
                  <select
                    id="team-event"
                    value={selectedEventId}
                    onChange={(e) => setUserSelectedEventId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none font-mono"
                  >
                    {FEST_EVENTS.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({ev.category}) — {ev.teamSize}
                      </option>
                    ))}
                  </select>
                  <div className="mt-1.5 flex items-center gap-3 text-[11px] font-mono text-slate-400">
                    <span>Team: <strong className="text-fuchsia-300">{currentEvent.teamSize}</strong></span>
                    <span>Fee: <strong className="text-emerald-400">{currentEvent.entryFee}</strong></span>
                  </div>
                </div>

                <div>
                  <label htmlFor="team-name" className="block text-slate-300 mb-1.5 font-medium">
                    Team / Squad Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="team-name"
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. CyberKnights, Squad Alpha, RoboRiders"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                    Give your team a unique name for scoreboards and desk logs.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <label htmlFor="project-title" className="block text-slate-300 mb-1.5 font-medium">
                    Project / Problem Idea (Optional)
                  </label>
                  <input
                    id="project-title"
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g. Smart IoT Grid, Autonomous Obstacle Rover"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="team-notes" className="block text-slate-300 mb-1.5 font-medium">
                    Special Equipment / Desk Notes (Optional)
                  </label>
                  <input
                    id="team-notes"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. 2 power extension sockets required, BGMI In-Game IDs"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Team Leader Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-emerald-300">
                  Step 2: Team Leader Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <label htmlFor="leader-name" className="block text-slate-300 mb-1.5 font-medium">
                    Leader Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="leader-name"
                    type="text"
                    required
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    placeholder="e.g. Aryan Raj"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003] border border-white/15 text-white focus:border-emerald-400 focus:outline-none font-sans"
                  />
                </div>

                <div>
                  <label htmlFor="leader-roll" className="block text-slate-300 mb-1.5 font-medium">
                    Leader College Roll No. <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="leader-roll"
                    type="text"
                    required
                    value={leaderRoll}
                    onChange={(e) => setLeaderRoll(e.target.value)}
                    placeholder="e.g. 23105147012"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003] border border-white/15 text-white focus:border-emerald-400 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <label htmlFor="leader-email" className="block text-slate-300 mb-1.5 font-medium">
                    Leader Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="leader-email"
                    type="email"
                    required
                    value={leaderEmail}
                    onChange={(e) => setLeaderEmail(e.target.value)}
                    placeholder="student@gecsheikhpura.ac.in"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003] border border-white/15 text-white focus:border-emerald-400 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="leader-phone" className="block text-slate-300 mb-1.5 font-medium">
                    WhatsApp / Mobile Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="leader-phone"
                    type="tel"
                    required
                    value={leaderPhone}
                    onChange={(e) => setLeaderPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003] border border-white/15 text-white focus:border-emerald-400 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <label htmlFor="leader-branch" className="block text-slate-300 mb-1.5 font-medium">
                    Department / Branch <span className="text-rose-400">*</span>
                  </label>
                  <select
                    id="leader-branch"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003] border border-white/15 text-white focus:border-emerald-400 focus:outline-none font-mono"
                  >
                    {BRANCH_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="leader-year" className="block text-slate-300 mb-1.5 font-medium">
                    Current Academic Year <span className="text-rose-400">*</span>
                  </label>
                  <select
                    id="leader-year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003] border border-white/15 text-white focus:border-emerald-400 focus:outline-none font-mono"
                  >
                    {YEAR_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Additional Team Members */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-sky-400" />
                  <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-sky-300">
                    Step 3: Team Members Roster ({members.length} added)
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleAddMember}
                  className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/35 text-sky-300 font-mono text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Member</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 font-mono">
                Add each team member's name and college roll number. For solo events, leave this empty.
              </p>

              {members.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#050308] border border-white/10 text-center font-mono text-xs text-slate-400">
                  No additional members added yet. Click &quot;Add Member&quot; above to include your teammates.
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((member, index) => (
                    <div
                      key={`member-row-${index}`}
                      className="p-4 rounded-2xl bg-[#050308] border border-white/10 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
                    >
                      <div className="sm:col-span-4">
                        <label className="block text-[11px] text-slate-300 mb-1 font-medium font-sans">
                          Member #{index + 2} Full Name
                        </label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                          placeholder="e.g. Rohan Gupta"
                          className="w-full px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white text-xs focus:border-sky-400 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] text-slate-300 mb-1 font-medium font-sans">
                          Roll No.
                        </label>
                        <input
                          type="text"
                          value={member.rollNo}
                          onChange={(e) => handleMemberChange(index, 'rollNo', e.target.value)}
                          placeholder="e.g. 23105147018"
                          className="w-full px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white text-xs font-mono focus:border-sky-400 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[11px] text-slate-300 mb-1 font-medium font-sans">
                          Branch
                        </label>
                        <select
                          value={member.branch || branch}
                          onChange={(e) => handleMemberChange(index, 'branch', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white text-xs font-mono focus:border-sky-400 focus:outline-none"
                        >
                          {BRANCH_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(index)}
                          aria-label={`Remove member ${index + 2}`}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Action Button */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-mono text-slate-400">
                Squad size: <strong className="text-white">{members.length + 1} students</strong> recorded under{' '}
                <strong className="text-fuchsia-300">{currentEvent.title}</strong>
              </span>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 text-white font-bold font-mono text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-60 shadow-glow-fuchsia inline-flex items-center justify-center gap-2 transition-all hover:scale-105"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to SQLite Desk...</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span>Confirm &amp; Register Squad</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TeamRegistrationPage;
