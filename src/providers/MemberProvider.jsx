// providers/MemberProvider.jsx
import { useState, useEffect } from "react";
import { MemberContext } from "../contexts/MemberContext";

const API_URL = "http://localhost:8080";

export function MemberProvider({ children }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // GET
  const fetchMembers = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setMembers(data);
      }
    } catch (err) {
      console.error("Failed to fetch members", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // POST
  const createMember = async (newMember) => {
    const token = localStorage.getItem("token");
    try {
      const resp = await fetch(`${API_URL}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newMember)
      });
      if (resp.ok) {
        const data = await resp.json();
        setMembers([...members, data]);
      }
    } catch (err) {
      console.error("Failed to create member", err);
    }
  };

  // PATCH
  const updateMember = async (updatedMember, id) => {
    const token = localStorage.getItem("token");
    try {
      const resp = await fetch(`${API_URL}/members/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedMember)
      });
      if (resp.ok) {
        const data = await resp.json();
        setMembers(members.map(m => m.id === data.id ? data : m));
      }
    } catch (err) {
      console.error("Failed to update member", err);
    }
  };

  // DELETE
  const deleteMember = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const resp = await fetch(`${API_URL}/members/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        setMembers(members.filter(m => m.id !== parseInt(id)));
      }
    } catch (err) {
      console.error("Failed to delete member", err);
    }
  };

  const value = {
    members,
    loading,
    fetchMembers,
    createMember,
    updateMember,
    deleteMember
  };

  return (
    <MemberContext.Provider value={value}>
      {children}
    </MemberContext.Provider>
  );
}