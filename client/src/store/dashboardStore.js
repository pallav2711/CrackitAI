import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import analyticsService from '../services/analyticsService';

const useDashboardStore = create(
  persist(
    (set, get) => ({
      // Core state
      userStats: {
        resumeScore: 0,
        interviews: 0,
        tests: 0,
        readiness: 0,
        totalPoints: 0,
        rank: 0,
        completionRate: 0
      },
      
      // Data
      analyticsData: null,
      reportData: null,
      skillsData: null,
      leaderboardData: null,
      
      // UI preferences
      preferences: {
        selectedPeriod: 'week',
        showAnalyticsWidget: true,
        expandedCards: {},
        activeTab: 'overview',
        viewMode: 'grid',
        filterBy: 'all',
        autoRefresh: true,
        theme: 'light'
      },
      
      // Loading states
      loading: {
        dashboard: false,
        analytics: false,
        report: false,
        skills: false,
        leaderboard: false
      },
      
      // Error states
      errors: {
        dashboard: null,
        analytics: null,
        report: null,
        skills: null,
        leaderboard: null
      },
      
      // Real-time data
      notifications: [],
      lastUpdated: null,
      
      // Actions
      setUserStats: (stats) => set({ userStats: stats }),
      
      setAnalyticsData: (data) => set({ analyticsData: data }),
      
      setPreference: (key, value) => set((state) => ({
        preferences: { ...state.preferences, [key]: value }
      })),
      
      setLoading: (key, value) => set((state) => ({
        loading: { ...state.loading, [key]: value }
      })),
      
      setError: (key, error) => set((state) => ({
        errors: { ...state.errors, [key]: error }
      })),
      
      addNotification: (notification) => set((state) => ({
        notifications: [
          { 
            id: Date.now(), 
            timestamp: new Date().toISOString(),
            ...notification 
          },
          ...state.notifications.slice(0, 9) // Keep only 10 notifications
        ]
      })),
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      
      clearNotifications: () => set({ notifications: [] }),
      
      toggleCardExpansion: (cardId) => set((state) => ({
        preferences: {
          ...state.preferences,
          expandedCards: {
            ...state.preferences.expandedCards,
            [cardId]: !state.preferences.expandedCards[cardId]
          }
        }
      })),
      
      // Async actions
      fetchDashboardData: async (period = null) => {
        const currentPeriod = period || get().preferences.selectedPeriod;
        
        try {
          set((state) => ({ 
            loading: { ...state.loading, dashboard: true },
            errors: { ...state.errors, dashboard: null }
          }));
          
          const [analyticsRes, reportRes, skillsRes, leaderboardRes] = await Promise.allSettled([
            analyticsService.getDashboardAnalytics(currentPeriod),
            analyticsService.getPerformanceReport(),
            analyticsService.getSkillAssessment(),
            analyticsService.getLeaderboard(currentPeriod)
          ]);
          
          // Handle analytics data
          if (analyticsRes.status === 'fulfilled') {
            set({ analyticsData: analyticsRes.value.data });
            
            if (analyticsRes.value.data?.stats) {
              set({ userStats: analyticsRes.value.data.stats });
            }
          } else {
            set((state) => ({
              errors: { ...state.errors, analytics: analyticsRes.reason?.message || 'Failed to load analytics' }
            }));
          }
          
          // Handle report data
          if (reportRes.status === 'fulfilled') {
            set({ reportData: reportRes.value.data });
          } else {
            set((state) => ({
              errors: { ...state.errors, report: reportRes.reason?.message || 'Failed to load report' }
            }));
          }
          
          // Handle skills data
          if (skillsRes.status === 'fulfilled') {
            set({ skillsData: skillsRes.value.data });
          } else {
            set((state) => ({
              errors: { ...state.errors, skills: skillsRes.reason?.message || 'Failed to load skills' }
            }));
          }
          
          // Handle leaderboard data
          if (leaderboardRes.status === 'fulfilled') {
            set({ leaderboardData: leaderboardRes.value.data });
          } else {
            set((state) => ({
              errors: { ...state.errors, leaderboard: leaderboardRes.reason?.message || 'Failed to load leaderboard' }
            }));
          }
          
          set({ lastUpdated: new Date().toISOString() });
          
        } catch (error) {
          console.error('Dashboard data fetch error:', error);
          set((state) => ({
            errors: { ...state.errors, dashboard: error.message || 'Failed to load dashboard data' }
          }));
        } finally {
          set((state) => ({ 
            loading: { ...state.loading, dashboard: false }
          }));
        }
      },
      
      refreshAnalytics: async () => {
        const { preferences } = get();
        
        try {
          set((state) => ({ 
            loading: { ...state.loading, analytics: true },
            errors: { ...state.errors, analytics: null }
          }));
          
          const analyticsRes = await analyticsService.getDashboardAnalytics(preferences.selectedPeriod);
          
          set({ 
            analyticsData: analyticsRes.data,
            lastUpdated: new Date().toISOString()
          });
          
          if (analyticsRes.data?.stats) {
            set({ userStats: analyticsRes.data.stats });
          }
          
        } catch (error) {
          console.error('Analytics refresh error:', error);
          set((state) => ({
            errors: { ...state.errors, analytics: error.message || 'Failed to refresh analytics' }
          }));
        } finally {
          set((state) => ({ 
            loading: { ...state.loading, analytics: false }
          }));
        }
      },
      
      generateReport: async () => {
        try {
          set((state) => ({ 
            loading: { ...state.loading, report: true },
            errors: { ...state.errors, report: null }
          }));
          
          const reportRes = await analyticsService.getPerformanceReport();
          set({ reportData: reportRes.data });
          
          // Add success notification
          get().addNotification({
            type: 'success',
            title: 'Report Generated',
            message: 'Your performance report is ready for download'
          });
          
        } catch (error) {
          console.error('Report generation error:', error);
          set((state) => ({
            errors: { ...state.errors, report: error.message || 'Failed to generate report' }
          }));
          
          // Add error notification
          get().addNotification({
            type: 'error',
            title: 'Report Generation Failed',
            message: 'Unable to generate your performance report'
          });
        } finally {
          set((state) => ({ 
            loading: { ...state.loading, report: false }
          }));
        }
      },
      
      trackActivity: async (activityType, details, duration) => {
        try {
          await analyticsService.trackActivity(activityType, details, duration);
          
          // Add activity notification
          get().addNotification({
            type: 'info',
            title: 'Activity Tracked',
            message: `${activityType} activity has been recorded`
          });
          
          // Refresh analytics if auto-refresh is enabled
          if (get().preferences.autoRefresh) {
            setTimeout(() => {
              get().refreshAnalytics();
            }, 2000);
          }
          
        } catch (error) {
          console.error('Activity tracking error:', error);
        }
      },
      
      // Reset store
      reset: () => set({
        userStats: {
          resumeScore: 0,
          interviews: 0,
          tests: 0,
          readiness: 0,
          totalPoints: 0,
          rank: 0,
          completionRate: 0
        },
        analyticsData: null,
        reportData: null,
        skillsData: null,
        leaderboardData: null,
        notifications: [],
        lastUpdated: null,
        loading: {
          dashboard: false,
          analytics: false,
          report: false,
          skills: false,
          leaderboard: false
        },
        errors: {
          dashboard: null,
          analytics: null,
          report: null,
          skills: null,
          leaderboard: null
        }
      })
    }),
    {
      name: 'dashboard-store',
      partialize: (state) => ({
        preferences: state.preferences,
        userStats: state.userStats
      })
    }
  )
);

export default useDashboardStore;