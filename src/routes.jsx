import App from "./App.jsx";
import { ErrorPage } from "./pages/ErrorPage.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { MemberForm } from "./components/members/MemberForm.jsx";
import { ProtectedRoutes } from "./components/shared/ProtectedRoutes.jsx";
import { SignupPage } from "./pages/SignupPage.jsx";
import { DiningRoomForm } from "./components/diningRooms/DiningRoomForm.jsx";

export const routes = [
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element:  <ProtectedRoutes><HomePage /></ProtectedRoutes>,
      },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
      { path: "dining-rooms/new", element: <DiningRoomForm /> },
      { path: "dining-rooms/:id/edit", element: <DiningRoomForm /> },
      { path: "members/new", element: <MemberForm /> },
      { path: "members/:id/edit", element: <MemberForm /> }
    ],
  },
];