// src/pages/auth/ResetPasswordPage.jsx
import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Camera, CheckCircle } from 'lucide-react';
import { confirmReset } from '../../firebase/auth';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [params]                    = useSearchParams();
  const navigate                    = useNavigate();
  const oobCode                     = params.get('oobCode');
  const [password,  setPassword]    = useState('');
  const [confirm,   setConfirm]     = useState('');
  const [showPwd,   setShowPwd]     = useState(false);
  const [loading,   setLoading]     = useState(false);
  const [done,      setDone]        = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm)   { toast.error('Passwords do not match'); return; }
    if (password.length < 6)    { toast.error('Minimum 6 characters required'); return; }
    if (!oobCode)               { toast.error('Invalid reset link'); return; }
    setLoading(true);
    try {
      await confirmReset(oobCode, password);
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch {
      toast.error('Reset link expired or invalid. Request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface bg-mesh flex items-center justify-center px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center shadow-glow">
            <Camera size={24} className="text-white" />
          </div>
        </div>

        <div className="card">
          {done ? (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-present/20 border border-present/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-present" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Password Reset!</h2>
              <p className="text-slate-400 text-sm">Redirecting to login...</p>
            </motion.div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-1">Set New Password</h1>
              <p className="text-slate-400 text-sm mb-6">Enter your new password below.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { id: 'new-password',     val: password, set: setPassword, label: 'New Password' },
                  { id: 'confirm-password', val: confirm,  set: setConfirm,  label: 'Confirm Password' },
                ].map(({ id, val, set, label }) => (
                  <div key={id}>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">{label}</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        id={id}
                        type={showPwd ? 'text' : 'password'}
                        value={val}
                        onChange={(e) => set(e.target.value)}
                        placeholder="••••••••"
                        className="input-field pl-10 pr-10"
                        required
                      />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-xs text-primary-400 flex items-center gap-1">
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />} {showPwd ? 'Hide' : 'Show'} passwords
                </button>
                <button
                  id="reset-submit"
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" /> : 'Reset Password'}
                </button>
              </form>
              <p className="text-center text-xs text-slate-500 mt-4">
                <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Back to Login</Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
