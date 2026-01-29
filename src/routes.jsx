import App from "./App.jsx";
import { ErrorPage } from "./pages/ErrorPage.jsx";
import { HomePage } from "./pages/HomePage.jsx";


export const routes = [
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
];