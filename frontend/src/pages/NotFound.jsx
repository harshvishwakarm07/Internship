import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import AnimatedPage from '../components/common/AnimatedPage';

export default function NotFound() {
  return (
    <AnimatedPage className="mx-auto w-full max-w-2xl">
      <div className="elevated-card rounded-3xl p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-700">
          <Compass size={28} />
        </div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">404</p>
        <h1 className="mb-2 text-2xl font-semibold text-slate-900">Page Not Found</h1>
        <p className="mx-auto mb-6 max-w-lg text-sm text-slate-600">
          This route does not exist in the Student Internship Tracking System. Use navigation links to return to your dashboard.
        </p>
        <Link to="/" className="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
          Return to Home
        </Link>
      </div>
    </AnimatedPage>
  );
}