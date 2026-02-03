import { ReservationItem } from "./ReservationItem";

export function ReservationList({ reservations }) {
  const safeReservations = Array.isArray(reservations)
    ? reservations.filter((r) => r && typeof r === "object")
    : [];

  if (safeReservations.length === 0) {
    return <p className="empty-msg">No entries found in ledger.</p>;
  }

  return (
    <div className="reservation-cards">
      {safeReservations.map((res) => (
        <ReservationItem
          key={res.id ?? `${res.date}-${res.start_time}`}
          reservation={res}
        />
      ))}
    </div>
  );
}
