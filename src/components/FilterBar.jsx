import React from 'react';

export default function FilterBar({
  category,
  setCategory,
  cuisine,
  setCuisine,
  diet,
  setDiet,
  difficulty,
  setDifficulty,
  maxTime,
  setMaxTime,
  sort,
  setSort,
  cuisinesList = [],
  categoriesList = [],
  resetFilters,
  hasActiveFilters,
  resultsCount
}) {
  // Common categories for fast filtering
  const defaultCategories = [
    { label: '🍽️ All', value: 'All' },
    { label: '🌱 Vegetarian', value: 'Vegetarian' },
    { label: '🍗 Chicken', value: 'Chicken' },
    { label: '🥩 Beef', value: 'Beef' },
    { label: '🐟 Seafood', value: 'Seafood' },
    { label: '🍝 Pasta', value: 'Pasta' },
    { label: '🍰 Dessert', value: 'Dessert' },
    { label: '🥞 Breakfast', value: 'Breakfast' }
  ];

  const chips = categoriesList.length > 0
    ? [{ label: '🍽️ All', value: 'All' }, ...categoriesList.map(c => ({ label: c.name, value: c.name }))]
    : defaultCategories;

  return (
    <div className="filter-bar">
      {/* Category Horizontal Chips */}
      <div className="category-chips">
        {chips.slice(0, 10).map((c) => (
          <button
            key={c.value}
            className={`chip ${category === c.value ? 'active' : ''}`}
            onClick={() => setCategory(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Dropdown Filters & Sort */}
      <div className="filter-controls-row">
        <div className="filter-dropdowns">
          {/* Cuisine Select */}
          <select
            className="filter-select"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
          >
            <option value="All">🌍 All Cuisines</option>
            {cuisinesList.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.count})
              </option>
            ))}
          </select>

          {/* Diet Select */}
          <select
            className="filter-select"
            value={diet || 'All'}
            onChange={(e) => setDiet(e.target.value)}
          >
            <option value="All">🥗 All Diets</option>
            <option value="Vegetarian">🌱 Vegetarian</option>
            <option value="Non-vegetarian">🍖 Non-vegetarian</option>
          </select>

          {/* Category Dropdown (if more categories exist) */}
          {categoriesList.length > 10 && (
            <select
              className="filter-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="All">📂 All Categories</option>
              {categoriesList.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.count})
                </option>
              ))}
            </select>
          )}

          {/* Difficulty Select */}
          <select
            className="filter-select"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="All">🎯 All Difficulties</option>
            <option value="Easy">🟢 Easy</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Hard">🔴 Hard</option>
          </select>

          {/* Max Time Select */}
          <select
            className="filter-select"
            value={maxTime}
            onChange={(e) => setMaxTime(e.target.value)}
          >
            <option value="">⏱️ Any Cook Time</option>
            <option value="20">⚡ Under 20 mins</option>
            <option value="35">⏱️ Under 35 mins</option>
            <option value="50">🍲 Under 50 mins</option>
          </select>

          {/* Sort By Select */}
          <select
            className="filter-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">✨ Newest First</option>
            <option value="fastest">⚡ Fastest Total Time</option>
            <option value="title">🔤 Title (A - Z)</option>
          </select>

          {hasActiveFilters && (
            <button className="btn btn-ghost btn-sm" onClick={resetFilters}>
              ✕ Reset
            </button>
          )}
        </div>

        <div className="filter-meta">
          <span>Showing <strong>{resultsCount}</strong> recipes</span>
        </div>
      </div>
    </div>
  );
}
