import { Suspense, useContext } from "react";
import { Navigate, Route, Routes } from "react-router";

import Spinner from "@/components/spinner";
import MainLayout from "@/layouts-v2/main-layout";
import { AuthContext } from "@/providers/AuthProvider";

import ProtectedRoute from "./protected-route";
import { protectedRoutes, publicRoutes } from "./route";

// Renders one entry from a routes array. Supports three shapes:
//   { path, redirect }             → <Navigate to={redirect} replace />
//   { path, element }              → lazy-loaded route under Suspense
//   { element, children: [...] }   → layout route wrapping nested children
function renderRoute(route, key) {
  if (route.redirect) {
    return (
      <Route
        key={key}
        path={route.path}
        element={<Navigate to={route.redirect} replace />}
      />
    );
  }
  if (route.children) {
    const LayoutEl = route.element;
    return (
      <Route
        key={key}
        element={
          <Suspense fallback={<Spinner />}>
            <LayoutEl />
          </Suspense>
        }
      >
        {route.children.map((child, j) => renderRoute(child, `${key}-${j}`))}
      </Route>
    );
  }
  const El = route.element;
  return (
    <Route
      key={key}
      path={route.path}
      element={
        <Suspense fallback={<Spinner />}>
          <El />
        </Suspense>
      }
    />
  );
}

// Wraps a public route so signed-in users are bounced back to `/`. Mirrors the
// LoginGate pattern from merchants-app.
function PublicGate({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

export default function Router() {
  return (
    <Routes>
      {publicRoutes.map((route, i) => (
        <Route
          key={`pub-${i}`}
          path={route.path}
          element={
            <PublicGate>
              <Suspense fallback={<Spinner />}>
                <route.element />
              </Suspense>
            </PublicGate>
          }
        />
      ))}

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {protectedRoutes.map((route, i) => renderRoute(route, `pri-${i}`))}
        </Route>
      </Route>
    </Routes>
  );
}
