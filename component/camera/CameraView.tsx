import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { CameraView as ExpoCameraView } from "expo-camera";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { cameraStyles } from "@/constants/style";
import { CameraControls } from "./CameraControl";

interface CameraViewProps {
  camera: any; 
  currentPhotoIndex: number;
  retakeMode: boolean;
  totalPhotos: number;
  onPhotoTaken: (photo: any) => void;
  onBack: () => void;
}

export function CameraView({
  camera,
  currentPhotoIndex,
  retakeMode,
  totalPhotos,
  onPhotoTaken,
  onBack,
}: CameraViewProps) {
  const handleTakePicture = async () => {
    const photo = await camera.takePicture();
    if (photo) {
      onPhotoTaken(photo);
    }
  };

  return (
    <View style={cameraStyles.container}>
      <ExpoCameraView
        style={cameraStyles.camera}
        ref={camera.ref}
        mode="picture"
        facing={camera.facing}
        mute={false}
        responsiveOrientationWhenOrientationLocked
      >
        <View style={cameraStyles.counterOverlay}>
          <Text style={cameraStyles.counterText}>
            {retakeMode
              ? `Retaking Photo ${currentPhotoIndex + 1}`
              : `Photo ${currentPhotoIndex + 1} of ${totalPhotos}`}
          </Text>
        </View>

        <Pressable onPress={onBack} style={cameraStyles.backButton}>
          <FontAwesome6 name="arrow-left" size={24} color="white" />
        </Pressable>

        <CameraControls
          onTakePicture={handleTakePicture}
          onToggleFacing={camera.toggleFacing}
        />
      </ExpoCameraView>
    </View>
  );
}
