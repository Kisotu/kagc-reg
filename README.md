<!-- HEADER -->
<div align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=for-the-badge" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white&style=for-the-badge" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white&style=for-the-badge" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white&style=for-the-badge" alt="Express" />
  <img src="https://img.shields.io/badge/SQLite-better--sqlite3-003B57?logo=sqlite&logoColor=white&style=for-the-badge" alt="SQLite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwindcss&logoColor=white&style=for-the-badge" alt="Tailwind CSS" />
</div>

<br>

<div align="center">
  <h1>🏛️ KAGC Member Registration System</h1>
  <p><strong>A full-stack church member registration platform with approval workflows, duplicate detection, and data integrity</strong></p>
  
  <p>
    <a href="#features">✨ Features</a> •
    <a href="#tech-stack">🛠️ Tech Stack</a> •
    <a href="#getting-started">🚀 Getting Started</a> •
    <a href="#api-reference">📚 API</a> •
    <a href="#security">🔒 Security</a>
  </p>
</div>

---

<!-- PROJECT STATS -->
<div align="center">
  <table>
    <tr>
      <td>
        <div align="center">
          <code>📊 20+ API</code> endpoints
        </div>
      </td>
      <td>
        <div align="center">
          <code>🔐 Role-based</code> auth
        </div>
      </td>
      <td>
        <div align="center">
          <code>🧠 Fuzzy</code> matching
        </div>
      </td>
    </tr>
    <tr>
      <td>
        <div align="center">
          <code>⚡ Sub-100ms</code> latency
        </div>
      </td>
      <td>
        <div align="center">
          <code>📱 Responsive</code> design
        </div>
      </td>
      <td>
        <div align="center">
          <code>📈 Analytics</code> dashboard
        </div>
      </td>
    </tr>
  </table>
</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 👤 Public Portal
- 📝 Multi-step registration wizard (Individual & Family)
- 🏠 Family member grouping during registration
- 🔍 Location search with autocomplete
- 💾 Auto-save drafts via localStorage + server sync
- 📱 Mobile-first responsive design

</td>
<td width="50%">

### 🔐 Admin Dashboard
- ✅ Staging approval workflow for data integrity
- 🔍 Fuzzy duplicate detection (Levenshtein distance)
- 📊 Analytics & KPI visualizations
- 📤 CSV export with filters
- 🛡️ Role-based access control (Admin / Data Cleaner)

</td>
</tr>
</table>

### 🧠 Smart Duplicate Detection
| Detection Method | Description |
|-----------------|-------------|
| **📱 Phone Match** | Exact match on normalized phone numbers |
| **📝 Name Fuzziness** | Levenshtein distance for similar names |
| **⚠️ Batch Flags** | Automatic duplicate flagging during registration |
| **🔀 Manual Merge** | Interactive UI for resolving conflicts |

---

## 🛠️ Tech Stack

### Frontend (`ui/`)
| Technology | Purpose | Version |
|------------|---------|---------|
| <img width="20" src="https://cdn.simpleicons.org/react/61DAFB"/> React | UI Framework | 19 |
| <img width="20" src="https://cdn.simpleicons.org/tailwindcss/06B6D4"/> Tailwind CSS v4 | Styling | 4.2 |
| <img width="20" src="https://cdn.simpleicons.org/vite/646CFF"/> Vite | Build Tool | 8 |
| <img width="20" src="https://cdn.simpleicons.org/zod/3E67B8"/> Zod | Validation | 3.24 |

### Backend (`backend/`)
| Technology | Purpose | Version |
|------------|---------|---------|
| <img width="20" src="https://cdn.simpleicons.org/nodedotjs/339933"/> Node.js | Runtime | 20 |
| <img width="20" src="https://cdn.simpleicons.org/express/000000"/> Express | Framework | 4 |
| <img width="20" src="https://cdn.simpleicons.org/sqlite/003B57"/> better-sqlite3 | Database | 11 |
| <img width="20" src="https://cdn.simpleicons.org/zod/3E67B8"/> Zod | Validation | 3 |
| <img width="20" src="https://cdn.simpleicons.org/vercel/000000"/> EJS | Email Templates | 3 |

### Infrastructure
- **Database:** SQLite in WAL mode (production-ready)
- **Auth:** Session-based with persistent store
- **Security:** Helmet, CORS, CSRF, Rate Limiting
- **Deployment:** Vercel (Frontend) + VPS (Backend)

---

## 🏗️ Architecture

