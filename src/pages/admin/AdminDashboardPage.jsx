// src/pages/admin/AdminDashboardPage.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, CalendarDays, BarChart3, TrendingUp, ShieldCheck } from 'lucide-react';
import { getCollection } from '../../firebase/firestore';
import PageWrapper from '../../components/common/PageWrapper';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function AdminDashboardPage() {
  const { currentUser } = useAuth();
  const [counts,  setCounts]  = useState({ students: 0, teachers: 0, sessions: 0, records: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCollection('students'),
      getCollection('users'),
      getCollection('sessions'),
      getCollection('attendance_records'),
    ]).then(([students, users, sessions, records]) => {
      const teachers = users.filter((u) => u.role === 'teacher');
      setCounts({ students: students.length, teachers: teachers.length, sessions: sessions.length, records: records.length });
    }).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Students',    value: counts.students, icon: GraduationCap, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', to: '/admin/students' },
    { label: 'Teachers',    value: counts.teachers, icon: Users,          color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',    to: '/admin/teachers' },
    { label: 'Sessions',    value: counts.sessions, icon: CalendarDays,   color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20', to: '/admin/sessions' },
    { label: 'Check-Ins',   value: counts.records,  icon: BarChart3,      color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',   to: null },
  ];

  const quickLinks = [
    { to: '/admin/students', label: 'Manage Students',  icon: GraduationCap, desc: 'Add, edit, or remove student records'    },
    { to: '/admin/teachers', label: 'Manage Teachers',  icon: Users,          desc: 'Manage teacher accounts and access'     },
    { to: '/admin/sessions', label: 'View Sessions',    icon: CalendarDays,   desc: 'Monitor all active and past sessions'   },
  ];

  return (
    <PageWrapper>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <ShieldCheck size={22} className="text-purple-400" />
          <h1 className="page-header">Admin Dashboard</h1>
        </div>
        <p className="page-sub">
          Welcome back, <span className="text-white font-medium">{currentUser?.displayName ?? 'Admin'}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, color, bg, to }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`stat-card border ${bg} ${to ? 'cursor-pointer' : ''}`}
            onClick={to ? undefined : undefined}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
              <div className={`w-9 h-9 rounded-xl ${bg} border flex items-center justify-center`}>
                <Icon size={18} className={color} />
              </div>
            </div>
            {loading ? (
              <div className="w-12 h-8 bg-surface-border rounded animate-pulse" />
            ) : (
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
            )}
            {to && (
              <Link to={to} className="text-xs text-primary-400 hover:text-primary-300 mt-2 inline-flex items-center gap-1">
                View all →
              </Link>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp size={14} />
          Quick Actions
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {quickLinks.map(({ to, label, icon: Icon, desc }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              <Link
                to={to}
                className="glass-hover rounded-xl p-5 flex items-start gap-4 block group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500/30 transition-colors">
                  <Icon size={20} className="text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-slate-400 mt-1">{desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
