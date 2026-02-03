// src/pages/RulesPage.jsx
import { useEffect, useState } from "react";
import { DollarSign, Users, Calendar, AlertCircle } from "lucide-react";
// UPDATED: Import api helper and retryRequest
import { api, retryRequest } from "../utils/api";

export function RulesPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRules = async () => {
      try {
        setLoading(true);
        setError(null);

        // UPDATED: Using retryRequest + api.get
        // This makes the page robust against network instability
        const data = await retryRequest(() => api.get("/rules/"));
        setRules(Array.isArray(data) ? data.filter(Boolean) : []);
      } catch (err) {
        console.error("Failed to load rules:", err);
        setError("System unavailable. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    loadRules();
  }, []);

  // ERROR STATE UI
  if (error) {
    return (
      <div className="container">
        <div className="error-state">
          <AlertCircle size={48} />
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  // LOADING STATE UI
  if (loading) {
    return <div className="loading-state">Loading Club Rules...</div>;
  }

  // Icon mapping
  const getRuleIcon = (code) => {
    switch (code) {
      case "peak_hours":
        return <Calendar size={24} />;
      case "large_party":
        return <Users size={24} />;
      case "no_call_no_show":
        return <AlertCircle size={24} />;
      case "cancellation":
        return <AlertCircle size={24} />;
      default:
        return <DollarSign size={24} />;
    }
  };

  const formatFeeAmount = (rule) => {
    if (rule.fee_type === "flat") return `$${rule.base_amount.toFixed(2)}`;
    if (rule.fee_type === "per_person")
      return `$${rule.base_amount.toFixed(2)} per person`;
    if (rule.fee_type === "percentage") return `${rule.base_amount}%`;
    return `$${rule.base_amount.toFixed(2)}`;
  };

  return (
    <div className="container">
      <header className="page-header">
        <h1>Club Rules & Fees</h1>
      </header>
      <div className="rules-intro">
        <p>
          Please review our club policies to avoid additional charges. All fees
          are automatically applied when applicable.
        </p>
      </div>
      <div className="rules-grid">
        {(Array.isArray(rules) ? rules : []).filter(Boolean).map((rule) => (
          <div key={rule.id ?? rule.code ?? rule.name} className="rule-card">
            <div className="rule-icon">{getRuleIcon(rule.code)}</div>
            <div className="rule-content">
              <h3>{rule.name ?? "(unnamed rule)"}</h3>
              <p className="rule-desc">
                {rule.description || "Standard club policy applies."}
              </p>
              {rule.threshold && (
                <div className="rule-condition">
                  <span className="condition-label">Applies when:</span>
                  <span className="condition-value">
                    Party size ≥ {rule.threshold} guests
                  </span>
                </div>
              )}
              <div className="rule-fee">
                <span className="fee-label">Fee Amount</span>
                <span className="fee-amount">{formatFeeAmount(rule)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
