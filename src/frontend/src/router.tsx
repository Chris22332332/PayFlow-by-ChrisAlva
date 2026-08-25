import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import { Layout } from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import InvitePage from "./pages/InvitePage";
import LoginPage from "./pages/LoginPage";
import PaymentMethodsPage from "./pages/PaymentMethodsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import TransfersPage from "./pages/TransfersPage";

const SubscriptionsPage = lazy(() => import("./pages/SubscriptionsPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const SavingsPage = lazy(() => import("./pages/SavingsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const ActivityPage = lazy(() => import("./pages/ActivityPage"));
const HelpPage = lazy(() => import("./pages/HelpPage"));

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

// Public invite route
const inviteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/invite/$code",
  component: InvitePage,
});

// Protected layout route
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
  component: () => null,
});

const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const transfersRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/transfers",
  component: TransfersPage,
});

const paymentMethodsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/payment-methods",
  component: PaymentMethodsPage,
});

const profileRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/profile",
  component: ProfilePage,
});

const settingsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/settings",
  component: SettingsPage,
});

const subscriptionsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/subscriptions",
  component: () => (
    <Suspense fallback={null}>
      <SubscriptionsPage />
    </Suspense>
  ),
});

const analyticsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/analytics",
  component: () => (
    <Suspense fallback={null}>
      <AnalyticsPage />
    </Suspense>
  ),
});

const savingsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/savings",
  component: () => (
    <Suspense fallback={null}>
      <SavingsPage />
    </Suspense>
  ),
});

const notificationsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/notifications",
  component: () => (
    <Suspense fallback={null}>
      <NotificationsPage />
    </Suspense>
  ),
});

const activityRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/activity",
  component: () => (
    <Suspense fallback={null}>
      <ActivityPage />
    </Suspense>
  ),
});

const helpRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/help",
  component: () => (
    <Suspense fallback={null}>
      <HelpPage />
    </Suspense>
  ),
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  inviteRoute,
  protectedRoute.addChildren([
    indexRoute,
    dashboardRoute,
    transfersRoute,
    paymentMethodsRoute,
    profileRoute,
    settingsRoute,
    subscriptionsRoute,
    analyticsRoute,
    savingsRoute,
    notificationsRoute,
    activityRoute,
    helpRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
