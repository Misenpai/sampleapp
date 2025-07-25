
import { mapStyles } from "@/constants/style";
import { useGeofence } from "@/hooks/useGeofence";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { LeafletView } from "react-native-leaflet-view";

interface GeofenceMapProps {
  selectedGeofenceId?: string | null;
}

export function GeofenceMap({ selectedGeofenceId }: GeofenceMapProps) {
  const {
    html,
    userPos,
    initialPos,
    isInitialized,
    mapShapes,
    mapLayers,
    mapMarkers,
    mapCenter,
  } = useGeofence(selectedGeofenceId);

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
        mapCenterPosition={mapCenter}
        zoom={20}
        mapLayers={mapLayers}
        mapShapes={mapShapes}
        mapMarkers={mapMarkers}
        doDebug={false}
      />
    </View>
  );
}