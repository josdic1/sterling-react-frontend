import { useState, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";

const API_URL = "https://sterling-fastapi-backend-production.up.railway.app";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const resp = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (resp.ok) {
          setUser(await resp.json());
        } else {
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error("Session check failed", err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (credentials) => {
    try {
      const resp = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (resp.ok) {
        const data = await resp.json();
        localStorage.setItem("token", data.access_token);
        setUser(data.user);
        return { success: true };
      }

      return { success: false, error: "Invalid credentials" };
    } catch (err) {
      console.error("Login failed", err);
      return { success: false, error: "Connection failed" };
    }
  };

  const signup = async (userData) => {
    try {
      // FIXED: URL changed from /users/signup to /users/
      const resp = await fetch(`${API_URL}/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (resp.ok) {
        const data = await resp.json();
        // Backend /users/ returns the user object directly, not a token.
        // You may need to log the user in immediately after signup.
        return { success: true };
      }

      return { success: false, error: "Signup failed" };
    } catch (err) {
      console.error("Signup failed", err);
      return { success: false, error: "Connection failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, loggedIn: !!user, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
