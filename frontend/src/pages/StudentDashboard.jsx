import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api, { getAssetUrl, notifyToast } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AnimatedPage from '../components/common/AnimatedPage';

const initialFormData = { companyName: '', role: '', startDate: '', endDate: '' };

export default function StudentDashboard() {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isReportSubmitting, setIsReportSubmitting] = useState(false);
  const [isCertUploading, setIsCertUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedInternshipId, setSelectedInternshipId] = useState('');
  const [reports, setReports] = useState([]);
  const [reportForm, setReportForm] = useState({ weekNumber: '', content: '' });
  const [reportFile, setReportFile] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Fetch my internships
  useEffect(() => {
    const fetchInternships = async () => {
      try {
        setError('');
        const { data } = await api.get('/internships');
        setInternships(data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load internships.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInternships();
  }, []);

  const updateField = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);
    
    // Uploader Logic: Using FormData for Local Files
    const payload = new FormData();
    payload.append('companyName', formData.companyName);
    payload.append('role', formData.role);
    payload.append('startDate', formData.startDate);
    payload.append('endDate', formData.endDate);
    if (file) payload.append('offerLetter', file);

    try {
      const { data: newInternship } = await api.post('/internships', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setInternships((current) => [...current, newInternship]);
      setFormData(initialFormData);
      setFile(null);
      setSuccessMessage('Internship submitted successfully.');
      notifyToast('Internship submitted successfully.', 'success');
    } catch (err) {
      setError(err?.response?.data?.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadReports = async (internshipId) => {
    if (!internshipId) {
      setReports([]);
      return;
    }

    try {
      setError('');
      const { data } = await api.get(`/reports/${internshipId}`);
      setReports(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load reports.');
    }
  };

  const onInternshipChange = async (event) => {
    const internshipId = event.target.value;
    setSelectedInternshipId(internshipId);
    await loadReports(internshipId);
  };

  const submitReport = async (event) => {
    event.preventDefault();
    if (!selectedInternshipId) {
      setError('Select an internship before submitting a report.');
      return;
    }

    setIsReportSubmitting(true);
    setError('');
    setSuccessMessage('');
    try {
      const payload = new FormData();
      payload.append('internship', selectedInternshipId);
      payload.append('weekNumber', reportForm.weekNumber);
      payload.append('content', reportForm.content);
      if (reportFile) payload.append('attachment', reportFile);

      await api.post('/reports', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setReportForm({ weekNumber: '', content: '' });
      setReportFile(null);
      setSuccessMessage('Report submitted successfully.');
      notifyToast('Weekly report submitted.', 'success');
      await loadReports(selectedInternshipId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Report submission failed.');
    } finally {
      setIsReportSubmitting(false);
    }
  };

  const uploadCertificate = async () => {
    if (!selectedInternshipId) {
      setError('Select an internship before uploading certificate.');
      return;
    }
    if (!certificateFile) {
      setError('Please choose a certificate file first.');
      return;
    }

    setIsCertUploading(true);
    setError('');
    setSuccessMessage('');
    try {
      const payload = new FormData();
      payload.append('certificate', certificateFile);
      const { data: updated } = await api.put(`/internships/${selectedInternshipId}/certificate`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setInternships((current) => current.map((item) => (item._id === updated._id ? updated : item)));
      setCertificateFile(null);
      setSuccessMessage('Certificate uploaded successfully.');
      notifyToast('Certificate uploaded successfully.', 'success');
    } catch (err) {
      setError(err?.response?.data?.message || 'Certificate upload failed.');
    } finally {
      setIsCertUploading(false);
    }
  };

  const filteredInternships = internships.filter((item) => {
    const normalized = searchTerm.trim().toLowerCase();
    const matchesSearch = !normalized || item.companyName.toLowerCase().includes(normalized) || item.role.toLowerCase().includes(normalized);
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusBadge = (status) => {
    if (status === 'Approved') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
    if (status === 'Rejected') return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
  };

  return (
    <AnimatedPage className="mx-auto max-w-6xl">
    <div className="space-y-7">

      {/* ── Welcome header ───────────────────────────────── */}
      <div className="elevated-card rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-500 dark:text-cyan-400 mb-1">Student Dashboard</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome back, <span className="text-cyan-500">{user.name}</span></h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track your internships, submit weekly reports, and manage your profile.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <div className="elevated-card rounded-xl px-4 py-3 text-center min-w-[80px]">
            <p className="text-2xl font-bold text-cyan-500">{internships.length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Internships</p>
          </div>
          <div className="elevated-card rounded-xl px-4 py-3 text-center min-w-[80px]">
            <p className="text-2xl font-bold text-teal-500">{reports.length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Reports</p>
          </div>
        </div>
      </div>

      {/* ── Quick-action cards ────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { to: '/student/add-internship', step: '01', title: 'Add Internship', desc: 'Submit offer details and upload your offer letter.' },
          { to: '/student/reports',        step: '02', title: 'Submit Reports',  desc: 'Track weekly work updates and faculty feedback.'  },
          { to: '/student/profile',        step: '03', title: 'Complete Profile',desc: 'Keep your academic and contact details current.'  },
        ].map(({ to, step, title, desc }) => (
          <Link key={to} to={to}
            className="elevated-card group rounded-xl p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
            <p className="text-3xl font-black text-cyan-400/30 dark:text-cyan-500/20 group-hover:text-cyan-400/50 transition-colors select-none leading-none mb-2">{step}</p>
            <p className="font-semibold text-slate-800 dark:text-slate-100">{title}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{desc}</p>
          </Link>
        ))}
      </div>

      {/* ── Alerts ───────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
          <span className="text-base">⚠</span> {error}
        </div>
      )}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
          <span className="text-base">✓</span> {successMessage}
        </div>
      )}

      {/* ── Add Internship form ───────────────────────────── */}
      <div className="elevated-card rounded-2xl p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-500 dark:text-cyan-400 mb-1">New Entry</p>
        <h2 className="mb-5 text-lg font-semibold text-slate-900 dark:text-slate-100">Add Internship Details</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Company Name</label>
            <input type="text" placeholder="e.g. Google" value={formData.companyName} className="field-control" onChange={updateField('companyName')} />
          </div>
          <div>
            <label className="field-label">Role / Position</label>
            <input type="text" placeholder="e.g. Software Engineer Intern" value={formData.role} className="field-control" onChange={updateField('role')} />
          </div>
          <div>
            <label className="field-label">Start Date</label>
            <input type="date" value={formData.startDate} className="field-control" onChange={updateField('startDate')} />
          </div>
          <div>
            <label className="field-label">End Date</label>
            <input type="date" value={formData.endDate} className="field-control" onChange={updateField('endDate')} />
          </div>
          <div className="md:col-span-2">
            <label className="field-label">Upload Offer Letter (PDF/JPG/PNG)</label>
            <input type="file" className="file-control" onChange={(e) => setFile(e.target.files[0])} />
          </div>
          <button disabled={isSubmitting} type="submit"
            className="md:col-span-2 neon-button font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
            {isSubmitting ? 'Submitting…' : 'Submit Application'}
          </button>
        </form>
      </div>

      {/* ── Internships table ─────────────────────────────── */}
      <div className="elevated-card overflow-hidden rounded-2xl">
        <div className="flex flex-col sm:flex-row gap-3 border-b border-slate-200/60 dark:border-slate-700/60 p-4">
          <input className="field-control flex-1" placeholder="Search company or role…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <select className="field-control sm:w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button type="button"
            className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-800/60 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}>
            Reset
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700/60">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50">
                {['Company', 'Role', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {isLoading && Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 w-36 rounded-md bg-slate-200 dark:bg-slate-700" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-28 rounded-md bg-slate-200 dark:bg-slate-700" /></td>
                  <td className="px-6 py-4"><div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-slate-700" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-20 rounded-md bg-slate-200 dark:bg-slate-700 ml-auto" /></td>
                </tr>
              ))}
              {!isLoading && filteredInternships.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-sm text-slate-400 dark:text-slate-500">
                    {internships.length === 0 ? 'No internships submitted yet.' : 'No internships match your filters.'}
                  </td>
                </tr>
              )}
              {!isLoading && filteredInternships.map((item) => (
                <motion.tr key={item._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}
                  className="hover:bg-cyan-50/30 dark:hover:bg-cyan-900/10 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">{item.companyName}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{item.role}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge(item.status)}`}>{item.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3 justify-end">
                      {item.offerLetter && (
                        <a href={getAssetUrl(item.offerLetter)} target="_blank" rel="noreferrer"
                          className="text-xs font-semibold text-cyan-600 hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-200 transition-colors">
                          Offer ↗
                        </a>
                      )}
                      {item.certificate && (
                        <a href={getAssetUrl(item.certificate)} target="_blank" rel="noreferrer"
                          className="text-xs font-semibold text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-200 transition-colors">
                          Certificate ↗
                        </a>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Weekly Reports + Certificate ─────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Weekly Reports */}
        <div className="elevated-card rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-500 dark:text-cyan-400 mb-0.5">Submissions</p>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Weekly Reports</h3>
          </div>

          <div>
            <label className="field-label">Internship</label>
            <select className="field-control" value={selectedInternshipId} onChange={onInternshipChange}>
              <option value="">Select internship</option>
              {internships.map((item) => (
                <option key={item._id} value={item._id}>{item.companyName} – {item.role}</option>
              ))}
            </select>
          </div>

          <form className="space-y-3" onSubmit={submitReport}>
            <div>
              <label className="field-label">Week Number</label>
              <input className="field-control" type="number" min="1" placeholder="e.g. 3" value={reportForm.weekNumber}
                onChange={(e) => setReportForm((c) => ({ ...c, weekNumber: e.target.value }))} required />
            </div>
            <div>
              <label className="field-label">Report Content</label>
              <textarea className="field-control resize-none" rows="4" placeholder="Describe your work this week…" value={reportForm.content}
                onChange={(e) => setReportForm((c) => ({ ...c, content: e.target.value }))} required />
            </div>
            <div>
              <label className="field-label">Attachment (optional)</label>
              <input type="file" onChange={(e) => setReportFile(e.target.files?.[0] || null)} className="file-control" />
            </div>
            <button disabled={isReportSubmitting} type="submit"
              className="w-full neon-button font-semibold py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
              {isReportSubmitting ? 'Submitting…' : 'Submit Report'}
            </button>
          </form>

          {/* Report history */}
          {reports.length > 0 && (
            <div className="space-y-2 border-t border-slate-200/60 dark:border-slate-700/60 pt-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Submission History</p>
              {reports.map((r) => (
                <div key={r._id} className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/40 dark:bg-slate-800/40 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Week {r.weekNumber}</span>
                    <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${statusBadge(r.status)}`}>{r.status}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{r.content}</p>
                  {r.feedback && (
                    <p className="mt-1.5 text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 rounded-lg px-2 py-1">
                      💬 {r.feedback}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          {reports.length === 0 && selectedInternshipId && (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-2">No reports found for this internship.</p>
          )}
        </div>

        {/* Upload Certificate */}
        <div className="elevated-card rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-500 dark:text-teal-400 mb-0.5">Completion</p>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Upload Certificate</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Submit your completion certificate (PDF/JPG/PNG) after finishing your internship.</p>
          </div>

          <div>
            <label className="field-label">Internship</label>
            <select className="field-control" value={selectedInternshipId} onChange={(e) => setSelectedInternshipId(e.target.value)}>
              <option value="">Select internship</option>
              {internships.map((item) => (
                <option key={item._id} value={item._id}>{item.companyName} – {item.role}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">Certificate File</label>
            <input className="file-control" type="file" onChange={(e) => setCertificateFile(e.target.files?.[0] || null)} />
          </div>

          <button disabled={isCertUploading} onClick={uploadCertificate} type="button"
            className="mt-auto neon-button font-semibold py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
            {isCertUploading ? 'Uploading…' : 'Upload Certificate'}
          </button>
        </div>

      </div>
    </div>
    </AnimatedPage>
  );
}
