// src/pages/teacher/AttendanceReportsPage.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, Filter, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getSessionsByTeacher, subscribeToCollection } from '../../firebase/firestore';
import { where } from 'firebase/firestore';
import PageWrapper from '../../components/common/PageWrapper';
import AttendanceTable from '../../components/attendance/AttendanceTable';
import { exportToCSV } from '../../utils/exportCSV';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';

export default function AttendanceReportsPage() {
  const { currentUser } = useAuth();
  const [sessions,   setSessions]   = useState([]);
  const [selected,   setSelected]   = useState('');
  const [records,    setRecords]    = useState([]);
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    getSessionsByTeacher(currentUser.uid).then(setSessions);
  }, [currentUser]);

  useEffect(() => {
    if (!selected) { setRecords([]); return; }
    setLoading(true);
    const unsub = subscribeToCollection('attendance_records', (data) => {
      setRecords(data);
      setLoading(false);
    }, [where('sessionId', '==', selected)]);
    return unsub;
  }, [selected]);

  const present = records.filter((r) => r.status === 'present').length;
  const absent  = records.filter((r) => r.status === 'absent').length;
  const late    = records.filter((r) => r.status === 'late').length;

  const handleExport = () => {
    if (!records.length) { toast.error('No data to export'); return; }
    exportToCSV(records.map(({ studentName, rollNumber, status, checkInTime }) => ({
      'Student Name': studentName,
      'Roll Number':  rollNumber ?? '',
      'Status':       status,
      'Check-In':     formatDate(checkInTime),
    })), `attendance_${selected}`);
    toast.success('CSV exported!');
  };

  const selectedSession = sessions.find((s) => s.id === selected);

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-header">Attendance Reports</h1>
          <p className="page-sub">View and export attendance by session</p>
        </div>
        <button id="export-csv-btn" onClick={handleExport} className="btn-secondary flex items-center gap-2">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Session filter */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-primary-400" />
          <span className="text-sm font-semibold text-white">Select Session</span>
        </div>
        <select
          id="report-session-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="input-field"
        >
          <option value="">— Choose a session —</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.subject} • {s.className} • {formatDate(s.startTime)}
            </option>
          ))}
        </select>
      </div>

      {/* Summary stats */}
      {selected && selectedSession && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Present', value: present, color: 'text-present', bg: 'bg-present/10 border-present/20' },
            { label: 'Absent',  value: absent,  color: 'text-absent',  bg: 'bg-absent/10 border-absent/20'   },
            { label: 'Late',    value: late,    color: 'text-late',    bg: 'bg-late/10 border-late/20'       },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`glass rounded-xl p-4 border ${bg} text-center`}>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Records */}
      {!selected ? (
        <div className="card text-center py-16">
          <BarChart3 size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Select a session above to view attendance records</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar size={16} className="text-primary-400" />
              {selectedSession?.subject} — {selectedSession?.className}
            </h2>
            <span className="text-xs text-slate-400">{formatDate(selectedSession?.startTime)}</span>
          </div>
          <AttendanceTable data={records} />
        </motion.div>
      )}
    </PageWrapper>
  );
}
