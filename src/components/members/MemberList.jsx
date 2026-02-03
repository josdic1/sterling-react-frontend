import { useNavigate } from "react-router-dom";
import { useData } from "../../hooks/useData";

export function MemberList({ members }) {
  const navigate = useNavigate();
  const { deleteMember } = useData();

  if (!members || members.length === 0) {
    return <p className="text-muted">No family records found.</p>;
  }

  return (
    <table className="sterling-table">
      <thead>
        <tr>
          <th>Identity</th>
          <th>Relationship</th>
          <th>Dietary Requirements</th>
          <th className="text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {members.map((m) => (
          <tr key={m.id} onClick={() => navigate(`/members/${m.id}/edit`)}>
            <td className="font-bold">{m.name.toUpperCase()}</td>
            <td className="text-uppercase">{m.relation}</td>
            <td className="text-muted">{m.dietary_restrictions || "NONE"}</td>
            <td className="text-right">
              <button
                className="btn-text-only"
                onClick={(e) => {
                  e.stopPropagation(); // Stops navigation to edit page
                  if (window.confirm(`Archive ${m.name}?`)) deleteMember(m.id);
                }}
              >
                Archive
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
