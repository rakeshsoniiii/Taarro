# BuddyUps 💕

A **full-stack matrimonial & dating app** like Tinder, built with React, Node.js/Express, MongoDB, and Socket.IO.

## Features

- 💘 **Tinder-style swipe cards** with Framer Motion drag physics
- 📍 **Nearby discovery** using MongoDB 2dsphere geospatial queries
- 💬 **Real-time chat** powered by Socket.IO with typing indicators
- 💝 **Match animations** when two users like each other
- 🛕 **Full matrimonial profile** — religion, caste, education, income, family type
- 📸 **Multi-photo upload** (up to 6 photos)
- 🗺️ **Map view** of nearby users (fuzzy location for privacy)
- 🔒 **JWT authentication** with secure HTTP-only cookies
- ⭐ **Super Like** and rewind/undo functionality
- 🎯 **Smart filters** — age, gender, religion, distance

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Animations | Framer Motion |
| Real-time | Socket.IO |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Maps | Leaflet.js |
| Uploads | Multer (local) |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 7.0

### 1. Start MongoDB

```bash
# Windows (after installing MongoDB)
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath C:\data\db
```

Or if you have MongoDB as a service:
```bash
net start MongoDB
```

### 2. Start the Backend

```bash
cd server
npm install
npm run dev   # uses nodemon for auto-reload
```

Server runs at: `http://localhost:5000`

### 3. Start the Frontend

```bash
cd client
npm install
npm run dev
```

App runs at: `http://localhost:5173`

## Environment Variables

### server/.env
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/buddyups
JWT_SECRET=your_secret_here
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### client/.env
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/discover | Get nearby profiles |
| GET | /api/discover/nearby-map | Get users for map |
| POST | /api/swipe | Like/dislike/superlike |
| GET | /api/matches | Get all matches |
| GET | /api/matches/:id/messages | Get chat messages |
| PUT | /api/users/profile | Update profile |
| PUT | /api/users/location | Update GPS location |
| POST | /api/users/photos | Upload photo |

## Project Structure

```
BuddyUps/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/   # SwipeCard, MatchModal, Navbar, BottomNav
│       ├── context/      # AuthContext, SocketContext
│       ├── pages/        # All pages
│       └── services/     # API axios instance
└── server/          # Node.js backend
    ├── models/       # User, Swipe, Match, Message
    ├── routes/       # auth, users, discover, swipe, matches
    ├── middleware/   # JWT auth, Multer upload
    └── socket/       # Socket.IO handler
```
# DarkFantacy
