// src/store/authStore.js
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  role: null,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  clear:   ()     => set({ user: null, role: null }),
}));
