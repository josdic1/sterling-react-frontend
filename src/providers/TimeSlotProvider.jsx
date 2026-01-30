// providers/TimeSlotProvider.jsx
import { useState, useEffect } from "react";
import { TimeSlotContext } from "../contexts/TimeSlotContext";

const API_URL = "http://localhost:8080";

export function TimeSlotProvider({ children }) {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // GET
  const fetchTimeSlots = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/time-slots`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setTimeSlots(data);
      }
    } catch (err) {
      console.error("Failed to fetch time slots", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  // Note: TimeSlots are typically read-only (no create/update/delete in basic version)
  // But including them for completeness if you want admin features later

  const value = {
    timeSlots,
    loading,
    fetchTimeSlots
  };

  return (
    <TimeSlotContext.Provider value={value}>
      {children}
    </TimeSlotContext.Provider>
  );
}