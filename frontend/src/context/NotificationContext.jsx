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
          const { data } = await api.get('/internships/my');
          const snapshotKey = `sits-status-snapshot-${user._id}`;
          const previousRaw = localStorage.getItem(snapshotKey);
          const previous = previousRaw ? JSON.parse(previousRaw) : {};
          const current = {};

          data.forEach((item) => {
            current[item._id] = item.status;
            if (previous[item._id] && previous[item._id] !== item.status) {
              addNotification(`Internship at ${item.companyName} changed to ${item.status}.`);
            }
          });

          localStorage.setItem(snapshotKey, JSON.stringify(current));
          return;
        }

        if (user.role === 'faculty' || user.role === 'admin') {
          const { data } = await api.get('/internships/all');
          const pending = data.filter((item) => item.status === 'Pending').length;
          const pendingKey = `sits-pending-count-${user._id}`;
          const previousPending = Number(localStorage.getItem(pendingKey) || '0');
          if (pending > previousPending) {
            addNotification(`${pending - previousPending} new internship submission(s) pending review.`);
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
