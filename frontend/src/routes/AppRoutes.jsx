import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import RouteLoader from '../components/common/RouteLoader';

const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const StudentDashboard = lazy(() => import('../pages/StudentDashboard'));
const FacultyDashboard = lazy(() => import('../pages/FacultyDashboard'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const Unauthorized = lazy(() => import('../pages/Unauthorized'));
const NotFound = lazy(() => import('../pages/NotFound'));
const AddInternship = lazy(() => import('../pages/AddInternship'));
const ReportsPage = lazy(() => import('../pages/ReportsPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));

function RoleHomeRoute() {
  const { user, resolveHome } = useAuth();
  return <Navigate to={resolveHome(user)} replace />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/" element={<RoleHomeRoute />} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/add-internship" element={<ProtectedRoute allowedRoles={['student']}><AddInternship /></ProtectedRoute>} />
        <Route path="/student/reports" element={<ProtectedRoute allowedRoles={['student']}><ReportsPage /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['student']}><ProfilePage /></ProtectedRoute>} />

        <Route path="/faculty" element={<ProtectedRoute allowedRoles={['faculty']}><FacultyDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
