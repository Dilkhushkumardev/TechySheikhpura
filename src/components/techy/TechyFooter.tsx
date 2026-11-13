import React from 'react';
import { FEST_INFO, FEST_ORGANIZERS, type OrganizerMember } from '../../data/techySheikhpuraData';
import { TechyLogo } from './TechyLogo';

interface TechyFooterProps {
  telegramUrl?: string;
  footerContacts?: OrganizerMember[];
}

export const TechyFooter: React.FC<TechyFooterProps> = ({
  telegramUrl = FEST_INFO.contacts.telegram,
  footerContacts,
}) => {
  const contactsList =
    footerContacts && footerContacts.length > 0
      ? footerContacts
      : FEST_ORGANIZERS.filter((member) => member.featuredFooter);

  return (
    <footer className="section-shell pt-16 sm:pt-20 bg-[#020003]">
      {/* Custom AI-Generated TechySheikhpura Twilight Footer Illustration */}
      <img
        src={`${import.meta.env.BASE_URL}footer-bg.jpg`}
        alt="Four engineering students collaborating around a glowing holographic orb under a purple twilight sky"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      
      {/* Top Gradient Fade to seamless black */}
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#020003] to-transparent pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" />
      
      {/* Bottom Gradient Fade */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#020003] to-transparent pointer-events-none" />

      {/* Main Content Inner Container (Exact TechVerse section-inner) */}
      <div className="section-inner relative pt-16 text-center sm:pt-20 pb-10">
        
        {/* Official Brand Logo */}
        <div className="flex justify-center mb-5">
          <TechyLogo size={64} glow={true} />
        </div>

        {/* Main Title: Oxanium Display Font, wide tracking, centered */}
        <h2 className="font-display text-3xl font-bold tracking-wider text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl select-none drop-shadow-[0_4px_24px_rgba(217,70,239,0.28)]">
          Techy Sheikhpura &apos;26
        </h2>

        {/* Footer Credit */}
        <p className="font-condensed mt-4 text-lg font-semibold uppercase tracking-[0.16em] text-fuchsia-100/95 sm:text-2xl">
          Made With Team Hunter From GEC SHEIKHPURA
        </p>

        {/* Social Link Pill: Telegram */}
        <p className="font-condensed mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-3 text-base font-semibold uppercase tracking-[0.14em] text-white/90 sm:text-2xl">
          <a
            href={telegramUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="TechySheikhpura Telegram"
            className="font-condensed inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/35 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:border-white/55 hover:bg-black/50 sm:text-base backdrop-blur-sm"
          >
            {/* Telegram SVG */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
              <path d="M21 5 2 12.5l7 1.5M21 5l-2.5 15L9 14M21 5 9 14m0 0v5l3.249-3.277" />
            </svg>
            <span>Telegram</span>
          </a>
        </p>

        {/* Divider & Contact Bar */}
        <div className="sm:mt-10 mt-6 border-t border-white/20 pt-6">
          <div className="flex flex-col items-center gap-4 text-white/70 lg:flex-row lg:justify-between font-condensed text-base uppercase tracking-[0.14em]">
            <p>
              Contact:{' '}
              {contactsList.map((member, index) => (
                <React.Fragment key={member.id}>
                  {index > 0 && ' | '}
                  <a
                    href={`tel:${member.phone.replace(/\s+/g, '')}`}
                    className="hover:text-white transition-colors"
                  >
                    {member.name}
                  </a>
                </React.Fragment>
              ))}
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