import { useState } from "react";
import Calendar from "react-calendar";
import { useNavigate } from "react-router-dom";
import "react-calendar/dist/Calendar.css";


export function ReservationCalendar({ reservations = [], isAdmin = false }) {
  const [date, setDate] = useState(new Date());
  const navigate = useNavigate();

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
    // If NOT admin, clicking a date prepares to book
    if (!isAdmin) {
      // ... standard booking logic (optional)
    }
  };

  const handleCreateClick = () => {
    // Manual timezone fix to ensure we get YYYY-MM-DD correctly
    const offset = date.getTimezoneOffset();
    const cleanDate = new Date(date.getTime() - offset * 60 * 1000);
    const dateStr = cleanDate.toISOString().split("T")[0];

    navigate(`/reservations/new?date=${dateStr}`);
  };

  // Helper to check if a tile date matches a reservation date
  const getTileContent = ({ date, view }) => {
    if (view === "month") {
      // Format tile date to YYYY-MM-DD
      const tileStr =
        date.getFullYear() +
        "-" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(date.getDate()).padStart(2, "0");

      // Count reservations for this day (filter out cancelled)
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
          onChange={handleDateChange}
          value={date}
          minDate={isAdmin ? null : new Date()} // Admins can see past dates
          tileContent={getTileContent}
        />
      </div>

      <div className="calendar-actions">
        <p>Selected: {date.toDateString()}</p>

        {/* Only show "Book" button if user is NOT admin */}
        {!isAdmin && (
          <button onClick={handleCreateClick} className="btn-primary">
            Book for this Date
          </button>
        )}

        {/* If Admin, show summary for selected date */}
        {isAdmin && (
          <div className="admin-day-summary">
            {
              reservations.filter((r) => {
                const d = new Date(date);
                // Match YYYY-MM-DD manually
                const selStr =
                  d.getFullYear() +
                  "-" +
                  String(d.getMonth() + 1).padStart(2, "0") +
                  "-" +
                  String(d.getDate()).padStart(2, "0");
                return r.date === selStr && r.status !== "cancelled";
              }).length
            }{" "}
            bookings on this day.
          </div>
        )}
      </div>
    </div>
  );
}
