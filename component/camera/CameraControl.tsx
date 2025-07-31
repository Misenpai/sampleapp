import { cameraStyles } from "@/constants/style";
import React from "react";
import { Pressable, View } from "react-native";

interface CameraControlsProps {
  onTakePicture: () => void;
}

export function CameraControls({ onTakePicture }: CameraControlsProps) {
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
    </View>
  );
}
