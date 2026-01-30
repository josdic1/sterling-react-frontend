import { useContext } from "react";
import { DiningRoomContext } from "../contexts/DiningRoomContext";

export const useDiningRooms = () => {
  const context = useContext(DiningRoomContext);
  if (!context) {
    throw new Error("useDiningRooms must be used within DiningRoomProvider");
  }
  return context;
};