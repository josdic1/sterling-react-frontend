import { useContext } from "react";
import { DiningRoomContext } from "../contexts/DiningRoomContext";

export const useDiningRoom = () => {
  const context = useContext(DiningRoomContext);
  if (!context) {
    throw new Error("useDiningRoom must be used within DiningRoomProvider");
  }
  return context;
};