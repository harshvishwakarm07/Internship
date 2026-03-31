import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Legend,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const COLORS = ['#2563eb', '#059669', '#dc2626', '#ca8a04'];

export function FacultyStatusChart({ internships }) {
  const { theme } = useTheme();
  const axisColor = theme === 'dark' ? '#cbd5e1' : '#475569';
  const gridColor = theme === 'dark' ? '#334155' : '#cbd5e1';
  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
  };

  const data = [
    { name: 'Pending', value: internships.filter((item) => item.status === 'Pending').length },
    { name: 'Approved', value: internships.filter((item) => item.status === 'Approved').length },
    { name: 'Rejected', value: internships.filter((item) => item.status === 'Rejected').length },
  ];

  return (
    <div className="elevated-card rounded-2xl p-4">
      <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Internship Status Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={85} label>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: axisColor }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AdminOverviewCharts({ stats }) {
  const { theme } = useTheme();
  const axisColor = theme === 'dark' ? '#cbd5e1' : '#475569';
  const gridColor = theme === 'dark' ? '#334155' : '#cbd5e1';
  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
  };

  const userData = [
    { name: 'Students', count: stats?.students || 0 },
    { name: 'Faculty', count: stats?.faculty || 0 },
    { name: 'Total Users', count: stats?.totalUsers || 0 },
  ];

  const internshipData = [
    { name: 'Internships', count: stats?.totalInternships || 0 },
    { name: 'Pending', count: stats?.pendingApprovals || 0 },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="elevated-card rounded-2xl p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">User Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={userData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" stroke={axisColor} tick={{ fill: axisColor }} />
              <YAxis allowDecimals={false} stroke={axisColor} tick={{ fill: axisColor }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="elevated-card rounded-2xl p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Internship Load</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={internshipData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" stroke={axisColor} tick={{ fill: axisColor }} />
              <YAxis allowDecimals={false} stroke={axisColor} tick={{ fill: axisColor }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#059669" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
