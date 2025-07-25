import { globalStyles } from "@/constants/style";
import React from "react";
import { Text, View } from "react-native";


export default function ProfileScreen() {
  return (
    <View
      style={[
        globalStyles.container,
        { justifyContent: "center", alignItems: "center" },
      ]}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Profile Screen</Text>
      <Text style={{ fontSize: 16, color: "#666", marginTop: 10 }}>
        Coming Soon...
      </Text>
    </View>
  );
}
