import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const API_BASE = 'http://localhost:5000';

const MatchItem = ({ match, isActive, onClick }) => {
  const u = match.matchedUser;
  const photoUrl = u?.photos?.[0] ? `${API_BASE}${u.photos[0]}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || 'U')}&background=8b5cf6&color=fff`;
  return (
    <div className={`match-list-item ${isActive ? 'active' : ''}`} onClick={onClick}>
      <img src={photoUrl} alt={u?.name} className="avatar" style={{ width: 52, height: 52 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{u?.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {match.lastMessage?.text || 'Say hello! 👋'}
        </div>
      </div>
      {match.updatedAt && (
        <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
          {formatDistanceToNow(new Date(match.updatedAt), { addSuffix: false })}
        </span>
      )}
    </div>
  );
};

export default function Chat() {
  const { matchId: paramMatchId } = useParams();
  const [matches, setMatches] = useState([]);
  const [activeMatchId, setActiveMatchId] = useState(paramMatchId || null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(!paramMatchId);
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const activeMatch = matches.find(m => m._id === activeMatchId);

  // Fetch all matches
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

  // Fetch messages when match changes
  useEffect(() => {
    if (!activeMatchId) return;
    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/matches/${activeMatchId}/messages`);
        setMessages(data.messages || []);
      } catch {}
    };
    fetchMessages();
    // Join socket room
    if (socket) {
      socket.emit('join_match', { matchId: activeMatchId });
      return () => socket.emit('leave_match', { matchId: activeMatchId });
    }
  }, [activeMatchId, socket]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;
    const handleMessage = (msg) => {
      if (msg.match === activeMatchId) {
        setMessages(prev => [...prev, msg]);
      }
      setMatches(prev => prev.map(m => m._id === msg.match ? { ...m, lastMessage: msg } : m));
    };
    const handleTyping = () => setIsTyping(true);
    const handleStopTyping = () => setIsTyping(false);

    socket.on('receive_message', handleMessage);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);
    return () => {
      socket.off('receive_message', handleMessage);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
    };
  }, [socket, activeMatchId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim() || !socket || !activeMatchId) return;
    socket.emit('send_message', { matchId: activeMatchId, text: text.trim() });
    setText('');
    socket.emit('stop_typing', { matchId: activeMatchId });
  };

  const handleTypingInput = (e) => {
    setText(e.target.value);
    if (socket && activeMatchId) {
      socket.emit('typing', { matchId: activeMatchId });
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => socket.emit('stop_typing', { matchId: activeMatchId }), 1500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const selectMatch = (matchId) => {
    setActiveMatchId(matchId);
    setShowSidebar(false);
    navigate(`/chat/${matchId}`);
  };

  const otherUser = activeMatch?.matchedUser;
  const otherPhotoUrl = otherUser?.photos?.[0]
    ? `${API_BASE}${otherUser.photos[0]}`
    : otherUser ? `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}&background=8b5cf6&color=fff` : null;

  return (
    <div className="chat-layout">
      {/* Sidebar */}
      <div className={`chat-sidebar ${showSidebar ? 'show' : ''}`}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Messages</h2>
          <span className="badge badge-primary">{matches.length}</span>
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
        ) : matches.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}>
            <div style={{ fontSize: 40 }}>💬</div>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: 14 }}>No matches yet.<br />Start swiping to find your match!</p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/discover')}>Discover People</button>
          </div>
        ) : (
          matches.map(m => (
            <MatchItem key={m._id} match={m} isActive={m._id === activeMatchId} onClick={() => selectMatch(m._id)} />
          ))
        )}
      </div>

      {/* Main chat area */}
      <div className="chat-main">
        {!activeMatchId ? (
          <div className="empty-state" style={{ height: '100%' }}>
            <div className="empty-state-icon">💬</div>
            <h3 className="empty-state-title">Select a match</h3>
            <p className="empty-state-text">Choose someone from your matches list to start chatting.</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-secondary)' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowSidebar(true); navigate('/chat'); }} style={{ padding: 8 }}>
                <ArrowLeft size={20} />
              </button>
              {otherPhotoUrl && <img src={otherPhotoUrl} alt={otherUser?.name} className="avatar" style={{ width: 44, height: 44 }} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{otherUser?.name}</div>
                {isTyping ? (
                  <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.2 }} style={{ fontSize: 12, color: 'var(--primary)' }}>
                    typing...
                  </motion.div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{otherUser?.city || 'Matched with you 💕'}</div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, padding: '40px 0' }}>
                  You matched with {otherUser?.name}! 💕<br />Say hello!
                </div>
              )}
              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isMine = msg.sender === user?._id || msg.sender?._id === user?._id;
                  return (
                    <motion.div
                      key={msg._id}
                      className={`message-bubble ${isMine ? 'message-mine' : 'message-theirs'}`}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                    >
                      {msg.text}
                      <div style={{ fontSize: 10, marginTop: 4, opacity: 0.6, textAlign: isMine ? 'right' : 'left' }}>
                        {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : ''}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-area">
              <textarea
                className="chat-input"
                placeholder={`Message ${otherUser?.name}...`}
                value={text}
                onChange={handleTypingInput}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <motion.button
                className="send-btn"
                onClick={handleSend}
                disabled={!text.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send size={20} />
              </motion.button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
