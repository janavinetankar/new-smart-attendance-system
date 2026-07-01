// src/components/attendance/StatusBadge.jsx
export default function StatusBadge({ status }) {
  const map = {
    present: 'badge-present',
    absent:  'badge-absent',
    late:    'badge-late',
  };
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : '—';
  return <span className={map[status] ?? 'text-slate-400 text-xs'}>{label}</span>;
}
