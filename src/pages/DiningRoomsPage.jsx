// src/pages/DiningRoomsPage.jsx
import { useData } from "../hooks/useData";
import { DiningRoomList } from "../components/diningRooms/DiningRoomList";

export function DiningRoomsPage() {
  const { diningRooms, loading } = useData();

  return (
    <div className="container dashboard-section">
      <h1>Dining Rooms</h1>
      {loading ? (
        <p>Loading rooms...</p>
      ) : (
        <DiningRoomList diningRooms={diningRooms} />
      )}
    </div>
  );
}
