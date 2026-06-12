import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { MapPin } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

// Fix leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createUserIcon = (photoUrl, name) => {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:44px;height:44px;border-radius:50%;overflow:hidden;
      border:3px solid #ff3e6c;
      box-shadow:0 4px 16px rgba(255,62,108,0.5);
      background:#1a1a2e;
    ">
      <img src="${photoUrl}" style="width:100%;height:100%;object-fit:cover;" />
    </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
};

export default function NearbyMap() {
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myLocation, setMyLocation] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchNearby = async () => {
      try {
        const { data } = await api.get('/discover/nearby-map');
        setNearbyUsers(data.users || []);
        const coords = user?.location?.coordinates;
        if (coords && (coords[0] !== 0 || coords[1] !== 0)) {
          setMyLocation({ lat: coords[1], lng: coords[0] });
        }
      } catch {
        toast.error('Failed to load nearby users');
      } finally {
        setLoading(false);
      }
    };
    fetchNearby();
  }, [user]);

  const defaultCenter = myLocation || { lat: 20.5937, lng: 78.9629 }; // India

  return (
    <div className="page" style={{ paddingBottom: 0 }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={20} style={{ color: 'var(--primary)' }} /> Nearby
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {loading ? 'Loading...' : `${nearbyUsers.length} people within 50 km`}
          </p>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', background: 'rgba(255,62,108,0.08)', padding: '6px 12px', borderRadius: 999, border: '1px solid rgba(255,62,108,0.2)' }}>
          🔒 Fuzzy locations
        </div>
      </div>

      {/* Map */}
      <div className="map-container" style={{ height: 'calc(100vh - 140px - var(--bottom-nav-height))' }}>
        {!loading && (
          <MapContainer
            center={[defaultCenter.lat, defaultCenter.lng]}
            zoom={11}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com">CartoDB</a>'
            />

            {/* My location circle */}
            {myLocation && (
              <>
                <Circle
                  center={[myLocation.lat, myLocation.lng]}
                  radius={500}
                  pathOptions={{ color: '#ff3e6c', fillColor: '#ff3e6c', fillOpacity: 0.15, weight: 2 }}
                />
                <Marker
                  position={[myLocation.lat, myLocation.lng]}
                  icon={createUserIcon(
                    user?.photos?.[0] ? `${API_BASE}${user.photos[0]}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Me')}&background=ff3e6c&color=fff`,
                    'You'
                  )}
                >
                  <Popup>
                    <div className="map-user-popup">
                      <strong>📍 You are here</strong>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}

            {/* Nearby users */}
            {nearbyUsers.map((u) => {
              if (!u.fuzzedLocation) return null;
              const photoUrl = u.photos?.[0]
                ? `${API_BASE}${u.photos[0]}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=8b5cf6&color=fff`;
              return (
                <Marker
                  key={u._id}
                  position={[u.fuzzedLocation.lat, u.fuzzedLocation.lng]}
                  icon={createUserIcon(photoUrl, u.name)}
                >
                  <Popup>
                    <div className="map-user-popup" style={{ minWidth: 120 }}>
                      <img src={photoUrl} alt={u.name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ fontWeight: 700, color: '#f0f0f8', textAlign: 'center' }}>{u.name}</div>
                      {u.gender && <div style={{ fontSize: 12, color: '#a0a0b8', textTransform: 'capitalize' }}>{u.gender}</div>}
                      {u.city && <div style={{ fontSize: 12, color: '#a0a0b8' }}>📍 {u.city}</div>}
                      <div style={{ fontSize: 11, color: '#60607a', marginTop: 4 }}>Approximate location</div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div className="spinner" style={{ width: 48, height: 48 }} />
          </div>
        )}
      </div>
    </div>
  );
}
