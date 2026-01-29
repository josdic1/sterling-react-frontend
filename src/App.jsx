import { Outlet } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { AuthProvider } from "./providers/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <NavBar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
