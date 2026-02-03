import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  Home,
  Calendar,
  PlusCircle, // <--- NEW ICON for "New Reservation"
  Users,
  LogOut,
  UserCheck,
  FileText,
  Shield,
} from "lucide-react";

export function NavBar() {
  const { user, logout, loggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleHelpClick = () => {
    if (window.openTutorial) {
      window.openTutorial();
    }
  };

  return (
    <nav className="sterling-nav">
      {/* 1. LEFT: BRAND */}
      <div className="nav-brand">
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          STERLING
        </Link>
      </div>

      {/* 2. CENTER: LINKS */}
      <div
        className="nav-links"
        style={{
          display: "flex",
          gap: "clamp(0.75rem, 3vw, 2rem)",
          justifyContent: "center",
        }}
      >
        <Link
          to="/"
          className={`nav-link-with-tooltip ${location.pathname === "/" ? "active" : ""}`}
          data-tooltip="Home"
        >
          <Home size={20} />
        </Link>

        {/* --- NEW CALENDAR LINK --- */}
        <Link
          to="/calendar"
          className={`nav-link-with-tooltip ${location.pathname === "/calendar" ? "active" : ""}`}
          data-tooltip="Calendar"
        >
          <Calendar size={20} />
        </Link>
        {/* ------------------------- */}

        <Link
          to="/reservations/new"
          className={`nav-link-with-tooltip ${location.pathname === "/reservations/new" ? "active" : ""}`}
          data-tooltip="New Reservation"
        >
          {/* Changed to PlusCircle to distinguish from Calendar */}
          <PlusCircle size={20} />
        </Link>

        <Link
          to="/members"
          className={`nav-link-with-tooltip ${location.pathname === "/members" ? "active" : ""}`}
          data-tooltip="Family"
        >
          <Users size={20} />
        </Link>
        <Link
          to="/rules"
          className={`nav-link-with-tooltip ${location.pathname === "/rules" ? "active" : ""}`}
          data-tooltip="Rules & Fees"
        >
          <FileText size={20} />
        </Link>

        {/* ADMIN LINK - Only show if user is admin */}
        {loggedIn && user?.is_admin && (
          <Link
            to="/admin"
            className={`nav-link-with-tooltip admin-nav-link ${location.pathname === "/admin" ? "active" : ""}`}
            data-tooltip="Admin Dashboard"
          >
            <Shield size={20} />
          </Link>
        )}
      </div>

      {/* 3. RIGHT: USER AREA + HELP BUTTON */}
      <div
        className="nav-user"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          justifyContent: "flex-end",
        }}
      >
        {/* HELP BUTTON - Always visible when logged in */}
        {loggedIn && (
          <button
            onClick={handleHelpClick}
            className="help-btn"
            title="Open Tutorial"
          >
            <div className="help-icon">?</div>
            <span className="help-text">Help</span>
          </button>
        )}

        {loggedIn && user ? (
          <div
            className="user-status-group"
            style={{ display: "flex", alignItems: "center", gap: "15px" }}
          >
            <div
              className="user-identity"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <UserCheck
                size={16}
                className="status-icon"
                style={{ color: "#2E4A62" }}
              />
              <span
                style={{ fontSize: "0.65rem", fontWeight: 900, color: "#888" }}
              >
                {user.is_admin ? "ADMIN:" : "AUTHORIZED:"}
              </span>
              <span
                className="user-name"
                style={{ fontSize: "0.75rem", fontWeight: 800 }}
              >
                {user.name.toUpperCase()}
              </span>
              {user.is_admin && (
                <Shield
                  size={14}
                  style={{ color: "#eb5638", marginLeft: "4px" }}
                  title="Admin User"
                />
              )}
            </div>
            <button
              onClick={handleLogout}
              className="btn-logout"
              title="End Session"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#eb5638",
                padding: 0,
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="nav-brand"
            style={{
              border: "1px solid #121212",
              padding: "4px 12px",
              fontSize: "0.7rem",
            }}
          >
            LOGIN
          </Link>
        )}
      </div>
    </nav>
  );
}
