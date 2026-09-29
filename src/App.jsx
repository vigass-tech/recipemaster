import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import './styles/EditorialRedesign.css';
import AppNavbar from './components/AppNavbar';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';
import FloatingTimer from './components/FloatingTimer';
import RecipeDetailModal from './components/RecipeDetailModal';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import RecipesPage from './pages/RecipesPage';
import ShoppingPage from './pages/ShoppingPage';
import MealPlannerPage from './pages/MealPlannerPage';
import PantryPage from './pages/PantryPage';
import FavoritesPage from './pages/FavoritesPage';
import ProfilePage from './pages/ProfilePage';

import HomePage from './pages/HomePage';

// Services
import { favoriteService } from './services/api';

export default function App() {
  const { user } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';

  // Theme
  const [theme, setTheme] = useState(() => localStorage.getItem('rm_theme') || 'dark');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('rm_theme', theme);
  }, [theme]);

  // Toast
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };
  const dismissToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // Floating Timer
  const [timerState, setTimerState] = useState({ isActive: false, isRunning: false, secondsLeft: 0, totalSeconds: 0, label: '' });
  useEffect(() => {
    let interval = null;
    if (timerState.isActive && timerState.isRunning && timerState.secondsLeft > 0) {
      interval = setInterval(() => {
        setTimerState(prev => prev.secondsLeft <= 1 ? { ...prev, secondsLeft: 0, isRunning: false } : { ...prev, secondsLeft: prev.secondsLeft - 1 });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerState.isActive, timerState.isRunning, timerState.secondsLeft]);

  const handleStartTimer = (minutes, label) => {
    const total = minutes * 60;
    setTimerState({ isActive: true, isRunning: true, secondsLeft: total, totalSeconds: total, label });
    addToast(`⏱️ Timer started: ${minutes}m for ${label}`, 'success');
  };

  // Global favorites (backend-backed when logged in)
  const [favorites, setFavorites] = useState({});
  useEffect(() => {
    if (user) {
      favoriteService.getAll().then(list => {
        const map = {};
        list.forEach(r => { map[r._id] = r; });
        setFavorites(map);
      }).catch(() => {});
    } else {
      setFavorites({});
    }
  }, [user]);

  const toggleFavorite = async (recipe) => {
    try {
      const res = await favoriteService.toggle(recipe._id);
      if (res.favorited) {
        setFavorites(prev => ({ ...prev, [recipe._id]: recipe }));
        addToast(`❤️ Saved ${recipe.title}!`, 'success');
      } else {
        setFavorites(prev => { const u = { ...prev }; delete u[recipe._id]; return u; });
        addToast(`Removed from favorites`, 'info');
      }
    } catch { addToast('Failed to update favorites', 'error'); }
  };

  // Global selected recipe for detail modal
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [onDeleteCallback, setOnDeleteCallback] = useState(null);
  const [onEditCallback, setOnEditCallback] = useState(null);

  const openRecipe = (recipe, onDelete, onEdit) => {
    setSelectedRecipe(recipe);
    setOnDeleteCallback(() => onDelete);
    setOnEditCallback(() => onEdit);
  };

  return (
    <div className="app-root" data-theme={theme}>
      {/* Navbar only shown when logged in and NOT on the Home page */}
      {!isHome && user && <AppNavbar />}

      <main className={!isHome && user ? 'main-with-nav' : ''}>
        <Routes>
          {/* Public Home */}
          <Route path="/" element={<HomePage />} />

          {/* Auth */}
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage onSelectRecipe={openRecipe} /></ProtectedRoute>} />
          <Route path="/recipes" element={<ProtectedRoute><RecipesPage favorites={favorites} onToggleFavorite={toggleFavorite} onSelectRecipe={openRecipe} showToast={addToast} /></ProtectedRoute>} />
          <Route path="/shopping" element={<ProtectedRoute><ShoppingPage showToast={addToast} /></ProtectedRoute>} />
          <Route path="/planner" element={<ProtectedRoute><MealPlannerPage showToast={addToast} /></ProtectedRoute>} />
          <Route path="/pantry" element={<ProtectedRoute><PantryPage showToast={addToast} /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><FavoritesPage onSelectRecipe={openRecipe} showToast={addToast} /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage showToast={addToast} /></ProtectedRoute>} />

          {/* Redirect missing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          isFavorite={Boolean(favorites[selectedRecipe._id])}
          onToggleFavorite={toggleFavorite}
          onStartTimer={handleStartTimer}
          onEdit={(rec) => { if (onEditCallback) onEditCallback(rec); setSelectedRecipe(null); }}
          onDelete={(id) => { if (onDeleteCallback) onDeleteCallback(id); setSelectedRecipe(null); }}
          onAddToPlanner={() => setSelectedRecipe(null)}
          showToast={addToast}
        />
      )}

      {/* Floating Timer */}
      <FloatingTimer
        timerState={timerState}
        onPause={() => setTimerState(p => ({ ...p, isRunning: false }))}
        onResume={() => setTimerState(p => ({ ...p, isRunning: true }))}
        onReset={() => setTimerState(p => ({ ...p, secondsLeft: p.totalSeconds, isRunning: false }))}
        onDismiss={() => setTimerState(p => ({ ...p, isActive: false, secondsLeft: 0 }))}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
