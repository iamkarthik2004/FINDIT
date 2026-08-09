import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, LogOut, User } from 'lucide-react';
import Logo from './Logo';
import Button from './Button';
import { useAuth } from '../context/AuthContext';
import { cls } from '../utils/helpers';
import { chatService } from '../services';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/lost', label: 'Lost Items' },
  { to: '/found', label: 'Found Items' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/chats', label: 'Chats' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadChats, setUnreadChats] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadChats(0);
      return undefined;
    }
    let active = true;
    const refresh = () => chatService.unreadCount().then((result) => active && setUnreadChats(result.count || 0)).catch(() => {});
    refresh();
    const timer = window.setInterval(refresh, 10000);
    return () => { active = false; window.clearInterval(timer); };
  }, [isAuthenticated]);

  useEffect(() => {
    setOpen(false);
    setUserMenu(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setUserMenu(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-lavender-200/80 bg-white/85 backdrop-blur-lg">
      <nav className="container-x flex h-16 items-center justify-between gap-4" aria-label="Main navigation">
        <Logo />

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  cls(
                    'rounded-full px-4 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-primary-soft text-primary-dark'
                      : 'text-ink-soft hover:bg-lavender-50 hover:text-ink',
                  )
                }
              >
                <span className="inline-flex items-center gap-1.5">
                  {link.label}
                  {link.to === '/chats' && unreadChats > 0 && <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread chats" />}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenu((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-lavender-200 py-1.5 pl-1.5 pr-4 text-sm font-semibold text-ink transition hover:border-primary/40 hover:bg-lavender-50 focus:outline-none focus:ring-4 focus:ring-primary/15"
                aria-expanded={userMenu}
                aria-haspopup="menu"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-xs font-bold text-white">
                  {user?.name?.charAt(0) || 'U'}
                </span>
                {user?.name?.split(' ')[0] || 'Student'}
              </button>
              {userMenu && (
                <div
                  role="menu"
                  className="absolute right-0 top-12 w-56 rounded-2xl border border-lavender-200 bg-white p-2 shadow-lift animate-scale-in"
                >
                  <div className="border-b border-lavender-100 px-3 py-2">
                    <p className="text-sm font-semibold text-ink">{user?.name}</p>
                    <p className="truncate text-xs text-ink-soft">{user?.email}</p>
                  </div>
                  <Link
                    to="/my-reports"
                    role="menuitem"
                    className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-lavender-50"
                  >
                    <User size={16} className="text-primary" aria-hidden="true" /> My Reports
                  </Link>
                  <Link
                    to="/claims"
                    role="menuitem"
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-lavender-50"
                  >
                    <LayoutDashboard size={16} className="text-primary" aria-hidden="true" /> My Claims
                  </Link>
                  <button
                    onClick={handleLogout}
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-error transition hover:bg-error-soft"
                  >
                    <LogOut size={16} aria-hidden="true" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-ghost">
              Login
            </Link>
          )}
          <Link to="/report-lost">
            <Button>Report Item</Button>
          </Link>
        </div>

        <button
          className="rounded-xl p-2 text-ink transition hover:bg-lavender-50 focus:outline-none focus:ring-4 focus:ring-primary/20 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-lavender-100 bg-white px-4 pb-6 pt-3 lg:hidden animate-fade-in">
          <ul className="space-y-1">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    cls(
                      'block rounded-xl px-4 py-3 text-sm font-semibold transition',
                      isActive ? 'bg-primary-soft text-primary-dark' : 'text-ink hover:bg-lavender-50',
                    )
                  }
                >
                  <span className="inline-flex items-center gap-1.5">
                    {link.label}
                    {link.to === '/chats' && unreadChats > 0 && <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread chats" />}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2.5 border-t border-lavender-100 pt-4">
            {isAuthenticated ? (
              <>
                <Link to="/my-reports" className="btn-secondary w-full">My Reports</Link>
                <Link to="/claims" className="btn-secondary w-full">My Claims</Link>
                <button onClick={handleLogout} className="btn-secondary w-full text-error">
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-secondary w-full">Login</Link>
            )}
            <Link to="/report-lost">
              <Button className="w-full">Report Item</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
