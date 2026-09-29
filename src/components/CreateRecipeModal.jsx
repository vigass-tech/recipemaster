import React, { useState, useEffect } from 'react';

const PRESET_IMAGES = [
  { label: 'Salmon', url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Tacos', url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Risotto', url: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Curry', url: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Shakshuka', url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Lava Cake', url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Salad', url: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Matcha', url: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=1000&q=80' }
];

const AVAILABLE_TAGS = [
  'High-Protein', 'Vegan', 'Vegetarian', 'Gluten-Free', 'Quick & Easy', 'Keto-Friendly', "Chef's Special", 'Comfort Food'
];

export default function CreateRecipeModal({ isOpen, onClose, onSave, initialData = null }) {
  if (!isOpen) return null;

  const isEditing = Boolean(initialData && initialData._id);

  const [formData, setFormData] = useState({
    title: '', description: '', cuisine: 'Italian', category: 'Dinner', difficulty: 'Medium',
    prepTime: 15, cookTime: 20, servings: 4, calories: 450, image: PRESET_IMAGES[0].url, tags: ['High-Protein'],
    author: { name: 'Chef Guest' },
    ingredients: [{ name: '', amount: 1, unit: 'tbsp', notes: '' }],
    instructions: [''],
    chefTips: ['']
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '', description: initialData.description || '', cuisine: initialData.cuisine || 'Italian',
        category: initialData.category || 'Dinner', difficulty: initialData.difficulty || 'Medium', prepTime: initialData.prepTime || 15,
        cookTime: initialData.cookTime || 20, servings: initialData.servings || 4, calories: initialData.calories || 450,
        image: initialData.image || PRESET_IMAGES[0].url, tags: initialData.tags || [], author: initialData.author || { name: 'Chef Guest' },
        ingredients: initialData.ingredients?.length ? initialData.ingredients : [{ name: '', amount: 1, unit: '', notes: '' }],
        instructions: initialData.instructions?.length ? initialData.instructions : [''],
        chefTips: initialData.chefTips?.length ? initialData.chefTips : ['']
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value }));
  };

  const toggleTag = (tag) => {
    setFormData(prev => ({
      ...prev, tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }));
  };

  const handleIngredientChange = (idx, field, value) => {
    setFormData(prev => {
      const updated = [...prev.ingredients];
      updated[idx] = { ...updated[idx], [field]: field === 'amount' ? (value === '' ? '' : Number(value)) : value };
      return { ...prev, ingredients: updated };
    });
  };
  const addIngredientRow = () => setFormData(p => ({ ...p, ingredients: [...p.ingredients, { name: '', amount: 1, unit: 'tbsp', notes: '' }] }));
  const removeIngredientRow = (idx) => setFormData(p => ({ ...p, ingredients: p.ingredients.filter((_, i) => i !== idx) }));

  const handleInstructionChange = (idx, value) => {
    setFormData(prev => {
      const updated = [...prev.instructions];
      updated[idx] = value;
      return { ...prev, instructions: updated };
    });
  };
  const addInstructionRow = () => setFormData(p => ({ ...p, instructions: [...p.instructions, ''] }));
  const removeInstructionRow = (idx) => setFormData(p => ({ ...p, instructions: p.instructions.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert('Please enter a recipe title');
    setIsSubmitting(true);
    try {
      await onSave(formData, initialData?._id);
      onClose();
    } catch (err) {
      alert('Failed to save recipe: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(20, 17, 15, 0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={onClose}>
      <div className="ed-card" style={{ width: '100%', maxWidth: '1200px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        
        {/* Sticky Header */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #e6e1d3', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', zIndex: 10 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#243529', margin: 0 }}>
            {isEditing ? 'Edit Recipe' : 'Create New Recipe'}
          </h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" className="ed-btn ed-btn-ghost" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button type="button" className="ed-btn ed-btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              {isSubmitting ? 'Saving...' : 'Save Recipe'}
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', backgroundColor: '#fdfbf5' }}>
          <form id="recipe-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '48px' }}>
            
            {/* LEFT COLUMN: Basics */}
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#243529', marginBottom: '24px', paddingBottom: '8px', borderBottom: '1px solid #e6e1d3' }}>Basics</h3>
              
              <div className="ed-input-wrapper">
                <label className="ed-label">Recipe Title *</label>
                <input type="text" name="title" className="ed-input" placeholder="e.g. Lemon Herb Roasted Chicken" value={formData.title} onChange={handleChange} required />
              </div>
              
              <div className="ed-input-wrapper">
                <label className="ed-label">Description</label>
                <textarea name="description" className="ed-input" placeholder="A brief tantalizing description..." value={formData.description} onChange={handleChange} rows={3} style={{ resize: 'vertical' }} />
              </div>

              <div className="ed-input-wrapper">
                <label className="ed-label">Cover Image URL</label>
                <input type="url" name="image" className="ed-input" placeholder="https://..." value={formData.image} onChange={handleChange} />
                {formData.image && (
                  <div style={{ marginTop: '12px', width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e6e1d3' }}>
                    <img src={formData.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                  {PRESET_IMAGES.map((img) => (
                    <button key={img.label} type="button" className="ed-badge ed-badge-neutral" style={{ cursor: 'pointer', border: 'none' }} onClick={() => setFormData(p => ({ ...p, image: img.url }))}>
                      {img.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
                <div className="ed-input-wrapper"><label className="ed-label">Category</label><select name="category" className="ed-input ed-select" value={formData.category} onChange={handleChange}><option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Dessert</option><option>Snack</option></select></div>
                <div className="ed-input-wrapper"><label className="ed-label">Cuisine</label><select name="cuisine" className="ed-input ed-select" value={formData.cuisine} onChange={handleChange}><option>Italian</option><option>Mexican</option><option>Indian</option><option>Mediterranean</option><option>French</option><option>Asian</option><option>American</option></select></div>
                <div className="ed-input-wrapper"><label className="ed-label">Difficulty</label><select name="difficulty" className="ed-input ed-select" value={formData.difficulty} onChange={handleChange}><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
                <div className="ed-input-wrapper"><label className="ed-label">Servings</label><input type="number" name="servings" className="ed-input" min="1" value={formData.servings} onChange={handleChange} /></div>
                <div className="ed-input-wrapper"><label className="ed-label">Prep Time (m)</label><input type="number" name="prepTime" className="ed-input" min="0" value={formData.prepTime} onChange={handleChange} /></div>
                <div className="ed-input-wrapper"><label className="ed-label">Cook Time (m)</label><input type="number" name="cookTime" className="ed-input" min="0" value={formData.cookTime} onChange={handleChange} /></div>
              </div>

              <div className="ed-input-wrapper" style={{ marginTop: '24px' }}>
                <label className="ed-label">Tags</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {AVAILABLE_TAGS.map(tag => {
                    const active = formData.tags.includes(tag);
                    return (
                      <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`ed-badge ${active ? 'ed-status-safe' : 'ed-badge-neutral'}`} style={{ cursor: 'pointer', border: active ? '1px solid #1e3f2d' : '1px solid transparent' }}>
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Ingredients & Steps */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '8px', borderBottom: '1px solid #e6e1d3' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#243529', margin: 0 }}>Ingredients</h3>
                <button type="button" className="ed-btn-icon" onClick={addIngredientRow} title="Add Ingredient"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
                {formData.ingredients.map((ing, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <input type="number" placeholder="Qty" className="ed-input" style={{ width: '80px' }} value={ing.amount} onChange={e => handleIngredientChange(idx, 'amount', e.target.value)} />
                    <input type="text" placeholder="Unit" className="ed-input" style={{ width: '90px' }} value={ing.unit} onChange={e => handleIngredientChange(idx, 'unit', e.target.value)} />
                    <input type="text" placeholder="Name *" className="ed-input" style={{ flex: 1 }} value={ing.name} onChange={e => handleIngredientChange(idx, 'name', e.target.value)} required />
                    <input type="text" placeholder="Notes" className="ed-input" style={{ flex: 1 }} value={ing.notes} onChange={e => handleIngredientChange(idx, 'notes', e.target.value)} />
                    <button type="button" className="ed-btn-icon" style={{ color: '#8a2420' }} onClick={() => removeIngredientRow(idx)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '8px', borderBottom: '1px solid #e6e1d3' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#243529', margin: 0 }}>Instructions</h3>
                <button type="button" className="ed-btn-icon" onClick={addInstructionRow} title="Add Step"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {formData.instructions.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: '#7c9483', width: '32px', textAlign: 'center', marginTop: '4px' }}>{idx + 1}</div>
                    <textarea placeholder="Describe this step..." className="ed-input" style={{ flex: 1, resize: 'vertical' }} rows={2} value={step} onChange={e => handleInstructionChange(idx, e.target.value)} required />
                    <button type="button" className="ed-btn-icon" style={{ color: '#8a2420', marginTop: '8px' }} onClick={() => removeInstructionRow(idx)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                  </div>
                ))}
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
