// pages/TimeSlotsPage.jsx
import { useTimeSlots } from "../hooks/useTimeSlots";
import { TimeSlotList } from "../components/timeSlots/timeSlotList";

export function TimeSlotsPage() {
  const { timeSlots } = useTimeSlots();

  return (
    <div className="container">
      <h1>Time Slots</h1>
      <TimeSlotList timeSlots={timeSlots} />
    </div>
  );
}