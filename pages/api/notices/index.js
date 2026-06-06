// pages/api/notices/index.js
// Handles:  GET  /api/notices  → list all notices (Urgent first, then by date)
//           POST /api/notices  → create a new notice

import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    // -------------------------------------------------------------------
    // READ: fetch all notices sorted in the DATABASE (not in the browser).
    // Prisma orderBy accepts an array; first sort by priority so Urgent
    // comes before Normal (U > N alphabetically = descending), then by
    // publishDate newest-first within each priority bucket.
    // -------------------------------------------------------------------
    try {
      const notices = await prisma.notice.findMany({
        orderBy: [
          { priority: "desc" },      // Urgent before Normal
          { publishDate: "desc" },   // newest first within each group
        ],
      });
      return res.status(200).json(notices);
    } catch (error) {
      console.error("GET /api/notices error:", error);
      return res.status(500).json({ error: "Failed to fetch notices." });
    }
  }

  if (req.method === "POST") {
    // -------------------------------------------------------------------
    // CREATE: validate on the server, then insert into the DB.
    // Server-side validation is REQUIRED by the assignment — never trust
    // the browser alone.
    // -------------------------------------------------------------------
    const { title, body, category, priority, publishDate, imageUrl } = req.body;

    // --- Validation ---
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
      const notice = await prisma.notice.create({
        data: {
          title:       title.trim(),
          body:        body.trim(),
          category,
          priority,
          publishDate: parsedDate,
          imageUrl:    imageUrl || null,
        },
      });
      return res.status(201).json(notice);
    } catch (error) {
      console.error("POST /api/notices error:", error);
      return res.status(500).json({ error: "Failed to create notice." });
    }
  }

  // Any other HTTP method is not allowed
  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
