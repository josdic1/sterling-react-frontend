import { useNavigate } from "react-router-dom";
import { useData } from "../../hooks/useData";
import { Users, Clock, Trash2 } from "lucide-react";

export function ReservationItem({ reservation }) {
  const navigate = useNavigate();
  const { deleteReservation, diningRooms } = useData();

  const room = diningRooms?.find((r) => r.id === reservation.dining_room_id);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      await deleteReservation(reservation.id);
    }
  };

  // Convert 24hr time to 12hr AM/PM format
  const formatTime = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Format date to be cleaner with year (e.g., "FEB 6")
  const formatDate = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    const month = date
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase();
    const day = date.getDate();
    return { month, day };
  };

  const { month, day } = formatDate(reservation.date);

  return (
    <div
      className="reservation-item"
      onClick={() => navigate(`/reservations/${reservation.id}`)}
    >
      <div className="res-date-block">
        <span className="res-month">{month}</span>
        <span className="res-day">{day}</span>
      </div>

      <div className="res-content">
        <div className="res-time-row">
          <Clock size={14} />
          <span>
            {formatTime(reservation.start_time)} -{" "}
            {formatTime(reservation.end_time)}
          </span>
        </div>

        <h3 className="res-room">{room?.name || "NO LOCATION"}</h3>

        <p className="res-notes">{reservation.notes || "No notes"}</p>

        {reservation.attendee_count > 0 && (
          <div className="res-guest-count">
            <Users size={14} />
            <span>
              {reservation.attendee_count}{" "}
              {reservation.attendee_count === 1 ? "Guest" : "Guests"}
            </span>
          </div>
        )}
      </div>

      <button
        className="btn-delete-icon"
        onClick={handleDelete}
        title="Delete Reservation"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
