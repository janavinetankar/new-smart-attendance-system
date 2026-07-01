// src/pages/error/UnauthorizedPage.jsx
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft, LogOut } from 'lucide-react';
import { logout } from '../../firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { getDefaultRoute } from '../../utils/roleHelpers';

export default function UnauthorizedPage() {
  const { role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface bg-mesh flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-24 h-24 rounded-3xl bg-absent/10 border border-absent/30 flex items-center justify-center mx-auto mb-6"
        >
          <ShieldOff size={44} className="text-absent" />
        </motion.div>

        <div className="text-6xl font-black text-absent mb-3">403</div>
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-slate-400 text-sm mb-8">
          You don't have permission to view this page.
          Your current role doesn't allow access here.
        </p>

        <div className="flex items-center justify-center gap-3">
          {role && (
            <Link to={getDefaultRoute(role)} className="btn-primary flex items-center gap-2">
              <ArrowLeft size={16} />
              My Dashboard
            </Link>
          )}
          <button onClick={handleLogout} className="btn-secondary flex items-center gap-2">
            <LogOut size={16} />
            Switch Account
          </button>
        </div>
      </motion.div>
    </div>
  );
}
