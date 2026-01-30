import React, { useState, useEffect, useContext, useCallback } from "react";
import { DataContext } from "../contexts/DataContext";
import { AuthContext } from "../contexts/AuthContext";

const API_URL = "http://localhost:8080";

export function DataProvider({ children }) {
  const { loggedIn } = useContext(AuthContext);

  // ---------- STATE ----------
  const [diningRooms, setDiningRooms] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [members, setMembers] = useState([]);
  const [currentAttendees, setCurrentAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------- TOKEN ----------
  const getToken = useCallback(() => localStorage.getItem("token"), []);

  // ---------- FETCH FUNCTIONS ----------
  async function fetchReservationById(id) {
    try {
      const token = getToken();
      const resp = await fetch(`${API_URL}/reservations/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!resp.ok) return null;
      const data = await resp.json();
      setReservations(prev =>
        prev.some(r => r.id === data.id) ? prev.map(r => r.id === data.id ? data : r) : [...prev, data]
      );
      return data;
    } catch (err) {
      console.error("fetchReservationById failed:", err);
      return null;
    }
  }

  async function createReservation(newRes) {
    const token = getToken();
    const resp = await fetch(`${API_URL}/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(newRes)
    });
    if (resp.ok) {
      const data = await resp.json();
      setReservations(prev => [...prev, data]);
      return data;
    }
  }

  async function updateReservation(id, updateData) {
    const token = getToken();
    const resp = await fetch(`${API_URL}/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(updateData)
    });
    if (resp.ok) {
      const data = await resp.json();
      setReservations(prev => prev.map(r => r.id === id ? data : r));
      return data;
    }
  }

  async function deleteReservation(id) {
    const token = getToken();
    const resp = await fetch(`${API_URL}/reservations/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (resp.ok) setReservations(prev => prev.filter(r => r.id !== id));
  }

  async function createMember(memberData) {
    const token = getToken();
    const resp = await fetch(`${API_URL}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(memberData)
    });
    if (resp.ok) {
      const data = await resp.json();
      setMembers(prev => [...prev, data]);
      return data;
    }
  }

  async function updateMember(id, updateData) {
    const token = getToken();
    const resp = await fetch(`${API_URL}/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(updateData)
    });
    if (resp.ok) {
      const data = await resp.json();
      setMembers(prev => prev.map(m => m.id === id ? data : m));
      return data;
    }
  }

  async function deleteMember(id) {
    const token = getToken();
    const resp = await fetch(`${API_URL}/members/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (resp.ok) setMembers(prev => prev.filter(m => m.id !== id));
  }

  async function fetchAttendees(resId) {
    try {
      const token = getToken();
      const resp = await fetch(`${API_URL}/reservations/${resId}/attendees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setCurrentAttendees(data);
        return data;
      }
    } catch (err) { console.error("fetchAttendees failed:", err); }
  }

  async function addAttendee(resId, guestData) {
    try {
      const token = getToken();
      const resp = await fetch(`${API_URL}/reservations/${resId}/attendees`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(guestData)
      });
      if (resp.ok) {
        const newAttendee = await resp.json();
        setCurrentAttendees(prev => [...prev, newAttendee]);
        setReservations(prev => prev.map(res => res.id === parseInt(resId) ? { ...res, attendee_count: (res.attendee_count || 0) + 1 } : res));
        return { success: true };
      }
      return { success: false };
    } catch (err) { return { success: false }; }
  }

  async function removeAttendee(resId, attendeeId) {
    try {
      const token = getToken();
      const resp = await fetch(`${API_URL}/reservations/${resId}/attendees/${attendeeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        setCurrentAttendees(prev => prev.filter(att => att.id !== attendeeId));
        setReservations(prev => prev.map(res => res.id === parseInt(resId) ? { ...res, attendee_count: Math.max(0, (res.attendee_count || 0) - 1) } : res));
        return { success: true };
      }
      return { success: false };
    } catch (err) { return { success: false }; }
  }

  // ---------- LOAD ALL DATA ON LOGIN ----------
  useEffect(() => {
    const loadAll = async () => {
      const token = getToken();
      if (!token || !loggedIn) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };
        const [roomsRes, slotsRes, reservationsRes, membersRes] = await Promise.all([
          fetch(`${API_URL}/dining-rooms`, { headers }),
          fetch(`${API_URL}/time-slots`, { headers }),
          fetch(`${API_URL}/reservations`, { headers }),
          fetch(`${API_URL}/members`, { headers })
        ]);

        if (roomsRes.ok) setDiningRooms(await roomsRes.json());
        if (slotsRes.ok) setTimeSlots(await slotsRes.json());
        if (reservationsRes.ok) setReservations(await reservationsRes.json());
        if (membersRes.ok) setMembers(await membersRes.json());
      } catch (err) {
        console.error("loadAll failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [loggedIn, getToken]);

  // ---------- CONTEXT VALUE ----------
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
