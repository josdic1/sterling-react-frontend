// src/providers/DataProvider.jsx - PRODUCTION VERSION (NO CONSOLE.LOG)
import React, { useState, useEffect, useContext, useCallback } from "react";
import { DataContext } from "../contexts/DataContext";
import { AuthContext } from "../contexts/AuthContext";
import { api, retryRequest } from "../utils/api";

export function DataProvider({ children }) {
  const { loggedIn } = useContext(AuthContext);

  const [diningRooms, setDiningRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- RESERVATIONS ---

  const fetchReservationById = useCallback(async (id) => {
    try {
      const data = await retryRequest(() => api.get(`/reservations/${id}`));

      setReservations((prev) =>
        prev.some((r) => r.id === data.id)
          ? prev.map((r) => (r.id === data.id ? data : r))
          : [...prev, data],
      );
      return data;
    } catch (err) {
      console.error("fetchReservationById error:", err);
      return null;
    }
  }, []);

  const createReservation = useCallback(async (newRes) => {
    try {
      const data = await api.post("/reservations/", newRes);
      setReservations((prev) => [...prev, data]);
      return data;
    } catch (err) {
      console.error("createReservation error:", err);
      return null;
    }
  }, []);

  const updateReservation = useCallback(async (id, updateData) => {
    try {
      const data = await api.patch(`/reservations/${id}`, updateData);
      setReservations((prev) => prev.map((r) => (r.id === id ? data : r)));
      return data;
    } catch (err) {
      console.error("updateReservation error:", err);
      return null;
    }
  }, []);

  const deleteReservation = useCallback(async (id) => {
    try {
      await api.delete(`/reservations/${id}`);
      setReservations((prev) => prev.filter((r) => r.id !== id));
      return true;
    } catch (err) {
      console.error("deleteReservation error:", err);
      return false;
    }
  }, []);

  // --- ATTENDEES ---

  const fetchAttendees = useCallback(async (resId) => {
    try {
      const data = await retryRequest(() =>
        api.get(`/reservations/${resId}/attendees/`),
      );
      return data || [];
    } catch (err) {
      console.error("fetchAttendees error:", err);
      return [];
    }
  }, []);

  const addAttendee = useCallback(async (resId, guestData) => {
    try {
      const newAttendee = await api.post(
        `/reservations/${resId}/attendees/`,
        guestData,
      );
      setReservations((prev) =>
        prev.map((r) =>
          r.id === Number(resId)
            ? { ...r, attendee_count: (r.attendee_count || 0) + 1 }
            : r,
        ),
      );
      return { success: true, data: newAttendee };
    } catch (err) {
      console.error("addAttendee error:", err);
      return { success: false };
    }
  }, []);

  const removeAttendee = useCallback(async (resId, attendeeId) => {
    try {
      await api.delete(`/reservations/${resId}/attendees/${attendeeId}/`);
      setReservations((prev) =>
        prev.map((r) =>
          r.id === Number(resId)
            ? { ...r, attendee_count: Math.max(0, (r.attendee_count || 0) - 1) }
            : r,
        ),
      );
      return { success: true };
    } catch (err) {
      console.error("removeAttendee error:", err);
      return { success: false };
    }
  }, []);

  // --- MEMBERS ---

  const createMember = useCallback(async (memberData) => {
    try {
      const newMember = await api.post("/members/", memberData);
      setMembers((prev) => [...prev, newMember]);
      return { success: true, data: newMember };
    } catch (err) {
      console.error("createMember error:", err);
      return { success: false };
    }
  }, []);

  const updateMember = useCallback(async (memberId, updateData) => {
    try {
      const updatedMember = await api.patch(
        `/members/${memberId}/`,
        updateData,
      );
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? updatedMember : m)),
      );
      return { success: true, data: updatedMember };
    } catch (err) {
      console.error("updateMember error:", err);
      return { success: false };
    }
  }, []);

  const deleteMember = useCallback(async (memberId) => {
    try {
      await api.delete(`/members/${memberId}/`);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      return { success: true };
    } catch (err) {
      console.error("deleteMember error:", err);
      return { success: false };
    }
  }, []);

  // --- INITIAL LOAD ---

  useEffect(() => {
    const loadAll = async () => {
      const token = localStorage.getItem("token");
      if (!token || !loggedIn) {
        setLoading(false);
        return;
      }

      // 1. Check Cache
      const cacheKey = `sterling_cache_${token}`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(`${cacheKey}_time`);

      if (cachedData && cacheTime) {
        const age = Date.now() - parseInt(cacheTime);
        if (age < 5 * 60 * 1000) {
          try {
            // REMOVED: console.log("Loading from cache...");
            const parsed = JSON.parse(cachedData);
            setDiningRooms(parsed.rooms || []);
            setReservations(parsed.reservations || []);
            setMembers(parsed.members || []);
            setLoading(false);
            return;
          } catch (e) {
            localStorage.removeItem(cacheKey);
          }
        }
      }

      // 2. Fetch Fresh Data (WITH RETRY)
      setLoading(true);
      try {
        const [roomsData, resData, memData] = await Promise.all([
          retryRequest(() => api.get("/dining-rooms/")),
          retryRequest(() => api.get("/reservations/")),
          retryRequest(() => api.get("/members/")),
        ]);

        setDiningRooms(roomsData || []);
        setReservations(resData || []);
        setMembers(memData || []);

        // Update Cache
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            rooms: roomsData,
            reservations: resData,
            members: memData,
          }),
        );
        localStorage.setItem(`${cacheKey}_time`, String(Date.now()));
      } catch (err) {
        console.error("loadAll failed after retries:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [loggedIn]);

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
