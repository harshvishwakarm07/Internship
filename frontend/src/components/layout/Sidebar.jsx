import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <aside className="w-56 bg-slate-900 text-white min-h-screen p-4">
      <nav className="space-y-2">
        {user.role === 'student' && <Link className="block px-3 py-2 rounded hover:bg-slate-800" to="/student">Student</Link>}
        {user.role === 'faculty' && <Link className="block px-3 py-2 rounded hover:bg-slate-800" to="/faculty">Faculty</Link>}
        {user.role === 'admin' && <Link className="block px-3 py-2 rounded hover:bg-slate-800" to="/admin">Admin</Link>}
      </nav>
    </aside>
  );
}
