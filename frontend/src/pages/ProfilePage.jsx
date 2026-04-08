import React, { useEffect, useState } from 'react';
import AnimatedPage from '../components/common/AnimatedPage';
import api, { getAssetUrl, notifyToast } from '../services/api';

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
  const [isLoading, setIsLoading] = useState(true);
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
      } finally {
        setIsLoading(false);
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
      notifyToast('Profile updated successfully.', 'success');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatedPage className="mx-auto max-w-3xl">
      <section className="elevated-card rounded-2xl p-6 md:p-7">
        <div className="mb-5 rounded-xl border border-sky-100 bg-sky-50/70 p-4 dark:border-sky-900/70 dark:bg-sky-950/30">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">My Profile</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Keep your student details and resume updated for better mentor review and internship tracking.
          </p>
        </div>

        {error && <p className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {success && <p className="mb-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            ))}
          </div>
        ) : (
          <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            <div>
              <label className="field-label">Enrollment No</label>
              <input className="field-control" placeholder="Enter enrollment number" value={profile.enrollmentNo} onChange={onChange('enrollmentNo')} />
            </div>

            <div>
              <label className="field-label">Department</label>
              <input className="field-control" placeholder="Enter department" value={profile.department} onChange={onChange('department')} />
            </div>

            <div>
              <label className="field-label">Semester</label>
              <input className="field-control" type="number" min="1" placeholder="Enter semester" value={profile.semester} onChange={onChange('semester')} />
            </div>

            <div>
              <label className="field-label">Phone</label>
              <input className="field-control" placeholder="Enter phone number" value={profile.phone} onChange={onChange('phone')} />
            </div>

            <div className="md:col-span-2">
              <label className="field-label">LinkedIn URL</label>
              <input className="field-control" placeholder="https://linkedin.com/in/your-profile" value={profile.linkedinUrl} onChange={onChange('linkedinUrl')} />
            </div>

            <div className="md:col-span-2">
              <label className="field-label">GitHub URL</label>
              <input className="field-control" placeholder="https://github.com/your-username" value={profile.githubUrl} onChange={onChange('githubUrl')} />
            </div>

            <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
              <label className="field-label">Resume (PDF/JPG/PNG)</label>
              <input className="file-control" type="file" onChange={(event) => setResume(event.target.files?.[0] || null)} />
              {resumePath && (
                <a
                  className="mt-3 inline-block text-sm font-medium text-blue-700 hover:underline dark:text-sky-300"
                  href={getAssetUrl(resumePath)}
                  target="_blank"
                  rel="noreferrer"
                >
                  View uploaded resume
                </a>
              )}
            </div>

            <button className="md:col-span-2 rounded bg-blue-600 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300" disabled={isSaving} type="submit">
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        )}
      </section>
    </AnimatedPage>
  );
}
