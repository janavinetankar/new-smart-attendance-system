// src/pages/admin/ManageTeachersPage.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Search, Users, X, Check, BookOpen } from 'lucide-react';
import { getCollection, setDocument, updateDocument, deleteDocument } from '../../firebase/firestore';
import { registerWithEmail, updateUserProfile } from '../../firebase/auth';
import PageWrapper from '../../components/common/PageWrapper';
import { getRoleColor } from '../../utils/roleHelpers';
import toast from 'react-hot-toast';

const EMPTY = { name: '', email: '', department: '', password: '' };

export default function ManageTeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const users = await getCollection('users');
      setTeachers(users.filter((u) => u.role === 'teacher'));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = teachers.filter((t) =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase()) ||
    t.department?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = ()  => { setForm(EMPTY); setModal('add'); };
  const openEdit = (t) => { setSelected(t); setForm({ name: t.name, email: t.email, department: t.department ?? '', password: '' }); setModal('edit'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) { toast.error('Name and Email required'); return; }
    setSaving(true);
    try {
      if (modal === 'add') {
        if (!form.password) { toast.error('Password required for new teacher'); setSaving(false); return; }
        const cred = await registerWithEmail(form.email, form.password);
        await updateUserProfile(cred.user, { displayName: form.name });
        await setDocument('users', cred.user.uid, {
          name: form.name, email: form.email,
          department: form.department, role: 'teacher', uid: cred.user.uid,
        });
        toast.success('Teacher account created');
      } else {
        await updateDocument('users', selected.id, { name: form.name, department: form.department });
        toast.success('Teacher updated');
      }
      closeModal();
      load();
    } catch (err) {
      toast.error(err.code === 'auth/email-already-in-use' ? 'Email already registered' : 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Remove teacher "${name}"?`)) return;
    try { await deleteDocument('users', id); toast.success('Teacher removed'); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-header">Manage Teachers</h1>
          <p className="page-sub">{teachers.length} registered teachers</p>
        </div>
        <button id="add-teacher-btn" onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Teacher
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          id="teacher-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or department..."
          className="input-field pl-11"
        />
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-xl p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-surface-border" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-border rounded w-3/4" />
                  <div className="h-3 bg-surface-border rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Users size={32} className="text-slate-600 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">{search ? 'No teachers match your search' : 'No teachers yet'}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-hover rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-lg font-bold text-white">
                    {t.name?.[0] ?? '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.department ?? 'No dept.'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-primary-500/20 text-slate-400 hover:text-primary-400 transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(t.id, t.name)} className="p-1.5 rounded-lg hover:bg-absent/20 text-slate-400 hover:text-absent transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <BookOpen size={12} />
                <span className="truncate">{t.email}</span>
              </div>
              <div className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${getRoleColor('teacher')}`}>
                Teacher
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">{modal === 'add' ? 'Add Teacher' : 'Edit Teacher'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              {[
                { name: 'name',       label: 'Full Name',   type: 'text',     placeholder: 'Dr. Jane Smith' },
                { name: 'email',      label: 'Email',       type: 'email',    placeholder: 'teacher@school.edu', disabled: modal === 'edit' },
                { name: 'department', label: 'Department',  type: 'text',     placeholder: 'Computer Science' },
                ...(modal === 'add' ? [{ name: 'password', label: 'Password', type: 'password', placeholder: 'Min. 6 characters' }] : []),
              ].map(({ name, label, type, placeholder, disabled }) => (
                <div key={name}>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">{label}</label>
                  <input
                    id={`teacher-${name}`}
                    type={type}
                    value={form[name]}
                    onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="input-field disabled:opacity-50"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button id="teacher-save-btn" type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> : <><Check size={16} />Save</>}
                </button>
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </PageWrapper>
  );
}
