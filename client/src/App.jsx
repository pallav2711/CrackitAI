import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';

// Pages — public
import LandingPage     from './pages/LandingPage';
import Login           from './pages/Login';
import Register        from './pages/Register';
import Pricing         from './pages/Pricing';
import Checkout        from './pages/Checkout';
import PaymentSuccess  from './pages/PaymentSuccess';
import PaymentFailed   from './pages/PaymentFailed';
import PrivacyPolicy   from './pages/legal/PrivacyPolicy';
import TermsOfService  from './pages/legal/TermsOfService';
import RefundPolicy    from './pages/legal/RefundPolicy';
import AboutUs         from './pages/AboutUs';
import Contact         from './pages/Contact';

// Pages — protected (4 core features)
import Dashboard       from './pages/Dashboard';
import ResumeList      from './pages/ResumeList';
import ResumeBuilder   from './pages/ResumeBuilder';
import JobDashboard    from './pages/JobDashboard';
import JobWorkspace    from './pages/JobWorkspace';
import QuizPage        from './pages/QuizPage';
import OnboardingFlow  from './pages/OnboardingFlow';

// Other protected
import Leaderboard     from './pages/Leaderboard';
import Billing         from './pages/Billing';
import Settings        from './pages/Settings';
import AdminDashboard  from './pages/AdminDashboard';

// Components
import ProtectedRoute       from './components/common/ProtectedRoute';
import RedirectToDashboard  from './components/common/RedirectToDashboard';
import NotFound             from './pages/NotFound';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <VercelAnalytics />
      <Routes>
        {/* ── Public ─────────────────────────────────────────────────── */}
        <Route path="/"                  element={<LandingPage />} />
        <Route path="/login"             element={<Login />} />
        <Route path="/register"          element={<Register />} />
        <Route path="/pricing"           element={<Pricing />} />
        <Route path="/checkout"          element={<Checkout />} />
        <Route path="/payment/success"   element={<PaymentSuccess />} />
        <Route path="/payment/failed"    element={<PaymentFailed />} />
        <Route path="/privacy-policy"    element={<PrivacyPolicy />} />
        <Route path="/terms-of-service"  element={<TermsOfService />} />
        <Route path="/refund-policy"     element={<RefundPolicy />} />
        <Route path="/about-us"          element={<AboutUs />} />
        <Route path="/contact"           element={<Contact />} />

        {/* ── Core: 4 features ───────────────────────────────────────── */}
        {/* 1. Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* 2. Resume Builder */}
        <Route path="/resumes"         element={<ProtectedRoute><ResumeList /></ProtectedRoute>} />
        <Route path="/resume-builder"  element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />

        {/* 3. JD Matcher (Job Workspace) */}
        <Route path="/jobs"             element={<ProtectedRoute><JobDashboard /></ProtectedRoute>} />
        <Route path="/workspace/:id"    element={<ProtectedRoute><JobWorkspace /></ProtectedRoute>} />
        <Route path="/onboarding"       element={<ProtectedRoute><OnboardingFlow /></ProtectedRoute>} />

        {/* 4. Quiz */}
        <Route path="/quiz/:jobId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />

        {/* ── Supporting ─────────────────────────────────────────────── */}
        <Route path="/leaderboard"      element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/billing"          element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/settings"         element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/admin/payments"   element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

        {/* Legacy redirects → dashboard */}
        <Route path="/analytics"           element={<ProtectedRoute><RedirectToDashboard feature="Analytics" /></ProtectedRoute>} />
        <Route path="/reports"             element={<ProtectedRoute><RedirectToDashboard feature="Reports" /></ProtectedRoute>} />
        <Route path="/analytics-detailed"  element={<ProtectedRoute><RedirectToDashboard feature="Analytics" /></ProtectedRoute>} />
        <Route path="/interview/setup"     element={<ProtectedRoute><RedirectToDashboard feature="Voice Interview" /></ProtectedRoute>} />
        <Route path="/interview/*"         element={<ProtectedRoute><RedirectToDashboard feature="Voice Interview" /></ProtectedRoute>} />
        <Route path="/interview-results/*" element={<ProtectedRoute><RedirectToDashboard feature="Interview Results" /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
