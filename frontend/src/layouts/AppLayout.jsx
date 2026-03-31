import React from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function AppLayout({ children }) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen px-4 py-12">
        <div className="mx-auto flex min-h-[74vh] w-full max-w-5xl items-center justify-center rounded-3xl bg-gradient-to-br from-white/90 via-white to-slate-100/90 p-6 backdrop-blur-sm ring-1 ring-slate-200 md:p-12 dark:from-slate-900/90 dark:via-slate-900 dark:to-slate-800/90 dark:ring-slate-700">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
