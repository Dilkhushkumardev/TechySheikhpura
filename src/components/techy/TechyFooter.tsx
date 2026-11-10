import React from 'react';
import { FEST_INFO } from '../../data/techySheikhpuraData';

export const TechyFooter: React.FC = () => {
  return (
    <footer className="section-shell pt-16 sm:pt-20 bg-[#020003]">
      {/* Exact TechVerse Background Crowd Illustration */}
      <img
        src="/footer-bg.png"
        alt="Tech fest crowd"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      
      {/* Top Gradient Fade to seamless black */}
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#020003] to-transparent pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" />
      
      {/* Bottom Gradient Fade */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#020003] to-transparent pointer-events-none" />

      {/* Main Content Inner Container (Exact TechVerse section-inner) */}
      <div className="wh-[32rem] section-inner relative pt-16 text-center sm:pt-20 pb-10">
        
        {/* Main Title: Syne Font, wide letter-spacing, centered */}
        <h2 className="font-display text-3xl font-semibold tracking-widest text-white sm:text-6xl md:text-7xl lg:text-8xl select-none">
          Techy Sheikhpura `26
        </h2>

        {/* Made with lots of ❤️ by WhatsApp pill */}
        <p className="font-condensed mt-4 text-base font-semibold uppercase tracking-[0.14em] text-white/90 sm:text-2xl flex flex-wrap items-center justify-center gap-2">
          <span>Made with lots of ❤ by</span>
          <a
            href={FEST_INFO.contacts.whatsapp}
            target="_blank"
            rel="noreferrer"
            aria-label="TechySheikhpura WhatsApp"
            className="font-condensed inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/35 px-3.5 py-1 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:border-white/55 hover:bg-black/50 sm:text-base backdrop-blur-sm"
          >
            {/* WhatsApp SVG Icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
              <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
              <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
            </svg>
            <span>TechySheikhpura</span>
          </a>
        </p>

        {/* Social Link Pills: Instagram & LinkedIn */}
        <p className="font-condensed mt-2 sm:mt-4 flex flex-wrap items-center justify-center gap-3 text-base font-semibold uppercase tracking-[0.14em] text-white/90 sm:text-2xl">
          <a
            href={FEST_INFO.contacts.instagram}
            target="_blank"
            rel="noreferrer"
            aria-label="TechySheikhpura Instagram"
            className="font-condensed inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/35 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:border-white/55 hover:bg-black/50 sm:text-base backdrop-blur-sm"
          >
            {/* Instagram SVG */}
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
              <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
            </svg>
            <span>Instagram</span>
          </a>

          <a
            href="https://www.linkedin.com/school/government-engineering-college-sheikhpura/"
            target="_blank"
            rel="noreferrer"
            aria-label="GEC Sheikhpura LinkedIn"
            className="font-condensed inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/35 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:border-white/55 hover:bg-black/50 sm:text-base backdrop-blur-sm"
          >
            {/* LinkedIn SVG */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
            <span>LinkedIn</span>
          </a>
        </p>

        {/* Divider & Contact Bar */}
        <div className="sm:mt-10 mt-6 border-t border-white/20 pt-6">
          <div className="flex flex-col items-center gap-4 text-white/70 lg:flex-row lg:justify-between font-condensed text-base uppercase tracking-[0.14em]">
            <p>
              Contact:{' '}
              <a href="tel:+919876543210" className="hover:text-white transition-colors">
                Aryan
              </a>{' '}
              |{' '}
              <a href="tel:+919876543212" className="hover:text-white transition-colors">
                Aditya
              </a>{' '}
              |{' '}
              <a href="tel:+919876543213" className="hover:text-white transition-colors">
                Vikash
              </a>
            </p>
            <div>
              <p>All rights reserved.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Massive Outlined Typography at Bottom (Exact TechVerse Style, visible on all screens) */}
      <div className="mb-0 block pb-2 sm:pb-4">
        <h1 
          className="text-center font-display text-4xl sm:text-6xl md:text-7xl lg:text-[7.25rem] font-bold uppercase tracking-widest text-transparent leading-none select-none"
          style={{
            WebkitTextStroke: '2px rgb(116, 108, 116)',
            filter: 'drop-shadow(0 0 20px rgba(215, 57, 255, 0.1))'
          }}
        >
          GEC SHEIKHPURA
        </h1>
      </div>
    </footer>
  );
};