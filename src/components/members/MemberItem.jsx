import { useNavigate } from "react-router-dom";
import { useData } from "../../hooks/useData";

export function MemberItem({ member }) {
  const navigate = useNavigate();
  const { deleteMember } = useData();

  return (
    <tr
      className="ledger-row"
      onClick={() => navigate(`/members/${member.id}/edit`)}
    >
      <td className="font-bold">{member.name}</td>
      <td className="text-uppercase">{member.relation}</td>
      <td className="text-muted">
        {/* We kept this detail: dietary restrictions are vital for boutique service */}
        {member.dietary_restrictions || "No restrictions listed"}
      </td>
      <td className="text-right">
        <button
          className="btn-text-only"
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Archive ${member.name}?`))
              deleteMember(member.id);
          }}
        >
          Archive
        </button>
      </td>
    </tr>
  );
}
