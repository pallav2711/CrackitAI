import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, CheckCircle, Clock, Target, TrendingUp, Award,
  Brain, ArrowLeft, Play, Pause, BookOpen, Code, Video,
  FileText, BarChart3, Zap
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import PlanCalendar from '../components/ai-prep/PlanCalendar';
import DailyTaskList from '../components/ai-prep/DailyTaskList';
import WeeklyAssessment from '../components/ai-prep/WeeklyAssessment';
import ProgressStats from '../components/ai-prep/ProgressStats';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const AIPrepPlanView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [activeTab, setActiveTab] = useState('calendar'); // calendar, tasks, assessments, progress

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ai-prep/plans/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPlan(data.data.plan);
        // Set current day as selected
        const currentDay = data.data.plan.dailySchedule.find(d => d.day === data.data.plan.currentDay);
        setSelectedDay(currentDay);
      } else {
        toast.error('Failed to load plan');
        navigate('/ai-prep');
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
      toast.error('Failed to load plan');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskComplete = async (day, taskId, completed) => {
    try {
      const response = await fetch(`/api/ai-prep/plans/${id}/tasks`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ day, taskId, completed })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Create a completely new plan object to force React to re-render
        const newPlan = JSON.parse(JSON.stringify(data.data.plan));
        setPlan(newPlan);
        
        // Update selected day
        if (selectedDay && selectedDay.day === day) {
          const updatedDay = newPlan.dailySchedule.find(d => d.day === day);
          setSelectedDay(updatedDay);
        }
        
        toast.success(completed ? '✅ Task completed!' : '↩️ Task marked incomplete');
      } else {
        toast.error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`/api/ai-prep/plans/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const data = await response.json();
        setPlan(data.data.plan);
        toast.success(`Plan ${newStatus.toLowerCase()}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update plan status');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-10 h-10 border-3 border-nb-black border-t-nb-yellow rounded-full animate-spin border-nb-blue/30"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!plan) return null;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/ai-prep')}
              className="p-2 hover:bg-[#F5F1E8] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shadow-md flex items-center justify-center">
                  <img 
                    src={plan.companyLogo} 
                    alt={`${plan.companyName} logo`}
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(plan.companyName)}&background=6366f1&color=fff&size=128`;
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-nb-black">{plan.companyName} Prep Plan</h1>
                  <p className="text-nb-black/55">{plan.targetRole} • {plan.duration} Days</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-lg font-semibold ${
              plan.status === 'Active' ? 'bg-nb-green/10 text-nb-green' :
              plan.status === 'Paused' ? 'bg-nb-yellow/20 text-nb-black' :
              plan.status === 'Completed' ? 'bg-nb-blue/10 text-nb-blue' :
              'bg-[#F5F1E8] text-nb-black/75'
            }`}>
              {plan.status}
            </div>
            
            {plan.status === 'Active' && (
              <button
                onClick={() => handleStatusChange('Paused')}
                className="flex items-center gap-2 px-4 py-2 bg-nb-yellow text-white rounded-lg hover:bg-nb-yellow transition-colors"
              >
                <Pause className="w-4 h-4" />
                Pause
              </button>
            )}
            
            {plan.status === 'Paused' && (
              <button
                onClick={() => handleStatusChange('Active')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Play className="w-4 h-4" />
                Resume
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="nb-card-compat bg-nb-black text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-nb-black/55 mb-1">Overall Progress</p>
                <p className="text-3xl font-bold text-nb-blue">{plan.overallProgress}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-nb-blue" />
            </div>
          </div>
          
          <div className="nb-card-compat bg-nb-black text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-nb-black/55 mb-1">Days Completed</p>
                <p className="text-3xl font-bold text-nb-blue">{plan.completedDays}/{plan.duration}</p>
              </div>
              <Calendar className="w-8 h-8 text-nb-blue" />
            </div>
          </div>
          
          <div className="nb-card-compat bg-nb-black text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-nb-black/55 mb-1">Tasks Done</p>
                <p className="text-3xl font-bold text-nb-green">{plan.completedTasks}/{plan.totalTasks}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-nb-green" />
            </div>
          </div>
          
          <div className="nb-card-compat bg-nb-black text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-nb-black/55 mb-1">Avg Score</p>
                <p className="text-3xl font-bold text-nb-black">{plan.averageScore || 0}%</p>
              </div>
              <Award className="w-8 h-8 text-nb-black" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="nb-card-compat">
          <div className="flex gap-2 border-b border-nb-black/15 pb-4">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'calendar' ? 'bg-nb-blue text-nb-blue' : 'hover:bg-[#F5F1E8]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Calendar
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'tasks' ? 'bg-nb-blue text-nb-blue' : 'hover:bg-[#F5F1E8]'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Today's Tasks
            </button>
            <button
              onClick={() => setActiveTab('assessments')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'assessments' ? 'bg-nb-blue text-nb-blue' : 'hover:bg-[#F5F1E8]'
              }`}
            >
              <Award className="w-4 h-4" />
              Assessments
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'progress' ? 'bg-nb-blue text-nb-blue' : 'hover:bg-[#F5F1E8]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Progress
            </button>
          </div>

          <div className="mt-6">
            {activeTab === 'calendar' && (
              <PlanCalendar
                plan={plan}
                selectedDay={selectedDay}
                onDaySelect={setSelectedDay}
              />
            )}
            
            {activeTab === 'tasks' && (
              <DailyTaskList
                day={selectedDay || plan.dailySchedule[plan.currentDay - 1]}
                onTaskComplete={handleTaskComplete}
              />
            )}
            
            {activeTab === 'assessments' && (
              <WeeklyAssessment
                plan={plan}
                onAssessmentComplete={fetchPlan}
              />
            )}
            
            {activeTab === 'progress' && (
              <ProgressStats 
                plan={plan} 
              />
            )}
          </div>
        </div>

        {/* AI Insights */}
        {plan.aiGeneratedContent && (
          <div className="nb-card-compat bg-nb-black text-white">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-nb-blue" />
              <h3 className="text-lg font-bold text-nb-black">AI Insights</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-nb-black mb-2">Company Insights</h4>
                <p className="text-nb-black/75">{plan.aiGeneratedContent.companyInsights}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-nb-black mb-2">Interview Tips</h4>
                <ul className="space-y-1">
                  {plan.aiGeneratedContent.interviewTips?.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-nb-black/75">
                      <Zap className="w-4 h-4 text-nb-blue mt-1 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AIPrepPlanView;
