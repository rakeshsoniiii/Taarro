require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');

const socketHandler = require('./socket/socketHandler');
const seedDB = require('./config/seed');
const { db, setUseMongo } = require('./config/dbAdapter');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const discoverRoutes = require('./routes/discover');
const swipeRoutes = require('./routes/swipe');
const matchRoutes = require('./routes/matches');
const featureRoutes = require('./routes/features');

const app = express();
const httpServer = http.createServer(app);

// Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible in routes
app.set('io', io);
socketHandler(io);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/swipe', swipeRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/features', featureRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), db: mongoose.connection.readyState === 1 ? 'MongoDB' : 'in-memory' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server error' });
});

// Connect to MongoDB or fall back to in-memory
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB');
    setUseMongo(true);
    
    // Seed the database with mock data if empty
    await seedDB();
    return { useMongo: true };
  } catch (error) {
    console.warn('⚠️ MongoDB not available, using in-memory database:', error.message);
    console.log('✅ Using in-memory database');
    setUseMongo(false);
    return { useMongo: false };
  }
};

const PORT = process.env.PORT || 5000;
connectDB().then(({ useMongo }) => {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Taarro server running on port ${PORT}`);
    console.log(`📦 Using ${useMongo ? 'MongoDB' : 'in-memory'} database`);
    console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  });
});
