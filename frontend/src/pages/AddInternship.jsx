import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedPage from '../components/common/AnimatedPage';
import api, { notifyToast } from '../services/api';

const initialForm = {
  companyName: '',
  role: '',
  startDate: '',
  endDate: '',
};

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function AddInternship() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [offerLetter, setOfferLetter] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
    setFieldErrors((current) => ({ ...current, [field]: '' }));
  };

  const onFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setOfferLetter(file);
    setFieldErrors((current) => ({ ...current, offerLetter: '' }));
  };

  const validate = () => {
    const errs = {};
    if (formData.companyName.trim().length < 2) errs.companyName = 'Company name must be at least 2 characters.';
    if (formData.role.trim().length < 2) errs.role = 'Role must be at least 2 characters.';
    if (!formData.startDate) errs.startDate = 'Start date is required.';
    if (!formData.endDate) errs.endDate = 'End date is required.';
    if (formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate))
      errs.endDate = 'End date must be after start date.';
    if (!offerLetter) {
      errs.offerLetter = 'Offer letter file is required.';
    } else if (!ALLOWED_TYPES.includes(offerLetter.type)) {
      errs.offerLetter = 'Only PDF, JPG, JPEG, and PNG files are allowed.';
    } else if (offerLetter.size > MAX_FILE_SIZE) {
      errs.offerLetter = 'File size must not exceed 5 MB.';
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
      payload.append('companyName', formData.companyName);
      payload.append('role', formData.role);
      payload.append('startDate', formData.startDate);
      payload.append('endDate', formData.endDate);
      payload.append('offerLetter', offerLetter);

      await api.post('/internships', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      notifyToast('Internship submitted successfully.', 'success');
      navigate('/student');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit internship.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatedPage className="mx-auto max-w-3xl">
      <div className="elevated-card rounded-2xl p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-500 dark:text-cyan-400 mb-1">New Entry</p>
        <h1 className="mb-5 text-xl font-semibold text-slate-900 dark:text-slate-100">Add Internship</h1>
        {error && <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="field-label">Company Name</label>
            <input className={`field-control ${fieldErrors.companyName ? 'border-red-400 dark:border-red-500' : ''}`} placeholder="e.g. Google" value={formData.companyName} onChange={onChange('companyName')} />
            {fieldErrors.companyName && <p className="mt-1 text-xs text-red-500">{fieldErrors.companyName}</p>}
          </div>
          <div>
            <label className="field-label">Role / Position</label>
            <input className={`field-control ${fieldErrors.role ? 'border-red-400 dark:border-red-500' : ''}`} placeholder="e.g. Software Engineer Intern" value={formData.role} onChange={onChange('role')} />
            {fieldErrors.role && <p className="mt-1 text-xs text-red-500">{fieldErrors.role}</p>}
          </div>
          <div>
            <label className="field-label">Start Date</label>
            <input className={`field-control ${fieldErrors.startDate ? 'border-red-400 dark:border-red-500' : ''}`} type="date" value={formData.startDate} onChange={onChange('startDate')} />
            {fieldErrors.startDate && <p className="mt-1 text-xs text-red-500">{fieldErrors.startDate}</p>}
          </div>
          <div>
            <label className="field-label">End Date</label>
            <input className={`field-control ${fieldErrors.endDate ? 'border-red-400 dark:border-red-500' : ''}`} type="date" value={formData.endDate} onChange={onChange('endDate')} />
            {fieldErrors.endDate && <p className="mt-1 text-xs text-red-500">{fieldErrors.endDate}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="field-label">Offer Letter (PDF/JPG/PNG, max 5 MB)</label>
            <input className="file-control" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={onFileChange} />
            {fieldErrors.offerLetter && <p className="mt-1 text-xs text-red-500">{fieldErrors.offerLetter}</p>}
          </div>
          <button className="md:col-span-2 neon-button rounded-xl px-4 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Submitting...' : 'Submit Internship'}
          </button>
        </form>
      </div>
    </AnimatedPage>
  );
}
