// src/providers/AuthProvider.jsx
import { useState, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
// UPDATED: Import api helper and retryRequest
import { api, retryRequest } from "../utils/api";

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
        // UPDATED: Use retryRequest + api.get
        // We retry this because we don't want to log the user out
        // just because of a temporary network glitch.
        const userData = await retryRequest(() => api.get("/users/me"));
        setUser(userData);
      } catch (err) {
        console.error("Session check failed:", err);
        // If it fails after retries (e.g. 401 or down server), clear session
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (credentials) => {
    try {
      // UPDATED: Use api.post
      // We do NOT retry Login POSTs to avoid accidental double-submissions
      const data = await api.post("/users/login", credentials);

      if (data && data.access_token) {
        localStorage.setItem("token", data.access_token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: "Invalid response from server" };
    } catch (err) {
      console.error("Login failed", err);
      // api.js throws errors with .message set to the backend error detail
      return { success: false, error: err.message || "Login failed" };
    }
  };

  const signup = async (userData) => {
    try {
      // UPDATED: Use api.post
      await api.post("/users/", userData);

      // Auto-login after successful signup
      return await login({
        email: userData.email,
        password: userData.password,
      });
    } catch (err) {
      console.error("Signup failed", err);
      return {
        success: false,
        error: err.message || "Signup failed. Please try again.",
      };
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
