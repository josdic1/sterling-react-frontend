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

/* ------------------ TIME HELPERS ------------------ */

const snapTo15 = (time) => {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const snapped = Math.round(m / 15) * 15;
  const hour = h + (snapped === 60 ? 1 : 0);
  const minute = snapped === 60 ? 0 : snapped;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const minutesBetween = (start, end) => {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
};

/* ------------------ COMPONENT ------------------ */

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
  const nowTime = new Date().toTimeString().slice(0, 5);

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
      if (!draft) return;

      try {
        const parsed = JSON.parse(draft);
        if (parsed.date || parsed.notes || parsed.dining_room_id) {
          if (window.confirm("Resume unsaved reservation draft?")) {
            setFormData(parsed);
            setDraftLoaded(true);
            addToast("Draft restored", "success");
          } else {
            localStorage.removeItem("reservation_draft");
          }
        }
      } catch {
        localStorage.removeItem("reservation_draft");
      }
    }
  }, [isEditMode, existingReservation, addToast]);

  /* ---------- AUTO-SET TIMES ON MEAL CHANGE ---------- */

  useEffect(() => {
    if (isEditMode || draftLoaded) return;

    const defaults = MEAL_DEFAULTS[formData.meal_type];
    if (!defaults) return;

    setFormData((prev) => ({
      ...prev,
      start_time: snapTo15(defaults.start),
      end_time: snapTo15(defaults.end),
    }));
  }, [formData.meal_type, isEditMode, draftLoaded]);

  /* ---------- AUTOSAVE ---------- */

  useEffect(() => {
    if (isEditMode) return;

    const interval = setInterval(() => {
      if (formData.date || formData.notes || formData.dining_room_id) {
        localStorage.setItem("reservation_draft", JSON.stringify(formData));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [formData, isEditMode]);

  /* ---------- CHANGE HANDLER ---------- */

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((p) => ({ ...p, [name]: null }));
    }
  };

  /* ---------- CLEAR DRAFT ---------- */

  const clearDraft = () => {
    if (!window.confirm("Discard draft?")) return;
    localStorage.removeItem("reservation_draft");
    setDraftLoaded(false);
    setFormData({
      dining_room_id: "",
      date: "",
      meal_type: "dinner",
      start_time: "",
      end_time: "",
      notes: "",
    });
    addToast("Draft discarded", "info");
  };

  /* ---------- VALIDATION ---------- */

  const validate = () => {
    const errors = {};

    if (!formData.dining_room_id)
      errors.dining_room_id = "Dining room required";
    if (!formData.date) errors.date = "Date required";
    if (!formData.start_time) errors.start_time = "Start time required";
    if (!formData.end_time) errors.end_time = "End time required";

    if (
      formData.date === today &&
      formData.start_time &&
      formData.start_time < nowTime
    ) {
      errors.start_time = "Cannot schedule in the past";
    }

    if (
      formData.start_time &&
      formData.end_time &&
      minutesBetween(formData.start_time, formData.end_time) < 15
    ) {
      errors.end_time = "Reservation must be at least 15 minutes";
    }

    if (
      formData.start_time &&
      formData.end_time &&
      formData.start_time >= formData.end_time
    ) {
      errors.end_time = "End time must be after start time";
    }

    return errors;
  };

  /* ---------- SUBMIT ---------- */

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = validate();
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      ...formData,
      dining_room_id: parseInt(formData.dining_room_id),
    };

    const result = isEditMode
      ? await updateReservation(parseInt(id), payload)
      : await createReservation(payload);

    if (!result) {
      addToast("Failed to save reservation", "error");
      return;
    }

    if (!isEditMode) localStorage.removeItem("reservation_draft");
    addToast(
      isEditMode ? "Reservation updated" : "Reservation created",
      "success",
    );
    navigate("/");
  };

  /* ---------- RENDER ---------- */

  return (
    <div className="container">
      <header className="page-header">
        <h1>{isEditMode ? "Edit Reservation" : "New Reservation"}</h1>

        {!isEditMode && draftLoaded && (
          <span className="badge-draft">Draft</span>
        )}

        {!isEditMode && (formData.date || formData.notes) && (
          <button onClick={clearDraft} className="btn-secondary">
            <RotateCcw size={16} /> Reset
          </button>
        )}

        <button onClick={() => navigate("/reservations")} className="btn-close">
          <X size={20} />
        </button>
      </header>

      <form onSubmit={onSubmit} className="banking-form">
        <div className="form-grid">
          <div className="input-group">
            <label>Dining Room</label>
            <select
              name="dining_room_id"
              value={formData.dining_room_id}
              onChange={onChange}
            >
              <option value="">-- Select Room --</option>
              {diningRooms
                .filter((room) => room.is_active) // ← ADD THIS LINE
                .map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} - {room.capacity} seats
                  </option>
                ))}
            </select>
            {formErrors.dining_room_id && (
              <div className="error-text">
                <AlertCircle size={14} /> {formErrors.dining_room_id}
              </div>
            )}
          </div>

          <div className="input-group">
            <label>Meal Type</label>
            <select
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

          <div className="input-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              min={today}
              value={formData.date}
              onChange={onChange}
            />
            {formErrors.date && (
              <div className="error-text">
                <AlertCircle size={14} /> {formErrors.date}
              </div>
            )}
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>Start Time</label>
              <input
                type="time"
                step="900"
                name="start_time"
                value={formData.start_time}
                onChange={onChange}
              />
            </div>
            <div className="input-group">
              <label>End Time</label>
              <input
                type="time"
                step="900"
                name="end_time"
                value={formData.end_time}
                onChange={onChange}
              />
            </div>
          </div>

          {formErrors.end_time && (
            <div className="error-text">
              <AlertCircle size={14} /> {formErrors.end_time}
            </div>
          )}

          <div className="input-group">
            <label>Notes</label>
            <textarea name="notes" value={formData.notes} onChange={onChange} />
          </div>
        </div>

        <button type="submit" className="btn-primary">
          <Save size={18} /> {isEditMode ? "Update" : "Confirm"}
        </button>
      </form>
    </div>
  );
}
