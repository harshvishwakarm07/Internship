import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export const PublicOnlyRoute = ({ children }) => {
  const { user, resolveHome } = useAuth();

  if (user) {
    return <Navigate to={resolveHome(user)} replace />;
  }

  return children;
};
