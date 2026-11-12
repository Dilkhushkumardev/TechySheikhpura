import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Compass, Sparkles } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020003] flex items-center justify-center px-4 py-16 text-center relative overflow-hidden">
      {/* Subtle Ambient Fuchsia Radiance */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-fuchsia-600/15 blur-[140px] rounded-full pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        <div className="relative mx-auto w-24 h-24 rounded-3xl bg-fuchsia-500/10 border-2 border-fuchsia-500/35 flex items-center justify-center text-fuchsia-400 shadow-glow-fuchsia animate-pulse">
          <ShieldAlert className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono text-fuchsia-400 font-bold uppercase tracking-widest">
            ERROR 404 • SYSTEM ANOMALY
          </span>
          <h1 className="text-4xl font-extrabold font-display text-white">
            Coordinates Not Found
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            The requested page does not exist or has been redirected to the TechySheikhpura fest portal.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 font-mono">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 text-white font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-glow-fuchsia flex items-center justify-center gap-2 transition-transform hover:scale-105"
          >
            <Compass className="w-4 h-4" />
            <span>Back to TechySheikhpura</span>
          </Link>
          <Link
            to="/#events"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0b0b11] hover:bg-white/10 text-slate-300 border border-white/15 text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-fuchsia-400" />
            <span>View Events</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
