import { cameraStyles } from "@/constants/style";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { Pressable, View } from "react-native";


interface CameraControlsProps {
  onTakePicture: () => void;
  onToggleFacing: () => void;
}

export function CameraControls({
  onTakePicture,
  onToggleFacing,
}: CameraControlsProps) {
  return (
    <View style={cameraStyles.shutterContainer}>
      <View style={cameraStyles.controlSpacer} />

      <Pressable onPress={onTakePicture} style={cameraStyles.shutterBtn}>
        {({ pressed }) => (
          <View
            style={[
              cameraStyles.shutterBtnOuter,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View style={cameraStyles.shutterBtnInner} />
          </View>
        )}
      </Pressable>

      <Pressable onPress={onToggleFacing} style={cameraStyles.controlBtn}>
        <FontAwesome6 name="rotate-left" size={32} color="white" />
      </Pressable>
    </View>
  );
}
