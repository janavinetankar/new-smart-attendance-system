// src/pages/auth/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck, Camera } from 'lucide-react';
import { registerWithEmail, updateUserProfile } from '../../firebase/auth';
import { setDocument } from '../../firebase/firestore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6)       { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const cred = await registerWithEmail(form.email, form.password);
      await updateUserProfile(cred.user, { displayName: form.name });

      // Write role to Firestore in the background – don't block navigation on it
      setDocument('users', cred.user.uid, {
        name:  form.name,
        email: form.email,
        role:  'admin',
        uid:   cred.user.uid,
      }).catch(() => {
        // Firestore may not be set up yet; user can still proceed and role will be assigned later
        toast.error('Account created but profile save failed. Set up Firestore in Firebase Console.');
      });

      toast.success('Admin account created!');
      navigate('/admin/dashboard');
    } catch (err) {
      const msgs = {
        'auth/email-already-in-use': 'Email already registered',
        'auth/invalid-email':        'Invalid email address',
        'auth/weak-password':        'Password too weak',
      };
      toast.error(msgs[err.code] ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface bg-mesh flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center shadow-glow">
            <Camera size={24} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">Smart Attendance</p>
            <p className="text-slate-400 text-xs">Admin Registration</p>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <ShieldCheck size={20} className="text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Create Admin Account</h1>
              <p className="text-slate-400 text-xs">Administrator access only</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'name',    label: 'Full Name',        type: 'text',  icon: User,  placeholder: 'John Doe'         },
              { name: 'email',   label: 'Email Address',    type: 'email', icon: Mail,  placeholder: 'admin@school.edu' },
            ].map(({ name, label, type, icon: Icon, placeholder }) => (
              <div key={name}>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">{label}</label>
                <div className="relative">
                  <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id={`register-${name}`}
                    name={name}
                    type={type}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>
            ))}

            {['password', 'confirm'].map((field) => (
              <div key={field}>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                  {field === 'password' ? 'Password' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id={`register-${field}`}
                    name={field}
                    type={showPwd ? 'text' : 'password'}
                    value={form[field]}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input-field pl-10 pr-10"
                    required
                  />
                  {field === 'confirm' && (
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {loading ? <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
