import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  Printer,
  Search,
  ShieldCheck,
  ShieldX,
  Ticket,
} from 'lucide-react';
import { FEST_INFO } from '../data/techySheikhpuraData';
import {
  ApiError,
  verifyRegistrations,
  type RegistrationRecord,
  type VerifySignatureStatus,
} from '../services/api';
import { DelegateQrSvg } from '../components/techy/DelegateQrSvg';
import type { BookedPassData } from '../components/techy/PassBookingModal';

function loadRecentLocalPassIds(): string[] {
  try {
    const raw = localStorage.getItem('techy_sheikhpura_passes');
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is BookedPassData => Boolean(item) && typeof (item as BookedPassData).regId === 'string')
      .map((item) => item.regId)
      .slice(0, 4);
  } catch {
    return [];
  }
}

export const VerifyPassPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialSig = searchParams.get('sig') || '';

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(() => initialQuery.trim().length >= 2);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<RegistrationRecord[] | null>(null);
  const [signatureStatus, setSignatureStatus] = useState<VerifySignatureStatus | null>(null);
  const [recentIds] = useState<string[]>(() => loadRecentLocalPassIds());

  const runSearch = async (term: string, sig?: string) => {
    const clean = term.trim();
    if (clean.length < 2) {
      setError('Enter a Registration ID (TS26-GECS-...), Roll No, or Email (at least 2 chars).');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const res = await verifyRegistrations(clean, sig);
      setResults(res.registrations);
      setSignatureStatus(res.signatureStatus ?? null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to reach backend database. Ensure the backend server is running.');
      }
      setResults(null);
      setSignatureStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const clean = initialQuery.trim();
    if (clean.length < 2) return;
    let cancelled = false;
    verifyRegistrations(clean, initialSig || undefined)
      .then((res) => {
        if (!cancelled) {
          setError(null);
          setResults(res.registrations);
          setSignatureStatus(res.signatureStatus ?? null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Unable to reach backend database. Ensure the backend server is running.'
          );
          setResults(null);
          setSignatureStatus(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialQuery, initialSig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim();
    setSearchParams(clean ? { q: clean } : {});
    void runSearch(clean);
  };

  return (
    <div className="min-h-screen bg-[#020003] text-slate-100 px-4 sm:px-6 lg:px-8 py-10 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[420px] h-[420px] rounded-full bg-fuchsia-600/10 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[360px] h-[360px] rounded-full bg-purple-600/10 blur-[140px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-300 hover:text-white px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-fuchsia-400" />
            <span>Back to {FEST_INFO.shortName}</span>
          </Link>

          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-fuchsia-300 hover:text-white px-3.5 py-2 rounded-xl bg-fuchsia-500/10 border border-fuchsia-400/30 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Organizer Desk Console</span>
          </Link>
        </div>

        {/* Title & Lookup Form */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-bold uppercase tracking-wider">
            <Ticket className="w-3.5 h-3.5" />
            <span>Live SQLite Delegate Verification</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-display text-white">
            Verify Fest <span className="text-gradient-techverse">Pass</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Retrieve your official QR delegate pass or verify gate check-in status using your Registration ID, College Roll Number, or Email address.
          </p>

          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto pt-2 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. TS26-GECS-48210 or 23105147042 or aryan@..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#0b0b11] border border-white/15 text-sm text-white font-mono focus:border-fuchsia-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 text-white font-bold text-xs font-mono uppercase tracking-wider hover:opacity-95 disabled:opacity-60 shadow-glow-fuchsia flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Lookup Pass</span>
            </button>
          </form>

          {recentIds.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-mono">
              <span className="text-slate-500">Recent on this device:</span>
              {recentIds.map((regId) => (
                <button
                  key={regId}
                  type="button"
                  onClick={() => {
                    setQuery(regId);
                    setSearchParams({ q: regId });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-fuchsia-500/20 border border-white/10 text-fuchsia-300 transition-colors"
                >
                  {regId}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-mono text-center"
          >
            {error}
          </div>
        )}

        {/* Empty Result */}
        {results && results.length === 0 && (
          <div className="p-8 rounded-3xl bg-[#0b0b11]/85 border border-white/10 text-center space-y-2">
            <ShieldX className="w-10 h-10 text-rose-400 mx-auto" />
            <h2 className="text-lg font-bold font-heading text-white">No Matching Pass Found</h2>
            <p className="text-xs text-slate-400 font-mono">
              Double-check your Registration ID (`TS26-GECS-XXXXX`), Roll Number, or Email address.
            </p>
          </div>
        )}

        {/* Verified Cards */}
        {results && results.length > 0 && (
          <div className="space-y-5">
            {signatureStatus === 'valid' && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 text-xs font-mono flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cryptographic HMAC-SHA256 Pass Seal Verified Authentically</span>
              </div>
            )}
            {signatureStatus === 'invalid' && (
              <div
                role="alert"
                className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-mono flex items-center justify-center gap-2"
              >
                <ShieldX className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Invalid QR signature parameter (?sig=): seal does not match backend HMAC record</span>
              </div>
            )}

            {results.map((reg) => (
              <div
                key={reg.regId}
                className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0b0b11] via-[#1a0b24] to-[#020003] border-2 border-fuchsia-500/45 shadow-2xl space-y-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                        {reg.regId}
                      </span>
                      {reg.verifyCode && (
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-400/35 text-purple-200 text-[10px] font-mono font-bold uppercase">
                          Seal: {reg.verifyCode}
                        </span>
                      )}
                      {reg.checkedIn ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-mono font-bold uppercase">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Checked In At Gate</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/35 text-amber-300 text-[10px] font-mono font-bold uppercase">
                          <Clock className="w-3 h-3" />
                          <span>Active Pass • Pending Gate Check-In</span>
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-black font-display text-white">{reg.passName}</h2>
                    <p className="text-xs font-mono text-emerald-400 font-bold">
                      ₹{reg.price} • Booked {reg.bookedAt}
                    </p>
                  </div>

                  <div className="p-2 rounded-2xl bg-white shadow-xl">
                    <DelegateQrSvg
                      seedText={`${reg.regId}|${reg.rollNo}|${reg.passName}|${reg.verifyCode || 'verified'}`}
                      label={`QR Badge for ${reg.regId}`}
                      className="w-20 h-20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Participant Name</span>
                    <strong className="text-white text-sm">{reg.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Roll Number</span>
                    <strong className="text-fuchsia-300 text-sm">{reg.rollNo}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Branch &amp; Year</span>
                    <span className="text-slate-200">{reg.branch} ({reg.year})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Email</span>
                    <span className="text-slate-200 break-all">{reg.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Phone</span>
                    <span className="text-slate-200">{reg.phone}</span>
                  </div>
                  {(reg.eventTitle || reg.teamName) && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Track / Team</span>
                      <span className="text-fuchsia-200">
                        {[reg.eventTitle, reg.teamName ? `Team: ${reg.teamName}` : null]
                          .filter(Boolean)
                          .join(' • ')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] font-mono text-slate-400">
                    Valid Dates: {FEST_INFO.dates} • {FEST_INFO.shortCollegeName}
                  </span>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono font-semibold text-white inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Delegate Pass</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
