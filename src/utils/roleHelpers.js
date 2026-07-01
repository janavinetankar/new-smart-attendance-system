// src/utils/roleHelpers.js
export const ROLES = {
  ADMIN:   'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

export const getRoleLabel = (role) => {
  const map = {
    admin:   'Administrator',
    teacher: 'Teacher',
    student: 'Student',
  };
  return map[role] ?? 'Unknown';
};

export const getRoleColor = (role) => {
  const map = {
    admin:   'text-purple-400 bg-purple-400/10 border-purple-400/30',
    teacher: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    student: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  };
  return map[role] ?? 'text-slate-400 bg-slate-400/10 border-slate-400/30';
};

export const getDefaultRoute = (role) => {
  const map = {
    admin:   '/admin/dashboard',
    teacher: '/teacher/dashboard',
    student: '/student/checkin',
  };
  return map[role] ?? '/login';
};
