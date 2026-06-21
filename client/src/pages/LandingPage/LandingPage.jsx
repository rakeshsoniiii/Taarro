import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThreeBackground from '../../components/ThreeBackground/ThreeBackground';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #1a0a1e 0%, #0d0d14 60%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Three.js Background */}
      <ThreeBackground />

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: '10%', left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,62,108,0.12)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '15%', width: 250, height: 250, borderRadius: '50%', background: 'rgba(139,92,246,0.12)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} style={{ zIndex: 1 }}>
        <img src="/Taarro logo.png" alt="Taarro" style={{ height: 100, marginBottom: 16 }} />
        <h1 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: 'clamp(48px, 12vw, 80px)',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #ff3e6c, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
          marginBottom: 16,
        }}>
          Taarro
        </h1>
        <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.6)', maxWidth: 400, margin: '0 auto 16px' }}>
          Find your perfect match — nearby, by heart, and for life.
        </p>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', marginBottom: 48 }}>
          Dating • Matrimonial • Real-time Chat • Nearby Discovery
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.button
            className="btn btn-primary btn-lg"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/auth?mode=register')}
          >
            💝 Get Started Free
          </motion.button>
          <motion.button
            className="btn btn-secondary btn-lg"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/auth?mode=login')}
          >
            Sign In
          </motion.button>
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 64 }}>
          {['💘 Swipe & Match', '📍 Nearby Discovery', '💬 Real-time Chat', '🛕 Matrimonial Profiles', '🔒 Privacy First'].map((f) => (
            <motion.span
              key={f}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 999,
                fontSize: 13,
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              {f}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
