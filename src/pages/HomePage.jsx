import { useAuth } from "../hooks/useAuth";
import { useDiningRoom } from "../hooks/useDiningRoom";
import { useMember } from "../hooks/useMember";
import { MemberList } from "../components/Members/MemberList";
import { DiningRoomList } from "../components/DiningRooms/DiningRoomList";

export function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const { members, loading: membersLoading } = useMember();
  const { diningRooms, loading: roomsLoading } = useDiningRoom();

  // Check ALL loading states
  if (authLoading || membersLoading || roomsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <h1>Welcome, {user.name}!</h1>
      <MemberList members={members} />
      <DiningRoomList diningRooms={diningRooms} />
    </>
  );
}