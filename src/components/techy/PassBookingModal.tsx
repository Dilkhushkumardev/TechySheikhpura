import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { X, CheckCircle, Ticket, ShieldCheck, Printer, RotateCcw } from 'lucide-react';
import { FEST_PASSES, FEST_INFO } from '../../data/techySheikhpuraData';

interface PassBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPassId?: string;
}

export interface BookedPassData {
  regId: string;
  passName: string;
  price: number;
  fullName: string;
  rollNo: string;
  branch: string;
  year: string;
  phone: string;
  email: string;
  bookedAt: string;
}

/**
 * Generates a deterministic 13x13 QR-like visual matrix with 3 finder patterns
 * from a delegate registration payload so the holographic pass badge renders offline.
 */
function buildQrCells(seedText: string): boolean[] {
  const size = 13;
  const cells = new Array<boolean>(size * size).fill(false);

  const setFinder = (startRow: number, startCol: number) => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const isBorder = r === 0 || r === 4 || c === 0 || c === 4;
        const isCenter = r === 2 && c === 2;
        cells[(startRow + r) * size + (startCol + c)] = isBorder || isCenter;
      }
    }
  };

  setFinder(0, 0);
  setFinder(0, size - 5);
  setFinder(size - 5, 0);

  let hash = 2166136261;
  for (let i = 0; i < seedText.length; i++) {
    hash ^= seedText.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 6 && c < 6;
      const inTopRight = r < 6 && c >= size - 6;
      const inBottomLeft = r >= size - 6 && c < 6;
      if (inTopLeft || inTopRight || inBottomLeft) continue;

      hash ^= (r * 31 + c * 17 + 7);
      hash = Math.imul(hash, 16777619);
      cells[r * size + c] = (hash & 1) === 1;
    }
  }

  return cells;
}

