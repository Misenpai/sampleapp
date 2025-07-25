import { mapStyles } from "@/constants/style";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { LeafletView } from "react-native-leaflet-view";
import { useGeofence } from "../../hooks/useGeofence";

export function GeofenceMap() {
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
    </View>
  );
}
