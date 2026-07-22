# anuma-super-admin

Vite + React 19 + Tailwind + RTK Query admin app for managing **plans** and **merchants** against the Anuma platform (`https://api-gateway-stage.anuma.run`).

Layout, design tokens and shadcn primitives mirror the `merchants-app` `layouts-v2/` shell so the two apps feel like siblings.

## Setup

```bash
npm install
npm run dev            # http://localhost:3000
```

`.env`:

```
VITE_APP_API_HOST=https://api-gateway-stage.anuma.run
```

## Structure

```
src/
├── api/
│   ├── services/       axios base query + RTK Query slices (auth, plans, merchants)
│   ├── slices/         authSlice (token + localStorage persistence)
│   └── store.js
├── app-v2/             feature screens (mirrors merchants-app)
│   ├── auth/login/
│   ├── plans/
│   │   ├── index.jsx      list page
│   │   ├── detail.jsx     detail + edit
│   │   ├── data.js        constants (QUOTA_KEYS, EMPTY_PLAN, VISIBILITY_OPTIONS…)
│   │   └── components/    plan-form, plans-table, create-plan-dialog
│   └── merchants/
│       ├── index.jsx      list page
│       ├── detail.jsx     detail + assign plan + toggle active + delete
│       ├── data.js
│       └── components/    merchant-form, merchants-table, create-merchant-dialog, assign-plan-dialog
├── layouts-v2/         dark rail + white rounded panel shell (mirrors merchants-app)
│   ├── main-layout.jsx
│   ├── sidebar.jsx
│   ├── topbar.jsx
│   └── nav.js          NAV_ITEMS + titleFor()
├── components/ui/      shadcn primitives (button, dialog, table, select, sonner…)
├── providers/
│   └── AuthProvider.jsx    isAuthenticated + handleLogout
├── router/
│   ├── index.jsx           routes + LoginGate
│   └── protected-route.jsx
├── lib/utils.js        cn() helper
├── App.jsx             store + router + toaster
├── main.jsx
└── index.css           HSL tokens + os-enter animation
```

## Endpoints wired

**Auth**
- `POST /auth/login/` `{email, password}` → `{access}`
- `POST /auth/refresh/` `{refresh}`
- `POST /auth/logout/` `{refresh}`

**Plans** (`/api/billing/plans/`)
- List, Retrieve, Create, Update (PUT), Patch (PATCH), Delete
- `POST /api/billing/plans/{id}/activate/`

**Merchants** (`/api/merchants/`)
- List, Retrieve, Create, Update (PUT), Patch (PATCH), Delete
- `POST /api/merchants/{id}/assign-plan/` `{plan_id}`
- `POST /api/merchants/{id}/toggle_active/`
- `POST /api/merchants/{id}/toggle-module/` `{module_id}`

## Auth model

Bearer JWT. Access token is stored in Redux + persisted to `localStorage` under `anuma_super_admin_access_token` so refresh keeps the session. Any 401 outside `/login` clears the token and bounces to `/login`.

## Scripts

- `npm run dev` — dev server on port 3000
- `npm run build` — production build
- `npm run preview` — preview the build
