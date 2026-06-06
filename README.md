# Notice Board

A full-stack notice board application built with **Next.js**, **Prisma**, and **TiDB Cloud (MySQL)**, deployed on **Vercel**.

🔗 **Live demo:** _[Add your Vercel URL here after deployment]_

---

## Features

- **Full CRUD** — create, read, update, and delete notices
- **Urgent-first ordering** — sorted in the database via Prisma `orderBy`, not in the browser
- **Server-side validation** — all API routes validate input independently of the client
- **Responsive** — card grid adapts from 1 → 2 → 3 columns across screen sizes
- **Delete confirmation** — two-step confirmation before any notice is removed
- **Category & priority badges** — visual distinction for Exam / Event / General and Urgent notices
- **Image support** — optional image URL per notice (bonus feature)
- **Filter pills** — filter by All / Urgent / Exam / Event / General on the front-end

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 — Pages Router |
| Database ORM | Prisma |
| Database | TiDB Cloud (MySQL-compatible, free tier) |
| Hosting | Vercel (Hobby tier) |
| Styling | Tailwind CSS |

---

## How to run locally

### Prerequisites
- Node.js 18+
- A free [TiDB Cloud](https://tidbcloud.com) account (or any MySQL / Postgres database)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/notice-board.git
cd notice-board

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Open .env.local and paste your DATABASE_URL from TiDB Cloud

# 4. Push the Prisma schema to your database
npx prisma db push

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Getting your TiDB DATABASE_URL

1. Go to [tidbcloud.com](https://tidbcloud.com) → create a free Serverless cluster
2. Click **Connect** → choose **Prisma** as the connection method
3. Copy the `DATABASE_URL` string and paste it into `.env.local`

---

## Project structure

```
notice-board/
├── components/
│   ├── NoticeCard.jsx   # Single notice card with edit/delete + confirmation
│   └── NoticeForm.jsx   # Shared form for create and edit (modal)
├── lib/
│   └── prisma.js        # Singleton Prisma client (prevents hot-reload leaks)
├── pages/
│   ├── api/
│   │   └── notices/
│   │       ├── index.js # GET (list) + POST (create)
│   │       └── [id].js  # GET (single) + PUT (update) + DELETE
│   ├── _app.js
│   └── index.js         # Main notice board page (SSR via getServerSideProps)
├── prisma/
│   └── schema.prisma    # Data model: Notice with enums for Category & Priority
├── styles/
│   └── globals.css      # Tailwind directives
└── README.md
```

---

## API routes

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/notices` | Fetch all notices (Urgent first) |
| `POST` | `/api/notices` | Create a new notice |
| `GET` | `/api/notices/:id` | Fetch one notice |
| `PUT` | `/api/notices/:id` | Update a notice |
| `DELETE` | `/api/notices/:id` | Delete a notice |

All write routes validate on the server and return `422` with field-level errors on invalid input.

---

## What I would improve with more time

**Rich-text body editor** — The notice body is currently a plain textarea. With more time I would integrate a lightweight rich-text editor (e.g. Tiptap) so authors can format text with headings, bold, bullet lists, and hyperlinks. The stored value would be sanitised HTML, and the card would render it safely. This would make notices significantly more readable for end-users.

---

## AI usage

Claude (Anthropic) was used as a coding assistant throughout this project:

- **Scaffolding** — generated the initial file structure, Prisma schema, and API route boilerplate
- **Debugging** — helped trace a date serialisation issue between Prisma's `DateTime` type and Next.js `getServerSideProps` (plain JSON serialisation required)
- **Code review** — reviewed the Prisma `orderBy` clause to confirm that Urgent-first sorting happens at the database level, not in JavaScript
- **README** — drafted and refined this document

All generated code was read, understood, and verified by me before committing. I can explain every file and make changes to it during a code review.
