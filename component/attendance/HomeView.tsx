import React from "react";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import { CameraCapturedPicture } from "expo-camera";
import { AudioRecording } from "../../types/attendance";
import { colors } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Animated, { FadeInDown } from "react-native-reanimated";
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
}: HomeViewProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <Animated.View 
        entering={FadeInDown.delay(100).springify()}
        style={styles.headerCard}
      >
        <LinearGradient
          colors={[colors.primary[500], colors.primary[600]]}
          style={styles.gradientHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>Good {getTimeOfDay()}!</Text>
              <Text style={styles.headerTitle}>Mark Your Attendance</Text>
              <Text style={styles.headerSubtitle}>
                {selectedLocationLabel
                  ? `📍 ${selectedLocationLabel}`
                  : "📍 Auto-detecting location..."}
              </Text>
            </View>
            <View style={styles.headerIcon}>
              <FontAwesome6 name="calendar-check" size={40} color={colors.white} />
            </View>
          </View>
          
          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{photos.length}/{totalPhotos}</Text>
              <Text style={styles.statLabel}>Photos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{audioRecording ? "✓" : "−"}</Text>
              <Text style={styles.statLabel}>Audio</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{new Date().getDate()}</Text>
              <Text style={styles.statLabel}>{new Date().toLocaleDateString('en', { month: 'short' })}</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Photo Section Card */}
      <Animated.View 
        entering={FadeInDown.delay(200).springify()}
        style={styles.sectionCard}
      >
        <View style={styles.sectionHeader}>
          <FontAwesome6 name="camera" size={20} color={colors.primary[500]} />
          <Text style={styles.sectionTitle}>Photo Verification</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Capture {totalPhotos} photos for attendance verification
        </Text>
        <PhotoGrid
          photos={photos}
          onRetakePhoto={onRetakePhoto}
          totalPhotos={totalPhotos}
        />
      </Animated.View>

      {/* Audio Section Card */}
      <Animated.View 
        entering={FadeInDown.delay(300).springify()}
        style={styles.sectionCard}
      >
        <View style={styles.sectionHeader}>
          <FontAwesome6 name="microphone" size={20} color={colors.primary[500]} />
          <Text style={styles.sectionTitle}>Voice Verification</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Record your voice saying today&apos;s date
        </Text>
        <AudioSection
          audioRecording={audioRecording}
          onRecordAudio={onRecordAudio}
        />
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View 
        entering={FadeInDown.delay(400).springify()}
        style={styles.actionSection}
      >
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
});