const db = require('../config/db');
const jwt = require('jsonwebtoken');

const socketHandler = (io) => {
  // Middleware: authenticate socket connections
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Authentication error'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = db.findUserById(decoded.id);
      if (!user) return next(new Error('User not found'));

      const { password, ...safeUser } = user;
      socket.user = safeUser;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.user.name} (${socket.user._id})`);

    // Join user's personal room (for match notifications)
    socket.join(socket.user._id.toString());

    // Update last seen
    db.updateUser(socket.user._id, { lastSeen: new Date() });

    // ── Join a match/chat room ──────────────────────────
    socket.on('join_match', ({ matchId }) => {
      try {
        if (db.isMatchParticipant(matchId, socket.user._id)) {
          socket.join(`match_${matchId}`);
          console.log(`✅ ${socket.user.name} joined room match_${matchId}`);
        }
      } catch (err) {
        console.error('join_match error:', err);
      }
    });

    // ── Leave a match/chat room ────────────────────────
    socket.on('leave_match', ({ matchId }) => {
      socket.leave(`match_${matchId}`);
    });

    // ── Send a message ─────────────────────────────────
    socket.on('send_message', ({ matchId, text }) => {
      try {
        if (!text || !text.trim()) return;

        if (!db.isMatchParticipant(matchId, socket.user._id)) return;

        const message = db.createMessage(matchId, socket.user._id, text.trim());

        // Broadcast to match room
        io.to(`match_${matchId}`).emit('receive_message', {
          _id: message._id,
          match: matchId,
          sender: socket.user._id,
          text: message.text,
          createdAt: message.createdAt,
          read: false,
        });
      } catch (err) {
        console.error('send_message error:', err);
      }
    });

    // ── Typing indicator ──────────────────────────────
    socket.on('typing', ({ matchId }) => {
      socket.to(`match_${matchId}`).emit('user_typing', { userId: socket.user._id });
    });

    socket.on('stop_typing', ({ matchId }) => {
      socket.to(`match_${matchId}`).emit('user_stop_typing', { userId: socket.user._id });
    });

    // ── Disconnect ─────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.user.name}`);
      db.updateUser(socket.user._id, { lastSeen: new Date() });
    });
  });
};

module.exports = socketHandler;
