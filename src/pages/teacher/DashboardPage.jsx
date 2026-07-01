// src/pages/teacher/DashboardPage.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, Clock, Activity, PlayCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToAttendance, getSessionsByTeacher } from '../../firebase/firestore';
import PageWrapper from '../../components/common/PageWrapper';
import AttendanceTable from '../../components/attendance/AttendanceTable';
import { formatTime } from '../../utils/formatDate';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [sessions,  setSessions]  = useState([]);
  const [active,    setActive]    = useState(null);
  const [records,   setRecords]   = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    getSessionsByTeacher(currentUser.uid)
      .then((data) => {
        setSessions(data);
        const act = data.find((s) => s.status === 'active');
        setActive(act ?? null);
      })
      .finally(() => setLoading(false));
  }, [currentUser]);

  useEffect(() => {
    if (!active?.id) return;
    const unsub = subscribeToAttendance(active.id, setRecords);
    return unsub;
  }, [active]);

  const present = records.filter((r) => r.status === 'present').length;
  const absent  = records.filter((r) => r.status === 'absent').length;
  const late    = records.filter((r) => r.status === 'late').length;

  const stats = [
    { label: 'Total',   value: records.length, icon: Users,     color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/20' },
    { label: 'Present', value: present,         icon: UserCheck, color: 'text-present',     bg: 'bg-present/10 border-present/20' },
    { label: 'Absent',  value: absent,          icon: UserX,     color: 'text-absent',      bg: 'bg-absent/10 border-absent/20' },
    { label: 'Late',    value: late,            icon: Clock,     color: 'text-late',        bg: 'bg-late/10 border-late/20' },
  ];

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="page-header">Teacher Dashboard</h1>
          <p className="page-sub">Real-time attendance for active session</p>
        </div>
        {active && (
          <div className="flex items-center gap-2 glass rounded-xl px-4 py-2 border border-present/30">
            <span className="w-2 h-2 rounded-full bg-present animate-pulse" />
            <span className="text-sm text-present font-semibold">Live: {active.subject}</span>
            <span className="text-xs text-slate-400">since {formatTime(active.startTime)}</span>
          </div>
        )}
      </div>

      {/* No active session */}
      {!loading && !active && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center py-16"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mx-auto mb-4">
            <PlayCircle size={32} className="text-primary-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Active Session</h2>
          <p className="text-slate-400 text-sm mb-6">Start a session to see real-time attendance</p>
          <a href="/teacher/sessions" className="btn-primary inline-flex items-center gap-2">
            <PlayCircle size={16} />
            Start Session
          </a>
        </motion.div>
      )}

      {/* Stats */}
      {active && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map(({ label, value, icon: Icon, color, bg }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`stat-card border ${bg}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                  <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon size={16} className={color} />
                  </div>
                </div>
                <p className={`text-3xl font-bold ${color}`}>{value}</p>
                {records.length > 0 && label !== 'Total' && (
                  <p className="text-xs text-slate-500 mt-1">
                    {Math.round((value / records.length) * 100)}% of total
                  </p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Attendance rate bar */}
          <div className="card mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={16} className="text-primary-400" />
              <span className="text-sm font-semibold text-white">Attendance Rate</span>
              <span className="ml-auto text-sm text-primary-400 font-bold">
                {records.length ? Math.round((present / records.length) * 100) : 0}%
              </span>
            </div>
            <div className="h-3 bg-surface rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${records.length ? (present / records.length) * 100 : 0}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-emerald-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="card">
            <h2 className="text-base font-bold text-white mb-4">Attendance Records</h2>
            <AttendanceTable data={records} />
          </div>
        </>
      )}
    </PageWrapper>
  );
}
