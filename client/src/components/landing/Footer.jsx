import { Link } from 'react-router-dom';
import { Mail, MapPin, ArrowUpRight } from 'lucide-react';
import Logo from '../common/Logo';
import {
  BRAND_NAME,
  BRAND_SHORT_DESC,
  SUPPORT_EMAIL,
  OFFICE_LOCATION,
} from '../../brand/config';

const Footer = () => {
  const year = new Date().getFullYear();

  const cols = [
    {
      title: 'Product',
      links: [
        { label: 'Voice interviews', to: '/register' },
        { label: 'Pricing',          to: '/pricing'  },
        { label: 'About us',         to: '/about-us' },
        { label: 'Contact',          to: '/contact'  },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy',   to: '/privacy-policy'   },
        { label: 'Terms of Service', to: '/terms-of-service' },
        { label: 'Refund Policy',    to: '/refund-policy'    },
      ],
    },
  ];

  return (
    <footer className="bg-nb-black text-white border-t-3 border-nb-black mt-auto">
      {/* Top accent bar */}
      <div className="bg-nb-yellow border-b-3 border-nb-black px-4 py-3">
        <p className="max-w-6xl mx-auto text-xs font-black uppercase tracking-widest text-nb-black">
          {BRAND_NAME} — Practice interviews. Strengthen your resume. Get hired.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-14">
        <div className="grid md:grid-cols-4 gap-10 pb-10 border-b-2 border-white/15">

          {/* Brand column */}
          <div className="space-y-5">
            <Link
              to="/"
              className="inline-flex hover:opacity-80 transition-opacity"
              aria-label={`${BRAND_NAME} home`}
            >
              <Logo size="sm" variant="light" showText />
            </Link>
            <p className="text-sm text-white/65 leading-relaxed max-w-xs">
              {BRAND_SHORT_DESC}
            </p>
            <div className="flex flex-col gap-2.5 text-sm">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="inline-flex items-center gap-2 text-white/60 hover:text-nb-yellow transition-colors font-medium"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                {SUPPORT_EMAIL}
              </a>
              <span className="inline-flex items-center gap-2 text-white/50">
                <MapPin className="w-4 h-4" aria-hidden="true" />
                {OFFICE_LOCATION}
              </span>
            </div>
          </div>

          {/* Nav columns */}
          {cols.map(({ title, links }) => (
            <div key={title}>
              <p className="text-[11px] font-black tracking-[0.18em] uppercase text-nb-yellow mb-5 pb-2 border-b-2 border-white/15">
                {title}
              </p>
              <ul className="space-y-3">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-white/65 hover:text-white font-medium inline-flex items-center gap-1 group transition-colors"
                    >
                      {label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* CTA column */}
          <div className="space-y-4">
            <p className="text-[11px] font-black tracking-[0.18em] uppercase text-nb-yellow mb-5 pb-2 border-b-2 border-white/15">
              Get started
            </p>
            <p className="text-sm text-white/60 leading-relaxed">
              Free plan includes 1 voice interview per month. No card required.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-nb-yellow text-nb-black font-bold text-sm border-2 border-nb-yellow transition-all duration-100 hover:bg-[#FFC300]"
              style={{ borderRadius: '6px', boxShadow: '3px 3px 0 rgba(255,217,61,0.4)' }}
            >
              Start free →
            </Link>
          </div>
        </div>

        {/* Payment note */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-5 border-b-2 border-white/10">
          <p className="text-xs text-white/45">
            Payments processed by Razorpay. Card and UPI details are not stored on {BRAND_NAME} servers.
          </p>
          <p className="text-xs text-white/35 font-mono tracking-wide">UPI · Visa · Mastercard · RuPay</p>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6">
          <p className="text-xs text-white/45">
            © {year} {BRAND_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-white/30 font-mono">Built in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
