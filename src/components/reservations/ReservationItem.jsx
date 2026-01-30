// src/components/reservations/ReservationItem.jsx
import { useNavigate } from "react-router-dom";
import { useData } from "../../hooks/useData";
import { Users } from "lucide-react";

export function ReservationItem({ reservation, attendeeCount }) {
  const navigate = useNavigate();
  const { deleteReservation, diningRooms } = useData();

  const room = diningRooms?.find(r => r.id === reservation.dining_room_id);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      await deleteReservation(reservation.id);
    }
  };

  return (
    <div className="reservation-item" onClick={() => navigate(`/reservations/${reservation.id}`)}>
      <div className="res-info">
        <div className="res-header">
          <p className="res-date">{reservation.date}</p>
          {attendeeCount > 0 && (
            <div className="guest-count-badge">
              <Users size={14} />
              <span>{attendeeCount}</span>
            </div>
          )}
        </div>
        <p className="res-room">{room?.name.toUpperCase() || "NO LOCATION SET"}</p>
        <p className="res-notes">{reservation.notes || "No notes."}</p>
      </div>
      <button className="btn-delete-small" onClick={handleDelete}>
        Delete
      </button>
    </div>
  );
}