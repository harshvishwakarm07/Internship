import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpenCheck, ClipboardCheck, FilePlus2, LayoutDashboard, UserCircle2, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();

  if (!user) return null;

  const navClass = ({ isActive }) => `inline-flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition ${isActive ? 'bg-gradient-to-r from-cyan-500/80 to-teal-500/70 text-white shadow-[0_8px_24px_-12px_rgba(6,182,212,0.9)]' : 'text-slate-200 hover:bg-white/10 hover:text-white'}`;

  return (
    <aside className="sticky top-0 hidden h-screen w-64 border-r border-slate-700/80 bg-slate-950/70 text-white backdrop-blur-xl md:block dark:border-slate-700/80 dark:bg-slate-950/75">
      <div className="border-b border-slate-800/80 px-4 py-4 dark:border-slate-700/80">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300/80">Student Internship Tracking</p>
        <p className="text-sm font-semibold text-white">{user.role.toUpperCase()} PANEL</p>
      </div>
      <nav className="space-y-2 p-3">
        {user.role === 'student' && (
          <>
            <NavLink className={navClass} to="/student">
              <LayoutDashboard size={16} /> Dashboard
            </NavLink>
            <NavLink className={navClass} to="/student/add-internship">
              <FilePlus2 size={16} /> Add Internship
            </NavLink>
            <NavLink className={navClass} to="/student/reports">
              <FileText size={16} /> Reports
            </NavLink>
            <NavLink className={navClass} to="/student/profile">
              <UserCircle2 size={16} /> Profile
            </NavLink>
          </>
        )}
        {user.role === 'faculty' && (
          <NavLink className={navClass} to="/faculty">
            <ClipboardCheck size={16} /> Review Center
          </NavLink>
        )}
        {user.role === 'admin' && (
          <NavLink className={navClass} to="/admin">
            <BookOpenCheck size={16} /> Admin Console
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
