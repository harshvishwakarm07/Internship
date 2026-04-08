import React, { useEffect, useState } from 'react';
import api, { notifyToast } from '../services/api';
import AnimatedPage from '../components/common/AnimatedPage';
import { AdminOverviewCharts } from '../components/dashboard/AnalyticsCharts';

const initialUserForm = {
  name: '',
  email: '',
  password: '',
  role: 'student',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState(initialUserForm);
  const [isCreating, setIsCreating] = useState(false);
  const [assignData, setAssignData] = useState({ studentId: '', facultyId: '' });
  const [assigning, setAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        const [statsResponse, usersResponse] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
        ]);
        setStats(statsResponse.data);
        setUsers(usersResponse.data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load admin stats.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filteredUsers = users.filter((item) => {
    const normalized = searchTerm.trim().toLowerCase();
    const matchesSearch = !normalized || item.name.toLowerCase().includes(normalized) || item.email.toLowerCase().includes(normalized);
    const matchesRole = roleFilter === 'all' || item.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <AnimatedPage className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {isLoading ? (
        <div className="grid max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded border bg-slate-100 dark:border-slate-700 dark:bg-slate-800" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
          <Stat label="Total Users" value={stats.totalUsers} />
          <Stat label="Students" value={stats.students} />
          <Stat label="Faculty" value={stats.faculty} />
          <Stat label="Internships" value={stats.totalInternships} />
        </div>
      ) : (
        <p>Loading...</p>
      )}

      {stats && <AdminOverviewCharts stats={stats} />}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="elevated-card rounded-2xl p-5">
          <h3 className="mb-3 text-lg font-semibold">Create User</h3>
          <form
            className="space-y-3"
            onSubmit={async (event) => {
              event.preventDefault();
              setIsCreating(true);
              setError('');
              try {
                const { data } = await api.post('/admin/users', userForm);
                setUsers((current) => [data, ...current]);
                setUserForm(initialUserForm);
                notifyToast('User created successfully.', 'success');
              } catch (err) {
                setError(err?.response?.data?.message || 'Failed to create user.');
              } finally {
                setIsCreating(false);
              }
            }}
          >
            <input className="w-full rounded border p-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" placeholder="Name" value={userForm.name} onChange={(e) => setUserForm((current) => ({ ...current, name: e.target.value }))} required />
            <input className="w-full rounded border p-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" type="email" placeholder="Email" value={userForm.email} onChange={(e) => setUserForm((current) => ({ ...current, email: e.target.value }))} required />
            <input className="w-full rounded border p-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" type="password" minLength={6} placeholder="Password" value={userForm.password} onChange={(e) => setUserForm((current) => ({ ...current, password: e.target.value }))} required />
            <select className="w-full rounded border p-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" value={userForm.role} onChange={(e) => setUserForm((current) => ({ ...current, role: e.target.value }))}>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
            <button disabled={isCreating} className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300" type="submit">
              {isCreating ? 'Creating...' : 'Create user'}
            </button>
          </form>
        </div>

        <div className="elevated-card rounded-2xl p-5">
          <h3 className="mb-3 text-lg font-semibold">Assign Mentor</h3>
          <div className="space-y-3">
            <select className="w-full rounded border p-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" value={assignData.studentId} onChange={(e) => setAssignData((current) => ({ ...current, studentId: e.target.value }))}>
              <option value="">Select student</option>
              {users.filter((user) => user.role === 'student').map((student) => (
                <option key={student._id} value={student._id}>{student.name} ({student.email})</option>
              ))}
            </select>
            <select className="w-full rounded border p-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" value={assignData.facultyId} onChange={(e) => setAssignData((current) => ({ ...current, facultyId: e.target.value }))}>
              <option value="">Select faculty</option>
              {users.filter((user) => user.role === 'faculty').map((faculty) => (
                <option key={faculty._id} value={faculty._id}>{faculty.name} ({faculty.email})</option>
              ))}
            </select>
            <button
              disabled={assigning}
              onClick={async () => {
                if (!assignData.studentId || !assignData.facultyId) {
                  setError('Select both student and faculty before assigning.');
                  return;
                }
                setAssigning(true);
                setError('');
                try {
                  await api.put(`/admin/assign-mentor/${assignData.studentId}`, { facultyId: assignData.facultyId });
                  notifyToast('Mentor assigned successfully.', 'success');
                } catch (err) {
                  setError(err?.response?.data?.message || 'Failed to assign mentor.');
                } finally {
                  setAssigning(false);
                }
              }}
              className="w-full rounded bg-emerald-600 p-2 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
              type="button"
            >
              {assigning ? 'Assigning...' : 'Assign mentor'}
            </button>
          </div>
        </div>
      </div>

      <div className="elevated-card rounded-2xl p-5">
        <h3 className="mb-3 text-lg font-semibold">Users</h3>
        <div className="mb-3 grid gap-3 md:grid-cols-3">
          <input className="rounded border p-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" placeholder="Search user by name/email" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
          <select className="rounded border p-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="all">All roles</option>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
          </select>
          <button type="button" className="rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" onClick={() => {
            setSearchTerm('');
            setRoleFilter('all');
          }}>
            Reset Filters
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/70">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-300">Name</th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-300">Email</th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-300">Role</th>
                <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-slate-500 dark:text-slate-300">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-700 dark:bg-slate-900/60">
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td className="px-4 py-2 text-sm font-medium text-slate-800 dark:text-slate-100">{user.name}</td>
                  <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300">{user.email}</td>
                  <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300">{user.role}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
                      type="button"
                      onClick={async () => {
                        setError('');
                        try {
                          await api.delete(`/admin/users/${user._id}`);
                          setUsers((current) => current.filter((item) => item._id !== user._id));
                          notifyToast('User deleted successfully.', 'success');
                        } catch (err) {
                          setError(err?.response?.data?.message || 'Failed to delete user.');
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AnimatedPage>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded border bg-white p-4 dark:border-slate-700 dark:bg-slate-900/60">
      <p className="text-sm text-slate-500 dark:text-slate-300">{label}</p>
      <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}
