import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, CheckCircle, Ticket, ShieldCheck, Printer } from 'lucide-react';
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

export const PassBookingModal: React.FC<PassBookingModalProps> = ({ 
  isOpen, 
  onClose,
  selectedPassId = "all-events-pass"
}) => {
  const [passId, setPassId] = useState(selectedPassId);
  const [fullName, setFullName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [branch, setBranch] = useState('Computer Science & Engineering (CSE)');
  const [year, setYear] = useState('3rd Year');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [confirmedPass, setConfirmedPass] = useState<BookedPassData | null>(null);

  if (!isOpen) return null;

  const currentPass = FEST_PASSES.find(p => p.id === passId) || FEST_PASSES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !rollNo || !phone || !email) {
      alert("Please fill in all mandatory fields.");
      return;
    }

    const regId = `TS26-GECS-${Math.floor(10000 + Math.random() * 90000)}`;
    const passData = {
      regId,
      passName: currentPass.name,
      price: currentPass.price,
      fullName,
      rollNo,
      branch,
      year,
      phone,
      email,
      bookedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    };

    setConfirmedPass(passData);

    // Save registration to local storage
    const saved = localStorage.getItem('techy_sheikhpura_passes');
    const existing = saved ? JSON.parse(saved) : [];
    localStorage.setItem('techy_sheikhpura_passes', JSON.stringify([passData, ...existing]));

    // Confetti celebration blast!
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#0066ff', '#8b5cf6', '#38bdf8', '#ffffff']
      });
    } catch {
      // fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative max-w-xl w-full bg-navy-950 border border-cyan-500/40 rounded-3xl overflow-hidden shadow-2xl glass-card flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                {FEST_INFO.name} Official Passes
              </h3>
              <p className="text-[11px] text-cyan-400 font-mono">Government Engineering College, Sheikhpura</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {confirmedPass ? (
            /* Digital Holographic Pass Result */
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-glow-cyan">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-2xl font-black text-white font-heading">
                  Pass Confirmed!
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  You are registered for <strong className="text-cyan-300">{FEST_INFO.name}</strong>.
                </p>
              </div>

              {/* Holographic Delegate Badge */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-navy-900 via-[#0a1738] to-navy-950 border-2 border-cyan-500/50 text-left relative overflow-hidden shadow-2xl space-y-4">
                <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl"></div>

                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                      OFFICIAL DELEGATE PASS
                    </span>
                    <strong className="text-base font-extrabold text-white font-heading">
                      {confirmedPass.passName}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400 block">
                      ₹{confirmedPass.price}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300">{confirmedPass.regId}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Participant</span>
                    <strong className="text-white text-sm block">{confirmedPass.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">College Roll No.</span>
                    <span className="text-cyan-300 font-bold">{confirmedPass.rollNo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Branch & Year</span>
                    <span className="text-slate-300 truncate block">{confirmedPass.branch} ({confirmedPass.year})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Institution</span>
                    <span className="text-slate-300">GEC Sheikhpura</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Valid: {FEST_INFO.dates}</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED GECS DELEGATE
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handlePrint}
                  className="py-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print Pass Slip
                </button>
                <button
                  onClick={onClose}
                  className="py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-mono font-bold uppercase tracking-wider hover:opacity-95 shadow-glow-cyan"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-4">
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
                      onClick={() => setPassId(p.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        passId === p.id
                          ? 'bg-cyan-500/15 border-cyan-400 shadow-glow-cyan'
                          : 'bg-navy-900 border-white/10 hover:border-white/20'
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
              <div className="p-3.5 rounded-xl bg-navy-900 border border-cyan-500/20 text-xs text-slate-300">
                <div className="flex items-center justify-between font-bold text-white mb-1">
                  <span className="text-cyan-300">{currentPass.name}</span>
                  <span className="font-mono text-emerald-400">₹{currentPass.price}</span>
                </div>
                <p className="text-[11px] text-slate-400">{currentPass.tagline}</p>
              </div>

              {/* Input Fields */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">
                    Student Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aryan Raj"
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">
                      College Roll No. / Reg No. <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      placeholder="e.g. 23105147042"
                      className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">
                      Year of Study
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                    >
                      <option>1st Year (2026-30)</option>
                      <option>2nd Year (2025-29)</option>
                      <option>3rd Year (2024-28)</option>
                      <option>4th Year (2023-27)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">
                    Branch / Department
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option>Computer Science & Engineering (CSE)</option>
                    <option>Electronics & Communication Engineering (ECE)</option>
                    <option>Electrical Engineering (EE)</option>
                    <option>Civil Engineering (CE)</option>
                    <option>Mechanical Engineering (ME)</option>
                    <option>Mechatronics Engineering</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">
                      Phone Number (WhatsApp) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">
                      College Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aryan@gecsheikhpura.ac.in"
                      className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600 text-white font-bold text-xs uppercase font-mono tracking-wider hover:opacity-95 shadow-glow-cyan flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <Ticket className="w-4 h-4" />
                  Confirm & Generate Delegate Pass (₹{currentPass.price})
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

