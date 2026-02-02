import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "../../hooks/useData";
import { useToastTrigger } from "../../hooks/useToast";
import { Save, X, AlertCircle, RotateCcw } from "lucide-react";

/* ------------------ MEAL DEFAULTS ------------------ */

const MEAL_DEFAULTS = {
  breakfast: { start: "08:00", end: "09:30" },
  lunch: { start: "12:00", end: "13:30" },
  dinner: { start: "18:00", end: "20:00" },
  event: { start: "18:00", end: "22:00" },
};

export function ReservationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { diningRooms, createReservation, updateReservation, reservations } =
    useData();
  const { addToast } = useToastTrigger();

  const isEditMode = Boolean(id);
  const existingReservation = isEditMode
    ? reservations.find((r) => r.id === parseInt(id))
    : null;

  const today = new Date().toISOString().slice(0, 10);

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

  /* ---------- LOAD EDIT OR DRAFT ---------- */
  useEffect(() => {
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

    if (!isEditMode) {
      const draft = localStorage.getItem("reservation_draft");
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
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
          localStorage.removeItem("reservation_draft");
        }
      }
    }
  }, [isEditMode, existingReservation, addToast]);

  /* ---------- AUTOFILL DEFAULT TIMES ON MEAL CHANGE ---------- */
  useEffect(() => {
    if (isEditMode || draftLoaded) return;

    const defaults = MEAL_DEFAULTS[formData.meal_type] || {
      start: "",
      end: "",
    };

    setFormData((prev) => ({
      ...prev,
      start_time: defaults.start,
      end_time: defaults.end,
    }));
  }, [formData.meal_type, isEditMode, draftLoaded]);

  /* ---------- AUTOSAVE (CREATE MODE ONLY) ---------- */
  useEffect(() => {
    if (isEditMode) return;

    const saveInterval = setInterval(() => {
      if (formData.date || formData.notes || formData.dining_room_id) {
        localStorage.setItem("reservation_draft", JSON.stringify(formData));
      }
    }, 5000);

    return () => clearInterval(saveInterval);
  }, [formData, isEditMode]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    // Prevent past dates/times
    if (formData.date) {
      const selected = new Date(formData.date);
      const now = new Date();
      const todayDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );

      if (selected < todayDate) {
        errors.date = "Cannot book past dates";
      }

      if (selected.getTime() === todayDate.getTime() && formData.start_time) {
        const [h, m] = formData.start_time.split(":").map(Number);
        const startDt = new Date(now);
        startDt.setHours(h, m, 0, 0);
        if (startDt <= now) {
          errors.start_time = "Start time must be in the future";
        }
      }
    }

    // Time order & minimum duration
    if (formData.start_time && formData.end_time) {
      if (formData.start_time >= formData.end_time) {
        errors.end_time = "End time must be after start time";
      } else {
        const [sh, sm] = formData.start_time.split(":").map(Number);
        const [eh, em] = formData.end_time.split(":").map(Number);
        const durationMins = eh * 60 + em - (sh * 60 + sm);
        if (durationMins < 15) {
          errors.end_time = "Reservation must be at least 15 minutes long";
        }
      }
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
      const payload = {
        ...formData,
        dining_room_id: parseInt(formData.dining_room_id),
      };

      const result = isEditMode
        ? await updateReservation(parseInt(id), payload)
        : await createReservation(payload);

      if (result) {
        if (!isEditMode) localStorage.removeItem("reservation_draft");
        addToast(
          isEditMode ? "Reservation updated" : "Reservation created",
          "success",
        );
        navigate("/");
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
          {!isEditMode &&
            (formData.date || formData.notes || formData.dining_room_id) && (
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
              min={today}
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
                step="900"
                value={formData.start_time}
                onChange={onChange}
                className={formErrors.start_time ? "input-error" : ""}
              />
              {formErrors.start_time && (
                <div className="error-text">
                  <AlertCircle size={14} /> {formErrors.start_time}
                </div>
              )}
            </div>
            <div className="input-group">
              <label htmlFor="end_time">End Time</label>
              <input
                type="time"
                id="end_time"
                name="end_time"
                step="900"
                value={formData.end_time}
                onChange={onChange}
                className={formErrors.end_time ? "input-error" : ""}
              />
              {formErrors.end_time && (
                <div className="error-text">
                  <AlertCircle size={14} /> {formErrors.end_time}
                </div>
              )}
            </div>
          </div>

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
