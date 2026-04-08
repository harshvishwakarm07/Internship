import React, { useEffect, useState } from 'react';
import AnimatedPage from '../components/common/AnimatedPage';
import api, { notifyToast } from '../services/api';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ReportsPage() {
  const [internships, setInternships] = useState([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState('');
  const [reports, setReports] = useState([]);
  const [reportForm, setReportForm] = useState({ weekNumber: '', content: '' });
  const [attachment, setAttachment] = useState(null);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/internships/my');
        setInternships(data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load internships.');
      }
    };

    load();
  }, []);

  const loadReports = async (internshipId) => {
    if (!internshipId) {
      setReports([]);
      return;
    }
    try {
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

  const validate = () => {
    const errs = {};
    if (!selectedInternshipId) errs.internship = 'Please select an internship.';
    const wk = Number(reportForm.weekNumber);
    if (!reportForm.weekNumber || wk < 1 || wk > 52) errs.weekNumber = 'Week number must be between 1 and 52.';
    if (!reportForm.content.trim() || reportForm.content.trim().length < 10)
      errs.content = 'Report content must be at least 10 characters.';
    if (!attachment) {
      errs.attachment = 'Report attachment is required.';
    } else if (!ALLOWED_TYPES.includes(attachment.type)) {
      errs.attachment = 'Only PDF, JPG, JPEG, and PNG files are allowed.';
    } else if (attachment.size > MAX_FILE_SIZE) {
      errs.attachment = 'File size must not exceed 5 MB.';
    }
    return errs;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('internship', selectedInternshipId);
      payload.append('weekNumber', reportForm.weekNumber);
      payload.append('content', reportForm.content);
      payload.append('attachment', attachment);

      await api.post('/reports', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setReportForm({ weekNumber: '', content: '' });
      setAttachment(null);
      notifyToast('Report submitted successfully.', 'success');
      await loadReports(selectedInternshipId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatedPage className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
      <section className="elevated-card rounded-2xl p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-500 dark:text-cyan-400 mb-1">Submissions</p>
        <h1 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Submit Weekly Report</h1>
        {error && <p className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <form className="space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="field-label">Internship</label>
            <select className={`field-control ${fieldErrors.internship ? 'border-red-400 dark:border-red-500' : ''}`} value={selectedInternshipId}
              onChange={(e) => { onInternshipChange(e); setFieldErrors((c) => ({ ...c, internship: '' })); }}>
              <option value="">Select internship</option>
              {internships.map((internship) => (
                <option key={internship._id} value={internship._id}>{internship.companyName} – {internship.role}</option>
              ))}
            </select>
            {fieldErrors.internship && <p className="mt-1 text-xs text-red-500">{fieldErrors.internship}</p>}
          </div>
          <div>
            <label className="field-label">Week Number (1–52)</label>
            <input className={`field-control ${fieldErrors.weekNumber ? 'border-red-400 dark:border-red-500' : ''}`} type="number" min="1" max="52"
              placeholder="e.g. 3" value={reportForm.weekNumber}
              onChange={(e) => { setReportForm((c) => ({ ...c, weekNumber: e.target.value })); setFieldErrors((c) => ({ ...c, weekNumber: '' })); }} />
            {fieldErrors.weekNumber && <p className="mt-1 text-xs text-red-500">{fieldErrors.weekNumber}</p>}
          </div>
          <div>
            <label className="field-label">Report Content (min 10 chars)</label>
            <textarea className={`field-control resize-none ${fieldErrors.content ? 'border-red-400 dark:border-red-500' : ''}`} rows="4"
              placeholder="Describe your work this week…" value={reportForm.content}
              onChange={(e) => { setReportForm((c) => ({ ...c, content: e.target.value })); setFieldErrors((c) => ({ ...c, content: '' })); }} />
            {fieldErrors.content && <p className="mt-1 text-xs text-red-500">{fieldErrors.content}</p>}
          </div>
          <div>
            <label className="field-label">Attachment (PDF/JPG/PNG, max 5 MB)</label>
            <input className="file-control" type="file" accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => { setAttachment(e.target.files?.[0] || null); setFieldErrors((c) => ({ ...c, attachment: '' })); }} />
            {fieldErrors.attachment && <p className="mt-1 text-xs text-red-500">{fieldErrors.attachment}</p>}
          </div>
          <button className="w-full neon-button rounded-xl py-2.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </section>

      <section className="elevated-card rounded-2xl p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-500 dark:text-teal-400 mb-1">History</p>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Report History</h2>
        <div className="space-y-3">
          {reports.length === 0 && (
            <p className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/40 px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
              {selectedInternshipId ? 'No reports submitted for this internship yet.' : 'Select an internship to view reports.'}
            </p>
          )}
          {reports.map((report) => (
            <article key={report._id} className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/40 dark:bg-slate-800/40 p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Week {report.weekNumber}</p>
                <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${report.status === 'Reviewed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>{report.status}</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{report.content}</p>
              {report.feedback && (
                <p className="mt-2 text-xs rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-3 py-1.5">
                  💬 Mentor feedback: {report.feedback}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>
    </AnimatedPage>
  );
}
