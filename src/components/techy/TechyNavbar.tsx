import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Ticket, ShieldCheck, Lock } from 'lucide-react';
import { FEST_INFO } from '../../data/techySheikhpuraData';
import { TechyLogo } from './TechyLogo';

interface TechyNavbarProps {
  onOpenPassModal: () => void;
}

export const TechyNavbar: React.FC<TechyNavbarProps> = ({ onOpenPassModal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '#hero' },
    { name: 'About', href: '#about' },
    { name: 'Events', href: '#events' },
    { name: 'Results', href: '#results' },
    { name: 'Passes', href: '#passes' },
    { name: 'Schedule', href: '#schedule' },
    { name: 'FAQs', href: '#faqs' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#020003]/95 backdrop-blur-2xl border-b border-fuchsia-500/20 shadow-[0_10px_35px_rgba(0,0,0,0.85)]'
          : 'bg-[#020003]/80 backdrop-blur-xl border-b border-white/10'
      }`}
    >
      {/* Top Announcements & Dates Banner */}
      <div className="bg-gradient-to-r from-[#05020c] via-[#0d041a] to-[#05020c] border-b border-white/10 px-4 sm:px-6 lg:px-8 py-2 text-[11px] font-mono text-slate-300 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Institution Tag */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-white font-bold uppercase tracking-wider text-[11px]">
              {FEST_INFO.collegeName} (GEC Sheikhpura)
            </span>
          </div>

          {/* Edition & Concluded Status */}
          <div className="flex items-center gap-3">
            <span className="text-slate-300 font-mono">
              Dates: <strong className="text-white">{FEST_INFO.dates}</strong>
            </span>
            <span className="text-slate-600 font-bold">•</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/35 text-fuchsia-300 font-bold text-[10px] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse"></span>
              Event Concluded (Sep 2026)
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[4.75rem] py-2.5 gap-4">
          
          {/* Official Custom Brand Logo & Title */}
          <a
            href="#hero"
            className="flex items-center gap-3 group text-left shrink-0 py-1"
            title="Techy Sheikhpura '26 - Government Engineering College, Sheikhpura"
          >
            {/* Custom Brand Logo */}
            <TechyLogo size={46} glow={true} className="transition-transform group-hover:scale-105" />

            <div className="flex flex-col justify-center">
              <div className="flex items-center">
                <span className="text-xl sm:text-2xl font-display font-black tracking-tight text-white group-hover:text-fuchsia-300 transition-colors leading-tight">
                  Techy <span className="text-gradient-techverse">Sheikhpura</span>
                </span>
                <span className="text-fuchsia-400 font-display font-black text-xl sm:text-2xl ml-1">
                  '26
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 tracking-wider font-semibold uppercase leading-tight mt-0.5">
                GEC Sheikhpura • Intra College Fest
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 font-mono text-xs font-semibold">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="px-3 xl:px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Right Action CTA Buttons */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            <Link
              to="/verify"
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 hover:text-white font-semibold text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm"
              title="Verify Delegate Pass Certificate"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verify Pass</span>
            </Link>

            <Link
              to="/admin"
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-fuchsia-300 font-semibold text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm"
              title="Organizer Administration Console"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Desk</span>
            </Link>

            <button
              type="button"
              onClick={onOpenPassModal}
              className="px-4 xl:px-5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 text-white font-bold text-xs font-mono uppercase tracking-wider hover:opacity-95 shadow-glow-fuchsia flex items-center gap-2 transition-all hover:scale-105"
            >
              <Ticket className="w-4 h-4" />
              <span>Fest Passes</span>
            </button>
          </div>

          {/* Mobile Menu Action & Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={onOpenPassModal}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold text-xs font-mono uppercase tracking-wider"
            >
              Passes
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="p-2 text-slate-300 hover:text-white rounded-lg bg-white/5 border border-white/10"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#05020c]/98 backdrop-blur-2xl border-b border-fuchsia-500/25 px-5 py-6 space-y-3 font-mono text-xs transition-all duration-200">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <TechyLogo size={36} glow={false} />
            <div>
              <strong className="text-white text-sm font-display block">Techy Sheikhpura '26</strong>
              <span className="text-[10px] text-slate-400 block">GEC Sheikhpura</span>
            </div>
          </div>

          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
            >
              {item.name}
            </a>
          ))}

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link
              to="/verify"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-emerald-300 font-semibold"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify Pass</span>
            </Link>
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-fuchsia-300 font-semibold"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Organizer Desk</span>
            </Link>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPassModal();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold uppercase tracking-wider text-center shadow-glow-fuchsia"
            >
              View Fest Passes
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
