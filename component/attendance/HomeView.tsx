// component/attendance/HomeView.tsx
import { colors } from "@/constants/colors";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { CameraCapturedPicture } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAttendanceStore } from "../../store/attendanceStore";
import { AudioRecording } from "../../types/attendance";
import { ActionButtons } from "./ActionButton";
import { AudioSection } from "./AudioSection";
import { PhotoGrid } from "./PhotoGrid";

interface HomeViewProps {
  photos: CameraCapturedPicture[];
  audioRecording: AudioRecording | null;
  onTakePhotos: () => void;
  onRetakePhoto: (index: number) => void;
  onRetakeAll: () => void;
  onRecordAudio: () => void;
  onUpload: () => void;
  uploading: boolean;
  totalPhotos: number;
  selectedLocationLabel: string | null;
  todayAttendanceMarked?: boolean;
}

// Developer Mode Toggle Component
function DeveloperModeToggle({ isEnabled, onToggle }: { isEnabled: boolean; onToggle: () => void; }) {
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);

  const handleSecretTap = () => {
    const now = Date.now();
    if (now - lastTapTime > 2000) {
      setTapCount(1);
    } else {
      setTapCount(prev => prev + 1);
    }
    setLastTapTime(now);

    if (tapCount >= 4) {
      onToggle();
      setTapCount(0);
      Alert.alert(
        "Developer Mode",
        isEnabled
          ? "Developer mode disabled"
          : "Developer mode enabled - You can now mark attendance multiple times for testing",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <TouchableOpacity onPress={handleSecretTap} style={styles.secretTapArea} activeOpacity={1}>
      <View style={styles.devModeIndicator}>
        {isEnabled && (
          <View style={styles.devModeBadge}>
            <FontAwesome6 name="code" size={12} color={colors.white} />
            <Text style={styles.devModeText}>DEV</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// Attendance Marked Card with Override Button
function AttendanceMarkedCard({ onOverride, devModeEnabled }: { onOverride: () => void; devModeEnabled: boolean; }) {
  return (
    <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.attendanceMarkedCard}>
      <LinearGradient
        colors={[colors.success, "#059669"]}
        style={styles.attendanceMarkedGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.attendanceMarkedContent}>
          <View style={styles.attendanceMarkedIcon}>
            <FontAwesome6 name="circle-check" size={32} color={colors.white} />
          </View>
          <View style={styles.attendanceMarkedText}>
            <Text style={styles.attendanceMarkedTitle}>Attendance Marked!</Text>
            <Text style={styles.attendanceMarkedSubtitle}>
              You&apos;ve already marked your attendance for today
            </Text>
            <Text style={styles.attendanceMarkedTime}>
              {new Date().toLocaleDateString("en", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        {devModeEnabled && (
          <TouchableOpacity style={styles.overrideButton} onPress={onOverride} activeOpacity={0.8}>
            <FontAwesome6 name="flask-vial" size={16} color={colors.white} />
            <Text style={styles.overrideButtonText}>Test Mode: Mark Again</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

export function HomeView({
  photos,
  audioRecording,
  onTakePhotos,
  onRetakePhoto,
  onRetakeAll,
  onRecordAudio,
  onUpload,
  uploading,
  totalPhotos,
  selectedLocationLabel,
  todayAttendanceMarked = false,
}: HomeViewProps) {
  const [devModeEnabled, setDevModeEnabled] = useState(false);
  const [forceShowAttendance, setForceShowAttendance] = useState(false);

  const attendanceRecords = useAttendanceStore((state) => state.attendanceRecords);
  const todayDateString = new Date().toISOString().split("T")[0];
  const todayRecord = attendanceRecords.find((record) => record.date === todayDateString);

  const handleOverrideAttendance = () => {
    Alert.alert(
      "Test Mode",
      "This will allow you to mark attendance again for testing. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Continue", onPress: () => setForceShowAttendance(true) },
      ]
    );
  };

  const toggleDevMode = () => {
    setDevModeEnabled(!devModeEnabled);
    if (devModeEnabled) setForceShowAttendance(false);
  };

  // Attendance Marked branch
  if (todayAttendanceMarked && !forceShowAttendance && todayRecord) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.headerCard}>
          <LinearGradient
            colors={[colors.primary[500], colors.primary[600]]}
            style={styles.gradientHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.greeting}>Good {getTimeOfDay()}!</Text>
                <Text style={styles.headerTitle}>Attendance Status</Text>
                <Text style={styles.headerSubtitle}>
                  {selectedLocationLabel
                    ? `📍 ${selectedLocationLabel}`
                    : "📍 Auto-detecting location..."}
                </Text>
              </View>
              <View style={styles.headerIcon}>
                <FontAwesome6 name="calendar-check" size={40} color={colors.white} />
                <DeveloperModeToggle isEnabled={devModeEnabled} onToggle={toggleDevMode} />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Attendance Marked Card */}
        <AttendanceMarkedCard onOverride={handleOverrideAttendance} devModeEnabled={devModeEnabled} />

        {/* Today's Summary with actual store data */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <FontAwesome6 name="circle-info" size={20} color={colors.primary[500]} />
            <Text style={styles.sectionTitle}>Today&apos;s Summary</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Your attendance has been successfully recorded for today.
            {devModeEnabled && " Developer mode is active - you can test marking attendance again."}
          </Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <FontAwesome6 name="clock" size={16} color={colors.gray[500]} />
              <Text style={styles.summaryText}>
                Recorded at {new Date(todayRecord.timestamp).toLocaleTimeString()}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <FontAwesome6 name="location-dot" size={16} color={colors.gray[500]} />
              <Text style={styles.summaryText}>{todayRecord.location}</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    );
  }

  // Normal Attendance Marking UI
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.headerCard}>
        <LinearGradient
          colors={[colors.primary[500], colors.primary[600]]}
          style={styles.gradientHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>Good {getTimeOfDay()}!</Text>
              <Text style={styles.headerTitle}>
                Mark Your Attendance
                {forceShowAttendance && <Text style={styles.testModeIndicator}> (Test Mode)</Text>}
              </Text>
              <Text style={styles.headerSubtitle}>
                {selectedLocationLabel
                  ? `📍 ${selectedLocationLabel}`
                  : "📍 Auto-detecting location..."}
              </Text>
            </View>
            <View style={styles.headerIcon}>
              <FontAwesome6 name="calendar-check" size={40} color={colors.white} />
              <DeveloperModeToggle isEnabled={devModeEnabled} onToggle={toggleDevMode} />
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{photos.length}/{totalPhotos}</Text>
              <Text style={styles.statLabel}>Photo</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{audioRecording ? "✓" : "−"}</Text>
              <Text style={styles.statLabel}>Audio</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{new Date().getDate()}</Text>
              <Text style={styles.statLabel}>{new Date().toLocaleDateString("en", { month: "short" })}</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Photo Section */}
      <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <FontAwesome6 name="camera" size={20} color={colors.primary[500]} />
          <Text style={styles.sectionTitle}>Photo Verification</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Capture today&apos;s required photo for attendance verification
        </Text>
        <PhotoGrid photos={photos} onRetakePhoto={onRetakePhoto} totalPhotos={totalPhotos} />
      </Animated.View>

      {/* Audio Section */}
      <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <FontAwesome6 name="microphone" size={20} color={colors.primary[500]} />
          <Text style={styles.sectionTitle}>Voice Verification</Text>
        </View>
        <Text style={styles.sectionDescription}>Record your voice saying today&apos;s date</Text>
        <AudioSection audioRecording={audioRecording} onRecordAudio={onRecordAudio} />
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.actionSection}>
        <ActionButtons
          photos={photos}
          onTakePhotos={onTakePhotos}
          onRetakeAll={onRetakeAll}
          onUpload={onUpload}
          uploading={uploading}
          totalPhotos={totalPhotos}
        />
      </Animated.View>
    </ScrollView>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  headerCard: {
    margin: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  gradientHeader: {
    padding: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: colors.gray[200],
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.gray[200],
  },
  headerIcon: {
    marginLeft: 16,
    position: 'relative',
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[200],
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 16,
  },
  sectionCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[800],
    marginLeft: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.gray[500],
    marginBottom: 16,
  },
  actionSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  attendanceMarkedCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  attendanceMarkedGradient: {
    padding: 20,
  },
  attendanceMarkedContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  attendanceMarkedIcon: {
    marginRight: 16,
  },
  attendanceMarkedText: {
    flex: 1,
  },
  attendanceMarkedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 4,
  },
  attendanceMarkedSubtitle: {
    fontSize: 14,
    color: colors.gray[100],
    marginBottom: 8,
  },
  attendanceMarkedTime: {
    fontSize: 12,
    color: colors.gray[200],
  },
  summaryRow: {
    gap: 12,
    marginTop: 12,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  // Developer Mode Styles
  secretTapArea: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  devModeIndicator: {
    position: 'absolute',
    top: -35,
    right: -5,
  },
  devModeBadge: {
    flexDirection: 'row',
    backgroundColor: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  devModeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
  },
  overrideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  overrideButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  testModeIndicator: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: 'normal',
  },
});