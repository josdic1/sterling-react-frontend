import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { ReservationCalendar } from "../components/reservations/ReservationCalendar";
import { api, retryRequest } from "../utils/api";

export function CalendarPage() {
  const { user } = useAuth();
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // --- THE FIX ---
        // If Admin: Hit the Admin API to get ALL bookings.
        // If User: Hit the standard API to get MY bookings.
        const endpoint = user.is_admin
          ? "/admin/reservations/"
          : "/reservations/";

        const data = await retryRequest(() => api.get(endpoint));

        // Safety check to ensure we pass an array
        setCalendarData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load calendar data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading-state">Loading Calendar...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="page-header">
        <h1>{user?.is_admin ? "Master Schedule" : "My Calendar"}</h1>
        {user?.is_admin && (
          <span className="badge-admin" style={{ marginLeft: "1rem" }}>
            Viewing All {calendarData.length} Reservations
          </span>
        )}
      </header>

      <div className="calendar-page-wrapper">
        <ReservationCalendar
          reservations={calendarData}
          isAdmin={user?.is_admin}
        />
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="dot dot-booking"></span>
          {user?.is_admin ? "Customer Booking" : "My Reservation"}
        </div>
        <div className="legend-item">
          <span className="dot dot-today"></span> Today
        </div>
        <div className="legend-item">
          <span className="dot dot-selected"></span> Selected Date
        </div>
      </div>
    </div>
  );
}
