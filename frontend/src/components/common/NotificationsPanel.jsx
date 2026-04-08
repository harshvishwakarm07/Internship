import React from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export default function NotificationsPanel() {
  const [open, setOpen] = React.useState(false);
  const { notifications, unreadCount, markAllRead, clearNotifications } = useNotifications();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((current) => !current)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300/70 bg-white/70 text-slate-700 hover:bg-white dark:border-slate-600/80 dark:bg-slate-800/75 dark:text-slate-100 dark:hover:bg-slate-700"
        type="button"
        aria-label="Toggle notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 rounded-2xl border border-slate-200/80 bg-white/85 p-3 shadow-xl backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/85">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Notifications</p>
            <div className="flex items-center gap-1">
              <button type="button" onClick={markAllRead} className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" title="Mark all read">
                <CheckCheck size={14} />
              </button>
              <button type="button" onClick={clearNotifications} className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" title="Clear all">
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {notifications.length === 0 && (
              <p className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">No notifications yet.</p>
            )}
            {notifications.map((item) => (
              <div key={item.id} className={`rounded border px-3 py-2 text-xs ${item.read ? 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300' : 'border-blue-200 bg-blue-50 text-slate-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-slate-100'}`}>
                <p>{item.message}</p>
                <p className="mt-1 text-[10px] opacity-80">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
