import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from '../common/Logo';
import useAuthStore from '../../store/useAuthStore';
import { BRAND_NAME } from '../../brand/config';

const Navbar = () => {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location                = useLocation();
  const { isAuthenticated }     = useAuthStore();

  const links = [
    { to: '/#features', label: 'Product' },
    { to: '/pricing',   label: 'Pricing'  },
    { to: '/about-us',  label: 'About'    },
    { to: '/contact',   label: 'Contact'  },
  ];

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (to) => {
    if (to.startsWith('/#')) return false;
    return location.pathname === to;
  };

  return (
    <nav
      className={`sticky top-0 z-50 bg-[#F5F1E8] border-b-3 border-nb-black transition-shadow duration-150 ${
        scrolled ? 'shadow-[0_4px_0_#111111]' : ''
      }`}
      aria-label="Primary navigation"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-0 hover:opacity-80 transition-opacity"
            aria-label={`${BRAND_NAME} home`}
          >
            <Logo size="sm" variant="default" showText />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center" role="list">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                role="listitem"
                className={`px-4 py-2 text-sm font-bold tracking-wide border-r-2 border-nb-black transition-colors duration-100 ${
                  isActive(to)
                    ? 'bg-nb-yellow text-nb-black'
                    : 'text-nb-black/70 hover:text-nb-black hover:bg-nb-yellow/25'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-sm">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">
                  Sign in
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Get started free
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="md:hidden w-10 h-10 border-2 border-nb-black bg-white flex items-center justify-center transition-colors hover:bg-nb-yellow"
            style={{ borderRadius: '6px', boxShadow: '2px 2px 0 #111111' }}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div
            id="mobile-nav"
            className="md:hidden border-t-2 border-nb-black bg-white"
          >
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`block px-5 py-4 text-sm font-bold border-b-2 border-nb-black tracking-wide transition-colors ${
                  isActive(to)
                    ? 'bg-nb-yellow text-nb-black'
                    : 'text-nb-black hover:bg-nb-yellow/25'
                }`}
              >
                {label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 p-4">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-primary btn-block">
                  Dashboard →
                </Link>
              ) : (
                <>
                  <Link to="/login" className="btn btn-ghost btn-block">
                    Sign in
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-block">
                    Get started free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
