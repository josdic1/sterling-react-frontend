// main.jsx
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes.jsx';
import { AuthProvider } from './providers/AuthProvider';
import { DataProvider } from './providers/DataProvider';
import './index.css';

const router = createBrowserRouter(routes);

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <DataProvider>
      <RouterProvider router={router} />
    </DataProvider>
  </AuthProvider>
);console.log('Build: 1769978709');
