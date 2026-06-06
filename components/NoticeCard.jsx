import { useState } from "react";

const CATEGORY_STYLES = {
  Exam:    { bg: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "rgba(59,130,246,0.3)" },
  Event:   { bg: "rgba(16,185,129,0.15)", color: "#34d399", border: "rgba(16,185,129,0.3)" },
  General: { bg: "rgba(148,163,184,0.15)", color: "#94a3b8", border: "rgba(148,163,184,0.3)" },
};

export default function NoticeCard({ notice, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formattedDate = new Date(notice.publishDate).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  const catStyle = CATEGORY_STYLES[notice.category] || CATEGORY_STYLES.General;
  const isUrgent = notice.priority === "Urgent";

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/notices/${notice.id}`, { method: "DELETE" });
      if (res.ok) {
        onDelete(notice.id);
      } else {
        alert("Failed to delete. Please try again.");
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
      className="relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: isUrgent ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(255,255,255,0.1)",
        boxShadow: isUrgent ? "0 0 20px rgba(239,68,68,0.1)" : "0 4px 24px rgba(0,0,0,0.2)",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* Urgent top accent bar */}
      {isUrgent && (
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #ef4444, #f97316)" }} />
      )}

      {/* Image */}
      {notice.imageUrl && (
        <img src={notice.imageUrl} alt={notice.title} className="w-full h-40 object-cover" />
      )}

      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {isUrgent && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
              style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              URGENT
            </span>
          )}
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium"
            style={{ background: catStyle.bg, color: catStyle.color, border: `1px solid ${catStyle.border}` }}>
            {notice.category}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-base font-semibold leading-snug line-clamp-2" style={{ color: "#f1f5f9" }}>
          {notice.title}
        </h2>

        {/* Body */}
        <p className="text-sm leading-relaxed line-clamp-3 flex-1" style={{ color: "#94a3b8" }}>
          {notice.body}
        </p>

        {/* Date */}
        <p className="text-xs font-medium pt-1" style={{ color: "#475569" }}>
          {formattedDate}
        </p>

        {/* Actions */}
        {!confirmDelete ? (
          <div className="flex gap-2 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <button
              onClick={() => onEdit(notice)}
              className="flex-1 py-2 text-xs font-semibold rounded-xl transition-all hover:scale-105"
              style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)" }}
            >
              Edit
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex-1 py-2 text-xs font-semibold rounded-xl transition-all hover:scale-105"
              style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}
            >
              Delete
            </button>
          </div>
        ) : (
          <div className="pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <p className="text-xs font-medium mb-2.5" style={{ color: "#f1f5f9" }}>
              Delete this notice?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#fff" }}
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="flex-1 py-2 text-xs font-semibold rounded-xl transition-all"
                style={{ background: "rgba(255,255,255,0.08)", color: "#94a3b8" }}
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
