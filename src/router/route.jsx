import { lazy } from "react";

// Public routes — outside the auth wall. Signed-in users hitting these are
// redirected to `/` by the router (see LoginGate in router/index.jsx).
export const publicRoutes = [
  {
    path: "/login",
    element: lazy(() => import("@/app-v2/auth/login")),
  },
];

// Protected routes — rendered inside <MainLayout />. Each entry is one of:
//   { path, element }           lazy-loaded page under Suspense
//   { path, redirect }          <Navigate to={redirect} replace />
//   { element, children: [] }   layout route wrapping nested pages
export const protectedRoutes = [
  { path: "/", redirect: "/merchants" },

  {
    path: "/merchants",
    element: lazy(() => import("@/app-v2/merchants")),
  },
  {
    path: "/merchants/:id",
    element: lazy(() => import("@/app-v2/merchants/detail")),
  },

  {
    path: "/plans",
    element: lazy(() => import("@/app-v2/plans")),
  },
  {
    path: "/plans/:id",
    element: lazy(() => import("@/app-v2/plans/detail")),
  },

  // Catch-all — keeps the browser on a known screen if a stale URL is loaded.
  { path: "*", redirect: "/merchants" },
];
