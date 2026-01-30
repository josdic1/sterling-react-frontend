// pages/DiningRoomsPage.jsx
import { useDiningRooms } from "../hooks/useDiningRooms";
import { DiningRoomList } from "../components/diningRooms/DiningRoomList";

export function DiningRoomsPage() {
  const { diningRooms } = useDiningRooms();

  return (
    <div className="container">
      <h1>Dining Rooms</h1>
      <DiningRoomList diningRooms={diningRooms} />
    </div>
  );
}