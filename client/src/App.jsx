import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';

// Pages — public
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Pricing from './pages/Pricing';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import RefundPolicy from './pages/legal/RefundPolicy';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';

// Pages — protected
import Dashboard from './pages/Dashboard';
import JobDashboard from './pages/JobDashboard';
import JobWorkspace from './pages/JobWorkspace';
import QuizPage from './pages/QuizPage';
import OnboardingFlow from './pages/OnboardingFlow';
import ResumeBuilder from './pages/ResumeBuilder';
import ResumeList from './pages/ResumeList';
import Leaderboard from './pages/Leaderboard';
import Billing from './pages/Billing';
import InterviewSetup from './pages/InterviewSetup';
import VoiceInterviewSession from './pages/VoiceInterviewSession';
import InterviewResults from './pages/InterviewResults';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import RedirectToDashboard from './components/common/RedirectToDashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <VercelAnalytics />
      <Routes>
        {/* ── Public ────────────────────────────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />

        {/* ── Core protected ─────────────────────────────────────────── */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* Job Readiness Platform */}
        <Route path="/jobs" element={<ProtectedRoute><JobDashboard /></ProtectedRoute>} />
        <Route path="/workspace/:id" element={<ProtectedRoute><JobWorkspace /></ProtectedRoute>} />
        <Route path="/quiz/:jobId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingFlow /></ProtectedRoute>} />

        {/* Resume */}
        <Route path="/resumes" element={<ProtectedRoute><ResumeList /></ProtectedRoute>} />
        <Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />

        {/* Leaderboard */}
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

        {/* Billing */}
        <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />

        {/* Voice Interview */}
        <Route path="/interview/setup" element={<ProtectedRoute><InterviewSetup /></ProtectedRoute>} />
        <Route path="/interview/voice-session" element={<ProtectedRoute><VoiceInterviewSession /></ProtectedRoute>} />
        <Route path="/interview-results/:id" element={<ProtectedRoute><InterviewResults /></ProtectedRoute>} />

        {/* Settings */}
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/payments" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

        {/* Legacy redirects */}
        <Route path="/analytics" element={<ProtectedRoute><RedirectToDashboard feature="Analytics" /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><RedirectToDashboard feature="Reports" /></ProtectedRoute>} />
        <Route path="/analytics-detailed" element={<ProtectedRoute><RedirectToDashboard feature="Analytics" /></ProtectedRoute>} />
        <Route path="/analytics-old" element={<ProtectedRoute><RedirectToDashboard feature="Analytics" /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
