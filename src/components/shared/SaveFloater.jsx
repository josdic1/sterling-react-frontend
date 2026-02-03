// src/components/shared/SaveFloater.jsx
import { useEffect } from "react";
import { CheckCircle, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SaveFloater({ show, onDismiss }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!show) return;

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [show, onDismiss]);

  if (!show) return null;

  return (
    <div className="save-floater">
      <div className="save-floater-content">
        <CheckCircle size={24} className="save-icon" />
        <span className="save-title">Changes Saved</span>
      </div>
      <div className="save-floater-actions">
        <button
          onClick={() => {
            onDismiss();
            navigate("/");
          }}
          className="btn-floater-home"
        >
          <Home size={18} />
          <span>Return Home</span>
        </button>
        <button onClick={onDismiss} className="btn-floater-dismiss">
          Continue Editing
        </button>
      </div>
      <div className="save-floater-progress"></div>
    </div>
  );
}
