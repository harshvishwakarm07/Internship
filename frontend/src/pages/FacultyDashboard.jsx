import React, { useEffect, useState } from 'react';
import api, { notifyToast } from '../services/api';
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
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

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

  const updateStatus = async (id, status, reason = '') => {
    try {
      setPendingId(id);
      setError('');
      const payload = status === 'Rejected'
        ? { status, rejectionReason: reason }
        : { status };
      const { data } = await api.put(`/internships/${id}/status`, payload);
      setInternships((prev) => prev.map((i) => (i._id === id ? data : i)));
      notifyToast(`Internship marked as ${status}.`, 'success');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update internship status.');
    } finally {
      setPendingId('');
    }
  };

  const openRejectDialog = (internship) => {
    setError('');
    setRejectTarget(internship);
    setRejectionReason('');
  };

  const closeRejectDialog = () => {
    setRejectTarget(null);
    setRejectionReason('');
  };

  const confirmReject = async () => {
    const reason = rejectionReason.trim();
    if (!reason) {
      setError('Please provide a rejection reason before rejecting the internship.');
      return;
    }

    const target = rejectTarget;
    closeRejectDialog();
    await updateStatus(target._id, 'Rejected', reason);
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
    const draft = (feedbackDraft[reportId] || '').trim();
    if (draft.length < 3) {
      setError('Feedback must be at least 3 characters.');
      return;
    }
    setFeedbackLoadingId(reportId);
    try {
      const { data } = await api.put(`/reports/${reportId}/feedback`, {
        feedback: draft,
        status: 'Reviewed',
      });
      setReports((current) => current.map((item) => (item._id === reportId ? data : item)));
      setFeedbackDraft((current) => ({ ...current, [reportId]: '' }));
      notifyToast('Feedback saved successfully.', 'success');
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
      <div className="elevated-card rounded-2xl p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-500 dark:text-cyan-400 mb-1">Faculty Panel</p>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Review Center</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">You can only see and review internships assigned to you as mentor.</p>
      </div>
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
          <span>⚠</span> {error}
        </div>
      )}
      {isLoading && (
        <div className="space-y-2">
          <div className="h-5 w-52 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
        </div>
      )}

      <div className="elevated-card grid gap-3 rounded-2xl p-4 md:grid-cols-3">
        <input className="field-control" placeholder="Search company, role, or student…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <select className="field-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button type="button" className="rounded-xl border border-slate-300/70 dark:border-slate-600 bg-white/60 dark:bg-slate-800/60 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}>
          Reset
        </button>
      </div>

      <FacultyStatusChart internships={filteredInternships} />

      <div className="space-y-3">
        {!isLoading && internships.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-300">No internships available.</p>}
        {filteredInternships.map((i) => (
          <div key={i._id} className="elevated-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 dark:text-slate-100">{i.companyName} — {i.role}</p>
              {i.student?.name && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Student: {i.student.name} ({i.student.email})</p>}
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${i.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : i.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>{i.status}</span>
                <span className="inline-flex rounded-full bg-cyan-100 dark:bg-cyan-900/40 px-2 py-0.5 text-xs font-medium text-cyan-700 dark:text-cyan-200">Assigned to You</span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button disabled={pendingId === i._id || i.status === 'Approved'} onClick={() => updateStatus(i._id, 'Approved')}
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 transition-colors">
                Approve
              </button>
              <button disabled={pendingId === i._id || i.status === 'Rejected'} onClick={() => openRejectDialog(i)}
                className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40 transition-colors">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="elevated-card rounded-2xl p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-500 dark:text-teal-400 mb-1">Feedback</p>
        <h3 className="mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100">Review Student Reports</h3>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Select an assigned internship to view and review submitted reports.</p>
        <div className="mb-4">
          <label className="field-label">Internship</label>
          <select className="field-control" value={selectedInternshipId} onChange={onSelectInternship}>
            <option value="">Select internship</option>
            {internships.map((item) => (
              <option key={item._id} value={item._id}>{item.companyName} – {item.role} ({item.student?.name || 'student'})</option>
            ))}
          </select>
        </div>
        <div className="space-y-3">
          {reports.length === 0 && (
            <p className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/40 px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
              {selectedInternshipId ? 'No reports submitted yet.' : 'Select an internship above.'}
            </p>
          )}
          {reports.map((report) => (
            <div key={report._id} className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/40 dark:bg-slate-800/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Week {report.weekNumber}</p>
                <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${report.status === 'Reviewed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>{report.status}</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{report.content}</p>
              {report.feedback && (
                <p className="text-xs rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-3 py-1.5">💬 Current feedback: {report.feedback}</p>
              )}
              <div>
                <label className="field-label">Write Feedback (min 3 chars)</label>
                <textarea className="field-control resize-none" rows="3" placeholder="Enter your feedback for this report…"
                  value={feedbackDraft[report._id] ?? ''} onChange={(e) => setFeedbackDraft((c) => ({ ...c, [report._id]: e.target.value }))} />
              </div>
              <button disabled={feedbackLoadingId === report._id} type="button" onClick={() => submitFeedback(report._id)}
                className="neon-button rounded-lg px-4 py-1.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200">
                {feedbackLoadingId === report._id ? 'Saving…' : 'Save Feedback'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg elevated-card rounded-2xl p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-500 dark:text-red-400 mb-1">Action Required</p>
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Reject Internship</h4>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Add a clear reason for rejecting <span className="font-medium">{rejectTarget.companyName} - {rejectTarget.role}</span>.
            </p>
            <textarea className="field-control mt-3 resize-none" rows="4" placeholder="Enter rejection reason (required, min 3 chars)…"
              value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={closeRejectDialog}
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-800/60 px-4 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                Cancel
              </button>
              <button type="button" onClick={confirmReject}
                className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors">
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
}
