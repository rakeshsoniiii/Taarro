import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Camera, Edit3, X, LogOut, Settings, MapPin, GraduationCap, Briefcase, Heart, Sparkles, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5000';

const InfoRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,62,108,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={16} style={{ color: 'var(--primary)' }} />
      </div>
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 500, marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
};

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: user?.bio || '', city: user?.city || '' });
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showAIBio, setShowAIBio] = useState(false);
  const [aiBioForm, setAiBioForm] = useState({ interests: '', profession: user?.occupation || '' });
  const [aiBioResult, setAiBioResult] = useState(null);
  const [showPhotoRating, setShowPhotoRating] = useState(false);
  const [photoRatings, setPhotoRatings] = useState([]);
  const [generating, setGenerating] = useState(false);
  const fileRef = useRef();
  const navigate = useNavigate();

  const age = user?.dateOfBirth
    ? Math.floor((Date.now() - new Date(user.dateOfBirth)) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  const mainPhoto = user?.photos?.[0]
    ? `${API_BASE}${user.photos[0]}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=ff3e6c&color=fff&size=400`;

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', form);
      updateUser(data.user);
      setEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);
    setUploadingPhoto(true);
    try {
      const { data } = await api.post('/users/photos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(data.user);
      toast.success('Photo updated!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (idx) => {
    try {
      const { data } = await api.delete(`/users/photos/${idx}`);
      updateUser(data.user);
      toast.success('Photo removed');
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const generateBio = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post('/features/ai/generate-bio', {
        interests: aiBioForm.interests.split(',').map(s => s.trim()).filter(Boolean),
        profession: aiBioForm.profession
      });
      setAiBioResult(data);
    } catch (err) {
      toast.error('Failed to generate bio');
    } finally {
      setGenerating(false);
    }
  };

  const ratePhotos = async () => {
    try {
      const { data } = await api.post('/features/ai/rate-photos', { photos: user.photos });
      setPhotoRatings(data.ratings);
      setShowPhotoRating(true);
    } catch (err) {
      toast.error('Failed to rate photos');
    }
  };

  // Completion percentage
  const fields = [user?.bio, user?.photos?.[0], user?.religion, user?.education, user?.occupation, user?.city, user?.location?.coordinates?.[0] !== 0];
  const completion = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  return (
    <div className="page">
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        {/* Hero Photo */}
        <div style={{ position: 'relative', height: 340, overflow: 'hidden' }}>
          <img src={mainPhoto} alt={user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, var(--bg-primary) 100%)' }} />

          {/* Upload photo button */}
          <button
            onClick={() => fileRef.current?.click()}
            style={{ position: 'absolute', top: 80, right: 16, width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer' }}
          >
            {uploadingPhoto ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <Camera size={18} />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />

          {/* Name + age */}
          <div style={{ position: 'absolute', bottom: 24, left: 20 }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, fontFamily: 'Outfit', color: 'white', lineHeight: 1 }}>
              {user?.name}{age ? `, ${age}` : ''}
            </h1>
            {user?.city && <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {user.city}</p>}
          </div>
        </div>

        <div style={{ padding: '0 20px 100px' }}>
          {/* Profile completion bar */}
          <div style={{ margin: '20px 0', padding: '16px', background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
              <span>Profile Completion</span>
              <span style={{ color: completion === 100 ? 'var(--success)' : 'var(--primary)' }}>{completion}%</span>
            </div>
            <div style={{ height: 6, background: 'var(--border)', borderRadius: 999 }}>
              <motion.div style={{ height: '100%', borderRadius: 999, background: 'var(--gradient-primary)', width: `${completion}%` }} initial={{ width: 0 }} animate={{ width: `${completion}%` }} transition={{ duration: 1 }} />
            </div>
            {completion < 100 && (
              <button onClick={() => navigate('/setup')} style={{ marginTop: 10, fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Complete your profile →
              </button>
            )}
          </div>

          {/* Photo Grid */}
          {user?.photos?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>My Photos</h3>
                <button className="btn btn-primary btn-sm" onClick={ratePhotos}>
                  <Star size={14} /> Rate Photos
                </button>
              </div>
              <div className="photo-grid">
                {user.photos.map((p, i) => (
                  <div key={i} className="photo-slot" style={{ cursor: 'default' }}>
                    <img src={`${API_BASE}${p}`} alt={`Photo ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button className="photo-remove" onClick={() => handleDeletePhoto(i)}><X size={12} /></button>
                  </div>
                ))}
              </div>

              {showPhotoRating && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '16px', 
                  background: 'var(--bg-elevated)', 
                  borderRadius: '12px',
                  border: '1px solid var(--border)'
                }}>
                  <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '700' }}>Photo Ratings</h4>
                  {photoRatings.map((rating, i) => (
                    <div key={i} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      padding: '8px 0',
                      borderBottom: i < photoRatings.length - 1 ? '1px solid var(--border)' : 'none'
                    }}>
                      <img 
                        src={`${API_BASE}${rating.url}`} 
                        alt="photo" 
                        style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} 
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '600', color: 'var(--primary)' }}>
                            {'⭐'.repeat(rating.rating)}{'☆'.repeat(5 - rating.rating)}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{rating.suggestion}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bio Section */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>About Me</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAIBio(!showAIBio)}>
                  <Sparkles size={14} /> AI Bio
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => editing ? handleSave() : setEditing(true)}>
                  {saving ? '...' : editing ? '✓ Save' : <><Edit3 size={14} /> Edit</>}
                </button>
              </div>
            </div>
            
            {showAIBio && (
              <div style={{ 
                marginBottom: '12px', 
                padding: '16px', 
                background: 'var(--bg-elevated)', 
                borderRadius: '12px',
                border: '1px solid var(--border)'
              }}>
                <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '700' }}>Generate Bio</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="Your profession (e.g., Software Engineer)"
                    value={aiBioForm.profession}
                    onChange={(e) => setAiBioForm(f => ({ ...f, profession: e.target.value }))}
                  />
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="Interests (comma separated, e.g., Hiking, Reading, Cooking)"
                    value={aiBioForm.interests}
                    onChange={(e) => setAiBioForm(f => ({ ...f, interests: e.target.value }))}
                  />
                  <button className="btn btn-primary" onClick={generateBio} disabled={generating}>
                    {generating ? 'Generating...' : 'Generate Bio'}
                  </button>
                </div>
                
                {aiBioResult && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <h5 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Generated Bio</h5>
                      <p style={{ fontSize: '14px', lineHeight: '1.6' }}>{aiBioResult.bio}</p>
                      <button 
                        className="btn btn-primary btn-sm" 
                        style={{ marginTop: '8px' }} 
                        onClick={() => { setForm(f => ({ ...f, bio: aiBioResult.bio })); setShowAIBio(false); setEditing(true); }}
                      >
                        Use This Bio
                      </button>
                    </div>
                    
                    {aiBioResult.prompts && (
                      <div style={{ marginBottom: '12px' }}>
                        <h5 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Conversation Prompts</h5>
                        <ul style={{ fontSize: '14px', paddingLeft: '16px', margin: 0 }}>
                          {aiBioResult.prompts.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                      </div>
                    )}
                    
                    {aiBioResult.introductions && (
                      <div>
                        <h5 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Opening Lines</h5>
                        <ul style={{ fontSize: '14px', paddingLeft: '16px', margin: 0 }}>
                          {aiBioResult.introductions.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {editing ? (
              <textarea
                className="input"
                value={form.bio}
                onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Tell people about yourself..."
                maxLength={500}
              />
            ) : (
              <p style={{ color: user?.bio ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: 1.6 }}>
                {user?.bio || 'No bio yet. Add one to get more matches!'}
              </p>
            )}
          </div>

          {/* Info rows */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Details</h3>
            <InfoRow icon={GraduationCap} label="Education" value={user?.education} />
            <InfoRow icon={Briefcase} label="Occupation" value={user?.occupation} />
            <InfoRow icon={Heart} label="Looking for" value={user?.maritalStatus?.replace('_', ' ')} />
            <InfoRow icon={MapPin} label="Location" value={user?.city && user?.state ? `${user.city}, ${user.state}` : user?.city} />
            {user?.religion && <InfoRow icon={() => '🛕'} label="Religion" value={user.religion} />}
            {user?.annualIncome && <InfoRow icon={() => '💰'} label="Income" value={user.annualIncome} />}
            {user?.height && <InfoRow icon={() => '📏'} label="Height" value={`${user.height} cm`} />}
          </div>

          {/* Hobbies */}
          {user?.hobbies?.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Interests</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {user.hobbies.map(h => (
                  <span key={h} className="badge badge-secondary">{h}</span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="btn btn-secondary w-full" onClick={() => navigate('/setup')}>
              <Settings size={16} /> Edit Full Profile
            </button>
            <button className="btn w-full" onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
              <LogOut size={16} /> Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
