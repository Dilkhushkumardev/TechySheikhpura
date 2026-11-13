import React, { useState, useEffect } from 'react';

// Target: Sep 28, 2026, 09:00:00 AM IST (Event Concluded)
const TARGET_TIMESTAMP = new Date('2026-09-28T09:00:00+05:30').getTime();

export const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      const difference = TARGET_TIMESTAMP - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const units = [
    { label: 'DAYS', value: String(timeLeft.days).padStart(2, '0') },
    { label: 'HOURS', value: String(timeLeft.hours).padStart(2, '0') },
    { label: 'MINUTES', value: String(timeLeft.minutes).padStart(2, '0') },
    { label: 'SECONDS', value: String(timeLeft.seconds).padStart(2, '0') },
  ];

  return (
    <div className="relative inline-flex flex-col items-center p-3 sm:p-5 rounded-2xl bg-[#0b0b11]/85 backdrop-blur-2xl border border-white/15 shadow-2xl">
      {/* Top Status Header */}
      <div className="flex items-center gap-2 mb-3 text-[11px] font-mono text-fuchsia-400 font-bold uppercase tracking-wider">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500"></span>
        </span>
        <span>HACKATHON &amp; ARENAS • EVENT CONCLUDED (SEP 2026)</span>
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-4 font-mono">
        {units.map((u, idx) => (
          <React.Fragment key={u.label}>
            <div className="flex flex-col items-center">
              <div className="w-16 h-20 sm:w-24 sm:h-24 rounded-2xl bg-black/70 border border-white/20 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent"></div>

                <span className="text-3xl sm:text-4xl font-black text-white font-display tracking-widest drop-shadow-md">
                  {u.value}
                </span>

                <div className="absolute bottom-1 text-[9px] text-slate-500 font-mono">
                  0{idx + 1}
                </div>
              </div>

              <span className="text-[10px] sm:text-xs text-white/80 font-bold uppercase tracking-widest mt-2 font-mono">
                {u.label}
              </span>
            </div>

            {idx < units.length - 1 && (
              <span className="text-2xl sm:text-3xl text-fuchsia-400/70 font-bold -mt-6 animate-pulse">
                :
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Concluded Edition Badge */}
      <div className="mt-3.5 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/25 text-fuchsia-300 font-mono text-[10px] sm:text-[11px] font-bold tracking-wider uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        <span>14+ Arenas Completed • Results Declared</span>
      </div>
    </div>
  );
};
