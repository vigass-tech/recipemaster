import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import CreateRecipeModal from '../components/CreateRecipeModal';
import { recipeService } from '../services/api';

// Inline FilterBar specifically for RecipesPage to meet the "drawer on mobile" requirement cleanly
function EditorialFilterBar({ category, setCategory, cuisine, setCuisine, diet, setDiet, difficulty, setDifficulty, maxTime, setMaxTime, sort, setSort, cuisinesList, categoriesList, resetFilters, hasActiveFilters }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ marginBottom: '32px' }}>
      <button className="ed-btn ed-btn-outline mobile-only" style={{ width: '100%', marginBottom: '16px' }} onClick={() => setIsOpen(!isOpen)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        {isOpen ? 'Hide Filters' : 'Show Filters'}
      </button>

      <div className={`desktop-only ${isOpen ? 'mobile-only' : ''}`} style={{ display: isOpen ? 'flex' : undefined, flexDirection: 'column', gap: '16px', background: '#f1efe8', padding: '24px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <div className="ed-input-wrapper" style={{ flex: 1, minWidth: '150px', margin: 0 }}>
            <label className="ed-label">Category</label>
            <select className="ed-input ed-select" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="All">All Categories</option>
              {categoriesList.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="ed-input-wrapper" style={{ flex: 1, minWidth: '150px', margin: 0 }}>
            <label className="ed-label">Cuisine</label>
            <select className="ed-input ed-select" value={cuisine} onChange={e => setCuisine(e.target.value)}>
              <option value="All">All Cuisines</option>
              {cuisinesList.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="ed-input-wrapper" style={{ flex: 1, minWidth: '150px', margin: 0 }}>
            <label className="ed-label">Diet</label>
            <select className="ed-input ed-select" value={diet} onChange={e => setDiet(e.target.value)}>
              <option value="All">All Diets</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Non-Vegetarian">Non-Vegetarian</option>
            </select>
          </div>
          <div className="ed-input-wrapper" style={{ flex: 1, minWidth: '150px', margin: 0 }}>
            <label className="ed-label">Difficulty</label>
            <select className="ed-input ed-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option value="All">Any Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div className="ed-input-wrapper" style={{ flex: 1, minWidth: '150px', margin: 0 }}>
            <label className="ed-label">Time (Max)</label>
            <select className="ed-input ed-select" value={maxTime} onChange={e => setMaxTime(e.target.value)}>
              <option value="">Any Time</option>
              <option value="15">15 mins</option>
              <option value="30">30 mins</option>
              <option value="60">1 hour</option>
            </select>
          </div>
          <div className="ed-input-wrapper" style={{ flex: 1, minWidth: '150px', margin: 0 }}>
            <label className="ed-label">Sort</label>
            <select className="ed-input ed-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button className="ed-btn ed-btn-ghost" onClick={resetFilters}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RecipesPage({ favorites, onToggleFavorite, onSelectRecipe, showToast }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cuisinesList, setCuisinesList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [searchQuery, setSearchQuery] = useState(params.get('q') || '');
  const [category, setCategory] = useState('All');
  const [cuisine, setCuisine] = useState('All');
  const [diet, setDiet] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [maxTime, setMaxTime] = useState('');
  const [sort, setSort] = useState('newest');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = {};
      if (searchQuery.trim()) p.q = searchQuery.trim();
      if (category !== 'All') p.category = category;
      if (cuisine !== 'All') p.cuisine = cuisine;
      if (diet !== 'All') p.diet = diet;
      if (difficulty !== 'All') p.difficulty = difficulty;
      if (maxTime) p.maxTime = maxTime;
      if (sort) p.sort = sort;
      setRecipes(await recipeService.getRecipes(p));
    } catch (err) {
      setError('Failed to load recipes. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, category, cuisine, diet, difficulty, maxTime, sort]);

  useEffect(() => {
    recipeService.getCuisines().then(c => setCuisinesList(c || [])).catch(() => {});
    recipeService.getCategories().then(c => setCategoriesList(c || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchRecipes, 250);
    return () => clearTimeout(t);
  }, [fetchRecipes]);

  const resetFilters = () => {
    setSearchQuery('');
    setCategory('All');
    setCuisine('All');
    setDiet('All');
    setDifficulty('All');
    setMaxTime('');
    setSort('newest');
  };

  const hasActiveFilters = Boolean(
    searchQuery || category !== 'All' || cuisine !== 'All' || diet !== 'All' || difficulty !== 'All' || maxTime || sort !== 'newest'
  );

  const handleSave = async (data, id) => {
    try {
      if (id) { await recipeService.updateRecipe(id, data); showToast?.('Recipe updated!', 'success'); }
      else { await recipeService.createRecipe(data); showToast?.('Recipe published!', 'success'); }
      fetchRecipes();
      setIsCreateOpen(false);
      setEditingRecipe(null);
    } catch { showToast?.('Failed to save recipe', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    try {
      await recipeService.deleteRecipe(id);
      showToast?.('Recipe deleted.', 'info');
      fetchRecipes();
    } catch { showToast?.('Failed to delete', 'error'); }
  };

  return (
    <div className="ed-page-container">
      
      {/* Page Header */}
      <div className="ed-page-header">
        <div>
          <span className="ed-page-eyebrow">Your Collection</span>
          <h1 className="ed-page-title">Recipes</h1>
          <p className="ed-page-subtitle">{recipes.length} delicious dishes waiting for you</p>
        </div>
        <button className="ed-btn ed-btn-primary" onClick={() => { setEditingRecipe(null); setIsCreateOpen(true); }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Recipe
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b665c" strokeWidth="2" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <input
          type="text"
          className="ed-input"
          style={{ width: '100%', paddingLeft: '48px', paddingRight: '16px', height: '56px', borderRadius: '30px' }}
          placeholder="Search by recipe name, ingredient or cuisine..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <EditorialFilterBar
        category={category} setCategory={setCategory}
        cuisine={cuisine} setCuisine={setCuisine}
        diet={diet} setDiet={setDiet}
        difficulty={difficulty} setDifficulty={setDifficulty}
        maxTime={maxTime} setMaxTime={setMaxTime}
        sort={sort} setSort={setSort}
        cuisinesList={cuisinesList} categoriesList={categoriesList}
        resetFilters={resetFilters} hasActiveFilters={hasActiveFilters}
      />

      {error ? (
        <div className="ed-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className="ed-btn ed-btn-outline" onClick={fetchRecipes}>Retry</button>
        </div>
      ) : loading ? (
        <div className="ed-grid">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="ed-card">
              <div className="ed-skeleton" style={{ paddingTop: '75%', borderRadius: '12px 12px 0 0' }}></div>
              <div style={{ padding: '16px' }}>
                <div className="ed-skeleton" style={{ height: '24px', width: '80%', marginBottom: '12px' }}></div>
                <div className="ed-skeleton" style={{ height: '16px', width: '40%' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="ed-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <h3>No recipes found</h3>
          <p>We couldn't find any recipes matching your current filters.</p>
          <button className="ed-btn ed-btn-outline" onClick={resetFilters}>Clear Filters</button>
        </div>
      ) : (
        <div className="ed-grid">
          {recipes.map(r => (
            <RecipeCard
              key={r._id}
              recipe={r}
              onSelect={recipe => onSelectRecipe?.(recipe, handleDelete, rec => { setEditingRecipe(rec); setIsCreateOpen(true); })}
              isFavorite={Boolean(favorites?.[r._id])}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Credit Line */}
      {!loading && recipes.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '60px', color: '#6b665c', fontSize: '0.85rem' }}>
          Recipe data from TheMealDB
        </div>
      )}

      {/* Note: I'm keeping CreateRecipeModal untouched in this component replacement to prevent breaking it, it will be handled in step 3 */}
      <CreateRecipeModal
        isOpen={isCreateOpen}
        onClose={() => { setIsCreateOpen(false); setEditingRecipe(null); }}
        onSave={handleSave}
        initialData={editingRecipe}
      />
    </div>
  );
}
