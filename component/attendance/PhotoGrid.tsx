import { colors } from "@/constants/colors";
import { useAttendanceStore } from "@/store/attendanceStore";
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
  // Get today's photo position from the store
  const getTodayPhotoPosition = useAttendanceStore((state) => state.getTodayPhotoPosition);
  const todayPosition = getTodayPhotoPosition();
  
  const getPositionLabel = () => {
    switch (todayPosition) {
      case 'front':
        return 'Front Face';
      case 'left':
        return 'Left Profile';
      case 'right':
        return 'Right Profile';
      default:
        return 'Front Face';
    }
  };

  const getPositionIcon = () => {
    switch (todayPosition) {
      case 'front':
        return 'user';
      case 'left':
        return 'angle-left';
      case 'right':
        return 'angle-right';
      default:
        return 'user';
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        entering={ZoomIn}
        style={styles.singlePhotoContainer}
      >
        <View style={styles.photoPositionBadge}>
          <FontAwesome6 name={getPositionIcon()} size={14} color={colors.white} />
          <Text style={styles.positionLabel}>{getPositionLabel()}</Text>
        </View>
        
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
            <Text style={styles.emptySubtext}>Today: {getPositionLabel()}</Text>
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
  photoPositionBadge: {
    position: "absolute",
    top: -10,
    left: "50%",
    transform: [{ translateX: -60 }],
    backgroundColor: colors.primary[500],
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  positionLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.white,
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
  emptySubtext: {
    marginTop: 4,
    fontSize: 12,
    color: colors.gray[400],
  },
});