import React from 'react';

export default function RouteLoader() {
  return (
    <div className="mx-auto flex w-full max-w-5xl items-center justify-center py-14">
      <div className="elevated-card flex items-center gap-3 rounded-xl px-4 py-3">
        <span className="h-3 w-3 animate-pulse rounded-full bg-blue-600" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Loading page...</p>
      </div>
    </div>
  );
}
