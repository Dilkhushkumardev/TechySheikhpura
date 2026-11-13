import React, { useEffect } from 'react';
import { X, CheckCircle2, Phone } from 'lucide-react';
import type { FestEvent } from '../../data/techySheikhpuraData';

interface EventDetailModalProps {
  event: FestEvent | null;
  onClose: () => void;
  onRegister?: (eventId: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose, onRegister: _onRegister }) => {
  useEffect(() => {
    if (!event) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [event, onClose]);

  if (!event) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full bg-[#0b0b11] border border-fuchsia-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner with Image */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b11] via-[#0b0b11]/50 to-transparent"></div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close event details"
            className="absolute top-4 right-4 p-2 rounded-full bg-black/70 border border-white/15 text-white hover:bg-black/95 hover:border-fuchsia-400/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6">
            <span className="px-3 py-1 rounded-md bg-fuchsia-500/20 text-fuchsia-300 font-mono text-[11px] font-bold border border-fuchsia-500/35 uppercase">
              {event.category}
            </span>
            <h3 id="event-modal-title" className="text-2xl font-black font-display text-white mt-1.5">
              {event.title}
            </h3>
            <p className="text-xs text-fuchsia-300 font-mono">{event.tagline}</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Quick Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#020003]/80 border border-white/10 font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Schedule</span>
              <strong className="text-fuchsia-300 font-bold block">{event.date}</strong>
              <span className="text-[10px] text-slate-400">{event.time}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Venue</span>
              <strong className="text-white font-bold block truncate" title={event.venue}>
                {event.venue}
              </strong>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Prize Pool</span>
              <strong className="text-emerald-400 font-bold block">{event.prizes}</strong>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Team Size</span>
              <strong className="text-white font-bold block">{event.teamSize}</strong>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white font-display">Event Overview</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Rules */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white font-display">Rules &amp; Guidelines</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {event.rules.map((rule) => (
                <li key={rule} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Student Coordinators */}
          <div className="pt-2 border-t border-white/10 space-y-1.5 text-xs">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
              Event Student Coordinators
            </span>
            <div className="flex flex-wrap gap-4 text-slate-300 font-mono">
              {event.coordinators.map((c) => (
                <div key={`${c.name}-${c.contact}`} className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>{c.name}: {c.contact}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#050308] border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-mono text-slate-400">
            Schedule: <strong className="text-fuchsia-300">{event.date}</strong> ({event.time})
          </span>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Event Concluded (Sep 2026)</span>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs uppercase font-mono tracking-wider hover:bg-white/20 border border-white/15 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
