import { motion } from 'framer-motion';
import { TrendingUp, Calendar, CheckCircle, ArrowRight } from 'lucide-react';

const ActivePlansWidget = ({ plans, onPlanClick }) => {
  if (!plans || plans.length === 0) return null;

  return (
    <div className="nb-card-compat bg-nb-black text-white border-2 border-nb-blue/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-nb-black">Your Active Plans</h3>
        <span className="px-3 py-1 bg-nb-blue text-white rounded-full text-sm font-semibold">
          {plans.length} Active
        </span>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan, index) => (
          <motion.div
            key={plan._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onPlanClick(plan._id)}
            className="bg-white rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white shadow-sm flex items-center justify-center">
                <img 
                  src={plan.companyLogo} 
                  alt={`${plan.companyName} logo`}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(plan.companyName)}&background=6366f1&color=fff&size=128`;
                  }}
                />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-nb-black group-hover:text-nb-blue transition-colors">
                  {plan.companyName}
                </h4>
                <p className="text-xs text-nb-black/45">{plan.targetRole}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-nb-black/55">Progress</span>
                <span className="font-semibold text-nb-blue">{plan.overallProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-full bg-nb-black text-white rounded-full transition-all"
                  style={{ width: `${plan.overallProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-nb-black/55 pt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Day {plan.completedDays}/{plan.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>{plan.completedTasks}/{plan.totalTasks} tasks</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-nb-black/15 flex items-center justify-between">
              <span className="text-xs text-nb-black/45">Continue learning</span>
              <ArrowRight className="w-4 h-4 text-nb-blue group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ActivePlansWidget;
