// src/firebase/auth.js
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();

export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const registerWithEmail = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const loginWithGoogle = () =>
  signInWithPopup(auth, googleProvider);

export const logout = () => signOut(auth);

export const sendPasswordReset = (email) =>
  sendPasswordResetEmail(auth, email);

export const confirmReset = (oobCode, newPassword) =>
  confirmPasswordReset(auth, oobCode, newPassword);

export const updateUserProfile = (user, data) =>
  updateProfile(user, data);

export const onAuthChange = (callback) =>
  onAuthStateChanged(auth, callback);
