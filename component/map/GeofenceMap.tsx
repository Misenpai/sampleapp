import { mapStyles } from "@/constants/style";
import { LatLng, MapLayer, MapMarker, MapShape } from "@/types/geofence";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { LeafletView } from "react-native-leaflet-view";

interface GeofenceMapProps {
  html: string | null;
  userPos: LatLng | null;
  initialPos: LatLng | null;
  isInitialized: boolean;
  mapShapes: MapShape[];
  mapLayers: MapLayer[];
  mapMarkers: MapMarker[];
  mapCenter: LatLng | null;
}

export const GeofenceMap = React.memo(function GeofenceMap({
  html,
  userPos,
  initialPos,
  isInitialized,
  mapShapes,
  mapLayers,
  mapMarkers,
  mapCenter,
}: GeofenceMapProps) {
  if (!html || !userPos || !initialPos || !isInitialized) {
    return (
      <View style={mapStyles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={mapStyles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  // Create a unique key based on map data to force re-render when location type changes
  const mapKey = `${mapCenter?.lat}-${mapCenter?.lng}-${mapShapes.length}`;

  return (
    <View style={mapStyles.container}>
      <LeafletView
        key={mapKey} // Forces re-render when location type changes
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
});
