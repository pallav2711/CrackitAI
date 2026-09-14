import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText,
  Mic, Menu, X, LogOut, Trophy, CreditCard, Settings,
  ChevronRight, ShieldAlert, Zap,
} from 'lucide-react';
import Logo from '../common/Logo';
import useAuthStore from '../../store/useAuthStore';

const BASE_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',      path: '/dashboard' },
  { icon: Mic,             label: 'Voice Interview', path: '/interview/setup', badge: 'NEW', badgeColor: 'yellow' },
  { icon: FileText,        label: 'Resume Center',   path: '/resumes' },
  { icon: Trophy,          label: 'Leaderboard',     path: '/leaderboard' },
];

const BOTTOM_NAV = [
  { icon: CreditCard, label: 'Billing',  path: '/billing' },
  { icon: Settings,   label: 'Settings', path: '/settings' },
];

const DashboardLayout = ({ children }) => {
  const [open, setOpen]    = useState(false);
  const location           = useLocation();
  const navigate           = useNavigate();
  const { user, logout }   = useAuthStore();

  const NAV = user?.role === 'admin'
    ? [...BASE_NAV, { icon: ShieldAlert, label: 'Admin', path: '/admin/payments', badge: 'ADMIN', badgeColor: 'red' }]
    : BASE_NAV;

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name
    ?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '??';

  const isActive = (path) =>
    location.pathname === path ||
    (path !== '/dashboard' && location.pathname.startsWith(path));

  /* ── Nav link ─────────────────────────────────────────────────────────── */
  const NavLink = ({ item }) => {
    const active = isActive(item.path);
    return (
      <Link
        to={item.path}
        onClick={() => setOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 border-b-2 border-nb-black font-bold text-sm uppercase tracking-wide transition-colors duration-75 group relative ${
          active
            ? 'bg-nb-yellow text-nb-black'
            : 'bg-transparent text-nb-black/70 hover:bg-nb-yellow/25 hover:text-nb-black'
        }`}
        aria-current={active ? 'page' : undefined}
      >
        {/* Active indicator strip */}
        {active && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-nb-black" aria-hidden="true" />
        )}

        <item.icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
        <span className="flex-1 truncate">{item.label}</span>

        {item.badge && (
          <span
            className={`text-[9px] font-black px-1.5 py-0.5 border-2 border-nb-black leading-none ${
              item.badgeColor === 'red'
                ? 'bg-nb-red text-white'
                : 'bg-nb-black text-nb-yellow'
            }`}
            style={{ borderRadius: '2px' }}
          >
            {item.badge}
          </span>
        )}
        {active && (
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-60" aria-hidden="true" />
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8]">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-16 bg-nb-black border-b-3 border-nb-black flex items-center px-4 gap-4"
        style={{ boxShadow: '0 4px 0 #111111' }}
      >
        {/* Hamburger — mobile only */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden w-9 h-9 border-2 border-nb-yellow/50 flex items-center justify-center text-nb-yellow hover:border-nb-yellow hover:bg-nb-yellow hover:text-nb-black transition-colors"
          style={{ borderRadius: '4px' }}
          aria-label="Toggle navigation"
          aria-expanded={open}
          aria-controls="sidebar"
        >
          {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex-shrink-0 hover:opacity-80 transition-opacity" aria-label="CrackIt AI home">
          <Logo size="sm" variant="light" showText />
        </Link>

        {/* Plan badge */}
        {user?.subscription?.plan && user.subscription.plan !== 'free' && (
          <span
            className="hidden sm:flex items-center text-[9px] font-black uppercase tracking-[0.2em] bg-nb-yellow text-nb-black px-2.5 py-1 border-2 border-nb-yellow"
            style={{ borderRadius: '3px' }}
          >
            {user.subscription.plan}
          </span>
        )}

        <div className="flex-1" />

        {/* User area */}
        <div className="flex items-center gap-2.5">
          {/* User chip */}
          <div
            className="flex items-center gap-2 border-2 border-nb-yellow/40 hover:border-nb-yellow px-3 py-1.5 transition-colors cursor-default"
            style={{ borderRadius: '5px' }}
          >
            <div
              className="w-6 h-6 bg-nb-yellow text-nb-black text-[11px] font-black flex items-center justify-center flex-shrink-0"
              style={{ borderRadius: '3px' }}
              aria-hidden="true"
            >
              {initials}
            </div>
            <span className="hidden md:block text-sm font-bold text-nb-yellow/90 truncate max-w-[120px]">
              {user?.name}
            </span>
          </div>

          {/* Quick start button */}
          <Link
            to="/interview/setup"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-nb-yellow text-nb-black font-bold text-xs border-2 border-nb-yellow transition-all hover:bg-[#FFC300]"
            style={{ borderRadius: '4px', boxShadow: '2px 2px 0 rgba(255,217,61,0.5)' }}
          >
            <Zap className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden md:inline">New Interview</span>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-9 h-9 border-2 border-nb-yellow/30 text-nb-yellow/50 hover:border-nb-red hover:text-nb-red flex items-center justify-center transition-colors"
            style={{ borderRadius: '4px' }}
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        id="sidebar"
        className={`
          fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64
          bg-white border-r-3 border-nb-black
          flex flex-col
          transition-transform duration-200 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        aria-label="Sidebar navigation"
      >
        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto border-t-2 border-nb-black" aria-label="Main">
          {NAV.map(item => <NavLink key={item.path} item={item} />)}
        </nav>

        {/* Bottom nav (billing, settings) */}
        <div className="border-t-3 border-nb-black">
          {BOTTOM_NAV.map(item => <NavLink key={item.path} item={item} />)}
        </div>

        {/* Start interview CTA strip */}
        <div className="border-t-3 border-nb-black bg-nb-yellow">
          <Link
            to="/interview/setup"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-5 py-4 font-black text-sm uppercase tracking-wide text-nb-black hover:bg-[#FFC300] transition-colors"
          >
            <Mic className="w-4 h-4" aria-hidden="true" />
            <span>Start Interview</span>
            <ChevronRight className="w-4 h-4 ml-auto" aria-hidden="true" />
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-nb-black/60 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="lg:ml-64 pt-16 min-h-screen" id="main-content">
        <div className="p-5 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
