import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User, Calendar } from 'lucide-react';

export default function AuthPage() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') || 'login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', dateOfBirth: '', gender: 'female' });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        navigate('/discover');
      } else {
        if (!form.name || !form.dateOfBirth || !form.gender) {
          toast.error('Please fill all fields');
          return;
        }
        const user = await register(form);
        navigate(user.profileComplete ? '/discover' : '/setup');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(ellipse at top left, #1a0a1e 0%, #0d0d14 70%)',
    }}>
      {/* Glow */}
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 400, height: 300, borderRadius: '50%', background: 'rgba(255,62,108,0.08)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 420 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>💕</div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 32, fontWeight: 900, background: 'linear-gradient(135deg, #ff3e6c, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            BuddyUps
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>
            {mode === 'login' ? 'Welcome back 💝' : 'Find your match today 🌹'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 999, padding: 4, marginBottom: 32 }}>
          {['login', 'register'].map((m) => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1,
              padding: '10px',
              borderRadius: 999,
              background: mode === m ? 'linear-gradient(135deg, #ff3e6c, #8b5cf6)' : 'transparent',
              color: mode === m ? 'white' : 'rgba(255,255,255,0.5)',
              fontWeight: 700,
              fontSize: 14,
              transition: 'all 0.2s',
              border: 'none',
              cursor: 'pointer',
            }}>
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <motion.div key="extra" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                    <input className="input" style={{ paddingLeft: 40 }} name="name" placeholder="Your full name" value={form.name} onChange={handleChange} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="input-group">
                    <label className="input-label">Date of Birth</label>
                    <input className="input" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required max={new Date(Date.now() - 18 * 365.25 * 86400000).toISOString().split('T')[0]} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">I am a</label>
                    <select className="input" name="gender" value={form.gender} onChange={handleChange}>
                      <option value="female">Woman</option>
                      <option value="male">Man</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="input-group">
            <label className="input-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
              <input className="input" style={{ paddingLeft: 40 }} type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
              <input className="input" style={{ paddingLeft: 40, paddingRight: 44 }} type={showPassword ? 'text' : 'password'} name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <motion.button className="btn btn-primary btn-lg w-full" style={{ marginTop: 8 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} type="submit">
            {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : mode === 'login' ? '✨ Sign In' : '💝 Create Account'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
