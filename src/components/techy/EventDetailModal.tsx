import React from 'react';
import { X, CheckCircle2, Ticket, Phone } from 'lucide-react';
import { FestEvent } from '../../data/techySheikhpuraData';

interface EventDetailModalProps {
  event: FestEvent | null;
  onClose: () => void;
  onRegister: (eventId: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose, onRegister }) => {
  if (!event) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative max-w-2xl w-full bg-navy-950 border border-cyan-500/40 rounded-3xl overflow-hidden shadow-2xl glass-card flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner with Image */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent"></div>

          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6">
            <span className="px-3 py-1 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-[11px] font-bold border border-cyan-500/30 uppercase">
              {event.category}
            </span>
            <h3 className="text-2xl font-black font-heading text-white mt-1">
              {event.title}
            </h3>
            <p className="text-xs text-cyan-400 font-mono">{event.tagline}</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Quick Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-navy-900 border border-white/10 font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Schedule</span>
              <strong className="text-cyan-300 font-bold block">{event.date}</strong>
              <span className="text-[10px] text-slate-400">{event.time}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Venue</span>
              <strong className="text-white font-bold block truncate">{event.venue}</strong>
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
            <h4 className="text-sm font-bold text-white font-heading">Event Overview</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Rules */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white font-heading">Rules & Guidelines</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {event.rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Student Coordinators */}
          <div className="pt-2 border-t border-white/10 space-y-1 text-xs">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
              Event Student Coordinators
            </span>
            <div className="flex flex-wrap gap-4 text-slate-300 font-mono">
              {event.coordinators.map((c, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{c.name}: {c.contact}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-navy-900 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">
            Entry: <strong className="text-cyan-300">{event.entryFee}</strong>
          </span>

          <button
            onClick={() => {
              onClose();
              onRegister(event.id);
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600 text-white font-bold text-xs uppercase font-mono tracking-wider hover:opacity-95 shadow-glow-cyan flex items-center gap-2"
          >
            <Ticket className="w-4 h-4" />
            Register for {event.title}
          </button>
        </div>
      </div>
    </div>
  );
};

