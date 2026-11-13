import React, { useState } from 'react';
import { HelpCircle, Send, CheckCircle, Loader2, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { ApiError, createInquiry, type InquiryRecord } from '../../services/api';

interface HelpdeskSectionProps {
  telegramUrl: string;
  contactEmail: string;
}

const SUBJECT_PRESETS = [
  'Pass Verification / Payment Query',
  'HackArena / Team Registration Help',
  'Robotics & Aero Arena Guidelines',
  'Campus Reporting & Accommodation',
  'Other Fest Support Query',
];

export const HelpdeskSection: React.FC<HelpdeskSectionProps> = ({
  telegramUrl,
  contactEmail,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [subject, setSubject] = useState(SUBJECT_PRESETS[0]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<InquiryRecord | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please enter your name, email, and query details.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const { inquiry } = await createInquiry({
        name: name.trim(),
        email: email.trim(),
        rollNo: rollNo.trim() || undefined,
        subject,
        message: message.trim(),
      });
      setSubmittedTicket(inquiry);
      setName('');
      setEmail('');
      setRollNo('');
      setMessage('');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to reach backend helpdesk right now. Reach us on Telegram or email below.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative z-10 scroll-mt-28"
    >
      <div className="rounded-3xl bg-[#0b0b11]/90 border border-emerald-500/30 hover:border-emerald-500/40 glass-card p-6 sm:p-10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start transition-all">
        {/* Left Copy */}
        <div className="lg:col-span-5 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/35 text-emerald-300 font-mono text-[11px] font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Student Helpdesk &amp; Desk Support</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black font-display text-white leading-tight">
            Need Help? <span className="text-gradient-techverse">Ask Organizers</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            Submit any query regarding delegate passes, team size changes, hardware power requirements, or event schedules. All tickets are stored directly in the TechySheikhpura SQLite desk queue.
          </p>

          <div className="space-y-3 pt-2 text-xs font-mono">
            <div className="p-3.5 rounded-2xl bg-[#050308] border border-white/10 hover:border-emerald-500/35 transition-colors">
              <span className="text-[10px] text-slate-400 uppercase block">Official Support Email</span>
              <a
                href={`mailto:${contactEmail}`}
                className="text-emerald-400 hover:text-white font-bold transition-colors"
              >
                {contactEmail}
              </a>
            </div>
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-500/10 border border-sky-400/25 text-sky-300 hover:bg-sky-500/15 transition-colors"
            >
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Instant Updates Channel</span>
                <strong className="text-xs font-bold text-white">Join GEC Sheikhpura Telegram</strong>
              </div>
              <ArrowUpRight className="w-4 h-4 shrink-0" />
            </a>
          </div>
        </div>

        {/* Right Form */}
        <div className="lg:col-span-7">
          {submittedTicket ? (
            <div className="p-6 sm:p-8 rounded-2xl bg-[#050308] border border-emerald-500/40 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-heading text-white">
                Query Logged — Ticket #{submittedTicket.id}
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Saved for <strong>{submittedTicket.name}</strong> ({submittedTicket.email}) under{' '}
                <span className="text-fuchsia-300">{submittedTicket.subject}</span>. Our coordinator desk will review it shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmittedTicket(null)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono font-bold text-white transition-colors"
              >
                Submit Another Query
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {error && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 font-mono flex items-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="inq-name" className="block text-slate-300 mb-1 font-medium">
                    Your Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="inq-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aditya Raj"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003]/85 border border-white/15 text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/25 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="inq-roll" className="block text-slate-300 mb-1 font-medium">
                    Roll No. (Optional)
                  </label>
                  <input
                    id="inq-roll"
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="e.g. 23105147042"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003]/85 border border-white/15 text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/25 focus:outline-none font-mono transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="inq-email" className="block text-slate-300 mb-1 font-medium">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="inq-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@gecsheikhpura.ac.in"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003]/85 border border-white/15 text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/25 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="inq-subject" className="block text-slate-300 mb-1 font-medium">
                    Topic / Desk
                  </label>
                  <select
                    id="inq-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003] border border-white/15 text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/25 focus:outline-none transition-all"
                  >
                    {SUBJECT_PRESETS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="inq-message" className="block text-slate-300 mb-1 font-medium">
                  Message <span className="text-rose-400">*</span>
                </label>
                <textarea
                  id="inq-message"
                  rows={3}
                  required
                  minLength={10}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your question or team update clearly..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#020003]/85 border border-white/15 text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/25 focus:outline-none resize-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 text-white font-bold font-mono uppercase tracking-wider hover:opacity-95 disabled:opacity-60 shadow-glow-fuchsia inline-flex items-center justify-center gap-2 transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending to Desk...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Support Ticket</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

