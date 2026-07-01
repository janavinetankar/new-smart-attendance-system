// src/store/sessionStore.js
import { create } from 'zustand';

export const useSessionStore = create((set) => ({
  activeSession: null,
  sessions:      [],
  setSession:    (s) => set({ activeSession: s }),
  setSessions:   (s) => set({ sessions: s }),
  clearSession:  ()  => set({ activeSession: null }),
}));
