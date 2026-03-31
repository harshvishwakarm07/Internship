import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Sparkles, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationsPanel from '../common/NotificationsPanel';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/85 px-4 py-3 backdrop-blur md:px-6 md:py-4 dark:border-slate-700/90 dark:bg-slate-900/90">
      <div className="flex items-center justify-between">
      <Link to={user ? `/${user.role}` : '/login'} className="inline-flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-700"><Sparkles size={14} /></span>
        SITS
      </Link>
      <div className="flex items-center gap-3">
        {user && <NotificationsPanel />}
        <button type="button" onClick={toggleTheme} className="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <span className="hidden text-sm text-slate-600 md:inline dark:text-slate-300">{user ? user.name : 'Guest'}</span>
        {user && (
          <button onClick={logout} className="inline-flex items-center gap-1 rounded bg-slate-800 px-3 py-1.5 text-sm text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
            <LogOut size={14} />
            Logout
          </button>
        )}
      </div>
      </div>
    </header>
  );
}
