// component/camera/SelfieInstructions.tsx
import { colors } from '@/constants/colors';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import React, { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SelfieInstructionsProps {
  position: 'front' | 'left' | 'right';
  photoNumber: number;
  totalPhotos: number;
  onClose?: () => void; // Add onClose prop
}

export function SelfieInstructions({ position, photoNumber, totalPhotos, onClose }: SelfieInstructionsProps) {
  const rotation = useSharedValue(0);
  const phoneRotation = useSharedValue(0);
  const headPosition = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // Reset animations when position changes
    rotation.value = 0;
    phoneRotation.value = 0;
    headPosition.value = 0;

    if (position === 'front') {
      // Front facing animation - subtle pulse
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1
      );
      phoneRotation.value = withRepeat(
        withSequence(
          withTiming(5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1
      );
    } else if (position === 'left') {
      // Left side animation
      rotation.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 1000 }),
          withTiming(-30, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(-30, { duration: 500 }),
          withTiming(0, { duration: 1000 })
        ),
        -1
      );
      headPosition.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 1000 }),
          withTiming(-20, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(-20, { duration: 500 }),
          withTiming(0, { duration: 1000 })
        ),
        -1
      );
    } else if (position === 'right') {
      // Right side animation
      rotation.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 1000 }),
          withTiming(30, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(30, { duration: 500 }),
          withTiming(0, { duration: 1000 })
        ),
        -1
      );
      headPosition.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 1000 }),
          withTiming(20, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(20, { duration: 500 }),
          withTiming(0, { duration: 1000 })
        ),
        -1
      );
    }
  }, [position]);

  const phoneAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = position === 'front' 
      ? phoneRotation.value 
      : rotation.value;
    
    const scale = position === 'front' ? pulseScale.value : 1;

    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
        { scale },
      ],
    };
  });

  const headAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: headPosition.value },
        { rotateY: `${rotation.value * 0.5}deg` },
      ],
    };
  });

  const arrowAnimatedStyle = useAnimatedStyle(() => {
    const opacity = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1
    );

    return {
      opacity,
      transform: [
        { 
          translateX: position === 'left' ? -40 : position === 'right' ? 40 : 0 
        },
      ],
    };
  });

  const getInstructionText = () => {
    switch (position) {
      case 'front':
        return 'Hold phone straight\nLook directly at camera';
      case 'left':
        return 'Turn your head right\nShow left side of face';
      case 'right':
        return 'Turn your head left\nShow right side of face';
      default:
        return '';
    }
  };

  const getPositionLabel = () => {
    switch (position) {
      case 'front':
        return 'Front Face';
      case 'left':
        return 'Left Face';
      case 'right':
        return 'Right Face';
      default:
        return '';
    }
  };

  return (
    <View style={styles.overlay}>
      <Animated.View 
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        style={styles.container}
      >
        {/* Close Button */}
        <Pressable 
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome6 name="xmark" size={20} color={colors.white} />
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.photoCounter}>Photo {photoNumber} of {totalPhotos}</Text>
          <View style={styles.positionBadge}>
            <Text style={styles.positionLabel}>{getPositionLabel()}</Text>
          </View>
        </View>

        {/* Animation Container */}
        <View style={styles.animationContainer}>
          {/* Head/Face Icon */}
          <Animated.View style={[styles.headContainer, headAnimatedStyle]}>
            <View style={styles.faceCircle}>
              <FontAwesome6 name="user" size={40} color={colors.primary[500]} />
              {/* Face direction indicator */}
              {position !== 'front' && (
                <View style={[
                  styles.directionIndicator,
                  position === 'left' ? styles.leftIndicator : styles.rightIndicator
                ]}>
                  <FontAwesome6 
                    name={position === 'left' ? 'chevron-left' : 'chevron-right'} 
                    size={16} 
                    color={colors.white} 
                  />
                </View>
              )}
            </View>
          </Animated.View>

          {/* Direction Arrow */}
          {position !== 'front' && (
            <Animated.View style={[styles.arrow, arrowAnimatedStyle]}>
              <FontAwesome6 
                name={`arrow-${position}`} 
                size={30} 
                color={colors.primary[400]} 
              />
            </Animated.View>
          )}

          {/* Phone Icon */}
          <Animated.View style={[styles.phoneContainer, phoneAnimatedStyle]}>
            <View style={styles.phone}>
              <FontAwesome6 name="mobile-screen" size={50} color={colors.gray[700]} />
              <View style={styles.cameraIndicator}>
                <View style={styles.cameraLens} />
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Instructions Text */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionText}>{getInstructionText()}</Text>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsContainer}>
          <FontAwesome6 name="lightbulb" size={16} color={colors.warning} />
          <Text style={styles.tipText}>
            {position === 'front' 
              ? 'Keep your face centered and well-lit'
              : `Show your ${position} ear clearly in the frame`}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Optional: adds a semi-transparent backdrop
  },
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 20,
    padding: 20,
    width: screenWidth - 40,
    maxWidth: 400,
    alignItems: 'center',
    position: 'relative', // For close button positioning
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10, // Add some top margin since we have close button
  },
  photoCounter: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  positionBadge: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 30,
  },
  positionLabel: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  animationContainer: {
    height: 150,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  headContainer: {
    position: 'absolute',
    left: '25%',
  },
  faceCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary[300],
  },
  directionIndicator: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftIndicator: {
    left: -8,
    top: '50%',
    marginTop: -12,
  },
  rightIndicator: {
    right: -8,
    top: '50%',
    marginTop: -12,
  },
  arrow: {
    position: 'absolute',
  },
  phoneContainer: {
    position: 'absolute',
    right: '25%',
  },
  phone: {
    backgroundColor: colors.gray[200],
    borderRadius: 12,
    padding: 10,
    borderWidth: 3,
    borderColor: colors.gray[600],
    alignItems: 'center',
  },
  cameraIndicator: {
    position: 'absolute',
    top: 15,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.gray[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraLens: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary[400],
  },
  instructionsContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
    lineHeight: 24,
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
  },
});