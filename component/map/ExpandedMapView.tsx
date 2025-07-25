
import { expandedMapStyles } from "@/constants/style";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { Pressable, View } from "react-native";

interface ExpandedMapViewProps {
  onClose: () => void;
  mapComponent: React.ReactNode;
  dropdownComponent?: React.ReactNode;
}

export function ExpandedMapView({
  onClose,
  mapComponent,
  dropdownComponent,
}: ExpandedMapViewProps) {
  return (
    <View style={expandedMapStyles.container}>
      <Pressable onPress={onClose} style={expandedMapStyles.closeButton}>
        <FontAwesome6 name="xmark" size={24} color="white" />
      </Pressable>
      {dropdownComponent && (
        <View style={expandedMapStyles.dropdownContainer}>
          {dropdownComponent}
        </View>
      )}
      <View style={expandedMapStyles.mapContainer}>
        {mapComponent}
      </View>
    </View>
  );
}