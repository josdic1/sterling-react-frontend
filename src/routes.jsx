// routes.jsx
import App from "./App.jsx";
import { ErrorPage } from "./pages/ErrorPage.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { SignupPage } from "./pages/SignupPage.jsx";
import { MembersPage } from "./pages/MembersPage.jsx";
import { DiningRoomsPage } from "./pages/DiningRoomsPage.jsx";
import { TimeSlotsPage } from "./pages/TimeSlotsPage.jsx";
import { ReservationsPage } from "./pages/ReservationsPage.jsx";
import { ReservationDetailPage } from "./pages/ReservationDetailPage.jsx"; // ← ADD
import { MemberForm } from "./components/members/MemberForm.jsx";
import { ReservationForm } from "./components/reservations/ReservationForm.jsx";
import { ProtectedRoutes } from "./components/shared/ProtectedRoutes.jsx";

export const routes = [
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <ProtectedRoutes><HomePage /></ProtectedRoutes> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
      
      // Members
      { path: "members", element: <ProtectedRoutes><MembersPage /></ProtectedRoutes> },
      { path: "members/new", element: <ProtectedRoutes><MemberForm /></ProtectedRoutes> },
      { path: "members/:id/edit", element: <ProtectedRoutes><MemberForm /></ProtectedRoutes> },
      
      // Dining Rooms (read-only)
      { path: "dining-rooms", element: <ProtectedRoutes><DiningRoomsPage /></ProtectedRoutes> },
      
      // Time Slots (read-only)
      { path: "time-slots", element: <ProtectedRoutes><TimeSlotsPage /></ProtectedRoutes> },
      
      // Reservations
      { path: "reservations", element: <ProtectedRoutes><ReservationsPage /></ProtectedRoutes> },
      { path: "reservations/new", element: <ProtectedRoutes><ReservationForm /></ProtectedRoutes> },
      { path: "reservations/:id", element: <ProtectedRoutes><ReservationDetailPage /></ProtectedRoutes> }, // ← ADD THIS LINE
      { path: "reservations/:id/edit", element: <ProtectedRoutes><ReservationForm /></ProtectedRoutes> },
    ],
  },
];