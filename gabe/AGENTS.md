# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

PropDev is a **prototype** web application for an Australian property development company. It helps development managers track projects through all phases: site identification, feasibility, financing, pre-sales, land acquisition, architecture, planning permit, construction, marketing, and selling completed dwellings.

**This is a frontend-only prototype with no backend.** All data is mocked. The app simulates email integration where inbound/outbound emails are scanned, analysed, and stored, with attachments processed automatically.

## Commands

- `npm start` — dev server on localhost:3000
- `npm test` — run tests in watch mode (Jest + React Testing Library)
- `npm test -- --watchAll=false` — run all tests once (CI mode)
- `npm test -- --testPathPattern=<pattern>` — run a single test file
- `npm run build` — production build to `build/`

## Tech Stack

- React 19 with TypeScript (Create React App 5)
- Tailwind CSS v3 for styling (CRA 5 has built-in Tailwind support — no CRACO needed)
- React Router v6 for client-side routing
- Jest + React Testing Library for tests
- ESLint (react-app preset) configured in package.json

## Architecture

- `src/data/` — mock data and TypeScript types (no backend API calls)
- `src/components/` — React components
- `src/data/projects.ts` — project types (`Project`, `ProjectPhase`, `ProjectType`, `PhaseProgress`) and mock data for 5 projects
- `src/data/phase-details.ts` — per-project per-phase tasks (`PhaseTask`) and activities (`Activity`) with email/phone mock data
- Routes: `/` (Dashboard), `/project/:projectId` (ProjectDetail)

## Domain Context

- **Australian property development** — currency is AUD, regulations/permits are Australian (e.g., planning permits, VCAT, council approvals)
- Multiple phases can run **in parallel** — each project tracks per-phase completion percentages via `PhaseProgress` (a partial map of phase → 0–100%)
- Users are property development managers overseeing multiple concurrent projects
