import React, { useState, useEffect } from 'react';
import { Menu, X, Sparkles, Ticket } from 'lucide-react';
import { FEST_INFO } from '../../data/techySheikhpuraData';

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
    { name: 'Passes', href: '#passes' },
    { name: 'Schedule', href: '#schedule' },
    { name: 'FAQs', href: '#faqs' },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-[#020003]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl'
        : 'bg-[#020003]/60 backdrop-blur-md border-b border-white/5'
    }`}>
      {/* Top Banner */}
      <div className="bg-[#050308] border-b border-white/5 px-4 py-1.5 text-[11px] font-mono text-slate-400 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse"></span>
            <span className="text-white font-bold uppercase tracking-wider">
              {FEST_INFO.collegeName} (GEC Sheikhpura)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-white/80 font-mono">Dates: {FEST_INFO.dates}</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Passes Live
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Name (Exact TechVerse Style) */}
          <a href="#hero" className="flex items-center gap-3 group text-left">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 p-[2px]">
              <div className="w-full h-full bg-[#020003] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-fuchsia-400 animate-pulse" />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl lg:text-3xl font-display font-bold tracking-wider text-white group-hover:text-fuchsia-300 transition-colors">
                Techy Sheikhpura<span className="text-fuchsia-400 ml-1.5">'26</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 leading-tight">
                GEC Sheikhpura • Intra College Fest
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 font-mono text-xs font-semibold">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="px-3.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Action CTA Button */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={onOpenPassModal}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 text-white font-bold text-xs font-mono uppercase tracking-wider hover:opacity-95 shadow-glow-fuchsia flex items-center gap-2 transition-all hover:scale-105"
            >
              <Ticket className="w-4 h-4" />
              <span>Get Fest Pass</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
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

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#020003]/95 backdrop-blur-xl border-b border-white/10 px-4 py-6 space-y-3 font-mono text-xs transition-all duration-200">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-slate-200 hover:bg-white/10"
            >
              {item.name}
            </a>
          ))}
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPassModal();
              }}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold uppercase tracking-wider text-center"
            >
              Get Fest Pass
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
