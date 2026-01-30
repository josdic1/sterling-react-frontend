import { MemberItem } from "./MemberItem";

export function MemberList({members}) {
  const memberData = members.map((member) => (
    <MemberItem key={member.id} member={member} />
  ));

  return (
    <>
      <h2>Members</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>USER_ID</th>
            <th>NAME</th>
            <th>RELATION</th>
            <th>DIET_REST</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>{memberData}</tbody>
      </table>
    </>
  );
}