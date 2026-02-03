// src/pages/MembersPage.jsx
import { useData } from "../hooks/useData";
import { MemberList } from "../components/members/MemberList";
import { useNavigate } from "react-router-dom";

export function MembersPage() {
  const { members, loading } = useData();
  const navigate = useNavigate();

  return (
    <div className="container dashboard-section">
      <header className="section-header">
        <h1>Family Ledger</h1>
        <button onClick={() => navigate("/members/new")}>+ Add Member</button>
      </header>

      {loading ? (
        <p className="loading-state">Syncing family records...</p>
      ) : (
        <div className="banking-grid">
          <MemberList
            members={Array.isArray(members) ? members.filter(Boolean) : []}
          />
        </div>
      )}
    </div>
  );
}
