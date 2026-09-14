import { motion } from 'framer-motion';
import { Maximize2, Minimize2, AlertCircle } from 'lucide-react';

const DashboardCard = ({
  title,
  children,
  icon: Icon,
  gradient,       // kept for API compat, unused
  expandable    = false,
  expanded      = false,
  onToggleExpand,
  className     = '',
  actions       = null,
  loading       = false,
  error         = null,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2 }}
    className={className}
  >
    <div
      className="border-2 border-nb-black bg-white transition-all duration-100"
      style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b-2 border-nb-black">
        <div className="flex items-center gap-3">
          {Icon && (
            <div
              className="w-8 h-8 bg-nb-black border-2 border-nb-black flex items-center justify-center"
              style={{ borderRadius: '4px' }}
              aria-hidden="true"
            >
              <Icon className="w-4 h-4 text-nb-yellow" />
            </div>
          )}
          <h3
            className="font-bold text-sm text-nb-black uppercase tracking-wide"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {title}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {actions}
          {expandable && (
            <button
              onClick={onToggleExpand}
              className="p-1.5 hover:bg-[#F5F1E8] transition-colors border border-nb-black/15"
              style={{ borderRadius: '4px' }}
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded
                ? <Minimize2 className="w-3.5 h-3.5 text-nb-black/45" />
                : <Maximize2 className="w-3.5 h-3.5 text-nb-black/45" />}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className={`p-5 transition-all duration-300 ${expanded ? '' : 'max-h-96 overflow-hidden'}`}
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div
              className="w-8 h-8 border-3 border-nb-black border-t-nb-yellow rounded-full animate-spin"
              aria-label="Loading"
            />
          </div>
        ) : error ? (
          <div className="text-center py-8 space-y-3">
            <div
              className="w-10 h-10 bg-nb-red/10 border-2 border-nb-red flex items-center justify-center mx-auto"
              style={{ borderRadius: '6px' }}
              aria-hidden="true"
            >
              <AlertCircle className="w-5 h-5 text-nb-red" />
            </div>
            <p className="text-nb-red text-sm font-medium">{error}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  </motion.div>
);

export default DashboardCard;
