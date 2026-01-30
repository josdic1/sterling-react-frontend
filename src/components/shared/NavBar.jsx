import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Home, Calendar, Users, LogOut, UserCheck, ListChecks } from "lucide-react";

export function NavBar() {
  const { user, logout, loggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sterling-nav">
      {/* 1. LEFT: BRAND (Always Child 1) */}
      <div className="nav-brand">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>STERLING</Link>
      </div>

      {/* 2. CENTER: LINKS (Always Child 2) */}
      <div className="nav-links" style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
        <Link to="/" title="Home" className={location.pathname === "/" ? "active" : ""}>
          <Home size={20} />
        </Link>
        <Link to="/reservations" title="Reservations" className={location.pathname === "/reservations" ? "active" : ""}>
          <Calendar size={20} />
        </Link>
        <Link to="/members" title="Family" className={location.pathname === "/members" ? "active" : ""}>
          <Users size={20} />
        </Link>
        <Link to="/wishlist" title="Backlog" className={location.pathname === "/wishlist" ? "active" : ""}>
          <ListChecks size={20} />
        </Link>
      </div>

      {/* 3. RIGHT: USER AREA (Always Child 3) */}
      <div className="nav-user" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {loggedIn && user ? (
          <div className="user-status-group" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="user-identity" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={16} className="status-icon" style={{ color: '#2E4A62' }} />
              <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#888' }}>AUTHORIZED:</span>
              <span className="user-name" style={{ fontSize: '0.75rem', fontWeight: 800 }}>{user.name.toUpperCase()}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="btn-logout" 
              title="End Session" 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#eb5638', padding: 0 }}
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          /* Using nav-brand style for login to keep font consistency */
          <Link to="/login" className="nav-brand" style={{ border: '1px solid #121212', padding: '4px 12px', fontSize: '0.7rem' }}>
            LOGIN
          </Link>
        )}
      </div>
    </nav>
  );
}