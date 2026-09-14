export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:        '#111111',   // Near-black — primary text, borders, buttons
          'primary-dark': '#000000',
          accent:         '#FFD93D',   // Electric yellow — THE accent
          'accent-hover': '#FFC300',
          bg:             '#F5F1E8',   // Warm off-white
          surface:        '#FFFFFF',
          card:           '#FFFFFF',
          border:         '#111111',   // Hard black border (Neo-Brutalist)
          'border-soft':  '#E8E2D9',   // Softer border for subtle separators
          text:           '#111111',
          muted:          '#6B6B6B',
          success:        '#1A7A4A',
          warning:        '#D97706',
          error:          '#DC2626',
          info:           '#2563EB',
        },
        // nb-* namespace — maps to same Neo-Brutalist tokens
        nb: {
          yellow:  '#FFD93D',   // Electric yellow accent
          black:   '#111111',   // Near-black
          white:   '#FFFFFF',
          red:     '#DC2626',
          green:   '#1A7A4A',
          blue:    '#2563EB',
          pink:    '#E91E8C',
          cream:   '#F5F1E8',
          bg:      '#F5F1E8',
          surface: '#FFFFFF',
          border:  '#111111',
        },
      },
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono:    ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display': ['clamp(2.5rem, 6vw, 5rem)', { lineHeight: '1.0', letterSpacing: '-0.04em', fontWeight: '700' }],
        'hero':    ['clamp(2rem, 5vw, 4rem)',   { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '700' }],
      },
      borderWidth: {
        '1': '1px',
        '2': '2px',
        '3': '3px',    // ✅ FIXED — actual thick borders
        '4': '4px',
        '5': '5px',
      },
      boxShadow: {
        // True Neo-Brutalist hard offset shadows — no blur, no softness
        'nb-xs':  '2px 2px 0 #111111',
        'nb-sm':  '3px 3px 0 #111111',
        'nb':     '4px 4px 0 #111111',
        'nb-md':  '6px 6px 0 #111111',
        'nb-lg':  '8px 8px 0 #111111',
        'nb-xl':  '12px 12px 0 #111111',
        // Accent shadows
        'nb-yellow': '4px 4px 0 #FFD93D',
        'nb-yellow-lg': '6px 6px 0 #FFD93D',
        'nb-red':    '4px 4px 0 #DC2626',
        'nb-green':  '4px 4px 0 #1A7A4A',
        'nb-blue':   '4px 4px 0 #2563EB',
        // Pressed state (visually clicked)
        'nb-press':  '0 0 0 #111111',
        // Hover uplift
        'nb-hover':  '6px 6px 0 #111111',
      },
      borderRadius: {
        'none': '0',
        'sm':   '4px',
        'DEFAULT': '6px',
        'md':   '6px',
        'lg':   '8px',
        'xl':   '10px',
        '2xl':  '12px',
        'nb':   '6px',     // Standard Neo-Brutalist radius
        'full': '9999px',
      },
      animation: {
        'nb-shake': 'nbShake 0.3s ease-in-out',
        'nb-pop':   'nbPop 0.15s ease-out',
        'nb-slide': 'nbSlide 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        nbShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%':       { transform: 'translateX(-4px)' },
          '75%':       { transform: 'translateX(4px)' },
        },
        nbPop: {
          '0%':   { transform: 'scale(0.96)' },
          '100%': { transform: 'scale(1)' },
        },
        nbSlide: {
          '0%':   { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '72': '18rem',
        '80': '20rem',
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
};
