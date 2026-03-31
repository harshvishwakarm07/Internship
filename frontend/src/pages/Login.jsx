import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) {
    const route = user.role === 'admin' ? '/admin' : user.role === 'faculty' ? '/faculty' : '/student';
    return <Navigate to={route} replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const loggedIn = await login(email, password);
      const route = loggedIn.role === 'admin' ? '/admin' : loggedIn.role === 'faculty' ? '/faculty' : '/student';
      navigate(route);
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white rounded-xl border p-6 shadow">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded p-2" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full border rounded p-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded p-2" type="submit">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
