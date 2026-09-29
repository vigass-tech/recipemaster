import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { favoriteService } from '../services/api';
import RecipeCard from '../components/RecipeCard';

export default function FavoritesPage({ onSelectRecipe, showToast }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setFavorites(await favoriteService.getAll()); }
    catch { showToast?.('Failed to load favorites', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (recipe) => {
    try {
      const res = await favoriteService.toggle(recipe._id);
      if (!res.favorited) {
        setFavorites(prev => prev.filter(r => r._id !== recipe._id));
      }
      showToast?.(res.favorited ? 'Added to Favorites' : 'Removed from Favorites', 'info');
    } catch { showToast?.('Failed to update favorites', 'error'); }
  };

  return (
    <div className="ed-page-container">
      <div className="ed-page-header">
        <div>
          <span className="ed-page-eyebrow">Your Collection</span>
          <h1 className="ed-page-title">Favorites</h1>
          <p className="ed-page-subtitle">Your personally curated list of {favorites.length} go-to recipes.</p>
        </div>
      </div>

      {loading ? (
        <div className="ed-grid">
          {[1,2,3,4].map(i => (
            <div key={i} className="ed-card">
              <div className="ed-skeleton" style={{ paddingTop: '75%', borderRadius: '12px 12px 0 0' }}></div>
              <div style={{ padding: '16px' }}>
                <div className="ed-skeleton" style={{ height: '24px', width: '80%', marginBottom: '12px' }}></div>
                <div className="ed-skeleton" style={{ height: '16px', width: '40%' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="ed-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          <h3>No favorites yet</h3>
          <p>Browse the recipe collection and tap the heart icon to save your favorites here for quick access.</p>
          <Link to="/recipes" className="ed-btn ed-btn-primary">Browse recipes</Link>
        </div>
      ) : (
        <div className="ed-grid">
          {favorites.map(r => (
            <RecipeCard
              key={r._id}
              recipe={r}
              onSelect={onSelectRecipe}
              isFavorite={true}
              onToggleFavorite={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
