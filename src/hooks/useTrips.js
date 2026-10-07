import { useContext } from "react";
import TripContext from "../context/TripContext";

export default function useTrips() {
  const context = useContext(TripContext);

  if (!context) {
    throw new Error(
      "useTrips must be used inside a TripProvider"
    );
  }

  return context;
}