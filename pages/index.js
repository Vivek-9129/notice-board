// pages/index.js
// The main Notice Board page.
// Uses getServerSideProps to fetch notices on EVERY request (SSR) so the
// list is always fresh — no stale cache. The notices are already sorted
// Urgent-first by the API / Prisma query.

import { useState } from "react";
import Head from "next/head";
import NoticeCard from "../components/NoticeCard";
import NoticeForm from "../components/NoticeForm";
import { prisma } from "../lib/prisma";

export async function getServerSideProps() {
  // Fetch directly in getServerSideProps (server-side) for the initial load.
  // Urgent notices appear before Normal; within each group newest first.
  const notices = await prisma.notice.findMany({
    orderBy: [{ priority: "desc" }, { publishDate: "desc" }],
  });

  return {
    props: {
      // Prisma DateTime → plain JSON string so Next.js can serialise it
      initialNotices: JSON.parse(JSON.stringify(notices)),
    },
  };
}

export default function Home({ initialNotices }) {
  const [notices, setNotices]         = useState(initialNotices);
  const [showForm, setShowForm]       = useState(false);
  const [editingNotice, setEditingNotice] = useState(null); // null = create mode
  const [filter, setFilter]           = useState("All");

  // ---- Helpers --------------------------------------------------------

  function openCreate() {
    setEditingNotice(null);
    setShowForm(true);
  }

  function openEdit(notice) {
    setEditingNotice(notice);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingNotice(null);
  }

  // Called by NoticeForm after a successful save
  function handleFormSuccess(savedNotice, wasEditing) {
    if (wasEditing) {
      // Replace the old notice in state with the updated one
      setNotices((prev) =>
        prev.map((n) => (n.id === savedNotice.id ? savedNotice : n))
      );
    } else {
      // Prepend new notice; re-sort so Urgent stays on top
      setNotices((prev) =>
        [...prev, savedNotice].sort((a, b) => {
          if (a.priority === b.priority) {
            return new Date(b.publishDate) - new Date(a.publishDate);
          }
          return a.priority === "Urgent" ? -1 : 1;
        })
      );
    }
    closeForm();
  }

  // Called by NoticeCard after a successful delete
  function handleDelete(id) {
    setNotices((prev) => prev.filter((n) => n.id !== id));
  }

  // ---- Filter ---------------------------------------------------------

  const FILTERS = ["All", "Urgent", "Exam", "Event", "General"];

  const displayed = notices.filter((n) => {
    if (filter === "All")    return true;
    if (filter === "Urgent") return n.priority === "Urgent";
    return n.category === filter;
  });

  // ---- Render ---------------------------------------------------------

  return (
    <>
      <Head>
        <title>Notice Board</title>
        <meta name="description" content="Institutional Notice Board" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-slate-50">
        {/* ── Header ── */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                N
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-none">
                  Notice Board
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {notices.length} notice{notices.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              <span className="text-lg leading-none">+</span>
              Add Notice
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {/* ── Filter pills ── */}
          <div className="flex gap-2 flex-wrap mb-6">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === f
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* ── Grid ── */}
          {displayed.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-slate-500 text-sm">
                {filter === "All"
                  ? "No notices yet. Click "Add Notice" to create one."
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

      {/* ── Modal form (shown on create or edit) ── */}
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
