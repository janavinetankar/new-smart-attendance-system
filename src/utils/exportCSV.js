// src/utils/exportCSV.js
export function exportToCSV(data, filename = 'attendance') {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows    = data.map((row) =>
    headers.map((h) => `"${row[h] ?? ''}"`).join(',')
  );
  const csv  = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = `${filename}_${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
