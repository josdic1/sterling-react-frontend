// src/utils/api.js - FIXED VERSION (Handles DELETE responses)

export const getApiUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) return "http://localhost:8080";
  return apiUrl;
};

export const buildApiUrl = (path) => {
  const baseUrl = getApiUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// 1. TIMEOUT HELPER
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

// 2. MAIN REQUEST FUNCTION (FIXED: Handles empty DELETE responses)
export const apiRequest = async (path, options = {}) => {
  const url = buildApiUrl(path);
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetchWithTimeout(url, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API Error: ${response.status}`);
  }

  // FIXED: Handle DELETE responses (204 No Content) and empty responses
  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    return null;
  }

  // Only parse JSON if there's actual content
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  return null;
};

// 3. RETRY HELPER
export const retryRequest = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;

      const waitTime = 1000 * (i + 1);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
};

// 4. API VERBS
export const api = {
  get: (path) => apiRequest(path, { method: "GET" }),
  post: (path, data) =>
    apiRequest(path, { method: "POST", body: JSON.stringify(data) }),
  patch: (path, data) =>
    apiRequest(path, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (path) => apiRequest(path, { method: "DELETE" }),
};
