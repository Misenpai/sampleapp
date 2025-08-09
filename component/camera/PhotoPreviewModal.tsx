// component/camera/PhotoPreviewModal.tsx
import { colors } from '@/constants/colors';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { BlurView } from 'expo-blur';
import { CameraCapturedPicture } from 'expo-camera';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Dimensions,
    Modal,
    Platform,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, {
    FadeIn,
    SlideInUp,
    ZoomIn,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface PhotoPreviewModalProps {
  visible: boolean;
  photo: CameraCapturedPicture | null;
  position: 'front' | 'left' | 'right';
  photoNumber: number;
  onKeep: () => void;
  onRetake: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PhotoPreviewModal({
  visible,
  photo,
  position,
  photoNumber,
  onKeep,
  onRetake,
}: PhotoPreviewModalProps) {
  const keepButtonScale = useSharedValue(1);
  const retakeButtonScale = useSharedValue(1);

  const keepButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: keepButtonScale.value }],
  }));

  const retakeButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: retakeButtonScale.value }],
  }));

  const handleKeepPress = () => {
    keepButtonScale.value = withSpring(0.95, {}, () => {
      keepButtonScale.value = withSpring(1);
    });
    setTimeout(onKeep, 100);
  };

  const handleRetakePress = () => {
    retakeButtonScale.value = withSpring(0.95, {}, () => {
      retakeButtonScale.value = withSpring(1);
    });
    setTimeout(onRetake, 100);
  };

  const getPositionLabel = () => {
    switch (position) {
      case 'front':
        return 'Front Face';
      case 'left':
        return 'Left Profile';
      case 'right':
        return 'Right Profile';
      default:
        return '';
    }
  };

  if (!visible || !photo) return null;

  return (
    <Modal
      animationType="none"
      transparent
      visible={visible}
      statusBarTranslucent
    >
      <Animated.View 
        entering={FadeIn.duration(200)}
        style={styles.container}
      >
        <BlurView intensity={95} style={StyleSheet.absoluteFillObject} />
        
        <Animated.View 
          entering={SlideInUp.duration(300).springify()}
          style={styles.content}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.photoNumberBadge}>
              <Text style={styles.photoNumberText}>Photo {photoNumber}</Text>
            </View>
            <View style={styles.positionBadge}>
              <FontAwesome6 
                name={position === 'front' ? 'user' : 'user-large'} 
                size={14} 
                color={colors.white} 
              />
              <Text style={styles.positionText}>{getPositionLabel()}</Text>
            </View>
          </View>

          {/* Photo Preview */}
          <Animated.View 
            entering={ZoomIn.delay(100).springify()}
            style={styles.photoContainer}
          >
            <Image
              source={{ uri: photo.uri }}
              style={styles.photo}
              contentFit="cover"
            />
            
            {/* Photo Frame Overlay */}
            <View style={styles.photoFrame}>
              <View style={[styles.frameCorner, styles.frameTopLeft]} />
              <View style={[styles.frameCorner, styles.frameTopRight]} />
              <View style={[styles.frameCorner, styles.frameBottomLeft]} />
              <View style={[styles.frameCorner, styles.frameBottomRight]} />
            </View>
          </Animated.View>

          {/* Review Text */}
          <View style={styles.reviewSection}>
            <Text style={styles.reviewTitle}>Review Your Photo</Text>
            <Text style={styles.reviewSubtitle}>
              Make sure your face is clearly visible
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <AnimatedPressable
              onPress={handleRetakePress}
              style={[styles.button, styles.retakeButton, retakeButtonStyle]}
            >
              <FontAwesome6 name="camera-rotate" size={20} color={colors.error} />
              <Text style={styles.retakeButtonText}>Retake</Text>
            </AnimatedPressable>

            <AnimatedPressable
              onPress={handleKeepPress}
              style={[styles.button, styles.keepButton, keepButtonStyle]}
            >
              <LinearGradient
                colors={[colors.success, '#059669']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <FontAwesome6 name="check" size={20} color={colors.white} />
                <Text style={styles.keepButtonText}>Use This Photo</Text>
              </LinearGradient>
            </AnimatedPressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 30,
  },
  content: {
    width: screenWidth - 40,
    maxWidth: 400,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  photoNumberBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  photoNumberText: {
    color: colors.primary[700],
    fontSize: 14,
    fontWeight: '600',
  },
  positionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary[500],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  positionText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 3/4,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.gray[100],
    marginBottom: 20,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoFrame: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  frameCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.primary[400],
    borderWidth: 3,
  },
  frameTopLeft: {
    top: 10,
    left: 10,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  frameTopRight: {
    top: 10,
    right: 10,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  frameBottomLeft: {
    bottom: 10,
    left: 10,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  frameBottomRight: {
    bottom: 10,
    right: 10,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  reviewSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: 4,
  },
  reviewSubtitle: {
    fontSize: 14,
    color: colors.gray[500],
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  retakeButton: {
    backgroundColor: colors.error + '10',
    borderWidth: 2,
    borderColor: colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  keepButton: {
    flex: 1.5,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  retakeButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  keepButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});