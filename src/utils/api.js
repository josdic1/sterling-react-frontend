// src/utils/api.js

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

// TIMEOUT HELPER
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

// Normalize FastAPI error shapes into a string
const extractErrorMessage = (errorData, fallback) => {
  const d = errorData?.detail;

  if (typeof d === "string" && d.trim()) return d;

  // FastAPI / Pydantic validation errors often come as an array
  if (Array.isArray(d) && d.length > 0) {
    // Try the common shape: [{ loc: [...], msg: "..." }, ...]
    const msgs = d
      .map((x) => x?.msg)
      .filter((m) => typeof m === "string" && m.trim());
    if (msgs.length) return msgs.join(" | ");
    // fallback if array but unknown shape
    return JSON.stringify(d);
  }

  // Sometimes detail is an object
  if (d && typeof d === "object") return JSON.stringify(d);

  // Other possible top-level messages
  if (typeof errorData?.message === "string" && errorData.message.trim()) {
    return errorData.message;
  }

  return fallback;
};

export const apiRequest = async (path, options = {}) => {
  const url = buildApiUrl(path);
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetchWithTimeout(url, { ...options, headers });

  // Parse JSON safely (even for errors)
  const contentType = response.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) {
    const text = await response.text();
    data = text ? JSON.parse(text) : null;
  } else {
    // non-json response (rare)
    data = null;
  }

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (!response.ok) {
    const msg = extractErrorMessage(
      data,
      `API Error: ${response.status} ${response.statusText}`,
    );

    // Helpful during debugging:
    console.error("API ERROR", {
      url,
      status: response.status,
      statusText: response.statusText,
      response: data,
    });

    throw new Error(msg);
  }

  // Handle empty responses (DELETE 204, etc)
  if (response.status === 204) return null;

  return data;
};

export const retryRequest = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
};

export const api = {
  get: (path) => apiRequest(path, { method: "GET" }),
  post: (path, data) =>
    apiRequest(path, { method: "POST", body: JSON.stringify(data) }),
  patch: (path, data) =>
    apiRequest(path, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (path) => apiRequest(path, { method: "DELETE" }),
};
