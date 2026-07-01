// src/pages/student/CheckInPage.jsx
import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle, XCircle, RefreshCw, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { addDocument } from '../../firebase/firestore';
import PageWrapper from '../../components/common/PageWrapper';
import toast from 'react-hot-toast';

const STATUS = { IDLE: 'idle', SCANNING: 'scanning', SUCCESS: 'success', FAILED: 'failed' };

export default function CheckInPage() {
  const { currentUser } = useAuth();
  const videoRef        = useRef(null);
  const streamRef       = useRef(null);
  const [status,        setStatus]      = useState(STATUS.IDLE);
  const [cameraReady,   setCameraReady] = useState(false);
  const [countdown,     setCountdown]   = useState(null);
  const [resultData,    setResultData]  = useState(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setCameraReady(true);
      }
    } catch {
      toast.error('Could not access camera. Please allow camera permission.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraReady(false);
  }, []);

  useEffect(() => {
    startCamera();
    return stopCamera;
  }, [startCamera, stopCamera]);

  const handleCheckIn = async () => {
    if (!cameraReady) { toast.error('Camera not ready'); return; }
    setStatus(STATUS.SCANNING);

    // Countdown
    for (let i = 3; i >= 1; i--) {
      setCountdown(i);
      await new Promise((r) => setTimeout(r, 800));
    }
    setCountdown(null);

    // Simulate face recognition API call
    await new Promise((r) => setTimeout(r, 1500));

    // In production: call your DS/ML face API here and get confidence score
    const mockSuccess   = Math.random() > 0.2; // 80% success for demo
    const confidence    = 0.75 + Math.random() * 0.24;

    if (mockSuccess) {
      const record = {
        studentId:   currentUser.uid,
        studentName: currentUser.displayName ?? 'Student',
        email:       currentUser.email,
        status:      'present',
        checkInTime: new Date(),
        confidence,
        sessionId:   'demo-session',
      };
      try {
        await addDocument('attendance_records', record);
        setResultData({ success: true, confidence, time: new Date() });
        setStatus(STATUS.SUCCESS);
        toast.success('Attendance marked successfully!');
      } catch {
        toast.error('Failed to save attendance');
        setStatus(STATUS.FAILED);
      }
    } else {
      setResultData({ success: false });
      setStatus(STATUS.FAILED);
    }
  };

  const handleReset = () => { setStatus(STATUS.IDLE); setResultData(null); };

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="page-header">Face Check-In</h1>
          <p className="page-sub">Look at the camera to mark your attendance</p>
        </div>

        {/* Camera card */}
        <div className="card relative overflow-hidden">
          {/* Video */}
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video mb-6">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />

            {/* Scanning overlay */}
            <AnimatePresence>
              {status === STATUS.SCANNING && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/60"
                >
                  {countdown ? (
                    <motion.span
                      key={countdown}
                      initial={{ scale: 2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-7xl font-bold text-white"
                    >
                      {countdown}
                    </motion.span>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin" />
                      <p className="text-white text-sm font-medium">Analyzing face...</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success overlay */}
            <AnimatePresence>
              {status === STATUS.SUCCESS && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-present/20 backdrop-blur-sm"
                >
                  <CheckCircle size={64} className="text-present mb-3" />
                  <p className="text-white font-bold text-xl">Attendance Marked!</p>
                  <p className="text-slate-300 text-sm mt-1">
                    Confidence: {Math.round((resultData?.confidence ?? 0) * 100)}%
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Failed overlay */}
            <AnimatePresence>
              {status === STATUS.FAILED && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-absent/20 backdrop-blur-sm"
                >
                  <XCircle size={64} className="text-absent mb-3" />
                  <p className="text-white font-bold text-xl">Face Not Recognized</p>
                  <p className="text-slate-300 text-sm mt-1">Please try again or contact admin</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Face frame guide */}
            {(status === STATUS.IDLE || status === STATUS.SCANNING) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-56 border-2 border-primary-400/50 rounded-full" />
              </div>
            )}

            {/* Camera not ready */}
            {!cameraReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-card">
                <Camera size={40} className="text-slate-600 mb-2" />
                <p className="text-slate-500 text-sm">Starting camera...</p>
              </div>
            )}
          </div>

          {/* Student info */}
          <div className="flex items-center gap-3 mb-6 glass rounded-xl px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center flex-shrink-0 font-bold text-sm text-white">
              {currentUser?.displayName?.[0] ?? <User size={16} />}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{currentUser?.displayName ?? 'Student'}</p>
              <p className="text-xs text-slate-400">{currentUser?.email}</p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3">
            {status === STATUS.IDLE && (
              <button
                id="checkin-btn"
                onClick={handleCheckIn}
                disabled={!cameraReady}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Camera size={18} />
                Check In Now
              </button>
            )}
            {(status === STATUS.SUCCESS || status === STATUS.FAILED) && (
              <button id="checkin-retry" onClick={handleReset} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <RefreshCw size={16} />
                {status === STATUS.SUCCESS ? 'Check In Again' : 'Try Again'}
              </button>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 glass rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Instructions</p>
          <ul className="space-y-2 text-sm text-slate-400">
            {[
              'Ensure your face is clearly visible and well-lit',
              'Remove glasses or masks if recognition fails',
              'Look directly at the camera',
              'Stay still during the scanning process',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary-400 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageWrapper>
  );
}
