import { useContext } from "react";
import { TimeSlotContext } from "../contexts/TimeSlotContext";

export const useTimeSlots = () => {
  const context = useContext(TimeSlotContext);
  if (!context) {
    throw new Error("useTimeSlots must be used within TimeSlotProvider");
  }
  return context;
};
