import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-slate-800">SITS</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600">{user ? user.name : 'Guest'}</span>
        {user && (
          <button onClick={logout} className="px-3 py-1.5 text-sm rounded bg-slate-800 text-white hover:bg-slate-700">
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
