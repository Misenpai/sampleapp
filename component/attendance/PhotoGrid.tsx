import { colors } from "@/constants/colors";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { CameraCapturedPicture } from "expo-camera";
import { Image } from "expo-image";
import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";

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
      {Array.from({ length: totalPhotos }, (_, index) => (
        <Animated.View 
          key={index} 
          entering={ZoomIn.delay(index * 100)}
          style={styles.photoContainer}
        >
          <View style={styles.photoNumberBadge}>
            <Text style={styles.photoNumber}>{index + 1}</Text>
          </View>
          
          {photos[index] ? (
            <View style={styles.photoWrapper}>
              <Image
                source={{ uri: photos[index].uri }}
                style={styles.photoPreview}
                contentFit="cover"
              />
              <Pressable
                onPress={() => onRetakePhoto(index)}
                style={styles.retakeOverlay}
              >
                <FontAwesome6 name="arrow-rotate-left" size={16} color={colors.white} />
                <Text style={styles.retakeText}>Retake</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.emptySlot}>
              <FontAwesome6 name="camera" size={28} color={colors.gray[400]} />
              <Text style={styles.emptyText}>Tap to capture</Text>
            </Pressable>
          )}
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  photoContainer: {
    flex: 1,
    position: "relative",
  },
  photoNumberBadge: {
    position: "absolute",
    top: -8,
    left: -4,
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 1,
  },
  photoNumber: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.white,
  },
  photoWrapper: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 12,
  },
  photoPreview: {
    width: "100%",
    aspectRatio: 0.75,
    borderRadius: 12,
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
    gap: 4,
    paddingVertical: 8,
  },
  retakeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  emptySlot: {
    aspectRatio: 0.75,
    borderRadius: 12,
    backgroundColor: colors.gray[50],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderStyle: "dashed",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 11,
    color: colors.gray[400],
  },
});