import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { MapPin, GraduationCap, Briefcase, Heart, X, Star } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

export default function SwipeCard({ profile, onSwipe, style, isTop }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [0, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [-80, 0], [1, 0]);
  const superOpacity = useTransform(y, [-80, 0], [1, 0]);
  const controls = useAnimation();
  const [photoIdx, setPhotoIdx] = useState(0);

  const handleDragEnd = async (_, info) => {
    const { offset, velocity } = info;
    const swipeX = Math.abs(offset.x);
    const swipeY = offset.y;
    const speed = Math.abs(velocity.x);

    if (swipeX > 120 || speed > 500) {
      const dir = offset.x > 0 ? 1 : -1;
      await controls.start({ x: dir * 600, opacity: 0, transition: { duration: 0.3 } });
      onSwipe(dir > 0 ? 'like' : 'dislike');
    } else if (swipeY < -120) {
      await controls.start({ y: -600, opacity: 0, transition: { duration: 0.3 } });
      onSwipe('superlike');
    } else {
      controls.start({ x: 0, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } });
    }
  };

  const photos = profile.photos?.length ? profile.photos : [];
  const photoUrl = photos[photoIdx]
    ? `${API_BASE}${photos[photoIdx]}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&size=400&background=ff3e6c&color=fff&bold=true`;

  const age = profile.age || (profile.dateOfBirth
    ? Math.floor((Date.now() - new Date(profile.dateOfBirth)) / (1000 * 60 * 60 * 24 * 365.25))
    : null);

  return (
    <motion.div
      className="swipe-card"
      style={{ x, y, rotate, opacity, ...style }}
      drag={isTop ? true : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      animate={controls}
      whileHover={isTop ? { scale: 1.01 } : {}}
    >
      {/* Photo */}
      <img src={photoUrl} alt={profile.name} className="swipe-card-img" draggable={false} />

      {/* Photo nav dots */}
      {photos.length > 1 && (
        <div style={{ position: 'absolute', top: 12, left: 0, right: 0, display: 'flex', gap: 4, justifyContent: 'center' }}>
          {photos.map((_, i) => (
            <div
              key={i}
              onClick={(e) => { e.stopPropagation(); setPhotoIdx(i); }}
              style={{
                height: 3, width: i === photoIdx ? 28 : 16,
                borderRadius: 999,
                background: i === photoIdx ? 'white' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.3s',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      )}

      {/* Photo tap zones */}
      {photos.length > 1 && (
        <>
          <div style={{ position: 'absolute', left: 0, top: 0, width: '40%', height: '80%', cursor: 'pointer' }} onClick={() => setPhotoIdx(i => Math.max(0, i - 1))} />
          <div style={{ position: 'absolute', right: 0, top: 0, width: '40%', height: '80%', cursor: 'pointer' }} onClick={() => setPhotoIdx(i => Math.min(photos.length - 1, i + 1))} />
        </>
      )}

      {/* Gradient overlay */}
      <div className="swipe-card-gradient" />

      {/* Stamp overlays */}
      {isTop && (
        <>
          <motion.div className="swipe-stamp stamp-like" style={{ opacity: likeOpacity }}>LIKE 💚</motion.div>
          <motion.div className="swipe-stamp stamp-nope" style={{ opacity: nopeOpacity }}>NOPE 💔</motion.div>
          <motion.div className="swipe-stamp stamp-super" style={{ opacity: superOpacity }}>SUPER ⭐</motion.div>
        </>
      )}

      {/* Profile Info */}
      <div className="swipe-card-info">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div className="swipe-card-name">{profile.name}{age && `, ${age}`}</div>
            <div className="swipe-card-meta" style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
              {(profile.city || profile.distanceKm) && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} />
                  {profile.city}{profile.distanceKm ? ` • ${profile.distanceKm} km away` : ''}
                </span>
              )}
              {profile.occupation && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Briefcase size={12} /> {profile.occupation}
                </span>
              )}
              {profile.education && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <GraduationCap size={12} /> {profile.education}
                </span>
              )}
              {profile.religion && (
                <span style={{ fontSize: 12, opacity: 0.7 }}>🛕 {profile.religion}{profile.maritalStatus ? ` • ${profile.maritalStatus.replace('_', ' ')}` : ''}</span>
              )}
            </div>
          </div>
          {profile.bio && (
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', maxWidth: 200, textAlign: 'right', fontStyle: 'italic' }}>
              "{profile.bio.slice(0, 60)}{profile.bio.length > 60 ? '...' : ''}"
            </div>
          )}
        </div>
        {profile.hobbies?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            {profile.hobbies.slice(0, 3).map(h => (
              <span key={h} style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.15)', fontSize: 11, color: 'white' }}>
                {h}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
