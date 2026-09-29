import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/api';
import './DashboardRedesign.css';

export default function DashboardPage({ onSelectRecipe }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    dashboardService.get()
      .then(data => setStats(data))
      .catch(err => setError(err.message || 'Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/recipes?q=${encodeURIComponent(search.trim())}`);
  };

  const featuredList = stats?.recommended?.slice(0, 5) || [];
  const featured = featuredList[featuredIndex] || null;

  // Auto-advance
  useEffect(() => {
    if (isHovered || featuredList.length <= 1) return;
    const timer = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % featuredList.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [isHovered, featuredList.length]);

  // Fallbacks if data empty
  const hasRecommendations = featuredList.length > 0;
  
  const formatTime = (prep, cook) => {
    const total = (prep || 0) + (cook || 0);
    return total > 0 ? `${total} min` : 'N/A';
  };

  const getDayDays = (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (error) {
    return (
      <div className="db-page">
        <div className="db-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
          <h2>Oops! Something went wrong.</h2>
          <p>{error}</p>
          <button className="db-btn" onClick={() => window.location.reload()} style={{ marginTop: '20px' }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="db-page">
      <div className="db-container">

        {/* HERO SECTION */}
        <div className="db-hero-wrapper" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          <div className="db-hero-panel">
            <form className="db-search-bar" onSubmit={handleSearch}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input type="text" placeholder="Search recipes or ingredients..." value={search} onChange={e => setSearch(e.target.value)} />
            </form>
            
            <div className="db-eyebrow">WELCOME BACK, {user?.name?.split(' ')[0] || 'CHEF'}</div>
            
            {loading ? (
              <>
                <div className="db-skeleton db-sk-title"></div>
                <div className="db-skeleton db-sk-text"></div>
                <div className="db-skeleton db-sk-text" style={{width: '60%'}}></div>
              </>
            ) : hasRecommendations ? (
              <>
                <h1 className="db-hero-title">{featured?.title || 'Discover New Flavors'}</h1>
                <p className="db-hero-desc">
                  {featured?.instructions?.[0] || 'An incredible recipe carefully selected to match your current pantry and culinary preferences. Try this delicious meal today.'}
                </p>
                <div className="db-hero-meta">
                  <div className="db-meta-item">
                    <span className="db-meta-label">Cuisine</span>
                    <span className="db-meta-value">{featured?.cuisine || 'Global'}</span>
                  </div>
                  <div className="db-meta-item">
                    <span className="db-meta-label">Category</span>
                    <span className="db-meta-value">{featured?.category || 'Dinner'}</span>
                  </div>
                  <div className="db-meta-item">
                    <span className="db-meta-label">Cooking Time</span>
                    <span className="db-meta-value">{formatTime(featured?.preparationTime, featured?.cookingTime)}</span>
                  </div>
                </div>
                <button className="db-btn" onClick={() => onSelectRecipe?.(featured)}>View recipe</button>
              </>
            ) : (
              <>
                <h1 className="db-hero-title">Start your culinary journey</h1>
                <p className="db-hero-desc">Add some ingredients to your pantry or search for recipes to get personalized recommendations right here on your dashboard.</p>
                <Link to="/recipes" className="db-btn">Explore recipes</Link>
              </>
            )}
          </div>

          <div className="db-hero-image-area">
            {loading ? (
              <div className="db-image-circle db-skeleton"></div>
            ) : (
              <div className="db-image-circle">
                <img src={featured?.image || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80'} alt="Featured recipe" />
                
                {/* Hotspots for ingredients */}
                {featured?.ingredients?.slice(0, 3).map((ing, i) => {
                  const positions = [
                    { top: '30%', left: '20%' },
                    { top: '70%', left: '40%' },
                    { top: '40%', right: '20%' }
                  ];
                  const pos = positions[i];
                  return (
                    <div key={i} className="db-hotspot" style={pos} tabIndex="0">
                      <div className="db-hotspot-inner">+</div>
                      <div className="db-hotspot-card">{ing.name}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && hasRecommendations && (
              <div className="db-selector">
                {featuredList.map((rec, idx) => (
                  <div key={rec._id} className={`db-selector-item ${idx === featuredIndex ? 'active' : ''}`} onClick={() => setFeaturedIndex(idx)}>
                    <div className="db-selector-bar"></div>
                    <span>{rec.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* THUMBNAILS ROW */}
        {!loading && featuredList.length > 0 && (
          <div className="db-thumbnails">
            {featuredList.map((rec, idx) => (
              <div key={rec._id} className={`db-thumb-card ${idx === featuredIndex ? 'active' : ''}`} onClick={() => setFeaturedIndex(idx)}>
                <img src={rec.image || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=150&q=80'} className="db-thumb-img" alt={rec.title} />
                <div className="db-thumb-info">
                  <h4>{rec.title}</h4>
                  <p>{formatTime(rec.preparationTime, rec.cookingTime)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STATS ROW */}
        <div className="db-stats-row">
          <div className="db-stat-item">
            <svg className="db-stat-icon" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <div>
              <div className="db-stat-num">{loading ? '-' : stats?.totalRecipes || 0}</div>
              <div className="db-stat-label">Total Recipes</div>
            </div>
          </div>
          <div className="db-stat-item">
            <svg className="db-stat-icon" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M10 14h4"/></svg>
            <div>
              <div className="db-stat-num">{loading ? '-' : stats?.pantryCount || 0}</div>
              <div className="db-stat-label">Pantry Items</div>
            </div>
          </div>
          <div className="db-stat-item">
            <svg className="db-stat-icon" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <div>
              <div className="db-stat-num">{loading ? '-' : stats?.favoritesCount || 0}</div>
              <div className="db-stat-label">Favorites</div>
            </div>
          </div>
          <div className="db-stat-item">
            <svg className="db-stat-icon" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <div>
              <div className="db-stat-num">{loading ? '-' : stats?.plannedMeals || 0}</div>
              <div className="db-stat-label">Planned Meals</div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTIONS */}
        <div className="db-bottom-grid">
          {/* Expiring Soon */}
          <div className="db-card">
            <h2 className="db-card-title">Expiring Soon</h2>
            {loading ? (
              <div className="db-skeleton db-sk-text"></div>
            ) : stats?.expiringItems?.length > 0 ? (
              <div className="db-list">
                {stats.expiringItems.slice(0, 5).map(item => {
                  const days = getDayDays(item.expiryDate);
                  return (
                    <div key={item._id} className="db-list-item">
                      <div>
                        <div style={{fontWeight: 600, fontSize: '0.95rem'}}>{item.name}</div>
                        <div style={{fontSize: '0.8rem', color: '#7c9483'}}>{item.amount} {item.unit}</div>
                      </div>
                      <span className={`db-badge ${days <= 1 ? 'red' : 'orange'}`}>
                        {days < 0 ? 'Expired' : days === 0 ? 'Today' : `In ${days} days`}
                      </span>
                    </div>
                  );
                })}
                {stats.expiringItems.length > 5 && (
                  <Link to="/pantry" style={{display: 'block', textAlign: 'center', marginTop: '16px', color: '#7c9483', fontSize: '0.85rem', textDecoration: 'none'}}>View all expiring items</Link>
                )}
              </div>
            ) : (
              <div className="db-empty">
                <p>You have no items expiring soon.</p>
                <Link to="/pantry" className="db-empty-btn">Update Pantry</Link>
              </div>
            )}
          </div>

          {/* Today's Meals */}
          <div className="db-card">
            <h2 className="db-card-title">Today's Meals</h2>
            {loading ? (
              <div className="db-skeleton db-sk-text"></div>
            ) : (
              <div className="db-list">
                {['Breakfast', 'Lunch', 'Dinner'].map(meal => {
                  const found = stats?.todayMeals?.find(m => m.mealType === meal);
                  return (
                    <div key={meal} className="db-list-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                        <div style={{ width: '80px', fontSize: '0.85rem', color: '#7c9483', fontWeight: 600, textTransform: 'uppercase' }}>{meal}</div>
                        {found?.recipeId ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 }} onClick={() => onSelectRecipe?.(found.recipeId)}>
                            {found.recipeId.image && <img src={found.recipeId.image} alt="" style={{width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover'}} />}
                            <span style={{fontWeight: 600, fontSize: '0.95rem'}}>{found.recipeId.title}</span>
                          </div>
                        ) : (
                          <div style={{ flex: 1 }}>
                            <Link to="/planner" style={{color: '#9ab4a3', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px'}}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                              Add meal
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
