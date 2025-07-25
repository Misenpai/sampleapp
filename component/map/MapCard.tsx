// Updated MapCard.tsx
import { mapCardStyles } from "@/constants/style";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { Pressable, View } from "react-native";

interface MapCardProps {
  onExpand: () => void;
  mapComponent: React.ReactNode;
}

export function MapCard({ onExpand, mapComponent }: MapCardProps) {
  return (
    <View style={mapCardStyles.container}>
      <View style={mapCardStyles.mapContainer}>
        {mapComponent}
        <Pressable onPress={onExpand} style={mapCardStyles.expandButton}>
          <FontAwesome6 name="expand" size={16} color="white" />
        </Pressable>
      </View>
    </View>
  );
}
