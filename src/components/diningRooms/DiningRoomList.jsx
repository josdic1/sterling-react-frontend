import { useData } from "../../hooks/useData";

export function DiningRoomList() {
  const { diningRooms, loading } = useData();

  if (loading)
    return <div className="loading-state">VERIFYING LOCATIONS...</div>;

  return (
    <div className="container">
      <header className="page-header">
        <h1 className="text-uppercase">Location Registry</h1>
      </header>
      <table className="sterling-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Room Identity</th>
            <th className="text-right">Capacity</th>
          </tr>
        </thead>
        <tbody>
          {diningRooms.map((room) => (
            <tr key={room.id} className="ledger-row">
              <td>{room.id}</td>
              <td className="font-bold">{room.name.toUpperCase()}</td>
              <td className="text-right">{room.capacity} SEATS</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
