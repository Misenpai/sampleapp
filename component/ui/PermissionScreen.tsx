import { permissionStyles } from "@/constants/style";
import React from "react";
import { Button, Text, View } from "react-native";

interface PermissionScreenProps {
  onRequestPermission: () => void;
}

export function PermissionScreen({
  onRequestPermission,
}: PermissionScreenProps) {
  return (
    <View style={permissionStyles.container}>
      <Text style={permissionStyles.text}>
        We need your permission to use the camera
      </Text>
      <Button onPress={onRequestPermission} title="Grant permission" />
    </View>
  );
}
