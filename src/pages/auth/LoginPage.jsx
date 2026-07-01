// src/pages/auth/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Camera, ShieldCheck, BookOpen } from 'lucide-react';
import { loginWithEmail, loginWithGoogle } from '../../firebase/auth';
import { getUserRole } from '../../firebase/firestore';
import { getDefaultRoute } from '../../utils/roleHelpers';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'teacher', label: 'Teacher',       icon: BookOpen,    color: 'from-blue-500 to-cyan-500'   },
  { key: 'admin',   label: 'Administrator', icon: ShieldCheck, color: 'from-purple-500 to-violet-500' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [tab,      setTab]      = useState('teacher');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Fill in all fields'); return; }
    setLoading(true);
    try {
      const cred = await loginWithEmail(email, password);
      const role = await getUserRole(cred.user.uid);
      if (role !== tab && tab !== 'admin') {
        toast.error(`This account is not a ${tab}`);
        setLoading(false);
        return;
      }
      toast.success(`Welcome back!`);
      navigate(getDefaultRoute(role));
    } catch (err) {
      const msgs = {
        'auth/user-not-found':  'No account found with this email',
        'auth/wrong-password':  'Incorrect password',
        'auth/invalid-email':   'Invalid email address',
        'auth/too-many-requests': 'Too many attempts. Try again later',
      };
      toast.error(msgs[err.code] ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const cred = await loginWithGoogle();
      const role = await getUserRole(cred.user.uid);
      toast.success('Signed in with Google');
      navigate(getDefaultRoute(role ?? 'student'));
    } catch {
      toast.error('Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface bg-mesh flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-surface to-violet-900/40" />
        <div className="relative z-10 text-center px-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center mx-auto mb-8 shadow-glow"
          >
            <Camera size={44} className="text-white" />
          </motion.div>
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Smart <span className="text-gradient">Attendance</span>
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-slate-400 text-lg leading-relaxed max-w-sm mx-auto"
          >
            AI-powered face recognition attendance system for modern educational institutions
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-col gap-3"
          >
            {['Real-time face recognition', 'Role-based dashboard', 'Instant attendance reports'].map((f, i) => (
              <div key={i} className="flex items-center gap-3 glass rounded-xl px-4 py-3 text-sm text-left">
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse-slow" />
                <span className="text-slate-300">{f}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Decorative orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      {/* Right panel – Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6 lg:hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center shadow-glow">
                <Camera size={20} className="text-white" />
              </div>
              <span className="text-white font-bold text-lg">Smart Attendance</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-slate-400 text-sm">Sign in to your account to continue</p>
          </div>

          {/* Role tabs */}
          <div className="flex gap-2 mb-6 glass rounded-xl p-1">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  tab === key
                    ? 'bg-primary-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              ) : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-surface-border" />
            <span className="text-xs text-slate-500">or continue with</span>
            <div className="flex-1 h-px bg-surface-border" />
          </div>

          {/* Google */}
          <button
            id="google-signin"
            onClick={handleGoogle}
            disabled={loading}
            className="btn-secondary w-full flex items-center justify-center gap-3"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.583c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 6.294C4.672 4.167 6.656 3.583 9 3.583z"/>
            </svg>
            Sign in with Google
          </button>

          {/* Student note */}
          <p className="text-center text-xs text-slate-500 mt-6">
            Student? Use the{' '}
            <span className="text-primary-400 font-medium">Check-In kiosk</span>
            {' '}or ask your admin for access.
          </p>

          <p className="text-center text-xs text-slate-500 mt-3">
            New admin account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Register here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
