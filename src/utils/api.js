// src/utils/api.js - Centralized API Configuration

/**
 * Get the API base URL from environment variables
 * Falls back to localhost in development if not set
 */
export const getApiUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!apiUrl) {
    // Only warn once in dev to avoid console spam, or keep it simple
    return "http://localhost:8080";
  }

  return apiUrl;
};

/**
 * Build a full API endpoint URL
 * @param {string} path - API endpoint path (e.g., '/reservations')
 * @returns {string} Full URL
 */
export const buildApiUrl = (path) => {
  const baseUrl = getApiUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

/**
 * Fetch wrapper with timeout support (Default: 10 seconds)
 */
export const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Request timeout - please check your connection");
    }
    throw error;
  }
};

/**
 * Make an authenticated API request
 * Automatically includes JWT token from localStorage
 * Uses fetchWithTimeout for network safety
 */
export const apiRequest = async (path, options = {}) => {
  const url = buildApiUrl(path);
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetchWithTimeout(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - token expired
    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw new Error("Session expired. Please log in again.");
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // We let the caller handle logging if they want, or log here
    console.error(`API Req Failed: ${path}`, error);
    throw error;
  }
};

/**
 * RETRY HELPER
 * Retries a function (like an API call) multiple times with exponential backoff
 * @param {Function} fn - The async function to retry
 * @param {number} maxRetries - Max attempts (default 3)
 */
export const retryRequest = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err; // Throw on final attempt

      const waitTime = 1000 * (i + 1); // Backoff: 1s, 2s, 3s
      console.warn(`Attempt ${i + 1} failed. Retrying in ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
};

/**
 * Convenience methods for common HTTP verbs
 * Usage: await api.get('/users')
 */
export const api = {
  get: (path, options = {}) => apiRequest(path, { method: "GET", ...options }),

  post: (path, data, options = {}) =>
    apiRequest(path, {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
    }),

  put: (path, data, options = {}) =>
    apiRequest(path, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    }),

  patch: (path, data, options = {}) =>
    apiRequest(path, {
      method: "PATCH",
      body: JSON.stringify(data),
      ...options,
    }),

  delete: (path, options = {}) =>
    apiRequest(path, {
      method: "DELETE",
      ...options,
    }),
};

// Export constants
export const API_URL = getApiUrl();
export const API_ENDPOINTS = {
  users: "/users",
  login: "/users/login",
  signup: "/users/signup",
  reservations: "/reservations",
  members: "/members",
  diningRooms: "/dining-rooms",
  timeSlots: "/time-slots",
  rules: "/rules",
  fees: "/fees",
};
