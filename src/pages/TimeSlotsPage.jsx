// src/pages/TimeSlotsPage.jsx
import { useData } from "../hooks/useData";
import { TimeSlotList } from "../components/timeSlots/TimeSlotList";

export function TimeSlotsPage() {
  const { timeSlots, loading } = useData();

  return (
    <div className="container dashboard-section">
      <h1>Available Times</h1>
      {loading ? <p>Loading schedule...</p> : <TimeSlotList timeSlots={timeSlots} />}
    </div>
  );
}