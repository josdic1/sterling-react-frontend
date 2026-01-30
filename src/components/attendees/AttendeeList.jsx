// src/components/attendees/AttendeeList.jsx
import { useData } from "../../hooks/useData";

export function AttendeeList({ attendees, reservationId, onRemove }) {
  const { removeAttendee } = useData();

  // Fallback function if onRemove not provided
  const handleRemove = async (attendeeId, attendeeName) => {
    if (onRemove) {
      // Use the provided callback
      await onRemove(attendeeId, attendeeName);
    } else {
      // Fallback to direct removal (no toast)
      await removeAttendee(reservationId, attendeeId);
    }
  };

  if (!attendees || attendees.length === 0) {
    return <p className="text-muted">No guests seated at this table.</p>;
  }

  return (
    <div className="attendee-management">
      <h3 className="section-label">Current Table</h3>
      <table className="sterling-table">
        <thead>
          <tr>
            <th>Guest</th>
            <th>Dietary Restrictions</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {attendees.map((attendee) => (
            <tr key={attendee.id}>
              <td className="font-bold">
                {attendee.member?.name || attendee.name}
                {attendee.member?.relation && (
                  <span className="text-small"> ({attendee.member.relation})</span>
                )}
              </td>
              <td className="text-muted">
                {attendee.member?.dietary_restrictions || attendee.dietary_restrictions || "None"}
              </td>
              <td>
                <button 
                  className="btn-text-only"
                  onClick={() => handleRemove(attendee.id, attendee.member?.name || attendee.name)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}