import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService, recipeService, favoriteService, mealPlanService } from '../services/api';

export default function ProfilePage({ showToast }) {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ recipes: 0, favorites: 0, meals: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [r, f, m] = await Promise.all([
          recipeService.getRecipes(),
          favoriteService.getAll(),
          mealPlanService.getAll()
        ]);
        // Note: In a real app we'd filter recipes by author, but we use total for visual demo
        setStats({ recipes: r.length, favorites: f.length, meals: m.length });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await authService.updateMe({ name });
      updateUser(updated);
      showToast?.('Profile updated!', 'success');
    } catch { showToast?.('Failed to update profile', 'error'); }
    finally { setSaving(false); }
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="ed-page-container" style={{ maxWidth: '600px' }}>
      
      <div className="ed-card" style={{ padding: '40px', backgroundColor: '#ffffff', textAlign: 'center', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
        
        {/* Decorative background element */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(to bottom, #eef4f0, #ffffff)', zIndex: 0 }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#243529', color: '#fdfbf5', fontSize: '2.5rem', fontFamily: 'var(--font-serif)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '16px' }}>
            {initial}
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: '#243529', margin: '0 0 8px 0' }}>{user?.name}</h1>
          <p style={{ color: '#6b665c', margin: 0, fontSize: '0.95rem' }}>{user?.email}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '40px', borderTop: '1px solid #e6e1d3', paddingTop: '32px' }}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#4a5a35', fontFamily: 'var(--font-serif)' }}>{loading ? '-' : stats.recipes}</div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b665c', marginTop: '4px' }}>Recipes</div>
          </div>
          <div style={{ borderLeft: '1px solid #e6e1d3', borderRight: '1px solid #e6e1d3' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#4a5a35', fontFamily: 'var(--font-serif)' }}>{loading ? '-' : stats.favorites}</div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b665c', marginTop: '4px' }}>Favorites</div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#4a5a35', fontFamily: 'var(--font-serif)' }}>{loading ? '-' : stats.meals}</div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b665c', marginTop: '4px' }}>Planned Meals</div>
          </div>
        </div>
      </div>

      <div className="ed-card" style={{ padding: '32px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#243529', marginBottom: '24px', borderBottom: '1px solid #e6e1d3', paddingBottom: '16px' }}>Account Settings</h2>
        
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="ed-input-wrapper" style={{ margin: 0 }}>
            <label className="ed-label">Display Name</label>
            <input type="text" className="ed-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
          </div>
          
          <div className="ed-input-wrapper" style={{ margin: 0 }}>
            <label className="ed-label">Email Address</label>
            <input type="email" className="ed-input" value={user?.email || ''} disabled style={{ backgroundColor: '#f1efe8', color: '#6b665c', cursor: 'not-allowed' }} />
            <div style={{ fontSize: '0.75rem', color: '#6b665c', marginTop: '4px' }}>Email address cannot be changed.</div>
          </div>
          
          <div style={{ marginTop: '12px' }}>
            <button type="submit" className="ed-btn ed-btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button className="ed-btn ed-btn-outline" onClick={logout} style={{ color: '#8a2420', borderColor: '#8a2420' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign Out
        </button>
      </div>

    </div>
  );
}
