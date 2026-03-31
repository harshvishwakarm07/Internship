import React, { useEffect, useState } from 'react';
import api from '../services/api';
import AnimatedPage from '../components/common/AnimatedPage';
import { FacultyStatusChart } from '../components/dashboard/AnalyticsCharts';

export default function FacultyDashboard() {
  const [internships, setInternships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [pendingId, setPendingId] = useState('');
  const [selectedInternshipId, setSelectedInternshipId] = useState('');
  const [reports, setReports] = useState([]);
  const [feedbackDraft, setFeedbackDraft] = useState({});
  const [feedbackLoadingId, setFeedbackLoadingId] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        const { data } = await api.get('/internships/all');
        setInternships(data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load internships.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setPendingId(id);
      setError('');
      const { data } = await api.put(`/internships/${id}/status`, { status });
      setInternships((prev) => prev.map((i) => (i._id === id ? data : i)));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update internship status.');
    } finally {
      setPendingId('');
    }
  };

  const loadReports = async (internshipId) => {
    if (!internshipId) {
      setReports([]);
      return;
    }
    try {
      const { data } = await api.get(`/reports/${internshipId}`);
      setReports(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load reports for selected internship.');
    }
  };

  const onSelectInternship = async (event) => {
    const internshipId = event.target.value;
    setSelectedInternshipId(internshipId);
    await loadReports(internshipId);
  };

  const submitFeedback = async (reportId) => {
    setFeedbackLoadingId(reportId);
    try {
      const draft = feedbackDraft[reportId] || '';
      const { data } = await api.put(`/reports/${reportId}/feedback`, {
        feedback: draft,
        status: 'Reviewed',
      });
      setReports((current) => current.map((item) => (item._id === reportId ? data : item)));
      setFeedbackDraft((current) => ({ ...current, [reportId]: '' }));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setFeedbackLoadingId('');
    }
  };

  const filteredInternships = internships.filter((item) => {
    const normalized = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !normalized ||
      item.companyName.toLowerCase().includes(normalized) ||
      item.role.toLowerCase().includes(normalized) ||
      item.student?.name?.toLowerCase().includes(normalized);

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AnimatedPage className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Faculty Dashboard</h2>
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-300">Loading internships...</p>}

      <div className="elevated-card grid gap-3 rounded-2xl p-4 md:grid-cols-3">
        <input
          className="rounded border p-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          placeholder="Search company, role, student"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <select className="rounded border p-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button type="button" className="rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700" onClick={() => {
          setSearchTerm('');
          setStatusFilter('All');
        }}>
          Reset Filters
        </button>
      </div>

      <FacultyStatusChart internships={filteredInternships} />

      <div className="space-y-3">
        {!isLoading && internships.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-300">No internships available.</p>}
        {filteredInternships.map((i) => (
          <div key={i._id} className="elevated-card rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{i.companyName} - {i.role}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Status: {i.status}</p>
              {i.student?.name && <p className="text-xs text-slate-500 dark:text-slate-400">Student: {i.student.name} ({i.student.email})</p>}
            </div>
            <div className="space-x-2">
              <button disabled={pendingId === i._id} onClick={() => updateStatus(i._id, 'Approved')} className="px-3 py-1 rounded bg-green-600 text-white disabled:cursor-not-allowed disabled:bg-green-300">Approve</button>
              <button disabled={pendingId === i._id} onClick={() => updateStatus(i._id, 'Rejected')} className="px-3 py-1 rounded bg-red-600 text-white disabled:cursor-not-allowed disabled:bg-red-300">Reject</button>
            </div>
          </div>
        ))}
      </div>

      <div className="elevated-card rounded-2xl p-5">
        <h3 className="mb-3 text-lg font-semibold">Review Student Reports</h3>
        <select className="mb-4 w-full rounded border p-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" value={selectedInternshipId} onChange={onSelectInternship}>
          <option value="">Select internship</option>
          {internships.map((item) => (
            <option key={item._id} value={item._id}>{item.companyName} - {item.role}</option>
          ))}
        </select>
        <div className="space-y-3">
          {reports.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-300">No reports available for selected internship.</p>}
          {reports.map((report) => (
            <div key={report._id} className="rounded border p-4">
              <p className="text-sm font-semibold">Week {report.weekNumber}</p>
              <p className="mb-2 text-sm text-slate-600 dark:text-slate-300">{report.content}</p>
              <textarea className="mb-2 w-full rounded border p-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" rows="3" placeholder="Write feedback" value={feedbackDraft[report._id] ?? ''} onChange={(e) => setFeedbackDraft((current) => ({ ...current, [report._id]: e.target.value }))} />
              <button disabled={feedbackLoadingId === report._id} className="rounded bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300" type="button" onClick={() => submitFeedback(report._id)}>
                {feedbackLoadingId === report._id ? 'Saving...' : 'Save feedback'}
              </button>
              {report.feedback && <p className="mt-2 text-xs text-emerald-700">Latest feedback: {report.feedback}</p>}
            </div>
          ))}
        </div>
      </div>
    </AnimatedPage>
  );
}
