import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Compass, Sparkles } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="relative mx-auto w-24 h-24 rounded-3xl bg-cyan-500/10 border-2 border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-cyan animate-pulse">
          <ShieldAlert className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest">
            ERROR 404 • SYSTEM ANOMALY
          </span>
          <h1 className="text-4xl font-extrabold font-heading text-white">
            Coordinates Not Found
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            The requested page does not exist or has been redirected to the TechySheikhpura fest portal.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 font-mono">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600 text-white font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-glow-cyan flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4" />
            Back to TechySheikhpura
          </Link>
          <a
            href="/#events"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 border border-white/10 text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            View Events
          </a>
        </div>
      </div>
    </div>
  );
};


