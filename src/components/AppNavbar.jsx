import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../pages/DashboardRedesign.css'; // Use the redesign CSS

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/recipes', label: 'Recipes' },
  { to: '/shopping', label: 'Shopping' },
  { to: '/planner', label: 'Planner' },
  { to: '/pantry', label: 'Pantry' },
  { to: '/favorites', label: 'Favorites' }
];

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="new-navbar">
      <div className="new-navbar-inner">
        <Link to="/dashboard" className="new-navbar-brand">RecipeMaster</Link>
        
        <div className="new-navbar-center desktop-only">
          {NAV_LINKS.map(l => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `new-nav-link ${isActive ? 'active' : ''}`}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="new-navbar-right desktop-only">
          <Link to="/recipes" className="new-nav-icon" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </Link>
          <Link to="/shopping" className="new-nav-icon" aria-label="Shopping List">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </Link>
          <Link to="/profile" className="new-nav-icon" aria-label="Profile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </Link>
          <button onClick={handleLogout} className="new-nav-text-btn">Sign out</button>
        </div>

        <button className="hamburger mobile-only" onClick={() => setMenuOpen(!menuOpen)} style={{background:'none',border:'none',cursor:'pointer'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14110f" strokeWidth="1.5"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
        </button>
      </div>

      {menuOpen && (
        <div style={{ position: 'absolute', top: '64px', left: 0, right: 0, background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.1)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 99 }}>
          {NAV_LINKS.map(l => (
            <NavLink key={l.to} to={l.to} style={{ textDecoration: 'none', color: '#14110f', fontSize: '1rem' }} onClick={() => setMenuOpen(false)}>{l.label}</NavLink>
          ))}
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#e05a47', textAlign: 'left', fontSize: '1rem', padding: 0, cursor: 'pointer' }}>Sign out</button>
        </div>
      )}
    </nav>
  );
}
