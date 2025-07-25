import { locationStatusStyles } from "@/constants/style";
import React from "react";
import { Text, View } from "react-native";

interface LocationStatusProps {
  currentLocation: string | null;
}

export function LocationStatus({ currentLocation }: LocationStatusProps) {
  return (
    <View
      style={[
        locationStatusStyles.container,
        currentLocation
          ? locationStatusStyles.inside
          : locationStatusStyles.outside,
      ]}
    >
      <Text style={locationStatusStyles.icon}>
        {currentLocation ? "✓" : "✗"}
      </Text>
      <Text style={locationStatusStyles.text}>
        {currentLocation
          ? `Inside the ${currentLocation}`
          : "Not inside any geolocation"}
      </Text>
    </View>
  );
}
