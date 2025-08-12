// component/camera/CameraView.tsx
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { CameraCapturedPicture, CameraView as ExpoCameraView } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { colors } from '@/constants/colors';
import { useAttendanceStore } from '@/store/attendanceStore';
import { CameraControls } from './CameraControl';
import { PhotoPreviewModal } from './PhotoPreviewModal';
import { SelfieInstructions } from './SelfieInstructions';

const { width: screenWidth } = Dimensions.get('window');

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
    useAttendanceStore((s) => s.currentSessionPhotoPosition) || 'front';

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

    // shutter flash animation
    shutterOpacity.value = withSpring(1, { damping: 1 }, () => {
      shutterOpacity.value = withSpring(0);
    });

    const photo = await camera.takePicture();
    if (photo) {
      setCapturedPhoto(photo);
      // show preview after shutter animation
      setTimeout(() => setShowPreview(true), 300);
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

      {/* Shutter flash overlay */}
      <Animated.View
        style={[styles.shutterEffect, shutterAnimatedStyle]}
        pointerEvents="none"
      />

      {/* Controls & Overlays */}
      <View style={styles.overlayContainer}>
        {/* Quick tips */}
        <View style={styles.quickTips}>
          <Text style={styles.quickTipText}>
            {currentPosition === 'front'
              ? '📷 Look straight at camera'
              : currentPosition === 'left'
              ? '👉 Turn head to your right'
              : '👈 Turn head to your left'}
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
                : `Today's Photo: ${
                    currentPosition === 'front'
                      ? 'Front Face'
                      : currentPosition === 'left'
                      ? 'Left Profile'
                      : 'Right Profile'
                  }`}
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
                name={
                  currentPosition === 'front'
                    ? 'user'
                    : currentPosition === 'left'
                    ? 'angle-left'
                    : 'angle-right'
                }
                size={30}
                color="rgba(255,255,255,0.5)"
              />
              <Text style={styles.positionText}>
                {currentPosition === 'front'
                  ? 'Face Forward'
                  : currentPosition === 'left'
                  ? 'Turn Left'
                  : 'Turn Right'}
              </Text>
            </View>
          </View>
        </View>

        {/* Instructions Modal */}
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

        {/* Bottom shutter button */}
        <View style={styles.bottomControls}>
          <CameraControls onTakePicture={handleTakePicture} />
        </View>
      </View>

      {/* Photo Preview Modal */}
      <PhotoPreviewModal
        visible={showPreview}
        photo={capturedPhoto}
        position={currentPosition}
        photoNumber={currentPhotoIndex + 1}
        onKeep={handleKeep}
        onRetake={handleRetake}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  shutterEffect: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    zIndex: 999,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  topControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 30) + 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
    borderRadius: 20,
  },
  helpButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
    borderRadius: 20,
  },
  counterOverlay: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  counterText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  quickTips: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : (StatusBar.currentHeight || 30) + 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 11,
    marginTop: 60,
  },
  quickTipText: { color: colors.white, fontSize: 14, fontWeight: '500' },
  faceGuideContainer: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -100 }],
  },
  faceGuide: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: 'rgba(255,255,255,0.8)',
    borderWidth: 3,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 20 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 20 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 20 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 20 },
  positionIndicator: { alignItems: 'center' },
  positionText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginTop: 8 },
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
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});