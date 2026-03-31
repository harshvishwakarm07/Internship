import React, { useEffect, useState } from 'react';
import AnimatedPage from '../components/common/AnimatedPage';
import api from '../services/api';

export default function ReportsPage() {
  const [internships, setInternships] = useState([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState('');
  const [reports, setReports] = useState([]);
  const [reportForm, setReportForm] = useState({ weekNumber: '', content: '' });
  const [attachment, setAttachment] = useState(null);
  const [error, setError] = useState('');
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

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!selectedInternshipId) {
      setError('Please select an internship first.');
      return;
    }

    if (!attachment) {
      setError('Report attachment is required.');
      return;
    }

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
        <h1 className="mb-4 text-xl font-semibold text-slate-800">Submit Weekly Report</h1>
        {error && <p className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <form className="space-y-3" onSubmit={onSubmit}>
          <select className="w-full rounded border p-2" value={selectedInternshipId} onChange={onInternshipChange} required>
            <option value="">Select internship</option>
            {internships.map((internship) => (
              <option key={internship._id} value={internship._id}>{internship.companyName} - {internship.role}</option>
            ))}
          </select>
          <input className="w-full rounded border p-2" type="number" min="1" placeholder="Week Number" value={reportForm.weekNumber} onChange={(event) => setReportForm((current) => ({ ...current, weekNumber: event.target.value }))} required />
          <textarea className="w-full rounded border p-2" rows="4" placeholder="Report details" value={reportForm.content} onChange={(event) => setReportForm((current) => ({ ...current, content: event.target.value }))} required />
          <input className="w-full text-sm" type="file" onChange={(event) => setAttachment(event.target.files?.[0] || null)} required />
          <button className="w-full rounded bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </section>

      <section className="elevated-card rounded-2xl p-5">
        <h2 className="mb-4 text-xl font-semibold text-slate-800">Report History</h2>
        <div className="space-y-3">
          {reports.length === 0 && <p className="text-sm text-slate-500">No reports found for selected internship.</p>}
          {reports.map((report) => (
            <article key={report._id} className="rounded border p-3">
              <p className="text-sm font-semibold text-slate-800">Week {report.weekNumber} - {report.status}</p>
              <p className="text-sm text-slate-600">{report.content}</p>
              {report.feedback && <p className="mt-1 text-xs text-emerald-700">Feedback: {report.feedback}</p>}
            </article>
          ))}
        </div>
      </section>
    </AnimatedPage>
  );
}
