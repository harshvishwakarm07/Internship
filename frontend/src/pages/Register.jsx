import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AnimatedPage from '../components/common/AnimatedPage';

const initialData = {
  name: '',
  email: '',
  password: '',
  role: 'student',
};

export default function Register() {
  const navigate = useNavigate();
  const { register, loading, resolveHome } = useAuth();
  const [formData, setFormData] = useState(initialData);
  const [error, setError] = useState('');

  const updateField = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const registeredUser = await register(formData);
      navigate(resolveHome(registeredUser), { replace: true });
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <AnimatedPage className="w-full max-w-md">
    <div className="elevated-card w-full rounded-3xl p-7">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.22em] text-teal-600 dark:text-teal-300">Onboarding</p>
        <h2 className="mb-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">Create Account</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">Join the futuristic Student Internship Tracking System</p>
      </div>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input className="field-control" placeholder="Full name" value={formData.name} onChange={updateField('name')} required />
        <input className="field-control" type="email" placeholder="Email" value={formData.email} onChange={updateField('email')} required />
        <input className="field-control" type="password" minLength={6} placeholder="Password" value={formData.password} onChange={updateField('password')} required />
        <select className="field-control" value={formData.role} onChange={updateField('role')}>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="admin">Admin</option>
        </select>
        {error && <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button disabled={loading} className="neon-button inline-flex w-full items-center justify-center gap-2 rounded-xl p-2.5 font-medium disabled:cursor-not-allowed disabled:bg-blue-300" type="submit">
          {loading ? 'Creating account...' : 'Register'}
          {!loading && <UserPlus size={16} />}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-cyan-700 hover:text-cyan-900 dark:text-cyan-300 dark:hover:text-cyan-200">Login</Link>
      </p>
    </div>
    </AnimatedPage>
  );
}