import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMembers } from "../../hooks/useMembers"; // ← Fixed

export function MemberForm() {
  const { members, createMember, updateMember } = useMembers(); // ← Fixed
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    relation: "",
    dietary_restrictions: "",
  });
  const [inEditMode, setInEditMode] = useState(false);

  const selectedMember = members?.find((m) => m.id === parseInt(id));

  useEffect(() => {
    if (id && selectedMember) {
      setInEditMode(true);
      setFormData({
        name: selectedMember.name || "",
        relation: selectedMember.relation || "",
        dietary_restrictions: selectedMember.dietary_restrictions || "",
      });
    } else {
      setInEditMode(false);
    }
  }, [id, selectedMember]);

  const onClear = () => {
    setFormData({
      name: "",
      relation: "",
      dietary_restrictions: "",
    });
  };

  const onCancel = () => {
   navigate('/')
    onClear();
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      if (inEditMode) {
        const updatedMember = {
          ...formData,
          id: selectedMember.id,
        };
        await updateMember(updatedMember, id);
      } else {
        await createMember(formData);
      }

      // SUCCESS: Only runs if the awaits above don't fail
      onCancel();
    } catch (err) {
      // ERROR: Runs if updateMember or createMember throws an error
      console.error("Save failed, staying on page:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <label htmlFor="name"> Name </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={onChange}
        />

        <label htmlFor="relation"> Relation </label>
        <input
          type="text"
          id="relation"
          name="relation"
          value={formData.relation}
          onChange={onChange}
        />

        <label htmlFor="dietary_restrictions"> Dietary Restrictions </label>
        <input
          type="text"
          id="dietary_restrictions"
          name="dietary_restrictions"
          value={formData.dietary_restrictions}
          onChange={onChange}
        />

        <button type="submit">
          {inEditMode ? "Update Member" : "Create Member"}
        </button>
        <button type="button" onClick={onClear}>
          Clear
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </form>
    </>
  );
}
