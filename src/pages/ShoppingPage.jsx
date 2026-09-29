import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { shoppingService, pantryService, mealPlanService, recipeService } from '../services/api';

const AISLES = ['Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Grains & Pasta', 'Spices & Pantry', 'Other'];

function guessAisle(name) {
  const n = name.toLowerCase();
  if (/tomato|pepper|lettuce|onion|garlic|carrot|spinach|lemon|lime|avocado|herb|basil|cilantro|cucumber|mushroom|potato|apple|berry|fruit|vegetable/.test(n)) return 'Produce';
  if (/milk|cream|butter|cheese|egg|yogurt|feta|parmesan/.test(n)) return 'Dairy & Eggs';
  if (/chicken|beef|lamb|pork|salmon|fish|shrimp|meat|turkey/.test(n)) return 'Meat & Seafood';
  if (/rice|pasta|couscous|bread|flour|oat|quinoa|noodle|grain/.test(n)) return 'Grains & Pasta';
  if (/salt|pepper|cumin|paprika|spice|oil|vinegar|sauce|soy|seasoning|sugar|honey/.test(n)) return 'Spices & Pantry';
  return 'Other';
}

export default function ShoppingPage({ showToast }) {
  const [items, setItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [sortBy, setSortBy] = useState('aisle'); // 'aisle' | 'recipe'
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([shoppingService.getAll(), recipeService.getRecipes()]);
      setItems(s); setRecipes(r);
    } catch { showToast?.('Failed to load shopping list', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const generate = async () => {
    if (!selectedRecipe) { showToast?.('Select a recipe first', 'error'); return; }
    setGenerating(true);
    try {
      const recipe = recipes.find(r => r._id === selectedRecipe);
      if (!recipe) return;
      const pantry = await pantryService.getAll();
      const pantryNames = pantry.map(p => p.ingredient.toLowerCase());
      const needed = recipe.ingredients || [];
      const existing = items.map(i => i.ingredient?.toLowerCase());
      
      const toAdd = needed
        .filter(ing => !pantryNames.some(p => p.includes(ing.name?.toLowerCase()) || ing.name?.toLowerCase().includes(p)))
        .filter(ing => !existing.some(e => e?.includes(ing.name?.toLowerCase())))
        .map(ing => ({
          ingredient: ing.name,
          quantity: ing.quantity,
          unit: ing.unit || '',
          aisle: guessAisle(ing.name),
          recipeTitle: recipe.title,
          isPurchased: false
        }));
        
      if (toAdd.length === 0) { 
        showToast?.('All ingredients are already in your pantry or list!', 'info'); 
        setGenerating(false); 
        return; 
      }
      
      const created = await shoppingService.addItems(toAdd);
      setItems(prev => [...prev, ...created]);
      showToast?.(`Added ${toAdd.length} item(s) from ${recipe.title}`, 'success');
    } catch { showToast?.('Failed to generate list', 'error'); }
    finally { setGenerating(false); }
  };

  const addMealPlanIngredients = async () => {
    try {
      const plans = await mealPlanService.getAll();
      const pantry = await pantryService.getAll();
      const pantryNames = pantry.map(p => p.ingredient.toLowerCase());
      const existing = items.map(i => i.ingredient?.toLowerCase());
      const toAdd = [];
      plans.forEach(plan => {
        const recipe = plan.recipeId;
        if (!recipe || !recipe.ingredients) return;
        recipe.ingredients.forEach(ing => {
          if (!pantryNames.some(p => p.includes(ing.name?.toLowerCase())) && !existing.some(e => e?.includes(ing.name?.toLowerCase()))) {
            toAdd.push({ ingredient: ing.name, quantity: ing.quantity, unit: ing.unit || '', aisle: guessAisle(ing.name), recipeTitle: recipe.title, isPurchased: false });
          }
        });
      });
      if (toAdd.length === 0) { showToast?.('Nothing new to add from your meal plan', 'info'); return; }
      const created = await shoppingService.addItems(toAdd);
      setItems(prev => [...prev, ...created]);
      showToast?.(`Added ${toAdd.length} item(s) from meal plan`, 'success');
    } catch { showToast?.('Failed to add meal plan ingredients', 'error'); }
  };

  const togglePurchased = async (item) => {
    try {
      const updated = await shoppingService.update(item._id, { isPurchased: !item.isPurchased });
      setItems(prev => prev.map(i => i._id === item._id ? updated : i));
    } catch { showToast?.('Failed to update', 'error'); }
  };

  const deleteItem = async (id) => {
    try {
      await shoppingService.remove(id);
      setItems(prev => prev.filter(i => i._id !== id));
    } catch { showToast?.('Failed to delete', 'error'); }
  };

  const clearPurchased = async () => {
    try {
      await shoppingService.clearPurchased();
      setItems(prev => prev.filter(i => !i.isPurchased));
      showToast?.('Cleared purchased items', 'info');
    } catch { showToast?.('Failed to clear', 'error'); }
  };

  const shareList = () => {
    const text = items.filter(i => !i.isPurchased).map(i => `• ${i.quantity ? i.quantity + ' ' : ''}${i.unit ? i.unit + ' ' : ''}${i.ingredient}`).join('\n');
    if (navigator.share) { navigator.share({ title: 'My Shopping List', text }); }
    else { navigator.clipboard.writeText(text); showToast?.('List copied to clipboard!', 'success'); }
  };

  const printList = () => window.print();

  const grouped = sortBy === 'aisle'
    ? AISLES.reduce((acc, aisle) => { acc[aisle] = items.filter(i => (i.aisle || 'Other') === aisle); return acc; }, {})
    : items.reduce((acc, i) => { const k = i.recipeTitle || 'General'; acc[k] = acc[k] || []; acc[k].push(i); return acc; }, {});

  const totalItems = items.length;
  const purchasedItems = items.filter(i => i.isPurchased).length;
  const progressPercent = totalItems === 0 ? 0 : Math.round((purchasedItems / totalItems) * 100);

  return (
    <div className="ed-page-container print-friendly" style={{ maxWidth: '1000px' }}>
      
      {/* Hide on print */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white; }
          .ed-card { box-shadow: none; border: 1px solid #ccc; }
        }
      `}</style>

      <div className="ed-page-header no-print">
        <div>
          <span className="ed-page-eyebrow">Grocery Run</span>
          <h1 className="ed-page-title">Shopping List</h1>
          <p className="ed-page-subtitle">Smart list that skips ingredients you already own.</p>
        </div>
      </div>

      <div className="no-print" style={{ backgroundColor: '#ffffff', border: '1px solid #e6e1d3', borderRadius: '12px', padding: '24px', marginBottom: '32px', display: 'flex', flexDirection: window.innerWidth < 600 ? 'column' : 'row', gap: '20px', alignItems: window.innerWidth < 600 ? 'stretch' : 'flex-end' }}>
        <div className="ed-input-wrapper" style={{ margin: 0, flex: 1 }}>
          <label className="ed-label">Generate from a Recipe</label>
          <select value={selectedRecipe} onChange={e => setSelectedRecipe(e.target.value)} className="ed-input ed-select">
            <option value="">— Choose a recipe —</option>
            {recipes.map(r => <option key={r._id} value={r._id}>{r.title}</option>)}
          </select>
        </div>
        <button className="ed-btn ed-btn-primary" onClick={generate} disabled={generating || !selectedRecipe}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          {generating ? 'Generating...' : 'Generate List'}
        </button>
      </div>

      <div className="no-print" style={{ position: 'sticky', top: '16px', zIndex: 10, background: '#fdfbf5', padding: '16px', borderRadius: '12px', border: '1px solid #e6e1d3', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="ed-btn ed-btn-outline" onClick={addMealPlanIngredients}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Add Meal Plan
          </button>
          <button className="ed-btn ed-btn-outline" onClick={shareList}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            Share
          </button>
          <button className="ed-btn ed-btn-outline" onClick={printList}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print
          </button>
          {purchasedItems > 0 && (
            <button className="ed-btn ed-btn-ghost" onClick={clearPurchased} style={{ color: '#8a2420' }}>
              Clear Purchased
            </button>
          )}
        </div>
        
        {/* Toggle View */}
        <div style={{ display: 'flex', background: '#e6e1d3', padding: '4px', borderRadius: '30px' }}>
          <button onClick={() => setSortBy('aisle')} style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', background: sortBy === 'aisle' ? '#ffffff' : 'transparent', fontWeight: sortBy === 'aisle' ? 600 : 400, cursor: 'pointer', fontSize: '0.85rem' }}>By Aisle</button>
          <button onClick={() => setSortBy('recipe')} style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', background: sortBy === 'recipe' ? '#ffffff' : 'transparent', fontWeight: sortBy === 'recipe' ? 600 : 400, cursor: 'pointer', fontSize: '0.85rem' }}>By Recipe</button>
        </div>
      </div>

      {totalItems > 0 && (
        <div className="no-print" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#6b665c', marginBottom: '8px' }}>
            <span>Shopping Progress</span>
            <span>{purchasedItems} of {totalItems} items ({progressPercent}%)</span>
          </div>
          <div style={{ height: '8px', background: '#e6e1d3', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPercent}%`, background: '#243529', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="ed-card" style={{ padding: '24px' }}>
          {[1,2,3,4].map(i => <div key={i} className="ed-skeleton" style={{ height: '48px', width: '100%', marginBottom: '12px' }}></div>)}
        </div>
      ) : items.length === 0 ? (
        <div className="ed-empty no-print">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <h3>Your shopping list is empty</h3>
          <p>Generate a smart list from a recipe or your meal plan above.</p>
        </div>
      ) : (
        <div className="ed-card" style={{ padding: '32px', backgroundColor: '#ffffff' }}>
          <h2 className="print-only" style={{ display: 'none', margin: '0 0 24px 0', fontFamily: 'var(--font-serif)' }}>Shopping List</h2>
          {Object.entries(grouped).map(([group, groupItems]) => {
            if (groupItems.length === 0) return null;
            return (
              <div key={group} style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4a5a35', borderBottom: '2px solid #e6e1d3', paddingBottom: '8px', marginBottom: '16px' }}>{group}</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {groupItems.map(item => (
                    <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '8px', transition: 'background 0.2s', backgroundColor: item.isPurchased ? '#fcfbfa' : 'transparent', opacity: item.isPurchased ? 0.6 : 1 }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1efe8'} onMouseLeave={e => e.currentTarget.style.backgroundColor = item.isPurchased ? '#fcfbfa' : 'transparent'}>
                      
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1, gap: '16px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: `2px solid ${item.isPurchased ? '#243529' : '#c3bcac'}`, backgroundColor: item.isPurchased ? '#243529' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                          <input type="checkbox" checked={item.isPurchased} onChange={() => togglePurchased(item)} style={{ opacity: 0, position: 'absolute', width: 0, height: 0 }} />
                          {item.isPurchased && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 500, color: '#14110f', textDecoration: item.isPurchased ? 'line-through' : 'none' }}>{item.ingredient}</span>
                          {sortBy === 'aisle' && item.recipeTitle && (
                            <div style={{ fontSize: '0.75rem', color: '#6b665c', marginTop: '2px' }}>from {item.recipeTitle}</div>
                          )}
                        </div>
                      </label>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {(item.quantity || item.unit) && (
                          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#243529', minWidth: '60px', textAlign: 'right' }}>
                            {item.quantity} {item.unit}
                          </div>
                        )}
                        <button className="ed-btn-icon no-print" onClick={() => deleteItem(item._id)} style={{ color: '#8a2420', opacity: 0.5 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
