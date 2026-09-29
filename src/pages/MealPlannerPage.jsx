import React, { useEffect, useState } from 'react';
import { mealPlanService, recipeService } from '../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner'];

function getWeekDates(offsetWeeks = 0) {
  const now = new Date();
  now.setDate(now.getDate() + (offsetWeeks * 7));
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  return DAYS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

function RecipePickerModal({ picking, onClose, recipes, onPick }) {
  const [search, setSearch] = useState('');
  
  if (!picking) return null;

  const filtered = search.trim()
    ? recipes.filter(r => r.title?.toLowerCase().includes(search.toLowerCase()) || r.category?.toLowerCase().includes(search.toLowerCase()))
    : recipes;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(20, 17, 15, 0.6)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px', overflowY: 'auto' }} onClick={onClose}>
      <div className="ed-card" style={{ width: '100%', maxWidth: '600px', backgroundColor: '#fdfbf5', padding: '32px', margin: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#243529', margin: 0 }}>Pick {picking.mealType}</h2>
          <button onClick={onClose} className="ed-btn-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        
        <div className="ed-input-wrapper" style={{ marginBottom: '24px' }}>
          <input type="text" className="ed-input" placeholder="Search your recipes..." value={search} onChange={e => setSearch(e.target.value)} autoFocus />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
          {filtered.length === 0 ? (
            <div className="ed-empty" style={{ padding: '32px 16px' }}><p>No recipes found.</p></div>
          ) : filtered.map(r => (
            <div key={r._id} className="ed-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', cursor: 'pointer', flexDirection: 'row' }} onClick={() => onPick(r)}>
              <img src={r.image || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=150&q=80'} alt="" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#243529' }}>{r.title}</h4>
                <div style={{ fontSize: '0.8rem', color: '#6b665c' }}>{r.category} • {(r.preparationTime || 0) + (r.cookingTime || 0)} min</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MealPlannerPage({ showToast }) {
  const [plan, setPlan] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [picking, setPicking] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeMobileDay, setActiveMobileDay] = useState(0);

  const weekDates = getWeekDates(weekOffset);
  const todayISO = new Date().toISOString().slice(0, 10);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, r] = await Promise.all([mealPlanService.getAll(), recipeService.getRecipes()]);
      setPlan(p); setRecipes(r);
    } catch {
      setError('Failed to load meal plan.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const getSlot = (date, mealType) => plan.find(p => p.date === date && p.mealType === mealType);

  const handlePick = async (recipe) => {
    if (!picking) return;
    try {
      const result = await mealPlanService.set(recipe._id, picking.date, picking.mealType);
      setPlan(prev => {
        const filtered = prev.filter(p => !(p.date === picking.date && p.mealType === picking.mealType));
        return [...filtered, result];
      });
      showToast?.(`Added ${recipe.title} to ${picking.mealType}!`, 'success');
    } catch { showToast?.('Failed to save meal', 'error'); }
    finally { setPicking(null); }
  };

  const handleRemove = async (slot) => {
    try {
      await mealPlanService.remove(slot._id);
      setPlan(prev => prev.filter(p => p._id !== slot._id));
      showToast?.('Removed from meal plan', 'info');
    } catch { showToast?.('Failed to remove', 'error'); }
  };

  return (
    <div className="ed-page-container">
      
      {/* Page Header */}
      <div className="ed-page-header">
        <div>
          <span className="ed-page-eyebrow">Your Schedule</span>
          <h1 className="ed-page-title">Meal Planner</h1>
          <p className="ed-page-subtitle">Organize your week to eat healthier and save time.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#ffffff', border: '1px solid #e6e1d3', padding: '4px', borderRadius: '30px' }}>
          <button className="ed-btn-icon" onClick={() => setWeekOffset(w => w - 1)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', width: '100px', textAlign: 'center' }}>
            {weekOffset === 0 ? 'This Week' : weekOffset === 1 ? 'Next Week' : weekOffset === -1 ? 'Last Week' : `${Math.abs(weekOffset)}w ${weekOffset > 0 ? 'Ahead' : 'Ago'}`}
          </span>
          <button className="ed-btn-icon" onClick={() => setWeekOffset(w => w + 1)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></button>
        </div>
      </div>

      {error ? (
        <div className="ed-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className="ed-btn ed-btn-outline" onClick={load}>Retry</button>
        </div>
      ) : loading ? (
        <div className="ed-card" style={{ padding: '24px' }}>
          {[1,2,3].map(i => <div key={i} className="ed-skeleton" style={{ height: '80px', width: '100%', marginBottom: '12px' }}></div>)}
        </div>
      ) : (
        <>
          {/* Mobile Tabs */}
          <div className="mobile-only" style={{ display: 'flex', overflowX: 'auto', gap: '8px', marginBottom: '24px', paddingBottom: '8px' }}>
            {DAYS.map((d, i) => (
              <button key={d} onClick={() => setActiveMobileDay(i)} className="ed-badge" style={{ padding: '8px 16px', background: activeMobileDay === i ? '#243529' : '#f1efe8', color: activeMobileDay === i ? '#fdfbf5' : '#4a5a35', border: 'none', cursor: 'pointer' }}>
                {d.slice(0,3)}
              </button>
            ))}
          </div>

          <div className="ed-card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1efe8', borderBottom: '1px solid #e6e1d3' }}>
                  <th style={{ width: '100px', padding: '16px' }}></th>
                  {DAYS.map((d, i) => {
                    const isToday = weekDates[i] === todayISO;
                    const isHiddenMobile = window.innerWidth < 768 && activeMobileDay !== i;
                    if (isHiddenMobile) return null;
                    
                    return (
                      <th key={d} style={{ padding: '16px', textAlign: 'center', borderLeft: '1px solid #e6e1d3', backgroundColor: isToday ? '#eef4f0' : 'transparent' }}>
                        <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: isToday ? '#1e3f2d' : '#6b665c', fontWeight: 600 }}>{d}</div>
                        <div style={{ fontSize: '1.2rem', color: isToday ? '#1e3f2d' : '#14110f', marginTop: '4px', fontFamily: 'var(--font-serif)' }}>
                          {new Date(weekDates[i]).getDate()}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {MEALS.map(meal => (
                  <tr key={meal} style={{ borderBottom: '1px solid #e6e1d3' }}>
                    <td style={{ padding: '24px 16px', fontWeight: 600, color: '#4a5a35', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', verticalAlign: 'top' }}>
                      {meal}
                    </td>
                    {weekDates.map((date, i) => {
                      const isToday = date === todayISO;
                      const isHiddenMobile = window.innerWidth < 768 && activeMobileDay !== i;
                      if (isHiddenMobile) return null;

                      const slot = getSlot(date, meal);
                      return (
                        <td key={date} style={{ padding: '12px', borderLeft: '1px solid #e6e1d3', verticalAlign: 'top', backgroundColor: isToday ? 'rgba(238,244,240,0.3)' : 'transparent' }}>
                          {slot?.recipeId ? (
                            <div className="ed-card" style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', padding: 0 }} onClick={() => setPicking({ date, mealType: meal })}>
                              <img src={slot.recipeId.image || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=150&q=80'} alt="" style={{ width: '100%', height: '80px', objectFit: 'cover', display: 'block' }} />
                              <div style={{ padding: '8px', fontSize: '0.8rem', fontWeight: 600, color: '#243529', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {slot.recipeId.title}
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); handleRemove(slot); }} style={{ position: 'absolute', top: '4px', right: '4px', background: '#ffffff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: '#8a2420' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              </button>
                            </div>
                          ) : (
                            <div style={{ width: '100%', height: '110px', border: '1px dashed #e6e1d3', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: 'transparent' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f1efe8'; e.currentTarget.style.borderColor = '#4a5a35'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = '#e6e1d3'; }} onClick={() => setPicking({ date, mealType: meal })}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c9483" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <RecipePickerModal picking={picking} onClose={() => setPicking(null)} recipes={recipes} onPick={handlePick} />
    </div>
  );
}
