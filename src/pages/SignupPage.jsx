import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";

export function SignupPage() {
  const { loggedIn, signup } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loggedIn) {
      navigate("/");
    }
  }, [loggedIn, navigate]);

  const onFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const result = await signup(formData);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <h1>Signup</h1>
        <form onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <input
            name="name"
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={onFormChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={onFormChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={onFormChange}
            required
          />

          <button type="submit">Confirm User</button>

          <p>
            Return to <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
