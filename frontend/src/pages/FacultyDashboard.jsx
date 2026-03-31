import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function FacultyDashboard() {
  const [internships, setInternships] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get('/internships/all');
      setInternships(data);
    };
    load();
  }, []);

  const updateStatus = async (id, status) => {
    const { data } = await api.put(`/internships/${id}/status`, { status });
    setInternships((prev) => prev.map((i) => (i._id === id ? data : i)));
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Faculty Dashboard</h2>
      <div className="space-y-3">
        {internships.map((i) => (
          <div key={i._id} className="bg-white border rounded p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{i.companyName} - {i.role}</p>
              <p className="text-sm text-slate-600">Status: {i.status}</p>
            </div>
            <div className="space-x-2">
              <button onClick={() => updateStatus(i._id, 'Approved')} className="px-3 py-1 rounded bg-green-600 text-white">Approve</button>
              <button onClick={() => updateStatus(i._id, 'Rejected')} className="px-3 py-1 rounded bg-red-600 text-white">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
