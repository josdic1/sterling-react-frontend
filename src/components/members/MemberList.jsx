import { useNavigate } from "react-router-dom";
import { useData } from "../../hooks/useData";

export function MemberList({ members }) {
  const navigate = useNavigate();
  const { deleteMember } = useData();

  const safeMembers = Array.isArray(members)
    ? members.filter((m) => m && typeof m === "object")
    : [];

  if (safeMembers.length === 0) {
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
        {safeMembers.map((m) => {
          const name = m.name ?? "(unnamed)";
          return (
            <tr
              key={m.id ?? name}
              onClick={() => {
                if (m.id != null) navigate(`/members/${m.id}/edit`);
              }}
              style={{ cursor: m.id != null ? "pointer" : "default" }}
            >
              <td className="font-bold">{String(name).toUpperCase()}</td>
              <td className="text-uppercase">{m.relation ?? "—"}</td>
              <td className="text-muted">{m.dietary_restrictions || "NONE"}</td>
              <td className="text-right">
                <button
                  className="btn-text-only"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (m.id == null) return;
                    if (window.confirm(`Archive ${name}?`)) deleteMember(m.id);
                  }}
                >
                  Archive
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
