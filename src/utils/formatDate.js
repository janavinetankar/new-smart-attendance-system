// src/utils/formatDate.js
export const formatDate = (timestamp) => {
  if (!timestamp) return '—';
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

export const formatTime = (timestamp) => {
  if (!timestamp) return '—';
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

export const formatDateTime = (timestamp) => {
  if (!timestamp) return '—';
  return `${formatDate(timestamp)} ${formatTime(timestamp)}`;
};

export const formatDuration = (start, end) => {
  if (!start || !end) return '—';
  const s = start?.toDate ? start.toDate() : new Date(start);
  const e = end?.toDate   ? end.toDate()   : new Date(end);
  const diff = Math.round((e - s) / 60000);
  return `${diff} min`;
};
