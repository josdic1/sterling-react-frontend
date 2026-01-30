import { useNavigate } from "react-router-dom";
import { useDiningRoom } from "../../hooks/useDiningRoom";

export function DiningRoomItem({ diningRoom }) {
  const { deleteDiningRoom } = useDiningRoom();
  const navigate = useNavigate();

  return (
    <tr id={diningRoom.id}>
      <td>{diningRoom.id}</td>
      <td>{diningRoom.name}</td>
      <td>{diningRoom.capacity} seats</td>
      <td>
        <button
          type="button"
          onClick={() => navigate(`/dining-rooms/${diningRoom.id}/edit`)}
        >
          Edit
        </button>
        <button type="button" onClick={() => deleteDiningRoom(diningRoom.id)}>
          Delete
        </button>
      </td>
    </tr>
  );
}