export const PassBookingModal: React.FC<PassBookingModalProps> = ({
  isOpen,
  onClose,
  selectedPassId = 'all-events-pass',
}) => {
  const [overridePassId, setOverridePassId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [branch, setBranch] = useState('Computer Science & Engineering (CSE)');
  const [year, setYear] = useState('3rd Year (2024-28)');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmedPass, setConfirmedPass] = useState<BookedPassData | null>(null);

  const passId = overridePassId ?? selectedPassId;

  // Escape key dismissal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const qrCells = useMemo(() => {
    if (!confirmedPass) return [];
    return buildQrCells(`${confirmedPass.regId}|${confirmedPass.rollNo}|${confirmedPass.passName}`);
  }, [confirmedPass]);

  if (!isOpen) return null;

  const currentPass = FEST_PASSES.find((p) => p.id === passId) || FEST_PASSES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = fullName.trim();
    const cleanRoll = rollNo.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();

    if (!cleanName || !cleanRoll || !cleanPhone || !cleanEmail) {
      setFormError('Please fill in all mandatory student details before confirming.');
      return;
    }

    setFormError(null);

    const regId = `TS26-GECS-${Math.floor(10000 + Math.random() * 90000)}`;
    const passData: BookedPassData = {
      regId,
      passName: currentPass.name,
      price: currentPass.price,
      fullName: cleanName,
      rollNo: cleanRoll,
      branch,
      year,
      phone: cleanPhone,
      email: cleanEmail,
      bookedAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };

    setConfirmedPass(passData);

    // Safely persist registration to localStorage
    try {
      const saved = localStorage.getItem('techy_sheikhpura_passes');
      const parsed: unknown = saved ? JSON.parse(saved) : [];
      const existing = Array.isArray(parsed) ? parsed : [];
      localStorage.setItem('techy_sheikhpura_passes', JSON.stringify([passData, ...existing]));
    } catch {
      // Ignore storage quota or malformed JSON recovery
      try {
        localStorage.setItem('techy_sheikhpura_passes', JSON.stringify([passData]));
      } catch {
        // Storage unavailable in private mode
      }
    }

    // Confetti celebration blast!
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ff8cb8', '#d45d8c', '#e293e0', '#a855f7', '#ffffff'],
      });
    } catch {
      // Fallback if canvas context unavailable
    }
  };

  const handleBookAnother = () => {
    setConfirmedPass(null);
    setFullName('');
    setRollNo('');
    setPhone('');
    setEmail('');
    setFormError(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pass-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-xl w-full bg-[#0b0b11] border border-fuchsia-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-[#050308] via-[#0b0b11] to-[#050308]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/35">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 id="pass-modal-title" className="text-base font-bold text-white font-display">
                {FEST_INFO.name} Official Passes
              </h3>
              <p className="text-[11px] text-fuchsia-300 font-mono">
                Government Engineering College, Sheikhpura
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close pass booking modal"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {confirmedPass ? (
            /* Digital Holographic Pass Result */
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-glow-fuchsia">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-2xl font-black text-white font-display">
                  Pass Confirmed!
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  You are registered for <strong className="text-fuchsia-300">{FEST_INFO.name}</strong>.
                </p>
              </div>

              {/* Holographic Delegate Badge with Deterministic QR */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0b0b11] via-[#1a0b24] to-[#020003] border-2 border-fuchsia-500/50 text-left relative overflow-hidden shadow-2xl space-y-4">
                <div className="absolute top-0 right-0 w-40 h-40 bg-fuchsia-500/15 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3 relative">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-fuchsia-400 uppercase tracking-widest block">
                      OFFICIAL DELEGATE PASS
                    </span>
                    <strong className="text-base font-extrabold text-white font-display block mt-0.5">
                      {confirmedPass.passName}
                    </strong>
                    <span className="text-xs font-mono font-bold text-emerald-400 block mt-1">
                      ₹{confirmedPass.price} • {confirmedPass.regId}
                    </span>
                  </div>

                  {/* Verified Inline SVG QR Code */}
                  <div
                    className="p-1.5 rounded-xl bg-white shrink-0 shadow-lg"
                    title={`QR Code for ${confirmedPass.regId}`}
                  >
                    <svg
                      viewBox="0 0 13 13"
                      className="w-16 h-16"
                      shapeRendering="crispEdges"
                      aria-label={`Delegate QR badge ${confirmedPass.regId}`}
                    >
                      <rect width="13" height="13" fill="#ffffff" />
                      {qrCells.map((filled, idx) =>
                        filled ? (
                          <rect
                            key={`qr-${Math.floor(idx / 13)}-${idx % 13}`}
                            x={idx % 13}
                            y={Math.floor(idx / 13)}
                            width="1"
                            height="1"
                            fill="#020003"
                          />
                        ) : null
                      )}
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono relative">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Participant</span>
                    <strong className="text-white text-sm block truncate">{confirmedPass.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">College Roll No.</span>
                    <span className="text-fuchsia-300 font-bold">{confirmedPass.rollNo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Branch &amp; Year</span>
                    <span className="text-slate-300 truncate block" title={`${confirmedPass.branch} (${confirmedPass.year})`}>
                      {confirmedPass.branch} ({confirmedPass.year})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Booked On</span>
                    <span className="text-slate-300">{confirmedPass.bookedAt}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono relative">
                  <span>Valid: {FEST_INFO.dates}</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED GECS DELEGATE
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="py-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={handleBookAnother}
                  className="py-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/15 text-slate-200 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-fuchsia-400" />
                  <span>Book Another</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 text-white text-xs font-mono font-bold uppercase tracking-wider hover:opacity-95 shadow-glow-fuchsia"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-mono"
                >
                  {formError}
                </div>
              )}

              {/* Select Pass Tabs */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-2 font-bold uppercase">
                  Select Your Fest Pass:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {FEST_PASSES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setOverridePassId(p.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        passId === p.id
                          ? 'bg-fuchsia-500/15 border-fuchsia-400 shadow-glow-fuchsia'
                          : 'bg-[#020003]/70 border-white/10 hover:border-white/25'
                      }`}
                    >
                      <span className="text-[10px] font-mono uppercase text-slate-400 block truncate">
                        {p.name.split(' ')[0]}
                      </span>
                      <strong className="text-lg font-bold text-white font-mono block">
                        ₹{p.price}
                      </strong>
                      <span className="text-[10px] text-slate-500 line-through font-mono">
                        ₹{p.originalPrice}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pass Selected Highlight */}
              <div className="p-3.5 rounded-xl bg-[#050308] border border-fuchsia-500/25 text-xs text-slate-300">
                <div className="flex items-center justify-between font-bold text-white mb-1">
                  <span className="text-fuchsia-300">{currentPass.name}</span>
                  <span className="font-mono text-emerald-400">₹{currentPass.price}</span>
                </div>
                <p className="text-[11px] text-slate-400">{currentPass.tagline}</p>
              </div>

              {/* Input Fields */}
              <div className="space-y-3 text-xs">
                <div>
                  <label htmlFor="pass-full-name" className="block text-slate-300 mb-1 font-medium">
                    Student Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="pass-full-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aryan Raj"
                    className="w-full px-3 py-2 rounded-xl bg-[#020003]/80 border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="pass-roll-no" className="block text-slate-300 mb-1 font-medium">
                      College Roll No. / Reg No. <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="pass-roll-no"
                      type="text"
                      required
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      placeholder="e.g. 23105147042"
                      className="w-full px-3 py-2 rounded-xl bg-[#020003]/80 border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor="pass-year" className="block text-slate-300 mb-1 font-medium">
                      Year of Study
                    </label>
                    <select
                      id="pass-year"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
                    >
                      <option>1st Year (2026-30)</option>
                      <option>2nd Year (2025-29)</option>
                      <option>3rd Year (2024-28)</option>
                      <option>4th Year (2023-27)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="pass-branch" className="block text-slate-300 mb-1 font-medium">
                    Branch / Department
                  </label>
                  <select
                    id="pass-branch"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#020003] border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
                  >
                    <option>Computer Science &amp; Engineering (CSE)</option>
                    <option>Electronics &amp; Communication Engineering (ECE)</option>
                    <option>Electrical Engineering (EE)</option>
                    <option>Civil Engineering (CE)</option>
                    <option>Mechanical Engineering (ME)</option>
                    <option>Mechatronics Engineering</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="pass-phone" className="block text-slate-300 mb-1 font-medium">
                      Phone Number (WhatsApp) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="pass-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 rounded-xl bg-[#020003]/80 border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor="pass-email" className="block text-slate-300 mb-1 font-medium">
                      College Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="pass-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aryan@gecsheikhpura.ac.in"
                      className="w-full px-3 py-2 rounded-xl bg-[#020003]/80 border border-white/15 text-white focus:border-fuchsia-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 text-white font-bold text-xs uppercase font-mono tracking-wider hover:opacity-95 shadow-glow-fuchsia flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Confirm &amp; Generate Delegate Pass (₹{currentPass.price})</span>
                </button>
                <p className="text-[10px] text-slate-500 text-center font-mono mt-2">
                  Official GEC Sheikhpura Intra-College Technical Fest.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
