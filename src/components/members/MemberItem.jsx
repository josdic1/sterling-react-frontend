import { useNavigate } from "react-router-dom";
import { useMember } from "../../hooks/useMember";

export function MemberItem({ member }) {
  const { deleteMember } = useMember();
  const navigate = useNavigate();

  return (
    <tr id={member.id}>
      <td>{member.id}</td>
      <td>{member.user_id}</td>
      <td>{member.name}</td>
      {/* ← Removed email column */}
      <td>{member.relation}</td>
      <td>{member.dietary_restrictions}</td>
      <td>
        <button
          type="button"
          onClick={() => navigate(`/members/${member.id}/edit`)}
        >
          Edit
        </button>
        <button type="button" onClick={() => deleteMember(member.id)}>
          Delete
        </button>
      </td>
    </tr>
  );
}
