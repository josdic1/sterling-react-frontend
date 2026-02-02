// src/components/members/MemberForm.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "../../hooks/useData";
import { X, AlertCircle } from "lucide-react";

export function MemberForm() {
  const { members, createMember, updateMember } = useData();
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    relation: "",
    dietary_restrictions: "",
  });
  const [inEditMode, setInEditMode] = useState(false);
  const [formErrors, setFormErrors] = useState({}); // FIXED: Added missing state

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

  const validateForm = () => {
    const errors = {};

    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (formData.name.length > 100) {
      errors.name = "Name too long (max 100 characters)";
    }

    // Prevent XSS - simple check for script tags
    if (/<script|javascript:/i.test(formData.name)) {
      errors.name = "Invalid characters in name";
    }

    return errors;
  };

  const onClear = () => {
    setFormData({
      name: "",
      relation: "",
      dietary_restrictions: "",
    });
    setFormErrors({});
  };

  const onCancel = () => {
    navigate("/");
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field as user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // 1. Validate
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // 2. Submit
    try {
      if (inEditMode) {
        await updateMember(selectedMember.id, formData);
      } else {
        await createMember(formData);
      }
      navigate("/");
    } catch (err) {
      console.error("Save failed:", err);
      // In a real app, you might set a global error state here
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="container">
      <header className="page-header">
        <h1>
          {inEditMode ? `Edit ${selectedMember?.name}` : "Add Family Member"}
        </h1>
        <button onClick={onCancel} className="btn-close" title="Close">
          <X size={20} />
        </button>
      </header>

      <form onSubmit={onSubmit} className="banking-form">
        <div className="input-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="e.g. Rick"
            className={formErrors.name ? "input-error" : ""}
            required
          />
          {formErrors.name && (
            <div className="error-text">
              <AlertCircle size={14} />
              <span>{formErrors.name}</span>
            </div>
          )}
        </div>

        <div className="input-group">
          <label htmlFor="relation">Relation</label>
          <input
            type="text"
            id="relation"
            name="relation"
            value={formData.relation}
            onChange={onChange}
            placeholder="e.g. Son"
          />
        </div>

        <div className="input-group">
          <label htmlFor="dietary_restrictions">Dietary Restrictions</label>
          <input
            type="text"
            id="dietary_restrictions"
            name="dietary_restrictions"
            value={formData.dietary_restrictions}
            onChange={onChange}
            placeholder="e.g. Gluten Free"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {inEditMode ? "Update Member" : "Create Member"}
          </button>
          {!inEditMode && (
            <button type="button" onClick={onClear} className="btn-secondary">
              Clear
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
