import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LogOut, Sparkles, Moon, Sun, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationsPanel from '../common/NotificationsPanel';

const roleLinks = {
  student: [
    { label: 'Dashboard', to: '/student' },
    { label: 'Add Internship', to: '/student/add-internship' },
    { label: 'Reports', to: '/student/reports' },
    { label: 'Profile', to: '/student/profile' },
  ],
  faculty: [{ label: 'Review Center', to: '/faculty' }],
  admin: [{ label: 'Admin Console', to: '/admin' }],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const links = user ? roleLinks[user.role] || [] : [];

  return (
    <header className="shrink-0 z-30 border-b border-white/30 bg-white/50 px-4 py-3 backdrop-blur-xl md:px-6 md:py-4 dark:border-slate-700/80 dark:bg-slate-900/55">
      <div className="flex items-center justify-between">
      <Link to={user ? `/${user.role}` : '/login'} className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-teal-400 text-slate-950 shadow-[0_0_0_2px_rgba(255,255,255,0.35)]"><Sparkles size={14} /></span>
        SITS
      </Link>
      <div className="flex items-center gap-3">
        {user && (
          <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300/70 bg-white/70 text-slate-700 hover:bg-white md:hidden dark:border-slate-600/80 dark:bg-slate-800/75 dark:text-slate-100 dark:hover:bg-slate-700"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        )}
        {user && <NotificationsPanel />}
        <button type="button" onClick={toggleTheme} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300/70 bg-white/70 text-slate-700 hover:bg-white dark:border-slate-600/80 dark:bg-slate-800/75 dark:text-slate-100 dark:hover:bg-slate-700" aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <span className="hidden text-sm text-slate-600 md:inline dark:text-slate-300">{user ? user.name : 'Guest'}</span>
        {user && (
          <button onClick={logout} className="inline-flex items-center gap-1 rounded-lg border border-slate-300/80 bg-white/75 px-3 py-1.5 text-sm text-slate-800 hover:bg-white dark:border-slate-600/80 dark:bg-slate-800/70 dark:text-slate-100 dark:hover:bg-slate-700">
            <LogOut size={14} />
            Logout
          </button>
        )}
      </div>
      </div>

      {user && mobileMenuOpen && (
        <div className="mt-3 space-y-2 border-t border-slate-200/70 pt-3 md:hidden dark:border-slate-700/80">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white' : 'bg-white/70 text-slate-700 hover:bg-white dark:bg-slate-800/75 dark:text-slate-100 dark:hover:bg-slate-700'}`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
