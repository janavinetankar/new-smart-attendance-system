// src/routes/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute      from './RoleRoute';

// Auth pages
import LoginPage          from '../pages/auth/LoginPage';
import RegisterPage       from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage  from '../pages/auth/ResetPasswordPage';

// Student pages
import CheckInPage        from '../pages/student/CheckInPage';
import StudentProfilePage from '../pages/student/StudentProfilePage';

// Teacher pages
import DashboardPage           from '../pages/teacher/DashboardPage';
import SessionManagementPage   from '../pages/teacher/SessionManagementPage';
import AttendanceReportsPage   from '../pages/teacher/AttendanceReportsPage';

// Admin pages
import AdminDashboardPage  from '../pages/admin/AdminDashboardPage';
import ManageStudentsPage  from '../pages/admin/ManageStudentsPage';
import ManageTeachersPage  from '../pages/admin/ManageTeachersPage';
import ManageSessionsPage  from '../pages/admin/ManageSessionsPage';

// Error pages
import NotFoundPage      from '../pages/error/NotFoundPage';
import UnauthorizedPage  from '../pages/error/UnauthorizedPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />

        {/* Student routes */}
        <Route path="/student/checkin" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['student']}>
              <CheckInPage />
            </RoleRoute>
          </ProtectedRoute>
        } />
        <Route path="/student/profile" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['student']}>
              <StudentProfilePage />
            </RoleRoute>
          </ProtectedRoute>
        } />

        {/* Teacher routes */}
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['teacher']}>
              <DashboardPage />
            </RoleRoute>
          </ProtectedRoute>
        } />
        <Route path="/teacher/sessions" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['teacher']}>
              <SessionManagementPage />
            </RoleRoute>
          </ProtectedRoute>
        } />
        <Route path="/teacher/reports" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['teacher']}>
              <AttendanceReportsPage />
            </RoleRoute>
          </ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </RoleRoute>
          </ProtectedRoute>
        } />
        <Route path="/admin/students" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <ManageStudentsPage />
            </RoleRoute>
          </ProtectedRoute>
        } />
        <Route path="/admin/teachers" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <ManageTeachersPage />
            </RoleRoute>
          </ProtectedRoute>
        } />
        <Route path="/admin/sessions" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <ManageSessionsPage />
            </RoleRoute>
          </ProtectedRoute>
        } />

        {/* Error pages */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/404"          element={<NotFoundPage />} />
        <Route path="/"             element={<Navigate to="/login" replace />} />
        <Route path="*"             element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
