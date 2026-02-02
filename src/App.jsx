// src/App.jsx - COMPLETE VERSION (Tutorial on every page)
import { Outlet } from "react-router-dom";
import { NavBar } from "./components/shared/NavBar";
import { ToastContainer } from "./components/shared/ToastContainer";
import { TutorialModal } from "./components/shared/TutorialModal";
import { useToast } from "./hooks/useToast";
import { createContext } from "react";

// Create a context so any component can trigger toasts
export const ToastContext = createContext(null);

function App() {
  const { toasts, addToast, removeToast } = useToast();

  return (
    <ToastContext.Provider value={{ addToast }}>
      <div>
        {/* Tutorial Modal - Available on EVERY page */}
        <TutorialModal autoStart={true} />

        {/* Toast notifications */}
        <ToastContainer toasts={toasts} removeToast={removeToast} />

        {/* Navigation */}
        <NavBar />

        {/* Page content */}
        <main>
          <Outlet />
        </main>
      </div>
    </ToastContext.Provider>
  );
}

export default App;
