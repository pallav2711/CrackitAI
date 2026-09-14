import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, Circle, Clock, BookOpen, Code, Video, FileText, 
  ChevronDown, ChevronUp, Play, Pause, RotateCcw, Trophy, Flame
} from 'lucide-react';

const DailyTaskList = ({ day, onTaskComplete }) => {
  const [expandedTasks, setExpandedTasks] = React.useState({});
  const [timerActive, setTimerActive] = React.useState(null);
  const [timeSpent, setTimeSpent] = React.useState({});
  const [filterType, setFilterType] = React.useState('all'); // all, completed, pending

  React.useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => {
        setTimeSpent(prev => ({
          ...prev,
          [timerActive]: (prev[timerActive] || 0) + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  if (!day) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-nb-black/45">Select a day from the calendar to view tasks</p>
      </div>
    );
  }

  const toggleExpand = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const toggleTimer = (taskId) => {
    if (timerActive === taskId) {
      setTimerActive(null);
    } else {
      setTimerActive(taskId);
    }
  };

  const resetTimer = (taskId) => {
    setTimeSpent(prev => ({
      ...prev,
      [taskId]: 0
    }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredTasks = day.tasks.filter(task => {
    if (filterType === 'completed') return task.completed;
    if (filterType === 'pending') return !task.completed;
    return true;
  });

  const getTaskIcon = (type) => {
    switch (type) {
      case 'reading':
        return <BookOpen className="w-5 h-5" />;
      case 'practice':
      case 'coding':
        return <Code className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'review':
        return <FileText className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getTaskColor = (type) => {
    switch (type) {
      case 'reading':
        return 'text-nb-blue bg-blue-50';
      case 'practice':
      case 'coding':
        return 'text-nb-green bg-green-50';
      case 'video':
        return 'text-nb-blue bg-nb-blue';
      case 'review':
        return 'text-nb-black bg-nb-yellow';
      default:
        return 'text-nb-black/55 bg-[#F5F1E8]';
    }
  };

  const totalDuration = day.tasks.reduce((acc, task) => acc + (task.duration || 0), 0);
  const completedDuration = day.tasks
    .filter(t => t.completed)
    .reduce((acc, task) => acc + (task.duration || 0), 0);

  return (
    <div className="space-y-6">
      {/* Day Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-nb-black text-white rounded-xl p-6 border-2 border-nb-blue/30"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-nb-black">{day.title}</h3>
              {day.completed && (
                <div className="flex items-center gap-1 px-3 py-1 bg-nb-green text-white rounded-full text-sm font-semibold">
                  <Trophy className="w-4 h-4" />
                  Completed
                </div>
              )}
            </div>
            <p className="text-nb-black/75">{day.description}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-nb-blue">
              {day.tasks.filter(t => t.completed).length}/{day.tasks.length}
            </div>
            <div className="text-sm text-nb-black/55">Tasks Done</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-nb-blue">{day.totalDuration} min</div>
            <div className="text-xs text-nb-black/55">Total Time</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-nb-green">
              {Math.round((day.tasks.filter(t => t.completed).length / day.tasks.length) * 100)}%
            </div>
            <div className="text-xs text-nb-black/55">Progress</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-nb-black flex items-center justify-center gap-1">
              <Flame className="w-4 h-4" />
              {day.tasks.filter(t => t.completed).length}
            </div>
            <div className="text-xs text-nb-black/55">Streak</div>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === 'all' 
                ? 'bg-nb-blue text-white' 
                : 'bg-[#F5F1E8] text-nb-black/55 hover:bg-gray-200'
            }`}
          >
            All ({day.tasks.length})
          </button>
          <button
            onClick={() => setFilterType('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === 'pending' 
                ? 'bg-blue-600 text-white' 
                : 'bg-[#F5F1E8] text-nb-black/55 hover:bg-gray-200'
            }`}
          >
            Pending ({day.tasks.filter(t => !t.completed).length})
          </button>
          <button
            onClick={() => setFilterType('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === 'completed' 
                ? 'bg-green-600 text-white' 
                : 'bg-[#F5F1E8] text-nb-black/55 hover:bg-gray-200'
            }`}
          >
            Completed ({day.tasks.filter(t => t.completed).length})
          </button>
        </div>

        {/* Time Progress */}
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-nb-black/45" />
          <div className="text-sm">
            <span className="font-semibold text-nb-blue">{completedDuration}</span>
            <span className="text-nb-black/45"> / {totalDuration} min</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(completedDuration / totalDuration) * 100}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-nb-black text-white"
        />
      </div>

      {/* Tasks List */}
      <AnimatePresence mode="popLayout">
        {filteredTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-nb-black/45">
              {filterType === 'completed' ? 'No completed tasks yet' : 'No pending tasks'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task, index) => {
              const isExpanded = expandedTasks[task.id];
              const isTimerRunning = timerActive === task.id;
              const taskTimeSpent = timeSpent[task.id] || 0;
              
              return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className={`card hover:shadow-lg transition-all ${
                  task.completed ? 'bg-green-50 border-2 border-green-300' : 'border-2 border-nb-black/15'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <label className="mt-1 flex-shrink-0 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={task.completed || false}
                      onChange={(e) => {
                        e.stopPropagation();
                        onTaskComplete(day.day, task.id, e.target.checked);
                      }}
                      className="hidden"
                    />
                    <div className="relative">
                      {task.completed ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="w-7 h-7 bg-nb-green rounded-md flex items-center justify-center"
                        >
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      ) : (
                        <div className="w-7 h-7 border-3 border-gray-400 rounded-md group-hover:border-nb-blue/30 group-hover:scale-110 transition-all" />
                      )}
                    </div>
                  </label>

                  {/* Task Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2.5 rounded-lg ${getTaskColor(task.type)}`}>
                          {getTaskIcon(task.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold text-lg ${task.completed ? 'line-through text-nb-black/45' : 'text-nb-black'}`}>
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1.5">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-nb-black/45" />
                              <span className="text-sm text-nb-black/55 font-medium">{task.duration} min</span>
                            </div>
                            <span className="px-2.5 py-0.5 bg-[#F5F1E8] text-nb-black/75 text-xs rounded-full capitalize font-medium">
                              {task.type}
                            </span>
                            {taskTimeSpent > 0 && (
                              <span className="px-2.5 py-0.5 bg-nb-blue text-nb-blue text-xs rounded-full font-medium">
                                Spent: {formatTime(taskTimeSpent)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expand/Collapse Button */}
                      <button
                        onClick={() => toggleExpand(task.id)}
                        className="p-2 hover:bg-[#F5F1E8] rounded-lg transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-nb-black/55" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-nb-black/55" />
                        )}
                      </button>
                    </div>

                    {/* Timer Controls */}
                    {!task.completed && (
                      <div className="flex items-center gap-2 mb-3 pl-14">
                        <button
                          onClick={() => toggleTimer(task.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
                            isTimerRunning
                              ? 'bg-nb-red/10 text-nb-red hover:bg-red-200'
                              : 'bg-nb-blue/10 text-nb-blue hover:bg-blue-200'
                          }`}
                        >
                          {isTimerRunning ? (
                            <>
                              <Pause className="w-4 h-4" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              Start Timer
                            </>
                          )}
                        </button>
                        {taskTimeSpent > 0 && (
                          <button
                            onClick={() => resetTimer(task.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#F5F1E8] text-nb-black/75 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Reset
                          </button>
                        )}
                      </div>
                    )}

                    {/* Task Description - Expandable */}
                    <AnimatePresence>
                      {isExpanded && task.description && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-3 pl-14"
                        >
                          <div className="bg-nb-black text-white p-4 rounded-lg border-l-3 border-blue-500">
                            <p className="text-sm font-medium text-nb-black/75 mb-2">📋 Task Details:</p>
                            <p className="text-sm text-nb-black/75 leading-relaxed">
                              {task.description}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
          </div>
        )}
      </AnimatePresence>

      {/* Day Completion */}
      {day.completed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="nb-card-compat bg-nb-black text-white text-white text-center"
        >
          <CheckCircle className="w-12 h-12 mx-auto mb-2" />
          <h4 className="text-lg font-bold">Day Completed! 🎉</h4>
          <p className="text-green-100">Great job! You've completed all tasks for today.</p>
        </motion.div>
      )}
    </div>
  );
};

export default DailyTaskList;
