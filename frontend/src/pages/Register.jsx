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
    <div className="elevated-card w-full rounded-2xl p-6">
      <h2 className="mb-1 text-xl font-semibold text-slate-900">Create account</h2>
      <p className="mb-5 text-sm text-slate-500">Register for Student Internship Tracking System</p>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input className="w-full rounded border border-slate-300 p-2" placeholder="Full name" value={formData.name} onChange={updateField('name')} required />
        <input className="w-full rounded border border-slate-300 p-2" type="email" placeholder="Email" value={formData.email} onChange={updateField('email')} required />
        <input className="w-full rounded border border-slate-300 p-2" type="password" minLength={6} placeholder="Password" value={formData.password} onChange={updateField('password')} required />
        <select className="w-full rounded border border-slate-300 p-2" value={formData.role} onChange={updateField('role')}>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="admin">Admin</option>
        </select>
        {error && <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300" type="submit">
          {loading ? 'Creating account...' : 'Register'}
          {!loading && <UserPlus size={16} />}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-800">Login</Link>
      </p>
    </div>
    </AnimatedPage>
  );
}