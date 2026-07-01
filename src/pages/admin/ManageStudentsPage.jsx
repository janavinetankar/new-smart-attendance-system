// src/pages/admin/ManageStudentsPage.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Search, GraduationCap, X, Check } from 'lucide-react';
import { getCollection, addDocument, updateDocument, deleteDocument } from '../../firebase/firestore';
import PageWrapper from '../../components/common/PageWrapper';
import toast from 'react-hot-toast';

const EMPTY = { name: '', rollNumber: '', email: '', classId: '', phone: '' };

export default function ManageStudentsPage() {
  const [students, setStudents]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [search,   setSearch]     = useState('');
  const [modal,    setModal]      = useState(null);   // null | 'add' | 'edit'
  const [selected, setSelected]   = useState(null);
  const [form,     setForm]       = useState(EMPTY);
  const [saving,   setSaving]     = useState(false);

  const load = async () => {
    setLoading(true);
    try { setStudents(await getCollection('students')); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = students.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
    s.classId?.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (s) => { setSelected(s); setForm({ name: s.name, rollNumber: s.rollNumber, email: s.email, classId: s.classId, phone: s.phone ?? '' }); setModal('edit'); };
  const openAdd  = ()  => { setForm(EMPTY); setModal('add'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.rollNumber) { toast.error('Name and Roll Number required'); return; }
    setSaving(true);
    try {
      if (modal === 'add') {
        await addDocument('students', form);
        toast.success('Student added');
      } else {
        await updateDocument('students', selected.id, form);
        toast.success('Student updated');
      }
      closeModal();
      load();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete student "${name}"?`)) return;
    try {
      await deleteDocument('students', id);
      toast.success('Student deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  const fields = [
    { name: 'name',       label: 'Full Name',    type: 'text',  placeholder: 'John Doe'        },
    { name: 'rollNumber', label: 'Roll Number',   type: 'text',  placeholder: 'CS2024001'       },
    { name: 'email',      label: 'Email',         type: 'email', placeholder: 'student@edu.in'  },
    { name: 'classId',    label: 'Class/Section', type: 'text',  placeholder: '10-A'            },
    { name: 'phone',      label: 'Phone',         type: 'tel',   placeholder: '+91 9876543210'  },
  ];

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-header">Manage Students</h1>
          <p className="page-sub">{students.length} registered students</p>
        </div>
        <button id="add-student-btn" onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Student
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          id="student-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, roll number, or class..."
          className="input-field pl-11"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-surface-border bg-surface-card/50">
              <tr>
                {['Student', 'Roll No.', 'Class', 'Email', 'Actions'].map((h) => (
                  <th key={h} className="table-head">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((__, j) => (
                      <td key={j} className="table-cell"><div className="h-4 bg-surface-border rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <GraduationCap size={32} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">{search ? 'No students match your search' : 'No students yet. Add one!'}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-surface-card/30 transition-colors"
                  >
                    <td className="table-cell">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {s.name?.[0] ?? '?'}
                        </div>
                        <span className="font-medium text-white">{s.name}</span>
                      </div>
                    </td>
                    <td className="table-cell font-mono text-xs text-slate-400">{s.rollNumber}</td>
                    <td className="table-cell text-slate-400">{s.classId}</td>
                    <td className="table-cell text-slate-400 text-xs">{s.email}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-primary-500/20 text-slate-400 hover:text-primary-400 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(s.id, s.name)} className="p-1.5 rounded-lg hover:bg-absent/20 text-slate-400 hover:text-absent transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">{modal === 'add' ? 'Add Student' : 'Edit Student'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              {fields.map(({ name, label, type, placeholder }) => (
                <div key={name}>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">{label}</label>
                  <input
                    id={`student-${name}`}
                    type={type}
                    value={form[name]}
                    onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    placeholder={placeholder}
                    className="input-field"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button id="student-save-btn" type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
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
