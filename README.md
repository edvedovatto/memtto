<div align="center">

# Memtto

**Your personal knowledge archive — fast, minimal, beautiful.**

Store and search ideas, notes, snippets and experiences in a dark-mode interface built for speed.

[Getting Started](#getting-started) · [Features](#features) · [Tech Stack](#tech-stack)

</div>

---

## Features

- **Search-first** — find anything instantly with full-text search and tag filtering
- **Entry types** — notes, ideas, snippets, experiences
- **Ratings & favorites** — highlight what matters most
- **Image uploads** — attach images to any entry
- **Context filtering** — organize entries by context
- **Archive** — hide entries without deleting them
- **Dark mode** — easy on the eyes, always

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS |
| Icons | Lucide React |
| Backend & Auth | Supabase |
| Deploy | Vercel |

## Getting Started

**1. Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/memtto.git
cd memtto
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**4. Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

Run the SQL files in order on the Supabase SQL Editor:

1. `supabase/schema.sql` — base schema
2. `supabase/migration_phase3.sql` — additional fields (rating, favorites, archive)
3. `supabase/migration_phase3_audit.sql` — constraints, indexes, policies

## License

MIT
