// components/NoticeForm.jsx
// A single form used for BOTH creating and editing a notice.
// When `notice` prop is provided, we're in "edit" mode and the form
// pre-fills with the existing values.

import { useState, useEffect } from "react";

const EMPTY_FORM = {
  title:       "",
  body:        "",
  category:    "General",
  priority:    "Normal",
  publishDate: "",
  imageUrl:    "",
};

export default function NoticeForm({ notice, onSuccess, onCancel }) {
  const isEditing = Boolean(notice);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState("");

  // When the form opens for editing, populate with existing values
  useEffect(() => {
    if (notice) {
      // publishDate comes as ISO string from DB; we need YYYY-MM-DD for <input type="date">
      const dateStr = notice.publishDate
        ? new Date(notice.publishDate).toISOString().split("T")[0]
        : "";
      setForm({
        title:       notice.title       || "",
        body:        notice.body        || "",
        category:    notice.category    || "General",
        priority:    notice.priority    || "Normal",
        publishDate: dateStr,
        imageUrl:    notice.imageUrl    || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
    setServerErr("");
  }, [notice]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error as the user types
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  // Client-side validation mirrors the server — catches obvious mistakes fast
  function validate() {
    const e = {};
    if (!form.title.trim())       e.title       = "Title is required.";
    if (!form.body.trim())        e.body        = "Body is required.";
    if (!form.publishDate)        e.publishDate = "Publish date is required.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setLoading(true);
    setServerErr("");

    // Decide method + URL depending on create vs edit mode
    const url    = isEditing ? `/api/notices/${notice.id}` : "/api/notices";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        onSuccess(data, isEditing); // pass the saved notice back to parent
      } else if (res.status === 422 && data.errors) {
        // Server returned validation errors — show them inline
        setErrors(data.errors);
      } else {
        setServerErr(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setServerErr("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEditing ? "Edit Notice" : "Add New Notice"}
          </h2>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {serverErr && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {serverErr}
            </p>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter notice title"
              className={`w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition ${
                errors.title ? "border-red-400 bg-red-50" : "border-slate-300"
              }`}
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Body <span className="text-red-500">*</span>
            </label>
            <textarea
              name="body"
              value={form.body}
              onChange={handleChange}
              rows={4}
              placeholder="Enter notice details…"
              className={`w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition resize-none ${
                errors.body ? "border-red-400 bg-red-50" : "border-slate-300"
              }`}
            />
            {errors.body && (
              <p className="text-xs text-red-500 mt-1">{errors.body}</p>
            )}
          </div>

          {/* Category + Priority (side by side) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
              >
                <option value="General">General</option>
                <option value="Exam">Exam</option>
                <option value="Event">Event</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
              >
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Publish Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Publish Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="publishDate"
              value={form.publishDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition ${
                errors.publishDate
                  ? "border-red-400 bg-red-50"
                  : "border-slate-300"
              }`}
            />
            {errors.publishDate && (
              <p className="text-xs text-red-500 mt-1">{errors.publishDate}</p>
            )}
          </div>

          {/* Image URL (bonus) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Image URL{" "}
              <span className="text-slate-400 font-normal text-xs">(optional)</span>
            </label>
            <input
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition"
            />
          </div>

          {/* Submit / Cancel */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors"
            >
              {loading
                ? isEditing
                  ? "Saving…"
                  : "Creating…"
                : isEditing
                ? "Save Changes"
                : "Create Notice"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
