// src/providers/DataProvider.jsx
import React, { useState, useEffect, useContext, useCallback } from "react";
import { DataContext } from "../contexts/DataContext";
import { AuthContext } from "../contexts/AuthContext";
import { api, retryRequest } from "../utils/api";

const CACHE_TTL_MS = 5 * 60 * 1000;

export function DataProvider({ children }) {
  const { loggedIn } = useContext(AuthContext);

  const [diningRooms, setDiningRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ------------------ CACHE HELPERS ------------------ */

  const getToken = () => localStorage.getItem("token");

  const getCacheKey = useCallback(() => {
    const token = getToken();
    if (!token) return null;
    return `sterling_cache_${token}`;
  }, []);

  const writeCache = useCallback(
    (nextRooms, nextReservations, nextMembers) => {
      const cacheKey = getCacheKey();
      if (!cacheKey) return;

      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          rooms: nextRooms ?? [],
          reservations: nextReservations ?? [],
          members: nextMembers ?? [],
        }),
      );
      localStorage.setItem(`${cacheKey}_time`, String(Date.now()));
    },
    [getCacheKey],
  );

  const readCache = useCallback(() => {
    const cacheKey = getCacheKey();
    if (!cacheKey) return null;

    const cachedData = localStorage.getItem(cacheKey);
    const cacheTime = localStorage.getItem(`${cacheKey}_time`);
    if (!cachedData || !cacheTime) return null;

    const age = Date.now() - Number(cacheTime);
    if (Number.isNaN(age) || age > CACHE_TTL_MS) return null;

    try {
      return JSON.parse(cachedData);
    } catch {
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(`${cacheKey}_time`);
      return null;
    }
  }, [getCacheKey]);

  const clearCache = useCallback(() => {
    const cacheKey = getCacheKey();
    if (!cacheKey) return;
    localStorage.removeItem(cacheKey);
    localStorage.removeItem(`${cacheKey}_time`);
  }, [getCacheKey]);

  /* ------------------ RESERVATIONS ------------------ */

  const fetchReservationById = useCallback(
    async (id) => {
      try {
        const data = await retryRequest(() => api.get(`/reservations/${id}`));

        setReservations((prev) => {
          const next = prev.some((r) => r.id === data.id)
            ? prev.map((r) => (r.id === data.id ? data : r))
            : [...prev, data];

          // keep cache in sync
          writeCache(diningRooms, next, members);
          return next;
        });

        return data;
      } catch (err) {
        console.error("fetchReservationById error:", err);
        return null;
      }
    },
    [diningRooms, members, writeCache],
  );

  const createReservation = useCallback(
    async (newRes) => {
      try {
        const data = await api.post("/reservations/", newRes);

        setReservations((prev) => {
          const next = [...prev, data];
          writeCache(diningRooms, next, members);
          return next;
        });

        return data;
      } catch (err) {
        console.error("createReservation error:", err);
        return null;
      }
    },
    [diningRooms, members, writeCache],
  );

  const updateReservation = useCallback(
    async (id, updateData) => {
      try {
        const data = await api.patch(`/reservations/${id}`, updateData);

        setReservations((prev) => {
          const next = prev.map((r) => (r.id === id ? data : r));
          writeCache(diningRooms, next, members);
          return next;
        });

        return data;
      } catch (err) {
        console.error("updateReservation error:", err);
        return null;
      }
    },
    [diningRooms, members, writeCache],
  );

  const deleteReservation = useCallback(
    async (id) => {
      try {
        await api.delete(`/reservations/${id}`);

        setReservations((prev) => {
          const next = prev.filter((r) => r.id !== id);
          writeCache(diningRooms, next, members);
          return next;
        });

        return true;
      } catch (err) {
        console.error("deleteReservation error:", err);
        return false;
      }
    },
    [diningRooms, members, writeCache],
  );

  /* ------------------ ATTENDEES ------------------ */

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

  const addAttendee = useCallback(
    async (resId, guestData) => {
      try {
        const newAttendee = await api.post(
          `/reservations/${resId}/attendees/`,
          guestData,
        );

        setReservations((prev) => {
          const next = prev.map((r) =>
            r.id === Number(resId)
              ? { ...r, attendee_count: (r.attendee_count || 0) + 1 }
              : r,
          );
          writeCache(diningRooms, next, members);
          return next;
        });

        return { success: true, data: newAttendee };
      } catch (err) {
        console.error("addAttendee error:", err);
        return { success: false };
      }
    },
    [diningRooms, members, writeCache],
  );

  const removeAttendee = useCallback(
    async (resId, attendeeId) => {
      try {
        await api.delete(`/reservations/${resId}/attendees/${attendeeId}/`);

        setReservations((prev) => {
          const next = prev.map((r) =>
            r.id === Number(resId)
              ? {
                  ...r,
                  attendee_count: Math.max(0, (r.attendee_count || 0) - 1),
                }
              : r,
          );
          writeCache(diningRooms, next, members);
          return next;
        });

        return { success: true };
      } catch (err) {
        console.error("removeAttendee error:", err);
        return { success: false };
      }
    },
    [diningRooms, members, writeCache],
  );

  /* ------------------ MEMBERS ------------------ */

  const createMember = useCallback(
    async (memberData) => {
      try {
        const newMember = await api.post("/members/", memberData);

        setMembers((prev) => {
          const next = [...prev, newMember];
          writeCache(diningRooms, reservations, next);
          return next;
        });

        return { success: true, data: newMember };
      } catch (err) {
        console.error("createMember error:", err);
        return { success: false };
      }
    },
    [diningRooms, reservations, writeCache],
  );

  const updateMember = useCallback(
    async (memberId, updateData) => {
      try {
        const updatedMember = await api.patch(
          `/members/${memberId}/`,
          updateData,
        );

        setMembers((prev) => {
          const next = prev.map((m) => (m.id === memberId ? updatedMember : m));
          writeCache(diningRooms, reservations, next);
          return next;
        });

        return { success: true, data: updatedMember };
      } catch (err) {
        console.error("updateMember error:", err);
        return { success: false };
      }
    },
    [diningRooms, reservations, writeCache],
  );

  const deleteMember = useCallback(
    async (memberId) => {
      try {
        await api.delete(`/members/${memberId}/`);

        setMembers((prev) => {
          const next = prev.filter((m) => m.id !== memberId);
          writeCache(diningRooms, reservations, next);
          return next;
        });

        return { success: true };
      } catch (err) {
        console.error("deleteMember error:", err);
        return { success: false };
      }
    },
    [diningRooms, reservations, writeCache],
  );

  /* ------------------ INITIAL LOAD ------------------ */

  useEffect(() => {
    const loadAll = async () => {
      const token = getToken();
      if (!token || !loggedIn) {
        setLoading(false);
        return;
      }

      // 1) Try cache
      const cached = readCache();
      if (cached) {
        setDiningRooms(cached.rooms || []);
        setReservations(cached.reservations || []);
        setMembers(cached.members || []);
        setLoading(false);
        return;
      }

      // 2) Fetch fresh
      setLoading(true);
      try {
        const [roomsData, resData, memData] = await Promise.all([
          retryRequest(() => api.get("/dining-rooms/")),
          retryRequest(() => api.get("/reservations/")),
          retryRequest(() => api.get("/members/")),
        ]);

        const nextRooms = roomsData || [];
        const nextRes = resData || [];
        const nextMem = memData || [];

        setDiningRooms(nextRooms);
        setReservations(nextRes);
        setMembers(nextMem);

        writeCache(nextRooms, nextRes, nextMem);
      } catch (err) {
        console.error("loadAll failed after retries:", err);
        // If fetch fails, do not keep stale cache around
        clearCache();
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [loggedIn, readCache, writeCache, clearCache]);

  /* ------------------ DINING ROOMS ------------------ */

  const fetchDiningRooms = useCallback(async () => {
    try {
      const data = await retryRequest(() => api.get("/dining-rooms/"));
      const nextRooms = data || [];

      setDiningRooms(nextRooms);
      writeCache(nextRooms, reservations, members);

      return nextRooms;
    } catch (err) {
      console.error("fetchDiningRooms error:", err);
      return null;
    }
  }, [members, reservations, writeCache]);

  const adminUpdateDiningRoom = useCallback(
    async (roomId, updateData) => {
      try {
        const updated = await api.patch(
          `/admin/dining-rooms/${roomId}/`,
          updateData,
        );

        setDiningRooms((prev) => {
          const next = prev.map((r) => (r.id === roomId ? updated : r));
          writeCache(next, reservations, members);
          return next;
        });

        return { success: true, data: updated };
      } catch (err) {
        console.error("adminUpdateDiningRoom error:", err);
        return { success: false };
      }
    },
    [members, reservations, writeCache],
  );

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
    fetchDiningRooms,
    adminUpdateDiningRoom,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
