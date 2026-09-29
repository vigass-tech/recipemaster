import React, { useEffect, useState } from 'react';
import { pantryService, recipeService } from '../services/api';

const DAYS = 3;
const UNITS = ['g', 'kg', 'ml', 'L', 'cup', 'tbsp', 'tsp', 'piece', 'bunch', 'can'];
const CATEGORIES = ['Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Grains & Pasta', 'Spices & Pantry', 'Frozen', 'Beverages', 'Other'];

function getStatus(expiryDate) {
  if (!expiryDate) return 'SAFE';
  const now = new Date();
  const exp = new Date(expiryDate);
  const diff = (exp - now) / (1000 * 60 * 60 * 24);
  if (diff < 0) return 'EXPIRED';
  if (diff <= DAYS) return 'EXPIRING SOON';
  return 'SAFE';
}

function AddPantryModal({ isOpen, onClose, onSave, editData }) {
  const [form, setForm] = useState({ ingredient: '', quantity: '', unit: 'g', expiryDate: '', category: 'Produce' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        ingredient: editData.ingredient || '',
        quantity: editData.quantity || '',
        unit: editData.unit || 'g',
        expiryDate: editData.expiryDate ? new Date(editData.expiryDate).toISOString().slice(0, 10) : '',
        category: editData.category || 'Produce'
      });
    } else {
      setForm({ ingredient: '', quantity: '', unit: 'g', expiryDate: '', category: 'Produce' });
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSave(form, editData?._id);
    setSubmitting(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(20, 17, 15, 0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={onClose}>
      <div className="ed-card" style={{ width: '100%', maxWidth: '500px', backgroundColor: '#ffffff', padding: '32px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#243529', margin: 0 }}>
            {editData ? 'Edit Item' : 'Add to Pantry'}
          </h2>
          <button onClick={onClose} className="ed-btn-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="ed-input-wrapper" style={{ margin: 0 }}>
            <label className="ed-label">Ingredient Name *</label>
            <input className="ed-input" placeholder="e.g. Tomato" value={form.ingredient} onChange={e => setForm(p => ({ ...p, ingredient: e.target.value }))} required />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="ed-input-wrapper" style={{ margin: 0 }}>
              <label className="ed-label">Quantity</label>
              <input type="number" className="ed-input" placeholder="Qty" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} min="0" step="any" />
            </div>
            <div className="ed-input-wrapper" style={{ margin: 0 }}>
              <label className="ed-label">Unit</label>
              <select className="ed-input ed-select" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}>
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="ed-input-wrapper" style={{ margin: 0 }}>
              <label className="ed-label">Expiry Date</label>
              <input type="date" className="ed-input" value={form.expiryDate} onChange={e => setForm(p => ({ ...p, expiryDate: e.target.value }))} />
            </div>
            <div className="ed-input-wrapper" style={{ margin: 0 }}>
              <label className="ed-label">Category</label>
              <select className="ed-input ed-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="ed-btn ed-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="ed-btn ed-btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Item'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PantryPage({ showToast }) {
  const [items, setItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filter, setFilter] = useState('All');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, r] = await Promise.all([pantryService.getAll(), recipeService.getRecipes()]);
      setItems(p); setRecipes(r);
    } catch {
      setError('Failed to load pantry data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form, id) => {
    try {
      if (id) {
        const updated = await pantryService.update(id, form);
        setItems(prev => prev.map(i => i._id === id ? updated : i));
        showToast?.('Item updated!', 'success');
      } else {
        const created = await pantryService.add(form);
        setItems(prev => [created, ...prev]);
        showToast?.('Item added!', 'success');
      }
      setModalOpen(false);
      setEditItem(null);
    } catch {
      showToast?.('Failed to save item', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await pantryService.remove(id);
      setItems(prev => prev.filter(i => i._id !== id));
      showToast?.('Item removed', 'info');
    } catch { showToast?.('Failed to delete', 'error'); }
  };

  const cookWithWhatIHave = () => {
    const pantryNames = items.map(i => i.ingredient.toLowerCase());
    const ranked = recipes.map(recipe => {
      const needed = recipe.ingredients?.map(i => i.name.toLowerCase()) || [];
      const available = needed.filter(n => pantryNames.some(p => n.includes(p) || p.includes(n)));
      const missing = needed.filter(n => !pantryNames.some(p => n.includes(p) || p.includes(n)));
      const expiring = items.filter(pi => getStatus(pi.expiryDate) !== 'SAFE' && needed.some(n => n.includes(pi.ingredient.toLowerCase())));
      const pct = needed.length ? Math.round((available.length / needed.length) * 100) : 0;
      return { recipe, pct, available, missing, expiring };
    }).sort((a, b) => b.pct - a.pct || b.expiring.length - a.expiring.length);
    setMatches(ranked);
  };

  const counts = {
    all: items.length,
    safe: items.filter(i => getStatus(i.expiryDate) === 'SAFE').length,
    expiring: items.filter(i => getStatus(i.expiryDate) === 'EXPIRING SOON').length,
    expired: items.filter(i => getStatus(i.expiryDate) === 'EXPIRED').length
  };

  // Sort items by expiry date
  const sortedItems = [...items].sort((a, b) => {
    if (!a.expiryDate) return 1;
    if (!b.expiryDate) return -1;
    return new Date(a.expiryDate) - new Date(b.expiryDate);
  });

  const displayItems = sortedItems.filter(i => {
    if (filter === 'All') return true;
    if (filter === 'Safe') return getStatus(i.expiryDate) === 'SAFE';
    if (filter === 'Expiring') return getStatus(i.expiryDate) === 'EXPIRING SOON';
    if (filter === 'Expired') return getStatus(i.expiryDate) === 'EXPIRED';
    return true;
  });

  const getStatusClass = (status) => {
    if (status === 'SAFE') return 'ed-status-safe';
    if (status === 'EXPIRING SOON') return 'ed-status-expiring';
    if (status === 'EXPIRED') return 'ed-status-expired';
    return 'ed-badge-neutral';
  };

  return (
    <div className="ed-page-container">
      
      {/* Page Header */}
      <div className="ed-page-header">
        <div>
          <span className="ed-page-eyebrow">Kitchen Inventory</span>
          <h1 className="ed-page-title">My Pantry</h1>
          <p className="ed-page-subtitle">Track your ingredients and reduce food waste.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="ed-btn ed-btn-outline" onClick={cookWithWhatIHave}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Cook with What I Have
          </button>
          <button className="ed-btn ed-btn-primary" onClick={() => { setEditItem(null); setModalOpen(true); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Item
          </button>
        </div>
      </div>

      {/* Summary Chips */}
      {!loading && !error && items.length > 0 && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button onClick={() => setFilter('All')} className="ed-badge" style={{ padding: '8px 16px', border: filter === 'All' ? '1px solid #243529' : '1px solid #e6e1d3', background: filter === 'All' ? '#eef4f0' : '#ffffff', cursor: 'pointer', color: '#14110f' }}>All ({counts.all})</button>
          <button onClick={() => setFilter('Safe')} className="ed-badge ed-status-safe" style={{ padding: '8px 16px', border: filter === 'Safe' ? '1px solid #1e3f2d' : '1px solid transparent', cursor: 'pointer' }}>Safe ({counts.safe})</button>
          <button onClick={() => setFilter('Expiring')} className="ed-badge ed-status-expiring" style={{ padding: '8px 16px', border: filter === 'Expiring' ? '1px solid #825b16' : '1px solid transparent', cursor: 'pointer' }}>Expiring Soon ({counts.expiring})</button>
          <button onClick={() => setFilter('Expired')} className="ed-badge ed-status-expired" style={{ padding: '8px 16px', border: filter === 'Expired' ? '1px solid #8a2420' : '1px solid transparent', cursor: 'pointer' }}>Expired ({counts.expired})</button>
        </div>
      )}

      {/* Main Content */}
      {error ? (
        <div className="ed-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className="ed-btn ed-btn-outline" onClick={load}>Retry</button>
        </div>
      ) : loading ? (
        <div className="ed-card" style={{ padding: '24px' }}>
          {[1,2,3,4].map(i => <div key={i} className="ed-skeleton" style={{ height: '48px', width: '100%', marginBottom: '12px' }}></div>)}
        </div>
      ) : items.length === 0 ? (
        <div className="ed-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <h3>Your pantry is empty</h3>
          <p>Add your first ingredient to start tracking and get recipe recommendations.</p>
          <button className="ed-btn ed-btn-primary" onClick={() => { setEditItem(null); setModalOpen(true); }}>Add your first ingredient</button>
        </div>
      ) : (
        <div className="ed-card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1efe8', borderBottom: '1px solid #e6e1d3' }}>
                <th style={{ padding: '16px 24px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b665c' }}>Ingredient</th>
                <th style={{ padding: '16px 24px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b665c' }}>Quantity</th>
                <th style={{ padding: '16px 24px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b665c' }}>Category</th>
                <th style={{ padding: '16px 24px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b665c' }}>Expiry Date</th>
                <th style={{ padding: '16px 24px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b665c' }}>Status</th>
                <th style={{ padding: '16px 24px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b665c', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#6b665c' }}>No items match this filter.</td></tr>
              ) : displayItems.map(item => {
                const status = getStatus(item.expiryDate);
                const diffDays = item.expiryDate ? Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                return (
                  <tr key={item._id} style={{ borderBottom: '1px solid #e6e1d3', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fcfbfa'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#14110f' }}>{item.ingredient}</td>
                    <td style={{ padding: '16px 24px', color: '#4a5a35' }}>{item.quantity ? `${item.quantity} ${item.unit}` : '—'}</td>
                    <td style={{ padding: '16px 24px', color: '#4a5a35' }}>{item.category || '—'}</td>
                    <td style={{ padding: '16px 24px', color: '#4a5a35' }}>
                      {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '—'}
                      {diffDays !== null && diffDays >= 0 && diffDays <= 7 && <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: '#d97706' }}>({diffDays} days left)</span>}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className={`ed-badge ${getStatusClass(status)}`}>{status}</span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button className="ed-btn-icon" onClick={() => { setEditItem(item); setModalOpen(true); }} title="Edit"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                      <button className="ed-btn-icon" onClick={() => handleDelete(item._id)} style={{ color: '#8a2420' }} title="Delete"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Recommendations Panel */}
      {matches && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(20, 17, 15, 0.6)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px', overflowY: 'auto' }} onClick={() => setMatches(null)}>
          <div className="ed-card" style={{ width: '100%', maxWidth: '800px', backgroundColor: '#fdfbf5', padding: '32px', margin: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#243529', margin: 0 }}>Recipes you can cook now</h2>
              <button onClick={() => setMatches(null)} className="ed-btn-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {matches.slice(0, 10).map(({ recipe, pct, available, missing, expiring }) => (
                <div key={recipe._id} className="ed-card" style={{ display: 'flex', flexDirection: window.innerWidth < 600 ? 'column' : 'row', gap: '20px', padding: '16px' }}>
                  <img src={recipe.image || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400&q=80'} alt="" style={{ width: window.innerWidth < 600 ? '100%' : '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#243529' }}>{recipe.title}</h3>
                    {expiring.length > 0 && <div className="ed-badge ed-status-expiring" style={{ marginBottom: '8px' }}>Uses expiring: {expiring.map(e => e.ingredient).join(', ')}</div>}
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div style={{ flex: 1, height: '6px', backgroundColor: '#e6e1d3', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: pct > 70 ? '#1e3f2d' : pct > 40 ? '#825b16' : '#8a2420' }}></div>
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{pct}% Match</span>
                    </div>

                    <div style={{ fontSize: '0.85rem' }}>
                      <span style={{ color: '#1e3f2d', fontWeight: 500 }}>{available.length} available</span>
                      {missing.length > 0 && <span style={{ color: '#8a2420', marginLeft: '12px' }}>Missing: {missing.slice(0, 3).join(', ')}{missing.length > 3 ? '...' : ''}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <AddPantryModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} editData={editItem} />
    </div>
  );
}
