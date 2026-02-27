# AGENTS.md

## Project Overview
This is a High School Class Management System designed to track student and teacher attendance, notes, and prayer requests. It is a single-page application (SPA) built with React and Vite, using Supabase as the backend.

## Tech Stack
- **Frontend:** React 19 (Functional Components, Hooks)
- **Build Tool:** Vite 7
- **Database/API:** Supabase (@supabase/supabase-js)
- **Linting:** ESLint 9
- **Styling:** Plain CSS (per-component stylesheets)

## Development Workflow

### Commands
- **Start Dev Server:** `npm run dev` (runs on http://localhost:5173 by default)
- **Build Project:** `npm run build`
- **Lint Code:** `npm run lint`
- **Preview Build:** `npm run preview`
- **Tests:** No test framework currently configured. If adding tests, use **Vitest**.
  - **Single Test:** `npx vitest src/path/to/test.js`

### Environment Requirements
- **Node.js:** v20.19.0+ or v22.12.0+
- **npm:** 10.8.2+
- **Supabase Config:** Create a `.env` file in the root with:
  ```env
  VITE_SUPABASE_URL=your_supabase_url
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
  ```

## Code Style Guidelines

### 1. Naming Conventions
- **Components:** `PascalCase` (e.g., `src/components/AttendanceManagement.jsx`)
- **Styles:** `PascalCase.css` (e.g., `src/styles/AttendanceManagement.css`)
- **Utilities:** `camelCase` (e.g., `src/utils/dataManager.js`)
- **Functions/Variables:** `camelCase`
- **Database Tables:** `snake_case` (e.g., `weekly_records`, `teacher_weekly_records`)

### 2. Imports & Exports
- Use ESM `import`/`export` syntax.
- Import React hooks directly: `import { useState, useEffect } from 'react'`.
- Components should be default exports.
- Utilities should use named exports.

### 3. Component Structure
- Use functional components and hooks exclusively.
- Prefer prop drilling for simple state sharing from `App.jsx` to sub-components.
- Keep UI logic (JSX) and data fetching logic (utils) separated.

### 4. Data Management
- Centralize all Supabase interactions in `src/utils/dataManager.js`.
- Use `upsert` with `onConflict` for saving records to handle both creation and updates.
- Data transformations (e.g., `transformSchoolData`) should be kept in the utility layer.

### 5. Formatting & Linting
- **Indentation:** 2 spaces.
- **Quotes:** Single quotes preferred.
- **Semicolons:** Follow the existing file's style. `App.jsx` and `supabaseClient.js` omit them, while `dataManager.js` uses them.
- **Unused Variables:** ESLint is configured to error on unused variables, except those starting with `_` or `A-Z` (for React components).

### 6. Error Handling
- Wrap all Supabase calls and async operations in `try-catch` blocks.
- Provide user-friendly console logs: `console.error('Contextual error message:', error)`.
- Return boolean success indicators or specific data objects from utility functions.

## Database Schema Highlights
- **Grades/Classes/Students:** Hierarchical relationship.
- **Weekly Records:** Linked via `student_id` and a formatted `week_id` (e.g., `2026년 02월 2주차`).
- **Prayer Requests:** Stored as newline-separated text.
- **RLS:** Enabled on all tables with public access policies (read/write/update/delete).

## Copilot & Environment Rules
*Extracted from .github/copilot-instructions.md:*
- Node.js v20.19.0+ / v22.12.0+ required.
- npm 10.8.2+ required.
- Always use `npm run dev` for local development.

## AI Agent Instructions
- When adding new components, follow the `src/components/` and `src/styles/` separation.
- Update `schema.sql` if modifying the database structure.
- Ensure all new data-fetching functions are added to `src/utils/dataManager.js` and properly exported.
