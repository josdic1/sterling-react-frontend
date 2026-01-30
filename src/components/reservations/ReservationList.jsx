// src/components/reservations/ReservationList.jsx
import { useEffect, useState } from "react";
import { ReservationItem } from "./ReservationItem";
import { useData } from "../../hooks/useData";

export function ReservationList({ reservations }) {
  const { fetchAttendees } = useData();
  const [attendeeCounts, setAttendeeCounts] = useState({});

  // Fetch attendee counts for all reservations
  useEffect(() => {
    const loadCounts = async () => {
      const counts = {};
      
      // Fetch attendees for each reservation
      await Promise.all(
        reservations.map(async (res) => {
          const attendees = await fetchAttendees(res.id);
          counts[res.id] = attendees?.length || 0;
        })
      );
      
      setAttendeeCounts(counts);
    };

    if (reservations?.length > 0) {
      loadCounts();
    }
  }, [reservations, fetchAttendees]);

  if (!reservations || reservations.length === 0) {
    return <p className="empty-msg">No entries found in ledger.</p>;
  }

  return (
    <div className="reservation-cards">
      {reservations.map((res) => (
        <ReservationItem 
          key={res.id} 
          reservation={res}
          attendeeCount={attendeeCounts[res.id] || 0}
        />
      ))}
    </div>
  );
}