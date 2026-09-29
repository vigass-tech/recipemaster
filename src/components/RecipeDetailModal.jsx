import React, { useState } from 'react';

export default function RecipeDetailModal({
  recipe,
  onClose,
  isFavorite,
  onToggleFavorite,
  onEdit,
  onDelete,
  onAddToPlanner,
  onStartTimer,
  showToast
}) {
  if (!recipe) return null;

  const hasServings = Boolean(recipe.servings && recipe.servings > 0);
  const originalServings = hasServings ? recipe.servings : 1;
  const [currentServings, setCurrentServings] = useState(originalServings);
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [completedSteps, setCompletedSteps] = useState({});

  const scaleAmount = (amount) => {
    if (!amount || isNaN(amount)) return '';
    const scaled = (amount / originalServings) * currentServings;
    return Number(scaled.toFixed(2));
  };

  const toggleIngredientCheck = (idx) => {
    setCheckedIngredients(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleStepCompleted = (idx) => {
    setCompletedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/recipes?q=${encodeURIComponent(recipe.title)}`);
    if (showToast) showToast('🔗 Link copied to clipboard!', 'success');
  };

  const hasPrepTime = Boolean(recipe.preparationTime && recipe.preparationTime > 0);
  const hasCookTime = Boolean(recipe.cookingTime && recipe.cookingTime > 0);
  const totalTime = (recipe.preparationTime || 0) + (recipe.cookingTime || 0);
  const hasTime = totalTime > 0;

  // Group ingredients by aisle
  const groupedIngredients = (recipe.ingredients || []).reduce((acc, ing, idx) => {
    const aisle = ing.aisle && ing.aisle !== 'Other' ? ing.aisle : 'Other';
    if (!acc[aisle]) acc[aisle] = [];
    acc[aisle].push({ ...ing, originalIndex: idx });
    return acc;
  }, {});
  
  // Sort 'Other' to the end
  const sortedAisles = Object.keys(groupedIngredients).sort((a, b) => {
    if (a === 'Other') return 1;
    if (b === 'Other') return -1;
    return a.localeCompare(b);
  });

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(20, 17, 15, 0.6)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px', overflowY: 'auto' }} onClick={onClose}>
      <div className="ed-card" style={{ width: '100%', maxWidth: '1000px', backgroundColor: '#fdfbf5', position: 'relative', overflow: 'hidden', margin: 'auto' }} onClick={e => e.stopPropagation()}>
        
        {/* Close Button */}
        <button onClick={onClose} className="ed-btn-icon" style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10, backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        {/* Hero Image (Side by Side layout) */}
        <div style={{ display: 'flex', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
          
          <div style={{ flex: '1', position: 'relative' }}>
            <img src={recipe.image || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80'} alt={recipe.title} style={{ width: '100%', height: '100%', minHeight: '300px', objectFit: 'cover' }} />
          </div>

          <div style={{ flex: '1.2', padding: '40px', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {recipe.cuisine && <span className="ed-badge ed-badge-neutral">{recipe.cuisine}</span>}
              {recipe.category && <span className="ed-badge ed-badge-neutral">{recipe.category}</span>}
              {recipe.tags?.map(tag => (
                <span key={tag} className="ed-badge" style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: '#6b665c' }}>#{tag}</span>
              ))}
            </div>
            
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.8rem', fontWeight: 700, color: '#243529', lineHeight: 1.1, marginBottom: '16px' }}>{recipe.title}</h2>
            
            {recipe.description && (
              <p style={{ fontSize: '1rem', color: '#4a5a35', lineHeight: 1.6, marginBottom: '24px' }}>
                {recipe.description}
              </p>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', marginBottom: '32px', borderTop: '1px solid #e6e1d3', borderBottom: '1px solid #e6e1d3', padding: '16px 0' }}>
              {hasTime && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b665c', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Total Time</div>
                  <div style={{ fontWeight: 600, color: '#243529' }}>{totalTime} mins</div>
                </div>
              )}
              {hasServings && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b665c', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Yields</div>
                  <div style={{ fontWeight: 600, color: '#243529' }}>{recipe.servings} Servings</div>
                </div>
              )}
              {recipe.difficulty && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b665c', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Difficulty</div>
                  <div style={{ fontWeight: 600, color: '#243529' }}>{recipe.difficulty}</div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: 'auto' }}>
              <button className={`ed-btn ${isFavorite ? 'ed-btn-primary' : 'ed-btn-outline'}`} onClick={() => onToggleFavorite(recipe)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                {isFavorite ? 'Saved' : 'Save'}
              </button>
              
              {onAddToPlanner && (
                <button className="ed-btn ed-btn-outline" onClick={() => onAddToPlanner(recipe)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Plan
                </button>
              )}

              <button className="ed-btn ed-btn-ghost" onClick={handleShare}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                Share
              </button>

              {recipe.youtubeUrl && (
                <a href={recipe.youtubeUrl} target="_blank" rel="noopener noreferrer" className="ed-btn ed-btn-ghost" style={{ marginLeft: 'auto' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Watch
                </a>
              )}
            </div>

          </div>
        </div>

        {/* Content Body */}
        <div style={{ display: 'flex', flexDirection: window.innerWidth < 768 ? 'column' : 'row', padding: '40px' }}>
          
          {/* Ingredients Column */}
          <div style={{ flex: '1', paddingRight: window.innerWidth < 768 ? '0' : '40px', borderRight: window.innerWidth < 768 ? 'none' : '1px solid #e6e1d3', marginBottom: window.innerWidth < 768 ? '40px' : '0' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#243529', margin: 0 }}>Ingredients</h3>
              
              {hasServings && (
                <div style={{ display: 'flex', alignItems: 'center', background: '#f1efe8', borderRadius: '30px', padding: '4px' }}>
                  <button onClick={() => setCurrentServings(s => Math.max(1, s - 1))} className="ed-btn-icon" style={{ padding: '4px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, width: '40px', textAlign: 'center' }}>{currentServings}</span>
                  <button onClick={() => setCurrentServings(s => s + 1)} className="ed-btn-icon" style={{ padding: '4px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
                </div>
              )}
            </div>

            <div>
              {sortedAisles.map(aisle => (
                <div key={aisle} style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b665c', marginBottom: '12px', borderBottom: '1px solid #e6e1d3', paddingBottom: '8px' }}>{aisle}</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {groupedIngredients[aisle].map(ing => {
                      const isChecked = !!checkedIngredients[ing.originalIndex];
                      let displayMeasure = ing.measure;
                      if (!displayMeasure && ing.quantity) {
                        displayMeasure = `${scaleAmount(ing.quantity)} ${ing.unit || ''}`.trim();
                      }

                      return (
                        <div key={ing.originalIndex} onClick={() => toggleIngredientCheck(ing.originalIndex)} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', padding: '6px 0', opacity: isChecked ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                          <div style={{ width: '20px', height: '20px', border: `1px solid ${isChecked ? '#243529' : '#e6e1d3'}`, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isChecked ? '#243529' : 'transparent', marginTop: '2px', flexShrink: 0 }}>
                            {isChecked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                          </div>
                          <div style={{ lineHeight: 1.5, fontSize: '1rem', color: '#14110f' }}>
                            {displayMeasure && <span style={{ fontWeight: 600, marginRight: '6px' }}>{displayMeasure}</span>}
                            <span>{ing.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
          </div>

          {/* Instructions Column */}
          <div style={{ flex: '1.2', paddingLeft: window.innerWidth < 768 ? '0' : '40px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#243529', margin: '0 0 24px 0' }}>Instructions</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {recipe.instructions?.map((inst, idx) => {
                const isDone = !!completedSteps[idx];
                return (
                  <div key={idx} onClick={() => toggleStepCompleted(idx)} style={{ display: 'flex', gap: '20px', cursor: 'pointer', opacity: isDone ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: isDone ? '#e6e1d3' : '#4a5a35', lineHeight: 1, marginTop: '4px' }}>
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.6, color: '#14110f', textDecoration: isDone ? 'line-through' : 'none' }}>
                      {inst}
                    </p>
                  </div>
                );
              })}
            </div>
            
            {recipe.sourceUrl && (
              <div style={{ marginTop: '40px' }}>
                <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer" className="ed-btn ed-btn-outline" style={{ display: 'inline-flex' }}>
                  Read Original Post
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '6px' }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              </div>
            )}
          </div>
          
        </div>
        
        {/* Footer Actions (Edit/Delete/Credit) */}
        <div style={{ backgroundColor: '#f1efe8', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e6e1d3' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            {onEdit && (
              <button onClick={() => onEdit(recipe)} className="ed-btn-ghost" style={{ fontSize: '0.85rem', padding: 0, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Edit Recipe</button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(recipe._id || recipe.id)} style={{ fontSize: '0.85rem', color: '#8a2420', background: 'none', border: 'none', padding: 0, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            )}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6b665c' }}>
            Recipe data from TheMealDB
          </div>
        </div>

      </div>
    </div>
  );
}
