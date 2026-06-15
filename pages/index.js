import { useState } from "react";
import Head from "next/head";
import NoticeCard from "../components/NoticeCard";
import NoticeForm from "../components/NoticeForm";
import { prisma } from "../lib/prisma";

export async function getServerSideProps() {
  const notices = await prisma.notice.findMany({
    orderBy: [{ priority: "desc" }, { publishDate: "desc" }],
  });
  return {
    props: { initialNotices: JSON.parse(JSON.stringify(notices)) },
  };
}

const FILTERS = ["All", "Urgent", "Exam", "Event", "General"];

const FILTER_ICONS = {
  All: "◈",
  Urgent: "⚡",
  Exam: "📝",
  Event: "📅",
  General: "📌",
};

export default function Home({ initialNotices }) {
  const [notices, setNotices] = useState(initialNotices);
  const [showForm, setShowForm] = useState(false);
  const [search,setSearch] =useState("");
  const [editingNotice, setEditingNotice] = useState(null);
  const [filter, setFilter] = useState("All");

  function openCreate() { setEditingNotice(null); setShowForm(true); }
  function openEdit(notice) { setEditingNotice(notice); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditingNotice(null); }

  function handleFormSuccess(savedNotice, wasEditing) {
    if (wasEditing) {
      setNotices((prev) => prev.map((n) => (n.id === savedNotice.id ? savedNotice : n)));
    } else {
      setNotices((prev) =>
        [...prev, savedNotice].sort((a, b) => {
          if (a.priority === b.priority) return new Date(b.publishDate) - new Date(a.publishDate);
          return a.priority === "Urgent" ? -1 : 1;
        })
      );
    }
    closeForm();
  }


  function handleDelete(id) {
    setNotices((prev) => prev.filter((n) => n.id !== id));
  }

// search filter 

  const displayed = notices.filter((n) => {
  const matchesSearch = n.title
    .toLowerCase()
    .includes(search.toLowerCase());

  const matchesFilter =
    filter === "All"
      ? true
      : filter === "Urgent"
      ? n.priority === "Urgent"
      : n.category === filter;

  return matchesSearch && matchesFilter;
});

 

  const urgentCount = notices.filter((n) => n.priority === "Urgent").length;

  return (
    <>
      <Head>
        <title>Notice Board</title>
        <meta name="description" content="Institutional Notice Board" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f2744 100%)", fontFamily: "'Poppins', sans-serif" }}>

        {/* ── Header ── */}
        <header className="sticky top-0 z-40 border-b border-white/10" style={{ background: "rgba(15,23,42,0.85)", backdropFilter: "blur(16px)" }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
            {/* Logo + title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                N
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white leading-none tracking-tight">
                  Notice Board
                </h1>
                <p className="text-xs mt-0.5 font-light" style={{ color: "#94a3b8" }}>
                  {notices.length} notice{notices.length !== 1 ? "s" : ""}
                  {urgentCount > 0 && (
                    <span className="ml-2 text-red-400 font-medium">
                      · {urgentCount} urgent
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Add button */}
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              <span className="text-base leading-none">+</span>
              Add Notice
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

          {/* ── Stats strip ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: "Total", value: notices.length, color: "#6366f1" },
              { label: "Urgent", value: notices.filter(n => n.priority === "Urgent").length, color: "#ef4444" },
              { label: "Exams", value: notices.filter(n => n.category === "Exam").length, color: "#3b82f6" },
              { label: "Events", value: notices.filter(n => n.category === "Event").length, color: "#10b981" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl p-4 border border-white/10"
                style={{ background: "rgba(255,255,255,0.05)" }}>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: stat.color }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* ── Filter pills ── */}
          <div className="flex gap-2 flex-wrap mb-6">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-all border"
                style={
                  filter === f
                    ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", borderColor: "transparent", boxShadow: "0 4px 15px rgba(99,102,241,0.4)" }
                    : { background: "rgba(255,255,255,0.05)", color: "#94a3b8", borderColor: "rgba(255,255,255,0.1)" }
                }
              >
                {FILTER_ICONS[f]} {f}
              </button>
            ))}
          </div>
          {/*SEARCH BAR  */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search "
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(10px)",
              }}
            />
          </div>
          {/* ── Notice grid ── */}
          {displayed.length === 0 ? (
            <div className="text-center py-32">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl"
                style={{ background: "rgba(255,255,255,0.05)" }}>
                📋
              </div>
              <p className="text-white font-medium mb-1">No notices here</p>
              <p className="text-sm" style={{ color: "#64748b" }}>
                {filter === "All"
                  ? 'Click "Add Notice" to create the first one.'
                  : `No ${filter} notices found.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayed.map((notice) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {showForm && (
        <NoticeForm
          notice={editingNotice}
          onSuccess={handleFormSuccess}
          onCancel={closeForm}
        />
      )}
    </>
  );
}
