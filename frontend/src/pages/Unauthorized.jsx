import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import AnimatedPage from '../components/common/AnimatedPage';

export default function Unauthorized() {
  return (
    <AnimatedPage className="mx-auto w-full max-w-2xl">
      <div className="elevated-card rounded-3xl p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <ShieldAlert size={28} />
        </div>
        <h1 className="mb-2 text-2xl font-semibold text-slate-900">Access Restricted</h1>
        <p className="mx-auto mb-6 max-w-lg text-sm text-slate-600">
          Your account does not have permission to view this page. Please return to a valid section or switch to an authorized account.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            Go Home
          </Link>
          <Link to="/login" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Login Again
          </Link>
        </div>
      </div>
    </AnimatedPage>
  );
}