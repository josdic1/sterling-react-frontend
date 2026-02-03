// src/providers/DataProvider.jsx
import React, { useState, useEffect, useContext, useCallback } from "react";
import { DataContext } from "../contexts/DataContext";
import { AuthContext } from "../contexts/AuthContext";
import { api, retryRequest } from "../utils/api";
import { asArrayOfObjects } from "../utils/safe";

const CACHE_TTL_MS = 5 * 60 * 1000;

// IMPORTANT: make this match your backend.
// If your backend uses /dining-rooms/ then change this to "/dining-rooms/"
const DINING_ROOMS_ENDPOINT = "/dining-rooms/";

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

      // sanitize BEFORE caching so garbage never persists
      const safeRooms = asArrayOfObjects(nextRooms);
      const safeRes = asArrayOfObjects(nextReservations);
      const safeMembers = asArrayOfObjects(nextMembers);

      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          rooms: safeRooms,
          reservations: safeRes,
          members: safeMembers,
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
      const parsed = JSON.parse(cachedData);

      // sanitize AFTER reading cache too
      return {
        rooms: asArrayOfObjects(parsed?.rooms),
        reservations: asArrayOfObjects(parsed?.reservations),
        members: asArrayOfObjects(parsed?.members),
      };
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
        if (!data || typeof data !== "object") return null;

        setReservations((prev) => {
          const safePrev = asArrayOfObjects(prev);

          const next = safePrev.some((r) => r?.id === data.id)
            ? safePrev.map((r) => (r?.id === data.id ? data : r))
            : [...safePrev, data];

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
        if (!data || typeof data !== "object") return null;

        setReservations((prev) => {
          const safePrev = asArrayOfObjects(prev);
          const next = [...safePrev, data];
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
        if (!data || typeof data !== "object") return null;

        setReservations((prev) => {
          const safePrev = asArrayOfObjects(prev);
          const next = safePrev.map((r) => (r?.id === id ? data : r));
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
          const safePrev = asArrayOfObjects(prev);
          const next = safePrev.filter((r) => r?.id !== id);
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
      return asArrayOfObjects(data);
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
          const safePrev = asArrayOfObjects(prev);
          const next = safePrev.map((r) =>
            r?.id === Number(resId)
              ? { ...r, attendee_count: (r?.attendee_count || 0) + 1 }
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
          const safePrev = asArrayOfObjects(prev);
          const next = safePrev.map((r) =>
            r?.id === Number(resId)
              ? {
                  ...r,
                  attendee_count: Math.max(0, (r?.attendee_count || 0) - 1),
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
        if (!newMember || typeof newMember !== "object") {
          return { success: false };
        }

        setMembers((prev) => {
          const safePrev = asArrayOfObjects(prev);
          const next = [...safePrev, newMember];
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
        if (!updatedMember || typeof updatedMember !== "object") {
          return { success: false };
        }

        setMembers((prev) => {
          const safePrev = asArrayOfObjects(prev);
          const next = safePrev.map((m) =>
            m?.id === memberId ? updatedMember : m,
          );
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
          const safePrev = asArrayOfObjects(prev);
          const next = safePrev.filter((m) => m?.id !== memberId);
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
        setDiningRooms(asArrayOfObjects(cached.rooms));
        setReservations(asArrayOfObjects(cached.reservations));
        setMembers(asArrayOfObjects(cached.members));
        setLoading(false);
        return;
      }

      // 2) Fetch fresh
      setLoading(true);
      try {
        const [roomsData, resData, memData] = await Promise.all([
          retryRequest(() => api.get(DINING_ROOMS_ENDPOINT)),
          retryRequest(() => api.get("/reservations/")),
          retryRequest(() => api.get("/members/")),
        ]);

        const nextRooms = asArrayOfObjects(roomsData);
        const nextRes = asArrayOfObjects(resData);
        const nextMem = asArrayOfObjects(memData);

        setDiningRooms(nextRooms);
        setReservations(nextRes);
        setMembers(nextMem);

        writeCache(nextRooms, nextRes, nextMem);
      } catch (err) {
        console.error("loadAll failed after retries:", err);
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
      const data = await retryRequest(() => api.get(DINING_ROOMS_ENDPOINT));
      const nextRooms = asArrayOfObjects(data);

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
        // keep your current admin endpoint as-is
        const updated = await api.patch(
          `/admin/dining-rooms/${roomId}/`,
          updateData,
        );

        setDiningRooms((prev) => {
          const safePrev = asArrayOfObjects(prev);
          const next = safePrev.map((r) => (r?.id === roomId ? updated : r));
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
