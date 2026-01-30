// src/components/reservations/ReservationForm.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "../../hooks/useData";

export function ReservationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { 
    diningRooms, 
    timeSlots,
    reservations, 
    loading,
    fetchReservationById, 
    updateReservation, 
    createReservation 
  } = useData();

  const [isFetching, setIsFetching] = useState(!!id);
  const [formData, setFormData] = useState({
    date: "",
    dining_room_id: "",
    time_slot_id: "",  // ADD THIS
    notes: "",
  });

  const resId = id ? parseInt(id) : null;

  useEffect(() => {
    const init = async () => {
      if (!resId) return;

      let target = reservations?.find(r => r.id === resId);
      if (!target) {
        target = await fetchReservationById(resId);
      }

      if (target) {
        setFormData({
          date: target.date || "",
          dining_room_id: String(target.dining_room_id || ""),
          time_slot_id: String(target.time_slot_id || ""),  // ADD THIS
          notes: target.notes || "",
        });
      } else {
        navigate("/", { replace: true });
      }
      setIsFetching(false);
    };

    init();
  }, [resId, fetchReservationById, navigate, reservations]);

  const onSubmit = async (e) => {
    e.preventDefault();
    
    const submissionData = {
      ...formData,
      dining_room_id: parseInt(formData.dining_room_id),
      time_slot_id: parseInt(formData.time_slot_id)  // ADD THIS
    };

    try {
      if (resId) {
        await updateReservation(resId, submissionData);
        navigate(-1);
      } else {
        const newRes = await createReservation(submissionData);
        navigate(`/reservations/${newRes.id}`, { replace: true });
      }
    } catch (err) {
      console.error("Save failed", err);
      alert("Could not save reservation. Check console for details.");
    }
  };

  if (loading || isFetching) {
    return <div className="loading-state">SYNCHRONIZING LEDGER...</div>;
  }

  return (
    <div className="container">
      <header className="page-header">
        <h1 className="text-uppercase">{resId ? "Modify Entry" : "New Entry"}</h1>
      </header>

      <form onSubmit={onSubmit} className="banking-form">
        <div className="input-group">
          <label>Date</label>
          <input 
            type="date" 
            value={formData.date} 
            onChange={e => setFormData({...formData, date: e.target.value})} 
            required 
          />
        </div>

        <div className="input-group">
          <label>Location</label>
          <select
            value={formData.dining_room_id}
            onChange={e => setFormData({...formData, dining_room_id: e.target.value})}
            required
          >
            <option value="">Select Room...</option>
            {diningRooms.map(room => (
              <option key={room.id} value={String(room.id)}>
                {room.name.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>Time Slot</label>
          <select
            value={formData.time_slot_id}
            onChange={e => setFormData({...formData, time_slot_id: e.target.value})}
            required
          >
            <option value="">Select Time...</option>
            {timeSlots.map(slot => (
              <option key={slot.id} value={String(slot.id)}>
                {slot.name} ({slot.start_time} - {slot.end_time})
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>Notes</label>
          <textarea
            value={formData.notes}
            onChange={e => setFormData({...formData, notes: e.target.value})}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">Save</button>
          <button type="button" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}