// src/firebase/firestore.js
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from './config';

// ── Generic helpers ──────────────────────────────────────────────────────────

export const getDocument = async (col, id) => {
  const snap = await getDoc(doc(db, col, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getCollection = async (col) => {
  const snap = await getDocs(collection(db, col));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addDocument = (col, data) =>
  addDoc(collection(db, col), { ...data, createdAt: serverTimestamp() });

export const setDocument = (col, id, data) =>
  setDoc(doc(db, col, id), { ...data, updatedAt: serverTimestamp() }, { merge: true });

export const updateDocument = (col, id, data) =>
  updateDoc(doc(db, col, id), { ...data, updatedAt: serverTimestamp() });

export const deleteDocument = (col, id) =>
  deleteDoc(doc(db, col, id));

// ── Real-time listeners ──────────────────────────────────────────────────────

export const subscribeToCollection = (col, callback, constraints = []) => {
  const q = query(collection(db, col), ...constraints);
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// ── Domain-specific helpers ──────────────────────────────────────────────────

// Users / roles
export const getUserRole = async (uid) => {
  const userData = await getDocument('users', uid);
  return userData?.role ?? null;
};

// Attendance records for a session
export const subscribeToAttendance = (sessionId, callback) =>
  subscribeToCollection('attendance_records', callback, [
    where('sessionId', '==', sessionId),
    orderBy('checkInTime', 'desc'),
  ]);

// Students query
export const getStudentsByClass = async (classId) => {
  const q = query(collection(db, 'students'), where('classId', '==', classId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Sessions for teacher
export const getSessionsByTeacher = async (teacherId) => {
  const q = query(
    collection(db, 'sessions'),
    where('teacherId', '==', teacherId),
    orderBy('startTime', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
