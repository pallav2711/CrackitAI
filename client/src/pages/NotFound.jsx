import { Link } from 'react-router-dom';
import Logo from '../components/common/Logo';
import Seo from '../components/seo/Seo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col items-center justify-center px-4 py-16">
      <Seo page="notFound" />

      <div className="w-full max-w-sm">
        {/* Yellow top strip */}
        <div
          className="bg-nb-yellow border-3 border-nb-black border-b-0 px-6 py-5 flex items-center justify-between"
          style={{ borderRadius: '8px 8px 0 0', boxShadow: '4px 0 0 #111111, -4px 0 0 #111111' }}
        >
          <Logo size="sm" variant="default" showText />
          <span
            className="text-[10px] font-black tracking-[0.2em] uppercase px-2 py-1 bg-nb-black text-nb-yellow border-2 border-nb-black"
            style={{ borderRadius: '3px' }}
          >
            404
          </span>
        </div>

        <div
          className="border-3 border-nb-black bg-white px-8 py-10 space-y-5 text-center"
          style={{ boxShadow: '4px 4px 0 #111111' }}
        >
          <p
            className="font-black leading-none text-nb-black/20"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '5rem' }}
            aria-hidden="true"
          >
            404
          </p>
          <div>
            <h1
              className="font-bold uppercase tracking-tight"
              style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '-0.03em' }}
            >
              Page not found
            </h1>
            <p className="text-sm text-nb-black/55 mt-2 leading-relaxed">
              That URL doesn't exist, or it moved. Try home, pricing, or your dashboard if you're signed in.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/" className="btn btn-primary justify-center">
              Back to home
            </Link>
            <Link to="/pricing" className="btn btn-secondary justify-center">
              Pricing
            </Link>
          </div>
        </div>

        <div
          className="border-3 border-nb-black border-t-0 bg-nb-black px-6 py-3 flex items-center justify-center"
          style={{ borderRadius: '0 0 8px 8px', boxShadow: '4px 4px 0 #111111' }}
        >
          <Link to="/dashboard" className="text-xs font-bold text-nb-yellow hover:text-nb-yellow/80 transition-colors">
            Go to Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
