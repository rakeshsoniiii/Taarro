import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Heart } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5000';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const { data } = await api.get('/matches');
        setMatches(data.matches || []);
      } catch { toast.error('Failed to load matches'); }
      finally { setLoading(false); }
    };
    fetchMatches();
  }, []);

  return (
    <div className="page">
      <div className="page-content">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Outfit' }}>💝 Your Matches</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{matches.length} mutual connections</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 48, height: 48 }} /></div>
        ) : matches.length === 0 ? (
          <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="empty-state-icon">💔</div>
            <h3 className="empty-state-title">No matches yet</h3>
            <p className="empty-state-text">Keep swiping to find your perfect match!</p>
            <button className="btn btn-primary" onClick={() => navigate('/discover')}>
              <Heart size={16} /> Discover People
            </button>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
            {matches.map((match, i) => {
              const u = match.matchedUser;
              const photoUrl = u?.photos?.[0]
                ? `${API_BASE}${u.photos[0]}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || 'U')}&background=ff3e6c&color=fff&size=200`;

              return (
                <motion.div
                  key={match._id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card"
                  style={{ overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
                  onClick={() => navigate(`/chat/${match._id}`)}
                  whileHover={{ y: -4 }}
                >
                  <div style={{ position: 'relative', aspectRatio: '3/4' }}>
                    <img src={photoUrl} alt={u?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.9) 100%)' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'white' }}>{u?.name}</div>
                      {u?.city && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{u.city}</div>}
                    </div>
                    <div style={{ position: 'absolute', top: 8, right: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #ff3e6c, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MessageCircle size={16} color="white" />
                      </div>
                    </div>
                  </div>
                  {match.lastMessage && (
                    <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {match.lastMessage.text}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
