import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "../hooks/useData";
import { useToastTrigger } from "../hooks/useToast";
import { AttendeeList } from "../components/attendees/AttendeeList";
import { AttendeeForm } from "../components/attendees/AttendeeForm";
import { SaveFloater } from "../components/shared/SaveFloater";
import { Edit3, UserPlus, Clock } from "lucide-react";

export function ReservationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [needsFetch, setNeedsFetch] = useState(true);
  const [showSaveFloater, setShowSaveFloater] = useState(false);
  
  const { addToast } = useToastTrigger();
  
  const { 
    diningRooms, 
    timeSlots,
    reservations, 
    members,
    currentAttendees,
    loading,
    fetchReservationById, 
    fetchAttendees,
    addAttendee,
    removeAttendee
  } = useData();

  const resId = parseInt(id);
  const reservation = reservations?.find(r => r.id === resId);

  useEffect(() => {
    const sync = async () => {
      if (!resId) return;
      
      if (reservation) {
        await fetchAttendees(resId);
        setNeedsFetch(false);
        return;
      }
      
      const current = await fetchReservationById(resId);
      if (!current) {
        navigate("/", { replace: true });
        return;
      }

      await fetchAttendees(resId);
      setNeedsFetch(false);
    };
    
    sync();
  }, [resId, reservation, fetchReservationById, fetchAttendees, navigate]);

  const unseatedMembers = members.filter(
    member => !currentAttendees.find(att => att.member_id === member.id)
  );

  const handleQuickAddMember = async (member) => {
    const result = await addAttendee(resId, {
      member_id: member.id,
      name: member.name,
      attendee_type: "member",
      dietary_restrictions: member.dietary_restrictions
    });

    if (result.success) {
      addToast(`${member.name} added to table`, "success");
      setShowSaveFloater(true);
    } else {
      addToast("Failed to add guest", "error");
    }
  };

  const handleRemoveAttendee = async (attendeeId, attendeeName) => {
    const result = await removeAttendee(resId, attendeeId);
    if (result.success) {
      addToast(`${attendeeName} removed from table`, "success");
      setShowSaveFloater(true);
    } else {
      addToast("Failed to remove guest", "error");
    }
  };

  if ((loading || needsFetch) && !reservation) {
    return <div className="loading-state">VERIFYING LEDGER ENTRY...</div>;
  }

  const room = diningRooms.find(r => r.id === reservation?.dining_room_id);
  const slot = timeSlots.find(s => s.id === reservation?.time_slot_id);

  return (
    <div className="container">
      <SaveFloater show={showSaveFloater} onDismiss={() => setShowSaveFloater(false)} />

      <header className="page-header">
        <h1>Ledger Entry #{resId}</h1>
        <button 
          onClick={() => navigate(`/reservations/${id}/edit`)}
          className="btn-edit"
          title="Edit"
        >
          <Edit3 size={20} />
          <span className="btn-edit-text">Edit Record</span>
        </button>
      </header>

      <div className="info-summary-card">
        <div className="text-small">Verified Location</div>
        <h2>{room ? room.name : "NO LOCATION ASSIGNED"}</h2>
        
        <div className="details-grid">
          <div>
            <span className="text-small">Transaction Date</span>
            <p className="font-bold">{reservation?.date}</p>
          </div>
          <div>
            <span className="text-small">Scheduled Window</span>
            <p className="font-bold">
              {slot ? (
                <>
                  <Clock size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  {slot.name} ({slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)})
                </>
              ) : "UNSCHEDULED"}
            </p>
          </div>
          <div>
            <span className="text-small">Entry Notes</span>
            <p className="text-muted">{reservation?.notes || "—"}</p>
          </div>
        </div>
      </div>

      <div className="detail-layout">
        <div className="main-content">
          <AttendeeList 
            attendees={currentAttendees} 
            reservationId={resId}
            onRemove={handleRemoveAttendee}
          />
        </div>
        
        <aside className="sidebar">
          {unseatedMembers.length > 0 && (
            <div className="sidebar-card">
              <h3 className="section-label">Quick Add Family</h3>
              <div className="quick-add-members">
                {unseatedMembers.map(member => (
                  <button
                    key={member.id}
                    onClick={() => handleQuickAddMember(member)}
                    className="btn-quick-add-member"
                  >
                    <UserPlus size={16} />
                    <span>{member.name}</span>
                    {member.relation && (
                      <span className="member-relation">({member.relation})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="sidebar-card">
            <h3 className="section-label">Add Guest</h3>
            <AttendeeForm 
              reservationId={resId} 
              onSuccess={(name) => {
                addToast(`${name} added to table`, "success");
                setShowSaveFloater(true);
              }}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}