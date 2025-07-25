import React from 'react';
import { View, Pressable } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { GeofenceMap } from './GeofenceMap';
import { mapCardStyles } from '@/constants/style';


interface MapCardProps {
  onExpand: () => void;
}

export function MapCard({ onExpand }: MapCardProps) {
  return (
    <View style={mapCardStyles.container}>
      <View style={mapCardStyles.mapContainer}>
        <GeofenceMap showLocationStatus={false} />
        <Pressable onPress={onExpand} style={mapCardStyles.expandButton}>
          <FontAwesome6 name="expand" size={16} color="white" />
        </Pressable>
      </View>
    </View>
  );
}