import { useContext } from "react";
import { MemberContext } from "../contexts/MemberContext";

export const useMembers = () => {
  const context = useContext(MemberContext);
  if (!context) {
    throw new Error("useMembers must be used within MemberProvider");
  }
  return context;
};