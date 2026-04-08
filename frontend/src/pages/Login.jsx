import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AnimatedPage from '../components/common/AnimatedPage';

export default function Login() {
  const { user, login, loading, resolveHome } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to={resolveHome(user)} replace />;
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = () => {
    const errs = {};
    if (!emailRe.test(email)) errs.email = 'Enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    return errs;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    try {
      const loggedIn = await login(email, password);
      navigate(resolveHome(loggedIn), { replace: true });
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <AnimatedPage className="w-full max-w-md">
    <div className="elevated-card w-full rounded-3xl p-7">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-300">Secure Access</p>
        <h2 className="mb-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">Welcome Back</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">Sign in to continue to SITS control center</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <input className={`field-control ${fieldErrors.email ? 'border-red-400 dark:border-red-500' : ''}`} type="email" placeholder="Email" value={email}
            onChange={(e) => { setEmail(e.target.value); setFieldErrors((c) => ({ ...c, email: '' })); }} />
          {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
        </div>
        <div>
          <input className={`field-control ${fieldErrors.password ? 'border-red-400 dark:border-red-500' : ''}`} type="password" placeholder="Password" value={password}
            onChange={(e) => { setPassword(e.target.value); setFieldErrors((c) => ({ ...c, password: '' })); }} />
          {fieldErrors.password && <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>}
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button disabled={loading} className="neon-button inline-flex w-full items-center justify-center gap-2 rounded-xl p-2.5 font-medium disabled:cursor-not-allowed disabled:bg-blue-300" type="submit">
          {loading ? 'Logging in...' : 'Login'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
        Need an account?{' '}
        <Link to="/register" className="font-medium text-cyan-700 hover:text-cyan-900 dark:text-cyan-300 dark:hover:text-cyan-200">Register</Link>
      </p>
    </div>
    </AnimatedPage>
  );
}
