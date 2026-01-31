import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "../../hooks/useData";

export function ReservationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { 
    diningRooms, 
    reservations, 
    loading,
    fetchReservationById, 
    updateReservation, 
    createReservation 
  } = useData();

  const [isFetching, setIsFetching] = useState(!!id);
  const [formData, setFormData] = useState({
    date: "",
    meal_type: "",
    dining_room_id: "",
    start_time: "",
    end_time: "",
    notes: "",
  });

  const resId = id ? parseInt(id) : null;

  // Helper: Convert time object to HH:MM string
  const formatTimeForInput = (timeValue) => {
    if (!timeValue) return "";
    if (typeof timeValue === 'string') {
      // Already a string, just take HH:MM part
      return timeValue.split(':').slice(0, 2).join(':');
    }
    return timeValue;
  };

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
          meal_type: target.meal_type || "",
          dining_room_id: String(target.dining_room_id || ""),
          start_time: formatTimeForInput(target.start_time),  // FORMAT HERE
          end_time: formatTimeForInput(target.end_time),      // FORMAT HERE
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
      dining_room_id: parseInt(formData.dining_room_id)
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

  // Generate time options based on meal type
  const generateTimeOptions = (mealType) => {
    if (!mealType) return [];
    
    const options = [];
    let startHour, endHour;
    
    if (mealType === "lunch") {
      startHour = 11;
      endHour = 14; // 2 PM
    } else {
      startHour = 16; // 4 PM
      endHour = 19; // 7 PM
    }
    
    for (let h = startHour; h <= endHour; h++) {
      for (let m of [0, 15, 30, 45]) {
        const hour12 = h % 12 || 12;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const display = `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
        const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        options.push({ display, value });
      }
    }
    
    return options;
  };

  const timeOptions = generateTimeOptions(formData.meal_type);

  const handleMealTypeChange = (newMealType) => {
    // Only clear times if switching meal types, not on initial load
    if (formData.meal_type && formData.meal_type !== newMealType) {
      setFormData({
        ...formData,
        meal_type: newMealType,
        start_time: "",
        end_time: ""
      });
    } else {
      setFormData({
        ...formData,
        meal_type: newMealType
      });
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
          <label>Meal Type</label>
          <select
            value={formData.meal_type}
            onChange={e => handleMealTypeChange(e.target.value)}
            required
          >
            <option value="">Select Meal...</option>
            <option value="lunch">LUNCH (11 AM - 2 PM)</option>
            <option value="dinner">DINNER (4 PM - 7 PM)</option>
          </select>
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
          <label>Start Time</label>
          <select
            value={formData.start_time}
            onChange={e => setFormData({...formData, start_time: e.target.value})}
            required
            disabled={!formData.meal_type}
          >
            <option value="">Select Start Time...</option>
            {timeOptions.map(time => (
              <option key={`start-${time.value}`} value={time.value}>
                {time.display}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>End Time</label>
          <select
            value={formData.end_time}
            onChange={e => setFormData({...formData, end_time: e.target.value})}
            required
            disabled={!formData.meal_type}
          >
            <option value="">Select End Time...</option>
            {timeOptions.map(time => (
              <option key={`end-${time.value}`} value={time.value}>
                {time.display}
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