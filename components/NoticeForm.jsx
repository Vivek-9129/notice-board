import { useState, useEffect } from "react";

const EMPTY_FORM = {
  title: "", body: "", category: "General",
  priority: "Normal", publishDate: "", imageUrl: "",
};

export default function NoticeForm({ notice, onSuccess, onCancel }) {
  const isEditing = Boolean(notice);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState("");

  useEffect(() => {
    if (notice) {
      const dateStr = notice.publishDate
        ? new Date(notice.publishDate).toISOString().split("T")[0] : "";
      setForm({ title: notice.title || "", body: notice.body || "",
        category: notice.category || "General", priority: notice.priority || "Normal",
        publishDate: dateStr, imageUrl: notice.imageUrl || "" });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
    setServerErr("");
  }, [notice]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required.";
    if (!form.body.trim()) e.body = "Body is required.";
    if (!form.publishDate) e.publishDate = "Publish date is required.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) { setErrors(clientErrors); return; }
    setLoading(true);
    setServerErr("");
    const url = isEditing ? `/api/notices/${notice.id}` : "/api/notices";
    const method = isEditing ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess(data, isEditing);
      } else if (res.status === 422 && data.errors) {
        setErrors(data.errors);
      } else {
        setServerErr(data.error || "Something went wrong.");
      }
    } catch {
      setServerErr("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = (hasError) => ({
    width: "100%", padding: "10px 14px", borderRadius: "12px",
    border: `1px solid ${hasError ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.12)"}`,
    background: hasError ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.05)",
    color: "#f1f5f9", fontSize: "14px", fontFamily: "'Poppins', sans-serif",
    outline: "none",
  });

  const labelStyle = {
    display: "block", fontSize: "12px", fontWeight: "500",
    color: "#94a3b8", marginBottom: "6px", fontFamily: "'Poppins', sans-serif",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-y-auto max-h-[90vh]"
        style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 25px 60px rgba(0,0,0,0.5)", fontFamily: "'Poppins', sans-serif" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isEditing ? "Edit Notice" : "New Notice"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
              {isEditing ? "Update the details below" : "Fill in the details below"}
            </p>
          </div>
          <button onClick={onCancel}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
            style={{ background: "rgba(255,255,255,0.08)", color: "#94a3b8" }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {serverErr && (
            <p className="text-sm rounded-xl px-4 py-3"
              style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
              {serverErr}
            </p>
          )}

          {/* Title */}
          <div>
            <label style={labelStyle}>Title <span style={{ color: "#ef4444" }}>*</span></label>
            <input name="title" value={form.title} onChange={handleChange}
              placeholder="Enter notice title" style={inputStyle(errors.title)} />
            {errors.title && <p className="text-xs mt-1" style={{ color: "#f87171" }}>{errors.title}</p>}
          </div>

          {/* Body */}
          <div>
            <label style={labelStyle}>Body <span style={{ color: "#ef4444" }}>*</span></label>
            <textarea name="body" value={form.body} onChange={handleChange}
              rows={4} placeholder="Enter notice details..."
              style={{ ...inputStyle(errors.body), resize: "none" }} />
            {errors.body && <p className="text-xs mt-1" style={{ color: "#f87171" }}>{errors.body}</p>}
          </div>

          {/* Category + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Category</label>
              <select name="category" value={form.category} onChange={handleChange}
                style={{ ...inputStyle(false), cursor: "pointer" }}>
                <option value="General" style={{ background: "#1e293b" }}>General</option>
                <option value="Exam" style={{ background: "#1e293b" }}>Exam</option>
                <option value="Event" style={{ background: "#1e293b" }}>Event</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange}
                style={{ ...inputStyle(false), cursor: "pointer" }}>
                <option value="Normal" style={{ background: "#1e293b" }}>Normal</option>
                <option value="Urgent" style={{ background: "#1e293b" }}>Urgent</option>
              </select>
            </div>
          </div>

          {/* Publish Date */}
          <div>
            <label style={labelStyle}>Publish Date <span style={{ color: "#ef4444" }}>*</span></label>
            <input type="date" name="publishDate" value={form.publishDate} onChange={handleChange}
              style={{ ...inputStyle(errors.publishDate), colorScheme: "dark" }} />
            {errors.publishDate && <p className="text-xs mt-1" style={{ color: "#f87171" }}>{errors.publishDate}</p>}
          </div>

          {/* Image URL */}
          <div>
            <label style={labelStyle}>
              Image URL <span style={{ color: "#475569", fontWeight: 400 }}>(optional)</span>
            </label>
            <input name="imageUrl" value={form.imageUrl} onChange={handleChange}
              placeholder="https://example.com/image.jpg" style={inputStyle(false)} />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 py-3 text-sm font-semibold text-white rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 15px rgba(99,102,241,0.3)" }}>
              {loading ? (isEditing ? "Saving…" : "Creating…") : (isEditing ? "Save Changes" : "Create Notice")}
            </button>
            <button type="button" onClick={onCancel}
              className="flex-1 py-3 text-sm font-semibold rounded-xl transition-all hover:scale-105"
              style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)" }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
