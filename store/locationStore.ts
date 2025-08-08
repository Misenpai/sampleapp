import { GEOFENCE_LOCATIONS } from '@/constants/geofenceLocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface LocationState {
  selectedGeofenceId: string | null;
  selectedLocationLabel: string | null;
  
  setSelectedLocation: (geofenceId: string | null, label: string | null) => void;
  setLocationByLabel: (label: string) => void;
  clearSelection: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      selectedGeofenceId: null,
      selectedLocationLabel: null,

      setSelectedLocation: (geofenceId, label) => 
        set({ selectedGeofenceId: geofenceId, selectedLocationLabel: label }),

      setLocationByLabel: (label) => {
        const geofenceLocation = GEOFENCE_LOCATIONS.find(g => g.label === label);
        if (geofenceLocation) {
          set({ 
            selectedGeofenceId: geofenceLocation.id, 
            selectedLocationLabel: geofenceLocation.label 
          });
        }
      },

      clearSelection: () => 
        set({ selectedGeofenceId: null, selectedLocationLabel: null }),
    }),
    {
      name: 'location-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);