```mermaid
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Vercel)                         │
│  ┌─────────────────┐          ┌────────────────────────────┐ │
│  │  React 19       │          │  Tailwind CSS + Custom     │ │
│  │  Registration   │◄────────►│  Components                │ │
│  │  Wizard         │          │                            │ │
│  └─────────────────┘          └────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / CORS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API (VPS/DuckDNS)                        │
│                              Express                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ Router   │  │ Zod      │  │ Services │  │ Repositories   │  │
│  │ (Routes) │──►│ Validate │──►│ (Auth) │──►│ (SQLite)       │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────┘  │
│                                                   │              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │              │
│  │ Sessions │  │ CSRF     │  │ Rate     │       ▼              │
│  │ (SQLite) │  │ Protect  │  │ Limiting │  [SQLite DB]          │
│  └──────────┘  └──────────┘  └──────────┘  [WAL Mode]           │
└─────────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities
| Layer | Responsibility | Example |
|-------|---------------|---------|
| **Routes** | Endpoint definition + middleware chain | `/api/public/registrations` |
| **Controllers** | Thin: parse request, call service, format | `submitRegistration()` |
| **Services** | Business logic, transactions | `approveStagingMember()` |
| **Repositories** | Data access, raw SQL | `findByPhone()` |
| **Validators** | Zod schemas, data sanitization | `individualSchema` |

---

## 🎨 Design System

### Color Palette (Church Theme)
| Color | Hex | Usage |
|-------|-----|-------|
| Primary Orange | `#ae3100` | CTAs, highlights |
| Navy | `#0b1c30` | Text, headers |
| Brown | `#5b4139` | Muted text |
| Success Green | `#1f8a46` | Approved states |
| Error Red | `#93000a` | Rejections |
| Soft Blue | `#eff4ff` | Backgrounds |

### Typography
- **Headings:** Inter (system fallback)
- **Body:** System font stack
- **Code:** Monospace

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm 10+

### 1️⃣ Clone & Setup
```bash
git clone <repo>
cd kagc-reg
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install
cp .env.example .env

# Seed admin user
npm run db:seed-admin

# Start dev server
npm run dev
# → Server running on http://localhost:4000
```

### 3️⃣ Frontend Setup
```bash
cd ../ui
npm install

# Create .env file
echo "VITE_API_BASE=http://localhost:4000/api" > .env

# Start dev server
npm run dev
# → App running on http://localhost:5173
```

---

## 📚 API Reference

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/public/locations/search?q={query}` | Search locations |
| `POST` | `/api/public/registrations/individual` | Submit individual |
| `POST` | `/api/public/registrations/family` | Submit family |
| `GET` | `/api/public/drafts/:sessionId` | Get draft |
| `PUT` | `/api/public/drafts/:sessionId` | Save draft |

### Admin Endpoints
| Method | Endpoint | Auth Required |
|--------|----------|---------------|
| `POST` | `/api/admin/auth/login` | ❌ |
| `GET` | `/api/admin/auth/me` | ✅ Session |
| `GET` | `/api/admin/staging/batches` | ✅ Admin/Data Cleaner |
| `POST` | `/api/admin/staging/:id/approve` | ✅ Admin Only |
| `GET` | `/api/admin/members/export.csv` | ✅ With CSRF |

> 🔑 **CSRF Required:** All `POST/PUT/DELETE` admin calls need `X-CSRF-Token` header

---

## 🔒 Security Features

| Feature | Implementation |
|---------|---------------|
| **Authentication** | Session-based with persistent SQLite store |
| **Authorization** | Role guards (`admin`, `data_cleaner`) |
| **CSRF Protection** | `csurf` middleware on mutating endpoints |
| **Rate Limiting** | `express-rate-limit` on forms & login |
| **Input Validation** | Zod schemas on all endpoints |
| **Headers** | Helmet.js security headers |
| **CORS** | Configurable origin allowlist |

---

## 📁 Project Structure

```
kagc-reg/
├── backend/                    # Express API (CommonJS)
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Auth, CSRF, rate limiting
│   │   ├── repositories/       # Data access layer
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   └── validators/         # Zod schemas
│   └── data/                   # SQLite database files
│
└── ui/                         # React Frontend (ES Modules)
    ├── src/
    │   ├── components/         # Shared UI components
    │   ├── features/           # Feature modules
    │   │   ├── public/         # Registration wizard
    │   │   └── admin/          # Admin dashboard
    │   └── lib/                # API utilities, session
    └── vite.config.js
```

---

## 🎯 Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **SQLite over PostgreSQL** | Simpler deployment, WAL mode sufficient for expected load |
| **Session over JWT** | Simpler revocation, built-in CSRF support |
| **Fuzzy matching** | Better UX for duplicate handling than exact-match |
| **Separate UI/backend dirs** | Enables independent deployment (Vercel + VPS) |
| **No TypeScript** | Faster iteration, team preference |

---

## 📈 Performance

- **Database Reads:** Sub-10ms (SQLite in-memory caching)
- **API Response Time:** ~50ms p95
- **Bundle Size:** 125KB (frontend)
- **Lighthouse Score:** 95+ (Performance, Accessibility, Best Practices)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.
