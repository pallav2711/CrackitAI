import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Calendar, Target, Clock, BookOpen, TrendingUp,
  Zap, Award, Users, Globe, ChevronRight, Plus,
  Filter, Search, Grid, List, Star, Building2
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import AICompanyCard from '../components/ai-prep/AICompanyCard';
import CreatePlanModal from '../components/ai-prep/CreatePlanModal';
import ActivePlansWidget from '../components/ai-prep/ActivePlansWidget';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const AICompanyPrep = () => {
  // Feature is currently locked
  const isFeatureLocked = true;

  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuthStore();
  const [companies, setCompanies] = useState([]);
  const [activePlans, setActivePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    industry: 'all',
    difficulty: 'all'
  });
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    if (!isFeatureLocked) {
      fetchCompanies();
      fetchActivePlans();
    }
  }, [filters, isFeatureLocked]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(filters);

      const headers = token ? {
        'Authorization': `Bearer ${token}`
      } : {};

      const response = await fetch(`/api/ai-prep/companies?${queryParams}`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setCompanies(data.data.companies);
      } else {
        console.error('Failed to fetch companies:', response.status);
        toast.error('Failed to load companies');
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivePlans = async () => {
    try {
      if (!isAuthenticated || !token) {
        // User not logged in, skip fetching plans
        return;
      }

      const response = await fetch('/api/ai-prep/plans?status=Active', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setActivePlans(data.data.plans);
      } else if (response.status === 401) {
        console.log('User not authenticated, skipping active plans');
      }
    } catch (error) {
      console.error('Error fetching active plans:', error);
    }
  };

  const handleCreatePlan = (company) => {
    setSelectedCompany(company);
    setShowCreateModal(true);
  };

  const handlePlanCreated = (newPlan) => {
    setActivePlans(prev => [...prev, newPlan]);
    setShowCreateModal(false);
    setSelectedCompany(null);
    toast.success('AI preparation plan created successfully!');
    navigate(`/ai-prep/plan/${newPlan._id}`);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const industries = [
    { value: 'all', label: 'All Industries' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Consulting', label: 'Consulting' },
    { value: 'E-commerce', label: 'E-commerce' },
    { value: 'Automotive', label: 'Automotive' }
  ];

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'Easy', label: 'Easy' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Hard', label: 'Hard' }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Feature Locked Message */}
        {isFeatureLocked ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-2xl mx-auto"
            >
              <div className="mb-8">
                <div className="w-24 h-24 bg-nb-black text-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-12 h-12 text-nb-blue" />
                </div>
                <h1 className="text-4xl font-bold text-nb-black mb-4">
                  AI-Powered Company Preparation
                </h1>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-nb-yellow/20 text-nb-black rounded-full text-sm font-semibold mb-6">
                  <Clock className="w-4 h-4" />
                  Coming Soon
                </div>
              </div>
              
              <div className="nb-card-compat bg-nb-black text-white border-2 border-nb-blue/30 p-8">
                <h2 className="text-2xl font-bold text-nb-black mb-4">
                  🤖 AI-Powered Features Under Development
                </h2>
                <p className="text-lg text-nb-black/55 mb-6">
                  We're building an intelligent preparation system that will revolutionize how you prepare for company interviews. 
                  This advanced feature will include:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-nb-blue rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-semibold text-nb-black">Smart Scheduling</h3>
                      <p className="text-sm text-nb-black/55">AI creates personalized daily schedules</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-nb-blue rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-semibold text-nb-black">Adaptive Learning</h3>
                      <p className="text-sm text-nb-black/55">Plans adjust based on your progress</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-nb-blue rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-semibold text-nb-black">Custom Content</h3>
                      <p className="text-sm text-nb-black/55">AI generates company-specific materials</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-nb-blue rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-semibold text-nb-black">Progress Analytics</h3>
                      <p className="text-sm text-nb-black/55">Detailed insights and recommendations</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-nb-black/55 mb-4">
                    While we perfect this AI experience, try our other powerful features:
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <a href="/mock-interview" className="btn btn-primary">
                      Mock Interviews
                    </a>
                    <a href="/mock-tests" className="btn btn-secondary">
                      Practice Tests
                    </a>
                    <a href="/ai-mentor" className="btn btn-secondary">
                      AI Mentor
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Original content would go here when feature is unlocked */}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AICompanyPrep;