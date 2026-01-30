import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDiningRooms } from "../../hooks/useDiningRoom"; // ← Added

export function DiningRoomForm() {
  const { diningRooms, createDiningRoom, updateDiningRoom } = useDiningRooms(); // ← Fixed
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
  });
  const [inEditMode, setInEditMode] = useState(false);

  const selectedRoom = diningRooms?.find((r) => r.id === parseInt(id));

  useEffect(() => {
    if (id && selectedRoom) {
      setInEditMode(true);
      setFormData({
        name: selectedRoom.name || "",
        capacity: selectedRoom.capacity || "",
      });
    } else {
      setInEditMode(false);
    }
  }, [id, selectedRoom]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onCancel = () => {
    navigate(-1);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (inEditMode) {
        await updateDiningRoom(formData, id);
      } else {
        await createDiningRoom(formData);
      }
      navigate("/rooms");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Could not save dining room.");
    }
  };

  return (
    <div className="container">
      <h2>{inEditMode ? "Edit Dining Room" : "Add New Room"}</h2>
      <form onSubmit={onSubmit}>
        <label htmlFor="name">Room Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={onChange}
          placeholder="e.g. The Sterling Suite"
          required
        />

        <label htmlFor="capacity">Capacity (Seats)</label>
        <input
          type="number"
          id="capacity"
          name="capacity"
          value={formData.capacity}
          onChange={onChange}
          placeholder="e.g. 50"
          required
        />

        <div style={{ marginTop: "1rem" }}>
          <button type="submit">
            {inEditMode ? "Update Room" : "Create Room"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{ marginLeft: "10px" }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
