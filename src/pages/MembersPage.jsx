// pages/MembersPage.jsx
import { useMembers } from "../hooks/useMembers";
import { MemberList } from "../components/members/MemberList";
import { useNavigate } from "react-router-dom";

export function MembersPage() {
  const { members } = useMembers();
  const navigate = useNavigate();

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Members</h1>
        <button onClick={() => navigate('/members/new')}>Add Member</button>
      </div>
      <MemberList members={members} />
    </div>
  );
}