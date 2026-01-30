export function DiningRoomItem({ diningRoom }) {
  return (
    <tr id={diningRoom.id}>
      <td>{diningRoom.id}</td>
      <td>{diningRoom.name}</td>
      <td>{diningRoom.capacity} seats</td>
    </tr>
  );
}
