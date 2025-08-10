// component/camera/CameraView.tsx
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { CameraCapturedPicture, CameraView as ExpoCameraView } from "expo-camera";
import React, { useEffect, useState } from "react";
import { Dimensions, Platform, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import Animated, {
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { colors } from "@/constants/colors";
import { useAttendanceStore } from "@/store/attendanceStore";
import { CameraControls } from "./CameraControl";
import { PhotoPreviewModal } from "./PhotoPreviewModal";
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
  const [capturedPhoto, setCapturedPhoto] = useState<CameraCapturedPicture | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const shutterOpacity = useSharedValue(0);
  
  const getTodayPhotoPosition = useAttendanceStore((state) => state.getTodayPhotoPosition);
  const currentPosition = getTodayPhotoPosition();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstructions(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentPhotoIndex]);

  const shutterAnimatedStyle = useAnimatedStyle(() => ({
    opacity: shutterOpacity.value,
  }));

  const handleTakePicture = async () => {
    if (isCapturing) return;
    setIsCapturing(true);

    shutterOpacity.value = withSpring(1, { damping: 1 }, () => {
      shutterOpacity.value = withSpring(0);
    });

    const photo = await camera.takePicture();
    if (photo) {
      setCapturedPhoto(photo);
      setShowPreview(true);
    }
    setIsCapturing(false);
  };

  const handleKeepPhoto = () => {
    if (capturedPhoto) {
      onPhotoTaken(capturedPhoto);
      setCapturedPhoto(null);
      setShowPreview(false);
    }
  };

  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    setShowPreview(false);
  };

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  return (
    <View style={styles.container}>
      <ExpoCameraView
        style={styles.camera}
        ref={camera.ref}
        mode="picture"
        facing={camera.facing}
        mute={false}
        responsiveOrientationWhenOrientationLocked
      >
        {/* Shutter Effect */}
        <Animated.View 
          style={[styles.shutterEffect, shutterAnimatedStyle]} 
          pointerEvents="none"
        />

        {/* Quick Tips - moved to top */}
        <View style={styles.quickTips}>
          <Text style={styles.quickTipText}>
            {currentPosition === 'front' 
              ? '📷 Look straight at camera'
              : currentPosition === 'left'
              ? '👈 Turn head to your left'
              : '👉 Turn head to your right'}
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
                : `Today's Photo: ${currentPosition === 'front' ? 'Front Face' : currentPosition === 'left' ? 'Left Profile' : 'Right Profile'}`}
            </Text>
          </View>

          <Pressable onPress={toggleInstructions} style={styles.helpButton}>
            <FontAwesome6 name="circle-question" size={24} color="white" />
          </Pressable>
        </View>

        {/* Face Guide Overlay */}
        <View style={styles.faceGuideContainer}>
          <View style={styles.faceGuide}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            <View style={styles.positionIndicator}>
              <FontAwesome6 
                name={
                  currentPosition === 'front' ? 'user' : 
                  currentPosition === 'left' ? 'angle-left' : 'angle-right'
                } 
                size={30} 
                color="rgba(255, 255, 255, 0.5)" 
              />
              <Text style={styles.positionText}>
                {currentPosition === 'front' ? 'Face Forward' : 
                 currentPosition === 'left' ? 'Turn Left' : 'Turn Right'}
              </Text>
            </View>
          </View>
        </View>

        {/* Instructions Overlay */}
        {showInstructions && (
          <Animated.View 
            entering={SlideInDown.duration(300)}
            exiting={SlideOutDown.duration(300)}
            style={styles.instructionsOverlay}
          >
            <SelfieInstructions 
              position={currentPosition}
              photoNumber={currentPhotoIndex + 1}
              totalPhotos={totalPhotos}
            />
          </Animated.View>
        )}

        {/* Camera Controls */}
        <View style={styles.bottomControls}>
          <CameraControls onTakePicture={handleTakePicture} />
        </View>
      </ExpoCameraView>

      {/* Photo Preview Modal */}
      <PhotoPreviewModal
        visible={showPreview}
        photo={capturedPhoto}
        position={currentPosition}
        photoNumber={currentPhotoIndex + 1}
        onKeep={handleKeepPhoto}
        onRetake={handleRetakePhoto}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  shutterEffect: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    zIndex: 999,
  },
  topControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 20,
  },
  helpButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 20,
  },
  counterOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  counterText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  quickTips: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    marginTop: 100,
    borderRadius: 20,
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : (StatusBar.currentHeight ?? 40) + 60,
    alignSelf: 'center',
    zIndex: 11,
  },
  quickTipText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  faceGuideContainer: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -100 }],
  },
  faceGuide: {
    width: 200,
    height: 200,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: 'rgba(255, 255, 255, 0.8)',
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
    alignItems: 'center',
  },
  positionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  instructionsOverlay: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    transform: [{ translateY: -150 }],
    zIndex: 5,
  },
bottomControls: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  alignItems: 'center', // ✅ center horizontally
  paddingBottom: 20,    // optional spacing from bottom
}

});
