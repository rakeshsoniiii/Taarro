import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar/Navbar';
import BottomNav from './components/BottomNav/BottomNav';
import LandingPage from './pages/LandingPage/LandingPage';
import AuthPage from './pages/AuthPage/AuthPage';
import SetupProfile from './pages/SetupProfile/SetupProfile';
import Discover from './pages/Discover/Discover';
import Matches from './pages/Matches/Matches';
import Chat from './pages/Chat/Chat';
import Profile from './pages/Profile/Profile';
import NearbyMap from './pages/NearbyMap/NearbyMap';
import Stories from './pages/Stories/Stories';
import Communities from './pages/Communities/Communities';
import './index.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (user) return <Navigate to="/discover" replace />;
  return children;
};

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      {children}
      {user && <BottomNav />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1a1a2e',
                color: '#f0f0f8',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
              },
            }}
          />
          <AppLayout>
            <Routes>
              <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
              <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
              <Route path="/setup" element={<PrivateRoute><SetupProfile /></PrivateRoute>} />
              <Route path="/discover" element={<PrivateRoute><Discover /></PrivateRoute>} />
              <Route path="/stories" element={<PrivateRoute><Stories /></PrivateRoute>} />
              <Route path="/matches" element={<PrivateRoute><Matches /></PrivateRoute>} />
              <Route path="/chat/:matchId?" element={<PrivateRoute><Chat /></PrivateRoute>} />
              <Route path="/communities" element={<PrivateRoute><Communities /></PrivateRoute>} />
              <Route path="/nearby" element={<PrivateRoute><NearbyMap /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
