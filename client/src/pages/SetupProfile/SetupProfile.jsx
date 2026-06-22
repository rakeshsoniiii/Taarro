import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Camera, X, MapPin, ChevronRight, ChevronLeft } from 'lucide-react';
import { API_BASE } from '../../config';

const STEPS = ['Basic Info', 'Location', 'Photos', 'Matrimonial', 'Preferences'];

const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Parsi', 'Jewish', 'No Religion', 'Other'];
const educations = ['High School', 'Some College', 'Bachelor\'s', 'Master\'s', 'PhD', 'Professional Degree (MD/JD)', 'Other'];
const occupations = ['Student', 'Engineer', 'Doctor', 'Teacher', 'Business Owner', 'Artist/Creative', 'Sales/Marketing', 'Finance', 'IT/Tech', 'Lawyer', 'Government', 'Other'];
const incomes = ['Below 3 LPA', '3-6 LPA', '6-10 LPA', '10-20 LPA', '20-40 LPA', '40+ LPA', 'Prefer not to say'];

export default function SetupProfile() {
  const { user, updateUser, refetch } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState(user?.photos || []);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [form, setForm] = useState({
    bio: user?.bio || '',
    religion: user?.religion || '',
    caste: user?.caste || '',
    motherTongue: user?.motherTongue || '',
    maritalStatus: user?.maritalStatus || 'never_married',
    height: user?.height || '',
    weight: user?.weight || '',
    education: user?.education || '',
    occupation: user?.occupation || '',
    annualIncome: user?.annualIncome || '',
    familyType: user?.familyType || '',
    diet: user?.diet || '',
    hobbies: user?.hobbies || [],
    city: user?.city || '',
    state: user?.state || '',
    preferences: user?.preferences || { ageMin: 22, ageMax: 35, distanceKm: 50, genders: ['male'], religions: [] },
  });

  const field = (name) => ({ name, value: form[name], onChange: (e) => setForm(f => ({ ...f, [name]: e.target.value })) });

  const updatePref = (key, val) => setForm(f => ({ ...f, preferences: { ...f.preferences, [key]: val } }));

  const detectLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`);
          const geo = await res.json();
          setForm(f => ({
            ...f,
            city: geo.address?.city || geo.address?.town || geo.address?.village || '',
            state: geo.address?.state || '',
          }));
          await api.put('/users/location', { longitude: coords.longitude, latitude: coords.latitude, city: geo.address?.city || '', state: geo.address?.state || '' });
          toast.success('Location detected!');
        } catch {
          toast.error('Could not get city name');
        } finally {
          setLoading(false);
        }
      },
      () => { toast.error('Location denied'); setLoading(false); }
    );
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);
    setUploadingPhoto(true);
    try {
      const { data } = await api.post('/users/photos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPhotos(data.user.photos);
      toast.success('Photo uploaded!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoDelete = async (index) => {
    try {
      const { data } = await api.delete(`/users/photos/${index}`);
      setPhotos(data.user.photos);
      toast.success('Photo removed');
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      // Final save
      setLoading(true);
      try {
        const { data } = await api.put('/users/profile', { ...form, profileComplete: true, profileCompletionStep: 5 });
        updateUser(data.user);
        toast.success('Profile complete! 🎉');
        navigate('/discover');
      } catch {
        toast.error('Failed to save profile');
      } finally {
        setLoading(false);
      }
    }
  };

  const saveStep = async () => {
    try {
      const { data } = await api.put('/users/profile', { ...form, profileCompletionStep: step + 1 });
      updateUser(data.user);
    } catch {}
  };

  const goNext = async () => { await saveStep(); handleNext(); };
  const goBack = () => setStep(s => Math.max(0, s - 1));

  const hobbiesOptions = ['Travelling', 'Reading', 'Cooking', 'Gaming', 'Fitness', 'Music', 'Dancing', 'Photography', 'Movies', 'Art', 'Cricket', 'Yoga'];
  const toggleHobby = (h) => setForm(f => ({ ...f, hobbies: f.hobbies.includes(h) ? f.hobbies.filter(x => x !== h) : [...f.hobbies, h] }));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: 40 }}>
      <div className="wizard-container">
        {/* Progress */}
        <div className="wizard-progress">
          {STEPS.map((_, i) => (
            <div key={i} className={`wizard-step-dot ${i <= step ? 'active' : ''}`} />
          ))}
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, fontFamily: 'Outfit' }}>
            {step === 0 && '👋 Tell us about you'}
            {step === 1 && '📍 Your Location'}
            {step === 2 && '📸 Your Photos'}
            {step === 3 && '🛕 Matrimonial Details'}
            {step === 4 && '💝 Your Preferences'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 14 }}>
            Step {step + 1} of {STEPS.length}
          </p>

          {/* ── Step 0: Basic ── */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label className="input-label">Bio</label>
                <textarea className="input" placeholder="Write something about yourself..." maxLength={500} value={form.bio} onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>{form.bio.length}/500</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Height (cm)</label>
                  <input className="input" type="number" placeholder="170" value={form.height} onChange={(e) => setForm(f => ({ ...f, height: e.target.value }))} />
                </div>
                <div className="input-group">
                  <label className="input-label">Weight (kg)</label>
                  <input className="input" type="number" placeholder="65" value={form.weight} onChange={(e) => setForm(f => ({ ...f, weight: e.target.value }))} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Marital Status</label>
                <select className="input" {...field('maritalStatus')}>
                  <option value="never_married">Never Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                  <option value="separated">Separated</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Diet</label>
                <select className="input" {...field('diet')}>
                  <option value="">Prefer not to say</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="non_vegetarian">Non-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                </select>
              </div>
            </div>
          )}

          {/* ── Step 1: Location ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <motion.button className="btn btn-secondary" onClick={detectLocation} disabled={loading} whileHover={{ scale: 1.02 }} style={{ padding: '16px', justifyContent: 'center', gap: 10 }}>
                <MapPin size={20} style={{ color: 'var(--primary)' }} />
                {loading ? 'Detecting...' : 'Auto-detect my location'}
              </motion.button>
              <div className="section-divider">or enter manually</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">City</label>
                  <input className="input" placeholder="Mumbai" {...field('city')} />
                </div>
                <div className="input-group">
                  <label className="input-label">State</label>
                  <input className="input" placeholder="Maharashtra" {...field('state')} />
                </div>
              </div>
              <div style={{ padding: 16, background: 'rgba(255,62,108,0.08)', borderRadius: 12, border: '1px solid rgba(255,62,108,0.2)', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                🔒 Your exact location is never shared. We only show distance to other users.
              </div>
            </div>
          )}

          {/* ── Step 2: Photos ── */}
          {step === 2 && (
            <div>
              <div className="photo-grid">
                {[0,1,2,3,4,5].map(i => (
                  <div key={i} className="photo-slot" onClick={() => { if (!photos[i]) document.getElementById('photo-upload').click(); }}>
                    {photos[i] ? (
                      <>
                        <img src={`${API_BASE}${photos[i]}`} alt={`Photo ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button className="photo-remove" onClick={(e) => { e.stopPropagation(); handlePhotoDelete(i); }}>
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
                        <Camera size={24} />
                        <span style={{ fontSize: 12 }}>{i === 0 ? 'Main Photo' : 'Add'}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <input id="photo-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
              {uploadingPhoto && <p style={{ textAlign: 'center', marginTop: 16, color: 'var(--text-secondary)' }}>Uploading...</p>}
              <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                Add up to 6 photos. First photo is your main profile photo.
              </p>
            </div>
          )}

          {/* ── Step 3: Matrimonial ── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label className="input-label">Religion</label>
                <select className="input" {...field('religion')}>
                  <option value="">Select</option>
                  {religions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Caste</label>
                  <input className="input" placeholder="Optional" {...field('caste')} />
                </div>
                <div className="input-group">
                  <label className="input-label">Mother Tongue</label>
                  <input className="input" placeholder="Hindi, Tamil..." {...field('motherTongue')} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Education</label>
                <select className="input" {...field('education')}>
                  <option value="">Select</option>
                  {educations.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Occupation</label>
                <select className="input" {...field('occupation')}>
                  <option value="">Select</option>
                  {occupations.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Annual Income</label>
                  <select className="input" {...field('annualIncome')}>
                    <option value="">Select</option>
                    {incomes.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Family Type</label>
                  <select className="input" {...field('familyType')}>
                    <option value="">Select</option>
                    <option value="nuclear">Nuclear</option>
                    <option value="joint">Joint</option>
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Hobbies & Interests</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {hobbiesOptions.map(h => (
                    <button key={h} type="button" onClick={() => toggleHobby(h)} style={{
                      padding: '6px 14px',
                      borderRadius: 999,
                      fontSize: 13,
                      border: '1px solid',
                      borderColor: form.hobbies.includes(h) ? 'var(--primary)' : 'var(--border)',
                      background: form.hobbies.includes(h) ? 'rgba(255,62,108,0.15)' : 'transparent',
                      color: form.hobbies.includes(h) ? 'var(--primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}>
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Preferences ── */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: 12 }}>
                  Age Range: {form.preferences.ageMin} — {form.preferences.ageMax} years
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="input-group">
                    <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Min Age</label>
                    <input className="input" type="number" min={18} max={80} value={form.preferences.ageMin} onChange={(e) => updatePref('ageMin', Number(e.target.value))} />
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Max Age</label>
                    <input className="input" type="number" min={18} max={80} value={form.preferences.ageMax} onChange={(e) => updatePref('ageMax', Number(e.target.value))} />
                  </div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Max Distance: {form.preferences.distanceKm} km</label>
                <input type="range" min={5} max={500} value={form.preferences.distanceKm} onChange={(e) => updatePref('distanceKm', Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
              </div>
              <div className="input-group">
                <label className="input-label">Show me</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['male', 'female', 'other'].map(g => (
                    <button key={g} type="button" onClick={() => {
                      const cur = form.preferences.genders;
                      updatePref('genders', cur.includes(g) ? cur.filter(x => x !== g) : [...cur, g]);
                    }} style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 999,
                      border: '1px solid',
                      borderColor: form.preferences.genders.includes(g) ? 'var(--primary)' : 'var(--border)',
                      background: form.preferences.genders.includes(g) ? 'rgba(255,62,108,0.15)' : 'transparent',
                      color: form.preferences.genders.includes(g) ? 'var(--primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      fontSize: 14,
                      transition: 'all 0.2s',
                    }}>
                      {g === 'male' ? '👨 Men' : g === 'female' ? '👩 Women' : '🌈 Other'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Religion Preference (optional)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {religions.map(r => (
                    <button key={r} type="button" onClick={() => {
                      const cur = form.preferences.religions || [];
                      updatePref('religions', cur.includes(r) ? cur.filter(x => x !== r) : [...cur, r]);
                    }} style={{
                      padding: '6px 14px',
                      borderRadius: 999,
                      fontSize: 13,
                      border: '1px solid',
                      borderColor: (form.preferences.religions || []).includes(r) ? 'var(--secondary)' : 'var(--border)',
                      background: (form.preferences.religions || []).includes(r) ? 'rgba(139,92,246,0.15)' : 'transparent',
                      color: (form.preferences.religions || []).includes(r) ? 'var(--secondary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}>
                      {r}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Leave empty to see all</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
          {step > 0 && (
            <button className="btn btn-secondary" onClick={goBack} style={{ flex: 1 }}>
              <ChevronLeft size={18} /> Back
            </button>
          )}
          <motion.button className="btn btn-primary" onClick={goNext} disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ flex: 2 }}>
            {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : step === STEPS.length - 1 ? '🎉 Complete Profile' : <>Next <ChevronRight size={18} /></>}
          </motion.button>
        </div>

        <button onClick={() => navigate('/discover')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, width: '100%', textAlign: 'center', marginTop: 16, cursor: 'pointer' }}>
          Skip for now
        </button>
      </div>
    </div>
  );
}
