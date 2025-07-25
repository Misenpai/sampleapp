import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { LeafletView } from 'react-native-leaflet-view';
import { LocationStatus } from './LocationStatus';
import { useGeofence } from '../../hooks/useGeofence';
import { mapStyles } from '@/constants/style';


interface GeofenceMapProps {
  showLocationStatus?: boolean;
}

export function GeofenceMap({ showLocationStatus = true }: GeofenceMapProps) {
  const {
    html,
    userPos,
    initialPos,
    currentLocation,
    isInitialized,
    mapShapes,
    mapLayers,
    mapMarkers,
  } = useGeofence();

  if (!html || !userPos || !initialPos || !isInitialized) {
    return (
      <View style={mapStyles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={mapStyles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={mapStyles.container}>
      <LeafletView
        source={{ html }}
        mapCenterPosition={initialPos}
        zoom={20}
        mapLayers={mapLayers}
        mapShapes={mapShapes}
        mapMarkers={mapMarkers}
        doDebug={false}
      />
      
      {showLocationStatus && (
        <LocationStatus currentLocation={currentLocation} />
      )}
    </View>
  );
}