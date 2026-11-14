import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { VerifyPassPage } from './pages/VerifyPassPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { TeamRegistrationPage } from './pages/TeamRegistrationPage';
import { NotFoundPage } from './pages/NotFoundPage';

const HashRouteHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (window.location.hash.startsWith('#/')) {
      const target = window.location.hash.slice(1);
      navigate(target, { replace: true });
    }
  }, [navigate, location]);

  return null;
};

export const App: React.FC = () => {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <HashRouteHandler />
      <div className="relative min-h-screen bg-[#020003] text-white antialiased selection:bg-fuchsia-500/30 selection:text-white">
        {/* TechySheikhpura Fest Website Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/verify" element={<VerifyPassPage />} />
          <Route path="/team-register" element={<TeamRegistrationPage />} />
          <Route path="/team-registration" element={<TeamRegistrationPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
