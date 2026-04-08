import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);
const TOAST_EVENT_NAME = 'sits:toast';

export function emitToast(message, type = 'info') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(TOAST_EVENT_NAME, { detail: { message, type } }));
}

const iconByType = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const styleByType = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-100',
  error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/60 dark:text-red-100',
  info: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-100',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const onToast = (event) => {
      const { message, type } = event.detail || {};
      if (!message) return;
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((current) => [...current, { id, message, type: type || 'info' }]);
      setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, 3200);
    };

    window.addEventListener(TOAST_EVENT_NAME, onToast);
    return () => window.removeEventListener(TOAST_EVENT_NAME, onToast);
  }, []);

  const dismiss = (id) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  };

  const value = useMemo(() => ({ emitToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-[min(92vw,26rem)] flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = iconByType[toast.type] || Info;
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-2 rounded-xl border px-3 py-2 shadow-lg backdrop-blur ${styleByType[toast.type] || styleByType.info}`}
              role="status"
              aria-live="polite"
            >
              <Icon size={16} className="mt-0.5 shrink-0" />
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="rounded p-0.5 opacity-80 hover:opacity-100"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
