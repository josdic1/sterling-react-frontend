// providers/DiningRoomProvider.jsx
import { useState, useEffect } from "react";
import { DiningRoomContext } from "../contexts/DiningRoomContext";

const API_URL = "http://localhost:8080";

export function DiningRoomProvider({ children }) {
  const [diningRooms, setDiningRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  // GET
  const fetchDiningRooms = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/dining-rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setDiningRooms(data);
      }
    } catch (err) {
      console.error("Failed to fetch dining rooms", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiningRooms();
  }, []);

  // POST
  const createDiningRoom = async (newDiningRoom) => {
    const token = localStorage.getItem("token");
    try {
      const resp = await fetch(`${API_URL}/dining-rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newDiningRoom)
      });
      if (resp.ok) {
        const data = await resp.json();
        setDiningRooms([...diningRooms, data]);
      }
    } catch (err) {
      console.error("Failed to create dining room", err);
    }
  };

  // PATCH
  const updateDiningRoom = async (updatedDiningRoom, id) => {
    const token = localStorage.getItem("token");
    try {
      const resp = await fetch(`${API_URL}/dining-rooms/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedDiningRoom)
      });
      if (resp.ok) {
        const data = await resp.json();
        setDiningRooms(diningRooms.map(r => r.id === data.id ? data : r));
      }
    } catch (err) {
      console.error("Failed to update dining room", err);
    }
  };

  // DELETE
  const deleteDiningRoom = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const resp = await fetch(`${API_URL}/dining-rooms/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        setDiningRooms(diningRooms.filter(r => r.id !== parseInt(id)));
      }
    } catch (err) {
      console.error("Failed to delete dining room", err);
    }
  };

  const value = {
    diningRooms,
    loading,
    fetchDiningRooms,
    createDiningRoom,
    updateDiningRoom,
    deleteDiningRoom
  };

  return (
    <DiningRoomContext.Provider value={value}>
      {children}
    </DiningRoomContext.Provider>
  );
}