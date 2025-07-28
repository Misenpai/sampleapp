import { mapCardStyles } from "@/constants/style";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { Pressable, View } from "react-native";

interface MapCardProps {
  onExpand: () => void;
  mapComponent: React.ReactNode;
  onMapTouchStart?: () => void;
  onMapTouchEnd?: () => void;
}

export function MapCard({
  onExpand,
  mapComponent,
  onMapTouchStart,
  onMapTouchEnd,
}: MapCardProps) {
  return (
    <View style={mapCardStyles.container}>
      <View style={mapCardStyles.mapContainer}>
        <View
          style={{ flex: 1 }}
          onTouchStart={onMapTouchStart}
          onTouchEnd={onMapTouchEnd}
          onTouchCancel={onMapTouchEnd}
        >
          {mapComponent}
        </View>

        <Pressable onPress={onExpand} style={mapCardStyles.expandButton}>
          <FontAwesome6 name="expand" size={16} color="white" />
        </Pressable>
      </View>
    </View>
  );
}
