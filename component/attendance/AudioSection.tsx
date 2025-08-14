import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { colors } from "@/constants/colors";
import { AudioRecording } from "../../types/attendance";
import { AudioPlayer } from "../audio/AudioPlayer";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface AudioSectionProps {
  audioRecording: AudioRecording | null;
  onRecordAudio: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AudioSection({
  audioRecording,
  onRecordAudio,
}: AudioSectionProps) {
  const pulseScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  React.useEffect(() => {
    if (!audioRecording) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1,
      );
    }
  }, [audioRecording]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1);
  };

  return (
    <View style={styles.container}>
      {audioRecording ? (
        <View style={styles.recordedCard}>
          <View style={styles.recordedHeader}>
            <View style={styles.recordedIconContainer}>
              <FontAwesome6
                name="circle-check"
                size={20}
                color={colors.success}
              />
            </View>
            <Text style={styles.recordedText}>Audio Recorded</Text>
          </View>
          <AudioPlayer audioRecording={audioRecording} />
        </View>
      ) : (
        <AnimatedPressable
          onPress={onRecordAudio}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.recordButton, buttonStyle]}
        >
          <Animated.View style={[styles.pulseCircle, pulseStyle]}>
            <View style={styles.iconCircle}>
              <FontAwesome6
                name="microphone"
                size={24}
                color={colors.primary[500]}
              />
            </View>
          </Animated.View>
          <View style={styles.recordTextContainer}>
            <Text style={styles.recordButtonText}>Tap to Record</Text>
            <Text style={styles.recordHintText}>
              Say today&apos;s date clearly
            </Text>
          </View>
        </AnimatedPressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary[50],
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.primary[200],
    borderStyle: "dashed",
  },
  pulseCircle: {
    marginRight: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  recordTextContainer: {
    flex: 1,
  },
  recordButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[800],
    marginBottom: 2,
  },
  recordHintText: {
    fontSize: 14,
    color: colors.gray[500],
  },
  recordedCard: {
    backgroundColor: colors.success + "10",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.success + "30",
  },
  recordedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  recordedIconContainer: {
    marginRight: 8,
  },
  recordedText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[800],
  },
});
