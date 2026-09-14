import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Clock } from 'lucide-react';

const QuickActionCard = ({
  action,
  index,
  viewMode = 'grid',
}) => {
  const Icon      = action.icon;
  const safe      = Math.min(100, Math.max(0, isNaN(action.progress) ? 0 : action.progress));

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Link to={action.link} className="block group">
          <div
            className="border-2 border-nb-black bg-white p-4 transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5"
            style={{ borderRadius: '8px', boxShadow: '3px 3px 0 #111111' }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 bg-nb-black border-2 border-nb-black flex items-center justify-center text-nb-yellow flex-shrink-0"
                style={{ borderRadius: '5px' }}
                aria-hidden="true"
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-bold text-nb-black truncate">{action.title}</h3>
                  {action.isNew && (
                    <span
                      className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-nb-yellow border-2 border-nb-black flex-shrink-0"
                      style={{ borderRadius: '2px' }}
                    >
                      NEW
                    </span>
                  )}
                  {action.priority === 'high' && (
                    <Star className="w-3.5 h-3.5 text-nb-yellow fill-nb-yellow flex-shrink-0" aria-hidden="true" />
                  )}
                </div>
                <p className="text-xs text-nb-black/50 truncate">{action.description}</p>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 text-xs text-nb-black/40 mb-0.5 justify-end">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  <span>{action.estimatedTime || '5 min'}</span>
                </div>
                <p className="text-sm font-black text-nb-black" style={{ fontFamily: 'var(--font-mono)' }}>
                  {safe}%
                </p>
              </div>

              <ArrowRight
                className="w-4 h-4 text-nb-black/30 group-hover:text-nb-black group-hover:translate-x-0.5 transition-all flex-shrink-0"
                aria-hidden="true"
              />
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-1.5 border border-nb-black/15 bg-[#F5F1E8]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${safe}%` }}
                transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                className="h-full bg-nb-yellow"
              />
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08 }}
    >
      <Link to={action.link} className="block group">
        <div
          className="border-2 border-nb-black bg-white p-5 flex flex-col transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5"
          style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111', minHeight: '160px' }}
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-11 h-11 bg-nb-black border-2 border-nb-black flex items-center justify-center text-nb-yellow"
              style={{ borderRadius: '6px' }}
              aria-hidden="true"
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              {action.priority === 'high' && (
                <Star className="w-4 h-4 text-nb-yellow fill-nb-yellow" aria-hidden="true" />
              )}
              <ArrowRight
                className="w-4 h-4 text-nb-black/30 group-hover:text-nb-black group-hover:translate-x-0.5 transition-all"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-1.5">
            <h3
              className="text-sm font-bold text-nb-black"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {action.title}
            </h3>
            {action.isNew && (
              <span
                className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-nb-yellow border-2 border-nb-black"
                style={{ borderRadius: '2px' }}
              >
                NEW
              </span>
            )}
          </div>

          <p className="text-xs text-nb-black/50 mb-4 flex-1 leading-relaxed">{action.description}</p>

          <div className="flex items-center justify-between text-[11px] text-nb-black/40 mb-2">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" aria-hidden="true" />
              <span>{action.estimatedTime || '5 min'}</span>
            </div>
            <span className="font-bold font-mono">{safe}%</span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 border border-nb-black/15 bg-[#F5F1E8]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${safe}%` }}
              transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
              className="h-full bg-nb-yellow"
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default QuickActionCard;
