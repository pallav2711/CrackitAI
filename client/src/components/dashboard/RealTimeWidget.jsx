import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Users, TrendingUp, Clock, 
  Zap, Target, Award, Bell 
} from 'lucide-react';

const RealTimeWidget = ({ 
  userStats, 
  leaderboardData, 
  notifications = [],
  onNotificationClick = () => {}
}) => {
  const [activeTab, setActiveTab] = useState('activity');

  const tabs = [
    { id: 'activity', label: 'Live Activity', icon: Activity },
    { id: 'leaderboard', label: 'Rankings', icon: TrendingUp },
    { id: 'notifications', label: 'Updates', icon: Bell }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'activity':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-nb-green">{userStats?.tests || 0}</div>
                <div className="text-xs text-nb-green">Tests Taken</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-nb-blue">{userStats?.interviews || 0}</div>
                <div className="text-xs text-nb-blue">Interviews</div>
              </div>
              <div className="text-center p-3 bg-nb-blue rounded-lg">
                <div className="text-2xl font-bold text-nb-blue">{userStats?.totalPoints || 0}</div>
                <div className="text-xs text-nb-blue">Total Points</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-nb-black text-sm">Your Activity</h4>
              <div className="text-center py-8 text-nb-black/45 text-sm">
                {userStats?.tests > 0 || userStats?.interviews > 0 ? 
                  'Activity data will appear here as you use the platform' :
                  'Start taking tests or interviews to see your activity'
                }
              </div>
            </div>
          </div>
        );
        
      case 'leaderboard':
        return (
          <div className="space-y-3">
            <h4 className="font-semibold text-nb-black text-sm">Top Performers</h4>
            <div className="space-y-2">
              {(leaderboardData?.leaderboard || []).slice(0, 5).map((user, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    user.name === 'You' ? 'bg-[#F5F1E8] border border-nb-black' : 'bg-[#F5F1E8]'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-nb-yellow text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-nb-yellow text-white' : 'bg-gray-200 text-nb-black/75'
                  }`}>
                    {user.rank}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{user.name}</div>
                    <div className="text-xs text-nb-black/45">{user.tests} tests</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">{user.score}%</div>
                    <div className="flex items-center gap-1 text-xs text-nb-black">
                      <Zap className="w-3 h-3" />
                      {user.streak}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
        
      case 'notifications':
        return (
          <div className="space-y-3">
            <h4 className="font-semibold text-nb-black text-sm">Recent Updates</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-4 text-nb-black/45 text-sm">
                  No new notifications
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => onNotificationClick(notification)}
                    className="p-3 bg-[#F5F1E8] rounded-lg cursor-pointer hover:bg-[#F5F1E8] transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.type === 'achievement' ? 'bg-nb-yellow' :
                        notification.type === 'reminder' ? 'bg-nb-blue' : 'bg-nb-green'
                      }`} />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{notification.title}</div>
                        <div className="text-xs text-nb-black/55 mt-1">{notification.message}</div>
                        <div className="text-xs text-nb-black/35 mt-1">{notification.time}</div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="nb-card-compat">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 mb-4 bg-[#F5F1E8] p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-nb-black shadow-sm'
                  : 'text-nb-black/55 hover:text-nb-black'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default RealTimeWidget;