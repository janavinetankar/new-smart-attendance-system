// src/store/attendanceStore.js
import { create } from 'zustand';

export const useAttendanceStore = create((set) => ({
  records:    [],
  loading:    false,
  setRecords: (records) => set({ records }),
  setLoading: (loading) => set({ loading }),
  addRecord:  (record)  => set((s) => ({ records: [record, ...s.records] })),
}));
