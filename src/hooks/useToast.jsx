// src/hooks/useToast.jsx
import { useState, useCallback, useContext } from "react";
import { ToastContext } from "../App";

// Keep the original hook for the App component
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

// New hook for child components to trigger toasts
export function useToastTrigger() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastTrigger must be used within App");
  }
  return context;
}