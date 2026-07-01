// src/components/student/StudentCard.jsx
import { motion } from 'framer-motion';
import StatusBadge from '../attendance/StatusBadge';

export default function StudentCard({ student, status, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      onClick={onClick}
      className="glass rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all duration-200 hover:border-primary-500/30"
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
        {student?.name?.[0] ?? '?'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{student?.name ?? '—'}</p>
        <p className="text-xs text-slate-400">{student?.rollNumber ?? ''}</p>
      </div>
      {status && <StatusBadge status={status} />}
    </motion.div>
  );
}
