// src/pages/ReservationsPage.jsx
import { useNavigate } from "react-router-dom";
import { useData } from "../hooks/useData";
import { ReservationList } from "../components/reservations/ReservationList";

export function ReservationsPage() {
  const { reservations, loading } = useData();
  const navigate = useNavigate();

  return (
    <section className="dashboard-section">
      <header className="section-header">
        <h2>Active Reservations</h2>
        <button type="button" onClick={() => navigate('/reservations/new')}>
          + New Booking
        </button>
      </header>
      
      {loading ? (
        <p className="loading-state">Updating Ledger...</p>
      ) : (
        <ReservationList reservations={reservations} />
      )}
    </section>
  );
}