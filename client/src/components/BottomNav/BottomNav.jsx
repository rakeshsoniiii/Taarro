import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Heart, MessageCircle, MapPin, User, Flame, BookOpen, Users } from 'lucide-react';

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
      <NavItem icon={BookOpen} label="Stories" path="/stories" current={pathname} />
      <NavItem icon={Heart} label="Matches" path="/matches" current={pathname} />
      <NavItem icon={Users} label="Communities" path="/communities" current={pathname} />
      <NavItem icon={User} label="Profile" path="/profile" current={pathname} />
    </nav>
  );
}
