import { photoGridStyles } from "@/constants/style";
import { CameraCapturedPicture } from "expo-camera";
import { Image } from "expo-image";
import React from "react";
import { Pressable, Text, View } from "react-native";


interface PhotoPreviewProps {
  photo: CameraCapturedPicture;
  onRetake: () => void;
  photoNumber: number;
}

export function PhotoPreview({
  photo,
  onRetake,
  photoNumber,
}: PhotoPreviewProps) {
  return (
    <View style={photoGridStyles.photoContainer}>
      <Text style={photoGridStyles.photoNumber}>{photoNumber}</Text>
      <View style={photoGridStyles.photoWrapper}>
        <Image
          source={{ uri: photo.uri }}
          style={photoGridStyles.photoPreview}
          contentFit="cover"
        />
        <Pressable onPress={onRetake} style={photoGridStyles.retakeButton}>
          <Text style={photoGridStyles.retakeButtonText}>Retake</Text>
        </Pressable>
      </View>
    </View>
  );
}
