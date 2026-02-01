// src/pages/ReservationDetailPage.jsx (FIXED: Added trailing slash to fees fetch)
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "../hooks/useData";
import { useToastTrigger } from "../hooks/useToast";
import { AttendeeList } from "../components/attendees/AttendeeList";
import { AttendeeForm } from "../components/attendees/AttendeeForm";
import { SaveFloater } from "../components/shared/SaveFloater";
import { Edit3, UserPlus, Clock, DollarSign } from "lucide-react";

const API_URL = "https://sterling-fastapi-backend-production.up.railway.app";

export function ReservationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [needsFetch, setNeedsFetch] = useState(true);
  const [showSaveFloater, setShowSaveFloater] = useState(false);
  const [fees, setFees] = useState([]);
  const [currentAttendees, setCurrentAttendees] = useState([]);

  const { addToast } = useToastTrigger();

  const {
    diningRooms,
    reservations,
    members,
    loading,
    fetchReservationById,
    fetchAttendees,
    addAttendee,
    removeAttendee,
  } = useData();

  const resId = parseInt(id);
  const reservation = reservations?.find((r) => r.id === resId);

  // Convert 24hr time to 12hr AM/PM format
  const formatTime = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    const sync = async () => {
      if (!resId) return;

      if (reservation) {
        const attendees = await fetchAttendees(resId);
        setCurrentAttendees(attendees || []);
        setNeedsFetch(false);
        return;
      }

      const current = await fetchReservationById(resId);
      if (!current) {
        navigate("/", { replace: true });
        return;
      }

      const attendees = await fetchAttendees(resId);
      setCurrentAttendees(attendees || []);
      setNeedsFetch(false);
    };

    sync();
  }, [resId, reservation, fetchReservationById, fetchAttendees, navigate]);

  // Fetch fees
  useEffect(() => {
    const loadFees = async () => {
      const token = localStorage.getItem("token");
      // FIXED: Added trailing slash to prevent 307 redirect
      const resp = await fetch(`${API_URL}/reservations/${resId}/fees/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        setFees(await resp.json());
      }
    };

    if (resId) loadFees();
  }, [resId, currentAttendees]);

  const unseatedMembers =
    members?.filter(
      (member) => !currentAttendees.find((att) => att.member_id === member.id),
    ) || [];

  const handleQuickAddMember = async (member) => {
    const result = await addAttendee(resId, {
      member_id: member.id,
      name: member.name,
      attendee_type: "member",
      dietary_restrictions: member.dietary_restrictions,
    });

    if (result.success) {
      addToast(`${member.name} added to table`, "success");
      setShowSaveFloater(true);
      // Refresh attendees
      const attendees = await fetchAttendees(resId);
      setCurrentAttendees(attendees || []);
    } else {
      addToast("Failed to add guest", "error");
    }
  };

  const handleRemoveAttendee = async (attendeeId, attendeeName) => {
    const result = await removeAttendee(resId, attendeeId);
    if (result.success) {
      addToast(`${attendeeName} removed from table`, "success");
      setShowSaveFloater(true);
      // Refresh attendees
      const attendees = await fetchAttendees(resId);
      setCurrentAttendees(attendees || []);
    } else {
      addToast("Failed to remove guest", "error");
    }
  };

  if ((loading || needsFetch) && !reservation) {
    return <div className="loading-state">VERIFYING LEDGER ENTRY...</div>;
  }

  if (!reservation) {
    return <div className="loading-state">RESERVATION NOT FOUND</div>;
  }

  const room = diningRooms?.find((r) => r.id === reservation?.dining_room_id);
  const totalFees = fees.reduce((sum, fee) => sum + fee.calculated_amount, 0);

  return (
    <div className="container">
      <SaveFloater
        show={showSaveFloater}
        onDismiss={() => setShowSaveFloater(false)}
      />

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
              <Clock
                size={14}
                style={{ marginRight: "4px", verticalAlign: "middle" }}
              />
              {formatTime(reservation?.start_time)} -{" "}
              {formatTime(reservation?.end_time)}
            </p>
          </div>
          <div>
            <span className="text-small">Entry Notes</span>
            <p className="text-muted">{reservation?.notes || "—"}</p>
          </div>
        </div>
      </div>

      {fees.length > 0 && (
        <div className="fees-section">
          <h3 className="section-label">
            <DollarSign
              size={16}
              style={{ verticalAlign: "middle", marginRight: "4px" }}
            />
            Applied Fees
          </h3>
          <table className="sterling-table">
            <thead>
              <tr>
                <th>Fee</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => (
                <tr key={fee.id}>
                  <td className="font-bold">{fee.rule.name}</td>
                  <td>${fee.calculated_amount.toFixed(2)}</td>
                  <td>
                    <span
                      className={`fee-status ${fee.paid ? "paid" : "pending"}`}
                    >
                      {fee.paid ? "PAID" : "PENDING"}
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="fee-total-row">
                <td className="font-bold">TOTAL</td>
                <td className="font-bold">${totalFees.toFixed(2)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

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
                {unseatedMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleQuickAddMember(member)}
                    className="btn-quick-add-member"
                  >
                    <UserPlus size={16} />
                    <span>{member.name}</span>
                    {member.relation && (
                      <span className="member-relation">
                        ({member.relation})
                      </span>
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
              onSuccess={async (name) => {
                addToast(`${name} added to table`, "success");
                setShowSaveFloater(true);
                // Refresh attendees
                const attendees = await fetchAttendees(resId);
                setCurrentAttendees(attendees || []);
              }}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
