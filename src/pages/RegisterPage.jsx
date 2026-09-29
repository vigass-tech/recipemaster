import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage({ showToast }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      showToast?.('Registration successful! Welcome.', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast?.(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fdfbf5' }}>
      
      {/* Right side - Image (Flipped from Login) */}
      <div style={{ flex: 1, display: window.innerWidth < 768 ? 'none' : 'block', position: 'relative', backgroundColor: '#243529', order: 2 }}>
        <img src="https://images.unsplash.com/photo-1495195129352-aeb325a55b65?auto=format&fit=crop&w=1200&q=80" alt="Fresh vegetables" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(36,53,41,0.9), rgba(36,53,41,0.2))' }}></div>
        <div style={{ position: 'absolute', bottom: '60px', left: '60px', right: '60px', color: '#fdfbf5' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', margin: '0 0 16px 0', lineHeight: 1.1 }}>Eat fresh. Cook smart.</h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '400px' }}>Join us to organize your pantry, plan healthy meals, and find inspiration every day.</p>
        </div>
      </div>

      {/* Left side - Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: window.innerWidth < 768 ? '40px 24px' : '60px 80px', maxWidth: window.innerWidth < 768 ? '100%' : '600px', order: 1 }}>
        
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: '#243529', margin: '0 0 8px 0' }}>Create Account</h1>
          <p style={{ color: '#6b665c', margin: 0 }}>Start your culinary journey today.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="ed-input-wrapper" style={{ margin: 0 }}>
            <label className="ed-label">Full Name</label>
            <input type="text" className="ed-input" value={name} onChange={e => setName(e.target.value)} required placeholder="Jane Doe" />
          </div>

          <div className="ed-input-wrapper" style={{ margin: 0 }}>
            <label className="ed-label">Email Address</label>
            <input type="email" className="ed-input" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>

          <div className="ed-input-wrapper" style={{ margin: 0, position: 'relative' }}>
            <label className="ed-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} className="ed-input" style={{ width: '100%', paddingRight: '48px' }} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" minLength="6" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b665c', padding: '4px' }}>
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b665c', marginTop: '6px' }}>Must be at least 6 characters.</div>
          </div>

          <button type="submit" className="ed-btn ed-btn-primary" style={{ width: '100%', marginTop: '12px', padding: '14px', fontSize: '1rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '32px', color: '#6b665c', fontSize: '0.95rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#243529', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </div>

      </div>
    </div>
  );
}
