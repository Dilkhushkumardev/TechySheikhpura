import React, { useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, Compass, Sparkles, Users, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Smart auto-recovery derived directly from location without unnecessary state renders
  const matchedRoute = useMemo(() => {
    const raw = (location.pathname + location.hash).toLowerCase();
    if (raw.includes('admin') || raw.includes('desk') || raw.includes('dash')) {
      return { path: '/admin', label: 'Organizer Desk' };
    }
    if (raw.includes('register') || raw.includes('squad') || raw.includes('team')) {
      return { path: '/team-register', label: 'Squad Registration' };
    }
    if (raw.includes('verify') || raw.includes('pass') || raw.includes('cert')) {
      return { path: '/verify', label: 'Pass Verification' };
    }
    return null;
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (matchedRoute) {
      const timer = setTimeout(() => {
        navigate(matchedRoute.path, { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [matchedRoute, navigate]);

  return (
    <div className="min-h-screen bg-[#020003] flex items-center justify-center px-4 py-16 text-center relative overflow-hidden">
      {/* Ambient Fuchsia & Purple Radiance */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[380px] bg-fuchsia-600/15 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-lg w-full space-y-7 relative z-10">
        <div className="relative mx-auto w-24 h-24 rounded-3xl bg-fuchsia-500/10 border-2 border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400 shadow-glow-fuchsia animate-pulse">
          <ShieldAlert className="w-12 h-12" />
        </div>

        <div className="space-y-2.5">
          <span className="text-xs font-mono text-fuchsia-400 font-bold uppercase tracking-widest inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-ping" />
            <span>ERROR 404 • SYSTEM ANOMALY</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
            Coordinates Not Found
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed font-mono max-w-md mx-auto">
            The requested route does not exist or has been redirected to the TechySheikhpura fest portal.
          </p>

          {matchedRoute && (
            <div className="pt-2 text-xs font-mono text-emerald-400 font-semibold inline-flex items-center gap-1.5 animate-pulse">
              <span>Redirecting to {matchedRoute.label} in 2 seconds...</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Action CTAs */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
          <Link
            to="/"
            className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 text-white font-bold uppercase tracking-wider hover:opacity-95 shadow-glow-fuchsia flex items-center justify-center gap-2 transition-transform hover:scale-105"
          >
            <Compass className="w-4 h-4" />
            <span>Back to Fest Home</span>
          </Link>
          <Link
            to="/events"
            className="px-5 py-3.5 rounded-xl bg-[#0b0b11] hover:bg-white/10 text-slate-200 border border-white/15 font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-fuchsia-400" />
            <span>Explore 14+ Events</span>
          </Link>
          <Link
            to="/team-register"
            className="px-5 py-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Team Register</span>
          </Link>
          <Link
            to="/admin"
            className="px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-fuchsia-300 border border-fuchsia-500/30 font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors"
          >
            <Lock className="w-4 h-4 text-fuchsia-400" />
            <span>Organizer Desk</span>
          </Link>
          <Link
            to="/verify"
            className="sm:col-span-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-medium tracking-wider uppercase flex items-center justify-center gap-2 transition-colors text-[11px]"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verify Delegate Pass Certificate</span>
          </Link>
        </div>

        <div className="pt-2 text-[11px] font-mono text-slate-500">
          Government Engineering College, Sheikhpura • Techy Sheikhpura '26
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
