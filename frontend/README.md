# SkillBridge

A responsive, frontend-only Academia–Industry Collaboration Portal built with React, Vite, Tailwind CSS, React Router, Lucide icons and Recharts.

## Run locally

```bash
npm install
npm run dev
```

Create a production bundle with:

```bash
npm run build
```

## Authentication

Open `/signup`, choose Student, Faculty or Company, and create an account. Existing users sign in at `/login`; their role is loaded from the backend account.

During development, Vite proxies `/api` requests to `http://127.0.0.1:5000`. Start the MongoDB-backed API before registering or signing in.

Some dashboard content remains seeded for the interface, while authentication is no longer mocked or stored as a hardcoded local session.

## Main experiences

- Public landing page and opportunity directory
- Student profile, resume analysis, skill gaps, roadmap, opportunity matching and application tracking
- Faculty student management, skill analytics, workshops, collaboration and reports
- Company opportunity publishing, applicant management, talent search and hiring analytics
- Admin network statistics, directories, reports and announcements

Visual QA reference captures are available in [`qa-screenshots`](./qa-screenshots).
