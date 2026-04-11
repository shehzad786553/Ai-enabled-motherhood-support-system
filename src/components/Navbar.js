import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const NAV_LINKS = [
  { path: '/dashboard',    label: 'Dashboard',   icon: '🏠' },
  { path: '/exercise',     label: 'Exercise',    icon: '🏃' },
  { path: '/water',        label: 'Water',       icon: '💧' },
  { path: '/embryo',       label: 'Baby Growth', icon: '🧬' },
  { path: '/predict',      label: 'AI Predict',  icon: '🩺' },
  { path: '/appointments', label: 'Appointments',icon: '📅' },
  { path: '/emergency',    label: 'Emergency',   icon: '🚨' },
];

export default function Navbar({ isApp }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const weekNum = user?.pregnancyWeek || 12;
  const month   = Math.ceil(weekNum / 4.3);

  return (
    <nav className={`navbar ${scrolled || isApp ? 'navbar--solid' : ''} ${isApp ? 'navbar--app' : ''}`}>
      <div className="navbar__inner">
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} className="navbar__logo">
          <span className="navbar__logo-icon">🌸</span>
          <span className="navbar__logo-text">MomCare <em>AI</em></span>
        </Link>

        {/* App nav links */}
        {isApp && (
          <div className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
            {NAV_LINKS.map(l => (
              <Link
                key={l.path}
                to={l.path}
                className={`navbar__link ${location.pathname === l.path ? 'navbar__link--active' : ''} ${l.path === '/emergency' ? 'navbar__link--sos' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <span className="navbar__link-icon">{l.icon}</span>
                <span className="navbar__link-label">{l.label}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Public nav */}
        {!isApp && (
          <div className="navbar__public-links">
            <a href="#features" className="navbar__public-link">Features</a>
            <a href="#how-it-works" className="navbar__public-link">How It Works</a>
            <a href="#about" className="navbar__public-link">About</a>
          </div>
        )}

        {/* Right side */}
        <div className="navbar__right">
          {user ? (
            <div className="navbar__user">
              <div className="navbar__user-info">
                <span className="navbar__user-name">Hi, {user.name?.split(' ')[0]} 👋</span>
                <span className="navbar__user-week">Month {month}</span>
              </div>
              <button className="navbar__logout btn btn-outline" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar__auth-btns">
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </div>
          )}
          <button className="navbar__hamburger" onClick={() => setMenuOpen(o => !o)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
}
