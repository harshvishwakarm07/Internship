import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
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

  return (
    <AnimatedPage className="mx-auto max-w-6xl">
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-8">Welcome, {user.name}</h1>
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {successMessage && <p className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{successMessage}</p>}
      
      {/* FORM SECTION */}
      <div className="elevated-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Add Internship Details</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Company Name" value={formData.companyName} className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" onChange={updateField('companyName')} />
          <input type="text" placeholder="Role/Position" value={formData.role} className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" onChange={updateField('role')} />
          <input type="date" value={formData.startDate} className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" onChange={updateField('startDate')} />
          <input type="date" value={formData.endDate} className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" onChange={updateField('endDate')} />
          
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">Upload Offer Letter (Local)</label>
            <input type="file" className="block w-full text-sm text-slate-500 dark:text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100" onChange={(e) => setFile(e.target.files[0])} />
          </div>

          <button disabled={isSubmitting} type="submit" className="md:col-span-2 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 transition duration-200">
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>

      {/* TABLE SECTION */}
      <div className="elevated-card overflow-hidden rounded-2xl">
        <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-3">
          <input className="rounded border p-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" placeholder="Search company or role" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
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
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-800/70">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-300">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-300">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-300">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-300">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-slate-700 dark:bg-slate-900/60">
            {!isLoading && internships.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-sm text-slate-500">No internships submitted yet.</td>
              </tr>
            )}
            {filteredInternships.map((i) => (
              <motion.tr key={i._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">{i.companyName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-300">{i.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${i.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {i.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-3">
                    {i.offerLetter && <a href={`http://localhost:5000${i.offerLetter}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-900">Offer</a>}
                    {i.certificate && <a href={`http://localhost:5000${i.certificate}`} target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-800">Certificate</a>}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="elevated-card rounded-2xl p-5">
          <h3 className="mb-3 text-lg font-semibold">Weekly Reports</h3>
          <select className="mb-3 w-full rounded border p-2" value={selectedInternshipId} onChange={onInternshipChange}>
            <option value="">Select internship</option>
            {internships.map((item) => (
              <option key={item._id} value={item._id}>{item.companyName} - {item.role}</option>
            ))}
          </select>

          <form className="space-y-3" onSubmit={submitReport}>
            <input className="w-full rounded border p-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" type="number" min="1" placeholder="Week number" value={reportForm.weekNumber} onChange={(e) => setReportForm((current) => ({ ...current, weekNumber: e.target.value }))} required />
            <textarea className="w-full rounded border p-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" rows="4" placeholder="Report content" value={reportForm.content} onChange={(e) => setReportForm((current) => ({ ...current, content: e.target.value }))} required />
            <input type="file" onChange={(e) => setReportFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-600" required />
            <button disabled={isReportSubmitting} className="w-full rounded bg-indigo-600 p-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300" type="submit">
              {isReportSubmitting ? 'Submitting report...' : 'Submit report'}
            </button>
          </form>

          <div className="mt-4 space-y-2">
            {reports.length === 0 && <p className="text-sm text-slate-500">No reports found for selected internship.</p>}
            {reports.map((report) => (
              <div key={report._id} className="rounded border p-3">
                <p className="text-sm font-medium">Week {report.weekNumber} • {report.status}</p>
                <p className="text-sm text-slate-600">{report.content}</p>
                {report.feedback && <p className="mt-1 text-xs text-emerald-700">Feedback: {report.feedback}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="elevated-card rounded-2xl p-5">
          <h3 className="mb-3 text-lg font-semibold">Upload Completion Certificate</h3>
          <p className="mb-3 text-sm text-slate-500">Choose internship and upload certificate (PDF/JPG/PNG).</p>
          <select className="mb-3 w-full rounded border p-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" value={selectedInternshipId} onChange={(e) => setSelectedInternshipId(e.target.value)}>
            <option value="">Select internship</option>
            {internships.map((item) => (
              <option key={item._id} value={item._id}>{item.companyName} - {item.role}</option>
            ))}
          </select>
          <input className="mb-3 w-full text-sm text-slate-600" type="file" onChange={(e) => setCertificateFile(e.target.files?.[0] || null)} />
          <button disabled={isCertUploading} onClick={uploadCertificate} className="w-full rounded bg-emerald-600 p-2 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300" type="button">
            {isCertUploading ? 'Uploading...' : 'Upload certificate'}
          </button>
        </div>
      </div>
    </div>
    </AnimatedPage>
  );
}
