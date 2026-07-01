// src/pages/teacher/SessionManagementPage.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Plus, StopCircle, CalendarDays } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { addDocument, getSessionsByTeacher, updateDocument } from '../../firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';
import PageWrapper from '../../components/common/PageWrapper';
import SessionCard from '../../components/session/SessionCard';
import toast from 'react-hot-toast';

export default function SessionManagementPage() {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [creating, setCreating] = useState(false);
  const [form,     setForm]     = useState({ subject: '', className: '' });
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    if (!currentUser) return;
    try {
      const data = await getSessionsByTeacher(currentUser.uid);
      setSessions(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [currentUser]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.className) { toast.error('Fill in all fields'); return; }
    setCreating(true);
    try {
      await addDocument('sessions', {
        ...form,
        teacherId: currentUser.uid,
        teacherName: currentUser.displayName ?? currentUser.email,
        status: 'active',
        startTime: new Date(),
      });
      toast.success(`Session "${form.subject}" started`);
      setForm({ subject: '', className: '' });
      setShowForm(false);
      load();
    } catch {
      toast.error('Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  const handleEnd = async (session) => {
    try {
      await updateDocument('sessions', session.id, { status: 'ended', endTime: new Date() });
      toast.success('Session ended');
      load();
    } catch {
      toast.error('Failed to end session');
    }
  };

  const active = sessions.filter((s) => s.status === 'active');
  const past   = sessions.filter((s) => s.status !== 'active');

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-header">Session Management</h1>
          <p className="page-sub">Create and manage attendance sessions</p>
        </div>
        <button id="new-session-btn" onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          New Session
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card mb-6 border border-primary-500/30">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <PlayCircle size={18} className="text-primary-400" />
            Start New Session
          </h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">Subject</label>
              <input
                id="session-subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g. Mathematics"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">Class / Section</label>
              <input
                id="session-class"
                value={form.className}
                onChange={(e) => setForm({ ...form, className: e.target.value })}
                placeholder="e.g. 10-A"
                className="input-field"
                required
              />
            </div>
            <div className="flex items-end gap-2">
              <button id="session-start-btn" type="submit" disabled={creating} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
                {creating ? <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> : <><PlayCircle size={16} />Start</>}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-4">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Active sessions */}
      {active.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-present animate-pulse" />
            Active Sessions
          </h2>
          <div className="grid gap-4">
            {active.map((s) => <SessionCard key={s.id} session={s} onEnd={handleEnd} active />)}
          </div>
        </div>
      )}

      {/* Past sessions */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <CalendarDays size={14} />
          Past Sessions ({past.length})
        </h2>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin" />
          </div>
        ) : past.length === 0 ? (
          <div className="card text-center py-10">
            <CalendarDays size={32} className="text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No past sessions yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {past.map((s) => <SessionCard key={s.id} session={s} />)}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
