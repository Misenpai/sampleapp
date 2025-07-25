import { GeofenceLocation } from "@/types/geofence";

export const GEOFENCE_LOCATIONS: GeofenceLocation[] = [
  {
    id: "rnd-office",
    label: "RnD Office",
    center: {
      lat: 26.1851451,
      lng: 91.6892149,
    },
    radius: 5,
  },
  {
    id: "somewhere-else",
    label: "Somewhere Else",
    center: {
      lat: 26.18487200093455,
      lng: 91.68924480966525,
    },
    radius: 5,
  },
];
