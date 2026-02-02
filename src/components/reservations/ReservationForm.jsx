import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "../../hooks/useData";
import { useToastTrigger } from "../../hooks/useToast";
import { Save, X, AlertCircle, RotateCcw } from "lucide-react";

export function ReservationForm() {
  const { id } = useParams(); // If ID exists, we are editing. If not, creating.
  const navigate = useNavigate();
  const { diningRooms, createReservation, updateReservation, reservations } =
    useData();
  const { addToast } = useToastTrigger();

  const isEditMode = Boolean(id);
  const existingReservation = isEditMode
    ? reservations.find((r) => r.id === parseInt(id))
    : null;

  const [formData, setFormData] = useState({
    dining_room_id: "",
    date: "",
    meal_type: "dinner",
    start_time: "",
    end_time: "",
    notes: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [draftLoaded, setDraftLoaded] = useState(false);

  // 1. LOAD DATA (Edit Mode OR Draft Mode)
  useEffect(() => {
    // A. Edit Mode: Load existing data
    if (isEditMode && existingReservation) {
      setFormData({
        dining_room_id: existingReservation.dining_room_id,
        date: existingReservation.date,
        meal_type: existingReservation.meal_type,
        start_time: existingReservation.start_time,
        end_time: existingReservation.end_time,
        notes: existingReservation.notes || "",
      });
      return;
    }

    // B. Create Mode: Check for Autosave Draft
    if (!isEditMode) {
      const draft = localStorage.getItem("reservation_draft");
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          // Simple validation to ensure draft isn't empty
          if (parsed.date || parsed.notes || parsed.dining_room_id) {
            if (
              window.confirm(
                "Found an unsaved reservation draft. Would you like to resume?",
              )
            ) {
              setFormData(parsed);
              setDraftLoaded(true);
              addToast("Draft restored successfully", "success");
            } else {
              localStorage.removeItem("reservation_draft");
            }
          }
        } catch (e) {
          console.error("Failed to parse draft", e);
        }
      }
    }
  }, [isEditMode, existingReservation, addToast]);

  // 2. AUTOSAVE INTERVAL (Only in Create Mode)
  useEffect(() => {
    if (isEditMode) return; // Don't autosave when editing an existing confirmed record

    const saveInterval = setInterval(() => {
      // Only save if user has actually typed something
      if (formData.date || formData.notes || formData.dining_room_id) {
        localStorage.setItem("reservation_draft", JSON.stringify(formData));
      }
    }, 5000); // Save every 5 seconds

    return () => clearInterval(saveInterval);
  }, [formData, isEditMode]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const clearDraft = () => {
    if (window.confirm("Are you sure you want to discard this draft?")) {
      localStorage.removeItem("reservation_draft");
      setFormData({
        dining_room_id: "",
        date: "",
        meal_type: "dinner",
        start_time: "",
        end_time: "",
        notes: "",
      });
      setDraftLoaded(false);
      addToast("Draft discarded", "info");
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.dining_room_id)
      errors.dining_room_id = "Dining Room is required";
    if (!formData.date) errors.date = "Date is required";
    if (!formData.start_time) errors.start_time = "Start time is required";
    if (!formData.end_time) errors.end_time = "End time is required";

    // Basic logic check
    if (
      formData.start_time &&
      formData.end_time &&
      formData.start_time >= formData.end_time
    ) {
      errors.end_time = "End time must be after start time";
    }

    return errors;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      let result;

      // Ensure dining_room_id is an integer
      const payload = {
        ...formData,
        dining_room_id: parseInt(formData.dining_room_id),
      };

      if (isEditMode) {
        result = await updateReservation(parseInt(id), payload);
      } else {
        result = await createReservation(payload);
      }

      if (result) {
        // SUCCESS: Clear Draft
        if (!isEditMode) {
          localStorage.removeItem("reservation_draft");
        }
        addToast(
          isEditMode ? "Reservation updated" : "Reservation created",
          "success",
        );
        navigate("/reservations");
      } else {
        addToast("Failed to save reservation. Check availability.", "error");
      }
    } catch (err) {
      console.error("Submit failed", err);
      addToast("An error occurred", "error");
    }
  };

  return (
    <div className="container">
      <header className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h1>{isEditMode ? "Edit Reservation" : "New Reservation"}</h1>
          {!isEditMode && draftLoaded && (
            <span className="badge-draft">Draft Restored</span>
          )}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {!isEditMode && (formData.date || formData.notes) && (
            <button
              type="button"
              onClick={clearDraft}
              className="btn-secondary"
              title="Discard Draft"
            >
              <RotateCcw size={16} style={{ marginRight: "5px" }} />
              Reset
            </button>
          )}
          <button
            onClick={() => navigate("/reservations")}
            className="btn-close"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      <form onSubmit={onSubmit} className="banking-form">
        <div className="form-grid">
          {/* DINING ROOM */}
          <div className="input-group">
            <label htmlFor="dining_room_id">Dining Room</label>
            <select
              id="dining_room_id"
              name="dining_room_id"
              value={formData.dining_room_id}
              onChange={onChange}
              className={formErrors.dining_room_id ? "input-error" : ""}
            >
              <option value="">-- Select Room --</option>
              {diningRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} (Cap: {room.capacity})
                </option>
              ))}
            </select>
            {formErrors.dining_room_id && (
              <div className="error-text">
                <AlertCircle size={14} /> {formErrors.dining_room_id}
              </div>
            )}
          </div>

          {/* MEAL TYPE */}
          <div className="input-group">
            <label htmlFor="meal_type">Meal Type</label>
            <select
              id="meal_type"
              name="meal_type"
              value={formData.meal_type}
              onChange={onChange}
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="event">Special Event</option>
            </select>
          </div>

          {/* DATE */}
          <div className="input-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={onChange}
              className={formErrors.date ? "input-error" : ""}
            />
            {formErrors.date && (
              <div className="error-text">
                <AlertCircle size={14} /> {formErrors.date}
              </div>
            )}
          </div>

          {/* TIME ROW */}
          <div className="input-row">
            <div className="input-group">
              <label htmlFor="start_time">Start Time</label>
              <input
                type="time"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={onChange}
                className={formErrors.start_time ? "input-error" : ""}
              />
            </div>
            <div className="input-group">
              <label htmlFor="end_time">End Time</label>
              <input
                type="time"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={onChange}
                className={formErrors.end_time ? "input-error" : ""}
              />
            </div>
          </div>
          {formErrors.end_time && (
            <div
              className="error-text"
              style={{ marginTop: "-15px", marginBottom: "15px" }}
            >
              <AlertCircle size={14} /> {formErrors.end_time}
            </div>
          )}

          {/* NOTES */}
          <div className="input-group">
            <label htmlFor="notes">Notes / Special Requests</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={onChange}
              rows="3"
              placeholder="Allergies, seating preferences, etc."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            <Save size={18} style={{ marginRight: "8px" }} />
            {isEditMode ? "Update Reservation" : "Confirm Booking"}
          </button>
        </div>
      </form>

      {!isEditMode && (
        <div className="autosave-indicator">
          <small className="text-muted">
            Form autosaves locally every 5 seconds.
          </small>
        </div>
      )}
    </div>
  );
}
