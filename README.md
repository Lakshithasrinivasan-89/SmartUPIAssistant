**Overview**

- **Project:** Small Business Smart Assistant (UPI++) — a frontend-only Next.js app that simulates a small-business dashboard and tools for handling UPI transactions, inventory, expenses, and a simple assistant.
- **Mode:** Frontend-only — the app uses an in-browser mock database and API layer, so no backend server or database is required to run locally.

**Quick Start**

- **Install deps:**

```bash
npm install
```

- **Run dev server:**

```bash
npm run dev
```

- Open [http://localhost:3000](http://localhost:3000) in your browser.

**Structure**

- **`src/app`**: Next.js app routes and pages (app router).
- **`src/components`**: Reusable UI components (buttons, inputs, mock providers).
- **`src/lib`**: App logic and utilities.
	- **`src/lib/mockDb.ts`**: In-browser mock database (previously `prisma.ts`).
	- **`src/lib/mockApi.ts`**: Client-side mock API that intercepts `fetch()` calls to `/api/*`.
	- **`src/lib/*`**: Analytics, reports, inventory helpers that use the mock DB.
- **`package.json`**, **`tsconfig.json`**: Project config and scripts.

**Mock API (frontend-only)**

- The app intercepts `fetch()` calls to paths under `/api/` and routes them to the mock handlers implemented in `src/lib/mockApi.ts`.
- Initialization is performed via the `setupMockApi()` helper (used by `src/components/MockApiProvider.tsx`).
- This allows full app behavior (CRUD, parsing, reports) without any server or external database.

**Development notes**

- Use `npm run dev` to start the Next dev server.
- The mock DB persists in `localStorage` for repeatable demos in the browser.
- If you want to re-seed the demo data, clear the `sbsa_db_*` keys in browser storage or remove the `sbsa_db_seeded` flag.

**Where to look**

- App entry: [src/app](src/app)
- Mock API: [src/lib/mockApi.ts](src/lib/mockApi.ts)
- Mock DB: [src/lib/mockDb.ts](src/lib/mockDb.ts)
- Key components: [src/components](src/components)

If you'd like, I can expand this README with screenshots, API examples, or contribution guidelines.
