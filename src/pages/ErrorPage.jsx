import { useRouteError, useNavigate } from "react-router-dom";

export function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  return (
    <div className="container error-screen">
      <div className="error-box">
        <header className="page-header">
          <h1 className="text-uppercase">System Interruption</h1>
        </header>
        
        <div className="info-summary-card error-card">
          <div className="text-small">Error Reference</div>
          <h2>{error.status || "500"} - {error.statusText || "UNEXPECTED_EXCEPTION"}</h2>
          
          <div className="details-grid">
            <div>
              <span className="text-small">Diagnostics</span>
              <p className="text-muted">{error.message || "The ledger could not be synchronized."}</p>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn-primary" onClick={() => navigate('/')}>
            Return to Dashboard
          </button>
          <button className="btn-cancel" onClick={() => window.location.reload()}>
            Retry Connection
          </button>
        </div>
      </div>
    </div>
  );
}