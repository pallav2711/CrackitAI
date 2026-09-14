/**
 * CrackIt AI — Neo-Brutalist Logo
 * Geometric C mark with ascending progress bars.
 * Sharp corners, bold borders, no soft shadows.
 *
 * size:    'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * variant: 'default' | 'light' | 'dark' | 'navy' | 'gold' | 'mono'
 * showText: boolean
 */

const SIZES = {
  xs: { box: 'w-6 h-6',   text: 'text-xs',   gap: 'gap-1.5' },
  sm: { box: 'w-8 h-8',   text: 'text-sm',   gap: 'gap-2'   },
  md: { box: 'w-10 h-10', text: 'text-base',  gap: 'gap-2.5' },
  lg: { box: 'w-12 h-12', text: 'text-lg',   gap: 'gap-3'   },
  xl: { box: 'w-16 h-16', text: 'text-2xl',  gap: 'gap-3.5' },
};

const Mark = ({ stroke, fill }) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    className="w-[72%] h-[72%]"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* The C arc */}
    <path
      d="M26.5 9.2C24.2 7.6 21.4 6.8 18.4 6.8C11.3 6.8 5.6 12.4 5.6 20C5.6 27.6 11.3 33.2 18.4 33.2C21.4 33.2 24.2 32.4 26.5 30.8"
      stroke={stroke}
      strokeWidth="4.5"
      strokeLinecap="square"
    />
    {/* Ascending bars — progress motif */}
    <rect x="22" y="23" width="3.4" height="7.4"  fill={fill} />
    <rect x="26.6" y="18" width="3.4" height="12.4" fill={fill} />
    <rect x="31.2" y="12" width="3.4" height="18.4" fill={fill} />
  </svg>
);

const Logo = ({ size = 'md', variant = 'default', showText = false }) => {
  const s = SIZES[size] || SIZES.md;

  // Resolve variant aliases
  const v = variant === 'dark' ? 'default' : variant === 'navy' ? 'default' : variant;

  const styles = {
    default: {
      box:    'bg-nb-black border-2 border-nb-black',
      stroke: '#FFD93D',   // yellow arc
      fill:   '#FFD93D',   // yellow bars
      word:   'text-nb-black',
      ai:     'text-nb-black/50',
    },
    light: {
      box:    'bg-nb-yellow border-2 border-nb-black',
      stroke: '#111111',
      fill:   '#111111',
      word:   'text-white',
      ai:     'text-white/60',
    },
    gold: {
      box:    'bg-nb-yellow border-2 border-nb-black',
      stroke: '#111111',
      fill:   '#111111',
      word:   'text-white',
      ai:     'text-white/60',
    },
    mono: {
      box:    'bg-nb-black border-2 border-nb-black',
      stroke: '#FFFFFF',
      fill:   '#FFFFFF',
      word:   'text-nb-black',
      ai:     'text-nb-black/50',
    },
  }[v] || {
    box:    'bg-nb-black border-2 border-nb-black',
    stroke: '#FFD93D',
    fill:   '#FFD93D',
    word:   'text-nb-black',
    ai:     'text-nb-black/50',
  };

  return (
    <div className={`flex items-center ${s.gap}`}>
      <div
        className={`${s.box} ${styles.box} flex items-center justify-center flex-shrink-0`}
        style={{ borderRadius: '6px', boxShadow: '2px 2px 0 #111111' }}
        aria-hidden={showText ? 'true' : undefined}
      >
        <Mark stroke={styles.stroke} fill={styles.fill} />
      </div>
      {showText && (
        <span
          className={`font-display font-bold tracking-tight leading-none ${s.text} ${styles.word}`}
          style={{ fontFamily: 'var(--font-display)' }}
        >
          CrackIt
          <span className={`font-semibold ${styles.ai}`}> AI</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
