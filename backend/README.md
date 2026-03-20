# KAGC Registration Backend

Production-oriented backend for church registration workflow, built with Express and SQLite.

## Features

- Public registration submission for individual and family workflows
- Staging approval pipeline before records enter main members table
- Duplicate detection by phone and fuzzy name matching
- Continuous member number generation (`KAGC-00001`, ...)
- Admin-only authentication using session cookies
- Role guards (`admin`, `data_cleaner`)
- CSRF protection on authenticated admin mutating endpoints
- Rate limiting on public submission and admin login
- Audit logging for admin review actions
- CSV export, search, family grouping, analytics endpoints
- Draft persistence endpoints for multi-step form auto-save

## Quick Start

1. Install dependencies:
   - `npm install`
2. Copy env file:
   - `cp .env.example .env`
3. Seed default admin user:
   - `npm run db:seed-admin`
4. Start server:
   - `npm run dev`

## Base URL

- `http://localhost:4000`

## API Summary

### Public

- `GET /api/public/locations/search?q=kam`
- `POST /api/public/registrations/individual`
- `POST /api/public/registrations/family`
- `GET /api/public/drafts/:sessionId`
- `PUT /api/public/drafts/:sessionId`
- `DELETE /api/public/drafts/:sessionId`

### Admin Auth

- `POST /api/admin/auth/login`
- `GET /api/admin/auth/me`
- `GET /api/admin/auth/csrf-token`
- `POST /api/admin/auth/logout`

### Admin Review

- `GET /api/admin/staging/batches`
- `GET /api/admin/staging/batches/:batchId`
- `GET /api/admin/staging/members/:memberId/duplicates`
- `POST /api/admin/staging/members/:memberId/approve`
- `POST /api/admin/staging/members/:memberId/reject`
- `POST /api/admin/staging/members/:memberId/merge`

### Admin Members / Analytics

- `GET /api/admin/members`
- `GET /api/admin/members/export.csv`
- `GET /api/admin/members/families/:familyId/members`
- `GET /api/admin/analytics/summary`
- `GET /api/admin/analytics/by-location`
- `GET /api/admin/analytics/by-age-bracket`

## Notes

- Use `x-csrf-token` header with admin state-changing requests after fetching token from `GET /api/admin/auth/csrf-token`.
- SQLite is configured in WAL mode for better concurrency and durability.
