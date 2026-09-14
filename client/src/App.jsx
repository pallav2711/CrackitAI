import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import ResumeList from './pages/ResumeList';
import MockInterview from './pages/MockInterview';
import InterviewTaking from './pages/InterviewTaking';
import InterviewResults from './pages/InterviewResults';
import TestInterview from './pages/TestInterview';
import MockTests from './pages/MockTests';
import TestTaking from './pages/TestTaking';
import TestResults from './pages/TestResults';
import TestHistory from './pages/TestHistory';

import CompanyPrep from './pages/CompanyPrep';
import AICompanyPrep from './pages/AICompanyPrep';
import AIPrepPlanView from './pages/AIPrepPlanView';
import AIMentor from './pages/AIMentor';
import Analytics from './pages/Analytics';
import UnifiedAnalytics from './pages/UnifiedAnalytics';
import Leaderboard from './pages/Leaderboard';
import Reports from './pages/Reports';
import RedirectToDashboard from './components/common/RedirectToDashboard';
import Pricing from './pages/Pricing';
import Billing from './pages/Billing';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import InterviewSetup from './pages/InterviewSetup';
import VoiceInterviewSession from './pages/VoiceInterviewSession';
import Settings from './pages/Settings';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import RefundPolicy from './pages/legal/RefundPolicy';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import NotFound from './pages/NotFound';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <VercelAnalytics />
      <Routes>
        {/* Public Routes */}
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

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/resumes" element={<ProtectedRoute><ResumeList /></ProtectedRoute>} />
        <Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
        <Route path="/mock-interview" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
        <Route path="/test-interview" element={<ProtectedRoute><TestInterview /></ProtectedRoute>} />
        <Route path="/interview/:id" element={<ProtectedRoute><InterviewTaking /></ProtectedRoute>} />
        <Route path="/interview-results/:id" element={<ProtectedRoute><InterviewResults /></ProtectedRoute>} />
        <Route path="/mock-tests" element={<ProtectedRoute><MockTests /></ProtectedRoute>} />
        <Route path="/test/:id" element={<ProtectedRoute><TestTaking /></ProtectedRoute>} />
        <Route path="/test-results/:attemptId" element={<ProtectedRoute><TestResults /></ProtectedRoute>} />
        <Route path="/test-history" element={<ProtectedRoute><TestHistory /></ProtectedRoute>} />

        <Route path="/company-prep" element={<ProtectedRoute><CompanyPrep /></ProtectedRoute>} />
        <Route path="/ai-prep" element={<ProtectedRoute><AICompanyPrep /></ProtectedRoute>} />
        <Route path="/ai-prep/plan/:id" element={<ProtectedRoute><AIPrepPlanView /></ProtectedRoute>} />
        <Route path="/ai-mentor" element={<ProtectedRoute><AIMentor /></ProtectedRoute>} />
        
        {/* Analytics & Reports - Redirected to Dashboard */}
        <Route path="/analytics" element={<ProtectedRoute><RedirectToDashboard feature="Analytics" /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><RedirectToDashboard feature="Reports" /></ProtectedRoute>} />
        
        {/* Keep leaderboard as separate page */}
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

        {/* Billing */}
        <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />

        {/* Voice Interview */}
        <Route path="/interview/setup" element={<ProtectedRoute><InterviewSetup /></ProtectedRoute>} />
        <Route path="/interview/voice-session" element={<ProtectedRoute><VoiceInterviewSession /></ProtectedRoute>} />

        {/* Settings */}
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/payments" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        
        {/* Legacy routes for backward compatibility */}
        <Route path="/analytics-detailed" element={<ProtectedRoute><UnifiedAnalytics /></ProtectedRoute>} />
        <Route path="/analytics-old" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
