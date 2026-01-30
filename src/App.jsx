// src/App.jsx
import { Outlet } from 'react-router-dom';
import { NavBar } from './components/shared/NavBar';
import { ToastContainer } from './components/shared/ToastContainer';
import { useToast } from './hooks/useToast';
import { createContext } from 'react';

// Create a context so any component can trigger toasts
export const ToastContext = createContext(null);

function App() {
  const { toasts, addToast, removeToast } = useToast();

  return (
    <ToastContext.Provider value={{ addToast }}>
      <div>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <NavBar />
        <main>
          <Outlet /> 
        </main>
      </div>
    </ToastContext.Provider>
  );
}

export default App;