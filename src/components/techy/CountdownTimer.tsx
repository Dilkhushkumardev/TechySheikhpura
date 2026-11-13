import React, { useState, useEffect } from 'react';

// Target: Sep 28, 2026, 09:00:00 AM IST (Event Concluded in September)
const TARGET_TIMESTAMP = new Date('2026-09-28T09:00:00+05:30').getTime();

export const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isEnded, setIsEnded] = useState(true);

  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      const difference = TARGET_TIMESTAMP - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsEnded(true);
        return;
      }

      setIsEnded(false);
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
      <div className={`flex items-center gap-2 mb-3 text-[11px] font-mono font-bold uppercase tracking-wider ${
        isEnded ? 'text-emerald-400' : 'text-fuchsia-400'
      }`}>
        <span className="flex h-2 w-2 relative">
          {!isEnded && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            isEnded ? 'bg-emerald-400' : 'bg-fuchsia-500'
          }`}></span>
        </span>
        <span>
          {isEnded ? 'EVENT CONCLUDED • SEPTEMBER 28–29, 2026' : 'HACKATHON & ARENAS COUNTDOWN'}
        </span>
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-4 font-mono">
        {units.map((u, idx) => (
          <React.Fragment key={u.label}>
            <div className="flex flex-col items-center">
              <div className={`w-16 h-20 sm:w-24 sm:h-24 rounded-2xl bg-black/70 border flex items-center justify-center relative overflow-hidden group ${
                isEnded ? 'border-emerald-500/30' : 'border-white/20'
              }`}>
                <div className={`absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent ${
                  isEnded ? 'via-emerald-400' : 'via-fuchsia-400'
                }`}></div>

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
              <span className={`text-2xl sm:text-3xl font-bold -mt-6 ${
                isEnded ? 'text-emerald-400/70' : 'text-fuchsia-400/70 animate-pulse'
              }`}>
                :
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      {isEnded && (
        <div className="mt-3.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-bold text-center flex items-center gap-2">
          <span>🏆</span>
          <span>Successfully Ended in September • 14 Arenas Completed • Results Declared</span>
        </div>
      )}
    </div>
  );
};
