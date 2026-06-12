import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out!');
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-logo" onClick={() => navigate('/discover')} style={{ cursor: 'pointer' }}>
        💕 BuddyUps
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user && (
          <>
            <img
              src={user.photos?.[0] ? `http://localhost:5000${user.photos[0]}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ff3e6c&color=fff`}
              alt={user.name}
              className="avatar"
              style={{ width: 36, height: 36, cursor: 'pointer' }}
              onClick={() => navigate('/profile')}
            />
            <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ padding: '8px' }}>
              <LogOut size={18} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
