// pages/HomePage.jsx
import { useAuth } from "../hooks/useAuth";
import { MembersPage } from "./MembersPage";
import { DiningRoomsPage } from "./DiningRoomsPage";
import { TimeSlotsPage } from "./TimeSlotsPage";

export function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Welcome, {user?.name}!</h1>
      
      <MembersPage />
      <DiningRoomsPage />
      <TimeSlotsPage />
    </div>
  );
}