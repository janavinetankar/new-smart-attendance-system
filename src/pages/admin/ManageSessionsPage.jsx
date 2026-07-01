// src/pages/admin/ManageSessionsPage.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Search, StopCircle, Trash2 } from 'lucide-react';
import { getCollection, updateDocument, deleteDocument } from '../../firebase/firestore';
import PageWrapper from '../../components/common/PageWrapper';
import { formatDate, formatTime, formatDuration } from '../../utils/formatDate';
import toast from 'react-hot-toast';

export default function ManageSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');

  const load = async () => {
    setLoading(true);
    try { setSessions(await getCollection('sessions')); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = sessions
    .filter((s) => filter === 'all' || s.status === filter)
    .filter((s) =>
      s.subject?.toLowerCase().includes(search.toLowerCase()) ||
      s.className?.toLowerCase().includes(search.toLowerCase()) ||
      s.teacherName?.toLowerCase().includes(search.toLowerCase())
    );

  const handleEnd = async (id, subject) => {
    if (!confirm(`End session "${subject}"?`)) return;
    try { await updateDocument('sessions', id, { status: 'ended', endTime: new Date() }); toast.success('Session ended'); load(); }
    catch { toast.error('Failed to end session'); }
  };

  const handleDelete = async (id, subject) => {
    if (!confirm(`Delete session "${subject}"?`)) return;
    try { await deleteDocument('sessions', id); toast.success('Session deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="page-header">Manage Sessions</h1>
        <p className="page-sub">Monitor and control all attendance sessions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="session-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject, class, or teacher..."
            className="input-field pl-11"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'ended'].map((f) => (
            <button
              key={f}
              id={`filter-${f}`}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
                filter === f ? 'bg-primary-600 text-white shadow-glow' : 'glass text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-surface-border bg-surface-card/50">
              <tr>
                {['Subject', 'Class', 'Teacher', 'Date', 'Duration', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="table-head">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(7)].map((__, j) => (
                    <td key={j} className="table-cell"><div className="h-4 bg-surface-border rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <CalendarDays size={32} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No sessions found</p>
                  </td>
                </tr>
              ) : filtered.map((s, i) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-surface-card/30 transition-colors"
                >
                  <td className="table-cell font-medium text-white">{s.subject}</td>
                  <td className="table-cell text-slate-400">{s.className}</td>
                  <td className="table-cell text-slate-400">{s.teacherName ?? '—'}</td>
                  <td className="table-cell text-xs text-slate-400">{formatDate(s.startTime)}<br />{formatTime(s.startTime)}</td>
                  <td className="table-cell text-xs text-slate-400">{s.endTime ? formatDuration(s.startTime, s.endTime) : '—'}</td>
                  <td className="table-cell">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      s.status === 'active'
                        ? 'bg-present/20 text-present border-present/30'
                        : 'bg-slate-600/20 text-slate-400 border-slate-600/30'
                    }`}>
                      {s.status === 'active' ? '● Live' : 'Ended'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      {s.status === 'active' && (
                        <button onClick={() => handleEnd(s.id, s.subject)} className="p-1.5 rounded-lg hover:bg-late/20 text-slate-400 hover:text-late transition-colors" title="End session">
                          <StopCircle size={14} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(s.id, s.subject)} className="p-1.5 rounded-lg hover:bg-absent/20 text-slate-400 hover:text-absent transition-colors" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
}
