import { useNavigate } from "react-router-dom";
import { useData } from "../../hooks/useData";
import { Users, Clock } from "lucide-react";

export function ReservationItem({ reservation }) {
  const navigate = useNavigate();
  const { deleteReservation, diningRooms, timeSlots } = useData();

  const room = diningRooms?.find(r => r.id === reservation.dining_room_id);
  const slot = timeSlots?.find(s => s.id === reservation.time_slot_id);

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
          <div className="badge-group" style={{ display: 'flex', gap: '8px' }}>
            {slot && (
              <div className="time-badge">
                <Clock size={14} />
                <span>{slot.name}</span>
              </div>
            )}
            {reservation.attendee_count > 0 && (
              <div className="guest-count-badge">
                <Users size={14} />
                <span>{reservation.attendee_count}</span>
              </div>
            )}
          </div>
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