import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const getKey = (userId) => `sits-notifications-${userId}`;

const readNotifications = (userId) => {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(getKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
};

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setNotifications(readNotifications(user?._id));
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) return;
    localStorage.setItem(getKey(user._id), JSON.stringify(notifications.slice(0, 25)));
  }, [user?._id, notifications]);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const addNotification = (message) => {
      if (!isMounted) return;
      setNotifications((current) => {
        const next = [{ id: `${Date.now()}-${Math.random()}`, message, read: false, createdAt: new Date().toISOString() }, ...current];
        return next.slice(0, 25);
      });
    };

    const poll = async () => {
      try {
        if (user.role === 'student') {
          // ── Student: status changes + new feedback on reports ──────────
          const { data: internshipsData } = await api.get('/internships/my');

          // 1) Check internship status changes
          const statusKey = `sits-status-snapshot-${user._id}`;
          const prevStatus = JSON.parse(localStorage.getItem(statusKey) || '{}');
          const currStatus = {};
          internshipsData.forEach((item) => {
            currStatus[item._id] = item.status;
            if (prevStatus[item._id] && prevStatus[item._id] !== item.status) {
              const label = item.status === 'Approved' ? '✅ Approved' : item.status === 'Rejected' ? '❌ Rejected' : item.status;
              addNotification(`Your internship at ${item.companyName} was ${label}.`);
            }
          });
          localStorage.setItem(statusKey, JSON.stringify(currStatus));

          // 2) Check for new feedback on submitted reports (per internship)
          for (const internship of internshipsData) {
            try {
              const { data: reportsData } = await api.get(`/reports/${internship._id}`);
              const fbKey = `sits-report-fb-${user._id}-${internship._id}`;
              const prevFb = JSON.parse(localStorage.getItem(fbKey) || '{}');
              const currFb = {};
              reportsData.forEach((r) => {
                currFb[r._id] = { status: r.status, feedback: r.feedback || '' };
                const prev = prevFb[r._id];
                if (prev) {
                  if (!prev.feedback && r.feedback) {
                    addNotification(`📝 New mentor feedback on your Week ${r.weekNumber} report at ${internship.companyName}.`);
                  } else if (prev.status !== r.status && r.status === 'Reviewed') {
                    addNotification(`✔ Your Week ${r.weekNumber} report at ${internship.companyName} was reviewed.`);
                  }
                }
              });
              localStorage.setItem(fbKey, JSON.stringify(currFb));
            } catch (_) { /* best-effort per internship */ }
          }
          return;
        }

        if (user.role === 'faculty') {
          // ── Faculty: scoped to their assigned students only (API filter) ──
          const { data: internshipsData } = await api.get('/internships/all');

          // 1) New pending internship submissions from assigned students
          const pending = internshipsData.filter((i) => i.status === 'Pending').length;
          const pendingKey = `sits-pending-count-${user._id}`;
          const prevPending = Number(localStorage.getItem(pendingKey) || '0');
          if (pending > prevPending) {
            addNotification(`📋 ${pending - prevPending} new internship submission(s) from your assigned student(s) pending review.`);
          }
          localStorage.setItem(pendingKey, String(pending));

          // 2) New reports submitted by assigned students
          const reportCountKey = `sits-report-count-${user._id}`;
          const prevCounts = JSON.parse(localStorage.getItem(reportCountKey) || '{}');
          const currCounts = {};
          for (const internship of internshipsData) {
            try {
              const { data: reportsData } = await api.get(`/reports/${internship._id}`);
              currCounts[internship._id] = reportsData.length;
              if (prevCounts[internship._id] !== undefined && reportsData.length > prevCounts[internship._id]) {
                const diff = reportsData.length - prevCounts[internship._id];
                const studentName = internship.student?.name || 'A student';
                addNotification(`📄 ${studentName} submitted ${diff} new report(s) for ${internship.companyName}.`);
              }
            } catch (_) { /* best-effort per internship */ }
          }
          localStorage.setItem(reportCountKey, JSON.stringify(currCounts));
          return;
        }

        if (user.role === 'admin') {
          // ── Admin: all pending internships ─────────────────────────────
          const { data: internshipsData } = await api.get('/internships/all');
          const pending = internshipsData.filter((i) => i.status === 'Pending').length;
          const pendingKey = `sits-pending-count-${user._id}`;
          const prevPending = Number(localStorage.getItem(pendingKey) || '0');
          if (pending > prevPending) {
            addNotification(`📋 ${pending - prevPending} new internship submission(s) pending review.`);
          }
          localStorage.setItem(pendingKey, String(pending));
        }
      } catch (_) {
        // Best-effort polling only.
      }
    };

    poll();
    const interval = setInterval(poll, 45000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const markAllRead = () => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = useMemo(() => ({ notifications, unreadCount, markAllRead, clearNotifications }), [notifications, unreadCount]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
