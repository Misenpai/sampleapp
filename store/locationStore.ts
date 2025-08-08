import { create } from 'zustand';
import { GEOFENCE_LOCATIONS } from '@/constants/geofenceLocation';

interface LocationState {
  selectedGeofenceId: string | null;
  selectedLocationLabel: string | null;
  
  // Actions
  setSelectedLocation: (geofenceId: string | null, label: string | null) => void;
  setLocationByLabel: (label: string) => void;
  clearSelection: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  selectedGeofenceId: null,
  selectedLocationLabel: null,

  setSelectedLocation: (geofenceId, label) => 
    set({ selectedGeofenceId: geofenceId, selectedLocationLabel: label }),

  setLocationByLabel: (label) => {
    if (label === 'all') {
      set({ selectedGeofenceId: null, selectedLocationLabel: null });
    } else {
      const geofenceLocation = GEOFENCE_LOCATIONS.find(g => g.label === label);
      if (geofenceLocation) {
        set({ 
          selectedGeofenceId: geofenceLocation.id, 
          selectedLocationLabel: geofenceLocation.label 
        });
      }
    }
  },

  clearSelection: () => 
    set({ selectedGeofenceId: null, selectedLocationLabel: null }),
}));