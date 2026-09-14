import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import companyService from '../services/companyService';

const useCompanyStore = create(
  persist(
    (set, get) => ({
      // Companies data
      companies: [],
      trendingCompanies: [],
      currentCompany: null,
      
      // Questions data
      questions: [],
      currentQuestion: null,
      
      // User progress
      userProgress: {},
      dashboardStats: null,
      
      // UI state
      filters: {
        search: '',
        industry: 'all',
        difficulty: 'all',
        sortBy: 'popularity'
      },
      
      // Pagination
      pagination: {
        current: 1,
        total: 1,
        count: 0,
        totalItems: 0
      },
      
      // Loading states
      loading: {
        companies: false,
        company: false,
        questions: false,
        question: false,
        submit: false,
        progress: false,
        stats: false
      },
      
      // Error states
      errors: {
        companies: null,
        company: null,
        questions: null,
        question: null,
        submit: null,
        progress: null,
        stats: null
      },
      
      // Actions
      setLoading: (key, value) => set((state) => ({
        loading: { ...state.loading, [key]: value }
      })),
      
      setError: (key, error) => set((state) => ({
        errors: { ...state.errors, [key]: error }
      })),
      
      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
      })),
      
      clearErrors: () => set({
        errors: {
          companies: null,
          company: null,
          questions: null,
          question: null,
          submit: null,
          progress: null,
          stats: null
        }
      }),
      
      // Fetch companies
      fetchCompanies: async (params = {}) => {
        try {
          set((state) => ({ 
            loading: { ...state.loading, companies: true },
            errors: { ...state.errors, companies: null }
          }));
          
          const mergedParams = { ...get().filters, ...params };
          const response = await companyService.getCompanies(mergedParams);
          
          set({
            companies: response.data.companies,
            pagination: response.data.pagination
          });
          
        } catch (error) {
          console.error('Fetch companies error:', error);
          set((state) => ({
            errors: { ...state.errors, companies: error.message || 'Failed to fetch companies' }
          }));
        } finally {
          set((state) => ({ 
            loading: { ...state.loading, companies: false }
          }));
        }
      },
      
      // Fetch trending companies
      fetchTrendingCompanies: async () => {
        try {
          const response = await companyService.getTrendingCompanies();
          set({ trendingCompanies: response.data.companies });
        } catch (error) {
          console.error('Fetch trending companies error:', error);
        }
      },
      
      // Fetch company details
      fetchCompanyDetails: async (slug) => {
        try {
          set((state) => ({ 
            loading: { ...state.loading, company: true },
            errors: { ...state.errors, company: null }
          }));
          
          const response = await companyService.getCompanyDetails(slug);
          
          set({
            currentCompany: {
              ...response.data.company,
              questionStats: response.data.questionStats,
              userProgress: response.data.userProgress
            }
          });
          
        } catch (error) {
          console.error('Fetch company details error:', error);
          set((state) => ({
            errors: { ...state.errors, company: error.message || 'Failed to fetch company details' }
          }));
        } finally {
          set((state) => ({ 
            loading: { ...state.loading, company: false }
          }));
        }
      },
      
      // Fetch company questions
      fetchQuestions: async (slug, params = {}) => {
        try {
          set((state) => ({ 
            loading: { ...state.loading, questions: true },
            errors: { ...state.errors, questions: null }
          }));
          
          const response = await companyService.getCompanyQuestions(slug, params);
          
          set({
            questions: response.data.questions,
            pagination: response.data.pagination
          });
          
        } catch (error) {
          console.error('Fetch questions error:', error);
          set((state) => ({
            errors: { ...state.errors, questions: error.message || 'Failed to fetch questions' }
          }));
        } finally {
          set((state) => ({ 
            loading: { ...state.loading, questions: false }
          }));
        }
      },
      
      // Fetch question details
      fetchQuestionDetails: async (questionId) => {
        try {
          set((state) => ({ 
            loading: { ...state.loading, question: true },
            errors: { ...state.errors, question: null }
          }));
          
          const response = await companyService.getQuestionDetails(questionId);
          
          set({ currentQuestion: response.data.question });
          
        } catch (error) {
          console.error('Fetch question details error:', error);
          set((state) => ({
            errors: { ...state.errors, question: error.message || 'Failed to fetch question details' }
          }));
        } finally {
          set((state) => ({ 
            loading: { ...state.loading, question: false }
          }));
        }
      },
      
      // Submit answer
      submitAnswer: async (questionId, answer, timeSpent) => {
        try {
          set((state) => ({ 
            loading: { ...state.loading, submit: true },
            errors: { ...state.errors, submit: null }
          }));
          
          const response = await companyService.submitAnswer(questionId, answer, timeSpent);
          
          // Update current question with result
          set((state) => ({
            currentQuestion: state.currentQuestion ? {
              ...state.currentQuestion,
              userAnswer: answer,
              result: response.data
            } : null
          }));
          
          return response.data;
          
        } catch (error) {
          console.error('Submit answer error:', error);
          set((state) => ({
            errors: { ...state.errors, submit: error.message || 'Failed to submit answer' }
          }));
          throw error;
        } finally {
          set((state) => ({ 
            loading: { ...state.loading, submit: false }
          }));
        }
      },
      
      // Toggle bookmark
      toggleBookmark: async (questionId, note = '') => {
        try {
          const response = await companyService.toggleBookmark(questionId, note);
          
          // Update current question bookmark status
          set((state) => ({
            currentQuestion: state.currentQuestion && state.currentQuestion._id === questionId ? {
              ...state.currentQuestion,
              isBookmarked: response.data.isBookmarked
            } : state.currentQuestion,
            
            // Update questions list
            questions: state.questions.map(q => 
              q._id === questionId ? { ...q, isBookmarked: response.data.isBookmarked } : q
            )
          }));
          
          return response.data;
          
        } catch (error) {
          console.error('Toggle bookmark error:', error);
          throw error;
        }
      },
      
      // Fetch user progress
      fetchUserProgress: async (slug) => {
        try {
          set((state) => ({ 
            loading: { ...state.loading, progress: true },
            errors: { ...state.errors, progress: null }
          }));
          
          const response = await companyService.getUserProgress(slug);
          
          set((state) => ({
            userProgress: {
              ...state.userProgress,
              [slug]: response.data.progress
            }
          }));
          
        } catch (error) {
          console.error('Fetch user progress error:', error);
          set((state) => ({
            errors: { ...state.errors, progress: error.message || 'Failed to fetch progress' }
          }));
        } finally {
          set((state) => ({ 
            loading: { ...state.loading, progress: false }
          }));
        }
      },
      
      // Fetch dashboard stats
      fetchDashboardStats: async () => {
        try {
          set((state) => ({ 
            loading: { ...state.loading, stats: true },
            errors: { ...state.errors, stats: null }
          }));
          
          const response = await companyService.getDashboardStats();
          
          set({ dashboardStats: response.data });
          
        } catch (error) {
          console.error('Fetch dashboard stats error:', error);
          set((state) => ({
            errors: { ...state.errors, stats: error.message || 'Failed to fetch stats' }
          }));
        } finally {
          set((state) => ({ 
            loading: { ...state.loading, stats: false }
          }));
        }
      },
      
      // Search companies
      searchCompanies: async (query) => {
        try {
          const response = await companyService.searchCompanies(query);
          return response.data.companies;
        } catch (error) {
          console.error('Search companies error:', error);
          return [];
        }
      },
      
      // Reset state
      reset: () => set({
        companies: [],
        trendingCompanies: [],
        currentCompany: null,
        questions: [],
        currentQuestion: null,
        userProgress: {},
        dashboardStats: null,
        loading: {
          companies: false,
          company: false,
          questions: false,
          question: false,
          submit: false,
          progress: false,
          stats: false
        },
        errors: {
          companies: null,
          company: null,
          questions: null,
          question: null,
          submit: null,
          progress: null,
          stats: null
        }
      }),
      
      // Clear current data
      clearCurrentCompany: () => set({ 
        currentCompany: null, 
        questions: [], 
        currentQuestion: null 
      }),
      
      clearCurrentQuestion: () => set({ currentQuestion: null })
    }),
    {
      name: 'company-store',
      partialize: (state) => ({
        filters: state.filters,
        userProgress: state.userProgress
      })
    }
  )
);

export default useCompanyStore;