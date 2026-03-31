import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    };
    load();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>
      {stats ? (
        <div className="grid grid-cols-2 gap-4 max-w-2xl">
          <Stat label="Total Users" value={stats.totalUsers} />
          <Stat label="Students" value={stats.students} />
          <Stat label="Faculty" value={stats.faculty} />
          <Stat label="Internships" value={stats.totalInternships} />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white border rounded p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
