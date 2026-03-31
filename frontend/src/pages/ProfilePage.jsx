import React, { useEffect, useState } from 'react';
import AnimatedPage from '../components/common/AnimatedPage';
import api from '../services/api';

const emptyProfile = {
  enrollmentNo: '',
  department: '',
  semester: '',
  phone: '',
  linkedinUrl: '',
  githubUrl: '',
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(emptyProfile);
  const [resume, setResume] = useState(null);
  const [resumePath, setResumePath] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get('/profile');
        setProfile({
          enrollmentNo: data.enrollmentNo || '',
          department: data.department || '',
          semester: data.semester || '',
          phone: data.phone || '',
          linkedinUrl: data.linkedinUrl || '',
          githubUrl: data.githubUrl || '',
        });
        setResumePath(data.resumePath || '');
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load profile.');
      }
    };

    loadProfile();
  }, []);

  const onChange = (field) => (event) => {
    setProfile((current) => ({ ...current, [field]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const payload = new FormData();
      Object.entries(profile).forEach(([key, value]) => payload.append(key, value));
      if (resume) {
        payload.append('resume', resume);
      }

      const { data } = await api.put('/profile', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResumePath(data.resumePath || '');
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatedPage className="mx-auto max-w-3xl">
      <section className="elevated-card rounded-2xl p-6">
        <h1 className="mb-4 text-2xl font-semibold text-slate-800">My Profile</h1>
        {error && <p className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {success && <p className="mb-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>}

        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <input className="rounded border p-3" placeholder="Enrollment No" value={profile.enrollmentNo} onChange={onChange('enrollmentNo')} />
          <input className="rounded border p-3" placeholder="Department" value={profile.department} onChange={onChange('department')} />
          <input className="rounded border p-3" type="number" min="1" placeholder="Semester" value={profile.semester} onChange={onChange('semester')} />
          <input className="rounded border p-3" placeholder="Phone" value={profile.phone} onChange={onChange('phone')} />
          <input className="rounded border p-3 md:col-span-2" placeholder="LinkedIn URL" value={profile.linkedinUrl} onChange={onChange('linkedinUrl')} />
          <input className="rounded border p-3 md:col-span-2" placeholder="GitHub URL" value={profile.githubUrl} onChange={onChange('githubUrl')} />
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Resume (PDF/JPG/PNG)</label>
            <input className="w-full text-sm" type="file" onChange={(event) => setResume(event.target.files?.[0] || null)} />
            {resumePath && (
              <a className="mt-2 inline-block text-sm text-blue-700 hover:underline" href={`http://localhost:5000${resumePath}`} target="_blank" rel="noreferrer">
                View uploaded resume
              </a>
            )}
          </div>
          <button className="md:col-span-2 rounded bg-blue-600 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300" disabled={isSaving} type="submit">
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </section>
    </AnimatedPage>
  );
}
