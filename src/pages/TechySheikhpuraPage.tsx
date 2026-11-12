import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  MapPin,
  Award,
  Clock,
  Ticket,
  CheckCircle2,
  Code2,
  Bot,
  Plane,
  Gamepad2,
  ChevronDown,
  Volume2,
  VolumeX,
  Flame,
  Radio,
  Search
} from 'lucide-react';
import {
  FEST_INFO,
  FEST_EVENTS,
  FEST_PASSES,
  FEST_SCHEDULE,
  FEST_FAQS,
  type FestEvent
} from '../data/techySheikhpuraData';

interface AudioContextWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}
import { CountdownTimer } from '../components/techy/CountdownTimer';
import { TechyNavbar } from '../components/techy/TechyNavbar';
import { TechyFooter } from '../components/techy/TechyFooter';
import { PassBookingModal } from '../components/techy/PassBookingModal';
import { EventDetailModal } from '../components/techy/EventDetailModal';

export const TechySheikhpuraPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<'Day 1' | 'Day 2'>('Day 1');
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [selectedPassId, setSelectedPassId] = useState<string>('all-events-pass');
  const [activeEventForModal, setActiveEventForModal] = useState<FestEvent | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTickerIndex, setActiveTickerIndex] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Live registration activity stream ticker
  const activityStream = [
    { name: "Aman Kumar", branch: "CSE 3rd Yr", action: "booked All-Events Pass (₹149)", time: "2m ago" },
    { name: "Team CyberKnights", branch: "CSE 2nd Yr", action: "registered for HackArena (24H)", time: "4m ago" },
    { name: "Rohan Patel", branch: "Mechanical", action: "registered for AeroStrike Drone Derby", time: "7m ago" },
    { name: "Priya Sharma", branch: "EE 3rd Yr", action: "registered for Track-O-Bot", time: "11m ago" },
    { name: "Squad AlphaX", branch: "Civil & CSE", action: "booked BGMI Esports Battle (₹29)", time: "15m ago" },
    { name: "Vikash Gupta", branch: "ECE 4th Yr", action: "booked VIP All-Access Pass (₹199)", time: "18m ago" },
  ];

  // Mouse spotlight glow tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Cycle activity ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTickerIndex((prev) => (prev + 1) % activityStream.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [activityStream.length]);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  // Support scrolling to hash sections when routed from 404 or direct anchor links
  useEffect(() => {
    if (window.location.hash) {
      const targetEl = document.querySelector(window.location.hash);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  const eventCategories = [
    'All',
    'Coding',
    'Robotics',
    'Aero & Drone',
    'Esports',
    'Startup & Pitch',
    'Mechanical & Civil',
    'Fun & Brain',
  ];

  // Filter events by category AND search query
  const filteredEvents = FEST_EVENTS.filter((ev) => {
    const matchesCategory = selectedCategory === 'All' || ev.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      ev.title.toLowerCase().includes(query) ||
      ev.tagline.toLowerCase().includes(query) ||
      ev.category.toLowerCase().includes(query) ||
      ev.description.toLowerCase().includes(query) ||
      ev.venue.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const filteredSchedule = FEST_SCHEDULE.filter(s => s.day === selectedDay);

  const handleOpenPass = (passId?: string) => {
    if (passId) setSelectedPassId(passId);
    setPassModalOpen(true);
  };

  const playClickSound = (forceEnable?: boolean) => {
    if (!forceEnable && !soundEnabled) return;
    try {
      const audioWindow = window as AudioContextWindow;
      const AudioCtor = window.AudioContext || audioWindow.webkitAudioContext;
      if (!AudioCtor) return;

      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtor();
      }
      const audioCtx = audioCtxRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1250, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch {
      // Audio playback blocked by browser autoplay policy
    }
  };

  return (
    <div className="relative min-h-screen bg-[#020003] text-white font-sans selection:bg-fuchsia-500/30 selection:text-white overflow-x-hidden">
      
      {/* Dynamic Cursor Ambient Glow Spotlight (TechVerse Style) */}
      <div 
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 hidden md:block"
        style={{
          background: `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(212, 93, 140, 0.09), transparent 80%)`
        }}
      />

      {/* Floating Sound FX Toggle Button */}
      <button
        type="button"
        onClick={() => {
          const nextState = !soundEnabled;
          setSoundEnabled(nextState);
          if (nextState) playClickSound(true);
        }}
        className="fixed bottom-6 right-6 z-40 p-3 rounded-2xl bg-black/70 border border-white/20 text-white hover:text-fuchsia-300 shadow-xl backdrop-blur-xl transition-all hover:scale-110 flex items-center gap-2 text-xs font-mono"
        title="Toggle Audio Effects"
        aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
      >
        {soundEnabled ? (
          <>
            <Volume2 className="w-4 h-4 text-fuchsia-400 animate-pulse" />
            <span className="hidden sm:inline text-[10px] uppercase font-bold text-fuchsia-300">
              AUDIO FX ON
            </span>
          </>
        ) : (
          <>
            <VolumeX className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline text-[10px] uppercase font-bold text-slate-400">
              AUDIO FX OFF
            </span>
          </>
        )}
      </button>

      {/* Navigation */}
      <TechyNavbar onOpenPassModal={() => { playClickSound(); handleOpenPass('all-events-pass'); }} />

      {/* =========================================================================
          HERO SECTION (USING GEC SHEIKHPURA CAMPUS PHOTO + TECHVERSE DARK VOID)
          ========================================================================= */}
      <section 
        id="hero"
        className="relative min-h-[96vh] flex items-center justify-center pt-14 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        {/* Background Image: Uploaded GEC Sheikhpura Administrative Block */}
        <div className="absolute inset-0 z-0">
          <img
            src="/gecs-campus.jpg"
            alt="Government Engineering College Sheikhpura - Administrative Block"
            className="w-full h-full object-cover filter brightness-[0.32] contrast-125 scale-105"
          />
          {/* TechVerse Dark Void & Ambient Radial Lighting Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020003] via-[#020003]/80 to-[#020003]/60"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,93,140,0.25)_0%,rgba(168,85,247,0.15)_40%,transparent_75%)]"></div>
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#020003] to-transparent"></div>
        </div>

        {/* Ambient Subtle Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-fuchsia-600/10 blur-[170px] rounded-full pointer-events-none z-[1]"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-600/15 blur-[130px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-600/15 blur-[140px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto w-full relative z-10 text-center flex flex-col items-center justify-center space-y-6">
          
          {/* Institution Presenter Pill */}
          <div>
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-black/60 backdrop-blur-2xl border border-white/25 text-white/90 font-mono text-xs font-bold uppercase tracking-widest">
              <Radio className="w-3.5 h-3.5 text-fuchsia-400 animate-spin" />
              <span>{FEST_INFO.collegeName.toUpperCase()} PRESENTS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
          </div>

          {/* Grand Main Title (Centered & Highly Prominent) */}
          <div className="text-center space-y-3 w-full">
            <h1 className="font-display font-black tracking-tight text-white leading-none drop-shadow-[0_0_45px_rgba(255,255,255,0.4)]">
              <span className="block text-5xl sm:text-7xl md:text-8xl lg:text-[6.8rem] text-white">
                Techy <span className="text-gradient-techverse">Sheikhpura</span>
              </span>
              <span className="inline-block mt-3 text-3xl sm:text-5xl md:text-6xl font-extrabold text-fuchsia-400 tracking-[0.2em] drop-shadow-[0_0_30px_rgba(212,93,140,0.85)]">
                '26
              </span>
            </h1>

            {/* Glowing Tagline */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-fuchsia-400"></span>
              <p className="text-base sm:text-2xl font-display text-white font-bold tracking-[0.14em] uppercase">
                {FEST_INFO.tagline}
              </p>
              <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-fuchsia-400"></span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed font-sans pt-1">
              The flagship intra-college techno-cultural festival of <strong>Government Engineering College, Sheikhpura</strong>. Featuring 14+ events across 24H hackathons, autonomous robotics, drone derbies, BGMI & Free Fire esports, and startup innovation.
            </p>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-[10px] text-white/80 pt-2">
              <span className="px-3 py-1 rounded-full bg-black/60 border border-white/15">
                LOC: 25.1322° N, 85.8488° E • MEHUS, SHEIKHPURA
              </span>
              <span className="px-3 py-1 rounded-full bg-black/60 border border-white/15 text-emerald-400 font-bold">
                SYSTEM STATUS: REGISTRATIONS OPEN
              </span>
            </div>
          </div>

          {/* Live Countdown Timer (Centered) */}
          <div className="pt-2 flex justify-center w-full">
            <CountdownTimer />
          </div>

          {/* Action CTAs (Centered) */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 font-mono">
            <a
              href="#events"
              onClick={() => playClickSound()}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 text-white font-black text-xs uppercase tracking-wider hover:opacity-95 shadow-glow-fuchsia flex items-center gap-2.5 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Explore 14+ Events</span>
            </a>

            <button
              type="button"
              onClick={() => { playClickSound(); handleOpenPass('all-events-pass'); }}
              className="px-8 py-4 rounded-xl bg-black/60 hover:bg-black/90 text-white border border-white/30 hover:border-white/60 font-black text-xs uppercase tracking-wider transition-all hover:scale-105 flex items-center gap-2.5 backdrop-blur-md shadow-2xl"
            >
              <Ticket className="w-4 h-4 text-fuchsia-400" />
              <span>Get Fest Pass (₹149 / ₹29)</span>
            </button>

            <a
              href="#schedule"
              onClick={() => playClickSound()}
              className="px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-fuchsia-400" />
              <span>Schedule</span>
            </a>
          </div>

          {/* Live Activity Toast Banner (Centered) */}
          <div className="pt-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-white/20 text-xs font-mono backdrop-blur-xl shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-slate-400 font-bold uppercase text-[10px]">LIVE REGISTRATION:</span>
              <span className="text-fuchsia-300 font-semibold text-[11px]">
                {activityStream[activeTickerIndex].name} ({activityStream[activeTickerIndex].branch}) {activityStream[activeTickerIndex].action}
              </span>
            </div>
          </div>

          {/* Quick Stats Grid (Centered) */}
          <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto w-full">
            {FEST_INFO.stats.map((stat, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl bg-[#0b0b11]/85 backdrop-blur-2xl border border-white/10 glass-card"
              >
                <div className="text-2xl sm:text-3xl font-black font-display text-gradient-techverse">
                  {stat.value}
                </div>
                <span className="text-[11px] font-mono uppercase text-slate-400 font-bold tracking-wider">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          CONTINUOUS GLOWING MARQUEE TICKER (EXACT TECHVERSE FORMAT)
          ========================================================================= */}
      <div className="relative py-3.5 bg-[#050308] border-y border-white/10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-[#020003] via-transparent to-[#020003] z-10 pointer-events-none"></div>
        <div className="flex whitespace-nowrap animate-marquee font-mono text-xs font-bold text-white/90 tracking-wider">
          {[0, 1].map((dupIdx) => (
            <div key={dupIdx} aria-hidden={dupIdx === 1} className="flex items-center shrink-0">
              <span className="mx-4 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" /> HACKARENA: 24-HOUR CODE SPRINT
              </span>
              <span className="mx-4 text-slate-600">•</span>
              <span className="mx-4 flex items-center gap-2">
                <Bot className="w-4 h-4 text-fuchsia-400" /> TRACK-O-BOT: AUTONOMOUS LINE FOLLOWING
              </span>
              <span className="mx-4 text-slate-600">•</span>
              <span className="mx-4 flex items-center gap-2">
                <Plane className="w-4 h-4 text-blue-400" /> AEROSTRIKE: DRONE OBSTACLE DERBY
              </span>
              <span className="mx-4 text-slate-600">•</span>
              <span className="mx-4 flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-emerald-400" /> ESPORTS: BGMI &amp; FREE FIRE SQUAD BATTLE
              </span>
              <span className="mx-4 text-slate-600">•</span>
              <span className="mx-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" /> PRO-TO-PITCH: STARTUP ARENA
              </span>
              <span className="mx-4 text-slate-600">•</span>
              <span className="mx-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" /> ₹75,000+ CASH REWARDS POOL
              </span>
              <span className="mx-4 text-slate-600">•</span>
              <span className="mx-4 text-white">
                GOVERNMENT ENGINEERING COLLEGE, SHEIKHPURA
              </span>
              <span className="mx-4 text-slate-600">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: ABOUT TECHYSHEIKHPURA '26
          ========================================================================= */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Visual: Actual GEC Sheikhpura Building Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl group">
              <img
                src="/gecs-campus.jpg"
                alt="GEC Sheikhpura Campus Administrative Block"
                className="w-full h-[460px] object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95 contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020003] via-[#020003]/30 to-transparent"></div>

              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/20 shadow-2xl">
                <span className="text-[10px] font-mono text-fuchsia-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse"></span>
                  FEST HEADQUARTERS
                </span>
                <h4 className="text-sm font-bold text-white font-display mt-0.5">
                  Government Engineering College, Sheikhpura
                </h4>
                <p className="text-[11px] text-slate-300 font-mono">
                  Administrative Block & Central Laboratories • NH-333A
                </p>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-fuchsia-400 font-mono text-xs font-bold uppercase tracking-wider">
              About The Fest
            </div>

            <h2 className="text-3xl sm:text-5xl font-black font-display text-white leading-tight">
              A Platform Where <br />
              <span className="text-gradient-techverse">Curiosity Meets Engineering.</span>
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              <strong>TechySheikhpura '26</strong> is the official annual intra-college techno-cultural and innovation festival of <strong>Government Engineering College, Sheikhpura (GEC Sheikhpura)</strong>. 
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Designed as a launchpad for future engineers, TechySheikhpura enables students across all engineering departments (CSE, ECE, EE, Civil, and Mechanical) to break free from routine textbooks, construct working autonomous hardware, deploy production software code, pilot drones, pitch startup ideas, and showcase their talents.
            </p>

            {/* 4 Core Pillars */}
            <div className="grid grid-cols-2 gap-4 pt-2 font-mono">
              <div className="p-4 rounded-2xl bg-[#0b0b11]/85 border border-white/10 hover:border-fuchsia-400/40 transition-colors">
                <Code2 className="w-5 h-5 text-fuchsia-400 mb-1" />
                <h4 className="text-xs font-bold text-white uppercase">Code & Deploy</h4>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">24-Hour hackathon and keyboard speed typing.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0b0b11]/85 border border-white/10 hover:border-purple-400/40 transition-colors">
                <Bot className="w-5 h-5 text-purple-400 mb-1" />
                <h4 className="text-xs font-bold text-white uppercase">Robotics & Hardware</h4>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">Autonomous line tracking and drone obstacles.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0b0b11]/85 border border-white/10 hover:border-pink-400/40 transition-colors">
                <Sparkles className="w-5 h-5 text-pink-400 mb-1" />
                <h4 className="text-xs font-bold text-white uppercase">Startup Pitch</h4>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">Present prototypes to incubator mentors.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0b0b11]/85 border border-white/10 hover:border-emerald-400/40 transition-colors">
                <Gamepad2 className="w-5 h-5 text-emerald-400 mb-1" />
                <h4 className="text-xs font-bold text-white uppercase">Esports Arenas</h4>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">BGMI & Free Fire MAX squad championships.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: 14+ EVENTS SHOWCASE (EXACT TECHVERSE FORMAT)
          ========================================================================= */}
      <section id="events" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-fuchsia-400 font-mono text-xs font-bold uppercase tracking-wider">
              Compete & Conquer
            </div>
            <h2 className="text-3xl sm:text-5xl font-black font-display text-white">
              Fest Events Arena <br />
              <span className="text-gradient-techverse">14+ Engineering Challenges</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Select an event to view complete guidelines, team rules, venue locations, and cash prizes.
            </p>
          </div>

          <button
            onClick={() => { playClickSound(); handleOpenPass('all-events-pass'); }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 text-white font-bold text-xs uppercase font-mono tracking-wider shadow-glow-fuchsia shrink-0 hover:opacity-95"
          >
            Get All-Events Pass (₹149)
          </button>
        </div>

        {/* Interactive Instant Search Bar */}
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fuchsia-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 14+ events by keyword (e.g. Hackathon, BGMI, Drone, Robot, CAD)..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/60 border border-white/20 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-fuchsia-400 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white uppercase font-mono"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills & Count */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex flex-wrap gap-2">
            {eventCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => { playClickSound(); setSelectedCategory(cat); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-black font-bold shadow-lg'
                    : 'bg-[#0b0b11] text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-fuchsia-400 font-bold">
            Showing {filteredEvents.length} of {FEST_EVENTS.length} Events
          </span>
        </div>

        {/* Event Cards Grid */}
        {filteredEvents.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-mono space-y-2">
            <p className="text-base text-white">No events matched your search "{searchQuery}"</p>
            <p className="text-xs">Try searching for "Coding", "Drone", "BGMI", or clear the filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="rounded-3xl overflow-hidden bg-[#0b0b11]/85 border border-white/10 hover:border-white/30 shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between group glass-card"
              >
                <div>
                  {/* Image Banner */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={ev.image}
                      alt={ev.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b11] via-[#0b0b11]/40 to-transparent"></div>

                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-white font-mono text-[10px] font-bold border border-white/15 uppercase">
                      {ev.category}
                    </span>

                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-fuchsia-600/90 text-white font-mono text-[10px] font-bold">
                      {ev.teamSize}
                    </span>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 font-mono">
                      <span className="text-fuchsia-300 font-bold">{ev.date}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[150px]">{ev.venue}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-3">
                    <h3 className="text-xl font-bold font-display text-white group-hover:text-fuchsia-300 transition-colors">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-fuchsia-400 font-mono">{ev.tagline}</p>
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {ev.description}
                    </p>

                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-mono flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Award className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{ev.prizes}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                        REGISTRATION LIVE
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6 pt-0 grid grid-cols-2 gap-3 font-mono text-xs">
                  <button
                    onClick={() => { playClickSound(); setActiveEventForModal(ev); }}
                    className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-semibold border border-white/10 transition-colors"
                  >
                    View Rules
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      handleOpenPass(ev.id.startsWith('esports-') ? 'esports-pass' : 'all-events-pass');
                    }}
                    className="py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold uppercase tracking-wider hover:opacity-95"
                  >
                    Register
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 4: PASSES & REGISTRATION (EXACT TECHVERSE FORMAT)
          ========================================================================= */}
      <section id="passes" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-14">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-fuchsia-400 font-mono text-xs font-bold uppercase tracking-wider">
            Official Fest Passes
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-display text-white">
            Choose Your Delegate Pass
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-mono">
            Direct intra-college access pass for students of Government Engineering College, Sheikhpura.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEST_PASSES.map((pass) => (
            <div
              key={pass.id}
              className={`p-8 rounded-3xl relative flex flex-col justify-between space-y-8 transition-all duration-300 hover:-translate-y-2 ${
                pass.isPopular
                  ? 'techverse-border-glow bg-[#0b0b11] border border-fuchsia-500/50 shadow-glow-fuchsia scale-105'
                  : 'bg-[#0b0b11]/85 border border-white/10 glass-card'
              }`}
            >
              {pass.isPopular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 text-white font-mono font-black text-[10px] uppercase tracking-wider shadow-lg">
                  ⭐ BEST VALUE • ALL INCLUDED
                </span>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-display text-white">{pass.name}</h3>
                  <p className="text-xs text-slate-400">{pass.tagline}</p>
                </div>

                <div className="flex items-baseline gap-2 font-mono">
                  <span className="text-4xl sm:text-5xl font-black text-white text-gradient-techverse">
                    ₹{pass.price}
                  </span>
                  <span className="text-sm text-slate-500 line-through">
                    ₹{pass.originalPrice}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold ml-1 uppercase bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                    GECS RATE
                  </span>
                </div>

                <p className="text-[11px] font-mono text-fuchsia-300 pt-2 border-t border-white/10">
                  {pass.accessScope}
                </p>

                {/* Features Checklist */}
                <ul className="space-y-2.5 pt-2 text-xs text-slate-300">
                  {pass.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => { playClickSound(); handleOpenPass(pass.id); }}
                className={`w-full py-4 rounded-xl font-black text-xs uppercase font-mono tracking-wider transition-all flex items-center justify-center gap-2 ${
                  pass.isPopular
                    ? 'bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 text-white hover:opacity-95 shadow-glow-fuchsia'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/25'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>Book {pass.name.split(' ')[0]} Pass (₹{pass.price})</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          CAMPUS CLUBS OF GEC SHEIKHPURA
          ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono uppercase text-fuchsia-400 font-bold tracking-widest">
            Organized By The Students & Faculty Of
          </span>
          <h3 className="text-2xl sm:text-3xl font-black font-display text-white">
            GEC Sheikhpura Student Clubs & Chapters
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { name: "CodeGECS Club", role: "Coding & HackArena", icon: Code2, color: "text-fuchsia-400" },
            { name: "RoboGEC Society", role: "Robotics & Track-O-Bot", icon: Bot, color: "text-purple-400" },
            { name: "AeroX Flight Wing", role: "AeroStrike Drone Derby", icon: Plane, color: "text-pink-400" },
            { name: "E-Cell Sheikhpura", role: "Pro-To-Pitch Startups", icon: Sparkles, color: "text-amber-400" },
            { name: "GECS Esports Guild", role: "BGMI & Free Fire", icon: Gamepad2, color: "text-emerald-400" },
          ].map((club, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-2xl bg-[#0b0b11]/85 border border-white/10 glass-card text-center space-y-2 hover:border-white/30 transition-colors"
            >
              <div className="w-10 h-10 mx-auto rounded-xl bg-black/60 flex items-center justify-center border border-white/10">
                <club.icon className={`w-5 h-5 ${club.color}`} />
              </div>
              <h5 className="text-xs font-bold text-white font-mono">{club.name}</h5>
              <p className="text-[10px] text-slate-400 font-mono">{club.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: SCHEDULE & TIMELINE (DAY 1 VS DAY 2)
          ========================================================================= */}
      <section id="schedule" className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-fuchsia-400 font-mono text-xs font-bold uppercase tracking-wider">
            Fest Itinerary
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-display text-white">
            Schedule & Timeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-mono">
            Two days of relentless engineering action across GEC Sheikhpura campus.
          </p>
        </div>

        {/* Day 1 vs Day 2 Switcher */}
        <div className="flex justify-center">
          <div className="flex p-1.5 rounded-xl bg-[#0b0b11] border border-white/15 font-mono text-xs">
            <button
              onClick={() => { playClickSound(); setSelectedDay('Day 1'); }}
              className={`px-6 py-2.5 rounded-lg font-bold transition-all ${
                selectedDay === 'Day 1'
                  ? 'bg-white text-black shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Day 1 • Nov 28, 2026
            </button>
            <button
              onClick={() => { playClickSound(); setSelectedDay('Day 2'); }}
              className={`px-6 py-2.5 rounded-lg font-bold transition-all ${
                selectedDay === 'Day 2'
                  ? 'bg-white text-black shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Day 2 • Nov 29, 2026
            </button>
          </div>
        </div>

        {/* Schedule List */}
        <div className="space-y-4">
          {filteredSchedule.map((slot, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-2xl bg-[#0b0b11]/85 border border-white/10 hover:border-white/30 glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-fuchsia-400 font-bold text-xs">{slot.time}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-300 uppercase font-bold">
                    {slot.category}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white font-display">{slot.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{slot.description}</p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono shrink-0 bg-black/60 px-3 py-2 rounded-xl border border-white/10">
                <MapPin className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>{slot.venue}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: FREQUENTLY ASKED QUESTIONS (FAQS)
          ========================================================================= */}
      <section id="faqs" className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-fuchsia-400 font-mono text-xs font-bold uppercase tracking-wider">
            Clarifications
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-display text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-mono">
            Got questions about passes, rules, or prizes? We have answers.
          </p>
        </div>

        <div className="space-y-3">
          {FEST_FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#0b0b11]/85 border border-white/10 glass-card overflow-hidden"
              >
                <button
                  onClick={() => { playClickSound(); setOpenFaqIndex(isOpen ? null : idx); }}
                  className="w-full p-5 text-left flex items-center justify-between text-sm font-bold text-white hover:text-fuchsia-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-fuchsia-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer (Exact TechVerse Aesthetic) */}
      <TechyFooter />

      {/* Pass Booking Modal */}
      {passModalOpen && (
        <PassBookingModal
          isOpen={passModalOpen}
          onClose={() => setPassModalOpen(false)}
          selectedPassId={selectedPassId}
        />
      )}

      {/* Event Details Modal */}
      <EventDetailModal
        event={activeEventForModal}
        onClose={() => setActiveEventForModal(null)}
        onRegister={(eventId) =>
          handleOpenPass(eventId.startsWith('esports-') ? 'esports-pass' : 'all-events-pass')
        }
      />
    </div>
  );
};
