// src/pages/HomePage.jsx
import { useAuth } from "../hooks/useAuth";
import { useData } from "../hooks/useData";
import { useNavigate } from "react-router-dom";
import { ReservationList } from "../components/reservations/ReservationList";
import { MemberList } from "../components/members/MemberList";
import { Plus } from "lucide-react";
import { TutorialModal } from "../components/shared/TutorialModal";

export function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const { reservations, members, loading } = useData();
  const navigate = useNavigate();

  if (authLoading || loading) {
    return <div className="loading-state">Loading Sterling System...</div>;
  }

  return (
    <div className="container dashboard">
      <header className="dashboard-welcome">
        <h1>Welcome, {user?.name}!</h1>
      </header>

      <section className="dashboard-section">
        <header className="section-header">
          <h2>Active Reservations</h2>
        </header>
        <ReservationList
          reservations={
            Array.isArray(reservations) ? reservations.filter(Boolean) : []
          }
        />
      </section>

      <section className="dashboard-section">
        <header className="section-header">
          <h2>Family Ledger</h2>
        </header>
        <MemberList
          members={Array.isArray(members) ? members.filter(Boolean) : []}
        />
      </section>

      {/* Floating Action Button for Mobile */}
      <button
        className="fab"
        onClick={() => navigate("/reservations/new")}
        title="New Booking"
      >
        <Plus size={24} />
      </button>
      <TutorialModal autoStart={true} />
    </div>
  );
}
