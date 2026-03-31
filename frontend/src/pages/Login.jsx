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
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to={resolveHome(user)} replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const loggedIn = await login(email, password);
      navigate(resolveHome(loggedIn), { replace: true });
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <AnimatedPage className="w-full max-w-md">
    <div className="elevated-card w-full rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-1">Login</h2>
      <p className="mb-4 text-sm text-slate-500">Sign in to continue to SITS</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded p-2" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full border rounded p-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300" type="submit">
          {loading ? 'Logging in...' : 'Login'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Need an account?{' '}
        <Link to="/register" className="font-medium text-blue-600 hover:text-blue-800">Register</Link>
      </p>
    </div>
    </AnimatedPage>
  );
}
