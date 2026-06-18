import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, Menu, X, ChevronDown, Bell, User, LogOut,
  LayoutDashboard, Heart, Clock, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { publicApi } from '../services/api';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/vehicles', label: 'Browse Cars' },
  { to: '/locations', label: 'Locations' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen]    = useState(false);
  const [notifs, setNotifs]        = useState({ notifications: [], unread: 0 });
  const [notifsOpen, setNotifsOpen]= useState(false);
  const userRef  = useRef(null);
  const notifsRef= useRef(null);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    if (user) publicApi.notifications().then(r => setNotifs(r.data.data)).catch(() => {});
  }, [user, location]);

  useEffect(() => {
    const handler = e => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
      if (notifsRef.current && !notifsRef.current.contains(e.target)) setNotifsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); setUserOpen(false); }, [location.pathname]);

  const transparent = isHome && !scrolled;

  return (
    <header className={`navbar ${transparent ? 'nav-transparent' : 'nav-solid'} ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="container nav-inner">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <motion.div className="nav-logo-icon" whileHover={{ rotate: 10 }}>
            <Car size={22} />
          </motion.div>
          <div>
            <span className="nav-logo-text">LUXEDRIVE</span>
            <span className="nav-logo-sub">Premium Car Rental</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="nav-links">
          {NAV_LINKS.map(l => (
            <Link key={l.to} to={l.to} className={`nav-link ${location.pathname.startsWith(l.to) ? 'active' : ''}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="nav-actions">
          {user ? (
            <>
              {/* Notifications */}
              <div className="nav-notif-wrap" ref={notifsRef}>
                <button className="nav-icon-btn" onClick={() => setNotifsOpen(!notifsOpen)}>
                  <Bell size={20} />
                  {notifs.unread > 0 && <span className="nav-badge">{notifs.unread}</span>}
                </button>
                <AnimatePresence>
                  {notifsOpen && (
                    <motion.div className="nav-dropdown notif-dropdown"
                      initial={{ opacity:0, y:-8, scale:.96 }} animate={{ opacity:1, y:0, scale:1 }}
                      exit={{ opacity:0, y:-8, scale:.96 }} transition={{ duration:.18 }}>
                      <div className="dropdown-header">
                        <strong>Notifications</strong>
                        <span className="badge badge-info">{notifs.unread} new</span>
                      </div>
                      {notifs.notifications.slice(0,5).map(n => (
                        <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                          onClick={() => publicApi.markRead(n.id).then(() => setNotifsOpen(false))}>
                          <div className="notif-title">{n.title}</div>
                          <div className="notif-msg">{n.message}</div>
                        </div>
                      ))}
                      {notifs.notifications.length === 0 && (
                        <div className="notif-empty">No notifications yet</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="nav-user-wrap" ref={userRef}>
                <button className="nav-user-btn" onClick={() => setUserOpen(!userOpen)}>
                  <div className="nav-avatar">{user.first_name?.[0]}</div>
                  <span className="nav-user-name">{user.first_name}</span>
                  <ChevronDown size={14} style={{ transform: userOpen ? 'rotate(180deg)' : 'none', transition: '.2s' }} />
                </button>
                <AnimatePresence>
                  {userOpen && (
                    <motion.div className="nav-dropdown user-dropdown"
                      initial={{ opacity:0, y:-8, scale:.96 }} animate={{ opacity:1, y:0, scale:1 }}
                      exit={{ opacity:0, y:-8, scale:.96 }} transition={{ duration:.18 }}>
                      <div className="dropdown-header">
                        <div className="dropdown-avatar">{user.first_name?.[0]}</div>
                        <div>
                          <div style={{ fontWeight:700, fontSize:'.9rem' }}>{user.first_name} {user.last_name}</div>
                          <div style={{ fontSize:'.75rem', color:'var(--text3)' }}>{user.email}</div>
                        </div>
                      </div>
                      <div className="dropdown-divider" />
                      <Link to="/dashboard" className="dropdown-item"><Clock size={15}/> My Bookings</Link>
                      <Link to="/profile" className="dropdown-item"><User size={15}/> Profile</Link>
                      {isAdmin() && <Link to="/admin" className="dropdown-item admin-link"><LayoutDashboard size={15}/> Admin Panel</Link>}
                      <div className="dropdown-divider" />
                      <button className="dropdown-item logout-item" onClick={() => { logout(); navigate('/'); }}>
                        <LogOut size={15}/> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
          <button className="nav-hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="mobile-menu"
            initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
            exit={{ opacity:0, height:0 }} transition={{ duration:.25 }}>
            {NAV_LINKS.map(l => (
              <Link key={l.to} to={l.to} className="mobile-link">{l.label}</Link>
            ))}
            {user ? (
              <>
                <Link to="/dashboard" className="mobile-link">My Bookings</Link>
                <Link to="/profile" className="mobile-link">Profile</Link>
                {isAdmin() && <Link to="/admin" className="mobile-link">Admin Panel</Link>}
                <button className="mobile-link mobile-logout" onClick={() => { logout(); navigate('/'); }}>Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="mobile-link">Sign In</Link>
                <Link to="/register" className="mobile-link">Get Started</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
