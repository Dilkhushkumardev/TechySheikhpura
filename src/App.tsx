import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { VerifyPassPage } from './pages/VerifyPassPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { TeamRegistrationPage } from './pages/TeamRegistrationPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Clean basename without trailing slash to prevent React Router v7 route matching failures on '/TechySheikhpura'
const rawBase = import.meta.env.BASE_URL || '/';
const routerBasename = rawBase.length > 1 && rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

/**
 * Handles legacy or hash-based routing formats (e.g. #/admin, #admin, #/events, #events)
 * ensuring deep-links from WhatsApp, bookmarks, and GitHub Pages hash links resolve correctly.
 */
const HashRouteHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    // Normalise hash target (strip leading '#/' or '#')
    const rawTarget = hash.startsWith('#/')
      ? hash.slice(2)
      : hash.startsWith('#')
        ? hash.slice(1)
        : '';
    if (!rawTarget) return;

    const [routePath, queryString] = rawTarget.split('?');
    const cleanRoute = routePath.toLowerCase().replace(/\/+$/, '');
    const query = queryString ? `?${queryString}` : '';

    if (['admin', 'desk', 'dashboard', 'admin-desk', 'login'].includes(cleanRoute)) {
      navigate(`/admin${query}`, { replace: true });
    } else if (['team-register', 'team-registration', 'register', 'registration', 'team'].includes(cleanRoute)) {
      navigate(`/team-register${query}`, { replace: true });
    } else if (['verify', 'verify-pass', 'certificate'].includes(cleanRoute)) {
      navigate(`/verify${query}`, { replace: true });
    } else if (['events', 'schedule', 'results', 'passes', 'contact', 'about', 'faqs', 'hero', 'clubs'].includes(cleanRoute)) {
      // In-page section anchor: if on a subpage, navigate to home first, then scroll
      if (location.pathname !== '/' && location.pathname !== '/home') {
        navigate('/', { replace: true });
      }
      setTimeout(() => {
        const el = document.getElementById(cleanRoute);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 120);
    }
  }, [navigate, location]);

  return null;
};

/**
 * Directly scrolls to the targeted section on HomePage when loaded via direct URL (e.g. /events, /passes)
 */
const SectionDirectHandler: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [sectionId]);

  return <HomePage />;
};

export const App: React.FC = () => {
  return (
    <Router basename={routerBasename}>
      <HashRouteHandler />
      <div className="relative min-h-screen bg-[#020003] text-white antialiased selection:bg-fuchsia-500/30 selection:text-white">
        {/* TechySheikhpura Fest Website Routes */}
        <Routes>
          {/* Main Fest Website & In-page Section Direct Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/events" element={<SectionDirectHandler sectionId="events" />} />
          <Route path="/schedule" element={<SectionDirectHandler sectionId="schedule" />} />
          <Route path="/results" element={<SectionDirectHandler sectionId="results" />} />
          <Route path="/passes" element={<SectionDirectHandler sectionId="passes" />} />
          <Route path="/contact" element={<SectionDirectHandler sectionId="contact" />} />
          <Route path="/about" element={<SectionDirectHandler sectionId="about" />} />
          <Route path="/faqs" element={<SectionDirectHandler sectionId="faqs" />} />
          <Route path="/clubs" element={<SectionDirectHandler sectionId="about" />} />

          {/* Delegate Pass Verification */}
          <Route path="/verify" element={<VerifyPassPage />} />
          <Route path="/verify-pass" element={<VerifyPassPage />} />
          <Route path="/verify/*" element={<VerifyPassPage />} />

          {/* Squad Registration & Aliases */}
          <Route path="/team-register" element={<TeamRegistrationPage />} />
          <Route path="/team-registration" element={<TeamRegistrationPage />} />
          <Route path="/register" element={<TeamRegistrationPage />} />
          <Route path="/registration" element={<TeamRegistrationPage />} />
          <Route path="/team" element={<TeamRegistrationPage />} />
          <Route path="/team-register/*" element={<TeamRegistrationPage />} />
          <Route path="/team-registration/*" element={<TeamRegistrationPage />} />

          {/* Admin & Organizer Desk & Aliases */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/*" element={<AdminDashboardPage />} />
          <Route path="/desk" element={<AdminDashboardPage />} />
          <Route path="/desk/*" element={<AdminDashboardPage />} />
          <Route path="/dashboard" element={<AdminDashboardPage />} />
          <Route path="/dashboard/*" element={<AdminDashboardPage />} />
          <Route path="/admin-desk" element={<AdminDashboardPage />} />
          <Route path="/login" element={<AdminDashboardPage />} />

          {/* Catch-all for unknown paths */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
