// main.jsx
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes.jsx';
import { AuthProvider } from './providers/AuthProvider';
import { MemberProvider } from './providers/MemberProvider';
import { DiningRoomProvider } from './providers/DiningRoomProvider';
import { TimeSlotProvider } from './providers/TimeSlotProvider'; // ← Add
import './index.css';

const router = createBrowserRouter(routes);

const root = createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <MemberProvider>
      <DiningRoomProvider>
        <TimeSlotProvider>
          <RouterProvider router={router} />
        </TimeSlotProvider>
      </DiningRoomProvider>
    </MemberProvider>
  </AuthProvider>
);