// components/timeSlots/TimeSlotList.jsx
import { TimeSlotItem } from "./TimeSlotItem";

export function TimeSlotList({ timeSlots }) {
  const slotData = timeSlots?.map((slot) => (
    <TimeSlotItem key={slot.id} timeSlot={slot} />
  ));

  return (
    <div className="container">
      <h2>Time Slots</h2>
      <table className="sterling-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>NAME</th>
            <th>START TIME</th>
            <th>END TIME</th>
          </tr>
        </thead>
        <tbody>{slotData}</tbody>
      </table>
    </div>
  );
}