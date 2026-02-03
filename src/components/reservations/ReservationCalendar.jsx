import { useState } from "react";
import Calendar from "react-calendar";
import { useNavigate } from "react-router-dom";
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

  // Check if there is already a reservation on the SELECTED date (for the button)
  const existingReservation = reservations.find(
    (r) => r.date === selectedDateStr && r.status !== "cancelled",
  );

  // --- THE FIX: Handle clicks directly on the calendar grid ---
  const handleDayClick = (value) => {
    // 1. Update the visual selection immediately
    setDate(value);

    // 2. Check if the clicked day has a booking
    const clickedDateStr = getDateString(value);
    const clickedBooking = reservations.find(
      (r) => r.date === clickedDateStr && r.status !== "cancelled",
    );

    // 3. If User (not Admin) and booking exists -> GO THERE
    if (clickedBooking && !isAdmin) {
      navigate(`/reservations/${clickedBooking.id}`);
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
          onClickDay={handleDayClick} // <--- THIS IS THE MISSING LINK
          value={date}
          minDate={isAdmin ? null : new Date()}
          tileContent={getTileContent}
        />
      </div>

      <div className="calendar-actions">
        <p>Selected: {date.toDateString()}</p>

        {isAdmin ? (
          <div className="admin-day-summary">
            {
              reservations.filter(
                (r) => r.date === selectedDateStr && r.status !== "cancelled",
              ).length
            }{" "}
            bookings on this day.
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
