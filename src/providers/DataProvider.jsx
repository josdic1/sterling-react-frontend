import React, { useState, useEffect, useContext, useCallback } from "react";
import { DataContext } from "../contexts/DataContext";
import { AuthContext } from "../contexts/AuthContext";


console.log("Production Build Verified: HTTPS-Only - v1.0.9");
const API_URL = "https://sterling-fastapi-backend-production.up.railway.app";

export function DataProvider({ children }) {
  const { loggedIn } = useContext(AuthContext);

  const [diningRooms, setDiningRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = useCallback(() => localStorage.getItem("token"), []);

  const fetchReservationById = useCallback(
    async (id) => {
      try {
        const token = getToken();
        const resp = await fetch(`${API_URL}/reservations/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) return null;
        const data = await resp.json();
        setReservations((prev) =>
          prev.some((r) => r.id === data.id)
            ? prev.map((r) => (r.id === data.id ? data : r))
            : [...prev, data],
        );
        return data;
      } catch (err) {
        console.error(err);
        return null;
      }
    },
    [getToken],
  );

  const createReservation = useCallback(
    async (newRes) => {
      const token = getToken();
      const resp = await fetch(`${API_URL}/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newRes),
      });
      if (resp.ok) {
        const data = await resp.json();
        setReservations((prev) => [...prev, data]);
        return data;
      }
      return null;
    },
    [getToken],
  );

  const updateReservation = useCallback(
    async (id, updateData) => {
      const token = getToken();
      const resp = await fetch(`${API_URL}/reservations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
      if (resp.ok) {
        const data = await resp.json();
        setReservations((prev) => prev.map((r) => (r.id === id ? data : r)));
        return data;
      }
      return null;
    },
    [getToken],
  );

  const deleteReservation = useCallback(
    async (id) => {
      const token = getToken();
      const resp = await fetch(`${API_URL}/reservations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) setReservations((prev) => prev.filter((r) => r.id !== id));
    },
    [getToken],
  );

  const fetchAttendees = useCallback(
    async (resId) => {
      try {
        const token = getToken();
        const resp = await fetch(`${API_URL}/reservations/${resId}/attendees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.ok) return await resp.json();
        return [];
      } catch (err) {
        console.error(err);
        return [];
      }
    },
    [getToken],
  );

  const addAttendee = useCallback(
    async (resId, guestData) => {
      try {
        const token = getToken();
        const resp = await fetch(`${API_URL}/reservations/${resId}/attendees`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(guestData),
        });
        if (resp.ok) {
          const newAttendee = await resp.json();
          setReservations((prev) =>
            prev.map((r) =>
              r.id === Number(resId)
                ? { ...r, attendee_count: (r.attendee_count || 0) + 1 }
                : r,
            ),
          );
          return { success: true, data: newAttendee };
        }
        return { success: false };
      } catch (err) {
        console.error(err);
        return { success: false };
      }
    },
    [getToken],
  );

  const removeAttendee = useCallback(
    async (resId, attendeeId) => {
      try {
        const token = getToken();
        const resp = await fetch(
          `${API_URL}/reservations/${resId}/attendees/${attendeeId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (resp.ok) {
          setReservations((prev) =>
            prev.map((r) =>
              r.id === Number(resId)
                ? {
                    ...r,
                    attendee_count: Math.max(0, (r.attendee_count || 0) - 1),
                  }
                : r,
            ),
          );
          return { success: true };
        }
        return { success: false };
      } catch (err) {
        console.error(err);
        return { success: false };
      }
    },
    [getToken],
  );

  const createMember = useCallback(
    async (memberData) => {
      try {
        const token = getToken();
        const resp = await fetch(`${API_URL}/members`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(memberData),
        });
        if (resp.ok) {
          const newMember = await resp.json();
          setMembers((prev) => [...prev, newMember]);
          return { success: true, data: newMember };
        }
        return { success: false };
      } catch (err) {
        console.error(err);
        return { success: false };
      }
    },
    [getToken],
  );

  const updateMember = useCallback(
    async (memberId, updateData) => {
      try {
        const token = getToken();
        const resp = await fetch(`${API_URL}/members/${memberId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        });
        if (resp.ok) {
          const updatedMember = await resp.json();
          setMembers((prev) =>
            prev.map((m) => (m.id === memberId ? updatedMember : m)),
          );
          return { success: true, data: updatedMember };
        }
        return { success: false };
      } catch (err) {
        console.error(err);
        return { success: false };
      }
    },
    [getToken],
  );

  const deleteMember = useCallback(
    async (memberId) => {
      try {
        const token = getToken();
        const resp = await fetch(`${API_URL}/members/${memberId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.ok) {
          setMembers((prev) => prev.filter((m) => m.id !== memberId));
          return { success: true };
        }
        return { success: false };
      } catch (err) {
        console.error(err);
        return { success: false };
      }
    },
    [getToken],
  );

  useEffect(() => {
    const loadAll = async () => {
      const token = getToken();
      if (!token || !loggedIn) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [roomsRes, reservationsRes, membersRes] = await Promise.all([
          fetch(`${API_URL}/dining-rooms`, { headers }),
          fetch(`${API_URL}/reservations`, { headers }),
          fetch(`${API_URL}/members`, { headers }),
        ]);
        if (roomsRes.ok) setDiningRooms(await roomsRes.json());
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

  const value = {
    diningRooms,
    reservations,
    members,
    createMember,
    updateMember,
    deleteMember,
    loading,
    fetchReservationById,
    createReservation,
    updateReservation,
    deleteReservation,
    fetchAttendees,
    addAttendee,
    removeAttendee,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
