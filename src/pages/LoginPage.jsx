import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { LogIn, UserCircle2 } from "lucide-react";

export function LoginPage() {
  const { login, loggedIn } = useAuth();
  const navigate = useNavigate();

  // Muted Historical/Pantone-inspired Palette
  const accounts = [
    { name: "Josh", email: "josh@josh.com", color: "#2E4A62" }, // Muted Classic Blue (2020)
    // { name: "Zach", email: "zach@zach.com", color: "#7B5E7B" },      // Muted Radiant Orchid (2014)
    // { name: "Gabe", email: "gabe@gbae.com", color: "#8E354A" },      // Muted True Red (2002)
    // { name: "Ariel", email: "ariel@ariel.com", color: "#4A5D4E" },    // Muted Greenery (2017 style)
    { name: "Sarah", email: "sarah@sarah.com", color: "#C48E48" }, // Muted Mimosa (2009 style)
    { name: "Jaime", email: "jaime@jaime.com", color: "#6B7B8E" }, // Muted Serenity (2016 style)
    { name: "Brian", email: "brian@brian.com", color: "#4A4A4A" }, // Muted Charcoal
    // { name: "Brandon", email: "brandon@brandon.com", color: "#A67B5B" } // Muted Marsala (2015 style)
  ];

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loggedIn) navigate("/");
  }, [loggedIn, navigate]);

  const handleQuickSelect = (email) => {
    setFormData({ email: email, password: "1111" });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const result = await login(formData);
    if (result.success) navigate("/");
    else setError(result.error);
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <header className="login-header">
          <LogIn size={40} className="login-icon-main" />
          <h1>Sterling Ledger</h1>
          <p className="text-muted">Select an identity to authorize session</p>
        </header>

        <div className="account-grid">
          {accounts.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => handleQuickSelect(acc.email)}
              className="account-select-btn"
              style={{ "--acc-color": acc.color }}
            >
              <UserCircle2 size={28} />
              <span>{acc.name}</span>
            </button>
          ))}
        </div>

        <div className="divider">
          <span>OR MANUAL ENTRY</span>
        </div>

        <form onSubmit={handleSubmit} className="banking-form">
          {error && <div className="login-error">{error}</div>}
          <div className="input-group">
            <label>Email Address</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div className="input-group">
            <label>Security Pin</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
          <button type="submit" className="btn-primary login-submit">
            Authorize Access
          </button>
          <p className="signup-link">
            New Entity? <Link to="/signup">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
