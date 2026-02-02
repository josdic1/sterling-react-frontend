// src/components/layout/NavBar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { HelpButton } from "./TutorialModal";
import {
  Home,
  Calendar,
  Users,
  LogOut,
  UserCheck,
  FileText,
  // ListTodo, // Uncomment if using Wishlist
} from "lucide-react";

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
        <Link
          to="/reservations/new"
          className={`nav-link-with-tooltip ${location.pathname === "/reservations/new" ? "active" : ""}`}
          data-tooltip="New Reservation"
        >
          <Calendar size={20} />
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
      </div>

      {/* 3. RIGHT: USER INFO & HELP */}
      <div
        className="nav-user"
        style={{ display: "flex", justifyContent: "flex-end" }}
      >
        {loggedIn && user ? (
          <div
            className="user-status-group"
            style={{ display: "flex", alignItems: "center", gap: "15px" }}
          >
            {/* ADDED HELP BUTTON HERE */}
            <HelpButton />

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
                AUTHORIZED:
              </span>
              <span
                className="user-name"
                style={{ fontSize: "0.75rem", fontWeight: 800 }}
              >
                {user.name.toUpperCase()}
              </span>
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
