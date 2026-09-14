import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Search, Filter, Grid, List, TrendingUp,
  Star, Clock, Users, Target, Award, BookOpen,
  ChevronDown, ChevronUp, ArrowRight, Zap, Trophy,
  BarChart3, Calendar, MapPin, Globe, Briefcase
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import useCompanyStore from '../store/companyStore';
import toast from 'react-hot-toast';

const CompanyPrep = () => {
  // Feature is currently locked
  const isFeatureLocked = true;

  const {
    companies,
    trendingCompanies,
    dashboardStats,
    filters,
    pagination,
    loading,
    errors,
    fetchCompanies,
    fetchTrendingCompanies,
    fetchDashboardStats,
    setFilters,
    searchCompanies
  } = useCompanyStore();

  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  // Fetch initial data only if feature is not locked
  useEffect(() => {
    if (!isFeatureLocked) {
      fetchCompanies();
      fetchTrendingCompanies();
      fetchDashboardStats();
    }
  }, [isFeatureLocked]);

  // Handle search
  const handleSearch = async (query) => {
    if (query.length > 2) {
      try {
        const results = await searchCompanies(query);
        setSearchResults(results);
        setShowSearch(true);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setShowSearch(false);
      setSearchResults([]);
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value });
    fetchCompanies({ [key]: value, page: 1 });
  };

  // Handle pagination
  const handlePageChange = (page) => {
    fetchCompanies({ page });
  };

  // Industries for filter
  const industries = [
    'All', 'Technology', 'Finance', 'Healthcare', 
    'Consulting', 'E-commerce', 'Automotive', 'Other'
  ];

  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'questions', label: 'Most Questions' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'newest', label: 'Newest' }
  ];

  const CompanyCard = ({ company, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Link to={`/company-prep/${company.slug}`}>
        <div className="nb-card-compat transition-all duration-300 relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-nb-black text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl group-hover:scale-110 transition-transform">
                  {company.logo}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-nb-black group-hover:text-nb-black transition-colors">
                    {company.name}
                  </h3>
                  <p className="text-sm text-nb-black/45">{company.industry}</p>
                </div>
              </div>
              
              {company.isFeatured && (
                <div className="flex items-center gap-1 px-2 py-1 bg-nb-yellow/20 text-nb-black rounded-full text-xs font-semibold">
                  <Star className="w-3 h-3" />
                  Featured
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-[#F5F1E8] rounded-lg group-hover:bg-white transition-colors">
                <div className="text-2xl font-bold text-nb-black">
                  {company.stats?.totalQuestions || 0}
                </div>
                <div className="text-xs text-nb-black/55">Questions</div>
              </div>
              <div className="text-center p-3 bg-[#F5F1E8] rounded-lg group-hover:bg-white transition-colors">
                <div className="text-2xl font-bold text-nb-green">
                  {company.userProgress?.progress || 0}%
                </div>
                <div className="text-xs text-nb-black/55">Progress</div>
              </div>
            </div>

            {/* Difficulty & Rating */}
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                company.difficulty === 'Easy' ? 'bg-nb-green/10 text-nb-green' :
                company.difficulty === 'Medium' ? 'bg-nb-yellow/20 text-nb-black' :
                'bg-nb-red/10 text-nb-red'
              }`}>
                {company.difficulty}
              </span>
              
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-semibold">
                  {company.stats?.averageRating?.toFixed(1) || '0.0'}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-nb-black/55 text-sm mb-4 line-clamp-2">
              {company.description}
            </p>

            {/* Progress bar */}
            {company.userProgress?.progress > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-nb-black/45">Your Progress</span>
                  <span className="font-semibold">{company.userProgress.progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${company.userProgress.progress}%` }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                    className="h-full bg-nb-black text-white"
                  />
                </div>
              </div>
            )}

            {/* Action button */}
            <button className="w-full btn-primary group-hover:bg-nb-black transition-colors flex items-center justify-center gap-2">
              <span>Start Preparation</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );

  const CompanyListItem = ({ company, index }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ x: 5 }}
    >
      <Link to={`/company-prep/${company.slug}`}>
        <div className="nb-card-compat hover:shadow-lg transition-all group">
          <div className="flex items-center gap-4">
            <div className="text-3xl group-hover:scale-110 transition-transform">
              {company.logo}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-nb-black group-hover:text-nb-black transition-colors">
                  {company.name}
                </h3>
                {company.isFeatured && (
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                )}
              </div>
              <p className="text-sm text-nb-black/45 mb-2">{company.industry}</p>
              <div className="flex items-center gap-4 text-sm text-nb-black/55">
                <span>{company.stats?.totalQuestions || 0} questions</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  company.difficulty === 'Easy' ? 'bg-nb-green/10 text-nb-green' :
                  company.difficulty === 'Medium' ? 'bg-nb-yellow/20 text-nb-black' :
                  'bg-nb-red/10 text-nb-red'
                }`}>
                  {company.difficulty}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-nb-black mb-1">
                {company.userProgress?.progress || 0}%
              </div>
              <div className="text-xs text-nb-black/45">Progress</div>
            </div>
            
            <ArrowRight className="w-5 h-5 text-nb-black/35 group-hover:text-nb-black group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Link>
    </motion.div>
  );

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
                  <Building2 className="w-12 h-12 text-nb-black/45" />
                </div>
                <h1 className="text-4xl font-bold text-nb-black mb-4">
                  Company Preparation
                </h1>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-nb-yellow/20 text-nb-black rounded-full text-sm font-semibold mb-6">
                  <Clock className="w-4 h-4" />
                  Coming Soon
                </div>
              </div>
              
              <div className="nb-card-compat bg-nb-black text-white border-2 border-nb-black/15 p-8">
                <h2 className="text-2xl font-bold text-nb-black mb-4">
                  🚧 Feature Under Development
                </h2>
                <p className="text-lg text-nb-black/55 mb-6">
                  We're working hard to bring you an amazing company-specific preparation experience. 
                  This feature will include:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#F5F1E8]0 rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-semibold text-nb-black">Company-Specific Questions</h3>
                      <p className="text-sm text-nb-black/55">Curated questions from top companies</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#F5F1E8]0 rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-semibold text-nb-black">Interview Insights</h3>
                      <p className="text-sm text-nb-black/55">Real interview experiences and tips</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#F5F1E8]0 rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-semibold text-nb-black">Company Culture</h3>
                      <p className="text-sm text-nb-black/55">Learn about company values and culture</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#F5F1E8]0 rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-semibold text-nb-black">Progress Tracking</h3>
                      <p className="text-sm text-nb-black/55">Track your preparation progress</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-nb-black/55 mb-4">
                    In the meantime, explore our other features:
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

export default CompanyPrep;
