// src/components/common/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, GraduationCap, CalendarDays,
  BarChart3, LogOut, BookOpen, Camera, User, ChevronLeft,
  Menu, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../firebase/auth';
import toast from 'react-hot-toast';
import { useState } from 'react';

const NAV = {
  admin: [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/students',  icon: GraduationCap,   label: 'Students' },
    { to: '/admin/teachers',  icon: Users,            label: 'Teachers' },
    { to: '/admin/sessions',  icon: CalendarDays,     label: 'Sessions' },
  ],
  teacher: [
    { to: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/teacher/sessions',  icon: CalendarDays,    label: 'Sessions' },
    { to: '/teacher/reports',   icon: BarChart3,       label: 'Reports' },
  ],
  student: [
    { to: '/student/checkin', icon: Camera, label: 'Check In' },
    { to: '/student/profile', icon: User,   label: 'My Profile' },
  ],
};

const ROLE_META = {
  admin:   { label: 'Administrator', icon: ShieldCheck, color: 'text-purple-400' },
  teacher: { label: 'Teacher',       icon: BookOpen,    color: 'text-blue-400'   },
  student: { label: 'Student',       icon: User,        color: 'text-emerald-400' },
};

export default function Sidebar() {
  const { currentUser, role } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const links   = NAV[role] ?? [];
  const meta    = ROLE_META[role] ?? {};
  const RoleIcon = meta.icon ?? User;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch {
      toast.error('Logout failed');
    }
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen glass border-r border-surface-border flex flex-col flex-shrink-0 overflow-hidden relative"
    >
      {/* Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-5 right-3 z-10 p-1.5 rounded-lg hover:bg-surface-card transition-colors"
      >
        <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronLeft size={16} className="text-slate-400" />
        </motion.div>
      </button>

      {/* Logo */}
      <div className="px-4 pt-6 pb-5 border-b border-surface-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-glow">
          <Camera size={18} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-white font-bold text-sm leading-tight">Smart</p>
              <p className="text-primary-400 font-bold text-sm leading-tight">Attendance</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Role badge */}
      <div className="px-3 py-3 border-b border-surface-border">
        <div className={`flex items-center gap-2.5 px-2 py-2 rounded-xl bg-surface-card`}>
          <RoleIcon size={16} className={`${meta.color} flex-shrink-0`} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`text-xs font-semibold ${meta.color} truncate`}
              >
                {meta.label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* User / Logout */}
      <div className="px-3 py-4 border-t border-surface-border space-y-2">
        <div className={`flex items-center gap-2.5 px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
            {currentUser?.displayName?.[0] ?? currentUser?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="text-xs font-semibold text-white truncate max-w-[120px]">
                  {currentUser?.displayName ?? 'User'}
                </p>
                <p className="text-[10px] text-slate-500 truncate max-w-[120px]">
                  {currentUser?.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={handleLogout}
          className={`sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 ${collapsed ? 'justify-center px-2' : ''}`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
