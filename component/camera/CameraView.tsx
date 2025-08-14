// component/camera/CameraView.tsx
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import {
  CameraCapturedPicture,
  CameraView as ExpoCameraView,
} from "expo-camera";
import { Image } from "expo-image";
import { FlipType, manipulateAsync, SaveFormat } from "expo-image-manipulator";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { colors } from "@/constants/colors";
import { useAttendanceStore } from "@/store/attendanceStore";
import { CameraControls } from "./CameraControl";
import { SelfieInstructions } from "./SelfieInstructions";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface CameraViewProps {
  camera: any;
  currentPhotoIndex: number;
  retakeMode: boolean;
  totalPhotos: number;
  onPhotoTaken: (photo: any) => void;
  onBack: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CameraView({
  camera,
  currentPhotoIndex,
  retakeMode,
  totalPhotos,
  onPhotoTaken,
  onBack,
}: CameraViewProps) {
  const [capturedPhoto, setCapturedPhoto] =
    useState<CameraCapturedPicture | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);

  const shutterOpacity = useSharedValue(0);

  const currentPosition =
    useAttendanceStore((s) => s.currentSessionPhotoPosition) || "front";

  useEffect(() => {
    const t = setTimeout(() => setShowInstructions(false), 5000);
    return () => clearTimeout(t);
  }, [currentPhotoIndex]);

  const shutterAnimatedStyle = useAnimatedStyle(() => ({
    opacity: shutterOpacity.value,
  }));

  const handleTakePicture = async () => {
    if (isCapturing) return;
    setIsCapturing(true);

    try {
      const photo = await camera.takePicture();
      if (photo) {
        let processedPhoto = photo;

        // Fix mirroring issue for iOS front-facing camera
        if (Platform.OS === "ios" && camera.facing === "front") {
          const manipulatedImage = await manipulateAsync(
            photo.uri,
            [{ flip: FlipType.Horizontal }],
            { compress: 0.9, format: SaveFormat.JPEG },
          );
          processedPhoto = {
            ...photo,
            uri: manipulatedImage.uri,
            width: manipulatedImage.width,
            height: manipulatedImage.height,
          };
        }

        setCapturedPhoto(processedPhoto);
        setShowPreview(true);
      }
    } catch (error) {
      console.error("Error taking picture:", error);
    }
    setIsCapturing(false);
  };

  const handleKeep = () => {
    if (capturedPhoto) {
      onPhotoTaken(capturedPhoto);
      setCapturedPhoto(null);
      setShowPreview(false);
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setShowPreview(false);
  };

  const toggleInstructions = () => setShowInstructions((v) => !v);

  const getPositionText = () => {
    switch (currentPosition) {
      case "front":
        return "Face Forward";
      case "left":
        return "Turn Left";
      case "right":
        return "Turn Right";
      default:
        return "Face Forward";
    }
  };

  const getPositionIcon = () => {
    switch (currentPosition) {
      case "front":
        return "user";
      case "left":
        return "angle-left";
      case "right":
        return "angle-right";
      default:
        return "user";
    }
  };

  const getPositionLabel = () => {
    switch (currentPosition) {
      case "front":
        return "Front Face";
      case "left":
        return "Left Profile";
      case "right":
        return "Right Profile";
      default:
        return "Front Face";
    }
  };

  // If showing preview, render the preview screen
  if (showPreview && capturedPhoto) {
    return (
      <View style={styles.previewContainer}>
        {/* Preview Header */}
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle}>Review Your Photo</Text>
          <Text style={styles.previewSubtitle}>
            Make sure your face is clearly visible
          </Text>
        </View>

        {/* Photo Display with platform-specific mirror fix */}
        <View style={styles.photoDisplayContainer}>
          <Image
            source={{ uri: capturedPhoto.uri }}
            style={styles.photoDisplay} // Remove the Platform.OS === 'ios' && camera.facing === 'front' && styles.mirrorFix condition
            contentFit="cover"
          />

          {/* Position Badge */}
          <View style={styles.positionBadge}>
            <FontAwesome6
              name={getPositionIcon()}
              size={16}
              color={colors.white}
            />
            <Text style={styles.positionBadgeText}>{getPositionLabel()}</Text>
          </View>

          {/* Photo Info */}
          <View style={styles.photoInfo}>
            <Text style={styles.photoInfoText}>
              Photo {currentPhotoIndex + 1} of {totalPhotos}
            </Text>
          </View>
        </View>

        {/* Timestamp */}
        <View style={styles.timestampContainer}>
          <Text style={styles.timestampText}>
            {new Date().toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.previewActions}>
          <Pressable style={styles.retakeButton} onPress={handleRetake}>
            <FontAwesome6 name="camera-rotate" size={20} color={colors.error} />
            <Text style={styles.retakeButtonText}>Retake</Text>
          </Pressable>

          <Pressable style={styles.usePhotoButton} onPress={handleKeep}>
            <FontAwesome6 name="check" size={20} color={colors.white} />
            <Text style={styles.usePhotoButtonText}>Use This Photo</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Camera View with all original features
  return (
    <View style={styles.container}>
      {/* Camera feed */}
      <ExpoCameraView
        style={StyleSheet.absoluteFillObject}
        ref={camera.ref}
        mode="picture"
        facing={camera.facing}
        mute={false}
        responsiveOrientationWhenOrientationLocked
      />

      {/* Shutter flash overlay - removed but keeping for structure */}
      <Animated.View
        style={[styles.shutterEffect, shutterAnimatedStyle]}
        pointerEvents="none"
      />

      {/* Controls & Overlays */}
      <View style={styles.overlayContainer}>
        {/* Quick tips */}
        <View style={styles.quickTips}>
          <Text style={styles.quickTipText}>
            {currentPosition === "front"
              ? "📷 Look straight at camera"
              : currentPosition === "left"
                ? "👉 Turn head to your right"
                : "👈 Turn head to your left"}
          </Text>
        </View>

        {/* Top Controls */}
        <View style={styles.topControls}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <FontAwesome6 name="arrow-left" size={24} color="white" />
          </Pressable>

          <View style={styles.counterOverlay}>
            <Text style={styles.counterText}>
              {retakeMode
                ? `Retaking Photo`
                : `Today's Photo: ${getPositionLabel()}`}
            </Text>
          </View>

          <Pressable onPress={toggleInstructions} style={styles.helpButton}>
            <FontAwesome6 name="circle-question" size={24} color="white" />
          </Pressable>
        </View>

        {/* Face Guide */}
        <View style={styles.faceGuideContainer}>
          <View style={styles.faceGuide}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            <View style={styles.positionIndicator}>
              <FontAwesome6
                name={getPositionIcon()}
                size={30}
                color="rgba(255,255,255,0.5)"
              />
              <Text style={styles.positionText}>{getPositionText()}</Text>
            </View>
          </View>
        </View>

        {/* Instructions Modal - Updated with onClose prop */}
        {showInstructions && (
          <Animated.View
            entering={SlideInDown.duration(300)}
            exiting={SlideOutDown}
            style={styles.instructionsOverlay}
          >
            <SelfieInstructions
              position={currentPosition}
              photoNumber={currentPhotoIndex + 1}
              totalPhotos={totalPhotos}
              onClose={() => setShowInstructions(false)}
            />
          </Animated.View>
        )}

        {/* Bottom shutter button */}
        <View style={styles.bottomControls}>
          <CameraControls onTakePicture={handleTakePicture} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  shutterEffect: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "white",
    zIndex: 999,
    opacity: 0, // Keep it invisible since animation is removed
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    zIndex: 1,
  },
  topControls: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : (StatusBar.currentHeight || 30) + 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 12,
    borderRadius: 20,
  },
  helpButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 12,
    borderRadius: 20,
  },
  counterOverlay: {
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  counterText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  quickTips: {
    position: "absolute",
    top: Platform.OS === "ios" ? 100 : (StatusBar.currentHeight || 30) + 60,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 11,
    marginTop: 60,
  },
  quickTipText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "500",
  },
  faceGuideContainer: {
    position: "absolute",
    top: "40%",
    left: "50%",
    transform: [{ translateX: -100 }, { translateY: -100 }],
  },
  faceGuide: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "rgba(255,255,255,0.8)",
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 20,
  },
  positionIndicator: {
    alignItems: "center",
  },
  positionText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  instructionsOverlay: {
    ...StyleSheet.absoluteFillObject, // Updated to cover full screen for centering
    zIndex: 5,
  },
  bottomControls: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  // Preview Styles
  previewContainer: {
    flex: 1,
    backgroundColor: colors.gray[900],
    paddingTop:
      Platform.OS === "ios" ? 60 : (StatusBar.currentHeight || 30) + 20,
  },
  previewHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 8,
  },
  previewSubtitle: {
    fontSize: 14,
    color: colors.gray[400],
  },
  photoDisplayContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.gray[800],
    position: "relative",
  },
  photoDisplay: {
    width: "100%",
    height: "100%",
  },
  mirrorFix: {
    transform: [{ scaleX: -1 }],
  },
  positionBadge: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: colors.primary[500],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  positionBadgeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  photoInfo: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  photoInfoText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "500",
  },
  timestampContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  timestampText: {
    color: colors.gray[500],
    fontSize: 12,
  },
  previewActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  retakeButton: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  retakeButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: "600",
  },
  usePhotoButton: {
    flex: 1.5,
    backgroundColor: colors.success,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  usePhotoButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
