// components/NoticeCard.jsx
// A single card on the notice board listing page.
// Receives the notice data and callbacks for edit/delete from the parent.

import { useState } from "react";

// Map each category to a colour scheme (Tailwind classes)
const CATEGORY_STYLES = {
  Exam:    "bg-blue-100 text-blue-800",
  Event:   "bg-emerald-100 text-emerald-800",
  General: "bg-slate-100 text-slate-700",
};

export default function NoticeCard({ notice, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formattedDate = new Date(notice.publishDate).toLocaleDateString("en-IN", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  });

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/notices/${notice.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onDelete(notice.id); // tell the parent to remove it from state
      } else {
        alert("Failed to delete notice. Please try again.");
        setDeleting(false);
        setConfirmDelete(false);
      }
    } catch {
      alert("Network error. Please try again.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div
      className={`relative flex flex-col bg-white rounded-2xl shadow-sm border overflow-hidden transition-shadow hover:shadow-md ${
        notice.priority === "Urgent"
          ? "border-red-300 ring-1 ring-red-200"
          : "border-slate-200"
      }`}
    >
      {/* Optional image */}
      {notice.imageUrl && (
        <img
          src={notice.imageUrl}
          alt={notice.title}
          className="w-full h-40 object-cover"
        />
      )}

      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Top row: badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {notice.priority === "Urgent" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Urgent
            </span>
          )}
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              CATEGORY_STYLES[notice.category]
            }`}
          >
            {notice.category}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-base font-semibold text-slate-900 leading-snug line-clamp-2">
          {notice.title}
        </h2>

        {/* Body */}
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 flex-1">
          {notice.body}
        </p>

        {/* Date */}
        <p className="text-xs text-slate-400 font-medium mt-auto pt-1">
          📅 {formattedDate}
        </p>

        {/* Actions */}
        {!confirmDelete ? (
          <div className="flex gap-2 pt-2 border-t border-slate-100 mt-1">
            <button
              onClick={() => onEdit(notice)}
              className="flex-1 py-1.5 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex-1 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              🗑️ Delete
            </button>
          </div>
        ) : (
          // Confirmation step — required by the assignment
          <div className="pt-2 border-t border-slate-100 mt-1">
            <p className="text-sm text-slate-700 font-medium mb-2">
              Are you sure you want to delete this notice?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-1.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 rounded-lg transition-colors"
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="flex-1 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
