import { useState, useEffect, useContext } from "react";
import { DataContext } from "../contexts/DataContext";
import { AuthContext } from "../contexts/AuthContext";

const API_URL = "http://localhost:8080";

export function DataProvider({ children }) {
  const { loggedIn } = useContext(AuthContext);
  const [diningRooms, setDiningRooms] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [members, setMembers] = useState([]);
  const [currentAttendees, setCurrentAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load everything when the user logs in or the app mounts with a token
  useEffect(() => {
    const loadAll = async () => {
      const token = localStorage.getItem("token");
      
      if (!token || !loggedIn) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const [roomsRes, slotsRes, reservationsRes, membersRes] = await Promise.all([
          fetch(`${API_URL}/dining-rooms`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/time-slots`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/reservations`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/members`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (roomsRes.ok) setDiningRooms(await roomsRes.json());
        if (slotsRes.ok) setTimeSlots(await slotsRes.json());
        if (reservationsRes.ok) setReservations(await reservationsRes.json());
        if (membersRes.ok) setMembers(await membersRes.json());
      } catch (err) {
        console.error("Data load failed", err);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [loggedIn]); // Triggers fetch automatically once loggedIn becomes true

  const getToken = () => localStorage.getItem("token");

  // ==================== RESERVATIONS ====================
  
  const fetchReservationById = async (id) => {
    try {
      const resp = await fetch(`${API_URL}/reservations/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      if (resp.status === 404) return null;

      if (resp.ok) {
        const data = await resp.json();
        setReservations(prev => {
          const exists = prev.find(r => r.id === data.id);
          return exists 
            ? prev.map(r => r.id === data.id ? data : r) 
            : [...prev, data];
        });
        return data;
      }
    } catch (err) {
      console.error("Fetch reservation failed", err);
      return null;
    }
  };

  const createReservation = async (newRes) => {
    const resp = await fetch(`${API_URL}/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(newRes)
    });
    
    if (resp.ok) {
      const data = await resp.json();
      setReservations(prev => [...prev, data]);
      return data;
    }
  };

  const updateReservation = async (id, updateData) => {
    const resp = await fetch(`${API_URL}/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(updateData)
    });
    
    if (resp.ok) {
      const data = await resp.json();
      setReservations(prev => prev.map(r => r.id === id ? data : r));
      return data;
    }
  };

  const deleteReservation = async (id) => {
    const resp = await fetch(`${API_URL}/reservations/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    
    if (resp.ok) {
      setReservations(prev => prev.filter(r => r.id !== id));
    }
  };

  // ==================== MEMBERS ====================

  const createMember = async (memberData) => {
    const resp = await fetch(`${API_URL}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(memberData)
    });
    
    if (resp.ok) {
      const data = await resp.json();
      setMembers(prev => [...prev, data]);
      return data;
    }
  };

  const updateMember = async (id, updateData) => {
    const resp = await fetch(`${API_URL}/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(updateData)
    });
    
    if (resp.ok) {
      const data = await resp.json();
      setMembers(prev => prev.map(m => m.id === id ? data : m));
      return data;
    }
  };

  const deleteMember = async (id) => {
    const resp = await fetch(`${API_URL}/members/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    
    if (resp.ok) {
      setMembers(prev => prev.filter(m => m.id !== id));
    }
  };

  // ==================== ATTENDEES ====================

  const fetchAttendees = async (resId) => {
    try {
      const resp = await fetch(`${API_URL}/reservations/${resId}/attendees`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      if (resp.ok) {
        const data = await resp.json();
        setCurrentAttendees(data);
        return data;
      }
    } catch (err) {
      console.error("Fetch attendees failed", err);
    }
  };

  const addAttendee = async (resId, guestData) => {
    try {
      const resp = await fetch(`${API_URL}/reservations/${resId}/attendees`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(guestData)
      });
      
      if (resp.ok) {
        await fetchAttendees(resId);
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      console.error("Add attendee failed", err);
      return { success: false };
    }
  };

  const removeAttendee = async (resId, attendeeId) => {
    try {
      const resp = await fetch(`${API_URL}/reservations/${resId}/attendees/${attendeeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      if (resp.ok) {
        await fetchAttendees(resId);
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      console.error("Remove attendee failed", err);
      return { success: false };
    }
  };

  const value = {
    diningRooms,
    timeSlots,
    reservations,
    members,
    currentAttendees,
    loading,
    fetchReservationById,
    createReservation,
    updateReservation,
    deleteReservation,
    createMember,
    updateMember,
    deleteMember,
    fetchAttendees,
    addAttendee,
    removeAttendee
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}