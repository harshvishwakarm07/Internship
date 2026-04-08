import React from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function AppLayout({ children }) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="futuristic-shell min-h-screen px-4 py-8 md:py-12">
        <div className="mx-auto flex min-h-[80vh] w-full max-w-5xl items-center justify-center rounded-[2rem] border border-white/40 bg-white/55 p-6 shadow-[0_30px_80px_-40px_rgba(2,6,23,0.65)] backdrop-blur-xl md:p-12 dark:border-slate-700/80 dark:bg-slate-900/55">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="futuristic-shell flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
