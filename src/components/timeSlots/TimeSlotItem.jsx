// components/timeSlots/TimeSlotItem.jsx
export function TimeSlotItem({ timeSlot }) {
  return (
    <tr id={timeSlot.id}>
      <td>{timeSlot.id}</td>
      <td>{timeSlot.name}</td>
      <td>{timeSlot.start_time}</td>
      <td>{timeSlot.end_time}</td>
    </tr>
  );
}