import React from 'react';

export default function HeroBanner({
  searchQuery,
  setSearchQuery,
  quickTag,
  setQuickTag,
  totalRecipes
}) {
  const quickTags = [
    { label: 'All Recipes', tag: '' },
    { label: '⚡ Quick & Easy', tag: 'Quick & Easy' },
    { label: '🥩 High-Protein', tag: 'High-Protein' },
    { label: '🌱 Vegan', tag: 'Vegan' },
    { label: '🥗 Gluten-Free', tag: 'Gluten-Free' },
    { label: '👑 Chef Specials', tag: "Chef's Special" }
  ];

  return (
    <section className="hero-section">
      <div className="content-container">
        <div className="hero-content">
          <div className="hero-pill">
            <span>✨</span> Handcrafted Culinary Collection • {totalRecipes} Recipes Ready
          </div>

          <h1 className="hero-title">
            Craft Gourmet Meals,<br />
            <span>Master Every Recipe.</span>
          </h1>

          <p className="hero-subtitle">
            Explore chef-curated dishes, dynamically scale ingredients to your party size,
            cook with integrated smart timers, and organize your weekly meals effortlessly.
          </p>

          {/* Search Bar */}
          <div className="search-bar-wrap">
            <span className="search-icon-left">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by recipe name, ingredient (salmon, basil), or cuisine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Clear Search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filter Tags */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '20px' }}>
            {quickTags.map((item) => (
              <button
                key={item.tag || 'all'}
                className={`chip ${quickTag === item.tag ? 'active' : ''}`}
                onClick={() => setQuickTag(item.tag)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
