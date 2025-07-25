import { photoGridStyles } from "@/constants/style";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { CameraCapturedPicture } from "expo-camera";
import { Image } from "expo-image";
import React from "react";
import { Pressable, Text, View } from "react-native";


interface PhotoGridProps {
  photos: CameraCapturedPicture[];
  onRetakePhoto: (index: number) => void;
  totalPhotos: number;
}

export function PhotoGrid({
  photos,
  onRetakePhoto,
  totalPhotos,
}: PhotoGridProps) {
  return (
    <View style={photoGridStyles.container}>
      {Array.from({ length: totalPhotos }, (_, index) => (
        <View key={index} style={photoGridStyles.photoContainer}>
          <Text style={photoGridStyles.photoNumber}>{index + 1}</Text>
          {photos[index] ? (
            <View style={photoGridStyles.photoWrapper}>
              <Image
                source={{ uri: photos[index].uri }}
                style={photoGridStyles.photoPreview}
                contentFit="cover"
              />
              <Pressable
                onPress={() => onRetakePhoto(index)}
                style={photoGridStyles.retakeButton}
              >
                <Text style={photoGridStyles.retakeButtonText}>Retake</Text>
              </Pressable>
            </View>
          ) : (
            <View style={photoGridStyles.emptySlot}>
              <FontAwesome6 name="camera" size={32} color="#ccc" />
            </View>
          )}
        </View>
      ))}
    </View>
  );
}
