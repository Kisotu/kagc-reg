# 🎨 KAGC UI — React 19 Registration Frontend

<div align="center">

[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=white&style=flat-square)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4.2-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white&style=flat-square)](https://vercel.com)

**Modern React 19 frontend with Tailwind CSS v4, featuring a multi-step registration wizard, responsive admin dashboard, and intelligent draft persistence.**

[🌐 Live Demo](https://oloishorua.duckdns.org) · [📖 Component Docs](#component-architecture) · [🎨 Design System](#design-system) · [🚀 Deploy Guide](#deployment-to-vercel)

</div>

---

## 📊 UI Stats

<div align="center">

| ![Components](https://img.shields.io/badge/🧩%20Components-25+-ae3100?style=flat-square) | ![Features](https://img.shields.io/badge/✨%20Features-15+-0b1c30?style=flat-square) | ![Bundle](https://img.shields.io/badge/📦%20Bundle-~125KB-1f8a46?style=flat-square) | ![Lighthouse](https://img.shields.io/badge/⚡%20Lighthouse-95+-93000a?style=flat-square) |
|:---:|:---:|:---:|:---:|
| **25+ Components** | **15+ Features** | **Optimized** | **A+ Performance** |

</div>

---

## ✨ Features

### 👤 Public Registration

| Feature | Description |
|---------|-------------|
| 🎯 Step-by-Step Wizard | Multi-step form with progress indicator |
| 💾 Auto-Save Drafts | LocalStorage + server session persistence |
| 🔍 Smart Location Search | Fuzzy matching with instant results |
| 👨‍👩‍👧‍👦 Family Mode | Bulk registration with shared attributes |
| 📱 Mobile First | Responsive design for all devices |

### 🛠️ Admin Dashboard

| Feature | Description |
|---------|-------------|
| 📊 Analytics Overview | KPI cards and trend visualizations |
| 📋 Staging Pipeline | Review and approval workflow |
| 🔎 Advanced Search | Full-text with filters |
| 📈 CSV Export | Download and share member lists |
| 🎨 Tailwind v4 | Latest utility-first CSS |

---

## 🏗️ Component Architecture

```
ui/src/
├── 📁 components/
│   ├── ui/                    # Reusable UI primitives
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── KpiCard.jsx
│   │   └── Modal.jsx
│   ├── icons/                 # SVG icons
│   └── layout/                # Header, Sidebar, Footer
│
├── 📁 features/
│   ├── 📁 public/
│   │   ├── RegistrationWizard.jsx
│   │   ├── steps/
│   │   │   ├── PersonalInfoStep.jsx
│   │   │   ├── LocationStep.jsx
│   │   │   ├── FamilyStep.jsx
│   │   │   └── ReviewStep.jsx
│   │   └── hooks/useDrafts.js
│   │
│   └── 📁 admin/
│       ├── AdminPanel.jsx
│       ├── DashboardPage.jsx
│       ├── StagingQueue.jsx
│       └── MemberList.jsx
│
└── 📁 lib/
    ├── api.js                 # HTTP client
    └── session.js             # Session utilities
```

---

## 🎨 Design System

### 🎯 Color Palette

| Token | Color | Hex | Usage |
|-------|-------|-----|-------|
| `primary` | 🔶 Orange | `#ae3100` | CTAs, buttons |
| `navy` | 🔷 Navy | `#0b1c30` | Text, headers |
| `brown` | 🟤 Brown | `#5b4139` | Muted text |
| `green` | 🟢 Green | `#1f8a46` | Success states |
| `red` | 🔴 Red | `#93000a` | Errors |
| `light-blue` | 🔵 Light | `#eff4ff` | Backgrounds |

### 🧩 Custom Components

```css
/* Buttons */
.btn-primary { @apply bg-[#ae3100] text-white hover:bg-[#8a2600]; }
.btn-soft    { @apply bg-[#eff4ff] text-[#0b1c30] hover:bg-blue-100; }
.btn-success { @apply bg-[#1f8a46] text-white hover:bg-green-700; }
.btn-danger  { @apply bg-[#93000a] text-white hover:bg-red-800; }

/* Inputs */
.field { @apply w-full rounded-lg border border-gray-200 px-4 py-3
            focus:border-[#ae3100] focus:ring-2 focus:ring-[#ae3100]/20; }

/* Cards */
.panel     { @apply bg-white rounded-xl shadow-sm border border-gray-100 p-6; }
.kpi-card  { @apply panel flex flex-col gap-1; }
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see [../backend/README.md](../backend))

### 1️⃣ Setup

```bash
cd ui
npm install
```

### 2️⃣ Configure

```bash
# Dev environment
echo "VITE_API_BASE=http://localhost:4000/api" > .env

# Production (Vercel)
echo "VITE_API_BASE=https://oloishorua.duckdns.org/api" > .env
```

### 3️⃣ Develop

```bash
npm run dev
# → http://localhost:5173
```

---

## 📡 API Integration

### Basic Usage

```javascript
import { api } from './lib/api';

// GET members
const members = await api.request('/admin/members');

// POST with body
await api.request('/public/registrations/individual', {
  method: 'POST',
  body: JSON.stringify({ name: 'John', phone: '+254...' })
});

// Query params
const query = api.toQuery({ page: 1, search: 'john' });
const results = await api.request(`/admin/members${query}`);

// CSRF protected
const csrf = await api.request('/admin/auth/csrf-token');
await api.request('/admin/staging/members/123/approve', {
  method: 'POST',
  headers: { 'x-csrf-token': csrf.csrfToken },
  body: JSON.stringify({ member_number: 'KAGC-001' })
});
```

---

## 🛠️ Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build |
| `npm run preview` | Preview production |
| `npm run lint` | ESLint check |

---

## 🚀 Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git add . && git commit -m "Deploy" && git push
   ```

2. **Import to Vercel**
   - Root Directory: `ui/`
   - Framework: `Vite`

3. **Build Settings**
   | Setting | Value |
   |---------|-------|
   | Build Command | `npm run build` |
   | Output | `dist` |
   | Env Var | `VITE_API_BASE={your-backend}` |

4. **Deploy**

### Cross-Domain Cookies

For admin login to work across domains:

**Backend CORS:**
```javascript
cors({
  origin: 'https://your-app.vercel.app',
  credentials: true
})
```

**Cookie Settings:**
```javascript
{
  secure: true,
  sameSite: 'none'
}
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Usage |
|------------|-------|
| Mobile | < 640px |
| sm: | >= 640px |
| md: | >= 768px |
| lg: | >= 1024px |
| xl: | >= 1280px |

### Example

```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <KpiCard />
  <KpiCard />
  <KpiCard />
  <KpiCard />
</div>
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE` | ✅ | Backend API URL |

### Vite Config

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()]
});
```

---

## 📈 Performance

- **Bundle Size:** ~125KB (gzipped)
- **Lighthouse:** 95+ Performance
- **FCP:** < 1.5s
- **LCP:** < 2.5s

### Optimizations

- ✅ Code splitting
- ✅ Tree shaking
- ✅ Asset optimization
- ✅ CSS purging

---

<div align="center">

**🎨 Built with React 19 + Tailwind CSS v4**

[⬆️ Root README](../README.md) · [⚙️ Backend Docs](../backend/README.md)

</div>