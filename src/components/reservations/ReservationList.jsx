// src/components/reservations/ReservationList.jsx
import { ReservationItem } from "./ReservationItem";

export function ReservationList({ reservations }) {
  if (!reservations || reservations.length === 0) {
    return <p className="empty-msg">No entries found in ledger.</p>;
  }

  return (
    <div className="reservation-cards">
      {reservations.map((res) => (
        <ReservationItem key={res.id} reservation={res} />
      ))}
    </div>
  );
}