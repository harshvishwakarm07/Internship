import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpenCheck, ClipboardCheck, FilePlus2, LayoutDashboard, UserCircle2, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <aside className="hidden min-h-screen w-64 border-r border-slate-700 bg-gradient-to-b from-slate-900 to-slate-800 text-white md:block dark:border-slate-700 dark:from-slate-950 dark:to-slate-900">
      <div className="border-b border-slate-800 px-4 py-4 dark:border-slate-700">
        <p className="text-xs uppercase tracking-wide text-slate-400">Student Internship Tracking</p>
        <p className="text-sm font-semibold text-white">{user.role.toUpperCase()} PANEL</p>
      </div>
      <nav className="space-y-2 p-3">
        {user.role === 'student' && (
          <>
            <NavLink className={({ isActive }) => `inline-flex w-full items-center gap-2 rounded px-3 py-2 text-sm ${isActive ? 'bg-slate-700 text-white' : 'text-slate-200 hover:bg-slate-800'}`} to="/student">
              <LayoutDashboard size={16} /> Dashboard
            </NavLink>
            <NavLink className={({ isActive }) => `inline-flex w-full items-center gap-2 rounded px-3 py-2 text-sm ${isActive ? 'bg-slate-700 text-white' : 'text-slate-200 hover:bg-slate-800'}`} to="/student/add-internship">
              <FilePlus2 size={16} /> Add Internship
            </NavLink>
            <NavLink className={({ isActive }) => `inline-flex w-full items-center gap-2 rounded px-3 py-2 text-sm ${isActive ? 'bg-slate-700 text-white' : 'text-slate-200 hover:bg-slate-800'}`} to="/student/reports">
              <FileText size={16} /> Reports
            </NavLink>
            <NavLink className={({ isActive }) => `inline-flex w-full items-center gap-2 rounded px-3 py-2 text-sm ${isActive ? 'bg-slate-700 text-white' : 'text-slate-200 hover:bg-slate-800'}`} to="/student/profile">
              <UserCircle2 size={16} /> Profile
            </NavLink>
          </>
        )}
        {user.role === 'faculty' && (
          <NavLink className={({ isActive }) => `inline-flex w-full items-center gap-2 rounded px-3 py-2 text-sm ${isActive ? 'bg-slate-700 text-white' : 'text-slate-200 hover:bg-slate-800'}`} to="/faculty">
            <ClipboardCheck size={16} /> Review Center
          </NavLink>
        )}
        {user.role === 'admin' && (
          <NavLink className={({ isActive }) => `inline-flex w-full items-center gap-2 rounded px-3 py-2 text-sm ${isActive ? 'bg-slate-700 text-white' : 'text-slate-200 hover:bg-slate-800'}`} to="/admin">
            <BookOpenCheck size={16} /> Admin Console
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
