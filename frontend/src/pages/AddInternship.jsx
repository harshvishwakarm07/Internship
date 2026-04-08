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

export default function AddInternship() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [offerLetter, setOfferLetter] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!offerLetter) {
      setError('Offer letter file is required.');
      return;
    }

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
        <h1 className="mb-4 text-2xl font-semibold text-slate-900 dark:text-slate-100">Add Internship</h1>
        {error && <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input className="field-control" placeholder="Company Name" value={formData.companyName} onChange={onChange('companyName')} required />
          <input className="field-control" placeholder="Role" value={formData.role} onChange={onChange('role')} required />
          <input className="field-control" type="date" value={formData.startDate} onChange={onChange('startDate')} required />
          <input className="field-control" type="date" value={formData.endDate} onChange={onChange('endDate')} required />
          <div className="md:col-span-2">
            <label className="field-label">Offer Letter (PDF/JPG/PNG)</label>
            <input className="file-control" type="file" onChange={(event) => setOfferLetter(event.target.files?.[0] || null)} required />
          </div>
          <button className="md:col-span-2 rounded bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Submitting...' : 'Submit Internship'}
          </button>
        </form>
      </div>
    </AnimatedPage>
  );
}
