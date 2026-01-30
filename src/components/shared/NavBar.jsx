// src/components/shared/NavBar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Home, Calendar, Users, LogOut } from "lucide-react";

export function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sterling-nav">
      <Link to="/" className="nav-brand">
        STERLING
      </Link>
      <div className="nav-links">
        <Link to="/" title="Dashboard"><Home size={20} /></Link>
        <Link to="/reservations/new" title="New Booking"><Calendar size={20} /></Link>
        <Link to="/members" title="Family"><Users size={20} /></Link>
      </div>
      <div className="nav-user">
        <span>{user?.name?.toUpperCase()}</span>
        <button onClick={logout} className="btn-logout" title="Logout">
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
}