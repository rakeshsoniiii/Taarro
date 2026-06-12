import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Star, RotateCcw, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import SwipeCard from '../../components/SwipeCard/SwipeCard';
import MatchModal from '../../components/MatchModal/MatchModal';

export default function Discover() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);
  const [matchId, setMatchId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const historyRef = useRef([]);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/discover');
      setProfiles(data.users || []);
    } catch (err) {
      toast.error('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  useEffect(() => {
    if (!socket) return;
    const handleMatch = ({ matchId: mId, user: matchUser }) => {
      setMatchedUser(matchUser);
      setMatchId(mId);
    };
    socket.on('new_match', handleMatch);
    return () => socket.off('new_match', handleMatch);
  }, [socket]);

  const handleSwipe = async (action) => {
    if (swiping || profiles.length === 0) return;
    const profile = profiles[profiles.length - 1];
    setSwiping(true);

    try {
      const { data } = await api.post('/swipe', { targetUserId: profile._id, action });
      historyRef.current.push({ profile, action });

      // Remove from stack
      setProfiles(prev => prev.slice(0, -1));

      if (data.matched && action !== 'dislike') {
        setMatchedUser(profile);
        setMatchId(data.matchId);
      } else if (action === 'like') {
        toast('💚 Liked!', { icon: null, duration: 1000 });
      } else if (action === 'superlike') {
        toast('⭐ Super liked!', { icon: null, duration: 1000 });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error swiping');
    } finally {
      setSwiping(false);
    }
  };

  const handleRewind = () => {
    const last = historyRef.current.pop();
    if (last) {
      setProfiles(prev => [...prev, last.profile]);
    }
  };

  const topProfile = profiles[profiles.length - 1];

  return (
    <div className="page">
      <div className="page-content">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Outfit' }}>Discover</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {profiles.length} {profiles.length === 1 ? 'person' : 'people'} nearby
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowFilter(!showFilter)} style={{ gap: 6 }}>
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>

        {/* Card Stack */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="spinner" style={{ width: 48, height: 48 }} />
          </div>
        ) : profiles.length === 0 ? (
          <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="empty-state-icon">🌸</div>
            <h3 className="empty-state-title">No more profiles!</h3>
            <p className="empty-state-text">Check back later or adjust your filters to discover more people.</p>
            <button className="btn btn-primary" onClick={fetchProfiles}>Refresh</button>
          </motion.div>
        ) : (
          <div className="swipe-stack">
            <AnimatePresence>
              {profiles.slice(-3).map((profile, idx, arr) => (
                <SwipeCard
                  key={profile._id}
                  profile={profile}
                  isTop={idx === arr.length - 1}
                  onSwipe={handleSwipe}
                  style={{
                    scale: 1 - (arr.length - 1 - idx) * 0.04,
                    y: (arr.length - 1 - idx) * 10,
                    zIndex: idx,
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Action Buttons */}
        {!loading && profiles.length > 0 && (
          <motion.div className="swipe-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <button className="action-btn action-btn-rewind" onClick={handleRewind} title="Rewind">
              <RotateCcw size={22} />
            </button>
            <button className="action-btn action-btn-dislike" onClick={() => handleSwipe('dislike')} disabled={swiping} title="Pass">
              <X size={28} />
            </button>
            <button className="action-btn action-btn-like" onClick={() => handleSwipe('like')} disabled={swiping} title="Like">
              <Heart size={32} />
            </button>
            <button className="action-btn action-btn-super" onClick={() => handleSwipe('superlike')} disabled={swiping} title="Super Like">
              <Star size={22} />
            </button>
          </motion.div>
        )}

        {/* Profile tip */}
        {!loading && profiles.length > 0 && (
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
            Swipe right to like • Left to pass • Up for super like
          </p>
        )}
      </div>

      {/* Filter Drawer */}
      {showFilter && (
        <>
          <div className="filter-overlay" onClick={() => setShowFilter(false)} />
          <div className="filter-drawer open">
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Filters</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Update your preferences in your <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Profile Settings</button> to refine your discover feed.
            </p>
            <button className="btn btn-primary w-full" style={{ marginTop: 32 }} onClick={() => { setShowFilter(false); fetchProfiles(); }}>
              Apply & Refresh
            </button>
          </div>
        </>
      )}

      {/* Match Modal */}
      <MatchModal
        matchedUser={matchedUser}
        onClose={() => setMatchedUser(null)}
        onMessage={() => { navigate(`/chat/${matchId}`); setMatchedUser(null); }}
      />
    </div>
  );
}
