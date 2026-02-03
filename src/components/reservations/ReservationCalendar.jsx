import { useState } from "react";
import Calendar from "react-calendar";
import { useNavigate } from "react-router-dom";
import { ReservationList } from "./ReservationList"; // <--- Import the List Component
import "react-calendar/dist/Calendar.css";

export function ReservationCalendar({ reservations = [], isAdmin = false }) {
  const [date, setDate] = useState(new Date());
  const navigate = useNavigate();

  // --- HELPER: Get clean YYYY-MM-DD string from a date object ---
  const getDateString = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const selectedDateStr = getDateString(date);

  // Filter for the *selected* date (Admin view)
  const dailyReservations = reservations.filter(
    (r) => r.date === selectedDateStr && r.status !== "cancelled",
  );

  // Check if there is already a reservation on the SELECTED date (for the User button)
  const existingReservation = dailyReservations[0];

  const handleDayClick = (value) => {
    // 1. Update the visual selection immediately
    setDate(value);

    // 2. Logic for regular users (Navigate immediately)
    // Admins STAY on the page to see the list below
    if (!isAdmin) {
      const clickedDateStr = getDateString(value);
      const clickedBooking = reservations.find(
        (r) => r.date === clickedDateStr && r.status !== "cancelled",
      );
      if (clickedBooking) {
        navigate(`/reservations/${clickedBooking.id}`);
      }
    }
  };

  const handleActionClick = () => {
    if (existingReservation && !isAdmin) {
      navigate(`/reservations/${existingReservation.id}`);
    } else {
      navigate(`/reservations/new?date=${selectedDateStr}`);
    }
  };

  // Helper to draw the black/white pills
  const getTileContent = ({ date, view }) => {
    if (view === "month") {
      const tileStr = getDateString(date);
      const dayReservations = reservations.filter(
        (r) => r.date === tileStr && r.status !== "cancelled",
      );

      if (dayReservations.length > 0) {
        return <div className="calendar-badge">{dayReservations.length}</div>;
      }
    }
    return null;
  };

  return (
    <div className="calendar-container">
      {!isAdmin && <h2>Select a Date</h2>}

      <div className="calendar-wrapper">
        <Calendar
          onClickDay={handleDayClick}
          value={date}
          minDate={isAdmin ? null : new Date()}
          tileContent={getTileContent}
        />
      </div>

      <div className="calendar-actions">
        <p style={{ marginBottom: "1.5rem" }}>
          Selected: <strong>{date.toDateString()}</strong>
        </p>

        {isAdmin ? (
          <div className="admin-day-view" style={{ width: "100%" }}>
            <div
              className="admin-day-summary"
              style={{
                marginBottom: "1rem",
                color: "#eb5638",
                fontWeight: "bold",
              }}
            >
              {dailyReservations.length} bookings found
            </div>

            {/* --- SHOW THE LIST HERE --- */}
            {dailyReservations.length > 0 ? (
              <div style={{ textAlign: "left" }}>
                <ReservationList reservations={dailyReservations} />
              </div>
            ) : (
              <div
                className="empty-msg"
                style={{
                  padding: "2rem",
                  background: "#f8f8f8",
                  borderRadius: "8px",
                }}
              >
                No reservations scheduled for this day.
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleActionClick}
            className={existingReservation ? "btn-secondary" : "btn-primary"}
          >
            {existingReservation
              ? "View Existing Booking"
              : "Book for this Date"}
          </button>
        )}
      </div>
    </div>
  );
}
