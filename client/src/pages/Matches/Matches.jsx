import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Heart, Calendar, Sparkles, Users } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { API_BASE } from '../../config';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loveScores, setLoveScores] = useState({});
  const navigate = useNavigate();

  const getLoveScore = async (match) => {
    if (loveScores[match._id]) return;
    try {
      const { data } = await api.post('/features/ai/love-score', {
        user1Id: match._id,
        user2Id: match.matchedUser._id
      });
      setLoveScores(prev => ({ ...prev, [match._id]: data }));
    } catch (err) {
      console.error('Failed to get love score', err);
    }
  };

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
                  
                  {/* Match Actions */}
                  <div style={{ padding: '10px 12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button 
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, minWidth: 'auto', fontSize: '11px' }}
                      onClick={(e) => { e.stopPropagation(); getLoveScore(match); }}
                    >
                      <Sparkles size={12} /> Love Score
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, minWidth: 'auto', fontSize: '11px' }}
                      onClick={(e) => { e.stopPropagation(); toast.success('Anniversary feature coming soon!'); }}
                    >
                      <Calendar size={12} /> Anniversary
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, minWidth: 'auto', fontSize: '11px' }}
                      onClick={(e) => { e.stopPropagation(); toast.success('Couple Dashboard coming soon!'); }}
                    >
                      <Users size={12} /> Dashboard
                    </button>
                  </div>

                  {/* Love Score Display */}
                  {loveScores[match._id] && (
                    <div style={{ 
                      padding: '12px', 
                      background: 'var(--bg-elevated)', 
                      borderTop: '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700' }}>{loveScores[match._id].loveType}</span>
                        <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>
                          {loveScores[match._id].romanticPercentage}%
                        </span>
                      </div>
                      <div style={{ 
                        height: '8px', 
                        background: 'var(--border)', 
                        borderRadius: '999px',
                        overflow: 'hidden'
                      }}>
                        <motion.div 
                          style={{ 
                            height: '100%', 
                            background: 'linear-gradient(90deg, #ff3e6c, #8b5cf6)',
                            width: `${loveScores[match._id].romanticPercentage}%`
                          }} 
                          initial={{ width: 0 }} 
                          animate={{ width: `${loveScores[match._id].romanticPercentage}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
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
