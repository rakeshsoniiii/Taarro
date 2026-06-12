import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:5000';

export default function MatchModal({ matchedUser, onClose, onMessage }) {
  if (!matchedUser) return null;

  const photoUrl = matchedUser.photos?.[0]
    ? `${API_BASE}${matchedUser.photos[0]}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(matchedUser.name)}&background=8b5cf6&color=fff`;

  return (
    <AnimatePresence>
      <motion.div
        className="match-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="match-modal"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sparkles */}
          {['✨', '💫', '⭐', '✨'].map((s, i) => (
            <motion.span
              key={i}
              style={{ position: 'absolute', fontSize: 28, left: `${15 + i * 20}%`, top: `${10 + (i % 2) * 10}%` }}
              animate={{ y: [-10, 10, -10], rotate: [0, 20, -20, 0] }}
              transition={{ repeat: Infinity, duration: 2 + i * 0.3 }}
            >
              {s}
            </motion.span>
          ))}

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            transition={{ delay: 0.1, duration: 0.5 }}
            style={{ fontSize: 72, marginBottom: 8 }}
          >
            💕
          </motion.div>

          <motion.h2
            className="match-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            It's a Match!
          </motion.h2>
          <motion.p
            className="match-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            You and {matchedUser.name} liked each other 💝
          </motion.p>

          <motion.img
            src={photoUrl}
            alt={matchedUser.name}
            className="match-avatar"
            style={{ width: 140, height: 140, margin: '0 auto 32px', border: '4px solid', borderImage: 'linear-gradient(135deg, #ff3e6c, #8b5cf6) 1' }}
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <motion.button
              className="btn btn-primary btn-lg w-full"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onMessage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              💬 Send a Message
            </motion.button>
            <motion.button
              className="btn btn-secondary w-full"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Keep Swiping
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
