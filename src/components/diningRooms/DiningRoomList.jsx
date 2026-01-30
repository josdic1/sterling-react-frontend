// components/diningRooms/DiningRoomList.jsx
import { DiningRoomItem } from "./DiningRoomItem";

export function DiningRoomList({ diningRooms }) {
  const roomData = diningRooms?.map((diningRoom) => (
    <DiningRoomItem key={diningRoom.id} diningRoom={diningRoom} />
  ));

  return (
    <div className="container">
      <h2>Dining Rooms</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>NAME</th>
            <th>CAPACITY</th>
            {/* No ACTIONS column */}
          </tr>
        </thead>
        <tbody>{roomData}</tbody>
      </table>
    </div>
  );
}