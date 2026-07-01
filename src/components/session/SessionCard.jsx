// src/components/session/SessionCard.jsx
import { motion } from 'framer-motion';
import { Clock, Users, PlayCircle, StopCircle } from 'lucide-react';
import { formatDate, formatTime, formatDuration } from '../../utils/formatDate';

export default function SessionCard({ session, onEnd, onSelect, active }) {
  const isActive = session.status === 'active';
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={() => onSelect?.(session)}
      className={`glass rounded-xl p-5 cursor-pointer transition-all duration-200 ${
        active ? 'border border-primary-500/50 shadow-glow' : 'hover:border-primary-500/20'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-white">{session.subject ?? 'Session'}</h3>
          <p className="text-xs text-slate-400">{session.className} • {formatDate(session.startTime)}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
          isActive
            ? 'bg-present/20 text-present border-present/30'
            : 'bg-slate-600/20 text-slate-400 border-slate-600/30'
        }`}>
          {isActive ? '● Live' : 'Ended'}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {formatTime(session.startTime)}
          {session.endTime && ` – ${formatTime(session.endTime)}`}
        </span>
        {session.totalStudents && (
          <span className="flex items-center gap-1">
            <Users size={12} />
            {session.presentCount ?? 0}/{session.totalStudents}
          </span>
        )}
        {session.endTime && (
          <span className="flex items-center gap-1">
            ⏱ {formatDuration(session.startTime, session.endTime)}
          </span>
        )}
      </div>

      {isActive && onEnd && (
        <button
          onClick={(e) => { e.stopPropagation(); onEnd(session); }}
          className="mt-4 flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          <StopCircle size={14} />
          End Session
        </button>
      )}
    </motion.div>
  );
}
