import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LocationContextType {
  selectedGeofenceId: string | null;
  selectedLocationLabel: string | null;
  setSelectedLocation: (geofenceId: string | null, label: string | null) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedGeofenceId, setSelectedGeofenceId] = useState<string | null>(null);
  const [selectedLocationLabel, setSelectedLocationLabel] = useState<string | null>(null);

  const setSelectedLocation = (geofenceId: string | null, label: string | null) => {
    setSelectedGeofenceId(geofenceId);
    setSelectedLocationLabel(label);
  };

  return (
    <LocationContext.Provider value={{
      selectedGeofenceId,
      selectedLocationLabel,
      setSelectedLocation
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};