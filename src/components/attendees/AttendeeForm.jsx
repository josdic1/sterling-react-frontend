// src/components/attendees/AttendeeForm.jsx
import { useState } from "react";
import { useData } from "../../hooks/useData";

export function AttendeeForm({ reservationId, onSuccess }) {
  const { addAttendee } = useData();
  const [formData, setFormData] = useState({ name: "", dietary_restrictions: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const result = await addAttendee(reservationId, formData);
    
    if (result.success) {
      // Only call onSuccess if it was provided
      if (onSuccess) {
        onSuccess(formData.name);
      }
      setFormData({ name: "", dietary_restrictions: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="guest-quick-form">
      <input
        type="text"
        placeholder="Guest Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      <input
        type="text"
        placeholder="Dietary Notes (Optional)"
        value={formData.dietary_restrictions}
        onChange={(e) => setFormData({...formData, dietary_restrictions: e.target.value})}
      />
      <button type="submit">Seat Guest</button>
    </form>
  );
}