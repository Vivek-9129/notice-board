// pages/api/notices/[id].js
// Handles:  GET    /api/notices/:id  → fetch one notice
//           PUT    /api/notices/:id  → update a notice
//           DELETE /api/notices/:id  → delete a notice

import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  // Parse the id from the URL. Next.js gives it as a string; convert to int.
  const id = parseInt(req.query.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid notice ID." });
  }

  // ------------------------------------------------------------------
  // GET a single notice (used to pre-fill the edit form)
  // ------------------------------------------------------------------
  if (req.method === "GET") {
    try {
      const notice = await prisma.notice.findUnique({ where: { id } });
      if (!notice) return res.status(404).json({ error: "Notice not found." });
      return res.status(200).json(notice);
    } catch (error) {
      console.error("GET /api/notices/[id] error:", error);
      return res.status(500).json({ error: "Failed to fetch notice." });
    }
  }

  // ------------------------------------------------------------------
  // PUT — update an existing notice (same validation as POST)
  // ------------------------------------------------------------------
  if (req.method === "PUT") {
    const { title, body, category, priority, publishDate, imageUrl } = req.body;

    // --- Server-side validation ---
    const errors = {};
    if (!title || title.trim() === "") errors.title = "Title is required.";
    if (!body  || body.trim()  === "") errors.body  = "Body is required.";

    const validCategories = ["Exam", "Event", "General"];
    if (!validCategories.includes(category))
      errors.category = "Category must be Exam, Event, or General.";

    const validPriorities = ["Normal", "Urgent"];
    if (!validPriorities.includes(priority))
      errors.priority = "Priority must be Normal or Urgent.";

    const parsedDate = new Date(publishDate);
    if (!publishDate || isNaN(parsedDate.getTime()))
      errors.publishDate = "A valid publish date is required.";

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ errors });
    }

    try {
      const updated = await prisma.notice.update({
        where: { id },
        data: {
          title:       title.trim(),
          body:        body.trim(),
          category,
          priority,
          publishDate: parsedDate,
          imageUrl:    imageUrl || null,
        },
      });
      return res.status(200).json(updated);
    } catch (error) {
      // Prisma throws P2025 when the record to update doesn't exist
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Notice not found." });
      }
      console.error("PUT /api/notices/[id] error:", error);
      return res.status(500).json({ error: "Failed to update notice." });
    }
  }

  // ------------------------------------------------------------------
  // DELETE — remove a notice permanently
  // ------------------------------------------------------------------
  if (req.method === "DELETE") {
    try {
      await prisma.notice.delete({ where: { id } });
      // 204 No Content = success with no body to return
      return res.status(204).end();
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Notice not found." });
      }
      console.error("DELETE /api/notices/[id] error:", error);
      return res.status(500).json({ error: "Failed to delete notice." });
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
