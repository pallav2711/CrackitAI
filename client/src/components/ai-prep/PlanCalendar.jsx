import { motion } from 'framer-motion';
import { CheckCircle, Circle, Lock, Calendar as CalendarIcon } from 'lucide-react';

const PlanCalendar = ({ plan, selectedDay, onDaySelect }) => {
  const getDayStatus = (day) => {
    if (day.completed) return 'completed';
    if (day.day === plan.currentDay) return 'current';
    if (day.day < plan.currentDay) return 'available';
    return 'locked';
  };

  const getDayColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-nb-green/10 border-green-500 text-nb-green';
      case 'current':
        return 'bg-nb-blue border-nb-blue/30 text-nb-blue';
      case 'available':
        return 'bg-blue-50 border-blue-300 text-nb-blue';
      default:
        return 'bg-[#F5F1E8] border-nb-black/15 text-nb-black/35';
    }
  };

  const weeks = [];
  for (let i = 0; i < plan.dailySchedule.length; i += 7) {
    weeks.push(plan.dailySchedule.slice(i, i + 7));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-nb-black flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-nb-blue" />
          {plan.duration}-Day Study Calendar
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-nb-green/10 border-2 border-green-500 rounded"></div>
            <span className="text-nb-black/55">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-nb-blue border-2 border-nb-blue/30 rounded"></div>
            <span className="text-nb-black/55">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#F5F1E8] border-2 border-nb-black/15 rounded"></div>
            <span className="text-nb-black/55">Upcoming</span>
          </div>
        </div>
      </div>

      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="space-y-2">
          <h4 className="text-sm font-semibold text-nb-black/75">Week {weekIndex + 1}</h4>
          <div className="grid grid-cols-7 gap-3">
            {week.map((day) => {
              const status = getDayStatus(day);
              const isSelected = selectedDay?.day === day.day;
              const isClickable = status !== 'locked';

              return (
                <motion.button
                  key={day.day}
                  whileHover={isClickable ? { scale: 1.05 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                  onClick={() => isClickable && onDaySelect(day)}
                  disabled={!isClickable}
                  className={`relative p-4 border-2 rounded-lg transition-all ${getDayColor(status)} ${
                    isSelected ? 'ring-2 ring-purple-500 ring-offset-2' : ''
                  } ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                >
                  <div className="text-center">
                    <div className="text-xs font-medium mb-1">Day {day.day}</div>
                    <div className="flex items-center justify-center mb-2">
                      {status === 'completed' ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : status === 'locked' ? (
                        <Lock className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </div>
                    <div className="text-xs">
                      {day.tasks.filter(t => t.completed).length}/{day.tasks.length} tasks
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        status === 'completed' ? 'bg-nb-green' : 'bg-nb-blue'
                      }`}
                      style={{
                        width: `${(day.tasks.filter(t => t.completed).length / day.tasks.length) * 100}%`
                      }}
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Selected Day Details */}
      {selectedDay && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="nb-card-compat bg-nb-black text-white border-2 border-nb-blue/30"
        >
          <h4 className="font-semibold text-nb-black mb-2">{selectedDay.title}</h4>
          <p className="text-sm text-nb-black/55 mb-4">{selectedDay.description}</p>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-nb-blue" />
              <span className="text-nb-black/75">
                {new Date(selectedDay.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-nb-green" />
              <span className="text-nb-black/75">
                {selectedDay.tasks.filter(t => t.completed).length}/{selectedDay.tasks.length} completed
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PlanCalendar;
