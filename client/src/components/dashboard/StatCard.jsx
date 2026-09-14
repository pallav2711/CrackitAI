import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({
  label,
  value,
  icon: Icon,
  gradient,   // kept for compat but unused
  change      = null,
  trend       = null,
  animated    = true,
  delay       = 0,
  suffix      = '',
  onClick     = null,
}) => {
  const isClickable = onClick !== null;
  const trendColor = trend === 'up' ? 'text-nb-green' : trend === 'down' ? 'text-nb-red' : 'text-nb-black/45';
  const safe = isNaN(value) ? 0 : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -2 }}
      className={isClickable ? 'cursor-pointer' : ''}
      onClick={onClick}
    >
      <div
        className="border-2 border-nb-black bg-white p-5 transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5"
        style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div
            className="w-10 h-10 bg-nb-black border-2 border-nb-black flex items-center justify-center flex-shrink-0"
            style={{ borderRadius: '5px' }}
            aria-hidden="true"
          >
            <Icon className="w-5 h-5 text-nb-yellow" />
          </div>
          {change && (
            <div className={`flex items-center gap-1 text-sm font-bold ${trendColor}`}>
              {trend === 'up'   && <TrendingUp   className="w-4 h-4" aria-hidden="true" />}
              {trend === 'down' && <TrendingDown  className="w-4 h-4" aria-hidden="true" />}
              {change}
            </div>
          )}
        </div>

        <p className="text-[11px] font-black uppercase tracking-widest text-nb-black/45 mb-1">{label}</p>

        <motion.p
          className="font-black text-nb-black leading-none"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem' }}
          initial={animated ? { opacity: 0, scale: 0.8 } : {}}
          animate={animated ? { opacity: 1, scale: 1 } : {}}
          transition={animated ? { delay: delay + 0.3, type: 'spring' } : {}}
        >
          {safe}{suffix}
        </motion.p>

        {/* Progress bar */}
        <div className="mt-4 h-2 border border-nb-black/15 bg-[#F5F1E8]" style={{ borderRadius: '1px' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, safe))}%` }}
            transition={{ delay: delay + 0.5, duration: 0.8 }}
            className="h-full bg-nb-yellow"
            style={{ borderRadius: '1px' }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
