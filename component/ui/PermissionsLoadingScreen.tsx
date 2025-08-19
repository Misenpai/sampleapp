// component/ui/PermissionsLoadingScreen.tsx
import { colors } from '@/constants/colors';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface PermissionsLoadingScreenProps {
  message?: string;
}

export function PermissionsLoadingScreen({ 
  message = "Setting up permissions..." 
}: PermissionsLoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const pulseScale = useSharedValue(1);

  const steps = [
    { icon: "camera", label: "Camera Access", description: "For capturing attendance photos" },
    { icon: "microphone", label: "Microphone Access", description: "For voice verification" },
    { icon: "location-dot", label: "Location Access", description: "For attendance verification" },
  ];

  useEffect(() => {
    // Animate through steps
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 2000);

    // Pulse animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[colors.primary[500], colors.primary[600]]}
          style={styles.gradientHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Animated.View style={[styles.logoContainer, pulseStyle]}>
              <FontAwesome6
                name="shield-halved"
                size={40}
                color={colors.white}
              />
            </Animated.View>
            <Text style={styles.headerTitle}>Setting Up</Text>
            <Text style={styles.headerSubtitle}>
              Configuring app permissions for the best experience
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.loadingSection}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>{message}</Text>
        </View>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View
              key={step.icon}
              style={[
                styles.stepItem,
                index === currentStep && styles.stepItemActive,
                index < currentStep && styles.stepItemCompleted,
              ]}
            >
              <View style={[
                styles.stepIcon,
                index === currentStep && styles.stepIconActive,
                index < currentStep && styles.stepIconCompleted,
              ]}>
                <FontAwesome6
                  name={step.icon}
                  size={20}
                  color={
                    index < currentStep
                      ? colors.white
                      : index === currentStep
                      ? colors.primary[500]
                      : colors.gray[400]
                  }
                />
              </View>
              <View style={styles.stepContent}>
                <Text style={[
                  styles.stepLabel,
                  index === currentStep && styles.stepLabelActive,
                  index < currentStep && styles.stepLabelCompleted,
                ]}>
                  {step.label}
                </Text>
                <Text style={styles.stepDescription}>
                  {step.description}
                </Text>
              </View>
              {index < currentStep && (
                <FontAwesome6
                  name="check-circle"
                  size={20}
                  color={colors.success}
                />
              )}
            </View>
          ))}
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <FontAwesome6 name="info-circle" size={16} color={colors.info} />
          <Text style={styles.infoText}>
            These permissions ensure the app works properly and your data stays secure.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  gradientHeader: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.gray[200],
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  loadingSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[700],
    marginTop: 16,
    textAlign: 'center',
  },
  stepsContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  stepItemActive: {
    backgroundColor: colors.primary[50],
    marginHorizontal: -20,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderBottomColor: 'transparent',
  },
  stepItemCompleted: {
    borderBottomColor: 'transparent',
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepIconActive: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  stepIconCompleted: {
    backgroundColor: colors.success,
  },
  stepContent: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[600],
    marginBottom: 2,
  },
  stepLabelActive: {
    color: colors.primary[700],
  },
  stepLabelCompleted: {
    color: colors.gray[700],
  },
  stepDescription: {
    fontSize: 14,
    color: colors.gray[500],
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.info + '15',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.info + '30',
  },
  infoText: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
});