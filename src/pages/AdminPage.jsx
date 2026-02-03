import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useData } from "../hooks/useData";
import { useNavigate } from "react-router-dom";
import { api, retryRequest } from "../utils/api";
import { ReservationCalendar } from "../components/ReservationCalendar";
import { useToastTrigger } from "../hooks/useToast";
import {
  Users,
  Calendar,
  DollarSign,
  Home as HomeIcon,
  Search,
  Edit2,
  Save,
  X,
  List,
  Trash2,
  TrendingUp,
  Download,
} from "lucide-react";

export function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToastTrigger();

  // Use provider rooms (single source of truth)
  const { diningRooms, fetchDiningRooms, adminUpdateDiningRoom } = useData();

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.is_admin) {
      addToast("Admin access required", "error");
      navigate("/");
    }
  }, [user, navigate, addToast]);

  // Active tab
  const [activeTab, setActiveTab] = useState("stats");

  // Data states
  const [stats, setStats] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allReservations, setAllReservations] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [allRules, setAllRules] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");

  // Edit states
  const [editingRule, setEditingRule] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);

  // Report date state
  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // ==================== DATA FETCHING ====================

  const fetchStats = async () => {
    try {
      const data = await retryRequest(() => api.get("/admin/stats/"));
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      addToast(err.message || "Failed to load statistics", "error");
    }
  };

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const data = await retryRequest(() => api.get("/admin/users/"));
      setAllUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      addToast(err.message || "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllReservations = async () => {
    try {
      setLoading(true);
      const data = await retryRequest(() => api.get("/admin/reservations/"));
      setAllReservations(data);
    } catch (err) {
      console.error("Failed to fetch reservations:", err);
      addToast(err.message || "Failed to load reservations", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMembers = async () => {
    try {
      setLoading(true);
      const data = await retryRequest(() => api.get("/admin/members/"));
      setAllMembers(data);
    } catch (err) {
      console.error("Failed to fetch members:", err);
      addToast(err.message || "Failed to load members", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRules = async () => {
    try {
      setLoading(true);
      const data = await retryRequest(() => api.get("/admin/rules/"));
      setAllRules(data);
    } catch (err) {
      console.error("Failed to fetch rules:", err);
      addToast(err.message || "Failed to load rules", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRooms = async () => {
    setLoading(true);
    try {
      await fetchDiningRooms();
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
      addToast(err.message || "Failed to load rooms", "error");
    } finally {
      setLoading(false);
    }
  };

  // ==================== REPORT DOWNLOAD ====================

  const handleDownloadReport = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/reports/daily-pdf?date=${reportDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to generate report");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sterling_daily_report_${reportDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      addToast("Report downloaded successfully", "success");
    } catch (err) {
      console.error("Failed to download report:", err);
      addToast("Failed to download report", "error");
    }
  };

  // ==================== TAB CHANGE ====================

  useEffect(() => {
    switch (activeTab) {
      case "stats":
        fetchStats();
        break;
      case "users":
        fetchAllUsers();
        break;
      case "reservations":
      case "calendar":
        fetchAllReservations();
        fetchAllRooms();
        break;
      case "members":
        fetchAllMembers();
        break;
      case "rules":
        fetchAllRules();
        break;
      case "rooms":
        fetchAllRooms();
        break;
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ==================== RULE EDITING ====================

  const handleUpdateRule = async (ruleId, updates) => {
    try {
      await api.patch(`/admin/rules/${ruleId}/`, updates);
      addToast("Rule updated successfully", "success");
      setEditingRule(null);
      fetchAllRules();
    } catch (err) {
      console.error("Failed to update rule:", err);
      addToast(err.message || "Failed to update rule", "error");
    }
  };

  // ==================== ROOM EDITING ====================

  const handleUpdateRoom = async (roomId, updates) => {
    const result = await adminUpdateDiningRoom(roomId, updates);

    if (!result?.success) {
      addToast(result?.error || "Failed to update room", "error");
      return;
    }

    addToast("Room updated successfully", "success");
    setEditingRoom(null);
  };

  // ==================== DELETE FUNCTIONS ====================

  const handleDeleteReservation = async (resId) => {
    if (!window.confirm("Delete this reservation? This cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/admin/reservations/${resId}/`);
      addToast("Reservation deleted", "success");
      fetchAllReservations();
    } catch (err) {
      console.error("Failed to delete reservation:", err);
      addToast(err.message || "Failed to delete reservation", "error");
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm("Delete this member? This cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/admin/members/${memberId}/`);
      addToast("Member deleted", "success");
      fetchAllMembers();
    } catch (err) {
      console.error("Failed to delete member:", err);
      addToast(err.message || "Failed to delete member", "error");
    }
  };

  // ==================== FILTERING ====================

  const filteredReservations = allReservations.filter((res) => {
    if (statusFilter !== "all" && res.status !== statusFilter) return false;
    if (roomFilter !== "all" && res.dining_room_id !== parseInt(roomFilter))
      return false;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        res.notes?.toLowerCase().includes(search) || res.date.includes(search)
      );
    }

    return true;
  });

  const filteredMembers = allMembers.filter((member) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      member.name.toLowerCase().includes(search) ||
      member.relation?.toLowerCase().includes(search)
    );
  });

  // ==================== RENDER ====================

  if (!user?.is_admin) {
    return (
      <div className="container">
        <div className="loading-state">VERIFYING ADMIN ACCESS...</div>
      </div>
    );
  }

  return (
    <div className="container admin-container">
      <header className="page-header">
        <h1 className="admin-title">ADMIN DASHBOARD</h1>
      </header>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === "stats" ? "active" : ""}`}
          onClick={() => setActiveTab("stats")}
        >
          <TrendingUp size={16} />
          <span>Stats</span>
        </button>

        <button
          className={`admin-tab ${activeTab === "calendar" ? "active" : ""}`}
          onClick={() => setActiveTab("calendar")}
        >
          <Calendar size={16} />
          <span>Calendar</span>
        </button>

        <button
          className={`admin-tab ${activeTab === "reservations" ? "active" : ""}`}
          onClick={() => setActiveTab("reservations")}
        >
          <List size={16} />
          <span>List View</span>
        </button>

        <button
          className={`admin-tab ${activeTab === "members" ? "active" : ""}`}
          onClick={() => setActiveTab("members")}
        >
          <Users size={16} />
          <span>All Members</span>
        </button>
        <button
          className={`admin-tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <Users size={16} />
          <span>All Users</span>
        </button>
        <button
          className={`admin-tab ${activeTab === "rules" ? "active" : ""}`}
          onClick={() => setActiveTab("rules")}
        >
          <DollarSign size={16} />
          <span>Fee Rules</span>
        </button>
        <button
          className={`admin-tab ${activeTab === "rooms" ? "active" : ""}`}
          onClick={() => setActiveTab("rooms")}
        >
          <HomeIcon size={16} />
          <span>Dining Rooms</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-content">
        {/* STATS TAB */}
        {activeTab === "stats" && stats && (
          <div>
            {/* DAILY REPORT GENERATOR */}
            <div className="report-generator-card">
              <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>
                📄 Daily Operations Report
              </h3>
              <div className="report-controls">
                <div
                  className="input-group"
                  style={{ flex: 1, maxWidth: "300px" }}
                >
                  <label
                    htmlFor="report-date"
                    style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}
                  >
                    Select Report Date
                  </label>
                  <input
                    id="report-date"
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    style={{
                      padding: "0.75rem",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      width: "100%",
                    }}
                  />
                </div>
                <button
                  onClick={handleDownloadReport}
                  className="btn-primary"
                  style={{
                    background: "var(--sterling-accent)",
                    color: "white",
                    padding: "0.75rem 2rem",
                    fontSize: "0.9rem",
                    fontWeight: "900",
                    border: "none",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    borderRadius: "6px",
                  }}
                >
                  <Download size={18} />
                  DOWNLOAD PDF
                </button>
              </div>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#757575",
                  marginTop: "1rem",
                }}
              >
                Generates a comprehensive PDF with timeline schedule, room
                assignments, and guest counts.
              </p>
            </div>

            {/* STATS GRID */}
            <div className="admin-stats-grid" style={{ marginTop: "2rem" }}>
              <div className="stat-card">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Total Users</span>
                  <span className="stat-value">{stats.total_users}</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Calendar size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Total Reservations</span>
                  <span className="stat-value">{stats.total_reservations}</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Total Members</span>
                  <span className="stat-value">{stats.total_members}</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <DollarSign size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Total Revenue</span>
                  <span className="stat-value">
                    ${stats.total_revenue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CALENDAR TAB */}
        {activeTab === "calendar" && (
          <div>
            {loading ? (
              <div className="loading-state">Loading calendar...</div>
            ) : (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <ReservationCalendar
                  reservations={allReservations}
                  isAdmin={true}
                />
              </div>
            )}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div>
            {loading ? (
              <div className="loading-state">Loading users...</div>
            ) : (
              <table className="sterling-table admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Admin</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((usr) => (
                    <tr key={usr.id}>
                      <td>{usr.id}</td>
                      <td className="font-bold">{usr.name}</td>
                      <td>{usr.email}</td>
                      <td>
                        {usr.is_admin ? (
                          <span className="badge-admin">ADMIN</span>
                        ) : (
                          <span className="badge-user">USER</span>
                        )}
                      </td>
                      <td className="text-muted">
                        {new Date(usr.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* RESERVATIONS TAB */}
        {activeTab === "reservations" && (
          <div>
            <div className="admin-filters">
              <div className="filter-group">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search by date or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="filter-input"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Rooms</option>
                {(Array.isArray(diningRooms) ? diningRooms : [])
                  .filter(Boolean)
                  .map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name ?? "(no name)"}
                    </option>
                  ))}
              </select>
            </div>

            {loading ? (
              <div className="loading-state">Loading reservations...</div>
            ) : (
              <table className="sterling-table admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Meal</th>
                    <th>Time</th>
                    <th>Room</th>
                    <th>Guests</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((res) => {
                    const room = diningRooms.find(
                      (r) => r.id === res.dining_room_id,
                    );
                    return (
                      <tr key={res.id}>
                        <td>{res.id}</td>
                        <td>{res.date}</td>
                        <td className="text-uppercase">{res.meal_type}</td>
                        <td>
                          {res.start_time} - {res.end_time}
                        </td>
                        <td className="font-bold">{room?.name || "N/A"}</td>
                        <td>{res.attendee_count}</td>
                        <td>
                          <span className={`status-badge status-${res.status}`}>
                            {res.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => navigate(`/reservations/${res.id}`)}
                            className="btn-icon-small"
                            title="View Details"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteReservation(res.id)}
                            className="btn-icon-small btn-delete"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* MEMBERS TAB */}
        {activeTab === "members" && (
          <div>
            <div className="admin-filters">
              <div className="filter-group">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="filter-input"
                />
              </div>
            </div>

            {loading ? (
              <div className="loading-state">Loading members...</div>
            ) : (
              <table className="sterling-table admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Relation</th>
                    <th>User ID</th>
                    <th>Dietary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id}>
                      <td>{member.id}</td>
                      <td className="font-bold">{member.name}</td>
                      <td className="text-uppercase">
                        {member.relation || "—"}
                      </td>
                      <td>{member.user_id}</td>
                      <td className="text-muted">
                        {member.dietary_restrictions || "None"}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="btn-icon-small btn-delete"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* RULES TAB */}
        {activeTab === "rules" && (
          <div>
            {loading ? (
              <div className="loading-state">Loading rules...</div>
            ) : (
              <table className="sterling-table admin-table">
                <thead>
                  <tr>
                    <th>Rule Name</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Threshold</th>
                    <th>Enabled</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allRules.map((rule) => (
                    <tr key={rule.id}>
                      <td className="font-bold">{rule.name}</td>
                      <td className="text-uppercase">{rule.fee_type}</td>
                      <td>
                        {editingRule === rule.id ? (
                          <input
                            type="number"
                            step="0.01"
                            defaultValue={rule.base_amount}
                            className="inline-edit-input"
                            id={`amount-${rule.id}`}
                          />
                        ) : (
                          `$${rule.base_amount.toFixed(2)}`
                        )}
                      </td>
                      <td>
                        {editingRule === rule.id ? (
                          <input
                            type="number"
                            defaultValue={rule.threshold || ""}
                            placeholder="None"
                            className="inline-edit-input"
                            id={`threshold-${rule.id}`}
                          />
                        ) : (
                          rule.threshold || "—"
                        )}
                      </td>
                      <td>
                        {editingRule === rule.id ? (
                          <input
                            type="checkbox"
                            defaultChecked={rule.enabled}
                            id={`enabled-${rule.id}`}
                          />
                        ) : (
                          <span
                            className={`status-badge ${
                              rule.enabled ? "status-active" : "status-inactive"
                            }`}
                          >
                            {rule.enabled ? "Active" : "Disabled"}
                          </span>
                        )}
                      </td>
                      <td>
                        {editingRule === rule.id ? (
                          <>
                            <button
                              onClick={() => {
                                const amount = parseFloat(
                                  document.getElementById(`amount-${rule.id}`)
                                    .value,
                                );
                                const thresholdVal = document.getElementById(
                                  `threshold-${rule.id}`,
                                ).value;
                                const threshold = thresholdVal
                                  ? parseInt(thresholdVal)
                                  : null;
                                const enabled = document.getElementById(
                                  `enabled-${rule.id}`,
                                ).checked;

                                handleUpdateRule(rule.id, {
                                  base_amount: amount,
                                  threshold,
                                  enabled,
                                });
                              }}
                              className="btn-icon-small btn-save"
                              title="Save"
                            >
                              <Save size={14} />
                            </button>
                            <button
                              onClick={() => setEditingRule(null)}
                              className="btn-icon-small"
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setEditingRule(rule.id)}
                            className="btn-icon-small"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ROOMS TAB */}
        {activeTab === "rooms" && (
          <div>
            {loading ? (
              <div className="loading-state">Loading rooms...</div>
            ) : (
              <table className="sterling-table admin-table">
                <thead>
                  <tr>
                    <th>Room Name</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {diningRooms.map((room) => (
                    <tr key={room.id}>
                      <td className="font-bold">{room.name}</td>
                      <td>
                        {editingRoom === room.id ? (
                          <input
                            type="number"
                            min="1"
                            defaultValue={room.capacity}
                            className="inline-edit-input"
                            id={`capacity-${room.id}`}
                          />
                        ) : (
                          `${room.capacity} seats`
                        )}
                      </td>
                      <td>
                        {editingRoom === room.id ? (
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              defaultChecked={room.is_active}
                              id={`active-${room.id}`}
                            />
                            <span>Active</span>
                          </label>
                        ) : (
                          <span
                            className={`status-badge ${
                              room.is_active
                                ? "status-active"
                                : "status-inactive"
                            }`}
                          >
                            {room.is_active ? "Active" : "Inactive"}
                          </span>
                        )}
                      </td>
                      <td>
                        {editingRoom === room.id ? (
                          <>
                            <button
                              onClick={() => {
                                const capacity = parseInt(
                                  document.getElementById(`capacity-${room.id}`)
                                    .value,
                                );
                                const is_active = document.getElementById(
                                  `active-${room.id}`,
                                ).checked;

                                handleUpdateRoom(room.id, {
                                  capacity,
                                  is_active,
                                });
                              }}
                              className="btn-icon-small btn-save"
                              title="Save"
                            >
                              <Save size={14} />
                            </button>
                            <button
                              onClick={() => setEditingRoom(null)}
                              className="btn-icon-small"
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setEditingRoom(room.id)}
                            className="btn-icon-small"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
