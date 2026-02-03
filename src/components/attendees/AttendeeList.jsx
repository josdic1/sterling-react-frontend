import { useData } from "../../hooks/useData";

export function AttendeeList({ attendees, reservationId, onRemove }) {
  const { removeAttendee } = useData();

  const handleRemove = async (attendeeId, attendeeName) => {
    if (onRemove) {
      await onRemove(attendeeId, attendeeName);
    } else {
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
          {attendees.map((attendee) => {
            // DEFENSIVE: Ensure attendee exists
            if (!attendee) return null;

            // DEFENSIVE: safe name extraction
            const memberName = attendee.member ? attendee.member.name : null;
            const displayName = memberName || attendee.name || "Unknown Guest";

            // DEFENSIVE: safe relation extraction
            const relation = attendee.member?.relation;

            return (
              <tr key={attendee.id || Math.random()}>
                <td className="font-bold">
                  {displayName}
                  {relation && (
                    <span className="text-small"> ({relation})</span>
                  )}
                </td>
                <td className="text-muted">
                  {attendee.member?.dietary_restrictions ||
                    attendee.dietary_restrictions ||
                    "None"}
                </td>
                <td>
                  <button
                    className="btn-text-only"
                    onClick={() => handleRemove(attendee.id, displayName)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
