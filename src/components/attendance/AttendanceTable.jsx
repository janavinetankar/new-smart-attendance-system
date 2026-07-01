// src/components/attendance/AttendanceTable.jsx
import { useReactTable, getCoreRowModel, flexRender, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table';
import { useState, useMemo } from 'react';
import StatusBadge from './StatusBadge';
import { formatDateTime } from '../../utils/formatDate';
import { ArrowUpDown, Search } from 'lucide-react';

export default function AttendanceTable({ data = [] }) {
  const [sorting,       setSorting]       = useState([]);
  const [globalFilter,  setGlobalFilter]  = useState('');

  const columns = useMemo(() => [
    {
      accessorKey: 'studentName',
      header: 'Student',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
            {getValue()?.[0] ?? '?'}
          </div>
          <span className="font-medium text-white">{getValue() ?? '—'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'rollNumber',
      header: 'Roll No.',
      cell: ({ getValue }) => <span className="text-slate-400 font-mono text-xs">{getValue() ?? '—'}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    },
    {
      accessorKey: 'checkInTime',
      header: 'Check-In Time',
      cell: ({ getValue }) => <span className="text-slate-400 text-xs">{formatDateTime(getValue())}</span>,
    },
    {
      accessorKey: 'confidence',
      header: 'Confidence',
      cell: ({ getValue }) => {
        const val = getValue();
        if (!val) return <span className="text-slate-500">—</span>;
        const pct = Math.round(val * 100);
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-surface h-1.5 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-primary-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-slate-400 w-8">{pct}%</span>
          </div>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search students..."
          className="input-field pl-9 py-2 text-xs"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-surface-border">
        <table className="w-full">
          <thead className="border-b border-surface-border bg-surface-card/50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="table-head cursor-pointer select-none"
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      <ArrowUpDown size={12} className="text-slate-600" />
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-surface-border">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 text-slate-500 text-sm">
                  No attendance records found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-card/30 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="table-cell">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">{data.length} record{data.length !== 1 ? 's' : ''}</p>
    </div>
  );
}
