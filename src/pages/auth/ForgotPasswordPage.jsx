// src/pages/auth/ForgotPasswordPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Camera, ArrowLeft, CheckCircle } from 'lucide-react';
import { sendPasswordReset } from '../../firebase/auth';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (err) {
      toast.error(err.code === 'auth/user-not-found' ? 'No account with this email' : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface bg-mesh flex items-center justify-center px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center shadow-glow">
            <Camera size={24} className="text-white" />
          </div>
        </div>

        <div className="card">
          {sent ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-present/20 border border-present/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-present" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Email Sent!</h2>
              <p className="text-slate-400 text-sm mb-6">
                We've sent a password reset link to <span className="text-white font-medium">{email}</span>.
                Check your inbox.
              </p>
              <Link to="/login" className="btn-primary inline-flex items-center gap-2">
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </motion.div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-1">Forgot Password?</h1>
              <p className="text-slate-400 text-sm mb-6">Enter your email and we'll send a reset link.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>
                <button
                  id="forgot-submit"
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-center text-xs text-slate-500 mt-4">
                Remember your password?{' '}
                <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
