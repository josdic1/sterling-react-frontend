// src/routes.jsx - WITH ADMIN DASHBOARD
import App from "./App.jsx";
import { ErrorPage } from "./pages/ErrorPage.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { SignupPage } from "./pages/SignupPage.jsx";
import { MemberForm } from "./components/members/MemberForm.jsx";
import { ProtectedRoutes } from "./components/shared/ProtectedRoutes.jsx";
import { MembersPage } from "./pages/MembersPage.jsx";
import { DiningRoomsPage } from "./pages/DiningRoomsPage.jsx";
import { TimeSlotsPage } from "./pages/TimeSlotsPage.jsx";
import { ReservationsPage } from "./pages/ReservationsPage.jsx";
import { ReservationDetailPage } from "./pages/ReservationDetailPage.jsx";
import { ReservationForm } from "./components/reservations/ReservationForm.jsx";
import { RulesPage } from "./pages/RulesPage.jsx";
import { AdminPage } from "./pages/AdminPage.jsx";

export const routes = [
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoutes>
            <HomePage />
          </ProtectedRoutes>
        ),
      },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },

      // Members
      {
        path: "members",
        element: (
          <ProtectedRoutes>
            <MembersPage />
          </ProtectedRoutes>
        ),
      },
      {
        path: "members/new",
        element: (
          <ProtectedRoutes>
            <MemberForm />
          </ProtectedRoutes>
        ),
      },
      {
        path: "members/:id/edit",
        element: (
          <ProtectedRoutes>
            <MemberForm />
          </ProtectedRoutes>
        ),
      },

      // Rules & Fees
      {
        path: "rules",
        element: (
          <ProtectedRoutes>
            <RulesPage />
          </ProtectedRoutes>
        ),
      },

      // Infrastructure (Read-only)
      {
        path: "dining-rooms",
        element: (
          <ProtectedRoutes>
            <DiningRoomsPage />
          </ProtectedRoutes>
        ),
      },
      {
        path: "time-slots",
        element: (
          <ProtectedRoutes>
            <TimeSlotsPage />
          </ProtectedRoutes>
        ),
      },

      // Reservations & Ledger Entries
      {
        path: "reservations",
        element: (
          <ProtectedRoutes>
            <ReservationsPage />
          </ProtectedRoutes>
        ),
      },
      {
        path: "reservations/new",
        element: (
          <ProtectedRoutes>
            <ReservationForm />
          </ProtectedRoutes>
        ),
      },
      {
        path: "reservations/:id",
        element: (
          <ProtectedRoutes>
            <ReservationDetailPage />
          </ProtectedRoutes>
        ),
      },
      {
        path: "reservations/:id/edit",
        element: (
          <ProtectedRoutes>
            <ReservationForm />
          </ProtectedRoutes>
        ),
      },

      // ADMIN DASHBOARD - Only accessible to admin users
      {
        path: "admin",
        element: (
          <ProtectedRoutes>
            <AdminPage />
          </ProtectedRoutes>
        ),
      },
    ],
  },
];
