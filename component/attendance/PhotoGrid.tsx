import { colors } from "@/constants/colors";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { CameraCapturedPicture } from "expo-camera";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";

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
    <View style={styles.container}>
      <Animated.View 
        entering={ZoomIn}
        style={styles.singlePhotoContainer}
      >
        {photos[0] ? (
          <View style={styles.photoWrapper}>
            <Image
              source={{ uri: photos[0].uri }}
              style={styles.photoPreview}
              contentFit="cover"
            />
            <Pressable
              onPress={() => onRetakePhoto(0)}
              style={styles.retakeOverlay}
            >
              <FontAwesome6 name="arrow-rotate-left" size={20} color={colors.white} />
              <Text style={styles.retakeText}>Retake</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.emptySlot}>
            <FontAwesome6 name="camera" size={36} color={colors.gray[400]} />
            <Text style={styles.emptyText}>Tap to capture</Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  singlePhotoContainer: {
    width: "100%",
    maxWidth: 250,
    position: "relative",
  },
  photoWrapper: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 16,
  },
  photoPreview: {
    width: "100%",
    aspectRatio: 0.75,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
  },
  retakeOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  retakeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  emptySlot: {
    aspectRatio: 0.75,
    borderRadius: 16,
    backgroundColor: colors.gray[50],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.gray[200],
    borderStyle: "dashed",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.gray[500],
    fontWeight: "600",
  },
});
