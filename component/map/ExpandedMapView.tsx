import React from 'react';
import { View, Pressable } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { GeofenceMap } from './GeofenceMap';
import { expandedMapStyles } from '@/constants/style';


interface ExpandedMapViewProps {
  onClose: () => void;
}

export function ExpandedMapView({ onClose }: ExpandedMapViewProps) {
  return (
    <View style={expandedMapStyles.container}>
      <Pressable onPress={onClose} style={expandedMapStyles.closeButton}>
        <FontAwesome6 name="xmark" size={24} color="white" />
      </Pressable>
      <GeofenceMap />
    </View>
  );
}