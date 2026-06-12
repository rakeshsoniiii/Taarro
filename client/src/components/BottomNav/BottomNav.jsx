import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Heart, MessageCircle, MapPin, User, Flame } from 'lucide-react';

const NavItem = ({ icon: Icon, label, path, current }) => {
  const navigate = useNavigate();
  const isActive = current === path;
  return (
    <button className={`bottom-nav-item ${isActive ? 'active' : ''}`} onClick={() => navigate(path)}>
      <Icon size={22} />
      <span>{label}</span>
    </button>
  );
};

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="bottom-nav">
      <NavItem icon={Flame} label="Discover" path="/discover" current={pathname} />
      <NavItem icon={Heart} label="Matches" path="/matches" current={pathname} />
      <NavItem icon={MessageCircle} label="Chat" path="/chat" current={pathname} />
      <NavItem icon={MapPin} label="Nearby" path="/nearby" current={pathname} />
      <NavItem icon={User} label="Profile" path="/profile" current={pathname} />
    </nav>
  );
}
