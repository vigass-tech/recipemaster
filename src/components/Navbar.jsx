import React from 'react';

export default function Navbar({
  currentView,
  setCurrentView,
  favoritesCount,
  openCreateModal,
  dbStatus,
  theme,
  toggleTheme,
  onResetSeed
}) {
  return (
    <header className="navbar">
      <div className="content-container nav-inner">
        {/* Brand */}
        <div className="brand" onClick={() => setCurrentView('discover')}>
          <div className="brand-icon">🍳</div>
          <div className="brand-name">
            Recipe<span>Master</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav>
          <ul className="nav-links">
            <li
              className={`nav-item ${currentView === 'discover' ? 'active' : ''}`}
              onClick={() => setCurrentView('discover')}
            >
              <span>🍽️</span> Discover
            </li>
            <li
              className={`nav-item ${currentView === 'planner' ? 'active' : ''}`}
              onClick={() => setCurrentView('planner')}
            >
              <span>📅</span> Meal Planner
            </li>
            <li
              className={`nav-item ${currentView === 'favorites' ? 'active' : ''}`}
              onClick={() => setCurrentView('favorites')}
            >
              <span>❤️</span> Saved
              {favoritesCount > 0 && (
                <span className="badge badge-primary" style={{ padding: '2px 7px', fontSize: '0.72rem' }}>
                  {favoritesCount}
                </span>
              )}
            </li>
          </ul>
        </nav>

        {/* Actions & Utilities */}
        <div className="nav-actions">
          {/* DB Status Pill */}
          <div
            className="status-indicator"
            title={
              dbStatus?.isMongoConnected
                ? 'Connected to MongoDB Database'
                : 'Running in In-Memory Mode with Seed Fallback'
            }
          >
            <span
              className={`status-dot ${dbStatus?.isMongoConnected ? '' : 'fallback'}`}
            ></span>
            <span>{dbStatus?.isMongoConnected ? 'MongoDB' : 'Live Demo / Mock DB'}</span>
          </div>

          {/* Theme Toggle */}
          <button
            className="btn btn-secondary btn-icon"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Add Recipe Button */}
          <button className="btn btn-primary" onClick={openCreateModal}>
            <span>+</span> Create Recipe
          </button>
        </div>
      </div>
    </header>
  );
}
