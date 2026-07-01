// src/pages/student/StudentProfilePage.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, BookOpen, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToCollection } from '../../firebase/firestore';
import { where } from 'firebase/firestore';
import PageWrapper from '../../components/common/PageWrapper';
import StatusBadge from '../../components/attendance/StatusBadge';
import { formatDate, formatTime } from '../../utils/formatDate';

export default function StudentProfilePage() {
  const { currentUser } = useAuth();
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToCollection('attendance_records', setRecords, [
      where('studentId', '==', currentUser.uid),
    ]);
    return unsub;
  }, [currentUser]);

  const present = records.filter((r) => r.status === 'present').length;
  const absent  = records.filter((r) => r.status === 'absent').length;
  const late    = records.filter((r) => r.status === 'late').length;
  const pct     = records.length ? Math.round((present / records.length) * 100) : 0;

  const stats = [
    { label: 'Present',  value: present, color: 'text-present', bg: 'bg-present/10 border-present/20' },
    { label: 'Absent',   value: absent,  color: 'text-absent',  bg: 'bg-absent/10 border-absent/20'   },
    { label: 'Late',     value: late,    color: 'text-late',    bg: 'bg-late/10 border-late/20'       },
    { label: 'Rate',     value: `${pct}%`, color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/20' },
  ];

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-3xl font-bold text-white shadow-glow flex-shrink-0">
              {currentUser?.displayName?.[0] ?? <User size={36} />}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{currentUser?.displayName ?? 'Student'}</h1>
              <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                <Mail size={14} />
                <span>{currentUser?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                <BookOpen size={14} />
                <span className="capitalize">Student</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ label, value, color, bg }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`glass rounded-xl p-4 border ${bg} text-center`}
            >
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-400 mt-1">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Attendance history */}
        <div className="card">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-primary-400" />
            Attendance History
          </h2>
          {records.length === 0 ? (
            <div className="text-center py-10">
              <TrendingUp size={32} className="text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No attendance records yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {records.map((r) => (
                <div key={r.id} className="flex items-center justify-between glass rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{r.sessionId ?? 'Session'}</p>
                    <p className="text-xs text-slate-400">{formatDate(r.checkInTime)} • {formatTime(r.checkInTime)}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
