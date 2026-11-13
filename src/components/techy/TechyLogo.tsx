import React from 'react';

interface TechyLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const TechyLogo: React.FC<TechyLogoProps> = ({
  className = '',
  size = 44,
  glow = true,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-label="Techy Sheikhpura Official Logo"
    >
      {/* Ambient Pulsing Glow behind emblem */}
      {glow && (
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-fuchsia-600/40 via-purple-600/30 to-cyan-500/30 blur-md pointer-events-none -z-10 animate-pulse"
          style={{ transform: 'scale(1.15)' }}
        />
      )}

      {/* Official Master Vector Emblem */}
      <svg
        viewBox="0 0 512 512"
        width="100%"
        height="100%"
        className="w-full h-full drop-shadow-[0_2px_12px_rgba(212,93,140,0.45)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="shieldBgComp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#120521" />
            <stop offset="50%" stopColor="#07020d" />
            <stop offset="100%" stopColor="#030008" />
          </linearGradient>

          <linearGradient id="neonGradComp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff1b8d" />
            <stop offset="45%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#00f2fe" />
          </linearGradient>

          <linearGradient id="borderGradComp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff2a85" />
            <stop offset="50%" stopColor="#c026d3" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          <radialGradient id="coreGlowComp" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff1b8d" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#a855f7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00f2fe" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Cyber Shield Body */}
        <path
          d="M 256,38 L 442,108 L 442,284 C 442,374 346,446 256,474 C 166,446 70,374 70,284 L 70,108 Z"
          fill="url(#shieldBgComp)"
          stroke="url(#borderGradComp)"
          strokeWidth="10"
          strokeLinejoin="round"
        />

        {/* Inner Tech Inset Contour */}
        <path
          d="M 256,58 L 420,120 L 420,274 C 420,352 334,420 256,446 C 178,420 92,352 92,274 L 92,120 Z"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.16"
          strokeWidth="3"
          strokeDasharray="16 10"
        />

        {/* Circuit Trace: Top Left */}
        <path
          d="M 172,165 L 126,132 L 102,132"
          fill="none"
          stroke="#00f2fe"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <circle cx="102" cy="132" r="7" fill="#00f2fe" />

        {/* Circuit Trace: Top Right */}
        <path
          d="M 340,165 L 386,132 L 410,132"
          fill="none"
          stroke="#ff2a85"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <circle cx="410" cy="132" r="7" fill="#ff2a85" />

        {/* Circuit Trace: Bottom Nodes */}
        <path
          d="M 256,396 L 256,428"
          fill="none"
          stroke="#00f2fe"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="256" cy="428" r="6" fill="#00f2fe" />

        {/* Central Radial Core */}
        <circle cx="256" cy="245" r="105" fill="url(#coreGlowComp)" />

        {/* "T" Crossbar */}
        <path
          d="M 152,154 L 360,154 L 372,176 L 350,192 L 162,192 L 140,176 Z"
          fill="#ff2a85"
          stroke="#ffffff"
          strokeWidth="2"
          strokeOpacity="0.4"
        />

        {/* "T" & "S" Interlocking Monogram Ribbon */}
        <path
          d="M 344,204 C 344,196 312,192 256,192 C 198,192 170,224 170,252 C 170,286 216,298 266,308 C 322,319 346,336 346,368 C 346,406 304,424 256,424 C 204,424 168,402 166,378 L 206,370 C 208,382 226,394 256,394 C 286,394 306,382 306,366 C 306,346 276,338 232,328 C 182,316 130,298 130,252 C 130,204 182,166 256,166 C 316,166 352,194 352,220 Z"
          fill="url(#neonGradComp)"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeOpacity="0.4"
        />

        {/* Quantum Core Nexus Spark (4-Pointed Star) */}
        <path
          d="M 256,204 Q 256,238 290,238 Q 256,238 256,272 Q 256,238 222,238 Q 256,238 256,204 Z"
          fill="#ffffff"
        />
        <circle cx="256" cy="238" r="6" fill="#00f2fe" />

        {/* Micro GECS Brand Tag at Base */}
        <g transform="translate(256, 452)">
          <rect
            x="-44"
            y="-13"
            width="88"
            height="21"
            rx="7"
            fill="#090412"
            stroke="#a855f7"
            strokeWidth="1.8"
          />
          <text
            x="0"
            y="2"
            fontFamily="'JetBrains Mono', 'Segoe UI', monospace"
            fontSize="12"
            fontWeight="900"
            fill="#e2e8f0"
            textAnchor="middle"
            letterSpacing="4"
          >
            GECS
          </text>
        </g>
      </svg>
    </div>
  );
};
