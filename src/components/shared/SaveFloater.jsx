// src/components/shared/SaveFloater.jsx
import { Home, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SaveFloater({ show, onDismiss }) {
  const navigate = useNavigate();

  if (!show) return null;

  return (
    <div className="save-floater">
      <div className="save-floater-content">
        <CheckCircle size={20} />
        <span>Changes saved</span>
      </div>
      <div className="save-floater-actions">
        <button onClick={() => navigate("/")} className="btn-floater-home">
          <Home size={18} />
          <span>Home</span>
        </button>
        <button onClick={onDismiss} className="btn-floater-dismiss">
          Dismiss
        </button>
      </div>
    </div>
  );
}